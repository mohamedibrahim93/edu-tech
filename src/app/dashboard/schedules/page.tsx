'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { Plus, Calendar, Clock, BookOpen, User, Trash2 } from 'lucide-react';
import type { Schedule, Class, Subject, Teacher, User as UserType } from '@/lib/types';

interface ScheduleWithDetails extends Schedule {
  class?: Class;
  subject?: Subject;
  teacher?: Teacher;
  teacherUser?: UserType;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TIME_SLOTS = [
  '07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00'
];

export default function SchedulesPage() {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<ScheduleWithDetails[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [teacherUsers, setTeacherUsers] = useState<UserType[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    classId: '',
    subjectId: '',
    teacherId: '',
    dayOfWeek: 1,
    startTime: '08:00',
    endTime: '09:00',
  });

  const loadData = async () => {
    if (!user?.schoolId) return;
    
    const [classesData, subjectsData, teachersData] = await Promise.all([
      db.classes.where('schoolId').equals(user.schoolId).toArray(),
      db.subjects.where('schoolId').equals(user.schoolId).toArray(),
      db.teachers.where('schoolId').equals(user.schoolId).toArray(),
    ]);
    
    setClasses(classesData);
    setSubjects(subjectsData);
    setTeachers(teachersData);
    
    if (classesData.length > 0 && !selectedClass) {
      setSelectedClass(classesData[0].id);
    }
    
    const teacherUserIds = teachersData.map(t => t.userId);
    const usersData = await db.users.where('id').anyOf(teacherUserIds).toArray();
    setTeacherUsers(usersData);
    
    // Load schedules
    let schedulesData: Schedule[] = [];
    if (selectedClass) {
      schedulesData = await db.schedules.where('classId').equals(selectedClass).toArray();
    } else {
      schedulesData = await db.schedules.toArray();
    }
    
    const withDetails: ScheduleWithDetails[] = await Promise.all(
      schedulesData.map(async (schedule) => {
        const classData = classesData.find(c => c.id === schedule.classId);
        const subject = subjectsData.find(s => s.id === schedule.subjectId);
        const teacher = teachersData.find(t => t.id === schedule.teacherId);
        const teacherUser = usersData.find(u => u.id === teacher?.userId);
        return { ...schedule, class: classData, subject, teacher, teacherUser };
      })
    );
    
    setSchedules(withDetails);
  };

  useEffect(() => {
    loadData();
  }, [user, selectedClass]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const scheduleData: Schedule = {
      id: uuidv4(),
      classId: formData.classId,
      subjectId: formData.subjectId,
      teacherId: formData.teacherId,
      dayOfWeek: formData.dayOfWeek,
      startTime: formData.startTime,
      endTime: formData.endTime,
    };

    await db.schedules.add(scheduleData);
    setIsModalOpen(false);
    setFormData({ classId: '', subjectId: '', teacherId: '', dayOfWeek: 1, startTime: '08:00', endTime: '09:00' });
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this schedule entry?')) {
      await db.schedules.delete(id);
      loadData();
    }
  };

  const getTeacherName = (teacherId: string) => {
    const teacher = teachers.find(t => t.id === teacherId);
    const teacherUser = teacherUsers.find(u => u.id === teacher?.userId);
    return teacherUser?.name || 'Unknown';
  };

  // Group schedules by day
  const schedulesByDay = DAYS.map((day, index) => ({
    day,
    dayIndex: index,
    schedules: schedules
      .filter(s => s.dayOfWeek === index)
      .sort((a, b) => a.startTime.localeCompare(b.startTime)),
  }));

  const getSubjectColor = (subjectId: string) => {
    const colors = [
      'bg-blue-100 text-blue-700',
      'bg-purple-100 text-purple-700',
      'bg-emerald-100 text-emerald-700',
      'bg-amber-100 text-amber-700',
      'bg-pink-100 text-pink-700',
      'bg-cyan-100 text-cyan-700',
    ];
    const index = subjects.findIndex(s => s.id === subjectId);
    return colors[index % colors.length];
  };

  return (
    <DashboardLayout title="Schedules" subtitle="Manage class schedules">
      <Card className="mb-6 p-4 sm:p-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <Select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            options={classes.map(c => ({ value: c.id, label: c.name }))}
            className="w-64"
          />
          {user?.role === 'school_admin' && (
            <Button onClick={() => {
              setFormData({ ...formData, classId: selectedClass });
              setIsModalOpen(true);
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Schedule
            </Button>
          )}
        </div>
      </Card>

      {/* Weekly Schedule Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {schedulesByDay.filter(d => d.dayIndex >= 0 && d.dayIndex <= 4).map(({ day, dayIndex, schedules: daySchedules }) => (
          <Card key={day}>
            <CardHeader title={day} subtitle={`${daySchedules.length} classes`} />
            <div className="space-y-2 px-4 sm:px-6 pb-4 sm:pb-6">
              {daySchedules.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">No classes</p>
              ) : (
                daySchedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    className={`p-3 rounded-xl ${getSubjectColor(schedule.subjectId)} relative group`}
                  >
                    {user?.role === 'school_admin' && (
                      <button
                        onClick={() => handleDelete(schedule.id)}
                        className="absolute top-2 right-2 p-1 rounded-lg bg-white/50 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3 h-3 text-red-500" />
                      </button>
                    )}
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-3 h-3" />
                      <span className="text-xs font-medium">
                        {schedule.startTime} - {schedule.endTime}
                      </span>
                    </div>
                    <p className="font-medium">{schedule.subject?.name}</p>
                    <div className="flex items-center gap-1 mt-1 text-xs opacity-75">
                      <User className="w-3 h-3" />
                      <span>{schedule.teacherUser?.name}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Subjects Legend */}
      <Card className="mt-6">
        <CardHeader title="Subjects" subtitle="Color legend" />
        <div className="flex flex-wrap gap-2 px-4 sm:px-6 pb-4 sm:pb-6">
          {subjects.map((subject) => (
            <div
              key={subject.id}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${getSubjectColor(subject.id)}`}
            >
              {subject.name}
            </div>
          ))}
        </div>
      </Card>

      {/* Add Schedule Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setFormData({ classId: '', subjectId: '', teacherId: '', dayOfWeek: 1, startTime: '08:00', endTime: '09:00' });
        }}
        title="Add Schedule Entry"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
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
          <Select
            label="Subject"
            value={formData.subjectId}
            onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
            options={[
              { value: '', label: 'Select a subject' },
              ...subjects.map(s => ({ value: s.id, label: s.name })),
            ]}
            required
          />
          <Select
            label="Teacher"
            value={formData.teacherId}
            onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
            options={[
              { value: '', label: 'Select a teacher' },
              ...teachers.map(t => ({ value: t.id, label: getTeacherName(t.id) })),
            ]}
            required
          />
          <Select
            label="Day of Week"
            value={formData.dayOfWeek.toString()}
            onChange={(e) => setFormData({ ...formData, dayOfWeek: parseInt(e.target.value) })}
            options={DAYS.map((day, i) => ({ value: i.toString(), label: day }))}
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Start Time"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              options={TIME_SLOTS.map(t => ({ value: t, label: t }))}
            />
            <Select
              label="End Time"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              options={TIME_SLOTS.map(t => ({ value: t, label: t }))}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Add Schedule
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}

