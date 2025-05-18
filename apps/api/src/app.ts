import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { errorHandler } from './middleware/error';
import authRoutes from './routes/auth';
import messageRoutes from './routes/messages';
import conversationRoutes from './routes/conversations';
import templateRoutes from './routes/templates';
import { WebSocketService } from './services/websocket';
import rateLimit from 'express-rate-limit';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from './middleware/rbac';
import { auditLog } from './middleware/audit';
import userRoutes from './routes/users';
import roleRoutes from './routes/roles';
import auditLogRoutes from './routes/audit-logs';

const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/users', verifyToken, auditLog, userRoutes);
app.use('/api/roles', verifyToken, auditLog, roleRoutes);
app.use('/api/audit-logs', verifyToken, auditLog, auditLogRoutes);

// Error handling
app.use(errorHandler);

// Initialize WebSocket service
WebSocketService.initialize(app);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

export { app, prisma }; 