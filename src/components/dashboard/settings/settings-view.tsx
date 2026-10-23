'use client';

import React, { useState } from 'react';
import { ProfileTab } from './profile-tab';
import { BrandingTab } from './branding-tab';
import { SecurityTab } from './security-tab';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { deleteUserAccount } from '@/app/actions/settings.actions';
import { Settings, User, Palette, ShieldCheck } from 'lucide-react';
import { signOut } from 'next-auth/react';

interface SettingsViewProps {
  initialData: any;
}

export function SettingsView({ initialData }: SettingsViewProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'branding' | 'security'>('profile');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleDeleteAccountConfirm = async () => {
    await deleteUserAccount();
    signOut({ callbackUrl: '/login' });
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Account & Profile Settings
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400 border border-brand-200/60 dark:border-brand-900/60">
              <Settings className="w-3 h-3" />
              Configuration
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage your personal profile, custom booking link, brand color scheme, and account security.
          </p>
        </div>
      </div>

      {/* Tabs (Mobile Scrollable) */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex items-center gap-6 overflow-x-auto max-w-full">
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 text-sm font-bold transition-all relative flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
            activeTab === 'profile'
              ? 'text-brand-600 dark:text-brand-400'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <User className="w-4 h-4" />
          Profile & Booking Link
          {activeTab === 'profile' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600 dark:bg-brand-400 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('branding')}
          className={`pb-3 text-sm font-bold transition-all relative flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
            activeTab === 'branding'
              ? 'text-brand-600 dark:text-brand-400'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Palette className="w-4 h-4" />
          Branding & Appearance
          {activeTab === 'branding' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600 dark:bg-brand-400 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`pb-3 text-sm font-bold transition-all relative flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
            activeTab === 'security'
              ? 'text-brand-600 dark:text-brand-400'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Security & Password
          {activeTab === 'security' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600 dark:bg-brand-400 rounded-full" />
          )}
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'profile' && <ProfileTab initialData={initialData} />}

      {activeTab === 'branding' && (
        <BrandingTab
          initialBrandColor={initialData.brandColor}
          initialCustomDomain={initialData.customDomain}
          userName={initialData.name}
          userUsername={initialData.username}
        />
      )}

      {activeTab === 'security' && (
        <SecurityTab
          hasPassword={initialData.hasPassword ?? true}
          onRequestDeleteAccount={() => setIsDeleteModalOpen(true)}
        />
      )}

      {/* Delete Account Confirm Modal */}
      <ConfirmModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        title="Permanently Delete Account?"
        description="Are you sure you want to permanently delete your Calendio account? All your event types, scheduled meetings, workflows, contacts, and custom domain settings will be deleted forever. This cannot be undone."
        confirmText="Delete My Account"
        cancelText="Keep My Account"
        variant="destructive"
        onConfirm={handleDeleteAccountConfirm}
      />
    </div>
  );
}