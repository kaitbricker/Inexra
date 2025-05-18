import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { rateLimit } from '@/middleware/rateLimit';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for query parameters
const querySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  category: z.string().optional(),
  status: z.enum(['active', 'archived', 'draft']).optional(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Apply rate limiting
    await new Promise((resolve) => rateLimit(req, res, resolve));

    // Validate session and permissions
    const session = await getSession({ req });
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Parse and validate query parameters
    const query = querySchema.parse(req.query);
    const startDate = query.startDate ? new Date(query.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default to last 30 days
    const endDate = query.endDate ? new Date(query.endDate) : new Date();

    // Build filter conditions
    const where = {
      ...(query.category && { category: query.category }),
      ...(query.status && { status: query.status }),
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    };

    // Fetch template performance metrics
    const [
      totalTemplates,
      activeTemplates,
      templateUsage,
      responseRates,
      conversionRates,
    ] = await Promise.all([
      // Total templates
      prisma.template.count({ where }),
      // Active templates (used in the last 24 hours)
      prisma.template.count({
        where: {
          ...where,
          lastUsedAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      }),
      // Template usage over time
      prisma.templateUsage.groupBy({
        by: ['templateId', 'createdAt'],
        where: {
          template: where,
        },
        _count: true,
        orderBy: {
          createdAt: 'asc',
        },
      }),
      // Response rates
      prisma.templateUsage.groupBy({
        by: ['templateId', 'createdAt'],
        where: {
          template: where,
          responseReceived: true,
        },
        _count: true,
        orderBy: {
          createdAt: 'asc',
        },
      }),
      // Conversion rates
      prisma.templateUsage.groupBy({
        by: ['templateId', 'createdAt'],
        where: {
          template: where,
          converted: true,
        },
        _count: true,
        orderBy: {
          createdAt: 'asc',
        },
      }),
    ]);

    // Process and aggregate data
    const usageData = templateUsage.map((usage) => ({
      date: usage.createdAt.toISOString().split('T')[0],
      templateId: usage.templateId,
      count: usage._count,
    }));

    const responseRateData = responseRates.map((rate) => ({
      date: rate.createdAt.toISOString().split('T')[0],
      templateId: rate.templateId,
      count: rate._count,
    }));

    const conversionRateData = conversionRates.map((rate) => ({
      date: rate.createdAt.toISOString().split('T')[0],
      templateId: rate.templateId,
      count: rate._count,
    }));

    // Calculate trends
    const calculateTrend = (current: number, previous: number) => {
      if (previous === 0) return 100;
      return ((current - previous) / previous) * 100;
    };

    const previousPeriodStart = new Date(startDate.getTime() - (endDate.getTime() - startDate.getTime()));
    const previousPeriodEnd = startDate;

    const [
      previousTotalTemplates,
      previousActiveTemplates,
    ] = await Promise.all([
      prisma.template.count({
        where: {
          ...where,
          createdAt: {
            gte: previousPeriodStart,
            lte: previousPeriodEnd,
          },
        },
      }),
      prisma.template.count({
        where: {
          ...where,
          lastUsedAt: {
            gte: new Date(previousPeriodStart.getTime() - 24 * 60 * 60 * 1000),
            lte: previousPeriodEnd,
          },
        },
      }),
    ]);

    // Calculate average response and conversion rates
    const totalUsage = templateUsage.reduce((sum, usage) => sum + usage._count, 0);
    const totalResponses = responseRates.reduce((sum, rate) => sum + rate._count, 0);
    const totalConversions = conversionRates.reduce((sum, rate) => sum + rate._count, 0);

    const averageResponseRate = totalUsage > 0 ? (totalResponses / totalUsage) * 100 : 0;
    const averageConversionRate = totalUsage > 0 ? (totalConversions / totalUsage) * 100 : 0;

    return res.status(200).json({
      metrics: {
        totalTemplates: {
          value: totalTemplates,
          change: calculateTrend(totalTemplates, previousTotalTemplates),
          trend: totalTemplates > previousTotalTemplates ? 'up' : 'down',
        },
        activeTemplates: {
          value: activeTemplates,
          change: calculateTrend(activeTemplates, previousActiveTemplates),
          trend: activeTemplates > previousActiveTemplates ? 'up' : 'down',
        },
        averageResponseRate: {
          value: averageResponseRate,
          change: 0, // TODO: Calculate response rate trend
          trend: 'neutral',
        },
        averageConversionRate: {
          value: averageConversionRate,
          change: 0, // TODO: Calculate conversion rate trend
          trend: 'neutral',
        },
      },
      usage: usageData,
      responseRates: responseRateData,
      conversionRates: conversionRateData,
    });
  } catch (error) {
    console.error('Analytics error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid query parameters', details: error.errors });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
} 