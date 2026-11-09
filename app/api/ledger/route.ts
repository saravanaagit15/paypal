import { NextRequest, NextResponse } from 'next/server';
import { getDbLedgerEntries } from '@/lib/ledger';
import { prisma } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    // Find authenticated user or fallback to demo user
    let user = session ? await prisma.user.findUnique({ where: { id: session.userId }, include: { budget: true } }) : null;

    if (!user) {
      user = await prisma.user.findUnique({
        where: { email: 'demo@trustagent.ai' },
        include: { budget: true, spendingPolicy: true },
      });
    }

    const userId = user?.id;
    const entries = await getDbLedgerEntries(userId);

    const budget = user?.budget || {
      monthlyLimit: 200.0,
      currentMonthlySpent: 38.5,
      singleTxLimit: 25.0,
      dailyLimit: 50.0,
      weeklyLimit: 100.0,
      emergencyFreeze: false,
      currency: 'USD',
    };

    const totalSpent = entries
      .filter((e) => e.status === 'COMPLETED')
      .reduce((sum, e) => sum + e.amount, 0);

    const pendingCount = entries.filter((e) => e.status === 'PENDING_APPROVAL').length;
    const completedCount = entries.filter((e) => e.status === 'COMPLETED').length;
    const blockedCount = entries.filter((e) => e.status === 'BLOCKED_BY_GUARDRAIL' || e.status === 'REJECTED').length;

    return NextResponse.json({
      entries,
      guardrails: {
        singleTxLimit: budget.singleTxLimit,
        monthlyLimit: budget.monthlyLimit,
        currentMonthlySpent: budget.currentMonthlySpent,
        whitelistedCategories: [
          'developer tools',
          'github dependencies',
          'cloud hosting',
          'api credits',
          'open-source tipping',
          'infrastructure',
          'saas subscription',
        ],
      },
      stats: {
        totalSpent: Number(totalSpent.toFixed(2)),
        remainingMonthlyBudget: Number(Math.max(0, budget.monthlyLimit - budget.currentMonthlySpent).toFixed(2)),
        pendingCount,
        completedCount,
        blockedCount,
        totalTransactions: entries.length,
      },
    });
  } catch (error: any) {
    console.error('[API /api/ledger] Error:', error);
    return NextResponse.json({ error: 'Failed to retrieve ledger entries' }, { status: 500 });
  }
}
