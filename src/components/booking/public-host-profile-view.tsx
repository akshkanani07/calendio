'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  Clock,
  Video,
  Phone,
  MapPin,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Share2,
  Copy,
  Check,
  Search,
  Globe,
  Sparkles,
  ShieldCheck,
  Sun,
  Moon,
  Gem,
  ExternalLink,
  ChevronRight,
  Filter,
  User,
  X,
  QrCode,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Logo } from '@/components/shared/logo';
import { useAppTheme } from '@/components/shared/theme-provider';
import { getInitials, cn } from '@/lib/utils';
import { getProviderMeta } from '@/lib/meeting-providers';

interface PublicHostProfileViewProps {
  host: {
    userId: string;
    name: string | null;
    email: string;
    image: string | null;
    timeZone: string | null;
    username: string;
    bio: string | null;
    company: string | null;
    brandColor: string | null;
    eventTypes: any[];
  };
}

export function PublicHostProfileView({ host }: PublicHostProfileViewProps) {
  const { theme, setTheme } = useAppTheme();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [durationFilter, setDurationFilter] = useState<'ALL' | '15' | '30' | '45' | '60'>('ALL');
  const [locationFilter, setLocationFilter] = useState<'ALL' | 'GOOGLE_MEET' | 'PHONE_CALL' | 'IN_PERSON'>('ALL');

  // Copy Profile URL Feedback
  const [copiedProfile, setCopiedProfile] = useState(false);
  const [copiedEventSlug, setCopiedEventSlug] = useState<string | null>(null);

  // QR Code Modal State
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  // Host Local Time Clock
  const [hostTimeStr, setHostTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      try {
        const timeStr = new Date().toLocaleTimeString([], {
          timeZone: host.timeZone || 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        });
        setHostTimeStr(timeStr);
      } catch {
        setHostTimeStr(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }));
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [host.timeZone]);

  const profileUrl = typeof window !== 'undefined'
    ? window.location.href
    : `https://calendio-puce.vercel.app/${host.username}`;

  // Copy Host Profile Link
  const handleCopyProfileLink = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopiedProfile(true);
    setTimeout(() => setCopiedProfile(false), 2000);
  };

  // Copy Specific Event Link
  const handleCopyEventLink = (e: React.MouseEvent, slug: string) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/${host.username}/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedEventSlug(slug);
    setTimeout(() => setCopiedEventSlug(null), 2000);
  };

  // Native Web Share API if supported
  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && (navigator as any).share) {
      try {
        await (navigator as any).share({
          title: `${host.name} on Calendio`,
          text: `Schedule a meeting with ${host.name} on Calendio`,
          url: profileUrl,
        });
        return;
      } catch {}
    }
    handleCopyProfileLink();
  };

  // Filter Event Types
  const filteredEvents = useMemo(() => {
    return host.eventTypes.filter((event) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = event.title?.toLowerCase().includes(q);
        const matchesDesc = event.description?.toLowerCase().includes(q);
        const matchesDuration = `${event.duration}`.includes(q);
        if (!matchesTitle && !matchesDesc && !matchesDuration) return false;
      }

      // 2. Duration Filter
      if (durationFilter !== 'ALL') {
        const target = parseInt(durationFilter, 10);
        if (target === 60) {
          if (event.duration < 60) return false;
        } else {
          if (event.duration !== target) return false;
        }
      }

      // 3. Location Filter
      if (locationFilter !== 'ALL') {
        if (event.locationType !== locationFilter) return false;
      }

      return true;
    });
  }, [host.eventTypes, searchQuery, durationFilter, locationFilter]);

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between py-10 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-4xl mx-auto w-full space-y-8">
        {/* ============================================================ */}
        {/* 1. TOP NAVBAR: Calendio Logo & Theme Switcher */}
        {/* ============================================================ */}
        <header className="flex items-center justify-between px-2">
          <Logo size="md" href="/" />

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-brand-500 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-2xs active:scale-95 transition-all"
            >
              {copiedProfile ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400">Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Share</span>
                </>
              )}
            </button>

            {/* Public Theme Switcher Pill */}
            <div className="flex items-center p-0.5 rounded-xl bg-slate-200/80 dark:bg-slate-800 border border-slate-300/60 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={cn(
                  'p-1.5 rounded-lg transition-all',
                  theme === 'light'
                    ? 'bg-white text-amber-500 shadow-2xs'
                    : 'text-slate-400 hover:text-slate-700'
                )}
                title="Light Mode"
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setTheme('midnight')}
                className={cn(
                  'p-1.5 rounded-lg transition-all',
                  theme === 'midnight'
                    ? 'bg-slate-700 text-sky-400 shadow-2xs'
                    : 'text-slate-400 hover:text-slate-200'
                )}
                title="Dark Mode"
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </header>

        {/* ============================================================ */}
        {/* 2. HOST PROFILE CARD (Executive Luxury Banner) */}
        {/* ============================================================ */}
        <div className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 sm:p-8 transition-all">
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-brand-500/10 dark:bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            {/* Host Avatar with Online Indicator */}
            <div className="relative shrink-0">
              <Avatar className="h-24 w-24 sm:h-28 sm:w-28 border-4 border-white dark:border-slate-800 shadow-xl">
                <AvatarImage src={host.image || ''} alt={host.name || ''} />
                <AvatarFallback className="bg-gradient-to-tr from-brand-600 to-indigo-600 text-white text-3xl font-black">
                  {getInitials(host.name || 'User')}
                </AvatarFallback>
              </Avatar>

              {/* Green Active Pulse Dot */}
              <span
                className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-emerald-500 border-4 border-white dark:border-slate-900 shadow-sm"
                title="Active & Available for bookings"
              />
            </div>

            {/* Host Information */}
            <div className="flex-1 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {host.name}
                </h1>

                <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                  <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-200/60 dark:border-brand-900/60">
                    <CheckCircle2 className="h-3.5 w-3.5 text-brand-500" />
                    Verified Host
                  </span>

                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/60">
                    Available
                  </span>
                </div>
              </div>

              {/* Company & Role */}
              {host.company && (
                <p className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">
                  {host.company}
                </p>
              )}

              {/* Bio */}
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl font-normal">
                {host.bio ||
                  'Welcome to my scheduling page. Please choose an event below to book a convenient time with me.'}
              </p>

              {/* Host Metadata: Timezone & Local Clock */}
              <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-500 dark:text-slate-400">
                <span className="inline-flex items-center gap-1.5 font-mono">
                  <Globe className="w-3.5 h-3.5 text-brand-500" />
                  <span>{host.timeZone || 'Asia/Kolkata'}</span>
                </span>

                {hostTimeStr && (
                  <>
                    <span>&bull;</span>
                    <span className="inline-flex items-center gap-1.5 font-mono">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Host Local Time: {hostTimeStr}</span>
                    </span>
                  </>
                )}

                <span>&bull;</span>
                <button
                  type="button"
                  onClick={() => setIsQrModalOpen(true)}
                  className="inline-flex items-center gap-1 text-brand-600 dark:text-brand-400 font-bold hover:underline"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Show QR Code</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 3. EVENT TYPES SEARCH, FILTER & LIST */}
        {/* ============================================================ */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-2">
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <Calendar className="w-4 h-4 text-brand-500" />
                <span>Select an Event Type</span>
              </h2>
              <p className="text-xs text-slate-400">
                Choose the meeting format that best fits your schedule.
              </p>
            </div>

            <span className="text-xs font-mono text-slate-400 self-start sm:self-auto">
              {filteredEvents.length} of {host.eventTypes.length} available
            </span>
          </div>

          {/* Search & Filter Capsule */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <Input
                placeholder="Search events by title or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 rounded-2xl bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 text-xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Duration Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
              <button
                type="button"
                onClick={() => setDurationFilter('ALL')}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap active:scale-95',
                  durationFilter === 'ALL'
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xs'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                )}
              >
                All Durations
              </button>

              <button
                type="button"
                onClick={() => setDurationFilter('15')}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap active:scale-95',
                  durationFilter === '15'
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xs'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                )}
              >
                15m
              </button>

              <button
                type="button"
                onClick={() => setDurationFilter('30')}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap active:scale-95',
                  durationFilter === '30'
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xs'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                )}
              >
                30m
              </button>

              <button
                type="button"
                onClick={() => setDurationFilter('60')}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap active:scale-95',
                  durationFilter === '60'
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xs'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                )}
              >
                60m+
              </button>
            </div>
          </div>

          {/* Event Cards Grid */}
          {filteredEvents.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-12 text-center space-y-3">
              <Calendar className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                No matching event types
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No events match your current filter settings. Try clearing your search query.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setDurationFilter('ALL');
                  setLocationFilter('ALL');
                }}
                className="rounded-xl text-xs font-semibold"
              >
                Reset Filters
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredEvents.map((event) => {
                const color = event.color || '#0069FF';
                const isCopied = copiedEventSlug === event.slug;

                return (
                  <Link
                    key={event.id}
                    href={`/${host.username}/${event.slug}`}
                    className="group relative bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-xs hover:shadow-xl hover:border-brand-500/60 dark:hover:border-brand-500/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-5 overflow-hidden active:scale-[0.99]"
                  >
                    {/* Left Colored Edge Accent Stripe */}
                    <div
                      className="absolute left-0 top-0 bottom-0 w-2.5 transition-all group-hover:w-3.5"
                      style={{ backgroundColor: color }}
                    />

                    <div className="pl-3 sm:pl-4 space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors tracking-tight">
                          {event.title}
                        </h3>
                      </div>

                      {event.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 max-w-2xl leading-relaxed">
                          {event.description}
                        </p>
                      )}

                      {/* Metadata Badges */}
                      <div className="flex flex-wrap items-center gap-2.5 pt-1.5">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          <span>{event.duration} mins</span>
                        </span>

                        {(() => {
                          const pMeta = getProviderMeta(event.locationType || 'GOOGLE_MEET');
                          const IconComp = pMeta.category === 'phone' ? Phone : pMeta.category === 'in_person' ? MapPin : Video;
                          return (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                              <IconComp className="h-3.5 w-3.5 text-slate-500" />
                              <span>{pMeta.name}</span>
                            </span>
                          );
                        })()}

                        <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Instant Confirmation</span>
                        </span>
                      </div>
                    </div>

                    {/* Right Action Column */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 pl-3 sm:pl-0 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => handleCopyEventLink(e, event.slug)}
                        className="p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-brand-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        title={isCopied ? 'Link Copied!' : 'Copy Direct Link'}
                      >
                        {isCopied ? (
                          <Check className="w-4 h-4 text-emerald-500 stroke-[3]" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>

                      <div className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs shadow-md group-hover:scale-105 transition-all">
                        <span>Select Time</span>
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* 4. TRUST & SECURITY FOOTER */}
        {/* ============================================================ */}
        <div className="p-6 rounded-3xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 text-center space-y-2">
          <div className="flex items-center justify-center gap-4 text-xs font-semibold text-slate-500">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Conflict-Free Scheduling</span>
            </span>
            <span>&bull;</span>
            <span className="flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-brand-500" />
              <span>Smart Timezone Match</span>
            </span>
            <span>&bull;</span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span>100% Free Forever</span>
            </span>
          </div>
        </div>
      </div>

      {/* Brand Footer */}
      <footer className="mt-16 flex flex-col items-center justify-center gap-2">
        <Logo size="sm" href="/" showBadge={false} />
        <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
          Smart Scheduling Infrastructure for Modern Professionals
        </span>
      </footer>

      {/* QR Code Modal Dialog */}
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
                <span>{host.name}&apos;s Calendar QR</span>
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
                  profileUrl
                )}`}
                alt="Host QR Code"
                className="w-48 h-48 mx-auto"
              />
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Point your smartphone camera to book an appointment directly with {host.name}.
            </p>

            <Button
              onClick={handleCopyProfileLink}
              className="w-full h-11 rounded-2xl bg-brand-600 text-white font-bold text-xs"
            >
              {copiedProfile ? 'Link Copied!' : 'Copy Link URL'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
