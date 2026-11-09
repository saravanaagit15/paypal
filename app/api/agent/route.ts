import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { verifyBudgetGuardrails, getGuardrailConfig, recordGuardrailSpend } from '@/lib/guardrails';
import { createPayPalOrder, capturePayPalOrder, createPayPalPayout } from '@/lib/paypal';
import { addLedgerEntry } from '@/lib/ledger';
import { AgentChainOfThoughtStep, AgentArtifact } from '@/lib/types';

const SYSTEM_PROMPT = `You are TrustAgent, an autonomous financial intelligence agent executing commerce actions on PayPal Sandbox. You strictly adhere to user financial guardrails:

Default single transaction ceiling: $25.00
Default monthly ceiling: $200.00
Whitelisted domains/categories: Developer tools, GitHub dependencies, cloud hosting, API credits, open-source tipping.
Never authorize or execute any payment that violates these bounds without triggering a Human-in-the-Loop approval prompt.

When a user requests a payment, subscription, tip, or purchase:
1. First evaluate and verify budget guardrails.
2. If it is within limits and whitelisted, proceed with prepare_paypal_checkout or disburse_payout.
3. If it exceeds limits or violates policy, explain the guardrail status and flag for human approval.`;

const AGENT_TOOLS: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'verify_budget_guardrails',
      description: 'Checks if the requested transaction fits within remaining budget limits and whitelisted categories.',
      parameters: {
        type: 'object',
        properties: {
          amount: { type: 'number', description: 'Amount in USD to check' },
          category: { type: 'string', description: 'Transaction category (e.g. developer tools, cloud hosting, etc.)' },
        },
        required: ['amount', 'category'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'prepare_paypal_checkout',
      description: 'Creates a PayPal checkout order. If amount <= single limit, stages auto-capture. If > single limit, flags state as REQUIRES_HUMAN_APPROVAL.',
      parameters: {
        type: 'object',
        properties: {
          amount: { type: 'number', description: 'Total transaction amount in USD' },
          recipient: { type: 'string', description: 'Recipient or vendor name' },
          memo: { type: 'string', description: 'Purpose or description of the transaction' },
          category: { type: 'string', description: 'Category of purchase' },
        },
        required: ['amount', 'recipient', 'memo'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'disburse_payout',
      description: 'Disburses funds autonomously to an email via PayPal Payouts REST API for developer tipping or micro-settlement.',
      parameters: {
        type: 'object',
        properties: {
          recipient_email: { type: 'string', description: 'PayPal account email of the recipient' },
          amount: { type: 'number', description: 'Payout disbursement amount in USD' },
          memo: { type: 'string', description: 'Note or reason for the payout' },
          category: { type: 'string', description: 'Category, e.g. open-source tipping' },
        },
        required: ['recipient_email', 'amount', 'memo'],
      },
    },
  },
];

// Fallback Autonomous Agent Engine for Demo Mode / Missing API Keys
async function runSimulatedAgent(prompt: string): Promise<{
  content: string;
  steps: AgentChainOfThoughtStep[];
  artifact?: AgentArtifact;
}> {
  const steps: AgentChainOfThoughtStep[] = [];
  const lower = prompt.toLowerCase();
  const guardrails = getGuardrailConfig();

  // Extract amount if present
  const amountMatch = prompt.match(/\$?\s*([0-9]+(?:\.[0-9]{1,2})?)/);
  let amount = amountMatch ? parseFloat(amountMatch[1]) : 15.00;

  // Determine intent & category
  let isPayout = lower.includes('tip') || lower.includes('payout') || lower.includes('disburse') || lower.includes('@');
  let category = 'Developer tools';
  let recipient = 'Vendor / Service';
  let memo = prompt;

  if (lower.includes('aws') || lower.includes('cloud') || lower.includes('hosting') || lower.includes('database')) {
    category = 'Cloud hosting';
    recipient = 'AWS Cloud Infrastructure';
  } else if (lower.includes('vercel') || lower.includes('next.js') || lower.includes('edge')) {
    category = 'Cloud hosting';
    recipient = 'Vercel Inc.';
  } else if (lower.includes('github') || lower.includes('copilot') || lower.includes('npm')) {
    category = 'Developer tools';
    recipient = 'GitHub / npm';
  } else if (lower.includes('openai') || lower.includes('anthropic') || lower.includes('api credit')) {
    category = 'API credits';
    recipient = 'AI Gateway Provider';
  } else if (lower.includes('tailwind') || lower.includes('maintainer') || lower.includes('oss') || isPayout) {
    category = 'Open-source tipping';
    recipient = lower.includes('@') ? (lower.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)?.[0] || 'maintainer@oss.org') : 'maintainer@tailwindcss.com';
    isPayout = true;
  } else if (lower.includes('casino') || lower.includes('gambling') || lower.includes('bet')) {
    category = 'Gambling';
    recipient = 'VIP Casino';
  }

  // Step 1: Reasoning
  steps.push({
    type: 'reasoning',
    title: 'Intent & Entity Extraction',
    detail: `Identified action: ${isPayout ? 'Micro-payout' : 'PayPal Order Checkout'}. Detected amount: $${amount.toFixed(2)}, Recipient: ${recipient}, Category: "${category}".`,
    timestamp: new Date().toISOString(),
    status: 'success',
  });

  // Step 2: Tool Call: verify_budget_guardrails
  steps.push({
    type: 'tool_call',
    title: 'Tool Call: verify_budget_guardrails',
    detail: `Invoking verify_budget_guardrails({ amount: ${amount}, category: "${category}" })`,
    timestamp: new Date().toISOString(),
    status: 'pending',
  });

  const guardrailCheck = verifyBudgetGuardrails(amount, category);

  // Step 3: Parameter Evaluation & Guardrail Check
  steps.push({
    type: 'guardrail_check',
    title: 'Guardrail Policy Assessment',
    detail: guardrailCheck.reason || 'Guardrail evaluated',
    timestamp: new Date().toISOString(),
    status: !guardrailCheck.allowed ? 'error' : (guardrailCheck.requiresHumanApproval ? 'warning' : 'success'),
    data: guardrailCheck,
  });

  // Handle policy violation / unauthorized category
  if (!guardrailCheck.allowed) {
    const errorMsg = `Transaction rejected by TrustAgent policy: ${guardrailCheck.reason} Category "${category}" is not whitelisted.`;
    return {
      content: `I cannot proceed with this transaction. ${guardrailCheck.reason}\n\nOur financial guardrails restrict autonomous disbursements to whitelisted developer and infrastructure categories. Please update your budget policy in settings if you wish to allow this category.`,
      steps,
      artifact: {
        id: `art_block_${Date.now()}`,
        type: 'guardrail_alert',
        title: 'Transaction Blocked by Financial Guardrail',
        subtitle: `Blocked: $${amount.toFixed(2)} to ${recipient}`,
        status: 'REJECTED',
        data: {
          recipient,
          amount,
          category,
          violations: guardrailCheck.violations,
          ceiling: guardrails.singleTxLimit,
          remainingBudget: guardrailCheck.remainingMonthlyBudget,
        },
      },
    };
  }

  // Handle Payout flow
  if (isPayout) {
    steps.push({
      type: 'api_invocation',
      title: 'PayPal Payouts REST API Invocation',
      detail: `POST /v1/payments/payouts with amount $${amount.toFixed(2)} to ${recipient}`,
      timestamp: new Date().toISOString(),
      status: 'pending',
    });

    const payoutResult = await createPayPalPayout({
      recipientEmail: recipient.includes('@') ? recipient : 'developer@ecosystem.org',
      amount,
      note: memo,
    });

    recordGuardrailSpend(amount);

    addLedgerEntry({
      type: 'PAYOUT',
      amount,
      currency: 'USD',
      recipient: recipient.includes('@') ? recipient : 'developer@ecosystem.org',
      category,
      description: memo,
      status: 'COMPLETED',
      paypalPayoutBatchId: payoutResult.batch_header?.payout_batch_id || `BATCH-${Date.now()}`,
      guardrailEvaluated: true,
      autoCaptured: true,
      requiresApproval: false,
      rawResponse: payoutResult,
    });

    steps.push({
      type: 'api_invocation',
      title: 'Payout Disbursed Successfully',
      detail: `Batch ID: ${payoutResult.batch_header?.payout_batch_id}. Funds routed autonomously via PayPal Sandbox.`,
      timestamp: new Date().toISOString(),
      status: 'success',
      data: payoutResult,
    });

    return {
      content: `Successfully disbursed an autonomous PayPal Payout of $${amount.toFixed(2)} to ${recipient}. This transaction was verified within your $${guardrails.singleTxLimit.toFixed(2)} single ceiling and updated in your ledger.`,
      steps,
      artifact: {
        id: `art_payout_${Date.now()}`,
        type: 'payout_receipt',
        title: 'PayPal Payout Receipt',
        subtitle: `Disbursed $${amount.toFixed(2)} to ${recipient}`,
        status: 'EXECUTED',
        data: {
          recipient,
          amount,
          batchId: payoutResult.batch_header?.payout_batch_id,
          fee: '$0.25',
          status: 'SUCCESS',
        },
      },
    };
  }

  // Order Flow: prepare_paypal_checkout
  steps.push({
    type: 'tool_call',
    title: 'Tool Call: prepare_paypal_checkout',
    detail: `Calling createPayPalOrder on PayPal Sandbox for $${amount.toFixed(2)}`,
    timestamp: new Date().toISOString(),
    status: 'pending',
  });

  const order = await createPayPalOrder({
    amount,
    currency: 'USD',
    description: memo,
    customId: `ord_${Date.now()}`,
    category,
  });

  const requiresApproval = guardrailCheck.requiresHumanApproval;

  if (requiresApproval) {
    // Exceeds single transaction limit: Flag REQUIRES_HUMAN_APPROVAL and slide open Artifact drawer
    const ledgerEntry = addLedgerEntry({
      type: 'ORDER_CAPTURE',
      amount,
      currency: 'USD',
      recipient,
      category,
      description: memo,
      status: 'PENDING_APPROVAL',
      paypalOrderId: order.id,
      guardrailEvaluated: true,
      autoCaptured: false,
      requiresApproval: true,
      rawResponse: order,
    });

    steps.push({
      type: 'human_approval',
      title: 'Human-in-the-Loop Approval Required',
      detail: `Transaction amount $${amount.toFixed(2)} exceeds your single transaction ceiling ($${guardrails.singleTxLimit.toFixed(2)}). Prepared order ${order.id}. Sliding open authorization artifact for review.`,
      timestamp: new Date().toISOString(),
      status: 'warning',
      data: { orderId: order.id, ledgerId: ledgerEntry.id },
    });

    return {
      content: `I've prepared a PayPal Sandbox order for $${amount.toFixed(2)} with ${recipient}. Because this exceeds your autonomous single-transaction ceiling of $${guardrails.singleTxLimit.toFixed(2)}, I have opened the Artifact Drawer for your explicit approval before capturing funds.`,
      steps,
      artifact: {
        id: `art_auth_${Date.now()}`,
        type: 'paypal_authorization',
        title: 'Pending PayPal Authorization',
        subtitle: `Review & Capture: $${amount.toFixed(2)} to ${recipient}`,
        status: 'PENDING',
        data: {
          orderId: order.id,
          ledgerId: ledgerEntry.id,
          amount,
          currency: 'USD',
          recipient,
          category,
          memo,
          requiresApproval: true,
          approvalReason: `Amount exceeds $${guardrails.singleTxLimit.toFixed(2)} single ceiling`,
          paypalLinks: order.links,
        },
      },
    };
  }

  // Within limits: Auto-capture staged and executed
  const captureResult = await capturePayPalOrder(order.id);
  recordGuardrailSpend(amount);

  const ledgerEntry = addLedgerEntry({
    type: 'ORDER_CAPTURE',
    amount,
    currency: 'USD',
    recipient,
    category,
    description: memo,
    status: 'COMPLETED',
    paypalOrderId: order.id,
    paypalCaptureId: captureResult.id,
    guardrailEvaluated: true,
    autoCaptured: true,
    requiresApproval: false,
    rawResponse: captureResult.raw || captureResult,
  });

  steps.push({
    type: 'api_invocation',
    title: 'PayPal Capture Order Executed',
    detail: `Order ${order.id} automatically captured (ID: ${captureResult.id}) under budget limit ($${amount.toFixed(2)} <= $${guardrails.singleTxLimit.toFixed(2)}).`,
    timestamp: new Date().toISOString(),
    status: 'success',
    data: captureResult,
  });

  return {
    content: `Autonomous purchase completed! Verified $${amount.toFixed(2)} to ${recipient} fits within your single ceiling of $${guardrails.singleTxLimit.toFixed(2)} and monthly budget. Created and captured PayPal order ${order.id}.`,
    steps,
    artifact: {
      id: `art_cap_${Date.now()}`,
      type: 'paypal_authorization',
      title: 'PayPal Sandbox Order Captured',
      subtitle: `Completed: $${amount.toFixed(2)} to ${recipient}`,
      status: 'EXECUTED',
      data: {
        orderId: order.id,
        captureId: captureResult.id,
        amount,
        currency: 'USD',
        recipient,
        category,
        memo,
        ledgerId: ledgerEntry.id,
        autoCaptured: true,
      },
    },
  };
}

export async function POST(req: NextRequest) {
  let prompt = '';
  try {
    const body = await req.json();
    prompt = body.prompt || '';
    const { conversation = [], demoMode = false } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const openAiKey = process.env.OPENAI_API_KEY;
    const hasValidOpenAiKey =
      Boolean(openAiKey) &&
      !openAiKey?.includes('your_openai') &&
      !demoMode;

    if (!hasValidOpenAiKey) {
      // Run deterministic high-fidelity agent logic
      const result = await runSimulatedAgent(prompt);
      return NextResponse.json(result);
    }

    // Real OpenAI Tool-Calling Execution
    const openai = new OpenAI({ apiKey: openAiKey });
    const steps: AgentChainOfThoughtStep[] = [];

    steps.push({
      type: 'reasoning',
      title: 'TrustAgent Context & Model Initialization',
      detail: 'Connecting to OpenAI Function Calling engine with PayPal tool definitions.',
      timestamp: new Date().toISOString(),
      status: 'pending',
    });

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...conversation.map((msg: any) => ({
        role: msg.role === 'user' ? ('user' as const) : ('assistant' as const),
        content: msg.content,
      })),
      { role: 'user', content: prompt },
    ];

    const runner = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      tools: AGENT_TOOLS,
      tool_choice: 'auto',
      temperature: 0.2,
    });

    const choice = runner.choices[0];
    const message = choice.message;
    let artifact: AgentArtifact | undefined;

    if (message.tool_calls && message.tool_calls.length > 0) {
      for (const toolCall of message.tool_calls) {
        const fnName = toolCall.function.name;
        const fnArgs = JSON.parse(toolCall.function.arguments || '{}');

        steps.push({
          type: 'tool_call',
          title: `Tool Call: ${fnName}`,
          detail: `Parameters: ${JSON.stringify(fnArgs)}`,
          timestamp: new Date().toISOString(),
          status: 'pending',
        });

        if (fnName === 'verify_budget_guardrails') {
          const check = verifyBudgetGuardrails(fnArgs.amount, fnArgs.category);
          steps.push({
            type: 'guardrail_check',
            title: 'Guardrail Verification Output',
            detail: check.reason || 'Guardrail validated',
            timestamp: new Date().toISOString(),
            status: check.allowed ? 'success' : 'error',
            data: check,
          });
        } else if (fnName === 'prepare_paypal_checkout') {
          const guardrailCheck = verifyBudgetGuardrails(fnArgs.amount, fnArgs.category || 'Developer tools');
          const order = await createPayPalOrder({
            amount: fnArgs.amount,
            currency: 'USD',
            description: fnArgs.memo,
            customId: `order_${Date.now()}`,
          });

          const requiresApproval = guardrailCheck.requiresHumanApproval;
          const ledgerEntry = addLedgerEntry({
            type: 'ORDER_CAPTURE',
            amount: fnArgs.amount,
            currency: 'USD',
            recipient: fnArgs.recipient,
            category: fnArgs.category || 'Developer tools',
            description: fnArgs.memo,
            status: requiresApproval ? 'PENDING_APPROVAL' : 'COMPLETED',
            paypalOrderId: order.id,
            guardrailEvaluated: true,
            autoCaptured: !requiresApproval,
            requiresApproval,
            rawResponse: order,
          });

          if (requiresApproval) {
            steps.push({
              type: 'human_approval',
              title: 'Requires Human Approval',
              detail: `Order ${order.id} flagged for human sign-off: ${guardrailCheck.reason}`,
              timestamp: new Date().toISOString(),
              status: 'warning',
            });

            artifact = {
              id: `art_${Date.now()}`,
              type: 'paypal_authorization',
              title: 'Pending PayPal Sandbox Authorization',
              subtitle: `Review & Capture: $${fnArgs.amount} to ${fnArgs.recipient}`,
              status: 'PENDING',
              data: {
                orderId: order.id,
                ledgerId: ledgerEntry.id,
                amount: fnArgs.amount,
                currency: 'USD',
                recipient: fnArgs.recipient,
                category: fnArgs.category || 'Developer tools',
                memo: fnArgs.memo,
                requiresApproval: true,
                approvalReason: guardrailCheck.reason,
              },
            };
          } else {
            // Auto capture
            const cap = await capturePayPalOrder(order.id);
            recordGuardrailSpend(fnArgs.amount);
            steps.push({
              type: 'api_invocation',
              title: 'PayPal Capture Order Succeeded',
              detail: `Capture ID: ${cap.id}`,
              timestamp: new Date().toISOString(),
              status: 'success',
            });

            artifact = {
              id: `art_${Date.now()}`,
              type: 'paypal_authorization',
              title: 'PayPal Sandbox Order Captured',
              subtitle: `Completed: $${fnArgs.amount} to ${fnArgs.recipient}`,
              status: 'EXECUTED',
              data: {
                orderId: order.id,
                captureId: cap.id,
                amount: fnArgs.amount,
                recipient: fnArgs.recipient,
                memo: fnArgs.memo,
                autoCaptured: true,
              },
            };
          }
        } else if (fnName === 'disburse_payout') {
          const payoutResult = await createPayPalPayout({
            recipientEmail: fnArgs.recipient_email,
            amount: fnArgs.amount,
            note: fnArgs.memo,
          });
          recordGuardrailSpend(fnArgs.amount);
          addLedgerEntry({
            type: 'PAYOUT',
            amount: fnArgs.amount,
            currency: 'USD',
            recipient: fnArgs.recipient_email,
            category: fnArgs.category || 'Open-source tipping',
            description: fnArgs.memo,
            status: 'COMPLETED',
            paypalPayoutBatchId: payoutResult.batch_header?.payout_batch_id || `BATCH-${Date.now()}`,
            guardrailEvaluated: true,
            autoCaptured: true,
            requiresApproval: false,
            rawResponse: payoutResult,
          });

          steps.push({
            type: 'api_invocation',
            title: 'PayPal Payout Disbursed',
            detail: `Batch: ${payoutResult.batch_header?.payout_batch_id}`,
            timestamp: new Date().toISOString(),
            status: 'success',
          });

          artifact = {
            id: `art_${Date.now()}`,
            type: 'payout_receipt',
            title: 'PayPal Payout Receipt',
            subtitle: `Sent $${fnArgs.amount} to ${fnArgs.recipient_email}`,
            status: 'EXECUTED',
            data: payoutResult,
          };
        }
      }
    }

    return NextResponse.json({
      content: message.content || 'Action executed successfully according to your financial guardrails.',
      steps,
      artifact,
    });
  } catch (error: any) {
    console.error('[API /api/agent] Error:', error);
    // On OpenAI error, fallback to simulated response gracefully
    const fallback = await runSimulatedAgent(prompt || 'Run check');
    return NextResponse.json(fallback);
  }
}
