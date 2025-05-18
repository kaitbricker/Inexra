import { useState, useEffect } from 'react';
import { AuditLog, AuditLogFilters, AuditLogResponse } from '@/types/audit';
import { api } from '@/services/api';

export const useAuditLogs = (filters: AuditLogFilters = {}) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [totalLogs, setTotalLogs] = useState(0);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const response = await api.get<AuditLogResponse>('/api/audit-logs', {
          params: filters,
        });
        setLogs(response.data.logs);
        setTotalLogs(response.data.totalLogs);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch audit logs'));
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [filters]);

  const exportLogs = async (format: 'csv' | 'json') => {
    try {
      const response = await api.get('/api/audit-logs/export', {
        params: { ...filters, format },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `audit-logs.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to export audit logs');
    }
  };

  return {
    logs,
    loading,
    error,
    totalLogs,
    exportLogs,
  };
};
