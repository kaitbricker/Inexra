export type UserStatus = 'active' | 'suspended' | 'pending';
export type UserRole = 'admin' | 'user' | 'guest';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
  profilePicture?: string;
  bio?: string;
}

export interface UserFilters {
  search?: string;
  role?: UserRole;
  status?: UserStatus;
  page?: number;
  limit?: number;
}

export interface UserResponse {
  users: User[];
  totalUsers: number;
  currentPage: number;
  totalPages: number;
} 