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
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import type { Student, Class, User } from '@/lib/types';

export default function StudentsPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    studentNumber: '',
    classId: '',
    dateOfBirth: '',
    gender: 'male' as 'male' | 'female',
  });

  const loadData = async () => {
    if (!user?.schoolId && user?.role !== 'moe') return;
    
    let classesData: Class[] = [];
    if (user?.role === 'moe') {
      classesData = await db.classes.toArray();
    } else if (user?.schoolId) {
      classesData = await db.classes.where('schoolId').equals(user.schoolId).toArray();
    }
    setClasses(classesData);
    
    const classIds = classesData.map(c => c.id);
    const studentsData = await db.students.where('classId').anyOf(classIds).toArray();
    setStudents(studentsData);
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const filteredStudents = students.filter((student) => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = selectedClass === 'all' || student.classId === selectedClass;
    return matchesSearch && matchesClass;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const studentData: Student = {
      id: editingStudent?.id || uuidv4(),
      name: formData.name,
      studentNumber: formData.studentNumber,
      classId: formData.classId,
      dateOfBirth: new Date(formData.dateOfBirth),
      gender: formData.gender,
      createdAt: editingStudent?.createdAt || new Date(),
      isActive: true,
    };

    if (editingStudent) {
      await db.students.update(editingStudent.id, studentData);
    } else {
      await db.students.add(studentData);
    }

    setIsModalOpen(false);
    setEditingStudent(null);
    setFormData({ name: '', studentNumber: '', classId: '', dateOfBirth: '', gender: 'male' });
    loadData();
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      studentNumber: student.studentNumber,
      classId: student.classId,
      dateOfBirth: format(new Date(student.dateOfBirth), 'yyyy-MM-dd'),
      gender: student.gender,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this student?')) {
      await db.students.delete(id);
      loadData();
    }
  };

  const getClassName = (classId: string) => {
    return classes.find(c => c.id === classId)?.name || 'Unknown';
  };

  const columns = [
    {
      key: 'name',
      header: 'Student',
      render: (student: Student) => (
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${student.gender === 'male' ? 'bg-blue-500' : 'bg-pink-500'}`}>
            {student.name.charAt(0)}
          </div>
          <div>
            <p className="font-medium text-slate-900 dark:text-white">{student.name}</p>
            <p className="text-sm text-slate-500">{student.studentNumber}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'class',
      header: 'Class',
      render: (student: Student) => (
        <Badge variant="info">{getClassName(student.classId)}</Badge>
      ),
    },
    {
      key: 'gender',
      header: 'Gender',
      render: (student: Student) => (
        <Badge variant={student.gender === 'male' ? 'info' : 'purple'}>
          {student.gender.charAt(0).toUpperCase() + student.gender.slice(1)}
        </Badge>
      ),
    },
    {
      key: 'dateOfBirth',
      header: 'Date of Birth',
      render: (student: Student) => format(new Date(student.dateOfBirth), 'MMM d, yyyy'),
    },
    {
      key: 'status',
      header: 'Status',
      render: (student: Student) => (
        <Badge variant={student.isActive ? 'success' : 'danger'}>
          {student.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (student: Student) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleEdit(student)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          </button>
          <button
            onClick={() => handleDelete(student.id)}
            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout title="Students" subtitle="Manage student records">
      <Card>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
            <Select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              options={[
                { value: 'all', label: 'All Classes' },
                ...classes.map(c => ({ value: c.id, label: c.name })),
              ]}
              className="w-full md:w-48"
            />
          </div>
          {(user?.role === 'school_admin' || user?.role === 'teacher') && (
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Student
            </Button>
          )}
        </div>

        <Table
          data={filteredStudents}
          columns={columns}
          keyExtractor={(student) => student.id}
          emptyMessage="No students found"
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingStudent(null);
          setFormData({ name: '', studentNumber: '', classId: '', dateOfBirth: '', gender: 'male' });
        }}
        title={editingStudent ? 'Edit Student' : 'Add New Student'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="Student Number"
            value={formData.studentNumber}
            onChange={(e) => setFormData({ ...formData, studentNumber: e.target.value })}
            placeholder="STU-2024-XXX"
            required
          />
          <Select
            label="Class"
            value={formData.classId}
            onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
            options={[
              { value: '', label: 'Select a class' },
              ...classes.map(c => ({ value: c.id, label: c.name })),
            ]}
            required
          />
          <Input
            label="Date of Birth"
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
            required
          />
          <Select
            label="Gender"
            value={formData.gender}
            onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'male' | 'female' })}
            options={[
              { value: 'male', label: 'Male' },
              { value: 'female', label: 'Female' },
            ]}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingStudent ? 'Update' : 'Add'} Student
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}

