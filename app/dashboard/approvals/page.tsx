'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  ShieldAlert,
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  AlertTriangle,
} from 'lucide-react';

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchApprovals = async () => {
    try {
      const res = await fetch('/api/approvals');
      const data = await res.json();
      setApprovals(data.approvals || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const handleAction = async (approvalId: string, action: 'APPROVE' | 'REJECT') => {
    setProcessingId(approvalId);
    try {
      const res = await fetch(`/api/approvals/${approvalId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (res.ok) {
        await fetchApprovals();
      } else {
        alert(data.error || 'Failed to process approval.');
      }
    } catch (err: any) {
      alert(err.message || 'Error processing action.');
    } finally {
      setProcessingId(null);
    }
  };

  const pendingApprovals = approvals.filter((a) => a.status === 'PENDING');
  const pastApprovals = approvals.filter((a) => a.status !== 'PENDING');

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="pb-3 border-b border-[#E5E3DA]">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-[#1F1E1D]">Human-in-the-Loop Approval Center</h2>
          {pendingApprovals.length > 0 && (
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 animate-pulse">
              {pendingApprovals.length} Action Required
            </span>
          )}
        </div>
        <p className="text-xs text-[#787670] mt-0.5">
          Review and authorize pending autonomous transactions that exceeded your financial ceilings.
        </p>
      </div>

      {/* Pending Items Section */}
      <div className="space-y-4">
        <h3 className="text-xs font-mono uppercase text-[#787670] font-semibold tracking-wider">
          Pending Authorizations ({pendingApprovals.length})
        </h3>

        {pendingApprovals.length === 0 ? (
          <div className="p-8 rounded-2xl border border-[#E5E3DA] bg-white text-center text-xs text-[#787670] shadow-2xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
            <p className="font-medium text-[#1F1E1D]">No pending transactions awaiting approval.</p>
            <p className="mt-0.5">All autonomous orders are within configured financial policies.</p>
          </div>
        ) : (
          pendingApprovals.map((item) => {
            const tx = item.transaction;
            const isProcessing = processingId === item.id;

            return (
              <div
                key={item.id}
                className="p-5 rounded-2xl border border-amber-200 bg-amber-50/40 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-amber-200/60 gap-2">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-700" />
                    <span className="font-semibold text-xs text-amber-900">
                      Step-Up Review Required
                    </span>
                    <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded-md border border-amber-200">
                      Order: {tx.orderId || tx.id}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-[#787670]">
                    Created: {new Date(item.createdAt).toLocaleString()}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-[#787670] block">Merchant / Recipient</span>
                    <span className="font-semibold text-sm text-[#1F1E1D]">{tx.recipient}</span>
                  </div>
                  <div>
                    <span className="text-[#787670] block">Total Amount</span>
                    <span className="font-mono text-lg font-bold text-[#CC5500]">
                      ${tx.amount.toFixed(2)} USD
                    </span>
                  </div>
                  <div>
                    <span className="text-[#787670] block">Reason / Policy Check</span>
                    <span className="text-[#55534E] text-[11px]">
                      {item.reason || 'Amount exceeds single transaction ceiling ($25.00)'}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    onClick={() => handleAction(item.id, 'REJECT')}
                    disabled={isProcessing}
                    className="px-4 py-2 rounded-xl border border-neutral-300 hover:bg-white text-xs font-medium text-neutral-700 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Reject &amp; Cancel
                  </button>
                  <button
                    onClick={() => handleAction(item.id, 'APPROVE')}
                    disabled={isProcessing}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#003087] to-[#0070BA] hover:from-[#00256B] hover:to-[#005EA6] text-white font-medium text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>
                      {isProcessing ? 'Capturing on PayPal...' : 'Approve via PayPal Sandbox'}
                    </span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Past Decision History */}
      {pastApprovals.length > 0 && (
        <div className="space-y-3 pt-6 border-t border-[#E5E3DA]">
          <h3 className="text-xs font-mono uppercase text-[#787670] font-semibold tracking-wider">
            Past Authorization History
          </h3>

          <div className="space-y-2">
            {pastApprovals.map((item) => {
              const tx = item.transaction;
              return (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl border border-[#E5E3DA] bg-white text-xs flex items-center justify-between shadow-2xs"
                >
                  <div>
                    <span className="font-semibold text-[#1F1E1D]">{tx.recipient}</span>
                    <span className="text-[11px] text-[#787670] block">
                      ${tx.amount.toFixed(2)} USD • {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <span
                    className={`font-mono text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      item.status === 'APPROVED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

