'use client';

import React from 'react';
import { CalendarCheck, Clock, XCircle, RotateCcw, TrendingUp, Sparkles } from 'lucide-react';

interface KpiCardsProps {
  kpis: {
    totalBookings: number;
    confirmedBookings: number;
    completedBookings: number;
    cancelledBookings: number;
    rescheduledBookings: number;
    cancellationRate: number;
    rescheduleRate: number;
    totalMeetingHours: number;
    busiestDay: string;
  };
}

export function AnalyticsKpiCards({ kpis }: KpiCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Bookings */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Bookings
          </span>
          <div className="h-8 w-8 rounded-xl bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400 flex items-center justify-center">
            <CalendarCheck className="w-4 h-4" />
          </div>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {kpis.totalBookings}
          </span>
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
            {kpis.confirmedBookings} active
          </span>
        </div>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <span>Completed: {kpis.completedBookings}</span>
          <span>Cancelled: {kpis.cancelledBookings}</span>
        </div>
      </div>

      {/* 2. Total Meeting Hours */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Meeting Duration
          </span>
          <div className="h-8 w-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {kpis.totalMeetingHours}
          </span>
          <span className="text-xs font-medium text-slate-400">hours spent</span>
        </div>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <span>Busiest day:</span>
          <span className="font-bold text-slate-800 dark:text-slate-200">
            {kpis.busiestDay !== 'None' ? kpis.busiestDay : '—'}
          </span>
        </div>
      </div>

      {/* 3. Cancellation Rate */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Cancellation Rate
          </span>
          <div className="h-8 w-8 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <XCircle className="w-4 h-4" />
          </div>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {kpis.cancellationRate}%
          </span>
          <span
            className={`text-xs font-semibold ${
              kpis.cancellationRate <= 5
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-amber-600 dark:text-amber-400'
            }`}
          >
            {kpis.cancellationRate <= 5 ? 'Healthy' : 'Moderate'}
          </span>
        </div>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <span>Cancelled events:</span>
          <span className="font-bold text-rose-600">{kpis.cancelledBookings}</span>
        </div>
      </div>

      {/* 4. Reschedule Rate */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Reschedule Rate
          </span>
          <div className="h-8 w-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <RotateCcw className="w-4 h-4" />
          </div>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {kpis.rescheduleRate}%
          </span>
          <span className="text-xs font-medium text-slate-400">of bookings</span>
        </div>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <span>Rescheduled events:</span>
          <span className="font-bold text-amber-600">{kpis.rescheduledBookings}</span>
        </div>
      </div>
    </div>
  );
}
