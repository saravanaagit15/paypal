'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Check, ShieldAlert, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications', { method: 'POST' });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (e) {}
  };

  return (
    <div className="relative">
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen && unreadCount > 0) markAllRead();
        }}
        className="relative p-2 rounded-xl text-[#787670] hover:text-[#1F1E1D] hover:bg-[#F5F4EF] transition-colors"
        title="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#CC5500] ring-2 ring-white animate-pulse" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-[#E5E3DA] shadow-2xl z-50 overflow-hidden text-xs">
          <div className="p-3.5 border-b border-[#E5E3DA] bg-[#FBFBF9] flex items-center justify-between">
            <span className="font-semibold text-[#1F1E1D]">Notification Center</span>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-[11px] text-[#CC5500] hover:underline flex items-center gap-1"
              >
                <Check className="w-3 h-3" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto divide-y divide-[#E5E3DA]/60">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-[#787670]">No notifications yet.</div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3 hover:bg-[#F5F4EF]/70 transition-colors flex items-start gap-2.5 ${
                    !n.read ? 'bg-amber-50/40' : ''
                  }`}
                >
                  <div className="mt-0.5">
                    {n.type === 'APPROVAL_REQUIRED' ? (
                      <ShieldAlert className="w-4 h-4 text-amber-600" />
                    ) : n.type === 'TX_COMPLETED' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-[#CC5500]" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-[#1F1E1D] flex items-center justify-between">
                      <span>{n.title}</span>
                      <span className="text-[10px] text-[#787670] font-mono">
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[#55534E] text-[11px] mt-0.5">{n.message}</p>
                    {n.link && (
                      <Link
                        href={n.link}
                        onClick={() => setIsOpen(false)}
                        className="inline-flex items-center gap-1 text-[11px] text-[#CC5500] hover:underline mt-1 font-medium"
                      >
                        <span>View</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </Link>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

