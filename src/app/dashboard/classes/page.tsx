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
import { db } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { Plus, BookOpen, Users, GraduationCap, Edit, Trash2 } from 'lucide-react';
import type { Class, Student, Teacher, User } from '@/lib/types';

export default function ClassesPage() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [teacherUsers, setTeacherUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    grade: '',
    mobilityLevel: 'medium' as 'low' | 'medium' | 'high',
  });

  const loadData = async () => {
    if (!user?.schoolId && user?.role !== 'moe') return;
    
    let classesData: Class[] = [];
    let teachersData: Teacher[] = [];
    
    if (user?.role === 'moe') {
      classesData = await db.classes.toArray();
      teachersData = await db.teachers.toArray();
    } else if (user?.schoolId) {
      classesData = await db.classes.where('schoolId').equals(user.schoolId).toArray();
      teachersData = await db.teachers.where('schoolId').equals(user.schoolId).toArray();
    }
    
    setClasses(classesData);
    setTeachers(teachersData);
    
    const classIds = classesData.map(c => c.id);
    const studentsData = await db.students.where('classId').anyOf(classIds).toArray();
    setStudents(studentsData);
    
    const teacherUserIds = teachersData.map(t => t.userId);
    const teacherUsersData = await db.users.where('id').anyOf(teacherUserIds).toArray();
    setTeacherUsers(teacherUsersData);
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const classData: Class = {
      id: editingClass?.id || uuidv4(),
      name: formData.name,
      grade: formData.grade,
      schoolId: user?.schoolId || '',
      mobilityLevel: formData.mobilityLevel,
      createdAt: editingClass?.createdAt || new Date(),
      isActive: true,
    };

    if (editingClass) {
      await db.classes.update(editingClass.id, classData);
    } else {
      await db.classes.add(classData);
    }

    setIsModalOpen(false);
    setEditingClass(null);
    setFormData({ name: '', grade: '', mobilityLevel: 'medium' });
    loadData();
  };

  const handleEdit = (cls: Class) => {
    setEditingClass(cls);
    setFormData({
      name: cls.name,
      grade: cls.grade,
      mobilityLevel: cls.mobilityLevel,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this class?')) {
      await db.classes.delete(id);
      loadData();
    }
  };

  const getStudentCount = (classId: string) => {
    return students.filter(s => s.classId === classId).length;
  };

  return (
    <DashboardLayout title="Classes" subtitle="Manage class records and assignments">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Badge variant="info" size="md">{classes.length} Classes</Badge>
          <Badge variant="success" size="md">{students.length} Students</Badge>
        </div>
        {user?.role === 'school_admin' && (
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Class
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((cls) => {
          const classStudents = students.filter(s => s.classId === cls.id);
          const maleCount = classStudents.filter(s => s.gender === 'male').length;
          const femaleCount = classStudents.filter(s => s.gender === 'female').length;
          
          return (
            <Card key={cls.id} hover>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">{cls.name}</h3>
                    <p className="text-sm text-slate-500">Grade {cls.grade}</p>
                  </div>
                </div>
                {user?.role === 'school_admin' && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(cls)}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    </button>
                    <button
                      onClick={() => handleDelete(cls.id)}
                      className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <GraduationCap className="w-4 h-4" />
                    <span>Students</span>
                  </div>
                  <span className="font-semibold text-slate-900 dark:text-white">{classStudents.length}</span>
                </div>

                <div className="flex gap-2">
                  <div className="flex-1 p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-center">
                    <p className="text-lg font-bold text-blue-600">{maleCount}</p>
                    <p className="text-xs text-blue-600/70">Male</p>
                  </div>
                  <div className="flex-1 p-2 rounded-lg bg-pink-50 dark:bg-pink-900/20 text-center">
                    <p className="text-lg font-bold text-pink-600">{femaleCount}</p>
                    <p className="text-xs text-pink-600/70">Female</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-sm text-slate-500">Mobility Level</span>
                  <Badge 
                    variant={cls.mobilityLevel === 'high' ? 'success' : cls.mobilityLevel === 'medium' ? 'warning' : 'default'}
                    size="sm"
                  >
                    {cls.mobilityLevel.charAt(0).toUpperCase() + cls.mobilityLevel.slice(1)}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Status</span>
                  <Badge variant={cls.isActive ? 'success' : 'danger'} size="sm">
                    {cls.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {classes.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 mx-auto text-slate-400 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No Classes Found</h3>
            <p className="text-slate-500 mb-4">Get started by creating your first class.</p>
            {user?.role === 'school_admin' && (
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Class
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingClass(null);
          setFormData({ name: '', grade: '', mobilityLevel: 'medium' });
        }}
        title={editingClass ? 'Edit Class' : 'Add New Class'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Class Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Grade 10 - Section A"
            required
          />
          <Input
            label="Grade Level"
            value={formData.grade}
            onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
            placeholder="e.g., 10"
            required
          />
          <Select
            label="Mobility Level"
            value={formData.mobilityLevel}
            onChange={(e) => setFormData({ ...formData, mobilityLevel: e.target.value as 'low' | 'medium' | 'high' })}
            options={[
              { value: 'low', label: 'Low' },
              { value: 'medium', label: 'Medium' },
              { value: 'high', label: 'High' },
            ]}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingClass ? 'Update' : 'Add'} Class
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}

