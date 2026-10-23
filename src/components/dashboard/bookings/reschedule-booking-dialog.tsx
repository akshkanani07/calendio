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
import { rescheduleBooking } from '@/app/actions/booking-management.actions';
import { Calendar, Clock, Loader2, Mail } from 'lucide-react';

interface RescheduleBookingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  booking: any | null;
  onSuccess?: () => void;
}

export function RescheduleBookingDialog({
  isOpen,
  onClose,
  booking,
  onSuccess,
}: RescheduleBookingDialogProps) {
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('10:00');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!booking) return null;

  const durationMin = booking.eventType?.duration || 30;

  const handleRescheduleConfirm = async () => {
    if (!newDate) {
      setErrorMsg('Please pick a new date.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const [year, month, day] = newDate.split('-').map(Number);
      const [hour, min] = newTime.split(':').map(Number);

      const start = new Date(Date.UTC(year, month - 1, day, hour, min, 0));
      const end = new Date(start.getTime() + durationMin * 60 * 1000);

      const res = await rescheduleBooking({
        bookingId: booking.id,
        newIsoStart: start.toISOString(),
        newIsoEnd: end.toISOString(),
        rescheduleReason: reason.trim() || undefined,
      });

      if (res.success) {
        onClose();
        if (onSuccess) onSuccess();
      } else {
        setErrorMsg(res.error || 'Failed to reschedule.');
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
        <DialogHeader className="space-y-2.5">
          <div className="w-11 h-11 rounded-2xl bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-900/60 text-brand-600 flex items-center justify-center">
            <Calendar className="h-5 w-5 text-brand-500" />
          </div>
          <DialogTitle className="text-xl font-extrabold text-slate-900 dark:text-white">
            Reschedule Meeting
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Select a new date and time for {booking.guestName}. Both you and the attendee will
            receive updated email invites.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-2">
          {/* New Date Picker */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              New Date <span className="text-brand-500">*</span>
            </label>
            <Input
              type="date"
              required
              min={new Date().toISOString().split('T')[0]}
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="rounded-xl h-11"
            />
          </div>

          {/* New Time Picker */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              New Time (Duration: {durationMin} min) <span className="text-brand-500">*</span>
            </label>
            <Input
              type="time"
              required
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="rounded-xl h-11"
            />
          </div>

          {/* Reschedule Reason / Note */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Reason / Note for Attendee (Optional)
            </label>
            <Textarea
              rows={2}
              placeholder="e.g. Rescheduled due to prior commitment..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="rounded-xl text-xs sm:text-sm"
            />
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs">
            <Mail className="h-4 w-4 shrink-0 text-brand-500" />
            <span>Updated calendar invitations will be emailed automatically.</span>
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
            type="button"
            disabled={isSubmitting}
            onClick={handleRescheduleConfirm}
            className="rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold shadow-md shadow-brand-500/20"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                <span>Rescheduling...</span>
              </>
            ) : (
              <span>Confirm Reschedule</span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
