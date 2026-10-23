import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getUserSettingsData } from '@/app/actions/settings.actions';
import { SettingsView } from '@/components/dashboard/settings/settings-view';

export const metadata = {
  title: 'Account & Profile Settings | Calendio',
  description: 'Manage your profile, custom booking link, brand color scheme, and account security.',
};

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect('/login');
  }

  const settingsData = await getUserSettingsData();

  if (!settingsData.success) {
    redirect('/login');
  }

  return (
    <div className="max-w-6xl mx-auto py-4">
      <SettingsView initialData={settingsData.data} />
    </div>
  );
}
