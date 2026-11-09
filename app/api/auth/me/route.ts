import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        budget: true,
        spendingPolicy: true,
        merchantWhitelist: true,
        merchantBlacklist: true,
        integrations: true,
      },
    });

    if (!user) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
        budget: user.budget,
        spendingPolicy: user.spendingPolicy,
        merchantWhitelist: user.merchantWhitelist,
        merchantBlacklist: user.merchantBlacklist,
        integrations: user.integrations,
      },
    });
  } catch (error: any) {
    console.error('[API /auth/me] Error:', error);
    return NextResponse.json({ error: 'Failed to verify session' }, { status: 500 });
  }
}
