'use client';

import React, { useState, useEffect } from 'react';
import { BarChart3, Download, PieChart, TrendingUp, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics')
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="py-20 text-center text-xs text-[#787670] font-mono">Calculating analytics from database...</div>;
  }

  const exportCsv = () => {
    window.location.href = '/api/analytics?format=csv';
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E3DA]">
        <div>
          <h2 className="text-xl font-bold text-[#1F1E1D]">Financial Analytics &amp; Spending Intelligence</h2>
          <p className="text-xs text-[#787670] mt-0.5">
            Real metrics calculated from persistent database transaction records.
          </p>
        </div>

        <button
          onClick={exportCsv}
          className="px-4 py-2 rounded-xl bg-[#CC5500] hover:bg-[#B34700] text-white text-xs font-medium shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download Audit CSV Report</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="p-5 rounded-2xl border border-[#E5E3DA] bg-white shadow-2xs space-y-1">
          <span className="text-[#787670]">Total Settled Volume</span>
          <div className="font-mono text-2xl font-bold text-[#1F1E1D]">
            ${data?.totalSpend?.toFixed(2) || '0.00'} USD
          </div>
          <span className="text-[10px] text-emerald-700 font-mono">Across {data?.completedCount || 0} completed orders</span>
        </div>

        <div className="p-5 rounded-2xl border border-[#E5E3DA] bg-white shadow-2xs space-y-1">
          <span className="text-[#787670]">Autonomous vs. Manual</span>
          <div className="font-mono text-2xl font-bold text-[#CC5500]">
            {data?.autonomousCount || 0} Auto / {data?.manualApprovedCount || 0} HITL
          </div>
          <span className="text-[10px] text-[#787670]">Under-ceiling vs. step-up approved</span>
        </div>

        <div className="p-5 rounded-2xl border border-[#E5E3DA] bg-white shadow-2xs space-y-1">
          <span className="text-[#787670]">Policy Compliance Rate</span>
          <div className="font-mono text-2xl font-bold text-emerald-600">
            {data?.successRate || 100}%
          </div>
          <span className="text-[10px] text-[#787670]">{data?.blockedCount || 0} unauthorized attempts blocked</span>
        </div>
      </div>

      {/* Category Breakdown & Top Merchants */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Spending by Category */}
        <div className="p-6 rounded-2xl border border-[#E5E3DA] bg-white shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E5E3DA]">
            <PieChart className="w-4 h-4 text-[#CC5500]" />
            <h3 className="text-sm font-semibold text-[#1F1E1D]">Spending by Category</h3>
          </div>

          <div className="space-y-3">
            {data?.categoryBreakdown?.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#787670]">No category data yet.</div>
            ) : (
              data.categoryBreakdown.map((cat: any, i: number) => {
                const total = data.totalSpend || 1;
                const pct = Math.round((cat.value / total) * 100);
                return (
                  <div key={i} className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="font-semibold text-[#1F1E1D] capitalize">{cat.name}</span>
                      <span className="font-mono text-[#787670]">${cat.value.toFixed(2)} ({pct}%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#E5E3DA] overflow-hidden">
                      <div
                        className="h-full bg-[#CC5500] rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Top Vendors */}
        <div className="p-6 rounded-2xl border border-[#E5E3DA] bg-white shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E5E3DA]">
            <TrendingUp className="w-4 h-4 text-[#0070BA]" />
            <h3 className="text-sm font-semibold text-[#1F1E1D]">Top Merchants by Volume</h3>
          </div>

          <div className="divide-y divide-[#E5E3DA]/60">
            {data?.merchantBreakdown?.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#787670]">No merchant data yet.</div>
            ) : (
              data.merchantBreakdown.map((m: any, i: number) => (
                <div key={i} className="py-2.5 flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#1F1E1D]">{m.name}</span>
                  <span className="font-mono font-bold text-[#1F1E1D]">${m.amount.toFixed(2)} USD</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
