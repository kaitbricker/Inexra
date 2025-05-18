import { useState, useEffect } from 'react';
import { Role, RoleFilters, RoleResponse } from '@/types/role';
import { api } from '@/services/api';

export const useRoles = (filters: RoleFilters = {}) => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setLoading(true);
        const response = await api.get<RoleResponse>('/api/roles', {
          params: filters,
        });
        setRoles(response.data.roles);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch roles'));
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, [filters]);

  const createRole = async (roleData: Omit<Role, 'id' | 'createdAt' | 'updatedAt' | 'userCount'>) => {
    try {
      const response = await api.post<Role>('/api/roles', roleData);
      setRoles((prevRoles) => [...prevRoles, response.data]);
      return response.data;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to create role');
    }
  };

  const updateRole = async (roleId: string, roleData: Partial<Role>) => {
    try {
      const response = await api.patch<Role>(`/api/roles/${roleId}`, roleData);
      setRoles((prevRoles) =>
        prevRoles.map((role) =>
          role.id === roleId ? { ...role, ...response.data } : role
        )
      );
      return response.data;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update role');
    }
  };

  const deleteRole = async (roleId: string) => {
    try {
      await api.delete(`/api/roles/${roleId}`);
      setRoles((prevRoles) => prevRoles.filter((role) => role.id !== roleId));
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to delete role');
    }
  };

  return {
    roles,
    loading,
    error,
    createRole,
    updateRole,
    deleteRole,
  };
}; 