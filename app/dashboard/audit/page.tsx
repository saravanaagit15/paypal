'use client';

import React, { useState, useEffect } from 'react';
import { ScrollText, ShieldCheck, AlertTriangle, Key, RefreshCw } from 'lucide-react';

export default function AuditPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/audit');
      const data = await res.json();
      setLogs(data.logs || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E3DA]">
        <div>
          <h2 className="text-xl font-bold text-[#1F1E1D]">Immutable Security Audit Trail</h2>
          <p className="text-xs text-[#787670] mt-0.5">
            Tamper-resistant database audit log recording user actions, AI calls, and PayPal API responses.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="p-2 rounded-xl border border-[#E5E3DA] bg-white hover:bg-[#F5F4EF] text-xs text-[#787670] hover:text-[#1F1E1D] shadow-2xs transition-colors cursor-pointer"
          title="Refresh Audit Logs"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E3DA] overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E5E3DA] bg-[#F5F4EF]/70 font-mono text-[11px] text-[#787670]">
                <th className="py-2.5 px-4 font-medium">Timestamp</th>
                <th className="py-2.5 px-4 font-medium">Action</th>
                <th className="py-2.5 px-4 font-medium">Entity</th>
                <th className="py-2.5 px-4 font-medium">Audit Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E3DA]/60">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-[#787670]">
                    No audit records logged yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#F5F4EF]/50 transition-colors">
                    <td className="py-3 px-4 font-mono text-[#787670] whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-mono">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          log.action.includes('BLOCKED')
                            ? 'bg-rose-100 text-rose-800'
                            : log.action.includes('CAPTURE') || log.action.includes('APPROVED')
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-neutral-100 text-neutral-800'
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[#787670] text-[11px]">
                      {log.entityType}
                    </td>
                    <td className="py-3 px-4 text-[#1F1E1D] max-w-md">
                      {log.detail}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

