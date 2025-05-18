import { useState, useEffect, useCallback } from 'react';
import { roleApi } from '../services/api';
import useWebSocket from './useWebSocket';

interface Permission {
  id: string;
  name: string;
  description: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
}

interface UseRoleManagementReturn {
  roles: Role[];
  loading: boolean;
  error: string | null;
  fetchRoles: (params?: { page?: number; limit?: number; search?: string }) => Promise<void>;
  createRole: (data: Partial<Role>) => Promise<Role>;
  updateRole: (id: string, data: Partial<Role>) => Promise<Role>;
  deleteRole: (id: string) => Promise<void>;
}

const useRoleManagement = (): UseRoleManagementReturn => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { subscribe } = useWebSocket();

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribe = subscribe('role:update', (data) => {
      setRoles((currentRoles) =>
        currentRoles.map((role) =>
          role.id === data.id ? { ...role, ...data } : role
        )
      );
    });

    return () => {
      unsubscribe();
    };
  }, [subscribe]);

  const fetchRoles = useCallback(async (params?: { page?: number; limit?: number; search?: string }) => {
    try {
      setLoading(true);
      setError(null);
      const response = await roleApi.getRoles(params);
      setRoles(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch roles');
    } finally {
      setLoading(false);
    }
  }, []);

  const createRole = useCallback(async (data: Partial<Role>) => {
    try {
      setLoading(true);
      setError(null);
      const response = await roleApi.createRole(data);
      setRoles((currentRoles) => [...currentRoles, response.data]);
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create role');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateRole = useCallback(async (id: string, data: Partial<Role>) => {
    try {
      setLoading(true);
      setError(null);
      const response = await roleApi.updateRole(id, data);
      setRoles((currentRoles) =>
        currentRoles.map((role) => (role.id === id ? { ...role, ...response.data } : role))
      );
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update role');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteRole = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await roleApi.deleteRole(id);
      setRoles((currentRoles) => currentRoles.filter((role) => role.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete role');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    roles,
    loading,
    error,
    fetchRoles,
    createRole,
    updateRole,
    deleteRole,
  };
};

export default useRoleManagement; 