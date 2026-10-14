import { AIProviderConfig, ContentIdea, ContentObjective, ScriptItem, StyleProfile, VideoAnalysis, ChatMessage } from '@/types';
import {
  SYSTEM_STRATEGIST_PROMPT,
  SYSTEM_SCRIPTWRITER_PROMPT,
  SYSTEM_REEL_ANALYZER_PROMPT,
  SYSTEM_COACH_PROMPT,
} from './prompts';

export async function testAIConnection(config: AIProviderConfig): Promise<{ success: boolean; message: string; models?: string[] }> {
  if (config.provider === 'ollama') {
    try {
      const url = `${config.endpoint.replace(/\/$/, '')}/api/tags`;
      const res = await fetch(url, { method: 'GET', signal: AbortSignal.timeout(4000) });
      if (!res.ok) {
        return { success: false, message: `Ollama returned HTTP ${res.status}: ${res.statusText}` };
      }
      const data = await res.json();
      const models = (data.models || []).map((m: any) => m.name || m.model);
      return {
        success: true,
        message: `Successfully connected to Ollama! Found ${models.length} model(s).`,
        models: models.length > 0 ? models : ['llama3.2', 'mistral', 'qwen2.5'],
      };
    } catch (e: any) {
      return {
        success: false,
        message: `Could not connect to Ollama at ${config.endpoint}. Ensure Ollama is running ('ollama serve'). Error: ${e.message}`,
      };
    }
  }

  if (config.provider === 'openai' || config.provider === 'custom') {
    try {
      const url = `${config.endpoint.replace(/\/$/, '')}/models`;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (config.apiKey) headers['Authorization'] = `Bearer ${config.apiKey}`;

      const res = await fetch(url, { headers, signal: AbortSignal.timeout(5000) });
      if (!res.ok) {
        return { success: false, message: `Provider returned HTTP ${res.status}` };
      }
      const data = await res.json();
      const models = (data.data || []).map((m: any) => m.id);
      return {
        success: true,
        message: `Successfully connected to ${config.provider} API!`,
        models: models.length > 0 ? models.slice(0, 10) : ['gpt-4o-mini', 'gpt-4o'],
      };
    } catch (e: any) {
      return {
        success: false,
        message: `Could not connect to ${config.endpoint}: ${e.message}`,
      };
    }
  }

  return { success: true, message: 'Provider configured.' };
}

export async function executeAICompletion(
  prompt: string,
  systemPrompt: string,
  config?: Partial<AIProviderConfig>
): Promise<string> {
  const provider = config?.provider || 'ollama';
  const endpoint = config?.endpoint || 'http://localhost:11434';
  const model = config?.textModel || 'llama3.2';

  if (provider === 'ollama') {
    try {
      const url = `${endpoint.replace(/\/$/, '')}/api/generate`;
      const res = await fetch(url, {
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
        signal: AbortSignal.timeout(25000),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.response) return data.response;
      }
    } catch {
      // Fall through to fallback
    }
  } else if (provider === 'openai' || provider === 'custom') {
    try {
      const url = `${endpoint.replace(/\/$/, '')}/chat/completions`;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (config?.apiKey) headers['Authorization'] = `Bearer ${config.apiKey}`;

      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: config?.textModel || 'gpt-4o-mini',
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
        if (content) return content;
      }
    } catch {
      // Fall through to fallback
    }
  }

  return '';
}
