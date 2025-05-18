import { PrismaClient } from '@prisma/client';
import { WebSocketService } from './websocket';

interface TemplateVariable {
  type: string;
  required: boolean;
  defaultValue?: any;
  description?: string;
}

interface TemplateMetadata {
  color?: string;
  icon?: string;
  shortcut?: string;
  category?: string;
  tags?: string[];
}

interface CategoryStats {
  usageCount: number;
  avgResponseTime: number;
  engagementRate: number;
  conversionRate: number;
}

interface TimeStats {
  hourly: Record<string, number>;
  daily: Record<string, number>;
  weekly: Record<string, number>;
}

export class TemplateService {
  constructor(private prisma: PrismaClient) {}

  // Template Versioning
  async createVersion(
    templateId: string,
    content: string,
    variables: Record<string, TemplateVariable>,
    changes: string,
    userId: string,
    metadata?: TemplateMetadata
  ) {
    const template = await this.prisma.template.findUnique({
      where: { id: templateId },
      include: { versions: true },
    });

    if (!template) {
      throw new Error('Template not found');
    }

    const newVersion = template.version + 1;
    const version = await this.prisma.templateVersion.create({
      data: {
        templateId,
        version: newVersion,
        content,
        variables,
        changes,
        createdBy: userId,
        metadata,
      },
    });

    await this.prisma.template.update({
      where: { id: templateId },
      data: {
        version: newVersion,
        content,
        variables,
        metadata,
      },
    });

    WebSocketService.broadcast('template:version:created', version);
    return version;
  }

  async getVersions(templateId: string) {
    return this.prisma.templateVersion.findMany({
      where: { templateId },
      orderBy: { version: 'desc' },
    });
  }

  async rollbackVersion(templateId: string, version: number) {
    const templateVersion = await this.prisma.templateVersion.findFirst({
      where: { templateId, version },
    });

    if (!templateVersion) {
      throw new Error('Version not found');
    }

    const updatedTemplate = await this.prisma.template.update({
      where: { id: templateId },
      data: {
        content: templateVersion.content,
        variables: templateVersion.variables,
        metadata: templateVersion.metadata,
      },
    });

    WebSocketService.broadcast('template:version:rolled-back', updatedTemplate);
    return updatedTemplate;
  }

  // Template Analytics
  async trackTemplateUsage(templateId: string, responseTime: number, sentimentScore?: number) {
    const analytics = await this.prisma.templateAnalytics.upsert({
      where: { templateId },
      update: {
        usageCount: { increment: 1 },
        avgResponseTime: {
          set: this.calculateAverageResponseTime(
            await this.prisma.templateAnalytics.findUnique({
              where: { templateId },
            }),
            responseTime
          ),
        },
        sentimentScore: sentimentScore
          ? this.calculateAverageSentiment(
              await this.prisma.templateAnalytics.findUnique({
                where: { templateId },
              }),
              sentimentScore
            )
          : undefined,
        lastUsed: new Date(),
        timeStats: {
          update: this.updateTimeStats(
            await this.prisma.templateAnalytics.findUnique({
              where: { templateId },
            }),
            responseTime
          ),
        },
      },
      create: {
        templateId,
        usageCount: 1,
        avgResponseTime: responseTime,
        sentimentScore,
        lastUsed: new Date(),
        timeStats: this.initializeTimeStats(responseTime),
      },
    });

    WebSocketService.broadcast('template:analytics:updated', analytics);
    return analytics;
  }

  async updateEngagementMetrics(
    templateId: string,
    engagementRate: number,
    conversionRate: number,
    categoryStats?: CategoryStats
  ) {
    const analytics = await this.prisma.templateAnalytics.update({
      where: { templateId },
      data: {
        engagementRate,
        conversionRate,
        categoryStats,
        updatedAt: new Date(),
      },
    });

    WebSocketService.broadcast('template:analytics:updated', analytics);
    return analytics;
  }

  // Template Variables
  async processTemplateVariables(
    templateId: string,
    variables: Record<string, any>,
    context?: Record<string, any>
  ) {
    const template = await this.prisma.template.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      throw new Error('Template not found');
    }

    let content = template.content;
    const templateVars = template.variables as Record<string, TemplateVariable>;

    // Validate required variables
    for (const [key, config] of Object.entries(templateVars)) {
      if (config.required && !variables[key] && !config.defaultValue) {
        throw new Error(`Required variable ${key} is missing`);
      }
    }

    // Replace variables in content
    for (const [key, config] of Object.entries(templateVars)) {
      const value = variables[key] || config.defaultValue;
      if (value !== undefined) {
        const placeholder = new RegExp(`{${key}}`, 'g');
        content = content.replace(placeholder, value.toString());
      }
    }

    // Process smart placeholders using context
    if (context) {
      content = this.processSmartPlaceholders(content, context);
    }

    return content;
  }

  // Template Approval
  async submitForApproval(templateId: string, approverId: string, metadata?: Record<string, any>) {
    const template = await this.prisma.template.update({
      where: { id: templateId },
      data: {
        status: 'pending',
        approvals: {
          create: {
            approverId,
            status: 'pending',
            metadata,
          },
        },
      },
    });

    WebSocketService.broadcast('template:approval:submitted', template);
    return template;
  }

  async approveTemplate(templateId: string, approverId: string, comments?: string) {
    const template = await this.prisma.template.update({
      where: { id: templateId },
      data: {
        status: 'approved',
        approvals: {
          create: {
            approverId,
            status: 'approved',
            comments,
          },
        },
      },
    });

    WebSocketService.broadcast('template:approval:approved', template);
    return template;
  }

  async rejectTemplate(templateId: string, approverId: string, comments: string) {
    const template = await this.prisma.template.update({
      where: { id: templateId },
      data: {
        status: 'rejected',
        approvals: {
          create: {
            approverId,
            status: 'rejected',
            comments,
          },
        },
      },
    });

    WebSocketService.broadcast('template:approval:rejected', template);
    return template;
  }

  // Helper methods
  private calculateAverageResponseTime(currentAnalytics: any, newResponseTime: number): number {
    if (!currentAnalytics) return newResponseTime;
    return (
      (currentAnalytics.avgResponseTime * currentAnalytics.usageCount + newResponseTime) /
      (currentAnalytics.usageCount + 1)
    );
  }

  private calculateAverageSentiment(currentAnalytics: any, newSentiment: number): number {
    if (!currentAnalytics || !currentAnalytics.sentimentScore) return newSentiment;
    return (
      (currentAnalytics.sentimentScore * currentAnalytics.usageCount + newSentiment) /
      (currentAnalytics.usageCount + 1)
    );
  }

  private initializeTimeStats(responseTime: number): TimeStats {
    const now = new Date();
    const hour = now.getHours().toString();
    const day = now.toISOString().split('T')[0];
    const week = this.getWeekNumber(now);

    return {
      hourly: { [hour]: responseTime },
      daily: { [day]: responseTime },
      weekly: { [week]: responseTime },
    };
  }

  private updateTimeStats(currentStats: any, responseTime: number): TimeStats {
    const now = new Date();
    const hour = now.getHours().toString();
    const day = now.toISOString().split('T')[0];
    const week = this.getWeekNumber(now);

    const hourly = { ...currentStats?.timeStats?.hourly } || {};
    const daily = { ...currentStats?.timeStats?.daily } || {};
    const weekly = { ...currentStats?.timeStats?.weekly } || {};

    hourly[hour] = this.calculateAverage(hourly[hour], responseTime);
    daily[day] = this.calculateAverage(daily[day], responseTime);
    weekly[week] = this.calculateAverage(weekly[week], responseTime);

    return { hourly, daily, weekly };
  }

  private calculateAverage(current: number | undefined, newValue: number): number {
    if (current === undefined) return newValue;
    return (current + newValue) / 2;
  }

  private getWeekNumber(date: Date): string {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return `${d.getUTCFullYear()}-W${Math.ceil((d.getTime() - yearStart.getTime()) / 604800000)}`;
  }

  private processSmartPlaceholders(content: string, context: Record<string, any>): string {
    // Process smart placeholders like {nextStep}, {previousMessage}, etc.
    const smartPlaceholders = {
      nextStep: this.getNextStep(context),
      previousMessage: this.getPreviousMessage(context),
      userName: context.userName,
      companyName: context.companyName,
      // Add more smart placeholders as needed
    };

    for (const [key, value] of Object.entries(smartPlaceholders)) {
      if (value) {
        const placeholder = new RegExp(`{${key}}`, 'g');
        content = content.replace(placeholder, value.toString());
      }
    }

    return content;
  }

  private getNextStep(context: Record<string, any>): string {
    // Implement logic to determine the next step based on context
    return context.nextStep || 'Follow up';
  }

  private getPreviousMessage(context: Record<string, any>): string {
    // Implement logic to get the previous message from context
    return context.previousMessage || '';
  }
} 