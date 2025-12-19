# Frontend Custom Hooks Documentation

**File**: `03-hooks.md`  
**Version**: 1.0.0  
**Date**: 2025-12-19

---

## Table of Contents

1. [Authentication Hooks](#authentication-hooks)
2. [AI/LLM Hooks](#ailllm-hooks)
3. [Network & Status Hooks](#network--status-hooks)
4. [Voice Hooks](#voice-hooks)
5. [Custom Hook Patterns](#custom-hook-patterns)

---

## Authentication Hooks

### useAuth

Main authentication hook for user management.

**Location**: `lib/hooks/useAuth.ts` (from AuthProvider context)

**Returns**:

```typescript
interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}
```

**Usage**:

```typescript
"use client";

import { useAuth } from "@/providers/AuthProvider";

export function ProfilePage() {
  const { user, loading, logout } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Not authenticated</div>;

  return (
    <div>
      <p>Welcome, {user.email}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

**Implementation Details**:

```typescript
"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription?.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      throw err;
    }
  };

  const register = async (email: string, password: string) => {
    setError(null);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
      throw err;
    }
  };

  const logout = async () => {
    setError(null);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Logout failed");
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        error,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
```

---

## AI/LLM Hooks

### useAIModels

Fetches and manages available AI models.

**Location**: `hooks/useAIModels.ts`

**Returns**:

```typescript
interface UseAIModelsResult {
  models: Record<AIProviderName, AIModel[]>; // Models grouped by provider
  providers: AIProviderName[]; // Available providers (groq, bytez, openrouter)
  freeReasoningModels: string[]; // Models that support reasoning
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  getModelById: (id: string) => AIModel | undefined;
  getAvailableModels: () => AIModel[];
  getReasoningModels: () => AIModel[];
}
```

**Usage**:

```typescript
"use client";

import { useAIModels } from "@/hooks/useAIModels";
import { useAuth } from "@/providers/AuthProvider";

export function ModelSelector() {
  const { user } = useAuth();
  const { models, loading, error, getAvailableModels } = useAIModels(
    user?.id ?? null
  );

  if (loading) return <div>Loading models...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <select>
      {getAvailableModels().map((model) => (
        <option key={model.id} value={model.id}>
          {model.name} ({model.provider})
        </option>
      ))}
    </select>
  );
}
```

**Key Features**:

```typescript
export function useAIModels(token: string | null): UseAIModelsResult {
  const [models, setModels] = useState<Record<AIProviderName, AIModel[]>>({
    groq: [],
    bytez: [],
    openrouter: [],
  });

  // Fetch models from backend
  const fetchModels = useCallback(async () => {
    if (!token) return;

    const response = await fetch(`${API_BASE}/ai/models`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();
    setModels(data.models);
  }, [token]);

  useEffect(() => {
    void fetchModels();
  }, [fetchModels]);

  // Helper to find model by ID
  const getModelById = useCallback(
    (id: string) => {
      for (const providerModels of Object.values(models)) {
        const found = providerModels.find((m) => m.id === id);
        if (found) return found;
      }
      return undefined;
    },
    [models]
  );

  // Get all available models across providers
  const getAvailableModels = useCallback(() => {
    return Object.values(models).flat();
  }, [models]);

  // Get models with reasoning capability
  const getReasoningModels = useCallback(() => {
    return Object.values(models)
      .flat()
      .filter((m) => m.supportsReasoning);
  }, [models]);

  return {
    models,
    providers: Object.keys(models) as AIProviderName[],
    freeReasoningModels: [],
    loading,
    error,
    refetch: fetchModels,
    getModelById,
    getAvailableModels,
    getReasoningModels,
  };
}
```

### useAIPreferences

Gets and updates user AI preferences (preferred model, provider, etc).

**Location**: `hooks/useAIPreferences.ts`

**Returns**:

```typescript
interface UseAIPreferencesResult {
  preferences: AIPreferences | null;
  loading: boolean;
  error: string | null;
  updatePreferences: (prefs: Partial<AIPreferences>) => Promise<void>;
  refetch: () => Promise<void>;
}

interface AIPreferences {
  preferredModel: string;
  preferredProvider: AIProviderName;
  recentModels: string[];
  voice: {
    enabled: boolean;
    provider: "azure" | "elevenlabs";
    voice: string;
  };
  autoPlayResponses: boolean;
}
```

**Usage**:

```typescript
"use client";

import { useAIPreferences } from "@/hooks/useAIPreferences";
import { useAuth } from "@/providers/AuthProvider";

export function AISettings() {
  const { user } = useAuth();
  const { preferences, updatePreferences, loading } = useAIPreferences(
    user?.id ?? null
  );

  if (loading) return <div>Loading preferences...</div>;

  const handleModelChange = async (modelId: string) => {
    await updatePreferences({ preferredModel: modelId });
  };

  return (
    <div>
      <label>
        Preferred Model:
        <select
          value={preferences?.preferredModel}
          onChange={(e) => handleModelChange(e.target.value)}
        >
          {/* Options */}
        </select>
      </label>

      <label>
        <input
          type="checkbox"
          checked={preferences?.voice.enabled}
          onChange={(e) =>
            updatePreferences({
              voice: { ...preferences.voice, enabled: e.target.checked },
            })
          }
        />
        Enable Voice Output
      </label>
    </div>
  );
}
```

### useQuota

Tracks AI usage quota for the current user.

**Location**: `hooks/useQuota.ts`

**Returns**:

```typescript
interface UseQuotaResult {
  quota: QuotaStatus | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  canUse: (type: "standard" | "reasoning" | "premium" | "voice") => boolean;
  getRemaining: (
    type: "standard" | "reasoning" | "premium" | "voice"
  ) => number;
  timeUntilReset: () => string;
}

interface QuotaStatus {
  standard: { used: number; limit: number; unlimited: boolean };
  reasoning: { used: number; limit: number; unlimited: boolean };
  premium: { used: number; limit: number; unlimited: boolean };
  voice: { used: number; limit: number; unlimited: boolean };
  resetsAt: string;
  tier: "free" | "premium";
}
```

**Usage**:

```typescript
"use client";

import { useQuota } from "@/hooks/useQuota";
import { useAuth } from "@/providers/AuthProvider";

export function ChatInterface() {
  const { user } = useAuth();
  const { quota, canUse, getRemaining } = useQuota(user?.id ?? null);

  if (!quota) return <div>Loading quota...</div>;

  const canChat = canUse("standard");
  const remaining = getRemaining("standard");

  return (
    <div>
      <div className="quota-bar">
        <div
          className="quota-used"
          style={{
            width: `${(quota.standard.used / quota.standard.limit) * 100}%`,
          }}
        />
      </div>

      <p>
        {quota.standard.unlimited
          ? "Unlimited messages"
          : `${remaining} messages remaining`}
      </p>

      <textarea
        disabled={!canChat}
        placeholder={
          canChat
            ? "Ask me anything..."
            : "Quota exceeded. Upgrade to continue."
        }
      />
    </div>
  );
}
```

**Implementation**:

```typescript
export function useQuota(token: string | null): UseQuotaResult {
  const [quota, setQuota] = useState<QuotaStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuota = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/ai/quota`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch quota");

      const data = await response.json();
      setQuota(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void fetchQuota();
    // Poll every 5 minutes
    const interval = setInterval(fetchQuota, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchQuota]);

  const canUse = useCallback(
    (type: "standard" | "reasoning" | "premium" | "voice"): boolean => {
      if (!quota) return false;
      const q = quota[type];
      return q.unlimited || q.used < q.limit;
    },
    [quota]
  );

  const getRemaining = useCallback(
    (type: "standard" | "reasoning" | "premium" | "voice"): number => {
      if (!quota) return 0;
      const q = quota[type];
      if (q.unlimited) return Infinity;
      return Math.max(0, q.limit - q.used);
    },
    [quota]
  );

  const timeUntilReset = useCallback(() => {
    if (!quota) return "Unknown";
    const resetDate = new Date(quota.resetsAt);
    const now = new Date();
    const diff = resetDate.getTime() - now.getTime();

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
  }, [quota]);

  return {
    quota,
    loading,
    error,
    refetch: fetchQuota,
    canUse,
    getRemaining,
    timeUntilReset,
  };
}
```

---

## Network & Status Hooks

### useNetworkStatus

Monitors user's network connectivity and quality.

**Location**: `hooks/useNetworkStatus.ts`

**Returns**:

```typescript
type NetworkStatus = {
  isOnline: boolean; // Is user connected to internet
  isSlow: boolean; // Is connection below threshold
  lastCheck: number | null; // Timestamp of last check
  warningsDisabled: boolean; // User preference to disable warnings
  setWarningsDisabled: (disabled: boolean) => void;
};
```

**Usage**:

```typescript
"use client";

import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { Alert } from "@/components/ui/alert";

export function OfflineWarning() {
  const { isOnline, isSlow, warningsDisabled, setWarningsDisabled } =
    useNetworkStatus();

  if (warningsDisabled) return null;

  if (!isOnline) {
    return (
      <Alert variant="warning">
        <p>You are offline. Some features may not work.</p>
        <button onClick={() => setWarningsDisabled(true)}>Dismiss</button>
      </Alert>
    );
  }

  if (isSlow) {
    return (
      <Alert variant="info">
        <p>Your connection is slow. Uploads and API calls may take longer.</p>
      </Alert>
    );
  }

  return null;
}
```

**Implementation**:

```typescript
export function useNetworkStatus(): NetworkStatus {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [isSlow, setIsSlow] = useState(false);
  const [lastCheck, setLastCheck] = useState<number | null>(null);
  const [warningsDisabled, setWarningsDisabledState] = useState(false);

  // Online/offline listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setIsSlow(false);
      setLastCheck(Date.now());
    };

    const handleOffline = () => {
      setIsOnline(false);
      setLastCheck(Date.now());
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Check connection quality via Network Information API
  useEffect(() => {
    if (!("connection" in navigator)) return;

    const connection = (navigator as any).connection;

    const checkQuality = () => {
      const SLOW_THRESHOLD = 0.5; // Mbps
      setIsSlow(connection.downlink < SLOW_THRESHOLD);
      setLastCheck(Date.now());
    };

    connection.addEventListener("change", checkQuality);
    checkQuality();

    return () => connection.removeEventListener("change", checkQuality);
  }, []);

  return {
    isOnline,
    isSlow,
    lastCheck,
    warningsDisabled,
    setWarningsDisabled: (disabled) => {
      setWarningsDisabledState(disabled);
      if (disabled) {
        localStorage.setItem("networkWarningsDisabled", "true");
      } else {
        localStorage.removeItem("networkWarningsDisabled");
      }
    },
  };
}
```

---

## Voice Hooks

### useVoiceInput

Captures voice input using Web Speech API.

**Location**: `hooks/useVoiceInput.ts`

**Returns**:

```typescript
interface UseVoiceInputResult {
  transcript: string;
  isListening: boolean;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  isSupported: boolean;
}
```

**Usage**:

```typescript
"use client";

import { useVoiceInput } from "@/hooks/useVoiceInput";
import { Mic, MicOff } from "lucide-react";

export function VoiceInput() {
  const {
    transcript,
    isListening,
    error,
    startListening,
    stopListening,
    isSupported,
  } = useVoiceInput();

  if (!isSupported) {
    return <p>Voice input not supported in your browser</p>;
  }

  return (
    <div>
      <button
        onClick={isListening ? stopListening : startListening}
        className={isListening ? "recording" : ""}
      >
        {isListening ? <MicOff /> : <Mic />}
      </button>

      {transcript && <p>You said: {transcript}</p>}
      {error && <p className="error">{error}</p>}
    </div>
  );
}
```

### useTextToSpeech

Converts text to speech using Web Speech API.

**Location**: `hooks/useTextToSpeech.ts`

**Returns**:

```typescript
interface UseTextToSpeechResult {
  speak: (text: string) => void;
  stop: () => void;
  isSpeaking: boolean;
  isSupported: boolean;
  setVoice: (voice: SpeechSynthesisVoice) => void;
  setRate: (rate: number) => void;
}
```

**Usage**:

```typescript
"use client";

import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { Speaker, VolumeX } from "lucide-react";

export function SpeakButton({ text }: { text: string }) {
  const { speak, stop, isSpeaking, isSupported } = useTextToSpeech();

  if (!isSupported) return null;

  return (
    <button
      onClick={isSpeaking ? stop : () => speak(text)}
      className="speak-btn"
    >
      {isSpeaking ? <VolumeX /> : <Speaker />}
    </button>
  );
}
```

**Implementation**:

```typescript
export function useTextToSpeech(): UseTextToSpeechResult {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const synth = typeof window !== "undefined" ? window.speechSynthesis : null;
  const isSupported = !!synth;

  const speak = useCallback(
    (text: string) => {
      if (!synth) return;

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      synth.speak(utterance);
    },
    [synth]
  );

  const stop = useCallback(() => {
    if (synth) {
      synth.cancel();
      setIsSpeaking(false);
    }
  }, [synth]);

  return {
    speak,
    stop,
    isSpeaking,
    isSupported,
    setVoice: (voice) => {
      // Configure voice
    },
    setRate: (rate) => {
      // Configure speech rate
    },
  };
}
```

---

## Custom Hook Patterns

### Pattern 1: Data Fetching with Caching

```typescript
function useFetchData<T>(
  url: string,
  dependencies: any[] = []
): {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
} {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const cacheRef = useRef<Map<string, T>>(new Map());

  const fetchData = useCallback(async () => {
    // Check cache first
    if (cacheRef.current.has(url)) {
      setData(cacheRef.current.get(url) ?? null);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(url);
      const result = await response.json();
      cacheRef.current.set(url, result);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    void fetchData();
  }, dependencies);

  return { data, loading, error, refetch: fetchData };
}
```

### Pattern 2: State Persistence

```typescript
function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void] {
  const [state, setState] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T) => {
      setState(value);
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.error("Failed to persist state:", error);
      }
    },
    [key]
  );

  return [state, setValue];
}

// Usage
const [preferences, setPreferences] = useLocalStorage("prefs", {});
```

### Pattern 3: Debounced Updates

```typescript
function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

// Usage
const searchTerm = "apple";
const debouncedTerm = useDebounce(searchTerm, 300);

useEffect(() => {
  // Only search after user stops typing for 300ms
  performSearch(debouncedTerm);
}, [debouncedTerm]);
```

---

**Last Updated**: 2025-12-19  
**Version**: 1.0.0
