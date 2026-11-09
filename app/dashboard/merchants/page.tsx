'use client';

import React, { useState, useEffect } from 'react';
import { Store, ShieldCheck, Ban, Plus, Trash2, Check, ExternalLink } from 'lucide-react';

export default function MerchantsPage() {
  const [whitelist, setWhitelist] = useState<any[]>([]);
  const [blacklist, setBlacklist] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addType, setAddType] = useState<'WHITELIST' | 'BLACKLIST'>('WHITELIST');
  const [merchantName, setMerchantName] = useState('');
  const [domain, setDomain] = useState('');
  const [category, setCategory] = useState('developer tools');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchMerchants = async () => {
    try {
      const res = await fetch('/api/merchants');
      const data = await res.json();
      setWhitelist(data.whitelist || []);
      setBlacklist(data.blacklist || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchMerchants();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!merchantName.trim()) return;
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/merchants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: addType,
          merchantName,
          domain,
          category,
          reason,
        }),
      });

      if (res.ok) {
        setMerchantName('');
        setDomain('');
        setReason('');
        setShowAddModal(false);
        await fetchMerchants();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, type: 'WHITELIST' | 'BLACKLIST') => {
    try {
      await fetch(`/api/merchants?id=${id}&type=${type}`, { method: 'DELETE' });
      await fetchMerchants();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E3DA]">
        <div>
          <h2 className="text-xl font-bold text-[#1F1E1D]">Merchant Governance Controls</h2>
          <p className="text-xs text-[#787670] mt-0.5">
            Pre-approve trusted vendors or block unauthorized merchants and gambling domains.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setAddType('WHITELIST');
              setShowAddModal(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Whitelist Merchant</span>
          </button>
          <button
            onClick={() => {
              setAddType('BLACKLIST');
              setShowAddModal(true);
            }}
            className="px-3.5 py-2 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-medium shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Ban className="w-3.5 h-3.5" />
            <span>Blacklist Vendor</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Whitelist Panel */}
        <div className="p-5 rounded-2xl border border-emerald-200 bg-white shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-emerald-100">
            <div className="flex items-center gap-2 text-emerald-800 font-semibold text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Whitelisted Merchants ({whitelist.length})</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-700 font-semibold">Pre-Approved</span>
          </div>

          <div className="divide-y divide-[#E5E3DA]/60">
            {whitelist.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#787670]">No whitelisted merchants.</div>
            ) : (
              whitelist.map((m) => (
                <div key={m.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-[#1F1E1D]">{m.merchantName}</span>
                    <span className="text-[10px] text-[#787670] font-mono block">
                      {m.domain || 'All domains'} • {m.category || 'general'}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDelete(m.id, 'WHITELIST')}
                    className="p-1 rounded-md text-[#787670] hover:text-rose-600 hover:bg-rose-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Blacklist Panel */}
        <div className="p-5 rounded-2xl border border-rose-200 bg-white shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-rose-100">
            <div className="flex items-center gap-2 text-rose-800 font-semibold text-xs">
              <Ban className="w-4 h-4 text-rose-600" />
              <span>Blocked Merchants ({blacklist.length})</span>
            </div>
            <span className="text-[10px] font-mono text-rose-700 font-semibold">Hard Block</span>
          </div>

          <div className="divide-y divide-[#E5E3DA]/60">
            {blacklist.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#787670]">No blacklisted vendors.</div>
            ) : (
              blacklist.map((m) => (
                <div key={m.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-[#1F1E1D]">{m.merchantName}</span>
                    <span className="text-[10px] text-rose-700 block">{m.reason || 'Restricted vendor'}</span>
                  </div>
                  <button
                    onClick={() => handleDelete(m.id, 'BLACKLIST')}
                    className="p-1 rounded-md text-[#787670] hover:text-rose-600 hover:bg-rose-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-[#E5E3DA] shadow-2xl w-full max-w-md p-6 space-y-4 text-xs">
            <h3 className="font-bold text-sm text-[#1F1E1D]">
              {addType === 'WHITELIST' ? 'Add Whitelisted Merchant' : 'Add Blocked Vendor'}
            </h3>

            <form onSubmit={handleAdd} className="space-y-3">
              <div>
                <label className="block text-[#1F1E1D] font-medium mb-1">Merchant Name</label>
                <input
                  type="text"
                  required
                  value={merchantName}
                  onChange={(e) => setMerchantName(e.target.value)}
                  placeholder="e.g. OpenAI / Claude / Supabase"
                  className="w-full px-3 py-2 rounded-xl border border-[#E5E3DA] focus:border-[#CC5500] outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[#1F1E1D] font-medium mb-1">Domain (optional)</label>
                <input
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="e.g. openai.com"
                  className="w-full px-3 py-2 rounded-xl border border-[#E5E3DA] focus:border-[#CC5500] outline-hidden font-mono"
                />
              </div>

              {addType === 'WHITELIST' ? (
                <div>
                  <label className="block text-[#1F1E1D] font-medium mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E5E3DA] focus:border-[#CC5500] outline-hidden"
                  >
                    <option value="developer tools">Developer Tools</option>
                    <option value="cloud hosting">Cloud Hosting</option>
                    <option value="api credits">API Credits</option>
                    <option value="open-source tipping">Open-Source Tipping</option>
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-[#1F1E1D] font-medium mb-1">Block Reason</label>
                  <input
                    type="text"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g. Gambling / High-risk category"
                    className="w-full px-3 py-2 rounded-xl border border-[#E5E3DA] focus:border-[#CC5500] outline-hidden"
                  />
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-2 rounded-xl border border-[#E5E3DA] text-[#787670] hover:bg-[#F5F4EF]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-[#CC5500] hover:bg-[#B34700] text-white font-medium cursor-pointer"
                >
                  {isSubmitting ? 'Saving...' : 'Add Merchant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
