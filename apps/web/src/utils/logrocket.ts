import LogRocket from 'logrocket';

// Identify user in LogRocket
export const identifyUser = (user: {
  id: string;
  email?: string;
  name?: string;
  [key: string]: any;
}) => {
  if (typeof window !== 'undefined') {
    LogRocket.identify(user.id, {
      email: user.email || '',
      name: user.name || '',
      ...user,
    });
  }
};

// Clear user identification
export const clearUser = () => {
  if (typeof window !== 'undefined') {
    LogRocket.identify('', {});
  }
};

// Track custom events
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  if (typeof window !== 'undefined') {
    LogRocket.track(eventName, properties);
  }
};

// Capture exceptions
export const captureException = (error: Error, context?: Record<string, any>) => {
  if (typeof window !== 'undefined') {
    LogRocket.captureException(error, {
      tags: context,
    });
  }
};
