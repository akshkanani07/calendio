'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Calendar, Clock, Video, ArrowRight, ExternalLink, CalendarCheck } from 'lucide-react';
import { getInitials } from '@/lib/utils';

interface UpcomingTimelineProps {
  bookings: any[];
}

export function DashboardUpcomingTimeline({ bookings }: UpcomingTimelineProps) {
  return (
    <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <CalendarCheck className="w-4 h-4 text-brand-600" />
          Upcoming Schedule ({bookings.length})
        </h3>

        <Link
          href="/bookings"
          className="text-xs font-semibold text-brand-600 hover:underline flex items-center gap-1"
        >
          View all
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {bookings.length === 0 ? (
        <div className="py-8 text-center text-slate-400 space-y-1 text-xs">
          <p className="font-semibold text-slate-600 dark:text-slate-300">
            No upcoming calls scheduled
          </p>
          <p className="text-[11px] text-slate-400">
            Share your link with colleagues or clients to book time.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => {
            const start = new Date(b.startTime);
            const dateStr = start.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            });
            const timeStr = start.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={b.id}
                className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="h-9 w-9 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
                    <AvatarFallback className="bg-brand-600 text-white font-bold text-xs">
                      {getInitials(b.guestName)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {b.guestName}
                      </span>
                      <span
                        className="w-2 h-2 rounded-full inline-block shrink-0"
                        style={{ backgroundColor: b.eventType?.color || '#0069FF' }}
                      />
                    </div>
                    <span className="text-[11px] text-slate-400 truncate block">
                      {dateStr} &bull; {timeStr}
                    </span>
                  </div>
                </div>

                {b.meetingUrl ? (
                  <a href={b.meetingUrl} target="_blank" rel="noopener noreferrer">
                    <Button
                      size="sm"
                      className="h-8 px-3 rounded-lg text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shrink-0 shadow-sm"
                    >
                      <Video className="w-3.5 h-3.5 mr-1" />
                      Join
                    </Button>
                  </a>
                ) : (
                  <span className="text-[11px] text-slate-400 font-medium shrink-0">
                    Confirmed
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
