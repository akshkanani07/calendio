'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Webhook, Plus, Send, Trash2, Eye, EyeOff } from 'lucide-react';

interface WebhooksTabProps {
  webhooks: any[];
  onOpenAddModal: () => void;
  onRequestDelete: (webhook: any) => void;
  onTestWebhook: (webhookId: string) => Promise<void>;
  testingWebhookId: string | null;
  testResult: { id: string; msg: string; success: boolean } | null;
  onClearTestResult: () => void;
}

export function WebhooksTab({
  webhooks,
  onOpenAddModal,
  onRequestDelete,
  onTestWebhook,
  testingWebhookId,
  testResult,
  onClearTestResult,
}: WebhooksTabProps) {
  const [visibleSecrets, setVisibleSecrets] = useState<Record<string, boolean>>({});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Active Webhook Subscriptions ({webhooks.length})
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Whenever booking events occur, Calendio delivers an authenticated HMAC-SHA256 JSON payload.
          </p>
        </div>

        <Button
          onClick={onOpenAddModal}
          className="h-9 px-4 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-sm"
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          Add Webhook
        </Button>
      </div>

      {webhooks.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 space-y-3">
          <Webhook className="w-8 h-8 text-slate-400 mx-auto" />
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
            No webhooks configured
          </h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Connect your CRM, Zapier, Make, or custom backend to receive automated meeting event callbacks.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenAddModal}
            className="rounded-xl text-xs font-semibold"
          >
            + Add First Webhook
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {webhooks.map((wh) => (
            <div
              key={wh.id}
              className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {wh.name}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                      Active
                    </span>
                  </div>
                  <span className="text-xs font-mono text-slate-500 dark:text-slate-400 break-all mt-0.5 block">
                    {wh.url}
                  </span>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onTestWebhook(wh.id)}
                    disabled={testingWebhookId === wh.id}
                    className="h-8 px-3 rounded-xl text-xs font-semibold"
                  >
                    <Send className="w-3 h-3 mr-1" />
                    {testingWebhookId === wh.id ? 'Sending...' : 'Test Payload'}
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRequestDelete(wh)}
                    className="h-8 w-8 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              {/* Secret & Events row */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] text-slate-400 font-medium">Events:</span>
                  {wh.events.map((ev: string) => (
                    <span
                      key={ev}
                      className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    >
                      {ev}
                    </span>
                  ))}
                </div>

                {/* Secret Key Mask */}
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                  <span>Secret:</span>
                  <span>
                    {visibleSecrets[wh.id] ? wh.secret : `${wh.secret.slice(0, 10)}••••••••••••`}
                  </span>
                  <button
                    onClick={() =>
                      setVisibleSecrets((prev) => ({ ...prev, [wh.id]: !prev[wh.id] }))
                    }
                    className="text-slate-400 hover:text-slate-600 ml-1"
                  >
                    {visibleSecrets[wh.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Test Feedback banner */}
              {testResult && testResult.id === wh.id && (
                <div
                  className={`p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between ${
                    testResult.success
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200'
                      : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200'
                  }`}
                >
                  <span>{testResult.msg}</span>
                  <button onClick={onClearTestResult} className="text-slate-400 hover:text-slate-600">
                    &times;
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
