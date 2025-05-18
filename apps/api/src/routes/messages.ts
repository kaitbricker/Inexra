import { Router } from 'express';
import { prisma } from '../index';
import { MessageIngestionService } from '../services/messageIngestion';
import passport from 'passport';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { z } from 'zod';
import { validate } from '../middleware/validation';
import { WebSocketService } from '../services/websocket';

interface JwtPayload {
  id: string;
  role: string;
}

declare global {
  namespace Express {
    interface User extends JwtPayload {}
  }
}

const router = Router();
const messageIngestionService = new MessageIngestionService(prisma);
const authenticateJWT = passport.authenticate('jwt', { session: false });

// Message validation schemas
const messageSchema = z.object({
  content: z.string().min(1).max(1000),
  conversationId: z.string(),
});

const replySchema = z.object({
  content: z.string().min(1).max(1000),
  templateId: z.string().optional(),
});

// Ingest messages from a social media account
router.post('/ingest', authenticateJWT, async (req, res, next) => {
  try {
    const { accountId, limit } = req.body;
    if (!req.user?.id) {
      throw new AppError(401, 'User not authenticated', 'UNAUTHORIZED');
    }
    const userId = req.user.id;

    // Verify account belongs to user
    const account = await prisma.socialAccount.findFirst({
      where: { id: accountId, userId },
    });

    if (!account) {
      throw new AppError(404, 'Social media account not found', 'NOT_FOUND');
    }

    const messages = await messageIngestionService.ingestMessages(accountId, limit);
    res.json(messages);
  } catch (error) {
    next(error);
  }
});

// Get messages for a conversation
router.get('/conversation/:conversationId', authenticateJWT, async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    if (!req.user?.id) {
      throw new AppError(401, 'User not authenticated', 'UNAUTHORIZED');
    }
    const userId = req.user.id;

    // Verify conversation belongs to user
    const conversation = await prisma.conversation.findFirst({
      where: { id: conversationId, userId },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!conversation) {
      throw new AppError(404, 'Conversation not found', 'NOT_FOUND');
    }

    res.json(conversation.messages);
  } catch (error) {
    next(error);
  }
});

// Get messages for a social media account
router.get('/account/:accountId', authenticateJWT, async (req, res, next) => {
  try {
    const { accountId } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    if (!req.user?.id) {
      throw new AppError(401, 'User not authenticated', 'UNAUTHORIZED');
    }
    const userId = req.user.id;

    // Verify account belongs to user
    const account = await prisma.socialAccount.findFirst({
      where: { id: accountId, userId },
    });

    if (!account) {
      throw new AppError(404, 'Social media account not found', 'NOT_FOUND');
    }

    const messages = await prisma.message.findMany({
      where: {
        socialAccountId: accountId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: Number(limit),
      skip: Number(offset),
    });

    res.json(messages);
  } catch (error) {
    next(error);
  }
});

// Get message statistics
router.get('/stats', authenticateJWT, async (req, res, next) => {
  try {
    if (!req.user?.id) {
      throw new AppError(401, 'User not authenticated', 'UNAUTHORIZED');
    }
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    const where = {
      userId,
      ...(startDate && endDate
        ? {
            createdAt: {
              gte: new Date(startDate as string),
              lte: new Date(endDate as string),
            },
          }
        : {}),
    };

    const [totalMessages, platformStats, sentimentStats] = await Promise.all([
      // Total messages
      prisma.message.count({ where }),
      
      // Messages by platform
      prisma.message.groupBy({
        by: ['platform'],
        where,
        _count: true,
      }),
      
      // Messages by sentiment
      prisma.message.groupBy({
        by: ['sentimentScore'],
        where,
        _count: true,
      }),
    ]);

    res.json({
      totalMessages,
      platformStats,
      sentimentStats,
    });
  } catch (error) {
    next(error);
  }
});

// Get all messages
router.get('/', authenticateJWT, async (req, res) => {
  try {
    if (!req.user?.id) {
      throw new AppError(401, 'User not authenticated', 'UNAUTHORIZED');
    }
    const messages = await prisma.message.findMany({
      where: {
        userId: req.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({ messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Create new message
router.post(
  '/',
  authenticateJWT,
  validate(messageSchema),
  async (req, res) => {
    try {
      if (!req.user?.id) {
        throw new AppError(401, 'User not authenticated', 'UNAUTHORIZED');
      }
      const message = await prisma.message.create({
        data: {
          ...req.body,
          userId: req.user.id,
        },
      });

      res.status(201).json(message);
    } catch (error) {
      console.error('Error creating message:', error);
      res.status(500).json({ error: 'Failed to create message' });
    }
  }
);

// Reply to a message
router.post(
  '/:id/reply',
  authenticateJWT,
  validate(replySchema),
  async (req, res) => {
    try {
      const originalMessage = await prisma.message.findUnique({
        where: { id: req.params.id },
        include: { conversation: true },
      });

      if (!originalMessage) {
        return res.status(404).json({ error: 'Message not found' });
      }

      // Create the reply message
      const reply = await prisma.message.create({
        data: {
          content: req.body.content,
          userId: req.user.id,
          conversationId: originalMessage.conversationId,
          // If this is a template reply, store the template ID
          ...(req.body.templateId && {
            templateId: req.body.templateId,
          }),
        },
      });

      // Update conversation's updatedAt timestamp
      await prisma.conversation.update({
        where: { id: originalMessage.conversationId },
        data: { updatedAt: new Date() },
      });

      // Notify other users about the reply
      WebSocketService.broadcast('message:new', reply);

      res.status(201).json(reply);
    } catch (error) {
      console.error('Error creating reply:', error);
      res.status(500).json({ error: 'Failed to create reply' });
    }
  }
);

// Update message
router.put(
  '/:id',
  authenticateJWT,
  validate(messageSchema.partial()),
  async (req, res) => {
    try {
      const message = await prisma.message.findUnique({
        where: { id: req.params.id },
      });

      if (!message) {
        return res.status(404).json({ error: 'Message not found' });
      }

      if (message.userId !== req.user.id) {
        return res.status(403).json({ error: 'Not authorized' });
      }

      const updatedMessage = await prisma.message.update({
        where: { id: req.params.id },
        data: req.body,
      });

      // Notify other users about the message update
      WebSocketService.broadcast('message:update', updatedMessage);

      res.json(updatedMessage);
    } catch (error) {
      console.error('Error updating message:', error);
      res.status(500).json({ error: 'Failed to update message' });
    }
  }
);

// Delete message
router.delete('/:id', authenticateJWT, async (req, res) => {
  try {
    const message = await prisma.message.findUnique({
      where: { id: req.params.id },
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (message.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await prisma.message.delete({
      where: { id: req.params.id },
    });

    // Notify other users about the message deletion
    WebSocketService.broadcast('message:deleted', req.params.id);

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

export default router; 