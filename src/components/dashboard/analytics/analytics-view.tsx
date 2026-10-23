'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AnalyticsKpiCards } from './analytics-kpi-cards';
import { AnalyticsCharts } from './analytics-charts';
import { AnalyticsEventTypes } from './analytics-event-types';
import { TimeRange, getAnalyticsData } from '@/app/actions/analytics.actions';
import { BarChart3, Download, RefreshCw, Calendar, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AnalyticsViewProps {
  initialData: any;
}

export function AnalyticsView({ initialData }: AnalyticsViewProps) {
  const router = useRouter();
  const [data, setData] = useState<any>(initialData);
  const [timeRange, setTimeRange] = useState<TimeRange>(initialData.timeRange || '30d');
  const [isLoading, setIsLoading] = useState(false);

  const handleTimeRangeChange = async (newRange: TimeRange) => {
    setTimeRange(newRange);
    setIsLoading(true);
    try {
      const res = await getAnalyticsData(newRange);
      if (res.success) {
        setData(res);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCsv = () => {
    if (!data?.kpis) return;

    const rows = [
      ['Calendio Analytics Performance Report'],
      [`Generated at: ${new Date().toLocaleString()}`],
      [`Time Range: ${timeRange}`],
      [],
      ['Metric', 'Value'],
      ['Total Bookings', data.kpis.totalBookings],
      ['Confirmed Bookings', data.kpis.confirmedBookings],
      ['Completed Bookings', data.kpis.completedBookings],
      ['Cancelled Bookings', data.kpis.cancelledBookings],
      ['Rescheduled Bookings', data.kpis.rescheduledBookings],
      ['Cancellation Rate', `${data.kpis.cancellationRate}%`],
      ['Reschedule Rate', `${data.kpis.rescheduleRate}%`],
      ['Total Meeting Hours', `${data.kpis.totalMeetingHours} hrs`],
      ['Busiest Day', data.kpis.busiestDay],
      [],
      ['Event Type', 'Bookings', 'Hours Spent', 'Share'],
      ...data.eventTypesBreakdown.map((e: any) => [
        `"${e.title}"`,
        e.count,
        e.hours,
        `${e.percentage}%`,
      ]),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((r) => r.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `calendio-analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const timeRangeOptions: { id: TimeRange; label: string }[] = [
    { id: '7d', label: 'Last 7 Days' },
    { id: '30d', label: 'Last 30 Days' },
    { id: '90d', label: 'Last 90 Days' },
    { id: 'year', label: 'Past Year' },
    { id: 'all', label: 'All Time' },
  ];

  return (
    <div className="space-y-8 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Analytics & Insights
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400 border border-brand-200/60 dark:border-brand-900/60">
              <BarChart3 className="w-3 h-3" />
              Live Reporting
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Track meeting volume, attendance rates, peak scheduling windows, and event popularity.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto w-full sm:w-auto">
          {/* Time Range Selector (Mobile Scrollable) */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-x-auto max-w-full">
            {timeRangeOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleTimeRangeChange(opt.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
                  timeRange === opt.id
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            onClick={handleExportCsv}
            className="h-9 px-3.5 rounded-xl text-xs font-semibold shrink-0"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Export CSV
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="p-16 text-center text-xs font-semibold text-slate-400 flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-brand-600" />
          Refreshing performance analytics...
        </div>
      ) : (
        <>
          {/* 1. KPI Cards */}
          <AnalyticsKpiCards kpis={data.kpis} />

          {/* 2. Volume & Day Trends */}
          <AnalyticsCharts
            timeSeriesData={data.timeSeriesData}
            dayDistribution={data.dayDistribution}
            timeOfDay={data.timeOfDay}
          />

          {/* 3. Event Types & Top Attendees */}
          <AnalyticsEventTypes
            eventTypes={data.eventTypesBreakdown}
            topAttendees={data.topAttendees}
          />
        </>
      )}
    </div>
  );
}