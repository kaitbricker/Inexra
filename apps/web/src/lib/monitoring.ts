import { Counter, Histogram, Registry } from 'prom-client';
import { NextApiRequest, NextApiResponse } from 'next';

// Create a Registry to register metrics
const register = new Registry();

// API request counter
export const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status'],
  registers: [register],
});

// API response time histogram
export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.1, 0.5, 1, 2, 5],
  registers: [register],
});

// Database query counter
export const dbQueriesTotal = new Counter({
  name: 'db_queries_total',
  help: 'Total number of database queries',
  labelNames: ['operation', 'table'],
  registers: [register],
});

// Database query duration histogram
export const dbQueryDuration = new Histogram({
  name: 'db_query_duration_seconds',
  help: 'Database query duration in seconds',
  labelNames: ['operation', 'table'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1],
  registers: [register],
});

// Error counter
export const errorsTotal = new Counter({
  name: 'errors_total',
  help: 'Total number of errors',
  labelNames: ['type', 'source'],
  registers: [register],
});

// Active users gauge
export const activeUsers = new Counter({
  name: 'active_users_total',
  help: 'Total number of active users',
  registers: [register],
});

// Metrics endpoint handler
export async function metricsHandler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    res.setHeader('Content-Type', register.contentType);
    res.send(await register.metrics());
  } catch (error) {
    console.error('Error generating metrics:', error);
    res.status(500).json({ message: 'Error generating metrics' });
  }
}

// Middleware to track API metrics
export function withMetrics(handler: any) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const start = Date.now();
    const route = req.url?.split('?')[0] || 'unknown';

    try {
      await handler(req, res);
    } finally {
      const duration = (Date.now() - start) / 1000;
      const status = res.statusCode.toString();

      httpRequestsTotal.inc({ method: req.method, route, status });
      httpRequestDuration.observe({ method: req.method, route, status }, duration);
    }
  };
}

// Function to track database operations
export function trackDbOperation(operation: string, table: string, duration: number) {
  dbQueriesTotal.inc({ operation, table });
  dbQueryDuration.observe({ operation, table }, duration);
}

// Function to track errors
export function trackError(type: string, source: string) {
  errorsTotal.inc({ type, source });
}

// Function to track active users
export function trackActiveUser() {
  activeUsers.inc();
}
