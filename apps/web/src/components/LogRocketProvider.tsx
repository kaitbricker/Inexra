'use client';

import { useEffect } from 'react';
import LogRocket from 'logrocket';

export function LogRocketProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_LOGROCKET_ID) {
      LogRocket.init(process.env.NEXT_PUBLIC_LOGROCKET_ID, {
        network: {
          requestSanitizer: request => {
            // Sanitize sensitive data from requests
            if (request.headers) {
              delete request.headers['Authorization'];
            }
            return request;
          },
          responseSanitizer: response => {
            // Sanitize sensitive data from responses
            if (response.headers) {
              delete response.headers['set-cookie'];
            }
            return response;
          },
        },
        console: {
          shouldAggregateConsoleErrors: true,
        },
      });
    }
  }, []);

  return <>{children}</>;
}
