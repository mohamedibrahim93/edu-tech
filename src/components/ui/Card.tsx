'use client';

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className = '', hover = false }: CardProps) {
  return (
    <div
      className={`
        bg-white rounded-2xl border border-slate-200 p-6 shadow-sm
        dark:bg-slate-800 dark:border-slate-700
        ${hover ? 'hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function CardHeader({ title, subtitle, action }: CardHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
        {subtitle && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

