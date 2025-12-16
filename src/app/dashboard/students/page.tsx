'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/Card';
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
  Search, 
  Edit, 
  Trash2, 
  GraduationCap, 
  User, 
  Calendar, 
  BookOpen, 
  MoreVertical,
  Users,
} from 'lucide-react';
import type { Student, Class } from '@/lib/types';

export default function StudentsPage() {
  const { user } = useAuth();
  const { t, isRTL, language } = useLanguage();
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  
  const dateLocale = language === 'ar' ? ar : enUS;
  
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
    if (confirm(isRTL ? 'هل أنت متأكد من حذف هذا الطالب؟' : 'Are you sure you want to delete this student?')) {
      await db.students.delete(id);
      loadData();
    }
  };

  const getClassName = (classId: string) => {
    return classes.find(c => c.id === classId)?.name || (isRTL ? 'غير معروف' : 'Unknown');
  };

  const maleCount = students.filter(s => s.gender === 'male').length;
  const femaleCount = students.filter(s => s.gender === 'female').length;

  return (
    <DashboardLayout title={t('students.title')} subtitle={t('students.subtitle')}>
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
        <StatCard icon={GraduationCap} label={t('students.totalStudents')} value={students.length} color="purple" isRTL={isRTL} />
        <StatCard icon={User} label={t('students.maleStudents')} value={maleCount} color="blue" isRTL={isRTL} />
        <StatCard icon={Users} label={t('students.femaleStudents')} value={femaleCount} color="pink" isRTL={isRTL} />
        <StatCard icon={BookOpen} label={t('nav.classes')} value={classes.length} color="emerald" isRTL={isRTL} />
      </div>

      {/* Main Content */}
      <Card>
        <CardContent className="p-3 sm:p-4 lg:p-6">
          {/* Header */}
          <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className={`flex flex-col sm:flex-row gap-3 flex-1 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
              <div className="relative flex-1">
                <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400`} />
                <input
                  type="text"
                  placeholder={`${t('common.search')}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all`}
                />
              </div>
              <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  options={[
                    { value: 'all', label: isRTL ? 'جميع الفصول' : 'All Classes' },
                    ...classes.map(c => ({ value: c.id, label: c.name })),
                  ]}
                  className="flex-1 sm:w-44"
                />
                {(user?.role === 'school_admin' || user?.role === 'teacher') && (
                  <Button onClick={() => setIsModalOpen(true)} className="whitespace-nowrap">
                    <Plus className={`w-4 h-4 ${isRTL ? 'sm:ml-2' : 'sm:mr-2'}`} />
                    <span className="hidden sm:inline">{t('students.addStudent')}</span>
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Students Grid */}
          {filteredStudents.length === 0 ? (
            <div className="text-center py-12 sm:py-16">
              <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                <GraduationCap className="w-7 h-7 sm:w-8 sm:h-8 text-purple-600" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-2">{t('students.noStudents')}</h3>
              <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto px-4">{t('students.noStudentsDesc')}</p>
              {(user?.role === 'school_admin' || user?.role === 'teacher') && (
                <Button onClick={() => setIsModalOpen(true)}>
                  <Plus className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {t('students.addStudent')}
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
              {filteredStudents.map((student) => (
                <div
                  key={student.id}
                  className="p-4 sm:p-5 rounded-2xl border border-slate-200 hover:border-purple-200 hover:shadow-lg hover:shadow-purple-500/5 transition-all duration-300 group bg-white"
                >
                  <div className={`flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-lg flex-shrink-0 ${
                      student.gender === 'male' 
                        ? 'bg-gradient-to-br from-blue-500 to-cyan-500 shadow-blue-500/25' 
                        : 'bg-gradient-to-br from-pink-500 to-rose-500 shadow-pink-500/25'
                    }`}>
                      {student.name.charAt(0)}
                    </div>
                    <div className={`flex-1 min-w-0 ${isRTL ? 'text-right' : ''}`}>
                      <h3 className="font-bold text-slate-900 truncate text-sm sm:text-base">{student.name}</h3>
                      <p className="text-xs sm:text-sm text-slate-500">{student.studentNumber}</p>
                    </div>
                    <button className="opacity-0 group-hover:opacity-100 p-1.5 sm:p-2 hover:bg-slate-100 rounded-xl transition-all flex-shrink-0">
                      <MoreVertical className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>

                  <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
                    <div className={`flex items-center gap-2 text-xs sm:text-sm text-slate-600 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{getClassName(student.classId)}</span>
                    </div>
                    <div className={`flex items-center gap-2 text-xs sm:text-sm text-slate-600 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 flex-shrink-0" />
                      {format(new Date(student.dateOfBirth), 'MMM d, yyyy', { locale: dateLocale })}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-3 sm:mb-4">
                    <Badge variant={student.gender === 'male' ? 'info' : 'purple'} size="sm">
                      {student.gender === 'male' ? t('students.male') : t('students.female')}
                    </Badge>
                    <Badge variant={student.isActive ? 'success' : 'danger'} size="sm">
                      {student.isActive ? t('common.active') : t('common.inactive')}
                    </Badge>
                  </div>

                  <div className={`flex items-center gap-2 pt-3 sm:pt-4 border-t border-slate-100 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <button
                      onClick={() => handleEdit(student)}
                      className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-2 text-xs sm:text-sm font-semibold text-purple-600 hover:bg-purple-50 rounded-xl transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}
                    >
                      <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      {t('common.edit')}
                    </button>
                    <button
                      onClick={() => handleDelete(student.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingStudent(null);
          setFormData({ name: '', studentNumber: '', classId: '', dateOfBirth: '', gender: 'male' });
        }}
        title={editingStudent ? t('students.editStudent') : t('students.addStudent')}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t('students.fullName')}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder={isRTL ? 'أدخل اسم الطالب الكامل' : "Enter student's full name"}
            required
          />
          <Input
            label={t('students.studentNumber')}
            value={formData.studentNumber}
            onChange={(e) => setFormData({ ...formData, studentNumber: e.target.value })}
            placeholder="STU-2024-XXX"
            required
          />
          <Select
            label={t('students.class')}
            value={formData.classId}
            onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
            options={[
              { value: '', label: t('students.selectClass') },
              ...classes.map(c => ({ value: c.id, label: c.name })),
            ]}
            required
          />
          <Input
            label={t('students.dateOfBirth')}
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
            required
          />
          <Select
            label={t('students.gender')}
            value={formData.gender}
            onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'male' | 'female' })}
            options={[
              { value: 'male', label: t('students.male') },
              { value: 'female', label: t('students.female') },
            ]}
          />
          <div className={`flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit">
              {editingStudent ? t('common.update') : t('common.add')} {t('nav.students')}
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}

function StatCard({ icon: Icon, label, value, color, isRTL }: { icon: React.ElementType; label: string; value: number; color: string; isRTL: boolean }) {
  const colors: Record<string, string> = {
    purple: 'from-purple-600 to-pink-600 shadow-purple-500/25',
    blue: 'from-blue-600 to-cyan-600 shadow-blue-500/25',
    emerald: 'from-emerald-600 to-teal-600 shadow-emerald-500/25',
    pink: 'from-pink-600 to-rose-600 shadow-pink-500/25',
  };

  return (
    <Card>
      <CardContent className="p-3 sm:p-4 lg:p-6">
        <div className={`flex items-center gap-3 sm:gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className={`p-2 sm:p-2.5 lg:p-3 rounded-xl bg-gradient-to-br ${colors[color]} shadow-lg flex-shrink-0`}>
            <Icon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
          </div>
          <div className={`min-w-0 ${isRTL ? 'text-right' : ''}`}>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">{value}</p>
            <p className="text-xs sm:text-sm text-slate-500 truncate">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
