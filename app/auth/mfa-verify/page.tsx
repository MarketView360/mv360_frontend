"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import { Logo } from "@/components/common/Logo";
import { Shield, Lock, ArrowLeft, Loader2, AlertCircle, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function MfaVerifyPage() {
  return (
    <Suspense fallback={<MfaVerifyPageSkeleton />}>
      <MfaVerifyPageContent />
    </Suspense>
  );
}

function MfaVerifyPageSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
    </div>
  );
}

function MfaVerifyPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/";
  
  const { session, listMfaFactors, challengeMfa, verifyMfaChallenge, signOut } = useAuth();
  
  const [verifyCode, setVerifyCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingMfa, setIsCheckingMfa] = useState(true);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [factorName, setFactorName] = useState<string>("Authenticator App");
  const [useRecoveryCode, setUseRecoveryCode] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState("");

  // Check if user needs MFA verification
  const checkMfaRequired = useCallback(async () => {
    if (!session) {
      // No session, redirect to login
      router.replace("/auth/login");
      return;
    }

    setIsCheckingMfa(true);
    try {
      const result = await listMfaFactors();
      
      if (result.error) {
        console.error("Failed to list MFA factors:", result.error);
        setError("Failed to check MFA status");
        setIsCheckingMfa(false);
        return;
      }

      // Find verified TOTP factors
      const verifiedFactors = result.factors.filter(
        f => f.factor_type === "totp" && f.status === "verified"
      );

      if (verifiedFactors.length === 0) {
        // No MFA factors, user doesn't need verification
        router.replace(redirectTo);
        return;
      }

      // Use the first verified factor
      const factor = verifiedFactors[0];
      setFactorId(factor.id);
      setFactorName(factor.friendly_name || "Authenticator App");
    } catch (err) {
      console.error("MFA check error:", err);
      setError("An error occurred while checking MFA status");
    } finally {
      setIsCheckingMfa(false);
    }
  }, [session, listMfaFactors, router, redirectTo]);

  useEffect(() => {
    checkMfaRequired();
  }, [checkMfaRequired]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!factorId || !verifyCode) return;
    
    setError(null);
    setIsLoading(true);

    try {
      // Create a challenge
      const challengeResult = await challengeMfa(factorId);
      
      if ("error" in challengeResult) {
        setError(challengeResult.error.message || "Failed to create MFA challenge");
        setIsLoading(false);
        return;
      }

      // Verify the challenge with the user's code
      const verifyResult = await verifyMfaChallenge(
        factorId,
        challengeResult.challengeId,
        verifyCode
      );

      if (verifyResult.error) {
        setError("Invalid verification code. Please try again.");
        setVerifyCode("");
        setIsLoading(false);
        return;
      }

      // Success! Redirect to the intended destination
      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      console.error("MFA verification error:", err);
      setError("An error occurred during verification");
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace("/auth/login");
  };

  const handleVerifyRecoveryCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!recoveryCode || !session?.access_token) return;
    
    setError(null);
    setIsLoading(true);

    const API_BASE = process.env.NEXT_PUBLIC_API_URL;
    
    try {
      // Use recovery code to bypass MFA - this will disable MFA for the user
      const res = await fetch(`${API_BASE}/profile/mfa/recovery-codes/bypass`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ code: recoveryCode }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Invalid recovery code. Please try again.");
        setRecoveryCode("");
        setIsLoading(false);
        return;
      }

      // Recovery code verified and MFA has been disabled
      // User can now access their account and should set up MFA again
      router.push(redirectTo + "?mfa_reset=true");
      router.refresh();
    } catch (err) {
      console.error("Recovery code verification error:", err);
      setError("An error occurred during verification");
      setIsLoading(false);
    }
  };

  const handleUseRecoveryCode = () => {
    setUseRecoveryCode(true);
    setError(null);
    setVerifyCode("");
  };

  const handleBackToTOTP = () => {
    setUseRecoveryCode(false);
    setError(null);
    setRecoveryCode("");
  };

  if (isCheckingMfa) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Checking authentication status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Back to login */}
        <button
          onClick={handleSignOut}
          className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Sign in with different account
        </button>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-4">
              <Logo width={200} height={40} className="h-10 md:h-12" />
            </Link>
            <div className="mx-auto w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Two-Factor Authentication
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Enter the 6-digit code from your authenticator app
            </p>
          </div>

          {/* Factor info */}
          <div className="mb-6 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg flex items-center gap-3">
            <Smartphone className="h-5 w-5 text-slate-400" />
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                {factorName}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Open your authenticator app to view the code
              </p>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Verification Form - TOTP or Recovery Code */}
          {!useRecoveryCode ? (
            <>
              <form onSubmit={handleVerify}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="code" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Verification Code
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <Input
                        id="code"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        autoComplete="one-time-code"
                        value={verifyCode}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                          setVerifyCode(value);
                        }}
                        placeholder="000000"
                        maxLength={6}
                        className="pl-10 text-center text-2xl tracking-widest font-mono"
                        autoFocus
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={verifyCode.length !== 6 || isLoading}
                    className="w-full"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Verifying...
                      </span>
                    ) : (
                      "Verify"
                    )}
                  </Button>
                </div>
              </form>

              {/* Recovery code option */}
              <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                <p className="text-center text-sm text-slate-600 dark:text-slate-400 mb-3">
                  Can&apos;t access your authenticator app?
                </p>
                <button
                  onClick={handleUseRecoveryCode}
                  className="w-full py-2 px-4 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  Use a recovery code
                </button>
              </div>
            </>
          ) : (
            <>
              <form onSubmit={handleVerifyRecoveryCode}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="recovery-code" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Recovery Code
                    </Label>
                    <Input
                      id="recovery-code"
                      type="text"
                      value={recoveryCode}
                      onChange={(e) => {
                        const value = e.target.value.toUpperCase();
                        setRecoveryCode(value);
                      }}
                      placeholder="XXXX-XXXX-XXXX"
                      className="text-center text-lg tracking-wider font-mono"
                      autoFocus
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                      Enter one of your saved recovery codes
                    </p>
                  </div>

                  <Button
                    type="submit"
                    disabled={recoveryCode.length < 10 || isLoading}
                    className="w-full"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Verifying...
                      </span>
                    ) : (
                      "Verify Recovery Code"
                    )}
                  </Button>
                </div>
              </form>

              {/* Back to TOTP option */}
              <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                <button
                  onClick={handleBackToTOTP}
                  className="w-full py-2 px-4 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  ← Back to authenticator code
                </button>
              </div>
            </>
          )}

          {/* Help text */}
          <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-6">
            Having trouble? Contact{" "}
            <a href="mailto:support@marketview360.io" className="text-blue-600 dark:text-blue-400 hover:underline">
              support@marketview360.io
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
