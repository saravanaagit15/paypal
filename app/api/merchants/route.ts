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
      return NextResponse.json({ whitelist: [], blacklist: [] });
    }

    const [whitelist, blacklist] = await Promise.all([
      prisma.merchantWhitelist.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
      prisma.merchantBlacklist.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
    ]);

    return NextResponse.json({ whitelist, blacklist });
  } catch (error: any) {
    console.error('[API /api/merchants] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch merchants' }, { status: 500 });
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { type, merchantName, domain, category, notes, reason } = body; // type: "WHITELIST" | "BLACKLIST"

    if (!merchantName) {
      return NextResponse.json({ error: 'Merchant name is required.' }, { status: 400 });
    }

    if (type === 'BLACKLIST') {
      const entry = await prisma.merchantBlacklist.create({
        data: {
          userId,
          merchantName: merchantName.trim(),
          domain: domain ? domain.trim() : null,
          reason: reason ? reason.trim() : 'Restricted by user policy',
        },
      });
      return NextResponse.json({ success: true, entry });
    }

    // Default to WHITELIST
    const entry = await prisma.merchantWhitelist.create({
      data: {
        userId,
        merchantName: merchantName.trim(),
        domain: domain ? domain.trim() : null,
        category: category ? category.trim() : 'developer tools',
        notes: notes ? notes.trim() : null,
      },
    });

    return NextResponse.json({ success: true, entry });
  } catch (error: any) {
    console.error('[API /api/merchants POST] Error:', error);
    return NextResponse.json({ error: 'Failed to add merchant' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const type = searchParams.get('type'); // "WHITELIST" | "BLACKLIST"

    if (!id) {
      return NextResponse.json({ error: 'Merchant ID is required.' }, { status: 400 });
    }

    if (type === 'BLACKLIST') {
      await prisma.merchantBlacklist.delete({ where: { id } });
    } else {
      await prisma.merchantWhitelist.delete({ where: { id } });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[API /api/merchants DELETE] Error:', error);
    return NextResponse.json({ error: 'Failed to delete merchant' }, { status: 500 });
  }
}

