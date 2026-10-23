'use client';

import React from 'react';
import Link from 'next/link';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  showBadge?: boolean;
  badgeText?: string;
  subtitle?: string;
  href?: string;
  className?: string;
}

export function LogoIcon({
  size = 'md',
  className = '',
}: {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}) {
  const sizeMap = {
    sm: 'h-7 w-7',
    md: 'h-9 w-9',
    lg: 'h-11 w-11',
    xl: 'h-14 w-14',
  };

  return (
    <div
      className={`relative shrink-0 flex items-center justify-center transition-transform duration-200 group-hover:scale-105 ${sizeMap[size]} ${className}`}
    >
      <svg
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-sm"
      >
        <defs>
          <linearGradient id="calendio-grad-luxury" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0069FF" />
            <stop offset="50%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#4F46E5" />
          </linearGradient>
          <linearGradient id="calendio-glare" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
          <filter id="calendio-shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#0069FF" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* Outer Squircle Container with Layered Gradient & Bevel Glare */}
        <rect
          x="1"
          y="1"
          width="38"
          height="38"
          rx="11"
          fill="url(#calendio-grad-luxury)"
          filter="url(#calendio-shadow)"
        />
        <rect
          x="1"
          y="1"
          width="38"
          height="38"
          rx="11"
          stroke="rgba(255, 255, 255, 0.28)"
          strokeWidth="1.2"
        />
        <rect
          x="1"
          y="1"
          width="38"
          height="38"
          rx="11"
          fill="url(#calendio-glare)"
        />

        {/* Calendar Inner Sheet */}
        <rect
          x="9"
          y="11"
          width="22"
          height="20"
          rx="3.5"
          fill="#FFFFFF"
          fillOpacity="0.98"
        />

        {/* Calendar Header Accent Bar */}
        <path
          d="M 9 14.5 C 9 12.567 10.567 11 12.5 11 L 27.5 11 C 29.433 11 31 12.567 31 14.5 L 31 17 L 9 17 Z"
          fill="#0069FF"
        />

        {/* Binder Peg Left */}
        <rect x="13.2" y="8.5" width="2.4" height="4.5" rx="1.2" fill="#FFFFFF" />
        <rect x="13.6" y="9" width="1.6" height="3.5" rx="0.8" fill="#1D4ED8" />

        {/* Binder Peg Right */}
        <rect x="24.4" y="8.5" width="2.4" height="4.5" rx="1.2" fill="#FFFFFF" />
        <rect x="24.8" y="9" width="1.6" height="3.5" rx="0.8" fill="#1D4ED8" />

        {/* Date Matrix Dots */}
        <circle cx="14" cy="21" r="1.3" fill="#0069FF" />
        <circle cx="20" cy="21" r="1.3" fill="#94A3B8" />
        <circle cx="26" cy="21" r="1.3" fill="#94A3B8" />

        <circle cx="14" cy="26" r="1.3" fill="#94A3B8" />
        <circle cx="20" cy="26" r="1.6" fill="#10B981" />
        <circle cx="26" cy="26" r="1.3" fill="#94A3B8" />
      </svg>
    </div>
  );
}

export function Logo({
  size = 'md',
  showText = true,
  showBadge = true,
  badgeText = 'Free',
  subtitle,
  href = '/',
  className = '',
}: LogoProps) {
  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  const badgeSizes = {
    sm: 'text-[8px] px-1.5 py-0.2',
    md: 'text-[9px] px-1.5 py-0.2',
    lg: 'text-[10px] px-2 py-0.5',
    xl: 'text-xs px-2.5 py-0.5',
  };

  const content = (
    <div className={`inline-flex items-center gap-2.5 group select-none ${className}`}>
      <LogoIcon size={size} />

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-black tracking-tight text-slate-900 dark:text-white leading-tight ${textSizes[size]}`}
            >
              Calend<span className="text-brand-600 dark:text-brand-400">io</span>
            </span>

            {showBadge && (
              <span
                className={`rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-extrabold uppercase tracking-wider border border-emerald-200/60 dark:border-emerald-900/60 shadow-2xs ${badgeSizes[size]}`}
              >
                {badgeText}
              </span>
            )}
          </div>

          {subtitle && (
            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 leading-none mt-0.5">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex outline-none">
        {content}
      </Link>
    );
  }

  return content;
}