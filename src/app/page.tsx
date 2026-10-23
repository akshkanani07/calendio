'use client';

import React from 'react';
import Link from 'next/link';
import { MarketingNavbar } from '@/components/landing/navbar';
import { InteractiveBookingPreview } from '@/components/landing/interactive-preview';
import { FeaturesGrid } from '@/components/landing/features-grid';
import { ComparisonSection } from '@/components/landing/comparison-section';
import { MarketingFooter } from '@/components/landing/footer';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2, Calendar, Clock, Share2, Sparkles, Star } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950 font-sans selection:bg-brand-500 selection:text-white">
      {/* 1. Marketing Navbar */}
      <MarketingNavbar />

      <main className="flex-1">
        {/* 2. Hero Section */}
        <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 overflow-hidden">
          {/* Subtle Ambient Background Gradients */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] pointer-events-none overflow-hidden opacity-40 dark:opacity-20 -z-10">
            <div className="absolute -top-32 left-1/4 w-[500px] h-[500px] rounded-full bg-brand-400 blur-3xl" />
            <div className="absolute top-12 right-1/4 w-[400px] h-[400px] rounded-full bg-blue-300 blur-3xl" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 px-4 py-1.5 text-xs font-semibold text-brand-700 dark:text-brand-300 mb-6">
              <Sparkles className="h-3.5 w-3.5 text-brand-500" />
              Smart Scheduling For Everyone • 100% Free Forever
            </div>

            {/* Hero Main Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-[1.1]">
              Easy scheduling ahead.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-blue-500">
                Zero subscription costs.
              </span>
            </h1>

            {/* Sub-headline */}
            <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Calendio is your hassle-free hub for scheduling meetings professionally. Connect your calendar, set your availability, and share your personal link.
            </p>

            {/* Email CTA Action Box */}
            <div className="mt-10 max-w-md mx-auto flex flex-col sm:flex-row items-center gap-3">
              <Link href="/register" className="w-full">
                <Button className="w-full h-12 text-base font-semibold bg-brand-500 hover:bg-brand-600 text-white rounded-xl shadow-lg shadow-brand-500/25 transition-all duration-200 hover:scale-[1.02]">
                  Create Your Free Account <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> No credit card required
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> 2-minute setup
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Unlimited booking links
              </span>
            </div>

            {/* 3. Live Interactive Scheduling Mockup Card */}
            <div className="mt-16 sm:mt-20">
              <InteractiveBookingPreview />
            </div>
          </div>
        </section>

        {/* 4. How It Works (3 Steps) */}
        <section id="how-it-works" className="py-24 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-bold text-brand-500 uppercase tracking-widest bg-brand-50 dark:bg-brand-950/60 px-3.5 py-1.5 rounded-full border border-brand-200 dark:border-brand-800">
                Simple 3-Step Flow
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-4 tracking-tight">
                How Calendio Works
              </h2>
              <p className="text-base text-slate-600 dark:text-slate-400 mt-2">
                Say goodbye to endless email back-and-forth in three simple steps.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {/* Step 1 */}
              <div className="relative p-8 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-center flex flex-col items-center">
                <div className="h-14 w-14 rounded-2xl bg-brand-500 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-brand-500/20 mb-6">
                  <Clock className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  1. Set Your Availability
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Define your weekly hours, buffer times between meetings, and block specific dates or vacations effortlessly.
                </p>
              </div>

              {/* Step 2 */}
              <div className="relative p-8 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-center flex flex-col items-center">
                <div className="h-14 w-14 rounded-2xl bg-brand-500 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-brand-500/20 mb-6">
                  <Share2 className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  2. Share Your Link
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Send your personalized link or embed the booking widget directly on your website or in your email signature.
                </p>
              </div>

              {/* Step 3 */}
              <div className="relative p-8 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-center flex flex-col items-center">
                <div className="h-14 w-14 rounded-2xl bg-brand-500 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-brand-500/20 mb-6">
                  <Calendar className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  3. Get Booked Automatically
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Guests select a time that fits. Calendar events, Google Meet links, and automated reminders are sent instantly.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Features Grid */}
        <FeaturesGrid />

        {/* 6. Why Calendio is 100% Free vs Paid Tools */}
        <ComparisonSection />

        {/* 7. Testimonials */}
        <section id="testimonials" className="py-24 bg-slate-50 dark:bg-slate-900/40 border-t border-slate-200/80 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="flex items-center justify-center gap-1 text-amber-400 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-amber-400" />
                ))}
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Loved by busy professionals
              </h2>
              <p className="text-base text-slate-600 dark:text-slate-400 mt-2">
                Here is why individuals and teams choose Calendio.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                  "Calendio gave our entire remote team unlimited round-robin event scheduling without the $16/user fee. The UI is identical to Calendly's clean aesthetic!"
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-brand-500 text-white font-bold text-sm flex items-center justify-center">
                    AK
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">Aarav Kumar</h4>
                    <p className="text-xs text-slate-400">Head of Product, SaaSify</p>
                  </div>
                </div>
              </div>

              <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                  "As a freelance consultant, I needed multiple event types (15min quick chat, 60min deep dive). Other tools limited me to one event unless I paid. Calendio solved it completely."
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-emerald-600 text-white font-bold text-sm flex items-center justify-center">
                    SP
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">Your Name</h4>
                    <p className="text-xs text-slate-400">Independent Designer & Consultant</p>
                  </div>
                </div>
              </div>

              <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                  "The automatic Google Meet link creation and automated reminder workflows reduced our client no-shows by 40%. Truly modern and lightning fast."
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-purple-600 text-white font-bold text-sm flex items-center justify-center">
                    RN
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">Rohan Nair</h4>
                    <p className="text-xs text-slate-400">Founder, ScaleDigital</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 8. Call To Action (CTA) Banner */}
        <section className="py-20 bg-gradient-to-br from-brand-600 to-blue-700 text-white text-center px-4">
          <div className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              Ready to automate your scheduling?
            </h2>
            <p className="text-lg text-blue-100 max-w-xl mx-auto">
              Join thousands of creators and teams who schedule smarter with Calendio. 100% free forever, no strings attached.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button className="h-12 px-8 text-base font-bold bg-white text-brand-600 hover:bg-blue-50 rounded-xl shadow-xl transition-all duration-200 hover:scale-105">
                  Get Started For Free <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* 9. Marketing Footer */}
      <MarketingFooter />
    </div>
  );
}
