import { Router } from 'express';
import { prisma } from '../index';
import { OAuthService } from '../services/oauth';
import { Platform } from '@prisma/client';
import passport from 'passport';
import { AppError } from '../middleware/errorHandler';

const router = Router();
const oauthService = new OAuthService(prisma);
const authenticate = passport.authenticate('jwt', { session: false });

// Get OAuth URL for a platform
router.get('/:platform/url', authenticate, async (req, res, next) => {
  try {
    const { platform } = req.params;
    const authUrl = await oauthService.getAuthUrl(platform as Platform);
    res.json({ authUrl });
  } catch (error) {
    next(error);
  }
});

// Handle OAuth callback
router.get('/:platform/callback', async (req, res, next) => {
  try {
    const { platform } = req.params;
    const { code, state } = req.query;

    if (!code) {
      throw new AppError(400, 'Authorization code is required', 'MISSING_CODE');
    }

    // In production, validate the state parameter to prevent CSRF
    if (!state) {
      throw new AppError(400, 'State parameter is required', 'MISSING_STATE');
    }

    // Get user ID from state (in production, use a secure way to store/retrieve this)
    const userId = state.toString();

    const account = await oauthService.handleCallback(
      platform as Platform,
      code.toString(),
      userId
    );

    // Redirect to frontend with success message
    res.redirect(`${process.env.FRONTEND_URL}/social-accounts?success=true`);
  } catch (error) {
    // Redirect to frontend with error message
    res.redirect(
      `${process.env.FRONTEND_URL}/social-accounts?error=${encodeURIComponent(
        error.message
      )}`
    );
  }
});

// Refresh OAuth token
router.post('/:platform/refresh', authenticate, async (req, res, next) => {
  try {
    const { platform } = req.params;
    const { accountId } = req.body;
    const userId = req.user.id;

    // Verify account belongs to user
    const account = await prisma.socialAccount.findFirst({
      where: { id: accountId, userId },
    });

    if (!account) {
      throw new AppError(404, 'Social media account not found', 'NOT_FOUND');
    }

    const updatedAccount = await oauthService.refreshToken(accountId);
    res.json(updatedAccount);
  } catch (error) {
    next(error);
  }
});

export default router; 