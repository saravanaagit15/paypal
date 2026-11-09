import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { capturePayPalOrder } from '@/lib/paypal';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSessionUser(req);
    const body = await req.json();
    const { action } = body; // "APPROVE" | "REJECT"
    const approvalId = params.id;

    const approval = await prisma.transactionApproval.findUnique({
      where: { id: approvalId },
      include: { transaction: true },
    });

    if (!approval || !approval.transaction) {
      return NextResponse.json({ error: 'Approval record not found' }, { status: 404 });
    }

    if (approval.status !== 'PENDING') {
      return NextResponse.json(
        { error: `This approval has already been ${approval.status.toLowerCase()}.` },
        { status: 400 }
      );
    }

    const tx = approval.transaction;

    if (action === 'REJECT') {
      // Mark as rejected
      await prisma.$transaction([
        prisma.transactionApproval.update({
          where: { id: approvalId },
          data: { status: 'REJECTED', rejectedAt: new Date() },
        }),
        prisma.transaction.update({
          where: { id: tx.id },
          data: { status: 'REJECTED' },
        }),
        prisma.budgetReservation.updateMany({
          where: { transactionId: tx.id, status: 'ACTIVE' },
          data: { status: 'RELEASED' },
        }),
        prisma.auditLog.create({
          data: {
            userId: tx.userId,
            action: 'TRANSACTION_REJECTED',
            entityType: 'TRANSACTION',
            entityId: tx.id,
            detail: `User manually rejected transaction of $${tx.amount.toFixed(2)} to ${tx.recipient}.`,
          },
        }),
      ]);

      return NextResponse.json({ success: true, status: 'REJECTED' });
    }

    // Action === "APPROVE": Execute PayPal Sandbox Capture
    const orderId = tx.orderId;
    if (!orderId) {
      return NextResponse.json({ error: 'No PayPal order ID associated with this transaction.' }, { status: 400 });
    }

    const captureResult = await capturePayPalOrder(orderId);

    await prisma.$transaction([
      prisma.transactionApproval.update({
        where: { id: approvalId },
        data: { status: 'APPROVED', approvedAt: new Date() },
      }),
      prisma.transaction.update({
        where: { id: tx.id },
        data: {
          status: 'COMPLETED',
          captureId: captureResult.id,
          rawResponseJson: JSON.stringify(captureResult.raw || captureResult),
        },
      }),
      prisma.budget.update({
        where: { userId: tx.userId },
        data: {
          currentMonthlySpent: { increment: tx.amount },
        },
      }),
      prisma.budgetReservation.updateMany({
        where: { transactionId: tx.id, status: 'ACTIVE' },
        data: { status: 'COMMITTED' },
      }),
      prisma.auditLog.create({
        data: {
          userId: tx.userId,
          action: 'APPROVAL_GRANTED',
          entityType: 'TRANSACTION',
          entityId: tx.id,
          detail: `User granted approval for order ${orderId} ($${tx.amount.toFixed(2)}). PayPal capture ID: ${captureResult.id}.`,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      status: 'APPROVED',
      capture: captureResult,
    });
  } catch (error: any) {
    console.error('[API /api/approvals/[id]] Error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to process approval' }, { status: 500 });
  }
}

