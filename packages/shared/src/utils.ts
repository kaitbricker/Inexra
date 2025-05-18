import { User, Role, Permission } from './types';

export function hasPermission(user: User, permissionName: string): boolean {
  return user.role.permissions.some(p => p.name === permissionName);
}

export function hasRole(user: User, roleName: string): boolean {
  return user.role.name === roleName;
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
} 