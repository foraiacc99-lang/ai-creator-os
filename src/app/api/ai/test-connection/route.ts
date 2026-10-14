import { NextRequest, NextResponse } from 'next/server';
import { testAIConnection } from '@/lib/ai/service';

export async function POST(req: NextRequest) {
  try {
    const config = await req.json();
    const result = await testAIConnection(config);
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json(
      { success: false, message: e.message || 'Failed to test connection' },
      { status: 500 }
    );
  }
}
