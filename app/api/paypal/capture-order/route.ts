import { NextRequest, NextResponse } from 'next/server';
import { capturePayPalOrder } from '@/lib/paypal';
import { updateLedgerEntry, findLedgerEntry } from '@/lib/ledger';
import { recordGuardrailSpend } from '@/lib/guardrails';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, ledgerId } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'orderId is required' }, { status: 400 });
    }

    // Call PayPal capture endpoint
    const captureResult = await capturePayPalOrder(orderId);

    // Update Ledger Entry
    const targetId = ledgerId || orderId;
    const existingEntry = findLedgerEntry(targetId);

    const updatedEntry = updateLedgerEntry(targetId, {
      status: 'COMPLETED',
      paypalCaptureId: captureResult.id,
      rawResponse: captureResult.raw || captureResult,
    });

    // Record spend in guardrail budget
    const capturedAmount = existingEntry?.amount || parseFloat(captureResult.amount?.value || '0');
    if (capturedAmount > 0) {
      recordGuardrailSpend(capturedAmount);
    }

    return NextResponse.json({
      success: true,
      capture: captureResult,
      ledgerEntry: updatedEntry || existingEntry,
    });
  } catch (error: any) {
    console.error('[API /api/paypal/capture-order] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to capture PayPal order' },
      { status: 500 }
    );
  }
}

