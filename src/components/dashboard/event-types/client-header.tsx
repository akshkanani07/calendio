'use client';

import React, { useState } from 'react';
import { Link2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CreateEventDialog } from './create-event-dialog';

export function EventTypesClientHeader({ totalCount }: { totalCount: number }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Link2 className="h-7 w-7 text-brand-500" />
            Event Types
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Create, customize, and share your meeting booking links. ({totalCount} active)
          </p>
        </div>

        <Button
          onClick={() => setIsOpen(true)}
          className="h-11 px-5 w-full sm:w-auto bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-semibold rounded-2xl shadow-md shadow-brand-500/20 text-xs flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all"
        >
          <Plus className="h-4 w-4 stroke-[3]" />
          <span>New Event Type</span>
        </Button>
      </div>

      <CreateEventDialog open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}
