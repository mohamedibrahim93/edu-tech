'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: 'up' | 'down';
  trendValue?: string;
  color?: 'purple' | 'blue' | 'emerald' | 'pink' | 'amber';
  delay?: number;
}

export function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendValue,
  color = 'purple',
  delay = 0 
}: StatsCardProps) {
  const colorClasses = {
    purple: {
      gradient: 'from-purple-600 to-pink-600',
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      glow: 'shadow-purple-500/20',
    },
    blue: {
      gradient: 'from-blue-600 to-cyan-600',
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      glow: 'shadow-blue-500/20',
    },
    emerald: {
      gradient: 'from-emerald-600 to-teal-600',
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      glow: 'shadow-emerald-500/20',
    },
    pink: {
      gradient: 'from-pink-600 to-rose-600',
      bg: 'bg-pink-50',
      text: 'text-pink-600',
      glow: 'shadow-pink-500/20',
    },
    amber: {
      gradient: 'from-amber-600 to-orange-600',
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      glow: 'shadow-amber-500/20',
    },
  };

  const colors = colorClasses[color];

  return (
    <div
      className="group relative overflow-hidden rounded-2xl bg-white border border-slate-200/50 p-6 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 animate-slide-up opacity-0 [animation-fill-mode:forwards]"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
      
      {/* Glow effect */}
      <div className={`absolute -inset-1 bg-gradient-to-r ${colors.gradient} rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300`} />
      
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${colors.gradient} shadow-lg ${colors.glow} group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          {trend && trendValue && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${colors.bg} ${colors.text} text-xs font-semibold`}>
              {trend === 'up' ? '↗' : '↘'}
              {trendValue}
            </div>
          )}
        </div>
        
        <div>
          <p className="text-3xl font-bold text-slate-900 mb-1 tracking-tight">
            {value}
          </p>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>
        </div>
      </div>
    </div>
  );
}

