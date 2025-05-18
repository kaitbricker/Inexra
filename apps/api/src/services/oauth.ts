import { Platform, SocialAccount } from '@prisma/client';
import { PrismaClient } from '@prisma/client';
import { getPlatformConfig } from '../config/socialMedia';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { rateLimiter } from '../utils/rateLimiter';

export class OAuthService {
  constructor(private prisma: PrismaClient) {}

  async getAuthUrl(platform: Platform): Promise<string> {
    const config = getPlatformConfig(platform);
    
    switch (platform) {
      case Platform.INSTAGRAM:
        return this.getInstagramAuthUrl(config);
      case Platform.LINKEDIN:
        return this.getLinkedInAuthUrl(config);
      case Platform.TWITTER:
        return this.getTwitterAuthUrl(config);
      default:
        throw new AppError(400, 'Unsupported platform', 'INVALID_PLATFORM');
    }
  }

  private getInstagramAuthUrl(config: any): string {
    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      scope: config.scope.join(','),
      response_type: 'code',
    });
    return `https://api.instagram.com/oauth/authorize?${params.toString()}`;
  }

  private getLinkedInAuthUrl(config: any): string {
    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      scope: config.scope.join(' '),
      response_type: 'code',
    });
    return `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
  }

  private getTwitterAuthUrl(config: any): string {
    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      scope: config.scope.join(' '),
      response_type: 'code',
    });
    return `https://twitter.com/i/oauth2/authorize?${params.toString()}`;
  }

  async handleCallback(
    platform: Platform,
    code: string,
    userId: string
  ): Promise<SocialAccount> {
    const config = getPlatformConfig(platform);
    
    try {
      const tokens = await rateLimiter.withRetry(platform, async () => {
        switch (platform) {
          case Platform.INSTAGRAM:
            return this.handleInstagramCallback(code, config);
          case Platform.LINKEDIN:
            return this.handleLinkedInCallback(code, config);
          case Platform.TWITTER:
            return this.handleTwitterCallback(code, config);
          default:
            throw new AppError(400, 'Unsupported platform', 'INVALID_PLATFORM');
        }
      });

      // Get user profile data
      const profile = await rateLimiter.withRetry(platform, async () => {
        switch (platform) {
          case Platform.INSTAGRAM:
            return this.getInstagramProfile(tokens.accessToken);
          case Platform.LINKEDIN:
            return this.getLinkedInProfile(tokens.accessToken);
          case Platform.TWITTER:
            return this.getTwitterProfile(tokens.accessToken);
          default:
            throw new AppError(400, 'Unsupported platform', 'INVALID_PLATFORM');
        }
      });

      // Store or update social account
      return await this.prisma.socialAccount.upsert({
        where: {
          platform_platformUserId: {
            platform,
            platformUserId: profile.id,
          },
        },
        create: {
          userId,
          platform,
          platformUserId: profile.id,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          tokenExpiresAt: new Date(Date.now() + tokens.expiresIn * 1000),
          metadata: {
            username: profile.username,
            displayName: profile.displayName,
            profilePicture: profile.profilePicture,
          },
        },
        update: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          tokenExpiresAt: new Date(Date.now() + tokens.expiresIn * 1000),
          metadata: {
            username: profile.username,
            displayName: profile.displayName,
            profilePicture: profile.profilePicture,
          },
        },
      });
    } catch (error) {
      logger.error(`Error handling ${platform} OAuth callback:`, error);
      throw new AppError(500, `Failed to handle ${platform} OAuth callback`, 'OAUTH_ERROR');
    }
  }

  private async handleInstagramCallback(code: string, config: any) {
    const response = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        grant_type: 'authorization_code',
        redirect_uri: config.redirectUri,
        code,
      }),
    });

    if (!response.ok) {
      throw new Error(`Instagram OAuth error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      accessToken: data.access_token,
      refreshToken: null, // Instagram doesn't provide refresh tokens
      expiresIn: 3600, // 1 hour
    };
  }

  private async handleLinkedInCallback(code: string, config: any) {
    const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        grant_type: 'authorization_code',
        redirect_uri: config.redirectUri,
        code,
      }),
    });

    if (!response.ok) {
      throw new Error(`LinkedIn OAuth error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
    };
  }

  private async handleTwitterCallback(code: string, config: any) {
    const response = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(
          `${config.clientId}:${config.clientSecret}`
        ).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        redirect_uri: config.redirectUri,
        code,
        code_verifier: 'challenge', // In production, use PKCE
      }),
    });

    if (!response.ok) {
      throw new Error(`Twitter OAuth error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
    };
  }

  private async getInstagramProfile(accessToken: string) {
    const response = await fetch('https://graph.instagram.com/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Instagram profile: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      id: data.id,
      username: data.username,
      displayName: data.username,
      profilePicture: null,
    };
  }

  private async getLinkedInProfile(accessToken: string) {
    const response = await fetch('https://api.linkedin.com/v2/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch LinkedIn profile: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      id: data.id,
      username: data.localizedFirstName + data.localizedLastName,
      displayName: data.localizedFirstName + ' ' + data.localizedLastName,
      profilePicture: null,
    };
  }

  private async getTwitterProfile(accessToken: string) {
    const response = await fetch('https://api.twitter.com/2/users/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Twitter profile: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      id: data.data.id,
      username: data.data.username,
      displayName: data.data.name,
      profilePicture: data.data.profile_image_url,
    };
  }
} 