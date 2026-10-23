'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { IntegrationType } from '@prisma/client';
import { Calendar, CheckCircle2, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';
import { connectCalendarAccount } from '@/app/actions/calendar-sync.actions';

interface ConnectCalendarModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultProvider: IntegrationType;
  defaultEmail: string;
}

export function ConnectCalendarModal({
  open,
  onOpenChange,
  defaultProvider,
  defaultEmail,
}: ConnectCalendarModalProps) {
  const [provider, setProvider] = useState<IntegrationType>(defaultProvider);
  const [email, setEmail] = useState(defaultEmail || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    setProvider(defaultProvider);
    setEmail(defaultEmail || '');
    setError(null);
  }, [defaultProvider, defaultEmail, open]);

  const providerNames: Record<IntegrationType, string> = {
    GOOGLE_CALENDAR: 'Google Calendar',
    OUTLOOK_CALENDAR: 'Microsoft Outlook 365',
    APPLE_CALENDAR: 'Apple iCloud Calendar',
    ZOOM: 'Zoom',
    GOOGLE_MEET: 'Google Meet',
    MICROSOFT_TEAMS: 'Microsoft Teams',
    SLACK: 'Slack',
    ZAPIER: 'Zapier',
    HUBSPOT: 'HubSpot',
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please provide a valid calendar email address.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await connectCalendarAccount({
        provider,
        accountEmail: email.trim(),
      });

      if (res.success) {
        onOpenChange(false);
      } else {
        setError(res.error || 'Failed to connect calendar account.');
      }
    } catch (err: any) {
      setError(err.message || 'Error connecting calendar.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="h-10 w-10 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-1">
            <Calendar className="h-5 w-5" />
          </div>
          <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
            Connect {providerNames[provider] || 'Calendar'}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
            Calendio will check this calendar for busy times and prevent invitees from double-booking you.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleConnect} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-xs font-medium text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Provider
            </label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value as IntegrationType)}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value={IntegrationType.GOOGLE_CALENDAR}>Google Calendar</option>
              <option value={IntegrationType.OUTLOOK_CALENDAR}>Microsoft Outlook 365</option>
              <option value={IntegrationType.APPLE_CALENDAR}>Apple iCloud Calendar</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Account Email
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. alex@gmail.com"
              required
              className="rounded-xl h-10 text-xs font-medium"
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
            <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Privacy & Conflict Checking
            </span>
            <p>
              Calendio only reads whether you are free or busy. Your private meeting titles and personal notes are never shared with attendees.
            </p>
          </div>

          <DialogFooter className="pt-2 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl h-10 px-4 text-xs font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isLoading}
              className="rounded-xl h-10 px-5 text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-sm"
            >
              Connect Calendar
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
