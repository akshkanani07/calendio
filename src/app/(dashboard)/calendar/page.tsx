import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getUserCalendarSyncData } from '@/app/actions/calendar-sync.actions';
import { CalendarSyncView } from '@/components/dashboard/calendar/calendar-sync-view';

export const metadata = {
  title: 'Calendar Sync & Integrations | Calendio',
  description: 'Connect your external calendars, prevent double-booking, and manage webhooks.',
};

export default async function CalendarSyncPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect('/login');
  }

  const syncData = await getUserCalendarSyncData();

  if (!syncData.success) {
    redirect('/login');
  }

  return (
    <div className="max-w-6xl mx-auto py-4">
      <CalendarSyncView
        userId={syncData.userId!}
        userEmail={syncData.userEmail!}
        initialCalendars={syncData.calendars}
        initialIntegrations={syncData.integrations}
        initialWebhooks={syncData.webhooks}
      />
    </div>
  );
}
