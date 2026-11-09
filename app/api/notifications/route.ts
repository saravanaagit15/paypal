import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    let userId = session?.userId;
    if (!userId) {
      const demo = await prisma.user.findUnique({ where: { email: 'demo@trustagent.ai' } });
      userId = demo?.id;
    }

    if (!userId) {
      return NextResponse.json({ notifications: [], unreadCount: 0 });
    }

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const unreadCount = notifications.filter((n) => !n.read).length;

    return NextResponse.json({ notifications, unreadCount });
  } catch (error: any) {
    console.error('[API /api/notifications] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    let userId = session?.userId;
    if (!userId) {
      const demo = await prisma.user.findUnique({ where: { email: 'demo@trustagent.ai' } });
      userId = demo?.id;
    }

    if (!userId) {
      return NextResponse.json({ success: false });
    }

    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[API /api/notifications POST] Error:', error);
    return NextResponse.json({ error: 'Failed to mark read' }, { status: 500 });
  }
}

