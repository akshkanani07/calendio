'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Check,
  Calendar,
  Clock,
  Video,
  ExternalLink,
  Download,
  ArrowRight,
  Copy,
  CheckCheck,
  Phone,
  MapPin,
  ShieldCheck,
  Layers,
  Sparkles,
  KeyRound,
  Hash,
  Share2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Logo } from '@/components/shared/logo';
import { getProviderMeta } from '@/lib/meeting-providers';

interface ConfirmationViewProps {
  username: string;
  booking: {
    id: string;
    uid: string;
    guestName: string;
    guestEmail: string;
    guestNotes?: string | null;
    guestTimeZone: string;
    startTime: string; // ISO
    endTime: string;   // ISO
    meetingUrl?: string | null;
    locationType?: string | null;
    locationDetails?: any;
    eventType: {
      title: string;
      slug: string;
      description?: string | null;
      duration: number;
      color?: string | null;
      locationType?: string;
    };
    host: {
      name?: string | null;
      email: string;
      image?: string | null;
      profile?: {
        username: string;
        avatarUrl?: string | null;
        brandColor?: string | null;
      } | null;
    };
  };
  googleCalUrl: string;
  outlookCalUrl: string;
  officeCalUrl: string;
}

export function ConfirmationView({
  username,
  booking,
  googleCalUrl,
  outlookCalUrl,
  officeCalUrl,
}: ConfirmationViewProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedPasscode, setCopiedPasscode] = useState(false);

  const { eventType, host } = booking;
  const startDate = new Date(booking.startTime);
  const endDate = new Date(booking.endTime);

  const formattedDate = startDate.toLocaleDateString('en-US', {
    timeZone: booking.guestTimeZone,
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const formattedStartTime = startDate.toLocaleTimeString('en-US', {
    timeZone: booking.guestTimeZone,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const formattedEndTime = endDate.toLocaleTimeString('en-US', {
    timeZone: booking.guestTimeZone,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const formattedTimeRange = `${formattedStartTime} – ${formattedEndTime}`;

  const locType = booking.locationType || eventType.locationType || 'GOOGLE_MEET';
  const provider = getProviderMeta(locType);
  const details = booking.locationDetails || {};

  const handleCopy = (text: string, type: 'link' | 'id' | 'passcode') => {
    navigator.clipboard.writeText(text);
    if (type === 'link') {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2200);
    } else if (type === 'id') {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2200);
    } else {
      setCopiedPasscode(true);
      setTimeout(() => setCopiedPasscode(false), 2200);
    }
  };

  const getProviderIcon = () => {
    switch (provider.category) {
      case 'phone':
        return <Phone className="h-5 w-5 text-emerald-500" />;
      case 'in_person':
        return <MapPin className="h-5 w-5 text-orange-500" />;
      default:
        return <Video className="h-5 w-5 text-brand-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto w-full">
        {/* Main Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xl p-6 sm:p-10 text-center transition-all animate-fade-in relative overflow-hidden">
          {/* Subtle Top Glow */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-brand-500 via-indigo-500 to-emerald-500" />

          {/* Animated Success Check Circle */}
          <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 dark:bg-emerald-500/20 border-2 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-500/10">
            <Check className="h-8 w-8 stroke-[3]" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
            You are scheduled!
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto leading-relaxed">
            A calendar invitation and join details have been dispatched to{' '}
            <span className="font-semibold text-slate-800 dark:text-slate-200 underline decoration-slate-300 dark:decoration-slate-700 underline-offset-2">
              {booking.guestEmail}
            </span>
            .
          </p>

          {/* Meeting Summary Box */}
          <div className="bg-slate-50/90 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 p-5 sm:p-6 text-left space-y-4 mb-6 shadow-xs">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200/70 dark:border-slate-700/60 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{eventType.title}</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Hosted by <strong className="text-slate-700 dark:text-slate-200">{host.name || 'Calendio Host'}</strong>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/80 text-brand-600 dark:text-brand-400 border border-brand-200/50 dark:border-brand-800/40">
                  {eventType.duration} min
                </span>
              </div>
            </div>

            {/* Time & Date */}
            <div className="space-y-3 pt-1 text-sm font-semibold text-slate-700 dark:text-slate-200">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-brand-500 shrink-0" />
                <span>{formattedDate}</span>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-brand-500 shrink-0" />
                <span>
                  {formattedTimeRange}{' '}
                  <span className="text-xs font-normal text-slate-400">
                    ({booking.guestTimeZone})
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Conferencing & Meeting Room Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/80 p-5 sm:p-6 text-left mb-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700/70">
                  {getProviderIcon()}
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">
                    Conferencing Method
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {provider.name}
                  </h3>
                </div>
              </div>

              <Badge
                variant="outline"
                className={`text-xs font-bold px-2.5 py-0.5 rounded-lg border-0 ${provider.badgeBg} ${provider.badgeText}`}
              >
                {locType.replace(/_/g, ' ')}
              </Badge>
            </div>

            {/* Primary Action Button */}
            {booking.meetingUrl && (
              <div className="pt-2 space-y-2.5">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                  <a
                    href={booking.meetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-md shadow-brand-500/25 transition-all hover:scale-[1.01] active:scale-[0.99]"
                  >
                    <span>{provider.joinButtonText}</span>
                    <ExternalLink className="h-4 w-4" />
                  </a>

                  {provider.category === 'video' && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleCopy(booking.meetingUrl || '', 'link')}
                      className="h-12 px-4 rounded-2xl border-slate-200 dark:border-slate-700 font-bold text-xs gap-1.5"
                    >
                      {copiedLink ? (
                        <>
                          <CheckCheck className="h-4 w-4 text-emerald-500" />
                          <span className="text-emerald-600 dark:text-emerald-400">Copied Link</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 text-slate-400" />
                          <span>Copy Link</span>
                        </>
                      )}
                    </Button>
                  )}
                </div>

                <p className="text-[11px] text-slate-400 dark:text-slate-500 break-all truncate">
                  Meeting Link: <span className="font-mono text-slate-600 dark:text-slate-300">{booking.meetingUrl}</span>
                </p>
              </div>
            )}

            {/* Meeting Credentials (ID, Passcode, Dial-in, or Physical Address) */}
            {(details.meetingId || details.passcode || details.dialIn || details.address || details.phone) && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {details.meetingId && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Meeting ID / Access Code</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{details.meetingId}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(details.meetingId, 'id')}
                      className="text-slate-400 hover:text-slate-600 p-1"
                      title="Copy Meeting ID"
                    >
                      {copiedId ? <CheckCheck className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                )}

                {details.passcode && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Passcode</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{details.passcode}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(details.passcode, 'passcode')}
                      className="text-slate-400 hover:text-slate-600 p-1"
                      title="Copy Passcode"
                    >
                      {copiedPasscode ? <CheckCheck className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                )}

                {details.dialIn && (
                  <div className="sm:col-span-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Audio Dial-In</span>
                    <span className="text-slate-600 dark:text-slate-300 text-[11px] font-mono">{details.dialIn}</span>
                  </div>
                )}

                {details.address && (
                  <div className="sm:col-span-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Physical Location</span>
                    <span className="text-slate-700 dark:text-slate-200 font-semibold">{details.address}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Add To Calendar Action Grid */}
          <div className="space-y-3 mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
              Sync to your personal calendar
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <a
                href={googleCalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-3.5 rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/80 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-xs hover:border-brand-300 dark:hover:border-brand-700"
              >
                <span>Google Calendar</span>
                <ExternalLink className="h-3 w-3 text-slate-400" />
              </a>

              <a
                href={outlookCalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-3.5 rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/80 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-xs hover:border-brand-300 dark:hover:border-brand-700"
              >
                <span>Outlook</span>
                <ExternalLink className="h-3 w-3 text-slate-400" />
              </a>

              <a
                href={`/api/calendar/ics?uid=${booking.uid}`}
                download
                className="py-3 px-3.5 rounded-2xl border border-brand-200 dark:border-brand-800/60 bg-brand-50/50 dark:bg-brand-950/40 text-xs font-bold text-brand-600 dark:text-brand-400 hover:bg-brand-100/50 dark:hover:bg-brand-900/50 transition-all flex items-center justify-center gap-2 shadow-xs"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download .ics</span>
              </a>
            </div>
          </div>

          {/* Schedule Another Meeting Link */}
          <div className="pt-5 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-center">
            <Link
              href={`/${username}`}
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400 transition-colors"
            >
              <span>Schedule another event with {host.name || username}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Brand Footer */}
      <footer className="mt-12 flex flex-col items-center justify-center gap-1.5">
        <Logo size="sm" href="/" showBadge={false} />
        <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
          Enterprise Smart Scheduling For Modern Teams
        </span>
      </footer>
    </div>
  );
}
