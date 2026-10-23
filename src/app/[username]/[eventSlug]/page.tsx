import React from 'react';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { getPublicEventDetails } from '@/app/actions/booking.actions';
import { ArrowLeft } from 'lucide-react';
import { BookingFlow } from '@/components/booking/booking-flow';
import { Logo } from '@/components/shared/logo';

export const dynamic = 'force-dynamic';

export default async function PublicBookingPage({
  params,
}: {
  params: Promise<{ username: string; eventSlug: string }>;
}) {
  const { username, eventSlug } = await params;

  if (username === 'me') {
    const session = await getServerSession(authOptions);
    if (session?.user?.email) {
      const u = await db.user.findUnique({
        where: { email: session.user.email },
        include: { profile: true },
      });
      if (u?.profile?.username) {
        redirect(`/${u.profile.username}/${eventSlug}`);
      }
    }
  }

  const data = await getPublicEventDetails(username, eventSlug);

  if (!data) {
    return notFound();
  }

  const { eventType, host } = data;

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between py-8 sm:py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-5xl mx-auto w-full space-y-6">
        {/* Back Link to Host Profile */}
        <div>
          <Link
            href={`/${host.username}`}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span>Back to all events with {host.name}</span>
          </Link>
        </div>

        {/* Master Booking Flow Component */}
        <BookingFlow host={host} eventType={eventType} />
      </div>

      {/* Brand Footer */}
      <footer className="mt-12 flex flex-col items-center justify-center gap-1.5">
        <Logo size="sm" href="/" showBadge={false} />
        <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
          Smart Scheduling For Everyone
        </span>
      </footer>
    </div>
  );
}
