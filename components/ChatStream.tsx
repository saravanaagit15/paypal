'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  Terminal,
  Cpu,
  Layers,
  ExternalLink,
} from 'lucide-react';
import { AgentMessage, AgentChainOfThoughtStep, AgentArtifact } from '@/lib/types';

interface ChatStreamProps {
  messages: AgentMessage[];
  isLoading: boolean;
  onSendMessage: (prompt: string) => void;
  onOpenArtifact: (artifact: AgentArtifact) => void;
}

export function ChatStream({
  messages,
  isLoading,
  onSendMessage,
  onOpenArtifact,
}: ChatStreamProps) {
  const [input, setInput] = useState('');
  const [expandedThoughts, setExpandedThoughts] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input);
    setInput('');
  };

  const toggleThoughts = (msgId: string) => {
    setExpandedThoughts((prev) => ({
      ...prev,
      [msgId]: !prev[msgId],
    }));
  };

  return (
    <div className="flex flex-col h-full bg-[#FBFBF9] rounded-2xl border border-[#E5E3DA] overflow-hidden shadow-xs">
      {/* Messages list */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          const hasThoughts = msg.steps && msg.steps.length > 0;
          const isExpanded = expandedThoughts[msg.id] ?? true;

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-3xl ${
                isUser ? 'ml-auto' : 'mr-auto'
              } w-full`}
            >
              {/* Sender label */}
              <div className="flex items-center gap-2 mb-1 text-[11px] font-mono text-[#787670]">
                {isUser ? (
                  <span>User (Finance Manager)</span>
                ) : (
                  <span className="flex items-center gap-1 text-[#CC5500] font-semibold">
                    <Sparkles className="w-3 h-3" /> TrustAgent AI
                  </span>
                )}
                <span>•</span>
                <span>
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </span>
              </div>

              {/* Chain of Thought Pill (for Agent) */}
              {!isUser && hasThoughts && (
                <div className="w-full mb-3 rounded-xl border border-[#E5E3DA] bg-[#F5F4EF]/70 overflow-hidden text-xs">
                  <button
                    onClick={() => toggleThoughts(msg.id)}
                    className="w-full px-3.5 py-2 flex items-center justify-between text-[#787670] hover:text-[#1F1E1D] transition-colors font-mono text-[11px]"
                  >
                    <div className="flex items-center gap-2">
                      <Cpu className="w-3.5 h-3.5 text-[#CC5500]" />
                      <span className="font-semibold text-[#1F1E1D]">
                        Chain of Thought
                      </span>
                      <span className="text-[#787670]">
                        ({msg.steps!.length} step{msg.steps!.length > 1 ? 's' : ''})
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="px-3.5 pb-3 pt-1 border-t border-[#E5E3DA]/60 space-y-2">
                      {msg.steps!.map((step, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2.5 text-xs bg-white/70 p-2.5 rounded-lg border border-[#E5E3DA]/40"
                        >
                          <div className="mt-0.5">
                            {step.type === 'guardrail_check' ? (
                              step.status === 'error' ? (
                                <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                              ) : (
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                              )
                            ) : step.type === 'tool_call' ? (
                              <Terminal className="w-3.5 h-3.5 text-[#0070BA]" />
                            ) : step.type === 'human_approval' ? (
                              <ShieldAlert className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                            ) : (
                              <Layers className="w-3.5 h-3.5 text-[#787670]" />
                            )}
                          </div>
                          <div className="flex-1 font-mono text-[11px]">
                            <div className="font-semibold text-[#1F1E1D] flex items-center justify-between">
                              <span>{step.title}</span>
                              <span className="text-[10px] text-[#787670]">
                                {step.status?.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-[#55534E] mt-0.5 break-all font-sans text-xs">
                              {step.detail}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Message Content Bubble */}
              <div
                className={`p-4 rounded-2xl text-sm leading-relaxed ${
                  isUser
                    ? 'bg-[#1F1E1D] text-white rounded-br-xs'
                    : 'bg-white border border-[#E5E3DA] text-[#1F1E1D] rounded-bl-xs shadow-2xs'
                }`}
              >
                <div className="whitespace-pre-wrap font-sans">{msg.content}</div>

                {/* If message generated an artifact, show quick button */}
                {msg.artifact && (
                  <div className="mt-3 pt-3 border-t border-[#E5E3DA] flex items-center justify-between">
                    <span className="text-xs font-medium text-[#787670] flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#CC5500] animate-ping" />
                      Artifact Generated: {msg.artifact.title}
                    </span>
                    <button
                      onClick={() => onOpenArtifact(msg.artifact!)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#CC5500] hover:bg-[#B34700] text-white text-xs font-medium transition-colors"
                    >
                      <span>Open Artifact</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-[#787670] py-2">
            <div className="w-2 h-2 rounded-full bg-[#CC5500] animate-pulse" />
            <span className="font-mono">TrustAgent evaluating PayPal parameters...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <form
        onSubmit={handleSubmit}
        className="p-3 bg-white border-t border-[#E5E3DA] flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="E.g. Pay $15 to GitHub for Copilot, or tip $5 to maintainer@tailwindcss.com..."
          disabled={isLoading}
          className="flex-1 bg-[#F5F4EF] border border-transparent focus:border-[#CC5500] focus:bg-white text-xs sm:text-sm text-[#1F1E1D] px-4 py-2.5 rounded-xl outline-hidden transition-all placeholder:text-[#787670]"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="p-2.5 rounded-xl bg-[#CC5500] hover:bg-[#B34700] disabled:bg-[#E5E3DA] text-white disabled:text-[#787670] transition-colors flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}

