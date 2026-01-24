"use client";

import { useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Lock, MessageSquare, Trash2, AlertTriangle, Shield, Database, Eye } from "lucide-react";
import { toast } from "sonner";
import { aiApi } from "@/lib/api/ai";

export default function PrivacyPage() {
  const { session } = useAuth();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  const deleteAllChats = async () => {
    if (!session?.access_token || deleteConfirmText !== "DELETE") return;

    setDeleting(true);

    try {
      const result = await aiApi.deleteAllSessions();
      setShowDeleteConfirm(false);
      setDeleteConfirmText("");
      toast.success(`Deleted ${result.deletedSessions} sessions and ${result.deletedMessages} messages`);
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

      {/* Privacy Policy */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="h-5 w-5 text-blue-500" />
            Privacy Resources
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <a
            href="/privacy-policy"
            className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          >
            <span className="font-medium text-slate-900 dark:text-white">Privacy Policy</span>
            <Badge variant="outline">View</Badge>
          </a>
          <a
            href="/terms"
            className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          >
            <span className="font-medium text-slate-900 dark:text-white">Terms of Service</span>
            <Badge variant="outline">View</Badge>
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
