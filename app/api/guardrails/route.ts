import { NextRequest, NextResponse } from 'next/server';
import { getGuardrailConfig, updateGuardrailConfig } from '@/lib/guardrails';

export async function GET() {
  return NextResponse.json(getGuardrailConfig());
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const updated = updateGuardrailConfig(body);
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to update guardrails' }, { status: 500 });
  }
}

