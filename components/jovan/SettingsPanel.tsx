"use client";

import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Zap, 
  Globe, 
  Calculator, 
  Key, 
  Eye, 
  EyeOff, 
  Check, 
  Loader2,
  ExternalLink,
  Trash2,
  Settings,
} from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";

interface ApiKeyStatus {
  has_groq_key: boolean;
  has_openrouter_key: boolean;
  has_bytez_key: boolean;
  use_custom_ai_keys: boolean;
}

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000";

export function SettingsPanel({
  reasoningEnabled,
  onReasoningChange,
  quota,
}: {
  reasoningEnabled: boolean;
  onReasoningChange: (v: boolean) => void;
  quota: { used: number; limit: number; resetsAt: string };
}) {
  const { session } = useAuth();
  const token = session?.access_token;
  
  const canUseReasoning = quota.used < quota.limit;
  
  // BYOK State
  const [showByok, setShowByok] = useState(false);
  const [apiKeyStatus, setApiKeyStatus] = useState<ApiKeyStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);
  
  // Key input states
  const [groqKey, setGroqKey] = useState("");
  const [openrouterKey, setOpenrouterKey] = useState("");
  const [bytezKey, setBytezKey] = useState("");
  const [showGroqKey, setShowGroqKey] = useState(false);
  const [showOpenrouterKey, setShowOpenrouterKey] = useState(false);
  const [showBytezKey, setShowBytezKey] = useState(false);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  // Fetch API key status
  useEffect(() => {
    if (!token || !showByok) return;
    
    const fetchStatus = async () => {
      setLoadingStatus(true);
      try {
        const res = await fetch(`${API_BASE}/settings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setApiKeyStatus({
            has_groq_key: data.has_groq_key || false,
            has_openrouter_key: data.has_openrouter_key || false,
            has_bytez_key: data.has_bytez_key || false,
            use_custom_ai_keys: data.use_custom_ai_keys || false,
          });
        }
      } catch {
        // Ignore
      } finally {
        setLoadingStatus(false);
      }
    };
    
    fetchStatus();
  }, [token, showByok]);

  const saveApiKey = async (provider: string, key: string) => {
    if (!token || !key.trim()) return;
    
    setSavingKey(provider);
    try {
      const res = await fetch(`${API_BASE}/settings/api-key`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ provider, api_key: key }),
      });
      
      if (res.ok) {
        setApiKeyStatus((prev) => prev ? { ...prev, [`has_${provider}_key`]: true } : null);
        if (provider === "groq") setGroqKey("");
        if (provider === "openrouter") setOpenrouterKey("");
        if (provider === "bytez") setBytezKey("");
      }
    } catch {
      // Ignore
    } finally {
      setSavingKey(null);
    }
  };

  const deleteApiKey = async (provider: string) => {
    if (!token) return;
    
    try {
      const res = await fetch(`${API_BASE}/settings/api-key`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ provider }),
      });
      
      if (res.ok) {
        setApiKeyStatus((prev) => prev ? { ...prev, [`has_${provider}_key`]: false } : null);
      }
    } catch {
      // Ignore
    }
  };

  const toggleUseCustomKeys = async (enabled: boolean) => {
    if (!token) return;
    
    try {
      const res = await fetch(`${API_BASE}/settings`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ use_custom_ai_keys: enabled }),
      });
      
      if (res.ok) {
        setApiKeyStatus((prev) => prev ? { ...prev, use_custom_ai_keys: enabled } : null);
      }
    } catch {
      // Ignore
    }
  };

  return (
    <div className="space-y-4">
      {/* Reasoning Settings */}
      <Card className="p-4">
        <h3 className="mb-4 font-semibold text-sm">AI Settings</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="reasoning-toggle" className="flex items-center gap-2 text-sm">
                <Brain className="h-4 w-4 text-purple-500" />
                Reasoning Mode
              </Label>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Deep step-by-step analysis
              </p>
            </div>
            <Switch
              id="reasoning-toggle"
              checked={reasoningEnabled}
              onCheckedChange={onReasoningChange}
              disabled={!canUseReasoning}
            />
          </div>

          <div className="rounded-lg bg-slate-100 p-3 text-xs dark:bg-slate-800">
            <div className="mb-1 flex items-center justify-between">
              <span>Daily Usage</span>
              <span className="font-medium">
                {quota.used} / {quota.limit}
              </span>
            </div>
            <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-purple-500 rounded-full transition-all"
                style={{ width: `${Math.min((quota.used / quota.limit) * 100, 100)}%` }}
              />
            </div>
            <div className="text-slate-500 dark:text-slate-400 mt-1">
              Resets {new Date(quota.resetsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      </Card>

      {/* BYOK Section */}
      <Card className="p-4">
        <button
          onClick={() => setShowByok(!showByok)}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Key className="h-4 w-4 text-amber-500" />
            <span className="font-semibold text-sm">Bring Your Own Keys</span>
            <Badge variant="outline" className="text-[10px]">BYOK</Badge>
          </div>
          <Settings className={`h-4 w-4 text-slate-400 transition-transform ${showByok ? 'rotate-90' : ''}`} />
        </button>

        {showByok && (
          <div className="mt-4 space-y-4">
            {loadingStatus ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
              </div>
            ) : (
              <>
                {/* Enable Custom Keys Toggle */}
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <div>
                    <p className="text-xs font-medium">Use Custom Keys</p>
                    <p className="text-[10px] text-slate-500">Bypass shared quota</p>
                  </div>
                  <Switch
                    checked={apiKeyStatus?.use_custom_ai_keys ?? false}
                    onCheckedChange={toggleUseCustomKeys}
                  />
                </div>

                {/* Groq */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs flex items-center gap-1.5">
                      Groq
                      {apiKeyStatus?.has_groq_key && (
                        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 text-[10px]">
                          <Check className="h-2.5 w-2.5 mr-0.5" /> Set
                        </Badge>
                      )}
                    </Label>
                    {apiKeyStatus?.has_groq_key && (
                      <button onClick={() => deleteApiKey("groq")} className="text-[10px] text-red-500 hover:text-red-600">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                  <div className="flex gap-1.5">
                    <div className="relative flex-1">
                      <Input
                        type={showGroqKey ? "text" : "password"}
                        value={groqKey}
                        onChange={(e) => setGroqKey(e.target.value)}
                        placeholder={apiKeyStatus?.has_groq_key ? "••••••••" : "gsk_..."}
                        className="h-8 text-xs pr-8"
                      />
                      <button
                        type="button"
                        onClick={() => setShowGroqKey(!showGroqKey)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400"
                      >
                        {showGroqKey ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </button>
                    </div>
                    <button
                      onClick={() => saveApiKey("groq", groqKey)}
                      disabled={!groqKey.trim() || savingKey === "groq"}
                      className="px-2 h-8 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded text-xs disabled:opacity-50"
                    >
                      {savingKey === "groq" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                    </button>
                  </div>
                </div>

                {/* OpenRouter */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs flex items-center gap-1.5">
                      OpenRouter
                      {apiKeyStatus?.has_openrouter_key && (
                        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 text-[10px]">
                          <Check className="h-2.5 w-2.5 mr-0.5" /> Set
                        </Badge>
                      )}
                    </Label>
                    {apiKeyStatus?.has_openrouter_key && (
                      <button onClick={() => deleteApiKey("openrouter")} className="text-[10px] text-red-500 hover:text-red-600">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                  <div className="flex gap-1.5">
                    <div className="relative flex-1">
                      <Input
                        type={showOpenrouterKey ? "text" : "password"}
                        value={openrouterKey}
                        onChange={(e) => setOpenrouterKey(e.target.value)}
                        placeholder={apiKeyStatus?.has_openrouter_key ? "••••••••" : "sk-or-..."}
                        className="h-8 text-xs pr-8"
                      />
                      <button
                        type="button"
                        onClick={() => setShowOpenrouterKey(!showOpenrouterKey)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400"
                      >
                        {showOpenrouterKey ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </button>
                    </div>
                    <button
                      onClick={() => saveApiKey("openrouter", openrouterKey)}
                      disabled={!openrouterKey.trim() || savingKey === "openrouter"}
                      className="px-2 h-8 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded text-xs disabled:opacity-50"
                    >
                      {savingKey === "openrouter" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                    </button>
                  </div>
                </div>

                {/* Bytez */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs flex items-center gap-1.5">
                      Bytez
                      {apiKeyStatus?.has_bytez_key && (
                        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 text-[10px]">
                          <Check className="h-2.5 w-2.5 mr-0.5" /> Set
                        </Badge>
                      )}
                    </Label>
                    {apiKeyStatus?.has_bytez_key && (
                      <button onClick={() => deleteApiKey("bytez")} className="text-[10px] text-red-500 hover:text-red-600">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                  <div className="flex gap-1.5">
                    <div className="relative flex-1">
                      <Input
                        type={showBytezKey ? "text" : "password"}
                        value={bytezKey}
                        onChange={(e) => setBytezKey(e.target.value)}
                        placeholder={apiKeyStatus?.has_bytez_key ? "••••••••" : "bytez_..."}
                        className="h-8 text-xs pr-8"
                      />
                      <button
                        type="button"
                        onClick={() => setShowBytezKey(!showBytezKey)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400"
                      >
                        {showBytezKey ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </button>
                    </div>
                    <button
                      onClick={() => saveApiKey("bytez", bytezKey)}
                      disabled={!bytezKey.trim() || savingKey === "bytez"}
                      className="px-2 h-8 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded text-xs disabled:opacity-50"
                    >
                      {savingKey === "bytez" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                    </button>
                  </div>
                </div>

                {/* Help link */}
                <a
                  href="/settings"
                  className="flex items-center justify-center gap-1 text-[10px] text-slate-500 hover:text-brand mt-2"
                >
                  Manage all settings <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </>
            )}
          </div>
        )}
      </Card>

      {/* Capabilities */}
      <Card className="p-4">
        <h4 className="text-xs font-semibold mb-3">Capabilities</h4>
        <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <Zap className="h-3 w-3 text-yellow-500" />
            <span>Fast streaming</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Brain className="h-3 w-3 text-purple-500" />
            <span>Deep reasoning</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Globe className="h-3 w-3 text-green-500" />
            <span>Web browsing</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calculator className="h-3 w-3 text-blue-500" />
            <span>Calculations</span>
          </div>
        </div>
      </Card>
    </div>
  );
}