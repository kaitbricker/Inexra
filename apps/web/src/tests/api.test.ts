import { userApi, roleApi, auditLogApi } from '@/services/api';
import { AxiosError } from 'axios';

describe('API Endpoints', () => {
  // Mock localStorage
  const mockLocalStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  };
  Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('User API', () => {
    it('should fetch users with pagination', async () => {
      const params = { page: 1, limit: 10 };
      const response = await userApi.getUsers(params);
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('users');
      expect(response.data).toHaveProperty('pagination');
    });

    it('should handle user creation', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
      };
      const response = await userApi.createUser(userData);
      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('id');
    });

    it('should handle unauthorized access', async () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      try {
        await userApi.getUsers();
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(401);
      }
    });
  });

  describe('Role API', () => {
    it('should fetch roles', async () => {
      const response = await roleApi.getRoles();
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('should create a new role', async () => {
      const roleData = {
        name: 'Test Role',
        permissions: ['read', 'write'],
      };
      const response = await roleApi.createRole(roleData);
      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('id');
    });
  });

  describe('Audit Log API', () => {
    it('should fetch audit logs', async () => {
      const response = await auditLogApi.getAuditLogs();
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('logs');
      expect(response.data).toHaveProperty('pagination');
    });

    it('should fetch user-specific audit logs', async () => {
      const userId = 'test-user-id';
      const response = await auditLogApi.getUserAuditLogs(userId);
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('logs');
    });
  });
});
