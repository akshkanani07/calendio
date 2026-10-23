'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  GitFork,
  Plus,
  Trash2,
  Save,
  Check,
  HelpCircle,
  ExternalLink,
  Users,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { updateRoutingForm } from '@/app/actions/routing.actions';
import { useRouter } from 'next/navigation';

interface RoutingFormBuilderProps {
  initialForm: any;
  availableEventTypes: any[];
  submissions: any[];
}

export function RoutingFormBuilder({
  initialForm,
  availableEventTypes,
  submissions,
}: RoutingFormBuilderProps) {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'questions' | 'rules' | 'submissions'>('questions');
  const [title, setTitle] = useState(initialForm.title || '');
  const [description, setDescription] = useState(initialForm.description || '');
  const [fields, setFields] = useState<any[]>(initialForm.fields || []);
  const [routes, setRoutes] = useState<any[]>(initialForm.routes || []);
  const [fallback, setFallback] = useState<any>(
    initialForm.fallbackDestination || { type: 'EVENT_TYPE', value: availableEventTypes[0]?.slug || '' }
  );

  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Field Actions
  const handleAddField = () => {
    const newFieldId = 'field_' + Date.now();
    setFields([
      ...fields,
      {
        id: newFieldId,
        label: 'New Question',
        type: 'select',
        required: true,
        options: ['Option 1', 'Option 2'],
      },
    ]);
  };

  const handleUpdateField = (index: number, updated: any) => {
    const next = [...fields];
    next[index] = updated;
    setFields(next);
  };

  const handleRemoveField = (index: number) => {
    const next = [...fields];
    next.splice(index, 1);
    setFields(next);
  };

  // Rule Actions
  const handleAddRule = () => {
    const firstSelectField = fields.find((f) => f.type === 'select' || f.type === 'radio');
    setRoutes([
      ...routes,
      {
        id: 'rule_' + Date.now(),
        fieldId: firstSelectField ? firstSelectField.id : fields[0]?.id || '',
        operator: 'EQUALS',
        value: firstSelectField?.options?.[0] || '',
        destinationType: 'EVENT_TYPE',
        destinationValue: availableEventTypes[0]?.slug || '',
      },
    ]);
  };

  const handleUpdateRule = (index: number, updated: any) => {
    const next = [...routes];
    next[index] = updated;
    setRoutes(next);
  };

  const handleRemoveRule = (index: number) => {
    const next = [...routes];
    next.splice(index, 1);
    setRoutes(next);
  };

  // Save All Changes
  const handleSave = async () => {
    setIsSaving(true);
    setSavedSuccess(false);

    try {
      const res = await updateRoutingForm({
        formId: initialForm.id,
        title,
        description,
        fields,
        routes,
        fallbackDestination: fallback,
      });

      if (res.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      {/* Top Breadcrumb & Save Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Link
            href="/routing"
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <GitFork className="h-6 w-6 text-purple-600" />
              {title}
            </h1>
            <a
              href={`/forms/${initialForm.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-purple-600 hover:underline inline-flex items-center gap-1 font-mono mt-0.5"
            >
              <span>/forms/{initialForm.slug}</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs h-10 px-5 shadow-md shadow-purple-600/20"
          >
            {savedSuccess ? (
              <>
                <Check className="h-4 w-4 mr-1.5 text-emerald-300" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-1.5" />
                <span>{isSaving ? 'Saving...' : 'Save Logic'}</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 dark:border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('questions')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'questions'
              ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          1. Questions ({fields.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('rules')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'rules'
              ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          2. Routing Logic ({routes.length} rules)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('submissions')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'submissions'
              ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          3. Submissions & Leads ({submissions.length})
        </button>
      </div>

      {/* TAB 1: FORM QUESTIONS */}
      {activeTab === 'questions' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Form Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Form Title
                </label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-xl" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Description / Subtitle
                </label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Welcome message or instructions..."
                  className="rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Fields List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                Form Questions
              </h3>
              <Button
                type="button"
                onClick={handleAddField}
                variant="outline"
                size="sm"
                className="rounded-xl text-xs font-semibold text-purple-600 border-purple-200 dark:border-purple-900 hover:bg-purple-50"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add Question
              </Button>
            </div>

            {fields.map((field, idx) => (
              <div
                key={field.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 space-y-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                        Question Label
                      </label>
                      <Input
                        value={field.label}
                        onChange={(e) =>
                          handleUpdateField(idx, { ...field, label: e.target.value })
                        }
                        className="rounded-xl font-semibold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                        Type
                      </label>
                      <select
                        value={field.type}
                        onChange={(e) =>
                          handleUpdateField(idx, {
                            ...field,
                            type: e.target.value,
                            options:
                              e.target.value === 'select' || e.target.value === 'radio'
                                ? field.options || ['Option 1', 'Option 2']
                                : undefined,
                          })
                        }
                        className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-xs font-semibold text-slate-800 dark:text-slate-200"
                      >
                        <option value="select">Dropdown Menu</option>
                        <option value="radio">Radio Buttons</option>
                        <option value="text">Short Text</option>
                        <option value="email">Work Email</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveField(idx)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Options Manager for select / radio */}
                {(field.type === 'select' || field.type === 'radio') && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                    <label className="text-xs font-semibold text-slate-500">
                      Answer Choices (one per line)
                    </label>
                    <Textarea
                      rows={3}
                      value={(field.options || []).join('\n')}
                      onChange={(e) =>
                        handleUpdateField(idx, {
                          ...field,
                          options: e.target.value.split('\n').filter((s) => s.trim().length > 0),
                        })
                      }
                      className="rounded-xl text-xs font-mono"
                      placeholder="e.g. 1-10\n11-50\n50+"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: ROUTING LOGIC RULES */}
      {activeTab === 'rules' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200/60 dark:border-purple-900/40 flex items-start gap-3 text-xs text-purple-900 dark:text-purple-200">
            <Sparkles className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
            <span>
              Rules are evaluated sequentially from top to bottom. The first rule that matches will
              determine where the respondent is sent. If no rules match, the fallback route is used.
            </span>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                Conditional Routing Rules
              </h3>
              <Button
                type="button"
                onClick={handleAddRule}
                variant="outline"
                size="sm"
                className="rounded-xl text-xs font-semibold text-purple-600 border-purple-200 dark:border-purple-900 hover:bg-purple-50"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add Routing Rule
              </Button>
            </div>

            {routes.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 text-center text-slate-400">
                <GitFork className="h-8 w-8 mx-auto mb-2 opacity-40 text-purple-600" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  No routing rules configured
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Add rules to send qualified leads to different event types based on their answers.
                </p>
              </div>
            ) : (
              routes.map((rule, rIdx) => {
                const targetField = fields.find((f) => f.id === rule.fieldId) || fields[0];

                return (
                  <div
                    key={rule.id}
                    className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-purple-600">
                        Rule #{rIdx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveRule(rIdx)}
                        className="text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                      {/* IF Question */}
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-400">
                          If Answer to
                        </label>
                        <select
                          value={rule.fieldId}
                          onChange={(e) => handleUpdateRule(rIdx, { ...rule, fieldId: e.target.value })}
                          className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 font-semibold text-slate-800 dark:text-slate-200"
                        >
                          {fields.map((f) => (
                            <option key={f.id} value={f.id}>
                              {f.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Operator */}
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-400">
                          Condition
                        </label>
                        <select
                          value={rule.operator}
                          onChange={(e) =>
                            handleUpdateRule(rIdx, { ...rule, operator: e.target.value })
                          }
                          className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 font-semibold text-slate-800 dark:text-slate-200"
                        >
                          <option value="EQUALS">Equals</option>
                          <option value="CONTAINS">Contains</option>
                        </select>
                      </div>

                      {/* Value */}
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-400">
                          Value
                        </label>
                        {targetField?.options ? (
                          <select
                            value={rule.value}
                            onChange={(e) =>
                              handleUpdateRule(rIdx, { ...rule, value: e.target.value })
                            }
                            className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 font-semibold text-slate-800 dark:text-slate-200"
                          >
                            {targetField.options.map((opt: string) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <Input
                            value={rule.value}
                            onChange={(e) =>
                              handleUpdateRule(rIdx, { ...rule, value: e.target.value })
                            }
                            className="h-10 rounded-xl"
                          />
                        )}
                      </div>

                      {/* THEN Route To */}
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-400">
                          Route To Event
                        </label>
                        <select
                          value={rule.destinationValue}
                          onChange={(e) =>
                            handleUpdateRule(rIdx, {
                              ...rule,
                              destinationType: 'EVENT_TYPE',
                              destinationValue: e.target.value,
                            })
                          }
                          className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 font-semibold text-purple-700 dark:text-purple-300"
                        >
                          {availableEventTypes.map((ev) => (
                            <option key={ev.slug} value={ev.slug}>
                              {ev.title} ({ev.duration}m)
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {/* Fallback Route Box */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-3">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                Fallback Route (If No Rules Match)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">
                    Fallback Action
                  </label>
                  <select
                    value={fallback.type}
                    onChange={(e) =>
                      setFallback({
                        ...fallback,
                        type: e.target.value,
                        value:
                          e.target.value === 'EVENT_TYPE'
                            ? availableEventTypes[0]?.slug || ''
                            : 'Thank you for your submission!',
                      })
                    }
                    className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 font-semibold text-slate-800 dark:text-slate-200"
                  >
                    <option value="EVENT_TYPE">Send to Default Event Type</option>
                    <option value="CUSTOM_MESSAGE">Show Custom Message (Unqualified)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">
                    Destination Value
                  </label>
                  {fallback.type === 'EVENT_TYPE' ? (
                    <select
                      value={fallback.value}
                      onChange={(e) => setFallback({ ...fallback, value: e.target.value })}
                      className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 font-semibold text-purple-700 dark:text-purple-300"
                    >
                      {availableEventTypes.map((ev) => (
                        <option key={ev.slug} value={ev.slug}>
                          {ev.title} ({ev.duration}m)
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Input
                      value={fallback.value}
                      onChange={(e) => setFallback({ ...fallback, value: e.target.value })}
                      className="h-10 rounded-xl"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SUBMISSIONS & LEADS */}
      {activeTab === 'submissions' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-4">
              Lead Responses ({submissions.length})
            </h3>

            {submissions.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">
                No submissions recorded yet for this form.
              </p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {submissions.map((sub: any) => (
                  <div key={sub.id} className="py-4 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {sub.respondentEmail || 'Anonymous Lead'}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(sub.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                      <div className="text-[11px] font-bold text-purple-600 dark:text-purple-400">
                        Routed to: {sub.routedTo}
                      </div>
                      <div className="pt-1 space-y-0.5 text-slate-600 dark:text-slate-300">
                        {Object.entries(sub.answers).map(([k, v]: any) => (
                          <div key={k}>
                            <span className="font-medium text-slate-400">{k}:</span> {String(v)}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
