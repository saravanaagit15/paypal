import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const event = JSON.parse(rawBody);

    const eventType = event.event_type;
    const resource = event.resource;

    console.log(`[PayPal Webhook Received] Type: ${eventType}, ID: ${event.id}`);

    // If order approved or captured
    if (eventType === 'CHECKOUT.ORDER.APPROVED' || eventType === 'PAYMENT.CAPTURE.COMPLETED') {
      const orderId = resource.id || resource.supplementary_data?.related_ids?.order_id;

      if (orderId) {
        const tx = await prisma.transaction.findFirst({
          where: { orderId },
        });

        if (tx && tx.status !== 'COMPLETED') {
          await prisma.transaction.update({
            where: { id: tx.id },
            data: {
              status: 'COMPLETED',
              captureId: resource.id,
            },
          });

          await prisma.auditLog.create({
            data: {
              userId: tx.userId,
              action: 'PAYPAL_WEBHOOK_PROCESSED',
              entityType: 'PAYPAL',
              entityId: tx.id,
              detail: `Reconciled webhook event ${eventType} for order ${orderId}.`,
            },
          });
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('[API /api/paypal/webhook] Error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 400 });
  }
}

