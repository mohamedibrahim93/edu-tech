'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/db';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { 
  BarChart3, 
  Download,
  TrendingUp,
  TrendingDown,
  Users,
  GraduationCap,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  FileText
} from 'lucide-react';
import type { Class, Student, Attendance, Teacher } from '@/lib/types';

interface AttendanceStats {
  total: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
}

interface ClassReport {
  classId: string;
  className: string;
  studentCount: number;
  attendanceRate: number;
  stats: AttendanceStats;
}

export default function ReportsPage() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('7days');
  const [classReports, setClassReports] = useState<ClassReport[]>([]);
  const [overallStats, setOverallStats] = useState<AttendanceStats>({
    total: 0,
    present: 0,
    absent: 0,
    late: 0,
    excused: 0,
  });

  useEffect(() => {
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
      
      // Get attendance for selected period
      let startDate: Date;
      const endDate = new Date();
      
      switch (selectedPeriod) {
        case '7days':
          startDate = subDays(endDate, 7);
          break;
        case '30days':
          startDate = subDays(endDate, 30);
          break;
        case 'month':
          startDate = startOfMonth(endDate);
          break;
        default:
          startDate = subDays(endDate, 7);
      }
      
      const attendanceData = await db.attendance
        .filter(a => new Date(a.date) >= startDate && new Date(a.date) <= endDate)
        .toArray();
      setAttendance(attendanceData);
      
      // Calculate overall stats
      const overall: AttendanceStats = {
        total: attendanceData.length,
        present: attendanceData.filter(a => a.status === 'present').length,
        absent: attendanceData.filter(a => a.status === 'absent').length,
        late: attendanceData.filter(a => a.status === 'late').length,
        excused: attendanceData.filter(a => a.status === 'excused').length,
      };
      setOverallStats(overall);
      
      // Calculate per-class reports
      const reports: ClassReport[] = classesData.map(cls => {
        const classAttendance = attendanceData.filter(a => a.classId === cls.id);
        const classStudents = studentsData.filter(s => s.classId === cls.id);
        const presentCount = classAttendance.filter(a => a.status === 'present').length;
        const attendanceRate = classAttendance.length > 0 
          ? Math.round((presentCount / classAttendance.length) * 100) 
          : 0;
        
        return {
          classId: cls.id,
          className: cls.name,
          studentCount: classStudents.length,
          attendanceRate,
          stats: {
            total: classAttendance.length,
            present: presentCount,
            absent: classAttendance.filter(a => a.status === 'absent').length,
            late: classAttendance.filter(a => a.status === 'late').length,
            excused: classAttendance.filter(a => a.status === 'excused').length,
          },
        };
      });
      
      setClassReports(reports.sort((a, b) => b.attendanceRate - a.attendanceRate));
    };
    
    loadData();
  }, [user, selectedPeriod]);

  const overallAttendanceRate = overallStats.total > 0 
    ? Math.round((overallStats.present / overallStats.total) * 100) 
    : 0;

  const handleExport = () => {
    // Create CSV content
    const headers = ['Class', 'Students', 'Attendance Rate', 'Present', 'Absent', 'Late', 'Excused'];
    const rows = classReports.map(r => [
      r.className,
      r.studentCount,
      `${r.attendanceRate}%`,
      r.stats.present,
      r.stats.absent,
      r.stats.late,
      r.stats.excused,
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout title="Reports" subtitle="View attendance and performance reports">
      {/* Controls */}
      <Card className="mb-6 p-4 sm:p-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex items-center gap-4">
            <Select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              options={[
                { value: '7days', label: 'Last 7 Days' },
                { value: '30days', label: 'Last 30 Days' },
                { value: 'month', label: 'This Month' },
              ]}
              className="w-40"
            />
          </div>
          <Button variant="secondary" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </Card>

      {/* Overall Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card className="text-center p-4 sm:p-6">
          <BarChart3 className="w-8 h-8 mx-auto text-purple-500 mb-2" />
          <p className="text-2xl font-bold text-purple-600">{overallAttendanceRate}%</p>
          <p className="text-sm text-slate-500">Attendance Rate</p>
        </Card>
        <Card className="text-center p-4 sm:p-6">
          <CheckCircle className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
          <p className="text-2xl font-bold text-emerald-600">{overallStats.present}</p>
          <p className="text-sm text-slate-500">Present</p>
        </Card>
        <Card className="text-center p-4 sm:p-6">
          <XCircle className="w-8 h-8 mx-auto text-red-500 mb-2" />
          <p className="text-2xl font-bold text-red-600">{overallStats.absent}</p>
          <p className="text-sm text-slate-500">Absent</p>
        </Card>
        <Card className="text-center p-4 sm:p-6">
          <Clock className="w-8 h-8 mx-auto text-amber-500 mb-2" />
          <p className="text-2xl font-bold text-amber-600">{overallStats.late}</p>
          <p className="text-sm text-slate-500">Late</p>
        </Card>
        <Card className="text-center p-4 sm:p-6">
          <Calendar className="w-8 h-8 mx-auto text-blue-500 mb-2" />
          <p className="text-2xl font-bold text-blue-600">{overallStats.excused}</p>
          <p className="text-sm text-slate-500">Excused</p>
        </Card>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader title="Total Students" />
          <div className="flex items-center gap-4 px-4 sm:px-6 pb-4 sm:pb-6">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-900">{students.length}</p>
              <p className="text-sm text-slate-500">Enrolled students</p>
            </div>
          </div>
        </Card>
        
        <Card>
          <CardHeader title="Total Teachers" />
          <div className="flex items-center gap-4 px-4 sm:px-6 pb-4 sm:pb-6">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-900">{teachers.length}</p>
              <p className="text-sm text-slate-500">Active teachers</p>
            </div>
          </div>
        </Card>
        
        <Card>
          <CardHeader title="Total Classes" />
          <div className="flex items-center gap-4 px-4 sm:px-6 pb-4 sm:pb-6">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-900">{classes.length}</p>
              <p className="text-sm text-slate-500">Active classes</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Class Reports */}
      <Card>
        <CardHeader title="Class Attendance Report" subtitle="Performance by class" />
        <div className="space-y-4 px-4 sm:px-6 pb-4 sm:pb-6">
          {classReports.map((report, index) => (
            <div
              key={report.classId}
              className="flex items-center gap-4 p-4 rounded-xl bg-slate-50"
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                index === 0 ? 'bg-amber-500' :
                index === 1 ? 'bg-slate-400' :
                index === 2 ? 'bg-amber-700' :
                'bg-slate-300'
              }`}>
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-slate-900">{report.className}</h4>
                  <div className="flex items-center gap-2">
                    {report.attendanceRate >= 90 ? (
                      <TrendingUp className="w-4 h-4 text-emerald-500" />
                    ) : report.attendanceRate < 70 ? (
                      <TrendingDown className="w-4 h-4 text-red-500" />
                    ) : null}
                    <span className={`font-bold ${
                      report.attendanceRate >= 90 ? 'text-emerald-600' :
                      report.attendanceRate >= 70 ? 'text-amber-600' :
                      'text-red-600'
                    }`}>
                      {report.attendanceRate}%
                    </span>
                  </div>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all ${
                      report.attendanceRate >= 90 ? 'bg-emerald-500' :
                      report.attendanceRate >= 70 ? 'bg-amber-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${report.attendanceRate}%` }}
                  />
                </div>
                <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                  <span>{report.studentCount} students</span>
                  <span>•</span>
                  <span className="text-emerald-600">{report.stats.present} present</span>
                  <span>•</span>
                  <span className="text-red-600">{report.stats.absent} absent</span>
                </div>
              </div>
            </div>
          ))}
          
          {classReports.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 text-slate-400" />
              <p>No attendance data available for the selected period</p>
            </div>
          )}
        </div>
      </Card>
    </DashboardLayout>
  );
}

