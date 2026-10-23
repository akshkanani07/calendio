'use client';

import React, { useState } from 'react';
import { Clock, Video, Globe, Check, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

export function InteractiveBookingPreview() {
  const [selectedDay, setSelectedDay] = useState(24);
  const [selectedTime, setSelectedTime] = useState<string | null>('10:00am');
  const [isBooked, setIsBooked] = useState(false);

  const days = [
    { day: 19, active: false, disabled: true },
    { day: 20, active: false, disabled: true },
    { day: 21, active: false, disabled: true },
    { day: 22, active: false, disabled: true },
    { day: 23, active: false, disabled: false },
    { day: 24, active: true, disabled: false },
    { day: 25, active: false, disabled: false },
    { day: 26, active: false, disabled: false },
    { day: 27, active: false, disabled: false },
    { day: 28, active: false, disabled: false },
    { day: 29, active: false, disabled: false },
    { day: 30, active: false, disabled: false },
  ];

  const timeSlots = ['09:30am', '10:00am', '11:30am', '02:00pm', '03:30pm', '04:30pm'];

  return (
    <div className="relative w-full max-w-4xl mx-auto rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden text-left">
      {/* Top Banner Ribbon */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-500 py-2.5 px-4 text-center text-xs font-semibold text-white tracking-wide flex items-center justify-center gap-2">
        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        Live Interactive Experience • Try scheduling right here!
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[480px]">
        {/* Left Column */}
        <div className="lg:col-span-5 p-6 sm:p-8 border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-800 flex flex-col justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-full bg-brand-500 text-white font-bold text-lg flex items-center justify-center shadow-md shadow-brand-500/20">
                SP
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Host
                </span>
                <h4 className="font-bold text-slate-900 dark:text-white text-base leading-tight">
                  Your Name
                </h4>
              </div>
            </div>

            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
              30 Minute Discovery Call
            </h3>

            <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300 mb-6">
              <div className="flex items-center gap-2.5 font-medium">
                <Clock className="h-4 w-4 text-slate-400 shrink-0" />
                <span>30 mins</span>
              </div>
              <div className="flex items-center gap-2.5 font-medium">
                <Video className="h-4 w-4 text-slate-400 shrink-0" />
                <span>Google Meet (Auto-generated video link)</span>
              </div>
              <div className="flex items-center gap-2.5 font-medium">
                <Globe className="h-4 w-4 text-slate-400 shrink-0" />
                <span>India Standard Time (IST)</span>
              </div>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-200/70 dark:border-slate-800 pt-4">
              Let&apos;s connect to discuss your project requirements, roadmap, and scheduling workflows. Please pick a time slot that works best for you.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200/70 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Powered by <strong>Calendio</strong></span>
            <span className="text-brand-500 font-semibold">100% Free Forever</span>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
          {isBooked ? (
            <div className="flex flex-col items-center justify-center text-center py-12 px-4 space-y-4 my-auto">
              <div className="h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-lg">
                <Check className="h-8 w-8 stroke-[3]" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                You are scheduled!
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
                A calendar invitation with the Google Meet link has been sent to your email for <strong>October {selectedDay}, 2026 at {selectedTime}</strong>.
              </p>
              <button
                onClick={() => setIsBooked(false)}
                className="mt-4 text-xs font-semibold text-brand-500 hover:underline"
              >
                ← Test scheduling another time
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h4 className="font-bold text-slate-900 dark:text-white text-lg flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-brand-500" />
                  Select a Date & Time
                </h4>
                <div className="flex items-center gap-1 text-slate-500 text-sm font-semibold">
                  <span>October 2026</span>
                  <div className="flex items-center gap-0.5 ml-2">
                    <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-400" disabled>
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-700 dark:text-slate-200">
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Dates */}
                <div>
                  <div className="grid grid-cols-5 gap-2 text-center text-xs font-semibold text-slate-400 mb-2">
                    <span>MON</span>
                    <span>TUE</span>
                    <span>WED</span>
                    <span>THU</span>
                    <span>FRI</span>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {days.slice(0, 10).map((item, idx) => (
                      <button
                        key={idx}
                        disabled={item.disabled}
                        onClick={() => setSelectedDay(item.day)}
                        className={`h-10 w-full rounded-xl text-sm font-semibold transition-all duration-150 flex items-center justify-center ${
                          selectedDay === item.day
                            ? 'bg-brand-500 text-white shadow-md shadow-brand-500/30 font-bold scale-105'
                            : item.disabled
                            ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed'
                            : 'text-slate-700 dark:text-slate-200 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-slate-800 font-medium'
                        }`}
                      >
                        {item.day}
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-4">
                    • Time zone: <strong>Asia/Kolkata (IST)</strong>
                  </p>
                </div>

                {/* Slots */}
                <div className="flex flex-col space-y-2">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    Friday, Oct {selectedDay}
                  </span>
                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {timeSlots.map((time) => (
                      <div key={time} className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedTime(time)}
                          className={`w-full py-2.5 px-3 rounded-xl border text-sm font-semibold transition-all duration-150 text-center ${
                            selectedTime === time
                              ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300 shadow-sm'
                              : 'border-slate-200 dark:border-slate-800 hover:border-brand-500 hover:text-brand-500 text-slate-700 dark:text-slate-200'
                          }`}
                        >
                          {time}
                        </button>
                        {selectedTime === time && (
                          <button
                            onClick={() => setIsBooked(true)}
                            className="bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold py-2.5 px-3 rounded-xl shadow-sm transition-all animate-fade-in shrink-0"
                          >
                            Confirm
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Instant confirmation with Google Meet / Zoom link</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
              <Check className="h-3.5 w-3.5" /> Available now
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
