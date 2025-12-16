'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { db } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { 
  Plus, 
  Building2, 
  Users, 
  GraduationCap, 
  BookOpen,
  Phone,
  Mail,
  MapPin,
  Edit,
  Trash2,
  Search,
} from 'lucide-react';
import type { School, User } from '@/lib/types';

interface SchoolWithStats extends School {
  admin?: User;
  teacherCount: number;
  studentCount: number;
  classCount: number;
}

export default function SchoolsPage() {
  const { user } = useAuth();
  const { t, isRTL } = useLanguage();
  const [schools, setSchools] = useState<SchoolWithStats[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
  });

  const loadData = async () => {
    const schoolsData = await db.schools.toArray();
    
    const withStats: SchoolWithStats[] = await Promise.all(
      schoolsData.map(async (school) => {
        const admin = await db.users.get(school.adminId);
        const teachers = await db.teachers.where('schoolId').equals(school.id).toArray();
        const classes = await db.classes.where('schoolId').equals(school.id).toArray();
        const classIds = classes.map(c => c.id);
        const students = classIds.length > 0 
          ? await db.students.where('classId').anyOf(classIds).toArray()
          : [];
        
        return {
          ...school,
          admin,
          teacherCount: teachers.length,
          studentCount: students.length,
          classCount: classes.length,
        };
      })
    );
    
    setSchools(withStats);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredSchools = schools.filter((school) => {
    return school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.address.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const adminId = editingSchool?.adminId || uuidv4();
    const schoolId = editingSchool?.id || uuidv4();
    
    if (!editingSchool) {
      const adminUser: User = {
        id: adminId,
        email: formData.adminEmail,
        password: formData.adminPassword || 'password123',
        name: formData.adminName,
        role: 'school_admin',
        schoolId: schoolId,
        createdAt: new Date(),
        isActive: true,
      };
      await db.users.add(adminUser);
    }
    
    const schoolData: School = {
      id: schoolId,
      name: formData.name,
      address: formData.address,
      phone: formData.phone,
      email: formData.email,
      adminId: adminId,
      createdAt: editingSchool?.createdAt || new Date(),
      isActive: true,
    };

    if (editingSchool) {
      await db.schools.update(editingSchool.id, schoolData);
    } else {
      await db.schools.add(schoolData);
    }

    setIsModalOpen(false);
    setEditingSchool(null);
    setFormData({ name: '', address: '', phone: '', email: '', adminName: '', adminEmail: '', adminPassword: '' });
    loadData();
  };

  const handleEdit = async (school: SchoolWithStats) => {
    setEditingSchool(school);
    setFormData({
      name: school.name,
      address: school.address,
      phone: school.phone,
      email: school.email,
      adminName: school.admin?.name || '',
      adminEmail: school.admin?.email || '',
      adminPassword: '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (school: SchoolWithStats) => {
    if (confirm(isRTL ? 'هل أنت متأكد من حذف هذه المدرسة؟' : 'Are you sure you want to delete this school?')) {
      await db.schools.delete(school.id);
      loadData();
    }
  };

  const totalStudents = schools.reduce((sum, s) => sum + s.studentCount, 0);
  const totalTeachers = schools.reduce((sum, s) => sum + s.teacherCount, 0);
  const totalClasses = schools.reduce((sum, s) => sum + s.classCount, 0);

  if (user?.role !== 'moe') {
    return (
      <DashboardLayout title={t('schools.title')} subtitle={isRTL ? 'الوصول مرفوض' : 'Access Denied'}>
        <Card>
          <CardContent className="p-16 text-center">
            <Building2 className="w-12 h-12 mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500">
              {isRTL ? 'ليس لديك صلاحية لعرض هذه الصفحة.' : "You don't have permission to view this page."}
            </p>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={t('schools.title')} subtitle={t('schools.subtitle')}>
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard icon={Building2} label={t('dashboard.totalSchools')} value={schools.length} color="purple" isRTL={isRTL} />
        <StatCard icon={GraduationCap} label={t('dashboard.totalStudents')} value={totalStudents} color="blue" isRTL={isRTL} />
        <StatCard icon={Users} label={t('dashboard.totalTeachers')} value={totalTeachers} color="emerald" isRTL={isRTL} />
        <StatCard icon={BookOpen} label={t('dashboard.activeClasses')} value={totalClasses} color="pink" isRTL={isRTL} />
      </div>

      {/* Main Content */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className={`flex flex-col md:flex-row gap-4 items-start md:items-center justify-between ${isRTL ? 'md:flex-row-reverse' : ''}`}>
            <div className="relative flex-1 max-w-md">
              <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400`} />
              <input
                type="text"
                placeholder={`${t('common.search')}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10`}
              />
            </div>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {t('schools.addSchool')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Schools Grid */}
      {filteredSchools.length === 0 ? (
        <Card>
          <CardContent className="p-16 text-center">
            <Building2 className="w-12 h-12 mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">{t('schools.noSchools')}</h3>
            <p className="text-slate-500 mb-6">{isRTL ? 'ابدأ بإضافة أول مدرسة.' : 'Get started by adding your first school.'}</p>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {t('schools.addSchool')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredSchools.map((school) => (
            <Card key={school.id} hover>
              <CardContent className="p-6">
                <div className={`flex items-start justify-between mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                      <Building2 className="w-7 h-7 text-white" />
                    </div>
                    <div className={isRTL ? 'text-right' : ''}>
                      <h3 className="font-bold text-lg text-slate-900">{school.name}</h3>
                      <div className={`flex items-center gap-1 text-sm text-slate-500 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <MapPin className="w-4 h-4" />
                        <span className="truncate max-w-[200px]">{school.address}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(school)}
                      className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4 text-slate-400" />
                    </button>
                    <button
                      onClick={() => handleDelete(school)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="p-3 rounded-lg bg-blue-50 text-center">
                    <GraduationCap className="w-5 h-5 mx-auto text-blue-600 mb-1" />
                    <p className="text-lg font-bold text-blue-600">{school.studentCount}</p>
                    <p className="text-xs text-blue-600/70">{t('nav.students')}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-emerald-50 text-center">
                    <Users className="w-5 h-5 mx-auto text-emerald-600 mb-1" />
                    <p className="text-lg font-bold text-emerald-600">{school.teacherCount}</p>
                    <p className="text-xs text-emerald-600/70">{t('nav.teachers')}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-purple-50 text-center">
                    <BookOpen className="w-5 h-5 mx-auto text-purple-600 mb-1" />
                    <p className="text-lg font-bold text-purple-600">{school.classCount}</p>
                    <p className="text-xs text-purple-600/70">{t('nav.classes')}</p>
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-slate-100">
                  <div className={`flex items-center gap-2 text-sm text-slate-600 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Phone className="w-4 h-4 text-slate-400" />
                    {school.phone}
                  </div>
                  <div className={`flex items-center gap-2 text-sm text-slate-600 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Mail className="w-4 h-4 text-slate-400" />
                    {school.email}
                  </div>
                  <div className={`flex items-center justify-between pt-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span className="text-sm text-slate-500">
                      {isRTL ? 'المدير:' : 'Admin:'} {school.admin?.name || (isRTL ? 'غير معين' : 'Not assigned')}
                    </span>
                    <Badge variant={school.isActive ? 'success' : 'danger'} size="sm">
                      {school.isActive ? t('common.active') : t('common.inactive')}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingSchool(null);
          setFormData({ name: '', address: '', phone: '', email: '', adminName: '', adminEmail: '', adminPassword: '' });
        }}
        title={editingSchool ? t('schools.editSchool') : t('schools.addSchool')}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="pb-4 border-b border-slate-200">
            <h4 className={`font-semibold text-slate-900 mb-4 ${isRTL ? 'text-right' : ''}`}>
              {isRTL ? 'معلومات المدرسة' : 'School Information'}
            </h4>
            <div className="space-y-4">
              <Input
                label={t('schools.schoolName')}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={isRTL ? 'أدخل اسم المدرسة' : 'Enter school name'}
                required
              />
              <Input
                label={t('common.address')}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder={isRTL ? 'أدخل عنوان المدرسة' : 'Enter school address'}
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label={t('common.phone')}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+971-X-XXX-XXXX"
                  required
                />
                <Input
                  label={t('common.email')}
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="school@example.edu"
                  required
                />
              </div>
            </div>
          </div>
          
          {!editingSchool && (
            <div>
              <h4 className={`font-semibold text-slate-900 mb-4 ${isRTL ? 'text-right' : ''}`}>
                {isRTL ? 'مدير المدرسة' : 'School Administrator'}
              </h4>
              <div className="space-y-4">
                <Input
                  label={isRTL ? 'اسم المدير' : 'Admin Name'}
                  value={formData.adminName}
                  onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                  placeholder={isRTL ? 'أدخل اسم المدير' : 'Enter admin name'}
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label={isRTL ? 'بريد المدير' : 'Admin Email'}
                    type="email"
                    value={formData.adminEmail}
                    onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                    placeholder="admin@school.edu"
                    required
                  />
                  <Input
                    label={t('auth.password')}
                    type="password"
                    value={formData.adminPassword}
                    onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                    placeholder={isRTL ? 'كلمة المرور الأولية' : 'Initial password'}
                    required
                  />
                </div>
              </div>
            </div>
          )}
          
          <div className={`flex gap-3 pt-4 ${isRTL ? 'flex-row-reverse justify-start' : 'justify-end'}`}>
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit">
              {editingSchool ? t('common.update') : t('common.add')} {isRTL ? 'المدرسة' : 'School'}
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}

function StatCard({ icon: Icon, label, value, color, isRTL }: { icon: React.ElementType; label: string; value: number; color: string; isRTL: boolean }) {
  const colors: Record<string, string> = {
    purple: 'from-purple-600 to-pink-600',
    blue: 'from-blue-600 to-cyan-600',
    emerald: 'from-emerald-600 to-teal-600',
    pink: 'from-pink-600 to-rose-600',
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className={`p-3 rounded-xl bg-gradient-to-br ${colors[color]}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div className={isRTL ? 'text-right' : ''}>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            <p className="text-sm text-slate-500">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
