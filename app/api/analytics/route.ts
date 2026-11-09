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
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format'); // "csv" or json

    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    // If CSV requested
    if (format === 'csv') {
      const header = 'ID,Timestamp,Type,Recipient,Category,Amount,Currency,Status,PayPalID,AutoCaptured\n';
      const rows = transactions
        .map((t) =>
          [
            t.id,
            t.createdAt.toISOString(),
            t.type,
            `"${t.recipient.replace(/"/g, '""')}"`,
            `"${t.category.replace(/"/g, '""')}"`,
            t.amount.toFixed(2),
            t.currency,
            t.status,
            t.captureId || t.orderId || t.payoutBatchId || '',
            t.autoCaptured ? 'TRUE' : 'FALSE',
          ].join(',')
        )
        .join('\n');

      return new NextResponse(header + rows, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="trustagent_ledger_${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      });
    }

    // Spending by Category
    const categoryMap: Record<string, number> = {};
    const merchantMap: Record<string, number> = {};
    let totalCompletedAmount = 0;
    let autonomousCount = 0;
    let manualApprovedCount = 0;
    let blockedCount = 0;
    let completedCount = 0;

    // Monthly spending breakdown (past 6 months)
    const monthlySpendingMap: Record<string, number> = {};

    transactions.forEach((tx) => {
      if (tx.status === 'COMPLETED') {
        totalCompletedAmount += tx.amount;
        completedCount++;

        // Category
        categoryMap[tx.category] = (categoryMap[tx.category] || 0) + tx.amount;

        // Merchant
        merchantMap[tx.recipient] = (merchantMap[tx.recipient] || 0) + tx.amount;

        // Month
        const monthKey = tx.createdAt.toLocaleString('default', { month: 'short' });
        monthlySpendingMap[monthKey] = (monthlySpendingMap[monthKey] || 0) + tx.amount;

        if (tx.autoCaptured) {
          autonomousCount++;
        } else {
          manualApprovedCount++;
        }
      } else if (tx.status === 'BLOCKED_BY_GUARDRAIL' || tx.status === 'REJECTED') {
        blockedCount++;
      }
    });

    const categoryBreakdown = Object.entries(categoryMap).map(([name, value]) => ({
      name,
      value: Number(value.toFixed(2)),
    }));

    const merchantBreakdown = Object.entries(merchantMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, amount]) => ({
        name,
        amount: Number(amount.toFixed(2)),
      }));

    const successRate =
      transactions.length > 0
        ? Math.round((completedCount / transactions.length) * 100)
        : 100;

    return NextResponse.json({
      totalSpend: Number(totalCompletedAmount.toFixed(2)),
      totalTransactions: transactions.length,
      completedCount,
      blockedCount,
      autonomousCount,
      manualApprovedCount,
      successRate,
      categoryBreakdown,
      merchantBreakdown,
      monthlySpending: Object.entries(monthlySpendingMap).map(([month, amount]) => ({
        month,
        amount: Number(amount.toFixed(2)),
      })),
    });
  } catch (error: any) {
    console.error('[API /api/analytics] Error:', error);
    return NextResponse.json({ error: 'Failed to compute analytics' }, { status: 500 });
  }
}
