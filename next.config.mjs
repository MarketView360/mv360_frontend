import { withSentryConfig } from '@sentry/nextjs';
import { withPostHogConfig } from '@posthog/nextjs-config';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
    productionBrowserSourceMaps: true, // Enable source maps for production
    webpack: (config) => {
        config.resolve.alias = {
            ...config.resolve.alias,
            '@': path.resolve(__dirname),
        };
        return config;
    },
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'X-DNS-Prefetch-Control',
                        value: 'on'
                    },
                    {
                        key: 'Strict-Transport-Security',
                        value: 'max-age=63072000; includeSubDomains; preload'
                    },
                    {
                        key: 'X-Frame-Options',
                        value: 'SAMEORIGIN'
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff'
                    },
                    {
                        key: 'X-XSS-Protection',
                        value: '1; mode=block'
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'origin-when-cross-origin'
                    },
                    {
                        key: 'Permissions-Policy',
                        value: 'camera=(), microphone=(), geolocation=()'
                    }
                ]
            }
        ];
    },
};

export default withPostHogConfig(withSentryConfig(nextConfig, {
  // Sentry config
  org: "marketview360",
  project: "marketview360-frontend",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  tunnelRoute: "/monitoring",
  webpack: {
    automaticVercelMonitors: true,
    removeDebugLogging: true,
  },
}), {
  // PostHog config for source maps
  personalApiKey: process.env.POSTHOG_PERSONAL_API_KEY,
  projectId: process.env.POSTHOG_PROJECT_ID,
  host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  sourcemaps: {
    enabled: process.env.VERCEL !== '1', // Disable in Vercel CI - use Sentry instead
    releaseName: "marketview360",
    deleteAfterUpload: false,
  },
});
