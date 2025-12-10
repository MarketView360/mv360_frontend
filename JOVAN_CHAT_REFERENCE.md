# Jovan Chat Development Reference

This document provides detailed implementation references for the Jovan Chat upgrade.

---

## 1. Provider Integration Details

### 1.1 Bytez API

**Documentation:** https://docs.bytez.com

**Base Configuration:**
```typescript
// backend-nest/src/ai-chat/providers/bytez.provider.ts
import OpenAI from 'openai';

export class BytezProvider {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({
      apiKey,
      baseURL: 'https://api.bytez.com/models/v2/openai/v1',
    });
  }

  async chat(model: string, messages: Message[], stream = false) {
    return this.client.chat.completions.create({
      model,
      messages,
      stream,
      max_tokens: 800,
      temperature: 0.25,
    });
  }
}
```

**Supported Models Configuration:**
```typescript
export const BYTEZ_MODELS = {
  // Free models
  'qwen3-0.6b': {
    id: 'Qwen/Qwen3-0.6B',
    name: 'Qwen3 0.6B',
    provider: 'bytez',
    capabilities: ['chat', 'reasoning'],
    tier: 'free',
    speed: 'fast',
    contextWindow: 8192,
  },
  'tinyllama': {
    id: 'TinyLlama/TinyLlama-1.1B-Chat-v1.0',
    name: 'TinyLlama 1.1B',
    provider: 'bytez',
    capabilities: ['chat'],
    tier: 'free',
    speed: 'ultra-fast',
    contextWindow: 2048,
  },
  // BYOK models
  'gpt-5': {
    id: 'openai/gpt-5',
    name: 'GPT-5',
    provider: 'bytez',
    capabilities: ['chat', 'reasoning'],
    tier: 'byok',
    byokProvider: 'bytez',
    speed: 'medium',
    contextWindow: 128000,
  },
  'gpt-4o': {
    id: 'openai/gpt-4o',
    name: 'GPT-4o',
    provider: 'bytez',
    capabilities: ['chat', 'vision'],
    tier: 'byok',
    byokProvider: 'bytez',
    speed: 'fast',
    contextWindow: 128000,
  },
  'claude-opus': {
    id: 'anthropic/claude-opus-4-5',
    name: 'Claude Opus 4.5',
    provider: 'bytez',
    capabilities: ['chat', 'reasoning'],
    tier: 'byok',
    byokProvider: 'bytez',
    speed: 'slow',
    contextWindow: 200000,
  },
  'claude-sonnet': {
    id: 'anthropic/claude-sonnet-4-5',
    name: 'Claude Sonnet 4.5',
    provider: 'bytez',
    capabilities: ['chat', 'reasoning'],
    tier: 'byok',
    byokProvider: 'bytez',
    speed: 'medium',
    contextWindow: 200000,
  },
  'claude-haiku': {
    id: 'anthropic/claude-3-haiku-20240307',
    name: 'Claude 3 Haiku',
    provider: 'bytez',
    capabilities: ['chat'],
    tier: 'byok',
    byokProvider: 'bytez',
    speed: 'fast',
    contextWindow: 200000,
  },
};
```

---

### 1.2 OpenRouter API

**Documentation:** https://openrouter.ai/docs

**Base Configuration:**
```typescript
// backend-nest/src/ai-chat/providers/openrouter.provider.ts
import OpenAI from 'openai';

export class OpenRouterProvider {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({
      apiKey,
      baseURL: 'https://openrouter.ai/api/v1',
      defaultHeaders: {
        'HTTP-Referer': 'https://marketview360.io',
        'X-Title': 'MarketView360 Jovan AI',
      },
    });
  }

  async chat(model: string, messages: Message[], stream = false) {
    return this.client.chat.completions.create({
      model,
      messages,
      stream,
      max_tokens: 800,
      temperature: 0.25,
    });
  }
}
```

**Supported Models Configuration:**
```typescript
export const OPENROUTER_MODELS = {
  // Free models
  'nova-lite': {
    id: 'amazon/nova-2-lite-v1:free',
    name: 'Amazon Nova 2 Lite',
    provider: 'openrouter',
    capabilities: ['chat'],
    tier: 'free',
    speed: 'fast',
  },
  'tng-chimera': {
    id: 'tngtech/tng-r1t-chimera:free',
    name: 'TNG Chimera',
    provider: 'openrouter',
    capabilities: ['chat'],
    tier: 'free',
    speed: 'fast',
  },
  'olmo-think': {
    id: 'allenai/olmo-3-32b-think:free',
    name: 'OLMo 3 Think',
    provider: 'openrouter',
    capabilities: ['chat', 'reasoning'],
    tier: 'free',
    speed: 'medium',
    description: 'Free reasoning model',
  },
  'nemotron-vl': {
    id: 'nvidia/nemotron-nano-12b-v2-vl:free',
    name: 'Nemotron Vision',
    provider: 'openrouter',
    capabilities: ['chat', 'vision'],
    tier: 'free',
    speed: 'medium',
  },
  'deepseek-v3': {
    id: 'deepseek/deepseek-chat-v3.1',
    name: 'DeepSeek V3.1',
    provider: 'openrouter',
    capabilities: ['chat'],
    tier: 'free',
    speed: 'fast',
  },
  'gpt-oss-120b': {
    id: 'openai/gpt-oss-120b:free',
    name: 'GPT OSS 120B',
    provider: 'openrouter',
    capabilities: ['chat', 'reasoning'],
    tier: 'free',
    speed: 'slow',
  },
  'gpt-oss-20b': {
    id: 'openai/gpt-oss-20b:free',
    name: 'GPT OSS 20B',
    provider: 'openrouter',
    capabilities: ['chat'],
    tier: 'free',
    speed: 'fast',
  },
  'glm-air': {
    id: 'z-ai/glm-4.5-air:free',
    name: 'GLM 4.5 Air',
    provider: 'openrouter',
    capabilities: ['chat'],
    tier: 'free',
    speed: 'fast',
  },
  'kimi-k2': {
    id: 'moonshotai/kimi-k2:free',
    name: 'Kimi K2',
    provider: 'openrouter',
    capabilities: ['chat'],
    tier: 'free',
    speed: 'fast',
  },
  // BYOK models
  'grok-fast': {
    id: 'x-ai/grok-4.1-fast',
    name: 'Grok 4.1 Fast',
    provider: 'openrouter',
    capabilities: ['chat'],
    tier: 'byok',
    byokProvider: 'openrouter',
    speed: 'fast',
  },
  'gemini-pro': {
    id: 'google/gemini-3-pro-preview',
    name: 'Gemini 3 Pro',
    provider: 'openrouter',
    capabilities: ['chat', 'vision'],
    tier: 'byok',
    byokProvider: 'openrouter',
    speed: 'medium',
  },
  'kimi-linear': {
    id: 'moonshotai/kimi-linear-48b-a3b-instruct',
    name: 'Kimi Linear 48B',
    provider: 'openrouter',
    capabilities: ['chat'],
    tier: 'byok',
    byokProvider: 'openrouter',
    speed: 'medium',
  },
  'claude-sonnet-or': {
    id: 'anthropic/claude-sonnet-4.5',
    name: 'Claude Sonnet 4.5',
    provider: 'openrouter',
    capabilities: ['chat', 'reasoning'],
    tier: 'byok',
    byokProvider: 'openrouter',
    speed: 'medium',
  },
  'gpt-4.1': {
    id: 'openai/gpt-4.1',
    name: 'GPT-4.1',
    provider: 'openrouter',
    capabilities: ['chat'],
    tier: 'byok',
    byokProvider: 'openrouter',
    speed: 'medium',
  },
  'gpt-4.1-mini': {
    id: 'openai/gpt-4.1-mini',
    name: 'GPT-4.1 Mini',
    provider: 'openrouter',
    capabilities: ['chat'],
    tier: 'byok',
    byokProvider: 'openrouter',
    speed: 'fast',
  },
  'gpt-4.1-nano': {
    id: 'openai/gpt-4.1-nano',
    name: 'GPT-4.1 Nano',
    provider: 'openrouter',
    capabilities: ['chat'],
    tier: 'byok',
    byokProvider: 'openrouter',
    speed: 'ultra-fast',
  },
  'gpt-5-mini': {
    id: 'openai/gpt-5-mini',
    name: 'GPT-5 Mini',
    provider: 'openrouter',
    capabilities: ['chat', 'reasoning'],
    tier: 'byok',
    byokProvider: 'openrouter',
    speed: 'fast',
  },
  'gpt-5.1': {
    id: 'openai/gpt-5.1',
    name: 'GPT-5.1',
    provider: 'openrouter',
    capabilities: ['chat', 'reasoning'],
    tier: 'byok',
    byokProvider: 'openrouter',
    speed: 'medium',
  },
};
```

---

### 1.3 Groq Whisper (Voice Input)

**Documentation:** https://console.groq.com/docs/speech-to-text

**Backend Endpoint:**
```typescript
// backend-nest/src/ai-chat/ai-chat.controller.ts
@Post('transcribe')
@UseGuards(JwtAuthGuard)
@UseInterceptors(FileInterceptor('audio'))
async transcribe(
  @UploadedFile() file: Express.Multer.File,
  @Req() req: AuthenticatedRequest,
) {
  return this.aiChat.transcribeAudio(file, req.user.userId);
}
```

**Service Implementation:**
```typescript
// backend-nest/src/ai-chat/ai-chat.service.ts
async transcribeAudio(
  file: Express.Multer.File,
  userId: string,
): Promise<{ text: string; duration: number }> {
  // Check voice quota
  const quota = await this.getVoiceQuota(userId);
  if (quota.used >= quota.limit) {
    throw new HttpException('Voice quota exceeded', HttpStatus.TOO_MANY_REQUESTS);
  }

  const transcription = await this.client.audio.transcriptions.create({
    file: new File([file.buffer], file.originalname, { type: file.mimetype }),
    model: 'whisper-large-v3-turbo',
    response_format: 'verbose_json',
    language: 'en',
  });

  await this.incrementVoiceUsage(userId);

  return {
    text: transcription.text,
    duration: transcription.duration,
  };
}
```

**Frontend Recording:**
```typescript
// frontend/hooks/useVoiceInput.ts
import { useState, useRef, useCallback } from 'react';

export function useVoiceInput() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      });
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (e) => {
        audioChunks.current.push(e.data);
      };

      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
      throw error;
    }
  }, []);

  const stopRecording = useCallback(async (): Promise<Blob> => {
    return new Promise((resolve) => {
      if (!mediaRecorder.current) return;

      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
        resolve(audioBlob);
      };

      mediaRecorder.current.stop();
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    });
  }, []);

  const transcribe = useCallback(async (audioBlob: Blob, token: string): Promise<string> => {
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      const response = await fetch(`${API_BASE}/ai/transcribe`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) throw new Error('Transcription failed');
      const data = await response.json();
      return data.text;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return { isRecording, isProcessing, startRecording, stopRecording, transcribe };
}
```

---

## 2. Text-to-Speech (Web Speech API)

```typescript
// frontend/hooks/useTextToSpeech.ts
import { useState, useCallback, useEffect } from 'react';

export function useTextToSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices();
      setVoices(availableVoices);
      // Default to first English voice
      const englishVoice = availableVoices.find(v => v.lang.startsWith('en'));
      setSelectedVoice(englishVoice || availableVoices[0]);
    };

    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const speak = useCallback((text: string) => {
    if (!text || isSpeaking) return;

    // Cancel any ongoing speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = selectedVoice;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    speechSynthesis.speak(utterance);
  }, [selectedVoice, isSpeaking]);

  const stop = useCallback(() => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  const pause = useCallback(() => {
    speechSynthesis.pause();
  }, []);

  const resume = useCallback(() => {
    speechSynthesis.resume();
  }, []);

  return {
    isSpeaking,
    voices,
    selectedVoice,
    setSelectedVoice,
    speak,
    stop,
    pause,
    resume,
  };
}
```

---

## 3. Smart Router Implementation

```typescript
// backend-nest/src/ai-chat/router/smart-router.ts
import { Injectable, Logger } from '@nestjs/common';
import { ModelRegistry, ModelConfig } from './model-registry';

interface RoutingContext {
  messages: { role: string; content: string }[];
  userId: string;
  userTier: 'free' | 'premium';
  reasoningRequested: boolean;
  hasVisionContent: boolean;
  userByokKeys: {
    groq: boolean;
    bytez: boolean;
    openrouter: boolean;
  };
  preferredModel?: string;
}

@Injectable()
export class SmartRouter {
  private readonly logger = new Logger(SmartRouter.name);

  constructor(private readonly modelRegistry: ModelRegistry) {}

  async selectModel(context: RoutingContext): Promise<ModelConfig> {
    const { messages, userTier, reasoningRequested, hasVisionContent, userByokKeys, preferredModel } = context;

    // 1. If user has a preference and it's available, use it
    if (preferredModel) {
      const preferred = this.modelRegistry.getModel(preferredModel);
      if (preferred && this.isModelAvailable(preferred, userTier, userByokKeys)) {
        return preferred;
      }
    }

    // 2. Vision content requires vision-capable model
    if (hasVisionContent) {
      return this.selectVisionModel(userTier, userByokKeys);
    }

    // 3. Reasoning request
    if (reasoningRequested) {
      return this.selectReasoningModel(userTier, userByokKeys);
    }

    // 4. Analyze message complexity
    const complexity = this.analyzeComplexity(messages);

    // 5. Select based on complexity
    if (complexity === 'simple') {
      return this.selectFastModel(userTier, userByokKeys);
    } else if (complexity === 'complex') {
      return this.selectCapableModel(userTier, userByokKeys);
    }

    // 6. Default: balanced model
    return this.selectDefaultModel(userTier, userByokKeys);
  }

  private analyzeComplexity(messages: { role: string; content: string }[]): 'simple' | 'medium' | 'complex' {
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    if (!lastUserMessage) return 'simple';

    const content = lastUserMessage.content.toLowerCase();
    const totalLength = messages.reduce((sum, m) => sum + m.content.length, 0);

    // Complex indicators
    const complexPatterns = [
      /analyze|compare|explain in detail|step.?by.?step/i,
      /calculate|compute|derive/i,
      /why|how does|what causes/i,
      /\d+\s*(stocks?|companies|metrics)/i,
    ];

    const isComplex = complexPatterns.some(p => p.test(content)) || totalLength > 5000;
    if (isComplex) return 'complex';

    // Simple indicators
    const simplePatterns = [
      /^(what is|define|hi|hello|thanks)/i,
      /^.{0,50}$/,
    ];

    const isSimple = simplePatterns.some(p => p.test(content));
    if (isSimple) return 'simple';

    return 'medium';
  }

  private isModelAvailable(
    model: ModelConfig,
    userTier: 'free' | 'premium',
    byokKeys: { groq: boolean; bytez: boolean; openrouter: boolean },
  ): boolean {
    // Free models always available
    if (model.tier === 'free') return true;

    // BYOK models require user to have the key
    if (model.tier === 'byok') {
      return byokKeys[model.byokProvider as keyof typeof byokKeys] === true;
    }

    // Premium models require premium tier
    if (model.tier === 'premium') {
      return userTier === 'premium';
    }

    return false;
  }

  private selectFastModel(tier: 'free' | 'premium', byokKeys: any): ModelConfig {
    // Priority: TinyLlama -> Llama 8B -> GPT-4.1-nano (BYOK)
    const fastModels = ['tinyllama', 'llama-8b', 'gpt-4.1-nano'];
    for (const id of fastModels) {
      const model = this.modelRegistry.getModel(id);
      if (model && this.isModelAvailable(model, tier, byokKeys)) {
        return model;
      }
    }
    return this.selectDefaultModel(tier, byokKeys);
  }

  private selectReasoningModel(tier: 'free' | 'premium', byokKeys: any): ModelConfig {
    // Priority: OLMo-think (free) -> Qwen3 (free) -> GPT-5 (BYOK)
    const reasoningModels = ['olmo-think', 'qwen3-0.6b', 'gpt-5', 'claude-opus'];
    for (const id of reasoningModels) {
      const model = this.modelRegistry.getModel(id);
      if (model && this.isModelAvailable(model, tier, byokKeys)) {
        return model;
      }
    }
    return this.selectDefaultModel(tier, byokKeys);
  }

  private selectVisionModel(tier: 'free' | 'premium', byokKeys: any): ModelConfig {
    // Priority: Nemotron (free) -> GPT-4o (BYOK) -> Gemini (BYOK)
    const visionModels = ['nemotron-vl', 'gpt-4o', 'gemini-pro'];
    for (const id of visionModels) {
      const model = this.modelRegistry.getModel(id);
      if (model && this.isModelAvailable(model, tier, byokKeys)) {
        return model;
      }
    }
    return this.selectDefaultModel(tier, byokKeys);
  }

  private selectCapableModel(tier: 'free' | 'premium', byokKeys: any): ModelConfig {
    // Priority: Groq Compound -> DeepSeek -> GPT-4.1
    const capableModels = ['groq-compound', 'deepseek-v3', 'gpt-4.1'];
    for (const id of capableModels) {
      const model = this.modelRegistry.getModel(id);
      if (model && this.isModelAvailable(model, tier, byokKeys)) {
        return model;
      }
    }
    return this.selectDefaultModel(tier, byokKeys);
  }

  private selectDefaultModel(tier: 'free' | 'premium', byokKeys: any): ModelConfig {
    // Default: Groq Compound (has tools)
    return this.modelRegistry.getModel('groq-compound')!;
  }
}
```

---

## 4. Quota Management

```typescript
// backend-nest/src/ai-chat/quota/quota.service.ts
import { Injectable, Logger } from '@nestjs/common';

interface UserQuota {
  standard: { used: number; limit: number };
  reasoning: { used: number; limit: number };
  premium: { used: number; limit: number };
  voice: { used: number; limit: number };
  resetsAt: string;
}

const TIER_LIMITS = {
  free: {
    standard: 50,
    reasoning: 3,
    premium: 10,
    voice: 10,
  },
  premium: {
    standard: Infinity,
    reasoning: 20,
    premium: 50,
    voice: Infinity,
  },
};

@Injectable()
export class QuotaService {
  async getUserQuota(userId: string): Promise<UserQuota> {
    const tier = await this.getUserTier(userId);
    const limits = TIER_LIMITS[tier];
    const usage = await this.getUsageForToday(userId);
    
    const now = new Date();
    const resetTime = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + 1,
      0, 0, 0
    ));

    return {
      standard: { used: usage.standard, limit: limits.standard },
      reasoning: { used: usage.reasoning, limit: limits.reasoning },
      premium: { used: usage.premium, limit: limits.premium },
      voice: { used: usage.voice, limit: limits.voice },
      resetsAt: resetTime.toISOString(),
    };
  }

  async checkAndIncrement(
    userId: string,
    type: 'standard' | 'reasoning' | 'premium' | 'voice',
  ): Promise<{ allowed: boolean; remaining: number }> {
    const quota = await this.getUserQuota(userId);
    const typeQuota = quota[type];

    if (typeQuota.used >= typeQuota.limit) {
      return { allowed: false, remaining: 0 };
    }

    await this.incrementUsage(userId, type);
    
    return {
      allowed: true,
      remaining: typeQuota.limit - typeQuota.used - 1,
    };
  }
}
```

---

## 5. Frontend Model Selector Component

```tsx
// frontend/components/jovan/ModelSelector.tsx
'use client';

import { useState } from 'react';
import { Check, ChevronDown, Lock, Zap, Brain, Eye, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface Model {
  id: string;
  name: string;
  provider: string;
  capabilities: string[];
  tier: 'free' | 'premium' | 'byok';
  speed: string;
  available: boolean;
}

const CAPABILITY_ICONS: Record<string, React.ReactNode> = {
  reasoning: <Brain className="h-3 w-3 text-purple-500" />,
  vision: <Eye className="h-3 w-3 text-blue-500" />,
  fast: <Zap className="h-3 w-3 text-yellow-500" />,
};

export function ModelSelector({
  models,
  selectedModel,
  onSelect,
  autoMode,
  onAutoModeChange,
}: {
  models: Model[];
  selectedModel: Model | null;
  onSelect: (model: Model) => void;
  autoMode: boolean;
  onAutoModeChange: (enabled: boolean) => void;
}) {
  const groupedModels = models.reduce((acc, model) => {
    const provider = model.provider;
    if (!acc[provider]) acc[provider] = [];
    acc[provider].push(model);
    return acc;
  }, {} as Record<string, Model[]>);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          {autoMode ? (
            <>
              <Sparkles className="h-4 w-4 text-brand" />
              <span>Auto</span>
            </>
          ) : (
            <>
              <span>{selectedModel?.name || 'Select model'}</span>
            </>
          )}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-72">
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => onAutoModeChange(true)}>
            <Sparkles className="mr-2 h-4 w-4 text-brand" />
            <div className="flex-1">
              <div className="font-medium">Auto (Smart Routing)</div>
              <div className="text-xs text-muted-foreground">
                Automatically selects the best model
              </div>
            </div>
            {autoMode && <Check className="h-4 w-4 text-brand" />}
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {Object.entries(groupedModels).map(([provider, providerModels]) => (
          <DropdownMenuGroup key={provider}>
            <DropdownMenuLabel className="capitalize">{provider}</DropdownMenuLabel>
            {providerModels.map((model) => (
              <DropdownMenuItem
                key={model.id}
                disabled={!model.available}
                onClick={() => {
                  onAutoModeChange(false);
                  onSelect(model);
                }}
                className={cn(!model.available && 'opacity-50')}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{model.name}</span>
                    {model.tier === 'byok' && <Lock className="h-3 w-3 text-amber-500" />}
                    {model.capabilities.map((cap) => CAPABILITY_ICONS[cap])}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {model.speed} · {model.tier === 'free' ? 'Free' : model.tier === 'byok' ? 'BYOK Required' : 'Premium'}
                  </div>
                </div>
                {!autoMode && selectedModel?.id === model.id && (
                  <Check className="h-4 w-4 text-brand" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

---

## 6. Database Schema Updates

```sql
-- Add new columns to user_settings
ALTER TABLE public.user_settings
  ADD COLUMN IF NOT EXISTS bytez_api_key_encrypted TEXT,
  ADD COLUMN IF NOT EXISTS openrouter_api_key_encrypted TEXT,
  ADD COLUMN IF NOT EXISTS preferred_model TEXT,
  ADD COLUMN IF NOT EXISTS auto_routing_enabled BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS voice_input_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS auto_speak_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS tts_voice TEXT;

-- Create comprehensive usage quota table
CREATE TABLE IF NOT EXISTS public.ai_chat_usage_quota (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Usage counters
  standard_used INT NOT NULL DEFAULT 0,
  reasoning_used INT NOT NULL DEFAULT 0,
  premium_used INT NOT NULL DEFAULT 0,
  voice_used INT NOT NULL DEFAULT 0,
  
  -- Reset tracking
  reset_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(user_id, reset_date)
);

-- Enable RLS
ALTER TABLE public.ai_chat_usage_quota ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own quota" ON public.ai_chat_usage_quota
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service can manage quota" ON public.ai_chat_usage_quota
  FOR ALL USING (true);

-- Index for fast lookups
CREATE INDEX idx_ai_chat_usage_quota_user_date 
  ON public.ai_chat_usage_quota(user_id, reset_date);

-- Add session metadata
ALTER TABLE public.ai_chat_sessions
  ADD COLUMN IF NOT EXISTS model_used TEXT,
  ADD COLUMN IF NOT EXISTS provider_used TEXT,
  ADD COLUMN IF NOT EXISTS message_count INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_message_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Index for session search
CREATE INDEX IF NOT EXISTS idx_ai_chat_sessions_tags 
  ON public.ai_chat_sessions USING GIN(tags);
```

---

## 7. Environment Variables

Add to `backend-nest/.env`:
```bash
# Provider API Keys
GROQ_API_KEY=your_groq_key
BYTEZ_API_KEY=your_bytez_key
OPENROUTER_API_KEY=your_openrouter_key

# Voice Features
WHISPER_MODEL=whisper-large-v3-turbo
MAX_AUDIO_SIZE_MB=25

# Rate Limits
FREE_TIER_RATE_LIMIT=10
PREMIUM_TIER_RATE_LIMIT=30
```

Add to `frontend/.env.local`:
```bash
NEXT_PUBLIC_VOICE_ENABLED=true
NEXT_PUBLIC_MAX_RECORDING_SECONDS=60
```

---

## Notes

- All BYOK keys are for provider accounts (Bytez, OpenRouter, Groq), not direct OpenAI/Anthropic
- Free reasoning models (OLMo-think, Qwen3) don't count against premium reasoning quota
- Voice features require HTTPS in production (mediaDevices.getUserMedia)
- Web Speech API availability varies by browser
- Consider WebSocket for real-time streaming improvements in Phase 5+
