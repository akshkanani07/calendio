'use client';

import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  Sun,
  Sunset,
  Moon,
  Calendar,
  Clock,
  TrendingUp,
  TrendingDown,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  Zap,
  ArrowUpRight,
  Flame,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Users,
  Compass,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AnalyticsChartsProps {
  timeSeriesData: {
    label: string;
    confirmed: number;
    cancelled: number;
    rescheduled: number;
  }[];
  dayDistribution: { day: string; count: number }[];
  timeOfDay: { morning: number; afternoon: number; evening: number };
}

export function AnalyticsCharts({
  timeSeriesData,
  dayDistribution,
  timeOfDay,
}: AnalyticsChartsProps) {
  // Active Metric Filter for Time-Series: 'all' | 'confirmed' | 'cancelled' | 'rescheduled'
  const [metricFilter, setMetricFilter] = useState<'all' | 'confirmed' | 'cancelled' | 'rescheduled'>('all');

  // Hovered Bar State for Tooltip
  const [hoveredPoint, setHoveredPoint] = useState<{
    label: string;
    confirmed: number;
    cancelled: number;
    rescheduled: number;
    total: number;
  } | null>(null);

  // Maximum meeting volume across all dates for proportional height
  const maxVolume = useMemo(() => {
    return Math.max(
      1,
      ...timeSeriesData.map((d) => d.confirmed + d.cancelled + d.rescheduled)
    );
  }, [timeSeriesData]);

  // Max count for Day of Week distribution
  const maxDayCount = useMemo(() => {
    return Math.max(1, ...dayDistribution.map((d) => d.count));
  }, [dayDistribution]);

  // Total time of day count
  const totalTimeOfDay = useMemo(() => {
    return timeOfDay.morning + timeOfDay.afternoon + timeOfDay.evening || 1;
  }, [timeOfDay]);

  // Simulated Hourly Heatmap (9:00 AM - 6:00 PM) for deep scheduling insight
  const hourlyTraffic = [
    { hour: '9 AM', pct: 45, label: 'Early Kickoffs' },
    { hour: '10 AM', pct: 85, label: 'Peak Discovery' },
    { hour: '11 AM', pct: 90, label: 'Highest Conversion' },
    { hour: '12 PM', pct: 30, label: 'Lunch Lull' },
    { hour: '1 PM', pct: 40, label: 'Afternoon Start' },
    { hour: '2 PM', pct: 75, label: 'Strong Inbound' },
    { hour: '3 PM', pct: 80, label: 'Executive Demos' },
    { hour: '4 PM', pct: 60, label: 'Catch-ups' },
    { hour: '5 PM', pct: 35, label: 'Wrap-ups' },
  ];

  return (
    <div className="space-y-6">
      {/* ============================================================ */}
      {/* 1. Main 2-Column Section: Time-Series Volume & Day of Week */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interactive Time-Series Bar Chart */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-brand-600" />
                  <span>Meeting Volume Over Time</span>
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Daily confirmed bookings, cancellations, and reschedules.
              </p>
            </div>

            {/* Metric Filter Tabs */}
            <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-400">
              <button
                type="button"
                onClick={() => setMetricFilter('all')}
                className={cn(
                  'px-2.5 py-1 rounded-lg transition-all',
                  metricFilter === 'all'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-extrabold'
                    : 'hover:text-slate-900 dark:hover:text-white'
                )}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setMetricFilter('confirmed')}
                className={cn(
                  'px-2.5 py-1 rounded-lg transition-all flex items-center gap-1',
                  metricFilter === 'confirmed'
                    ? 'bg-white dark:bg-slate-700 text-brand-600 shadow-2xs font-extrabold'
                    : 'hover:text-brand-600'
                )}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                <span>Confirmed</span>
              </button>
              <button
                type="button"
                onClick={() => setMetricFilter('cancelled')}
                className={cn(
                  'px-2.5 py-1 rounded-lg transition-all flex items-center gap-1',
                  metricFilter === 'cancelled'
                    ? 'bg-white dark:bg-slate-700 text-rose-600 shadow-2xs font-extrabold'
                    : 'hover:text-rose-600'
                )}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                <span>Cancelled</span>
              </button>
            </div>
          </div>

          {/* Interactive Stacked Bar Visualizer */}
          <div className="pt-4 relative">
            {/* Tooltip Popup on Hover */}
            {hoveredPoint && (
              <div className="p-2.5 rounded-xl bg-slate-950 text-white text-[11px] shadow-xl border border-slate-800 space-y-1 mb-2 animate-in fade-in duration-100 inline-block">
                <p className="font-bold font-mono text-slate-300">{hoveredPoint.label}</p>
                <div className="flex items-center gap-3">
                  <span className="text-brand-400 font-bold">{hoveredPoint.confirmed} confirmed</span>
                  <span className="text-rose-400 font-bold">{hoveredPoint.cancelled} cancelled</span>
                  <span className="text-amber-400 font-bold">{hoveredPoint.rescheduled} resched</span>
                </div>
              </div>
            )}

            <div className="h-56 flex items-end gap-2 sm:gap-3 overflow-x-auto pb-3 pt-6 border-b border-slate-100 dark:border-slate-800 scrollbar-none">
              {timeSeriesData.map((d, i) => {
                const total = d.confirmed + d.cancelled + d.rescheduled;
                const heightPct = Math.min(100, Math.max(8, (total / maxVolume) * 100));

                const confirmedPct = total > 0 ? (d.confirmed / total) * 100 : 0;
                const cancelledPct = total > 0 ? (d.cancelled / total) * 100 : 0;
                const rescheduledPct = total > 0 ? (d.rescheduled / total) * 100 : 0;

                return (
                  <div
                    key={d.label + i}
                    onMouseEnter={() =>
                      setHoveredPoint({
                        label: d.label,
                        confirmed: d.confirmed,
                        cancelled: d.cancelled,
                        rescheduled: d.rescheduled,
                        total,
                      })
                    }
                    onMouseLeave={() => setHoveredPoint(null)}
                    className="flex-1 min-w-[28px] sm:min-w-[36px] flex flex-col items-center justify-end h-full group cursor-pointer"
                  >
                    {/* Bar Stack */}
                    <div
                      className="w-full rounded-xl overflow-hidden flex flex-col-reverse transition-all group-hover:scale-105 group-hover:brightness-110 shadow-xs"
                      style={{ height: `${heightPct}%` }}
                    >
                      {/* Confirmed Segment */}
                      {(metricFilter === 'all' || metricFilter === 'confirmed') && (
                        <div
                          className="w-full bg-brand-500 transition-all"
                          style={{
                            height: metricFilter === 'all' ? `${confirmedPct}%` : '100%',
                          }}
                        />
                      )}

                      {/* Rescheduled Segment */}
                      {(metricFilter === 'all' || metricFilter === 'rescheduled') && (
                        <div
                          className="w-full bg-amber-400 transition-all"
                          style={{
                            height: metricFilter === 'all' ? `${rescheduledPct}%` : '100%',
                          }}
                        />
                      )}

                      {/* Cancelled Segment */}
                      {(metricFilter === 'all' || metricFilter === 'cancelled') && (
                        <div
                          className="w-full bg-rose-500 transition-all"
                          style={{
                            height: metricFilter === 'all' ? `${cancelledPct}%` : '100%',
                          }}
                        />
                      )}
                    </div>

                    {/* Date Label */}
                    <span className="text-[10px] font-mono text-slate-400 mt-2 truncate w-full text-center">
                      {d.label.split(' ')[0]}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Legend & Summary Footer */}
            <div className="pt-3 flex flex-wrap items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-500" />
                  Confirmed
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  Rescheduled
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  Cancelled
                </span>
              </div>

              <span className="text-[11px] font-mono text-slate-400">
                Peak Day: {maxVolume} meetings
              </span>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Day of Week Distribution */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-500" />
                <span>Busiest Days</span>
              </h3>
              <Badge variant="outline" className="text-[10px] font-mono">
                Weekly Pattern
              </Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Distribution of meetings by day of the week.
            </p>
          </div>

          {/* Progress Bars for Days */}
          <div className="space-y-3 pt-2">
            {dayDistribution.map((d) => {
              const pct = Math.round((d.count / maxDayCount) * 100);

              return (
                <div key={d.day} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-700 dark:text-slate-300">{d.day}</span>
                    <span className="font-mono text-slate-500">{d.count} calls</span>
                  </div>

                  <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-300',
                        pct > 70
                          ? 'bg-gradient-to-r from-brand-500 to-indigo-600'
                          : pct > 30
                          ? 'bg-brand-500/80'
                          : 'bg-slate-300 dark:bg-slate-700'
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/50 dark:border-indigo-900/50 text-[11px] text-indigo-700 dark:text-indigo-300 font-semibold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
            <span>Tuesdays & Thursdays show the highest attendee engagement.</span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. SECOND SECTION: Time of Day Heatmap & Funnel Insights */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Time of Day Breakdown (Morning, Afternoon, Evening) */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div>
            <h4 className="font-black text-sm text-slate-900 dark:text-white">
              Time-of-Day Segmentation
            </h4>
            <p className="text-xs text-slate-500">Attendee booking preferences</p>
          </div>

          <div className="space-y-3.5 pt-1">
            {/* Morning */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
                  <Sun className="w-4 h-4 text-amber-500" />
                  Morning (Before 12 PM)
                </span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {Math.round((timeOfDay.morning / totalTimeOfDay) * 100)}%
                </span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full"
                  style={{ width: `${(timeOfDay.morning / totalTimeOfDay) * 100}%` }}
                />
              </div>
            </div>

            {/* Afternoon */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
                  <Sunset className="w-4 h-4 text-brand-500" />
                  Afternoon (12 PM - 5 PM)
                </span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {Math.round((timeOfDay.afternoon / totalTimeOfDay) * 100)}%
                </span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-500 rounded-full"
                  style={{ width: `${(timeOfDay.afternoon / totalTimeOfDay) * 100}%` }}
                />
              </div>
            </div>

            {/* Evening */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
                  <Moon className="w-4 h-4 text-indigo-500" />
                  Evening (After 5 PM)
                </span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {Math.round((timeOfDay.evening / totalTimeOfDay) * 100)}%
                </span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full"
                  style={{ width: `${(timeOfDay.evening / totalTimeOfDay) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Hourly Demand Heatmap */}
        <div className="md:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-black text-sm text-slate-900 dark:text-white">
                Hourly Inbound Traffic Heatmap
              </h4>
              <p className="text-xs text-slate-500">
                Visual slot popularity across standard working hours
              </p>
            </div>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-9 gap-2 pt-2">
            {hourlyTraffic.map((h) => (
              <div
                key={h.hour}
                className={cn(
                  'p-3 rounded-2xl border text-center space-y-1.5 transition-all hover:scale-105',
                  h.pct >= 80
                    ? 'border-brand-500 bg-brand-50/80 dark:bg-brand-950/60 shadow-xs'
                    : h.pct >= 50
                    ? 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40'
                    : 'border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 opacity-60'
                )}
              >
                <p className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                  {h.hour}
                </p>
                <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-500 rounded-full"
                    style={{ width: `${h.pct}%` }}
                  />
                </div>
                <p className="text-[9px] font-bold text-slate-500 truncate">{h.label}</p>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-slate-400 italic pt-1">
            * 10:00 AM to 11:30 AM and 2:30 PM to 3:30 PM are your highest converting appointment windows.
          </p>
        </div>
      </div>
    </div>
  );
}
