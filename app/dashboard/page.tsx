'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Shield,
  Bot,
  ArrowRight,
  CreditCard,
  Send,
  Zap,
} from 'lucide-react';

export default function DashboardOverview() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/ledger')
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-xs text-[#787670] font-mono">
        Loading real-time financial ledger from database...
      </div>
    );
  }

  const guardrails = data?.guardrails || {
    monthlyLimit: 200.0,
    currentMonthlySpent: 38.5,
    singleTxLimit: 25.0,
  };

  const stats = data?.stats || {
    totalSpent: 38.5,
    remainingMonthlyBudget: 161.5,
    pendingCount: 0,
    completedCount: 2,
    blockedCount: 0,
    totalTransactions: 2,
  };

  const entries = data?.entries || [];

  const percentUsed = Math.min(
    100,
    Math.round((guardrails.currentMonthlySpent / guardrails.monthlyLimit) * 100)
  );

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 rounded-3xl border border-[#E5E3DA] bg-gradient-to-br from-white to-[#F5F4EF] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono uppercase text-[#CC5500] font-semibold tracking-wider">
            Financial Supervisor Console
          </span>
          <h2 className="text-xl font-bold text-[#1F1E1D] mt-1">Autonomous Commerce Overview</h2>
          <p className="text-xs text-[#787670] mt-0.5">
            Real-time financial status, active guardrail envelopes, and PayPal Sandbox activity.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/agent"
            className="px-4 py-2 rounded-xl bg-[#CC5500] hover:bg-[#B34700] text-white text-xs font-medium shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Open AI Agent</span>
          </Link>
          <Link
            href="/dashboard/budgets"
            className="px-4 py-2 rounded-xl border border-[#E5E3DA] bg-white hover:bg-[#F5F4EF] text-[#1F1E1D] text-xs font-medium shadow-2xs transition-colors"
          >
            Configure Policies
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Spent */}
        <div className="p-5 rounded-2xl border border-[#E5E3DA] bg-white shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs text-[#787670]">
            <span>Monthly Spending</span>
            <DollarSign className="w-4 h-4 text-[#CC5500]" />
          </div>
          <div className="font-mono text-2xl font-bold text-[#1F1E1D]">
            ${guardrails.currentMonthlySpent.toFixed(2)}
          </div>
          <div className="text-[11px] text-[#787670]">
            of ${guardrails.monthlyLimit.toFixed(2)} monthly ceiling
          </div>
        </div>

        {/* Remaining Budget */}
        <div className="p-5 rounded-2xl border border-[#E5E3DA] bg-white shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs text-[#787670]">
            <span>Remaining Budget</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="font-mono text-2xl font-bold text-emerald-600">
            ${stats.remainingMonthlyBudget.toFixed(2)}
          </div>
          <div className="text-[11px] text-[#787670]">
            {100 - percentUsed}% budget buffer remaining
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="p-5 rounded-2xl border border-[#E5E3DA] bg-white shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs text-[#787670]">
            <span>Pending Approvals</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="font-mono text-2xl font-bold text-[#1F1E1D]">
            {stats.pendingCount}
          </div>
          <div className="text-[11px] text-amber-700 font-medium">
            {stats.pendingCount > 0 ? (
              <Link href="/dashboard/approvals" className="hover:underline flex items-center gap-1">
                <span>Requires human sign-off</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            ) : (
              'All orders clear'
            )}
          </div>
        </div>

        {/* Success Rate */}
        <div className="p-5 rounded-2xl border border-[#E5E3DA] bg-white shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs text-[#787670]">
            <span>Transactions Logged</span>
            <CheckCircle2 className="w-4 h-4 text-[#0070BA]" />
          </div>
          <div className="font-mono text-2xl font-bold text-[#1F1E1D]">
            {stats.totalTransactions}
          </div>
          <div className="text-[11px] text-[#787670]">
            {stats.completedCount} completed • {stats.blockedCount || 0} blocked
          </div>
        </div>
      </div>

      {/* Budget Utilization Progress Card */}
      <div className="p-6 rounded-2xl border border-[#E5E3DA] bg-white shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#CC5500]" />
            <h3 className="text-sm font-semibold text-[#1F1E1D]">Monthly Budget Envelope</h3>
          </div>
          <span className="font-mono text-xs font-semibold text-[#787670]">
            {percentUsed}% Utilized
          </span>
        </div>

        <div className="w-full h-3 rounded-full bg-[#E5E3DA] overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#15803D] via-[#D97706] to-[#CC5500] transition-all duration-500"
            style={{ width: `${percentUsed}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-[#787670] pt-1">
          <span>Spent: ${guardrails.currentMonthlySpent.toFixed(2)}</span>
          <span>Single Ceiling: ${guardrails.singleTxLimit.toFixed(2)}</span>
          <span>Max Envelope: ${guardrails.monthlyLimit.toFixed(2)}</span>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="p-6 rounded-2xl border border-[#E5E3DA] bg-white shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E3DA]">
          <div>
            <h3 className="text-sm font-semibold text-[#1F1E1D]">Recent Financial Ledger Activity</h3>
            <p className="text-xs text-[#787670]">Transactions synced with SQLite database and PayPal Sandbox</p>
          </div>
          <Link
            href="/dashboard/transactions"
            className="text-xs font-medium text-[#CC5500] hover:underline flex items-center gap-1"
          >
            <span>Full Ledger</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="divide-y divide-[#E5E3DA]/60">
          {entries.slice(0, 5).map((tx: any) => (
            <div key={tx.id} className="py-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#F5F4EF] flex items-center justify-center text-[#787670]">
                  {tx.type === 'ORDER_CAPTURE' ? <CreditCard className="w-4 h-4 text-[#0070BA]" /> : <Send className="w-4 h-4 text-[#CC5500]" />}
                </div>
                <div>
                  <div className="font-semibold text-[#1F1E1D]">{tx.recipient}</div>
                  <div className="text-[11px] text-[#787670] font-mono">
                    {tx.category} • {new Date(tx.timestamp).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="font-mono font-bold text-[#1F1E1D]">
                  ${tx.amount.toFixed(2)} {tx.currency || 'USD'}
                </div>
                <span
                  className={`inline-block text-[9px] font-mono font-semibold px-2 py-0.5 rounded-full mt-0.5 ${
                    tx.status === 'COMPLETED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : tx.status === 'PENDING_APPROVAL'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {tx.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

