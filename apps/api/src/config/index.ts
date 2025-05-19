import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // API
  apiUrl: process.env.API_URL || 'http://localhost:3001/api',
  wsUrl: process.env.WS_URL || 'ws://localhost:3001',
  
  // Database
  databaseUrl: process.env.DATABASE_URL,
  
  // Authentication
  nextAuthUrl: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  nextAuthSecret: process.env.NEXTAUTH_SECRET,
  jwtSecret: process.env.JWT_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  
  // Redis
  redisUrl: process.env.REDIS_URL,
  
  // Rate Limiting
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '900', 10),
  
  // CORS
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  
  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
  enableRequestLogging: process.env.ENABLE_REQUEST_LOGGING === 'true',
  
  // Features
  enableCompression: process.env.ENABLE_COMPRESSION === 'true',
  enableMetrics: process.env.ENABLE_METRICS === 'true',
  metricsPort: parseInt(process.env.METRICS_PORT || '9090', 10),
  
  // External Services
  sentryDsn: process.env.SENTRY_DSN,
  logrocketId: process.env.LOGROCKET_ID,
  sendgridApiKey: process.env.SENDGRID_API_KEY,
  openaiApiKey: process.env.OPENAI_API_KEY,
  
  // Cache
  cacheTtl: parseInt(process.env.CACHE_TTL || '3600', 10),
  
  // MFA
  mfaIssuer: process.env.MFA_ISSUER || 'Inexra',
} as const;

// Type for the config object
export type Config = typeof config;

// Validate required environment variables
const requiredEnvVars = [
  'DATABASE_URL',
  'NEXTAUTH_SECRET',
  'JWT_SECRET',
] as const;

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
} 