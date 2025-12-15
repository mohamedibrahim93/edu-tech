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

  useEffect(() => {
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
  }, []);

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
    moe: 'bg-purple-500',
    school_admin: 'bg-blue-500',
    teacher: 'bg-emerald-500',
    parent: 'bg-amber-500',
  };
  return roleColors[role];
}

