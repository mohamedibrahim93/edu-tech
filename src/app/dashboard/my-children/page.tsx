'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { db } from '@/lib/db';
import { format, subDays } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { 
  GraduationCap, 
  BookOpen,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  TrendingUp,
  TrendingDown,
  Bell
} from 'lucide-react';
import type { Student, Class, Parent, Attendance, Announcement, Note } from '@/lib/types';

interface ChildWithDetails extends Student {
  class?: Class;
  attendanceStats: {
    present: number;
    absent: number;
    late: number;
    excused: number;
    rate: number;
  };
  recentAttendance: Attendance[];
}

export default function MyChildrenPage() {
  const { user } = useAuth();
  const { t, isRTL, language } = useLanguage();
  const [children, setChildren] = useState<ChildWithDetails[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [selectedChild, setSelectedChild] = useState<ChildWithDetails | null>(null);

  const dateLocale = language === 'ar' ? ar : enUS;

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      
      const parent = await db.parents.where('userId').equals(user.id).first();
      if (!parent) return;
      
      const studentsData = await db.students.where('id').anyOf(parent.studentIds).toArray();
      
      const thirtyDaysAgo = subDays(new Date(), 30);
      
      const childrenWithDetails: ChildWithDetails[] = await Promise.all(
        studentsData.map(async (student) => {
          const classData = await db.classes.get(student.classId);
          
          // Get attendance for last 30 days
          const attendance = await db.attendance
            .where('studentId').equals(student.id)
            .filter(a => new Date(a.date) >= thirtyDaysAgo)
            .toArray();
          
          const present = attendance.filter(a => a.status === 'present').length;
          const absent = attendance.filter(a => a.status === 'absent').length;
          const late = attendance.filter(a => a.status === 'late').length;
          const excused = attendance.filter(a => a.status === 'excused').length;
          const rate = attendance.length > 0 ? Math.round((present / attendance.length) * 100) : 100;
          
          // Get recent attendance (last 7 entries)
          const recentAttendance = attendance
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 7);
          
          return {
            ...student,
            class: classData,
            attendanceStats: { present, absent, late, excused, rate },
            recentAttendance,
          };
        })
      );
      
      setChildren(childrenWithDetails);
      if (childrenWithDetails.length > 0 && !selectedChild) {
        setSelectedChild(childrenWithDetails[0]);
      }
      
      // Load announcements
      const announcementsData = await db.announcements
        .orderBy('createdAt')
        .reverse()
        .limit(5)
        .toArray();
      setAnnouncements(announcementsData);
    };
    
    loadData();
  }, [user]);

  if (user?.role !== 'parent') {
    return (
      <DashboardLayout title={t('myChildren.title')} subtitle={t('myChildren.subtitle')}>
        <Card className="p-4 sm:p-6">
          <div className="text-center py-12">
            <GraduationCap className="w-12 h-12 mx-auto text-slate-400 mb-4" />
            <p className="text-slate-500">
              {isRTL ? 'هذه الصفحة متاحة لأولياء الأمور فقط.' : 'This page is only available for parents.'}
            </p>
          </div>
        </Card>
      </DashboardLayout>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'absent': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'late': return <Clock className="w-4 h-4 text-amber-500" />;
      case 'excused': return <Calendar className="w-4 h-4 text-blue-500" />;
      default: return null;
    }
  };

  const getGenderLabel = (gender: string) => {
    if (gender === 'male') return isRTL ? 'ذكر' : 'Male';
    return isRTL ? 'أنثى' : 'Female';
  };

  return (
    <DashboardLayout title={t('myChildren.title')} subtitle={t('myChildren.subtitle')}>
      {/* Children Selector */}
      <div className={`flex gap-4 mb-6 overflow-x-auto pb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
        {children.map((child) => (
          <Card
            key={child.id}
            hover
            className={`min-w-[200px] cursor-pointer p-4 ${selectedChild?.id === child.id ? 'ring-2 ring-purple-500' : ''}`}
            onClick={() => setSelectedChild(child)}
          >
            <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg ${child.gender === 'male' ? 'bg-blue-500' : 'bg-pink-500'}`}>
                {child.name.charAt(0)}
              </div>
              <div className={isRTL ? 'text-right' : ''}>
                <p className="font-medium text-slate-900">{child.name}</p>
                <p className="text-sm text-slate-500">{child.class?.name}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {selectedChild && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Student Info */}
          <Card className="lg:col-span-2">
            <CardHeader 
              title={selectedChild.name} 
              subtitle={`${isRTL ? 'رقم الطالب:' : 'Student Number:'} ${selectedChild.studentNumber}`} 
            />
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 px-4 sm:px-6">
              <div className="p-4 rounded-xl bg-slate-50 text-center">
                <p className="text-sm text-slate-500 mb-1">{t('myChildren.class')}</p>
                <p className="font-semibold text-slate-900">{selectedChild.class?.name}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 text-center">
                <p className="text-sm text-slate-500 mb-1">{t('myChildren.grade')}</p>
                <p className="font-semibold text-slate-900">{selectedChild.class?.grade}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 text-center">
                <p className="text-sm text-slate-500 mb-1">{t('myChildren.dateOfBirth')}</p>
                <p className="font-semibold text-slate-900">
                  {format(new Date(selectedChild.dateOfBirth), 'MMM d, yyyy', { locale: dateLocale })}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 text-center">
                <p className="text-sm text-slate-500 mb-1">{t('myChildren.gender')}</p>
                <p className="font-semibold text-slate-900">{getGenderLabel(selectedChild.gender)}</p>
              </div>
            </div>

            {/* Attendance Stats */}
            <h4 className={`font-medium text-slate-900 mb-4 px-4 sm:px-6 ${isRTL ? 'text-right' : ''}`}>
              {t('myChildren.attendanceLast30Days')}
            </h4>
            <div className="grid grid-cols-5 gap-4 mb-6 px-4 sm:px-6">
              <div className="p-4 rounded-xl bg-purple-50 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  {selectedChild.attendanceStats.rate >= 90 ? (
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  )}
                </div>
                <p className="text-2xl font-bold text-purple-600">{selectedChild.attendanceStats.rate}%</p>
                <p className="text-xs text-purple-600/70">{t('attendance.rate')}</p>
              </div>
              <div className="p-4 rounded-xl bg-emerald-50 text-center">
                <CheckCircle className="w-5 h-5 mx-auto text-emerald-500 mb-1" />
                <p className="text-xl font-bold text-emerald-600">{selectedChild.attendanceStats.present}</p>
                <p className="text-xs text-emerald-600/70">{t('attendance.present')}</p>
              </div>
              <div className="p-4 rounded-xl bg-red-50 text-center">
                <XCircle className="w-5 h-5 mx-auto text-red-500 mb-1" />
                <p className="text-xl font-bold text-red-600">{selectedChild.attendanceStats.absent}</p>
                <p className="text-xs text-red-600/70">{t('attendance.absent')}</p>
              </div>
              <div className="p-4 rounded-xl bg-amber-50 text-center">
                <Clock className="w-5 h-5 mx-auto text-amber-500 mb-1" />
                <p className="text-xl font-bold text-amber-600">{selectedChild.attendanceStats.late}</p>
                <p className="text-xs text-amber-600/70">{t('attendance.late')}</p>
              </div>
              <div className="p-4 rounded-xl bg-blue-50 text-center">
                <Calendar className="w-5 h-5 mx-auto text-blue-500 mb-1" />
                <p className="text-xl font-bold text-blue-600">{selectedChild.attendanceStats.excused}</p>
                <p className="text-xs text-blue-600/70">{t('attendance.excused')}</p>
              </div>
            </div>

            {/* Recent Attendance */}
            <h4 className={`font-medium text-slate-900 mb-4 px-4 sm:px-6 ${isRTL ? 'text-right' : ''}`}>
              {t('myChildren.recentAttendance')}
            </h4>
            <div className={`flex gap-2 flex-wrap px-4 sm:px-6 pb-4 sm:pb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
              {selectedChild.recentAttendance.map((record) => (
                <div
                  key={record.id}
                  className="flex flex-col items-center p-3 rounded-lg bg-slate-50"
                  title={`${format(new Date(record.date), 'MMM d', { locale: dateLocale })} - ${record.status}`}
                >
                  {getStatusIcon(record.status)}
                  <span className="text-xs text-slate-500 mt-1">
                    {format(new Date(record.date), 'MMM d', { locale: dateLocale })}
                  </span>
                </div>
              ))}
              {selectedChild.recentAttendance.length === 0 && (
                <p className="text-slate-500 text-sm">
                  {isRTL ? 'لا توجد سجلات حضور حديثة' : 'No recent attendance records'}
                </p>
              )}
            </div>
          </Card>

          {/* Announcements */}
          <Card>
            <CardHeader 
              title={t('myChildren.schoolAnnouncements')} 
              subtitle={isRTL ? 'آخر التحديثات' : 'Recent updates'} 
            />
            <div className="space-y-3 px-4 sm:px-6 pb-4 sm:pb-6">
              {announcements.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-4">
                  {isRTL ? 'لا توجد إعلانات' : 'No announcements'}
                </p>
              ) : (
                announcements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className={`p-3 rounded-xl bg-slate-50 ${isRTL ? 'text-right' : ''}`}
                  >
                    <div className={`flex items-center gap-2 mb-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Bell className={`w-4 h-4 ${
                        announcement.priority === 'urgent' ? 'text-red-500' :
                        announcement.priority === 'high' ? 'text-amber-500' :
                        'text-blue-500'
                      }`} />
                      <span className="font-medium text-sm text-slate-900">
                        {announcement.title}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2">{announcement.content}</p>
                    <p className="text-xs text-slate-400 mt-2">
                      {format(new Date(announcement.createdAt), 'MMM d, yyyy', { locale: dateLocale })}
                    </p>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      )}

      {children.length === 0 && (
        <Card className="p-4 sm:p-6">
          <div className="text-center py-12">
            <GraduationCap className="w-12 h-12 mx-auto text-slate-400 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">{t('myChildren.noChildren')}</h3>
            <p className="text-slate-500">
              {isRTL ? 'حسابك غير مرتبط بأي طلاب بعد.' : 'Your account is not linked to any students yet.'}
            </p>
          </div>
        </Card>
      )}
    </DashboardLayout>
  );
}
