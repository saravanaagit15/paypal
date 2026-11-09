'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Bot,
  Sliders,
  Receipt,
  CheckSquare,
  Store,
  BarChart3,
  ScrollText,
  Plug,
  Settings,
  LogOut,
  Shield,
  Menu,
  X,
  AlertOctagon,
  Zap,
} from 'lucide-react';
import { NotificationDropdown } from '@/components/NotificationDropdown';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [emergencyFreeze, setEmergencyFreeze] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setUser(data.user);
          setEmergencyFreeze(Boolean(data.user.budget?.emergencyFreeze));
        } else {
          // If not logged in, fetch demo info for graceful exploration
          fetch('/api/ledger')
            .then((r) => r.json())
            .then((d) => {
              setUser({ fullName: 'Alex Vance (Demo)', email: 'demo@trustagent.ai' });
            });
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const navItems = [
    { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { label: 'AI Agent', href: '/dashboard/agent', icon: Bot },
    { label: 'Budgets & Policies', href: '/dashboard/budgets', icon: Sliders },
    { label: 'Transactions', href: '/dashboard/transactions', icon: Receipt },
    { label: 'Approvals', href: '/dashboard/approvals', icon: CheckSquare },
    { label: 'Merchants', href: '/dashboard/merchants', icon: Store },
    { label: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    { label: 'Audit Logs', href: '/dashboard/audit', icon: ScrollText },
    { label: 'Integrations', href: '/dashboard/integrations', icon: Plug },
    { label: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#FBFBF9] flex flex-col md:flex-row font-sans selection:bg-[#CC5500]/20 selection:text-[#CC5500]">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-[#E5E3DA] bg-white sticky top-0 z-30">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#CC5500] to-[#D97706] flex items-center justify-center text-white font-bold text-xs">
            TA
          </div>
          <span className="font-semibold text-sm">TrustAgent</span>
        </Link>
        <div className="flex items-center gap-2">
          <NotificationDropdown />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg text-[#787670] hover:bg-[#F5F4EF]"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 z-40 h-screen w-64 border-r border-[#E5E3DA] bg-[#F5F4EF]/90 backdrop-blur-md flex flex-col justify-between transition-transform duration-200 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Brand header */}
          <div className="p-5 border-b border-[#E5E3DA] flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#CC5500] to-[#D97706] flex items-center justify-center text-white font-bold shadow-xs">
                TA
              </div>
              <div>
                <span className="font-semibold text-sm text-[#1F1E1D] block">TrustAgent</span>
                <span className="text-[10px] text-[#787670] font-mono">PayPal AI Console</span>
              </div>
            </Link>
          </div>

          {/* Navigation items */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-white text-[#1F1E1D] shadow-xs font-semibold'
                      : 'text-[#787670] hover:text-[#1F1E1D] hover:bg-white/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#CC5500]' : 'text-[#787670]'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Profile & Logout */}
        <div className="p-3 border-t border-[#E5E3DA] bg-white/40 space-y-2">
          {emergencyFreeze && (
            <div className="px-2.5 py-1.5 rounded-lg bg-rose-100 text-rose-800 text-[10px] font-mono font-semibold flex items-center gap-1.5 animate-pulse">
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>SPEND FREEZE ACTIVE</span>
            </div>
          )}

          <div className="flex items-center justify-between px-2 py-1">
            <div className="truncate max-w-[140px]">
              <span className="font-semibold text-xs text-[#1F1E1D] block truncate">
                {user?.fullName || 'Alex Vance'}
              </span>
              <span className="text-[10px] text-[#787670] truncate block">
                {user?.email || 'demo@trustagent.ai'}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-[#787670] hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Desktop Topbar */}
        <header className="hidden md:flex items-center justify-between px-8 py-3.5 border-b border-[#E5E3DA] bg-white/60 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[#787670]">Active Mandate:</span>
            <span className="text-xs font-mono font-semibold text-[#1F1E1D] bg-[#F5F4EF] px-2.5 py-1 rounded-md border border-[#E5E3DA]">
              PayPal Sandbox • $25.00 Single Ceiling
            </span>
          </div>

          <div className="flex items-center gap-3">
            <NotificationDropdown />
            <Link
              href="/dashboard/agent"
              className="px-3 py-1.5 rounded-xl bg-[#CC5500] hover:bg-[#B34700] text-white text-xs font-medium shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>New AI Commerce Task</span>
            </Link>
          </div>
        </header>

        {/* Dashboard Child View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
