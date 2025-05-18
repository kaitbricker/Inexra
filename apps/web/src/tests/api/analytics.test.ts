import request from 'supertest';
import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { getSession } from 'next-auth/react';
import { prisma } from '@/lib/prisma';
import { cacheManager } from '@/lib/cache';

// Mock next-auth
jest.mock('next-auth/react', () => ({
  getSession: jest.fn(),
}));

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    template: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    message: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    session: {
      findMany: jest.fn(),
    },
  },
}));

// Mock Redis cache
jest.mock('@/lib/cache', () => ({
  cacheManager: {
    get: jest.fn(),
    set: jest.fn(),
  },
}));

describe('Analytics API Endpoints', () => {
  let server: any;
  let app: any;

  beforeAll(async () => {
    app = next({ dev: true });
    await app.prepare();
    server = createServer((req, res) => {
      const parsedUrl = parse(req.url!, true);
      app.getRequestHandler()(req, res, parsedUrl);
    });
  });

  afterAll(async () => {
    await new Promise(resolve => server.close(resolve));
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (getSession as jest.Mock).mockResolvedValue({
      user: { id: '1', role: 'admin' },
    });
  });

  describe('GET /api/analytics/users', () => {
    const mockUserData = {
      totalUsers: 100,
      activeUsers: 50,
      newUsers: 10,
      userActivity: [
        { date: '2024-01-01', count: 20 },
        { date: '2024-01-02', count: 30 },
      ],
      messageStats: {
        total: 500,
        average: 5,
      },
      responseTimeStats: {
        average: 2.5,
        p95: 4.0,
      },
    };

    beforeEach(() => {
      (prisma.user.count as jest.Mock).mockResolvedValue(100);
      (prisma.user.findMany as jest.Mock).mockResolvedValue([
        { id: '1', lastActive: new Date() },
        { id: '2', lastActive: new Date() },
      ]);
      (prisma.message.count as jest.Mock).mockResolvedValue(500);
      (prisma.message.findMany as jest.Mock).mockResolvedValue([
        { id: '1', responseTime: 2 },
        { id: '2', responseTime: 3 },
      ]);
    });

    it('returns user analytics data', async () => {
      const response = await request(server).get('/api/analytics/users').query({
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        role: 'user',
      });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        totalUsers: expect.any(Number),
        activeUsers: expect.any(Number),
        newUsers: expect.any(Number),
        userActivity: expect.any(Array),
        messageStats: expect.any(Object),
        responseTimeStats: expect.any(Object),
      });
    });

    it('handles unauthorized access', async () => {
      (getSession as jest.Mock).mockResolvedValue(null);

      const response = await request(server).get('/api/analytics/users');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Unauthorized');
    });

    it('validates query parameters', async () => {
      const response = await request(server).get('/api/analytics/users').query({
        startDate: 'invalid-date',
        endDate: '2024-01-31',
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('uses cache when available', async () => {
      (cacheManager.get as jest.Mock).mockResolvedValue(mockUserData);

      const response = await request(server).get('/api/analytics/users');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUserData);
      expect(prisma.user.count).not.toHaveBeenCalled();
    });
  });

  describe('GET /api/analytics/templates', () => {
    const mockTemplateData = {
      totalTemplates: 50,
      activeTemplates: 30,
      templateUsage: [
        { date: '2024-01-01', count: 10 },
        { date: '2024-01-02', count: 15 },
      ],
      responseRates: {
        average: 0.85,
        byTemplate: [
          { templateId: '1', rate: 0.9 },
          { templateId: '2', rate: 0.8 },
        ],
      },
      conversionRates: {
        average: 0.3,
        byTemplate: [
          { templateId: '1', rate: 0.35 },
          { templateId: '2', rate: 0.25 },
        ],
      },
    };

    beforeEach(() => {
      (prisma.template.count as jest.Mock).mockResolvedValue(50);
      (prisma.template.findMany as jest.Mock).mockResolvedValue([
        { id: '1', status: 'active' },
        { id: '2', status: 'active' },
      ]);
    });

    it('returns template analytics data', async () => {
      const response = await request(server).get('/api/analytics/templates').query({
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        category: 'sales',
      });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        totalTemplates: expect.any(Number),
        activeTemplates: expect.any(Number),
        templateUsage: expect.any(Array),
        responseRates: expect.any(Object),
        conversionRates: expect.any(Object),
      });
    });

    it('handles unauthorized access', async () => {
      (getSession as jest.Mock).mockResolvedValue(null);

      const response = await request(server).get('/api/analytics/templates');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Unauthorized');
    });

    it('validates query parameters', async () => {
      const response = await request(server).get('/api/analytics/templates').query({
        category: 'invalid-category',
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('uses cache when available', async () => {
      (cacheManager.get as jest.Mock).mockResolvedValue(mockTemplateData);

      const response = await request(server).get('/api/analytics/templates');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockTemplateData);
      expect(prisma.template.count).not.toHaveBeenCalled();
    });
  });

  describe('GET /api/analytics/activity', () => {
    const mockActivityData = {
      onlineUsers: 25,
      recentLogins: [
        { userId: '1', timestamp: new Date().toISOString() },
        { userId: '2', timestamp: new Date().toISOString() },
      ],
      activeSessions: [
        { sessionId: '1', userId: '1', lastActive: new Date().toISOString() },
        { sessionId: '2', userId: '2', lastActive: new Date().toISOString() },
      ],
    };

    beforeEach(() => {
      (prisma.session.findMany as jest.Mock).mockResolvedValue([
        { id: '1', userId: '1', lastActive: new Date() },
        { id: '2', userId: '2', lastActive: new Date() },
      ]);
    });

    it('returns real-time activity data', async () => {
      const response = await request(server).get('/api/analytics/activity').query({
        role: 'user',
      });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        onlineUsers: expect.any(Number),
        recentLogins: expect.any(Array),
        activeSessions: expect.any(Array),
      });
    });

    it('handles unauthorized access', async () => {
      (getSession as jest.Mock).mockResolvedValue(null);

      const response = await request(server).get('/api/analytics/activity');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Unauthorized');
    });

    it('validates query parameters', async () => {
      const response = await request(server).get('/api/analytics/activity').query({
        role: 'invalid-role',
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('uses cache when available', async () => {
      (cacheManager.get as jest.Mock).mockResolvedValue(mockActivityData);

      const response = await request(server).get('/api/analytics/activity');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockActivityData);
      expect(prisma.session.findMany).not.toHaveBeenCalled();
    });
  });
});
