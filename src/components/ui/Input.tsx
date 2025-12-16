'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  hint?: string;
}

export function Input({ label, error, icon, hint, className = '', ...props }: InputProps) {
  const { isRTL } = useLanguage();
  
  return (
    <div className="w-full">
      {label && (
        <label className={`block text-sm font-semibold text-slate-700 mb-2 ${isRTL ? 'text-right' : ''}`}>
          {label}
          {props.required && <span className={`text-red-500 ${isRTL ? 'mr-1' : 'ml-1'}`}>*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className={`absolute inset-y-0 ${isRTL ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none text-slate-400`}>
            {icon}
          </div>
        )}
        <input
          className={`
            w-full rounded-xl border border-slate-200 bg-white
            px-4 py-2.5 text-sm text-slate-900
            placeholder:text-slate-400
            focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20
            disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed
            transition-all duration-200
            ${icon ? (isRTL ? 'pr-10' : 'pl-10') : ''}
            ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : ''}
            ${isRTL ? 'text-right' : ''}
            ${className}
          `}
          dir={isRTL ? 'rtl' : 'ltr'}
          {...props}
        />
      </div>
      {hint && !error && (
        <p className={`mt-1.5 text-xs text-slate-500 ${isRTL ? 'text-right' : ''}`}>{hint}</p>
      )}
      {error && (
        <p className={`mt-1.5 text-sm text-red-600 ${isRTL ? 'text-right' : ''}`}>{error}</p>
      )}
    </div>
  );
}
