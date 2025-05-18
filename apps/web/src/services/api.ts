import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// User Management API
export const userApi = {
  getUsers: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get('/api/users', { params }),
  getUser: (id: string) => api.get(`/api/users/${id}`),
  createUser: (data: any) => api.post('/api/users', data),
  updateUser: (id: string, data: any) => api.patch(`/api/users/${id}`, data),
  deleteUser: (id: string) => api.delete(`/api/users/${id}`),
  getUserSettings: (id: string) => api.get(`/api/users/${id}/settings`),
  updateUserSettings: (id: string, data: any) => api.patch(`/api/users/${id}/settings`, data),
  createApiKey: (id: string) => api.post(`/api/users/${id}/api-keys`),
  deleteApiKey: (id: string, keyId: string) => api.delete(`/api/users/${id}/api-keys/${keyId}`),
};

// Role Management API
export const roleApi = {
  getRoles: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get('/api/roles', { params }),
  createRole: (data: any) => api.post('/api/roles', data),
  updateRole: (id: string, data: any) => api.patch(`/api/roles/${id}`, data),
  deleteRole: (id: string) => api.delete(`/api/roles/${id}`),
};

// Audit Logs API
export const auditLogApi = {
  getAuditLogs: (params?: { page?: number; limit?: number; userId?: string }) =>
    api.get('/api/audit-logs', { params }),
  getUserAuditLogs: (userId: string, params?: { page?: number; limit?: number }) =>
    api.get(`/api/audit-logs/${userId}`, { params }),
};

export default api; 