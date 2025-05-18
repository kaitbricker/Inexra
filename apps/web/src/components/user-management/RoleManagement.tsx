'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useRoles } from '@/hooks/useRoles';
import { Role, Permission } from '@/types/role';

interface RoleManagementProps {
  onEditRole: (roleId: string) => void;
  onDeleteRole: (roleId: string) => void;
}

export const RoleManagement: React.FC<RoleManagementProps> = ({ onEditRole, onDeleteRole }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { roles, loading, error, updateRole, deleteRole } = useRoles();

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePermissionChange = async (
    roleId: string,
    permission: Permission,
    checked: boolean
  ) => {
    try {
      const role = roles.find(r => r.id === roleId);
      if (!role) return;

      const updatedPermissions = checked
        ? [...role.permissions, permission]
        : role.permissions.filter(p => p !== permission);

      await updateRole(roleId, { permissions: updatedPermissions });
    } catch (error) {
      console.error('Failed to update permission:', error);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Role Management</h1>
        <Button onClick={() => onEditRole('new')}>Create New Role</Button>
      </div>

      <div className="flex gap-4">
        <Input
          placeholder="Search roles..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Table>
        <thead>
          <tr>
            <th>Role Name</th>
            <th>Description</th>
            <th>Users</th>
            <th>Permissions</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredRoles.map(role => (
            <tr key={role.id}>
              <td>{role.name}</td>
              <td>{role.description}</td>
              <td>
                <Badge>{role.userCount} users</Badge>
              </td>
              <td>
                <div className="space-y-2">
                  {Object.values(Permission).map(permission => (
                    <div key={permission} className="flex items-center space-x-2">
                      <Checkbox
                        checked={role.permissions.includes(permission)}
                        onChange={e =>
                          handlePermissionChange(role.id, permission, e.target.checked)
                        }
                      />
                      <label className="text-sm">{permission}</label>
                    </div>
                  ))}
                </div>
              </td>
              <td>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => onEditRole(role.id)}>
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => onDeleteRole(role.id)}>
                    Delete
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};
