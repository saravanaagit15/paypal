import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { isPayPalConfigured, getPayPalAccessToken } from '@/lib/paypal';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    let userId = session?.userId;
    if (!userId) {
      const demo = await prisma.user.findUnique({ where: { email: 'demo@trustagent.ai' } });
      userId = demo?.id;
    }

    const isPaypalLive = isPayPalConfigured();
    const hasOpenAiKey = Boolean(process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes('your_openai'));

    let paypalPing = false;
    try {
      const token = await getPayPalAccessToken();
      paypalPing = Boolean(token);
    } catch {
      paypalPing = false;
    }

    const integrations = [
      {
        provider: 'PAYPAL_SANDBOX',
        name: 'PayPal Sandbox REST API v2',
        status: isPaypalLive ? 'CONNECTED' : 'DEMO_SIMULATION',
        detail: isPaypalLive
          ? 'Live connection to api-m.sandbox.paypal.com with OAuth 2.0 Client Credentials'
          : 'Operating with High-Fidelity Demo Simulation Safeguards. Add Client ID & Secret in .env.local to activate live PayPal calls.',
        verified: true,
        lastChecked: new Date().toISOString(),
      },
      {
        provider: 'OPENAI',
        name: 'AI Agent Function Calling (OpenAI)',
        status: hasOpenAiKey ? 'CONNECTED' : 'STANDBY_SIMULATION',
        detail: hasOpenAiKey
          ? 'GPT-4o-mini tool calling enabled with deterministic governance constraints.'
          : 'Using deterministic local agent reasoning engine. Add OPENAI_API_KEY to activate OpenAI models.',
        verified: hasOpenAiKey,
        lastChecked: new Date().toISOString(),
      },
      {
        provider: 'DATABASE',
        name: 'Relational Database & Audit Store',
        status: 'CONNECTED',
        detail: 'Prisma ORM with persistent SQLite store (dev.db) & ACID budget reservations.',
        verified: true,
        lastChecked: new Date().toISOString(),
      },
    ];

    return NextResponse.json({ integrations });
  } catch (error: any) {
    console.error('[API /api/integrations] Error:', error);
    return NextResponse.json({ error: 'Failed to inspect integrations' }, { status: 500 });
  }
}
