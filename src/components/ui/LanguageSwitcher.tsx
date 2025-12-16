'use client';

import React from 'react';
import { useLanguage, Language } from '@/contexts/LanguageContext';
import { Globe } from 'lucide-react';

interface LanguageSwitcherProps {
  variant?: 'icon' | 'full' | 'compact';
}

export function LanguageSwitcher({ variant = 'compact' }: LanguageSwitcherProps) {
  const { language, setLanguage, t } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={toggleLanguage}
        className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
        title={t('common.language')}
      >
        <Globe className="w-5 h-5 text-slate-600" />
      </button>
    );
  }

  if (variant === 'full') {
    return (
      <div className="flex gap-2">
        <button
          onClick={() => setLanguage('ar')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            language === 'ar'
              ? 'bg-purple-100 text-purple-700'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          العربية
        </button>
        <button
          onClick={() => setLanguage('en')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            language === 'en'
              ? 'bg-purple-100 text-purple-700'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          English
        </button>
      </div>
    );
  }

  // Compact variant
  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors"
    >
      <Globe className="w-4 h-4 text-slate-500" />
      <span className="text-sm font-medium text-slate-700">
        {language === 'ar' ? 'EN' : 'ع'}
      </span>
    </button>
  );
}
