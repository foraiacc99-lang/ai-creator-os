import { NextRequest, NextResponse } from 'next/server';
import { testAIConnection } from '@/lib/ai/service';
import { AIProviderConfig } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const config: AIProviderConfig = body.aiConfig || body;
    const result = await testAIConnection(config);
    return NextResponse.json(result);
  } catch (e: unknown) {
    const err = e as Error;
    return NextResponse.json(
      { success: false, message: err.message || 'Failed to test connection' },
      { status: 500 }
    );
  }
}
