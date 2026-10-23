import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { ContactsView } from '@/components/dashboard/contacts/contacts-view';

export const metadata = {
  title: 'Contacts CRM & Meeting Notes | Calendio',
  description: 'Manage your attendee relationships, meeting history, and private client notes.',
};

export default async function ContactsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect('/login');
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    include: {
      contacts: {
        orderBy: [{ lastMeetingAt: 'desc' }, { createdAt: 'desc' }],
      },
    },
  });

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="max-w-6xl mx-auto py-4">
      <ContactsView initialContacts={user.contacts} />
    </div>
  );
}
