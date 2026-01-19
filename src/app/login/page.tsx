'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { School, Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, Github, Linkedin } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading } = useAuth();
  const { t, isRTL } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router, mounted]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const success = await login(email, password);
      if (success) {
        router.push('/dashboard');
      } else {
        setError(t('auth.invalidCredentials'));
      }
    } catch {
      setError(t('auth.invalidCredentials'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
          <p className="text-slate-600 font-medium">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  const demoAccounts = [
    { role: t('role.moe'), email: 'moe@edutech.gov', color: 'bg-purple-600' },
    { role: t('role.school_admin'), email: 'admin@school1.edu', color: 'bg-blue-600' },
    { role: t('role.teacher'), email: 'teacher1@school1.edu', color: 'bg-emerald-600' },
    { role: t('role.parent'), email: 'parent@example.com', color: 'bg-pink-600' },
  ];

  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  return (
    <div className={`min-h-screen bg-slate-50 flex ${isRTL ? 'flex-row-reverse' : ''}`}>
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 p-12 flex-col justify-between relative overflow-hidden">
        {/* Decorative Elements */}
        <div className={`absolute top-0 ${isRTL ? 'left-0 -translate-x-1/2' : 'right-0 translate-x-1/2'} w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2`} />
        <div className={`absolute bottom-0 ${isRTL ? 'right-0 translate-x-1/2' : 'left-0 -translate-x-1/2'} w-96 h-96 bg-pink-500/20 rounded-full blur-3xl translate-y-1/2`} />
        
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <School className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">{t('app.name')}</span>
          </Link>
        </div>

        <div className="relative z-10">
          <h1 className="text-4xl xl:text-5xl font-bold text-white mb-6 leading-tight">
            {isRTL ? (
              <>منصة إدارة التعليم<br />الذكية</>
            ) : (
              <>Smart Education<br />Management Platform</>
            )}
          </h1>
          <p className="text-lg text-white/80 mb-8 max-w-md">
            {isRTL 
              ? 'من وزارة التعليم إلى الفصول الدراسية. إدارة المدارس، تتبع الحضور، والتواصل مع أولياء الأمور.'
              : 'From Ministry of Education to classrooms. Manage schools, track attendance, and communicate with parents.'
            }
          </p>
          <div className="flex flex-wrap gap-3">
            {isRTL 
              ? ['حضور بـ QR', 'صلاحيات متعددة', 'تقارير فورية'].map((feature) => (
                  <span key={feature} className="px-4 py-2 bg-white/10 backdrop-blur rounded-full text-sm font-medium text-white">
                    {feature}
                  </span>
                ))
              : ['QR Attendance', 'Multi-Level Access', 'Real-time Reports'].map((feature) => (
                  <span key={feature} className="px-4 py-2 bg-white/10 backdrop-blur rounded-full text-sm font-medium text-white">
                    {feature}
                  </span>
                ))
            }
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-3 text-white/60 text-sm">
          <span>© 2025 {t('app.name')}. {isRTL ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}</span>
          <span className="flex items-center gap-2">
            <span>Mohamed Ibrahim</span>
            <a 
              href="https://github.com/mohamedibrahim93" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white/60 hover:text-white transition-colors"
              aria-label="GitHub"
            >
              <Github className="w-4 h-4" />
            </a>
            <a 
              href="https://www.linkedin.com/in/mohamed-ibrahim9322/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white/60 hover:text-white transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-4 h-4" />
            </a>
          </span>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        {/* Language Switcher */}
        <div className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'}`}>
          <LanguageSwitcher variant="full" />
        </div>

        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-10">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
              <School className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-900">{t('app.name')}</span>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">{t('auth.welcome')}</h2>
            <p className="text-slate-600">{t('auth.signInToContinue')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                {t('auth.email')}
              </label>
              <div className="relative">
                <Mail className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400`} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isRTL ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                  className={`w-full ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3 rounded-xl border border-slate-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all`}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                {t('auth.password')}
              </label>
              <div className="relative">
                <Lock className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400`} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isRTL ? 'أدخل كلمة المرور' : 'Enter your password'}
                  className={`w-full ${isRTL ? 'pr-12 pl-12' : 'pl-12 pr-12'} py-3 rounded-xl border border-slate-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute ${isRTL ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors`}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200">
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 text-white font-semibold bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {t('auth.login')}
                  <Arrow className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Demo Accounts */}
          <div className="mt-8 pt-8 border-t border-slate-200">
            <p className="text-sm text-slate-500 text-center mb-4 font-medium">
              {isRTL ? 'تسجيل دخول سريع (حسابات تجريبية)' : 'Quick Login (Demo Accounts)'}
            </p>
            <div className="grid grid-cols-2 gap-3">
              {demoAccounts.map((account) => (
                <button
                  key={account.email}
                  onClick={() => {
                    setEmail(account.email);
                    setPassword('password123');
                  }}
                  className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 transition-all text-${isRTL ? 'right' : 'left'} group"
                >
                  <div className={`w-10 h-10 rounded-lg ${account.color} flex items-center justify-center text-white font-bold text-sm group-hover:scale-110 transition-transform`}>
                    {account.role.charAt(0)}
                  </div>
                  <div className={`${isRTL ? 'text-right' : 'text-left'}`}>
                    <p className="font-semibold text-slate-900 text-sm">{account.role}</p>
                    <p className="text-xs text-slate-500 truncate">{account.email}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
