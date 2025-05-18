import { useState, useEffect } from 'react';
import { User, UserFilters, UserResponse } from '@/types/user';
import { api } from '@/services/api';

export const useUsers = (filters: UserFilters = {}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [totalUsers, setTotalUsers] = useState(0);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await api.get<UserResponse>('/api/users', {
          params: filters,
        });
        setUsers(response.data.users);
        setTotalUsers(response.data.totalUsers);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch users'));
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [filters]);

  const updateUser = async (userId: string, data: Partial<User>) => {
    try {
      const response = await api.patch<User>(`/api/users/${userId}`, data);
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, ...response.data } : user
        )
      );
      return response.data;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update user');
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      await api.delete(`/api/users/${userId}`);
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
      setTotalUsers((prev) => prev - 1);
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to delete user');
    }
  };

  const resetPassword = async (userId: string) => {
    try {
      await api.post(`/api/users/${userId}/reset-password`);
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to reset password');
    }
  };

  return {
    users,
    loading,
    error,
    totalUsers,
    updateUser,
    deleteUser,
    resetPassword,
  };
}; 