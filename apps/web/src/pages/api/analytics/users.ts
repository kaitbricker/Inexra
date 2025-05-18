import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { rateLimit } from '@/middleware/rateLimit';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for query parameters
const querySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  role: z.enum(['admin', 'user', 'guest']).optional(),
  status: z.enum(['active', 'suspended', 'pending']).optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Apply rate limiting
    await new Promise(resolve => rateLimit(req, res, resolve));

    // Validate session and permissions
    const session = await getSession({ req });
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Parse and validate query parameters
    const query = querySchema.parse(req.query);
    const startDate = query.startDate
      ? new Date(query.startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default to last 30 days
    const endDate = query.endDate ? new Date(query.endDate) : new Date();

    // Build filter conditions
    const where = {
      ...(query.role && { role: query.role }),
      ...(query.status && { status: query.status }),
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    };

    // Fetch user engagement metrics
    const [totalUsers, activeUsers, newUsers, userActivity, messageStats, responseTimeStats] =
      await Promise.all([
        // Total users
        prisma.user.count({ where }),
        // Active users (users with activity in the last 24 hours)
        prisma.user.count({
          where: {
            ...where,
            lastActiveAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
            },
          },
        }),
        // New users
        prisma.user.count({
          where: {
            ...where,
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
            },
          },
        }),
        // User activity over time
        prisma.user.findMany({
          where,
          select: {
            createdAt: true,
            lastActiveAt: true,
            _count: {
              select: {
                messages: true,
                sessions: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        }),
        // Message statistics
        prisma.message.groupBy({
          by: ['createdAt'],
          where: {
            user: where,
          },
          _count: true,
          orderBy: {
            createdAt: 'asc',
          },
        }),
        // Response time statistics
        prisma.message.groupBy({
          by: ['createdAt'],
          where: {
            user: where,
            responseTime: {
              not: null,
            },
          },
          _avg: {
            responseTime: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        }),
      ]);

    // Process and aggregate data
    const activityData = userActivity.map(activity => ({
      date: activity.createdAt.toISOString().split('T')[0],
      users: 1,
      messages: activity._count.messages,
      sessions: activity._count.sessions,
    }));

    const messageData = messageStats.map(stat => ({
      date: stat.createdAt.toISOString().split('T')[0],
      count: stat._count,
    }));

    const responseTimeData = responseTimeStats.map(stat => ({
      date: stat.createdAt.toISOString().split('T')[0],
      averageTime: stat._avg.responseTime,
    }));

    // Calculate trends
    const calculateTrend = (current: number, previous: number) => {
      if (previous === 0) return 100;
      return ((current - previous) / previous) * 100;
    };

    const previousPeriodStart = new Date(
      startDate.getTime() - (endDate.getTime() - startDate.getTime())
    );
    const previousPeriodEnd = startDate;

    const [previousTotalUsers, previousActiveUsers, previousNewUsers] = await Promise.all([
      prisma.user.count({
        where: {
          ...where,
          createdAt: {
            gte: previousPeriodStart,
            lte: previousPeriodEnd,
          },
        },
      }),
      prisma.user.count({
        where: {
          ...where,
          lastActiveAt: {
            gte: new Date(previousPeriodStart.getTime() - 24 * 60 * 60 * 1000),
            lte: previousPeriodEnd,
          },
        },
      }),
      prisma.user.count({
        where: {
          ...where,
          createdAt: {
            gte: new Date(previousPeriodStart.getTime() - 24 * 60 * 60 * 1000),
            lte: previousPeriodEnd,
          },
        },
      }),
    ]);

    return res.status(200).json({
      metrics: {
        totalUsers: {
          value: totalUsers,
          change: calculateTrend(totalUsers, previousTotalUsers),
          trend: totalUsers > previousTotalUsers ? 'up' : 'down',
        },
        activeUsers: {
          value: activeUsers,
          change: calculateTrend(activeUsers, previousActiveUsers),
          trend: activeUsers > previousActiveUsers ? 'up' : 'down',
        },
        newUsers: {
          value: newUsers,
          change: calculateTrend(newUsers, previousNewUsers),
          trend: newUsers > previousNewUsers ? 'up' : 'down',
        },
      },
      activity: activityData,
      messages: messageData,
      responseTimes: responseTimeData,
    });
  } catch (error) {
    console.error('Analytics error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid query parameters', details: error.errors });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}
