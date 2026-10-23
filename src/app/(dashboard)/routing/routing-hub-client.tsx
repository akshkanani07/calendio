'use client';

import React, { useState } from 'react';
import { GitFork, Plus, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CreateRoutingDialog } from '@/components/dashboard/routing/create-routing-dialog';
import { RoutingCard } from '@/components/dashboard/routing/routing-card';

export function RoutingHubClient({
  initialForms,
  username,
}: {
  initialForms: any[];
  username: string;
}) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <GitFork className="h-7 w-7 text-purple-600" />
            Routing Forms
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Qualify incoming leads with screening questions and automatically route them to the right event type.
          </p>
        </div>

        <Button
          onClick={() => setIsCreateOpen(true)}
          className="rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/20 h-10 px-4"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Create Routing Form
        </Button>
      </div>

      {/* Forms Grid */}
      {initialForms.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-12 text-center max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-900 text-purple-600 flex items-center justify-center mx-auto mb-4">
            <GitFork className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            No routing forms created yet
          </h3>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            Create an intake form to screen leads by company size, industry, or budget, and route them to your dedicated meeting links.
          </p>
          <div className="mt-6">
            <Button
              onClick={() => setIsCreateOpen(true)}
              className="rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Create First Form
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {initialForms.map((form) => (
            <RoutingCard key={form.id} form={form} />
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <CreateRoutingDialog isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </div>
  );
}
