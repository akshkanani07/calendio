'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Calendar,
  Clock,
  Video,
  ExternalLink,
  CalendarCheck,
  Sparkles,
  ArrowRight,
  Coffee,
} from 'lucide-react';
import { getInitials } from '@/lib/utils';

interface NextMeetingProps {
  nextBooking: any | null;
}

export function DashboardNextMeeting({ nextBooking }: NextMeetingProps) {
  if (!nextBooking) {
    return (
      <div className="p-6 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/40 text-center space-y-3">
        <div className="h-12 w-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-sm">
          <Coffee className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Your schedule is clear right now! ☕
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            No upcoming calls scheduled for today. Share your link or set up automations to drive more meetings.
          </p>
        </div>

        <div className="pt-2 flex items-center justify-center gap-2">
          <Link href="/availability">
            <Button variant="outline" size="sm" className="rounded-xl h-8 text-xs font-semibold">
              Adjust Working Hours
            </Button>
          </Link>
          <Link href="/bookings">
            <Button variant="ghost" size="sm" className="rounded-xl h-8 text-xs font-semibold text-brand-600">
              View Past Bookings &rarr;
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const startTime = new Date(nextBooking.startTime);
  const endTime = new Date(nextBooking.endTime);

  const formattedDate = startTime.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const formattedTime = `${startTime.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })} - ${endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

  return (
    <div className="p-6 rounded-2xl border border-brand-200/80 dark:border-brand-900/60 bg-gradient-to-br from-brand-50/50 via-white to-indigo-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-brand-950/30 shadow-sm space-y-4">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-brand-700 dark:text-brand-300">
            Next Up On Your Calendar
          </h3>
        </div>

        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-300">
          Confirmed
        </span>
      </div>

      {/* Guest & Event Details */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <Avatar className="h-12 w-12 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <AvatarFallback className="bg-brand-600 text-white font-extrabold text-sm">
              {getInitials(nextBooking.guestName)}
            </AvatarFallback>
          </Avatar>

          <div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
              {nextBooking.guestName}
            </h4>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              <span
                className="w-2 h-2 rounded-full inline-block"
                style={{ backgroundColor: nextBooking.eventType?.color || '#0069FF' }}
              />
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {nextBooking.eventType?.title || 'Meeting'}
              </span>
              <span>&bull;</span>
              <span>{nextBooking.guestEmail}</span>
            </div>
          </div>
        </div>

        {/* Join Button */}
        {nextBooking.meetingUrl && (
          <a
            href={nextBooking.meetingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="self-start sm:self-auto"
          >
            <Button className="h-9 px-4 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/20">
              <Video className="w-3.5 h-3.5 mr-1.5" />
              Join Video Room
              <ExternalLink className="w-3 h-3 ml-1 opacity-70" />
            </Button>
          </a>
        )}
      </div>

      {/* Time & Location Bar */}
      <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
        <span className="flex items-center gap-1.5 font-medium">
          <Calendar className="w-3.5 h-3.5 text-brand-600" />
          {formattedDate}
        </span>

        <span className="flex items-center gap-1.5 font-medium">
          <Clock className="w-3.5 h-3.5 text-brand-600" />
          {formattedTime} ({nextBooking.guestTimeZone || 'UTC'})
        </span>
      </div>

      {nextBooking.guestNotes && (
        <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300">
          <span className="font-bold text-slate-500 mr-1.5">Submitted Note:</span>
          {nextBooking.guestNotes}
        </div>
      )}
    </div>
  );
}
