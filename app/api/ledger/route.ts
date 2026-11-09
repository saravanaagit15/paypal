import { NextResponse } from 'next/server';
import { getLedgerEntries } from '@/lib/ledger';
import { getGuardrailConfig } from '@/lib/guardrails';

export async function GET() {
  try {
    const entries = getLedgerEntries();
    const guardrails = getGuardrailConfig();

    const totalSpent = entries
      .filter((e) => e.status === 'COMPLETED')
      .reduce((sum, e) => sum + e.amount, 0);

    const pendingCount = entries.filter((e) => e.status === 'PENDING_APPROVAL').length;
    const completedCount = entries.filter((e) => e.status === 'COMPLETED').length;

    return NextResponse.json({
      entries,
      guardrails,
      stats: {
        totalSpent: Number(totalSpent.toFixed(2)),
        remainingMonthlyBudget: Number((guardrails.monthlyLimit - guardrails.currentMonthlySpent).toFixed(2)),
        pendingCount,
        completedCount,
        totalTransactions: entries.length,
      },
    });
  } catch (error: any) {
    console.error('[API /api/ledger] Error:', error);
    return NextResponse.json({ error: 'Failed to retrieve ledger entries' }, { status: 500 });
  }
}

