'use client';

import React from 'react';
import { Shield, ShieldAlert, Cpu, Sparkles, RefreshCw, Zap } from 'lucide-react';
import { GuardrailConfig } from '@/lib/types';

interface HeaderProps {
  guardrails: GuardrailConfig;
  stats: {
    totalSpent: number;
    remainingMonthlyBudget: number;
    pendingCount: number;
    completedCount: number;
  };
  demoMode: boolean;
  onToggleDemoMode: (val: boolean) => void;
  onRefresh: () => void;
}

export function Header({
  guardrails,
  stats,
  demoMode,
  onToggleDemoMode,
  onRefresh,
}: HeaderProps) {
  const percentUsed = Math.min(
    100,
    Math.round((guardrails.currentMonthlySpent / guardrails.monthlyLimit) * 100)
  );

  return (
    <header className="sticky top-0 z-30 border-b border-[#E5E3DA] bg-[#FBFBF9]/90 backdrop-blur-md px-4 lg:px-8 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#CC5500] to-[#D97706] flex items-center justify-center text-white shadow-sm font-semibold tracking-tight">
            TA
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold text-[#1F1E1D] tracking-tight">
                TrustAgent
              </h1>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[#0070BA]/10 text-[#0070BA] font-semibold border border-[#0070BA]/20">
                PayPal AI Hackathon
              </span>
            </div>
            <p className="text-xs text-[#787670]">
              Autonomous Budget-Governed Agentic Commerce on PayPal Sandbox
            </p>
          </div>
        </div>

        {/* Guardrail Metrics & Controls */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {/* Single Limit Tag */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white border border-[#E5E3DA] shadow-2xs">
            <Shield className="w-3.5 h-3.5 text-[#CC5500]" />
            <span className="text-[#787670]">Single Ceil:</span>
            <span className="font-mono font-semibold text-[#1F1E1D]">
              ${guardrails.singleTxLimit.toFixed(2)}
            </span>
          </div>

          {/* Monthly Budget Gauge */}
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white border border-[#E5E3DA] shadow-2xs">
            <span className="text-[#787670]">Monthly:</span>
            <div className="w-16 h-2 rounded-full bg-[#E5E3DA] overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#15803D] via-[#D97706] to-[#CC5500] transition-all duration-500"
                style={{ width: `${percentUsed}%` }}
              />
            </div>
            <span className="font-mono font-semibold text-[#1F1E1D]">
              ${guardrails.currentMonthlySpent.toFixed(2)} / ${guardrails.monthlyLimit.toFixed(2)}
            </span>
          </div>

          {/* Pending Review Badge */}
          {stats.pendingCount > 0 && (
            <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 animate-pulse font-medium">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{stats.pendingCount} Pending Approval</span>
            </div>
          )}

          {/* Demo Mode Toggle */}
          <button
            onClick={() => onToggleDemoMode(!demoMode)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
              demoMode
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-blue-50 text-blue-800 border-blue-300'
            }`}
            title="Toggle between Live Sandbox and Guaranteed Demo Simulation"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{demoMode ? 'Demo Safeguards: ON' : 'Live PayPal REST'}</span>
          </button>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            className="p-1.5 rounded-lg border border-[#E5E3DA] bg-white text-[#787670] hover:text-[#1F1E1D] hover:bg-[#F5F4EF] transition-colors"
            title="Refresh Ledger and Guardrail metrics"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}

