import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { rateLimit } from '@/middleware/rateLimit';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { Server } from 'socket.io';

// Validation schema for query parameters
const querySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  role: z.enum(['admin', 'user', 'guest']).optional(),
});

// Initialize Socket.IO server
let io: Server;

// Store active connections
const activeConnections = new Map<string, Set<string>>();

// Initialize WebSocket server
const initWebSocket = (res: NextApiResponse) => {
  if (!io) {
    io = new Server(res.socket.server);
    
    io.on('connection', (socket) => {
      const userId = socket.handshake.auth.userId;
      if (!userId) {
        socket.disconnect();
        return;
      }

      // Add user to active connections
      if (!activeConnections.has(userId)) {
        activeConnections.set(userId, new Set());
      }
      activeConnections.get(userId)?.add(socket.id);

      // Handle disconnection
      socket.on('disconnect', () => {
        activeConnections.get(userId)?.delete(socket.id);
        if (activeConnections.get(userId)?.size === 0) {
          activeConnections.delete(userId);
        }
      });
    });
  }
  return io;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Apply rate limiting
    await new Promise((resolve) => rateLimit(req, res, resolve));

    // Validate session and permissions
    const session = await getSession({ req });
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Parse and validate query parameters
    const query = querySchema.parse(req.query);
    const startDate = query.startDate ? new Date(query.startDate) : new Date(Date.now() - 24 * 60 * 60 * 1000); // Default to last 24 hours
    const endDate = query.endDate ? new Date(query.endDate) : new Date();

    // Build filter conditions
    const where = {
      ...(query.role && { role: query.role }),
      lastActiveAt: {
        gte: startDate,
        lte: endDate,
      },
    };

    // Fetch real-time activity data
    const [
      onlineUsers,
      recentLogins,
      activeSessions,
    ] = await Promise.all([
      // Online users (users with active WebSocket connections)
      prisma.user.findMany({
        where: {
          id: {
            in: Array.from(activeConnections.keys()),
          },
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          lastActiveAt: true,
        },
      }),
      // Recent logins
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          lastLoginAt: true,
        },
        orderBy: {
          lastLoginAt: 'desc',
        },
        take: 10,
      }),
      // Active sessions
      prisma.session.findMany({
        where,
        select: {
          id: true,
          userId: true,
          user: {
            select: {
              name: true,
              email: true,
              role: true,
            },
          },
          startedAt: true,
          lastActiveAt: true,
        },
        orderBy: {
          lastActiveAt: 'desc',
        },
      }),
    ]);

    // Initialize WebSocket server if not already initialized
    const socketServer = initWebSocket(res);

    // Emit real-time updates to connected clients
    socketServer.emit('activity-update', {
      onlineUsers: onlineUsers.length,
      recentLogins,
      activeSessions: activeSessions.length,
    });

    return res.status(200).json({
      metrics: {
        onlineUsers: {
          value: onlineUsers.length,
          users: onlineUsers,
        },
        recentLogins: {
          value: recentLogins.length,
          logins: recentLogins,
        },
        activeSessions: {
          value: activeSessions.length,
          sessions: activeSessions,
        },
      },
    });
  } catch (error) {
    console.error('Analytics error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid query parameters', details: error.errors });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Configure Next.js to handle WebSocket connections
export const config = {
  api: {
    bodyParser: false,
  },
}; 