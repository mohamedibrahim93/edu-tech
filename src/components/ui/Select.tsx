'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  icon?: React.ReactNode;
  hint?: string;
}

export function Select({ label, error, options, icon, hint, className = '', ...props }: SelectProps) {
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
        <select
          className={`
            w-full appearance-none rounded-xl border border-slate-200 bg-white
            px-4 py-2.5 text-sm text-slate-900
            focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20
            disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed
            transition-all duration-200 cursor-pointer
            ${icon ? (isRTL ? 'pr-10' : 'pl-10') : ''}
            ${isRTL ? 'pl-10 text-right' : 'pr-10'}
            ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : ''}
            ${className}
          `}
          dir={isRTL ? 'rtl' : 'ltr'}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className={`absolute inset-y-0 ${isRTL ? 'left-0 pl-3' : 'right-0 pr-3'} flex items-center pointer-events-none`}>
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </div>
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
