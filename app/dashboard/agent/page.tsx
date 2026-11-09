'use client';

import React from 'react';
import { ChatStream } from '@/components/ChatStream';
import { ArtifactDrawer } from '@/components/ArtifactDrawer';
import { ScenarioPills } from '@/components/ScenarioPills';
import { useAgentCommerce } from '@/hooks/useAgentCommerce';
import { Shield, Sparkles } from 'lucide-react';

export default function AgentPage() {
  const {
    messages,
    isLoading,
    activeArtifact,
    isArtifactOpen,
    guardrails,
    sendMessage,
    approvePendingOrder,
    closeArtifact,
    openArtifact,
  } = useAgentCommerce();

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E3DA]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-[#1F1E1D]">TrustAgent AI Commerce Console</h2>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
              Deterministic Guardrail Active
            </span>
          </div>
          <p className="text-xs text-[#787670] mt-0.5">
            Instruct the autonomous agent in natural language. Financial bounds are strictly enforced by the server-side governance engine.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-3 py-1.5 rounded-xl border border-[#E5E3DA] bg-white font-semibold text-[#1F1E1D] shadow-2xs">
            Ceiling: ${guardrails.singleTxLimit.toFixed(2)}/tx
          </span>
          <span className="px-3 py-1.5 rounded-xl border border-[#E5E3DA] bg-white font-semibold text-emerald-700 shadow-2xs">
            Remaining: ${Math.max(0, guardrails.monthlyLimit - guardrails.currentMonthlySpent).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Scenario Pills for 1-Click Demo Testing */}
      <ScenarioPills onSelect={sendMessage} disabled={isLoading} />

      {/* Chat Interface */}
      <div className="h-[620px]">
        <ChatStream
          messages={messages}
          isLoading={isLoading}
          onSendMessage={sendMessage}
          onOpenArtifact={openArtifact}
        />
      </div>

      {/* Sliding Artifact Drawer */}
      <ArtifactDrawer
        isOpen={isArtifactOpen}
        artifact={activeArtifact}
        onClose={closeArtifact}
        onApprove={approvePendingOrder}
        isLoading={isLoading}
      />
    </div>
  );
}
