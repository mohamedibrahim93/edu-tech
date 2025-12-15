'use client';

import React from 'react';
import { Bell, Search, Menu } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onMenuClick: () => void;
}

export function Header({ title, subtitle, onMenuClick }: HeaderProps) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center gap-4">
          {/* Mobile menu button */}
          <button 
            onClick={onMenuClick}
            className="p-2 rounded-xl hover:bg-slate-100 transition-colors lg:hidden"
          >
            <Menu className="w-5 h-5 text-slate-600" />
          </button>
          
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{title}</h1>
            {subtitle && (
              <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-48 lg:w-64 pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 focus:bg-white transition-all"
            />
          </div>

          {/* Mobile search button */}
          <button className="p-2 rounded-xl hover:bg-slate-100 transition-colors md:hidden">
            <Search className="w-5 h-5 text-slate-600" />
          </button>

          {/* Notifications */}
          <button className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors">
            <Bell className="w-5 h-5 text-slate-600" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full ring-2 ring-white" />
          </button>

          {/* User Avatar */}
          <div className="flex items-center gap-3 pl-2 sm:pl-4 border-l border-slate-200">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
              <p className="text-xs text-slate-500">{user?.email}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold shadow-lg shadow-purple-500/25">
              {user?.name?.charAt(0) || 'U'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
