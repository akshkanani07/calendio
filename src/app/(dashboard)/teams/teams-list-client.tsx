'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Users, Plus, ArrowRight, Shield, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreateTeamDialog } from '@/components/dashboard/teams/create-team-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';

export function TeamsListClient({ initialTeams }: { initialTeams: any[] }) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Users className="h-7 w-7 text-indigo-600" />
            Teams & Round-Robin
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Collaborate with colleagues, distribute meetings across members, or host collective calls.
          </p>
        </div>

        <Button
          onClick={() => setIsCreateOpen(true)}
          className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 h-10 px-4"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Create Team
        </Button>
      </div>

      {/* Teams Grid */}
      {initialTeams.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-12 text-center max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900 text-indigo-600 flex items-center justify-center mx-auto mb-4">
            <Users className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            No teams created yet
          </h3>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            Create your first team to invite co-workers, distribute incoming leads with Round-Robin, or host multi-person panel meetings.
          </p>
          <div className="mt-6">
            <Button
              onClick={() => setIsCreateOpen(true)}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Create Your First Team
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {initialTeams.map((team) => (
            <Link
              key={team.id}
              href={`/teams/${team.slug}`}
              className="group bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm hover:shadow-md hover:border-indigo-400 dark:hover:border-indigo-600 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900 text-indigo-600 flex items-center justify-center font-extrabold text-sm">
                      {getInitials(team.name)}
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                        {team.name}
                      </h3>
                      <span className="text-xs font-mono text-slate-400">/teams/{team.slug}</span>
                    </div>
                  </div>

                  <Badge variant="secondary" className="text-[10px] font-bold">
                    {team.members.length} {team.members.length === 1 ? 'member' : 'members'}
                  </Badge>
                </div>

                {team.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-2">
                    {team.description}
                  </p>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                {/* Member Avatars Stack */}
                <div className="flex -space-x-2 overflow-hidden">
                  {team.members.slice(0, 4).map((m: any) => (
                    <Avatar
                      key={m.id}
                      className="inline-block h-7 w-7 rounded-full ring-2 ring-white dark:ring-slate-900"
                    >
                      <AvatarImage src={m.user?.image || ''} />
                      <AvatarFallback className="bg-indigo-600 text-white text-[10px] font-bold">
                        {getInitials(m.user?.name || 'User')}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {team.members.length > 4 && (
                    <div className="flex items-center justify-center h-7 w-7 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500 ring-2 ring-white dark:ring-slate-900">
                      +{team.members.length - 4}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1 text-xs font-bold text-indigo-600 group-hover:translate-x-1 transition-transform">
                  <span>Manage Team</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Create Team Modal */}
      <CreateTeamDialog isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </div>
  );
}
