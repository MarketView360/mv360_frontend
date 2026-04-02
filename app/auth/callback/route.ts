import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error, data } = await supabase.auth.exchangeCodeForSession(code)
    if (!error && data.session) {
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
      } catch {
        // If check fails, continue to normal redirect
      }

      return NextResponse.redirect(`${baseUrl}${next}`)
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
