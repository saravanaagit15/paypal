'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  AgentMessage,
  AgentChainOfThoughtStep,
  AgentArtifact,
  LedgerEntry,
  GuardrailConfig,
} from '@/lib/types';

export function useAgentCommerce() {
  const [messages, setMessages] = useState<AgentMessage[]>([
    {
      id: 'msg_welcome',
      role: 'assistant',
      content:
        "Hello, I am **TrustAgent** — your autonomous financial intelligence agent for PayPal Sandbox. I operate under strict user-defined budget guardrails (Current single ceiling: $25.00, monthly envelope: $200.00). Ask me to fund dependencies, disburse payouts to OSS maintainers, or deploy cloud infrastructure.",
      timestamp: new Date().toISOString(),
      steps: [
        {
          type: 'reasoning',
          title: 'Guardrail Policy Engine Active',
          detail: 'Ceiling: $25.00/tx | Monthly: $200.00 | Mode: PayPal Sandbox Live + Demo Safeguards',
          timestamp: new Date().toISOString(),
          status: 'success',
        },
      ],
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [activeArtifact, setActiveArtifact] = useState<AgentArtifact | null>(null);
  const [isArtifactOpen, setIsArtifactOpen] = useState(false);
  const [demoMode, setDemoMode] = useState(true); // Default to safe demo mode with live toggle
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [selectedLedgerEntry, setSelectedLedgerEntry] = useState<LedgerEntry | null>(null);
  const [guardrails, setGuardrails] = useState<GuardrailConfig>({
    singleTxLimit: 25.0,
    monthlyLimit: 200.0,
    currentMonthlySpent: 38.5,
    whitelistedCategories: [
      'developer tools',
      'github dependencies',
      'cloud hosting',
      'api credits',
      'open-source tipping',
    ],
  });
  const [stats, setStats] = useState({
    totalSpent: 38.5,
    remainingMonthlyBudget: 161.5,
    pendingCount: 0,
    completedCount: 2,
    totalTransactions: 2,
  });

  // Fetch Ledger on load
  const refreshLedger = useCallback(async () => {
    try {
      const res = await fetch('/api/ledger');
      if (res.ok) {
        const data = await res.json();
        setLedger(data.entries || []);
        if (data.guardrails) setGuardrails(data.guardrails);
        if (data.stats) setStats(data.stats);
      }
    } catch (err) {
      console.warn('Could not fetch ledger:', err);
    }
  }, []);

  useEffect(() => {
    refreshLedger();
  }, [refreshLedger]);

  // Send message to agent
  const sendMessage = async (promptText: string) => {
    if (!promptText.trim() || isLoading) return;

    const userMessage: AgentMessage = {
      id: `msg_user_${Date.now()}`,
      role: 'user',
      content: promptText,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    const tempAgentMessageId = `msg_agent_${Date.now()}`;
    const initialAgentMessage: AgentMessage = {
      id: tempAgentMessageId,
      role: 'assistant',
      content: 'Evaluating prompt against budget guardrails...',
      timestamp: new Date().toISOString(),
      steps: [
        {
          type: 'reasoning',
          title: 'Autonomous Policy Evaluation',
          detail: 'Analyzing request parameters against single and monthly transaction ceilings...',
          timestamp: new Date().toISOString(),
          status: 'pending',
        },
      ],
    };

    setMessages((prev) => [...prev, initialAgentMessage]);

    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          demoMode,
          conversation: messages.slice(-4).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await res.json();
      const allSteps: AgentChainOfThoughtStep[] = data.steps || [];

      // Animate streaming chain-of-thought steps sequentially for high production quality
      for (let i = 0; i < allSteps.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 320));
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempAgentMessageId
              ? {
                  ...msg,
                  steps: allSteps.slice(0, i + 1),
                  content: i === allSteps.length - 1 ? data.content : 'Executing autonomous commerce chain...',
                }
              : msg
          )
        );
      }

      // Final update
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempAgentMessageId
            ? {
                ...msg,
                content: data.content,
                steps: allSteps,
                artifact: data.artifact,
              }
            : msg
        )
      );

      // Slide open Claude Artifact drawer if artifact was generated
      if (data.artifact) {
        setActiveArtifact(data.artifact);
        setIsArtifactOpen(true);
      }

      await refreshLedger();
    } catch (err: any) {
      console.error('Agent route error:', err);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempAgentMessageId
            ? {
                ...msg,
                content: `An error occurred: ${err.message || 'Unknown network error'}. Please try again.`,
                steps: [
                  ...(msg.steps || []),
                  {
                    type: 'reasoning',
                    title: 'System Exception Handled',
                    detail: 'Fallback safely retained system state.',
                    timestamp: new Date().toISOString(),
                    status: 'error',
                  },
                ],
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Human approval trigger
  const approvePendingOrder = async (orderId: string, ledgerId?: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/paypal/capture-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, ledgerId }),
      });

      const data = await res.json();
      if (data.success) {
        // Update active artifact to executed
        if (activeArtifact) {
          setActiveArtifact({
            ...activeArtifact,
            status: 'EXECUTED',
            data: {
              ...activeArtifact.data,
              captureId: data.capture?.id,
              captured: true,
            },
          });
        }

        // Add confirmation message
        setMessages((prev) => [
          ...prev,
          {
            id: `msg_sys_${Date.now()}`,
            role: 'assistant',
            content: `Human authorization granted. PayPal order **${orderId}** was captured successfully (Capture ID: **${data.capture?.id || 'CAP-CONFIRMED'}**). Updated in ledger.`,
            timestamp: new Date().toISOString(),
            steps: [
              {
                type: 'api_invocation',
                title: 'Human-in-the-Loop Captured via PayPal',
                detail: `Order ${orderId} finalized with seller protection.`,
                timestamp: new Date().toISOString(),
                status: 'success',
              },
            ],
          },
        ]);

        await refreshLedger();
      }
    } catch (err) {
      console.error('Approval error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const closeArtifact = () => {
    setIsArtifactOpen(false);
  };

  const openArtifact = (artifact?: AgentArtifact) => {
    if (artifact) setActiveArtifact(artifact);
    setIsArtifactOpen(true);
  };

  return {
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
  };
}

