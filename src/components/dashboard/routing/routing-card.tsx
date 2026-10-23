'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  GitFork,
  MoreVertical,
  ExternalLink,
  Copy,
  Check,
  Pencil,
  Trash2,
  Users,
  Eye,
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { toggleRoutingFormStatus, deleteRoutingForm } from '@/app/actions/routing.actions';
import { useRouter } from 'next/navigation';

interface RoutingCardProps {
  form: any;
}

export function RoutingCard({ form }: RoutingCardProps) {
  const router = useRouter();
  const [isActive, setIsActive] = useState(form.isActive);
  const [copied, setCopied] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const formUrl = `/forms/${form.slug}`;

  const handleCopyLink = () => {
    const fullUrl = `${window.location.origin}${formUrl}`;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggle = async (checked: boolean) => {
    setIsActive(checked);
    await toggleRoutingFormStatus(form.id, checked);
  };

  const handleDeleteConfirm = async () => {
    await deleteRoutingForm(form.id);
    setIsDeleteDialogOpen(false);
    router.refresh();
  };

  return (
    <>
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4">
        <div>
          {/* Header Switch & Kebab Menu */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Switch checked={isActive} onCheckedChange={handleToggle} />
              <span className="text-[11px] font-semibold text-slate-400">
                {isActive ? 'Active' : 'Paused'}
              </span>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44 rounded-xl">
                <DropdownMenuItem asChild>
                  <Link
                    href={`/routing/${form.slug}`}
                    className="cursor-pointer text-xs font-semibold flex items-center gap-2"
                  >
                    <Pencil className="h-3.5 w-3.5 text-slate-500" />
                    <span>Edit Form & Logic</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <a
                    href={formUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cursor-pointer text-xs font-semibold flex items-center gap-2"
                  >
                    <Eye className="h-3.5 w-3.5 text-slate-500" />
                    <span>View Live Form</span>
                  </a>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="cursor-pointer text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Form Title & Slug */}
          <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white leading-tight">
            {form.title}
          </h3>

          <span className="text-xs font-mono text-purple-600 dark:text-purple-400 block mt-1">
            /forms/{form.slug}
          </span>

          {form.description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
              {form.description}
            </p>
          )}

          {/* Rules & Submissions Counts */}
          <div className="flex flex-wrap items-center gap-4 pt-3 text-xs text-slate-500">
            <span className="flex items-center gap-1 font-semibold">
              <GitFork className="h-3.5 w-3.5 text-purple-600" />
              {form.routes?.length || 0} routing rules
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 font-semibold">
              <Users className="h-3.5 w-3.5 text-slate-400" />
              {form.submissionCount || 0} submissions
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <Link
            href={`/routing/${form.slug}`}
            className="font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
          >
            <span>Edit Logic Builder</span>
          </Link>

          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-purple-500 text-slate-600 dark:text-slate-300 font-semibold transition-all hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy Link</span>
              </>
            )}
          </button>
        </div>
      </div>

      <ConfirmModal
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Routing Form"
        description={`Are you sure you want to delete "${form.title}"? Any active website embeds or links will stop working.`}
        confirmText="Delete Form"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
