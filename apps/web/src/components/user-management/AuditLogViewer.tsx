'use client';

import React, { useState } from 'react';
import { Table } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { useAuditLogs } from '@/hooks/useAuditLogs';
import { format } from 'date-fns';
import { AuditLog, AuditAction } from '@/types/audit';

interface AuditLogViewerProps {
  onExport: (format: 'csv' | 'json') => void;
}

export const AuditLogViewer: React.FC<AuditLogViewerProps> = ({ onExport }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<AuditAction | 'all'>('all');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const { logs, loading, error, totalLogs } = useAuditLogs({
    search: searchQuery,
    action: actionFilter !== 'all' ? actionFilter : undefined,
    startDate: dateRange.start || undefined,
    endDate: dateRange.end || undefined,
    page: currentPage,
    limit: itemsPerPage,
  });

  const getActionColor = (action: AuditAction) => {
    switch (action) {
      case 'create':
        return 'text-green-600';
      case 'update':
        return 'text-blue-600';
      case 'delete':
        return 'text-red-600';
      case 'login':
        return 'text-purple-600';
      case 'logout':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Audit Logs</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => onExport('csv')}>
            Export CSV
          </Button>
          <Button variant="outline" onClick={() => onExport('json')}>
            Export JSON
          </Button>
        </div>
      </div>

      <div className="flex gap-4">
        <Input
          placeholder="Search logs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        <Select
          value={actionFilter}
          onValueChange={(value) => setActionFilter(value as AuditAction | 'all')}
        >
          <option value="all">All Actions</option>
          <option value="create">Create</option>
          <option value="update">Update</option>
          <option value="delete">Delete</option>
          <option value="login">Login</option>
          <option value="logout">Logout</option>
        </Select>
        <Input
          type="date"
          value={dateRange.start}
          onChange={(e) =>
            setDateRange((prev) => ({ ...prev, start: e.target.value }))
          }
        />
        <Input
          type="date"
          value={dateRange.end}
          onChange={(e) =>
            setDateRange((prev) => ({ ...prev, end: e.target.value }))
          }
        />
      </div>

      <Table>
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>User</th>
            <th>Action</th>
            <th>Resource</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id}>
              <td>{format(new Date(log.timestamp), 'MMM d, yyyy HH:mm:ss')}</td>
              <td>{log.user.name}</td>
              <td>
                <span className={getActionColor(log.action)}>
                  {log.action}
                </span>
              </td>
              <td>{log.resource}</td>
              <td>
                <pre className="text-sm whitespace-pre-wrap">
                  {JSON.stringify(log.details, null, 2)}
                </pre>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <div className="flex justify-between items-center">
        <div>
          Showing {logs.length} of {totalLogs} logs
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={() => setCurrentPage((p) => p + 1)}
            disabled={logs.length < itemsPerPage}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}; 