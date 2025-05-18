import * as Sentry from '@sentry/nextjs';
import { productionConfig } from '@/config/production';

export function initSentry() {
  if (process.env.NODE_ENV === 'production') {
    Sentry.init({
      dsn: productionConfig.monitoring.sentry.dsn,
      environment: productionConfig.monitoring.sentry.environment,
      tracesSampleRate: 1.0,
      integrations: [
        new Sentry.BrowserTracing({
          tracePropagationTargets: ['localhost', productionConfig.security.cors.origin],
        }),
      ],
      beforeSend(event) {
        // Don't send events in development
        if (process.env.NODE_ENV !== 'production') {
          return null;
        }
        return event;
      },
    });
  }
}

export function captureException(error: Error, context?: Record<string, any>) {
  if (process.env.NODE_ENV === 'production') {
    Sentry.withScope(scope => {
      if (context) {
        Object.entries(context).forEach(([key, value]) => {
          scope.setExtra(key, value);
        });
      }
      Sentry.captureException(error);
    });
  }
  console.error(error);
}

export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info') {
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureMessage(message, level);
  }
  console.log(`[${level.toUpperCase()}] ${message}`);
}
