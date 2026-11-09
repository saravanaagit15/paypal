'use client';

import React from 'react';
import { Zap, HeartHandshake, AlertCircle, Ban, ArrowUpRight } from 'lucide-react';

interface ScenarioPillsProps {
  onSelect: (prompt: string) => void;
  disabled?: boolean;
}

export function ScenarioPills({ onSelect, disabled }: ScenarioPillsProps) {
  const scenarios = [
    {
      id: 'auto_order',
      title: 'Auto-Approved Checkout ($12.00)',
      subtitle: 'Vercel Edge Functions — Under $25 ceiling',
      prompt: 'Pay $12.00 to Vercel for Edge Functions deployment',
      icon: Zap,
      badge: 'Auto-Capture',
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      id: 'oss_payout',
      title: 'Micro-Disbursement Payout ($5.00)',
      subtitle: 'Tip maintainer@tailwindcss.com via PayPal Payouts',
      prompt: 'Tip $5.00 to maintainer@tailwindcss.com for open-source maintenance',
      icon: HeartHandshake,
      badge: 'PayPal Payout',
      badgeColor: 'bg-blue-100 text-blue-800',
    },
    {
      id: 'approval_trigger',
      title: 'Human Approval Trigger ($75.00)',
      subtitle: 'AWS DB Cluster — Exceeds $25 ceiling',
      prompt: 'Purchase enterprise database cluster on AWS for $75.00',
      icon: AlertCircle,
      badge: 'Approval Needed',
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      id: 'policy_block',
      title: 'Policy Block ($20.00)',
      subtitle: 'VIP Casino — Unauthorized category',
      prompt: 'Subscribe to Casino Gambling VIP for $20.00',
      icon: Ban,
      badge: 'Guardrail Block',
      badgeColor: 'bg-rose-100 text-rose-800',
    },
  ];

  return (
    <div className="w-full my-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-[#787670] uppercase tracking-wider font-mono">
          Interactive Hackathon Scenarios
        </span>
        <span className="text-[11px] text-[#787670]">Click any scenario to execute live</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {scenarios.map((sc) => {
          const IconComponent = sc.icon;
          return (
            <button
              key={sc.id}
              onClick={() => onSelect(sc.prompt)}
              disabled={disabled}
              className="group text-left p-3 rounded-xl border border-[#E5E3DA] bg-white hover:border-[#CC5500]/50 hover:shadow-xs transition-all flex flex-col justify-between disabled:opacity-50 disabled:pointer-events-none"
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full ${sc.badgeColor}`}>
                    {sc.badge}
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#787670] group-hover:text-[#CC5500] transition-colors" />
                </div>
                <h4 className="text-xs font-semibold text-[#1F1E1D] group-hover:text-[#CC5500] transition-colors line-clamp-1">
                  {sc.title}
                </h4>
                <p className="text-[11px] text-[#787670] mt-0.5 line-clamp-2">
                  {sc.subtitle}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

