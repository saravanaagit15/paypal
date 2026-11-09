import { LedgerEntry } from './types';

// In-memory ledger storage for the session
let sessionLedger: LedgerEntry[] = [
  {
    id: 'tx_seed_101',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    type: 'ORDER_CAPTURE',
    amount: 14.50,
    currency: 'USD',
    recipient: 'GitHub Copilot / npm Pro',
    category: 'Developer tools',
    description: 'Auto-renewed developer tools monthly seat',
    status: 'COMPLETED',
    paypalOrderId: 'ORD-SANDBOX-71049281',
    paypalCaptureId: 'CAP-SANDBOX-99120412',
    guardrailEvaluated: true,
    autoCaptured: true,
    requiresApproval: false,
    rawResponse: {
      id: 'CAP-SANDBOX-99120412',
      status: 'COMPLETED',
      amount: { currency_code: 'USD', value: '14.50' },
      seller_receivable_breakdown: {
        gross_amount: { currency_code: 'USD', value: '14.50' },
        paypal_fee: { currency_code: 'USD', value: '0.62' },
        net_amount: { currency_code: 'USD', value: '13.88' },
      },
    },
  },
  {
    id: 'tx_seed_102',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    type: 'PAYOUT',
    amount: 24.00,
    currency: 'USD',
    recipient: 'maintainer@zustand-oss.dev',
    category: 'Open-source tipping',
    description: 'Autonomous micro-tip for critical bug fix in zustand',
    status: 'COMPLETED',
    paypalPayoutBatchId: 'PAYOUT-BATCH-38291402',
    guardrailEvaluated: true,
    autoCaptured: true,
    requiresApproval: false,
    rawResponse: {
      batch_header: {
        payout_batch_id: 'PAYOUT-BATCH-38291402',
        batch_status: 'SUCCESS',
        amount: { currency: 'USD', value: '24.00' },
        fees: { currency: 'USD', value: '0.25' },
      },
    },
  },
];

export function getLedgerEntries(): LedgerEntry[] {
  return [...sessionLedger].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

export function addLedgerEntry(entry: Omit<LedgerEntry, 'id' | 'timestamp'> & { id?: string; timestamp?: string }): LedgerEntry {
  const newEntry: LedgerEntry = {
    id: entry.id || `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: entry.timestamp || new Date().toISOString(),
    ...entry,
  };
  sessionLedger.unshift(newEntry);
  return newEntry;
}

export function updateLedgerEntry(id: string, updates: Partial<LedgerEntry>): LedgerEntry | null {
  const index = sessionLedger.findIndex((tx) => tx.id === id || tx.paypalOrderId === id);
  if (index === -1) return null;
  sessionLedger[index] = {
    ...sessionLedger[index],
    ...updates,
  };
  return sessionLedger[index];
}

export function findLedgerEntry(id: string): LedgerEntry | undefined {
  return sessionLedger.find((tx) => tx.id === id || tx.paypalOrderId === id);
}

export function clearLedger(): void {
  sessionLedger = [];
}

