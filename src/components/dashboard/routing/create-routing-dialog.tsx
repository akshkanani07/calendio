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
import { createRoutingForm } from '@/app/actions/routing.actions';
import { GitFork, Loader2 } from 'lucide-react';
import { slugify } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface CreateRoutingDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateRoutingDialog({ isOpen, onClose }: CreateRoutingDialogProps) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
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
      const res = await createRoutingForm({
        title: title.trim(),
        slug: slug.trim(),
        description: description.trim() || undefined,
      });

      if (res.success && res.slug) {
        onClose();
        setTitle('');
        setSlug('');
        setDescription('');
        router.push(`/routing/${res.slug}`);
      } else {
        setErrorMsg(res.error || 'Failed to create routing form.');
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
            <div className="w-11 h-11 rounded-2xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-900/60 text-purple-600 flex items-center justify-center">
              <GitFork className="h-5 w-5" />
            </div>
            <DialogTitle className="text-xl font-extrabold text-slate-900 dark:text-white">
              Create Routing Form
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Ask screening questions to qualify leads and automatically route respondents to the right booking page.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Form Title <span className="text-purple-600">*</span>
              </label>
              <Input
                required
                placeholder="e.g. Sales Inquiry, Partnership Request"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="h-11 rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Form URL Slug <span className="text-purple-600">*</span>
              </label>
              <div className="flex items-center">
                <span className="px-3 h-11 flex items-center bg-slate-100 dark:bg-slate-800 border border-r-0 border-slate-200 dark:border-slate-700 text-xs text-slate-500 rounded-l-xl font-mono">
                  /forms/
                </span>
                <Input
                  required
                  placeholder="sales-inquiry"
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
                placeholder="Brief intro for your respondents..."
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
              className="rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md shadow-purple-600/20"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                  <span>Creating Form...</span>
                </>
              ) : (
                <span>Continue to Logic Builder</span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
