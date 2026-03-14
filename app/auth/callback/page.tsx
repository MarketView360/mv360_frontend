'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      const supabase = createClient();

      // Check if we have hash fragments (invite/magic link flow)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      const type = hashParams.get('type');

      if (accessToken && refreshToken) {
        // Handle hash-based auth (invite, magic link, etc.)
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (sessionError) {
          console.error('Error setting session:', sessionError);
          setError(sessionError.message);
          return;
        }

        // Successfully authenticated
        if (type === 'invite') {
          // Redirect to onboarding or profile setup for new users
          router.push('/settings/profile?new=true');
        } else {
          router.push('/dashboard');
        }
      } else {
        // No hash params - let the server route handle query params (PKCE flow)
        // This page will be skipped and the route.ts will handle it
        setError('No authentication parameters found');
      }
    };

    handleAuthCallback();
  }, [router]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="max-w-md rounded-lg border border-red-200 bg-red-50 p-6">
          <h2 className="mb-2 text-lg font-semibold text-red-900">Authentication Error</h2>
          <p className="text-sm text-red-700">{error}</p>
          <button
            onClick={() => router.push('/auth/login')}
            className="mt-4 rounded bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
        <p className="text-sm text-gray-600">Completing authentication...</p>
      </div>
    </div>
  );
}
