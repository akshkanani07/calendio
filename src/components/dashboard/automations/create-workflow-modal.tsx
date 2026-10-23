'use client';

import React, { useState, useEffect } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { TriggerType, ActionType } from '@prisma/client';
import {
  WORKFLOW_VARIABLES,
  interpolateVariables,
  formatWorkflowEmailHtml,
} from '@/lib/workflow-engine';
import { WorkflowTemplate } from '@/lib/workflow-templates';
import {
  Clock,
  Mail,
  Sparkles,
  Send,
  Eye,
  Code2,
  Check,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface EventTypeOption {
  id: string;
  title: string;
  slug: string;
  color?: string;
}

interface CreateWorkflowModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: {
    id?: string;
    name: string;
    trigger: TriggerType;
    offsetMinutes: number;
    subject: string;
    template: string;
    action?: ActionType;
    recipient?: 'INVITEE' | 'HOST' | 'BOTH' | 'ADDITIONAL';
    additionalEmail?: string;
    eventTypeIds?: string[];
  } | null;
  eventTypes: EventTypeOption[];
  onSave: (data: any) => Promise<void>;
  onSendTest: (subject: string, template: string, email: string) => Promise<{ success: boolean; error?: string }>;
}

export function CreateWorkflowModal({
  open,
  onOpenChange,
  initialData,
  eventTypes,
  onSave,
  onSendTest,
}: CreateWorkflowModalProps) {
  const [name, setName] = useState('');
  const [trigger, setTrigger] = useState<TriggerType>(TriggerType.BEFORE_MEETING);

  // Timing offset state
  const [offsetValue, setOffsetValue] = useState<number>(24);
  const [offsetUnit, setOffsetUnit] = useState<'minutes' | 'hours' | 'days'>('hours');

  // Event types selection
  const [applyToAll, setApplyToAll] = useState<boolean>(true);
  const [selectedEventTypeIds, setSelectedEventTypeIds] = useState<string[]>([]);

  // Action & Content
  const [recipient, setRecipient] = useState<'INVITEE' | 'HOST' | 'BOTH' | 'ADDITIONAL'>('INVITEE');
  const [additionalEmail, setAdditionalEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [template, setTemplate] = useState('');

  // Active tab in dialog: 'editor' | 'preview'
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');

  // Test email state
  const [testEmail, setTestEmail] = useState('');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testSuccess, setTestSuccess] = useState<string | null>(null);
  const [testError, setTestError] = useState<string | null>(null);

  // Saving state
  const [isSaving, setIsSaving] = useState(false);

  // Preload initial data if provided
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setTrigger(initialData.trigger || TriggerType.BEFORE_MEETING);

      const offset = Math.abs(initialData.offsetMinutes || 0);
      if (offset >= 1440 && offset % 1440 === 0) {
        setOffsetValue(offset / 1440);
        setOffsetUnit('days');
      } else if (offset >= 60 && offset % 60 === 0) {
        setOffsetValue(offset / 60);
        setOffsetUnit('hours');
      } else {
        setOffsetValue(offset || 24);
        setOffsetUnit('hours');
      }

      if (initialData.eventTypeIds && initialData.eventTypeIds.length > 0) {
        setApplyToAll(false);
        setSelectedEventTypeIds(initialData.eventTypeIds);
      } else {
        setApplyToAll(true);
        setSelectedEventTypeIds([]);
      }

      setRecipient(initialData.recipient || 'INVITEE');
      setAdditionalEmail(initialData.additionalEmail || '');
      setSubject(initialData.subject || '');
      setTemplate(initialData.template || '');
    } else {
      // Default new workflow
      setName('Email reminder to invitee (24 hours before)');
      setTrigger(TriggerType.BEFORE_MEETING);
      setOffsetValue(24);
      setOffsetUnit('hours');
      setApplyToAll(true);
      setSelectedEventTypeIds([]);
      setRecipient('INVITEE');
      setAdditionalEmail('');
      setSubject('Reminder: {event_name} with {host_name} tomorrow');
      setTemplate(
        `Hi {invitee_first_name},\n\nThis is a friendly reminder that your upcoming {event_name} with {host_name} is scheduled for tomorrow:\n\n📅 Date: {event_date}\n⏰ Time: {event_time}\n📍 Location: {meeting_url}\n\nNeed to reschedule?\n👉 {reschedule_link}\n\nBest regards,\n{host_name}`
      );
    }
    setActiveTab('editor');
    setTestSuccess(null);
    setTestError(null);
  }, [initialData, open]);

  // Insert variable tag into template
  const handleInsertVariable = (variableKey: string) => {
    const token = `{${variableKey}}`;
    setTemplate((prev) => prev + (prev.endsWith(' ') || prev.endsWith('\n') ? '' : ' ') + token);
  };

  const handleInsertVariableInSubject = (variableKey: string) => {
    const token = `{${variableKey}}`;
    setSubject((prev) => prev + ' ' + token);
  };

  // Toggle single event type selection
  const handleToggleEventType = (id: string) => {
    setSelectedEventTypeIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Compute total offset in minutes
  const calculateOffsetMinutes = (): number => {
    if (trigger === TriggerType.BOOKING_CREATED || trigger === TriggerType.BOOKING_CANCELLED || trigger === TriggerType.BOOKING_RESCHEDULED) {
      return 0;
    }
    const multiplier = offsetUnit === 'days' ? 1440 : offsetUnit === 'hours' ? 60 : 1;
    const total = offsetValue * multiplier;
    return trigger === TriggerType.BEFORE_MEETING ? -total : total;
  };

  // Handle save
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSaving(true);
    try {
      await onSave({
        id: initialData?.id,
        name: name.trim(),
        trigger,
        offsetMinutes: calculateOffsetMinutes(),
        subject: subject.trim(),
        template: template.trim(),
        action: ActionType.SEND_EMAIL,
        recipient,
        additionalEmail: recipient === 'ADDITIONAL' ? additionalEmail.trim() : undefined,
        eventTypeIds: applyToAll ? [] : selectedEventTypeIds,
      });
      onOpenChange(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle send test email
  const handleSendTestEmail = async () => {
    if (!testEmail || !testEmail.includes('@')) {
      setTestError('Please enter a valid email address');
      return;
    }

    setIsSendingTest(true);
    setTestSuccess(null);
    setTestError(null);

    try {
      const res = await onSendTest(subject, template, testEmail);
      if (res.success) {
        setTestSuccess(`Test email sent successfully to ${testEmail}!`);
      } else {
        setTestError(res.error || 'Failed to send test email');
      }
    } catch (err: any) {
      setTestError(err.message || 'Error sending test email');
    } finally {
      setIsSendingTest(false);
    }
  };

  // Mock preview rendered HTML
  const previewHtml = formatWorkflowEmailHtml({
    subject: interpolateVariables(subject, {}),
    bodyContent: interpolateVariables(template, {}),
    hostName: 'Calendio Host',
    meetingUrl: 'https://meet.google.com/abc-demo-call',
    rescheduleLink: 'https://calendio.com/bookings/reschedule/sample',
    cancelLink: 'https://calendio.com/bookings/cancel/sample',
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-hidden flex flex-col p-0 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div>
            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
              {initialData?.id ? 'Edit workflow' : 'Create workflow'}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Configure trigger rules, recipient timing, and customizable email templates.
            </DialogDescription>
          </div>

          {/* Toggle between editor & preview */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('editor')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'editor'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              Editor
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'preview'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Live Preview
            </button>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'editor' ? (
            <form id="workflow-form" onSubmit={handleSave} className="space-y-6">
              {/* Section 1: Workflow Name */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Workflow Name
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Email reminder to invitee 24 hours before"
                  required
                  className="rounded-xl h-11 text-sm font-medium"
                />
              </div>

              {/* Section 2: Trigger & Timing */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                    When this happens (Trigger)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                      Trigger Event
                    </label>
                    <select
                      value={trigger}
                      onChange={(e) => setTrigger(e.target.value as TriggerType)}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      <option value={TriggerType.BEFORE_MEETING}>Before event starts</option>
                      <option value={TriggerType.AFTER_MEETING}>After event ends</option>
                      <option value={TriggerType.BOOKING_CREATED}>Immediately when event is scheduled</option>
                      <option value={TriggerType.BOOKING_CANCELLED}>When event is canceled</option>
                      <option value={TriggerType.BOOKING_RESCHEDULED}>When event is rescheduled</option>
                    </select>
                  </div>

                  {(trigger === TriggerType.BEFORE_MEETING || trigger === TriggerType.AFTER_MEETING) && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                        Timing Offset
                      </label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min={1}
                          max={999}
                          value={offsetValue}
                          onChange={(e) => setOffsetValue(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-24 h-10 rounded-xl text-xs font-semibold"
                        />
                        <select
                          value={offsetUnit}
                          onChange={(e) => setOffsetUnit(e.target.value as any)}
                          className="flex-1 h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                        >
                          <option value="minutes">Minutes {trigger === TriggerType.BEFORE_MEETING ? 'before' : 'after'}</option>
                          <option value="hours">Hours {trigger === TriggerType.BEFORE_MEETING ? 'before' : 'after'}</option>
                          <option value="days">Days {trigger === TriggerType.BEFORE_MEETING ? 'before' : 'after'}</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Section 3: Which event types does this apply to? */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 block">
                  Which event types does this apply to?
                </label>

                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      name="applyTo"
                      checked={applyToAll}
                      onChange={() => setApplyToAll(true)}
                      className="text-brand-600 focus:ring-brand-500"
                    />
                    All event types ({eventTypes.length})
                  </label>

                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      name="applyTo"
                      checked={!applyToAll}
                      onChange={() => setApplyToAll(false)}
                      className="text-brand-600 focus:ring-brand-500"
                    />
                    Specific event types
                  </label>
                </div>

                {!applyToAll && (
                  <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {eventTypes.map((et) => (
                      <label
                        key={et.id}
                        className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-medium cursor-pointer transition-colors ${
                          selectedEventTypeIds.includes(et.id)
                            ? 'bg-brand-50 dark:bg-brand-950/40 border-brand-200 dark:border-brand-900/60 text-brand-900 dark:text-brand-200'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedEventTypeIds.includes(et.id)}
                          onChange={() => handleToggleEventType(et.id)}
                          className="rounded text-brand-600 focus:ring-brand-500"
                        />
                        <span className="truncate">{et.title}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Section 4: Email Content & Variables */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                      Do this: Send Email
                    </span>
                  </div>

                  {/* Recipient Selector */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-500">Send to:</span>
                    <select
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value as any)}
                      className="h-8 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
                    >
                      <option value="INVITEE">Invitee</option>
                      <option value="HOST">Host (Myself)</option>
                      <option value="BOTH">Both Invitee & Host</option>
                      <option value="ADDITIONAL">Additional Email</option>
                    </select>
                  </div>
                </div>

                {recipient === 'ADDITIONAL' && (
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                      Additional Recipient Email
                    </label>
                    <Input
                      type="email"
                      value={additionalEmail}
                      onChange={(e) => setAdditionalEmail(e.target.value)}
                      placeholder="e.g. assistant@company.com"
                      required
                      className="rounded-xl h-10 text-xs"
                    />
                  </div>
                )}

                {/* Email Subject Line */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                      Email Subject
                    </label>
                    <span className="text-[11px] text-slate-400">
                      Variables work here too
                    </span>
                  </div>
                  <Input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Reminder: {event_name} tomorrow"
                    required
                    className="rounded-xl h-10 text-xs font-medium"
                  />
                </div>

                {/* Dynamic Variable Chips */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-brand-500" />
                      Dynamic Variables (Click to insert):
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                    {WORKFLOW_VARIABLES.map((v) => (
                      <button
                        type="button"
                        key={v.key}
                        onClick={() => handleInsertVariable(v.key)}
                        className="px-2 py-1 rounded-md text-[11px] font-mono bg-slate-100 hover:bg-brand-50 hover:text-brand-700 dark:bg-slate-800 dark:hover:bg-brand-950/60 dark:hover:text-brand-300 text-slate-600 dark:text-slate-300 transition-colors border border-transparent hover:border-brand-200"
                        title={`Inserts {${v.key}} - Example: "${v.example}"`}
                      >
                        {`{${v.key}}`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Email Body Textarea */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Email Body / Message
                  </label>
                  <Textarea
                    rows={8}
                    value={template}
                    onChange={(e) => setTemplate(e.target.value)}
                    placeholder="Write your email body..."
                    required
                    className="rounded-xl font-mono text-xs leading-relaxed"
                  />
                </div>

                {/* Test Email Section */}
                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-1">
                    <Input
                      type="email"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      placeholder="Enter email to test (e.g. you@example.com)"
                      className="rounded-xl h-9 text-xs flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleSendTestEmail}
                      disabled={isSendingTest || !testEmail}
                      className="h-9 px-3 text-xs font-semibold rounded-xl shrink-0"
                    >
                      <Send className="w-3.5 h-3.5 mr-1" />
                      {isSendingTest ? 'Sending...' : 'Send Test'}
                    </Button>
                  </div>
                </div>

                {testSuccess && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-xs font-medium text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                    <Check className="w-4 h-4 shrink-0" />
                    {testSuccess}
                  </div>
                )}

                {testError && (
                  <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-xs font-medium text-rose-700 dark:text-rose-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {testError}
                  </div>
                )}
              </div>
            </form>
          ) : (
            /* Live Preview Tab */
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-xs text-blue-700 dark:text-blue-300 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 shrink-0" />
                This is a live preview of how your email will be delivered to invitees or hosts.
              </div>

              {/* Rendered HTML inside preview frame */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50 dark:bg-slate-950 p-2">
                <iframe
                  title="Email Preview"
                  srcDoc={previewHtml}
                  className="w-full h-[480px] rounded-xl border-0 bg-white"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2 shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
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
            form="workflow-form"
            isLoading={isSaving}
            className="rounded-xl h-10 px-6 text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-sm shadow-brand-500/20"
          >
            {initialData?.id ? 'Save changes' : 'Create workflow'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
