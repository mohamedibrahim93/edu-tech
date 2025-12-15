import Dexie, { type EntityTable } from 'dexie';
import type {
  User,
  School,
  Class,
  Student,
  Teacher,
  Parent,
  Subject,
  Schedule,
  Attendance,
  AbsenceRequest,
  Announcement,
  Note,
  Issue,
  Grade,
  Activity,
} from './types';

// Define the database
class EduTechDatabase extends Dexie {
  users!: EntityTable<User, 'id'>;
  schools!: EntityTable<School, 'id'>;
  classes!: EntityTable<Class, 'id'>;
  students!: EntityTable<Student, 'id'>;
  teachers!: EntityTable<Teacher, 'id'>;
  parents!: EntityTable<Parent, 'id'>;
  subjects!: EntityTable<Subject, 'id'>;
  schedules!: EntityTable<Schedule, 'id'>;
  attendance!: EntityTable<Attendance, 'id'>;
  absenceRequests!: EntityTable<AbsenceRequest, 'id'>;
  announcements!: EntityTable<Announcement, 'id'>;
  notes!: EntityTable<Note, 'id'>;
  issues!: EntityTable<Issue, 'id'>;
  grades!: EntityTable<Grade, 'id'>;
  activities!: EntityTable<Activity, 'id'>;

  constructor() {
    super('EduTechDB');
    this.version(1).stores({
      users: 'id, email, role, schoolId, isActive',
      schools: 'id, name, adminId, isActive',
      classes: 'id, name, schoolId, isActive',
      students: 'id, studentNumber, classId, parentId, isActive',
      teachers: 'id, userId, schoolId, isActive',
      parents: 'id, userId, isApproved',
      subjects: 'id, name, schoolId',
      schedules: 'id, classId, subjectId, teacherId, dayOfWeek',
      attendance: 'id, studentId, classId, subjectId, date, status',
      absenceRequests: 'id, studentId, parentId, status',
      announcements: 'id, authorId, targetSchoolId, type, createdAt',
      notes: 'id, studentId, teacherId, type',
      issues: 'id, reportedBy, status',
      grades: 'id, studentId, subjectId, type',
      activities: 'id, classId, date',
    });
  }
}

export const db = new EduTechDatabase();

// Seed initial data
export async function seedDatabase() {
  const userCount = await db.users.count();
  if (userCount > 0) return; // Already seeded

  const now = new Date();

  // Create MoE admin
  const moeUser: User = {
    id: 'moe-admin-1',
    email: 'moe@edutech.gov',
    password: 'password123',
    name: 'Ministry Administrator',
    role: 'moe',
    createdAt: now,
    isActive: true,
  };

  // Create School Admin
  const schoolAdmin: User = {
    id: 'school-admin-1',
    email: 'admin@school1.edu',
    password: 'password123',
    name: 'Ahmad Al-Rahman',
    role: 'school_admin',
    schoolId: 'school-1',
    createdAt: now,
    isActive: true,
  };

  // Create School
  const school: School = {
    id: 'school-1',
    name: 'Al-Faisal International School',
    address: '123 Education Street, Dubai',
    phone: '+971-4-123-4567',
    email: 'info@school1.edu',
    adminId: 'school-admin-1',
    createdAt: now,
    isActive: true,
  };

  // Create Teachers
  const teacherUser1: User = {
    id: 'teacher-user-1',
    email: 'teacher1@school1.edu',
    password: 'password123',
    name: 'Sarah Al-Maktoum',
    role: 'teacher',
    schoolId: 'school-1',
    createdAt: now,
    isActive: true,
  };

  const teacherUser2: User = {
    id: 'teacher-user-2',
    email: 'teacher2@school1.edu',
    password: 'password123',
    name: 'Mohammed Hassan',
    role: 'teacher',
    schoolId: 'school-1',
    createdAt: now,
    isActive: true,
  };

  const teacher1: Teacher = {
    id: 'teacher-1',
    userId: 'teacher-user-1',
    schoolId: 'school-1',
    subjects: ['Mathematics', 'Physics'],
    isSupervisor: true,
    createdAt: now,
    isActive: true,
  };

  const teacher2: Teacher = {
    id: 'teacher-2',
    userId: 'teacher-user-2',
    schoolId: 'school-1',
    subjects: ['Arabic', 'Islamic Studies'],
    isSupervisor: false,
    createdAt: now,
    isActive: true,
  };

  // Create Subjects
  const subjects: Subject[] = [
    { id: 'subject-1', name: 'Mathematics', schoolId: 'school-1', createdAt: now },
    { id: 'subject-2', name: 'Physics', schoolId: 'school-1', createdAt: now },
    { id: 'subject-3', name: 'Arabic', schoolId: 'school-1', createdAt: now },
    { id: 'subject-4', name: 'Islamic Studies', schoolId: 'school-1', createdAt: now },
    { id: 'subject-5', name: 'English', schoolId: 'school-1', createdAt: now },
    { id: 'subject-6', name: 'Science', schoolId: 'school-1', createdAt: now },
  ];

  // Create Classes
  const classes: Class[] = [
    {
      id: 'class-1',
      name: 'Grade 10 - Section A',
      grade: '10',
      schoolId: 'school-1',
      mobilityLevel: 'medium',
      createdAt: now,
      isActive: true,
    },
    {
      id: 'class-2',
      name: 'Grade 10 - Section B',
      grade: '10',
      schoolId: 'school-1',
      mobilityLevel: 'high',
      createdAt: now,
      isActive: true,
    },
    {
      id: 'class-3',
      name: 'Grade 11 - Section A',
      grade: '11',
      schoolId: 'school-1',
      mobilityLevel: 'low',
      createdAt: now,
      isActive: true,
    },
  ];

  // Create Parent User
  const parentUser: User = {
    id: 'parent-user-1',
    email: 'parent@example.com',
    password: 'password123',
    name: 'Fatima Al-Rashid',
    role: 'parent',
    createdAt: now,
    isActive: true,
  };

  const parent: Parent = {
    id: 'parent-1',
    userId: 'parent-user-1',
    studentIds: ['student-1', 'student-2'],
    isApproved: true,
    createdAt: now,
  };

  // Create Students
  const students: Student[] = [
    {
      id: 'student-1',
      name: 'Omar Al-Rashid',
      studentNumber: 'STU-2024-001',
      classId: 'class-1',
      parentId: 'parent-1',
      dateOfBirth: new Date('2009-05-15'),
      gender: 'male',
      createdAt: now,
      isActive: true,
    },
    {
      id: 'student-2',
      name: 'Layla Al-Rashid',
      studentNumber: 'STU-2024-002',
      classId: 'class-2',
      parentId: 'parent-1',
      dateOfBirth: new Date('2010-08-22'),
      gender: 'female',
      createdAt: now,
      isActive: true,
    },
    {
      id: 'student-3',
      name: 'Khalid Abdullah',
      studentNumber: 'STU-2024-003',
      classId: 'class-1',
      dateOfBirth: new Date('2009-02-10'),
      gender: 'male',
      createdAt: now,
      isActive: true,
    },
    {
      id: 'student-4',
      name: 'Mariam Hassan',
      studentNumber: 'STU-2024-004',
      classId: 'class-1',
      dateOfBirth: new Date('2009-11-30'),
      gender: 'female',
      createdAt: now,
      isActive: true,
    },
    {
      id: 'student-5',
      name: 'Yousef Al-Qasimi',
      studentNumber: 'STU-2024-005',
      classId: 'class-2',
      dateOfBirth: new Date('2009-07-18'),
      gender: 'male',
      createdAt: now,
      isActive: true,
    },
  ];

  // Create sample attendance records
  const attendanceRecords: Attendance[] = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    for (const student of students) {
      const statuses: Array<'present' | 'absent' | 'late' | 'excused'> = ['present', 'absent', 'late', 'excused'];
      const randomStatus = Math.random() > 0.85 
        ? statuses[Math.floor(Math.random() * statuses.length)]
        : 'present';
      
      attendanceRecords.push({
        id: `attendance-${student.id}-${i}`,
        studentId: student.id,
        classId: student.classId,
        subjectId: 'subject-1',
        teacherId: 'teacher-1',
        date: date,
        status: randomStatus,
        createdAt: date,
      });
    }
  }

  // Create sample announcements
  const announcements: Announcement[] = [
    {
      id: 'announcement-1',
      title: 'School Holiday Notice',
      content: 'The school will be closed for National Day celebrations from December 2-3.',
      authorId: 'school-admin-1',
      authorRole: 'school_admin',
      targetSchoolId: 'school-1',
      type: 'announcement',
      priority: 'medium',
      createdAt: now,
    },
    {
      id: 'announcement-2',
      title: 'Parent-Teacher Meeting',
      content: 'Parent-teacher conferences will be held next week. Please check your schedule.',
      authorId: 'school-admin-1',
      authorRole: 'school_admin',
      targetSchoolId: 'school-1',
      type: 'announcement',
      priority: 'high',
      createdAt: now,
    },
  ];

  // Create absence requests
  const absenceRequests: AbsenceRequest[] = [
    {
      id: 'absence-1',
      studentId: 'student-1',
      parentId: 'parent-1',
      startDate: new Date(today.getTime() + 86400000 * 2),
      endDate: new Date(today.getTime() + 86400000 * 3),
      reason: 'Medical appointment',
      status: 'pending',
      createdAt: now,
    },
  ];

  // Insert all data
  await db.users.bulkAdd([moeUser, schoolAdmin, teacherUser1, teacherUser2, parentUser]);
  await db.schools.add(school);
  await db.teachers.bulkAdd([teacher1, teacher2]);
  await db.subjects.bulkAdd(subjects);
  await db.classes.bulkAdd(classes);
  await db.parents.add(parent);
  await db.students.bulkAdd(students);
  await db.attendance.bulkAdd(attendanceRecords);
  await db.announcements.bulkAdd(announcements);
  await db.absenceRequests.bulkAdd(absenceRequests);
}

