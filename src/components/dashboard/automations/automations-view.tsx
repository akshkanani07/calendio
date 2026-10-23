'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { WorkflowCard } from './workflow-card';
import { WorkflowTemplatesGallery } from './workflow-templates-gallery';
import { CreateWorkflowModal } from './create-workflow-modal';
import { SendTestModal } from './send-test-modal';
import { WorkflowTemplate, CALENDLY_WORKFLOW_TEMPLATES } from '@/lib/workflow-templates';
import {
  createAutomation,
  updateAutomation,
  toggleAutomationStatus,
  duplicateAutomation,
  deleteAutomation,
  sendTestWorkflowEmail,
} from '@/app/actions/automation.actions';
import {
  Sparkles,
  Plus,
  Search,
  Zap,
  CheckCircle2,
  Clock,
  Layers,
  Send,
  SlidersHorizontal,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AutomationsViewProps {
  initialAutomations: any[];
  eventTypes: any[];
  currentUserEmail: string;
}

export function AutomationsView({
  initialAutomations,
  eventTypes,
  currentUserEmail,
}: AutomationsViewProps) {
  const router = useRouter();
  const [automations, setAutomations] = useState<any[]>(initialAutomations || []);
  const [activeTab, setActiveTab] = useState<'my_workflows' | 'templates'>('my_workflows');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<any | null>(null);

  const [testModalWorkflow, setTestModalWorkflow] = useState<any | null>(null);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Stats
  const activeCount = automations.filter((a) => a.isActive).length;
  const pausedCount = automations.filter((a) => !a.isActive).length;
  const totalCount = automations.length;

  // Filtered list
  const filteredWorkflows = automations.filter((a) => {
    const matchesSearch =
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.workflows?.[0]?.config?.subject || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'active'
        ? a.isActive
        : !a.isActive;

    return matchesSearch && matchesStatus;
  });

  // Handlers
  const handleToggleStatus = async (id: string, isActive: boolean) => {
    setAutomations((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isActive } : a))
    );
    await toggleAutomationStatus(id, isActive);
  };

  const handleDuplicate = async (id: string) => {
    await duplicateAutomation(id);
    router.refresh();
  };

  const handleOpenEdit = (automation: any) => {
    const workflowStep = automation.workflows?.[0] || {};
    const config = workflowStep.config || {};

    setEditingWorkflow({
      id: automation.id,
      name: automation.name,
      trigger: automation.trigger,
      offsetMinutes: automation.offsetMinutes,
      subject: config.subject || automation.name,
      template: workflowStep.template || '',
      action: workflowStep.action,
      recipient: config.recipient || 'INVITEE',
      additionalEmail: config.additionalEmail || '',
      eventTypeIds: config.eventTypeIds || [],
    });
    setIsCreateModalOpen(true);
  };

  const handleSelectTemplate = (template: WorkflowTemplate) => {
    setEditingWorkflow({
      name: template.name,
      trigger: template.trigger,
      offsetMinutes: template.offsetMinutes,
      subject: template.subject,
      template: template.template,
      action: template.action,
      recipient: template.recipient,
      additionalEmail: '',
      eventTypeIds: [],
    });
    setIsCreateModalOpen(true);
  };

  const handleSaveWorkflow = async (formData: any) => {
    if (formData.id) {
      await updateAutomation(formData.id, formData);
    } else {
      await createAutomation(formData);
    }
    router.refresh();
  };

  const handleDeleteRequest = (automation: any) => {
    setDeleteTarget(automation);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    await deleteAutomation(deleteTarget.id);
    setAutomations((prev) => prev.filter((a) => a.id !== deleteTarget.id));
    setDeleteTarget(null);
    router.refresh();
  };

  const handleSendTest = async (subject: string, template: string, email: string) => {
    return await sendTestWorkflowEmail({
      subject,
      template,
      testEmail: email,
    });
  };

  const handleOpenTestModal = (automation: any) => {
    setTestModalWorkflow(automation);
    setIsTestModalOpen(true);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Workflows & Automations
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400 border border-brand-200/60 dark:border-brand-900/60 shadow-xs">
              <Zap className="w-3.5 h-3.5" />
              Automations Engine
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
            Automate personalized email reminders, thank-yous, and re-engagements to reduce meeting no-shows and deliver a seamless guest experience.
          </p>
        </div>

        <Button
          onClick={() => {
            setEditingWorkflow(null);
            setIsCreateModalOpen(true);
          }}
          className="h-11 px-5 rounded-2xl text-xs font-bold bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-600 hover:to-indigo-700 text-white shadow-md shadow-brand-500/25 self-start sm:self-auto flex items-center gap-2 group transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3] group-hover:rotate-90 transition-transform duration-200" />
          <span>Create workflow</span>
        </Button>
      </div>

      {/* 4 Balanced KPI Metric Cards (No awkward gap!) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Workflows */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4 hover:border-brand-500/30 transition-all">
          <div className="h-12 w-12 rounded-2xl bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0 shadow-inner">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
              Total Workflows
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {totalCount}
              </span>
              <span className="text-xs text-slate-400">configured</span>
            </div>
          </div>
        </div>

        {/* Card 2: Active Workflows */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4 hover:border-emerald-500/30 transition-all">
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-inner">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
              Active Workflows
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {activeCount}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Time Saved */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4 hover:border-amber-500/30 transition-all">
          <div className="h-12 w-12 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-inner">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
              Avg. Time Saved
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                ~4.5 hrs
              </span>
              <span className="text-xs text-slate-400">/ week</span>
            </div>
          </div>
        </div>

        {/* Card 4: Delivery Engine Health */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4 hover:border-indigo-500/30 transition-all">
          <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 shadow-inner">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
              Mailjet Engine
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                100%
              </span>
              <span className="text-xs text-slate-400">Operational</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs & Filters Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        {/* Segmented Tab Pill Selector */}
        <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 w-fit">
          <button
            type="button"
            onClick={() => setActiveTab('my_workflows')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'my_workflows'
                ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>My workflows</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                activeTab === 'my_workflows'
                  ? 'bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
              }`}
            >
              {totalCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('templates')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'templates'
                ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>Workflow templates</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                activeTab === 'templates'
                  ? 'bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
              }`}
            >
              {CALENDLY_WORKFLOW_TEMPLATES.length}
            </span>
          </button>
        </div>

        {/* Right Search & Filter (shown when on My Workflows) */}
        {activeTab === 'my_workflows' && totalCount > 0 && (
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Status Filter Chips */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === 'all'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                All ({totalCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('active')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === 'active'
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                Active ({activeCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('paused')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === 'paused'
                    ? 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                Paused ({pausedCount})
              </button>
            </div>

            {/* Search Input with Clear Button */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search workflows..."
                className="pl-9 pr-8 h-10 text-xs rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-3 p-0.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Tab Content */}
      {activeTab === 'my_workflows' ? (
        totalCount === 0 ? (
          /* Empty State */
          <div className="py-20 px-6 text-center rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 flex flex-col items-center max-w-xl mx-auto shadow-sm">
            <div className="h-16 w-16 rounded-3xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-4 shadow-inner">
              <Sparkles className="h-8 w-8" />
            </div>

            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Save time with automated workflows
            </h3>

            <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-md">
              Never manually compose a reminder or follow-up email again. Set up automated email triggers
              before meetings start, after they finish, or when invitees cancel.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button
                onClick={() => setActiveTab('templates')}
                variant="outline"
                className="rounded-2xl h-11 px-5 text-xs font-bold border-slate-200 dark:border-slate-700"
              >
                Browse 6 templates
              </Button>

              <Button
                onClick={() => {
                  setEditingWorkflow(null);
                  setIsCreateModalOpen(true);
                }}
                className="rounded-2xl h-11 px-6 text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/25"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Create custom workflow
              </Button>
            </div>
          </div>
        ) : (
          /* Workflows List */
          <div className="space-y-4">
            {filteredWorkflows.length === 0 ? (
              <div className="p-12 text-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <SlidersHorizontal className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  No matching workflows found
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Try adjusting your search query or status filter.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                  }}
                  className="mt-4 rounded-xl text-xs font-semibold"
                >
                  Clear filters
                </Button>
              </div>
            ) : (
              filteredWorkflows.map((auto) => (
                <WorkflowCard
                  key={auto.id}
                  automation={auto}
                  onToggleStatus={handleToggleStatus}
                  onEdit={handleOpenEdit}
                  onDuplicate={handleDuplicate}
                  onDeleteRequest={handleDeleteRequest}
                  onSendTestRequest={handleOpenTestModal}
                />
              ))
            )}
          </div>
        )
      ) : (
        /* Templates Gallery Tab */
        <WorkflowTemplatesGallery onSelectTemplate={handleSelectTemplate} />
      )}

      {/* Create / Edit Modal */}
      <CreateWorkflowModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        initialData={editingWorkflow}
        eventTypes={eventTypes}
        onSave={handleSaveWorkflow}
        onSendTest={handleSendTest}
      />

      {/* Send Test Email Modal */}
      {testModalWorkflow && (
        <SendTestModal
          open={isTestModalOpen}
          onOpenChange={setIsTestModalOpen}
          automation={testModalWorkflow}
          defaultEmail={currentUserEmail}
          onSend={handleSendTest}
        />
      )}

      {/* Delete Confirmation Modal (NO native browser alerts!) */}
      <ConfirmModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        title="Delete this workflow?"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? Scheduled email reminders and follow-ups associated with this workflow will immediately stop.`}
        confirmText="Delete Workflow"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}