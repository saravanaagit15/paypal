import { NextRequest, NextResponse } from 'next/server';
import { createPayPalPayout } from '@/lib/paypal';
import { verifyBudgetGuardrails, recordGuardrailSpend } from '@/lib/guardrails';
import { addLedgerEntry } from '@/lib/ledger';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { recipientEmail, amount, note = 'TrustAgent Autonomous Settlement', category = 'Open-source tipping' } = body;

    const numAmount = typeof amount === 'string' ? parseFloat(amount) : Number(amount);
    if (!recipientEmail || isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json({ error: 'Valid recipientEmail and positive amount are required' }, { status: 400 });
    }

    // Guardrail Check
    const guardrailCheck = verifyBudgetGuardrails(numAmount, category);
    if (!guardrailCheck.allowed) {
      // Record blocked attempt in ledger
      const blockedEntry = addLedgerEntry({
        type: 'PAYOUT',
        amount: numAmount,
        currency: 'USD',
        recipient: recipientEmail,
        category,
        description: note,
        status: 'BLOCKED_BY_GUARDRAIL',
        guardrailEvaluated: true,
        autoCaptured: false,
        requiresApproval: true,
        rawResponse: { reason: guardrailCheck.reason, violations: guardrailCheck.violations },
      });

      return NextResponse.json({
        error: guardrailCheck.reason,
        guardrailCheck,
        ledgerEntry: blockedEntry,
      }, { status: 403 });
    }

    // Call PayPal Payouts API
    const payoutResult = await createPayPalPayout({
      recipientEmail,
      amount: numAmount,
      note,
    });

    const batchId = payoutResult.batch_header?.payout_batch_id || `BATCH-${Date.now()}`;

    // Record spend
    recordGuardrailSpend(numAmount);

    // Record in ledger
    const ledgerEntry = addLedgerEntry({
      type: 'PAYOUT',
      amount: numAmount,
      currency: 'USD',
      recipient: recipientEmail,
      category,
      description: note,
      status: 'COMPLETED',
      paypalPayoutBatchId: batchId,
      guardrailEvaluated: true,
      autoCaptured: true,
      requiresApproval: false,
      rawResponse: payoutResult,
    });

    return NextResponse.json({
      success: true,
      payout: payoutResult,
      guardrailCheck,
      ledgerEntry,
    });
  } catch (error: any) {
    console.error('[API /api/paypal/payout] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to process PayPal payout' },
      { status: 500 }
    );
  }
}

