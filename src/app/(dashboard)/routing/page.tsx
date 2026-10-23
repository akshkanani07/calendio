import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getUserRoutingForms } from '@/app/actions/routing.actions';
import { RoutingHubClient } from './routing-hub-client';

export default async function RoutingPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect('/login');

  const { forms = [], username = 'user' } = await getUserRoutingForms();

  return <RoutingHubClient initialForms={forms} username={username} />;
}
