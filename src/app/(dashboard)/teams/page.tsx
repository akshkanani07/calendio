import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getUserTeams } from '@/app/actions/team.actions';
import { Users, Plus, ArrowRight, Shield, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { TeamsListClient } from './teams-list-client';

export default async function TeamsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect('/login');

  const { teams = [] } = await getUserTeams();

  return (
    <TeamsListClient initialTeams={teams} />
  );
}
