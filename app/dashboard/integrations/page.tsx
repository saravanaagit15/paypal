'use client';

import React, { useState, useEffect } from 'react';
import { Plug, CheckCircle2, AlertTriangle, ExternalLink, RefreshCw } from 'lucide-react';

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchIntegrations = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/integrations');
      const data = await res.json();
      setIntegrations(data.integrations || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E3DA]">
        <div>
          <h2 className="text-xl font-bold text-[#1F1E1D]">Connected Integrations &amp; Providers</h2>
          <p className="text-xs text-[#787670] mt-0.5">
            Real-time status of payment gateways, AI engines, and storage subsystems.
          </p>
        </div>

        <button
          onClick={fetchIntegrations}
          className="p-2 rounded-xl border border-[#E5E3DA] bg-white hover:bg-[#F5F4EF] text-xs text-[#787670] hover:text-[#1F1E1D] shadow-2xs transition-colors cursor-pointer"
          title="Refresh Integration Health"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="space-y-4">
        {integrations.map((item, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl border border-[#E5E3DA] bg-white shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#F5F4EF] flex items-center justify-center text-[#CC5500] shrink-0 font-bold">
                <Plug className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-[#1F1E1D]">{item.name}</h3>
                  <span
                    className={`font-mono text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      item.status === 'CONNECTED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
                <p className="text-xs text-[#55534E] leading-relaxed max-w-xl">
                  {item.detail}
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-[10px] text-[#787670] font-mono block">
                Checked: {new Date(item.lastChecked).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
