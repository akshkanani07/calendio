'use client';

import React, { useState } from 'react';
import { Calendar as CalendarIcon, Plus, Trash2, ShieldAlert, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { addDateOverride, deleteDateOverride } from '@/app/actions/availability.actions';

interface DateOverridesManagerProps {
  overrides: any[];
}

export function DateOverridesManager({ overrides }: DateOverridesManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dateStr, setDateStr] = useState('');
  const [reason, setReason] = useState('Vacation / Day Off');
  const [isBlocked, setIsBlocked] = useState(true);
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('14:00');
  const [isLoading, setIsLoading] = useState(false);

  // Custom Delete Confirm Modal State
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const handleAddOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dateStr) return;

    setIsLoading(true);
    try {
      await addDateOverride({
        dateStr,
        reason,
        isBlocked,
        startTime: isBlocked ? undefined : startTime,
        endTime: isBlocked ? undefined : endTime,
      });
      setIsOpen(false);
      setDateStr('');
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (deleteTargetId) {
      await deleteDateOverride(deleteTargetId);
      setDeleteTargetId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-brand-500" />
              Date-Specific Hours & Vacation Blocking
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Override your regular weekly hours for holidays, doctor appointments, or vacations.
            </p>
          </div>

          <Button
            onClick={() => setIsOpen(true)}
            className="h-9 px-4 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/20 flex items-center gap-1.5"
          >
            <Plus className="h-3.5 w-3.5 stroke-[3]" />
            <span>Add Date Override</span>
          </Button>
        </div>

        {overrides.length === 0 ? (
          <div className="py-10 text-center text-slate-400 space-y-2">
            <p className="text-xs font-semibold">No date overrides configured</p>
            <p className="text-[11px] text-slate-500">
              Click &quot;Add Date Override&quot; to mark specific holidays or days off.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {overrides.map((ov) => {
              const formattedDate = new Date(ov.date).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              return (
                <div
                  key={ov.id}
                  className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <div className="space-y-0.5">
                    <p className="font-bold text-xs text-slate-900 dark:text-white">
                      {formattedDate}
                    </p>
                    <div className="flex items-center gap-2 text-xs">
                      {ov.isBlocked ? (
                        <span className="font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-md text-[10px]">
                          Unavailable (Blocked All Day)
                        </span>
                      ) : (
                        <span className="font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/40 px-2 py-0.5 rounded-md text-[10px]">
                          Custom Hours: {ov.startTime} - {ov.endTime}
                        </span>
                      )}
                      <span className="text-slate-400 text-xs">• {ov.reason}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setDeleteTargetId(ov.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Remove Override"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Date Override Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md p-6 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl">
          <DialogHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
              Add Date Override
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Select a date when your regular weekly hours should not apply.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddOverride} className="space-y-4 pt-3 text-sm">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Select Date *
              </label>
              <Input
                type="date"
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                className="rounded-xl h-10"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Reason / Note
              </label>
              <Input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Diwali Holiday, Doctor Visit"
                className="rounded-xl h-10"
              />
            </div>

            <div className="space-y-2 pt-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Availability on this date:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIsBlocked(true)}
                  className={
                    'p-2.5 rounded-xl border text-xs font-bold transition-all text-center ' +
                    (isBlocked
                      ? 'border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                      : 'border-slate-200 dark:border-slate-800 text-slate-500')
                  }
                >
                  Block Entire Day
                </button>
                <button
                  type="button"
                  onClick={() => setIsBlocked(false)}
                  className={
                    'p-2.5 rounded-xl border text-xs font-bold transition-all text-center ' +
                    (!isBlocked
                      ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300'
                      : 'border-slate-200 dark:border-slate-800 text-slate-500')
                  }
                >
                  Custom Hours
                </button>
              </div>
            </div>

            {!isBlocked && (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400">Start Time</label>
                  <Input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="rounded-xl h-9 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400">End Time</label>
                  <Input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="rounded-xl h-9 text-xs"
                  />
                </div>
              </div>
            )}

            <DialogFooter className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="rounded-xl h-10 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-xl h-10 text-xs font-bold bg-brand-500 hover:bg-brand-600 text-white"
                isLoading={isLoading}
              >
                Apply Override
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reusable Calendio Confirmation Modal */}
      <ConfirmModal
        open={Boolean(deleteTargetId)}
        onOpenChange={(open) => !open && setDeleteTargetId(null)}
        title="Remove Date Override"
        description="Are you sure you want to remove this date override? Your regular weekly hours will apply again for this date."
        confirmText="Remove Override"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}
