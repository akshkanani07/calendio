'use client';

import React from 'react';
import Link from 'next/link';
import {
  Workflow,
  Users,
  Clock,
  BarChart3,
  CalendarDays,
  GitFork,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export function DashboardQuickActions() {
  const tools = [
    {
      title: 'Automated Workflows',
      desc: 'Set up 24h & 1h email reminders to reduce no-shows.',
      href: '/automations',
      icon: Workflow,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/50',
    },
    {
      title: 'Contacts CRM & Notes',
      desc: 'View attendee history, meeting minutes, and notes.',
      href: '/contacts',
      icon: Users,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-950/50',
    },
    {
      title: 'Availability & Buffers',
      desc: 'Set your Mon-Sun working hours and padding buffers.',
      href: '/availability',
      icon: Clock,
      color: 'text-brand-600 dark:text-brand-400',
      bg: 'bg-brand-50 dark:bg-brand-950/50',
    },
    {
      title: 'Performance Analytics',
      desc: 'Track meeting volume, peak days, and popularity.',
      href: '/analytics',
      icon: BarChart3,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/50',
    },
  ];

  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-600" />
            Scheduling Power Tools
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Optimize your booking pipeline and automate client communications.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {tools.map((t) => {
          const Icon = t.icon;
          return (
            <Link
              key={t.title}
              href={t.href}
              className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-brand-500/40 hover:shadow-md transition-all flex flex-col justify-between space-y-3 group"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`h-9 w-9 rounded-xl ${t.bg} ${t.color} flex items-center justify-center shrink-0`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-brand-600 transition-colors">
                  {t.title}
                </h3>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                {t.desc}
              </p>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center text-xs font-semibold text-brand-600">
                <span>Configure &rarr;</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
