'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { School, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const success = await login(email, password);
      if (success) {
        router.push('/dashboard');
      } else {
        setError('Invalid email or password');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const demoAccounts = [
    { role: 'MoE Admin', email: 'moe@edutech.gov', password: 'password123' },
    { role: 'School Admin', email: 'admin@school1.edu', password: 'password123' },
    { role: 'Teacher', email: 'teacher1@school1.edu', password: 'password123' },
    { role: 'Parent', email: 'parent@example.com', password: 'password123' },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=&quot;60&quot; height=&quot;60&quot; viewBox=&quot;0 0 60 60&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;%3E%3Cg fill=&quot;none&quot; fill-rule=&quot;evenodd&quot;%3E%3Cg fill=&quot;%23ffffff&quot; fill-opacity=&quot;0.05&quot;%3E%3Cpath d=&quot;M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z&quot;/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div>
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-xl flex items-center justify-center">
              <School className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">EduTech</h1>
              <p className="text-white/80">Management System</p>
            </div>
          </div>
          <h2 className="text-3xl font-bold mb-4">
            Empowering Education Through Technology
          </h2>
          <p className="text-lg text-white/80 mb-8">
            A comprehensive platform for managing schools, students, teachers, and parents. 
            Streamline attendance tracking, communication, and reporting.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {[
              'Attendance Tracking',
              'Real-time Reports',
              'Parent Communication',
              'School Management',
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-white/80"></div>
                {feature}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <School className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-900 dark:text-white">EduTech</span>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 border border-slate-200 dark:border-slate-700">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome Back</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-2">Sign in to your account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail className="w-5 h-5" />}
                required
              />

              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  icon={<Lock className="w-5 h-5" />}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-9 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              <Button type="submit" className="w-full" size="lg" isLoading={isSubmitting}>
                Sign In
              </Button>
            </form>

            {/* Demo Accounts */}
            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-4">
                Demo Accounts (click to fill)
              </p>
              <div className="grid grid-cols-2 gap-2">
                {demoAccounts.map((account) => (
                  <button
                    key={account.email}
                    onClick={() => {
                      setEmail(account.email);
                      setPassword(account.password);
                    }}
                    className="p-2 text-xs text-left rounded-lg border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                  >
                    <span className="font-medium text-slate-900 dark:text-white">{account.role}</span>
                    <br />
                    <span className="text-slate-500 dark:text-slate-400">{account.email}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

