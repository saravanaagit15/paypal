'use client';

import React, { useState } from 'react';
import { X, Copy, Check, Terminal, ExternalLink } from 'lucide-react';
import { LedgerEntry } from '@/lib/types';

interface RawJsonModalProps {
  entry: LedgerEntry | null;
  onClose: () => void;
}

export function RawJsonModal({ entry, onClose }: RawJsonModalProps) {
  const [copied, setCopied] = useState(false);

  if (!entry) return null;

  const jsonString = JSON.stringify(entry.rawResponse || entry, null, 2);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-[#1F1E1D] text-white w-full max-w-2xl rounded-2xl border border-neutral-700 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/50">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#CC5500]" />
            <div>
              <h3 className="text-xs font-mono font-semibold text-neutral-200">
                PayPal REST API Response Inspector
              </h3>
              <p className="text-[11px] text-neutral-400 font-mono">
                Transaction ID: {entry.paypalOrderId || entry.paypalPayoutBatchId || entry.id}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={copyToClipboard}
              className="px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-mono flex items-center gap-1.5 text-neutral-200 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy JSON'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* JSON Code Area */}
        <div className="flex-1 overflow-auto p-4 bg-[#141413]">
          <pre className="text-xs font-mono text-emerald-400 leading-relaxed overflow-x-auto">
            {jsonString}
          </pre>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-neutral-800 bg-neutral-900/50 flex items-center justify-between text-[11px] font-mono text-neutral-400">
          <span>Status: {entry.status}</span>
          <span>Category: {entry.category}</span>
          <span>Timestamp: {new Date(entry.timestamp).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}

