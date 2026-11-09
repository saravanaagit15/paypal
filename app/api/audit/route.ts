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
      return NextResponse.json({ logs: [] });
    }

    const logs = await prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json({ logs });
  } catch (error: any) {
    console.error('[API /api/audit] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 });
  }
}
