import React from 'react';
import { CalendarCheck, Clock, Users, Zap, Bot, Video, Workflow } from 'lucide-react';

const features = [
  {
    icon: CalendarCheck,
    title: 'Two-Way Calendar Sync',
    description:
      'Seamlessly connect Google Calendar, Outlook, and Apple Calendar. Avoid double bookings automatically.',
    badge: 'Real-time',
  },
  {
    icon: Clock,
    title: 'Intelligent Availability',
    description:
      'Set weekly working hours, custom buffer times between calls, minimum notice periods, and vacation mode.',
    badge: 'Customizable',
  },
  {
    icon: Users,
    title: 'Team Round-Robin & Collective',
    description:
      'Distribute bookings fairly across your team with weighted round-robin or host collective panel interviews.',
    badge: 'Team Ready',
  },
  {
    icon: Workflow,
    title: 'Automated Reminders & Workflows',
    description:
      'Reduce no-shows with automated email & SMS reminders, reschedule alerts, and post-meeting follow-ups.',
    badge: 'Automation',
  },
  {
    icon: Bot,
    title: 'AI Scheduling Assistant',
    description:
      'Smart time slot recommendations, natural language booking commands, and AI-powered meeting summaries.',
    badge: 'AI Powered',
  },
  {
    icon: Video,
    title: 'Integrated Video Conferencing',
    description:
      'Instant meeting room links generated for Google Meet, Zoom, and Microsoft Teams upon booking.',
    badge: '1-Click',
  },
];

export function FeaturesGrid() {
  return (
    <section id="features" className="py-24 bg-slate-50 dark:bg-slate-900/60 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold text-brand-500 uppercase tracking-widest bg-brand-50 dark:bg-brand-950/60 px-3.5 py-1.5 rounded-full border border-brand-200 dark:border-brand-800">
            Enterprise Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-4 tracking-tight">
            Everything you need to schedule like a pro
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 mt-3">
            No paywalls. No feature gating. Every enterprise feature is 100% free for everyone.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-brand-500/50 transition-all duration-300 group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="h-12 w-12 rounded-xl bg-brand-50 dark:bg-brand-950/50 text-brand-500 flex items-center justify-center group-hover:scale-110 group-hover:bg-brand-500 group-hover:text-white transition-all duration-200">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-md">
                      {feature.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-brand-500 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center text-xs font-semibold text-brand-500 group-hover:translate-x-1 transition-transform">
                  Learn more →
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
