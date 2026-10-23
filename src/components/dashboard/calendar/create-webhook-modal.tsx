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
import { Webhook, Plus, AlertCircle, Check } from 'lucide-react';
import { createWebhook } from '@/app/actions/calendar-sync.actions';

interface CreateWebhookModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AVAILABLE_EVENTS = [
  { id: 'booking.created', label: 'Booking Created', desc: 'Triggered whenever a guest schedules a new meeting' },
  { id: 'booking.cancelled', label: 'Booking Canceled', desc: 'Triggered when a meeting is canceled by host or guest' },
  { id: 'booking.rescheduled', label: 'Booking Rescheduled', desc: 'Triggered when a booking time slot is modified' },
];

export function CreateWebhookModal({ open, onOpenChange }: CreateWebhookModalProps) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>([
    'booking.created',
    'booking.cancelled',
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleToggleEvent = (eventId: string) => {
    setSelectedEvents((prev) =>
      prev.includes(eventId) ? prev.filter((e) => e !== eventId) : [...prev, eventId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !url.trim()) return;
    if (!url.startsWith('https://') && !url.startsWith('http://localhost')) {
      setError('Webhook URL must begin with https:// (or http://localhost for local development).');
      return;
    }
    if (selectedEvents.length === 0) {
      setError('Please select at least one trigger event.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await createWebhook({
        name: name.trim(),
        url: url.trim(),
        events: selectedEvents,
      });

      if (res.success) {
        onOpenChange(false);
        setName('');
        setUrl('');
      } else {
        setError(res.error || 'Failed to create webhook.');
      }
    } catch (err: any) {
      setError(err.message || 'Error creating webhook.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="h-10 w-10 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-1">
            <Webhook className="h-5 w-5" />
          </div>
          <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
            Add Webhook Endpoint
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
            Send real-time JSON payloads to your server, Zapier, or Make whenever events happen.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-xs font-medium text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Webhook Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Zapier Production Sync"
              required
              className="rounded-xl h-10 text-xs font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Payload Destination URL
            </label>
            <Input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://hooks.zapier.com/hooks/catch/..."
              required
              className="rounded-xl h-10 text-xs font-mono"
            />
          </div>

          {/* Trigger Events */}
          <div className="space-y-2 pt-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              Subscribed Events
            </label>
            <div className="space-y-2">
              {AVAILABLE_EVENTS.map((ev) => (
                <label
                  key={ev.id}
                  className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                    selectedEvents.includes(ev.id)
                      ? 'bg-brand-50/70 dark:bg-brand-950/40 border-brand-200 dark:border-brand-900/60'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedEvents.includes(ev.id)}
                    onChange={() => handleToggleEvent(ev.id)}
                    className="mt-0.5 rounded text-brand-600 focus:ring-brand-500"
                  />
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">
                      {ev.label}
                    </span>
                    <span className="text-[11px] text-slate-400 block leading-tight mt-0.5">
                      {ev.desc}
                    </span>
                  </div>
                </label>
              ))}
            </div>
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
              Add Endpoint
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
