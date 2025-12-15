'use client';

import React from 'react';
import { Bell, Search, Menu } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200 dark:bg-slate-900/80 dark:border-slate-800">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h1>
          {subtitle && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-64 pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
            />
          </div>

          {/* Notifications */}
          <button className="relative p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <Bell className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User Avatar */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden md:block">
              <p className="text-sm font-medium text-slate-900 dark:text-white">{user?.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold">
              {user?.name?.charAt(0) || 'U'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

