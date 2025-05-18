import { authenticator } from 'otplib';
import { securityConfig } from '../config/security';
import { prisma } from '../lib/prisma';
import QRCode from 'qrcode';

export class MFAError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MFAError';
  }
}

export interface MFASetupResult {
  secret: string;
  qrCode: string;
}

export async function setupMFA(userId: string): Promise<MFASetupResult> {
  const { mfa } = securityConfig;

  // Generate a new secret
  const secret = authenticator.generateSecret();

  // Create the OTP auth URL
  const otpauth = authenticator.keyuri(userId, mfa.issuer, secret);

  // Generate QR code
  const qrCode = await QRCode.toDataURL(otpauth);

  // Store the secret in the database (encrypted)
  await prisma.user.update({
    where: { id: userId },
    data: {
      mfaSecret: secret,
      mfaEnabled: false, // Will be enabled after verification
    },
  });

  return {
    secret,
    qrCode,
  };
}

export async function verifyMFASetup(userId: string, token: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { mfaSecret: true },
  });

  if (!user?.mfaSecret) {
    throw new MFAError('MFA not set up for this user');
  }

  const isValid = authenticator.verify({
    token,
    secret: user.mfaSecret,
  });

  if (isValid) {
    await prisma.user.update({
      where: { id: userId },
      data: { mfaEnabled: true },
    });
  }

  return isValid;
}

export async function verifyMFAToken(userId: string, token: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { mfaSecret: true, mfaEnabled: true },
  });

  if (!user?.mfaEnabled) {
    throw new MFAError('MFA not enabled for this user');
  }

  if (!user?.mfaSecret) {
    throw new MFAError('MFA secret not found');
  }

  return authenticator.verify({
    token,
    secret: user.mfaSecret,
  });
}

export async function disableMFA(userId: string, token: string): Promise<boolean> {
  const isValid = await verifyMFAToken(userId, token);

  if (isValid) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        mfaEnabled: false,
        mfaSecret: null,
      },
    });
  }

  return isValid;
}

export async function isMFAEnabled(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { mfaEnabled: true },
  });

  return user?.mfaEnabled ?? false;
}
