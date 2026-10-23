import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { Link2, Plus, Calendar, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EventCard } from '@/components/dashboard/event-types/event-card';
import { EventTypesClientHeader } from '@/components/dashboard/event-types/client-header';

export default async function EventTypesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect('/login');

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    include: {
      profile: true,
      eventTypes: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!user) redirect('/login');

  const eventTypes = user.eventTypes || [];
  const username = user.profile?.username || (user.name || user.email.split('@')[0]).toLowerCase().replace(/[^a-z0-9]/g, '-') || 'user';

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Client Header with New Event Modal Trigger */}
      <EventTypesClientHeader totalCount={eventTypes.length} />

      {/* Event Cards Grid */}
      {eventTypes.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40">
          <div className="h-14 w-14 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-500 flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Link2 className="h-7 w-7" />
          </div>
          <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
            No event types created yet
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-6">
            Create your first scheduling link to start accepting appointments from clients and colleagues.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {eventTypes.map((et) => (
            <EventCard key={et.id} event={et} username={username} />
          ))}
        </div>
      )}
    </div>
  );
}
