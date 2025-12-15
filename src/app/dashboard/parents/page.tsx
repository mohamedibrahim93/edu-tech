'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Table } from '@/components/ui/Table';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/db';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { Plus, Search, Edit, Trash2, Check, X, Users, GraduationCap } from 'lucide-react';
import type { Parent, User, Student } from '@/lib/types';

interface ParentWithDetails extends Parent {
  user?: User;
  students: Student[];
}

export default function ParentsPage() {
  const { user } = useAuth();
  const [parents, setParents] = useState<ParentWithDetails[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingParent, setEditingParent] = useState<ParentWithDetails | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    studentIds: [] as string[],
  });

  const loadData = async () => {
    if (!user?.schoolId) return;
    
    // Get all students in school
    const classes = await db.classes.where('schoolId').equals(user.schoolId).toArray();
    const classIds = classes.map(c => c.id);
    const studentsData = await db.students.where('classId').anyOf(classIds).toArray();
    setAllStudents(studentsData);
    
    // Get all parents
    const parentsData = await db.parents.toArray();
    
    const withDetails: ParentWithDetails[] = await Promise.all(
      parentsData.map(async (parent) => {
        const parentUser = await db.users.get(parent.userId);
        const students = await db.students.where('id').anyOf(parent.studentIds).toArray();
        return { ...parent, user: parentUser, students };
      })
    );
    
    setParents(withDetails);
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const filteredParents = parents.filter((parent) => {
    return parent.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parent.user?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parent.students.some(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const userId = editingParent?.userId || uuidv4();
    const parentId = editingParent?.id || uuidv4();
    
    const userData: User = {
      id: userId,
      email: formData.email,
      password: formData.password || editingParent?.user?.password || 'password123',
      name: formData.name,
      role: 'parent',
      createdAt: editingParent?.user?.createdAt || new Date(),
      isActive: true,
    };

    const parentData: Parent = {
      id: parentId,
      userId: userId,
      studentIds: formData.studentIds,
      isApproved: true,
      createdAt: editingParent?.createdAt || new Date(),
    };

    if (editingParent) {
      await db.users.update(userId, userData);
      await db.parents.update(parentId, parentData);
    } else {
      await db.users.add(userData);
      await db.parents.add(parentData);
    }

    // Update students with parent ID
    for (const studentId of formData.studentIds) {
      await db.students.update(studentId, { parentId: parentId });
    }

    setIsModalOpen(false);
    setEditingParent(null);
    setFormData({ name: '', email: '', password: '', studentIds: [] });
    loadData();
  };

  const handleEdit = (parent: ParentWithDetails) => {
    setEditingParent(parent);
    setFormData({
      name: parent.user?.name || '',
      email: parent.user?.email || '',
      password: '',
      studentIds: parent.studentIds,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (parent: ParentWithDetails) => {
    if (confirm('Are you sure you want to delete this parent account?')) {
      await db.parents.delete(parent.id);
      await db.users.delete(parent.userId);
      loadData();
    }
  };

  const handleApprove = async (parent: ParentWithDetails) => {
    await db.parents.update(parent.id, { isApproved: true });
    loadData();
  };

  const toggleStudent = (studentId: string) => {
    setFormData(prev => ({
      ...prev,
      studentIds: prev.studentIds.includes(studentId)
        ? prev.studentIds.filter(id => id !== studentId)
        : [...prev.studentIds, studentId]
    }));
  };

  const columns = [
    {
      key: 'name',
      header: 'Parent',
      render: (parent: ParentWithDetails) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-semibold">
            {parent.user?.name.charAt(0) || 'P'}
          </div>
          <div>
            <p className="font-medium text-slate-900 dark:text-white">{parent.user?.name}</p>
            <p className="text-sm text-slate-500">{parent.user?.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'children',
      header: 'Children',
      render: (parent: ParentWithDetails) => (
        <div className="flex flex-wrap gap-1">
          {parent.students.map((student) => (
            <Badge key={student.id} variant="info" size="sm">{student.name}</Badge>
          ))}
          {parent.students.length === 0 && (
            <span className="text-sm text-slate-500">No children linked</span>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (parent: ParentWithDetails) => (
        <Badge variant={parent.isApproved ? 'success' : 'warning'}>
          {parent.isApproved ? 'Approved' : 'Pending'}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      header: 'Registered',
      render: (parent: ParentWithDetails) => format(new Date(parent.createdAt), 'MMM d, yyyy'),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (parent: ParentWithDetails) => (
        <div className="flex items-center gap-2">
          {!parent.isApproved && (
            <button
              onClick={() => handleApprove(parent)}
              className="p-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
              title="Approve"
            >
              <Check className="w-4 h-4 text-emerald-500" />
            </button>
          )}
          <button
            onClick={() => handleEdit(parent)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          </button>
          <button
            onClick={() => handleDelete(parent)}
            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </button>
        </div>
      ),
    },
  ];

  if (user?.role !== 'school_admin') {
    return (
      <DashboardLayout title="Parents" subtitle="Manage parent accounts">
        <Card>
          <div className="text-center py-12">
            <Users className="w-12 h-12 mx-auto text-slate-400 mb-4" />
            <p className="text-slate-500">You don't have permission to view this page.</p>
          </div>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Parents" subtitle="Manage parent accounts and approvals">
      <Card>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search parents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Parent
          </Button>
        </div>

        <Table
          data={filteredParents}
          columns={columns}
          keyExtractor={(parent) => parent.id}
          emptyMessage="No parents found"
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingParent(null);
          setFormData({ name: '', email: '', password: '', studentIds: [] });
        }}
        title={editingParent ? 'Edit Parent' : 'Add New Parent'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <Input
            label={editingParent ? 'New Password (leave blank to keep current)' : 'Password'}
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required={!editingParent}
          />
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Link Children
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-3 rounded-xl border border-slate-200 dark:border-slate-700">
              {allStudents.map((student) => (
                <label
                  key={student.id}
                  className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                    formData.studentIds.includes(student.id)
                      ? 'bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.studentIds.includes(student.id)}
                    onChange={() => toggleStudent(student.id)}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs ${student.gender === 'male' ? 'bg-blue-500' : 'bg-pink-500'}`}>
                      {student.name.charAt(0)}
                    </div>
                    <span className="text-sm text-slate-700 dark:text-slate-300">{student.name}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingParent ? 'Update' : 'Add'} Parent
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}

