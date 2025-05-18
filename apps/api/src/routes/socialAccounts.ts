import { Router } from 'express';
import { prisma } from '../index';
import { SocialMediaService } from '../services/socialMedia';
import { AppError } from '../middleware/errorHandler';
import passport from 'passport';
import { Platform } from '@inexra/shared';

const router = Router();
const socialMediaService = new SocialMediaService(prisma);
const authenticate = passport.authenticate('jwt', { session: false });

// Connect a social media account
router.post('/connect', authenticate, async (req, res, next) => {
  try {
    const { platform, accessToken, refreshToken, platformUserId, metadata } = req.body;
    const userId = req.user.id;

    const account = await socialMediaService.connectAccount(
      userId,
      platform as Platform,
      accessToken,
      refreshToken,
      platformUserId,
      metadata
    );

    res.status(201).json(account);
  } catch (error) {
    next(error);
  }
});

// Get all connected accounts for a user
router.get('/', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;

    const accounts = await prisma.socialAccount.findMany({
      where: { userId },
      select: {
        id: true,
        platform: true,
        platformUserId: true,
        metadata: true,
        tokenExpiresAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json(accounts);
  } catch (error) {
    next(error);
  }
});

// Refresh token for a social media account
router.post('/:id/refresh', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify account belongs to user
    const account = await prisma.socialAccount.findFirst({
      where: { id, userId },
    });

    if (!account) {
      throw new AppError(404, 'Social media account not found', 'NOT_FOUND');
    }

    const updatedAccount = await socialMediaService.refreshToken(id);
    res.json(updatedAccount);
  } catch (error) {
    next(error);
  }
});

// Disconnect a social media account
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify account belongs to user
    const account = await prisma.socialAccount.findFirst({
      where: { id, userId },
    });

    if (!account) {
      throw new AppError(404, 'Social media account not found', 'NOT_FOUND');
    }

    await prisma.socialAccount.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Fetch messages from a social media account
router.get('/:id/messages', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { limit = 50 } = req.query;
    const userId = req.user.id;

    // Verify account belongs to user
    const account = await prisma.socialAccount.findFirst({
      where: { id, userId },
    });

    if (!account) {
      throw new AppError(404, 'Social media account not found', 'NOT_FOUND');
    }

    const messages = await socialMediaService.fetchMessages(id, Number(limit));
    res.json(messages);
  } catch (error) {
    next(error);
  }
});

export default router; 