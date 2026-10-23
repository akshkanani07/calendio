import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { BookingsView } from '@/components/dashboard/bookings/bookings-view';

export default async function BookingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect('/login');

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    include: { profile: true },
  });

  if (!user) redirect('/login');

  const now = new Date();

  // Fetch all bookings for this host
  const allBookings = await db.booking.findMany({
    where: {
      hostId: user.id,
    },
    include: {
      eventType: true,
      host: {
        include: { profile: true },
      },
    },
    orderBy: {
      startTime: 'desc',
    },
  });

  const upcoming = allBookings
    .filter((b) => b.status !== 'CANCELLED' && new Date(b.startTime) >= now)
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  const past = allBookings.filter(
    (b) => b.status !== 'CANCELLED' && new Date(b.startTime) < now
  );

  const cancelled = allBookings.filter((b) => b.status === 'CANCELLED');

  return (
    <BookingsView
      initialUpcoming={upcoming}
      initialPast={past}
      initialCancelled={cancelled}
      counts={{
        upcoming: upcoming.length,
        past: past.length,
        cancelled: cancelled.length,
      }}
      username={user.profile?.username || 'user'}
    />
  );
}
