import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getRoutingFormBySlug } from '@/app/actions/routing.actions';
import { GitFork, ShieldCheck } from 'lucide-react';
import { PublicRoutingForm } from '@/components/routing/public-routing-form';

export default async function PublicFormPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await getRoutingFormBySlug(slug);

  if (!result || !result.form.isActive) {
    return notFound();
  }

  const { form, host } = result;

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-xl mx-auto w-full">
        {/* Brand header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="text-2xl font-black text-purple-600 tracking-tight">Calendio</span>
          </Link>
        </div>

        {/* Main Form Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl p-8 sm:p-10 transition-all animate-fade-in">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-900 text-purple-600 flex items-center justify-center mb-6">
            <GitFork className="h-6 w-6" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
            {form.title}
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
            {form.description ||
              `Please answer a few quick questions so ${host.name || 'our team'} can connect you with the right specialist.`}
          </p>

          <PublicRoutingForm form={form} hostName={host.name || 'Host'} />
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 text-center text-xs text-slate-400 dark:text-slate-500">
        <p>
          Powered by{' '}
          <Link href="/" className="font-bold text-purple-600 hover:underline">
            Calendio
          </Link>{' '}
          • Smart Scheduling For Everyone
        </p>
      </footer>
    </div>
  );
}
