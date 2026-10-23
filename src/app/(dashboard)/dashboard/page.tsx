import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { DashboardHero } from '@/components/dashboard/overview/dashboard-hero';
import { DashboardKpis } from '@/components/dashboard/overview/dashboard-kpis';
import { DashboardNextMeeting } from '@/components/dashboard/overview/dashboard-next-meeting';
import { DashboardEventGrid } from '@/components/dashboard/overview/dashboard-event-grid';
import { DashboardUpcomingTimeline } from '@/components/dashboard/overview/dashboard-upcoming-timeline';
import { DashboardQuickActions } from '@/components/dashboard/overview/dashboard-quick-actions';

export const metadata = {
  title: 'Dashboard | Calendio',
  description: 'Smart scheduling overview, upcoming meetings, and active event types.',
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect('/login');
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    include: {
      profile: true,
      eventTypes: {
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
      },
      bookings: {
        where: {
          startTime: { gte: new Date() },
          status: { in: ['CONFIRMED', 'RESCHEDULED'] },
        },
        orderBy: { startTime: 'asc' },
        take: 6,
        include: { eventType: true },
      },
    },
  });

  if (!user) {
    redirect('/login');
  }

  const [contactsCount, workflowsCount] = await Promise.all([
    db.contact.count({ where: { userId: user.id } }),
    db.automation.count({ where: { userId: user.id, isActive: true } }),
  ]);

  const username = user.profile?.username || user.email.split('@')[0];
  const upcomingBookings = user.bookings || [];
  const nextBooking = upcomingBookings.length > 0 ? upcomingBookings[0] : null;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16 animate-fade-in">
      {/* 1. Hero & Quick Share Header */}
      <DashboardHero userName={user.name || 'Friend'} username={username} />

      {/* 2. Key Metric Pulse Cards */}
      <DashboardKpis
        eventTypesCount={user.eventTypes.length}
        upcomingCount={upcomingBookings.length}
        contactsCount={contactsCount}
        workflowsCount={workflowsCount}
      />

      {/* 3. Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (8 cols): Next Up Spotlight + Event Grid */}
        <div className="lg:col-span-8 space-y-8">
          {/* Next Up Meeting Card */}
          <DashboardNextMeeting nextBooking={nextBooking} />

          {/* Event Types Showcase */}
          <DashboardEventGrid
            eventTypes={user.eventTypes}
            username={username}
          />
        </div>

        {/* Right Column (4 cols): Upcoming Timeline */}
        <div className="lg:col-span-4 space-y-6">
          <DashboardUpcomingTimeline bookings={upcomingBookings} />
        </div>
      </div>

      {/* 4. Scheduling Power Tools / Ecosystem Launcher */}
      <DashboardQuickActions />
    </div>
  );
}
