/**
 * AI Model Types and Utilities for Jovan Chat
 */

export type AIProviderName = 'groq' | 'bytez' | 'openrouter';

export type ModelCapability =
  | 'chat'
  | 'reasoning'
  | 'vision'
  | 'voice-input'
  | 'tools';

export type ModelTier = 'free' | 'premium' | 'byok';

export type ModelSpeed = 'ultra-fast' | 'fast' | 'medium' | 'slow';

/**
 * Model information from the API
 */
export interface AIModel {
  id: string;
  name: string;
  capabilities: ModelCapability[];
  tier: ModelTier;
  speed: ModelSpeed;
  description?: string;
  available: boolean;
  requiresByok: boolean;
}

/**
 * Response from GET /ai/models
 */
export interface ModelsResponse {
  providers: AIProviderName[];
  models: Record<AIProviderName, AIModel[]>;
  freeReasoningModels: string[];
}

/**
 * Response from GET /ai/providers/status
 */
export interface ProvidersStatusResponse {
  providers: Record<
    AIProviderName,
    {
      name: string;
      available: boolean;
    }
  >;
}

/**
 * Get display info for a model capability
 */
export function getCapabilityInfo(capability: ModelCapability): {
  label: string;
  color: string;
  icon: string;
} {
  switch (capability) {
    case 'reasoning':
      return { label: 'Reasoning', color: 'purple', icon: 'Brain' };
    case 'vision':
      return { label: 'Vision', color: 'blue', icon: 'Eye' };
    case 'tools':
      return { label: 'Tools', color: 'green', icon: 'Wrench' };
    case 'voice-input':
      return { label: 'Voice', color: 'orange', icon: 'Mic' };
    case 'chat':
    default:
      return { label: 'Chat', color: 'gray', icon: 'MessageSquare' };
  }
}

/**
 * Get display info for model speed
 */
export function getSpeedInfo(speed: ModelSpeed): {
  label: string;
  color: string;
} {
  switch (speed) {
    case 'ultra-fast':
      return { label: 'Ultra Fast', color: 'green' };
    case 'fast':
      return { label: 'Fast', color: 'emerald' };
    case 'medium':
      return { label: 'Medium', color: 'yellow' };
    case 'slow':
      return { label: 'Slow', color: 'orange' };
    default:
      return { label: 'Unknown', color: 'gray' };
  }
}

/**
 * Get display info for model tier
 */
export function getTierInfo(tier: ModelTier): {
  label: string;
  color: string;
  description: string;
} {
  switch (tier) {
    case 'free':
      return {
        label: 'Free',
        color: 'green',
        description: 'Available to all users',
      };
    case 'premium':
      return {
        label: 'Premium',
        color: 'purple',
        description: 'Requires premium subscription',
      };
    case 'byok':
      return {
        label: 'BYOK',
        color: 'amber',
        description: 'Requires your own API key',
      };
    default:
      return { label: 'Unknown', color: 'gray', description: '' };
  }
}

/**
 * Provider display names
 */
export const PROVIDER_NAMES: Record<AIProviderName, string> = {
  groq: 'Groq',
  bytez: 'Bytez',
  openrouter: 'OpenRouter',
};

/**
 * Check if a model supports reasoning
 */
export function supportsReasoning(model: AIModel): boolean {
  return model.capabilities.includes('reasoning');
}

/**
 * Check if a model supports vision
 */
export function supportsVision(model: AIModel): boolean {
  return model.capabilities.includes('vision');
}

/**
 * Filter models by capability
 */
export function filterByCapability(
  models: AIModel[],
  capability: ModelCapability,
): AIModel[] {
  return models.filter((m) => m.capabilities.includes(capability));
}

/**
 * Filter available models only
 */
export function filterAvailable(models: AIModel[]): AIModel[] {
  return models.filter((m) => m.available);
}

/**
 * Sort models by speed (fastest first)
 */
export function sortBySpeed(models: AIModel[]): AIModel[] {
  const speedOrder: Record<ModelSpeed, number> = {
    'ultra-fast': 0,
    fast: 1,
    medium: 2,
    slow: 3,
  };
  return [...models].sort(
    (a, b) => speedOrder[a.speed] - speedOrder[b.speed],
  );
}
