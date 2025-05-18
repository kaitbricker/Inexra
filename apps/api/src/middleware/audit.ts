import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const auditLog = (action: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.send;
    res.send = function (body) {
      res.send = originalSend;
      const result = originalSend.call(this, body);

      // Log the action after the response is sent
      if (req.user?.userId) {
        prisma.auditLog.create({
          data: {
            userId: req.user.userId,
            action,
            description: `${action} - ${req.method} ${req.originalUrl}`,
          },
        }).catch(console.error);
      }

      return result;
    };

    next();
  };
};

// Middleware to log specific user actions
export const logUserAction = async (
  userId: string,
  action: string,
  description?: string
) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        description,
      },
    });
  } catch (error) {
    console.error('Error logging user action:', error);
  }
};

// Middleware to get audit logs with pagination
export const getAuditLogs = async (
  page: number = 1,
  limit: number = 10,
  userId?: string
) => {
  const skip = (page - 1) * limit;
  
  const where = userId ? { userId } : {};
  
  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    logs,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}; 