import { prisma } from './db';

export interface GovernanceResult {
  allowed: boolean;
  requiresHumanApproval: boolean;
  reason: string;
  violations: string[];
  remainingMonthlyBudget: number;
  reservationId?: string;
  riskScore: number;
}

export interface GovernanceParams {
  userId: string;
  amount: number;
  recipient: string;
  category: string;
  domain?: string;
  description?: string;
  idempotencyKey?: string;
}

/**
 * Deterministic Financial Governance Policy Engine
 * Strictly evaluates user-configured constraints before any payment or checkout preparation
 */
export async function evaluateTransactionGovernance(
  params: GovernanceParams
): Promise<GovernanceResult> {
  const { userId, amount, recipient, category, domain, description } = params;
  const numAmount = Number(amount);
  const violations: string[] = [];
  let riskScore = 0.0;

  // 1. Fetch user budget, policy, whitelists, and blacklists
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      budget: true,
      spendingPolicy: true,
      merchantWhitelist: true,
      merchantBlacklist: true,
    },
  });

  if (!user || !user.budget) {
    return {
      allowed: false,
      requiresHumanApproval: true,
      reason: 'User account or budget profile not found.',
      violations: ['USER_BUDGET_NOT_CONFIGURED'],
      remainingMonthlyBudget: 0,
      riskScore: 1.0,
    };
  }

  const { budget, spendingPolicy, merchantWhitelist, merchantBlacklist } = user;

  // 2. Security Control: Emergency Spending Freeze
  if (budget.emergencyFreeze) {
    violations.push('Emergency spending freeze is currently ACTIVE. All transactions are halted.');
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'EMERGENCY_FREEZE_BLOCKED',
        entityType: 'POLICY',
        detail: `Blocked $${numAmount.toFixed(2)} to ${recipient} due to active emergency spending freeze.`,
      },
    });
    return {
      allowed: false,
      requiresHumanApproval: false,
      reason: 'Emergency spending freeze is active. Commerce disabled.',
      violations,
      remainingMonthlyBudget: Math.max(0, budget.monthlyLimit - budget.currentMonthlySpent),
      riskScore: 1.0,
    };
  }

  // 3. Merchant Blacklist Check
  const normRecipient = recipient.toLowerCase().trim();
  const normDomain = (domain || '').toLowerCase().trim();

  const blacklisted = merchantBlacklist.find((b) => {
    const matchName = normRecipient.includes(b.merchantName.toLowerCase()) || b.merchantName.toLowerCase().includes(normRecipient);
    const matchDomain = b.domain && normDomain && normDomain.includes(b.domain.toLowerCase());
    return matchName || matchDomain;
  });

  if (blacklisted) {
    violations.push(`Merchant "${recipient}" is explicitly blacklisted: ${blacklisted.reason || 'Restricted vendor'}`);
    riskScore += 0.8;
  }

  // 4. Category Restriction Check
  const normCategory = (category || '').toLowerCase().trim();
  let whitelistedCategories: string[] = [];
  try {
    whitelistedCategories = spendingPolicy?.whitelistedCategoriesJson
      ? JSON.parse(spendingPolicy.whitelistedCategoriesJson)
      : ['developer tools', 'github dependencies', 'cloud hosting', 'api credits', 'open-source tipping'];
  } catch {
    whitelistedCategories = ['developer tools', 'github dependencies', 'cloud hosting', 'api credits'];
  }

  const isCategoryWhitelisted = whitelistedCategories.some(
    (c) => normCategory.includes(c.toLowerCase()) || c.toLowerCase().includes(normCategory)
  );

  if (!isCategoryWhitelisted && spendingPolicy?.blockUnapprovedCategories) {
    violations.push(
      `Category "${category}" is not in approved policy categories (${whitelistedCategories.slice(0, 4).join(', ')}...)`
    );
    riskScore += 0.5;
  }

  // 5. Merchant Whitelist Requirement Check
  if (spendingPolicy?.blockNonWhitelistedMerchants) {
    const isWhitelistedMerchant = merchantWhitelist.some((m) =>
      normRecipient.includes(m.merchantName.toLowerCase()) || m.merchantName.toLowerCase().includes(normRecipient)
    );
    if (!isWhitelistedMerchant) {
      violations.push(`Merchant "${recipient}" is not on your pre-approved whitelist.`);
      riskScore += 0.4;
    }
  }

  // 6. Security Control: Duplicate Transaction Detection (within last 3 minutes)
  const threeMinutesAgo = new Date(Date.now() - 3 * 60 * 1000);
  const duplicate = await prisma.transaction.findFirst({
    where: {
      userId,
      recipient,
      amount: numAmount,
      createdAt: { gte: threeMinutesAgo },
    },
  });

  if (duplicate) {
    violations.push(`Potential duplicate transaction detected ($${numAmount.toFixed(2)} to ${recipient} was created recently).`);
    riskScore += 0.3;
  }

  // 7. Spending Limit Checks (Daily, Weekly, Monthly)
  const remainingMonthly = Number((budget.monthlyLimit - budget.currentMonthlySpent).toFixed(2));
  if (numAmount > remainingMonthly) {
    violations.push(
      `Requested amount ($${numAmount.toFixed(2)}) exceeds remaining monthly envelope ($${remainingMonthly.toFixed(2)}).`
    );
  }

  // Daily spend calculation
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const todayTransactions = await prisma.transaction.findMany({
    where: {
      userId,
      status: 'COMPLETED',
      createdAt: { gte: startOfDay },
    },
  });
  const todaySpent = todayTransactions.reduce((acc, t) => acc + t.amount, 0);
  if (todaySpent + numAmount > budget.dailyLimit) {
    violations.push(
      `Daily spending ceiling ($${budget.dailyLimit.toFixed(2)}) exceeded (spent today: $${todaySpent.toFixed(2)}).`
    );
  }

  // 8. Single Transaction Limit Check
  const singleCeiling = spendingPolicy?.requireApprovalAbove || budget.singleTxLimit;
  const exceedsSingleCeiling = numAmount > singleCeiling;

  // 9. Final Decision Synthesis
  const hasHardViolation =
    Boolean(blacklisted) ||
    (!isCategoryWhitelisted && spendingPolicy?.blockUnapprovedCategories) ||
    numAmount > remainingMonthly;

  if (hasHardViolation) {
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'GUARDRAIL_BLOCKED',
        entityType: 'POLICY',
        detail: `Blocked $${numAmount.toFixed(2)} to ${recipient}: ${violations.join('; ')}`,
      },
    });

    return {
      allowed: false,
      requiresHumanApproval: true,
      reason: `Blocked by Financial Policy: ${violations[0]}`,
      violations,
      remainingMonthlyBudget: remainingMonthly,
      riskScore: Math.min(1.0, riskScore),
    };
  }

  // If requires human approval (e.g. exceeds single tx limit or daily ceiling exceeded)
  const requiresHumanApproval = exceedsSingleCeiling || todaySpent + numAmount > budget.dailyLimit || riskScore >= 0.3;

  // 10. Atomic Budget Reservation
  const reservation = await prisma.budgetReservation.create({
    data: {
      userId,
      amount: numAmount,
      status: 'ACTIVE',
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15-minute reservation TTL
    },
  });

  return {
    allowed: true,
    requiresHumanApproval,
    reason: requiresHumanApproval
      ? `Threshold exceeded: $${numAmount.toFixed(2)} > $${singleCeiling.toFixed(2)}. Human-in-the-Loop approval required.`
      : `Compliant: Within single transaction ceiling ($${singleCeiling.toFixed(2)}) and budget limits.`,
    violations,
    remainingMonthlyBudget: remainingMonthly,
    reservationId: reservation.id,
    riskScore: Math.min(1.0, riskScore),
  };
}

/**
 * Commits a budget reservation after successful payment capture
 */
export async function commitBudgetReservation(
  reservationId: string,
  userId: string,
  transactionId: string
) {
  const reservation = await prisma.budgetReservation.findUnique({
    where: { id: reservationId },
  });

  if (!reservation || reservation.status !== 'ACTIVE') return;

  await prisma.$transaction([
    prisma.budgetReservation.update({
      where: { id: reservationId },
      data: { status: 'COMMITTED', transactionId },
    }),
    prisma.budget.update({
      where: { userId },
      data: {
        currentMonthlySpent: {
          increment: reservation.amount,
        },
      },
    }),
  ]);
}

/**
 * Releases a budget reservation if order is rejected or cancelled
 */
export async function releaseBudgetReservation(reservationId: string) {
  await prisma.budgetReservation.update({
    where: { id: reservationId },
    data: { status: 'RELEASED' },
  });
}
