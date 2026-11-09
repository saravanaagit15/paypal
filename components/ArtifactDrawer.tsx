'use client';

import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  ShieldAlert,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Send,
  ExternalLink,
  ChevronRight,
  Code,
} from 'lucide-react';
import { AgentArtifact } from '@/lib/types';

interface ArtifactDrawerProps {
  isOpen: boolean;
  artifact: AgentArtifact | null;
  onClose: () => void;
  onApprove: (orderId: string, ledgerId?: string) => void;
  isLoading?: boolean;
}

export function ArtifactDrawer({
  isOpen,
  artifact,
  onClose,
  onApprove,
  isLoading,
}: ArtifactDrawerProps) {
  const [copied, setCopied] = useState(false);
  const [showRawJson, setShowRawJson] = useState(false);

  if (!isOpen || !artifact) return null;

  const data = artifact.data || {};
  const isPending = artifact.status === 'PENDING';
  const isExecuted = artifact.status === 'EXECUTED';
  const isRejected = artifact.status === 'REJECTED';

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-white border-l border-[#E5E3DA] shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#E5E3DA] bg-[#FBFBF9] flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[#1F1E1D] text-white font-semibold">
              Artifact
            </span>
            <span
              className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full ${
                isExecuted
                  ? 'bg-emerald-100 text-emerald-800'
                  : isPending
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {artifact.status}
            </span>
          </div>
          <h3 className="text-sm font-semibold text-[#1F1E1D] mt-1 line-clamp-1">
            {artifact.title}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-[#787670] hover:text-[#1F1E1D] hover:bg-[#F5F4EF] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 text-sm text-[#1F1E1D]">
        {/* Pending PayPal Authorization Card */}
        {artifact.type === 'paypal_authorization' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-[#E5E3DA] bg-[#FBFBF9] space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E3DA]">
                <span className="text-xs text-[#787670]">Vendor / Recipient</span>
                <span className="font-semibold text-sm">{data.recipient || 'Merchant'}</span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E3DA]">
                <span className="text-xs text-[#787670]">Total Amount</span>
                <span className="font-mono text-xl font-bold text-[#CC5500]">
                  ${typeof data.amount === 'number' ? data.amount.toFixed(2) : data.amount} USD
                </span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E3DA]">
                <span className="text-xs text-[#787670]">Category</span>
                <span className="text-xs font-mono bg-white px-2 py-0.5 rounded-md border border-[#E5E3DA]">
                  {data.category || 'Developer tools'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#787670]">Purpose</span>
                <span className="text-xs text-right max-w-[240px] truncate">
                  {data.memo || 'Autonomous software purchase'}
                </span>
              </div>
            </div>

            {/* Guardrail Policy Review Notice */}
            {data.requiresApproval && isPending && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 font-semibold text-amber-800">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Human-in-the-Loop Approval Required</span>
                </div>
                <p className="leading-relaxed">
                  {data.approvalReason ||
                    'This transaction exceeds your autonomous single-transaction ceiling ($25.00). Autonomous execution is held pending your manual sign-off.'}
                </p>
              </div>
            )}

            {/* Approved / Captured Notice */}
            {isExecuted && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-emerald-800">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Order Captured on PayPal Sandbox</span>
                </div>
                <p className="leading-relaxed">
                  Capture ID: <span className="font-mono font-bold">{data.captureId || 'CAP-SANDBOX-SUCCESS'}</span>.
                  Funds have settled and transaction is logged in the permanent ledger.
                </p>
              </div>
            )}

            {/* Action Buttons */}
            {isPending && (
              <div className="pt-2 space-y-2">
                <button
                  onClick={() => onApprove(data.orderId, data.ledgerId)}
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#003087] to-[#0070BA] hover:from-[#00256B] hover:to-[#005EA6] text-white font-medium text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>
                    {isLoading ? 'Authorizing on PayPal...' : 'Approve via PayPal Sandbox'}
                  </span>
                </button>
                <p className="text-[11px] text-center text-[#787670]">
                  Executes POST /v2/checkout/orders/{data.orderId}/capture on PayPal Sandbox
                </p>
              </div>
            )}
          </div>
        )}

        {/* PayPal Payout Receipt */}
        {artifact.type === 'payout_receipt' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-3">
              <div className="flex items-center gap-2 text-emerald-800 font-semibold text-xs pb-2 border-b border-emerald-200/60">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Autonomous PayPal Payout Succeeded</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#787670]">Recipient Email</span>
                <span className="font-mono font-medium">{data.recipient || data.recipient_email}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#787670]">Amount</span>
                <span className="font-mono text-base font-bold text-emerald-700">
                  ${typeof data.amount === 'number' ? data.amount.toFixed(2) : data.amount} USD
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#787670]">Batch ID</span>
                <span className="font-mono text-[11px]">{data.batchId || 'PAYOUT-BATCH-OK'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Guardrail Policy Alert */}
        {artifact.type === 'guardrail_alert' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50 space-y-3">
              <div className="flex items-center gap-2 text-rose-800 font-semibold text-xs pb-2 border-b border-rose-200">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Transaction Blocked by Guardrail Policy</span>
              </div>
              <div className="space-y-2 text-xs text-rose-900">
                {data.violations?.map((v: string, i: number) => (
                  <div key={i} className="flex items-start gap-1.5">
                    <span className="text-rose-600 font-bold">•</span>
                    <span>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Raw Payload Inspector */}
        <div className="pt-2 border-t border-[#E5E3DA]">
          <button
            onClick={() => setShowRawJson(!showRawJson)}
            className="w-full flex items-center justify-between text-xs text-[#787670] hover:text-[#1F1E1D] font-mono py-1"
          >
            <span className="flex items-center gap-1.5">
              <Code className="w-3.5 h-3.5" />
              <span>{showRawJson ? 'Hide Raw PayPal Payload' : 'Inspect Raw PayPal Payload'}</span>
            </span>
            <ChevronRight
              className={`w-3.5 h-3.5 transition-transform ${showRawJson ? 'rotate-90' : ''}`}
            />
          </button>

          {showRawJson && (
            <div className="mt-2 relative">
              <button
                onClick={() => copyToClipboard(JSON.stringify(data, null, 2))}
                className="absolute top-2 right-2 p-1.5 rounded-md bg-[#1F1E1D] text-white hover:bg-neutral-800 text-[10px] flex items-center gap-1 font-mono transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <pre className="p-3 bg-[#1F1E1D] text-emerald-400 rounded-xl text-[11px] font-mono overflow-x-auto max-h-60 leading-tight">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

