'use client';

import React, { useState, useMemo } from 'react';
import {
  Clock,
  Plus,
  Trash2,
  Copy,
  Check,
  Save,
  ShieldCheck,
  Calendar,
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Zap,
  Info,
  CalendarDays,
  X,
  Flame,
  Coffee,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { saveWeeklyAvailability } from '@/app/actions/availability.actions';
import { cn } from '@/lib/utils';

interface WeeklyScheduleEditorProps {
  initialSchedules: any[];
  initialLimits: {
    bufferBeforeMin: number;
    bufferAfterMin: number;
    minNoticeHours: number;
    maxBookingsPerDay: number | null;
  };
}

const dayNames = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const timeOptions = [
  '06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
  '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30',
  '22:00', '22:30', '23:00',
];

const BUFFER_OPTIONS = [
  { value: 0, label: 'No buffer' },
  { value: 5, label: '5 mins' },
  { value: 10, label: '10 mins' },
  { value: 15, label: '15 mins (Recommended)' },
  { value: 30, label: '30 mins' },
  { value: 45, label: '45 mins' },
  { value: 60, label: '60 mins' },
];

const NOTICE_OPTIONS = [
  { value: 0, label: 'Instant (No minimum)' },
  { value: 1, label: '1 hour notice' },
  { value: 2, label: '2 hours notice' },
  { value: 4, label: '4 hours notice' },
  { value: 12, label: '12 hours notice' },
  { value: 24, label: '24 hours notice (Recommended)' },
  { value: 48, label: '48 hours notice' },
];

export function WeeklyScheduleEditor({ initialSchedules, initialLimits }: WeeklyScheduleEditorProps) {
  // Normalize schedules for all 7 days (0 to 6)
  const defaultDays = [0, 1, 2, 3, 4, 5, 6].map((day) => {
    const existing = initialSchedules.find((s) => s.dayOfWeek === day);
    return {
      dayOfWeek: day,
      isAvailable: existing ? existing.isAvailable : day >= 1 && day <= 5,
      startTime: existing?.startTime || '09:00',
      endTime: existing?.endTime || '17:00',
    };
  });

  const [days, setDays] = useState(defaultDays);
  const [bufferBefore, setBufferBefore] = useState(initialLimits.bufferBeforeMin || 0);
  const [bufferAfter, setBufferAfter] = useState(initialLimits.bufferAfterMin || 15);
  const [minNotice, setMinNotice] = useState(initialLimits.minNoticeHours || 2);
  const [maxBookings, setMaxBookings] = useState<number | ''>(
    initialLimits.maxBookingsPerDay || ''
  );

  // Copy Hours Modal State
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [sourceDayForCopy, setSourceDayForCopy] = useState<number>(1); // Monday default
  const [targetDaysForCopy, setTargetDaysForCopy] = useState<number[]>([2, 3, 4, 5]);

  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const [activeTab, setActiveTab] = useState<'schedule' | 'buffers' | 'heatmap'>('schedule');

  // Toggle Day Available
  const handleToggleDay = (dayIndex: number) => {
    const updated = [...days];
    updated[dayIndex].isAvailable = !updated[dayIndex].isAvailable;
    setDays(updated);
  };

  // Change Times for a Day
  const handleTimeChange = (
    dayIndex: number,
    field: 'startTime' | 'endTime',
    value: string
  ) => {
    const updated = [...days];
    updated[dayIndex][field] = value;
    setDays(updated);
  };

  // Copy Hours to Target Days Handler
  const handleApplyCopiedHours = () => {
    const source = days[sourceDayForCopy];
    const updated = days.map((d) => {
      if (targetDaysForCopy.includes(d.dayOfWeek)) {
        return {
          ...d,
          isAvailable: true,
          startTime: source.startTime,
          endTime: source.endTime,
        };
      }
      return d;
    });
    setDays(updated);
    setIsCopyModalOpen(false);
  };

  // Calculate Total Available Hours per week
  const totalWeeklyAvailableHours = useMemo(() => {
    let totalMinutes = 0;
    days.forEach((d) => {
      if (d.isAvailable) {
        const [startH, startM] = d.startTime.split(':').map(Number);
        const [endH, endM] = d.endTime.split(':').map(Number);
        const diff = endH * 60 + endM - (startH * 60 + startM);
        if (diff > 0) totalMinutes += diff;
      }
    });
    return Math.round((totalMinutes / 60) * 10) / 10;
  }, [days]);

  // Save Weekly Availability Handler
  const handleSave = async () => {
    setIsLoading(true);
    setSuccessMsg(false);

    try {
      await saveWeeklyAvailability({
        schedules: days,
        bufferBeforeMin: Number(bufferBefore),
        bufferAfterMin: Number(bufferAfter),
        minNoticeHours: Number(minNotice),
        maxBookingsPerDay: maxBookings === '' ? null : Number(maxBookings),
      });
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* ============================================================ */}
      {/* 1. Header with Stats & Save CTA */}
      {/* ============================================================ */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-200/60 dark:border-brand-900/60">
              <Clock className="w-3 h-3 text-brand-500" />
              Scheduling Engine Rules
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
            Weekly Hours & Buffer Intervals
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            You currently offer <span className="font-bold text-slate-800 dark:text-slate-200">{totalWeeklyAvailableHours} hours</span> of bookable capacity every week.
          </p>
        </div>

        <Button
          onClick={handleSave}
          disabled={isLoading}
          className="h-11 px-6 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 active:scale-95 transition-all self-start sm:self-center"
        >
          {successMsg ? (
            <>
              <Check className="h-4 w-4 mr-1.5 text-emerald-300 stroke-[3]" />
              <span>Saved Successfully!</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-1.5" />
              <span>{isLoading ? 'Saving...' : 'Save Schedule'}</span>
            </>
          )}
        </Button>
      </div>

      {/* Navigation Pills */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('schedule')}
          className={cn(
            'px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 active:scale-95',
            activeTab === 'schedule'
              ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          )}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Working Hours</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('buffers')}
          className={cn(
            'px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 active:scale-95',
            activeTab === 'buffers'
              ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          )}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Buffers & Notice Limits</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('heatmap')}
          className={cn(
            'px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 active:scale-95',
            activeTab === 'heatmap'
              ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          )}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>Capacity Breakdown</span>
        </button>
      </div>

      {/* ============================================================ */}
      {/* 2. TAB 1: WEEKLY WORKING HOURS LIST */}
      {/* ============================================================ */}
      {activeTab === 'schedule' && (
        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden animate-in fade-in duration-150">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Standard Working Windows
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Turn days on or off and set start and end hours.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsCopyModalOpen(true)}
              className="rounded-xl text-xs font-semibold h-9"
            >
              <Copy className="w-3.5 h-3.5 mr-1.5" />
              Copy Hours to Other Days
            </Button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {days.map((item, idx) => (
              <div
                key={item.dayOfWeek}
                className={cn(
                  'p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors',
                  item.isAvailable
                    ? 'hover:bg-slate-50/60 dark:hover:bg-slate-800/30'
                    : 'bg-slate-50/40 dark:bg-slate-950/40 opacity-70'
                )}
              >
                {/* Left: Day & Toggle Switch */}
                <div className="flex items-center gap-3.5 min-w-[150px]">
                  <Switch
                    checked={item.isAvailable}
                    onCheckedChange={() => handleToggleDay(idx)}
                  />
                  <div>
                    <p className="font-extrabold text-sm text-slate-900 dark:text-white">
                      {dayNames[item.dayOfWeek]}
                    </p>
                    <p className="text-[11px] text-slate-400 font-medium">
                      {item.isAvailable ? 'Available' : 'Unavailable'}
                    </p>
                  </div>
                </div>

                {/* Right: Time Selectors or Unavailable State */}
                {item.isAvailable ? (
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <select
                      value={item.startTime}
                      onChange={(e) => handleTimeChange(idx, 'startTime', e.target.value)}
                      className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold text-slate-800 dark:text-slate-200 outline-none focus:border-brand-500 cursor-pointer"
                    >
                      {timeOptions.map((t) => (
                        <option key={`start-${t}`} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>

                    <span className="text-xs text-slate-400 font-semibold">—</span>

                    <select
                      value={item.endTime}
                      onChange={(e) => handleTimeChange(idx, 'endTime', e.target.value)}
                      className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold text-slate-800 dark:text-slate-200 outline-none focus:border-brand-500 cursor-pointer"
                    >
                      {timeOptions.map((t) => (
                        <option key={`end-${t}`} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => {
                        setSourceDayForCopy(idx);
                        setIsCopyModalOpen(true);
                      }}
                      className="p-2 rounded-xl text-slate-400 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-1"
                      title="Copy these hours to other days"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="text-xs font-semibold text-slate-400 italic">
                    Unavailable all day (Blocked from bookings)
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 3. TAB 2: BUFFERS & NOTICE LIMITS */}
      {/* ============================================================ */}
      {activeTab === 'buffers' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-brand-500" />
                Anti-Burnout & Buffer Settings
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Buffers automatically add padding before and after meetings so you have time to decompress, take notes, or prepare.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Buffer Before */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Buffer Before Meeting</span>
                  <Coffee className="w-3.5 h-3.5 text-slate-400" />
                </label>
                <select
                  value={bufferBefore}
                  onChange={(e) => setBufferBefore(Number(e.target.value))}
                  className="w-full h-11 px-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold text-xs outline-none cursor-pointer"
                >
                  {BUFFER_OPTIONS.map((opt) => (
                    <option key={`before-${opt.value}`} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400">
                  Prep time added immediately before each scheduled appointment.
                </p>
              </div>

              {/* Buffer After */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Buffer After Meeting</span>
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                </label>
                <select
                  value={bufferAfter}
                  onChange={(e) => setBufferAfter(Number(e.target.value))}
                  className="w-full h-11 px-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold text-xs outline-none cursor-pointer"
                >
                  {BUFFER_OPTIONS.map((opt) => (
                    <option key={`after-${opt.value}`} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400">
                  Cooldown time to prevent back-to-back meeting fatigue.
                </p>
              </div>

              {/* Minimum Notice */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Minimum Booking Notice</span>
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                </label>
                <select
                  value={minNotice}
                  onChange={(e) => setMinNotice(Number(e.target.value))}
                  className="w-full h-11 px-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold text-xs outline-none cursor-pointer"
                >
                  {NOTICE_OPTIONS.map((opt) => (
                    <option key={`notice-${opt.value}`} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400">
                  Prevents invitees from booking appointments without sufficient advance warning.
                </p>
              </div>

              {/* Max Bookings Per Day */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Max Bookings Per Day Limit</span>
                  <Sliders className="w-3.5 h-3.5 text-slate-400" />
                </label>
                <Input
                  type="number"
                  min={1}
                  max={50}
                  placeholder="e.g. 5 (Leave blank for unlimited)"
                  value={maxBookings}
                  onChange={(e) =>
                    setMaxBookings(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  className="h-11 rounded-2xl text-xs font-mono"
                />
                <p className="text-[11px] text-slate-400">
                  Once this limit is reached in a single day, remaining slots are hidden.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 4. TAB 3: CAPACITY BREAKDOWN HEATMAP */}
      {/* ============================================================ */}
      {activeTab === 'heatmap' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5 animate-in fade-in duration-150">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              Weekly Capacity Overview
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Visual overview of your available hours per day.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-7 gap-3 pt-2">
            {days.map((d) => {
              const [startH, startM] = d.startTime.split(':').map(Number);
              const [endH, endM] = d.endTime.split(':').map(Number);
              const hours = d.isAvailable ? Math.max(0, (endH * 60 + endM - (startH * 60 + startM)) / 60) : 0;

              return (
                <div
                  key={d.dayOfWeek}
                  className={cn(
                    'p-4 rounded-2xl border text-center space-y-2',
                    d.isAvailable
                      ? 'border-brand-200 dark:border-brand-800/60 bg-brand-50/40 dark:bg-brand-950/20'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 opacity-60'
                  )}
                >
                  <p className="font-bold text-xs text-slate-500">{dayNames[d.dayOfWeek]}</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">
                    {hours} <span className="text-xs font-normal text-slate-400">hrs</span>
                  </p>
                  <p className="text-[10px] font-mono text-slate-400">
                    {d.isAvailable ? `${d.startTime} - ${d.endTime}` : 'Blocked'}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 5. COPY HOURS MODAL DIALOG */}
      {/* ============================================================ */}
      {isCopyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsCopyModalOpen(false)}
          />

          <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl max-w-md w-full z-10 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Copy className="w-4 h-4 text-brand-500" />
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Copy Working Hours
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCopyModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Copy hours from <span className="font-bold text-brand-600">{dayNames[sourceDayForCopy]}</span> ({days[sourceDayForCopy].startTime} - {days[sourceDayForCopy].endTime}) to:
              </p>

              {/* Target Days Checkboxes */}
              <div className="grid grid-cols-2 gap-2 pt-3">
                {days
                  .filter((d) => d.dayOfWeek !== sourceDayForCopy)
                  .map((d) => {
                    const isChecked = targetDaysForCopy.includes(d.dayOfWeek);

                    return (
                      <label
                        key={d.dayOfWeek}
                        className={cn(
                          'p-2.5 rounded-xl border flex items-center gap-2.5 cursor-pointer text-xs font-semibold transition-all',
                          isChecked
                            ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 font-bold'
                            : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setTargetDaysForCopy([...targetDaysForCopy, d.dayOfWeek]);
                            } else {
                              setTargetDaysForCopy(
                                targetDaysForCopy.filter((item) => item !== d.dayOfWeek)
                              );
                            }
                          }}
                          className="rounded border-slate-300 text-brand-600"
                        />
                        <span>{dayNames[d.dayOfWeek]}</span>
                      </label>
                    );
                  })}
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <Button
                variant="outline"
                className="flex-1 rounded-2xl h-11 text-xs font-bold"
                onClick={() => setIsCopyModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 rounded-2xl h-11 text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white"
                onClick={handleApplyCopiedHours}
              >
                Apply Hours
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
