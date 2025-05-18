import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { logger } from '../utils/logger';
import { Message, Conversation, SocialAccount } from '@prisma/client';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

export class WebSocketService {
  private io: Server;
  private connectedClients: Map<string, Set<string>> = new Map();

  constructor(httpServer: HttpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.io.use((socket: AuthenticatedSocket, next) => {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      // Verify token and set userId
      // This should use your JWT verification logic
      try {
        const decoded = verifyToken(token);
        socket.userId = decoded.id;
        next();
      } catch (error) {
        next(new Error('Authentication error'));
      }
    });

    this.io.on('connection', (socket: AuthenticatedSocket) => {
      if (!socket.userId) return;

      logger.info(`Client connected: ${socket.userId}`);
      this.handleConnection(socket);

      socket.on('disconnect', () => {
        this.handleDisconnect(socket);
      });

      socket.on('error', (error) => {
        logger.error(`Socket error: ${error.message}`);
      });
    });
  }

  private handleConnection(socket: AuthenticatedSocket) {
    if (!socket.userId) return;

    // Add socket to user's connected clients
    if (!this.connectedClients.has(socket.userId)) {
      this.connectedClients.set(socket.userId, new Set());
    }
    this.connectedClients.get(socket.userId)?.add(socket.id);

    // Join user-specific room
    socket.join(`user:${socket.userId}`);
  }

  private handleDisconnect(socket: AuthenticatedSocket) {
    if (!socket.userId) return;

    // Remove socket from user's connected clients
    const userSockets = this.connectedClients.get(socket.userId);
    if (userSockets) {
      userSockets.delete(socket.id);
      if (userSockets.size === 0) {
        this.connectedClients.delete(socket.userId);
      }
    }

    logger.info(`Client disconnected: ${socket.userId}`);
  }

  // Event emitters
  public emitNewMessage(userId: string, message: Message) {
    this.io.to(`user:${userId}`).emit('message:new', {
      id: message.id,
      content: message.content,
      sentimentScore: message.sentimentScore,
      leadScore: message.leadScore,
      keywords: message.keywords,
      createdAt: message.createdAt,
    });
  }

  public emitMessageUpdate(userId: string, message: Message) {
    this.io.to(`user:${userId}`).emit('message:update', {
      id: message.id,
      sentimentScore: message.sentimentScore,
      leadScore: message.leadScore,
      keywords: message.keywords,
      updatedAt: message.updatedAt,
    });
  }

  public emitConversationUpdate(userId: string, conversation: Conversation) {
    this.io.to(`user:${userId}`).emit('conversation:update', {
      id: conversation.id,
      status: conversation.status,
      sentimentSummary: conversation.sentimentSummary,
      engagementScore: conversation.engagementScore,
      leadScore: conversation.leadScore,
      priority: conversation.priority,
      updatedAt: conversation.updatedAt,
    });
  }

  public emitAccountUpdate(userId: string, account: SocialAccount) {
    this.io.to(`user:${userId}`).emit('account:update', {
      id: account.id,
      platform: account.platform,
      status: account.status,
      lastSyncAt: account.lastSyncAt,
    });
  }

  public emitError(userId: string, error: Error) {
    this.io.to(`user:${userId}`).emit('error', {
      message: error.message,
      code: error.name,
      timestamp: new Date(),
    });
  }
}

// Helper function to verify JWT token
function verifyToken(token: string): { id: string } {
  // Implement your JWT verification logic here
  // This should match your authentication strategy
  throw new Error('Not implemented');
} 