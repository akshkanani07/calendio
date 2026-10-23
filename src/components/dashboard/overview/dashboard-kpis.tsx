'use client';

import React from 'react';
import Link from 'next/link';
import {
  Calendar,
  CalendarCheck,
  Users,
  Workflow,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';

interface DashboardKpisProps {
  eventTypesCount: number;
  upcomingCount: number;
  contactsCount: number;
  workflowsCount: number;
}

export function DashboardKpis({
  eventTypesCount,
  upcomingCount,
  contactsCount,
  workflowsCount,
}: DashboardKpisProps) {
  const cards = [
    {
      title: 'Active Event Types',
      value: eventTypesCount,
      sub: `${eventTypesCount} link${eventTypesCount === 1 ? '' : 's'} ready to book`,
      href: '/event-types',
      icon: Calendar,
      color: 'text-brand-600 dark:text-brand-400',
      bg: 'bg-brand-50 dark:bg-brand-950/60',
      border: 'hover:border-brand-500/40',
    },
    {
      title: 'Upcoming Meetings',
      value: upcomingCount,
      sub: `${upcomingCount} confirmed call${upcomingCount === 1 ? '' : 's'}`,
      href: '/bookings',
      icon: CalendarCheck,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/60',
      border: 'hover:border-emerald-500/40',
    },
    {
      title: 'Contacts in CRM',
      value: contactsCount,
      sub: 'Attendee history & notes',
      href: '/contacts',
      icon: Users,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-950/60',
      border: 'hover:border-purple-500/40',
    },
    {
      title: 'Active Workflows',
      value: workflowsCount,
      sub: 'Automated email triggers',
      href: '/automations',
      icon: Workflow,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/60',
      border: 'hover:border-amber-500/40',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <Link
            key={c.title}
            href={c.href}
            className={`group p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm transition-all duration-200 hover:shadow-md ${c.border}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {c.title}
              </span>
              <div
                className={`h-9 w-9 rounded-xl ${c.bg} ${c.color} flex items-center justify-center transition-transform group-hover:scale-110`}
              >
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {c.value}
              </span>

              <ArrowUpRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-brand-500 transition-colors" />
            </div>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
              {c.sub}
            </p>
          </Link>
        );
      })}
    </div>
  );
}
