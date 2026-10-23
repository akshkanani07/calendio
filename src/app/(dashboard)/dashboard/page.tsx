import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { MasterDashboardOverview } from '@/components/dashboard/overview/master-dashboard-overview';

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
        take: 10,
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

  const userData = {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    timeZone: user.timeZone || 'Asia/Kolkata',
    username,
  };

  return (
    <MasterDashboardOverview
      user={userData}
      eventTypes={user.eventTypes}
      upcomingBookings={user.bookings || []}
      contactsCount={contactsCount}
      workflowsCount={workflowsCount}
    />
  );
}
