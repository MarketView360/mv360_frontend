'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function AcceptInvitePage() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const acceptInvite = async () => {
      const supabase = createClient();

      // Get hash parameters (invite tokens)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      const type = hashParams.get('type');

      if (!accessToken || !refreshToken) {
        setStatus('error');
        setErrorMessage('Invalid invitation link. Missing authentication tokens.');
        return;
      }

      // Set session with invite tokens
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (sessionError) {
        console.error('Error setting session:', sessionError);
        setStatus('error');
        setErrorMessage(sessionError.message);
        return;
      }

      setStatus('success');
      
      // Redirect based on invite type
      setTimeout(() => {
        if (type === 'invite') {
          router.push('/settings/profile?new=true');
        } else {
          router.push('/dashboard');
        }
      }, 1500);
    };

    acceptInvite();
  }, [router]);

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
          <h2 className="text-xl font-semibold text-gray-900">Activating your account...</h2>
          <p className="mt-2 text-sm text-gray-600">Please wait while we set up your profile</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 to-pink-100">
        <div className="max-w-md rounded-lg bg-white p-8 shadow-lg">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="mb-2 text-xl font-bold text-gray-900">Activation Failed</h2>
          <p className="mb-4 text-sm text-gray-600">{errorMessage}</p>
          <button
            onClick={() => router.push('/auth/login')}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="max-w-md rounded-lg bg-white p-8 shadow-lg text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mx-auto">
          <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="mb-2 text-xl font-bold text-gray-900">Account Activated!</h2>
        <p className="text-sm text-gray-600">Redirecting you to your dashboard...</p>
      </div>
    </div>
  );
}
