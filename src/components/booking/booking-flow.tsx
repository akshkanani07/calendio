'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Globe,
  Calendar as CalendarIcon,
  ArrowLeft,
  Check,
  User,
  Mail,
  FileText,
  Loader2,
  Users,
  Sun,
  Sunset,
  Moon,
  Sparkles,
  Search,
  CheckCircle2,
  X,
  Phone,
  Video,
  ShieldCheck,
  MapPin,
  CalendarCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getAvailableSlotsForDate, createPublicBooking } from '@/app/actions/booking.actions';
import { getInitials, cn } from '@/lib/utils';

// Common global timezones for instant selection
const POPULAR_TIMEZONES = [
  { label: 'India Standard Time (IST)', value: 'Asia/Kolkata', offset: 'GMT+5:30' },
  { label: 'Eastern Time (US & Canada)', value: 'America/New_York', offset: 'GMT-4:00' },
  { label: 'Pacific Time (US & Canada)', value: 'America/Los_Angeles', offset: 'GMT-7:00' },
  { label: 'Central Time (US & Canada)', value: 'America/Chicago', offset: 'GMT-5:00' },
  { label: 'Greenwich Mean Time (London)', value: 'Europe/London', offset: 'GMT+1:00' },
  { label: 'Central European Time (Paris/Berlin)', value: 'Europe/Paris', offset: 'GMT+2:00' },
  { label: 'Gulf Standard Time (Dubai)', value: 'Asia/Dubai', offset: 'GMT+4:00' },
  { label: 'Singapore / Hong Kong (SGT)', value: 'Asia/Singapore', offset: 'GMT+8:00' },
  { label: 'Japan Standard Time (Tokyo)', value: 'Asia/Tokyo', offset: 'GMT+9:00' },
  { label: 'Australian Eastern Time (Sydney)', value: 'Australia/Sydney', offset: 'GMT+10:00' },
];

interface BookingFlowProps {
  host: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    timeZone: string;
    username: string;
    company?: string | null;
    bio?: string | null;
  };
  eventType: {
    id: string;
    title: string;
    slug: string;
    duration: number;
    color: string;
    description: string | null;
    locationType: string;
    locationUrl: string | null;
    customQuestions: any;
  };
}

export function BookingFlow({ host, eventType }: BookingFlowProps) {
  const router = useRouter();

  // Current view date in calendar (defaults to today)
  const today = useMemo(() => new Date(), []);
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-indexed

  // Selected date & slot state
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);
  const [slots, setSlots] = useState<any[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<any | null>(null);

  // Time format preference: 12h or 24h
  const [timeFormat, setTimeFormat] = useState<'12h' | '24h'>('12h');

  // Time of day filter: 'all' | 'morning' | 'afternoon' | 'evening'
  const [timeOfDayFilter, setTimeOfDayFilter] = useState<'all' | 'morning' | 'afternoon' | 'evening'>('all');

  // Flow Stage: 'picker' (Calendar & slots) | 'form' (Attendee details)
  const [stage, setStage] = useState<'picker' | 'form'>('picker');

  // Attendee Form State
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestNotes, setGuestNotes] = useState('');
  const [guestTimeZone, setGuestTimeZone] = useState(
    typeof Intl !== 'undefined'
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : host.timeZone || 'Asia/Kolkata'
  );

  // Additional Guests State (Interactive Email Chips)
  const [showAddGuests, setShowAddGuests] = useState(false);
  const [guestEmails, setGuestEmails] = useState<string[]>([]);
  const [guestEmailInput, setGuestEmailInput] = useState('');

  // Custom Answers State
  const [customAnswers, setCustomAnswers] = useState<Record<string, any>>({});

  // Timezone search modal
  const [isTimezoneModalOpen, setIsTimezoneModalOpen] = useState(false);
  const [timezoneSearch, setTimezoneSearch] = useState('');

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Calendar calculations
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleJumpToToday = () => {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    handleDateSelect(`${yyyy}-${mm}-${dd}`);
  };

  // Date Selection Handler
  const handleDateSelect = async (dateStr: string) => {
    setSelectedDateStr(dateStr);
    setSelectedSlot(null);
    setIsLoadingSlots(true);
    setSubmitError(null);

    try {
      const result = await getAvailableSlotsForDate({
        hostId: host.id,
        eventDuration: eventType.duration,
        dateStr,
      });

      if (result.success && result.slots) {
        setSlots(result.slots);
      } else {
        setSlots([]);
      }
    } catch (e) {
      console.error('Failed to fetch available slots:', e);
      setSlots([]);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  // Auto-select today if viewing current month on mount
  useEffect(() => {
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    handleDateSelect(`${yyyy}-${mm}-${dd}`);
  }, [today, guestTimeZone]);

  // Format slot time based on 12h / 24h preference
  const formatSlotTime = (dateObj: Date | string) => {
    const d = new Date(dateObj);
    if (timeFormat === '24h') {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    }
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  // Filter slots by morning, afternoon, evening
  const filteredSlots = useMemo(() => {
    if (timeOfDayFilter === 'all') return slots;
    return slots.filter((slot) => {
      const hour = new Date(slot.startTime).getHours();
      if (timeOfDayFilter === 'morning') return hour < 12;
      if (timeOfDayFilter === 'afternoon') return hour >= 12 && hour < 17;
      if (timeOfDayFilter === 'evening') return hour >= 17;
      return true;
    });
  }, [slots, timeOfDayFilter]);

  // Slot count per time segment
  const slotCounts = useMemo(() => {
    let morning = 0;
    let afternoon = 0;
    let evening = 0;
    slots.forEach((s) => {
      const hour = new Date(s.startTime).getHours();
      if (hour < 12) morning++;
      else if (hour < 17) afternoon++;
      else evening++;
    });
    return { all: slots.length, morning, afternoon, evening };
  }, [slots]);

  // Chip Guest Email Handlers
  const handleAddGuestEmail = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const trimmed = guestEmailInput.trim().replace(',', '').toLowerCase();
      if (trimmed && trimmed.includes('@') && !guestEmails.includes(trimmed)) {
        setGuestEmails([...guestEmails, trimmed]);
        setGuestEmailInput('');
      }
    }
  };

  const handleRemoveGuestEmail = (emailToRemove: string) => {
    setGuestEmails(guestEmails.filter((em) => em !== emailToRemove));
  };

  // Form Submission Handler
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot || !selectedDateStr) return;

    setIsSubmitting(true);
    setSubmitError(null);

    // Merge chip emails with any remaining text in the input
    let allAdditionalGuests = [...guestEmails];
    if (guestEmailInput.trim() && guestEmailInput.includes('@')) {
      allAdditionalGuests.push(guestEmailInput.trim().toLowerCase());
    }

    try {
      const res = await createPublicBooking({
        hostId: host.id,
        eventTypeId: eventType.id,
        isoStart: new Date(selectedSlot.startTime).toISOString(),
        isoEnd: new Date(selectedSlot.endTime).toISOString(),
        guestName,
        guestEmail,
        guestTimeZone,
        guestNotes: guestNotes + (guestPhone.trim() ? `\nPhone: ${guestPhone.trim()}` : ''),
        additionalGuests: allAdditionalGuests,
        answers: customAnswers,
      });

      const token = res.uid || (res as any).bookingId;
      if (res.success && token) {
        // Redirect to booking confirmation view
        router.push(
          `/${host.username}/${eventType.slug}/confirmation?uid=${token}`
        );
      } else {
        setSubmitError(res.error || 'Failed to complete booking. Please choose another slot.');
        setIsSubmitting(false);
      }
    } catch (err: any) {
      console.error(err);
      setSubmitError(err.message || 'An unexpected error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Filtered Timezone List for Modal Search
  const filteredTimezones = useMemo(() => {
    if (!timezoneSearch.trim()) return POPULAR_TIMEZONES;
    const q = timezoneSearch.toLowerCase();
    return POPULAR_TIMEZONES.filter(
      (tz) => tz.label.toLowerCase().includes(q) || tz.value.toLowerCase().includes(q)
    );
  }, [timezoneSearch]);

  const brandColor = eventType.color || '#0069FF';

  return (
    <div className="w-full max-w-5xl mx-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xl overflow-hidden transition-all duration-300">
      {/* 1. Header Progress Bar for Mobile / Multi-step Indicator */}
      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800">
        <div
          className="h-full transition-all duration-300"
          style={{
            width: stage === 'picker' ? (selectedSlot ? '50%' : '25%') : '90%',
            backgroundColor: brandColor,
          }}
        />
      </div>

      {/* 2. Main Split Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
        {/* ============================================================ */}
        {/* LEFT COLUMN: Host Profile & Event Specifications */}
        {/* ============================================================ */}
        <div className="lg:col-span-4 p-6 sm:p-8 border-b lg:border-b-0 lg:border-r border-slate-200/80 dark:border-slate-800 flex flex-col justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="space-y-6">
            {/* Host Identity Badge */}
            <div className="flex items-center gap-3.5">
              <Avatar className="h-14 w-14 border-2 border-white dark:border-slate-800 shadow-md">
                <AvatarImage src={host.image || ''} alt={host.name || 'Host'} />
                <AvatarFallback className="bg-brand-600 text-white font-bold text-lg">
                  {getInitials(host.name)}
                </AvatarFallback>
              </Avatar>

              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Scheduling with
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white leading-tight">
                    {host.name}
                  </h3>
                  <CheckCircle2 className="h-4 w-4 text-brand-500 shrink-0" />
                </div>
                {host.company && (
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                    {host.company}
                  </p>
                )}
              </div>
            </div>

            {/* Event Title & Color Pill */}
            <div>
              <div
                className="w-10 h-1.5 rounded-full mb-3"
                style={{ backgroundColor: brandColor }}
              />
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-snug">
                {eventType.title}
              </h1>

              {/* Event Metadata Pills */}
              <div className="flex flex-wrap items-center gap-2 mt-3.5">
                <Badge
                  variant="secondary"
                  className="px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs"
                >
                  <Clock className="h-3.5 w-3.5 text-slate-500" />
                  <span>{eventType.duration} mins</span>
                </Badge>

                <Badge
                  variant="secondary"
                  className="px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs"
                >
                  <Video className="h-3.5 w-3.5 text-brand-500" />
                  <span>
                    {eventType.locationType === 'GOOGLE_MEET'
                      ? 'Google Meet'
                      : eventType.locationType}
                  </span>
                </Badge>

                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/50 dark:border-emerald-800/40">
                  <ShieldCheck className="h-3 w-3" />
                  Instant Confirmed
                </span>
              </div>
            </div>

            {/* Event Description */}
            {eventType.description && (
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                {eventType.description}
              </div>
            )}

            {/* Selected Booking Capsule (Shows up once a slot is selected) */}
            {selectedSlot && (
              <div className="p-4 rounded-2xl bg-brand-50/80 dark:bg-brand-950/40 border border-brand-200/80 dark:border-brand-800 text-xs animate-in fade-in duration-200">
                <div className="flex items-center gap-2 text-brand-700 dark:text-brand-300 font-bold mb-1.5">
                  <CalendarCheck className="h-4 w-4" />
                  <span>Selected Date & Time</span>
                </div>
                <p className="font-extrabold text-sm text-slate-900 dark:text-white">
                  {new Date(selectedSlot.startTime).toLocaleDateString([], {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
                <p className="font-semibold text-brand-600 dark:text-brand-400 mt-0.5">
                  {formatSlotTime(selectedSlot.startTime)} - {formatSlotTime(selectedSlot.endTime)}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-mono">
                  ({guestTimeZone})
                </p>
              </div>
            )}
          </div>

          {/* Timezone Selector Capsule at Bottom of Left Rail */}
          <div className="pt-6 border-t border-slate-200/80 dark:border-slate-800 mt-6">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsTimezoneModalOpen(true)}
                className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors group text-left"
              >
                <Globe className="h-4 w-4 text-brand-500 group-hover:rotate-12 transition-transform shrink-0" />
                <span className="truncate max-w-[180px] font-mono">{guestTimeZone}</span>
                <span className="text-[10px] text-brand-600 dark:text-brand-400 underline ml-0.5">
                  Change
                </span>
              </button>

              {/* 12h / 24h Toggle Pill */}
              <div className="flex items-center p-0.5 rounded-lg bg-slate-200/70 dark:bg-slate-800 border border-slate-300/40 dark:border-slate-700 text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setTimeFormat('12h')}
                  className={cn(
                    'px-1.5 py-0.5 rounded-md transition-all',
                    timeFormat === '12h'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                      : 'text-slate-500'
                  )}
                >
                  12h
                </button>
                <button
                  type="button"
                  onClick={() => setTimeFormat('24h')}
                  className={cn(
                    'px-1.5 py-0.5 rounded-md transition-all',
                    timeFormat === '24h'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                      : 'text-slate-500'
                  )}
                >
                  24h
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* RIGHT COLUMN: Interactive Calendar & Slot Picker OR Form */}
        {/* ============================================================ */}
        <div className="lg:col-span-8 p-5 sm:p-8 flex flex-col justify-between">
          {stage === 'picker' ? (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              {/* Calendar Grid (7 cols) */}
              <div className="md:col-span-7 space-y-4">
                <div className="flex items-center justify-between pb-2">
                  <h2 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight">
                    Select a Date
                  </h2>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleJumpToToday}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
                      title="Jump to current date"
                    >
                      Today
                    </button>

                    <button
                      type="button"
                      onClick={handlePrevMonth}
                      className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                      aria-label="Previous month"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>

                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 w-28 text-center">
                      {monthNames[currentMonth]} {currentYear}
                    </span>

                    <button
                      type="button"
                      onClick={handleNextMonth}
                      className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                      aria-label="Next month"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Day of Week Headers */}
                <div className="grid grid-cols-7 gap-1 text-center font-bold text-[11px] text-slate-400 uppercase tracking-wider py-1">
                  <span>Sun</span>
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-1.5">
                  {/* Empty offset padding for days before month starts */}
                  {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                    <div key={`empty-${i}`} className="h-10 w-full" />
                  ))}

                  {/* Month Days */}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const dayNum = i + 1;
                    const mm = String(currentMonth + 1).padStart(2, '0');
                    const dd = String(dayNum).padStart(2, '0');
                    const dateStr = `${currentYear}-${mm}-${dd}`;

                    const cellDate = new Date(currentYear, currentMonth, dayNum);
                    cellDate.setHours(23, 59, 59, 999);
                    const isPast = cellDate < today;
                    const isSelected = selectedDateStr === dateStr;

                    const isToday =
                      today.getFullYear() === currentYear &&
                      today.getMonth() === currentMonth &&
                      today.getDate() === dayNum;

                    return (
                      <button
                        key={dateStr}
                        type="button"
                        disabled={isPast}
                        onClick={() => handleDateSelect(dateStr)}
                        className={cn(
                          'relative h-11 w-full rounded-2xl flex flex-col items-center justify-center text-xs font-bold transition-all',
                          isSelected
                            ? 'text-white shadow-md scale-105 z-10'
                            : isPast
                            ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed'
                            : 'hover:bg-brand-50 dark:hover:bg-brand-950/50 hover:text-brand-600 text-slate-700 dark:text-slate-200 active:scale-95'
                        )}
                        style={
                          isSelected
                            ? { backgroundColor: brandColor }
                            : undefined
                        }
                      >
                        <span>{dayNum}</span>

                        {/* Dot indicator for today */}
                        {isToday && !isSelected && (
                          <span
                            className="w-1 h-1 rounded-full absolute bottom-1.5"
                            style={{ backgroundColor: brandColor }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Slots Rail (5 cols) */}
              <div className="md:col-span-5 flex flex-col space-y-3 pt-2 md:pt-0 border-t md:border-t-0 md:border-l border-slate-200/80 dark:border-slate-800 md:pl-6">
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                    Available Times
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {selectedDateStr
                      ? new Date(selectedDateStr + 'T00:00:00').toLocaleDateString([], {
                          weekday: 'long',
                          month: 'short',
                          day: 'numeric',
                        })
                      : 'Pick a date to view slots'}
                  </p>
                </div>

                {/* Morning / Afternoon / Evening Filter Pills */}
                {slots.length > 0 && (
                  <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => setTimeOfDayFilter('all')}
                      className={cn(
                        'flex-1 py-1 rounded-lg transition-all text-center',
                        timeOfDayFilter === 'all'
                          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-extrabold'
                          : 'text-slate-500'
                      )}
                    >
                      All ({slotCounts.all})
                    </button>

                    <button
                      type="button"
                      onClick={() => setTimeOfDayFilter('morning')}
                      className={cn(
                        'flex-1 py-1 rounded-lg transition-all text-center',
                        timeOfDayFilter === 'morning'
                          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-extrabold'
                          : 'text-slate-500'
                      )}
                    >
                      AM ({slotCounts.morning})
                    </button>

                    <button
                      type="button"
                      onClick={() => setTimeOfDayFilter('afternoon')}
                      className={cn(
                        'flex-1 py-1 rounded-lg transition-all text-center',
                        timeOfDayFilter === 'afternoon'
                          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-extrabold'
                          : 'text-slate-500'
                      )}
                    >
                      PM ({slotCounts.afternoon})
                    </button>
                  </div>
                )}

                {/* Slots List Container */}
                <div className="flex-1 overflow-y-auto max-h-[360px] pr-1 space-y-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
                  {isLoadingSlots ? (
                    <div className="py-16 text-center text-xs font-semibold text-slate-400 flex flex-col items-center justify-center gap-2">
                      <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
                      <span>Checking calendar availability...</span>
                    </div>
                  ) : filteredSlots.length === 0 ? (
                    <div className="py-12 text-center text-xs font-semibold text-slate-400 flex flex-col items-center justify-center gap-1.5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700">
                      <Clock className="h-6 w-6 text-slate-400 mb-1" />
                      <p className="font-bold text-slate-700 dark:text-slate-300">
                        No available slots
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Please select another date on the calendar.
                      </p>
                    </div>
                  ) : (
                    filteredSlots.map((slot) => {
                      const isChosen =
                        selectedSlot && selectedSlot.startTime === slot.startTime;

                      return (
                        <div
                          key={slot.startTime}
                          className="flex items-center gap-2 animate-in fade-in duration-150"
                        >
                          <button
                            type="button"
                            onClick={() => setSelectedSlot(slot)}
                            className={cn(
                              'flex-1 h-11 px-3 rounded-2xl font-bold text-xs border transition-all flex items-center justify-center',
                              isChosen
                                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent shadow-md'
                                : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-brand-500 text-slate-800 dark:text-slate-200 hover:bg-brand-50/50 dark:hover:bg-brand-950/30'
                            )}
                          >
                            <span>{formatSlotTime(slot.startTime)}</span>
                          </button>

                          {/* "Next" Confirm button pops out once slot is chosen */}
                          {isChosen && (
                            <Button
                              type="button"
                              onClick={() => setStage('form')}
                              className="h-11 px-4 rounded-2xl text-white font-bold text-xs shadow-md animate-in slide-in-from-left-2 duration-150"
                              style={{ backgroundColor: brandColor }}
                            >
                              Next
                            </Button>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* ============================================================ */
            /* STAGE 2: Attendee Details & Custom Questions Form */
            /* ============================================================ */
            <div className="space-y-6 animate-in fade-in duration-200 max-w-xl mx-auto w-full">
              {/* Back Button */}
              <button
                type="button"
                onClick={() => setStage('picker')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to calendar</span>
              </button>

              <div className="border-b border-slate-200/80 dark:border-slate-800 pb-3">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Enter Your Details
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  We will send calendar invitations and video meeting links to this email.
                </p>
              </div>

              <form onSubmit={handleBookingSubmit} className="space-y-4">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Your Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="h-4 w-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <Input
                      type="text"
                      required
                      placeholder="e.g. Alex Johnson"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="pl-10 h-11 rounded-2xl"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="h-4 w-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <Input
                      type="email"
                      required
                      placeholder="e.g. alex@company.com"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      className="pl-10 h-11 rounded-2xl"
                    />
                  </div>
                </div>

                {/* Optional Phone Number */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>Phone Number (Optional)</span>
                    <span className="text-[10px] text-slate-400 font-normal">For SMS reminders</span>
                  </label>
                  <div className="relative">
                    <Phone className="h-4 w-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <Input
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      className="pl-10 h-11 rounded-2xl"
                    />
                  </div>
                </div>

                {/* Additional Guests Email Chips */}
                <div>
                  {!showAddGuests && guestEmails.length === 0 ? (
                    <button
                      type="button"
                      onClick={() => setShowAddGuests(true)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline"
                    >
                      <Users className="h-3.5 w-3.5" />
                      <span>+ Add Colleagues / Guests</span>
                    </button>
                  ) : (
                    <div className="space-y-2 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 animate-in fade-in duration-150">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                          Colleagues / Guests
                        </label>
                        <span className="text-[10px] text-slate-400">
                          Press Enter or comma to add
                        </span>
                      </div>

                      {/* Render active chips */}
                      {guestEmails.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {guestEmails.map((email) => (
                            <span
                              key={email}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white dark:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 shadow-2xs"
                            >
                              <span>{email}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveGuestEmail(email)}
                                className="text-slate-400 hover:text-rose-500 transition-colors"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}

                      <Input
                        type="email"
                        placeholder="Type colleague email and press Enter..."
                        value={guestEmailInput}
                        onChange={(e) => setGuestEmailInput(e.target.value)}
                        onKeyDown={handleAddGuestEmail}
                        className="h-10 rounded-xl"
                      />
                    </div>
                  )}
                </div>

                {/* Custom Questions Defined on the Event */}
                {eventType.customQuestions &&
                  Array.isArray(eventType.customQuestions) &&
                  eventType.customQuestions.map((q: any) => (
                    <div key={q.id || q.label} className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        {q.label} {q.required && <span className="text-rose-500">*</span>}
                      </label>
                      <Input
                        required={q.required}
                        placeholder={q.placeholder || ''}
                        value={customAnswers[q.id || q.label] || ''}
                        onChange={(e) =>
                          setCustomAnswers({
                            ...customAnswers,
                            [q.id || q.label]: e.target.value,
                          })
                        }
                        className="h-11 rounded-2xl"
                      />
                    </div>
                  ))}

                {/* Preparation Notes */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Meeting Context & Agenda
                  </label>
                  <Textarea
                    rows={3}
                    placeholder="Please share anything that will help us prepare for the meeting..."
                    value={guestNotes}
                    onChange={(e) => setGuestNotes(e.target.value)}
                    className="rounded-2xl"
                  />
                </div>

                {/* Submission Error Banner */}
                {submitError && (
                  <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs font-semibold text-rose-700 dark:text-rose-300 animate-in shake duration-200">
                    {submitError}
                  </div>
                )}

                {/* Submit Action */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 rounded-2xl text-white font-bold text-sm shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-95 transition-all"
                    style={{ backgroundColor: brandColor }}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Confirming reservation...</span>
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 stroke-[3]" />
                        <span>Confirm Booking</span>
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* TIMEZONE MODAL SEARCH DIALOG */}
      {/* ============================================================ */}
      {isTimezoneModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsTimezoneModalOpen(false)}
          />

          <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl max-w-md w-full z-10 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-brand-500" />
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  Select Your Timezone
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsTimezoneModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative my-4">
              <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-3.5" />
              <Input
                type="text"
                placeholder="Search city or timezone..."
                value={timezoneSearch}
                onChange={(e) => setTimezoneSearch(e.target.value)}
                className="pl-10 h-10 rounded-xl"
              />
            </div>

            {/* Timezone List */}
            <div className="max-h-64 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
              {filteredTimezones.map((tz) => (
                <button
                  key={tz.value}
                  type="button"
                  onClick={() => {
                    setGuestTimeZone(tz.value);
                    setIsTimezoneModalOpen(false);
                    if (selectedDateStr) {
                      handleDateSelect(selectedDateStr);
                    }
                  }}
                  className={cn(
                    'w-full p-2.5 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition-colors',
                    guestTimeZone === tz.value
                      ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 font-bold'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  )}
                >
                  <div>
                    <p>{tz.label}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{tz.value}</p>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">{tz.offset}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
