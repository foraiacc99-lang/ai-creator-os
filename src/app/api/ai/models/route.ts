import { NextRequest, NextResponse } from 'next/server';
import { OmniRouteModel, ModelProviderCategory } from '@/types';
import { cleanModelResponse } from '@/lib/ai/service';
import { isSafeEndpoint } from '@/lib/security';

// In-memory cache for local model catalog (TTL 30 seconds)
interface CatalogCache {
  endpoint: string;
  timestamp: number;
  models: OmniRouteModel[];
}
let catalogCache: CatalogCache | null = null;
const CACHE_TTL_MS = 30000;

function categorizeLocalModel(name: string): { provider: ModelProviderCategory; displayName: string } {
  const lower = name.toLowerCase();
  if (lower.includes('qwen')) {
    return { provider: 'Qwen / Alibaba', displayName: `Qwen (${name})` };
  }
  if (lower.includes('llama')) {
    return { provider: 'Meta Llama', displayName: `Llama (${name})` };
  }
  if (lower.includes('deepseek')) {
    return { provider: 'DeepSeek', displayName: `DeepSeek (${name})` };
  }
  if (lower.includes('gemma')) {
    return { provider: 'Google Gemini', displayName: `Gemma (${name})` };
  }
  if (lower.includes('mistral')) {
    return { provider: 'Mistral', displayName: `Mistral (${name})` };
  }
  return { provider: 'Ollama', displayName: name };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const clientEndpoint = searchParams.get('endpoint');
    const forceRefresh = searchParams.get('refresh') === 'true';

    const rawEndpoint = clientEndpoint || process.env.OLLAMA_ENDPOINT || 'http://localhost:11434';
    if (!isSafeEndpoint(rawEndpoint)) {
      return NextResponse.json(
        {
          success: false,
          isConnected: false,
          models: [],
          error: 'Invalid or restricted gateway URL provided.',
        },
        { status: 400 }
      );
    }
    const endpoint = rawEndpoint.replace(/\/$/, '');

    // Check cache
    const now = Date.now();
    if (!forceRefresh && catalogCache && catalogCache.endpoint === endpoint && now - catalogCache.timestamp < CACHE_TTL_MS) {
      return NextResponse.json({
        success: true,
        isConnected: true,
        cached: true,
        count: catalogCache.models.length,
        models: catalogCache.models,
        gateway: endpoint,
      });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    try {
      const response = await fetch(`${endpoint}/api/tags`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        return NextResponse.json({
          success: false,
          isConnected: false,
          models: [],
          error: `Ollama returned HTTP ${response.status}: ${response.statusText}`,
          gateway: endpoint,
        });
      }

      const data = await response.json();
      const rawList: Array<{ name?: string; model?: string; size?: number; details?: Record<string, unknown> }> =
        data.models || [];

      const parsedModels: OmniRouteModel[] = rawList.map((item) => {
        const id = item.name || item.model || 'unknown-model';
        const { provider, displayName } = categorizeLocalModel(id);
        const lower = id.toLowerCase();

        return {
          id,
          name: displayName,
          provider,
          rawProvider: 'ollama-local',
          description: `Local open-weights model running privately on your machine (${(
            (item.size || 0) /
            (1024 * 1024 * 1024)
          ).toFixed(1)} GB). Zero API cost.`,
          capabilities: {
            chat: true,
            code: lower.includes('coder') || lower.includes('qwen') || lower.includes('llama'),
            reasoning: lower.includes('r1') || lower.includes('qwen'),
            contextWindow: 32768,
          },
          pricing: {
            tier: 'free',
            isVerifiedFree: true,
            inputPer1k: 0,
            outputPer1k: 0,
            notes: 'Verified local offline execution. No token billing.',
          },
          isAvailable: true,
        };
      });

      // Ensure qwen3:8b is at the very top of the list if present
      parsedModels.sort((a, b) => {
        if (a.id.includes('qwen3:8b')) return -1;
        if (b.id.includes('qwen3:8b')) return 1;
        return a.name.localeCompare(b.name);
      });

      catalogCache = {
        endpoint,
        timestamp: now,
        models: parsedModels,
      };

      return NextResponse.json({
        success: true,
        isConnected: true,
        cached: false,
        count: parsedModels.length,
        models: parsedModels,
        gateway: endpoint,
      });
    } catch (fetchErr: unknown) {
      clearTimeout(timeout);
      const err = fetchErr as Error;

      // Fallback mock catalog with verified local models so UI stays functional even if Ollama is starting up
      const fallbackModels: OmniRouteModel[] = [
        {
          id: 'qwen3:8b',
          name: 'Qwen 3 8B (Verified Local)',
          provider: 'Qwen / Alibaba',
          rawProvider: 'ollama-local',
          description: 'Primary local 8B open-weights model. State-of-the-art coding and creator reasoning.',
          capabilities: { chat: true, code: true, reasoning: true, contextWindow: 32768 },
          pricing: { tier: 'free', isVerifiedFree: true, inputPer1k: 0, outputPer1k: 0 },
          isAvailable: true,
        },
        {
          id: 'llama3.2:latest',
          name: 'Llama 3.2 (Local)',
          provider: 'Meta Llama',
          rawProvider: 'ollama-local',
          description: 'Compact 3B local model for ultra-low latency tasks.',
          capabilities: { chat: true, code: false, contextWindow: 8192 },
          pricing: { tier: 'free', isVerifiedFree: true, inputPer1k: 0, outputPer1k: 0 },
          isAvailable: true,
        },
      ];

      return NextResponse.json({
        success: false,
        isConnected: false,
        models: fallbackModels,
        error: `Cannot reach Ollama at ${endpoint}. Run 'ollama serve' in terminal. Error: ${err.message}`,
        gateway: endpoint,
      });
    }
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { success: false, isConnected: false, models: [], error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action = 'test', modelId, endpoint: customEndpoint, customPrompt } = body;

    if (action === 'test') {
      if (!modelId) {
        return NextResponse.json(
          { success: false, error: 'A modelId is required to test inference.' },
          { status: 400 }
        );
      }

      const rawEndpoint = customEndpoint || 'http://localhost:11434';
      if (!isSafeEndpoint(rawEndpoint)) {
        return NextResponse.json(
          { success: false, error: 'Invalid or restricted gateway URL provided.' },
          { status: 400 }
        );
      }
      const endpoint = rawEndpoint.replace(/\/$/, '');
      const startTime = Date.now();

      try {
        const testPrompt = customPrompt || 'Respond with exactly: "Local Qwen model inference successful."';
        const res = await fetch(`${endpoint}/api/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: modelId,
            prompt: testPrompt,
            stream: false,
            options: { temperature: 0.1 },
          }),
          signal: AbortSignal.timeout(15000),
        });

        const latencyMs = Date.now() - startTime;

        if (!res.ok) {
          const errText = await res.text();
          return NextResponse.json({
            success: false,
            result: {
              modelId,
              success: false,
              latencyMs,
              errorMessage: `Ollama HTTP ${res.status}: ${errText}`,
              testedAt: new Date().toISOString(),
            },
          });
        }

        const data = await res.json();
        const rawOutput = data.response || '';
        const cleaned = cleanModelResponse(rawOutput);

        return NextResponse.json({
          success: true,
          result: {
            modelId,
            success: true,
            latencyMs,
            outputPreview: cleaned || 'Model responded successfully with zero errors.',
            testedAt: new Date().toISOString(),
          },
        });
      } catch (err: unknown) {
        const error = err as Error;
        return NextResponse.json({
          success: false,
          result: {
            modelId,
            success: false,
            latencyMs: Date.now() - startTime,
            errorMessage: `Cannot execute inference on ${modelId} at ${endpoint}: ${error.message}`,
            testedAt: new Date().toISOString(),
          },
        });
      }
    }

    return NextResponse.json({ success: false, error: `Unknown action: ${action}` }, { status: 400 });
  } catch (e: unknown) {
    const err = e as Error;
    return NextResponse.json(
      { success: false, error: err.message || 'Model test execution failed' },
      { status: 500 }
    );
  }
}
