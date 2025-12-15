'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/db';
import { format, addDays, subDays } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  Save,
  AlertTriangle,
} from 'lucide-react';
import type { Class, Student, Attendance, Subject, Teacher } from '@/lib/types';

type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export default function AttendancePage() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [attendanceRecords, setAttendanceRecords] = useState<Map<string, AttendanceStatus>>(new Map());
  const [existingAttendance, setExistingAttendance] = useState<Attendance[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const loadInitialData = async () => {
      if (!user?.schoolId) return;
      
      const [classesData, subjectsData] = await Promise.all([
        db.classes.where('schoolId').equals(user.schoolId).toArray(),
        db.subjects.where('schoolId').equals(user.schoolId).toArray(),
      ]);
      
      setClasses(classesData);
      setSubjects(subjectsData);
      
      if (user.role === 'teacher') {
        const teacherData = await db.teachers.where('userId').equals(user.id).first();
        setTeacher(teacherData || null);
      }
      
      if (classesData.length > 0) {
        setSelectedClass(classesData[0].id);
      }
      if (subjectsData.length > 0) {
        setSelectedSubject(subjectsData[0].id);
      }
    };
    loadInitialData();
  }, [user]);

  useEffect(() => {
    const loadStudentsAndAttendance = async () => {
      if (!selectedClass) return;
      
      const studentsData = await db.students.where('classId').equals(selectedClass).toArray();
      setStudents(studentsData);
      
      const dateStart = new Date(selectedDate);
      dateStart.setHours(0, 0, 0, 0);
      const dateEnd = new Date(selectedDate);
      dateEnd.setHours(23, 59, 59, 999);
      
      const existingData = await db.attendance
        .where('classId').equals(selectedClass)
        .and(a => {
          const aDate = new Date(a.date);
          return aDate >= dateStart && aDate <= dateEnd;
        })
        .toArray();
      
      setExistingAttendance(existingData);
      
      const records = new Map<string, AttendanceStatus>();
      studentsData.forEach(student => {
        const existing = existingData.find(a => a.studentId === student.id);
        records.set(student.id, existing?.status || 'present');
      });
      setAttendanceRecords(records);
      setSaved(existingData.length > 0);
    };
    loadStudentsAndAttendance();
  }, [selectedClass, selectedDate]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    const newRecords = new Map(attendanceRecords);
    newRecords.set(studentId, status);
    setAttendanceRecords(newRecords);
    setSaved(false);
  };

  const handleSaveAttendance = async () => {
    setIsSaving(true);
    
    try {
      const existingIds = existingAttendance.map(a => a.id);
      await db.attendance.bulkDelete(existingIds);
      
      const newRecords: Attendance[] = students.map(student => ({
        id: uuidv4(),
        studentId: student.id,
        classId: selectedClass,
        subjectId: selectedSubject,
        teacherId: teacher?.id || '',
        date: selectedDate,
        status: attendanceRecords.get(student.id) || 'present',
        createdAt: new Date(),
      }));
      
      await db.attendance.bulkAdd(newRecords);
      setExistingAttendance(newRecords);
      setSaved(true);
    } catch (error) {
      console.error('Error saving attendance:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleMarkAll = (status: AttendanceStatus) => {
    const newRecords = new Map<string, AttendanceStatus>();
    students.forEach(student => {
      newRecords.set(student.id, status);
    });
    setAttendanceRecords(newRecords);
    setSaved(false);
  };

  const stats = {
    present: Array.from(attendanceRecords.values()).filter(s => s === 'present').length,
    absent: Array.from(attendanceRecords.values()).filter(s => s === 'absent').length,
    late: Array.from(attendanceRecords.values()).filter(s => s === 'late').length,
    excused: Array.from(attendanceRecords.values()).filter(s => s === 'excused').length,
  };

  return (
    <DashboardLayout title="Attendance" subtitle="Take and manage student attendance">
      {/* Controls */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <Select
                label="Class"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                options={classes.map(c => ({ value: c.id, label: c.name }))}
                className="w-full sm:w-48"
              />
              <Select
                label="Subject"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                options={subjects.map(s => ({ value: s.id, label: s.name }))}
                className="w-full sm:w-48"
              />
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Date</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedDate(subDays(selectedDate, 1))}
                    className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <input
                    type="date"
                    value={format(selectedDate, 'yyyy-MM-dd')}
                    onChange={(e) => setSelectedDate(new Date(e.target.value))}
                    className="px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-purple-500"
                  />
                  <button
                    onClick={() => setSelectedDate(addDays(selectedDate, 1))}
                    className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            <Button onClick={handleSaveAttendance} isLoading={isSaving} disabled={saved}>
              <Save className="w-4 h-4 mr-2" />
              {saved ? 'Saved' : 'Save Attendance'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <button onClick={() => handleMarkAll('present')} className="text-left">
          <Card hover>
            <CardContent className="p-4 text-center">
              <CheckCircle className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
              <p className="text-2xl font-bold text-emerald-600">{stats.present}</p>
              <p className="text-sm text-slate-500">Present</p>
            </CardContent>
          </Card>
        </button>
        <button onClick={() => handleMarkAll('absent')} className="text-left">
          <Card hover>
            <CardContent className="p-4 text-center">
              <XCircle className="w-8 h-8 mx-auto text-red-500 mb-2" />
              <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
              <p className="text-sm text-slate-500">Absent</p>
            </CardContent>
          </Card>
        </button>
        <button onClick={() => handleMarkAll('late')} className="text-left">
          <Card hover>
            <CardContent className="p-4 text-center">
              <Clock className="w-8 h-8 mx-auto text-amber-500 mb-2" />
              <p className="text-2xl font-bold text-amber-600">{stats.late}</p>
              <p className="text-sm text-slate-500">Late</p>
            </CardContent>
          </Card>
        </button>
        <button onClick={() => handleMarkAll('excused')} className="text-left">
          <Card hover>
            <CardContent className="p-4 text-center">
              <Calendar className="w-8 h-8 mx-auto text-blue-500 mb-2" />
              <p className="text-2xl font-bold text-blue-600">{stats.excused}</p>
              <p className="text-sm text-slate-500">Excused</p>
            </CardContent>
          </Card>
        </button>
      </div>

      {/* Student List */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">{classes.find(c => c.id === selectedClass)?.name || 'Select a class'}</h2>
              <p className="text-sm text-slate-500">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</p>
            </div>
          </div>
          
          {students.length === 0 ? (
            <div className="text-center py-12">
              <AlertTriangle className="w-12 h-12 mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500">No students found in this class</p>
            </div>
          ) : (
            <div className="space-y-3">
              {students.map((student) => {
                const currentStatus = attendanceRecords.get(student.id) || 'present';
                return (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-purple-200 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold ${student.gender === 'male' ? 'bg-blue-500' : 'bg-pink-500'}`}>
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{student.name}</p>
                        <p className="text-sm text-slate-500">{student.studentNumber}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {(['present', 'absent', 'late', 'excused'] as AttendanceStatus[]).map((status) => (
                        <button
                          key={status}
                          onClick={() => handleStatusChange(student.id, status)}
                          className={`p-2 rounded-lg border-2 transition-all ${
                            currentStatus === status 
                              ? status === 'present' ? 'border-emerald-500 bg-emerald-50' :
                                status === 'absent' ? 'border-red-500 bg-red-50' :
                                status === 'late' ? 'border-amber-500 bg-amber-50' :
                                'border-blue-500 bg-blue-50'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                          title={status.charAt(0).toUpperCase() + status.slice(1)}
                        >
                          {status === 'present' && <CheckCircle className={`w-5 h-5 ${currentStatus === status ? 'text-emerald-500' : 'text-slate-300'}`} />}
                          {status === 'absent' && <XCircle className={`w-5 h-5 ${currentStatus === status ? 'text-red-500' : 'text-slate-300'}`} />}
                          {status === 'late' && <Clock className={`w-5 h-5 ${currentStatus === status ? 'text-amber-500' : 'text-slate-300'}`} />}
                          {status === 'excused' && <Calendar className={`w-5 h-5 ${currentStatus === status ? 'text-blue-500' : 'text-slate-300'}`} />}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
