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
import { useLanguage } from '@/contexts/LanguageContext';
import { db } from '@/lib/db';
import { format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { v4 as uuidv4 } from 'uuid';
import { Plus, Search, Edit, Trash2, Check, X, Users, GraduationCap } from 'lucide-react';
import type { Parent, User, Student } from '@/lib/types';

interface ParentWithDetails extends Parent {
  user?: User;
  students: Student[];
}

export default function ParentsPage() {
  const { user } = useAuth();
  const { t, isRTL, language } = useLanguage();
  const [parents, setParents] = useState<ParentWithDetails[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingParent, setEditingParent] = useState<ParentWithDetails | null>(null);
  
  const dateLocale = language === 'ar' ? ar : enUS;
  
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
      await db.parents.update(parentId, {
        userId: parentData.userId,
        studentIds: parentData.studentIds,
        isApproved: parentData.isApproved,
        createdAt: parentData.createdAt,
      });
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
    if (confirm(isRTL ? 'هل أنت متأكد من حذف حساب ولي الأمر هذا؟' : 'Are you sure you want to delete this parent account?')) {
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
      header: t('role.parent'),
      render: (parent: ParentWithDetails) => (
        <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-semibold">
            {parent.user?.name.charAt(0) || 'P'}
          </div>
          <div className={isRTL ? 'text-right' : ''}>
            <p className="font-medium text-slate-900">{parent.user?.name}</p>
            <p className="text-sm text-slate-500">{parent.user?.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'children',
      header: isRTL ? 'الأبناء' : 'Children',
      render: (parent: ParentWithDetails) => (
        <div className="flex flex-wrap gap-1">
          {parent.students.map((student) => (
            <Badge key={student.id} variant="info" size="sm">{student.name}</Badge>
          ))}
          {parent.students.length === 0 && (
            <span className="text-sm text-slate-500">{t('parents.noChildren')}</span>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: t('common.status'),
      render: (parent: ParentWithDetails) => (
        <Badge variant={parent.isApproved ? 'success' : 'warning'}>
          {parent.isApproved ? t('parents.approved') : t('parents.pending')}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      header: isRTL ? 'تاريخ التسجيل' : 'Registered',
      render: (parent: ParentWithDetails) => format(new Date(parent.createdAt), 'MMM d, yyyy', { locale: dateLocale }),
    },
    {
      key: 'actions',
      header: t('common.actions'),
      render: (parent: ParentWithDetails) => (
        <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          {!parent.isApproved && (
            <button
              onClick={() => handleApprove(parent)}
              className="p-2 hover:bg-emerald-50 rounded-lg transition-colors"
              title={isRTL ? 'موافقة' : 'Approve'}
            >
              <Check className="w-4 h-4 text-emerald-500" />
            </button>
          )}
          <button
            onClick={() => handleEdit(parent)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4 text-slate-600" />
          </button>
          <button
            onClick={() => handleDelete(parent)}
            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </button>
        </div>
      ),
    },
  ];

  if (user?.role !== 'school_admin') {
    return (
      <DashboardLayout title={t('parents.title')} subtitle={t('parents.subtitle')}>
        <Card className="p-4 sm:p-6">
          <div className="text-center py-12">
            <Users className="w-12 h-12 mx-auto text-slate-400 mb-4" />
            <p className="text-slate-500">
              {isRTL ? 'ليس لديك صلاحية لعرض هذه الصفحة.' : "You don't have permission to view this page."}
            </p>
          </div>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={t('parents.title')} subtitle={t('parents.subtitle')}>
      <Card className="p-4 sm:p-6">
        <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 ${isRTL ? 'md:flex-row-reverse' : ''}`}>
          <div className="relative flex-1 max-w-md">
            <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400`} />
            <input
              type="text"
              placeholder={`${t('common.search')}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all`}
            />
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t('parents.addParent')}
          </Button>
        </div>

        <Table
          data={filteredParents}
          columns={columns}
          keyExtractor={(parent) => parent.id}
          emptyMessage={isRTL ? 'لا يوجد أولياء أمور' : 'No parents found'}
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
        title={editingParent ? t('parents.editParent') : t('parents.addParent')}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t('students.fullName')}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label={t('common.email')}
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <Input
            label={editingParent 
              ? (isRTL ? 'كلمة المرور الجديدة (اتركها فارغة للإبقاء على الحالية)' : 'New Password (leave blank to keep current)') 
              : t('auth.password')}
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required={!editingParent}
          />
          
          <div>
            <label className={`block text-sm font-semibold text-slate-700 mb-2 ${isRTL ? 'text-right' : ''}`}>
              {t('parents.linkChildren')}
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-3 rounded-xl border border-slate-200">
              {allStudents.map((student) => (
                <label
                  key={student.id}
                  className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${isRTL ? 'flex-row-reverse' : ''} ${
                    formData.studentIds.includes(student.id)
                      ? 'bg-purple-50 border border-purple-200'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.studentIds.includes(student.id)}
                    onChange={() => toggleStudent(student.id)}
                    className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                  />
                  <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs ${student.gender === 'male' ? 'bg-blue-500' : 'bg-pink-500'}`}>
                      {student.name.charAt(0)}
                    </div>
                    <span className="text-sm text-slate-700">{student.name}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
          
          <div className={`flex justify-end gap-3 pt-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit">
              {editingParent ? t('common.update') : t('common.add')} {t('role.parent')}
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
