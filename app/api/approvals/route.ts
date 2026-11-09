import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    let userId = session?.userId;

    if (!userId) {
      const demo = await prisma.user.findUnique({ where: { email: 'demo@trustagent.ai' } });
      userId = demo?.id;
    }

    if (!userId) {
      return NextResponse.json({ approvals: [] });
    }

    const approvals = await prisma.transactionApproval.findMany({
      where: { userId },
      include: {
        transaction: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ approvals });
  } catch (error: any) {
    console.error('[API /api/approvals] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch approvals' }, { status: 500 });
  }
}
