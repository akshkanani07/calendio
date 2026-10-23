import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { AutomationsView } from '@/components/dashboard/automations/automations-view';

export const metadata = {
  title: 'Workflows & Automations | Calendio',
  description: 'Automate reminders, thank-yous, and follow-ups to save time and reduce meeting no-shows.',
};

export default async function AutomationsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect('/login');
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    include: {
      eventTypes: {
        where: { isActive: true },
        select: { id: true, title: true, slug: true, color: true },
      },
      automations: {
        include: {
          workflows: {
            orderBy: { stepOrder: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="w-full space-y-6">
      <AutomationsView
        initialAutomations={user.automations}
        eventTypes={user.eventTypes}
        currentUserEmail={user.email}
      />
    </div>
  );
}