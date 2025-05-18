'use client';

import { UserDashboard } from '@/components/user-management/UserDashboard';
import { RoleManagement } from '@/components/user-management/RoleManagement';
import { AuditLogViewer } from '@/components/user-management/AuditLogViewer';

export default function Home() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8">User Management System</h1>
      
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">User Management</h2>
          <UserDashboard
            onEditUser={(userId) => console.log('Edit user:', userId)}
            onDeleteUser={(userId) => console.log('Delete user:', userId)}
            onResetPassword={(userId) => console.log('Reset password:', userId)}
          />
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Role Management</h2>
          <RoleManagement
            onEditRole={(roleId) => console.log('Edit role:', roleId)}
            onDeleteRole={(roleId) => console.log('Delete role:', roleId)}
          />
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Audit Logs</h2>
          <AuditLogViewer
            onExport={(format) => console.log('Export logs:', format)}
          />
        </section>
      </div>
    </div>
  );
} 