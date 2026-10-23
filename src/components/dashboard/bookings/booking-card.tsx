'use client';

import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Video,
  User,
  Mail,
  MoreVertical,
  ExternalLink,
  RotateCcw,
  XCircle,
  FileText,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';

interface BookingCardProps {
  booking: any;
  onCancel: (booking: any) => void;
  onReschedule: (booking: any) => void;
}

export function BookingCard({ booking, onCancel, onReschedule }: BookingCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const startDate = new Date(booking.startTime);
  const endDate = new Date(booking.endTime);

  const monthShort = startDate.toLocaleDateString('en-US', { month: 'short' });
  const dayNumber = startDate.toLocaleDateString('en-US', { day: 'numeric' });
  const weekdayShort = startDate.toLocaleDateString('en-US', { weekday: 'short' });

  const timeFormatted = `${startDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })} - ${endDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })}`;

  const isCancelled = booking.status === 'CANCELLED';
  const isRescheduled = booking.status === 'RESCHEDULED';
  const isPast = new Date(booking.startTime) < new Date();

  const color = booking.eventType?.color || '#0069FF';

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-slate-800">
      {/* Date Pill Left Column */}
      <div className="p-5 sm:w-44 flex sm:flex-col items-center justify-between sm:justify-center text-center bg-slate-50/50 dark:bg-slate-900/40">
        <div className="text-left sm:text-center">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            {weekdayShort}
          </span>
          <span className="text-2xl font-black text-slate-900 dark:text-white block leading-tight">
            {dayNumber} {monthShort}
          </span>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mt-0.5">
            {startDate.getFullYear()}
          </span>
        </div>

        <div className="mt-0 sm:mt-3">
          <Badge
            variant="outline"
            className="text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1"
          >
            <Clock className="h-3 w-3" />
            <span>{booking.eventType?.duration || 30}m</span>
          </Badge>
        </div>
      </div>

      {/* Middle Content Column */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Header row: Event Title + Status Badge */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: color }}
              />
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                {booking.eventType?.title || 'Meeting'}
              </h3>
            </div>

            {/* Status Badges */}
            {isCancelled && (
              <Badge className="bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400 border-rose-200 dark:border-rose-900 text-[10px] font-bold">
                ✕ Cancelled
              </Badge>
            )}
            {!isCancelled && isRescheduled && (
              <Badge className="bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400 border-amber-200 dark:border-amber-900 text-[10px] font-bold">
                ↻ Rescheduled
              </Badge>
            )}
            {!isCancelled && !isRescheduled && !isPast && (
              <Badge className="bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900 text-[10px] font-bold">
                ✓ Confirmed
              </Badge>
            )}
            {!isCancelled && isPast && (
              <Badge className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 text-[10px] font-bold">
                Past
              </Badge>
            )}
          </div>

          {/* Time range */}
          <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 mb-3">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            <span>{timeFormatted}</span>
            <span className="text-slate-400 font-normal">({booking.guestTimeZone})</span>
          </div>

          {/* Attendee Info */}
          <div className="flex items-center gap-3 pt-1">
            <Avatar className="h-8 w-8 rounded-full border border-slate-200 dark:border-slate-700">
              <AvatarFallback className="bg-brand-500 text-white font-bold text-xs">
                {getInitials(booking.guestName || 'Guest')}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {booking.guestName}
              </span>
              <span className="text-[11px] text-slate-400 truncate flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {booking.guestEmail}
              </span>
            </div>
          </div>

          {/* Cancellation reason callout */}
          {isCancelled && booking.cancelReason && (
            <div className="mt-3 p-2.5 rounded-xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-900/40 text-xs text-rose-700 dark:text-rose-300">
              <span className="font-bold">Cancellation Reason: </span>
              <span>{booking.cancelReason}</span>
            </div>
          )}

          {/* Optional Expandable Answers/Notes */}
          {showDetails && (
            <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs space-y-2 animate-fade-in">
              {booking.guestNotes && (
                <div>
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    Notes / Preparation:
                  </span>
                  <p className="text-slate-600 dark:text-slate-400 mt-0.5 whitespace-pre-wrap">
                    {booking.guestNotes}
                  </p>
                </div>
              )}

              {booking.customResponses &&
                Object.keys(booking.customResponses).length > 0 && (
                  <div>
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      Custom Answers:
                    </span>
                    <div className="mt-1 space-y-1">
                      {Object.entries(booking.customResponses).map(([key, val]: any) => (
                        <div key={key} className="text-slate-600 dark:text-slate-400">
                          <span className="font-medium text-slate-500">{key}:</span> {String(val)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          )}
        </div>

        {/* Footer Actions Row */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            {booking.meetingUrl && !isCancelled && (
              <a
                href={booking.meetingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                <Video className="h-3.5 w-3.5" />
                <span>Join Google Meet</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            )}

            {(booking.guestNotes || booking.customResponses) && (
              <button
                type="button"
                onClick={() => setShowDetails(!showDetails)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-semibold flex items-center gap-1"
              >
                <span>{showDetails ? 'Hide Details' : 'View Details'}</span>
                {showDetails ? (
                  <ChevronUp className="h-3.5 w-3.5" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5" />
                )}
              </button>
            )}
          </div>

          {/* Action buttons (only for upcoming non-cancelled) */}
          {!isCancelled && !isPast && (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onReschedule(booking)}
                className="h-8 px-3 rounded-lg text-xs font-semibold"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                <span>Reschedule</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onCancel(booking)}
                className="h-8 px-3 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border-rose-200 dark:border-rose-900"
              >
                <XCircle className="h-3 w-3 mr-1" />
                <span>Cancel</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
