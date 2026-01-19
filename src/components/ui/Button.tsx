'use client';

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = `
    inline-flex items-center justify-center font-semibold rounded-xl 
    transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 
    disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]
  `;

  const variants = {
    primary: `
      bg-gradient-to-r from-purple-600 to-pink-600 text-white 
      hover:opacity-90 focus:ring-purple-200 shadow-lg shadow-purple-500/25
    `,
    secondary: `
      bg-slate-100 text-slate-700 hover:bg-slate-200 
      focus:ring-slate-500
    `,
    danger: `
      bg-gradient-to-r from-red-600 to-rose-600 text-white 
      hover:opacity-90 focus:ring-red-500 shadow-lg shadow-red-500/25
    `,
    ghost: `
      text-slate-600 hover:bg-slate-100 hover:text-slate-900
      focus:ring-slate-500
    `,
    outline: `
      border-2 border-purple-600 text-purple-600 
      hover:bg-purple-50 focus:ring-purple-500
    `,
  };

  const sizes = {
    sm: 'text-sm px-3 py-1.5',
    md: 'text-sm px-4 py-2.5',
    lg: 'text-base px-6 py-3',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
      )}
      {children}
    </button>
  );
}
