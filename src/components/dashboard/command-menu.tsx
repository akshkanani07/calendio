'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  Clock,
  Layers,
  CalendarCheck2,
  Users2,
  Workflow,
  Contact,
  BarChart3,
  Settings,
  Plus,
  Search,
  LayoutDashboard,
  ExternalLink,
  GitFork,
  CalendarDays,
  Sparkles,
  ArrowRight,
  Loader2,
  Copy,
  Check,
} from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { searchGlobalEntities, GlobalSearchResult } from '@/app/actions/search.actions';

interface CommandMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  username?: string;
}

export function CommandMenu({ open, onOpenChange, username = 'user' }: CommandMenuProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [entityResults, setEntityResults] = useState<GlobalSearchResult[]>([]);
  const [isSearching, startTransition] = useTransition();
  const [copiedLink, setCopiedLink] = useState(false);

  // Global Keyboard Shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA')) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, onOpenChange]);

  // Static Navigation Items
  const navItems = [
    { label: 'Dashboard Overview', href: '/dashboard', icon: LayoutDashboard, category: 'Pages' },
    { label: 'Event Types & Links', href: '/event-types', icon: Layers, category: 'Pages' },
    { label: 'Scheduled Events & Bookings', href: '/bookings', icon: CalendarCheck2, category: 'Pages' },
    { label: 'Availability & Working Hours', href: '/availability', icon: Clock, category: 'Pages' },
    { label: 'Teams & Round-Robin', href: '/teams', icon: Users2, category: 'Pages' },
    { label: 'Contacts CRM & Notes', href: '/contacts', icon: Contact, category: 'Pages' },
    { label: 'Routing Forms & Qualification', href: '/routing', icon: GitFork, category: 'Pages' },
    { label: 'Automations & Workflows', href: '/automations', icon: Workflow, category: 'Pages' },
    { label: 'Calendar Connections & Sync', href: '/calendar', icon: CalendarDays, category: 'Pages' },
    { label: 'Performance Analytics', href: '/analytics', icon: BarChart3, category: 'Pages' },
    { label: 'Account & Branding Settings', href: '/settings', icon: Settings, category: 'Pages' },
  ];

  // Quick Action Shortcuts
  const quickActions = [
    { label: 'Create New Event Type', href: '/event-types', icon: Plus, actionType: 'navigate' },
    { label: 'Add New Contact to CRM', href: '/contacts', icon: Contact, actionType: 'navigate' },
    { label: 'Browse Workflow Templates', href: '/automations', icon: Workflow, actionType: 'navigate' },
    {
      label: 'Open Public Booking Page',
      href: `/${username}`,
      icon: ExternalLink,
      actionType: 'external',
    },
  ];

  // Dynamic search debouncing
  useEffect(() => {
    if (!search.trim() || search.trim().length < 2) {
      setEntityResults([]);
      return;
    }

    const timer = setTimeout(() => {
      startTransition(async () => {
        const results = await searchGlobalEntities(search);
        setEntityResults(results);
      });
    }, 200);

    return () => clearTimeout(timer);
  }, [search]);

  const filteredNav = navItems.filter((item) =>
    item.label.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (href: string, isExternal = false) => {
    onOpenChange(false);
    setSearch('');
    if (isExternal) {
      window.open(href, '_blank');
    } else {
      router.push(href);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-xl overflow-hidden rounded-2xl shadow-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-slate-800 gap-3">
          <Search className="h-5 w-5 text-slate-400 shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search pages, events, bookings, contacts..."
            className="w-full bg-transparent text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
            autoFocus
          />
          {isSearching && <Loader2 className="w-4 h-4 animate-spin text-brand-500 shrink-0" />}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto p-2 space-y-3">
          {/* 1. Dynamic Entities Results (if searched) */}
          {entityResults.length > 0 && (
            <div className="space-y-1">
              <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Matching Items ({entityResults.length})
              </span>
              {entityResults.map((res) => (
                <button
                  key={res.id}
                  onClick={() => handleSelect(res.href)}
                  className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-slate-800/80 transition-colors group text-left"
                >
                  <div className="min-w-0 pr-2">
                    <span className="font-bold text-slate-900 dark:text-white block truncate">
                      {res.title}
                    </span>
                    <span className="text-[11px] text-slate-400 block truncate">
                      {res.subtitle}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0">
                    {res.category}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* 2. Navigation Pages */}
          {filteredNav.length > 0 && (
            <div className="space-y-1">
              <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Navigation
              </span>
              {filteredNav.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelect(item.href)}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-slate-800/80 transition-colors group text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-7 w-7 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-brand-500 group-hover:text-white flex items-center justify-center transition-colors">
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <span>{item.label}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                );
              })}
            </div>
          )}

          {/* 3. Quick Actions (shown when not deeply searching) */}
          {!search && (
            <div className="space-y-1 pt-1 border-t border-slate-100 dark:border-slate-800/60">
              <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Quick Actions
              </span>
              {quickActions.map((qa, idx) => {
                const Icon = qa.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelect(qa.href, qa.actionType === 'external')}
                    className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="h-3.5 w-3.5 text-brand-500" />
                      <span>{qa.label}</span>
                    </div>
                    {qa.actionType === 'external' && <ExternalLink className="w-3 h-3 text-slate-400" />}
                  </button>
                );
              })}
            </div>
          )}

          {filteredNav.length === 0 && entityResults.length === 0 && (
            <div className="py-8 text-center text-xs text-slate-400">
              No results found for &ldquo;{search}&rdquo;
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-2.5 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 px-4">
          <span>Search any page, event, contact or booking</span>
          <div className="flex items-center gap-2 font-mono">
            <span>&uarr;&darr; Navigate</span>
            <span>&bull;</span>
            <span>&crarr; Select</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
