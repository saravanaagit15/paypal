'use client';

import React, { useState } from 'react';
import {
  FileText,
  Search,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  CreditCard,
  Send,
  Code,
} from 'lucide-react';
import { LedgerEntry } from '@/lib/types';

interface LedgerTableProps {
  entries: LedgerEntry[];
  onSelectEntry: (entry: LedgerEntry) => void;
  onApprovePending?: (orderId: string, ledgerId?: string) => void;
}

export function LedgerTable({
  entries,
  onSelectEntry,
  onApprovePending,
}: LedgerTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filtered = entries.filter((item) => {
    const matchesSearch =
      item.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.paypalOrderId && item.paypalOrderId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-white rounded-2xl border border-[#E5E3DA] overflow-hidden shadow-xs">
      {/* Table Control Bar */}
      <div className="p-4 border-b border-[#E5E3DA] bg-[#FBFBF9] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#CC5500]" />
          <div>
            <h3 className="text-sm font-semibold text-[#1F1E1D]">
              Live Autonomous Ledger & Audit Trail
            </h3>
            <p className="text-xs text-[#787670]">
              Click any row to inspect raw PayPal Sandbox API JSON response
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#787670]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search transactions..."
              className="pl-8 pr-3 py-1.5 rounded-lg border border-[#E5E3DA] bg-white text-xs text-[#1F1E1D] focus:border-[#CC5500] outline-hidden placeholder:text-[#787670]"
            />
          </div>

          {/* Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-1.5 px-2.5 rounded-lg border border-[#E5E3DA] bg-white text-xs text-[#1F1E1D] focus:border-[#CC5500] outline-hidden cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="COMPLETED">Completed</option>
            <option value="PENDING_APPROVAL">Pending Approval</option>
            <option value="BLOCKED_BY_GUARDRAIL">Blocked</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#E5E3DA] bg-[#F5F4EF]/70 font-mono text-[11px] text-[#787670]">
              <th className="py-2.5 px-4 font-medium">Timestamp</th>
              <th className="py-2.5 px-4 font-medium">Type</th>
              <th className="py-2.5 px-4 font-medium">Recipient</th>
              <th className="py-2.5 px-4 font-medium">Category</th>
              <th className="py-2.5 px-4 font-medium text-right">Amount</th>
              <th className="py-2.5 px-4 font-medium">PayPal ID</th>
              <th className="py-2.5 px-4 font-medium">Status</th>
              <th className="py-2.5 px-4 font-medium text-center">Inspect</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E3DA]/60">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-[#787670]">
                  No matching transactions in this session ledger.
                </td>
              </tr>
            ) : (
              filtered.map((tx) => (
                <tr
                  key={tx.id}
                  onClick={() => onSelectEntry(tx)}
                  className="hover:bg-[#F5F4EF]/60 cursor-pointer transition-colors group"
                >
                  <td className="py-3 px-4 font-mono text-[#787670] whitespace-nowrap">
                    {new Date(tx.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="py-3 px-4 font-mono text-[#1F1E1D]">
                    <span className="inline-flex items-center gap-1">
                      {tx.type === 'ORDER_CAPTURE' ? (
                        <CreditCard className="w-3.5 h-3.5 text-[#0070BA]" />
                      ) : (
                        <Send className="w-3.5 h-3.5 text-[#CC5500]" />
                      )}
                      <span>{tx.type === 'ORDER_CAPTURE' ? 'Order' : 'Payout'}</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-[#1F1E1D] max-w-[180px] truncate">
                    {tx.recipient}
                  </td>
                  <td className="py-3 px-4 text-[#787670]">
                    <span className="bg-[#F5F4EF] px-2 py-0.5 rounded-md font-mono text-[10px]">
                      {tx.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-[#1F1E1D]">
                    ${tx.amount.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-[#0070BA] truncate max-w-[140px]">
                    {tx.paypalCaptureId || tx.paypalOrderId || tx.paypalPayoutBatchId || '-'}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1 font-mono text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        tx.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : tx.status === 'PENDING_APPROVAL'
                          ? 'bg-amber-100 text-amber-800 animate-pulse'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {tx.status === 'COMPLETED' && <ShieldCheck className="w-3 h-3" />}
                      {tx.status === 'PENDING_APPROVAL' && <ShieldAlert className="w-3 h-3" />}
                      <span>{tx.status}</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectEntry(tx);
                      }}
                      className="p-1 rounded-md text-[#787670] hover:text-[#CC5500] hover:bg-white transition-colors"
                      title="Inspect raw JSON"
                    >
                      <Code className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

