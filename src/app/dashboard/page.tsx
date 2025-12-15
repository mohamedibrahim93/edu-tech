'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/db';
import { format } from 'date-fns';
import Link from 'next/link';
import {
  Users,
  GraduationCap,
  BookOpen,
  Building2,
  Calendar,
  Bell,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  TrendingUp,
} from 'lucide-react';
import type { School, Class, Student, Teacher, Attendance, Announcement } from '@/lib/types';

export default function DashboardPage() {
  const { user } = useAuth();
  const [schools, setSchools] = useState<School[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [teacher, setTeacher] = useState<Teacher | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      if (user.role === 'moe') {
        const [schoolsData, studentsData, teachersData, announcementsData] = await Promise.all([
          db.schools.toArray(),
          db.students.toArray(),
          db.teachers.toArray(),
          db.announcements.toArray(),
        ]);
        setSchools(schoolsData);
        setStudents(studentsData);
        setTeachers(teachersData);
        setAnnouncements(announcementsData);
      } else if (user.schoolId) {
        const classesData = await db.classes.where('schoolId').equals(user.schoolId).toArray();
        setClasses(classesData);
        
        const classIds = classesData.map(c => c.id);
        const [studentsData, teachersData, attendanceData, announcementsData] = await Promise.all([
          classIds.length > 0 ? db.students.where('classId').anyOf(classIds).toArray() : [],
          db.teachers.where('schoolId').equals(user.schoolId).toArray(),
          classIds.length > 0 ? db.attendance.where('classId').anyOf(classIds).toArray() : [],
          db.announcements.where('schoolId').equals(user.schoolId).toArray(),
        ]);
        
        setStudents(studentsData);
        setTeachers(teachersData);
        setAttendance(attendanceData);
        setAnnouncements(announcementsData);

        if (user.role === 'teacher') {
          const teacherData = await db.teachers.where('userId').equals(user.id).first();
          setTeacher(teacherData || null);
        }
      }
    };

    loadData();
  }, [user]);

  const todayAttendance = attendance.filter(a => {
    const aDate = new Date(a.date);
    const today = new Date();
    return aDate.toDateString() === today.toDateString();
  });

  const attendanceRate = students.length > 0 
    ? Math.round((todayAttendance.filter(a => a.status === 'present').length / students.length) * 100)
    : 0;

  if (!user) return null;

  return (
    <DashboardLayout title={`Welcome back, ${user.name.split(' ')[0]}!`} subtitle={format(new Date(), 'EEEE, MMMM d, yyyy')}>
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {user.role === 'moe' && (
            <>
              <StatCard title="Total Schools" value={schools.length} icon={Building2} color="purple" change="+2 this month" />
              <StatCard title="Total Students" value={students.length.toLocaleString()} icon={GraduationCap} color="blue" change="+12%" />
              <StatCard title="Total Teachers" value={teachers.length} icon={Users} color="emerald" />
              <StatCard title="Active Classes" value={schools.length * 3} icon={BookOpen} color="pink" />
            </>
          )}
          
          {user.role === 'school_admin' && (
            <>
              <StatCard title="Total Students" value={students.length} icon={GraduationCap} color="purple" />
              <StatCard title="Total Teachers" value={teachers.length} icon={Users} color="blue" />
              <StatCard title="Active Classes" value={classes.length} icon={BookOpen} color="emerald" />
              <StatCard title="Attendance Rate" value={`${attendanceRate}%`} icon={CheckCircle} color="pink" change="+5%" />
            </>
          )}
          
          {user.role === 'teacher' && (
            <>
              <StatCard title="My Subjects" value={teacher?.subjects.length || 0} icon={BookOpen} color="purple" />
              <StatCard title="Today's Classes" value={classes.length} icon={Calendar} color="blue" />
              <StatCard title="Attendance Taken" value={todayAttendance.length} icon={CheckCircle} color="emerald" />
              <StatCard title="Supervisor" value={teacher?.isSupervisor ? 'Yes' : 'No'} icon={Users} color="pink" />
            </>
          )}
          
          {user.role === 'parent' && (
            <>
              <StatCard title="My Children" value={students.length} icon={GraduationCap} color="purple" />
              <StatCard title="Announcements" value={announcements.length} icon={Bell} color="blue" />
              <StatCard title="Pending Requests" value="0" icon={Clock} color="pink" />
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-4 sm:p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4 sm:mb-6">Quick Actions</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  {user.role === 'teacher' && (
                    <>
                      <QuickAction href="/dashboard/attendance" icon={CheckCircle} label="Take Attendance" color="purple" />
                      <QuickAction href="/dashboard/students" icon={GraduationCap} label="View Students" color="blue" />
                      <QuickAction href="/dashboard/classes" icon={BookOpen} label="My Classes" color="emerald" />
                      <QuickAction href="/dashboard/issues" icon={AlertTriangle} label="Report Issue" color="pink" />
                    </>
                  )}
                  {user.role === 'school_admin' && (
                    <>
                      <QuickAction href="/dashboard/students" icon={GraduationCap} label="Students" color="purple" />
                      <QuickAction href="/dashboard/teachers" icon={Users} label="Teachers" color="blue" />
                      <QuickAction href="/dashboard/classes" icon={BookOpen} label="Classes" color="emerald" />
                      <QuickAction href="/dashboard/reports" icon={BarChart3} label="Reports" color="pink" />
                    </>
                  )}
                  {user.role === 'parent' && (
                    <>
                      <QuickAction href="/dashboard/absence-requests" icon={Calendar} label="Request Absence" color="purple" />
                      <QuickAction href="/dashboard/my-children" icon={GraduationCap} label="My Children" color="blue" />
                      <QuickAction href="/dashboard/announcements" icon={Bell} label="Announcements" color="emerald" />
                      <QuickAction href="/dashboard/issues" icon={AlertTriangle} label="Report Issue" color="pink" />
                    </>
                  )}
                  {user.role === 'moe' && (
                    <>
                      <QuickAction href="/dashboard/schools" icon={Building2} label="Schools" color="purple" />
                      <QuickAction href="/dashboard/teachers" icon={Users} label="Teachers" color="blue" />
                      <QuickAction href="/dashboard/reports" icon={BarChart3} label="Reports" color="emerald" />
                      <QuickAction href="/dashboard/announcements" icon={Bell} label="Announcements" color="pink" />
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Attendance Overview */}
          {(user.role === 'school_admin' || user.role === 'teacher') && (
            <Card>
              <CardContent className="p-4 sm:p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4 sm:mb-6">Today&apos;s Attendance</h2>
                <div className="flex items-center justify-center mb-4 sm:mb-6">
                  <div className="relative w-28 h-28 sm:w-32 sm:h-32">
                    <svg className="w-full h-full -rotate-90">
                      <circle cx="50%" cy="50%" r="45%" stroke="#e2e8f0" strokeWidth="8" fill="none" />
                      <circle 
                        cx="50%" 
                        cy="50%" 
                        r="45%" 
                        stroke="url(#gradient)" 
                        strokeWidth="8" 
                        fill="none" 
                        strokeDasharray={`${attendanceRate * 2.83} 283`}
                        strokeLinecap="round"
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#7c3aed" />
                          <stop offset="100%" stopColor="#ec4899" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl sm:text-3xl font-bold text-slate-900">{attendanceRate}%</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-emerald-50 text-center">
                    <CheckCircle className="w-5 h-5 mx-auto text-emerald-600 mb-1" />
                    <p className="text-lg font-bold text-emerald-600">{todayAttendance.filter(a => a.status === 'present').length}</p>
                    <p className="text-xs text-emerald-600">Present</p>
                  </div>
                  <div className="p-3 rounded-xl bg-red-50 text-center">
                    <XCircle className="w-5 h-5 mx-auto text-red-600 mb-1" />
                    <p className="text-lg font-bold text-red-600">{todayAttendance.filter(a => a.status === 'absent').length}</p>
                    <p className="text-xs text-red-600">Absent</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Calendar for others */}
          {user.role !== 'school_admin' && user.role !== 'teacher' && (
            <Card>
              <CardContent className="p-4 sm:p-6 text-center">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Today</h2>
                <p className="text-4xl sm:text-5xl font-bold text-slate-900 mb-2">{format(new Date(), 'd')}</p>
                <p className="text-purple-600 font-semibold">{format(new Date(), 'MMMM yyyy')}</p>
                <p className="text-slate-500 mt-2">{format(new Date(), 'EEEE')}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Announcements */}
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg font-bold text-slate-900">Recent Announcements</h2>
              <Link href="/dashboard/announcements" className="text-sm font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1">
                View All
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            {announcements.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center">
                  <Bell className="w-8 h-8 text-slate-300" />
                </div>
                <p className="text-slate-500">No announcements yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {announcements.slice(0, 5).map((announcement) => (
                  <div key={announcement.id} className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="p-2 rounded-xl bg-purple-50 flex-shrink-0">
                      <Bell className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 text-sm sm:text-base">{announcement.title}</p>
                      <p className="text-sm text-slate-500 truncate">{announcement.content}</p>
                      <p className="text-xs text-slate-400 mt-1">{format(new Date(announcement.createdAt), 'MMM d, yyyy')}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ title, value, icon: Icon, color, change }: { title: string; value: string | number; icon: React.ElementType; color: string; change?: string }) {
  const colors: Record<string, { bg: string; text: string; icon: string; shadow: string }> = {
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', icon: 'from-purple-600 to-pink-600', shadow: 'shadow-purple-500/25' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', icon: 'from-blue-600 to-cyan-600', shadow: 'shadow-blue-500/25' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', icon: 'from-emerald-600 to-teal-600', shadow: 'shadow-emerald-500/25' },
    pink: { bg: 'bg-pink-50', text: 'text-pink-600', icon: 'from-pink-600 to-rose-600', shadow: 'shadow-pink-500/25' },
  };

  const c = colors[color] || colors.purple;

  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start justify-between mb-3 sm:mb-4">
          <div className={`p-2.5 sm:p-3 rounded-xl bg-gradient-to-br ${c.icon} shadow-lg ${c.shadow}`}>
            <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          {change && (
            <div className={`hidden sm:flex items-center gap-1 px-2 py-1 rounded-full ${c.bg} ${c.text} text-xs font-semibold`}>
              <TrendingUp className="w-3 h-3" />
              {change}
            </div>
          )}
        </div>
        <p className="text-xl sm:text-2xl font-bold text-slate-900 mb-0.5 sm:mb-1">{value}</p>
        <p className="text-xs sm:text-sm text-slate-500">{title}</p>
      </CardContent>
    </Card>
  );
}

function QuickAction({ href, icon: Icon, label, color }: { href: string; icon: React.ElementType; label: string; color: string }) {
  const colors: Record<string, { gradient: string; shadow: string }> = {
    purple: { gradient: 'from-purple-600 to-pink-600', shadow: 'shadow-purple-500/25' },
    blue: { gradient: 'from-blue-600 to-cyan-600', shadow: 'shadow-blue-500/25' },
    emerald: { gradient: 'from-emerald-600 to-teal-600', shadow: 'shadow-emerald-500/25' },
    pink: { gradient: 'from-pink-600 to-rose-600', shadow: 'shadow-pink-500/25' },
  };

  const c = colors[color] || colors.purple;

  return (
    <Link href={href} className="group">
      <div className="flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl border border-slate-200 hover:border-purple-200 hover:bg-purple-50/50 transition-all">
        <div className={`p-2.5 sm:p-3 rounded-xl bg-gradient-to-br ${c.gradient} shadow-lg ${c.shadow} group-hover:scale-110 transition-transform`}>
          <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </div>
        <span className="text-xs sm:text-sm font-semibold text-slate-700 text-center leading-tight">{label}</span>
      </div>
    </Link>
  );
}
