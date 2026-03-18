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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Copy,
  Download,
  RefreshCw,
  ShieldCheck,
  ShieldAlert,
  Mail,
  MessageSquare,
  ChevronRight,
  Info,
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
  const { user, session, resetPassword, signOut, enrollMfa, verifyMfa, unenrollMfa, listMfaFactors, challengeMfa, verifyMfaChallenge, getAalLevel } = useAuth();
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
  
  // Recovery codes state
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [showRecoveryCodesDialog, setShowRecoveryCodesDialog] = useState(false);
  const [recoveryCodesCount, setRecoveryCodesCount] = useState<number>(0);
  const [loadingRecoveryCodes, setLoadingRecoveryCodes] = useState(false);
  const [showConfirmDisableDialog, setShowConfirmDisableDialog] = useState(false);
  const [factorToDisable, setFactorToDisable] = useState<string | null>(null);
  
  // AAL2 verification state for unenrolling
  const [showAal2Dialog, setShowAal2Dialog] = useState(false);
  const [aal2VerifyCode, setAal2VerifyCode] = useState("");
  const [aal2ChallengeId, setAal2ChallengeId] = useState<string | null>(null);
  const [verifyingAal2, setVerifyingAal2] = useState(false);
  const [currentAalLevel, setCurrentAalLevel] = useState<'aal1' | 'aal2' | null>(null);
  
  // 2FA method selection state
  const [showMethodSelection, setShowMethodSelection] = useState(false);
  const [mfaError, setMfaError] = useState<string | null>(null);
  const [setupStep, setSetupStep] = useState<1 | 2 | 3>(1); // 1: Select method, 2: Scan QR, 3: Verify

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

  // Fetch recovery codes count
  const fetchRecoveryCodesCount = useCallback(async () => {
    if (!session?.access_token || !API_BASE) return;
    
    try {
      const res = await fetch(`${API_BASE}/profile/mfa/recovery-codes/count`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setRecoveryCodesCount(data.count || 0);
      }
    } catch (err) {
      console.error("Failed to fetch recovery codes count:", err);
    }
  }, [session?.access_token]);

  useEffect(() => {
    fetchSessions();
    fetchMfaFactors();
  }, [fetchSessions, fetchMfaFactors]);

  // Fetch recovery codes count and AAL level when MFA factors change
  useEffect(() => {
    if (mfaFactors.length > 0) {
      fetchRecoveryCodesCount();
      // Check current AAL level
      getAalLevel().then(result => {
        if (!('error' in result)) {
          setCurrentAalLevel(result.currentLevel);
        }
      });
    }
  }, [mfaFactors, fetchRecoveryCodesCount, getAalLevel]);

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
    setMfaError(null);
    try {
      const result = await enrollMfa("Authenticator App");
      if ("error" in result) {
        const errorMessage = result.error.message || "Failed to setup 2FA";
        // Handle specific error cases
        if (errorMessage.includes("already enrolled")) {
          setMfaError("You already have an authenticator app enrolled. Remove it first to set up a new one.");
          toast.error("Authenticator app already enrolled");
        } else if (errorMessage.includes("rate limit")) {
          setMfaError("Too many attempts. Please wait a few minutes and try again.");
          toast.error("Rate limit exceeded. Please wait and try again.");
        } else {
          setMfaError(errorMessage);
          toast.error("Failed to setup 2FA: " + errorMessage);
        }
      } else {
        setMfaSetup(result);
        setSetupStep(2);
        setShowMethodSelection(false);
        toast.info("Scan the QR code with your authenticator app");
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "An unexpected error occurred";
      setMfaError(errorMsg);
      toast.error("Failed to setup 2FA: " + errorMsg);
    } finally {
      setEnrollingMfa(false);
    }
  };

  const handleVerifyMfa = async () => {
    if (!mfaSetup || !verifyCode) return;
    
    // Validate code format
    if (!/^\d{6}$/.test(verifyCode)) {
      setMfaError("Please enter a valid 6-digit code");
      toast.error("Invalid code format. Please enter 6 digits.");
      return;
    }
    
    setVerifyingMfa(true);
    setMfaError(null);
    try {
      const result = await verifyMfa(mfaSetup.factorId, verifyCode);
      if (result.error) {
        const errorMsg = result.error.message || "Invalid verification code";
        if (errorMsg.includes("expired")) {
          setMfaError("The verification code has expired. Please try scanning the QR code again.");
          toast.error("Code expired. Please start over.");
        } else if (errorMsg.includes("invalid") || errorMsg.includes("incorrect")) {
          setMfaError("The code you entered is incorrect. Please check your authenticator app and try again.");
          toast.error("Invalid code. Please try again.");
        } else {
          setMfaError(errorMsg);
          toast.error("Verification failed: " + errorMsg);
        }
        setVerifyCode("");
      } else {
        // Generate recovery codes
        if (session?.access_token && API_BASE) {
          try {
            const res = await fetch(`${API_BASE}/profile/mfa/recovery-codes/generate`, {
              method: "POST",
              headers: { Authorization: `Bearer ${session.access_token}` },
            });
            if (res.ok) {
              const data = await res.json();
              setRecoveryCodes(data.codes || []);
              setShowRecoveryCodesDialog(true);
            }
            
            // Send notification email
            await fetch(`${API_BASE}/profile/mfa/notify`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.access_token}`,
              },
              body: JSON.stringify({ event_type: "enrolled" }),
            });
            
            // Log the event
            await fetch(`${API_BASE}/profile/mfa/events`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.access_token}`,
              },
              body: JSON.stringify({
                event_type: "enrolled",
                factor_type: "totp",
                factor_id: mfaSetup.factorId,
              }),
            });
          } catch (err) {
            console.error("Failed to generate recovery codes:", err);
          }
        }
        
        toast.success("Two-factor authentication enabled! Your account is now more secure.");
        setMfaSetup(null);
        setVerifyCode("");
        setSetupStep(1);
        setMfaError(null);
        await fetchMfaFactors();
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "An unexpected error occurred";
      setMfaError(errorMsg);
      toast.error("Failed to verify code: " + errorMsg);
    } finally {
      setVerifyingMfa(false);
    }
  };
  
  // Cancel MFA setup and reset state
  const handleCancelMfaSetup = () => {
    setMfaSetup(null);
    setVerifyCode("");
    setSetupStep(1);
    setMfaError(null);
    setShowMethodSelection(false);
    toast.info("2FA setup cancelled");
  };

  // Initiate AAL2 verification before unenrolling
  const initiateAal2Verification = async (factorId: string) => {
    setMfaError(null);
    try {
      // Create a challenge for the factor
      const challengeResult = await challengeMfa(factorId);
      if ('error' in challengeResult && challengeResult.error) {
        setMfaError(challengeResult.error.message || "Failed to initiate verification");
        toast.error("Failed to initiate verification");
        return;
      }
      
      if ('challengeId' in challengeResult) {
        setAal2ChallengeId(challengeResult.challengeId || null);
        setShowAal2Dialog(true);
        setShowConfirmDisableDialog(false);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to initiate verification";
      setMfaError(errorMsg);
      toast.error(errorMsg);
    }
  };

  // Verify AAL2 and then unenroll
  const handleAal2VerifyAndUnenroll = async () => {
    if (!factorToDisable || !aal2ChallengeId || !aal2VerifyCode) return;
    
    setVerifyingAal2(true);
    setMfaError(null);
    
    try {
      // Verify the MFA challenge to elevate to AAL2
      const verifyResult = await verifyMfaChallenge(factorToDisable, aal2ChallengeId, aal2VerifyCode);
      if (verifyResult.error) {
        const errorMsg = verifyResult.error.message || "Invalid verification code";
        setMfaError(errorMsg);
        toast.error("Verification failed: " + errorMsg);
        setAal2VerifyCode("");
        setVerifyingAal2(false);
        return;
      }
      
      // Now we're at AAL2, proceed with unenroll
      setShowAal2Dialog(false);
      await handleUnenrollMfa(factorToDisable);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Verification failed";
      setMfaError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setVerifyingAal2(false);
      setAal2VerifyCode("");
      setAal2ChallengeId(null);
    }
  };

  const handleUnenrollMfa = async (factorId: string) => {
    setUnenrollingMfa(factorId);
    setMfaError(null);
    try {
      const result = await unenrollMfa(factorId);
      if (result.error) {
        const errorMsg = result.error.message || "Failed to remove 2FA";
        
        // Check if AAL2 is required
        if (errorMsg.includes("AAL2") || errorMsg.includes("aal2")) {
          // Need to verify MFA first
          toast.info("Please verify your authenticator to disable 2FA");
          await initiateAal2Verification(factorId);
          setUnenrollingMfa(null);
          return;
        }
        
        if (errorMsg.includes("not found")) {
          setMfaError("This authentication factor was not found. It may have already been removed.");
          toast.error("Factor not found");
        } else {
          setMfaError(errorMsg);
          toast.error("Failed to remove 2FA: " + errorMsg);
        }
        return;
      } else {
        // Send notification email
        if (session?.access_token && API_BASE) {
          try {
            await fetch(`${API_BASE}/profile/mfa/notify`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.access_token}`,
              },
              body: JSON.stringify({ event_type: "unenrolled" }),
            });
            
            // Log the event
            await fetch(`${API_BASE}/profile/mfa/events`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.access_token}`,
              },
              body: JSON.stringify({
                event_type: "unenrolled",
                factor_type: "totp",
                factor_id: factorId,
              }),
            });
          } catch (err) {
            console.error("Failed to send unenroll notification:", err);
          }
        }
        
        // Delete recovery codes when MFA is disabled
        if (session?.access_token && API_BASE) {
          try {
            await fetch(`${API_BASE}/profile/mfa/recovery-codes/delete`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${session.access_token}` },
            });
          } catch {
            // Ignore - not critical
          }
        }
        
        toast.success("Two-factor authentication removed");
        setShowConfirmDisableDialog(false);
        setFactorToDisable(null);
        setRecoveryCodesCount(0);
        await fetchMfaFactors();
      }
    } catch {
      toast.error("Failed to remove 2FA");
    } finally {
      setUnenrollingMfa(null);
    }
  };
  
  // Handle clicking the disable button - check AAL level first
  const handleDisableClick = async (factorId: string) => {
    setFactorToDisable(factorId);
    
    // Check if we're already at AAL2
    const aalResult = await getAalLevel();
    if (!('error' in aalResult) && aalResult.currentLevel === 'aal2') {
      // Already at AAL2, show confirmation dialog
      setShowConfirmDisableDialog(true);
    } else {
      // Need AAL2 verification first
      toast.info("Please verify your authenticator to disable 2FA");
      await initiateAal2Verification(factorId);
    }
  };

  // Handle regenerating recovery codes
  const handleRegenerateRecoveryCodes = async () => {
    if (!session?.access_token || !API_BASE) return;
    
    setLoadingRecoveryCodes(true);
    try {
      const res = await fetch(`${API_BASE}/profile/mfa/recovery-codes/regenerate`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setRecoveryCodes(data.codes || []);
        setShowRecoveryCodesDialog(true);
        toast.success("New recovery codes generated");
        await fetchRecoveryCodesCount();
      } else {
        toast.error("Failed to regenerate recovery codes");
      }
    } catch {
      toast.error("Failed to regenerate recovery codes");
    } finally {
      setLoadingRecoveryCodes(false);
    }
  };

  // Copy recovery codes to clipboard
  const handleCopyRecoveryCodes = () => {
    const codesText = recoveryCodes.join("\n");
    navigator.clipboard.writeText(codesText);
    toast.success("Recovery codes copied to clipboard");
  };

  // Download recovery codes as text file
  const handleDownloadRecoveryCodes = () => {
    const codesText = `MarketView360 Recovery Codes\n${"=".repeat(30)}\n\nSave these codes in a safe place. Each code can only be used once.\n\n${recoveryCodes.join("\n")}\n\nGenerated: ${new Date().toLocaleString()}`;
    const blob = new Blob([codesText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "marketview360-recovery-codes.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Recovery codes downloaded");
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
          {/* Error Display */}
          {mfaError && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 dark:text-red-300">{mfaError}</p>
              </div>
            </div>
          )}
          
          {loadingMfa ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full" />
            </div>
          ) : showMethodSelection ? (
            /* Method Selection UI */
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <h4 className="font-medium text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Info className="h-4 w-4 text-blue-500" />
                  Choose your 2FA method
                </h4>
                
                {/* Authenticator App - Available */}
                <div
                  onClick={handleEnrollMfa}
                  className="p-4 border-2 border-purple-200 dark:border-purple-800 bg-white dark:bg-slate-900 rounded-lg cursor-pointer hover:border-purple-400 dark:hover:border-purple-600 transition-colors mb-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                        <Smartphone className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">Authenticator App</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Use Google Authenticator, Authy, or similar apps
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                        Recommended
                      </Badge>
                      {enrollingMfa ? (
                        <Loader2 className="h-5 w-5 animate-spin text-purple-500" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-slate-400" />
                      )}
                    </div>
                  </div>
                </div>
                
                {/* SMS - Coming Soon */}
                <div className="p-4 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30 rounded-lg opacity-60 cursor-not-allowed mb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                        <MessageSquare className="h-5 w-5 text-slate-400" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-500 dark:text-slate-400">SMS Verification</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                          Receive codes via text message
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-slate-400 border-slate-300">
                      Coming Soon
                    </Badge>
                  </div>
                </div>
                
                {/* Email - Coming Soon */}
                <div className="p-4 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30 rounded-lg opacity-60 cursor-not-allowed">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                        <Mail className="h-5 w-5 text-slate-400" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-500 dark:text-slate-400">Email Verification</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                          Receive codes via email
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-slate-400 border-slate-300">
                      Coming Soon
                    </Badge>
                  </div>
                </div>
              </div>
              
              <Button variant="outline" onClick={() => setShowMethodSelection(false)} className="w-full">
                Cancel
              </Button>
            </div>
          ) : mfaSetup ? (
            /* QR Code Setup */
            <div className="space-y-4">
              {/* Step indicator */}
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="flex items-center gap-1">
                  <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs">✓</div>
                  <span className="text-xs text-slate-500">Method</span>
                </div>
                <div className="w-8 h-0.5 bg-purple-500" />
                <div className="flex items-center gap-1">
                  <div className="w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs">2</div>
                  <span className="text-xs text-purple-600 font-medium">Scan</span>
                </div>
                <div className="w-8 h-0.5 bg-slate-200" />
                <div className="flex items-center gap-1">
                  <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-xs">3</div>
                  <span className="text-xs text-slate-400">Verify</span>
                </div>
              </div>
              
              <div className="p-4 bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800 rounded-lg">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-white dark:bg-slate-800 rounded-lg">
                    <QrCode className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-purple-900 dark:text-purple-300 mb-2">
                      Step 2: Scan QR Code
                    </h4>
                    <p className="text-sm text-purple-700 dark:text-purple-400 mb-4">
                      Open your authenticator app and scan this QR code to add your account.
                    </p>
                    <div className="flex justify-center mb-4">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <img src={mfaSetup.qrCode} alt="2FA QR Code" className="w-48 h-48 rounded" />
                      </div>
                    </div>
                    <div className="mb-4">
                      <Label className="text-purple-700 dark:text-purple-300 text-xs">
                        Can&apos;t scan? Enter this code manually:
                      </Label>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="flex-1 p-2 bg-white dark:bg-slate-800 rounded text-xs font-mono break-all border">
                          {mfaSetup.secret}
                        </code>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(mfaSetup.secret);
                            toast.success("Secret copied to clipboard");
                          }}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-purple-700 dark:text-purple-300 text-sm">
                        Step 3: Enter the 6-digit code from your app
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          value={verifyCode}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, "");
                            setVerifyCode(value);
                            setMfaError(null);
                          }}
                          placeholder="000000"
                          maxLength={6}
                          className="flex-1 text-center text-lg tracking-widest font-mono"
                          autoComplete="one-time-code"
                        />
                        <Button
                          onClick={handleVerifyMfa}
                          disabled={verifyCode.length !== 6 || verifyingMfa}
                        >
                          {verifyingMfa ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify"}
                        </Button>
                        <Button variant="outline" onClick={handleCancelMfaSetup}>
                          Cancel
                        </Button>
                      </div>
                      <p className="text-xs text-purple-600 dark:text-purple-400">
                        The code changes every 30 seconds
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : mfaFactors.length > 0 ? (
            <div className="space-y-4">
              {/* MFA Status */}
              {mfaFactors.map((factor) => (
                <div
                  key={factor.id}
                  className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-green-500" />
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
                    onClick={() => handleDisableClick(factor.id)}
                    className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                </div>
              ))}

              {/* Recovery Codes Section */}
              <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Key className="h-5 w-5 text-amber-500" />
                      <h4 className="font-medium text-slate-900 dark:text-white">
                        Recovery Codes
                      </h4>
                      {recoveryCodesCount > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {recoveryCodesCount} remaining
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Recovery codes can be used to access your account if you lose your authenticator app.
                      {recoveryCodesCount <= 3 && recoveryCodesCount > 0 && (
                        <span className="text-amber-600 dark:text-amber-400 font-medium">
                          {" "}You&apos;re running low on codes!
                        </span>
                      )}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleRegenerateRecoveryCodes}
                    disabled={loadingRecoveryCodes}
                  >
                    {loadingRecoveryCodes ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    {recoveryCodesCount > 0 ? "Regenerate" : "Generate"}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            /* No 2FA enabled - show setup option */
            <div className="space-y-4">
              <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <ShieldAlert className="h-5 w-5 text-amber-500" />
                      <h4 className="font-medium text-slate-900 dark:text-white">
                        Two-Factor Authentication Not Enabled
                      </h4>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Add an extra layer of security to your account. You&apos;ll need to enter a verification code each time you sign in.
                    </p>
                  </div>
                  <Button onClick={() => setShowMethodSelection(true)}>
                    <Shield className="h-4 w-4 mr-2" />
                    Enable 2FA
                  </Button>
                </div>
              </div>
              
              {/* Available Methods Preview */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Available Methods</h4>
                <div className="grid gap-2 md:grid-cols-3">
                  <div className="flex items-center gap-2 p-2 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700">
                    <Smartphone className="h-4 w-4 text-purple-500" />
                    <span className="text-xs text-slate-600 dark:text-slate-400">Authenticator App</span>
                    <Badge className="ml-auto text-[10px] bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                      Available
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 opacity-60">
                    <MessageSquare className="h-4 w-4 text-slate-400" />
                    <span className="text-xs text-slate-400">SMS</span>
                    <Badge variant="outline" className="ml-auto text-[10px] text-slate-400 border-slate-300">
                      Soon
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 opacity-60">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <span className="text-xs text-slate-400">Email</span>
                    <Badge variant="outline" className="ml-auto text-[10px] text-slate-400 border-slate-300">
                      Soon
                    </Badge>
                  </div>
                </div>
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

      {/* Recovery Codes Dialog */}
      <Dialog open={showRecoveryCodesDialog} onOpenChange={setShowRecoveryCodesDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-amber-500" />
              Your Recovery Codes
            </DialogTitle>
            <DialogDescription>
              Save these codes in a safe place. Each code can only be used once to sign in if you lose access to your authenticator app.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  <strong>Important:</strong> These codes will only be shown once. Make sure to save them now!
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg font-mono text-sm">
              {recoveryCodes.map((code, index) => (
                <div key={index} className="p-2 bg-white dark:bg-slate-900 rounded border text-center">
                  {code}
                </div>
              ))}
            </div>
          </div>
          
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={handleCopyRecoveryCodes} className="w-full sm:w-auto">
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
            <Button variant="outline" onClick={handleDownloadRecoveryCodes} className="w-full sm:w-auto">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button onClick={() => setShowRecoveryCodesDialog(false)} className="w-full sm:w-auto">
              I&apos;ve saved my codes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Disable 2FA Dialog */}
      <Dialog open={showConfirmDisableDialog} onOpenChange={setShowConfirmDisableDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <ShieldAlert className="h-5 w-5" />
              Disable Two-Factor Authentication?
            </DialogTitle>
            <DialogDescription>
              This will remove the extra layer of security from your account. Your recovery codes will also be invalidated.
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-800 dark:text-red-200">
                Without 2FA, your account will only be protected by your password. We strongly recommend keeping 2FA enabled.
              </p>
            </div>
          </div>
          
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowConfirmDisableDialog(false);
                setFactorToDisable(null);
              }}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => factorToDisable && handleUnenrollMfa(factorToDisable)}
              disabled={unenrollingMfa !== null}
              className="w-full sm:w-auto"
            >
              {unenrollingMfa ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Disable 2FA
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AAL2 Verification Dialog - Required before disabling MFA */}
      <Dialog open={showAal2Dialog} onOpenChange={(open) => {
        setShowAal2Dialog(open);
        if (!open) {
          setAal2VerifyCode("");
          setAal2ChallengeId(null);
          setMfaError(null);
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-500" />
              Verify Your Identity
            </DialogTitle>
            <DialogDescription>
              For security, please enter the 6-digit code from your authenticator app to confirm you want to disable 2FA.
            </DialogDescription>
          </DialogHeader>
          
          {mfaError && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 dark:text-red-300">{mfaError}</p>
              </div>
            </div>
          )}
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="aal2-code">Verification Code</Label>
              <Input
                id="aal2-code"
                value={aal2VerifyCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  setAal2VerifyCode(value);
                  setMfaError(null);
                }}
                placeholder="000000"
                maxLength={6}
                className="text-center text-lg tracking-widest font-mono"
                autoComplete="one-time-code"
                autoFocus
              />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Enter the code from your authenticator app
              </p>
            </div>
          </div>
          
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowAal2Dialog(false);
                setAal2VerifyCode("");
                setAal2ChallengeId(null);
                setFactorToDisable(null);
                setMfaError(null);
              }}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleAal2VerifyAndUnenroll}
              disabled={aal2VerifyCode.length !== 6 || verifyingAal2}
              className="w-full sm:w-auto"
            >
              {verifyingAal2 ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Verify & Disable 2FA
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
