import { securityConfig } from '../config/security';

const commonPasswords = new Set([
  'password123',
  '12345678',
  'qwerty123',
  'admin123',
  // Add more common passwords
]);

export class PasswordValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PasswordValidationError';
  }
}

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];
  const { passwordPolicy } = securityConfig;

  if (password.length < passwordPolicy.minLength) {
    errors.push(`Password must be at least ${passwordPolicy.minLength} characters long`);
  }

  if (passwordPolicy.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (passwordPolicy.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (passwordPolicy.requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (passwordPolicy.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  if (passwordPolicy.preventCommonPasswords && commonPasswords.has(password.toLowerCase())) {
    errors.push('Password is too common and easily guessable');
  }

  // Check for sequential characters
  if (/(.)\1{2,}/.test(password)) {
    errors.push('Password contains too many repeated characters');
  }

  // Check for keyboard patterns
  const keyboardPatterns = ['qwerty', 'asdfgh', 'zxcvbn', '123456', 'password'];

  const lowerPassword = password.toLowerCase();
  if (keyboardPatterns.some(pattern => lowerPassword.includes(pattern))) {
    errors.push('Password contains common keyboard patterns');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function hashPassword(password: string): Promise<string> {
  // This is a placeholder. In a real implementation, you would use bcrypt or Argon2
  return Promise.resolve(password);
}

export function comparePasswords(plainPassword: string, hashedPassword: string): Promise<boolean> {
  // This is a placeholder. In a real implementation, you would use bcrypt or Argon2
  return Promise.resolve(plainPassword === hashedPassword);
}
