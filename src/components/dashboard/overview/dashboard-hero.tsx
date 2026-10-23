'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Plus,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Globe,
  Share2,
  Calendar,
  CheckCircle2,
  Zap,
} from 'lucide-react';

interface DashboardHeroProps {
  userName: string;
  username: string;
}

export function DashboardHero({ userName, username }: DashboardHeroProps) {
  const [greeting, setGreeting] = useState('Welcome back');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  const publicUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/${username}`
    : `/${username}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-gradient-to-br from-white via-slate-50/50 to-brand-50/30 dark:from-slate-900 dark:via-slate-900/90 dark:to-brand-950/20 p-6 sm:p-8 shadow-sm">
      {/* Subtle decorative background glow */}
      <div className="absolute -right-16 -top-16 w-64 h-64 bg-brand-500/10 dark:bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left Side: Greeting & Status */}
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Calendar Synced & Active
            </span>
            <span className="text-xs text-slate-400 hidden sm:inline">&bull;</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">
              100% Free Smart Scheduling
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
            {greeting}, {userName}! 👋
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Here is your scheduling overview. Your calendar is actively monitored for conflicts so invitees never double-book you.
          </p>

          {/* Quick Booking Link Capsule */}
          <div className="pt-2 flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm max-w-md">
              <Globe className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400 shrink-0" />
              <span className="text-xs font-mono font-medium text-slate-700 dark:text-slate-200 truncate select-all">
                calendio.com/{username}
              </span>
              <button
                type="button"
                onClick={handleCopyLink}
                className="p-1 rounded-md text-slate-400 hover:text-brand-600 transition-colors ml-auto"
                title={copied ? 'Copied to clipboard' : 'Copy link'}
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            <a
              href={`/${username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-brand-600 hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all"
            >
              Preview Page
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Right Side: Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-center shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={handleCopyLink}
            className="h-10 px-4 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 shadow-sm"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-1.5 text-emerald-600" />
                Link Copied!
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 mr-1.5 text-slate-500" />
                Share Booking Page
              </>
            )}
          </Button>

          <Link href="/event-types">
            <Button
              className="h-10 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white shadow-md shadow-brand-500/20"
            >
              <Plus className="w-4 h-4 mr-1.5 stroke-[3]" />
              New Event Type
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
