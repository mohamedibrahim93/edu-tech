'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { db, seedDatabase } from '@/lib/db';
import type { User, UserRole } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // All hooks must be called before any conditional returns
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    const foundUser = await db.users.where('email').equals(email).first();
    if (foundUser && foundUser.password === password && foundUser.isActive) {
      setUser(foundUser);
      localStorage.setItem('edutech_user_id', foundUser.id);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('edutech_user_id');
    window.location.href = '/';
  }, []);

  useEffect(() => {
    setMounted(true);
    const initAuth = async () => {
      await seedDatabase();
      const storedUserId = localStorage.getItem('edutech_user_id');
      if (storedUserId) {
        const user = await db.users.get(storedUserId);
        if (user) {
          setUser(user);
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  // Now safe to do conditional rendering after all hooks
  if (!mounted) {
    return <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-purple-600" />;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function getRoleName(role: UserRole): string {
  const roleNames: Record<UserRole, string> = {
    moe: 'Ministry of Education',
    school_admin: 'School Administrator',
    teacher: 'Teacher',
    parent: 'Parent',
  };
  return roleNames[role];
}

export function getRoleColor(role: UserRole): string {
  const roleColors: Record<UserRole, string> = {
    moe: 'bg-gradient-to-br from-purple-600 to-pink-600',
    school_admin: 'bg-gradient-to-br from-blue-600 to-cyan-600',
    teacher: 'bg-gradient-to-br from-emerald-600 to-teal-600',
    parent: 'bg-gradient-to-br from-pink-600 to-rose-600',
  };
  return roleColors[role];
}
