// import crypto from 'crypto';

const INSTAGRAM_CLIENT_ID = process.env.INSTAGRAM_CLIENT_ID || '';
const INSTAGRAM_CLIENT_SECRET = process.env.INSTAGRAM_CLIENT_SECRET || '';
const INSTAGRAM_REDIRECT_URI = process.env.INSTAGRAM_REDIRECT_URI || '';

if (!INSTAGRAM_CLIENT_ID || !INSTAGRAM_CLIENT_SECRET) {
  throw new Error('Missing Instagram credentials');
}

export const INSTAGRAM_SCOPES = [
  'user_profile',
  'user_media',
  'instagram_basic',
  'instagram_content_publish',
  'pages_show_list',
  'pages_read_engagement',
];

export function getInstagramAuthUrl(redirectUri: string): string {
  const baseUrl = 'https://api.instagram.com/oauth/authorize';
  const params = new URLSearchParams({
    client_id: INSTAGRAM_CLIENT_ID,
    redirect_uri: redirectUri,
    scope: INSTAGRAM_SCOPES.join(','),
    response_type: 'code',
    state: Math.random().toString(36).substring(7),
  } as Record<string, string>);

  return `${baseUrl}?${params.toString()}`;
}

export async function getInstagramAccessToken(code: string, redirectUri: string) {
  const params = new URLSearchParams({
    client_id: INSTAGRAM_CLIENT_ID,
    client_secret: INSTAGRAM_CLIENT_SECRET,
    grant_type: 'authorization_code',
    redirect_uri: redirectUri,
    code,
  } as Record<string, string>);

  const response = await fetch('https://api.instagram.com/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    throw new Error('Failed to get Instagram access token');
  }

  return response.json();
}

export async function getInstagramUserProfile(accessToken: string) {
  const response = await fetch('https://graph.instagram.com/me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to get Instagram user profile');
  }

  return response.json();
}

export function validateInstagramConfig(): string[] {
  const errors: string[] = [];

  if (!INSTAGRAM_CLIENT_ID) {
    errors.push('INSTAGRAM_CLIENT_ID is not set');
  }

  if (!INSTAGRAM_CLIENT_SECRET) {
    errors.push('INSTAGRAM_CLIENT_SECRET is not set');
  }

  if (!INSTAGRAM_REDIRECT_URI) {
    errors.push('INSTAGRAM_REDIRECT_URI is not set');
  }

  return errors;
}

export function getInstagramWebhookUrl(): string {
  return `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/instagram`;
}

export const instagramConfig = {
  appId: process.env.INSTAGRAM_APP_ID,
  appSecret: process.env.INSTAGRAM_APP_SECRET,
  redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/instagram/callback`,
  scope: 'user_profile,user_media',
  responseType: 'code',
  authUrl: 'https://api.instagram.com/oauth/authorize',
  tokenUrl: 'https://api.instagram.com/oauth/access_token',
  graphUrl: 'https://graph.instagram.com',
};
