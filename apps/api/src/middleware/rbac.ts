import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { ForbiddenError, UnauthorizedError } from '../utils/errors';

const prisma = new PrismaClient();

// Define permission types
export type Permission = 
  | 'USER_READ'
  | 'USER_WRITE'
  | 'USER_DELETE'
  | 'ROLE_MANAGE'
  | 'TEMPLATE_APPROVE'
  | 'TEMPLATE_EDIT'
  | 'TEMPLATE_DELETE'
  | 'AUDIT_READ';

// Define role types
export type Role = 'ADMIN' | 'CREATOR' | 'BASIC' | 'GUEST';

// Token payload interface
interface TokenPayload {
  userId: string;
  roles: Role[];
  permissions: Permission[];
}

// Middleware to verify JWT token
export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new UnauthorizedError('No token provided');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
    req.user = decoded;
    next();
  } catch (error) {
    next(new UnauthorizedError('Invalid token'));
  }
};

// Middleware to check if user has required role
export const hasRole = (roles: Role[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('User not authenticated');
      }

      const userRoles = req.user.roles;
      const hasRequiredRole = roles.some(role => userRoles.includes(role));

      if (!hasRequiredRole) {
        throw new ForbiddenError('Insufficient role permissions');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Middleware to check if user has required permission
export const hasPermission = (permissions: Permission[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('User not authenticated');
      }

      const userPermissions = req.user.permissions;
      const hasRequiredPermission = permissions.some(
        permission => userPermissions.includes(permission)
      );

      if (!hasRequiredPermission) {
        throw new ForbiddenError('Insufficient permissions');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Middleware to check if user is accessing their own resource
export const isSelfOrAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('User not authenticated');
    }

    const requestedUserId = req.params.id;
    const isAdmin = req.user.roles.includes('ADMIN');
    const isSelf = req.user.userId === requestedUserId;

    if (!isAdmin && !isSelf) {
      throw new ForbiddenError('Cannot access other user resources');
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Middleware to refresh token
export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = req.headers['x-refresh-token'];
    if (!refreshToken) {
      throw new UnauthorizedError('No refresh token provided');
    }

    // Verify refresh token and generate new access token
    const decoded = jwt.verify(refreshToken as string, process.env.JWT_REFRESH_SECRET!) as TokenPayload;
    const newToken = jwt.sign(
      { userId: decoded.userId, roles: decoded.roles, permissions: decoded.permissions },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    res.json({ token: newToken });
  } catch (error) {
    next(new UnauthorizedError('Invalid refresh token'));
  }
}; 