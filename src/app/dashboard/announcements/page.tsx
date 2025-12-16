'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { db } from '@/lib/db';
import { format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { v4 as uuidv4 } from 'uuid';
import { 
  Plus, 
  Bell, 
  AlertTriangle, 
  Megaphone,
  Shield,
  Edit,
  Trash2,
  Filter
} from 'lucide-react';
import type { Announcement, User } from '@/lib/types';

interface AnnouncementWithAuthor extends Announcement {
  author?: User;
}

export default function AnnouncementsPage() {
  const { user } = useAuth();
  const { t, isRTL, language } = useLanguage();
  const [announcements, setAnnouncements] = useState<AnnouncementWithAuthor[]>([]);
  const [filterType, setFilterType] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  
  const dateLocale = language === 'ar' ? ar : enUS;
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'announcement' as 'announcement' | 'alert' | 'instruction' | 'evacuation',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
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

  const loadData = async () => {
    let announcementsData: Announcement[] = [];
    
    if (user?.role === 'moe') {
      announcementsData = await db.announcements.orderBy('createdAt').reverse().toArray();
    } else if (user?.schoolId) {
      announcementsData = await db.announcements
        .where('targetSchoolId').equals(user.schoolId)
        .or('targetSchoolId').equals('')
        .reverse()
        .sortBy('createdAt');
    } else {
      announcementsData = await db.announcements.orderBy('createdAt').reverse().toArray();
    }
    
    const withAuthors = await Promise.all(
      announcementsData.map(async (announcement) => {
        const author = await db.users.get(announcement.authorId);
        return { ...announcement, author };
      })
    );
    
    setAnnouncements(withAuthors);
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const filteredAnnouncements = announcements.filter((announcement) => {
    const matchesType = filterType === 'all' || announcement.type === filterType;
    const matchesPriority = filterPriority === 'all' || announcement.priority === filterPriority;
    return matchesType && matchesPriority;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const announcementData: Announcement = {
      id: editingAnnouncement?.id || uuidv4(),
      title: formData.title,
      content: formData.content,
      authorId: user?.id || '',
      authorRole: user?.role || 'school_admin',
      targetSchoolId: user?.schoolId || '',
      type: formData.type,
      priority: formData.priority,
      createdAt: editingAnnouncement?.createdAt || new Date(),
    };

    if (editingAnnouncement) {
      await db.announcements.update(editingAnnouncement.id, announcementData);
    } else {
      await db.announcements.add(announcementData);
    }

    setIsModalOpen(false);
    setEditingAnnouncement(null);
    setFormData({ title: '', content: '', type: 'announcement', priority: 'medium' });
    loadData();
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      type: announcement.type,
      priority: announcement.priority,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm(isRTL ? 'هل أنت متأكد من حذف هذا الإعلان؟' : 'Are you sure you want to delete this announcement?')) {
      await db.announcements.delete(id);
      loadData();
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'alert': return <AlertTriangle className="w-5 h-5" />;
      case 'instruction': return <Megaphone className="w-5 h-5" />;
      case 'evacuation': return <Shield className="w-5 h-5" />;
      default: return <Bell className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'alert': return 'bg-red-100 text-red-600';
      case 'instruction': return 'bg-blue-100 text-blue-600';
      case 'evacuation': return 'bg-purple-100 text-purple-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'alert': return t('announcements.alert');
      case 'instruction': return t('announcements.instruction');
      case 'evacuation': return t('announcements.evacuation');
      default: return t('announcements.announcement');
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent': return <Badge variant="danger">{t('announcements.urgent')}</Badge>;
      case 'high': return <Badge variant="warning">{isRTL ? 'عالي' : 'High'}</Badge>;
      case 'medium': return <Badge variant="info">{isRTL ? 'متوسط' : 'Medium'}</Badge>;
      default: return <Badge variant="default">{isRTL ? 'منخفض' : 'Low'}</Badge>;
    }
  };

  const canCreate = user?.role === 'moe' || user?.role === 'school_admin' || user?.role === 'teacher';
  const canEdit = (announcement: Announcement) => announcement.authorId === user?.id;

  return (
    <DashboardLayout title={t('announcements.title')} subtitle={t('announcements.subtitle')}>
      <Card className="mb-6 p-4 sm:p-6">
        <div className={`flex flex-col md:flex-row gap-4 items-start md:items-center justify-between ${isRTL ? 'md:flex-row-reverse' : ''}`}>
          <div className={`flex gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              options={[
                { value: 'all', label: isRTL ? 'جميع الأنواع' : 'All Types' },
                { value: 'announcement', label: t('announcements.announcement') },
                { value: 'alert', label: t('announcements.alert') },
                { value: 'instruction', label: t('announcements.instruction') },
                { value: 'evacuation', label: t('announcements.evacuation') },
              ]}
              className="w-40"
            />
            <Select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              options={[
                { value: 'all', label: isRTL ? 'جميع الأولويات' : 'All Priorities' },
                { value: 'urgent', label: t('announcements.urgent') },
                { value: 'high', label: isRTL ? 'عالي' : 'High' },
                { value: 'medium', label: isRTL ? 'متوسط' : 'Medium' },
                { value: 'low', label: isRTL ? 'منخفض' : 'Low' },
              ]}
              className="w-40"
            />
          </div>
          {canCreate && (
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {t('announcements.newAnnouncement')}
            </Button>
          )}
        </div>
      </Card>

      <div className="space-y-4">
        {filteredAnnouncements.length === 0 ? (
          <Card className="p-4 sm:p-6">
            <div className="text-center py-12">
              <Bell className="w-12 h-12 mx-auto text-slate-400 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">{t('announcements.noAnnouncements')}</h3>
              <p className="text-slate-500">{isRTL ? 'لا توجد إعلانات لعرضها.' : 'There are no announcements to display.'}</p>
            </div>
          </Card>
        ) : (
          filteredAnnouncements.map((announcement) => (
            <Card key={announcement.id} className={`p-4 sm:p-6
              ${announcement.priority === 'urgent' ? (isRTL ? 'border-r-4 border-r-red-500' : 'border-l-4 border-l-red-500') : ''}
              ${announcement.priority === 'high' ? (isRTL ? 'border-r-4 border-r-amber-500' : 'border-l-4 border-l-amber-500') : ''}
            `}>
              <div className={`flex items-start gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={`p-3 rounded-xl ${getTypeColor(announcement.type)}`}>
                  {getTypeIcon(announcement.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`flex items-start justify-between gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className={isRTL ? 'text-right' : ''}>
                      <h3 className="font-semibold text-lg text-slate-900">{announcement.title}</h3>
                      <div className={`flex items-center gap-3 mt-1 text-sm text-slate-500 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <span>{announcement.author?.name || (isRTL ? 'غير معروف' : 'Unknown')}</span>
                        <span>•</span>
                        <span>{getRoleNameTranslated(announcement.authorRole)}</span>
                        <span>•</span>
                        <span>{format(new Date(announcement.createdAt), 'MMM d, yyyy h:mm a', { locale: dateLocale })}</span>
                      </div>
                    </div>
                    <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      {getPriorityBadge(announcement.priority)}
                      <Badge variant="default">{getTypeLabel(announcement.type)}</Badge>
                    </div>
                  </div>
                  <p className={`mt-3 text-slate-600 ${isRTL ? 'text-right' : ''}`}>{announcement.content}</p>
                  
                  {canEdit(announcement) && (
                    <div className={`flex gap-2 mt-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Button size="sm" variant="ghost" onClick={() => handleEdit(announcement)}>
                        <Edit className={`w-4 h-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                        {t('common.edit')}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(announcement.id)}>
                        <Trash2 className={`w-4 h-4 ${isRTL ? 'ml-1' : 'mr-1'} text-red-500`} />
                        {t('common.delete')}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingAnnouncement(null);
          setFormData({ title: '', content: '', type: 'announcement', priority: 'medium' });
        }}
        title={editingAnnouncement ? t('announcements.editAnnouncement') : t('announcements.newAnnouncement')}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={isRTL ? 'العنوان' : 'Title'}
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder={isRTL ? 'أدخل عنوان الإعلان' : 'Enter announcement title'}
            required
          />
          <div>
            <label className={`block text-sm font-semibold text-slate-700 mb-2 ${isRTL ? 'text-right' : ''}`}>
              {t('announcements.content')}
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder={isRTL ? 'أدخل محتوى الإعلان' : 'Enter announcement content'}
              rows={4}
              required
              dir={isRTL ? 'rtl' : 'ltr'}
              className={`w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 ${isRTL ? 'text-right' : ''}`}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label={t('announcements.type')}
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as typeof formData.type })}
              options={[
                { value: 'announcement', label: t('announcements.announcement') },
                { value: 'alert', label: t('announcements.alert') },
                { value: 'instruction', label: t('announcements.instruction') },
                { value: 'evacuation', label: t('announcements.evacuation') },
              ]}
            />
            <Select
              label={t('announcements.priority')}
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as typeof formData.priority })}
              options={[
                { value: 'low', label: isRTL ? 'منخفض' : 'Low' },
                { value: 'medium', label: isRTL ? 'متوسط' : 'Medium' },
                { value: 'high', label: isRTL ? 'عالي' : 'High' },
                { value: 'urgent', label: t('announcements.urgent') },
              ]}
            />
          </div>
          <div className={`flex gap-3 pt-4 ${isRTL ? 'flex-row-reverse justify-start' : 'justify-end'}`}>
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit">
              {editingAnnouncement ? t('common.update') : t('common.create')} {isRTL ? 'الإعلان' : 'Announcement'}
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
