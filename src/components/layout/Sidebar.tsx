'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  School,
  Users,
  BookOpen,
  Calendar,
  FileText,
  Bell,
  Settings,
  LogOut,
  GraduationCap,
  UserCheck,
  ClipboardList,
  AlertCircle,
  BarChart3,
  Building2,
  X,
} from 'lucide-react';
import { useAuth, getRoleName } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import type { UserRole } from '@/lib/types';

interface NavItem {
  nameKey: string;
  href: string;
  icon: React.ElementType;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  { nameKey: 'nav.dashboard', href: '/dashboard', icon: Home, roles: ['moe', 'school_admin', 'teacher', 'parent'] },
  { nameKey: 'nav.schools', href: '/dashboard/schools', icon: Building2, roles: ['moe'] },
  { nameKey: 'nav.classes', href: '/dashboard/classes', icon: BookOpen, roles: ['school_admin', 'teacher'] },
  { nameKey: 'nav.students', href: '/dashboard/students', icon: GraduationCap, roles: ['school_admin', 'teacher'] },
  { nameKey: 'nav.teachers', href: '/dashboard/teachers', icon: UserCheck, roles: ['moe', 'school_admin'] },
  { nameKey: 'nav.parents', href: '/dashboard/parents', icon: Users, roles: ['school_admin'] },
  { nameKey: 'nav.attendance', href: '/dashboard/attendance', icon: ClipboardList, roles: ['school_admin', 'teacher'] },
  { nameKey: 'nav.schedules', href: '/dashboard/schedules', icon: Calendar, roles: ['school_admin', 'teacher'] },
  { nameKey: 'nav.absenceRequests', href: '/dashboard/absence-requests', icon: FileText, roles: ['school_admin', 'parent'] },
  { nameKey: 'nav.announcements', href: '/dashboard/announcements', icon: Bell, roles: ['moe', 'school_admin', 'teacher', 'parent'] },
  { nameKey: 'nav.reports', href: '/dashboard/reports', icon: BarChart3, roles: ['moe', 'school_admin', 'teacher'] },
  { nameKey: 'nav.issues', href: '/dashboard/issues', icon: AlertCircle, roles: ['school_admin', 'teacher', 'parent'] },
  { nameKey: 'nav.myChildren', href: '/dashboard/my-children', icon: GraduationCap, roles: ['parent'] },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { t, isRTL } = useLanguage();

  if (!user) return null;

  const filteredNavItems = navItems.filter((item) => item.roles.includes(user.role));

  const roleColors: Record<UserRole, string> = {
    moe: 'bg-purple-600',
    school_admin: 'bg-blue-600',
    teacher: 'bg-emerald-600',
    parent: 'bg-pink-600',
  };

  const getRoleNameTranslated = (role: UserRole): string => {
    const roleKeys: Record<UserRole, string> = {
      moe: 'role.moe',
      school_admin: 'role.school_admin',
      teacher: 'role.teacher',
      parent: 'role.parent',
    };
    return t(roleKeys[role]);
  };

  return (
    <>
      {/* Mobile overlay */}
      <div 
        className={`fixed inset-0 bg-slate-900/50 z-40 lg:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <aside 
        className={`fixed ${isRTL ? 'right-0' : 'left-0'} top-0 h-screen w-72 bg-white border-${isRTL ? 'l' : 'r'} border-slate-200 flex flex-col z-50 
          transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:w-64
          ${isOpen ? 'translate-x-0' : isRTL ? 'translate-x-full' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3" onClick={onClose}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
              <School className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">{t('app.name')}</span>
          </Link>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors lg:hidden"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-3">
          <ul className="space-y-1">
            {filteredNavItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
              return (
                <li key={item.nameKey}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive 
                        ? 'bg-gradient-to-r from-purple-50 to-pink-50 text-purple-600 shadow-sm' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <item.icon className={`w-5 h-5 ${isActive ? 'text-purple-600' : 'text-slate-400'}`} />
                    <span>{t(item.nameKey)}</span>
                    {isActive && (
                      <div className={`${isRTL ? 'mr-auto' : 'ml-auto'} w-1.5 h-1.5 rounded-full bg-purple-600`} />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100">
            <div className={`w-10 h-10 rounded-xl ${roleColors[user.role]} flex items-center justify-center text-white font-bold shadow-lg`}>
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
              <p className="text-xs text-slate-500 truncate">{getRoleNameTranslated(user.role)}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              href="/dashboard/settings"
              onClick={onClose}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
            >
              <Settings className="w-4 h-4" />
              {t('nav.settings')}
            </Link>
            <button
              onClick={logout}
              className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
