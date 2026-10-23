'use client';

import React, { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Clock,
  Mail,
  MoreVertical,
  Pencil,
  Copy,
  Trash2,
  Send,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { TriggerType } from '@prisma/client';

interface WorkflowCardProps {
  automation: any;
  onToggleStatus: (id: string, isActive: boolean) => Promise<void>;
  onEdit: (automation: any) => void;
  onDuplicate: (id: string) => Promise<void>;
  onDeleteRequest: (automation: any) => void;
  onSendTestRequest: (automation: any) => void;
}

export function WorkflowCard({
  automation,
  onToggleStatus,
  onEdit,
  onDuplicate,
  onDeleteRequest,
  onSendTestRequest,
}: WorkflowCardProps) {
  const [isActive, setIsActive] = useState(automation.isActive);
  const [isToggling, setIsToggling] = useState(false);

  const workflowStep = automation.workflows?.[0] || {};
  const config = (workflowStep.config || {}) as {
    subject?: string;
    recipient?: string;
    eventTypeIds?: string[];
  };

  const handleToggle = async (checked: boolean) => {
    setIsActive(checked);
    setIsToggling(true);
    try {
      await onToggleStatus(automation.id, checked);
    } catch {
      setIsActive(!checked); // rollback
    } finally {
      setIsToggling(false);
    }
  };

  // Human readable trigger timing
  const formatTiming = () => {
    const trigger = automation.trigger as TriggerType;
    const offset = Math.abs(automation.offsetMinutes || 0);

    if (trigger === TriggerType.BOOKING_CREATED) return 'Immediately when booked';
    if (trigger === TriggerType.BOOKING_CANCELLED) return 'Immediately when canceled';
    if (trigger === TriggerType.BOOKING_RESCHEDULED) return 'Immediately when rescheduled';

    let timeStr = `${offset} min`;
    if (offset >= 1440 && offset % 1440 === 0) {
      const days = offset / 1440;
      timeStr = `${days} day${days > 1 ? 's' : ''}`;
    } else if (offset >= 60 && offset % 60 === 0) {
      const hours = offset / 60;
      timeStr = `${hours} hour${hours > 1 ? 's' : ''}`;
    }

    if (trigger === TriggerType.BEFORE_MEETING) {
      return `${timeStr} before event`;
    }
    if (trigger === TriggerType.AFTER_MEETING) {
      return `${timeStr} after event`;
    }
    return 'Custom trigger';
  };

  const recipientLabel = () => {
    const r = config.recipient || 'INVITEE';
    if (r === 'HOST') return 'To Host';
    if (r === 'BOTH') return 'To Invitee & Host';
    if (r === 'ADDITIONAL') return 'To Custom Email';
    return 'To Invitee';
  };

  const appliedEventsLabel = () => {
    if (!config.eventTypeIds || config.eventTypeIds.length === 0) {
      return 'All event types';
    }
    return `${config.eventTypeIds.length} event type${config.eventTypeIds.length > 1 ? 's' : ''}`;
  };

  return (
    <div
      className={`group relative rounded-2xl border transition-all duration-200 overflow-hidden bg-white dark:bg-slate-900 ${
        isActive
          ? 'border-slate-200/90 dark:border-slate-800 shadow-sm hover:border-brand-500/40 hover:shadow-md hover:shadow-brand-500/5'
          : 'border-slate-200/50 dark:border-slate-800/60 opacity-80'
      }`}
    >
      {/* Left Colored Accent Stripe */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1.5 transition-all ${
          isActive ? 'bg-brand-500 group-hover:w-2' : 'bg-slate-300 dark:bg-slate-700'
        }`}
      />

      <div className="p-5 pl-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        {/* Left Side: Status Toggle + Information */}
        <div className="flex items-start gap-4 flex-1 min-w-0">
          {/* Status Switch & Indicator */}
          <div className="pt-0.5 flex flex-col items-center shrink-0">
            <Switch
              checked={isActive}
              onCheckedChange={handleToggle}
              disabled={isToggling}
              aria-label="Toggle workflow status"
            />
            <span
              className={`text-[10px] font-bold mt-1.5 flex items-center gap-1 ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              {isActive && (
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              )}
              {isActive ? 'Active' : 'Paused'}
            </span>
          </div>

          {/* Workflow Title & Details */}
          <div className="space-y-2 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3
                onClick={() => onEdit(automation)}
                className="text-base font-bold text-slate-900 dark:text-white leading-tight hover:text-brand-600 dark:hover:text-brand-400 cursor-pointer transition-colors truncate"
              >
                {automation.name}
              </h3>
            </div>

            {/* Badges & Meta Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              {/* Timing Pill */}
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-100 dark:border-brand-900/40">
                <Clock className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                <span>{formatTiming()}</span>
              </span>

              {/* Recipient Pill */}
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                <Mail className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
                <span>{recipientLabel()}</span>
              </span>

              {/* Applied Event Types Pill */}
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                <Calendar className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
                <span>{appliedEventsLabel()}</span>
              </span>
            </div>

            {/* Subject Snippet */}
            {config.subject && (
              <p className="text-xs text-slate-400 dark:text-slate-500 font-mono truncate pt-0.5">
                <span className="font-semibold text-slate-500 dark:text-slate-400 font-sans">
                  Subject:
                </span>{' '}
                {config.subject}
              </p>
            )}
          </div>
        </div>

        {/* Right Side: Quick Action Buttons */}
        <div className="flex items-center gap-2 self-end lg:self-center shrink-0 pt-2 lg:pt-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSendTestRequest(automation)}
            className="h-9 px-3.5 rounded-xl text-xs font-semibold border-slate-200 dark:border-slate-700 hover:border-brand-500 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-950/50 dark:hover:text-brand-400 transition-all"
          >
            <Send className="w-3.5 h-3.5 mr-1.5 text-slate-400 group-hover:text-brand-500" />
            <span>Send test</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(automation)}
            className="h-9 px-3.5 rounded-xl text-xs font-semibold border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            <Pencil className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
            <span>Edit</span>
          </Button>

          {/* More Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-48 rounded-2xl p-1.5 shadow-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
            >
              <DropdownMenuItem
                onClick={() => onEdit(automation)}
                className="text-xs font-semibold py-2 cursor-pointer rounded-xl flex items-center gap-2"
              >
                <Pencil className="w-3.5 h-3.5 text-slate-500" />
                <span>Edit workflow</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => onSendTestRequest(automation)}
                className="text-xs font-semibold py-2 cursor-pointer rounded-xl flex items-center gap-2"
              >
                <Send className="w-3.5 h-3.5 text-slate-500" />
                <span>Send test email</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => onDuplicate(automation.id)}
                className="text-xs font-semibold py-2 cursor-pointer rounded-xl flex items-center gap-2"
              >
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Duplicate</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-1" />

              <DropdownMenuItem
                onClick={() => onDeleteRequest(automation)}
                className="text-xs font-semibold py-2 cursor-pointer text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl flex items-center gap-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete workflow</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}