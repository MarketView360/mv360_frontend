import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')

  // Handle OAuth/PKCE errors
  if (error) {
    console.error('Auth callback error:', error, errorDescription)
    return NextResponse.redirect(new URL('/auth/auth-code-error', requestUrl.origin))
  }

  const origin = requestUrl.origin
  const next = requestUrl.searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()

    // Exchange the code for a session
    const { error: exchangeError, data } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      console.error('Failed to exchange code for session:', exchangeError.message)
      // If exchange fails, redirect to error page
      return NextResponse.redirect(new URL('/auth/auth-code-error', origin))
    }

    if (data.session) {
      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'
      const baseUrl = isLocalEnv ? origin : (forwardedHost ? `https://${forwardedHost}` : origin)

      // Check if user needs onboarding
      try {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('onboarded_at')
          .eq('id', data.session.user.id)
          .maybeSingle()

        // If no profile or not onboarded, redirect to onboarding
        if (!profile || !profile.onboarded_at) {
          return NextResponse.redirect(`${baseUrl}/onboarding`)
        }
      } catch (profileError) {
        console.error('Error checking onboarding status:', profileError)
        // Continue to normal redirect if check fails
      }

      return NextResponse.redirect(`${baseUrl}${next}`)
    }
  }

  // No valid code - redirect to error page
  return NextResponse.redirect(new URL('/auth/auth-code-error', origin))
}
