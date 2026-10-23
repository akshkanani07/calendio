import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { getPublicUserByUsername } from '@/app/actions/booking.actions';
import { PublicHostProfileView } from '@/components/booking/public-host-profile-view';

export const dynamic = 'force-dynamic';

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

  return <PublicHostProfileView host={host} />;
}
