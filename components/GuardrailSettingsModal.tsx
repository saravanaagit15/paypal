'use client';

import React, { useState } from 'react';
import { X, Sliders, ShieldCheck, Check } from 'lucide-react';
import { GuardrailConfig } from '@/lib/types';

interface GuardrailSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: GuardrailConfig;
  onSave: (newConfig: Partial<GuardrailConfig>) => void;
}

export function GuardrailSettingsModal({
  isOpen,
  onClose,
  config,
  onSave,
}: GuardrailSettingsModalProps) {
  const [singleLimit, setSingleLimit] = useState(config.singleTxLimit.toString());
  const [monthlyLimit, setMonthlyLimit] = useState(config.monthlyLimit.toString());
  const [categories, setCategories] = useState(config.whitelistedCategories.join(', '));
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedSingle = parseFloat(singleLimit);
    const parsedMonthly = parseFloat(monthlyLimit);

    onSave({
      singleTxLimit: isNaN(parsedSingle) ? config.singleTxLimit : parsedSingle,
      monthlyLimit: isNaN(parsedMonthly) ? config.monthlyLimit : parsedMonthly,
      whitelistedCategories: categories
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean),
    });

    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-[#E5E3DA] shadow-2xl w-full max-w-md overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E5E3DA] bg-[#FBFBF9] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#CC5500]" />
            <h3 className="text-sm font-semibold text-[#1F1E1D]">
              TrustAgent Budget Guardrails
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#787670] hover:text-[#1F1E1D] hover:bg-[#F5F4EF]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block text-[#787670] font-medium mb-1">
              Single Transaction Ceiling ($ USD)
            </label>
            <input
              type="number"
              step="1"
              value={singleLimit}
              onChange={(e) => setSingleLimit(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#E5E3DA] focus:border-[#CC5500] outline-hidden font-mono"
            />
            <p className="text-[11px] text-[#787670] mt-1">
              Transactions exceeding this amount trigger a Human-in-the-Loop approval prompt.
            </p>
          </div>

          <div>
            <label className="block text-[#787670] font-medium mb-1">
              Monthly Budget Envelope ($ USD)
            </label>
            <input
              type="number"
              step="10"
              value={monthlyLimit}
              onChange={(e) => setMonthlyLimit(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#E5E3DA] focus:border-[#CC5500] outline-hidden font-mono"
            />
          </div>

          <div>
            <label className="block text-[#787670] font-medium mb-1">
              Whitelisted Categories (comma separated)
            </label>
            <textarea
              rows={3}
              value={categories}
              onChange={(e) => setCategories(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#E5E3DA] focus:border-[#CC5500] outline-hidden font-mono text-[11px]"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-xl border border-[#E5E3DA] text-[#787670] hover:bg-[#F5F4EF]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#CC5500] hover:bg-[#B34700] text-white font-medium flex items-center gap-1.5 cursor-pointer"
            >
              {saved ? <Check className="w-3.5 h-3.5" /> : null}
              <span>{saved ? 'Saved!' : 'Save Guardrails'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

