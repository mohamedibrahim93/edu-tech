'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useAuth } from '@/contexts/AuthContext';
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
  Search
} from 'lucide-react';
import type { School, Teacher, Student, Class, User } from '@/lib/types';

interface SchoolWithStats extends School {
  admin?: User;
  teacherCount: number;
  studentCount: number;
  classCount: number;
}

export default function SchoolsPage() {
  const { user } = useAuth();
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
      // Create admin user for new school
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
    if (confirm('Are you sure you want to delete this school? This will also delete all related data.')) {
      await db.schools.delete(school.id);
      loadData();
    }
  };

  if (user?.role !== 'moe') {
    return (
      <DashboardLayout title="Schools" subtitle="Manage schools">
        <Card>
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 mx-auto text-slate-400 mb-4" />
            <p className="text-slate-500">You don't have permission to view this page.</p>
          </div>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Schools" subtitle="Manage all registered schools">
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search schools..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add School
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredSchools.map((school) => (
          <Card key={school.id} hover>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <Building2 className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-slate-900 dark:text-white">{school.name}</h3>
                  <div className="flex items-center gap-1 text-sm text-slate-500">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate max-w-[200px]">{school.address}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleEdit(school)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                </button>
                <button
                  onClick={() => handleDelete(school)}
                  className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-center">
                <GraduationCap className="w-5 h-5 mx-auto text-blue-500 mb-1" />
                <p className="text-lg font-bold text-blue-600">{school.studentCount}</p>
                <p className="text-xs text-blue-600/70">Students</p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-center">
                <Users className="w-5 h-5 mx-auto text-emerald-500 mb-1" />
                <p className="text-lg font-bold text-emerald-600">{school.teacherCount}</p>
                <p className="text-xs text-emerald-600/70">Teachers</p>
              </div>
              <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-center">
                <BookOpen className="w-5 h-5 mx-auto text-purple-500 mb-1" />
                <p className="text-lg font-bold text-purple-600">{school.classCount}</p>
                <p className="text-xs text-purple-600/70">Classes</p>
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Phone className="w-4 h-4" />
                <span>{school.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Mail className="w-4 h-4" />
                <span>{school.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Admin: {school.admin?.name || 'Not assigned'}</span>
                <Badge variant={school.isActive ? 'success' : 'danger'}>
                  {school.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredSchools.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 mx-auto text-slate-400 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No Schools Found</h3>
            <p className="text-slate-500 mb-4">Get started by adding your first school.</p>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add School
            </Button>
          </div>
        </Card>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingSchool(null);
          setFormData({ name: '', address: '', phone: '', email: '', adminName: '', adminEmail: '', adminPassword: '' });
        }}
        title={editingSchool ? 'Edit School' : 'Add New School'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="pb-4 border-b border-slate-200 dark:border-slate-700">
            <h4 className="font-medium text-slate-900 dark:text-white mb-4">School Information</h4>
            <div className="space-y-4">
              <Input
                label="School Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter school name"
                required
              />
              <Input
                label="Address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Enter school address"
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+971-X-XXX-XXXX"
                  required
                />
                <Input
                  label="Email"
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
              <h4 className="font-medium text-slate-900 dark:text-white mb-4">School Administrator</h4>
              <div className="space-y-4">
                <Input
                  label="Admin Name"
                  value={formData.adminName}
                  onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                  placeholder="Enter admin name"
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Admin Email"
                    type="email"
                    value={formData.adminEmail}
                    onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                    placeholder="admin@school.edu"
                    required
                  />
                  <Input
                    label="Password"
                    type="password"
                    value={formData.adminPassword}
                    onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                    placeholder="Initial password"
                    required
                  />
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingSchool ? 'Update' : 'Add'} School
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}

