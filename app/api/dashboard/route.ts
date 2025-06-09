import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { subDays } from 'date-fns';

interface SentimentData {
  sentiment: string | null;
  _count: number;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const platform = searchParams.get('platform');

    const now = new Date();
    const thirtyDaysAgo = subDays(now, 30);
    const sixtyDaysAgo = subDays(now, 60);

    // Base where clause that will be used across queries
    const baseWhere = {
      ...(userId && { userId }),
      ...(platform && { platform })
    };

    // Get total messages
    const totalMessages = await prisma.message.count({
      where: baseWhere
    });

    // Get total leads
    const totalLeads = await prisma.message.count({
      where: {
        ...baseWhere,
        tags: {
          has: 'Lead'
        }
      }
    });

    // Get total complaints
    const totalComplaints = await prisma.message.count({
      where: {
        ...baseWhere,
        tags: {
          has: 'Complaint'
        }
      }
    });

    // Get total insights
    const totalInsights = await prisma.message.count({
      where: {
        ...baseWhere,
        hasInsight: true
      }
    });

    // --- Trend Calculations ---
    // Messages
    const currentMessages = await prisma.message.count({
      where: {
        ...baseWhere,
        createdAt: {
          gte: thirtyDaysAgo,
          lt: now
        }
      }
    });
    const previousMessages = await prisma.message.count({
      where: {
        ...baseWhere,
        createdAt: {
          gte: sixtyDaysAgo,
          lt: thirtyDaysAgo
        }
      }
    });
    const messageTrend = previousMessages > 0 ? ((currentMessages - previousMessages) / previousMessages) * 100 : 0;

    // Leads
    const currentLeads = await prisma.message.count({
      where: {
        ...baseWhere,
        tags: { has: 'Lead' },
        createdAt: {
          gte: thirtyDaysAgo,
          lt: now
        }
      }
    });
    const previousLeads = await prisma.message.count({
      where: {
        ...baseWhere,
        tags: { has: 'Lead' },
        createdAt: {
          gte: sixtyDaysAgo,
          lt: thirtyDaysAgo
        }
      }
    });
    const leadTrend = previousLeads > 0 ? ((currentLeads - previousLeads) / previousLeads) * 100 : 0;

    // Complaints
    const currentComplaints = await prisma.message.count({
      where: {
        ...baseWhere,
        tags: { has: 'Complaint' },
        createdAt: {
          gte: thirtyDaysAgo,
          lt: now
        }
      }
    });
    const previousComplaints = await prisma.message.count({
      where: {
        ...baseWhere,
        tags: { has: 'Complaint' },
        createdAt: {
          gte: sixtyDaysAgo,
          lt: thirtyDaysAgo
        }
      }
    });
    const complaintTrend = previousComplaints > 0 ? ((currentComplaints - previousComplaints) / previousComplaints) * 100 : 0;

    // Insights
    const currentInsights = await prisma.message.count({
      where: {
        ...baseWhere,
        hasInsight: true,
        createdAt: {
          gte: thirtyDaysAgo,
          lt: now
        }
      }
    });
    const previousInsights = await prisma.message.count({
      where: {
        ...baseWhere,
        hasInsight: true,
        createdAt: {
          gte: sixtyDaysAgo,
          lt: thirtyDaysAgo
        }
      }
    });
    const insightTrend = previousInsights > 0 ? ((currentInsights - previousInsights) / previousInsights) * 100 : 0;

    // Get sentiment breakdown
    const sentimentData = await prisma.message.groupBy({
      by: ['sentiment'],
      where: baseWhere,
      _count: true,
    });

    const sentimentBreakdown = {
      positive: 0,
      neutral: 0,
      negative: 0
    };

    sentimentData.forEach((item: SentimentData) => {
      if (!item.sentiment) return;
      const percentage = totalMessages > 0 ? (item._count / totalMessages) * 100 : 0;
      sentimentBreakdown[item.sentiment.toLowerCase() as keyof typeof sentimentBreakdown] = Math.round(percentage);
    });

    // Calculate platform health metrics
    const resolvedMessages = await prisma.message.count({
      where: {
        ...baseWhere,
        status: 'Resolved'
      }
    });

    const messagesResolved = totalMessages > 0 ? Math.round((resolvedMessages / totalMessages) * 100) : 0;

    // Calculate average response time
    const messagesWithResponseTime = await prisma.message.findMany({
      where: {
        ...baseWhere,
        responseTime: {
          not: null
        }
      },
      select: {
        responseTime: true
      }
    });

    const avgResponseTime = messagesWithResponseTime.length > 0
      ? Math.round(messagesWithResponseTime.reduce((acc: number, msg: { responseTime: number | null }) => acc + (msg.responseTime || 0), 0) / messagesWithResponseTime.length)
      : 0;

    // Format average response time
    const formatResponseTime = (minutes: number) => {
      if (minutes < 60) return `${minutes}m`;
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
    };

    // Calculate SLA breaches
    const slaBreaches = await prisma.message.count({
      where: {
        ...baseWhere,
        resolvedAt: {
          not: null
        },
        responseTime: {
          gt: 1440 // 24 hours in minutes
        }
      }
    });

    // Calculate customer satisfaction
    const positiveMessages = await prisma.message.count({
      where: {
        ...baseWhere,
        sentiment: 'Positive'
      }
    });

    const customerSatisfaction = totalMessages > 0 ? Math.round((positiveMessages / totalMessages) * 100) : 0;

    return NextResponse.json({
      totalMessages,
      totalLeads,
      totalComplaints,
      totalInsights,
      sentimentBreakdown,
      aiInsight: "Customer engagement shows positive trend with 15% increase in response satisfaction",
      platformHealth: {
        avgResponseTime: formatResponseTime(avgResponseTime),
        messagesResolved,
        slaBreaches,
        customerSatisfaction
      },
      messageTrend,
      leadTrend,
      complaintTrend,
      insightTrend
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
} 