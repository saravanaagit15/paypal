import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const existingUser = await prisma.user.findUnique({
    where: { email: 'demo@trustagent.ai' },
  });

  if (!existingUser) {
    const passwordHash = await bcrypt.hash('DemoPassword123!', 10);
    const user = await prisma.user.create({
      data: {
        email: 'demo@trustagent.ai',
        fullName: 'Alex Vance',
        passwordHash,
        budget: {
          create: {
            monthlyLimit: 200.0,
            currentMonthlySpent: 38.5,
            singleTxLimit: 25.0,
            dailyLimit: 50.0,
            weeklyLimit: 100.0,
            emergencyFreeze: false,
            currency: 'USD',
          },
        },
        spendingPolicy: {
          create: {
            requireApprovalAbove: 25.0,
            blockUnapprovedCategories: true,
            blockNonWhitelistedMerchants: false,
            whitelistedCategoriesJson: JSON.stringify([
              'developer tools',
              'github dependencies',
              'cloud hosting',
              'api credits',
              'open-source tipping',
              'infrastructure',
              'saas subscription',
            ]),
          },
        },
        merchantWhitelist: {
          create: [
            { merchantName: 'GitHub Inc.', domain: 'github.com', category: 'developer tools', notes: 'Copilot & Organization Seats' },
            { merchantName: 'Vercel Inc.', domain: 'vercel.com', category: 'cloud hosting', notes: 'Edge compute & static hosting' },
            { merchantName: 'Tailwind Labs', domain: 'tailwindcss.com', category: 'open-source tipping', notes: 'OSS sponsorship' },
            { merchantName: 'AWS Cloud Services', domain: 'aws.amazon.com', category: 'cloud hosting', notes: 'Cloud infrastructure' },
          ],
        },
        merchantBlacklist: {
          create: [
            { merchantName: 'VIP Casino & Slots', domain: 'vipcasino.com', reason: 'High-risk gambling category' },
          ],
        },
        integrations: {
          create: [
            { provider: 'PAYPAL_SANDBOX', status: 'CONNECTED', configJson: JSON.stringify({ mode: 'sandbox', verified: true }) },
            { provider: 'OPENAI', status: 'CONNECTED', configJson: JSON.stringify({ model: 'gpt-4o-mini' }) },
            { provider: 'DATABASE', status: 'CONNECTED', configJson: JSON.stringify({ engine: 'SQLite / Prisma', connected: true }) },
          ],
        },
        transactions: {
          create: [
            {
              orderId: 'ORD-SANDBOX-71049281',
              captureId: 'CAP-SANDBOX-99120412',
              type: 'ORDER_CAPTURE',
              amount: 14.5,
              currency: 'USD',
              recipient: 'GitHub Copilot / npm Pro',
              category: 'developer tools',
              description: 'Auto-renewed developer tools monthly seat',
              status: 'COMPLETED',
              requiresApproval: false,
              autoCaptured: true,
              guardrailEvaluated: true,
              rawResponseJson: JSON.stringify({
                id: 'CAP-SANDBOX-99120412',
                status: 'COMPLETED',
                amount: { currency_code: 'USD', value: '14.50' },
                seller_receivable_breakdown: { gross_amount: { currency_code: 'USD', value: '14.50' }, paypal_fee: { currency_code: 'USD', value: '0.62' }, net_amount: { currency_code: 'USD', value: '13.88' } },
              }),
            },
            {
              payoutBatchId: 'PAYOUT-BATCH-38291402',
              type: 'PAYOUT',
              amount: 24.0,
              currency: 'USD',
              recipient: 'maintainer@zustand-oss.dev',
              category: 'open-source tipping',
              description: 'Autonomous micro-tip for critical bug fix in zustand',
              status: 'COMPLETED',
              requiresApproval: false,
              autoCaptured: true,
              guardrailEvaluated: true,
              rawResponseJson: JSON.stringify({
                batch_header: { payout_batch_id: 'PAYOUT-BATCH-38291402', batch_status: 'SUCCESS', amount: { currency: 'USD', value: '24.00' }, fees: { currency: 'USD', value: '0.25' } },
              }),
            },
          ],
        },
        auditLogs: {
          create: [
            { action: 'USER_REGISTERED', entityType: 'AUTH', detail: 'User registered account demo@trustagent.ai' },
            { action: 'BUDGET_INITIALIZED', entityType: 'BUDGET', detail: 'Initial limits set: $25 single tx, $200 monthly envelope' },
            { action: 'PAYPAL_ORDER_CAPTURED', entityType: 'PAYPAL', detail: 'Autonomous order ORD-SANDBOX-71049281 captured ($14.50)' },
            { action: 'PAYPAL_PAYOUT_SENT', entityType: 'PAYPAL', detail: 'Disbursed $24.00 payout batch PAYOUT-BATCH-38291402' },
          ],
        },
        notifications: {
          create: [
            { type: 'TX_COMPLETED', title: 'Payment Auto-Captured', message: 'Autonomous purchase of $14.50 with GitHub Copilot completed.', read: true },
            { type: 'TX_COMPLETED', title: 'Payout Succeeded', message: 'Disbursed $24.00 tip to maintainer@zustand-oss.dev via PayPal.', read: true },
          ],
        },
      },
    });

    console.log(`Seeded demo user ${user.email} (password: DemoPassword123!)`);
  } else {
    console.log('Demo user already exists.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

