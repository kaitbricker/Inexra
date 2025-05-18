import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { verifyToken, hasRole, hasPermission } from '../middleware/rbac';
import { auditLog } from '../middleware/audit';
import { ValidationError, NotFoundError } from '../utils/errors';

const router = Router();
const prisma = new PrismaClient();

// Get all roles (Admin only)
router.get(
  '/',
  verifyToken,
  hasRole(['ADMIN']),
  hasPermission(['ROLE_MANAGE']),
  auditLog('LIST_ROLES'),
  async (req, res, next) => {
    try {
      const roles = await prisma.role.findMany({
        include: {
          users: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  name: true,
                },
              },
            },
          },
        },
      });
      res.json(roles);
    } catch (error) {
      next(error);
    }
  }
);

// Get role by ID (Admin only)
router.get(
  '/:id',
  verifyToken,
  hasRole(['ADMIN']),
  hasPermission(['ROLE_MANAGE']),
  auditLog('GET_ROLE'),
  async (req, res, next) => {
    try {
      const role = await prisma.role.findUnique({
        where: { id: req.params.id },
        include: {
          users: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      if (!role) {
        throw new NotFoundError('Role not found');
      }

      res.json(role);
    } catch (error) {
      next(error);
    }
  }
);

// Create new role (Admin only)
router.post(
  '/',
  verifyToken,
  hasRole(['ADMIN']),
  hasPermission(['ROLE_MANAGE']),
  auditLog('CREATE_ROLE'),
  async (req, res, next) => {
    try {
      const { name, permissions, metadata } = req.body;

      if (!name || !permissions) {
        throw new ValidationError('Name and permissions are required');
      }

      const role = await prisma.role.create({
        data: {
          name,
          permissions,
          metadata,
        },
      });

      res.status(201).json(role);
    } catch (error) {
      next(error);
    }
  }
);

// Update role (Admin only)
router.patch(
  '/:id',
  verifyToken,
  hasRole(['ADMIN']),
  hasPermission(['ROLE_MANAGE']),
  auditLog('UPDATE_ROLE'),
  async (req, res, next) => {
    try {
      const { name, permissions, metadata } = req.body;
      const roleId = req.params.id;

      const role = await prisma.role.update({
        where: { id: roleId },
        data: {
          name,
          permissions,
          metadata,
        },
      });

      res.json(role);
    } catch (error) {
      next(error);
    }
  }
);

// Delete role (Admin only)
router.delete(
  '/:id',
  verifyToken,
  hasRole(['ADMIN']),
  hasPermission(['ROLE_MANAGE']),
  auditLog('DELETE_ROLE'),
  async (req, res, next) => {
    try {
      // Check if role is assigned to any users
      const userCount = await prisma.userRole.count({
        where: { roleId: req.params.id },
      });

      if (userCount > 0) {
        throw new ValidationError('Cannot delete role that is assigned to users');
      }

      await prisma.role.delete({
        where: { id: req.params.id },
      });

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

export default router; 