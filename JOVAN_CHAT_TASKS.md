# Jovan Chat Upgrade Task List

This document outlines the comprehensive upgrade plan for the Jovan AI Chat feature, including UI/UX improvements, multi-provider support, smart routing, voice features, and subscription tier management.

---

## Provider & Model Reference

### Current Provider: Groq
| Model | Type | Free | BYOK | Notes |
|-------|------|------|------|-------|
| `groq/compound` | Chat | ✅ | - | Default with tools |
| `llama-3.1-8b-instant` | Chat | ✅ | - | Long context |
| `openai/gpt-oss-120b` | Reasoning | ✅ | - | Quota-limited |
| `whisper-large-v3-turbo` | Voice→Text | ✅ | - | Fast transcription |
| `whisper-large-v3` | Voice→Text | ✅ | - | Best accuracy |

### New Provider: Bytez
**Base URL:** `https://api.bytez.com/models/v2/openai/v1`
**Auth:** `Authorization: Bearer <BYTEZ_API_KEY>`

| Model | Type | Free | BYOK | Notes |
|-------|------|------|------|-------|
| `Qwen/Qwen3-0.6B` | Chat + Reasoning | ✅ | - | Lightweight reasoning |
| `TinyLlama/TinyLlama-1.1B-Chat-v1.0` | Chat | ✅ | - | Ultra-fast |
| `openai/gpt-5` | Chat | ❌ | Bytez | Premium BYOK |
| `openai/gpt-4o` | Chat | ❌ | Bytez | Premium BYOK |
| `anthropic/claude-opus-4-5` | Chat | ❌ | Bytez | Premium BYOK |
| `anthropic/claude-sonnet-4-5` | Chat | ❌ | Bytez | Premium BYOK |
| `anthropic/claude-3-haiku-20240307` | Chat | ❌ | Bytez | Fast BYOK |

### New Provider: OpenRouter
**Base URL:** `https://openrouter.ai/api/v1`
**Auth:** `Authorization: Bearer <OPENROUTER_API_KEY>`
**Headers:** `HTTP-Referer: <site>`, `X-Title: <name>`

| Model | Type | Free | BYOK | Notes |
|-------|------|------|------|-------|
| `amazon/nova-2-lite-v1:free` | Chat | ✅ | - | Amazon model |
| `tngtech/tng-r1t-chimera:free` | Chat | ✅ | - | TNG model |
| `allenai/olmo-3-32b-think:free` | Reasoning | ✅ | - | **Free reasoning!** |
| `nvidia/nemotron-nano-12b-v2-vl:free` | Vision+Chat | ✅ | - | Multimodal |
| `deepseek/deepseek-chat-v3.1` | Chat | ✅ | - | DeepSeek |
| `openai/gpt-oss-120b:free` | Chat | ✅ | - | OpenAI OSS |
| `openai/gpt-oss-20b:free` | Chat | ✅ | - | Lighter OSS |
| `z-ai/glm-4.5-air:free` | Chat | ✅ | - | GLM model |
| `moonshotai/kimi-k2:free` | Chat | ✅ | - | Moonshot |
| `x-ai/grok-4.1-fast` | Chat | ❌ | OpenRouter | xAI Grok |
| `google/gemini-3-pro-preview` | Chat | ❌ | OpenRouter | Google Gemini |
| `moonshotai/kimi-linear-48b-a3b-instruct` | Chat | ❌ | OpenRouter | Moonshot Premium |
| `anthropic/claude-sonnet-4.5` | Chat | ❌ | OpenRouter | Claude via OR |
| `openai/gpt-4.1` | Chat | ❌ | OpenRouter | GPT-4.1 |
| `openai/gpt-4.1-mini` | Chat | ❌ | OpenRouter | GPT-4.1 Mini |
| `openai/gpt-4.1-nano` | Chat | ❌ | OpenRouter | GPT-4.1 Nano |
| `openai/gpt-5-mini` | Chat | ❌ | OpenRouter | GPT-5 Mini |
| `openai/gpt-5.1` | Chat | ❌ | OpenRouter | GPT-5.1 |

---

## A. UI/UX Redesign (ChatGPT/Claude-style)

- [x] **A1 – New chat empty state redesign** ✅
  - Create a modern, centered greeting with animated logo
  - Add suggestion chips/cards (4-6 examples)
  - Show capability badges (reasoning, web, voice, vision)
  - Add keyboard shortcut hints

- [x] **A2 – Sidebar redesign** ✅
  - Group sessions by date (Today, Yesterday, This Week, Older)
  - Add search/filter for sessions
  - Show session preview (first message snippet)
  - Add drag-to-reorder or pin sessions
  - Collapsible sidebar with smooth animation

- [x] **A3 – Message bubbles polish** ✅
  - Typing indicator with animated dots
  - Message reactions (copy, regenerate, speak)
  - Timestamp on hover
  - Avatar for assistant messages
  - Streaming cursor animation

- [x] **A4 – Model selector UI** ✅
  - Dropdown/popover showing available models
  - Group by provider (Groq, Bytez, OpenRouter)
  - Show model capabilities (reasoning, vision, speed)
  - Indicate BYOK-required models with lock icon
  - "Auto" option for smart routing

- [x] **A5 – Input area redesign** ✅
  - Expandable/resizable textarea
  - Attachment button (images, docs - future)
  - Voice input button with recording indicator
  - Model selection chip inline
  - Character/token counter

- [x] **A6 – Mobile responsiveness** ✅
  - Bottom sheet for model selection on mobile
  - Swipe gestures for sidebar
  - Touch-friendly message actions
  - Optimized keyboard handling

---

## B. Backend Multi-Provider Support

- [x] **B1 – Add Bytez provider service** ✅
  - Create `BytezProvider` class with OpenAI-compatible client
  - Support streaming and non-streaming
  - Handle API key from env or user BYOK
  - Error handling and timeout management

- [x] **B2 – Add OpenRouter provider service** ✅
  - Create `OpenRouterProvider` class
  - Add required headers (HTTP-Referer, X-Title)
  - Support all free and BYOK models
  - Handle streaming responses

- [x] **B3 – Provider abstraction layer** ✅
  - Create `AIProviderInterface` with common methods
  - Factory pattern for provider selection
  - Unified response format across providers
  - Common error handling

- [x] **B4 – BYOK key management updates** ✅
  - Add `bytez_api_key_encrypted` to settings
  - Add `openrouter_api_key_encrypted` to settings
  - Update DTOs and settings service
  - Frontend settings page updates (partial - DTOs done)

- [x] **B5 – Model registry** ✅
  - Create centralized model configuration
  - Define capabilities per model (reasoning, vision, voice)
  - Define tier access (free, premium, BYOK)
  - Runtime model availability checking

---

## C. Smart Routing & Model Selection

- [x] **C1 – Smart router implementation** ✅
  - Analyze message intent (question type, complexity)
  - Detect if reasoning is beneficial
  - Detect if vision/multimodal is needed
  - Consider context length requirements
  - Respect user tier limits

- [x] **C2 – Routing rules engine** ✅
  - Simple queries → fast models (TinyLlama, Llama)
  - Complex analysis → reasoning models (Qwen3, OLMo-think)
  - Web/search needs → Groq compound
  - Long context → appropriate model selection
  - BYOK models only when user has keys

- [x] **C3 – User preferences integration** ✅
  - Allow users to set default model
  - Allow users to disable auto-routing
  - Remember last used model per session
  - Preference for speed vs quality

- [x] **C4 – Fallback chain** ✅
  - Primary → Secondary → Tertiary model fallback
  - Handle provider outages gracefully
  - Log routing decisions for debugging

---

## D. Reasoning & Quota Overhaul

- [x] **D1 – Fix quota tracking bugs** ✅
  - Ensure atomic increment/check operations
  - Handle timezone correctly for daily reset
  - Add quota caching to reduce DB calls
  - Proper error handling when quota check fails

- [x] **D2 – Per-model quota system** ✅
  - Separate quotas for different model tiers
  - Free tier: 3 reasoning, 50 standard, 10 premium-model/day
  - Premium tier: 20 reasoning, unlimited standard, 50 premium-model/day
  - Display quota breakdown in UI

- [x] **D3 – Free reasoning models** ✅
  - Allow free users to use free reasoning models:
    - `Qwen/Qwen3-0.6B` (Bytez)
    - `allenai/olmo-3-32b-think:free` (OpenRouter)
  - Separate from premium reasoning quota

- [x] **D4 – Quota reset notifications** ✅
  - Show countdown to quota reset
  - Notify when quota is low
  - Suggest alternatives when exhausted

---

## E. Voice Features

- [x] **E1 – Voice input (Speech-to-Text)** ✅
  - Implement recording via Web Audio API
  - Send audio to backend for Whisper processing
  - Create `/ai/transcribe` endpoint
  - Show recording indicator and waveform
  - Support for press-to-record and toggle modes

- [x] **E2 – Backend Whisper integration** ✅
  - Groq Whisper endpoint integration
  - Support both `whisper-large-v3-turbo` and `whisper-large-v3`
  - Audio preprocessing (format, size limits)
  - Return transcript with confidence

- [x] **E3 – Text-to-Speech output** ✅
  - Implement via Web Speech API (SpeechSynthesis)
  - Add "speak" button on assistant messages
  - Voice selection (browser voices)
  - Control playback (pause, stop, speed)
  - Auto-speak mode toggle

- [x] **E4 – Voice UI indicators** ✅
  - Microphone button with states (idle, recording, processing)
  - Audio waveform visualization (basic - duration display)
  - Speaking indicator on messages being read
  - Keyboard shortcut for voice input (Esc to cancel)

---

## F. Session Management Improvements

- [x] **F1 – Session organization** ✅
  - Date-based grouping in sidebar
  - Session tagging/categorization
  - Bulk delete/archive sessions
  - Export session as markdown/PDF

- [x] **F2 – Session search** ✅
  - Full-text search across sessions
  - Search within current session
  - Filter by date range
  - Filter by model used

- [x] **F3 – Session sharing** ✅
  - Generate shareable link (read-only)
  - Export conversation to clipboard
  - Share via email

- [x] **F4 – Auto-title generation** ✅
  - Generate title from first exchange
  - Allow manual title editing
  - Title suggestions based on content

---

## G. Premium Features & Tier Limits

- [x] **G1 – Tier-based limits** ✅
  ```
  Free Tier:
  - 50 messages/day (standard models)
  - 3 reasoning uses/day (premium reasoning)
  - Unlimited free reasoning models
  - 10 voice transcriptions/day
  - BYOK models when keys provided
  
  Premium Tier:
  - Unlimited standard messages
  - 20 reasoning uses/day
  - 50 premium model uses/day
  - Unlimited voice features
  - Priority routing
  - All BYOK models
  ```

- [x] **G2 – Usage tracking** ✅
  - Real-time usage counters in UI
  - Usage analytics in settings
  - Warning at 80% usage
  - Soft block at limit (with upgrade prompt)

- [x] **G3 – Upgrade prompts** ✅
  - Contextual upgrade CTAs
  - Feature comparison modal
  - Trial offer for premium

---

## H. Security & Optimization

- [x] **H1 – Per-user rate limiting** ✅
  - Free: 10 req/min, 100 req/hour
  - Premium: 30 req/min, 500 req/hour
  - BYOK: Based on provider limits

- [x] **H2 – Input sanitization** ✅
  - Max message length validation
  - Strip potential XSS from user input
  - Validate file uploads (future)

- [x] **H3 – Response caching** ✅
  - Cache identical queries (short TTL)
  - ETag support for session loading
  - Optimistic UI updates

- [x] **H4 – Performance optimization** ✅
  - Virtualized message list for long sessions
  - Lazy load session history
  - Debounced input handling
  - Code-split provider modules

---

## I. Database Updates

- [x] **I1 – Quota tables update** ✅
  ```sql
  ALTER TABLE ai_chat_reasoning_quota
    ADD COLUMN model_type TEXT,
    ADD COLUMN reset_date DATE;
  
  CREATE TABLE ai_chat_usage_quota (
    user_id UUID PRIMARY KEY,
    standard_used INT DEFAULT 0,
    reasoning_used INT DEFAULT 0,
    premium_used INT DEFAULT 0,
    voice_used INT DEFAULT 0,
    reset_date DATE NOT NULL,
    FOREIGN KEY (user_id) REFERENCES auth.users(id)
  );
  ```

- [x] **I2 – Settings table update** ✅
  ```sql
  ALTER TABLE user_settings
    ADD COLUMN bytez_api_key_encrypted TEXT,
    ADD COLUMN openrouter_api_key_encrypted TEXT,
    ADD COLUMN preferred_model TEXT,
    ADD COLUMN auto_routing_enabled BOOLEAN DEFAULT true,
    ADD COLUMN voice_enabled BOOLEAN DEFAULT false,
    ADD COLUMN auto_speak BOOLEAN DEFAULT false;
  ```

- [x] **I3 – Session metadata** ✅
  ```sql
  ALTER TABLE ai_chat_sessions
    ADD COLUMN model_used TEXT,
    ADD COLUMN message_count INT DEFAULT 0,
    ADD COLUMN last_message_at TIMESTAMPTZ,
    ADD COLUMN tags TEXT[];
  ```

---

## J. AI API Observability & Error UX

- [x] **J1 – Structured AI API logging** ✅
  - Log provider, model, latency, and status for each AI call
  - Never log prompts, user content, or API keys
  - Correlate AI calls with chat session IDs and user IDs
  - Add log levels and clear error codes for analysis

- [x] **J2 – Centralized AI error mapping** ✅
  - Create a small mapper that converts provider errors → internal error codes
  - Normalize timeouts, auth errors, quota errors, and generic 5xx
  - Ensure frontend receives stable error shapes (code, message, hint)

- [x] **J3 – User-friendly error messages in Jovan UI** ✅
  - Replace generic "Something went wrong" with specific explanations:
    - Network issues, provider outage, quota exceeded, invalid BYOK, etc.
  - Show inline retry suggestions and fallback options (e.g. switch model)
  - Display non-blocking banners when provider is degraded

- [x] **J4 – AI usage & status panel in Settings/Jovan page** ✅
  - Add small panel showing:
    - Last AI error (if any) and human-readable explanation
    - Current provider/model status when known
    - Quota summary and reset time
  - Link to troubleshooting/help section

- [x] **J5 – Monitoring hooks for critical AI failures** ✅
  - Add hooks to push severe AI errors to Security Events / alerts
  - Track repeated failures for the same user/provider
  - Optionally expose simple health endpoint for AI providers

---

## Implementation Order

### Phase 1: Foundation (Backend)
1. B3 – Provider abstraction
2. B1 – Bytez provider
3. B2 – OpenRouter provider
4. B5 – Model registry
5. I1, I2, I3 – Database updates

### Phase 2: Smart Routing
1. C1 – Smart router
2. C2 – Routing rules
3. C4 – Fallback chain
4. D1 – Fix quota bugs

### Phase 3: Frontend Redesign
1. A1 – Empty state
2. A4 – Model selector
3. A2 – Sidebar redesign
4. A3 – Message improvements
5. A5 – Input redesign

### Phase 4: Voice Features
1. E2 – Backend Whisper
2. E1 – Voice input
3. E3 – Text-to-speech
4. E4 – Voice UI

### Phase 5: Premium & Polish
1. G1, G2 – Tier limits & tracking
2. D2, D3 – Quota system
3. F1, F2 – Session management
4. H1-H4 – Security & optimization
5. A6 – Mobile responsiveness

---

## API Integration Quick Reference

### Bytez Chat Completion
```typescript
const client = new OpenAI({
  apiKey: process.env.BYTEZ_API_KEY,
  baseURL: 'https://api.bytez.com/models/v2/openai/v1'
});

const response = await client.chat.completions.create({
  model: 'Qwen/Qwen3-0.6B',
  messages: [...],
  stream: true
});
```

### OpenRouter Chat Completion
```typescript
const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': 'https://marketview360.io',
    'X-Title': 'MarketView360 Jovan AI'
  }
});

const response = await client.chat.completions.create({
  model: 'allenai/olmo-3-32b-think:free',
  messages: [...],
  stream: true
});
```

### Groq Whisper Transcription
```typescript
const transcription = await groq.audio.transcriptions.create({
  file: audioFile,
  model: 'whisper-large-v3-turbo',
  response_format: 'json',
  language: 'en'
});
```

### Web Speech API (Text-to-Speech)
```typescript
const utterance = new SpeechSynthesisUtterance(text);
utterance.rate = 1.0;
utterance.pitch = 1.0;
speechSynthesis.speak(utterance);
```

---

## Notes

- BYOK means users provide API keys for Bytez, OpenRouter, or Groq - NOT direct OpenAI/Anthropic keys
- Free reasoning models should not count against premium reasoning quota
- Smart routing must never select BYOK models for users without keys
- Voice features should degrade gracefully when not supported
- All provider errors should result in user-friendly messages
