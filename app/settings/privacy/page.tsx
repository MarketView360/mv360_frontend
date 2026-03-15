"use client";

import { useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Lock,
  MessageSquare,
  Trash2,
  AlertTriangle,
  Shield,
  Database,
  Eye,
  Download,
  Loader2,
  Clock,
  UserX,
  FileText,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { aiApi } from "@/lib/api/ai";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export default function PrivacyPage() {
  const { session } = useAuth();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  
  // Data export state
  const [exporting, setExporting] = useState(false);
  
  // Account deletion state
  const [showAccountDeleteConfirm, setShowAccountDeleteConfirm] = useState(false);
  const [accountDeleteConfirmText, setAccountDeleteConfirmText] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);

  const handleExportData = async () => {
    if (!session?.access_token || !API_BASE) return;
    
    setExporting(true);
    try {
      const res = await fetch(`${API_BASE}/profile/data/export`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      
      if (!res.ok) throw new Error("Export failed");
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `marketview360-data-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success("Your data has been exported");
    } catch {
      toast.error("Failed to export data");
    } finally {
      setExporting(false);
    }
  };

  const handleRequestAccountDeletion = async () => {
    if (!session?.access_token || !API_BASE || accountDeleteConfirmText !== "DELETE MY ACCOUNT") return;
    
    setDeletingAccount(true);
    try {
      const res = await fetch(`${API_BASE}/profile/data/delete-account`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      
      if (!res.ok) throw new Error("Request failed");
      
      const data = await res.json();
      toast.success(data.message);
      setShowAccountDeleteConfirm(false);
      setAccountDeleteConfirmText("");
    } catch {
      toast.error("Failed to request account deletion");
    } finally {
      setDeletingAccount(false);
    }
  };

  const deleteAllChats = async () => {
    if (!session?.access_token || deleteConfirmText !== "DELETE") return;

    setDeleting(true);

    try {
      const result = await aiApi.deleteAllSessions();
      setShowDeleteConfirm(false);
      setDeleteConfirmText("");
      toast.success(`Deleted ${result.deletedCount} chat sessions`);
    } catch {
      toast.error("Failed to delete chat history");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Privacy</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your data and privacy settings
        </p>
      </div>

      {/* Data Privacy */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="h-5 w-5 text-green-500" />
            Data Privacy
          </CardTitle>
          <CardDescription>How we handle your data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-start gap-3">
              <Lock className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
              <div className="space-y-2">
                <h4 className="font-medium text-green-900 dark:text-green-300">
                  Your data is secure
                </h4>
                <ul className="text-sm text-green-700 dark:text-green-400 space-y-1">
                  <li>• All data is encrypted in transit and at rest</li>
                  <li>• We never sell your personal information</li>
                  <li>• Your chat history is private and not shared</li>
                  <li>• API keys are securely encrypted</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Database className="h-4 w-4 text-slate-400" />
                <h4 className="font-medium text-slate-900 dark:text-white">Data Storage</h4>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Your data is stored securely in encrypted databases
              </p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="h-4 w-4 text-slate-400" />
                <h4 className="font-medium text-slate-900 dark:text-white">Data Access</h4>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Only you can access your personal data and chats
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageSquare className="h-5 w-5 text-purple-500" />
            Chat History
          </CardTitle>
          <CardDescription>Manage your AI chat data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!showDeleteConfirm ? (
            <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h4 className="font-medium text-slate-900 dark:text-white mb-1">
                    Delete All Chat History
                  </h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Permanently remove all your chat sessions and messages. This action cannot be undone.
                  </p>
                </div>
                <Button
                  onClick={() => setShowDeleteConfirm(true)}
                  variant="outline"
                  className="shrink-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-800"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg space-y-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-red-700 dark:text-red-300">
                    This action cannot be undone
                  </p>
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                    All your chat sessions, messages, and reasoning quota will be permanently deleted.
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-red-700 dark:text-red-300 text-sm">
                  Type DELETE to confirm
                </Label>
                <Input
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="DELETE"
                  className="border-red-300 dark:border-red-700"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteConfirmText("");
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={deleteAllChats}
                  disabled={deleteConfirmText !== "DELETE" || deleting}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  {deleting ? "Deleting..." : "Delete Everything"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Export (GDPR) */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Download className="h-5 w-5 text-blue-500" />
            Export Your Data
          </CardTitle>
          <CardDescription>Download a copy of all your data (GDPR compliant)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h4 className="font-medium text-slate-900 dark:text-white mb-1">
                  Download Your Data
                </h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Export all your personal data including profile, watchlists, saved screens, chat history, and settings in JSON format.
                </p>
              </div>
              <Button
                onClick={handleExportData}
                disabled={exporting}
                variant="outline"
                className="shrink-0"
              >
                {exporting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                {exporting ? "Exporting..." : "Export"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Retention */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5 text-amber-500" />
            Data Retention
          </CardTitle>
          <CardDescription>How long we keep your data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <h4 className="font-medium text-slate-900 dark:text-white mb-2">Active Account</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Your data is retained as long as your account is active and you continue to use our services.
                </p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <h4 className="font-medium text-slate-900 dark:text-white mb-2">After Deletion</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Personal data is deleted within 30 days. Some data may be retained for legal compliance (up to 7 years).
                </p>
              </div>
            </div>
            <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-900 dark:text-amber-300">Anonymized Data</h4>
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    Anonymized analytics data (which cannot identify you) may be retained indefinitely to improve our services.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Deletion (GDPR/CCPA) */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <UserX className="h-5 w-5 text-red-500" />
            Delete Account
          </CardTitle>
          <CardDescription>Permanently delete your account and all data</CardDescription>
        </CardHeader>
        <CardContent>
          {!showAccountDeleteConfirm ? (
            <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h4 className="font-medium text-slate-900 dark:text-white mb-1">
                    Request Account Deletion
                  </h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    This will schedule your account for permanent deletion. All your data including profile, watchlists, screens, and chat history will be removed after a 30-day grace period.
                  </p>
                </div>
                <Button
                  onClick={() => setShowAccountDeleteConfirm(true)}
                  variant="outline"
                  className="shrink-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-800"
                >
                  <UserX className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg space-y-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-red-700 dark:text-red-300">
                    This action will permanently delete your account
                  </p>
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                    After 30 days, all your data will be permanently removed and cannot be recovered. You can cancel this request by logging in before the deletion date.
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-red-700 dark:text-red-300 text-sm">
                  Type DELETE MY ACCOUNT to confirm
                </Label>
                <Input
                  value={accountDeleteConfirmText}
                  onChange={(e) => setAccountDeleteConfirmText(e.target.value)}
                  placeholder="DELETE MY ACCOUNT"
                  className="border-red-300 dark:border-red-700"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setShowAccountDeleteConfirm(false);
                    setAccountDeleteConfirmText("");
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleRequestAccountDeletion}
                  disabled={accountDeleteConfirmText !== "DELETE MY ACCOUNT" || deletingAccount}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  {deletingAccount ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    "Delete My Account"
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Privacy Resources */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="h-5 w-5 text-blue-500" />
            Privacy Resources
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <a
            href="/privacy"
            className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-slate-400" />
              <span className="font-medium text-slate-900 dark:text-white">Privacy Policy</span>
            </div>
            <ExternalLink className="h-4 w-4 text-slate-400" />
          </a>
          <a
            href="/terms"
            className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-slate-400" />
              <span className="font-medium text-slate-900 dark:text-white">Terms of Service</span>
            </div>
            <ExternalLink className="h-4 w-4 text-slate-400" />
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
