'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Calendar,
  CalendarCheck,
  Clock,
  Globe,
  Share2,
  Copy,
  Check,
  ExternalLink,
  Plus,
  Video,
  Users,
  Workflow,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  Activity,
  QrCode,
  Code,
  CheckCircle2,
  ChevronRight,
  Settings,
  GitFork,
  BarChart3,
  Flame,
  Sun,
  Sunset,
  Moon,
  X,
  Phone,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials, cn } from '@/lib/utils';

interface MasterDashboardOverviewProps {
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    timeZone: string;
    username: string;
  };
  eventTypes: any[];
  upcomingBookings: any[];
  contactsCount: number;
  workflowsCount: number;
}

export function MasterDashboardOverview({
  user,
  eventTypes,
  upcomingBookings,
  contactsCount,
  workflowsCount,
}: MasterDashboardOverviewProps) {
  // Dynamic Greeting based on client local hour
  const [greeting, setGreeting] = useState('Welcome back');
  const [currentTimeStr, setCurrentTimeStr] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Modals for Share tools
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isEmbedModalOpen, setIsEmbedModalOpen] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);

  // Next upcoming booking spotlight
  const nextBooking = useMemo(() => {
    if (!upcomingBookings || upcomingBookings.length === 0) return null;
    return upcomingBookings[0];
  }, [upcomingBookings]);

  // Compute Live Clock & Greeting according to user.timeZone
  useEffect(() => {
    const tz = user.timeZone || 'Asia/Kolkata';
    const updateTime = () => {
      const now = new Date();
      try {
        const hourFormatter = new Intl.DateTimeFormat('en-US', {
          timeZone: tz,
          hour: 'numeric',
          hour12: false,
        });
        const hour = parseInt(hourFormatter.format(now), 10);
        if (hour < 12) setGreeting('Good morning');
        else if (hour < 17) setGreeting('Good afternoon');
        else setGreeting('Good evening');

        const timeFormatter = new Intl.DateTimeFormat('en-US', {
          timeZone: tz,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        });
        setCurrentTimeStr(timeFormatter.format(now));
      } catch (e) {
        setCurrentTimeStr(
          now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        );
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [user.timeZone]);

  const cleanUsername = user.username || 'me';
  const publicProfileUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/${cleanUsername}`
    : `https://calendio-puce.vercel.app/${cleanUsername}`;

  const embedCodeSnippet = `<iframe src="${publicProfileUrl}" width="100%" height="700" frameborder="0"></iframe>`;

  // Copy Main Booking Link
  const handleCopyPublicLink = () => {
    navigator.clipboard.writeText(publicProfileUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Copy Embed Code
  const handleCopyEmbedCode = () => {
    navigator.clipboard.writeText(embedCodeSnippet);
    setCopiedEmbed(true);
    setTimeout(() => setCopiedEmbed(false), 2000);
  };

  // Calculate Total Scheduled Hours
  const totalMeetingHours = useMemo(() => {
    let totalMinutes = 0;
    upcomingBookings.forEach((b) => {
      totalMinutes += b.eventDuration || 30;
    });
    return Math.round((totalMinutes / 60) * 10) / 10;
  }, [upcomingBookings]);

  // Weekly Schedule Density (Mocked for visual pulse)
  const weeklyDensity = [
    { day: 'Mon', count: 3, active: true },
    { day: 'Tue', count: 5, active: true },
    { day: 'Wed', count: 2, active: true },
    { day: 'Thu', count: 6, active: true },
    { day: 'Fri', count: 4, active: true },
    { day: 'Sat', count: 0, active: false },
    { day: 'Sun', count: 0, active: false },
  ];

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-12">
      {/* ============================================================ */}
      {/* 1. HERO BANNER: Greeting, Live Status & Share Tools */}
      {/* ============================================================ */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-gradient-to-br from-white via-slate-50/60 to-brand-50/30 dark:from-slate-900 dark:via-slate-900/90 dark:to-brand-950/20 p-6 sm:p-8 shadow-sm">
        {/* Decorative background blur glow */}
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-brand-500/10 dark:bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: Greeting & Status Indicators */}
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/60">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Calendar Active & Synced
              </span>

              {currentTimeStr && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono text-slate-500 dark:text-slate-400 bg-white/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{currentTimeStr}</span>
                  <span className="text-[10px] text-slate-400">({user.timeZone || 'IST'})</span>
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              {greeting}, {user.name || 'Friend'}! 👋
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Your scheduling infrastructure is operating smoothly. All conflict buffers, time zones, and automated reminders are active.
            </p>

            {/* Public Booking Link Capsule & Quick Sharing */}
            <div className="pt-2 flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs w-full sm:w-auto max-w-md">
                <Globe className="w-4 h-4 text-brand-600 dark:text-brand-400 shrink-0" />
                <span className="text-xs font-mono font-medium text-slate-700 dark:text-slate-200 truncate select-all">
                  calendio-puce.vercel.app/{cleanUsername}
                </span>

                <button
                  type="button"
                  onClick={handleCopyPublicLink}
                  className="p-1 rounded-lg text-slate-400 hover:text-brand-600 transition-colors ml-auto"
                  title={copiedLink ? 'Copied to clipboard' : 'Copy link'}
                >
                  {copiedLink ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>

              <a
                href={publicProfileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-brand-600 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700 transition-all shadow-2xs"
              >
                <span>Preview Page</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                type="button"
                onClick={() => setIsQrModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700 transition-all shadow-2xs"
                title="Generate QR Code"
              >
                <QrCode className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">QR Code</span>
              </button>

              <button
                type="button"
                onClick={() => setIsEmbedModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700 transition-all shadow-2xs"
                title="Embed Widget on your website"
              >
                <Code className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Embed</span>
              </button>
            </div>
          </div>

          {/* Right: Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-center shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleCopyPublicLink}
              className="h-11 px-5 rounded-2xl text-xs font-bold bg-white dark:bg-slate-900 shadow-xs hover:border-brand-500"
            >
              {copiedLink ? (
                <>
                  <Check className="w-4 h-4 mr-1.5 text-emerald-600" />
                  <span>Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 mr-1.5 text-slate-500" />
                  <span>Share Calendar</span>
                </>
              )}
            </Button>

            <Link href="/event-types">
              <Button className="h-11 px-5 rounded-2xl text-xs font-bold bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white shadow-md shadow-brand-500/20">
                <Plus className="w-4 h-4 mr-1.5 stroke-[3]" />
                <span>New Event Type</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. SIX HIGH-IMPACT METRIC PULSE CARDS */}
      {/* ============================================================ */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Card 1: Active Event Types */}
        <Link
          href="/event-types"
          className="group p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-brand-500/40 transition-all active:scale-95"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Event Types
            </span>
            <div className="h-8 w-8 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2">
            {eventTypes.length}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5 truncate">
            Active booking links
          </p>
        </Link>

        {/* Card 2: Upcoming Meetings */}
        <Link
          href="/bookings"
          className="group p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-emerald-500/40 transition-all active:scale-95"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Upcoming
            </span>
            <div className="h-8 w-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2">
            {upcomingBookings.length}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5 truncate">
            Confirmed calls
          </p>
        </Link>

        {/* Card 3: Contacts in CRM */}
        <Link
          href="/contacts"
          className="group p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-purple-500/40 transition-all active:scale-95"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              CRM Contacts
            </span>
            <div className="h-8 w-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2">
            {contactsCount}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5 truncate">
            Attendee history
          </p>
        </Link>

        {/* Card 4: Active Workflows */}
        <Link
          href="/automations"
          className="group p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-amber-500/40 transition-all active:scale-95"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Workflows
            </span>
            <div className="h-8 w-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Workflow className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2">
            {workflowsCount}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5 truncate">
            Email reminders
          </p>
        </Link>

        {/* Card 5: Meeting Duration Tracked */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Call Time
            </span>
            <div className="h-8 w-8 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2">
            {totalMeetingHours} <span className="text-xs font-normal text-slate-400">hrs</span>
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5 truncate">
            Scheduled duration
          </p>
        </div>

        {/* Card 6: Availability Status */}
        <Link
          href="/availability"
          className="group p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-indigo-500/40 transition-all active:scale-95"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Buffers
            </span>
            <div className="h-8 w-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2">
            15m
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5 truncate">
            Anti double-book
          </p>
        </Link>
      </div>

      {/* ============================================================ */}
      {/* 3. TWO-COLUMN SPOTLIGHT: Next Meeting & Upcoming Timeline */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (8 cols): Next Up Spotlight + Active Event Types */}
        <div className="lg:col-span-8 space-y-8">
          {/* Spotlight Card: Next Meeting */}
          {nextBooking ? (
            <div className="p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Next Up on Your Schedule
                  </span>
                </div>

                <Badge variant="secondary" className="text-xs font-mono font-bold bg-brand-50 text-brand-600 dark:bg-brand-950/60">
                  {nextBooking.eventDuration || 30} mins
                </Badge>
              </div>

              <div className="pt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                <div className="space-y-1.5">
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    {nextBooking.eventTitle || nextBooking.eventType?.title}
                  </h3>

                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                    <Calendar className="w-3.5 h-3.5 text-brand-500" />
                    <span>
                      {new Date(nextBooking.startTime).toLocaleDateString([], {
                        timeZone: user.timeZone || undefined,
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <span>&bull;</span>
                    <Clock className="w-3.5 h-3.5 text-brand-500" />
                    <span>
                      {new Date(nextBooking.startTime).toLocaleTimeString([], {
                        timeZone: user.timeZone || undefined,
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                      })}
                    </span>
                  </div>

                  {/* Attendee Info */}
                  <div className="flex items-center gap-2.5 pt-2">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="bg-brand-600 text-white font-bold text-xs">
                        {getInitials(nextBooking.guestName)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {nextBooking.guestName}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      ({nextBooking.guestEmail})
                    </span>
                  </div>
                </div>

                {/* Meet URL Join CTA */}
                {nextBooking.meetingUrl && (
                  <div className="flex sm:flex-col items-center gap-2 shrink-0">
                    <a
                      href={nextBooking.meetingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-brand-500/25 active:scale-95 transition-all"
                    >
                      <Video className="w-4 h-4" />
                      <span>Join Google Meet</span>
                    </a>

                    <Link href="/bookings">
                      <Button variant="ghost" size="sm" className="text-xs text-slate-500 rounded-xl">
                        View All ({upcomingBookings.length})
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
              <CalendarCheck className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                No upcoming meetings right now
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Your schedule is currently clear. Share your booking link or embed it on your website to start accepting appointments.
              </p>
              <div className="pt-2">
                <Button
                  size="sm"
                  onClick={handleCopyPublicLink}
                  className="rounded-xl text-xs font-semibold bg-brand-600 text-white"
                >
                  <Copy className="w-3.5 h-3.5 mr-1.5" />
                  Copy Booking Link
                </Button>
              </div>
            </div>
          )}

          {/* Active Event Types Showcase */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  Active Booking Links
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Ready to share with clients, leads, and teammates.
                </p>
              </div>

              <Link href="/event-types">
                <Button variant="outline" size="sm" className="rounded-xl text-xs font-semibold">
                  Manage Events ({eventTypes.length})
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {eventTypes.slice(0, 4).map((et) => (
                <div
                  key={et.id}
                  className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: et.color || '#0069FF' }}
                      />
                      <Badge variant="secondary" className="text-[10px] font-mono">
                        {et.duration}m
                      </Badge>
                    </div>

                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-brand-600 transition-colors">
                      {et.title}
                    </h4>

                    {et.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {et.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                    <Link
                      href={`/${cleanUsername}/${et.slug}`}
                      target="_blank"
                      className="font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
                    >
                      <span>Booking Page</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        const url = `${window.location.origin}/${cleanUsername}/${et.slug}`;
                        navigator.clipboard.writeText(url);
                      }}
                      className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-md"
                      title="Copy link"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Schedule Heatmap & Power Tools */}
        <div className="lg:col-span-4 space-y-6">
          {/* Weekly Capacity & Schedule Density */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-black text-sm text-slate-900 dark:text-white">
                  Weekly Schedule Pulse
                </h4>
                <p className="text-[11px] text-slate-500">
                  Capacity distribution
                </p>
              </div>
              <Flame className="w-4 h-4 text-amber-500" />
            </div>

            <div className="grid grid-cols-7 gap-1 pt-1">
              {weeklyDensity.map((w) => (
                <div key={w.day} className="flex flex-col items-center gap-1.5">
                  <div
                    className={cn(
                      'w-full h-16 rounded-xl flex items-end justify-center pb-1.5 transition-all',
                      w.count > 4
                        ? 'bg-brand-500 text-white font-bold'
                        : w.count > 0
                        ? 'bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-bold'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                    )}
                  >
                    <span className="text-[10px] font-mono">{w.count}</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">{w.day}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-500 text-[11px]">Buffer intervals active</span>
              <Link href="/availability" className="font-bold text-brand-600 hover:underline">
                Edit Hours &rarr;
              </Link>
            </div>
          </div>

          {/* Ecosystem Power Launchers */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
            <h4 className="font-black text-sm text-slate-900 dark:text-white">
              Scheduling Power Tools
            </h4>

            <div className="space-y-2 pt-1">
              <Link
                href="/routing"
                className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center">
                    <GitFork className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-brand-600 transition-colors">
                      Routing Forms
                    </p>
                    <p className="text-[10px] text-slate-400">Qualify leads before booking</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600" />
              </Link>

              <Link
                href="/automations"
                className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
                    <Workflow className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-brand-600 transition-colors">
                      Workflows
                    </p>
                    <p className="text-[10px] text-slate-400">Automated SMS & Email triggers</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600" />
              </Link>

              <Link
                href="/analytics"
                className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 flex items-center justify-center">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-brand-600 transition-colors">
                      Analytics & Conversion
                    </p>
                    <p className="text-[10px] text-slate-400">Conversion funnel & heatmap</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600" />
              </Link>

              <Link
                href="/settings"
                className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
                    <Settings className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-brand-600 transition-colors">
                      Account & Branding
                    </p>
                    <p className="text-[10px] text-slate-400">Custom theme, logos & domain</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4. QR CODE MODAL DIALOG */}
      {/* ============================================================ */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsQrModalOpen(false)}
          />

          <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl max-w-sm w-full z-10 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <QrCode className="w-4 h-4 text-brand-500" />
                <span>Booking Page QR Code</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsQrModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 inline-block shadow-sm">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                  publicProfileUrl
                )}`}
                alt="Calendar QR Code"
                className="w-48 h-48 mx-auto"
              />
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Scan with any mobile camera to open your live Calendio booking page.
            </p>

            <Button
              onClick={handleCopyPublicLink}
              className="w-full h-11 rounded-2xl bg-brand-600 text-white font-bold text-xs"
            >
              {copiedLink ? 'Link Copied!' : 'Copy Link URL'}
            </Button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 5. EMBED IFRAME MODAL DIALOG */}
      {/* ============================================================ */}
      {isEmbedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsEmbedModalOpen(false)}
          />

          <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl max-w-lg w-full z-10 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Code className="w-4 h-4 text-brand-500" />
                <span>Embed On Your Website</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsEmbedModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Copy and paste this HTML snippet into your WordPress, Webflow, React, or custom website:
            </p>

            <div className="p-3.5 rounded-2xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto">
              <code>{embedCodeSnippet}</code>
            </div>

            <Button
              onClick={handleCopyEmbedCode}
              className="w-full h-11 rounded-2xl bg-brand-600 text-white font-bold text-xs"
            >
              {copiedEmbed ? 'Embed Code Copied!' : 'Copy Embed Code'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
