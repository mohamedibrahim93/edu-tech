'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'ar' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: 'rtl' | 'ltr';
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Arabic translations
const ar: Record<string, string> = {
  // App
  'app.name': 'إيدو تك',
  'app.description': 'نظام إدارة التعليم',
  
  // Auth
  'auth.login': 'تسجيل الدخول',
  'auth.logout': 'تسجيل الخروج',
  'auth.email': 'البريد الإلكتروني',
  'auth.password': 'كلمة المرور',
  'auth.welcome': 'مرحباً بعودتك',
  'auth.signInToContinue': 'سجل دخولك للمتابعة',
  'auth.forgotPassword': 'نسيت كلمة المرور؟',
  'auth.rememberMe': 'تذكرني',
  'auth.signingIn': 'جاري تسجيل الدخول...',
  'auth.invalidCredentials': 'بيانات الدخول غير صحيحة',
  
  // Navigation
  'nav.dashboard': 'لوحة التحكم',
  'nav.schools': 'المدارس',
  'nav.classes': 'الفصول',
  'nav.students': 'الطلاب',
  'nav.teachers': 'المعلمين',
  'nav.parents': 'أولياء الأمور',
  'nav.attendance': 'الحضور',
  'nav.schedules': 'الجداول',
  'nav.absenceRequests': 'طلبات الغياب',
  'nav.announcements': 'الإعلانات',
  'nav.reports': 'التقارير',
  'nav.issues': 'المشكلات',
  'nav.myChildren': 'أبنائي',
  'nav.settings': 'الإعدادات',
  
  // Roles
  'role.moe': 'وزارة التعليم',
  'role.school_admin': 'مدير المدرسة',
  'role.teacher': 'معلم',
  'role.parent': 'ولي أمر',
  
  // Common
  'common.save': 'حفظ',
  'common.cancel': 'إلغاء',
  'common.delete': 'حذف',
  'common.edit': 'تعديل',
  'common.add': 'إضافة',
  'common.search': 'بحث',
  'common.filter': 'تصفية',
  'common.export': 'تصدير',
  'common.import': 'استيراد',
  'common.loading': 'جاري التحميل...',
  'common.noData': 'لا توجد بيانات',
  'common.actions': 'الإجراءات',
  'common.status': 'الحالة',
  'common.active': 'نشط',
  'common.inactive': 'غير نشط',
  'common.all': 'الكل',
  'common.yes': 'نعم',
  'common.no': 'لا',
  'common.close': 'إغلاق',
  'common.submit': 'إرسال',
  'common.update': 'تحديث',
  'common.create': 'إنشاء',
  'common.view': 'عرض',
  'common.viewAll': 'عرض الكل',
  'common.details': 'التفاصيل',
  'common.total': 'الإجمالي',
  'common.date': 'التاريخ',
  'common.time': 'الوقت',
  'common.name': 'الاسم',
  'common.email': 'البريد الإلكتروني',
  'common.phone': 'الهاتف',
  'common.address': 'العنوان',
  'common.language': 'اللغة',
  'common.arabic': 'العربية',
  'common.english': 'English',
  
  // Dashboard
  'dashboard.welcome': 'مرحباً بعودتك',
  'dashboard.quickActions': 'الإجراءات السريعة',
  'dashboard.todayAttendance': 'حضور اليوم',
  'dashboard.recentAnnouncements': 'آخر الإعلانات',
  'dashboard.today': 'اليوم',
  'dashboard.noAnnouncements': 'لا توجد إعلانات',
  'dashboard.totalSchools': 'إجمالي المدارس',
  'dashboard.totalStudents': 'إجمالي الطلاب',
  'dashboard.totalTeachers': 'إجمالي المعلمين',
  'dashboard.activeClasses': 'الفصول النشطة',
  'dashboard.attendanceRate': 'نسبة الحضور',
  'dashboard.mySubjects': 'موادي',
  'dashboard.todayClasses': 'فصول اليوم',
  'dashboard.attendanceTaken': 'تم أخذ الحضور',
  'dashboard.supervisor': 'مشرف',
  'dashboard.myChildren': 'أبنائي',
  'dashboard.pendingRequests': 'الطلبات المعلقة',
  
  // Students
  'students.title': 'الطلاب',
  'students.subtitle': 'إدارة سجلات ومعلومات الطلاب',
  'students.addStudent': 'إضافة طالب',
  'students.editStudent': 'تعديل طالب',
  'students.noStudents': 'لا يوجد طلاب',
  'students.noStudentsDesc': 'ابدأ بإضافة أول طالب إلى النظام',
  'students.totalStudents': 'إجمالي الطلاب',
  'students.maleStudents': 'الطلاب الذكور',
  'students.femaleStudents': 'الطالبات',
  'students.fullName': 'الاسم الكامل',
  'students.studentNumber': 'رقم الطالب',
  'students.class': 'الفصل',
  'students.dateOfBirth': 'تاريخ الميلاد',
  'students.gender': 'الجنس',
  'students.male': 'ذكر',
  'students.female': 'أنثى',
  'students.selectClass': 'اختر فصلاً',
  
  // Classes
  'classes.title': 'الفصول',
  'classes.subtitle': 'إدارة سجلات الفصول والتعيينات',
  'classes.addClass': 'إضافة فصل',
  'classes.editClass': 'تعديل فصل',
  'classes.noClasses': 'لا توجد فصول',
  'classes.noClassesDesc': 'ابدأ بإنشاء أول فصل',
  'classes.className': 'اسم الفصل',
  'classes.gradeLevel': 'المستوى الدراسي',
  'classes.mobilityLevel': 'مستوى التنقل',
  'classes.low': 'منخفض',
  'classes.medium': 'متوسط',
  'classes.high': 'عالي',
  
  // Teachers
  'teachers.title': 'المعلمين',
  'teachers.subtitle': 'إدارة حسابات وتعيينات المعلمين',
  'teachers.addTeacher': 'إضافة معلم',
  'teachers.editTeacher': 'تعديل معلم',
  'teachers.subjects': 'المواد',
  'teachers.isSupervisor': 'مشرف',
  'teachers.subjectsPlaceholder': 'رياضيات، فيزياء، كيمياء',
  
  // Parents
  'parents.title': 'أولياء الأمور',
  'parents.subtitle': 'إدارة حسابات أولياء الأمور والموافقات',
  'parents.addParent': 'إضافة ولي أمر',
  'parents.editParent': 'تعديل ولي أمر',
  'parents.linkChildren': 'ربط الأبناء',
  'parents.noChildren': 'لا يوجد أبناء مرتبطين',
  'parents.approved': 'موافق عليه',
  'parents.pending': 'قيد الانتظار',
  
  // Attendance
  'attendance.title': 'الحضور',
  'attendance.subtitle': 'تسجيل ومتابعة الحضور',
  'attendance.takeAttendance': 'تسجيل الحضور',
  'attendance.present': 'حاضر',
  'attendance.absent': 'غائب',
  'attendance.late': 'متأخر',
  'attendance.excused': 'بعذر',
  'attendance.selectClass': 'اختر فصلاً',
  'attendance.selectDate': 'اختر تاريخاً',
  'attendance.saveAttendance': 'حفظ الحضور',
  'attendance.rate': 'نسبة الحضور',
  
  // Schedules
  'schedules.title': 'الجداول',
  'schedules.subtitle': 'إدارة جداول الفصول',
  'schedules.addSchedule': 'إضافة جدول',
  'schedules.noClasses': 'لا توجد حصص',
  'schedules.dayOfWeek': 'يوم الأسبوع',
  'schedules.startTime': 'وقت البدء',
  'schedules.endTime': 'وقت الانتهاء',
  'schedules.subject': 'المادة',
  'schedules.colorLegend': 'دليل الألوان',
  
  // Days
  'day.sunday': 'الأحد',
  'day.monday': 'الإثنين',
  'day.tuesday': 'الثلاثاء',
  'day.wednesday': 'الأربعاء',
  'day.thursday': 'الخميس',
  'day.friday': 'الجمعة',
  'day.saturday': 'السبت',
  
  // Absence Requests
  'absenceRequests.title': 'طلبات الغياب',
  'absenceRequests.subtitle': 'إدارة طلبات غياب الطلاب',
  'absenceRequests.newRequest': 'طلب جديد',
  'absenceRequests.submitRequest': 'إرسال الطلب',
  'absenceRequests.startDate': 'تاريخ البداية',
  'absenceRequests.endDate': 'تاريخ النهاية',
  'absenceRequests.reason': 'السبب',
  'absenceRequests.requestedBy': 'مقدم الطلب',
  'absenceRequests.reviewedBy': 'تمت المراجعة بواسطة',
  'absenceRequests.approve': 'موافقة',
  'absenceRequests.reject': 'رفض',
  'absenceRequests.approved': 'موافق عليه',
  'absenceRequests.rejected': 'مرفوض',
  'absenceRequests.pending': 'قيد الانتظار',
  'absenceRequests.noRequests': 'لا توجد طلبات غياب',
  'absenceRequests.student': 'الطالب',
  'absenceRequests.dates': 'التواريخ',
  'absenceRequests.requestDetails': 'تفاصيل الطلب',
  
  // Announcements
  'announcements.title': 'الإعلانات',
  'announcements.subtitle': 'عرض وإدارة الإعلانات',
  'announcements.newAnnouncement': 'إعلان جديد',
  'announcements.editAnnouncement': 'تعديل إعلان',
  'announcements.noAnnouncements': 'لا توجد إعلانات',
  'announcements.content': 'المحتوى',
  'announcements.type': 'النوع',
  'announcements.priority': 'الأولوية',
  'announcements.announcement': 'إعلان',
  'announcements.alert': 'تنبيه',
  'announcements.instruction': 'تعليمات',
  'announcements.evacuation': 'إخلاء',
  'announcements.urgent': 'عاجل',
  
  // Reports
  'reports.title': 'التقارير',
  'reports.subtitle': 'عرض تقارير الحضور والأداء',
  'reports.exportReport': 'تصدير التقرير',
  'reports.last7Days': 'آخر 7 أيام',
  'reports.last30Days': 'آخر 30 يوماً',
  'reports.thisMonth': 'هذا الشهر',
  'reports.classAttendanceReport': 'تقرير حضور الفصول',
  'reports.performanceByClass': 'الأداء حسب الفصل',
  'reports.enrolledStudents': 'الطلاب المسجلين',
  'reports.activeTeachers': 'المعلمين النشطين',
  'reports.noData': 'لا توجد بيانات حضور للفترة المحددة',
  
  // Issues
  'issues.title': 'المشكلات',
  'issues.subtitle': 'الإبلاغ عن المشكلات ومتابعتها',
  'issues.reportIssue': 'الإبلاغ عن مشكلة',
  'issues.submitIssue': 'إرسال المشكلة',
  'issues.issueDetails': 'تفاصيل المشكلة',
  'issues.noIssues': 'لا توجد مشكلات',
  'issues.subject': 'الموضوع',
  'issues.description': 'الوصف',
  'issues.open': 'مفتوح',
  'issues.inProgress': 'قيد المعالجة',
  'issues.resolved': 'تم الحل',
  'issues.closed': 'مغلق',
  'issues.updateStatus': 'تحديث الحالة',
  
  // My Children
  'myChildren.title': 'أبنائي',
  'myChildren.subtitle': 'عرض معلومات وحضور أبنائك',
  'myChildren.noChildren': 'لم يتم العثور على أبناء',
  'myChildren.noChildrenDesc': 'حسابك غير مرتبط بأي طلاب بعد',
  'myChildren.attendanceLast30Days': 'الحضور (آخر 30 يوماً)',
  'myChildren.recentAttendance': 'الحضور الأخير',
  'myChildren.schoolAnnouncements': 'إعلانات المدرسة',
  'myChildren.recentUpdates': 'آخر التحديثات',
  'myChildren.grade': 'الصف',
  'myChildren.class': 'الفصل',
  'myChildren.dateOfBirth': 'تاريخ الميلاد',
  'myChildren.gender': 'الجنس',
  
  // Settings
  'settings.title': 'الإعدادات',
  'settings.subtitle': 'إدارة إعدادات حسابك',
  'settings.profile': 'الملف الشخصي',
  'settings.security': 'الأمان',
  'settings.notifications': 'الإشعارات',
  'settings.profileInfo': 'معلومات الملف الشخصي',
  'settings.updateProfile': 'تحديث معلوماتك الشخصية',
  'settings.changePassword': 'تغيير كلمة المرور',
  'settings.currentPassword': 'كلمة المرور الحالية',
  'settings.newPassword': 'كلمة المرور الجديدة',
  'settings.confirmPassword': 'تأكيد كلمة المرور',
  'settings.saveChanges': 'حفظ التغييرات',
  'settings.notificationPrefs': 'تفضيلات الإشعارات',
  'settings.emailAnnouncements': 'إعلانات البريد الإلكتروني',
  'settings.urgentAlerts': 'التنبيهات العاجلة',
  'settings.attendanceReminders': 'تذكيرات الحضور',
  'settings.absenceUpdates': 'تحديثات طلبات الغياب',
  'settings.dangerZone': 'منطقة الخطر',
  'settings.irreversibleActions': 'إجراءات لا يمكن التراجع عنها',
  'settings.signOutAccount': 'تسجيل الخروج من حسابك',
  'settings.passwordMismatch': 'كلمات المرور غير متطابقة',
  'settings.passwordTooShort': 'كلمة المرور يجب أن تكون 6 أحرف على الأقل',
  'settings.wrongPassword': 'كلمة المرور الحالية غير صحيحة',
  'settings.profileUpdated': 'تم تحديث الملف الشخصي بنجاح!',
  'settings.passwordChanged': 'تم تغيير كلمة المرور بنجاح!',
  'settings.preferencesSaved': 'تم حفظ التفضيلات!',
  
  // Schools
  'schools.title': 'المدارس',
  'schools.subtitle': 'إدارة المدارس',
  'schools.addSchool': 'إضافة مدرسة',
  'schools.editSchool': 'تعديل مدرسة',
  'schools.schoolName': 'اسم المدرسة',
  'schools.noSchools': 'لا توجد مدارس',
};

// English translations
const en: Record<string, string> = {
  // App
  'app.name': 'EduTech',
  'app.description': 'Education Management System',
  
  // Auth
  'auth.login': 'Login',
  'auth.logout': 'Logout',
  'auth.email': 'Email',
  'auth.password': 'Password',
  'auth.welcome': 'Welcome Back',
  'auth.signInToContinue': 'Sign in to continue',
  'auth.forgotPassword': 'Forgot Password?',
  'auth.rememberMe': 'Remember me',
  'auth.signingIn': 'Signing in...',
  'auth.invalidCredentials': 'Invalid credentials',
  
  // Navigation
  'nav.dashboard': 'Dashboard',
  'nav.schools': 'Schools',
  'nav.classes': 'Classes',
  'nav.students': 'Students',
  'nav.teachers': 'Teachers',
  'nav.parents': 'Parents',
  'nav.attendance': 'Attendance',
  'nav.schedules': 'Schedules',
  'nav.absenceRequests': 'Absence Requests',
  'nav.announcements': 'Announcements',
  'nav.reports': 'Reports',
  'nav.issues': 'Issues',
  'nav.myChildren': 'My Children',
  'nav.settings': 'Settings',
  
  // Roles
  'role.moe': 'Ministry of Education',
  'role.school_admin': 'School Admin',
  'role.teacher': 'Teacher',
  'role.parent': 'Parent',
  
  // Common
  'common.save': 'Save',
  'common.cancel': 'Cancel',
  'common.delete': 'Delete',
  'common.edit': 'Edit',
  'common.add': 'Add',
  'common.search': 'Search',
  'common.filter': 'Filter',
  'common.export': 'Export',
  'common.import': 'Import',
  'common.loading': 'Loading...',
  'common.noData': 'No data',
  'common.actions': 'Actions',
  'common.status': 'Status',
  'common.active': 'Active',
  'common.inactive': 'Inactive',
  'common.all': 'All',
  'common.yes': 'Yes',
  'common.no': 'No',
  'common.close': 'Close',
  'common.submit': 'Submit',
  'common.update': 'Update',
  'common.create': 'Create',
  'common.view': 'View',
  'common.viewAll': 'View All',
  'common.details': 'Details',
  'common.total': 'Total',
  'common.date': 'Date',
  'common.time': 'Time',
  'common.name': 'Name',
  'common.email': 'Email',
  'common.phone': 'Phone',
  'common.address': 'Address',
  'common.language': 'Language',
  'common.arabic': 'العربية',
  'common.english': 'English',
  
  // Dashboard
  'dashboard.welcome': 'Welcome back',
  'dashboard.quickActions': 'Quick Actions',
  'dashboard.todayAttendance': "Today's Attendance",
  'dashboard.recentAnnouncements': 'Recent Announcements',
  'dashboard.today': 'Today',
  'dashboard.noAnnouncements': 'No announcements yet',
  'dashboard.totalSchools': 'Total Schools',
  'dashboard.totalStudents': 'Total Students',
  'dashboard.totalTeachers': 'Total Teachers',
  'dashboard.activeClasses': 'Active Classes',
  'dashboard.attendanceRate': 'Attendance Rate',
  'dashboard.mySubjects': 'My Subjects',
  'dashboard.todayClasses': "Today's Classes",
  'dashboard.attendanceTaken': 'Attendance Taken',
  'dashboard.supervisor': 'Supervisor',
  'dashboard.myChildren': 'My Children',
  'dashboard.pendingRequests': 'Pending Requests',
  
  // Students
  'students.title': 'Students',
  'students.subtitle': 'Manage student records and information',
  'students.addStudent': 'Add Student',
  'students.editStudent': 'Edit Student',
  'students.noStudents': 'No students found',
  'students.noStudentsDesc': 'Get started by adding your first student to the system',
  'students.totalStudents': 'Total Students',
  'students.maleStudents': 'Male Students',
  'students.femaleStudents': 'Female Students',
  'students.fullName': 'Full Name',
  'students.studentNumber': 'Student Number',
  'students.class': 'Class',
  'students.dateOfBirth': 'Date of Birth',
  'students.gender': 'Gender',
  'students.male': 'Male',
  'students.female': 'Female',
  'students.selectClass': 'Select a class',
  
  // Classes
  'classes.title': 'Classes',
  'classes.subtitle': 'Manage class records and assignments',
  'classes.addClass': 'Add Class',
  'classes.editClass': 'Edit Class',
  'classes.noClasses': 'No Classes Found',
  'classes.noClassesDesc': 'Get started by creating your first class',
  'classes.className': 'Class Name',
  'classes.gradeLevel': 'Grade Level',
  'classes.mobilityLevel': 'Mobility Level',
  'classes.low': 'Low',
  'classes.medium': 'Medium',
  'classes.high': 'High',
  
  // Teachers
  'teachers.title': 'Teachers',
  'teachers.subtitle': 'Manage teacher accounts and assignments',
  'teachers.addTeacher': 'Add Teacher',
  'teachers.editTeacher': 'Edit Teacher',
  'teachers.subjects': 'Subjects',
  'teachers.isSupervisor': 'Is Supervisor',
  'teachers.subjectsPlaceholder': 'Math, Physics, Chemistry',
  
  // Parents
  'parents.title': 'Parents',
  'parents.subtitle': 'Manage parent accounts and approvals',
  'parents.addParent': 'Add Parent',
  'parents.editParent': 'Edit Parent',
  'parents.linkChildren': 'Link Children',
  'parents.noChildren': 'No children linked',
  'parents.approved': 'Approved',
  'parents.pending': 'Pending',
  
  // Attendance
  'attendance.title': 'Attendance',
  'attendance.subtitle': 'Record and track attendance',
  'attendance.takeAttendance': 'Take Attendance',
  'attendance.present': 'Present',
  'attendance.absent': 'Absent',
  'attendance.late': 'Late',
  'attendance.excused': 'Excused',
  'attendance.selectClass': 'Select a class',
  'attendance.selectDate': 'Select a date',
  'attendance.saveAttendance': 'Save Attendance',
  'attendance.rate': 'Attendance Rate',
  
  // Schedules
  'schedules.title': 'Schedules',
  'schedules.subtitle': 'Manage class schedules',
  'schedules.addSchedule': 'Add Schedule',
  'schedules.noClasses': 'No classes',
  'schedules.dayOfWeek': 'Day of Week',
  'schedules.startTime': 'Start Time',
  'schedules.endTime': 'End Time',
  'schedules.subject': 'Subject',
  'schedules.colorLegend': 'Color legend',
  
  // Days
  'day.sunday': 'Sunday',
  'day.monday': 'Monday',
  'day.tuesday': 'Tuesday',
  'day.wednesday': 'Wednesday',
  'day.thursday': 'Thursday',
  'day.friday': 'Friday',
  'day.saturday': 'Saturday',
  
  // Absence Requests
  'absenceRequests.title': 'Absence Requests',
  'absenceRequests.subtitle': 'Manage student absence requests',
  'absenceRequests.newRequest': 'New Request',
  'absenceRequests.submitRequest': 'Submit Request',
  'absenceRequests.startDate': 'Start Date',
  'absenceRequests.endDate': 'End Date',
  'absenceRequests.reason': 'Reason',
  'absenceRequests.requestedBy': 'Requested By',
  'absenceRequests.reviewedBy': 'Reviewed By',
  'absenceRequests.approve': 'Approve',
  'absenceRequests.reject': 'Reject',
  'absenceRequests.approved': 'Approved',
  'absenceRequests.rejected': 'Rejected',
  'absenceRequests.pending': 'Pending',
  'absenceRequests.noRequests': 'No absence requests found',
  'absenceRequests.student': 'Student',
  'absenceRequests.dates': 'Dates',
  'absenceRequests.requestDetails': 'Request Details',
  
  // Announcements
  'announcements.title': 'Announcements',
  'announcements.subtitle': 'View and manage announcements',
  'announcements.newAnnouncement': 'New Announcement',
  'announcements.editAnnouncement': 'Edit Announcement',
  'announcements.noAnnouncements': 'No Announcements',
  'announcements.content': 'Content',
  'announcements.type': 'Type',
  'announcements.priority': 'Priority',
  'announcements.announcement': 'Announcement',
  'announcements.alert': 'Alert',
  'announcements.instruction': 'Instruction',
  'announcements.evacuation': 'Evacuation',
  'announcements.urgent': 'Urgent',
  
  // Reports
  'reports.title': 'Reports',
  'reports.subtitle': 'View attendance and performance reports',
  'reports.exportReport': 'Export Report',
  'reports.last7Days': 'Last 7 Days',
  'reports.last30Days': 'Last 30 Days',
  'reports.thisMonth': 'This Month',
  'reports.classAttendanceReport': 'Class Attendance Report',
  'reports.performanceByClass': 'Performance by class',
  'reports.enrolledStudents': 'Enrolled students',
  'reports.activeTeachers': 'Active teachers',
  'reports.noData': 'No attendance data available for the selected period',
  
  // Issues
  'issues.title': 'Issues',
  'issues.subtitle': 'Report and track issues',
  'issues.reportIssue': 'Report Issue',
  'issues.submitIssue': 'Submit Issue',
  'issues.issueDetails': 'Issue Details',
  'issues.noIssues': 'No Issues Found',
  'issues.subject': 'Subject',
  'issues.description': 'Description',
  'issues.open': 'Open',
  'issues.inProgress': 'In Progress',
  'issues.resolved': 'Resolved',
  'issues.closed': 'Closed',
  'issues.updateStatus': 'Update Status',
  
  // My Children
  'myChildren.title': 'My Children',
  'myChildren.subtitle': "View your children's information and attendance",
  'myChildren.noChildren': 'No Children Found',
  'myChildren.noChildrenDesc': 'Your account is not linked to any students yet',
  'myChildren.attendanceLast30Days': 'Attendance (Last 30 Days)',
  'myChildren.recentAttendance': 'Recent Attendance',
  'myChildren.schoolAnnouncements': 'School Announcements',
  'myChildren.recentUpdates': 'Recent updates',
  'myChildren.grade': 'Grade',
  'myChildren.class': 'Class',
  'myChildren.dateOfBirth': 'Date of Birth',
  'myChildren.gender': 'Gender',
  
  // Settings
  'settings.title': 'Settings',
  'settings.subtitle': 'Manage your account settings',
  'settings.profile': 'Profile',
  'settings.security': 'Security',
  'settings.notifications': 'Notifications',
  'settings.profileInfo': 'Profile Information',
  'settings.updateProfile': 'Update your personal information',
  'settings.changePassword': 'Change Password',
  'settings.currentPassword': 'Current Password',
  'settings.newPassword': 'New Password',
  'settings.confirmPassword': 'Confirm New Password',
  'settings.saveChanges': 'Save Changes',
  'settings.notificationPrefs': 'Notification Preferences',
  'settings.emailAnnouncements': 'Email Announcements',
  'settings.urgentAlerts': 'Urgent Alerts',
  'settings.attendanceReminders': 'Attendance Reminders',
  'settings.absenceUpdates': 'Absence Request Updates',
  'settings.dangerZone': 'Danger Zone',
  'settings.irreversibleActions': 'Irreversible actions',
  'settings.signOutAccount': 'Sign out from your account',
  'settings.passwordMismatch': 'New passwords do not match',
  'settings.passwordTooShort': 'Password must be at least 6 characters',
  'settings.wrongPassword': 'Current password is incorrect',
  'settings.profileUpdated': 'Profile updated successfully!',
  'settings.passwordChanged': 'Password changed successfully!',
  'settings.preferencesSaved': 'Preferences saved!',
  
  // Schools
  'schools.title': 'Schools',
  'schools.subtitle': 'Manage schools',
  'schools.addSchool': 'Add School',
  'schools.editSchool': 'Edit School',
  'schools.schoolName': 'School Name',
  'schools.noSchools': 'No schools found',
};

const translations: Record<Language, Record<string, string>> = { ar, en };

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('ar');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('language') as Language;
    if (saved && (saved === 'ar' || saved === 'en')) {
      setLanguageState(saved);
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('language', language);
      document.documentElement.lang = language;
      document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    }
  }, [language, mounted]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  const dir = language === 'ar' ? 'rtl' : 'ltr';
  const isRTL = language === 'ar';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
