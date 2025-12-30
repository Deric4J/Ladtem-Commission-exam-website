
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card, Badge, Button } from '../components/Common';
import { Icons } from '../constants';
import { ActivityType, UserRole, User } from '../types';
import ExamCreating from './ExamCreating';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const AdminDashboard: React.FC = () => {
  const { exams, submissions, activityLogs, allUsers, confirmStudent, deleteUser, attendanceRecords } = useApp();
  const [isCreatingExam, setIsCreatingExam] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'audit'>('overview');
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);

  if (isCreatingExam) {
    return <ExamCreating onCancel={() => setIsCreatingExam(false)} />;
  }

  const studentsOnly = allUsers.filter(u => u.role === UserRole.STUDENT);
  const unconfirmedStudents = studentsOnly.filter(s => !s.isConfirmed);
  const onlineStudents = studentsOnly.filter(s => s.isPresent).length;

  const stats = [
    { label: 'Total Students', value: studentsOnly.length, color: 'text-blue-600', icon: <Icons.Users /> },
    { label: 'Now Present', value: onlineStudents, color: 'text-emerald-600', icon: <Icons.Brain /> },
    { label: 'Exams Set', value: exams.length, color: 'text-indigo-600', icon: <Icons.Exam /> },
    { label: 'Pending Approval', value: unconfirmedStudents.length, color: 'text-amber-600', icon: <Icons.Search /> }
  ];

  const chartData = exams.map(exam => {
    const examSubs = submissions.filter(s => s.examId === exam.id && s.status === 'COMPLETED');
    const avgScore = examSubs.length ? (examSubs.reduce((acc, s) => acc + (s.score || 0), 0) / examSubs.length) : 0;
    return { name: exam.title.length > 15 ? exam.title.substring(0, 15) + '...' : exam.title, average: avgScore };
  });

  const getRelativeTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    return date.toLocaleDateString();
  };

  const getStudentPerformance = (studentId: string) => {
    const studentSubs = submissions.filter(s => s.studentId === studentId && s.status === 'COMPLETED');
    if (studentSubs.length === 0) return 0;
    
    let totalScore = 0;
    let totalPossible = 0;

    studentSubs.forEach(sub => {
      const exam = exams.find(e => e.id === sub.examId);
      if (exam) {
        totalScore += (sub.score || 0);
        totalPossible += exam.questions.reduce((acc, q) => acc + q.points, 0);
      }
    });

    return totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : 0;
  };

  const getAttendanceCount = (studentId: string) => {
    return attendanceRecords.filter(r => r.userId === studentId).length;
  };

  const renderOverview = () => (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        <Card title={`Verification Requests (${unconfirmedStudents.length})`} className="border-amber-200 shadow-amber-900/5">
          <div className="space-y-0 -mx-6 -mb-6">
            {unconfirmedStudents.length > 0 ? (
              unconfirmedStudents.map(req => (
                <div key={req.id} className="group px-6 py-5 flex items-center justify-between hover:bg-slate-50 border-b border-slate-100 last:border-b-0 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-black text-lg">
                        {req.name.charAt(0)}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-amber-500 border-2 border-white rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 leading-tight">
                        {req.name} <span className="font-medium text-slate-500">requested account access.</span>
                      </h4>
                      <p className="text-[11px] text-slate-500 font-bold mt-1 uppercase tracking-widest">
                        Matric No: <span className="text-blue-600 font-mono">{req.matricNumber}</span> • {req.institute}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{getRelativeTime(req.lastActive || new Date().toISOString())}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      className="h-9 px-4 text-xs font-black shadow-md"
                      onClick={() => confirmStudent(req.id)}
                    >
                      Confirm
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-9 px-4 text-xs font-black"
                      onClick={() => deleteUser(req.id)}
                    >
                      Decline
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center px-6">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-3">
                  <Icons.Users />
                </div>
                <p className="text-sm text-slate-400 font-medium">No pending verification requests.</p>
              </div>
            )}
          </div>
        </Card>

        <Card title="Performance Trends Across Departments">
          <div className="h-[350px] w-full mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="average" radius={[6, 6, 0, 0]} barSize={40}>
                  {chartData.map((_, index) => <Cell key={index} fill={index % 2 === 0 ? '#3b82f6' : '#6366f1'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="space-y-8">
        <Card title="Security Audit Trail" className="h-full">
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-hide">
            {activityLogs.slice(0, 10).map(log => (
              <div key={log.id} className="flex gap-3 items-start pb-4 border-b border-slate-50 last:border-0">
                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs ${
                  log.type === ActivityType.SIGNUP ? 'bg-emerald-50 text-emerald-600' :
                  log.type === ActivityType.LOGIN ? 'bg-blue-50 text-blue-600' : 
                  log.type === ActivityType.ATTENDANCE ? 'bg-amber-50 text-amber-600' : 'bg-indigo-50 text-indigo-600'
                }`}>
                  {log.type === ActivityType.LOGIN ? <Icons.Users /> : (log.type === ActivityType.ATTENDANCE ? <Icons.Search /> : <Icons.Plus />)}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">{log.userName}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{log.details}</p>
                  <p className="text-[9px] text-slate-400 mt-1">{getRelativeTime(log.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="System Health">
          <div className="flex flex-col items-center justify-center h-full py-4">
            <div className="w-20 h-20 rounded-full border-4 border-emerald-100 flex items-center justify-center mb-3">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Icons.Brain />
              </div>
            </div>
            <p className="text-sm font-bold text-slate-800">100% Secure</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">AI Proctors Active</p>
          </div>
        </Card>
      </div>
    </div>
  );

  const renderStudentRegistry = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Student Registry & Attendance</h2>
          <p className="text-sm text-slate-500">Live monitoring of all students and their cumulative performance.</p>
        </div>
        <div className="flex gap-4">
          <div className="text-center px-4">
             <p className="text-2xl font-black text-blue-600">{studentsOnly.length}</p>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Enrolled</p>
          </div>
          <div className="w-px bg-slate-100"></div>
          <div className="text-center px-4">
             <p className="text-2xl font-black text-emerald-600">{onlineStudents}</p>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Present Now</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {studentsOnly.map(student => {
          const performance = getStudentPerformance(student.id);
          const attendanceCount = getAttendanceCount(student.id);
          return (
            <Card key={student.id} className="hover:border-blue-200 transition-all group">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
                      <Icons.Users />
                    </div>
                    {student.isPresent && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full animate-pulse shadow-lg shadow-emerald-200"></span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      {student.name}
                      {student.isPresent && <Badge variant="success">Present</Badge>}
                      {!student.isConfirmed && <Badge variant="warning">Unverified</Badge>}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium">
                      {student.institute} • <span className="font-mono font-bold text-blue-600">{student.matricNumber}</span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-1 md:max-w-xs flex-col gap-1.5">
                   <div className="flex justify-between text-[10px] font-bold uppercase text-slate-400">
                     <span>Attendance</span>
                     <span className="text-blue-600">{attendanceCount} Exams Attended</span>
                   </div>
                   <div className="flex justify-between text-[10px] font-bold uppercase text-slate-400 mt-1">
                     <span>Grade Avg</span>
                     <span className={performance > 70 ? 'text-emerald-600' : 'text-amber-600'}>{performance}%</span>
                   </div>
                   <div className="h-2 bg-slate-100 rounded-full overflow-hidden mt-1">
                      <div 
                        className={`h-full transition-all duration-1000 ${performance > 70 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                        style={{ width: `${performance}%` }}
                      ></div>
                   </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setSelectedStudent(selectedStudent?.id === student.id ? null : student)}>
                    {selectedStudent?.id === student.id ? 'Hide Details' : 'View Records'}
                  </Button>
                  {!student.isConfirmed && (
                    <Button size="sm" onClick={() => confirmStudent(student.id)}>
                      Confirm Student
                    </Button>
                  )}
                </div>
              </div>

              {selectedStudent?.id === student.id && (
                <div className="mt-8 pt-8 border-t border-slate-100 animate-in slide-in-from-top-4">
                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Performance Column */}
                    <div>
                      <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Icons.Exam /> Academic Performance
                      </h5>
                      <div className="space-y-3">
                        {submissions.filter(s => s.studentId === student.id).map(sub => {
                          const exam = exams.find(e => e.id === sub.examId);
                          return (
                            <div key={sub.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
                              <div>
                                <p className="text-sm font-bold text-slate-800">{exam?.title}</p>
                                <p className="text-[10px] text-slate-500">{new Date(sub.submittedAt).toLocaleDateString()}</p>
                              </div>
                              <div className="text-right">
                                 <span className="text-sm font-black text-blue-600">{sub.score} Pts</span>
                                 <p className="text-[10px] font-bold text-slate-400 uppercase">Graded</p>
                              </div>
                            </div>
                          );
                        })}
                        {submissions.filter(s => s.studentId === student.id).length === 0 && (
                          <p className="text-center text-xs text-slate-400 italic py-4">No academic submissions yet.</p>
                        )}
                      </div>
                    </div>

                    {/* Attendance Column */}
                    <div>
                      <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Icons.Search /> Exam Attendance Log
                      </h5>
                      <div className="space-y-3">
                        {attendanceRecords.filter(r => r.userId === student.id).map(record => {
                          const exam = exams.find(e => e.id === record.examId);
                          return (
                            <div key={record.id} className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100 flex justify-between items-center">
                              <div>
                                <p className="text-sm font-bold text-emerald-800">{exam?.title}</p>
                                <p className="text-[10px] text-emerald-600 font-bold uppercase">Time: {new Date(record.timestamp).toLocaleTimeString()}</p>
                              </div>
                              <Badge variant="success">Present</Badge>
                            </div>
                          );
                        })}
                        {attendanceRecords.filter(r => r.userId === student.id).length === 0 && (
                          <p className="text-center text-xs text-slate-400 italic py-4">No attendance records found.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Oversight</h1>
          <p className="text-slate-500 font-medium">Ladtem Commission Administrative Controls and Analytics.</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-white p-1 rounded-xl border border-slate-200 shadow-sm flex">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'overview' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-600'}`}
            >
              OVERVIEW
            </button>
            <button 
              onClick={() => setActiveTab('students')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'students' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-600'}`}
            >
              REGISTRY
            </button>
          </div>
          <Button variant="secondary" onClick={() => setIsCreatingExam(true)}>
            <Icons.Plus /> Set New Exam
          </Button>
        </div>
      </header>

      {activeTab === 'overview' ? (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <Card key={i} className="hover:shadow-md transition-shadow group">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                    <p className={`text-3xl font-black mt-2 ${stat.color}`}>{stat.value}</p>
                  </div>
                  <div className={`${stat.color} opacity-20 transform scale-125 group-hover:scale-150 transition-transform`}>
                    {stat.icon}
                  </div>
                </div>
              </Card>
            ))}
          </div>
          {renderOverview()}
        </>
      ) : renderStudentRegistry()}
    </div>
  );
};

export default AdminDashboard;
