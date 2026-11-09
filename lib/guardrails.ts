import { GuardrailConfig, GuardrailCheckResult } from './types';
import { prisma } from './db';

// Fallback in-memory state for unauthenticated demo mode
let currentGuardrails: GuardrailConfig = {
  singleTxLimit: 25.00,
  monthlyLimit: 200.00,
  currentMonthlySpent: 38.50,
  whitelistedCategories: [
    'developer tools',
    'github dependencies',
    'cloud hosting',
    'api credits',
    'open-source tipping',
    'infrastructure',
    'saas subscription',
  ],
};

export async function getUserGuardrails(userId?: string): Promise<GuardrailConfig> {
  if (!userId) return { ...currentGuardrails };

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { budget: true, spendingPolicy: true },
    });

    if (user?.budget) {
      let whitelistedCategories: string[] = currentGuardrails.whitelistedCategories;
      try {
        if (user.spendingPolicy?.whitelistedCategoriesJson) {
          whitelistedCategories = JSON.parse(user.spendingPolicy.whitelistedCategoriesJson);
        }
      } catch {}

      return {
        singleTxLimit: user.spendingPolicy?.requireApprovalAbove || user.budget.singleTxLimit,
        monthlyLimit: user.budget.monthlyLimit,
        currentMonthlySpent: user.budget.currentMonthlySpent,
        whitelistedCategories,
      };
    }
  } catch (err) {
    console.error('Error fetching user guardrails from DB:', err);
  }

  return { ...currentGuardrails };
}

export function getGuardrailConfig(): GuardrailConfig {
  return { ...currentGuardrails };
}

export function updateGuardrailConfig(updates: Partial<GuardrailConfig>): GuardrailConfig {
  currentGuardrails = {
    ...currentGuardrails,
    ...updates,
    whitelistedCategories: updates.whitelistedCategories
      ? updates.whitelistedCategories.map((c) => c.toLowerCase())
      : currentGuardrails.whitelistedCategories,
  };
  return { ...currentGuardrails };
}

export function recordGuardrailSpend(amount: number): void {
  currentGuardrails.currentMonthlySpent = Number(
    (currentGuardrails.currentMonthlySpent + amount).toFixed(2)
  );
}

export function verifyBudgetGuardrails(amount: number, category: string): GuardrailCheckResult {
  const normCategory = (category || '').toLowerCase().trim();
  const remainingMonthly = Number(
    (currentGuardrails.monthlyLimit - currentGuardrails.currentMonthlySpent).toFixed(2)
  );
  const violations: string[] = [];

  const isWhitelisted = currentGuardrails.whitelistedCategories.some((whitelisted) =>
    normCategory.includes(whitelisted) || whitelisted.includes(normCategory)
  );

  if (!isWhitelisted && normCategory.length > 0) {
    violations.push(
      `Category "${category}" is not in whitelisted categories (${currentGuardrails.whitelistedCategories.join(', ')})`
    );
  }

  if (amount > remainingMonthly) {
    violations.push(
      `Requested amount ($${amount.toFixed(2)}) exceeds remaining monthly ceiling ($${remainingMonthly.toFixed(2)})`
    );
  }

  const exceedsSingleLimit = amount > currentGuardrails.singleTxLimit;
  if (exceedsSingleLimit) {
    violations.push(
      `Amount $${amount.toFixed(2)} exceeds single transaction ceiling ($${currentGuardrails.singleTxLimit.toFixed(2)}) - Requires Human Approval`
    );
  }

  if (!isWhitelisted && normCategory.length > 0) {
    return {
      allowed: false,
      requiresHumanApproval: true,
      reason: `Blocked: Category "${category}" is unauthorized under financial policy.`,
      violations,
      remainingMonthlyBudget: remainingMonthly,
    };
  }

  if (amount > remainingMonthly) {
    return {
      allowed: false,
      requiresHumanApproval: true,
      reason: `Blocked: Exceeds monthly budget envelope.`,
      violations,
      remainingMonthlyBudget: remainingMonthly,
    };
  }

  if (exceedsSingleLimit) {
    return {
      allowed: true,
      requiresHumanApproval: true,
      reason: `Threshold exceeded: $${amount.toFixed(2)} > $${currentGuardrails.singleTxLimit.toFixed(2)}. Human-in-the-Loop authorization required.`,
      violations,
      remainingMonthlyBudget: remainingMonthly,
    };
  }

  return {
    allowed: true,
    requiresHumanApproval: false,
    reason: `Compliant: Within single transaction ceiling ($${currentGuardrails.singleTxLimit}) and monthly budget.`,
    remainingMonthlyBudget: remainingMonthly,
  };
}
