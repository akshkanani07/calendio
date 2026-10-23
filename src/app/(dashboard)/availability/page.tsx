import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { Clock, Globe } from 'lucide-react';
import { WeeklyScheduleEditor } from '@/components/dashboard/availability/weekly-schedule-editor';
import { DateOverridesManager } from '@/components/dashboard/availability/date-overrides-manager';

export default async function AvailabilityPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect('/login');

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    include: {
      availabilities: true,
      dateOverrides: {
        orderBy: { date: 'asc' },
      },
    },
  });

  if (!user) redirect('/login');

  const schedules = user.availabilities || [];
  const firstSchedule = schedules[0];
  const limits = {
    bufferBeforeMin: firstSchedule?.bufferBeforeMin || 0,
    bufferAfterMin: firstSchedule?.bufferAfterMin || 15,
    minNoticeHours: firstSchedule?.minNoticeHours || 2,
    maxBookingsPerDay: firstSchedule?.maxBookingsPerDay || null,
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Clock className="h-7 w-7 text-brand-500" />
            Availability
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Configure your standard hours, notice periods, buffers, and blocked dates.
          </p>
        </div>

        {/* Time Zone Pill */}
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <Globe className="h-4 w-4 text-brand-500 shrink-0" />
          <span>{user.timeZone || 'Asia/Kolkata'}</span>
        </div>
      </div>

      {/* 1. Weekly Schedule & Buffers Editor */}
      <WeeklyScheduleEditor
        initialSchedules={schedules}
        initialLimits={limits}
      />

      {/* 2. Date Overrides (Vacations / Day Off) */}
      <DateOverridesManager overrides={user.dateOverrides} />
    </div>
  );
}
