import { AIProviderConfig } from '@/types';

export interface AIConnectionTestResult {
  success: boolean;
  message: string;
  models?: string[];
}

export async function testAIConnection(config: AIProviderConfig): Promise<AIConnectionTestResult> {
  const provider = config.provider || 'ollama';

  if (provider === 'ollama') {
    const endpoint = (config.endpoint || 'http://localhost:11434').replace(/\/$/, '');
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
      const models: string[] = (data.models || []).map((m: { name?: string; model?: string }) => m.name || m.model || '');
      const validModels = models.filter(Boolean);

      return {
        success: true,
        message: `Connected to local Ollama (${validModels.length} model(s) installed). Zero API cost.`,
        models: validModels.length > 0 ? validModels : ['llama3.2', 'mistral', 'qwen2.5'],
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
      };
    } catch (e: unknown) {
      const err = e as Error;
      return { success: false, message: `OpenRouter connection failed: ${err.message}` };
    }
  }

  return { success: false, message: `Unknown AI provider: ${provider}` };
}

export async function executeAICompletion(
  prompt: string,
  systemPrompt: string,
  config?: Partial<AIProviderConfig>
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
    const endpoint = (config?.endpoint || 'http://localhost:11434').replace(/\/$/, '');
    const model = config?.textModel || 'llama3.2';

    try {
      const res = await fetch(`${endpoint}/api/generate`, {
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

      if (res.ok) {
        const data = await res.json();
        if (data.response) return data.response.trim();
      } else {
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
    const model = config?.groqModel || 'llama-3.3-70b-versatile';

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
    const model = config?.openRouterModel || 'meta-llama/llama-3.2-3b-instruct:free';

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

  return '';
}
