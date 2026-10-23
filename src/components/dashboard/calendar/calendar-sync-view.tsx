'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { ConnectCalendarModal } from './connect-calendar-modal';
import { CreateWebhookModal } from './create-webhook-modal';
import { CalendarConnectionsTab } from './calendar-connections-tab';
import { WebhooksTab } from './webhooks-tab';
import { IntegrationType } from '@prisma/client';
import {
  toggleCheckConflicts,
  setPrimaryCalendar,
  disconnectCalendar,
  toggleIntegration,
  deleteWebhook,
  testWebhook,
} from '@/app/actions/calendar-sync.actions';
import { CheckCircle2, Video, Send } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CalendarSyncViewProps {
  userId: string;
  userEmail: string;
  initialCalendars: any[];
  initialIntegrations: any[];
  initialWebhooks: any[];
}

export function CalendarSyncView({
  userId,
  userEmail,
  initialCalendars,
  initialIntegrations,
  initialWebhooks,
}: CalendarSyncViewProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'calendars' | 'conferencing' | 'webhooks'>('calendars');

  const [calendars, setCalendars] = useState<any[]>(initialCalendars);
  const [integrations, setIntegrations] = useState<any[]>(initialIntegrations);
  const [webhooks, setWebhooks] = useState<any[]>(initialWebhooks);

  // Modals state
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [connectProvider, setConnectProvider] = useState<IntegrationType>(IntegrationType.GOOGLE_CALENDAR);

  const [isWebhookModalOpen, setIsWebhookModalOpen] = useState(false);

  // Delete / Disconnect confirm modals
  const [disconnectTarget, setDisconnectTarget] = useState<any | null>(null);
  const [isDisconnectModalOpen, setIsDisconnectModalOpen] = useState(false);

  const [deleteWebhookTarget, setDeleteWebhookTarget] = useState<any | null>(null);
  const [isDeleteWebhookModalOpen, setIsDeleteWebhookModalOpen] = useState(false);

  // Webhook testing feedback
  const [testingWebhookId, setTestingWebhookId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; msg: string; success: boolean } | null>(null);

  // Calendar handlers
  const handleToggleConflict = async (calendarId: string, currentVal: boolean) => {
    const newVal = !currentVal;
    setCalendars((prev) =>
      prev.map((c) => (c.id === calendarId ? { ...c, checkConflicts: newVal } : c))
    );
    await toggleCheckConflicts(calendarId, newVal);
  };

  const handleSetPrimary = async (calendarId: string) => {
    setCalendars((prev) =>
      prev.map((c) => ({ ...c, isPrimary: c.id === calendarId }))
    );
    await setPrimaryCalendar(calendarId);
  };

  const handleConfirmDisconnect = async () => {
    if (!disconnectTarget) return;
    const res = await disconnectCalendar(disconnectTarget.id);
    if (res.success) {
      setCalendars((prev) => prev.filter((c) => c.id !== disconnectTarget.id));
      router.refresh();
    }
    setDisconnectTarget(null);
  };

  const handleOpenConnect = (provider: IntegrationType) => {
    setConnectProvider(provider);
    setIsConnectModalOpen(true);
  };

  // Integration toggle
  const handleToggleApp = async (type: IntegrationType, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    setIntegrations((prev) => {
      const idx = prev.findIndex((i) => i.type === type);
      if (idx !== -1) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], isConnected: newStatus };
        return copy;
      }
      return [...prev, { type, isConnected: newStatus }];
    });
    await toggleIntegration(type, newStatus);
  };

  // Webhook handlers
  const handleConfirmDeleteWebhook = async () => {
    if (!deleteWebhookTarget) return;
    const res = await deleteWebhook(deleteWebhookTarget.id);
    if (res.success) {
      setWebhooks((prev) => prev.filter((w) => w.id !== deleteWebhookTarget.id));
      router.refresh();
    }
    setDeleteWebhookTarget(null);
  };

  const handleTestWebhook = async (webhookId: string) => {
    setTestingWebhookId(webhookId);
    setTestResult(null);
    try {
      const res = await testWebhook(webhookId);
      if (res.success) {
        setTestResult({ id: webhookId, msg: `Success: ${res.message}`, success: true });
      } else {
        setTestResult({ id: webhookId, msg: `Error: ${res.error}`, success: false });
      }
    } finally {
      setTestingWebhookId(null);
    }
  };

  const isAppConnected = (type: IntegrationType) => {
    const found = integrations.find((i) => i.type === type);
    return found ? found.isConnected : false;
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Calendar Sync & Integrations
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/60">
              <CheckCircle2 className="w-3 h-3" />
              Real-time Sync
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Prevent double-booking, sync real-time availability with external calendars, and connect conferencing.
          </p>
        </div>
      </div>

      {/* Tabs Row (Mobile Scrollable) */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex items-center gap-6 overflow-x-auto max-w-full">
        <button
          onClick={() => setActiveTab('calendars')}
          className={`pb-3 text-sm font-bold transition-all relative whitespace-nowrap shrink-0 ${
            activeTab === 'calendars'
              ? 'text-brand-600 dark:text-brand-400'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          Calendar Connections ({calendars.length})
          {activeTab === 'calendars' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600 dark:bg-brand-400 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('conferencing')}
          className={`pb-3 text-sm font-bold transition-all relative whitespace-nowrap shrink-0 ${
            activeTab === 'conferencing'
              ? 'text-brand-600 dark:text-brand-400'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          Video Conferencing (4)
          {activeTab === 'conferencing' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600 dark:bg-brand-400 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('webhooks')}
          className={`pb-3 text-sm font-bold transition-all relative whitespace-nowrap shrink-0 ${
            activeTab === 'webhooks'
              ? 'text-brand-600 dark:text-brand-400'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          Developer Webhooks ({webhooks.length})
          {activeTab === 'webhooks' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600 dark:bg-brand-400 rounded-full" />
          )}
        </button>
      </div>

      {/* TAB 1: CALENDAR CONNECTIONS */}
      {activeTab === 'calendars' && (
        <CalendarConnectionsTab
          userId={userId}
          calendars={calendars}
          onOpenConnectModal={handleOpenConnect}
          onToggleConflict={handleToggleConflict}
          onSetPrimary={handleSetPrimary}
          onRequestDisconnect={(cal) => {
            setDisconnectTarget(cal);
            setIsDisconnectModalOpen(true);
          }}
        />
      )}

      {/* TAB 2: VIDEO CONFERENCING */}
      {activeTab === 'conferencing' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-11 w-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center shrink-0">
                <Video className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  Google Meet
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-extrabold uppercase">
                    Default
                  </span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Automatically attaches unique Google Meet video conference URLs to every booked meeting.
                </p>
              </div>
            </div>

            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              Always Active
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-11 w-11 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 flex items-center justify-center shrink-0">
                <Video className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Zoom Meetings</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Generate instant Zoom video conference links for meetings.
                </p>
              </div>
            </div>

            <Switch
              checked={isAppConnected(IntegrationType.ZOOM)}
              onCheckedChange={() => handleToggleApp(IntegrationType.ZOOM, isAppConnected(IntegrationType.ZOOM))}
            />
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-11 w-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center shrink-0">
                <Video className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Microsoft Teams</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Enterprise video conferencing via Microsoft Teams for corporate clients.
                </p>
              </div>
            </div>

            <Switch
              checked={isAppConnected(IntegrationType.MICROSOFT_TEAMS)}
              onCheckedChange={() => handleToggleApp(IntegrationType.MICROSOFT_TEAMS, isAppConnected(IntegrationType.MICROSOFT_TEAMS))}
            />
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-11 w-11 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center shrink-0">
                <Send className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Slack Notifications</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Send real-time alerts into your private Slack channels when an invitee books or cancels.
                </p>
              </div>
            </div>

            <Switch
              checked={isAppConnected(IntegrationType.SLACK)}
              onCheckedChange={() => handleToggleApp(IntegrationType.SLACK, isAppConnected(IntegrationType.SLACK))}
            />
          </div>
        </div>
      )}

      {/* TAB 3: DEVELOPER WEBHOOKS */}
      {activeTab === 'webhooks' && (
        <WebhooksTab
          webhooks={webhooks}
          onOpenAddModal={() => setIsWebhookModalOpen(true)}
          onRequestDelete={(wh) => {
            setDeleteWebhookTarget(wh);
            setIsDeleteWebhookModalOpen(true);
          }}
          onTestWebhook={handleTestWebhook}
          testingWebhookId={testingWebhookId}
          testResult={testResult}
          onClearTestResult={() => setTestResult(null)}
        />
      )}

      {/* Connect Calendar Modal */}
      <ConnectCalendarModal
        open={isConnectModalOpen}
        onOpenChange={setIsConnectModalOpen}
        defaultProvider={connectProvider}
        defaultEmail={userEmail}
      />

      {/* Create Webhook Modal */}
      <CreateWebhookModal
        open={isWebhookModalOpen}
        onOpenChange={setIsWebhookModalOpen}
      />

      {/* Disconnect Calendar Modal */}
      <ConfirmModal
        open={isDisconnectModalOpen}
        onOpenChange={setIsDisconnectModalOpen}
        title="Disconnect Calendar?"
        description={`Are you sure you want to disconnect ${disconnectTarget?.accountEmail}? Calendio will no longer check this calendar for conflicts or export new bookings to it.`}
        confirmText="Disconnect"
        variant="destructive"
        onConfirm={handleConfirmDisconnect}
      />

      {/* Delete Webhook Modal */}
      <ConfirmModal
        open={isDeleteWebhookModalOpen}
        onOpenChange={setIsDeleteWebhookModalOpen}
        title="Delete Webhook Subscription?"
        description={`Are you sure you want to delete the webhook "${deleteWebhookTarget?.url}"? Live HTTP event payloads will immediately cease.`}
        confirmText="Delete Webhook"
        variant="destructive"
        onConfirm={handleConfirmDeleteWebhook}
      />
    </div>
  );
}