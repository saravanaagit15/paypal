'use client';

import React, { useState, useEffect } from 'react';
import {
  Shield,
  AlertOctagon,
  Sliders,
  Check,
  RotateCcw,
  AlertTriangle,
  Lock,
} from 'lucide-react';

export default function BudgetsPage() {
  const [singleLimit, setSingleLimit] = useState('25.00');
  const [dailyLimit, setDailyLimit] = useState('50.00');
  const [weeklyLimit, setWeeklyLimit] = useState('100.00');
  const [monthlyLimit, setMonthlyLimit] = useState('200.00');
  const [emergencyFreeze, setEmergencyFreeze] = useState(false);
  const [blockUnapproved, setBlockUnapproved] = useState(true);
  const [blockNonWhitelisted, setBlockNonWhitelisted] = useState(false);
  const [categories, setCategories] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user?.budget) {
          const b = data.user.budget;
          const p = data.user.spendingPolicy;
          setSingleLimit(b.singleTxLimit.toString());
          setDailyLimit(b.dailyLimit.toString());
          setWeeklyLimit(b.weeklyLimit.toString());
          setMonthlyLimit(b.monthlyLimit.toString());
          setEmergencyFreeze(Boolean(b.emergencyFreeze));

          if (p) {
            setBlockUnapproved(Boolean(p.blockUnapprovedCategories));
            setBlockNonWhitelisted(Boolean(p.blockNonWhitelistedMerchants));
            try {
              const cats = JSON.parse(p.whitelistedCategoriesJson);
              setCategories(cats.join(', '));
            } catch {
              setCategories('developer tools, cloud hosting, api credits, open-source tipping');
            }
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const catsArray = categories.split(',').map((c) => c.trim()).filter(Boolean);
      await fetch('/api/guardrails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          singleTxLimit: parseFloat(singleLimit) || 25.0,
          dailyLimit: parseFloat(dailyLimit) || 50.0,
          weeklyLimit: parseFloat(weeklyLimit) || 100.0,
          monthlyLimit: parseFloat(monthlyLimit) || 200.0,
          emergencyFreeze,
          blockUnapprovedCategories: blockUnapproved,
          blockNonWhitelistedMerchants: blockNonWhitelisted,
          whitelistedCategories: catsArray,
        }),
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleEmergencyFreeze = async () => {
    const nextVal = !emergencyFreeze;
    setEmergencyFreeze(nextVal);
    try {
      await fetch('/api/guardrails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emergencyFreeze: nextVal }),
      });
    } catch (e) {}
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-[#1F1E1D]">Financial Budgets &amp; Governance Mandates</h2>
        <p className="text-xs text-[#787670] mt-0.5">
          Establish deterministic spending limits and vendor whitelists. The AI agent strictly enforces these mathematical bounds.
        </p>
      </div>

      {/* Emergency Freeze Banner */}
      <div
        className={`p-5 rounded-2xl border transition-all ${
          emergencyFreeze
            ? 'bg-rose-50 border-rose-300 text-rose-950'
            : 'bg-white border-[#E5E3DA] text-[#1F1E1D]'
        } shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4`}
      >
        <div className="flex items-start gap-3">
          <AlertOctagon
            className={`w-6 h-6 shrink-0 mt-0.5 ${
              emergencyFreeze ? 'text-rose-600 animate-pulse' : 'text-[#787670]'
            }`}
          />
          <div>
            <h3 className="text-sm font-semibold">Emergency Spending Freeze</h3>
            <p className="text-xs text-[#55534E] mt-0.5">
              {emergencyFreeze
                ? 'All autonomous payments are currently completely halted. No transactions can be executed.'
                : 'Instantly lock all outgoing commerce in the event of an audit alert or suspicious activity.'}
            </p>
          </div>
        </div>

        <button
          onClick={toggleEmergencyFreeze}
          className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
            emergencyFreeze
              ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs'
              : 'border border-rose-300 text-rose-700 hover:bg-rose-50'
          }`}
        >
          {emergencyFreeze ? 'Deactivate Freeze' : 'Activate Emergency Freeze'}
        </button>
      </div>

      {/* Main Configuration Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Spending Limits */}
        <div className="p-6 rounded-2xl border border-[#E5E3DA] bg-white shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E5E3DA]">
            <Sliders className="w-4 h-4 text-[#CC5500]" />
            <h3 className="text-sm font-semibold text-[#1F1E1D]">Spending Ceilings ($ USD)</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-medium text-[#1F1E1D] mb-1">
                Single Transaction Ceiling
              </label>
              <input
                type="number"
                step="1"
                value={singleLimit}
                onChange={(e) => setSingleLimit(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E5E3DA] focus:border-[#CC5500] outline-hidden font-mono text-xs"
              />
              <span className="text-[10px] text-[#787670] mt-1 block">
                Orders above this amount require Human-in-the-Loop review.
              </span>
            </div>

            <div>
              <label className="block font-medium text-[#1F1E1D] mb-1">
                Daily Spending Limit
              </label>
              <input
                type="number"
                step="5"
                value={dailyLimit}
                onChange={(e) => setDailyLimit(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E5E3DA] focus:border-[#CC5500] outline-hidden font-mono text-xs"
              />
            </div>

            <div>
              <label className="block font-medium text-[#1F1E1D] mb-1">
                Weekly Spending Limit
              </label>
              <input
                type="number"
                step="10"
                value={weeklyLimit}
                onChange={(e) => setWeeklyLimit(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E5E3DA] focus:border-[#CC5500] outline-hidden font-mono text-xs"
              />
            </div>

            <div>
              <label className="block font-medium text-[#1F1E1D] mb-1">
                Monthly Spending Envelope
              </label>
              <input
                type="number"
                step="25"
                value={monthlyLimit}
                onChange={(e) => setMonthlyLimit(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E5E3DA] focus:border-[#CC5500] outline-hidden font-mono text-xs"
              />
            </div>
          </div>
        </div>

        {/* Category Governance & Whitelist */}
        <div className="p-6 rounded-2xl border border-[#E5E3DA] bg-white shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E5E3DA]">
            <Shield className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-semibold text-[#1F1E1D]">Vendor &amp; Category Guardrails</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-medium text-[#1F1E1D] mb-1">
                Whitelisted Spending Categories (comma separated)
              </label>
              <textarea
                rows={3}
                value={categories}
                onChange={(e) => setCategories(e.target.value)}
                placeholder="developer tools, cloud hosting, api credits, open-source tipping"
                className="w-full px-3 py-2 rounded-xl border border-[#E5E3DA] focus:border-[#CC5500] outline-hidden font-mono text-xs"
              />
              <span className="text-[10px] text-[#787670] mt-1 block">
                Transactions in categories outside this list are rejected by the governance engine.
              </span>
            </div>

            <div className="pt-2 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={blockUnapproved}
                  onChange={(e) => setBlockUnapproved(e.target.checked)}
                  className="rounded border-[#E5E3DA] text-[#CC5500]"
                />
                <span className="font-medium text-[#1F1E1D]">
                  Automatically block unapproved or high-risk categories (e.g. gambling, luxury goods)
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={blockNonWhitelisted}
                  onChange={(e) => setBlockNonWhitelisted(e.target.checked)}
                  className="rounded border-[#E5E3DA] text-[#CC5500]"
                />
                <span className="font-medium text-[#1F1E1D]">
                  Strict Merchant Whitelist mode: only allow transactions to pre-approved vendors
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3">
          {saveSuccess && (
            <span className="text-xs text-emerald-700 font-medium flex items-center gap-1 font-mono">
              <Check className="w-4 h-4 text-emerald-600" />
              Guardrail policies saved successfully
            </span>
          )}

          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2.5 rounded-xl bg-[#CC5500] hover:bg-[#B34700] text-white font-medium text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <span>{isSaving ? 'Saving...' : 'Save Financial Policies'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
