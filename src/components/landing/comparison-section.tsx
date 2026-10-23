import React from 'react';
import { Check, X, Sparkles } from 'lucide-react';

export function ComparisonSection() {
  const comparisonItems = [
    { feature: 'Event Types (1-on-1, 15m, 30m, 60m)', others: 'Only 1 Event', calendio: 'Unlimited Events' },
    { feature: 'Team Scheduling & Round-Robin', others: false, calendio: true },
    { feature: 'Automated Email & SMS Reminders', others: false, calendio: true },
    { feature: 'Custom Branding & Remove Watermark', others: false, calendio: true },
    { feature: 'Group Events & Capacity Management', others: false, calendio: true },
    { feature: 'Routing Forms & Lead Qualification', others: false, calendio: true },
    { feature: 'AI Meeting Summaries & Action Items', others: false, calendio: true },
    { feature: 'Multiple Calendar Connections', others: 'Only 1 Calendar', calendio: 'Unlimited Calendars' },
    { feature: 'Monthly Subscription Cost', others: '$16 / user / mo', calendio: '$0 Free Forever' },
  ];

  return (
    <section id="comparison" className="py-24 bg-white dark:bg-slate-950 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3.5 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800 mb-4">
            <Sparkles className="h-3.5 w-3.5" /> 100% Free Forever Promise
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            No Paywalls. No Limits. Just Pure Scheduling.
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 mt-3">
            Why pay $16+ per user every month when you can get full enterprise scheduling without paying a single rupee or dollar?
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900">
          <div className="grid grid-cols-12 bg-slate-50 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 p-4 sm:p-6 text-sm font-bold text-slate-900 dark:text-white">
            <div className="col-span-6 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs">
              Capabilities
            </div>
            <div className="col-span-3 text-center text-slate-400 dark:text-slate-500 text-xs sm:text-sm">
              Other Tools (Free Tier)
            </div>
            <div className="col-span-3 text-center text-brand-500 font-extrabold text-xs sm:text-base flex items-center justify-center gap-1.5">
              Calendio
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
            {comparisonItems.map((item, idx) => (
              <div
                key={idx}
                className="grid grid-cols-12 items-center p-4 sm:p-6 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
              >
                <div className="col-span-6 font-semibold text-slate-800 dark:text-slate-200 text-xs sm:text-sm">
                  {item.feature}
                </div>

                <div className="col-span-3 flex justify-center text-center text-xs text-slate-400 font-medium">
                  {typeof item.others === 'boolean' ? (
                    item.others ? (
                      <Check className="h-5 w-5 text-emerald-500" />
                    ) : (
                      <span className="inline-flex items-center gap-1 text-rose-500 font-medium">
                        <X className="h-4 w-4" /> Paid
                      </span>
                    )
                  ) : (
                    <span className="text-slate-400">{item.others}</span>
                  )}
                </div>

                <div className="col-span-3 flex justify-center text-center text-xs sm:text-sm font-bold text-brand-600 dark:text-brand-400">
                  {typeof item.calendio === 'boolean' ? (
                    <div className="h-6 w-6 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <Check className="h-4 w-4 stroke-[3]" />
                    </div>
                  ) : (
                    <span className="bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-300 px-3 py-1 rounded-full border border-brand-200 dark:border-brand-800 font-bold">
                      {item.calendio}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
