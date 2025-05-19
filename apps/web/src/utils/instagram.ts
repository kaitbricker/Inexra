import crypto from 'crypto';

export function verifyInstagramSignature(
  rawBody: string,
  signature: string,
  appSecret: string
): boolean {
  try {
    const hmac = crypto.createHmac('sha1', appSecret);
    const calculatedSignature = `sha1=${hmac.update(rawBody).digest('hex')}`;
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(calculatedSignature));
  } catch (error) {
    console.error('Error verifying Instagram signature:', error);
    return false;
  }
}

export function generateInstagramWebhookVerifyToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function validateInstagramWebhookPayload(payload: any): boolean {
  if (!payload || typeof payload !== 'object') return false;
  if (payload.object !== 'instagram') return false;
  if (!Array.isArray(payload.entry)) return false;

  for (const entry of payload.entry) {
    if (!entry.changes || !Array.isArray(entry.changes)) return false;
    for (const change of entry.changes) {
      if (typeof change.field !== 'string') return false;
      if (change.field === 'messages' && !change.value) return false;
    }
  }

  return true;
}
