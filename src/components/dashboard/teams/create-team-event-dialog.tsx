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
import { Textarea } from '@/components/ui/textarea';
import { createTeamEventType } from '@/app/actions/team.actions';
import { Calendar, Users, RefreshCw, Loader2 } from 'lucide-react';
import { slugify } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface CreateTeamEventDialogProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
  teamSlug: string;
}

export function CreateTeamEventDialog({
  isOpen,
  onClose,
  teamId,
  teamSlug,
}: CreateTeamEventDialogProps) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [duration, setDuration] = useState('30');
  const [schedulingType, setSchedulingType] = useState<'ROUND_ROBIN' | 'COLLECTIVE'>('ROUND_ROBIN');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    setSlug(slugify(val));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await createTeamEventType({
        teamId,
        title: title.trim(),
        slug: slug.trim(),
        duration: Number(duration),
        color: '#4F46E5',
        schedulingType,
        locationType: 'GOOGLE_MEET',
        description: description.trim() || undefined,
      });

      if (res.success) {
        onClose();
        setTitle('');
        setSlug('');
        setDescription('');
        router.refresh();
      } else {
        setErrorMsg(res.error || 'Failed to create team event.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isSubmitting && !open && onClose()}>
      <DialogContent className="sm:max-w-lg rounded-3xl p-6 sm:p-7">
        <form onSubmit={handleSubmit} className="space-y-5">
          <DialogHeader className="space-y-2">
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900/60 text-indigo-600 flex items-center justify-center">
              <Calendar className="h-5 w-5" />
            </div>
            <DialogTitle className="text-xl font-extrabold text-slate-900 dark:text-white">
              New Team Event Type
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Configure automated Round-Robin or Collective multi-host meetings for your team.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Scheduling Type Picker */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Scheduling Logic
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSchedulingType('ROUND_ROBIN')}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    schedulingType === 'ROUND_ROBIN'
                      ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs mb-1">
                    <RefreshCw className="h-3.5 w-3.5 text-indigo-600" />
                    <span>Round-Robin</span>
                  </div>
                  <span className="text-[11px] text-slate-500 block leading-snug">
                    Distributes incoming bookings evenly across team members by weight.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setSchedulingType('COLLECTIVE')}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    schedulingType === 'COLLECTIVE'
                      ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs mb-1">
                    <Users className="h-3.5 w-3.5 text-indigo-600" />
                    <span>Collective</span>
                  </div>
                  <span className="text-[11px] text-slate-500 block leading-snug">
                    Only shows times when all required team members are simultaneously free.
                  </span>
                </button>
              </div>
            </div>

            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Event Title <span className="text-indigo-500">*</span>
              </label>
              <Input
                required
                placeholder="e.g. Sales Discovery Call, Panel Interview"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="h-11 rounded-xl"
              />
            </div>

            {/* Duration */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Duration (minutes) <span className="text-indigo-500">*</span>
              </label>
              <div className="flex gap-2">
                {['15', '30', '45', '60'].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setDuration(mins)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex-1 transition-all ${
                      duration === mins
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-600'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Description (Optional)
              </label>
              <Textarea
                rows={2}
                placeholder="Instructions or topics for this team event..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="rounded-xl text-xs sm:text-sm"
              />
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
                  <span>Creating Event...</span>
                </>
              ) : (
                <span>Create Team Event</span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
