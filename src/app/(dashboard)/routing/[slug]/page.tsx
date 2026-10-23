import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import {
  getRoutingFormBySlug,
  getRoutingFormSubmissions,
} from '@/app/actions/routing.actions';
import { RoutingFormBuilder } from '@/components/dashboard/routing/routing-form-builder';

export default async function RoutingBuilderPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect('/login');

  const { slug } = await params;
  const result = await getRoutingFormBySlug(slug);

  if (!result) return notFound();

  const { submissions = [] } = await getRoutingFormSubmissions(result.form.id);

  return (
    <RoutingFormBuilder
      initialForm={result.form}
      availableEventTypes={result.host.eventTypes}
      submissions={submissions}
    />
  );
}
