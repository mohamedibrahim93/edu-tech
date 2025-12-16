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
  const [issues, setIssues] = useState<IssueWithUser[]>([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingIssue, setViewingIssue] = useState<IssueWithUser | null>(null);
  
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
  });

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
      case 'open': return <Badge variant="danger">Open</Badge>;
      case 'in_progress': return <Badge variant="warning">In Progress</Badge>;
      case 'resolved': return <Badge variant="success">Resolved</Badge>;
      case 'closed': return <Badge variant="default">Closed</Badge>;
      default: return <Badge variant="default">{status}</Badge>;
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
    <DashboardLayout title="Issues" subtitle="Report and track issues">
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'open', label: 'Open' },
              { value: 'in_progress', label: 'In Progress' },
              { value: 'resolved', label: 'Resolved' },
              { value: 'closed', label: 'Closed' },
            ]}
            className="w-40"
          />
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Report Issue
          </Button>
        </div>
      </Card>

      <div className="space-y-4">
        {filteredIssues.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 mx-auto text-slate-400 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No Issues Found</h3>
              <p className="text-slate-500">There are no issues to display.</p>
            </div>
          </Card>
        ) : (
          filteredIssues.map((issue) => (
            <Card 
              key={issue.id} 
              className={`cursor-pointer hover:border-indigo-500 ${
                issue.status === 'open' ? 'border-l-4 border-l-red-500' :
                issue.status === 'in_progress' ? 'border-l-4 border-l-amber-500' : ''
              }`}
              onClick={() => setViewingIssue(issue)}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${getStatusColor(issue.status)}`}>
                  {getStatusIcon(issue.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-slate-900">{issue.subject}</h3>
                      <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                        <span>{issue.reporter?.name || 'Unknown'}</span>
                        <span>•</span>
                        <span>{getRoleName(issue.reporterRole)}</span>
                        <span>•</span>
                        <span>{format(new Date(issue.createdAt), 'MMM d, yyyy h:mm a')}</span>
                      </div>
                    </div>
                    {getStatusBadge(issue.status)}
                  </div>
                  <p className="mt-2 text-sm text-slate-600 line-clamp-2">
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
        title="Report Issue"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Subject"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            placeholder="Brief description of the issue"
            required
          />
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide more details about the issue"
              rows={4}
              required
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Submit Issue
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Issue Modal */}
      <Modal
        isOpen={!!viewingIssue}
        onClose={() => setViewingIssue(null)}
        title="Issue Details"
        size="lg"
      >
        {viewingIssue && (
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl ${getStatusColor(viewingIssue.status)}`}>
                {getStatusIcon(viewingIssue.status)}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-slate-900">{viewingIssue.subject}</h3>
                <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                  <span>{viewingIssue.reporter?.name}</span>
                  <span>•</span>
                  <span>{getRoleName(viewingIssue.reporterRole)}</span>
                  <span>•</span>
                  <span>{format(new Date(viewingIssue.createdAt), 'MMMM d, yyyy h:mm a')}</span>
                </div>
              </div>
              {getStatusBadge(viewingIssue.status)}
            </div>
            
            <div className="p-4 rounded-xl bg-slate-50">
              <h4 className="font-medium text-slate-700 mb-2">Description</h4>
              <p className="text-slate-600 whitespace-pre-wrap">{viewingIssue.description}</p>
            </div>
            
            {user?.role === 'school_admin' && (
              <div className="pt-4 border-t border-slate-200">
                <h4 className="font-medium text-slate-700 mb-3">Update Status</h4>
                <div className="flex flex-wrap gap-2">
                  {(['open', 'in_progress', 'resolved', 'closed'] as Issue['status'][]).map((status) => (
                    <Button
                      key={status}
                      size="sm"
                      variant={viewingIssue.status === status ? 'primary' : 'outline'}
                      onClick={() => handleUpdateStatus(viewingIssue.id, status)}
                    >
                      {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex justify-end pt-4">
              <Button onClick={() => setViewingIssue(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}

