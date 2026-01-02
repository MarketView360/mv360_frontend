"use client";

import { useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useProfile } from "@/hooks/useProfile";
import { useAIPreferences } from "@/hooks/useAIPreferences";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sparkles,
  Settings as SettingsIcon,
  Shield,
  Key,
  Wrench,
  Eye,
  EyeOff,
  Check,
  Loader2,
  ExternalLink,
  Lock,
  Crown,
  AlertCircle,
  Search,
  TrendingUp,
  Briefcase,
  Newspaper,
} from "lucide-react";
import { toast } from "sonner";

export default function JovanAIPage() {
  const { session } = useAuth();
  const { profile, loading: profileLoading } = useProfile(session?.access_token || null);
  const { preferences, byokKeys, loading: prefsLoading, updatePreferences } = useAIPreferences(session?.access_token || null);
  
  const [groqKey, setGroqKey] = useState("");
  const [showGroqKey, setShowGroqKey] = useState(false);
  const [openrouterKey, setOpenrouterKey] = useState("");
  const [showOpenrouterKey, setShowOpenrouterKey] = useState(false);
  const [bytezKey, setBytezKey] = useState("");
  const [showBytezKey, setShowBytezKey] = useState(false);
  const [savingApiKey, setSavingApiKey] = useState<string | null>(null);

  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  const isPremium = profile?.subscription_tier === "premium";
  const loading = profileLoading || prefsLoading;

  const saveApiKey = async (provider: "groq" | "openrouter" | "bytez", key: string) => {
    if (!session?.access_token || !key.trim()) return;

    setSavingApiKey(provider);

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

      if (provider === "groq") setGroqKey("");
      if (provider === "openrouter") setOpenrouterKey("");
      if (provider === "bytez") setBytezKey("");
      
      toast.success("API key saved securely");
    } catch {
      toast.error("Failed to save API key");
    } finally {
      setSavingApiKey(null);
    }
  };

  const deleteApiKey = async (provider: "groq" | "openrouter" | "bytez") => {
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

      toast.success("API key removed");
    } catch {
      toast.error("Failed to delete API key");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Jovan AI</h2>
          <Badge className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-0 font-semibold">
            <Sparkles className="h-3 w-3 mr-1" />
            AI Assistant
          </Badge>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Configure your AI assistant preferences and capabilities
        </p>
      </div>

      <Tabs defaultValue="preferences" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <SettingsIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Preferences</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Data Security</span>
          </TabsTrigger>
          <TabsTrigger value="byok" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            <span className="hidden sm:inline">BYOK</span>
          </TabsTrigger>
          <TabsTrigger value="capabilities" className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            <span className="hidden sm:inline">Capabilities</span>
          </TabsTrigger>
        </TabsList>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6">
          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <SettingsIcon className="h-5 w-5 text-brand" />
                AI Preferences
              </CardTitle>
              <CardDescription>Customize how Jovan AI behaves</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <div>
                  <Label className="font-medium text-slate-900 dark:text-white">Auto-Routing</Label>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Automatically select the best AI model for your query
                  </p>
                </div>
                <Switch
                  checked={preferences?.autoRoutingEnabled ?? true}
                  onCheckedChange={async (checked) => {
                    const success = await updatePreferences({ autoRoutingEnabled: checked });
                    if (success) toast.success("Preference updated");
                  }}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <div>
                  <Label className="font-medium text-slate-900 dark:text-white">Voice Input</Label>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Enable voice input for chat messages
                  </p>
                </div>
                <Switch
                  checked={preferences?.voiceInputEnabled ?? false}
                  onCheckedChange={async (checked) => {
                    const success = await updatePreferences({ voiceInputEnabled: checked });
                    if (success) toast.success("Preference updated");
                  }}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <div>
                  <Label className="font-medium text-slate-900 dark:text-white">Auto-Speak</Label>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Automatically read AI responses aloud
                  </p>
                </div>
                <Switch
                  checked={preferences?.autoSpeakEnabled ?? false}
                  onCheckedChange={async (checked) => {
                    const success = await updatePreferences({ autoSpeakEnabled: checked });
                    if (success) toast.success("Preference updated");
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="h-5 w-5 text-green-500" />
                Data Security & Privacy
              </CardTitle>
              <CardDescription>How we protect your AI data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <Lock className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                  <div className="space-y-2">
                    <h4 className="font-medium text-green-900 dark:text-green-300">
                      Your conversations are private
                    </h4>
                    <ul className="text-sm text-green-700 dark:text-green-400 space-y-1">
                      <li>• All chat data is encrypted at rest and in transit</li>
                      <li>• We never train AI models on your conversations</li>
                      <li>• Your data is never shared with third parties</li>
                      <li>• You can delete all chat history at any time</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <h4 className="font-medium text-slate-900 dark:text-white mb-1">Encryption</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    AES-256 encryption for all stored data
                  </p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <h4 className="font-medium text-slate-900 dark:text-white mb-1">Compliance</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    GDPR and CCPA compliant data handling
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* BYOK Tab */}
        <TabsContent value="byok" className="space-y-6">
          {!isPremium && (
            <Card className="border-2 border-brand/20 bg-blue-50 dark:bg-blue-950/20">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-brand/10 rounded-lg">
                    <Crown className="h-6 w-6 text-brand" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                      Premium Feature
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                      BYOK (Bring Your Own Keys) allows you to use your own AI API keys for unlimited usage at your own cost. This feature is available exclusively for Premium subscribers.
                    </p>
                    <Button className="bg-brand hover:bg-brand/90 text-white font-semibold">
                      <Crown className="h-4 w-4 mr-2" />
                      Upgrade to Premium
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {isPremium && (
            <>
              <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Key className="h-5 w-5 text-brand" />
                    Bring Your Own Keys
                    <Badge className="ml-2 bg-brand/10 text-brand border-brand/20">
                      Premium
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Use your own API keys for unlimited AI usage at your own cost
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                      <div>
                        <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">
                          How BYOK Works
                        </h4>
                        <p className="text-sm text-blue-700 dark:text-blue-400">
                          When you configure your own API keys, Jovan AI will use them instead of our shared quota. You will be charged directly by the AI provider based on your usage. Your keys are encrypted and stored securely.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Groq API Key */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                        <div className="h-4 w-4 bg-brand rounded" />
                        Groq API Key
                        {byokKeys?.groq && (
                          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-0">
                            <Check className="h-3 w-3 mr-1" /> Configured
                          </Badge>
                        )}
                      </Label>
                      {byokKeys?.groq && (
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
                          placeholder={byokKeys?.groq ? "••••••••••••••••" : "gsk_..."}
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
                      <Button
                        onClick={() => saveApiKey("groq", groqKey)}
                        disabled={!groqKey.trim() || savingApiKey === "groq"}
                        className="bg-brand hover:bg-brand/90"
                      >
                        {savingApiKey === "groq" ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-slate-400">
                      Get your API key from{" "}
                      <a
                        href="https://console.groq.com/keys"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand hover:underline"
                      >
                        console.groq.com <ExternalLink className="h-3 w-3 inline" />
                      </a>
                    </p>
                  </div>

                  {/* OpenRouter API Key */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                        <div className="h-4 w-4 bg-blue-500 rounded" />
                        OpenRouter API Key
                        {byokKeys?.openrouter && (
                          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-0">
                            <Check className="h-3 w-3 mr-1" /> Configured
                          </Badge>
                        )}
                      </Label>
                      {byokKeys?.openrouter && (
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
                          placeholder={byokKeys?.openrouter ? "••••••••••••••••" : "sk-or-..."}
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
                      <Button
                        onClick={() => saveApiKey("openrouter", openrouterKey)}
                        disabled={!openrouterKey.trim() || savingApiKey === "openrouter"}
                        className="bg-brand hover:bg-brand/90"
                      >
                        {savingApiKey === "openrouter" ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-slate-400">
                      Access 100+ models. Get your key from{" "}
                      <a
                        href="https://openrouter.ai/keys"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand hover:underline"
                      >
                        openrouter.ai <ExternalLink className="h-3 w-3 inline" />
                      </a>
                    </p>
                  </div>

                  {/* Bytez API Key */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                        <div className="h-4 w-4 bg-emerald-500 rounded" />
                        Bytez API Key
                        {byokKeys?.bytez && (
                          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-0">
                            <Check className="h-3 w-3 mr-1" /> Configured
                          </Badge>
                        )}
                      </Label>
                      {byokKeys?.bytez && (
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
                          placeholder={byokKeys?.bytez ? "••••••••••••••••" : "bytez_..."}
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
                      <Button
                        onClick={() => saveApiKey("bytez", bytezKey)}
                        disabled={!bytezKey.trim() || savingApiKey === "bytez"}
                        className="bg-brand hover:bg-brand/90"
                      >
                        {savingApiKey === "bytez" ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-slate-400">
                      AI infrastructure provider. Get your key from{" "}
                      <a
                        href="https://bytez.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand hover:underline"
                      >
                        bytez.com <ExternalLink className="h-3 w-3 inline" />
                      </a>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Capabilities Tab */}
        <TabsContent value="capabilities" className="space-y-6">
          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Wrench className="h-5 w-5 text-brand" />
                AI Tool Permissions
              </CardTitle>
              <CardDescription>Control which tools Jovan AI can use to assist you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <Label className="font-medium text-slate-900 dark:text-white">Run Stock Screener</Label>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Allow Jovan to search and filter stocks based on criteria
                    </p>
                  </div>
                </div>
                <Switch
                  checked={preferences?.toolPermissions?.screener ?? true}
                  onCheckedChange={async (checked) => {
                    const success = await updatePreferences({ 
                      toolPermissions: { ...preferences?.toolPermissions, screener: checked }
                    });
                    if (success) toast.success("Permission updated");
                  }}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Search className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <Label className="font-medium text-slate-900 dark:text-white">Search Internet</Label>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Allow Jovan to search the web for real-time information
                    </p>
                  </div>
                </div>
                <Switch
                  checked={preferences?.toolPermissions?.webSearch ?? true}
                  onCheckedChange={async (checked) => {
                    const success = await updatePreferences({ 
                      toolPermissions: { ...preferences?.toolPermissions, webSearch: checked }
                    });
                    if (success) toast.success("Permission updated");
                  }}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Briefcase className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <Label className="font-medium text-slate-900 dark:text-white">Access Portfolio</Label>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Allow Jovan to view and analyze your portfolio holdings
                    </p>
                  </div>
                </div>
                <Switch
                  checked={preferences?.toolPermissions?.portfolio ?? true}
                  onCheckedChange={async (checked) => {
                    const success = await updatePreferences({ 
                      toolPermissions: { ...preferences?.toolPermissions, portfolio: checked }
                    });
                    if (success) toast.success("Permission updated");
                  }}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                    <Newspaper className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <Label className="font-medium text-slate-900 dark:text-white">Fetch News & Reports</Label>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Allow Jovan to retrieve market news and earnings reports
                    </p>
                  </div>
                </div>
                <Switch
                  checked={preferences?.toolPermissions?.news ?? true}
                  onCheckedChange={async (checked) => {
                    const success = await updatePreferences({ 
                      toolPermissions: { ...preferences?.toolPermissions, news: checked }
                    });
                    if (success) toast.success("Permission updated");
                  }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">
                    About Tool Permissions
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    Disabling tools will limit Jovan AI&apos;s ability to provide comprehensive answers. Tools are only used when relevant to your query and always with your data privacy in mind.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
