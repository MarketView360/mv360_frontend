"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import { useTheme } from "@/app/providers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Palette,
  Type,
  Wifi,
  Sparkles,
  Bell,
  Mail,
  Key,
  Trash2,
  Shield,
  AlertTriangle,
  Eye,
  EyeOff,
  Check,
  X,
  Loader2,
  ExternalLink,
  Monitor,
  Moon,
  Sun,
  Zap,
  LayoutGrid,
  MessageSquare,
  Lock,
  Calendar,
  Clock,
  CheckCircle,
} from "lucide-react";

interface UserSettings {
  theme: "light" | "dark" | "system";
  text_size: "small" | "medium" | "large";
  show_network_indicator: boolean;
  reduce_animations: boolean;
  compact_mode: boolean;
  desktop_notifications: boolean;
  email_notifications: boolean;
  use_custom_ai_keys: boolean;
  has_groq_key: boolean;
  has_openai_key: boolean;
  has_anthropic_key: boolean;
  has_openrouter_key: boolean;
  has_bytez_key: boolean;
}

interface AccountInfo {
  accountCreated: string;
  lastSignIn: string | null;
  emailVerified: boolean;
  provider: string;
  chatSessionsCount: number;
  totalMessages: number;
}

const DEFAULT_SETTINGS: UserSettings = {
  theme: "system",
  text_size: "medium",
  show_network_indicator: true,
  reduce_animations: false,
  compact_mode: false,
  desktop_notifications: false,
  email_notifications: false,
  use_custom_ai_keys: false,
  has_groq_key: false,
  has_openai_key: false,
  has_anthropic_key: false,
  has_openrouter_key: false,
  has_bytez_key: false,
};

export default function SettingsPage() {
  const { user, session, loading: authLoading, resetPassword } = useAuth();
  const { setTheme: applyTheme } = useTheme();
  const router = useRouter();

  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // API Key states
  const [groqKey, setGroqKey] = useState("");
  const [showGroqKey, setShowGroqKey] = useState(false);
  const [openrouterKey, setOpenrouterKey] = useState("");
  const [showOpenrouterKey, setShowOpenrouterKey] = useState(false);
  const [bytezKey, setBytezKey] = useState("");
  const [showBytezKey, setShowBytezKey] = useState(false);
  const [savingApiKey, setSavingApiKey] = useState<string | null>(null);

  // Delete chats confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  // Password reset
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const authProvider = (accountInfo?.provider || user?.app_metadata?.provider || "email").toLowerCase();
  const isOAuthUser = authProvider !== "email";
  const providerLabel = authProvider.charAt(0).toUpperCase() + authProvider.slice(1);

  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  const fetchSettings = useCallback(async () => {
    if (!session?.access_token) return;

    try {
      const [settingsRes, accountRes] = await Promise.all([
        fetch(`${apiBase}/settings`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }),
        fetch(`${apiBase}/settings/account-info`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }),
      ]);

      if (settingsRes.ok) {
        const data = await settingsRes.json();
        setSettings(data);
      }

      if (accountRes.ok) {
        const data = await accountRes.json();
        setAccountInfo(data);
      }
    } catch {
      setError("Failed to load settings");
    } finally {
      setLoading(false);
    }
  }, [session?.access_token, apiBase]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
      return;
    }

    if (session?.access_token) {
      fetchSettings();
    }
  }, [authLoading, user, session?.access_token, router, fetchSettings]);

  const updateSetting = async (key: keyof UserSettings, value: unknown) => {
    if (!session?.access_token) return;

    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`${apiBase}/settings`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ [key]: value }),
      });

      if (!res.ok) throw new Error("Failed to save");

      const updated = await res.json();
      setSettings(updated);

      // Apply theme change immediately
      if (key === "theme") {
        const themeValue = value as "light" | "dark" | "system";
        if (themeValue === "system") {
          const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
          applyTheme(prefersDark ? "dark" : "light");
        } else {
          applyTheme(themeValue);
        }
      }

      showSuccess("Setting saved");
    } catch {
      setError("Failed to save setting");
    } finally {
      setSaving(false);
    }
  };

  const saveApiKey = async (provider: "groq" | "openai" | "anthropic" | "openrouter" | "bytez", key: string) => {
    if (!session?.access_token || !key.trim()) return;

    setSavingApiKey(provider);
    setError(null);

    try {
      const res = await fetch(`${apiBase}/settings/api-key`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ provider, api_key: key }),
      });

      if (!res.ok) throw new Error("Failed to save API key");

      setSettings((prev) => ({ ...prev, [`has_${provider}_key`]: true }));
      // Clear the appropriate key input
      if (provider === "groq") setGroqKey("");
      if (provider === "openrouter") setOpenrouterKey("");
      if (provider === "bytez") setBytezKey("");
      showSuccess("API key saved securely");
    } catch {
      setError("Failed to save API key");
    } finally {
      setSavingApiKey(null);
    }
  };

  const deleteApiKey = async (provider: "groq" | "openai" | "anthropic" | "openrouter" | "bytez") => {
    if (!session?.access_token) return;

    try {
      const res = await fetch(`${apiBase}/settings/api-key`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ provider }),
      });

      if (!res.ok) throw new Error("Failed to delete API key");

      setSettings((prev) => ({ ...prev, [`has_${provider}_key`]: false }));
      showSuccess("API key removed");
    } catch {
      setError("Failed to delete API key");
    }
  };

  const deleteAllChats = async () => {
    if (!session?.access_token || deleteConfirmText !== "DELETE") return;

    setDeleting(true);
    setError(null);

    try {
      const res = await fetch(`${apiBase}/settings/chats`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (!res.ok) throw new Error("Failed to delete chats");

      const result = await res.json();
      setShowDeleteConfirm(false);
      setDeleteConfirmText("");
      showSuccess(`Deleted ${result.deletedSessions} sessions and ${result.deletedMessages} messages`);
      
      // Refresh account info
      fetchSettings();
    } catch {
      setError("Failed to delete chat history");
    } finally {
      setDeleting(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;

    if (isOAuthUser) {
      setError(`You signed in with ${providerLabel}. Password changes are managed by your sign-in provider.`);
      return;
    }

    try {
      await resetPassword(user.email);
      setResetEmailSent(true);
      showSuccess("Password reset email sent");
    } catch {
      setError("Failed to send reset email");
    }
  };

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const requestDesktopNotifications = async () => {
    if (!("Notification" in window)) {
      setError("Desktop notifications not supported in this browser");
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      updateSetting("desktop_notifications", true);
    } else {
      setError("Notification permission denied");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <div className="mx-auto max-w-4xl py-10 px-4 md:px-8 space-y-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-64" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  const themeIcon = {
    light: <Sun className="h-4 w-4" />,
    dark: <Moon className="h-4 w-4" />,
    system: <Monitor className="h-4 w-4" />,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="mx-auto max-w-4xl py-10 px-4 md:px-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Settings</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Customize your experience and manage your account
          </p>
        </div>

        {/* Notifications */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
            <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
            <button onClick={() => setError(null)} className="ml-auto">
              <X className="h-4 w-4 text-red-500" />
            </button>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
            <p className="text-green-700 dark:text-green-300 text-sm">{successMessage}</p>
          </div>
        )}

        {/* Appearance */}
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-slate-900 dark:text-white">
              <Palette className="h-5 w-5" />
              Appearance
            </CardTitle>
            <CardDescription>Customize how the app looks and feels</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Theme */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  {themeIcon[settings.theme]}
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Theme</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Choose your preferred color scheme
                  </p>
                </div>
              </div>
              <Select
                value={settings.theme}
                onValueChange={(value) => updateSetting("theme", value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <div className="flex items-center gap-2">
                      <Sun className="h-4 w-4" /> Light
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center gap-2">
                      <Moon className="h-4 w-4" /> Dark
                    </div>
                  </SelectItem>
                  <SelectItem value="system">
                    <div className="flex items-center gap-2">
                      <Monitor className="h-4 w-4" /> System
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Text Size */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Type className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Text Size</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Adjust the default text size
                  </p>
                </div>
              </div>
              <Select
                value={settings.text_size}
                onValueChange={(value) => updateSetting("text_size", value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Network Indicator */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Wifi className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Network Indicator</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Show connection status in the interface
                  </p>
                </div>
              </div>
              <Switch
                checked={settings.show_network_indicator}
                onCheckedChange={(checked) => updateSetting("show_network_indicator", checked)}
              />
            </div>

            {/* Reduce Animations */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                  <Zap className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Reduce Animations</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Minimize motion for accessibility
                  </p>
                </div>
              </div>
              <Switch
                checked={settings.reduce_animations}
                onCheckedChange={(checked) => updateSetting("reduce_animations", checked)}
              />
            </div>

            {/* Compact Mode */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                  <LayoutGrid className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Compact Mode</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Use smaller spacing and elements
                  </p>
                </div>
              </div>
              <Switch
                checked={settings.compact_mode}
                onCheckedChange={(checked) => updateSetting("compact_mode", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* AI Configuration (BYOK) */}
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-slate-900 dark:text-white">
              <Key className="h-5 w-5" />
              AI Configuration
              <Badge className="ml-2 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                BYOK
              </Badge>
            </CardTitle>
            <CardDescription>
              Bring Your Own Keys - Use your own API keys for AI features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Use Custom Keys Toggle */}
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Use Custom AI Keys</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Enable to use your own API keys instead of shared quota
                  </p>
                </div>
              </div>
              <Switch
                checked={settings.use_custom_ai_keys}
                onCheckedChange={(checked) => updateSetting("use_custom_ai_keys", checked)}
              />
            </div>

            {/* Groq API Key */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <div className="h-4 w-4 bg-purple-600 rounded" />
                  Groq API Key
                  {settings.has_groq_key && (
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                      <Check className="h-3 w-3 mr-1" /> Configured
                    </Badge>
                  )}
                </Label>
                {settings.has_groq_key && (
                  <button
                    onClick={() => deleteApiKey("groq")}
                    className="text-xs text-red-500 hover:text-red-600"
                  >
                    Remove
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    type={showGroqKey ? "text" : "password"}
                    value={groqKey}
                    onChange={(e) => setGroqKey(e.target.value)}
                    placeholder={settings.has_groq_key ? "••••••••••••••••" : "gsk_..."}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowGroqKey(!showGroqKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showGroqKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <button
                  onClick={() => saveApiKey("groq", groqKey)}
                  disabled={!groqKey.trim() || savingApiKey === "groq"}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {savingApiKey === "groq" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  Save
                </button>
              </div>
              <p className="text-xs text-slate-400">
                Get your API key from{" "}
                <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" className="text-purple-500 hover:underline">
                  console.groq.com <ExternalLink className="h-3 w-3 inline" />
                </a>
              </p>
            </div>

            {/* OpenRouter API Key */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <div className="h-4 w-4 bg-gradient-to-br from-blue-500 to-purple-500 rounded" />
                  OpenRouter API Key
                  {settings.has_openrouter_key && (
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                      <Check className="h-3 w-3 mr-1" /> Configured
                    </Badge>
                  )}
                </Label>
                {settings.has_openrouter_key && (
                  <button
                    onClick={() => deleteApiKey("openrouter")}
                    className="text-xs text-red-500 hover:text-red-600"
                  >
                    Remove
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    type={showOpenrouterKey ? "text" : "password"}
                    value={openrouterKey}
                    onChange={(e) => setOpenrouterKey(e.target.value)}
                    placeholder={settings.has_openrouter_key ? "••••••••••••••••" : "sk-or-..."}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOpenrouterKey(!showOpenrouterKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showOpenrouterKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <button
                  onClick={() => saveApiKey("openrouter", openrouterKey)}
                  disabled={!openrouterKey.trim() || savingApiKey === "openrouter"}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {savingApiKey === "openrouter" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  Save
                </button>
              </div>
              <p className="text-xs text-slate-400">
                Access 100+ models. Get your key from{" "}
                <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-purple-500 hover:underline">
                  openrouter.ai <ExternalLink className="h-3 w-3 inline" />
                </a>
              </p>
            </div>

            {/* Bytez API Key */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <div className="h-4 w-4 bg-gradient-to-br from-emerald-500 to-teal-500 rounded" />
                  Bytez API Key
                  {settings.has_bytez_key && (
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                      <Check className="h-3 w-3 mr-1" /> Configured
                    </Badge>
                  )}
                </Label>
                {settings.has_bytez_key && (
                  <button
                    onClick={() => deleteApiKey("bytez")}
                    className="text-xs text-red-500 hover:text-red-600"
                  >
                    Remove
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    type={showBytezKey ? "text" : "password"}
                    value={bytezKey}
                    onChange={(e) => setBytezKey(e.target.value)}
                    placeholder={settings.has_bytez_key ? "••••••••••••••••" : "bytez_..."}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowBytezKey(!showBytezKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showBytezKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <button
                  onClick={() => saveApiKey("bytez", bytezKey)}
                  disabled={!bytezKey.trim() || savingApiKey === "bytez"}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {savingApiKey === "bytez" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  Save
                </button>
              </div>
              <p className="text-xs text-slate-400">
                AI infrastructure provider. Get your key from{" "}
                <a href="https://bytez.com" target="_blank" rel="noopener noreferrer" className="text-purple-500 hover:underline">
                  bytez.com <ExternalLink className="h-3 w-3 inline" />
                </a>
              </p>
            </div>

            {/* Coming Soon: OpenAI & Anthropic */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 border border-dashed border-slate-200 dark:border-slate-700 rounded-lg opacity-60">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-4 w-4 bg-slate-200 dark:bg-slate-700 rounded" />
                  <span className="font-medium text-slate-600 dark:text-slate-400">OpenAI</span>
                  <Badge variant="outline" className="text-xs">Coming Soon</Badge>
                </div>
                <p className="text-xs text-slate-400">GPT-4o, GPT-4 Turbo support</p>
              </div>
              <div className="p-4 border border-dashed border-slate-200 dark:border-slate-700 rounded-lg opacity-60">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-4 w-4 bg-slate-200 dark:bg-slate-700 rounded" />
                  <span className="font-medium text-slate-600 dark:text-slate-400">Anthropic</span>
                  <Badge variant="outline" className="text-xs">Coming Soon</Badge>
                </div>
                <p className="text-xs text-slate-400">Claude 3.5 Sonnet support</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-slate-900 dark:text-white">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>Manage how you receive updates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Desktop Notifications */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Monitor className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Desktop Notifications</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Receive browser notifications for important updates
                  </p>
                </div>
              </div>
              <Switch
                checked={settings.desktop_notifications}
                onCheckedChange={(checked) => {
                  if (checked) {
                    requestDesktopNotifications();
                  } else {
                    updateSetting("desktop_notifications", false);
                  }
                }}
              />
            </div>

            {/* Email Notifications */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Mail className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Email Notifications</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Consent to receive important emails about your account
                  </p>
                </div>
              </div>
              <Switch
                checked={settings.email_notifications}
                onCheckedChange={(checked) => updateSetting("email_notifications", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-slate-900 dark:text-white">
              <MessageSquare className="h-5 w-5" />
              Data Management
            </CardTitle>
            <CardDescription>Manage your chat history and data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {accountInfo && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500 dark:text-slate-400">Chat Sessions</p>
                    <p className="font-semibold text-slate-900 dark:text-white">{accountInfo.chatSessionsCount}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 dark:text-slate-400">Total Messages</p>
                    <p className="font-semibold text-slate-900 dark:text-white">{accountInfo.totalMessages}</p>
                  </div>
                </div>
              </div>
            )}

            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                Delete All Chat History
              </button>
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
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeleteConfirmText("");
                    }}
                    className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={deleteAllChats}
                    disabled={deleteConfirmText !== "DELETE" || deleting}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    Delete Everything
                  </button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Account Security */}
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-slate-900 dark:text-white">
              <Shield className="h-5 w-5" />
              Account Security
            </CardTitle>
            <CardDescription>Manage your account security settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {accountInfo && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <div className="text-sm">
                    <p className="text-slate-500 dark:text-slate-400">Account Created</p>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {new Date(accountInfo.accountCreated).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <Clock className="h-4 w-4 text-slate-400" />
                  <div className="text-sm">
                    <p className="text-slate-500 dark:text-slate-400">Last Sign In</p>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {accountInfo.lastSignIn
                        ? new Date(accountInfo.lastSignIn).toLocaleDateString()
                        : "—"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Password Reset */}
            {!isOAuthUser ? (
              <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <Lock className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">Change Password</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Send a password reset link to your email
                    </p>
                  </div>
                </div>
                <button
                  onClick={handlePasswordReset}
                  disabled={resetEmailSent}
                  className="px-4 py-2 text-sm bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50"
                >
                  {resetEmailSent ? "Email Sent" : "Send Reset Link"}
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <Lock className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">Password</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      You signed in with {providerLabel}. Manage your password in your {providerLabel} account.
                    </p>
                  </div>
                </div>
                <Link
                  href="/contact"
                  className="px-4 py-2 text-sm bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  Contact Support
                </Link>
              </div>
            )}

            {/* Auth Provider */}
            {accountInfo && (
              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <div className="text-sm">
                  <p className="text-slate-500 dark:text-slate-400">Sign-in Method</p>
                  <p className="font-medium text-slate-900 dark:text-white capitalize">
                    {accountInfo.provider}
                    {accountInfo.emailVerified && (
                      <Badge className="ml-2 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 text-xs">
                        Verified
                      </Badge>
                    )}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
