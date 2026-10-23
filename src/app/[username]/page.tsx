import React from 'react';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { getPublicUserByUsername } from '@/app/actions/booking.actions';
import { Clock, Video, Phone, MapPin, ArrowRight, CheckCircle2, Calendar } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Logo } from '@/components/shared/logo';
import { getInitials } from '@/lib/utils';

export default async function HostProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  if (username === 'me') {
    redirect('/me');
  }

  const host = await getPublicUserByUsername(username);

  if (!host) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto w-full">
        {/* Host Profile Header Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-8 text-center sm:text-left mb-8 transition-all">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <Avatar className="h-24 w-24 border-4 border-brand-500/10 dark:border-brand-500/20 shadow-md">
              <AvatarImage src={host.image || ''} alt={host.name || ''} />
              <AvatarFallback className="bg-brand-500 text-white text-2xl font-bold">
                {getInitials(host.name || 'User')}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {host.name}
                </h1>
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400 w-fit mx-auto sm:mx-0">
                  <CheckCircle2 className="h-3.5 w-3.5 text-brand-500" />
                  Verified Host
                </span>
              </div>

              {host.company && (
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {host.company}
                </p>
              )}

              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl">
                {host.bio ||
                  'Welcome to my scheduling page. Please select an event below to book a convenient time with me.'}
              </p>
            </div>
          </div>
        </div>

        {/* Event Types Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Select an Event Type
            </h2>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
              {host.eventTypes.length} available
            </span>
          </div>

          {host.eventTypes.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center">
              <Calendar className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
                No active events available
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                This host currently has no public event types open for booking.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {host.eventTypes.map((event) => {
                const color = event.color || '#0069FF';

                return (
                  <Link
                    key={event.id}
                    href={`/${host.username}/${event.slug}`}
                    className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm hover:shadow-md hover:border-brand-400/60 dark:hover:border-brand-500/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 overflow-hidden"
                  >
                    {/* Color Edge Accent */}
                    <div
                      className="absolute left-0 top-0 bottom-0 w-2 transition-all group-hover:w-3"
                      style={{ backgroundColor: color }}
                    />

                    <div className="pl-2 space-y-1.5 flex-1">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                        {event.title}
                      </h3>

                      {event.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 max-w-xl">
                          {event.description}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-3 pt-2">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          {event.duration} mins
                        </span>

                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                          {event.locationType === 'GOOGLE_MEET' && (
                            <>
                              <Video className="h-3.5 w-3.5 text-emerald-500" />
                              Google Meet
                            </>
                          )}
                          {event.locationType === 'PHONE_CALL' && (
                            <>
                              <Phone className="h-3.5 w-3.5 text-sky-500" />
                              Phone Call
                            </>
                          )}
                          {event.locationType === 'IN_PERSON' && (
                            <>
                              <MapPin className="h-3.5 w-3.5 text-amber-500" />
                              In-Person Meeting
                            </>
                          )}
                          {event.locationType !== 'GOOGLE_MEET' &&
                            event.locationType !== 'PHONE_CALL' &&
                            event.locationType !== 'IN_PERSON' && (
                              <>
                                <Video className="h-3.5 w-3.5 text-brand-500" />
                                Web Conference
                              </>
                            )}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 font-bold text-xs uppercase tracking-wider pl-2 sm:pl-0">
                      <span>Book Time</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Powered by Calendio Brand Footer */}
      <footer className="mt-16 flex flex-col items-center justify-center gap-1.5"><Logo size="sm" href="/" showBadge={false} /><span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">100% Free Smart Scheduling</span></footer>
    </div>
  );
}
