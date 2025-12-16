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
  AlertTriangle,
  MessageSquare,
  CheckCircle,
  Clock,
  XCircle,
  Eye
} from 'lucide-react';
import type { Issue, User } from '@/lib/types';

interface IssueWithUser extends Issue {
  reporter?: User;
}

export default function IssuesPage() {
  const { user } = useAuth();
  const { t, isRTL, language } = useLanguage();
  const [issues, setIssues] = useState<IssueWithUser[]>([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingIssue, setViewingIssue] = useState<IssueWithUser | null>(null);
  
  const dateLocale = language === 'ar' ? ar : enUS;
  
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
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
    let issuesData: Issue[] = [];
    
    if (user?.role === 'school_admin') {
      // School admin sees all issues for their school
      issuesData = await db.issues.toArray();
    } else {
      // Teachers and parents see only their own issues
      issuesData = await db.issues.where('reportedBy').equals(user?.id || '').toArray();
    }
    
    const withUsers = await Promise.all(
      issuesData.map(async (issue) => {
        const reporter = await db.users.get(issue.reportedBy);
        return { ...issue, reporter };
      })
    );
    
    setIssues(withUsers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const filteredIssues = issues.filter((issue) => {
    return filterStatus === 'all' || issue.status === filterStatus;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const issueData: Issue = {
      id: uuidv4(),
      reportedBy: user?.id || '',
      reporterRole: user?.role || 'parent',
      subject: formData.subject,
      description: formData.description,
      status: 'open',
      createdAt: new Date(),
    };

    await db.issues.add(issueData);
    setIsModalOpen(false);
    setFormData({ subject: '', description: '' });
    loadData();
  };

  const handleUpdateStatus = async (issueId: string, newStatus: Issue['status']) => {
    await db.issues.update(issueId, { status: newStatus });
    if (viewingIssue?.id === issueId) {
      setViewingIssue({ ...viewingIssue, status: newStatus });
    }
    loadData();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertTriangle className="w-4 h-4" />;
      case 'in_progress': return <Clock className="w-4 h-4" />;
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      case 'closed': return <XCircle className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open': return <Badge variant="danger">{t('issues.open')}</Badge>;
      case 'in_progress': return <Badge variant="warning">{t('issues.inProgress')}</Badge>;
      case 'resolved': return <Badge variant="success">{t('issues.resolved')}</Badge>;
      case 'closed': return <Badge variant="default">{t('issues.closed')}</Badge>;
      default: return <Badge variant="default">{status}</Badge>;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open': return t('issues.open');
      case 'in_progress': return t('issues.inProgress');
      case 'resolved': return t('issues.resolved');
      case 'closed': return t('issues.closed');
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-600';
      case 'in_progress': return 'bg-amber-100 text-amber-600';
      case 'resolved': return 'bg-emerald-100 text-emerald-600';
      case 'closed': return 'bg-slate-100 text-slate-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <DashboardLayout title={t('issues.title')} subtitle={t('issues.subtitle')}>
      <Card className="mb-6 p-4 sm:p-6">
        <div className={`flex flex-col md:flex-row gap-4 items-start md:items-center justify-between ${isRTL ? 'md:flex-row-reverse' : ''}`}>
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            options={[
              { value: 'all', label: isRTL ? 'جميع الحالات' : 'All Status' },
              { value: 'open', label: t('issues.open') },
              { value: 'in_progress', label: t('issues.inProgress') },
              { value: 'resolved', label: t('issues.resolved') },
              { value: 'closed', label: t('issues.closed') },
            ]}
            className="w-40"
          />
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t('issues.reportIssue')}
          </Button>
        </div>
      </Card>

      <div className="space-y-4">
        {filteredIssues.length === 0 ? (
          <Card className="p-4 sm:p-6">
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 mx-auto text-slate-400 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">{t('issues.noIssues')}</h3>
              <p className="text-slate-500">{isRTL ? 'لا توجد مشكلات لعرضها.' : 'There are no issues to display.'}</p>
            </div>
          </Card>
        ) : (
          filteredIssues.map((issue) => (
            <Card 
              key={issue.id} 
              className={`cursor-pointer hover:border-indigo-500 p-4 sm:p-6 ${
                issue.status === 'open' ? (isRTL ? 'border-r-4 border-r-red-500' : 'border-l-4 border-l-red-500') :
                issue.status === 'in_progress' ? (isRTL ? 'border-r-4 border-r-amber-500' : 'border-l-4 border-l-amber-500') : ''
              }`}
              onClick={() => setViewingIssue(issue)}
            >
              <div className={`flex items-start gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={`p-3 rounded-xl ${getStatusColor(issue.status)}`}>
                  {getStatusIcon(issue.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`flex items-start justify-between gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className={isRTL ? 'text-right' : ''}>
                      <h3 className="font-semibold text-slate-900">{issue.subject}</h3>
                      <div className={`flex items-center gap-3 mt-1 text-sm text-slate-500 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <span>{issue.reporter?.name || (isRTL ? 'غير معروف' : 'Unknown')}</span>
                        <span>•</span>
                        <span>{getRoleNameTranslated(issue.reporterRole)}</span>
                        <span>•</span>
                        <span>{format(new Date(issue.createdAt), 'MMM d, yyyy h:mm a', { locale: dateLocale })}</span>
                      </div>
                    </div>
                    {getStatusBadge(issue.status)}
                  </div>
                  <p className={`mt-2 text-sm text-slate-600 line-clamp-2 ${isRTL ? 'text-right' : ''}`}>
                    {issue.description}
                  </p>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* New Issue Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setFormData({ subject: '', description: '' });
        }}
        title={t('issues.reportIssue')}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t('issues.subject')}
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            placeholder={isRTL ? 'وصف مختصر للمشكلة' : 'Brief description of the issue'}
            required
          />
          <div>
            <label className={`block text-sm font-semibold text-slate-700 mb-2 ${isRTL ? 'text-right' : ''}`}>
              {t('issues.description')}
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={isRTL ? 'قدم المزيد من التفاصيل حول المشكلة' : 'Provide more details about the issue'}
              rows={4}
              required
              dir={isRTL ? 'rtl' : 'ltr'}
              className={`w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 ${isRTL ? 'text-right' : ''}`}
            />
          </div>
          <div className={`flex gap-3 pt-4 ${isRTL ? 'flex-row-reverse justify-start' : 'justify-end'}`}>
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit">
              {t('issues.submitIssue')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Issue Modal */}
      <Modal
        isOpen={!!viewingIssue}
        onClose={() => setViewingIssue(null)}
        title={t('issues.issueDetails')}
        size="lg"
      >
        {viewingIssue && (
          <div className="space-y-4">
            <div className={`flex items-start gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={`p-3 rounded-xl ${getStatusColor(viewingIssue.status)}`}>
                {getStatusIcon(viewingIssue.status)}
              </div>
              <div className={`flex-1 ${isRTL ? 'text-right' : ''}`}>
                <h3 className="font-semibold text-lg text-slate-900">{viewingIssue.subject}</h3>
                <div className={`flex items-center gap-3 mt-1 text-sm text-slate-500 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span>{viewingIssue.reporter?.name}</span>
                  <span>•</span>
                  <span>{getRoleNameTranslated(viewingIssue.reporterRole)}</span>
                  <span>•</span>
                  <span>{format(new Date(viewingIssue.createdAt), 'MMMM d, yyyy h:mm a', { locale: dateLocale })}</span>
                </div>
              </div>
              {getStatusBadge(viewingIssue.status)}
            </div>
            
            <div className={`p-4 rounded-xl bg-slate-50 ${isRTL ? 'text-right' : ''}`}>
              <h4 className="font-medium text-slate-700 mb-2">{t('issues.description')}</h4>
              <p className="text-slate-600 whitespace-pre-wrap">{viewingIssue.description}</p>
            </div>
            
            {user?.role === 'school_admin' && (
              <div className="pt-4 border-t border-slate-200">
                <h4 className={`font-medium text-slate-700 mb-3 ${isRTL ? 'text-right' : ''}`}>
                  {t('issues.updateStatus')}
                </h4>
                <div className={`flex flex-wrap gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  {(['open', 'in_progress', 'resolved', 'closed'] as Issue['status'][]).map((status) => (
                    <Button
                      key={status}
                      size="sm"
                      variant={viewingIssue.status === status ? 'primary' : 'outline'}
                      onClick={() => handleUpdateStatus(viewingIssue.id, status)}
                    >
                      {getStatusLabel(status)}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            
            <div className={`flex pt-4 ${isRTL ? 'justify-start' : 'justify-end'}`}>
              <Button onClick={() => setViewingIssue(null)}>{t('common.close')}</Button>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
