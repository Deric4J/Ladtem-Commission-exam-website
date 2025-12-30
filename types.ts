
export enum UserRole {
  STUDENT = 'STUDENT',
  EXAMINER = 'EXAMINER',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isPresent?: boolean;
  lastActive?: string;
  // Student specific fields
  department?: string;
  matricNumber?: string;
  yearOfAdmission?: string;
  institute?: string;
}

export enum ActivityType {
  LOGIN = 'LOGIN',
  SIGNUP = 'SIGNUP',
  SUBMISSION = 'SUBMISSION'
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  type: ActivityType;
  timestamp: string;
  details?: string;
}

export enum QuestionType {
  MCQ = 'MCQ',
  SHORT_ANSWER = 'SHORT_ANSWER'
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  points: number;
  options?: string[]; // For MCQ
  correctAnswer?: string; // For MCQ
  rubric?: string; // For Short Answer grading guidance
}

export interface Exam {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
  questions: Question[];
  createdBy: string;
  createdAt: string;
  startTime?: string;
}

export interface Answer {
  questionId: string;
  value: string;
}

export interface Submission {
  id: string;
  examId: string;
  studentId: string;
  answers: Answer[];
  submittedAt: string;
  status: 'SUBMITTED' | 'GRADING' | 'COMPLETED';
  score?: number;
  aiFeedback?: string;
  examinerComments?: string;
}

export interface GradingResult {
  score: number;
  feedback: string;
  anomaliesDetected?: boolean;
}
