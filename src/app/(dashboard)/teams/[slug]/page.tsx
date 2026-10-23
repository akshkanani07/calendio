import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import { getTeamBySlug } from '@/app/actions/team.actions';
import { TeamWorkspaceClient } from './team-workspace-client';

export default async function TeamWorkspacePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect('/login');

  const { slug } = await params;
  const result = await getTeamBySlug(slug);

  if (!result) return notFound();

  const { team, userRole, isOwner, isAdmin } = result;

  return (
    <TeamWorkspaceClient
      team={team}
      userRole={userRole}
      isOwner={isOwner}
      isAdmin={isAdmin}
    />
  );
}
