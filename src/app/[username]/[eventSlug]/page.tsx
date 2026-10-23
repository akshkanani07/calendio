import React from 'react';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { getPublicEventDetails } from '@/app/actions/booking.actions';
import { Clock, Video, Phone, MapPin, ArrowLeft } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import { BookingFlow } from '@/components/booking/booking-flow';
import { Logo } from '@/components/shared/logo';

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
  const color = eventType.color || '#0069FF';

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto w-full">
        {/* Back Link to Host Profile */}
        <div className="mb-6">
          <Link
            href={`/${host.username}`}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span>Back to all events with {host.name}</span>
          </Link>
        </div>

        {/* Main Calendly Card Container */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-200/80 dark:divide-slate-800">
          {/* Left Event Summary Column */}
          <div className="p-6 sm:p-8 md:w-80 lg:w-96 flex flex-col justify-between bg-slate-50/40 dark:bg-slate-900/60">
            <div className="space-y-6">
              {/* Host Avatar & Name */}
              <div className="flex items-center gap-3">
                <Avatar className="h-11 w-11 border-2 border-slate-200 dark:border-slate-700">
                  <AvatarImage src={host.image || ''} alt={host.name || ''} />
                  <AvatarFallback className="bg-brand-500 text-white font-bold text-sm">
                    {getInitials(host.name || 'User')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Host</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{host.name}</p>
                </div>
              </div>

              {/* Event Title */}
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {eventType.title}
                </h1>
              </div>

              {/* Event Meta Badges */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2.5 text-xs font-bold text-slate-600 dark:text-slate-300">
                  <Clock className="h-4 w-4 text-slate-400 shrink-0" />
                  <span>{eventType.duration} minutes</span>
                </div>

                <div className="flex items-center gap-2.5 text-xs font-bold text-slate-600 dark:text-slate-300">
                  {eventType.locationType === 'GOOGLE_MEET' && (
                    <>
                      <Video className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span>Google Meet (Conferencing details provided upon booking)</span>
                    </>
                  )}
                  {eventType.locationType === 'PHONE_CALL' && (
                    <>
                      <Phone className="h-4 w-4 text-sky-500 shrink-0" />
                      <span>Phone Call</span>
                    </>
                  )}
                  {eventType.locationType === 'IN_PERSON' && (
                    <>
                      <MapPin className="h-4 w-4 text-amber-500 shrink-0" />
                      <span>In-Person Meeting</span>
                    </>
                  )}
                  {eventType.locationType !== 'GOOGLE_MEET' &&
                    eventType.locationType !== 'PHONE_CALL' &&
                    eventType.locationType !== 'IN_PERSON' && (
                      <>
                        <Video className="h-4 w-4 text-brand-500 shrink-0" />
                        <span>Web Conferencing</span>
                      </>
                    )}
                </div>
              </div>

              {/* Event Description */}
              {eventType.description && (
                <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800">
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">
                    {eventType.description}
                  </p>
                </div>
              )}
            </div>

            {/* Left Column Bottom Badge */}
            <div className="mt-8 pt-4 border-t border-slate-200/60 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400">
                100% Free Meeting Scheduling
              </span>
            </div>
          </div>

          {/* Right Interactive Booking Flow */}
          <div className="flex-1 flex flex-col justify-start">
            <BookingFlow host={host} eventType={eventType} />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 flex flex-col items-center justify-center gap-1.5"><Logo size="sm" href="/" showBadge={false} /><span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">Smart Scheduling For Everyone</span></footer>
    </div>
  );
}
