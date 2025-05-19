interface PlatformConfig {
  isConfigured: boolean;
  appId?: string;
  appSecret?: string;
  redirectUri?: string;
  scope?: string;
  responseType?: string;
  authUrl?: string;
  tokenUrl?: string;
  graphUrl?: string;
}

export const platformConfigs: Record<string, PlatformConfig> = {
  instagram: {
    isConfigured: Boolean(process.env.INSTAGRAM_APP_ID && process.env.INSTAGRAM_APP_SECRET),
    appId: process.env.INSTAGRAM_APP_ID,
    appSecret: process.env.INSTAGRAM_APP_SECRET,
    redirectUri: process.env.INSTAGRAM_REDIRECT_URI,
    scope: 'user_profile,user_media',
    responseType: 'code',
    authUrl: 'https://api.instagram.com/oauth/authorize',
    tokenUrl: 'https://api.instagram.com/oauth/access_token',
    graphUrl: 'https://graph.instagram.com',
  },
  linkedin: {
    isConfigured: Boolean(process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET),
    appId: process.env.LINKEDIN_CLIENT_ID,
    appSecret: process.env.LINKEDIN_CLIENT_SECRET,
    redirectUri: process.env.LINKEDIN_REDIRECT_URI,
    scope: 'r_liteprofile,r_emailaddress',
    responseType: 'code',
    authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
    tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
    graphUrl: 'https://api.linkedin.com/v2',
  },
  twitter: {
    isConfigured: Boolean(process.env.TWITTER_API_KEY && process.env.TWITTER_API_SECRET),
    appId: process.env.TWITTER_API_KEY,
    appSecret: process.env.TWITTER_API_SECRET,
    redirectUri: process.env.TWITTER_REDIRECT_URI,
    scope: 'tweet.read,users.read',
    responseType: 'code',
    authUrl: 'https://twitter.com/i/oauth2/authorize',
    tokenUrl: 'https://api.twitter.com/2/oauth2/token',
    graphUrl: 'https://api.twitter.com/2',
  },
}; 