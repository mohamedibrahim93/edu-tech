'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useAuth, getRoleName } from '@/contexts/AuthContext';
import { db } from '@/lib/db';
import { format } from 'date-fns';
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
  const [announcements, setAnnouncements] = useState<AnnouncementWithAuthor[]>([]);
  const [filterType, setFilterType] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'announcement' as 'announcement' | 'alert' | 'instruction' | 'evacuation',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
  });

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
    if (confirm('Are you sure you want to delete this announcement?')) {
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
      case 'alert': return 'bg-red-100 text-red-600 dark:bg-red-900/30';
      case 'instruction': return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30';
      case 'evacuation': return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30';
      default: return 'bg-slate-100 text-slate-600 dark:bg-slate-700';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent': return <Badge variant="danger">Urgent</Badge>;
      case 'high': return <Badge variant="warning">High</Badge>;
      case 'medium': return <Badge variant="info">Medium</Badge>;
      default: return <Badge variant="default">Low</Badge>;
    }
  };

  const canCreate = user?.role === 'moe' || user?.role === 'school_admin' || user?.role === 'teacher';
  const canEdit = (announcement: Announcement) => announcement.authorId === user?.id;

  return (
    <DashboardLayout title="Announcements" subtitle="View and manage announcements">
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex gap-4">
            <Select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              options={[
                { value: 'all', label: 'All Types' },
                { value: 'announcement', label: 'Announcements' },
                { value: 'alert', label: 'Alerts' },
                { value: 'instruction', label: 'Instructions' },
                { value: 'evacuation', label: 'Evacuation' },
              ]}
              className="w-40"
            />
            <Select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              options={[
                { value: 'all', label: 'All Priorities' },
                { value: 'urgent', label: 'Urgent' },
                { value: 'high', label: 'High' },
                { value: 'medium', label: 'Medium' },
                { value: 'low', label: 'Low' },
              ]}
              className="w-40"
            />
          </div>
          {canCreate && (
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Announcement
            </Button>
          )}
        </div>
      </Card>

      <div className="space-y-4">
        {filteredAnnouncements.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <Bell className="w-12 h-12 mx-auto text-slate-400 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No Announcements</h3>
              <p className="text-slate-500">There are no announcements to display.</p>
            </div>
          </Card>
        ) : (
          filteredAnnouncements.map((announcement) => (
            <Card key={announcement.id} className={`
              ${announcement.priority === 'urgent' ? 'border-l-4 border-l-red-500' : ''}
              ${announcement.priority === 'high' ? 'border-l-4 border-l-amber-500' : ''}
            `}>
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${getTypeColor(announcement.type)}`}>
                  {getTypeIcon(announcement.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-lg text-slate-900 dark:text-white">{announcement.title}</h3>
                      <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                        <span>{announcement.author?.name || 'Unknown'}</span>
                        <span>•</span>
                        <span>{getRoleName(announcement.authorRole)}</span>
                        <span>•</span>
                        <span>{format(new Date(announcement.createdAt), 'MMM d, yyyy h:mm a')}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getPriorityBadge(announcement.priority)}
                      <Badge variant="default">{announcement.type}</Badge>
                    </div>
                  </div>
                  <p className="mt-3 text-slate-600 dark:text-slate-300">{announcement.content}</p>
                  
                  {canEdit(announcement) && (
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="ghost" onClick={() => handleEdit(announcement)}>
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(announcement.id)}>
                        <Trash2 className="w-4 h-4 mr-1 text-red-500" />
                        Delete
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
        title={editingAnnouncement ? 'Edit Announcement' : 'New Announcement'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Enter announcement title"
            required
          />
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Content</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Enter announcement content"
              rows={4}
              required
              className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as typeof formData.type })}
              options={[
                { value: 'announcement', label: 'Announcement' },
                { value: 'alert', label: 'Alert' },
                { value: 'instruction', label: 'Instruction' },
                { value: 'evacuation', label: 'Evacuation' },
              ]}
            />
            <Select
              label="Priority"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as typeof formData.priority })}
              options={[
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
                { value: 'urgent', label: 'Urgent' },
              ]}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingAnnouncement ? 'Update' : 'Create'} Announcement
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}

