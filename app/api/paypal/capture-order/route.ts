import { NextRequest, NextResponse } from 'next/server';
import { capturePayPalOrder } from '@/lib/paypal';
import { prisma } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    const body = await req.json();
    const { orderId, transactionId } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'orderId is required' }, { status: 400 });
    }

    // Call PayPal Sandbox capture endpoint
    const captureResult = await capturePayPalOrder(orderId);

    // Find transaction by orderId or transactionId
    const existingTx = await prisma.transaction.findFirst({
      where: {
        OR: [
          { orderId },
          ...(transactionId ? [{ id: transactionId }] : []),
        ],
      },
    });

    let updatedTx = existingTx;

    if (existingTx) {
      const capturedAmount = existingTx.amount || parseFloat(captureResult.amount?.value || '0');

      // Update Transaction in DB
      updatedTx = await prisma.transaction.update({
        where: { id: existingTx.id },
        data: {
          status: 'COMPLETED',
          captureId: captureResult.id,
          rawResponseJson: JSON.stringify(captureResult.raw || captureResult),
        },
      });

      // Update any pending approval record
      await prisma.transactionApproval.updateMany({
        where: { transactionId: existingTx.id, status: 'PENDING' },
        data: {
          status: 'APPROVED',
          approvedAt: new Date(),
        },
      });

      // Increment user budget current monthly spend
      await prisma.budget.updateMany({
        where: { userId: existingTx.userId },
        data: {
          currentMonthlySpent: {
            increment: capturedAmount,
          },
        },
      });

      // Commit any active budget reservation
      await prisma.budgetReservation.updateMany({
        where: { transactionId: existingTx.id, status: 'ACTIVE' },
        data: { status: 'COMMITTED' },
      });

      // Create Audit Log
      await prisma.auditLog.create({
        data: {
          userId: existingTx.userId,
          action: 'PAYPAL_ORDER_CAPTURED',
          entityType: 'TRANSACTION',
          entityId: existingTx.id,
          detail: `Order ${orderId} successfully captured (Capture ID: ${captureResult.id}) for $${capturedAmount.toFixed(2)}.`,
        },
      });

      // Create Notification
      await prisma.notification.create({
        data: {
          userId: existingTx.userId,
          type: 'TX_COMPLETED',
          title: 'Order Capture Confirmed',
          message: `PayPal Sandbox captured $${capturedAmount.toFixed(2)} for ${existingTx.recipient}.`,
          link: '/dashboard/transactions',
        },
      });
    }

    return NextResponse.json({
      success: true,
      capture: captureResult,
      transaction: updatedTx,
    });
  } catch (error: any) {
    console.error('[API /api/paypal/capture-order] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to capture PayPal order' },
      { status: 500 }
    );
  }
}
