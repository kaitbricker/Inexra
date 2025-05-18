import { z } from 'zod';

// User validation schemas
export const userSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format')
    .refine(async (email: string) => {
      // TODO: Implement email uniqueness check
      return true;
    }, 'Email already exists'),
  name: z.string().min(1, 'Name is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  role: z.string().min(1, 'Role is required'),
  status: z.enum(['active', 'suspended', 'pending']).default('pending'),
});

export const userUpdateSchema = userSchema.partial().omit({ password: true });

// Role validation schemas
export const roleSchema = z.object({
  name: z
    .string()
    .min(1, 'Role name is required')
    .refine(async (name: string) => {
      // TODO: Implement role name uniqueness check
      return true;
    }, 'Role name already exists'),
  description: z.string().min(1, 'Description is required'),
  permissions: z.array(z.string()).min(1, 'At least one permission is required'),
});

export const roleUpdateSchema = roleSchema.partial();

// Profile settings validation schemas
export const profileSettingsSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().min(1, 'Email is required').email('Invalid email format'),
  settings: z.object({
    notifications: z.object({
      email: z.boolean(),
      push: z.boolean(),
    }),
    theme: z.enum(['light', 'dark', 'system']),
    language: z.string(),
  }),
});

export const apiKeySchema = z.object({
  name: z
    .string()
    .min(1, 'API key name is required')
    .refine(async (name: string) => {
      // TODO: Implement API key name uniqueness check
      return true;
    }, 'API key name already exists'),
});

// Form error messages
export const formErrors = {
  required: 'This field is required',
  email: 'Invalid email format',
  password: {
    min: 'Password must be at least 8 characters',
    uppercase: 'Password must contain at least one uppercase letter',
    lowercase: 'Password must contain at least one lowercase letter',
    number: 'Password must contain at least one number',
    special: 'Password must contain at least one special character',
  },
  unique: {
    email: 'Email already exists',
    role: 'Role name already exists',
    apiKey: 'API key name already exists',
  },
} as const;
