'use client';

import React, { useState, useEffect } from 'react';
import { LedgerTable } from '@/components/LedgerTable';
import { RawJsonModal } from '@/components/RawJsonModal';
import { Download, RefreshCw, FileText } from 'lucide-react';
import { LedgerEntry } from '@/lib/types';

export default function TransactionsPage() {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<LedgerEntry | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchLedger = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ledger');
      const data = await res.json();
      setEntries(data.entries || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, []);

  const downloadCsv = () => {
    window.location.href = '/api/analytics?format=csv';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E3DA]">
        <div>
          <h2 className="text-xl font-bold text-[#1F1E1D]">Autonomous Transactions Ledger</h2>
          <p className="text-xs text-[#787670] mt-0.5">
            Immutable database records of all PayPal Orders, Captures, and Payout disbursements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={downloadCsv}
            className="px-3.5 py-2 rounded-xl border border-[#E5E3DA] bg-white hover:bg-[#F5F4EF] text-xs font-medium text-[#1F1E1D] shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#CC5500]" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={fetchLedger}
            className="p-2 rounded-xl border border-[#E5E3DA] bg-white hover:bg-[#F5F4EF] text-xs text-[#787670] hover:text-[#1F1E1D] shadow-2xs transition-colors cursor-pointer"
            title="Refresh Ledger"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <LedgerTable
        entries={entries}
        onSelectEntry={(entry) => setSelectedEntry(entry)}
      />

      <RawJsonModal
        entry={selectedEntry}
        onClose={() => setSelectedEntry(null)}
      />
    </div>
  );
}
