"use client";

import { useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Lock, Key, CheckCircle, ExternalLink, Clock, Calendar } from "lucide-react";
import { toast } from "sonner";

export default function SecurityPage() {
  const { user, resetPassword } = useAuth();
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const authProvider = (user?.app_metadata?.provider || "email").toLowerCase();
  const isOAuthUser = authProvider !== "email";
  const providerLabel = authProvider.charAt(0).toUpperCase() + authProvider.slice(1);

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

      {/* Session Information */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5 text-purple-500" />
            Session Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
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
                <Shield className="h-4 w-4 text-slate-400" />
                <p className="text-sm text-slate-500 dark:text-slate-400">Account Status</p>
              </div>
              <p className="font-medium text-green-600 dark:text-green-400">
                Active & Secure
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
