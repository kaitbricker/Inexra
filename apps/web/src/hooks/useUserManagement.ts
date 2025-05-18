import { useState, useEffect, useCallback } from 'react';
import { userApi } from '../services/api';
import useWebSocket from './useWebSocket';

interface User {
  id: string;
  email: string;
  name: string;
  status: 'active' | 'suspended' | 'pending';
  role: string;
  createdAt: string;
  updatedAt: string;
}

interface UserSettings {
  notifications: {
    email: boolean;
    push: boolean;
  };
  apiKeys: Array<{
    id: string;
    name: string;
    createdAt: string;
  }>;
}

interface UseUserManagementReturn {
  users: User[];
  loading: boolean;
  error: string | null;
  fetchUsers: (params?: { page?: number; limit?: number; search?: string }) => Promise<void>;
  createUser: (data: Partial<User>) => Promise<User>;
  updateUser: (id: string, data: Partial<User>) => Promise<User>;
  deleteUser: (id: string) => Promise<void>;
  getUserSettings: (id: string) => Promise<UserSettings>;
  updateUserSettings: (id: string, data: Partial<UserSettings>) => Promise<UserSettings>;
  createApiKey: (id: string) => Promise<{ id: string; key: string }>;
  deleteApiKey: (id: string, keyId: string) => Promise<void>;
}

const useUserManagement = (): UseUserManagementReturn => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { subscribe } = useWebSocket();

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribe = subscribe('user:update', (data) => {
      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.id === data.id ? { ...user, ...data } : user
        )
      );
    });

    return () => {
      unsubscribe();
    };
  }, [subscribe]);

  const fetchUsers = useCallback(async (params?: { page?: number; limit?: number; search?: string }) => {
    try {
      setLoading(true);
      setError(null);
      const response = await userApi.getUsers(params);
      setUsers(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, []);

  const createUser = useCallback(async (data: Partial<User>) => {
    try {
      setLoading(true);
      setError(null);
      const response = await userApi.createUser(data);
      setUsers((currentUsers) => [...currentUsers, response.data]);
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUser = useCallback(async (id: string, data: Partial<User>) => {
    try {
      setLoading(true);
      setError(null);
      const response = await userApi.updateUser(id, data);
      setUsers((currentUsers) =>
        currentUsers.map((user) => (user.id === id ? { ...user, ...response.data } : user))
      );
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteUser = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await userApi.deleteUser(id);
      setUsers((currentUsers) => currentUsers.filter((user) => user.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getUserSettings = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await userApi.getUserSettings(id);
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user settings');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUserSettings = useCallback(async (id: string, data: Partial<UserSettings>) => {
    try {
      setLoading(true);
      setError(null);
      const response = await userApi.updateUserSettings(id, data);
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user settings');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createApiKey = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await userApi.createApiKey(id);
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create API key');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteApiKey = useCallback(async (id: string, keyId: string) => {
    try {
      setLoading(true);
      setError(null);
      await userApi.deleteApiKey(id, keyId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete API key');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    users,
    loading,
    error,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    getUserSettings,
    updateUserSettings,
    createApiKey,
    deleteApiKey,
  };
};

export default useUserManagement; 