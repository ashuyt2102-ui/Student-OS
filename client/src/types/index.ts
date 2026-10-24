export type Role = "student" | "teacher" | "principal";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  grade?: string;
  section?: string;
  subject?: string;
  studentId?: string;
  isApproved: boolean;
  avatar?: string;
  createdAt?: string;
}

export interface AttendanceRecord {
  _id: string;
  student: User | string;
  date: string;
  status: "present" | "absent" | "late";
  class: string;
  subject?: string;
  markedBy?: User | string;
  createdAt?: string;
}

export interface MarksRecord {
  _id: string;
  student: User | string;
  subject: string;
  examType: string;
  score: number;
  maxScore: number;
  date: string;
  class: string;
  addedBy?: User | string;
  trend?: string;
}

export interface ExamRecord {
  _id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  room: string;
  class: string;
  subject: string;
  priority: "high" | "normal";
  createdBy?: User | string;
}

export interface Chapter {
  name: string;
  done: boolean;
}

export interface SyllabusRecord {
  _id: string;
  subject: string;
  topic: string;
  description: string;
  progress: number;
  totalTopics: number;
  completedTopics: number;
  class: string;
  chapters: Chapter[];
  teacher?: User | string;
  lastUpdated?: string;
}

export interface NotificationRecord {
  _id: string;
  recipient?: string | null;
  message: string;
  type: "attendance" | "marks" | "exam" | "syllabus" | "approval" | "general";
  read: boolean;
  link?: string;
  createdAt: string;
}
