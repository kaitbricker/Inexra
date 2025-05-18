import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
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
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

// User Management API
export const userApi = {
  getUsers: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get('/users', { params }),
  getUser: (id: string) => api.get(`/users/${id}`),
  createUser: (data: any) => api.post('/users', data),
  updateUser: (id: string, data: any) => api.patch(`/users/${id}`, data),
  deleteUser: (id: string) => api.delete(`/users/${id}`),
  getUserSettings: (id: string) => api.get(`/users/${id}/settings`),
  updateUserSettings: (id: string, data: any) => api.patch(`/users/${id}/settings`, data),
  createApiKey: (id: string) => api.post(`/users/${id}/api-keys`),
  deleteApiKey: (id: string, keyId: string) => api.delete(`/users/${id}/api-keys/${keyId}`),
};

// Role Management API
export const roleApi = {
  getRoles: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get('/roles', { params }),
  createRole: (data: any) => api.post('/roles', data),
  updateRole: (id: string, data: any) => api.patch(`/roles/${id}`, data),
  deleteRole: (id: string) => api.delete(`/roles/${id}`),
};

// Audit Logs API
export const auditLogApi = {
  getAuditLogs: (params?: { page?: number; limit?: number; userId?: string }) =>
    api.get('/audit-logs', { params }),
  getUserAuditLogs: (userId: string, params?: { page?: number; limit?: number }) =>
    api.get(`/audit-logs/${userId}`, { params }),
}; 