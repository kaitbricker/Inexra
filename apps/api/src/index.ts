import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { createServer } from 'http';
import { Server } from 'socket.io';
import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';
import { WebSocketService } from './services/websocket';
import { MessageIngestionService } from './services/messageIngestion';

// Routes
import authRoutes from './routes/auth';
import messageRoutes from './routes/messages';
import conversationRoutes from './routes/conversations';
import socialAccountRoutes from './routes/socialAccounts';
import userRoutes from './routes/users';
import analysisRoutes from './routes/analysis';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Initialize Prisma
export const prisma = new PrismaClient();

// Initialize WebSocket service with CORS configuration
const websocketService = new WebSocketService(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'https://inexra.vercel.app',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Initialize MessageIngestion service with WebSocket
const messageIngestionService = new MessageIngestionService(prisma, websocketService);

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'https://inexra.vercel.app',
  credentials: true
}));
app.use(express.json());
app.use(passport.initialize());

// Configure JWT strategy
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key',
    },
    async (payload, done) => {
      try {
        const user = await prisma.user.findUnique({
          where: { id: payload.id },
        });
        if (user) {
          return done(null, user);
        }
        return done(null, false);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

// Request logging
if (process.env.ENABLE_REQUEST_LOGGING === 'true') {
  app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`);
    next();
  });
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', environment: process.env.NODE_ENV });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/social-accounts', socialAccountRoutes);
app.use('/api/users', userRoutes);
app.use('/api/analysis', analysisRoutes);

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
}); 