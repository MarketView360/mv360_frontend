"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { User, Session } from "@supabase/supabase-js";

interface MfaFactor {
  id: string;
  friendly_name?: string;
  factor_type: 'totp' | 'phone';
  status: 'verified' | 'unverified';
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUpWithEmail: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>;
  signInWithOAuth: (provider: 'google' | 'github') => Promise<{ error: Error | null }>;
  signInWithMagicLink: (email: string) => Promise<{ error: Error | null }>;
  signOut: (scope?: 'global' | 'local' | 'others') => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>;
  verifyOtp: (email: string, token: string, type: 'email' | 'recovery') => Promise<{ error: Error | null }>;
  resendVerificationEmail: (email: string) => Promise<{ error: Error | null }>;
  // MFA methods
  enrollMfa: (friendlyName?: string) => Promise<{ qrCode: string; secret: string; factorId: string } | { error: Error }>;
  verifyMfa: (factorId: string, code: string) => Promise<{ error: Error | null }>;
  unenrollMfa: (factorId: string) => Promise<{ error: Error | null }>;
  listMfaFactors: () => Promise<{ factors: MfaFactor[]; error: Error | null }>;
  challengeMfa: (factorId: string) => Promise<{ challengeId: string } | { error: Error }>;
  verifyMfaChallenge: (factorId: string, challengeId: string, code: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function buildRedirectUrl(path: string): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  const base = configured && /^https?:\/\//.test(configured)
    ? configured
    : window.location.origin;

  return `${base.replace(/\/$/, '')}${path}`;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [supabase, setSupabase] = useState<ReturnType<typeof createClient> | null>(null);

  useEffect(() => {
    // Migration: Clear old Supabase project sessions (one-time per user)
    const MIGRATION_VERSION = 'v2_production_project';
    const currentVersion = localStorage.getItem('supabase_migration_version');
    
    if (currentVersion !== MIGRATION_VERSION) {
      // Clear all localStorage items related to old Supabase project
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('sb-') || key.includes('supabase') || key.includes('auth-token'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      // Clear sessionStorage
      sessionStorage.clear();
      
      // Set new migration version
      localStorage.setItem('supabase_migration_version', MIGRATION_VERSION);
    }

    // Create the Supabase client
    const client = createClient();
    setSupabase(client);
  }, []);

  useEffect(() => {
    if (!supabase) return;

    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    if (!supabase) return { error: new Error('Auth not available') };
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    return { error: error as Error | null };
  }, [supabase]);

  const signUpWithEmail = useCallback(async (email: string, password: string, fullName?: string) => {
    if (!supabase) return { error: new Error('Auth not available') };
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: buildRedirectUrl('/auth/callback'),
        data: {
          full_name: fullName,
        },
      },
    });
    setLoading(false);
    return { error: error as Error | null };
  }, [supabase]);

  const signInWithOAuth = useCallback(async (provider: 'google' | 'github') => {
    if (!supabase) return { error: new Error('Auth not available') };
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: buildRedirectUrl('/auth/callback'),
      },
    });
    return { error: error as Error | null };
  }, [supabase]);

  const signInWithMagicLink = useCallback(async (email: string) => {
    if (!supabase) return { error: new Error('Auth not available') };
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: buildRedirectUrl('/auth/callback'),
      },
    });
    return { error: error as Error | null };
  }, [supabase]);

  const signOut = useCallback(async (scope: 'global' | 'local' | 'others' = 'local') => {
    if (supabase) await supabase.auth.signOut({ scope });
    if (scope !== 'others') {
      setUser(null);
      setSession(null);
    }
  }, [supabase]);

  const resetPassword = useCallback(async (email: string) => {
    if (!supabase) return { error: new Error('Auth not available') };
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: buildRedirectUrl('/auth/reset-password'),
    });
    return { error: error as Error | null };
  }, [supabase]);

  const updatePassword = useCallback(async (newPassword: string) => {
    if (!supabase) return { error: new Error('Auth not available') };
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    return { error: error as Error | null };
  }, [supabase]);

  const verifyOtp = useCallback(async (email: string, token: string, type: 'email' | 'recovery') => {
    if (!supabase) return { error: new Error('Auth not available') };
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: type === 'email' ? 'email' : 'recovery',
    });
    return { error: error as Error | null };
  }, [supabase]);

  const resendVerificationEmail = useCallback(async (email: string) => {
    if (!supabase) return { error: new Error('Auth not available') };
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: buildRedirectUrl('/auth/callback'),
      },
    });
    return { error: error as Error | null };
  }, [supabase]);

  // MFA Methods
  const enrollMfa = useCallback(async (friendlyName?: string) => {
    if (!supabase) return { error: new Error('Auth not available') };
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: 'totp',
      friendlyName: friendlyName || 'Authenticator App',
    });
    if (error) return { error: error as Error };
    return {
      qrCode: data.totp.qr_code,
      secret: data.totp.secret,
      factorId: data.id,
    };
  }, [supabase]);

  const verifyMfa = useCallback(async (factorId: string, code: string) => {
    if (!supabase) return { error: new Error('Auth not available') };
    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
    if (challengeError) return { error: challengeError as Error };
    
    const { error } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.id,
      code,
    });
    return { error: error as Error | null };
  }, [supabase]);

  const unenrollMfa = useCallback(async (factorId: string) => {
    if (!supabase) return { error: new Error('Auth not available') };
    const { error } = await supabase.auth.mfa.unenroll({ factorId });
    return { error: error as Error | null };
  }, [supabase]);

  const listMfaFactors = useCallback(async () => {
    if (!supabase) return { factors: [], error: new Error('Auth not available') };
    const { data, error } = await supabase.auth.mfa.listFactors();
    if (error) return { factors: [], error: error as Error };
    return {
      factors: [...(data.totp || []), ...(data.phone || [])].map(f => ({
        id: f.id,
        friendly_name: f.friendly_name,
        factor_type: f.factor_type as 'totp' | 'phone',
        status: f.status as 'verified' | 'unverified',
      })),
      error: null,
    };
  }, [supabase]);

  const challengeMfa = useCallback(async (factorId: string) => {
    if (!supabase) return { error: new Error('Auth not available') };
    const { data, error } = await supabase.auth.mfa.challenge({ factorId });
    if (error) return { error: error as Error };
    return { challengeId: data.id };
  }, [supabase]);

  const verifyMfaChallenge = useCallback(async (factorId: string, challengeId: string, code: string) => {
    if (!supabase) return { error: new Error('Auth not available') };
    const { error } = await supabase.auth.mfa.verify({
      factorId,
      challengeId,
      code,
    });
    return { error: error as Error | null };
  }, [supabase]);

  const value: AuthContextType = {
    user,
    session,
    loading,
    signInWithEmail,
    signUpWithEmail,
    signInWithOAuth,
    signInWithMagicLink,
    signOut,
    resetPassword,
    updatePassword,
    verifyOtp,
    resendVerificationEmail,
    enrollMfa,
    verifyMfa,
    unenrollMfa,
    listMfaFactors,
    challengeMfa,
    verifyMfaChallenge,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
