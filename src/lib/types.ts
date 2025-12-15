// User Roles
export type UserRole = 'moe' | 'school_admin' | 'teacher' | 'parent';

// Base interfaces
export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  schoolId?: string;
  createdAt: Date;
  isActive: boolean;
}

export interface School {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  adminId: string;
  createdAt: Date;
  isActive: boolean;
}

export interface Class {
  id: string;
  name: string;
  grade: string;
  schoolId: string;
  mobilityLevel: 'low' | 'medium' | 'high';
  currentSubjectId?: string;
  currentTeacherId?: string;
  createdAt: Date;
  isActive: boolean;
}

export interface Student {
  id: string;
  name: string;
  studentNumber: string;
  classId: string;
  parentId?: string;
  dateOfBirth: Date;
  gender: 'male' | 'female';
  createdAt: Date;
  isActive: boolean;
}

export interface Teacher {
  id: string;
  userId: string;
  schoolId: string;
  subjects: string[];
  isSupervisor: boolean;
  createdAt: Date;
  isActive: boolean;
}

export interface Parent {
  id: string;
  userId: string;
  studentIds: string[];
  isApproved: boolean;
  createdAt: Date;
}

export interface Subject {
  id: string;
  name: string;
  schoolId: string;
  createdAt: Date;
}

export interface Schedule {
  id: string;
  classId: string;
  subjectId: string;
  teacherId: string;
  dayOfWeek: number; // 0-6, Sunday-Saturday
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
}

export interface Attendance {
  id: string;
  studentId: string;
  classId: string;
  subjectId: string;
  teacherId: string;
  date: Date;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
  createdAt: Date;
}

export interface AbsenceRequest {
  id: string;
  studentId: string;
  parentId: string;
  startDate: Date;
  endDate: Date;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: Date;
  createdAt: Date;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorRole: UserRole;
  targetRole?: UserRole;
  targetSchoolId?: string;
  type: 'announcement' | 'alert' | 'instruction' | 'evacuation';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: Date;
}

export interface Note {
  id: string;
  studentId: string;
  teacherId: string;
  content: string;
  type: 'school' | 'parent';
  createdAt: Date;
}

export interface Issue {
  id: string;
  reportedBy: string;
  reporterRole: UserRole;
  targetId?: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdAt: Date;
}

export interface Grade {
  id: string;
  studentId: string;
  subjectId: string;
  teacherId: string;
  type: 'quiz' | 'midterm' | 'final' | 'assignment' | 'participation';
  score: number;
  maxScore: number;
  term: string;
  createdAt: Date;
}

export interface Activity {
  id: string;
  classId: string;
  title: string;
  description: string;
  date: Date;
  createdAt: Date;
}

// Dashboard stats interfaces
export interface SchoolStats {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  attendanceRate: number;
  absenceRate: number;
  pendingRequests: number;
}

export interface ClassStats {
  totalStudents: number;
  attendanceRate: number;
  averageGrade: number;
  activitiesCount: number;
}

