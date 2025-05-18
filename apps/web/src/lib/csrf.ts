import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { randomBytes } from 'crypto';

const CSRF_TOKEN_COOKIE = 'csrf_token';
const CSRF_TOKEN_HEADER = 'X-CSRF-Token';

export async function csrf(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });
  if (!session) {
    throw new Error('No session found');
  }

  // Get token from cookie
  const token = req.cookies[CSRF_TOKEN_COOKIE];
  const headerToken = req.headers[CSRF_TOKEN_HEADER.toLowerCase()];

  // Validate token
  if (!token || !headerToken || token !== headerToken) {
    throw new Error('Invalid CSRF token');
  }

  // Generate new token for next request
  const newToken = randomBytes(32).toString('hex');
  res.setHeader('Set-Cookie', `${CSRF_TOKEN_COOKIE}=${newToken}; Path=/; HttpOnly; Secure; SameSite=Strict`);
  res.setHeader(CSRF_TOKEN_HEADER, newToken);
}

export function generateCSRFToken(res: NextApiResponse) {
  const token = randomBytes(32).toString('hex');
  res.setHeader('Set-Cookie', `${CSRF_TOKEN_COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict`);
  res.setHeader(CSRF_TOKEN_HEADER, token);
  return token;
} 