import * as Sentry from '@sentry/nextjs';

export const captureException = (error: Error, context?: Record<string, any>) => {
  Sentry.withScope((scope) => {
    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
    }
    Sentry.captureException(error);
  });
};

export const captureMessage = (message: string, level: Sentry.SeverityLevel = 'info') => {
  Sentry.captureMessage(message, level);
};

export const startTransaction = (name: string, op?: string) => {
  return Sentry.startTransaction({
    name,
    op: op || 'transaction',
  });
};

export const setUser = (user: { id: string; email?: string; username?: string }) => {
  Sentry.setUser(user);
};

export const clearUser = () => {
  Sentry.setUser(null);
};

export const setTag = (key: string, value: string) => {
  Sentry.setTag(key, value);
};

export const setExtra = (key: string, value: any) => {
  Sentry.setExtra(key, value);
};

export const withSentry = <T>(fn: () => Promise<T>): Promise<T> => {
  return Sentry.startSpan(
    {
      name: fn.name || 'anonymous',
      op: 'function',
    },
    async () => {
      try {
        return await fn();
      } catch (error) {
        captureException(error as Error);
        throw error;
      }
    }
  );
}; 