'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth, getRoleColor } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { db } from '@/lib/db';
import { 
  User, 
  Lock, 
  Bell, 
  Shield,
  Check,
  AlertCircle,
  Globe
} from 'lucide-react';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { t, isRTL } = useLanguage();
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

  const getRoleNameTranslated = (role: string): string => {
    const roleKeys: Record<string, string> = {
      moe: 'role.moe',
      school_admin: 'role.school_admin',
      teacher: 'role.teacher',
      parent: 'role.parent',
    };
    return t(roleKeys[role] || 'role.parent');
  };

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
        setMessage({ type: 'success', text: t('settings.profileUpdated') });
      }
    } catch {
      setMessage({ type: 'error', text: isRTL ? 'فشل تحديث الملف الشخصي.' : 'Failed to update profile.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: t('settings.passwordMismatch') });
      setIsSaving(false);
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: t('settings.passwordTooShort') });
      setIsSaving(false);
      return;
    }
    
    try {
      if (user) {
        const currentUser = await db.users.get(user.id);
        if (currentUser?.password !== passwordData.currentPassword) {
          setMessage({ type: 'error', text: t('settings.wrongPassword') });
          setIsSaving(false);
          return;
        }
        
        await db.users.update(user.id, {
          password: passwordData.newPassword,
        });
        setMessage({ type: 'success', text: t('settings.passwordChanged') });
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch {
      setMessage({ type: 'error', text: isRTL ? 'فشل تغيير كلمة المرور.' : 'Failed to change password.' });
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'profile', name: t('settings.profile'), icon: User },
    { id: 'security', name: t('settings.security'), icon: Lock },
    { id: 'notifications', name: t('settings.notifications'), icon: Bell },
  ];

  const notificationSettings = [
    { id: 'email_announcements', label: t('settings.emailAnnouncements'), description: isRTL ? 'استلام الإعلانات عبر البريد الإلكتروني' : 'Receive announcements via email' },
    { id: 'email_alerts', label: t('settings.urgentAlerts'), description: isRTL ? 'استلام التنبيهات العاجلة عبر البريد الإلكتروني' : 'Receive urgent alerts via email' },
    { id: 'attendance_reminders', label: t('settings.attendanceReminders'), description: isRTL ? 'تذكير بتسجيل الحضور' : 'Get reminded about attendance' },
    { id: 'absence_updates', label: t('settings.absenceUpdates'), description: isRTL ? 'إشعار عند مراجعة طلبات الغياب' : 'Get notified when absence requests are reviewed' },
  ];

  return (
    <DashboardLayout title={t('settings.title')} subtitle={t('settings.subtitle')}>
      <div className={`grid grid-cols-1 lg:grid-cols-4 gap-6 ${isRTL ? 'lg:grid-flow-dense' : ''}`}>
        {/* Sidebar */}
        <Card className={`lg:col-span-1 h-fit p-4 ${isRTL ? 'lg:col-start-4' : ''}`}>
          <div className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isRTL ? 'flex-row-reverse text-right' : 'text-left'} ${
                  activeTab === tab.id
                    ? 'bg-purple-50 text-purple-600'
                    : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.name}</span>
              </button>
            ))}
          </div>
          
          {/* Language Setting in Sidebar */}
          <div className="mt-4 pt-4 border-t border-slate-200">
            <div className={`flex items-center gap-3 px-4 py-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Globe className="w-5 h-5 text-slate-400" />
              <span className="font-medium text-slate-700">{t('common.language')}</span>
            </div>
            <div className="px-4 mt-2">
              <LanguageSwitcher variant="full" />
            </div>
          </div>
        </Card>

        {/* Content */}
        <div className={`lg:col-span-3 space-y-6 ${isRTL ? 'lg:col-start-1' : ''}`}>
          {message && (
            <div className={`p-4 rounded-xl flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''} ${
              message.type === 'success' 
                ? 'bg-emerald-50 text-emerald-600' 
                : 'bg-red-50 text-red-600'
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
              <CardHeader title={t('settings.profileInfo')} subtitle={t('settings.updateProfile')} />
              
              {/* User Info Display */}
              <div className={`flex items-center gap-4 p-4 rounded-xl bg-slate-50 mx-4 sm:mx-6 mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={`w-16 h-16 rounded-full ${getRoleColor(user?.role || 'parent')} flex items-center justify-center text-white text-2xl font-bold`}>
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div className={isRTL ? 'text-right' : ''}>
                  <h3 className="text-lg font-semibold text-slate-900">{user?.name}</h3>
                  <p className="text-sm text-slate-500">{getRoleNameTranslated(user?.role || 'parent')}</p>
                </div>
              </div>
              
              <form onSubmit={handleProfileUpdate} className="space-y-4 px-4 sm:px-6 pb-4 sm:pb-6">
                <Input
                  label={t('students.fullName')}
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  required
                />
                <Input
                  label={t('common.email')}
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  required
                />
                <div className={`flex ${isRTL ? 'justify-start' : 'justify-end'}`}>
                  <Button type="submit" isLoading={isSaving}>
                    {t('settings.saveChanges')}
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card>
              <CardHeader title={t('settings.changePassword')} subtitle={isRTL ? 'قم بتحديث كلمة المرور للحفاظ على أمان حسابك' : 'Update your password to keep your account secure'} />
              
              <form onSubmit={handlePasswordChange} className="space-y-4 px-4 sm:px-6 pb-4 sm:pb-6">
                <Input
                  label={t('settings.currentPassword')}
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  required
                />
                <Input
                  label={t('settings.newPassword')}
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  required
                />
                <Input
                  label={t('settings.confirmPassword')}
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  required
                />
                <div className={`flex ${isRTL ? 'justify-start' : 'justify-end'}`}>
                  <Button type="submit" isLoading={isSaving}>
                    {t('settings.changePassword')}
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <CardHeader title={t('settings.notificationPrefs')} subtitle={isRTL ? 'إدارة طريقة استلام الإشعارات' : 'Manage how you receive notifications'} />
              
              <div className="space-y-4 px-4 sm:px-6">
                {notificationSettings.map((setting) => (
                  <label
                    key={setting.id}
                    className={`flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-purple-500 cursor-pointer transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}
                  >
                    <div className={isRTL ? 'text-right' : ''}>
                      <p className="font-medium text-slate-900">{setting.label}</p>
                      <p className="text-sm text-slate-500">{setting.description}</p>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-5 h-5 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                    />
                  </label>
                ))}
              </div>
              
              <div className={`flex px-4 sm:px-6 py-4 sm:pb-6 ${isRTL ? 'justify-start' : 'justify-end'}`}>
                <Button onClick={() => setMessage({ type: 'success', text: t('settings.preferencesSaved') })}>
                  {t('common.save')}
                </Button>
              </div>
            </Card>
          )}

          {/* Danger Zone */}
          <Card className="border-red-200">
            <CardHeader title={t('settings.dangerZone')} subtitle={t('settings.irreversibleActions')} />
            <div className={`flex items-center justify-between p-4 rounded-xl bg-red-50 mx-4 sm:mx-6 mb-4 sm:mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={isRTL ? 'text-right' : ''}>
                <p className="font-medium text-red-700">{t('auth.logout')}</p>
                <p className="text-sm text-red-600/70">{t('settings.signOutAccount')}</p>
              </div>
              <Button variant="danger" onClick={logout}>
                {t('auth.logout')}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
