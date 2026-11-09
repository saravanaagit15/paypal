import { NextRequest, NextResponse } from 'next/server';
import { createPayPalOrder } from '@/lib/paypal';
import { verifyBudgetGuardrails } from '@/lib/guardrails';
import { addLedgerEntry } from '@/lib/ledger';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, currency = 'USD', description = 'TrustAgent Purchase', recipient = 'Merchant', category = 'Developer tools' } = body;

    const numAmount = typeof amount === 'string' ? parseFloat(amount) : Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json({ error: 'Valid positive amount is required' }, { status: 400 });
    }

    // Evaluate Guardrails
    const guardrailCheck = verifyBudgetGuardrails(numAmount, category);

    // Call PayPal Sandbox API
    const order = await createPayPalOrder({
      amount: numAmount,
      currency,
      description,
      customId: `order_${Date.now()}`,
      category,
    });

    const isPendingApproval = guardrailCheck.requiresHumanApproval;

    // Record in ledger
    const ledgerEntry = addLedgerEntry({
      type: 'ORDER_CAPTURE',
      amount: numAmount,
      currency,
      recipient,
      category,
      description,
      status: isPendingApproval ? 'PENDING_APPROVAL' : 'COMPLETED',
      paypalOrderId: order.id,
      guardrailEvaluated: true,
      autoCaptured: !isPendingApproval,
      requiresApproval: isPendingApproval,
      rawResponse: order,
    });

    return NextResponse.json({
      order,
      guardrailCheck,
      ledgerEntry,
    });
  } catch (error: any) {
    console.error('[API /api/paypal/create-order] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create PayPal order' },
      { status: 500 }
    );
  }
}

