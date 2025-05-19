import { UserRole } from '@prisma/client';

interface User {
  id: string;
  email?: string | null;
  name?: string | null;
  profileImage?: string | null;
  role?: UserRole;
}

export function hasRole(user: User, roles: UserRole[]): boolean {
  return user.role ? roles.includes(user.role) : false;
}

export function hasPermission(user: User): boolean {
  // For now, we'll just check if the user has the ADMIN role
  // In a real application, you would check the user's permissions
  return user.role === UserRole.ADMIN;
}
