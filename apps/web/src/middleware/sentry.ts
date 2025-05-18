import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { withSentry } from '@/utils/sentry';

export async function middleware(request: NextRequest) {
  return withSentry(async () => {
    try {
      // Start a transaction for the request
      const transaction = Sentry.startTransaction({
        name: `${request.method} ${request.nextUrl.pathname}`,
        op: 'http.server',
      });

      // Set request context
      Sentry.setContext('request', {
        method: request.method,
        url: request.url,
        headers: Object.fromEntries(request.headers),
      });

      // Process the request
      const response = await NextResponse.next();

      // Set response context
      Sentry.setContext('response', {
        status: response.status,
        headers: Object.fromEntries(response.headers),
      });

      // Finish the transaction
      transaction.finish();

      return response;
    } catch (error) {
      // Capture any errors that occur during request processing
      Sentry.captureException(error);
      throw error;
    }
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}; 