'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Calendar,
  Settings,
  ArrowLeft,
  Plus,
  RefreshCw,
  Clock,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MembersManager } from '@/components/dashboard/teams/members-manager';
import { CreateTeamEventDialog } from '@/components/dashboard/teams/create-team-event-dialog';

interface TeamWorkspaceClientProps {
  team: any;
  userRole: string;
  isOwner: boolean;
  isAdmin: boolean;
}

export function TeamWorkspaceClient({
  team,
  userRole,
  isOwner,
  isAdmin,
}: TeamWorkspaceClientProps) {
  const [activeTab, setActiveTab] = useState<'members' | 'events' | 'settings'>('members');
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    const url = `${window.location.origin}/teams/${team.slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl">
      {/* Back to all teams */}
      <div>
        <Link
          href="/teams"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors group"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
          <span>Back to All Teams</span>
        </Link>
      </div>

      {/* Team Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {team.name}
            </h1>
            <Badge className="bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-bold text-xs">
              {userRole}
            </Badge>
          </div>
          <span className="text-xs font-mono text-slate-400">/teams/{team.slug}</span>
          {team.description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 pt-1 max-w-xl">
              {team.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopyLink}
            className="rounded-xl text-xs font-semibold h-10 px-3.5"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-500 mr-1.5" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 mr-1.5" />
                <span>Copy Team Link</span>
              </>
            )}
          </Button>

          {isAdmin && (
            <Button
              onClick={() => setIsCreateEventOpen(true)}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-10 px-4"
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              New Team Event
            </Button>
          )}
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 dark:border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('members')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'members'
              ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Members ({team.members.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('events')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'events'
              ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Calendar className="h-4 w-4" />
          <span>Team Events ({team.eventTypes?.length || 0})</span>
        </button>
      </div>

      {/* Active Tab View */}
      {activeTab === 'members' && (
        <MembersManager team={team} isOwner={isOwner} isAdmin={isAdmin} />
      )}

      {activeTab === 'events' && (
        <div className="space-y-4">
          {(!team.eventTypes || team.eventTypes.length === 0) ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-12 text-center max-w-lg mx-auto">
              <Calendar className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                No team event types yet
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Create a Round-Robin or Collective meeting link for your team members.
              </p>
              {isAdmin && (
                <div className="mt-5">
                  <Button
                    onClick={() => setIsCreateEventOpen(true)}
                    className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                    Create Team Event Type
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {team.eventTypes.map((event: any) => (
                <div
                  key={event.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">
                      {event.title}
                    </h4>
                    <Badge className="bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 text-[10px] font-bold">
                      {event.schedulingType === 'ROUND_ROBIN' ? 'Round-Robin' : 'Collective'}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-semibold">
                      <Clock className="h-3.5 w-3.5" />
                      {event.duration}m
                    </span>
                    <span>•</span>
                    <span className="font-mono text-[11px]">/{event.slug}</span>
                  </div>

                  {event.description && (
                    <p className="text-xs text-slate-500 line-clamp-2">{event.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Team Event Modal */}
      <CreateTeamEventDialog
        isOpen={isCreateEventOpen}
        onClose={() => setIsCreateEventOpen(false)}
        teamId={team.id}
        teamSlug={team.slug}
      />
    </div>
  );
}
