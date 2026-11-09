export interface GuardrailConfig {
  singleTxLimit: number;
  monthlyLimit: number;
  currentMonthlySpent: number;
  whitelistedCategories: string[];
}

export interface GuardrailCheckResult {
  allowed: boolean;
  requiresHumanApproval: boolean;
  reason?: string;
  violations?: string[];
  remainingMonthlyBudget: number;
}

export interface PayPalOrderParams {
  amount: number | string;
  currency?: string;
  description?: string;
  customId?: string;
  category?: string;
}

export interface PayPalCaptureResult {
  id: string;
  status: string;
  amount: {
    currency_code: string;
    value: string;
  };
  seller_receivable_breakdown?: {
    gross_amount: { currency_code: string; value: string };
    paypal_fee?: { currency_code: string; value: string };
    net_amount?: { currency_code: string; value: string };
  };
  create_time?: string;
  update_time?: string;
  raw?: any;
}

export interface PayPalPayoutParams {
  recipientEmail: string;
  amount: number | string;
  currency?: string;
  note?: string;
  senderItemId?: string;
}

export type LedgerTransactionType = 'ORDER_CAPTURE' | 'PAYOUT' | 'DIRECT_CHECKOUT';
export type LedgerStatus = 'COMPLETED' | 'PENDING_APPROVAL' | 'BLOCKED_BY_GUARDRAIL' | 'FAILED' | 'REJECTED';

export interface LedgerEntry {
  id: string;
  timestamp: string;
  type: LedgerTransactionType;
  amount: number;
  currency: string;
  recipient: string;
  category: string;
  description: string;
  status: LedgerStatus;
  paypalOrderId?: string;
  paypalCaptureId?: string;
  paypalPayoutBatchId?: string;
  guardrailEvaluated: boolean;
  autoCaptured: boolean;
  requiresApproval: boolean;
  rawResponse?: any;
}

export interface AgentChainOfThoughtStep {
  type: 'reasoning' | 'tool_call' | 'parameter_eval' | 'api_invocation' | 'guardrail_check' | 'human_approval';
  title: string;
  detail: string;
  timestamp: string;
  status?: 'pending' | 'success' | 'warning' | 'error';
  data?: any;
}

export interface AgentMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  steps?: AgentChainOfThoughtStep[];
  artifact?: AgentArtifact;
}

export interface AgentArtifact {
  id: string;
  type: 'paypal_authorization' | 'ledger_entry_view' | 'guardrail_alert' | 'payout_receipt';
  title: string;
  subtitle?: string;
  data: any;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXECUTED';
}

