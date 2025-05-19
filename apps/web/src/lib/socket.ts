import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { redis } from './redis';
import { prisma } from './prisma';
import { trackDbOperation } from './monitoring';
import { Server as NetServer } from 'http';
import { NextApiResponse } from 'next';

interface SocketUser {
  userId: string;
  socketId: string;
  rooms: Set<string>;
}

class SocketService {
  private static instance: SocketService;
  private io: SocketIOServer | null = null;
  private users: Map<string, SocketUser> = new Map();
  private readonly MAX_CONNECTIONS_PER_USER = 3;

  private constructor() {}

  static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  initialize(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL,
        methods: ['GET', 'POST'],
        credentials: true,
      },
      transports: ['websocket', 'polling'],
      pingTimeout: 60000,
      pingInterval: 25000,
      maxHttpBufferSize: 1e8,
    });

    this.setupEventHandlers();
    this.setupRedisAdapter();
  }

  private setupRedisAdapter() {
    const { createAdapter } = require('@socket.io/redis-adapter');
    const pubClient = redis.duplicate();
    const subClient = redis.duplicate();

    Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
      if (this.io) {
        this.io.adapter(createAdapter(pubClient, subClient));
      }
    });
  }

  private setupEventHandlers() {
    if (!this.io) return;

    this.io.on('connection', async socket => {
      const userId = socket.handshake.auth.userId;
      if (!userId) {
        socket.disconnect();
        return;
      }

      // Check connection limit
      const userConnections = Array.from(this.users.values()).filter(
        u => u.userId === userId
      ).length;

      if (userConnections >= this.MAX_CONNECTIONS_PER_USER) {
        socket.emit('error', { message: 'Connection limit exceeded' });
        socket.disconnect();
        return;
      }

      // Store user connection
      const user: SocketUser = {
        userId,
        socketId: socket.id,
        rooms: new Set(),
      };
      this.users.set(socket.id, user);

      // Join user's personal room
      socket.join(`user:${userId}`);

      // Handle message events
      socket.on('message:new', async data => {
        try {
          const message = await prisma.message.create({
            data: {
              ...data,
              timestamp: new Date(),
            },
            include: {
              conversation: true,
            },
          });

          // Broadcast to conversation room
          this.io?.to(`conversation:${message.conversationId}`).emit('message:created', message);

          // Notify other users in the conversation
          const conversation = await prisma.conversation.findUnique({
            where: { id: message.conversationId },
            include: { messages: true },
          });

          if (conversation) {
            const participants = new Set([
              ...conversation.messages.map(m => m.senderId),
              ...conversation.messages.map(m => m.recipientId),
            ]);

            participants.forEach(participantId => {
              if (participantId !== userId) {
                this.io?.to(`user:${participantId}`).emit('notification:new_message', {
                  conversationId: message.conversationId,
                  message,
                });
              }
            });
          }
        } catch (error) {
          console.error('Error handling new message:', error);
          socket.emit('error', { message: 'Failed to send message' });
        }
      });

      // Handle conversation events
      socket.on('conversation:join', conversationId => {
        socket.join(`conversation:${conversationId}`);
        user.rooms.add(`conversation:${conversationId}`);
      });

      socket.on('conversation:leave', conversationId => {
        socket.leave(`conversation:${conversationId}`);
        user.rooms.delete(`conversation:${conversationId}`);
      });

      // Handle lead score updates
      socket.on('lead:update', async data => {
        try {
          const { conversationId, score } = data;
          const conversation = await prisma.conversation.update({
            where: { id: conversationId },
            data: {
              leadScore: score,
              priority: score > 0.7 ? 'high' : score > 0.4 ? 'medium' : 'low',
            },
          });

          this.io?.to(`conversation:${conversationId}`).emit('lead:updated', conversation);

          // Notify high-priority leads
          if (conversation.priority === 'high') {
            this.io?.to(`user:${userId}`).emit('notification:high_priority_lead', {
              conversationId,
              score,
            });
          }
        } catch (error) {
          console.error('Error updating lead score:', error);
          socket.emit('error', { message: 'Failed to update lead score' });
        }
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        this.users.delete(socket.id);
      });
    });
  }

  // Utility methods for emitting events
  emitToUser(userId: string, event: string, data: any) {
    this.io?.to(`user:${userId}`).emit(event, data);
  }

  emitToConversation(conversationId: string, event: string, data: any) {
    this.io?.to(`conversation:${conversationId}`).emit(event, data);
  }

  emitToAll(event: string, data: any) {
    this.io?.emit(event, data);
  }
}

export const socketService = SocketService.getInstance();

export type NextApiResponseWithSocket = NextApiResponse & {
  socket: {
    server: NetServer & {
      io?: SocketIOServer;
    };
  };
};

export const initSocket = (res: NextApiResponseWithSocket) => {
  if (!res.socket.server.io) {
    const io = new SocketIOServer(res.socket.server, {
      path: '/api/socket',
      addTrailingSlash: false,
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL,
        methods: ['GET', 'POST'],
      },
    });

    io.on('connection', socket => {
      console.log('Client connected:', socket.id);

      socket.on('join-conversation', (conversationId: string) => {
        socket.join(`conversation:${conversationId}`);
      });

      socket.on('leave-conversation', (conversationId: string) => {
        socket.leave(`conversation:${conversationId}`);
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });

    res.socket.server.io = io;
  }

  return res.socket.server.io;
};
