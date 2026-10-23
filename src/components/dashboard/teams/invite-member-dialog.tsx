'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { inviteTeamMember } from '@/app/actions/team.actions';
import { UserPlus, Mail, Loader2, Sparkles } from 'lucide-react';

interface InviteMemberDialogProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
  teamName: string;
  onSuccess?: () => void;
}

export function InviteMemberDialog({
  isOpen,
  onClose,
  teamId,
  teamName,
  onSuccess,
}: InviteMemberDialogProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'MEMBER' | 'ADMIN'>('MEMBER');
  const [priority, setPriority] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await inviteTeamMember({
        teamId,
        email: email.trim(),
        role,
        priority,
      });

      if (res.success) {
        setEmail('');
        onClose();
        if (onSuccess) onSuccess();
      } else {
        setErrorMsg(res.error || 'Failed to send invite.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isSubmitting && !open && onClose()}>
      <DialogContent className="sm:max-w-md rounded-3xl p-6 sm:p-7">
        <form onSubmit={handleSubmit} className="space-y-5">
          <DialogHeader className="space-y-2">
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900/60 text-indigo-600 flex items-center justify-center">
              <UserPlus className="h-5 w-5" />
            </div>
            <DialogTitle className="text-xl font-extrabold text-slate-900 dark:text-white">
              Invite Team Member
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Invite anyone to <strong className="text-slate-700 dark:text-slate-200">{teamName}</strong>.
              Even if they do not have an account yet, they will receive an email invitation to join!
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Email Address <span className="text-indigo-500">*</span>
              </label>
              <div className="relative">
                <Mail className="h-4 w-4 text-slate-400 absolute left-3.5 top-3.5" />
                <Input
                  type="email"
                  required
                  placeholder="colleague@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11 rounded-xl"
                />
              </div>
            </div>

            {/* Role Radio Picker */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Team Role
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setRole('MEMBER')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    role === 'MEMBER'
                      ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <span className="block text-xs font-bold">Member</span>
                  <span className="block text-[11px] text-slate-500 mt-0.5">
                    Can host team meetings & manage availability
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('ADMIN')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    role === 'ADMIN'
                      ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <span className="block text-xs font-bold">Admin</span>
                  <span className="block text-[11px] text-slate-500 mt-0.5">
                    Can invite members & edit team settings
                  </span>
                </button>
              </div>
            </div>

            {/* Round-Robin Weight */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Round-Robin Priority Weight
                </label>
                <span className="text-xs font-bold text-indigo-600">{priority}x</span>
              </div>
              <input
                type="range"
                min={1}
                max={5}
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
              <span className="text-[11px] text-slate-400 block">
                Higher weight routes more meetings to this member in round-robin events.
              </span>
            </div>

            {/* Info Badge */}
            <div className="p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/50 dark:border-indigo-900/40 text-xs text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
              <Sparkles className="h-4 w-4 shrink-0 text-indigo-500" />
              <span>An automated invitation email with an acceptance token will be delivered via Mailjet.</span>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs text-rose-600 dark:text-rose-400 font-semibold">
                {errorMsg}
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={onClose}
              className="rounded-xl"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-600/20"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                  <span>Sending Invitation...</span>
                </>
              ) : (
                <span>Send Invitation</span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
