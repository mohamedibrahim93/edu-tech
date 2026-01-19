'use client';

import React from 'react';
import Link from 'next/link';
import { 
  School, 
  Building2, 
  Users, 
  GraduationCap,
  QrCode,
  Bell,
  FileText,
  Calendar,
  BarChart3,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Shield,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';

export default function HomePage() {
  const { t, isRTL, language } = useLanguage();
  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  const features = isRTL ? [
    { icon: QrCode, title: 'حضور بـ QR', description: 'يقوم المعلمون بإنشاء رموز QR محددة بوقت. يقوم الطلاب بالمسح للتسجيل فوراً.', color: 'purple' },
    { icon: Building2, title: 'هيكل متعدد المستويات', description: 'وزارة → مدارس → فصول. صلاحيات مناسبة للجميع.', color: 'blue' },
    { icon: FileText, title: 'طلبات الغياب', description: 'يقدم أولياء الأمور الطلبات، والمدارس توافق أو ترفض مع إشعارات.', color: 'emerald' },
    { icon: Bell, title: 'إشعارات فورية', description: 'تنبيهات للغياب، والإعلانات، والتقييمات، وتحديثات الطلبات.', color: 'pink' },
    { icon: Calendar, title: 'جداول المواد', description: 'تتبع الحضور لكل مادة مع تعيينات المعلمين والفترات الزمنية.', color: 'amber' },
    { icon: BarChart3, title: 'تقارير شاملة', description: 'معدلات الحضور، والتقييمات، وتحليلات الأداء على جميع المستويات.', color: 'cyan' },
  ] : [
    { icon: QrCode, title: 'QR Code Attendance', description: 'Teachers generate time-limited QR codes. Students scan to check in instantly.', color: 'purple' },
    { icon: Building2, title: 'Multi-Level Hierarchy', description: 'MoE → Schools → Classes. Proper role-based access for everyone.', color: 'blue' },
    { icon: FileText, title: 'Absence Request Workflow', description: 'Parents submit requests, schools approve or reject with notifications.', color: 'emerald' },
    { icon: Bell, title: 'Instant Notifications', description: 'Alerts for absences, announcements, evaluations, and request updates.', color: 'pink' },
    { icon: Calendar, title: 'Subject Schedules', description: 'Track attendance per subject with teacher assignments and time slots.', color: 'amber' },
    { icon: BarChart3, title: 'Comprehensive Reports', description: 'Attendance rates, evaluations, and performance analytics at all levels.', color: 'cyan' },
  ];

  const parentFeatures = isRTL ? [
    'استلام تنبيهات الغياب الفورية',
    'تقديم طلبات الغياب إلكترونياً',
    'عرض التقييمات وتقارير التقدم',
    'استلام ملاحظات من المعلمين',
  ] : [
    'Receive instant absence alerts',
    'Submit absence requests online',
    'View evaluations and progress reports',
    'Get notes from teachers',
  ];

  const studentFeatures = isRTL ? [
    'تسجيل حضور سريع بـ QR',
    'عرض جداول الحصص',
    'تتبع سجل الحضور',
    'عرض التقييمات والدرجات',
  ] : [
    'Quick QR code check-in',
    'View class schedules',
    'Track attendance history',
    'See evaluations and grades',
  ];

  return (
    <div className="min-h-screen bg-white" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
                <School className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">{t('app.name')}</span>
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
              <LanguageSwitcher variant="full" />
              <Link href="/login" className="text-sm font-semibold text-slate-600 hover:text-purple-600 transition-colors">
                {t('auth.login')}
              </Link>
              <Link href="/login" className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/25">
                {isRTL ? 'ابدأ الآن' : 'Get Started'}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-28 sm:pt-32 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 text-purple-600 text-sm font-semibold mb-6 ring-1 ring-purple-100">
              <Sparkles className="w-4 h-4" />
              {isRTL ? 'نظام إدارة المدارس الشامل' : 'Comprehensive School Management System'}
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-slate-900 mb-6 leading-tight">
              {isRTL ? (
                <>
                  منصة إدارة التعليم{' '}
                  <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    الذكية
                  </span>
                </>
              ) : (
                <>
                  Smart Education{' '}
                  <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Management Platform
                  </span>
                </>
              )}
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              {isRTL 
                ? 'من وزارة التعليم إلى الفصول الدراسية. إدارة المدارس، تتبع الحضور، التواصل مع أولياء الأمور، وتسهيل الإدارة التعليمية.'
                : 'From Ministry of Education to classrooms. Manage schools, track attendance, communicate with parents, and streamline educational administration.'
              }
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/login" className="w-full sm:w-auto px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2">
                {isRTL ? 'ابدأ تجربة مجانية' : 'Start Free Trial'}
                <Arrow className="w-5 h-5" />
              </Link>
              <Link href="/login" className="w-full sm:w-auto px-8 py-4 text-lg font-semibold text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center">
                {t('auth.login')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Role Cards Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* MoE Card */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg shadow-slate-200/50 border border-slate-200/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center mb-6 shadow-lg shadow-purple-500/25">
                <Building2 className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{t('role.moe')}</h3>
              <p className="text-slate-600 mb-6">
                {isRTL 
                  ? 'الإشراف على جميع المدارس، عرض التقارير، تتبع الأداء، وإرسال الإعلانات.'
                  : 'Oversee all schools, view reports, track performance, and send announcements.'
                }
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 text-xs font-semibold text-purple-600 bg-purple-50 rounded-full ring-1 ring-purple-100">
                  {isRTL ? 'إدارة متعددة المدارس' : 'Multi-School Management'}
                </span>
                <span className="px-3 py-1 text-xs font-semibold text-pink-600 bg-pink-50 rounded-full ring-1 ring-pink-100">
                  {isRTL ? 'التحليلات' : 'Analytics'}
                </span>
              </div>
            </div>

            {/* School Admin Card */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg shadow-slate-200/50 border border-slate-200/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center mb-6 shadow-lg shadow-blue-500/25">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{t('role.school_admin')}</h3>
              <p className="text-slate-600 mb-6">
                {isRTL 
                  ? 'إدارة الفصول والمعلمين والطلاب والموافقة على تسجيلات أولياء الأمور.'
                  : 'Manage classes, teachers, students, and approve parent registrations.'
                }
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-50 rounded-full ring-1 ring-blue-100">
                  {isRTL ? 'الموافقة على الطلبات' : 'Request Approval'}
                </span>
                <span className="px-3 py-1 text-xs font-semibold text-cyan-600 bg-cyan-50 rounded-full ring-1 ring-cyan-100">
                  {t('nav.reports')}
                </span>
              </div>
            </div>

            {/* Teachers Card */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg shadow-slate-200/50 border border-slate-200/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/25">
                <Users className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{t('nav.teachers')}</h3>
              <p className="text-slate-600 mb-6">
                {isRTL 
                  ? 'تسجيل الحضور عبر رموز QR، إضافة ملاحظات الطلاب، وإدارة الجدول.'
                  : 'Take attendance via QR codes, add student notes, and manage your schedule.'
                }
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 text-xs font-semibold text-emerald-600 bg-emerald-50 rounded-full ring-1 ring-emerald-100">
                  {isRTL ? 'حضور QR' : 'QR Attendance'}
                </span>
                <span className="px-3 py-1 text-xs font-semibold text-teal-600 bg-teal-50 rounded-full ring-1 ring-teal-100">
                  {isRTL ? 'ملاحظات الطلاب' : 'Student Notes'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              {isRTL ? 'حل إدارة التعليم الشامل' : 'Complete Education Management Solution'}
            </h2>
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
              {isRTL 
                ? 'منصة موحدة لوزارة التعليم والمدارس والمعلمين وأولياء الأمور والطلاب.'
                : 'A unified platform for MoE, schools, teachers, parents, and students.'
              }
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* Stakeholders Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              {isRTL ? 'مصمم لجميع الأطراف المعنية' : 'Designed for Every Stakeholder'}
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* For Parents */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg shadow-slate-200/50 border border-slate-200/50">
              <div className={`flex items-center gap-4 mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {isRTL ? 'لأولياء الأمور' : 'For Parents'}
                </h3>
              </div>
              <ul className="space-y-4">
                {parentFeatures.map((feature, index) => (
                  <li key={index} className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span className="text-slate-600">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* For Students */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg shadow-slate-200/50 border border-slate-200/50">
              <div className={`flex items-center gap-4 mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {isRTL ? 'للطلاب' : 'For Students'}
                </h3>
              </div>
              <ul className="space-y-4">
                {studentFeatures.map((feature, index) => (
                  <li key={index} className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span className="text-slate-600">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
            {isRTL ? 'هل أنت مستعد لتحويل نظامك التعليمي؟' : 'Ready to transform your education system?'}
          </h2>
          <p className="text-base sm:text-lg text-slate-600 mb-8">
            {isRTL 
              ? 'انضم إلى المدارس التي تستخدم إيدو تك لتسهيل الإدارة وإبقاء الجميع على اتصال.'
              : 'Join schools already using EduTech to streamline administration and keep everyone connected.'
            }
          </p>
          <Link href="/login" className="inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl hover:opacity-90 transition-all">
            {isRTL ? 'ابدأ مجاناً' : 'Get Started Free'}
            <Arrow className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-slate-200">
        <div className={`max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
              <School className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900">{t('app.name')}</span>
          </div>
          <p className="text-sm text-slate-500">
            © 2025 {t('app.name')}. {isRTL ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description, color }: { icon: React.ElementType; title: string; description: string; color: string }) {
  const colors: Record<string, { gradient: string; shadow: string }> = {
    purple: { gradient: 'from-purple-600 to-pink-600', shadow: 'shadow-purple-500/25' },
    blue: { gradient: 'from-blue-600 to-cyan-600', shadow: 'shadow-blue-500/25' },
    emerald: { gradient: 'from-emerald-600 to-teal-600', shadow: 'shadow-emerald-500/25' },
    pink: { gradient: 'from-pink-600 to-rose-600', shadow: 'shadow-pink-500/25' },
    amber: { gradient: 'from-amber-500 to-orange-500', shadow: 'shadow-amber-500/25' },
    cyan: { gradient: 'from-cyan-600 to-blue-600', shadow: 'shadow-cyan-500/25' },
  };

  const c = colors[color] || colors.purple;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg shadow-slate-200/50 border border-slate-200/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${c.gradient} flex items-center justify-center mb-4 shadow-lg ${c.shadow}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600 text-sm leading-relaxed">{description}</p>
    </div>
  );
}
