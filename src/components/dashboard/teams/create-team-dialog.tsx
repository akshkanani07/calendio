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
import { createTeam } from '@/app/actions/team.actions';
import { Users, Loader2 } from 'lucide-react';
import { slugify } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface CreateTeamDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateTeamDialog({ isOpen, onClose }: CreateTeamDialogProps) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(slugify(val));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await createTeam({
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim() || undefined,
      });

      if (res.success && res.team) {
        onClose();
        setName('');
        setSlug('');
        setDescription('');
        router.push(`/teams/${res.team.slug}`);
      } else {
        setErrorMsg(res.error || 'Failed to create team.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
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
              <Users className="h-5 w-5" />
            </div>
            <DialogTitle className="text-xl font-extrabold text-slate-900 dark:text-white">
              Create a New Team
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Create a team to enable round-robin scheduling, multi-host collective meetings, and shared availability.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Team Name <span className="text-indigo-500">*</span>
              </label>
              <Input
                required
                placeholder="e.g. Sales Engineering, Product Team"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="h-11 rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Team URL Slug <span className="text-indigo-500">*</span>
              </label>
              <div className="flex items-center">
                <span className="px-3 h-11 flex items-center bg-slate-100 dark:bg-slate-800 border border-r-0 border-slate-200 dark:border-slate-700 text-xs text-slate-500 rounded-l-xl font-mono">
                  /teams/
                </span>
                <Input
                  required
                  placeholder="sales-engineering"
                  value={slug}
                  onChange={(e) => setSlug(slugify(e.target.value))}
                  className="h-11 rounded-none rounded-r-xl font-mono text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Description (Optional)
              </label>
              <Textarea
                rows={2}
                placeholder="Brief description of this team's scheduling purpose..."
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
                  <span>Creating Team...</span>
                </>
              ) : (
                <span>Create Team</span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
