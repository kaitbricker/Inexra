import { Platform } from '../types/enums';

export interface SocialMediaConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scope: string[];
  apiBaseUrl: string;
  rateLimit: {
    requestsPerMinute: number;
    retryAttempts: number;
    retryDelay: number;
  };
}

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

export const socialMediaConfig: Record<Platform, SocialMediaConfig> = {
  [Platform.INSTAGRAM]: {
    clientId: process.env.INSTAGRAM_CLIENT_ID || 'dummy-client-id',
    clientSecret: process.env.INSTAGRAM_CLIENT_SECRET || 'dummy-client-secret',
    redirectUri: `${API_BASE_URL}/auth/instagram/callback`,
    scope: ['basic', 'comments', 'direct_messages'],
    apiBaseUrl: 'https://graph.instagram.com/v12.0',
    rateLimit: {
      requestsPerMinute: 200,
      retryAttempts: 3,
      retryDelay: 1000,
    },
  },
  [Platform.LINKEDIN]: {
    clientId: process.env.LINKEDIN_CLIENT_ID || 'dummy-client-id',
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET || 'dummy-client-secret',
    redirectUri: `${API_BASE_URL}/auth/linkedin/callback`,
    scope: ['r_liteprofile', 'r_emailaddress', 'w_member_social'],
    apiBaseUrl: 'https://api.linkedin.com/v2',
    rateLimit: {
      requestsPerMinute: 100,
      retryAttempts: 3,
      retryDelay: 1000,
    },
  },
  [Platform.TWITTER]: {
    clientId: process.env.TWITTER_CLIENT_ID || 'dummy-client-id',
    clientSecret: process.env.TWITTER_CLIENT_SECRET || 'dummy-client-secret',
    redirectUri: `${API_BASE_URL}/auth/twitter/callback`,
    scope: ['tweet.read', 'users.read', 'dm.read', 'dm.write'],
    apiBaseUrl: 'https://api.twitter.com/2',
    rateLimit: {
      requestsPerMinute: 300,
      retryAttempts: 3,
      retryDelay: 1000,
    },
  },
};

export const getPlatformConfig = (platform: Platform): SocialMediaConfig => {
  const config = socialMediaConfig[platform];
  if (!config) {
    throw new Error(`Unsupported platform: ${platform}`);
  }
  return config;
}; 