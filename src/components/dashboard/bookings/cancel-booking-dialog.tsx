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
import { Textarea } from '@/components/ui/textarea';
import { cancelBooking } from '@/app/actions/booking-management.actions';
import { AlertTriangle, Loader2, Mail } from 'lucide-react';

interface CancelBookingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  booking: any | null;
  onSuccess?: () => void;
}

export function CancelBookingDialog({
  isOpen,
  onClose,
  booking,
  onSuccess,
}: CancelBookingDialogProps) {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!booking) return null;

  const handleCancelConfirm = async () => {
    if (!reason.trim()) {
      setErrorMsg('Please specify a cancellation reason so the attendee is informed.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await cancelBooking({
        bookingId: booking.id,
        cancelReason: reason.trim(),
      });

      if (res.success) {
        setReason('');
        onClose();
        if (onSuccess) onSuccess();
      } else {
        setErrorMsg(res.error || 'Failed to cancel meeting.');
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
          <div className="w-11 h-11 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <DialogTitle className="text-xl font-extrabold text-slate-900 dark:text-white">
            Cancel Scheduled Meeting
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Are you sure you want to cancel this meeting? A cancellation email update will be sent
            to{' '}
            <strong className="text-slate-700 dark:text-slate-200">{booking.guestEmail}</strong>.
          </DialogDescription>
        </DialogHeader>

        {/* Meeting Summary Box */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1.5 my-2">
          <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
            {booking.eventType?.title || 'Meeting'} with {booking.guestName}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            {new Date(booking.startTime).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}{' '}
            at{' '}
            {new Date(booking.startTime).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            })}
          </div>
        </div>

        {/* Reason Textarea */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
            Reason for cancellation <span className="text-rose-500">*</span>
          </label>
          <Textarea
            rows={3}
            placeholder="e.g. Unforeseen scheduling conflict, please rebook via my scheduling link."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="rounded-xl text-xs sm:text-sm"
          />
        </div>

        {/* Email Notification Note */}
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs">
          <Mail className="h-4 w-4 shrink-0 text-brand-500" />
          <span>An automated cancellation email with rebook instructions will be dispatched.</span>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs text-rose-600 dark:text-rose-400 font-semibold">
            {errorMsg}
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0 pt-2">
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={onClose}
            className="rounded-xl"
          >
            Nevermind
          </Button>

          <Button
            type="button"
            disabled={isSubmitting}
            onClick={handleCancelConfirm}
            className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md shadow-rose-600/20"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                <span>Cancelling & Sending Email...</span>
              </>
            ) : (
              <span>Yes, Cancel Meeting</span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
