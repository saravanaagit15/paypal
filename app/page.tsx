'use client';

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { ChatStream } from '@/components/ChatStream';
import { ArtifactDrawer } from '@/components/ArtifactDrawer';
import { LedgerTable } from '@/components/LedgerTable';
import { ScenarioPills } from '@/components/ScenarioPills';
import { RawJsonModal } from '@/components/RawJsonModal';
import { GuardrailSettingsModal } from '@/components/GuardrailSettingsModal';
import { useAgentCommerce } from '@/hooks/useAgentCommerce';
import { Sliders, Shield, BookOpen, Layers } from 'lucide-react';

export default function Home() {
  const {
    messages,
    isLoading,
    activeArtifact,
    isArtifactOpen,
    demoMode,
    setDemoMode,
    ledger,
    selectedLedgerEntry,
    setSelectedLedgerEntry,
    guardrails,
    stats,
    sendMessage,
    approvePendingOrder,
    closeArtifact,
    openArtifact,
    refreshLedger,
  } = useAgentCommerce();

  const [activeTab, setActiveTab] = useState<'agent' | 'ledger'>('agent');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleUpdateGuardrails = async (updates: any) => {
    try {
      await fetch('/api/guardrails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      await refreshLedger();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBF9] flex flex-col font-sans selection:bg-[#CC5500]/20 selection:text-[#CC5500]">
      {/* Header */}
      <Header
        guardrails={guardrails}
        stats={stats}
        demoMode={demoMode}
        onToggleDemoMode={setDemoMode}
        onRefresh={refreshLedger}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        {/* Navigation & Controls Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E3DA] pb-3">
          {/* View Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-[#F5F4EF] rounded-xl border border-[#E5E3DA] text-xs font-medium">
            <button
              onClick={() => setActiveTab('agent')}
              className={`px-4 py-2 rounded-lg transition-all ${
                activeTab === 'agent'
                  ? 'bg-white text-[#1F1E1D] shadow-2xs font-semibold'
                  : 'text-[#787670] hover:text-[#1F1E1D]'
              }`}
            >
              Autonomous Agent & Chat
            </button>
            <button
              onClick={() => setActiveTab('ledger')}
              className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'ledger'
                  ? 'bg-white text-[#1F1E1D] shadow-2xs font-semibold'
                  : 'text-[#787670] hover:text-[#1F1E1D]'
              }`}
            >
              <span>Audit Ledger</span>
              <span className="font-mono text-[10px] bg-[#E5E3DA] px-1.5 py-0.5 rounded-full">
                {ledger.length}
              </span>
            </button>
          </div>

          {/* Policy Settings Trigger */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E5E3DA] bg-white text-xs text-[#1F1E1D] hover:bg-[#F5F4EF] transition-colors shadow-2xs font-medium cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-[#CC5500]" />
              <span>Configure Guardrails</span>
            </button>
          </div>
        </div>

        {/* Interactive Scenario Launcher */}
        <ScenarioPills onSelect={sendMessage} disabled={isLoading} />

        {/* Tab 1: Agent Conversational Stream & Real-time Ledger */}
        {activeTab === 'agent' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Chat Stream & Chain-of-thought */}
            <div className="lg:col-span-8 h-[640px]">
              <ChatStream
                messages={messages}
                isLoading={isLoading}
                onSendMessage={sendMessage}
                onOpenArtifact={openArtifact}
              />
            </div>

            {/* Right: Quick Ledger Glance & Guardrail Summary */}
            <div className="lg:col-span-4 space-y-4">
              {/* Financial Guardrails Status Card */}
              <div className="p-4 rounded-2xl border border-[#E5E3DA] bg-white shadow-2xs space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#1F1E1D]">
                  <Shield className="w-4 h-4 text-[#CC5500]" />
                  <span>Enforced Financial Policy</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-[#E5E3DA]/60">
                    <span className="text-[#787670]">Single Tx Ceiling</span>
                    <span className="font-mono font-semibold">${guardrails.singleTxLimit.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#E5E3DA]/60">
                    <span className="text-[#787670]">Monthly Ceiling</span>
                    <span className="font-mono font-semibold">${guardrails.monthlyLimit.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#E5E3DA]/60">
                    <span className="text-[#787670]">Current Spend</span>
                    <span className="font-mono font-semibold text-[#CC5500]">${guardrails.currentMonthlySpent.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[#787670]">Remaining Budget</span>
                    <span className="font-mono font-semibold text-emerald-600">
                      ${Math.max(0, guardrails.monthlyLimit - guardrails.currentMonthlySpent).toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="pt-2 border-t border-[#E5E3DA]">
                  <span className="text-[10px] text-[#787670] uppercase font-mono tracking-wider block mb-1">
                    Whitelisted Categories
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {guardrails.whitelistedCategories.map((cat, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#F5F4EF] text-[#55534E]"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Mini Transaction Feed */}
              <div className="p-4 rounded-2xl border border-[#E5E3DA] bg-white shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#1F1E1D]">Recent Transactions</span>
                  <button
                    onClick={() => setActiveTab('ledger')}
                    className="text-[11px] text-[#CC5500] hover:underline font-medium"
                  >
                    View All ({ledger.length})
                  </button>
                </div>
                <div className="space-y-2">
                  {ledger.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedLedgerEntry(item)}
                      className="p-2.5 rounded-xl border border-[#E5E3DA]/60 bg-[#FBFBF9] hover:bg-[#F5F4EF] cursor-pointer transition-colors text-xs flex items-center justify-between"
                    >
                      <div className="truncate max-w-[170px]">
                        <div className="font-medium text-[#1F1E1D] truncate">{item.recipient}</div>
                        <div className="text-[10px] text-[#787670] font-mono">{item.category}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold text-[#1F1E1D]">${item.amount.toFixed(2)}</div>
                        <div
                          className={`text-[9px] font-mono font-semibold px-1.5 py-0.2 rounded-full ${
                            item.status === 'COMPLETED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : item.status === 'PENDING_APPROVAL'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {item.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Full Audit Ledger & Data Table */}
        {activeTab === 'ledger' && (
          <div className="space-y-4">
            <LedgerTable
              entries={ledger}
              onSelectEntry={setSelectedLedgerEntry}
              onApprovePending={approvePendingOrder}
            />
          </div>
        )}
      </main>

      {/* Claude-Style Artifact Sliding Drawer */}
      <ArtifactDrawer
        isOpen={isArtifactOpen}
        artifact={activeArtifact}
        onClose={closeArtifact}
        onApprove={approvePendingOrder}
        isLoading={isLoading}
      />

      {/* Raw PayPal JSON Inspection Modal */}
      <RawJsonModal
        entry={selectedLedgerEntry}
        onClose={() => setSelectedLedgerEntry(null)}
      />

      {/* Guardrail Settings Modal */}
      <GuardrailSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={guardrails}
        onSave={handleUpdateGuardrails}
      />
    </div>
  );
}

