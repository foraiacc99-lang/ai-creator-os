import { NextRequest, NextResponse } from 'next/server';
import {
  parseOmniRouteModel,
  testOmniRouteModel,
  OMNIROUTE_DEFAULT_ENDPOINT,
} from '@/lib/ai/service';
import { OmniRouteModel } from '@/types';

// In-memory cache for model catalog (TTL 30 seconds)
interface CatalogCache {
  endpoint: string;
  timestamp: number;
  models: OmniRouteModel[];
}
let catalogCache: CatalogCache | null = null;
const CACHE_TTL_MS = 30000;

function isSafeEndpoint(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr);
    if (!['http:', 'https:'].includes(parsed.protocol)) return false;
    const hostname = parsed.hostname.toLowerCase();
    // Block cloud metadata services (AWS/GCP/Azure)
    if (hostname === '169.254.169.254' || hostname === 'metadata.google.internal') {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const clientEndpoint = searchParams.get('endpoint');
    const forceRefresh = searchParams.get('refresh') === 'true';

    const rawEndpoint =
      clientEndpoint ||
      process.env.OMNIROUTE_ENDPOINT ||
      OMNIROUTE_DEFAULT_ENDPOINT;

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
    const serverApiKey = process.env.OMNIROUTE_API_KEY;
    const clientAuth = req.headers.get('x-omniroute-key');
    const apiKey = clientAuth || serverApiKey;

    // Check cache
    const now = Date.now();
    if (
      !forceRefresh &&
      catalogCache &&
      catalogCache.endpoint === endpoint &&
      now - catalogCache.timestamp < CACHE_TTL_MS
    ) {
      return NextResponse.json({
        success: true,
        isConnected: true,
        cached: true,
        count: catalogCache.models.length,
        models: catalogCache.models,
        gateway: endpoint,
      });
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'AICreatorOS/1.0',
    };
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    try {
      const response = await fetch(`${endpoint}/models`, {
        method: 'GET',
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        return NextResponse.json({
          success: false,
          isConnected: false,
          models: [],
          error: `OmniRoute gateway returned HTTP ${response.status}: ${response.statusText}`,
          gateway: endpoint,
        });
      }

      const data = await response.json();
      const rawList: Array<Record<string, unknown>> = data.data || data.models || [];

      const parsedModels: OmniRouteModel[] = rawList
        .map((item) => parseOmniRouteModel(item as Parameters<typeof parseOmniRouteModel>[0]))
        .sort((a, b) => {
          // Sort by provider then name
          if (a.provider !== b.provider) return a.provider.localeCompare(b.provider);
          return a.name.localeCompare(b.name);
        });

      // Update in-memory cache
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
      return NextResponse.json({
        success: false,
        isConnected: false,
        models: [],
        error: `Cannot reach OmniRoute at ${endpoint}. Ensure the OmniRoute service is running (e.g. 'npx omniroute@latest' on port 20128). Error: ${err.message}`,
        gateway: endpoint,
      });
    }
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      {
        success: false,
        isConnected: false,
        models: [],
        error: error.message || 'Internal error fetching models catalog',
      },
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

      const rawEndpoint =
        customEndpoint ||
        process.env.OMNIROUTE_ENDPOINT ||
        OMNIROUTE_DEFAULT_ENDPOINT;

      if (!isSafeEndpoint(rawEndpoint)) {
        return NextResponse.json(
          { success: false, error: 'Invalid or restricted gateway URL.' },
          { status: 400 }
        );
      }

      const clientAuth = req.headers.get('x-omniroute-key');
      const apiKey = clientAuth || process.env.OMNIROUTE_API_KEY;

      const result = await testOmniRouteModel(
        modelId,
        rawEndpoint,
        apiKey,
        customPrompt || 'Respond with exactly: "OmniRoute model test successful."'
      );

      return NextResponse.json({ success: result.success, result });
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
