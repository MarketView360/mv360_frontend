import * as Sentry from '@sentry/nextjs';
import { PostHog } from 'posthog-node';

// Singleton PostHog instance for server-side usage
export const posthog = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
  host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
});

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}

export const onRequestError = async (
  error: Error & { digest?: string },
  request: Request,
  _context: { request: Request }
) => {
  // Capture in Sentry (existing behavior)
  Sentry.captureException(error);

  // Also capture in PostHog for server-side error tracking
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      // Try to extract distinctId from cookie for user tracking
      let distinctId: string | undefined;
      const cookieHeader = request.headers.get('cookie');
      if (cookieHeader) {
        const postHogCookieMatch = cookieHeader.match(/ph_phc_.*?_posthog=([^;]+)/);
        if (postHogCookieMatch && postHogCookieMatch[1]) {
          try {
            const decodedCookie = decodeURIComponent(postHogCookieMatch[1]);
            const postHogData = JSON.parse(decodedCookie);
            distinctId = postHogData.distinct_id;
          } catch {
            // Cookie parsing failed, continue without distinctId
          }
        }
      }

      posthog.captureException(error, distinctId);
    } catch (e) {
      console.error('[PostHog] Failed to capture server-side exception:', e);
    }
  }
};