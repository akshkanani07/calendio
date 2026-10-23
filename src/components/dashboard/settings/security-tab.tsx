'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { updatePasswordSettings, deleteUserAccount } from '@/app/actions/settings.actions';
import { KeyRound, ShieldAlert, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';
import { signOut } from 'next-auth/react';

interface SecurityTabProps {
  hasPassword: boolean;
  onRequestDeleteAccount: () => void;
}

export function SecurityTab({
  hasPassword,
  onRequestDeleteAccount,
}: SecurityTabProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await updatePasswordSettings({
        currentPassword: hasPassword ? currentPassword : undefined,
        newPassword,
      });

      if (res.success) {
        setSuccess('Your password has been updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setError(res.error || 'Failed to update password.');
      }
    } catch (err: any) {
      setError(err.message || 'Error updating password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Change Password Form */}
      <form onSubmit={handlePasswordChange} className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-brand-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            {hasPassword ? 'Change Password' : 'Create Account Password'}
          </h3>
        </div>

        {success && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            {success}
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs font-bold text-rose-800 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            {error}
          </div>
        )}

        {hasPassword && (
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Current Password *
            </label>
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="rounded-xl h-10 text-xs"
            />
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              New Password *
            </label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 6 characters"
              required
              className="rounded-xl h-10 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Confirm New Password *
            </label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              required
              className="rounded-xl h-10 text-xs"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            isLoading={isLoading}
            className="rounded-xl h-10 px-5 text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-sm"
          >
            Update Password
          </Button>
        </div>
      </form>

      {/* Danger Zone: Account Deletion */}
      <div className="p-5 rounded-2xl border border-rose-200/80 dark:border-rose-950/80 bg-rose-50/30 dark:bg-rose-950/10 space-y-4">
        <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
          <ShieldAlert className="w-4 h-4" />
          <h3 className="text-xs font-bold uppercase tracking-wider">
            Danger Zone
          </h3>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
              Delete Calendio Account
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Permanently delete your profile, event types, workflows, and calendar connections. This cannot be undone.
            </p>
          </div>

          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={onRequestDeleteAccount}
            className="rounded-xl h-9 px-4 text-xs font-bold shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            Delete Account
          </Button>
        </div>
      </div>
    </div>
  );
}
