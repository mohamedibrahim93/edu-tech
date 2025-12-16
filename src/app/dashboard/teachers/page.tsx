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
import { Plus, Search, Edit, Trash2, UserCheck, BookOpen, Shield } from 'lucide-react';
import type { Teacher, User, School } from '@/lib/types';

interface TeacherWithUser extends Teacher {
  user?: User;
  school?: School;
}

export default function TeachersPage() {
  const { user } = useAuth();
  const [teachers, setTeachers] = useState<TeacherWithUser[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<TeacherWithUser | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    subjects: '',
    isSupervisor: false,
  });

  const loadData = async () => {
    let teachersData: Teacher[] = [];
    let schoolsData: School[] = [];
    
    if (user?.role === 'moe') {
      teachersData = await db.teachers.toArray();
      schoolsData = await db.schools.toArray();
    } else if (user?.schoolId) {
      teachersData = await db.teachers.where('schoolId').equals(user.schoolId).toArray();
      const school = await db.schools.get(user.schoolId);
      if (school) schoolsData = [school];
    }
    
    setSchools(schoolsData);
    
    // Get user info for each teacher
    const teachersWithUsers: TeacherWithUser[] = await Promise.all(
      teachersData.map(async (teacher) => {
        const teacherUser = await db.users.get(teacher.userId);
        const school = schoolsData.find(s => s.id === teacher.schoolId);
        return { ...teacher, user: teacherUser, school };
      })
    );
    
    setTeachers(teachersWithUsers);
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const filteredTeachers = teachers.filter((teacher) => {
    return teacher.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.user?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.subjects.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const userId = editingTeacher?.userId || uuidv4();
    const teacherId = editingTeacher?.id || uuidv4();
    
    const userData: User = {
      id: userId,
      email: formData.email,
      password: formData.password || editingTeacher?.user?.password || 'password123',
      name: formData.name,
      role: 'teacher',
      schoolId: user?.schoolId,
      createdAt: editingTeacher?.user?.createdAt || new Date(),
      isActive: true,
    };

    const teacherData: Teacher = {
      id: teacherId,
      userId: userId,
      schoolId: user?.schoolId || '',
      subjects: formData.subjects.split(',').map(s => s.trim()).filter(s => s),
      isSupervisor: formData.isSupervisor,
      createdAt: editingTeacher?.createdAt || new Date(),
      isActive: true,
    };

    if (editingTeacher) {
      await db.users.update(userId, userData);
      await db.teachers.update(teacherId, {
        userId: teacherData.userId,
        schoolId: teacherData.schoolId,
        subjects: teacherData.subjects,
        isSupervisor: teacherData.isSupervisor,
        createdAt: teacherData.createdAt,
        isActive: teacherData.isActive,
      });
    } else {
      await db.users.add(userData);
      await db.teachers.add(teacherData);
    }

    setIsModalOpen(false);
    setEditingTeacher(null);
    setFormData({ name: '', email: '', password: '', subjects: '', isSupervisor: false });
    loadData();
  };

  const handleEdit = (teacher: TeacherWithUser) => {
    setEditingTeacher(teacher);
    setFormData({
      name: teacher.user?.name || '',
      email: teacher.user?.email || '',
      password: '',
      subjects: teacher.subjects.join(', '),
      isSupervisor: teacher.isSupervisor,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (teacher: TeacherWithUser) => {
    if (confirm('Are you sure you want to delete this teacher?')) {
      await db.teachers.delete(teacher.id);
      await db.users.delete(teacher.userId);
      loadData();
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Teacher',
      render: (teacher: TeacherWithUser) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-semibold">
            {teacher.user?.name.charAt(0) || 'T'}
          </div>
          <div>
            <p className="font-medium text-slate-900">{teacher.user?.name}</p>
            <p className="text-sm text-slate-500">{teacher.user?.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'subjects',
      header: 'Subjects',
      render: (teacher: TeacherWithUser) => (
        <div className="flex flex-wrap gap-1">
          {teacher.subjects.slice(0, 3).map((subject) => (
            <Badge key={subject} variant="purple" size="sm">{subject}</Badge>
          ))}
          {teacher.subjects.length > 3 && (
            <Badge variant="default" size="sm">+{teacher.subjects.length - 3}</Badge>
          )}
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (teacher: TeacherWithUser) => (
        <Badge variant={teacher.isSupervisor ? 'success' : 'default'}>
          {teacher.isSupervisor ? (
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3" />
              Supervisor
            </span>
          ) : 'Teacher'}
        </Badge>
      ),
    },
    {
      key: 'school',
      header: 'School',
      render: (teacher: TeacherWithUser) => (
        <span className="text-sm">{teacher.school?.name || 'N/A'}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (teacher: TeacherWithUser) => (
        <Badge variant={teacher.isActive ? 'success' : 'danger'}>
          {teacher.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (teacher: TeacherWithUser) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleEdit(teacher)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4 text-slate-600" />
          </button>
          <button
            onClick={() => handleDelete(teacher)}
            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout title="Teachers" subtitle="Manage teacher accounts and assignments">
      <Card className="p-4 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search teachers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
            />
          </div>
          {user?.role === 'school_admin' && (
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Teacher
            </Button>
          )}
        </div>

        <Table
          data={filteredTeachers}
          columns={columns}
          keyExtractor={(teacher) => teacher.id}
          emptyMessage="No teachers found"
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTeacher(null);
          setFormData({ name: '', email: '', password: '', subjects: '', isSupervisor: false });
        }}
        title={editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}
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
            label={editingTeacher ? 'New Password (leave blank to keep current)' : 'Password'}
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required={!editingTeacher}
          />
          <Input
            label="Subjects (comma separated)"
            value={formData.subjects}
            onChange={(e) => setFormData({ ...formData, subjects: e.target.value })}
            placeholder="Math, Physics, Chemistry"
            required
          />
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isSupervisor}
              onChange={(e) => setFormData({ ...formData, isSupervisor: e.target.checked })}
              className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
            />
            <span className="text-sm text-slate-700">Is Supervisor</span>
          </label>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingTeacher ? 'Update' : 'Add'} Teacher
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}

