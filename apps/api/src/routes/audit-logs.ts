import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { verifyToken, hasRole, hasPermission } from '../middleware/rbac';
import { getAuditLogs } from '../middleware/audit';
import { ValidationError } from '../utils/errors';

const router = Router();
const prisma = new PrismaClient();

// Get all audit logs (Admin only)
router.get(
  '/',
  verifyToken,
  hasRole(['ADMIN']),
  hasPermission(['AUDIT_READ']),
  async (req, res, next) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      if (page < 1 || limit < 1) {
        throw new ValidationError('Invalid pagination parameters');
      }

      const logs = await getAuditLogs(page, limit);
      res.json(logs);
    } catch (error) {
      next(error);
    }
  }
);

// Get audit logs for specific user (Admin only)
router.get(
  '/user/:userId',
  verifyToken,
  hasRole(['ADMIN']),
  hasPermission(['AUDIT_READ']),
  async (req, res, next) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const { userId } = req.params;

      if (page < 1 || limit < 1) {
        throw new ValidationError('Invalid pagination parameters');
      }

      const logs = await getAuditLogs(page, limit, userId);
      res.json(logs);
    } catch (error) {
      next(error);
    }
  }
);

// Get audit logs by action type (Admin only)
router.get(
  '/action/:action',
  verifyToken,
  hasRole(['ADMIN']),
  hasPermission(['AUDIT_READ']),
  async (req, res, next) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const { action } = req.params;

      if (page < 1 || limit < 1) {
        throw new ValidationError('Invalid pagination parameters');
      }

      const skip = (page - 1) * limit;

      const [logs, total] = await Promise.all([
        prisma.auditLog.findMany({
          where: { action },
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
        prisma.auditLog.count({ where: { action } }),
      ]);

      res.json({
        logs,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router; 