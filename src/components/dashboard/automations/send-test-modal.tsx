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
import { Send, Check, AlertCircle, Mail } from 'lucide-react';

interface SendTestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  automation: any;
  defaultEmail: string;
  onSend: (subject: string, template: string, email: string) => Promise<{ success: boolean; error?: string }>;
}

export function SendTestModal({
  open,
  onOpenChange,
  automation,
  defaultEmail,
  onSend,
}: SendTestModalProps) {
  const [email, setEmail] = useState(defaultEmail || '');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const workflowStep = automation?.workflows?.[0] || {};
  const config = workflowStep.config || {};
  const subject = config.subject || automation?.name || 'Workflow Notification';
  const template = workflowStep.template || '';

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await onSend(subject, template, email.trim());
      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          onOpenChange(false);
          setSuccess(false);
        }, 1500);
      } else {
        setError(res.error || 'Failed to send test email.');
      }
    } catch (err: any) {
      setError(err.message || 'Error sending test email.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl">
        <DialogHeader className="space-y-1.5">
          <div className="h-10 w-10 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-1">
            <Mail className="h-5 w-5" />
          </div>
          <DialogTitle className="text-base font-bold text-slate-900 dark:text-white">
            Send test email
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
            We'll send a sample email for &ldquo;{automation?.name}&rdquo; populated with demo booking data.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSend} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Recipient Email Address
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. you@example.com"
              required
              className="rounded-xl h-10 text-xs"
            />
          </div>

          {success && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-xs font-medium text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              Test email sent successfully! Check your inbox.
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-xs font-medium text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

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
              <Send className="w-3.5 h-3.5 mr-1.5" />
              Send Email
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
