'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Globe,
  Calendar,
  ArrowLeft,
  Check,
  User,
  Mail,
  FileText,
  Loader2,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { getAvailableSlotsForDate, createPublicBooking } from '@/app/actions/booking.actions';

interface BookingFlowProps {
  host: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    timeZone: string;
    username: string;
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
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-indexed

  // Selected date & slot
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);
  const [slots, setSlots] = useState<any[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<any | null>(null);

  // Stage 1 (Date/Time Picker) or Stage 2 (Attendee Form)
  const [stage, setStage] = useState<'picker' | 'form'>('picker');

  // Form Fields
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestNotes, setGuestNotes] = useState('');
  const [guestTimeZone, setGuestTimeZone] = useState(
    typeof Intl !== 'undefined'
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : host.timeZone || 'Asia/Kolkata'
  );
  const [showAddGuests, setShowAddGuests] = useState(false);
  const [additionalGuestInput, setAdditionalGuestInput] = useState('');
  const [customAnswers, setCustomAnswers] = useState<Record<string, any>>({});

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Calendar calculations
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  // Navigate Months
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

  // Fetch slots whenever a date is clicked
  const handleDateClick = async (dayNumber: number) => {
    const formattedMonth = String(currentMonth + 1).padStart(2, '0');
    const formattedDay = String(dayNumber).padStart(2, '0');
    const dateStr = `${currentYear}-${formattedMonth}-${formattedDay}`;

    setSelectedDateStr(dateStr);
    setSelectedSlot(null);
    setIsLoadingSlots(true);

    try {
      const res = await getAvailableSlotsForDate({
        hostId: host.id,
        eventDuration: eventType.duration,
        dateStr,
      });

      if (res.success) {
        setSlots(res.slots || []);
      } else {
        setSlots([]);
      }
    } catch (err) {
      console.error(err);
      setSlots([]);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  // Format chosen slot summary
  const getSelectedSlotSummary = () => {
    if (!selectedSlot || !selectedDateStr) return '';
    const [y, m, d] = selectedDateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    const dateFormatted = date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
    return `${selectedSlot.formatted}, ${dateFormatted}`;
  };

  // Submit Booking
  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot || !guestName.trim() || !guestEmail.trim()) {
      setSubmitError('Please fill in your name and a valid email address.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const additionalGuests = additionalGuestInput
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0 && s.includes('@'));

      const res = await createPublicBooking({
        hostId: host.id,
        eventTypeId: eventType.id,
        guestName: guestName.trim(),
        guestEmail: guestEmail.trim(),
        guestNotes: guestNotes.trim() || undefined,
        guestTimeZone,
        isoStart: selectedSlot.isoStart,
        isoEnd: selectedSlot.isoEnd,
        answers: customAnswers,
        additionalGuests: additionalGuests.length > 0 ? additionalGuests : undefined,
      });

      if (res.success && res.uid) {
        router.push(`/${host.username}/${eventType.slug}/confirmation?uid=${res.uid}`);
      } else {
        setSubmitError(res.error || 'Failed to complete booking. Please try again.');
        setIsSubmitting(false);
      }
    } catch (err: any) {
      console.error(err);
      setSubmitError(err.message || 'An unexpected error occurred.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      {stage === 'picker' ? (
        /* STAGE 1: CALENDAR & TIME SLOT PICKER */
        <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800">
          {/* Calendar Picker Left Column */}
          <div className="p-6 sm:p-8 flex-1">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
              Select a Date & Time
            </h2>

            {/* Month Header Navigation */}
            <div className="flex items-center justify-between mb-6">
              <span className="text-base font-bold text-slate-800 dark:text-slate-100">
                {monthNames[currentMonth]} {currentYear}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={handlePrevMonth}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={handleNextMonth}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Weekday Row */}
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day) => (
                <div
                  key={day}
                  className="text-[11px] font-bold text-slate-400 dark:text-slate-500 py-1"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Month Day Grid */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {/* Empty leading offset days */}
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} className="h-10 sm:h-11" />
              ))}

              {/* Day cells */}
              {Array.from({ length: daysInMonth }).map((_, index) => {
                const day = index + 1;
                const cellDate = new Date(currentYear, currentMonth, day);
                const isPast =
                  cellDate < new Date(today.getFullYear(), today.getMonth(), today.getDate());

                const formattedMonth = String(currentMonth + 1).padStart(2, '0');
                const formattedDay = String(day).padStart(2, '0');
                const dateKey = `${currentYear}-${formattedMonth}-${formattedDay}`;
                const isSelected = selectedDateStr === dateKey;

                return (
                  <button
                    key={day}
                    type="button"
                    disabled={isPast}
                    onClick={() => handleDateClick(day)}
                    className={`h-10 sm:h-11 w-full rounded-full flex flex-col items-center justify-center text-sm font-semibold transition-all relative
                      ${
                        isPast
                          ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed'
                          : isSelected
                          ? 'bg-brand-500 text-white font-bold shadow-md shadow-brand-500/25 scale-105'
                          : 'text-slate-700 dark:text-slate-200 hover:bg-brand-50 dark:hover:bg-brand-950/40 hover:text-brand-600 dark:hover:text-brand-400'
                      }
                    `}
                  >
                    <span>{day}</span>
                    {!isPast && !isSelected && (
                      <span className="w-1 h-1 rounded-full bg-brand-500/70 absolute bottom-1.5" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Time Zone Pill */}
            <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Globe className="h-3.5 w-3.5 text-brand-500 shrink-0" />
              <span className="font-medium">Time zone:</span>
              <span className="font-bold text-slate-700 dark:text-slate-300">{guestTimeZone}</span>
            </div>
          </div>

          {/* Time Slots Right Column */}
          <div className="p-6 sm:p-8 w-full lg:w-72 xl:w-80 flex flex-col justify-start">
            {!selectedDateStr ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 text-slate-400">
                <Calendar className="h-8 w-8 mb-2 opacity-40 text-brand-500" />
                <p className="text-xs font-medium">Select a date to view available times</p>
              </div>
            ) : isLoadingSlots ? (
              <div className="h-full flex flex-col items-center justify-center py-12 text-slate-400">
                <Loader2 className="h-6 w-6 animate-spin text-brand-500 mb-2" />
                <p className="text-xs font-medium">Loading available slots...</p>
              </div>
            ) : slots.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 text-slate-400">
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  No slots available
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  All times are booked or outside host hours on this day.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
                  Available Times
                </div>

                <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                  {slots.map((slot) => {
                    const isChosen = selectedSlot?.time === slot.time;

                    return (
                      <div key={slot.time} className="flex items-center gap-2">
                        {/* Time Slot Button */}
                        <button
                          type="button"
                          onClick={() => setSelectedSlot(slot)}
                          className={`flex-1 py-2.5 px-4 rounded-xl border text-sm font-bold transition-all text-center
                            ${
                              isChosen
                                ? 'bg-slate-800 text-white dark:bg-slate-700 border-transparent shadow-sm'
                                : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 text-brand-600 dark:text-brand-400 hover:border-brand-500 hover:bg-brand-50/50 dark:hover:bg-brand-950/30'
                            }
                          `}
                        >
                          {slot.formatted}
                        </button>

                        {/* Calendly Iconic Blue "Next" Button */}
                        {isChosen && (
                          <Button
                            type="button"
                            onClick={() => setStage('form')}
                            className="bg-brand-500 hover:bg-brand-600 text-white font-bold py-2.5 px-4 rounded-xl shadow-md shadow-brand-500/25 animate-fade-in"
                          >
                            Next
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* STAGE 2: ATTENDEE DETAILS FORM */
        <div className="p-6 sm:p-10 max-w-2xl mx-auto">
          {/* Back Button */}
          <button
            type="button"
            onClick={() => setStage('picker')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors mb-6 group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span>Back to date & time selection</span>
          </button>

          {/* Selected Slot Recap Badge */}
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-brand-50/80 dark:bg-brand-950/40 border border-brand-200/60 dark:border-brand-900/40 text-brand-700 dark:text-brand-300 mb-8">
            <Clock className="h-5 w-5 text-brand-500 shrink-0" />
            <div className="text-xs sm:text-sm font-bold">
              {getSelectedSlotSummary()} ({guestTimeZone})
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
            Enter Details
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-8">
            Please enter your contact information to finalize this meeting.
          </p>

          <form onSubmit={handleSubmitBooking} className="space-y-6">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Your Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="h-4 w-4 text-slate-400 absolute left-3.5 top-3.5" />
                <Input
                  required
                  placeholder="e.g. John Doe"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="pl-10 h-11 rounded-xl"
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="h-4 w-4 text-slate-400 absolute left-3.5 top-3.5" />
                <Input
                  type="email"
                  required
                  placeholder="e.g. john@example.com"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  className="pl-10 h-11 rounded-xl"
                />
              </div>
            </div>

            {/* Optional Add Guests Toggle */}
            <div>
              {!showAddGuests ? (
                <button
                  type="button"
                  onClick={() => setShowAddGuests(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline"
                >
                  <Users className="h-3.5 w-3.5" />
                  + Add Additional Guests
                </button>
              ) : (
                <div className="space-y-1.5 animate-fade-in">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Additional Guest Emails (Comma separated)
                  </label>
                  <Input
                    placeholder="e.g. colleague@example.com, manager@example.com"
                    value={additionalGuestInput}
                    onChange={(e) => setAdditionalGuestInput(e.target.value)}
                    className="h-11 rounded-xl"
                  />
                </div>
              )}
            </div>

            {/* Custom Questions if configured on EventType */}
            {eventType.customQuestions &&
              Array.isArray(eventType.customQuestions) &&
              eventType.customQuestions.map((q: any) => (
                <div key={q.id || q.label} className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    {q.label} {q.required && <span className="text-red-500">*</span>}
                  </label>
                  <Input
                    required={q.required}
                    placeholder={q.placeholder || ''}
                    value={customAnswers[q.id || q.label] || ''}
                    onChange={(e) =>
                      setCustomAnswers({ ...customAnswers, [q.id || q.label]: e.target.value })
                    }
                    className="h-11 rounded-xl"
                  />
                </div>
              ))}

            {/* Meeting Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Please share anything that will help prepare for our meeting
              </label>
              <Textarea
                rows={3}
                placeholder="Topics to discuss, project context, specific questions..."
                value={guestNotes}
                onChange={(e) => setGuestNotes(e.target.value)}
                className="rounded-xl"
              />
            </div>

            {/* Error Banner */}
            {submitError && (
              <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-xs font-semibold text-red-600 dark:text-red-400">
                {submitError}
              </div>
            )}

            {/* Submit CTA */}
            <div className="pt-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto h-12 px-8 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm shadow-md shadow-brand-500/25 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Scheduling meeting...</span>
                  </>
                ) : (
                  <span>Schedule Event</span>
                )}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
