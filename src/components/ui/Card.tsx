'use client';

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className = '', hover = false, onClick }: CardProps) {
  return (
    <div
      className={`
        bg-white rounded-2xl border border-slate-200/60 shadow-sm shadow-slate-200/50
        ${hover ? 'hover:shadow-lg hover:shadow-slate-200/80 hover:-translate-y-1 hover:border-purple-200/50 transition-all duration-300 cursor-pointer' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export function CardHeader({ title, subtitle, action, icon }: CardHeaderProps) {
  return (
    <div className="flex items-start justify-between p-4 sm:p-6 border-b border-slate-100">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 text-purple-600">
            {icon}
          </div>
        )}
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900">{title}</h3>
          {subtitle && (
            <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function CardContent({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`p-4 sm:p-6 ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`px-4 sm:px-6 py-4 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl ${className}`}>
      {children}
    </div>
  );
}
