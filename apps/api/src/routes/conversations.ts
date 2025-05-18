import { Router } from 'express';
import { prisma } from '../index';
import { AppError } from '../middleware/errorHandler';
import passport from 'passport';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { WebSocketService } from '../services/websocket';

const router = Router();
const authenticate = passport.authenticate('jwt', { session: false });

// Conversation validation schemas
const conversationSchema = z.object({
  title: z.string().min(1).max(100),
  status: z.enum(['active', 'closed', 'archived']).default('active'),
  priority: z.enum(['high', 'normal', 'low']).default('normal'),
});

const messageSchema = z.object({
  content: z.string().min(1).max(1000),
  templateId: z.string().optional(),
});

// Get all conversations for a user
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const userId = req.user.id;
    
    const conversations = await prisma.conversation.findMany({
      where: {
        userId,
        status: status as any,
      },
      include: {
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
        leadScore: true,
      },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      orderBy: {
        lastMessageAt: 'desc',
      },
    });

    res.json(conversations);
  } catch (error) {
    next(error);
  }
});

// Get a single conversation
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const conversation = await prisma.conversation.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc',
          },
        },
        leadScore: true,
      },
    });

    if (!conversation) {
      throw new AppError(404, 'Conversation not found', 'NOT_FOUND');
    }

    res.json(conversation);
  } catch (error) {
    next(error);
  }
});

// Update conversation status
router.patch('/:id/status', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    const conversation = await prisma.conversation.update({
      where: {
        id,
        userId,
      },
      data: { status },
    });

    res.json(conversation);
  } catch (error) {
    next(error);
  }
});

// Archive a conversation
router.post('/:id/archive', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const conversation = await prisma.conversation.update({
      where: {
        id,
        userId,
      },
      data: {
        status: 'ARCHIVED',
      },
    });

    res.json(conversation);
  } catch (error) {
    next(error);
  }
});

// Create new conversation
router.post(
  '/',
  authenticate,
  validateRequest({ body: conversationSchema }),
  async (req, res) => {
    try {
      const conversation = await prisma.conversation.create({
        data: {
          ...req.body,
          userId: req.user.id,
        },
      });

      // Notify other users about the new conversation
      WebSocketService.broadcast('conversation:new', conversation);

      res.status(201).json(conversation);
    } catch (error) {
      console.error('Error creating conversation:', error);
      res.status(500).json({ error: 'Failed to create conversation' });
    }
  }
);

// Add message to conversation
router.post(
  '/:id/messages',
  authenticate,
  validateRequest({ body: messageSchema }),
  async (req, res) => {
    try {
      const conversation = await prisma.conversation.findUnique({
        where: { id: req.params.id },
      });

      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found' });
      }

      if (conversation.userId !== req.user.id) {
        return res.status(403).json({ error: 'Not authorized' });
      }

      // Create the message
      const message = await prisma.message.create({
        data: {
          content: req.body.content,
          userId: req.user.id,
          conversationId: conversation.id,
          // If this is a template message, store the template ID
          ...(req.body.templateId && {
            templateId: req.body.templateId,
          }),
        },
      });

      // Update conversation's updatedAt timestamp
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: { updatedAt: new Date() },
      });

      // Notify other users about the new message
      WebSocketService.broadcast('message:new', message);

      res.status(201).json(message);
    } catch (error) {
      console.error('Error creating message:', error);
      res.status(500).json({ error: 'Failed to create message' });
    }
  }
);

// Update conversation
router.put(
  '/:id',
  authenticate,
  validateRequest({ body: conversationSchema.partial() }),
  async (req, res) => {
    try {
      const conversation = await prisma.conversation.findUnique({
        where: { id: req.params.id },
      });

      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found' });
      }

      if (conversation.userId !== req.user.id) {
        return res.status(403).json({ error: 'Not authorized' });
      }

      const updatedConversation = await prisma.conversation.update({
        where: { id: req.params.id },
        data: req.body,
      });

      // Notify other users about the conversation update
      WebSocketService.broadcast('conversation:update', updatedConversation);

      res.json(updatedConversation);
    } catch (error) {
      console.error('Error updating conversation:', error);
      res.status(500).json({ error: 'Failed to update conversation' });
    }
  }
);

// Delete conversation
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: req.params.id },
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    if (conversation.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await prisma.conversation.delete({
      where: { id: req.params.id },
    });

    // Notify other users about the conversation deletion
    WebSocketService.broadcast('conversation:deleted', req.params.id);

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting conversation:', error);
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
});

export default router; 