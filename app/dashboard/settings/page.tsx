'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Lock, Trash2, Check, AlertCircle } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setFullName(data.user.fullName || '');
          setEmail(data.user.email || '');
        }
      })
      .catch(() => {});
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMsg(null);

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      setStatusMsg({ type: 'success', text: 'Profile updated successfully.' });
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Error updating settings.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to permanently delete your TrustAgent account and all records? This action cannot be undone.')) {
      return;
    }

    try {
      const res = await fetch('/api/auth/profile', { method: 'DELETE' });
      if (res.ok) {
        router.push('/login');
      }
    } catch (e) {
      alert('Failed to delete account.');
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="pb-3 border-b border-[#E5E3DA]">
        <h2 className="text-xl font-bold text-[#1F1E1D]">User Profile &amp; Security Settings</h2>
        <p className="text-xs text-[#787670] mt-0.5">
          Manage your personal credentials, connected authentication session, and account data.
        </p>
      </div>

      {statusMsg && (
        <div
          className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
            statusMsg.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          {statusMsg.type === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      <form onSubmit={handleUpdate} className="space-y-5 text-xs">
        <div className="p-6 rounded-2xl border border-[#E5E3DA] bg-white shadow-2xs space-y-4">
          <h3 className="text-sm font-semibold text-[#1F1E1D]">Personal Information</h3>

          <div>
            <label className="block text-[#1F1E1D] font-medium mb-1">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#E5E3DA] focus:border-[#CC5500] outline-hidden text-xs"
            />
          </div>

          <div>
            <label className="block text-[#1F1E1D] font-medium mb-1">Email Address</label>
            <input
              type="email"
              disabled
              value={email}
              className="w-full px-3 py-2 rounded-xl border border-[#E5E3DA] bg-[#F5F4EF] text-[#787670] outline-hidden text-xs cursor-not-allowed"
            />
            <span className="text-[10px] text-[#787670] mt-1 block">
              Email is tied to your PayPal Sandbox testing identity.
            </span>
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-[#E5E3DA] bg-white shadow-2xs space-y-4">
          <h3 className="text-sm font-semibold text-[#1F1E1D]">Change Password</h3>

          <div>
            <label className="block text-[#1F1E1D] font-medium mb-1">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 rounded-xl border border-[#E5E3DA] focus:border-[#CC5500] outline-hidden text-xs"
            />
          </div>

          <div>
            <label className="block text-[#1F1E1D] font-medium mb-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              className="w-full px-3 py-2 rounded-xl border border-[#E5E3DA] focus:border-[#CC5500] outline-hidden text-xs"
            />
          </div>
        </div>

        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2.5 rounded-xl bg-[#CC5500] hover:bg-[#B34700] text-white font-medium text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {isSaving ? 'Updating...' : 'Save Settings'}
          </button>
        </div>
      </form>

      {/* Danger Zone */}
      <div className="p-6 rounded-2xl border border-rose-200 bg-rose-50/30 shadow-2xs space-y-3">
        <div className="flex items-center gap-2 text-rose-800 font-semibold text-xs">
          <Trash2 className="w-4 h-4 text-rose-600" />
          <span>Danger Zone: Account Deletion</span>
        </div>
        <p className="text-xs text-rose-900 leading-relaxed">
          Permanently delete your account, session keys, and database records. This cannot be undone.
        </p>
        <button
          onClick={handleDeleteAccount}
          className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs shadow-xs transition-colors cursor-pointer"
        >
          Delete Account Permanently
        </button>
      </div>
    </div>
  );
}

