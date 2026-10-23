'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Link2,
  CalendarCheck,
  Menu,
  Plus,
  ExternalLink,
  Copy,
  Check,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileBottomNavProps {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    username?: string | null;
  };
  onOpenDrawer: () => void;
  onOpenCommandMenu?: () => void;
}

export function MobileBottomNav({
  user,
  onOpenDrawer,
  onOpenCommandMenu,
}: MobileBottomNavProps) {
  const pathname = usePathname();
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyBookingLink = (e: React.MouseEvent) => {
    e.preventDefault();
    const username = user.username || 'me';
    const url = `${window.location.origin}/${username}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setIsQuickActionsOpen(false);
    }, 1500);
  };

  const navItems = [
    {
      label: 'Home',
      href: '/dashboard',
      icon: LayoutDashboard,
      isActive: pathname === '/dashboard',
    },
    {
      label: 'Events',
      href: '/event-types',
      icon: Link2,
      isActive: pathname.startsWith('/event-types'),
    },
    // Center button is handled separately
    {
      label: 'Bookings',
      href: '/bookings',
      icon: CalendarCheck,
      isActive: pathname.startsWith('/bookings'),
    },
    {
      label: 'Menu',
      href: '#menu',
      icon: Menu,
      isActive: false,
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        onOpenDrawer();
      },
    },
  ];

  return (
    <>
      {/* 1. Quick Actions Popup Sheet for Mobile */}
      {isQuickActionsOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
            onClick={() => setIsQuickActionsOpen(false)}
          />

          {/* Action Sheet Panel */}
          <div className="relative bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 rounded-t-3xl p-5 shadow-2xl z-10 animate-in slide-in-from-bottom duration-250">
            {/* Sheet Handle */}
            <div className="w-10 h-1 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-4" />

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center">
                  <Sparkles className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Quick Actions
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsQuickActionsOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {/* 1. New Event Type */}
              <Link
                href="/event-types"
                onClick={() => setIsQuickActionsOpen(false)}
                className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-gradient-to-br from-brand-50 to-indigo-50/50 dark:from-brand-950/40 dark:to-indigo-950/20 border border-brand-200/50 dark:border-brand-800/40 text-brand-700 dark:text-brand-300 active:scale-95 transition-all text-center"
              >
                <div className="h-9 w-9 rounded-xl bg-brand-600 text-white flex items-center justify-center mb-2 shadow-sm shadow-brand-500/20">
                  <Plus className="h-4 w-4 stroke-[3]" />
                </div>
                <span className="text-xs font-bold leading-tight">New Event</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                  15m, 30m, 60m call
                </span>
              </Link>

              {/* 2. Copy Booking Link */}
              <button
                type="button"
                onClick={copyBookingLink}
                className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-200 active:scale-95 transition-all text-center"
              >
                <div className={cn(
                  'h-9 w-9 rounded-xl flex items-center justify-center mb-2 shadow-sm transition-colors',
                  copied ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                )}>
                  {copied ? <Check className="h-4 w-4 stroke-[3]" /> : <Copy className="h-4 w-4" />}
                </div>
                <span className="text-xs font-bold leading-tight">
                  {copied ? 'Link Copied!' : 'Copy Link'}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Share your calendar
                </span>
              </button>

              {/* 3. View Public Page */}
              <Link
                href={`/${user.username || 'me'}`}
                target="_blank"
                onClick={() => setIsQuickActionsOpen(false)}
                className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 active:scale-95 transition-all col-span-2"
              >
                <div className="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                  <ExternalLink className="h-4 w-4" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-bold text-slate-900 dark:text-white">View Public Page</p>
                  <p className="text-[10px] text-slate-400 truncate">calendio-puce.vercel.app/{user.username || 'you'}</p>
                </div>
              </Link>

              {/* 4. Global Search Trigger */}
              {onOpenCommandMenu && (
                <button
                  type="button"
                  onClick={() => {
                    setIsQuickActionsOpen(false);
                    onOpenCommandMenu();
                  }}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 active:scale-95 transition-all col-span-2"
                >
                  <div className="h-8 w-8 rounded-lg bg-brand-500/10 text-brand-500 flex items-center justify-center shrink-0">
                    <Search className="h-4 w-4" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-bold text-slate-900 dark:text-white">Search Everything</p>
                    <p className="text-[10px] text-slate-400">Search events, bookings, contacts</p>
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. Floating Bottom Dock */}
      <nav
        aria-label="Mobile Navigation Dock"
        className="fixed bottom-3 inset-x-3 z-40 lg:hidden max-w-md mx-auto"
      >
        <div className="relative backdrop-blur-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 shadow-[0_8px_32px_rgba(0,0,0,0.12)] rounded-3xl p-1.5 flex items-center justify-between transition-all">
          {/* Tab 1: Home */}
          <Link
            href="/dashboard"
            className={cn(
              'flex-1 flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl transition-all active:scale-90',
              pathname === '/dashboard'
                ? 'text-brand-600 dark:text-brand-400 font-bold bg-brand-50/70 dark:bg-brand-950/50'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            )}
          >
            <LayoutDashboard className="h-5 w-5 mb-0.5" />
            <span className="text-[10px] font-medium tracking-tight">Home</span>
          </Link>

          {/* Tab 2: Event Types */}
          <Link
            href="/event-types"
            className={cn(
              'flex-1 flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl transition-all active:scale-90',
              pathname.startsWith('/event-types')
                ? 'text-brand-600 dark:text-brand-400 font-bold bg-brand-50/70 dark:bg-brand-950/50'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            )}
          >
            <Link2 className="h-5 w-5 mb-0.5" />
            <span className="text-[10px] font-medium tracking-tight">Events</span>
          </Link>

          {/* Center Elevated Action Button */}
          <div className="relative -top-3.5 px-1">
            <button
              type="button"
              onClick={() => setIsQuickActionsOpen(true)}
              className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white shadow-lg shadow-brand-500/35 border-2 border-white dark:border-slate-900 flex items-center justify-center active:scale-90 transition-all hover:scale-105"
              aria-label="Open quick actions"
            >
              <Plus className="h-5 w-5 stroke-[2.5]" />
            </button>
          </div>

          {/* Tab 3: Bookings */}
          <Link
            href="/bookings"
            className={cn(
              'flex-1 flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl transition-all active:scale-90',
              pathname.startsWith('/bookings')
                ? 'text-brand-600 dark:text-brand-400 font-bold bg-brand-50/70 dark:bg-brand-950/50'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            )}
          >
            <CalendarCheck className="h-5 w-5 mb-0.5" />
            <span className="text-[10px] font-medium tracking-tight">Bookings</span>
          </Link>

          {/* Tab 4: More / Menu */}
          <button
            type="button"
            onClick={onOpenDrawer}
            className="flex-1 flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all active:scale-90"
            aria-label="Open menu drawer"
          >
            <Menu className="h-5 w-5 mb-0.5" />
            <span className="text-[10px] font-medium tracking-tight">Menu</span>
          </button>
        </div>
      </nav>
    </>
  );
}
