"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUpWithEmail: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>;
  signInWithOAuth: (provider: 'google' | 'github') => Promise<{ error: Error | null }>;
  signInWithMagicLink: (email: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>;
  verifyOtp: (email: string, token: string, type: 'email' | 'recovery') => Promise<{ error: Error | null }>;
  resendVerificationEmail: (email: string) => Promise<{ error: Error | null }>;
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

  const signOut = useCallback(async () => {
    if (supabase) await supabase.auth.signOut();
    setUser(null);
    setSession(null);
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
