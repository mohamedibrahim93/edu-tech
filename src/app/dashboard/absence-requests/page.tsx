'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Table } from '@/components/ui/Table';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/db';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { 
  Plus, 
  Calendar,
  Check,
  X,
  Clock,
  Eye
} from 'lucide-react';
import type { AbsenceRequest, Student, Parent, User } from '@/lib/types';

interface AbsenceRequestWithDetails extends AbsenceRequest {
  student?: Student;
  parent?: Parent;
  parentUser?: User;
  reviewer?: User;
}

export default function AbsenceRequestsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<AbsenceRequestWithDetails[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingRequest, setViewingRequest] = useState<AbsenceRequestWithDetails | null>(null);
  
  const [formData, setFormData] = useState({
    studentId: '',
    startDate: '',
    endDate: '',
    reason: '',
  });

  const loadData = async () => {
    let requestsData: AbsenceRequest[] = [];
    
    if (user?.role === 'parent') {
      const parent = await db.parents.where('userId').equals(user.id).first();
      if (parent) {
        requestsData = await db.absenceRequests.where('parentId').equals(parent.id).toArray();
        const parentStudents = await db.students.where('id').anyOf(parent.studentIds).toArray();
        setStudents(parentStudents);
      }
    } else if (user?.role === 'school_admin' && user.schoolId) {
      requestsData = await db.absenceRequests.toArray();
    }
    
    const withDetails: AbsenceRequestWithDetails[] = await Promise.all(
      requestsData.map(async (request) => {
        const student = await db.students.get(request.studentId);
        const parent = await db.parents.get(request.parentId);
        const parentUser = parent ? await db.users.get(parent.userId) : undefined;
        const reviewer = request.reviewedBy ? await db.users.get(request.reviewedBy) : undefined;
        return { ...request, student, parent, parentUser, reviewer };
      })
    );
    
    setRequests(withDetails.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const filteredRequests = requests.filter((request) => {
    return filterStatus === 'all' || request.status === filterStatus;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const parent = await db.parents.where('userId').equals(user?.id || '').first();
    if (!parent) return;
    
    const requestData: AbsenceRequest = {
      id: uuidv4(),
      studentId: formData.studentId,
      parentId: parent.id,
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate),
      reason: formData.reason,
      status: 'pending',
      createdAt: new Date(),
    };

    await db.absenceRequests.add(requestData);
    setIsModalOpen(false);
    setFormData({ studentId: '', startDate: '', endDate: '', reason: '' });
    loadData();
  };

  const handleApprove = async (request: AbsenceRequestWithDetails) => {
    await db.absenceRequests.update(request.id, {
      status: 'approved',
      reviewedBy: user?.id,
      reviewedAt: new Date(),
    });
    loadData();
  };

  const handleReject = async (request: AbsenceRequestWithDetails) => {
    await db.absenceRequests.update(request.id, {
      status: 'rejected',
      reviewedBy: user?.id,
      reviewedAt: new Date(),
    });
    loadData();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved': return <Badge variant="success">Approved</Badge>;
      case 'rejected': return <Badge variant="danger">Rejected</Badge>;
      default: return <Badge variant="warning">Pending</Badge>;
    }
  };

  const columns = [
    {
      key: 'student',
      header: 'Student',
      render: (request: AbsenceRequestWithDetails) => (
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm ${request.student?.gender === 'male' ? 'bg-blue-500' : 'bg-pink-500'}`}>
            {request.student?.name.charAt(0) || '?'}
          </div>
          <div>
            <p className="font-medium text-slate-900 dark:text-white">{request.student?.name || 'Unknown'}</p>
            <p className="text-xs text-slate-500">{request.student?.studentNumber}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'dates',
      header: 'Dates',
      render: (request: AbsenceRequestWithDetails) => (
        <div className="text-sm">
          <p>{format(new Date(request.startDate), 'MMM d')}</p>
          <p className="text-slate-500">to {format(new Date(request.endDate), 'MMM d, yyyy')}</p>
        </div>
      ),
    },
    {
      key: 'reason',
      header: 'Reason',
      render: (request: AbsenceRequestWithDetails) => (
        <p className="text-sm truncate max-w-xs">{request.reason}</p>
      ),
    },
    {
      key: 'parent',
      header: 'Requested By',
      render: (request: AbsenceRequestWithDetails) => (
        <p className="text-sm">{request.parentUser?.name || 'Unknown'}</p>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (request: AbsenceRequestWithDetails) => getStatusBadge(request.status),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (request: AbsenceRequestWithDetails) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewingRequest(request)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          </button>
          {user?.role === 'school_admin' && request.status === 'pending' && (
            <>
              <button
                onClick={() => handleApprove(request)}
                className="p-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                title="Approve"
              >
                <Check className="w-4 h-4 text-emerald-500" />
              </button>
              <button
                onClick={() => handleReject(request)}
                className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title="Reject"
              >
                <X className="w-4 h-4 text-red-500" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout title="Absence Requests" subtitle="Manage student absence requests">
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'pending', label: 'Pending' },
              { value: 'approved', label: 'Approved' },
              { value: 'rejected', label: 'Rejected' },
            ]}
            className="w-40"
          />
          {user?.role === 'parent' && (
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Request
            </Button>
          )}
        </div>
      </Card>

      <Card>
        <Table
          data={filteredRequests}
          columns={columns}
          keyExtractor={(request) => request.id}
          emptyMessage="No absence requests found"
        />
      </Card>

      {/* New Request Modal (for parents) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setFormData({ studentId: '', startDate: '', endDate: '', reason: '' });
        }}
        title="Submit Absence Request"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Student"
            value={formData.studentId}
            onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
            options={[
              { value: '', label: 'Select a student' },
              ...students.map(s => ({ value: s.id, label: s.name })),
            ]}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              required
            />
            <Input
              label="End Date"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Reason</label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Explain the reason for absence"
              rows={3}
              required
              className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Submit Request
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Details Modal */}
      <Modal
        isOpen={!!viewingRequest}
        onClose={() => setViewingRequest(null)}
        title="Absence Request Details"
      >
        {viewingRequest && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${viewingRequest.student?.gender === 'male' ? 'bg-blue-500' : 'bg-pink-500'}`}>
                  {viewingRequest.student?.name.charAt(0) || '?'}
                </div>
                <div>
                  <p className="font-semibold text-lg text-slate-900 dark:text-white">{viewingRequest.student?.name}</p>
                  <p className="text-sm text-slate-500">{viewingRequest.student?.studentNumber}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500">Start Date</p>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {format(new Date(viewingRequest.startDate), 'MMMM d, yyyy')}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">End Date</p>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {format(new Date(viewingRequest.endDate), 'MMMM d, yyyy')}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Requested By</p>
                  <p className="font-medium text-slate-900 dark:text-white">{viewingRequest.parentUser?.name}</p>
                </div>
                <div>
                  <p className="text-slate-500">Status</p>
                  {getStatusBadge(viewingRequest.status)}
                </div>
              </div>
            </div>
            
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Reason</p>
              <p className="text-slate-600 dark:text-slate-400">{viewingRequest.reason}</p>
            </div>
            
            {viewingRequest.reviewer && (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Reviewed By</p>
                <p className="text-slate-600 dark:text-slate-400">
                  {viewingRequest.reviewer.name} on {format(new Date(viewingRequest.reviewedAt!), 'MMM d, yyyy')}
                </p>
              </div>
            )}
            
            <div className="flex justify-end pt-4">
              <Button onClick={() => setViewingRequest(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}

