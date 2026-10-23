import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getBookingByUid } from '@/app/actions/booking.actions';
import {
  Check,
  Calendar,
  Clock,
  Globe,
  Video,
  User,
  ExternalLink,
  Download,
  ArrowRight,
  Mail,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/shared/logo';
import { db } from '@/lib/db';
import {
  getGoogleCalendarUrl,
  getOutlookCalendarUrl,
  getOffice365CalendarUrl,
} from '@/lib/calendar-export';

export default async function BookingConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ username: string; eventSlug: string }>;
  searchParams: Promise<{ uid?: string; bookingId?: string }>;
}) {
  const { username, eventSlug } = await params;
  const sParams = await searchParams;
  const token = sParams.uid || sParams.bookingId;

  if (!token) return notFound();

  let booking = await getBookingByUid(token);
  if (!booking) {
    booking = await db.booking.findUnique({
      where: { id: token },
      include: {
        eventType: true,
        host: {
          include: { profile: true },
        },
      },
    });
  }

  if (!booking) return notFound();

  const { eventType, host } = booking;

  const formattedDate = booking.startTime.toLocaleDateString('en-US', {
    timeZone: booking.guestTimeZone,
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const formattedStartTime = booking.startTime.toLocaleTimeString('en-US', {
    timeZone: booking.guestTimeZone,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const formattedEndTime = booking.endTime.toLocaleTimeString('en-US', {
    timeZone: booking.guestTimeZone,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const formattedTimeRange = `${formattedStartTime} - ${formattedEndTime}`;

  const meetingTitle = `${eventType.title} with ${host.name || 'Host'}`;

  const googleCalUrl = getGoogleCalendarUrl({
    title: meetingTitle,
    description: booking.guestNotes || eventType.description || '',
    location: booking.meetingUrl || '',
    startTime: booking.startTime,
    endTime: booking.endTime,
  });

  const outlookCalUrl = getOutlookCalendarUrl({
    title: meetingTitle,
    description: booking.guestNotes || eventType.description || '',
    location: booking.meetingUrl || '',
    startTime: booking.startTime,
    endTime: booking.endTime,
  });

  const officeCalUrl = getOffice365CalendarUrl({
    title: meetingTitle,
    description: booking.guestNotes || eventType.description || '',
    location: booking.meetingUrl || '',
    startTime: booking.startTime,
    endTime: booking.endTime,
  });

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto w-full">
        {/* Main Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl p-8 sm:p-12 text-center transition-all animate-fade-in">
          {/* Animated Success Check Circle */}
          <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border-2 border-emerald-500 text-emerald-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/20">
            <Check className="h-8 w-8 stroke-[3]" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
            You are scheduled!
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
            A calendar invitation has been sent to your email address (
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {booking.guestEmail}
            </span>
            ).
          </p>

          {/* Meeting Details Box */}
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 p-6 text-left space-y-4 mb-8">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200/60 dark:border-slate-700/60 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {eventType.title}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  with {host.name}
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
                {eventType.duration} min
              </span>
            </div>

            <div className="space-y-3 pt-1 text-sm font-semibold text-slate-700 dark:text-slate-200">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-brand-500 shrink-0" />
                <span>{formattedDate}</span>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-brand-500 shrink-0" />
                <span>
                  {formattedTimeRange} ({booking.guestTimeZone})
                </span>
              </div>

              {booking.meetingUrl && (
                <div className="flex items-center gap-3 pt-2">
                  <Video className="h-4 w-4 text-emerald-500 shrink-0" />
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-slate-500 text-xs">Web conferencing:</span>
                    <a
                      href={booking.meetingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-1 font-bold"
                    >
                      <span>Join Google Meet</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Add To Calendar Action Grid */}
          <div className="space-y-3 mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
              Add to your calendar
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <a
                href={googleCalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
              >
                <span>Google Calendar</span>
                <ExternalLink className="h-3 w-3 text-slate-400" />
              </a>

              <a
                href={outlookCalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
              >
                <span>Outlook</span>
                <ExternalLink className="h-3 w-3 text-slate-400" />
              </a>

              <a
                href={`/api/calendar/ics?uid=${booking.uid}`}
                download
                className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/40 transition-colors flex items-center justify-center gap-2"
              >
                <Download className="h-3 w-3" />
                <span>Download .ics</span>
              </a>
            </div>
          </div>

          {/* Schedule Another Meeting Link */}
          <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-center">
            <Link
              href={`/${username}`}
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
            >
              <span>Schedule another event with {host.name}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 flex flex-col items-center justify-center gap-1.5"><Logo size="sm" href="/" showBadge={false} /><span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">100% Free Smart Scheduling</span></footer>
    </div>
  );
}
