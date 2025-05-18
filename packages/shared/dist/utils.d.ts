import { User } from './types';
export declare function hasPermission(user: User, permissionName: string): boolean;
export declare function hasRole(user: User, roleName: string): boolean;
export declare function formatDate(date: Date): string;
