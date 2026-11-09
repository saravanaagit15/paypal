import { LedgerEntry } from './types';
import { prisma } from './db';

export async function getDbLedgerEntries(userId?: string): Promise<LedgerEntry[]> {
  try {
    const whereClause: any = {};
    if (userId) {
      whereClause.userId = userId;
    }

    const txs = await prisma.transaction.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    if (txs.length > 0) {
      return txs.map((t) => ({
        id: t.id,
        timestamp: t.createdAt.toISOString(),
        type: t.type as any,
        amount: t.amount,
        currency: t.currency,
        recipient: t.recipient,
        category: t.category,
        description: t.description,
        status: t.status as any,
        paypalOrderId: t.orderId || undefined,
        paypalCaptureId: t.captureId || undefined,
        paypalPayoutBatchId: t.payoutBatchId || undefined,
        guardrailEvaluated: t.guardrailEvaluated,
        autoCaptured: t.autoCaptured,
        requiresApproval: t.requiresApproval,
        rawResponse: t.rawResponseJson ? JSON.parse(t.rawResponseJson) : undefined,
      }));
    }
  } catch (err) {
    console.error('Error fetching DB ledger entries:', err);
  }

  return [];
}

export async function addDbTransaction(data: {
  userId: string;
  orderId?: string;
  captureId?: string;
  payoutBatchId?: string;
  type: 'ORDER_CAPTURE' | 'PAYOUT' | 'DIRECT_CHECKOUT';
  amount: number;
  currency?: string;
  recipient: string;
  category: string;
  description: string;
  status: 'COMPLETED' | 'PENDING_APPROVAL' | 'BLOCKED_BY_GUARDRAIL' | 'FAILED' | 'REJECTED';
  requiresApproval?: boolean;
  autoCaptured?: boolean;
  guardrailEvaluated?: boolean;
  riskScore?: number;
  rawResponse?: any;
}) {
  try {
    const tx = await prisma.transaction.create({
      data: {
        userId: data.userId,
        orderId: data.orderId,
        captureId: data.captureId,
        payoutBatchId: data.payoutBatchId,
        type: data.type,
        amount: data.amount,
        currency: data.currency || 'USD',
        recipient: data.recipient,
        category: data.category,
        description: data.description,
        status: data.status,
        requiresApproval: Boolean(data.requiresApproval),
        autoCaptured: Boolean(data.autoCaptured),
        guardrailEvaluated: data.guardrailEvaluated ?? true,
        riskScore: data.riskScore ?? 0.0,
        rawResponseJson: data.rawResponse ? JSON.stringify(data.rawResponse) : null,
      },
    });

    if (data.status === 'PENDING_APPROVAL') {
      await prisma.transactionApproval.create({
        data: {
          transactionId: tx.id,
          userId: data.userId,
          status: 'PENDING',
          reason: `Amount exceeds single transaction threshold`,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });

      await prisma.notification.create({
        data: {
          userId: data.userId,
          type: 'APPROVAL_REQUIRED',
          title: 'Authorization Required',
          message: `Pending authorization of $${data.amount.toFixed(2)} for ${data.recipient}`,
          link: '/dashboard/approvals',
        },
      });
    }

    return tx;
  } catch (err) {
    console.error('Error adding DB transaction:', err);
    return null;
  }
}

export async function addLedgerEntry(entry: any): Promise<LedgerEntry> {
  const user = await prisma.user.findFirst();
  const userId = entry.userId || user?.id || 'demo_user';
  const created = await addDbTransaction({
    userId,
    orderId: entry.paypalOrderId,
    captureId: entry.paypalCaptureId,
    payoutBatchId: entry.paypalPayoutBatchId,
    type: entry.type || 'ORDER_CAPTURE',
    amount: entry.amount,
    currency: entry.currency || 'USD',
    recipient: entry.recipient || 'Recipient',
    category: entry.category || 'developer tools',
    description: entry.description || 'Commerce transaction',
    status: entry.status || 'COMPLETED',
    requiresApproval: entry.requiresApproval,
    autoCaptured: entry.autoCaptured,
    guardrailEvaluated: entry.guardrailEvaluated,
    rawResponse: entry.rawResponse,
  });

  return {
    id: created?.id || `tx_${Date.now()}`,
    timestamp: created?.createdAt.toISOString() || new Date().toISOString(),
    type: entry.type || 'ORDER_CAPTURE',
    amount: entry.amount,
    currency: entry.currency || 'USD',
    recipient: entry.recipient || 'Recipient',
    category: entry.category || 'developer tools',
    description: entry.description || 'Commerce transaction',
    status: entry.status || 'COMPLETED',
    paypalOrderId: entry.paypalOrderId,
    paypalCaptureId: entry.paypalCaptureId,
    paypalPayoutBatchId: entry.paypalPayoutBatchId,
    guardrailEvaluated: entry.guardrailEvaluated ?? true,
    autoCaptured: entry.autoCaptured ?? false,
    requiresApproval: entry.requiresApproval ?? false,
    rawResponse: entry.rawResponse,
  };
}
