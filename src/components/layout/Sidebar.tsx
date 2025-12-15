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
} from 'lucide-react';
import { useAuth, getRoleName, getRoleColor } from '@/contexts/AuthContext';
import type { UserRole } from '@/lib/types';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: Home, roles: ['moe', 'school_admin', 'teacher', 'parent'] },
  { name: 'Schools', href: '/dashboard/schools', icon: Building2, roles: ['moe'] },
  { name: 'Classes', href: '/dashboard/classes', icon: BookOpen, roles: ['school_admin', 'teacher'] },
  { name: 'Students', href: '/dashboard/students', icon: GraduationCap, roles: ['school_admin', 'teacher'] },
  { name: 'Teachers', href: '/dashboard/teachers', icon: UserCheck, roles: ['moe', 'school_admin'] },
  { name: 'Parents', href: '/dashboard/parents', icon: Users, roles: ['school_admin'] },
  { name: 'Attendance', href: '/dashboard/attendance', icon: ClipboardList, roles: ['school_admin', 'teacher'] },
  { name: 'Schedules', href: '/dashboard/schedules', icon: Calendar, roles: ['school_admin', 'teacher'] },
  { name: 'Absence Requests', href: '/dashboard/absence-requests', icon: FileText, roles: ['school_admin', 'parent'] },
  { name: 'Announcements', href: '/dashboard/announcements', icon: Bell, roles: ['moe', 'school_admin', 'teacher', 'parent'] },
  { name: 'Reports', href: '/dashboard/reports', icon: BarChart3, roles: ['moe', 'school_admin', 'teacher'] },
  { name: 'Issues', href: '/dashboard/issues', icon: AlertCircle, roles: ['school_admin', 'teacher', 'parent'] },
  { name: 'My Children', href: '/dashboard/my-children', icon: GraduationCap, roles: ['parent'] },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  if (!user) return null;

  const filteredNavItems = navItems.filter((item) => item.roles.includes(user.role));

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-900 text-white flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <School className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg">EduTech</h1>
            <p className="text-xs text-slate-400">Management System</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-1">
          {filteredNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                    ${isActive 
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25' 
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'}
                  `}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 rounded-full ${getRoleColor(user.role)} flex items-center justify-center text-white font-semibold`}>
            {user.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user.name}</p>
            <p className="text-xs text-slate-400 truncate">{getRoleName(user.role)}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href="/dashboard/settings"
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Settings className="w-4 h-4" />
            Settings
          </Link>
          <button
            onClick={logout}
            className="flex items-center justify-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

