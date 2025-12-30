
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Exam, Submission, UserRole, QuestionType, ActivityLog, ActivityType } from '../types';

interface AppContextType {
  currentUser: User | null;
  allUsers: User[];
  exams: Exam[];
  submissions: Submission[];
  activityLogs: ActivityLog[];
  login: (role: UserRole, name: string, email: string, isSignUp: boolean, metadata?: { department?: string, matricNumber?: string, yearOfAdmission?: string, institute?: string }) => void;
  logout: () => void;
  addExam: (exam: Exam) => void;
  addSubmission: (submission: Submission) => void;
  updateSubmission: (submissionId: string, updates: Partial<Submission>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const MOCK_EXAMS: Exam[] = [
  {
    id: 'e1',
    title: 'Introduction to Ethical Governance',
    description: 'Covers the core principles of the Ladtem Commission regarding transparency and ethics.',
    durationMinutes: 45,
    createdBy: 'u2',
    createdAt: new Date().toISOString(),
    questions: [
      {
        id: 'q1',
        text: 'What is the primary mission of the Ladtem Commission?',
        type: QuestionType.MCQ,
        points: 2,
        options: ['Profit maximization', 'Public trust and transparency', 'Territorial expansion', 'Algorithm optimization'],
        correctAnswer: 'Public trust and transparency'
      },
      {
        id: 'q2',
        text: 'Describe why accountability is vital in public administration.',
        type: QuestionType.SHORT_ANSWER,
        points: 8,
        rubric: 'Must mention institutional trust, prevention of corruption, and democratic stability.'
      }
    ]
  }
];

// Pre-fill some mock students for the Admin view
const MOCK_USERS: User[] = [
  { id: 's1', name: 'Alice Johnson', email: 'alice@ladtem.org', role: UserRole.STUDENT, institute: 'DFMI', matricNumber: 'DF/23/001', isPresent: false },
  { id: 's2', name: 'Bob Smith', email: 'bob@ladtem.org', role: UserRole.STUDENT, institute: 'IES', matricNumber: 'IE/23/042', isPresent: false },
  { id: 'x1', name: 'Dr. Sarah', email: 'sarah@ladtem.org', role: UserRole.EXAMINER, isPresent: false }
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('ladtem_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [allUsers, setAllUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('ladtem_all_users');
    return saved ? JSON.parse(saved) : MOCK_USERS;
  });

  const [exams, setExams] = useState<Exam[]>(() => {
    const saved = localStorage.getItem('ladtem_exams');
    return saved ? JSON.parse(saved) : MOCK_EXAMS;
  });

  const [submissions, setSubmissions] = useState<Submission[]>(() => {
    const saved = localStorage.getItem('ladtem_submissions');
    return saved ? JSON.parse(saved) : [];
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem('ladtem_logs');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('ladtem_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('ladtem_all_users', JSON.stringify(allUsers));
  }, [allUsers]);

  useEffect(() => {
    localStorage.setItem('ladtem_exams', JSON.stringify(exams));
  }, [exams]);

  useEffect(() => {
    localStorage.setItem('ladtem_submissions', JSON.stringify(submissions));
  }, [submissions]);

  useEffect(() => {
    localStorage.setItem('ladtem_logs', JSON.stringify(activityLogs));
  }, [activityLogs]);

  const login = (role: UserRole, name: string, email: string, isSignUp: boolean, metadata?: { department?: string, matricNumber?: string, yearOfAdmission?: string, institute?: string }) => {
    // Check if user already exists in registry by email
    const existingUser = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    let userToAuth: User;

    if (existingUser) {
      userToAuth = { ...existingUser, isPresent: true, lastActive: new Date().toISOString() };
      // Update the registry
      setAllUsers(prev => prev.map(u => u.id === existingUser.id ? userToAuth : u));
    } else {
      const userId = `u_${Date.now()}`;
      userToAuth = {
        id: userId,
        name: name || `${role.charAt(0) + role.slice(1).toLowerCase()} User`,
        email: email.toLowerCase(),
        role,
        isPresent: true,
        lastActive: new Date().toISOString(),
        ...metadata
      };
      setAllUsers(prev => [...prev, userToAuth]);
    }
    
    // Record Activity
    const newLog: ActivityLog = {
      id: `log_${Date.now()}`,
      userId: userToAuth.id,
      userName: userToAuth.name,
      userRole: role,
      type: isSignUp ? ActivityType.SIGNUP : ActivityType.LOGIN,
      timestamp: new Date().toISOString(),
      details: isSignUp ? `New ${role.toLowerCase()} registration` : `Successful ${role.toLowerCase()} authentication (Marked Present)`
    };

    setActivityLogs(prev => [newLog, ...prev]);
    setCurrentUser(userToAuth);
  };

  const logout = () => {
    if (currentUser) {
      setAllUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, isPresent: false } : u));
    }
    setCurrentUser(null);
  };

  const addExam = (exam: Exam) => setExams(prev => [...prev, exam]);

  const addSubmission = (submission: Submission) => {
    const newLog: ActivityLog = {
      id: `log_sub_${Date.now()}`,
      userId: submission.studentId,
      userName: currentUser?.name || 'Student',
      userRole: UserRole.STUDENT,
      type: ActivityType.SUBMISSION,
      timestamp: new Date().toISOString(),
      details: `Submitted exam response for ID: ${submission.examId}`
    };
    setActivityLogs(prev => [newLog, ...prev]);
    setSubmissions(prev => [...prev, submission]);
  };

  const updateSubmission = (submissionId: string, updates: Partial<Submission>) => {
    setSubmissions(prev => prev.map(s => s.id === submissionId ? { ...s, ...updates } : s));
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      allUsers,
      exams,
      submissions,
      activityLogs,
      login,
      logout,
      addExam,
      addSubmission,
      updateSubmission
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
