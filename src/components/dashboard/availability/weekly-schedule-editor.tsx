'use client';

import React, { useState } from 'react';
import { Clock, Plus, Trash2, Copy, Check, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { saveWeeklyAvailability } from '@/app/actions/availability.actions';

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
  '06:00', '07:00', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
  '19:00', '20:00', '21:00', '22:00'
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
  const [maxBookings, setMaxBookings] = useState<number | ''>(initialLimits.maxBookingsPerDay || '');

  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  // Toggle Day Available
  const handleToggleDay = (dayIndex: number) => {
    const updated = [...days];
    updated[dayIndex].isAvailable = !updated[dayIndex].isAvailable;
    setDays(updated);
  };

  // Change Times
  const handleTimeChange = (dayIndex: number, field: 'startTime' | 'endTime', value: string) => {
    const updated = [...days];
    updated[dayIndex][field] = value;
    setDays(updated);
  };

  // Calendly signature feature: Copy Monday hours to all working days (Mon-Fri)
  const handleCopyHoursToAllWeekdays = (sourceDayIndex: number) => {
    const source = days[sourceDayIndex];
    const updated = days.map((d) => {
      if (d.dayOfWeek >= 1 && d.dayOfWeek <= 5) {
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
  };

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
    <div className="space-y-6">
      {/* Schedule Table / Days Card */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="h-4 w-4 text-brand-500" />
              Weekly Working Hours
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Set standard times when you are free to accept appointments.
            </p>
          </div>

          <Button
            onClick={handleSave}
            isLoading={isLoading}
            className="h-9 px-4 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/20"
          >
            {successMsg ? (
              <>
                <Check className="h-3.5 w-3.5 mr-1.5 text-emerald-300 stroke-[3]" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5 mr-1.5" />
                <span>Save Schedule</span>
              </>
            )}
          </Button>
        </div>

        {/* Days Rows */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
          {days.map((item, idx) => (
            <div
              key={item.dayOfWeek}
              className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
            >
              {/* Day Name & Active Switch */}
              <div className="flex items-center gap-3 w-36">
                <Switch
                  checked={item.isAvailable}
                  onCheckedChange={() => handleToggleDay(idx)}
                />
                <span className={'text-xs font-bold ' + (item.isAvailable ? 'text-slate-900 dark:text-white' : 'text-slate-400 line-through')}>
                  {dayNames[item.dayOfWeek]}
                </span>
              </div>

              {/* Time Slots or Unavailable Pill */}
              <div className="flex-1 flex items-center gap-3">
                {item.isAvailable ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={item.startTime}
                      onChange={(e) => handleTimeChange(idx, 'startTime', e.target.value)}
                      className="h-9 px-3 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      {timeOptions.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>

                    <span className="text-slate-400 font-medium text-xs">-</span>

                    <select
                      value={item.endTime}
                      onChange={(e) => handleTimeChange(idx, 'endTime', e.target.value)}
                      className="h-9 px-3 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      {timeOptions.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                    Unavailable
                  </span>
                )}
              </div>

              {/* Action: Copy to all weekdays */}
              {item.isAvailable && (
                <button
                  type="button"
                  onClick={() => handleCopyHoursToAllWeekdays(idx)}
                  className="text-xs font-semibold text-slate-400 hover:text-brand-500 flex items-center gap-1.5 transition-colors self-start sm:self-center"
                  title="Copy this schedule to Mon - Fri"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span className="hidden md:inline">Copy to Mon - Fri</span>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Scheduling Limits & Buffer Times Card */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-6 space-y-6">
        <div>
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
            Meeting Buffers & Minimum Notice
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Prevent back-to-back fatigue by giving yourself breathers between meetings.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Buffer Before */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Buffer Before Call
            </label>
            <select
              value={bufferBefore}
              onChange={(e) => setBufferBefore(Number(e.target.value))}
              className="w-full h-10 px-3 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            >
              <option value={0}>No buffer</option>
              <option value={5}>5 mins before</option>
              <option value={10}>10 mins before</option>
              <option value={15}>15 mins before</option>
              <option value={30}>30 mins before</option>
            </select>
          </div>

          {/* Buffer After */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Buffer After Call
            </label>
            <select
              value={bufferAfter}
              onChange={(e) => setBufferAfter(Number(e.target.value))}
              className="w-full h-10 px-3 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            >
              <option value={0}>No buffer</option>
              <option value={5}>5 mins after</option>
              <option value={10}>10 mins after</option>
              <option value={15}>15 mins after</option>
              <option value={30}>30 mins after</option>
              <option value={45}>45 mins after</option>
            </select>
          </div>

          {/* Minimum Notice */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Minimum Notice
            </label>
            <select
              value={minNotice}
              onChange={(e) => setMinNotice(Number(e.target.value))}
              className="w-full h-10 px-3 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            >
              <option value={1}>1 hour in advance</option>
              <option value={2}>2 hours in advance</option>
              <option value={4}>4 hours in advance</option>
              <option value={24}>24 hours (1 day)</option>
              <option value={48}>48 hours (2 days)</option>
            </select>
          </div>

          {/* Max Bookings per Day */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Max Meetings Per Day
            </label>
            <input
              type="number"
              placeholder="Unlimited"
              value={maxBookings}
              onChange={(e) => setMaxBookings(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full h-10 px-3 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            onClick={handleSave}
            isLoading={isLoading}
            className="h-10 px-6 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/20"
          >
            Save All Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
