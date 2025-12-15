'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/db';
import { format } from 'date-fns';
import {
  Users,
  GraduationCap,
  BookOpen,
  Building2,
  TrendingUp,
  TrendingDown,
  Calendar,
  Bell,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import type { School, Class, Student, Teacher, Attendance, Announcement, AbsenceRequest } from '@/lib/types';

// Stat Card Component
function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  trend,
  trendValue 
}: { 
  title: string; 
  value: string | number; 
  icon: React.ElementType; 
  color: string;
  trend?: 'up' | 'down';
  trendValue?: string;
}) {
  return (
    <Card className="relative overflow-hidden">
      <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 ${color}`}></div>
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{value}</p>
          {trend && trendValue && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${trend === 'up' ? 'text-emerald-600' : 'text-red-500'}`}>
              {trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </Card>
  );
}

// MoE Dashboard
function MoEDashboard() {
  const [schools, setSchools] = useState<School[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const [schoolsData, teachersData, studentsData, announcementsData] = await Promise.all([
        db.schools.toArray(),
        db.teachers.toArray(),
        db.students.toArray(),
        db.announcements.orderBy('createdAt').reverse().limit(5).toArray(),
      ]);
      setSchools(schoolsData);
      setTeachers(teachersData);
      setStudents(studentsData);
      setAnnouncements(announcementsData);
    };
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Schools" value={schools.length} icon={Building2} color="bg-blue-500" trend="up" trendValue="2 new this month" />
        <StatCard title="Total Students" value={students.length} icon={GraduationCap} color="bg-emerald-500" trend="up" trendValue="+12%" />
        <StatCard title="Total Teachers" value={teachers.length} icon={Users} color="bg-purple-500" />
        <StatCard title="Active Classes" value={schools.length * 3} icon={BookOpen} color="bg-amber-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Recent Announcements" subtitle="Latest updates from schools" />
          <div className="space-y-3">
            {announcements.length === 0 ? (
              <p className="text-slate-500 text-sm">No announcements yet</p>
            ) : (
              announcements.map((announcement) => (
                <div key={announcement.id} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                  <div className={`p-2 rounded-lg ${
                    announcement.priority === 'urgent' ? 'bg-red-100 text-red-600' :
                    announcement.priority === 'high' ? 'bg-amber-100 text-amber-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    <Bell className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 dark:text-white truncate">{announcement.title}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{announcement.content}</p>
                  </div>
                  <Badge variant={
                    announcement.priority === 'urgent' ? 'danger' :
                    announcement.priority === 'high' ? 'warning' : 'info'
                  } size="sm">
                    {announcement.priority}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card>
          <CardHeader title="School Overview" subtitle="Performance across all schools" />
          <div className="space-y-4">
            {schools.map((school) => (
              <div key={school.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                    {school.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{school.name}</p>
                    <p className="text-sm text-slate-500">{school.address}</p>
                  </div>
                </div>
                <Badge variant="success">Active</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// School Admin Dashboard
function SchoolAdminDashboard({ schoolId }: { schoolId: string }) {
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [absenceRequests, setAbsenceRequests] = useState<AbsenceRequest[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const [classesData, teachersData, absenceData] = await Promise.all([
        db.classes.where('schoolId').equals(schoolId).toArray(),
        db.teachers.where('schoolId').equals(schoolId).toArray(),
        db.absenceRequests.where('status').equals('pending').toArray(),
      ]);
      
      const classIds = classesData.map(c => c.id);
      const studentsData = await db.students.where('classId').anyOf(classIds).toArray();
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const attendanceData = await db.attendance.where('date').aboveOrEqual(today).toArray();

      setClasses(classesData);
      setStudents(studentsData);
      setTeachers(teachersData);
      setAttendance(attendanceData);
      setAbsenceRequests(absenceData);
    };
    loadData();
  }, [schoolId]);

  const presentToday = attendance.filter(a => a.status === 'present').length;
  const absentToday = attendance.filter(a => a.status === 'absent').length;
  const attendanceRate = attendance.length > 0 
    ? Math.round((presentToday / attendance.length) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Students" value={students.length} icon={GraduationCap} color="bg-blue-500" />
        <StatCard title="Total Teachers" value={teachers.length} icon={Users} color="bg-purple-500" />
        <StatCard title="Active Classes" value={classes.length} icon={BookOpen} color="bg-emerald-500" />
        <StatCard title="Attendance Rate" value={`${attendanceRate}%`} icon={CheckCircle} color="bg-amber-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Attendance */}
        <Card className="lg:col-span-2">
          <CardHeader title="Today's Attendance Overview" subtitle={format(new Date(), 'EEEE, MMMM d, yyyy')} />
          <div className="grid grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-center">
              <CheckCircle className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
              <p className="text-2xl font-bold text-emerald-600">{presentToday}</p>
              <p className="text-sm text-emerald-600/70">Present</p>
            </div>
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-center">
              <XCircle className="w-8 h-8 mx-auto text-red-500 mb-2" />
              <p className="text-2xl font-bold text-red-600">{absentToday}</p>
              <p className="text-sm text-red-600/70">Absent</p>
            </div>
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-center">
              <Clock className="w-8 h-8 mx-auto text-amber-500 mb-2" />
              <p className="text-2xl font-bold text-amber-600">{attendance.filter(a => a.status === 'late').length}</p>
              <p className="text-sm text-amber-600/70">Late</p>
            </div>
            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-center">
              <Calendar className="w-8 h-8 mx-auto text-blue-500 mb-2" />
              <p className="text-2xl font-bold text-blue-600">{attendance.filter(a => a.status === 'excused').length}</p>
              <p className="text-sm text-blue-600/70">Excused</p>
            </div>
          </div>
        </Card>

        {/* Pending Requests */}
        <Card>
          <CardHeader title="Pending Requests" subtitle={`${absenceRequests.length} awaiting approval`} />
          <div className="space-y-3">
            {absenceRequests.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-4">No pending requests</p>
            ) : (
              absenceRequests.slice(0, 3).map((request) => (
                <div key={request.id} className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <span className="text-sm font-medium text-amber-700 dark:text-amber-400">Absence Request</span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 truncate">{request.reason}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {format(new Date(request.startDate), 'MMM d')} - {format(new Date(request.endDate), 'MMM d')}
                  </p>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Classes Overview */}
      <Card>
        <CardHeader title="Classes Overview" subtitle="Current status of all classes" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((cls) => {
            const classStudents = students.filter(s => s.classId === cls.id);
            return (
              <div key={cls.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors cursor-pointer">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-slate-900 dark:text-white">{cls.name}</h4>
                  <Badge variant={cls.mobilityLevel === 'high' ? 'success' : cls.mobilityLevel === 'medium' ? 'warning' : 'default'} size="sm">
                    {cls.mobilityLevel}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <span className="flex items-center gap-1">
                    <GraduationCap className="w-4 h-4" />
                    {classStudents.length} students
                  </span>
                  <span>Grade {cls.grade}</span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

// Teacher Dashboard
function TeacherDashboard({ userId }: { userId: string }) {
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);
  const [todayAttendance, setTodayAttendance] = useState<Attendance[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const teacherData = await db.teachers.where('userId').equals(userId).first();
      if (teacherData) {
        setTeacher(teacherData);
        const classesData = await db.classes.where('schoolId').equals(teacherData.schoolId).toArray();
        setClasses(classesData);
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const attendanceData = await db.attendance.where('teacherId').equals(teacherData.id).and(a => new Date(a.date) >= today).toArray();
        setTodayAttendance(attendanceData);
      }
    };
    loadData();
  }, [userId]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="My Subjects" value={teacher?.subjects.length || 0} icon={BookOpen} color="bg-indigo-500" />
        <StatCard title="Today's Classes" value={classes.length} icon={Calendar} color="bg-purple-500" />
        <StatCard title="Attendance Taken" value={todayAttendance.length} icon={CheckCircle} color="bg-emerald-500" />
        <StatCard title="Supervisor" value={teacher?.isSupervisor ? 'Yes' : 'No'} icon={Users} color="bg-amber-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="My Subjects" subtitle="Subjects you teach" />
          <div className="flex flex-wrap gap-2">
            {teacher?.subjects.map((subject) => (
              <Badge key={subject} variant="purple" size="md">{subject}</Badge>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Quick Actions" subtitle="Common tasks" />
          <div className="grid grid-cols-2 gap-3">
            <a href="/dashboard/attendance" className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all cursor-pointer text-center">
              <CheckCircle className="w-8 h-8 mx-auto text-indigo-500 mb-2" />
              <p className="font-medium text-slate-900 dark:text-white">Take Attendance</p>
            </a>
            <a href="/dashboard/students" className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all cursor-pointer text-center">
              <GraduationCap className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
              <p className="font-medium text-slate-900 dark:text-white">View Students</p>
            </a>
            <a href="/dashboard/classes" className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all cursor-pointer text-center">
              <BookOpen className="w-8 h-8 mx-auto text-purple-500 mb-2" />
              <p className="font-medium text-slate-900 dark:text-white">My Classes</p>
            </a>
            <a href="/dashboard/issues" className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all cursor-pointer text-center">
              <AlertTriangle className="w-8 h-8 mx-auto text-amber-500 mb-2" />
              <p className="font-medium text-slate-900 dark:text-white">Report Issue</p>
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
}

// Parent Dashboard
function ParentDashboard({ userId }: { userId: string }) {
  const [parent, setParent] = useState<{ id: string; studentIds: string[] } | null>(null);
  const [children, setChildren] = useState<Student[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const parentData = await db.parents.where('userId').equals(userId).first();
      if (parentData) {
        setParent(parentData);
        const childrenData = await db.students.where('id').anyOf(parentData.studentIds).toArray();
        setChildren(childrenData);
      }
      const announcementsData = await db.announcements.orderBy('createdAt').reverse().limit(5).toArray();
      setAnnouncements(announcementsData);
    };
    loadData();
  }, [userId]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="My Children" value={children.length} icon={GraduationCap} color="bg-indigo-500" />
        <StatCard title="Announcements" value={announcements.length} icon={Bell} color="bg-purple-500" />
        <StatCard title="Pending Requests" value="0" icon={Clock} color="bg-amber-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="My Children" subtitle="Overview of your children's information" />
          <div className="space-y-3">
            {children.map((child) => (
              <div key={child.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${child.gender === 'male' ? 'bg-blue-500' : 'bg-pink-500'}`}>
                    {child.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{child.name}</p>
                    <p className="text-sm text-slate-500">{child.studentNumber}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Quick Actions" subtitle="Common tasks" />
          <div className="grid grid-cols-2 gap-3">
            <a href="/dashboard/absence-requests" className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all cursor-pointer text-center">
              <Calendar className="w-8 h-8 mx-auto text-indigo-500 mb-2" />
              <p className="font-medium text-slate-900 dark:text-white">Request Absence</p>
            </a>
            <a href="/dashboard/my-children" className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all cursor-pointer text-center">
              <GraduationCap className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
              <p className="font-medium text-slate-900 dark:text-white">View Children</p>
            </a>
            <a href="/dashboard/announcements" className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all cursor-pointer text-center">
              <Bell className="w-8 h-8 mx-auto text-purple-500 mb-2" />
              <p className="font-medium text-slate-900 dark:text-white">Announcements</p>
            </a>
            <a href="/dashboard/issues" className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all cursor-pointer text-center">
              <AlertTriangle className="w-8 h-8 mx-auto text-amber-500 mb-2" />
              <p className="font-medium text-slate-900 dark:text-white">Report Issue</p>
            </a>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Recent Announcements" subtitle="Latest updates from school" />
        <div className="space-y-3">
          {announcements.map((announcement) => (
            <div key={announcement.id} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50">
              <div className={`p-2 rounded-lg ${
                announcement.priority === 'urgent' ? 'bg-red-100 text-red-600' :
                announcement.priority === 'high' ? 'bg-amber-100 text-amber-600' :
                'bg-blue-100 text-blue-600'
              }`}>
                <Bell className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900 dark:text-white">{announcement.title}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{announcement.content}</p>
                <p className="text-xs text-slate-400 mt-2">{format(new Date(announcement.createdAt), 'MMM d, yyyy')}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();

  const getSubtitle = () => {
    switch (user?.role) {
      case 'moe': return 'Ministry of Education Overview';
      case 'school_admin': return 'School Management Dashboard';
      case 'teacher': return 'Teacher Dashboard';
      case 'parent': return 'Parent Portal';
      default: return '';
    }
  };

  const renderDashboard = () => {
    switch (user?.role) {
      case 'moe':
        return <MoEDashboard />;
      case 'school_admin':
        return <SchoolAdminDashboard schoolId={user.schoolId || ''} />;
      case 'teacher':
        return <TeacherDashboard userId={user.id} />;
      case 'parent':
        return <ParentDashboard userId={user.id} />;
      default:
        return null;
    }
  };

  return (
    <DashboardLayout title="Dashboard" subtitle={getSubtitle()}>
      {renderDashboard()}
    </DashboardLayout>
  );
}

