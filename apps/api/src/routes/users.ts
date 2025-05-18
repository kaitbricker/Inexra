import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { verifyToken, hasRole, hasPermission, isSelfOrAdmin } from '../middleware/rbac';
import { auditLog } from '../middleware/audit';
import { ValidationError, NotFoundError } from '../utils/errors';

const router = Router();
const prisma = new PrismaClient();

// Get all users (Admin only)
router.get(
  '/',
  verifyToken,
  hasRole(['ADMIN']),
  hasPermission(['USER_READ']),
  auditLog('LIST_USERS'),
  async (req, res, next) => {
    try {
      const users = await prisma.user.findMany({
        include: {
          roles: {
            include: {
              role: true,
            },
          },
        },
      });
      res.json(users);
    } catch (error) {
      next(error);
    }
  }
);

// Get user by ID (Admin or self)
router.get(
  '/:id',
  verifyToken,
  isSelfOrAdmin,
  hasPermission(['USER_READ']),
  auditLog('GET_USER'),
  async (req, res, next) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.params.id },
        include: {
          roles: {
            include: {
              role: true,
            },
          },
        },
      });

      if (!user) {
        throw new NotFoundError('User not found');
      }

      res.json(user);
    } catch (error) {
      next(error);
    }
  }
);

// Create new user (Admin only)
router.post(
  '/',
  verifyToken,
  hasRole(['ADMIN']),
  hasPermission(['USER_WRITE']),
  auditLog('CREATE_USER'),
  async (req, res, next) => {
    try {
      const { email, password, name, roles } = req.body;

      if (!email || !password) {
        throw new ValidationError('Email and password are required');
      }

      const user = await prisma.user.create({
        data: {
          email,
          password, // Note: Should be hashed before saving
          name,
          roles: {
            create: roles?.map((roleId: string) => ({
              role: {
                connect: { id: roleId },
              },
            })),
          },
        },
        include: {
          roles: {
            include: {
              role: true,
            },
          },
        },
      });

      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  }
);

// Update user (Admin or self)
router.patch(
  '/:id',
  verifyToken,
  isSelfOrAdmin,
  hasPermission(['USER_WRITE']),
  auditLog('UPDATE_USER'),
  async (req, res, next) => {
    try {
      const { name, email, status, roles } = req.body;
      const userId = req.params.id;

      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          name,
          email,
          status,
          roles: roles ? {
            deleteMany: {},
            create: roles.map((roleId: string) => ({
              role: {
                connect: { id: roleId },
              },
            })),
          } : undefined,
        },
        include: {
          roles: {
            include: {
              role: true,
            },
          },
        },
      });

      res.json(user);
    } catch (error) {
      next(error);
    }
  }
);

// Delete user (Admin only)
router.delete(
  '/:id',
  verifyToken,
  hasRole(['ADMIN']),
  hasPermission(['USER_DELETE']),
  auditLog('DELETE_USER'),
  async (req, res, next) => {
    try {
      await prisma.user.delete({
        where: { id: req.params.id },
      });

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

export default router; 