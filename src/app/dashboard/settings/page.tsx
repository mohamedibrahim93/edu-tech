'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth, getRoleName, getRoleColor } from '@/contexts/AuthContext';
import { db } from '@/lib/db';
import { 
  User, 
  Lock, 
  Bell, 
  Shield,
  Check,
  AlertCircle
} from 'lucide-react';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);
    
    try {
      if (user) {
        await db.users.update(user.id, {
          name: profileData.name,
          email: profileData.email,
        });
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to update profile.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      setIsSaving(false);
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
      setIsSaving(false);
      return;
    }
    
    try {
      if (user) {
        const currentUser = await db.users.get(user.id);
        if (currentUser?.password !== passwordData.currentPassword) {
          setMessage({ type: 'error', text: 'Current password is incorrect.' });
          setIsSaving(false);
          return;
        }
        
        await db.users.update(user.id, {
          password: passwordData.newPassword,
        });
        setMessage({ type: 'success', text: 'Password changed successfully!' });
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to change password.' });
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'security', name: 'Security', icon: Lock },
    { id: 'notifications', name: 'Notifications', icon: Bell },
  ];

  return (
    <DashboardLayout title="Settings" subtitle="Manage your account settings">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <Card className="lg:col-span-1 h-fit">
          <div className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                  activeTab === tab.id
                    ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.name}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* Content */}
        <div className="lg:col-span-3 space-y-6">
          {message && (
            <div className={`p-4 rounded-xl flex items-center gap-3 ${
              message.type === 'success' 
                ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' 
                : 'bg-red-50 dark:bg-red-900/20 text-red-600'
            }`}>
              {message.type === 'success' ? (
                <Check className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          {activeTab === 'profile' && (
            <Card>
              <CardHeader title="Profile Information" subtitle="Update your personal information" />
              
              {/* User Info Display */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 mb-6">
                <div className={`w-16 h-16 rounded-full ${getRoleColor(user?.role || 'parent')} flex items-center justify-center text-white text-2xl font-bold`}>
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{user?.name}</h3>
                  <p className="text-sm text-slate-500">{getRoleName(user?.role || 'parent')}</p>
                </div>
              </div>
              
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <Input
                  label="Full Name"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  required
                />
                <Input
                  label="Email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  required
                />
                <div className="flex justify-end">
                  <Button type="submit" isLoading={isSaving}>
                    Save Changes
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card>
              <CardHeader title="Change Password" subtitle="Update your password to keep your account secure" />
              
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <Input
                  label="Current Password"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  required
                />
                <Input
                  label="New Password"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  required
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  required
                />
                <div className="flex justify-end">
                  <Button type="submit" isLoading={isSaving}>
                    Change Password
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <CardHeader title="Notification Preferences" subtitle="Manage how you receive notifications" />
              
              <div className="space-y-4">
                {[
                  { id: 'email_announcements', label: 'Email Announcements', description: 'Receive announcements via email' },
                  { id: 'email_alerts', label: 'Urgent Alerts', description: 'Receive urgent alerts via email' },
                  { id: 'attendance_reminders', label: 'Attendance Reminders', description: 'Get reminded about attendance' },
                  { id: 'absence_updates', label: 'Absence Request Updates', description: 'Get notified when absence requests are reviewed' },
                ].map((setting) => (
                  <label
                    key={setting.id}
                    className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 cursor-pointer transition-colors"
                  >
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{setting.label}</p>
                      <p className="text-sm text-slate-500">{setting.description}</p>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </label>
                ))}
              </div>
              
              <div className="flex justify-end mt-6">
                <Button onClick={() => setMessage({ type: 'success', text: 'Preferences saved!' })}>
                  Save Preferences
                </Button>
              </div>
            </Card>
          )}

          {/* Danger Zone */}
          <Card className="border-red-200 dark:border-red-800">
            <CardHeader title="Danger Zone" subtitle="Irreversible actions" />
            <div className="flex items-center justify-between p-4 rounded-xl bg-red-50 dark:bg-red-900/20">
              <div>
                <p className="font-medium text-red-700 dark:text-red-400">Sign Out</p>
                <p className="text-sm text-red-600/70 dark:text-red-400/70">Sign out from your account</p>
              </div>
              <Button variant="danger" onClick={logout}>
                Sign Out
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

