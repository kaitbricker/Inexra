export const productionConfig = {
  // Security
  security: {
    cors: {
      origin: process.env.CORS_ORIGIN || 'https://your-production-domain.com',
      credentials: true,
    },
    rateLimit: {
      max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '60', 10) * 1000,
    },
    csrf: {
      cookieName: 'csrf_token',
      headerName: 'X-CSRF-Token',
    },
  },

  // Cache
  cache: {
    ttl: parseInt(process.env.CACHE_TTL || '3600', 10),
    enableCompression: process.env.ENABLE_COMPRESSION === 'true',
  },

  // Monitoring
  monitoring: {
    sentry: {
      dsn: process.env.SENTRY_DSN,
      environment: 'production',
    },
    logrocket: {
      id: process.env.LOGROCKET_ID,
    },
    metrics: {
      enabled: process.env.ENABLE_METRICS === 'true',
      port: parseInt(process.env.METRICS_PORT || '9090', 10),
    },
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    enableRequestLogging: process.env.ENABLE_REQUEST_LOGGING === 'true',
  },

  // Database
  database: {
    url: process.env.DATABASE_URL,
    poolSize: 10,
    ssl: true,
  },

  // Redis
  redis: {
    url: process.env.REDIS_URL,
    tls: true,
  },

  // Authentication
  auth: {
    url: process.env.NEXTAUTH_URL,
    secret: process.env.NEXTAUTH_SECRET,
    session: {
      maxAge: 30 * 24 * 60 * 60, // 30 days
      updateAge: 24 * 60 * 60, // 24 hours
    },
  },
};
