"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Shield,
  Lock,
  Key,
  CheckCircle,
  ExternalLink,
  Clock,
  Calendar,
  Smartphone,
  Monitor,
  LogOut,
  Loader2,
  QrCode,
  AlertTriangle,
  Trash2,
  Globe,
} from "lucide-react";
import { toast } from "sonner";

interface SessionInfo {
  id: string;
  created_at: string;
  updated_at: string;
  user_agent: string | null;
  ip: string | null;
  refreshed_at: string | null;
  is_current: boolean;
}

interface MfaFactor {
  id: string;
  friendly_name?: string;
  factor_type: "totp" | "phone";
  status: "verified" | "unverified";
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

function parseUserAgent(ua: string | null): { device: string; browser: string } {
  if (!ua) return { device: "Unknown Device", browser: "Unknown Browser" };
  
  let device = "Desktop";
  if (/mobile/i.test(ua)) device = "Mobile";
  else if (/tablet/i.test(ua)) device = "Tablet";
  
  let browser = "Unknown";
  if (/chrome/i.test(ua) && !/edge/i.test(ua)) browser = "Chrome";
  else if (/firefox/i.test(ua)) browser = "Firefox";
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = "Safari";
  else if (/edge/i.test(ua)) browser = "Edge";
  
  return { device, browser };
}

export default function SecurityPage() {
  const { user, session, resetPassword, signOut, enrollMfa, verifyMfa, unenrollMfa, listMfaFactors } = useAuth();
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [revokingAll, setRevokingAll] = useState(false);
  const [revokingSession, setRevokingSession] = useState<string | null>(null);
  
  // MFA state
  const [mfaFactors, setMfaFactors] = useState<MfaFactor[]>([]);
  const [loadingMfa, setLoadingMfa] = useState(true);
  const [enrollingMfa, setEnrollingMfa] = useState(false);
  const [mfaSetup, setMfaSetup] = useState<{ qrCode: string; secret: string; factorId: string } | null>(null);
  const [verifyCode, setVerifyCode] = useState("");
  const [verifyingMfa, setVerifyingMfa] = useState(false);
  const [unenrollingMfa, setUnenrollingMfa] = useState<string | null>(null);

  const authProvider = (user?.app_metadata?.provider || "email").toLowerCase();
  const isOAuthUser = authProvider !== "email";
  const providerLabel = authProvider.charAt(0).toUpperCase() + authProvider.slice(1);

  // Fetch active sessions
  const fetchSessions = useCallback(async () => {
    if (!session?.access_token || !API_BASE) return;
    
    setLoadingSessions(true);
    try {
      const res = await fetch(`${API_BASE}/profile/sessions`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
      }
    } catch (err) {
      console.error("Failed to fetch sessions:", err);
    } finally {
      setLoadingSessions(false);
    }
  }, [session?.access_token]);

  // Fetch MFA factors
  const fetchMfaFactors = useCallback(async () => {
    setLoadingMfa(true);
    try {
      const result = await listMfaFactors();
      if (!result.error) {
        setMfaFactors(result.factors);
      }
    } catch (err) {
      console.error("Failed to fetch MFA factors:", err);
    } finally {
      setLoadingMfa(false);
    }
  }, [listMfaFactors]);

  useEffect(() => {
    fetchSessions();
    fetchMfaFactors();
  }, [fetchSessions, fetchMfaFactors]);

  const handlePasswordReset = async () => {
    if (!user?.email) return;

    if (isOAuthUser) {
      toast.error(`You signed in with ${providerLabel}. Password changes are managed by your sign-in provider.`);
      return;
    }

    try {
      await resetPassword(user.email);
      setResetEmailSent(true);
      toast.success("Password reset email sent");
    } catch {
      toast.error("Failed to send reset email");
    }
  };

  const handleRevokeAllSessions = async () => {
    setRevokingAll(true);
    try {
      await signOut("others");
      toast.success("All other sessions have been signed out");
      await fetchSessions();
    } catch {
      toast.error("Failed to sign out other sessions");
    } finally {
      setRevokingAll(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    if (!session?.access_token || !API_BASE) return;
    
    setRevokingSession(sessionId);
    try {
      const res = await fetch(`${API_BASE}/profile/sessions/${sessionId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        toast.success("Session revoked");
        await fetchSessions();
      } else {
        toast.error("Failed to revoke session");
      }
    } catch {
      toast.error("Failed to revoke session");
    } finally {
      setRevokingSession(null);
    }
  };

  const handleEnrollMfa = async () => {
    setEnrollingMfa(true);
    try {
      const result = await enrollMfa("Authenticator App");
      if ("error" in result) {
        toast.error("Failed to setup 2FA");
      } else {
        setMfaSetup(result);
      }
    } catch {
      toast.error("Failed to setup 2FA");
    } finally {
      setEnrollingMfa(false);
    }
  };

  const handleVerifyMfa = async () => {
    if (!mfaSetup || !verifyCode) return;
    
    setVerifyingMfa(true);
    try {
      const result = await verifyMfa(mfaSetup.factorId, verifyCode);
      if (result.error) {
        toast.error("Invalid verification code");
      } else {
        toast.success("Two-factor authentication enabled!");
        setMfaSetup(null);
        setVerifyCode("");
        await fetchMfaFactors();
      }
    } catch {
      toast.error("Failed to verify code");
    } finally {
      setVerifyingMfa(false);
    }
  };

  const handleUnenrollMfa = async (factorId: string) => {
    setUnenrollingMfa(factorId);
    try {
      const result = await unenrollMfa(factorId);
      if (result.error) {
        toast.error("Failed to remove 2FA");
      } else {
        toast.success("Two-factor authentication removed");
        await fetchMfaFactors();
      }
    } catch {
      toast.error("Failed to remove 2FA");
    } finally {
      setUnenrollingMfa(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Security</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your account security and authentication
        </p>
      </div>

      {/* Authentication Method */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="h-5 w-5 text-green-500" />
            Authentication Method
          </CardTitle>
          <CardDescription>Your current sign-in method</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-medium text-slate-900 dark:text-white capitalize">
                  {authProvider}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {user?.email}
                </p>
              </div>
            </div>
            <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
              <CheckCircle className="h-3 w-3 mr-1" />
              Verified
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Password Management */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Lock className="h-5 w-5 text-blue-500" />
            Password
          </CardTitle>
          <CardDescription>Manage your account password</CardDescription>
        </CardHeader>
        <CardContent>
          {!isOAuthUser ? (
            <div className="space-y-4">
              <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Key className="h-5 w-5 text-slate-400" />
                      <h4 className="font-medium text-slate-900 dark:text-white">
                        Change Password
                      </h4>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      We'll send a secure link to your email to reset your password
                    </p>
                  </div>
                  <Button
                    onClick={handlePasswordReset}
                    disabled={resetEmailSent}
                    variant="outline"
                    className="shrink-0"
                  >
                    {resetEmailSent ? "Email Sent" : "Send Reset Link"}
                  </Button>
                </div>
              </div>

              {/* Security Tips */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
                  Password Security Tips
                </h4>
                <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
                  <li>• Use at least 12 characters</li>
                  <li>• Include numbers, symbols, and mixed case</li>
                  <li>• Avoid common words or patterns</li>
                  <li>• Don't reuse passwords from other sites</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                  <ExternalLink className="h-5 w-5 text-slate-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-slate-900 dark:text-white mb-1">
                    Managed by {providerLabel}
                  </h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                    You signed in with {providerLabel}. Password and security settings are managed through your {providerLabel} account.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const urls: Record<string, string> = {
                        google: "https://myaccount.google.com/security",
                        github: "https://github.com/settings/security",
                      };
                      window.open(urls[authProvider] || "#", "_blank");
                    }}
                  >
                    Manage in {providerLabel}
                    <ExternalLink className="h-3 w-3 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Two-Factor Authentication */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Smartphone className="h-5 w-5 text-purple-500" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loadingMfa ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full" />
            </div>
          ) : mfaSetup ? (
            <div className="space-y-4">
              <div className="p-4 bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800 rounded-lg">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-white dark:bg-slate-800 rounded-lg">
                    <QrCode className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-purple-900 dark:text-purple-300 mb-2">
                      Scan QR Code
                    </h4>
                    <p className="text-sm text-purple-700 dark:text-purple-400 mb-4">
                      Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                    </p>
                    <div className="flex justify-center mb-4">
                      <img src={mfaSetup.qrCode} alt="2FA QR Code" className="w-48 h-48 rounded-lg border" />
                    </div>
                    <div className="mb-4">
                      <Label className="text-purple-700 dark:text-purple-300 text-xs">
                        Or enter this code manually:
                      </Label>
                      <code className="block mt-1 p-2 bg-white dark:bg-slate-800 rounded text-xs font-mono break-all">
                        {mfaSetup.secret}
                      </code>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-purple-700 dark:text-purple-300 text-sm">
                        Enter verification code
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          value={verifyCode}
                          onChange={(e) => setVerifyCode(e.target.value)}
                          placeholder="000000"
                          maxLength={6}
                          className="flex-1"
                        />
                        <Button
                          onClick={handleVerifyMfa}
                          disabled={verifyCode.length !== 6 || verifyingMfa}
                        >
                          {verifyingMfa ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify"}
                        </Button>
                        <Button variant="outline" onClick={() => setMfaSetup(null)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : mfaFactors.length > 0 ? (
            <div className="space-y-3">
              {mfaFactors.map((factor) => (
                <div
                  key={factor.id}
                  className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium text-green-900 dark:text-green-300">
                        {factor.friendly_name || "Authenticator App"}
                      </p>
                      <p className="text-xs text-green-700 dark:text-green-400">
                        {factor.factor_type.toUpperCase()} • {factor.status}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUnenrollMfa(factor.id)}
                    disabled={unenrollingMfa === factor.id}
                    className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
                  >
                    {unenrollingMfa === factor.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-5 w-5 text-slate-400" />
                    <h4 className="font-medium text-slate-900 dark:text-white">
                      Enable 2FA
                    </h4>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Protect your account with an authenticator app. You&apos;ll need to enter a code each time you sign in.
                  </p>
                </div>
                <Button onClick={handleEnrollMfa} disabled={enrollingMfa}>
                  {enrollingMfa ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Smartphone className="h-4 w-4 mr-2" />
                  )}
                  Setup
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Globe className="h-5 w-5 text-blue-500" />
                Active Sessions
              </CardTitle>
              <CardDescription>
                Manage your active sessions across devices
              </CardDescription>
            </div>
            {sessions.length > 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRevokeAllSessions}
                disabled={revokingAll}
                className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
              >
                {revokingAll ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <LogOut className="h-4 w-4 mr-2" />
                )}
                Sign Out All Others
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loadingSessions ? (
            <div className="space-y-3">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : sessions.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
              No active sessions found
            </p>
          ) : (
            <div className="space-y-3">
              {sessions.map((s) => {
                const { device, browser } = parseUserAgent(s.user_agent);
                const isCurrentSession = s.is_current;
                
                return (
                  <div
                    key={s.id}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      isCurrentSession
                        ? "bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800"
                        : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {device === "Mobile" ? (
                        <Smartphone className="h-5 w-5 text-slate-400" />
                      ) : (
                        <Monitor className="h-5 w-5 text-slate-400" />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-slate-900 dark:text-white">
                            {browser} on {device}
                          </p>
                          {isCurrentSession && (
                            <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 text-xs">
                              Current
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                          {s.ip && <span>IP: {s.ip}</span>}
                          <span>•</span>
                          <span>
                            Last active:{" "}
                            {s.refreshed_at
                              ? new Date(s.refreshed_at).toLocaleString()
                              : new Date(s.updated_at).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    {!isCurrentSession && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRevokeSession(s.id)}
                        disabled={revokingSession === s.id}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        {revokingSession === s.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <LogOut className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Session Summary */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5 text-slate-500" />
            Session Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="h-4 w-4 text-slate-400" />
                <p className="text-sm text-slate-500 dark:text-slate-400">Last Sign In</p>
              </div>
              <p className="font-medium text-slate-900 dark:text-white">
                {user?.last_sign_in_at
                  ? new Date(user.last_sign_in_at).toLocaleString()
                  : "Just now"}
              </p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Globe className="h-4 w-4 text-slate-400" />
                <p className="text-sm text-slate-500 dark:text-slate-400">Active Sessions</p>
              </div>
              <p className="font-medium text-slate-900 dark:text-white">
                {sessions.length} {sessions.length === 1 ? "session" : "sessions"}
              </p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Shield className="h-4 w-4 text-slate-400" />
                <p className="text-sm text-slate-500 dark:text-slate-400">2FA Status</p>
              </div>
              <p className={`font-medium ${mfaFactors.length > 0 ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"}`}>
                {mfaFactors.length > 0 ? "Enabled" : "Not Enabled"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
