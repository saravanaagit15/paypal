import { hashPassword, verifyPassword, signToken, verifyToken } from '../lib/auth';
import { evaluateTransactionGovernance } from '../lib/governance';
import { createPayPalOrder, capturePayPalOrder, createPayPalPayout } from '../lib/paypal';
import { prisma } from '../lib/db';

async function runTestSuite() {
  console.log('========================================================');
  console.log('🧪 RUNNING TRUSTAGENT END-TO-END TEST SUITE');
  console.log('========================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✓ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ [FAIL] ${testName}`);
      failed++;
    }
  }

  // Ensure demo user exists in test DB
  let demoUser = await prisma.user.findUnique({
    where: { email: 'demo@trustagent.ai' },
    include: { budget: true },
  });

  if (!demoUser) {
    const passwordHash = await hashPassword('DemoPassword123!');
    demoUser = await prisma.user.create({
      data: {
        email: 'demo@trustagent.ai',
        fullName: 'Alex Vance (Test)',
        passwordHash,
        budget: {
          create: {
            monthlyLimit: 200.0,
            currentMonthlySpent: 20.0,
            singleTxLimit: 25.0,
            dailyLimit: 50.0,
            weeklyLimit: 100.0,
            emergencyFreeze: false,
          },
        },
      },
      include: { budget: true },
    });
  }

  const userId = demoUser.id;

  // 1. AUTHENTICATION TESTS
  console.log('--- 1. AUTHENTICATION & SECURITY TESTS ---');
  const password = 'TestSecretPassword_2026!';
  const hash = await hashPassword(password);
  assert(await verifyPassword(password, hash), 'Password hashing & verification match');
  assert(!(await verifyPassword('WrongPassword', hash)), 'Invalid password rejected');

  const token = await signToken({ userId: demoUser.id, email: demoUser.email, fullName: demoUser.fullName });
  assert(Boolean(token), 'JWT Token generated successfully');
  const decoded = await verifyToken(token);
  assert(decoded?.email === demoUser.email, 'JWT Token verified with proper user claims');

  // 2. FINANCIAL GOVERNANCE TESTS
  console.log('\n--- 2. FINANCIAL GOVERNANCE ENGINE TESTS ---');

  // Ensure demo user daily limit is sufficient for test
  await prisma.budget.update({
    where: { userId },
    data: { dailyLimit: 150.0, emergencyFreeze: false },
  });

  // A. Under ceiling ($15 <= $25)
  const underCeiling = await evaluateTransactionGovernance({
    userId,
    amount: 15.0,
    recipient: 'Vercel Inc.',
    category: 'cloud hosting',
  });
  assert(underCeiling.allowed && !underCeiling.requiresHumanApproval, 'Transaction under $25 ceiling auto-approved');

  // B. Above ceiling ($75 > $25)
  const aboveCeiling = await evaluateTransactionGovernance({
    userId,
    amount: 75.0,
    recipient: 'AWS Cloud Services',
    category: 'cloud hosting',
  });
  assert(aboveCeiling.allowed && aboveCeiling.requiresHumanApproval, 'Transaction above $25 ceiling triggers Human Approval');

  // C. Unauthorized Category (Gambling)
  const unauthorizedCategory = await evaluateTransactionGovernance({
    userId,
    amount: 20.0,
    recipient: 'VIP Casino',
    category: 'gambling',
  });
  assert(!unauthorizedCategory.allowed, 'Unauthorized category rejected by policy engine');

  // D. Monthly envelope exceeded
  const excessiveAmount = await evaluateTransactionGovernance({
    userId,
    amount: 999.0,
    recipient: 'GitHub Copilot',
    category: 'developer tools',
  });
  assert(!excessiveAmount.allowed, 'Transaction exceeding monthly budget rejected');

  // E. Emergency freeze enforcement
  await prisma.budget.update({
    where: { userId },
    data: { emergencyFreeze: true },
  });
  const frozenAttempt = await evaluateTransactionGovernance({
    userId,
    amount: 10.0,
    recipient: 'Vercel Inc.',
    category: 'cloud hosting',
  });
  assert(!frozenAttempt.allowed, 'Active emergency freeze blocks all transactions immediately');

  // Reset freeze
  await prisma.budget.update({
    where: { userId },
    data: { emergencyFreeze: false },
  });

  // 3. PAYPAL REST INTEGRATION TESTS
  console.log('\n--- 3. PAYPAL SANDBOX INTEGRATION TESTS ---');

  // A. Create Order
  const order = await createPayPalOrder({
    amount: 19.99,
    description: 'Autonomous Developer Subscription',
    recipient: 'Vercel Inc.',
  });
  assert(Boolean(order?.id), `PayPal Order Created with ID: ${order.id}`);
  assert(order.status === 'CREATED', 'Order status is CREATED');

  // B. Capture Order
  const capture = await capturePayPalOrder(order.id);
  assert(Boolean(capture?.id), `PayPal Order Captured with ID: ${capture.id}`);
  assert(capture.status === 'COMPLETED', 'Capture status confirmed COMPLETED');

  // C. PayPal Payouts
  const payout = await createPayPalPayout({
    recipientEmail: 'maintainer@tailwindcss.com',
    amount: 5.0,
    note: 'Open source sponsorship tip',
  });
  assert(Boolean(payout?.batch_header?.payout_batch_id), `PayPal Payout Disbursed with Batch ID: ${payout.batch_header?.payout_batch_id}`);

  console.log('\n========================================================');
  console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('========================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite()
  .catch((e) => {
    console.error('Fatal test error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
