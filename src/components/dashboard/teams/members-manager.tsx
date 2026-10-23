'use client';

import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Mail,
  Shield,
  Trash2,
  Send,
  XCircle,
  MoreVertical,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { InviteMemberDialog } from './invite-member-dialog';
import {
  removeTeamMember,
  resendTeamInvitation,
  revokeTeamInvitation,
} from '@/app/actions/team.actions';
import { getInitials } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface MembersManagerProps {
  team: any;
  isOwner: boolean;
  isAdmin: boolean;
}

export function MembersManager({ team, isOwner, isAdmin }: MembersManagerProps) {
  const router = useRouter();
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<any | null>(null);
  const [isPending, setIsPending] = useState(false);

  const handleRemoveConfirm = async () => {
    if (!memberToRemove) return;
    setIsPending(true);
    await removeTeamMember({ teamId: team.id, memberId: memberToRemove.id });
    setIsPending(false);
    setMemberToRemove(null);
    router.refresh();
  };

  const handleResendInvite = async (invitationId: string) => {
    await resendTeamInvitation(invitationId);
    router.refresh();
  };

  const handleRevokeInvite = async (invitationId: string) => {
    await revokeTeamInvitation(invitationId);
    router.refresh();
  };

  const pendingInvitations = (team.invitations || []).filter((inv: any) => inv.status === 'PENDING');

  return (
    <div className="space-y-8">
      {/* Active Team Members Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-600" />
              Active Team Members ({team.members.length})
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Members who can host round-robin and collective meetings.
            </p>
          </div>

          {isAdmin && (
            <Button
              onClick={() => setIsInviteOpen(true)}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20"
            >
              <UserPlus className="h-3.5 w-3.5 mr-1.5" />
              Invite Member
            </Button>
          )}
        </div>

        {/* Members List Table / Cards */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800 pt-2">
          {team.members.map((member: any) => {
            const memberUser = member.user;
            const isTeamOwner = member.role === 'OWNER';

            return (
              <div
                key={member.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border border-slate-200 dark:border-slate-700">
                    <AvatarImage src={memberUser.image || ''} alt={memberUser.name || 'User'} />
                    <AvatarFallback className="bg-indigo-600 text-white font-bold text-xs">
                      {getInitials(memberUser.name || 'Member')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {memberUser.name || 'User'}
                      </span>
                      {isTeamOwner && (
                        <Badge className="bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 text-[10px] font-bold">
                          Owner
                        </Badge>
                      )}
                      {!isTeamOwner && member.role === 'ADMIN' && (
                        <Badge className="bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 text-[10px] font-bold">
                          Admin
                        </Badge>
                      )}
                      {!isTeamOwner && member.role === 'MEMBER' && (
                        <Badge variant="outline" className="text-[10px] text-slate-500 font-medium">
                          Member
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-slate-400">{memberUser.email}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Priority Pill */}
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Round-Robin Weight
                    </span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {member.priority || 1}x weight
                    </span>
                  </div>

                  {/* Actions dropdown */}
                  {isOwner && !isTeamOwner && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-36 rounded-xl">
                        <DropdownMenuItem
                          onClick={() => setMemberToRemove(member)}
                          className="text-rose-600 cursor-pointer font-semibold text-xs flex items-center gap-2"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Remove</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pending Invitations Section */}
      {pendingInvitations.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 sm:p-8">
          <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" />
              Pending Invitations ({pendingInvitations.length})
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              These users were invited via email and can accept their invite at any time.
            </p>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 pt-2">
            {pendingInvitations.map((inv: any) => (
              <div
                key={inv.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 text-amber-600 flex items-center justify-center">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      {inv.email}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Invited as {inv.role} • Expires in{' '}
                      {Math.ceil(
                        (new Date(inv.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                      )}{' '}
                      days
                    </span>
                  </div>
                </div>

                {isAdmin && (
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleResendInvite(inv.id)}
                      className="h-8 px-2.5 rounded-lg text-xs font-semibold"
                    >
                      <Send className="h-3 w-3 mr-1 text-slate-400" />
                      <span>Resend</span>
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleRevokeInvite(inv.id)}
                      className="h-8 px-2.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border-rose-200 dark:border-rose-900"
                    >
                      <XCircle className="h-3 w-3 mr-1" />
                      <span>Revoke</span>
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invite Modal */}
      <InviteMemberDialog
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        teamId={team.id}
        teamName={team.name}
        onSuccess={() => router.refresh()}
      />

      {/* Remove Confirmation Modal */}
      <ConfirmModal
        open={Boolean(memberToRemove)}
        onOpenChange={(open) => !open && setMemberToRemove(null)}
        title="Remove Team Member"
        description={`Are you sure you want to remove ${memberToRemove?.user?.name || 'this member'} from ${team.name}? They will no longer be assigned to round-robin event types.`}
        confirmText="Remove Member"
        variant="destructive"
        onConfirm={handleRemoveConfirm}
      />
    </div>
  );
}
