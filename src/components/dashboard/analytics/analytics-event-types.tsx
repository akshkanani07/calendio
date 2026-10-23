'use client';

import React from 'react';
import { Layers, Users, Clock, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

interface AnalyticsEventTypesProps {
  eventTypes: { id: string; title: string; color: string; count: number; hours: number; percentage: number }[];
  topAttendees: { name: string; email: string; count: number }[];
}

export function AnalyticsEventTypes({ eventTypes, topAttendees }: AnalyticsEventTypesProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Event Types Breakdown (2 cols) */}
      <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-brand-600" />
              Event Type Performance
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Breakdown of bookings and total hours spent across your active event types
            </p>
          </div>

          <Link
            href="/event-types"
            className="text-xs font-semibold text-brand-600 hover:underline flex items-center gap-1"
          >
            Manage Events
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {eventTypes.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No event types have been scheduled in this time period.
          </div>
        ) : (
          <div className="space-y-3 pt-2">
            {eventTypes.map((et) => (
              <div
                key={et.id}
                className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: et.color }}
                  />
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate block">
                      {et.title}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {et.hours} total hours spent
                    </span>
                  </div>
                </div>

                {/* Percentage Bar & Count */}
                <div className="flex items-center gap-4 shrink-0">
                  <div className="w-28 hidden sm:block">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium mb-1">
                      <span>Share</span>
                      <span>{et.percentage}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div
                        style={{ width: `${et.percentage}%`, backgroundColor: et.color }}
                        className="h-full rounded-full transition-all"
                      />
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200">
                    {et.count} booking{et.count === 1 ? '' : 's'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top Attendees (1 col) */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-brand-600" />
            Top Attendees
          </h3>

          <Link
            href="/contacts"
            className="text-xs font-semibold text-brand-600 hover:underline flex items-center gap-1"
          >
            View CRM
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {topAttendees.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No meeting attendees recorded yet.
          </div>
        ) : (
          <div className="space-y-3 pt-1">
            {topAttendees.map((att, idx) => (
              <div
                key={att.email}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-5 text-center text-xs font-bold text-slate-400">
                    #{idx + 1}
                  </span>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                      {att.name}
                    </span>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {att.email}
                    </span>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-200/60 shrink-0">
                  {att.count} meeting{att.count === 1 ? '' : 's'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
