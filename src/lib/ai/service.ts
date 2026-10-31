export function cleanModelResponse(text: string): string {
  if (!text) return '';
  return text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
}

import {
  AIProviderConfig,
  OmniRouteModel,
  ModelProviderCategory,
  ModelPricingInfo,
  ModelCapabilities,
  ModelTestResult,
  ModelRecommendation,
  ModelModule,
} from '@/types';

import { isSafeEndpoint } from '@/lib/security';

export const OMNIROUTE_DEFAULT_ENDPOINT = 'http://localhost:20128/v1';

export interface AIConnectionTestResult {
  success: boolean;
  message: string;
  models?: string[];
  latencyMs?: number;
}

export function identifyModelProvider(id: string, rawProvider?: string): ModelProviderCategory {
  const check = `${id} ${rawProvider || ''}`.toLowerCase();
  if (check.includes('kimi') || check.includes('moonshot')) return 'Kimi / Moonshot';
  if (check.includes('glm') || check.includes('zhipu') || check.includes('chatglm')) return 'GLM / Zhipu';
  if (check.includes('claude') || check.includes('anthropic')) return 'Anthropic';
  if (
    check.includes('gpt') ||
    check.includes('o1') ||
    check.includes('o3') ||
    check.includes('openai') ||
    check.includes('text-embedding')
  ) {
    return 'OpenAI';
  }
  if (check.includes('gemini') || check.includes('google')) return 'Google Gemini';
  if (check.includes('deepseek')) return 'DeepSeek';
  if (check.includes('llama') || check.includes('meta')) return 'Meta Llama';
  if (check.includes('qwen') || check.includes('alibaba')) return 'Qwen / Alibaba';
  if (check.includes('mistral') || check.includes('mixtral') || check.includes('codestral')) return 'Mistral';
  if (check.includes('ollama') || check.includes('local')) return 'Ollama';
  return 'Other / Routed';
}

export function identifyModelPricing(
  id: string,
  rawPricing?: { inputPer1k?: number; outputPer1k?: number }
): ModelPricingInfo {
  const lower = id.toLowerCase();

  // 1. Explicitly tagged free tier or local zero-cost
  if (
    lower.includes(':free') ||
    lower.includes('/free') ||
    lower.includes('free-') ||
    lower.endsWith('-free')
  ) {
    return {
      tier: 'free',
      isVerifiedFree: true,
      notes: 'Provider marked free tier',
    };
  }

  // 2. Verified zero-cost local inference
  if (lower.includes('ollama') || lower.startsWith('local/')) {
    return {
      tier: 'free',
      isVerifiedFree: true,
      notes: 'Local hardware inference (0 API cost)',
    };
  }

  // 3. Known budget/low-cost models
  if (
    lower.includes('flash') ||
    lower.includes('mini') ||
    lower.includes('8b') ||
    lower.includes('3b') ||
    lower.includes('1.5b') ||
    lower.includes('haiku') ||
    lower.includes('deepseek-chat')
  ) {
    return {
      tier: 'low_cost',
      isVerifiedFree: false,
      notes: 'High efficiency / low-cost tier',
    };
  }

  // 4. If raw pricing details are returned by OmniRoute gateway
  if (rawPricing && typeof rawPricing.inputPer1k === 'number') {
    const isFree = rawPricing.inputPer1k === 0 && (rawPricing.outputPer1k ?? 0) === 0;
    return {
      tier: isFree ? 'free' : rawPricing.inputPer1k < 0.001 ? 'low_cost' : 'paid',
      inputPer1k: rawPricing.inputPer1k,
      outputPer1k: rawPricing.outputPer1k,
      isVerifiedFree: isFree,
      notes: isFree ? 'Gateway verified free' : undefined,
    };
  }

  // 5. Strict rule: If pricing cannot be verified, mark it unknown instead of calling it free.
  return {
    tier: 'unknown',
    isVerifiedFree: false,
    notes: 'Pricing unverified on gateway',
  };
}

export function identifyModelCapabilities(
  id: string,
  rawCaps?: { vision?: boolean; reasoning?: boolean; code?: boolean; contextWindow?: number }
): ModelCapabilities {
  const lower = id.toLowerCase();
  return {
    chat: true,
    vision: Boolean(
      rawCaps?.vision ||
        lower.includes('vision') ||
        lower.includes('vl') ||
        lower.includes('4o') ||
        lower.includes('gemini')
    ),
    reasoning: Boolean(
      rawCaps?.reasoning ||
        lower.includes('r1') ||
        lower.includes('o1') ||
        lower.includes('o3') ||
        lower.includes('reason')
    ),
    code: Boolean(
      rawCaps?.code ||
        lower.includes('coder') ||
        lower.includes('code') ||
        lower.includes('sonnet') ||
        lower.includes('qwen-2.5-coder')
    ),
    contextWindow: rawCaps?.contextWindow,
  };
}

export function parseOmniRouteModel(raw: {
  id?: string;
  name?: string;
  owned_by?: string;
  provider?: string;
  pricing?: { inputPer1k?: number; outputPer1k?: number };
  capabilities?: { vision?: boolean; reasoning?: boolean; code?: boolean; contextWindow?: number };
}): OmniRouteModel {
  const id = raw.id || raw.name || 'unknown-model';
  const rawProvider = raw.owned_by || raw.provider || '';
  const provider = identifyModelProvider(id, rawProvider);
  const pricing = identifyModelPricing(id, rawPricingFromRaw(raw));
  const capabilities = identifyModelCapabilities(id, raw.capabilities);

  return {
    id,
    name: raw.name || id,
    provider,
    rawProvider,
    capabilities,
    pricing,
    isAvailable: true,
  };
}

function rawPricingFromRaw(raw: Record<string, unknown>): { inputPer1k?: number; outputPer1k?: number } | undefined {
  if (raw.pricing && typeof raw.pricing === 'object') {
    return raw.pricing as { inputPer1k?: number; outputPer1k?: number };
  }
  return undefined;
}

export async function testAIConnection(config: AIProviderConfig): Promise<AIConnectionTestResult> {
  const provider = config.provider || 'ollama';

  if (provider === 'ollama') {
    const rawEndpoint = config.endpoint || 'http://localhost:11434';
    if (!isSafeEndpoint(rawEndpoint)) {
      return { success: false, message: 'Invalid or restricted endpoint URL provided.' };
    }
    const endpoint = rawEndpoint.replace(/\/$/, '');
    const startTime = Date.now();
    try {
      const res = await fetch(`${endpoint}/api/tags`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(4000),
      });

      if (!res.ok) {
        return {
          success: false,
          message: `Ollama service reachable but returned HTTP ${res.status}: ${res.statusText}`,
        };
      }

      const data = await res.json();
      const models: string[] = (data.models || []).map(
        (m: { name?: string; model?: string }) => m.name || m.model || ''
      );
      const validModels = models.filter(Boolean);

      return {
        success: true,
        message: `Connected to local Ollama (${validModels.length} model(s) installed). Zero API cost.`,
        models: validModels.length > 0 ? validModels : ['llama3.2', 'mistral', 'qwen2.5'],
        latencyMs: Date.now() - startTime,
      };
    } catch (e: unknown) {
      const err = e as Error;
      return {
        success: false,
        message: `Cannot reach Ollama at ${endpoint}. Ensure Ollama is running ('ollama serve') or verify your port. Error: ${err.message}`,
      };
    }
  }

  // Cloud safety check
  if (config.localOnlyMode) {
    return {
      success: false,
      message: 'Local-only mode is active. Cloud providers are blocked to prevent external API calls.',
    };
  }

  if (provider === 'groq') {
    if (!config.isCloudEnabled) {
      return {
        success: false,
        message: 'Cloud providers are disabled. Toggle "Enable Cloud AI" in Settings to use Groq.',
      };
    }
    const apiKey = config.groqApiKey || process.env.GROQ_API_KEY;
    if (!apiKey) {
      return {
        success: false,
        message: 'No Groq API key configured. Provide an API key in Settings > AI Configuration.',
      };
    }

    const startTime = Date.now();
    try {
      const res = await fetch('https://api.groq.com/openai/v1/models', {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(5000),
      });

      if (!res.ok) {
        return { success: false, message: `Groq API returned HTTP ${res.status}: ${res.statusText}` };
      }

      const data = await res.json();
      const models = (data.data || []).map((m: { id: string }) => m.id);
      return {
        success: true,
        message: `Successfully connected to Groq Cloud API (${models.length} model(s) available).`,
        models: models.length > 0 ? models.slice(0, 10) : ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'],
        latencyMs: Date.now() - startTime,
      };
    } catch (e: unknown) {
      const err = e as Error;
      return { success: false, message: `Groq connection failed: ${err.message}` };
    }
  }

  if (provider === 'openrouter') {
    if (!config.isCloudEnabled) {
      return {
        success: false,
        message: 'Cloud providers are disabled. Toggle "Enable Cloud AI" in Settings to use OpenRouter.',
      };
    }
    const apiKey = config.openRouterApiKey || process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return {
        success: false,
        message: 'No OpenRouter API key configured. Provide an API key in Settings > AI Configuration.',
      };
    }

    const startTime = Date.now();
    try {
      const res = await fetch('https://openrouter.ai/api/v1/models', {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(5000),
      });

      if (!res.ok) {
        return { success: false, message: `OpenRouter returned HTTP ${res.status}: ${res.statusText}` };
      }

      const data = await res.json();
      const models = (data.data || []).map((m: { id: string }) => m.id);
      return {
        success: true,
        message: `Successfully connected to OpenRouter API (${models.length} models available).`,
        models: models.length > 0 ? models.slice(0, 10) : ['meta-llama/llama-3.2-3b-instruct:free'],
        latencyMs: Date.now() - startTime,
      };
    } catch (e: unknown) {
      const err = e as Error;
      return { success: false, message: `OpenRouter connection failed: ${err.message}` };
    }
  }

  if ((provider as string) === 'omniroute') {
    const rawEndpoint =
      config.omniRouteEndpoint || process.env.OMNIROUTE_ENDPOINT || OMNIROUTE_DEFAULT_ENDPOINT;
    const endpoint = rawEndpoint.replace(/\/$/, '');
    const apiKey = config.omniRouteApiKey || process.env.OMNIROUTE_API_KEY;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;

    const startTime = Date.now();
    try {
      const res = await fetch(`${endpoint}/models`, {
        method: 'GET',
        headers,
        signal: AbortSignal.timeout(5000),
      });

      if (!res.ok) {
        return {
          success: false,
          message: `OmniRoute gateway returned HTTP ${res.status}: ${res.statusText}`,
        };
      }

      const data = await res.json();
      const models = (data.data || data.models || [])
        .map((m: { id?: string; name?: string }) => m.id || m.name || '')
        .filter(Boolean);

      return {
        success: true,
        message: `Connected to OmniRoute gateway (${models.length > 0 ? models.length : 'active'} model(s) discovered).`,
        models: models.length > 0 ? models.slice(0, 20) : [config.omniRouteModel || 'default-router'],
        latencyMs: Date.now() - startTime,
      };
    } catch (e: unknown) {
      const err = e as Error;
      return {
        success: false,
        message: `Cannot reach OmniRoute at ${endpoint}. Ensure the OmniRoute service is running (e.g. 'npx omniroute@latest' on port 20128). Error: ${err.message}`,
      };
    }
  }

  return { success: false, message: `Unknown AI provider: ${provider}` };
}

export async function executeAICompletion(
  prompt: string,
  systemPrompt: string,
  config?: Partial<AIProviderConfig> & { model?: string }
): Promise<string> {
  const provider = config?.provider || 'ollama';

  // Zero-cost safety check
  if (provider !== 'ollama') {
    if (config?.localOnlyMode) {
      throw new Error('Local-only safety switch is enabled. Cloud AI calls are strictly blocked.');
    }
    if (!config?.isCloudEnabled) {
      throw new Error('Cloud AI is disabled in settings. Enable cloud providers or select local Ollama.');
    }
  }

  // 1. Ollama (Default, Zero Cost)
  if (provider === 'ollama') {
    const rawEndpoint = config?.endpoint || 'http://localhost:11434';
    if (!isSafeEndpoint(rawEndpoint)) {
      throw new Error('Invalid or restricted endpoint URL provided.');
    }
    const endpoint = rawEndpoint.replace(/\/$/, '');
    let model = config?.model || config?.textModel || 'qwen3:8b';

    // Normalize any cloud model name passed mistakenly to Ollama
    if (
      model.includes('kimi') ||
      model.includes('moonshot') ||
      model.includes('gpt') ||
      model.includes('claude') ||
      model.includes('o1') ||
      model.includes('o3')
    ) {
      model = 'llama3.2';
    }

    try {
      let res = await fetch(`${endpoint}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          prompt,
          system: systemPrompt,
          stream: false,
          options: {
            temperature: config?.temperature ?? 0.7,
          },
        }),
        signal: AbortSignal.timeout(30000),
      });

      let data: any = null;
      if (res.ok) {
        data = await res.json();
        if (data.response) return cleanModelResponse(data.response);
      }

      // If requested model was not found in Ollama, query /api/tags and retry with first available model
      if (!res.ok || (data && data.error && data.error.includes('not found'))) {
        try {
          const tagsRes = await fetch(`${endpoint}/api/tags`, { signal: AbortSignal.timeout(3000) });
          if (tagsRes.ok) {
            const tagsData = await tagsRes.json();
            const available: string[] = (tagsData.models || []).map((m: any) => m.name || m.model || '');
            const fallbackModel =
              available.find((m: string) => m.includes('qwen') || m.includes('llama') || m.includes('gemma')) ||
              available[0];

            if (fallbackModel && fallbackModel !== model) {
              const retryRes = await fetch(`${endpoint}/api/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  model: fallbackModel,
                  prompt,
                  system: systemPrompt,
                  stream: false,
                  options: {
                    temperature: config?.temperature ?? 0.7,
                  },
                }),
                signal: AbortSignal.timeout(30000),
              });
              if (retryRes.ok) {
                const retryData = await retryRes.json();
                if (retryData.response) return cleanModelResponse(retryData.response);
              }
            }
          }
        } catch {
          // ignore tag lookup error
        }
      }

      if (res && !res.ok) {
        const errText = await res.text();
        console.warn(`Ollama error HTTP ${res.status}: ${errText}`);
      }
    } catch (e: unknown) {
      const err = e as Error;
      console.warn(`Ollama execution failed at ${endpoint}: ${err.message}`);
    }
  }

  // 2. Groq (Optional)
  if (provider === 'groq') {
    const apiKey = config?.groqApiKey || process.env.GROQ_API_KEY;
    const model = config?.model || config?.groqModel || 'llama-3.3-70b-versatile';

    if (apiKey) {
      try {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: prompt },
            ],
            temperature: config?.temperature ?? 0.7,
          }),
          signal: AbortSignal.timeout(25000),
        });

        if (res.ok) {
          const data = await res.json();
          const content = data.choices?.[0]?.message?.content;
          if (content) return content.trim();
        }
      } catch (e: unknown) {
        const err = e as Error;
        console.warn(`Groq completion error: ${err.message}`);
      }
    }
  }

  // 3. OpenRouter (Optional)
  if (provider === 'openrouter') {
    const apiKey = config?.openRouterApiKey || process.env.OPENROUTER_API_KEY;
    const model = config?.model || config?.openRouterModel || 'meta-llama/llama-3.2-3b-instruct:free';

    if (apiKey) {
      try {
        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost:3000',
            'X-Title': 'AI Creator OS',
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: prompt },
            ],
            temperature: config?.temperature ?? 0.7,
          }),
          signal: AbortSignal.timeout(25000),
        });

        if (res.ok) {
          const data = await res.json();
          const content = data.choices?.[0]?.message?.content;
          if (content) return content.trim();
        }
      } catch (e: unknown) {
        const err = e as Error;
        console.warn(`OpenRouter completion error: ${err.message}`);
      }
    }
  }

  // 4. OmniRoute (Central AI router / Gateway)
  if ((provider as string) === 'omniroute') {
    const rawEndpoint =
      config?.omniRouteEndpoint || process.env.OMNIROUTE_ENDPOINT || OMNIROUTE_DEFAULT_ENDPOINT;
    const endpoint = rawEndpoint.replace(/\/$/, '');
    const apiKey = config?.omniRouteApiKey || process.env.OMNIROUTE_API_KEY;
    const model = config?.model || config?.omniRouteModel || 'default';
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;

    try {
      const res = await fetch(`${endpoint}/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt },
          ],
          temperature: config?.temperature ?? 0.7,
        }),
        signal: AbortSignal.timeout(35000),
      });

      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) return content.trim();
      } else {
        const errText = await res.text();
        console.warn(`OmniRoute error HTTP ${res.status}: ${errText}`);
      }
    } catch (e: unknown) {
      const err = e as Error;
      console.warn(`OmniRoute completion error: ${err.message}`);
    }
  }

  return '';
}

export async function testOmniRouteModel(
  modelId: string,
  endpoint?: string,
  apiKey?: string,
  customPrompt = 'Respond with exactly: "OmniRoute model test successful."'
): Promise<ModelTestResult> {
  const base = (endpoint || OMNIROUTE_DEFAULT_ENDPOINT).replace(/\/$/, '');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;

  const startTime = Date.now();
  try {
    const res = await fetch(`${base}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: modelId,
        messages: [{ role: 'user', content: customPrompt }],
        temperature: 0.2,
      }),
      signal: AbortSignal.timeout(15000),
    });

    const latencyMs = Date.now() - startTime;

    if (!res.ok) {
      const errText = await res.text();
      return {
        modelId,
        success: false,
        latencyMs,
        errorMessage: `HTTP ${res.status} from gateway: ${errText.slice(0, 200)}`,
        testedAt: new Date().toISOString(),
      };
    }

    const data = await res.json();
    const outputPreview = data.choices?.[0]?.message?.content?.trim() || '';

    return {
      modelId,
      success: true,
      latencyMs,
      outputPreview,
      tokenUsage: data.usage
        ? {
            promptTokens: data.usage.prompt_tokens,
            completionTokens: data.usage.completion_tokens,
            totalTokens: data.usage.total_tokens,
          }
        : undefined,
      testedAt: new Date().toISOString(),
    };
  } catch (e: unknown) {
    const err = e as Error;
    return {
      modelId,
      success: false,
      latencyMs: Date.now() - startTime,
      errorMessage: err.message || 'Model test request timed out or failed.',
      testedAt: new Date().toISOString(),
    };
  }
}

export function recommendModelForTask(
  task: ModelModule,
  availableModels: OmniRouteModel[],
  freeOnly = false
): ModelRecommendation | null {
  if (!availableModels || availableModels.length === 0) return null;

  const filtered = freeOnly
    ? availableModels.filter((m) => m.pricing.tier === 'free' || m.pricing.tier === 'low_cost')
    : availableModels;

  const pool = filtered.length > 0 ? filtered : availableModels;

  // Criteria maps for task keywords
  const taskKeywords: Record<ModelModule, string[]> = {
    chat: ['claude-3-5-sonnet', 'gpt-4o', 'kimi', 'glm-4', 'gemini-1.5-flash', 'llama-3.3-70b', 'deepseek-chat'],
    scripts: ['claude-3-5-sonnet', 'kimi', 'gpt-4o', 'llama-3.3', 'qwen-2.5-72b', 'glm-4'],
    ideas: ['gemini-1.5-pro', 'claude-3-5-sonnet', 'gpt-4o', 'mistral-large', 'kimi'],
    carousel: ['claude-3-5-sonnet', 'gpt-4o', 'kimi', 'deepseek-chat', 'llama-3.3'],
    linkedin: ['claude-3-5-sonnet', 'kimi', 'gpt-4o', 'deepseek-chat', 'glm-4'],
    strategist: ['deepseek-r1', 'o1', 'claude-3-5-sonnet', 'gpt-4o', 'gemini-1.5-pro'],
    competitor: ['gemini-1.5-flash', 'claude-3-5-sonnet', 'gpt-4o-mini', 'llama-3.1-8b'],
    x_posts: ['qwen3:8b', 'qwen-2.5', 'llama-3.3', 'claude-3-5-sonnet', 'gpt-4o', 'kimi'],
  };

  const rationales: Record<ModelModule, string> = {
    chat: 'Fast, nuanced conversational flow with high adherence to creator context.',
    scripts: 'Excels at spoken cadence, rhythmic hooks, and human conversational storytelling.',
    ideas: 'High divergent creativity and structured ideation across diverse angles.',
    carousel: 'Strong visual hierarchy copywriting, high-density slide structuring, and design cues.',
    linkedin: 'Polished professional tone, balanced insight, and platform-native conversational framing.',
    strategist: 'Deep analytical reasoning, multi-step problem solving, and strategic trade-off evaluation.',
    competitor: 'High-speed synthesis, concise summarization, and key takeaway distillation.',
    x_posts: 'Punchy 280-character native tone, bold hooks, witty punchlines, and multi-post thread structuring.',
  };

  const targets = taskKeywords[task] || [];

  // 1. Search for preferred target model
  for (const keyword of targets) {
    const match = pool.find((m) => m.id.toLowerCase().includes(keyword));
    if (match) {
      return {
        task,
        recommendedModelId: match.id,
        modelName: match.name,
        provider: match.provider,
        rationale: rationales[task],
        pricingTier: match.pricing.tier,
        confidenceScore: 0.95,
      };
    }
  }

  // 2. Fallback to first available model in the filtered pool
  const candidate = pool[0];
  return {
    task,
    recommendedModelId: candidate.id,
    modelName: candidate.name,
    provider: candidate.provider,
    rationale: `Selected as an active available model from your running ${candidate.provider} gateway.`,
    pricingTier: candidate.pricing.tier,
    confidenceScore: 0.75,
  };
}
