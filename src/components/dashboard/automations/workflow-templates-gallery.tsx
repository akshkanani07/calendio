'use client';

import React, { useState } from 'react';
import { CALENDLY_WORKFLOW_TEMPLATES, WorkflowTemplate } from '@/lib/workflow-templates';
import { Button } from '@/components/ui/button';
import { Clock, Mail, ArrowRight, Sparkles, Zap, Bell, CheckCircle2 } from 'lucide-react';

interface WorkflowTemplatesGalleryProps {
  onSelectTemplate: (template: WorkflowTemplate) => void;
}

export function WorkflowTemplatesGallery({ onSelectTemplate }: WorkflowTemplatesGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'reminders' | 'follow_ups' | 'bookings'>('all');

  const filtered = selectedCategory === 'all'
    ? CALENDLY_WORKFLOW_TEMPLATES
    : CALENDLY_WORKFLOW_TEMPLATES.filter((t) => t.category === selectedCategory);

  const categories = [
    { id: 'all', label: 'All Templates', count: CALENDLY_WORKFLOW_TEMPLATES.length },
    { id: 'reminders', label: 'Reminders', count: 3 },
    { id: 'follow_ups', label: 'Follow-ups', count: 2 },
    { id: 'bookings', label: 'Cancellations', count: 1 },
  ];

  return (
    <div className="space-y-6">
      {/* Category Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as any)}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
                isSelected
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-500/25'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                  isSelected
                    ? 'bg-brand-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}
              >
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Grid of Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((tpl) => (
          <div
            key={tpl.id}
            className="group relative flex flex-col justify-between p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 hover:border-brand-500/50 hover:shadow-xl hover:shadow-brand-500/5 transition-all duration-200"
          >
            <div>
              {/* Header Badge & Timing */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 border border-brand-100 dark:border-brand-900/40">
                  <Clock className="w-3.5 h-3.5 shrink-0" />
                  {tpl.displayTiming}
                </span>

                <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
                  {tpl.recipient === 'INVITEE'
                    ? 'To Invitee'
                    : tpl.recipient === 'HOST'
                    ? 'To Host'
                    : 'Both'}
                </span>
              </div>

              {/* Title & Description */}
              <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors leading-snug">
                {tpl.name}
              </h4>

              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">
                {tpl.description}
              </p>

              {/* Subject preview */}
              <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <p className="text-[11px] font-mono text-slate-600 dark:text-slate-400 truncate">
                  <span className="font-semibold text-slate-400 font-sans">Subject: </span>
                  {tpl.subject}
                </p>
              </div>
            </div>

            {/* Action Footer */}
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                {tpl.badgeText}
              </span>

              <Button
                size="sm"
                onClick={() => onSelectTemplate(tpl)}
                className="h-9 px-4 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-all"
              >
                <span>Use template</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}