'use client';

import React from 'react';
import { BarChart3, Sun, Sunset, Moon, Calendar } from 'lucide-react';

interface AnalyticsChartsProps {
  timeSeriesData: { label: string; confirmed: number; cancelled: number; rescheduled: number }[];
  dayDistribution: { day: string; count: number }[];
  timeOfDay: { morning: number; afternoon: number; evening: number };
}

export function AnalyticsCharts({
  timeSeriesData,
  dayDistribution,
  timeOfDay,
}: AnalyticsChartsProps) {
  // Max meeting count for chart normalization
  const maxVolume = Math.max(
    1,
    ...timeSeriesData.map((d) => d.confirmed + d.cancelled + d.rescheduled)
  );

  const maxDayCount = Math.max(1, ...dayDistribution.map((d) => d.count));
  const totalTimeOfDay = timeOfDay.morning + timeOfDay.afternoon + timeOfDay.evening || 1;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 1. Meeting Volume Chart (Left 2 cols) */}
      <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-brand-600" />
              Meeting Volume Over Time
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Scheduled meetings, cancellations, and reschedules by date
            </p>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-500" />
              Confirmed
            </span>
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              Rescheduled
            </span>
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              Cancelled
            </span>
          </div>
        </div>

        {/* Bar Visualizer */}
        <div className="pt-6">
          <div className="h-48 flex items-end gap-2 overflow-x-auto pb-2 border-b border-slate-100 dark:border-slate-800">
            {timeSeriesData.map((item, idx) => {
              const total = item.confirmed + item.cancelled + item.rescheduled;
              const heightPercent = total > 0 ? Math.max(12, (total / maxVolume) * 100) : 4;

              return (
                <div
                  key={idx}
                  className="flex-1 min-w-[28px] max-w-[48px] flex flex-col items-center gap-2 group relative h-full justify-end"
                >
                  {/* Tooltip */}
                  <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 p-1.5 rounded-lg bg-slate-900 text-white text-[10px] whitespace-nowrap shadow-xl">
                    <span className="font-bold">{item.label}</span>: {item.confirmed} confirmed,{' '}
                    {item.cancelled} cancelled
                  </div>

                  {/* Stacked Bar */}
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full rounded-t-lg bg-slate-100 dark:bg-slate-800 flex flex-col justify-end overflow-hidden transition-all group-hover:opacity-90"
                  >
                    {item.cancelled > 0 && (
                      <div
                        style={{ height: `${(item.cancelled / total) * 100}%` }}
                        className="w-full bg-rose-500"
                      />
                    )}
                    {item.rescheduled > 0 && (
                      <div
                        style={{ height: `${(item.rescheduled / total) * 100}%` }}
                        className="w-full bg-amber-500"
                      />
                    )}
                    {item.confirmed > 0 && (
                      <div
                        style={{ height: `${(item.confirmed / total) * 100}%` }}
                        className="w-full bg-brand-500"
                      />
                    )}
                  </div>

                  <span className="text-[10px] text-slate-400 font-medium truncate w-full text-center">
                    {item.label.split(' ')[0]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Days of Week & Peak Hours (Right 1 col) */}
      <div className="space-y-6">
        {/* Days of Week */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-brand-600" />
              Busiest Days of Week
            </h4>
          </div>

          <div className="space-y-2 pt-1">
            {dayDistribution.map((d) => {
              const pct = maxDayCount > 0 ? (d.count / maxDayCount) * 100 : 0;
              return (
                <div key={d.day} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-600 dark:text-slate-400">{d.day}</span>
                    <span className="text-slate-800 dark:text-slate-200 font-bold">
                      {d.count} meeting{d.count === 1 ? '' : 's'}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      style={{ width: `${pct}%` }}
                      className="h-full rounded-full bg-brand-500 transition-all duration-300"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Time of Day Preferences */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Time of Day Preference
          </h4>

          <div className="grid grid-cols-3 gap-2 pt-1">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-center space-y-1">
              <Sun className="w-4 h-4 text-amber-500 mx-auto" />
              <span className="text-[10px] text-slate-400 block">Morning</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                {timeOfDay.morning}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-center space-y-1">
              <Sunset className="w-4 h-4 text-orange-500 mx-auto" />
              <span className="text-[10px] text-slate-400 block">Afternoon</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                {timeOfDay.afternoon}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-center space-y-1">
              <Moon className="w-4 h-4 text-indigo-500 mx-auto" />
              <span className="text-[10px] text-slate-400 block">Evening</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                {timeOfDay.evening}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
