import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getAnalyticsData } from '@/app/actions/analytics.actions';
import { AnalyticsView } from '@/components/dashboard/analytics/analytics-view';

export const metadata = {
  title: 'Meeting Analytics & Insights | Calendio',
  description: 'Track your booking trends, meeting volume, cancellation rate, and attendee performance.',
};

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect('/login');
  }

  const analyticsData = await getAnalyticsData('30d');

  if (!analyticsData.success) {
    redirect('/login');
  }

  return (
    <div className="max-w-6xl mx-auto py-4">
      <AnalyticsView initialData={analyticsData} />
    </div>
  );
}
