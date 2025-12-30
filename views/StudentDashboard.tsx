
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Card, Button, Badge } from '../components/Common';
import { LOGO_URL } from '../constants';
import ExamTaking from './ExamTaking';

const StudentDashboard: React.FC = () => {
  const { exams, submissions, currentUser, allUsers } = useApp();
  const [activeExamId, setActiveExamId] = useState<string | null>(null);

  // Sync isConfirmed from registry in case admin confirms while student is logged in
  const registryUser = allUsers.find(u => u.id === currentUser?.id);
  const isConfirmed = registryUser?.isConfirmed || currentUser?.isConfirmed;

  const studentSubmissions = submissions.filter(s => s.studentId === currentUser?.id);
  const getSubmissionForExam = (examId: string) => studentSubmissions.find(s => s.examId === examId);

  if (!isConfirmed) {
    return (
      <div className="max-w-xl mx-auto py-20 animate-in fade-in zoom-in-95 duration-700">
        <Card className="text-center overflow-hidden border-none shadow-2xl">
          <div className="bg-blue-600 p-8 flex flex-col items-center justify-center">
            <div className="w-24 h-24 bg-white rounded-[2rem] p-4 shadow-xl mb-6">
              <img src={LOGO_URL} alt="LADTEM" className="w-full h-full object-contain" />
            </div>
            <h2 className="text-white text-2xl font-black tracking-tight">Access Restricted</h2>
            <p className="text-blue-100 text-sm mt-1 uppercase font-bold tracking-widest">Awaiting Commission Verification</p>
          </div>
          <div className="p-10 space-y-6">
            <div className="space-y-4">
              <p className="text-slate-600 leading-relaxed font-medium">
                Greetings, <span className="text-slate-900 font-bold">{currentUser?.name}</span>. Your registration (Matric: <span className="font-mono font-black text-blue-600">{currentUser?.matricNumber}</span>) has been logged.
              </p>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4 text-left">
                <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                </div>
                <p className="text-xs text-slate-500 font-bold leading-normal">
                  An administrator must manually verify your identity before you can proceed to examinations. Please contact your department if this persists.
                </p>
              </div>
            </div>
            
            <div className="pt-6 border-t border-slate-100">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">Status: Pending Authorization</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (activeExamId) {
    const exam = exams.find(e => e.id === activeExamId);
    if (exam) return <ExamTaking exam={exam} onComplete={() => setActiveExamId(null)} />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">Academic Portal</h1>
          <p className="text-slate-500">Welcome back. View your active assessments and performance insights.</p>
        </div>
        
        {currentUser && (
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-wrap gap-6 shadow-sm">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Institute</p>
              <p className="text-sm font-bold text-blue-600">{currentUser.institute || 'Ladtem Commission'}</p>
            </div>
            <div className="w-px bg-slate-100 hidden sm:block"></div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Department</p>
              <p className="text-sm font-bold text-slate-800">{currentUser.department || 'General Studies'}</p>
            </div>
            <div className="w-px bg-slate-100 hidden sm:block"></div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Matric No.</p>
              <p className="text-sm font-bold text-slate-800 font-mono">{currentUser.matricNumber || 'N/A'}</p>
            </div>
            <div className="w-px bg-slate-100 hidden sm:block"></div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Session</p>
              <p className="text-sm font-bold text-slate-800">{currentUser.yearOfAdmission || '2024'} Entry</p>
            </div>
          </div>
        )}
      </header>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            Available Exams
            <Badge variant="info">{exams.filter(e => !getSubmissionForExam(e.id)).length}</Badge>
          </h2>
          {exams.filter(e => !getSubmissionForExam(e.id)).map(exam => (
            <Card key={exam.id} title={exam.title} actions={<span className="text-xs font-bold text-slate-400">{exam.durationMinutes} mins</span>}>
              <p className="text-slate-600 mb-6 leading-relaxed">{exam.description}</p>
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-500 font-medium">
                  {exam.questions.length} Questions Assessment
                </div>
                <Button onClick={() => setActiveExamId(exam.id)}>
                  Start Examination
                </Button>
              </div>
            </Card>
          ))}
          {exams.filter(e => !getSubmissionForExam(e.id)).length === 0 && (
            <div className="p-16 text-center bg-white rounded-2xl border-2 border-dashed border-slate-100">
              <p className="text-slate-400 font-medium">No new exams assigned at this moment.</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-800">Performance History</h2>
          <div className="space-y-4">
            {studentSubmissions.map(sub => {
              const exam = exams.find(e => e.id === sub.examId);
              const maxPoints = exam?.questions.reduce((sum, q) => sum + q.points, 0) || 0;
              
              return (
                <Card key={sub.id}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-bold text-slate-800">{exam?.title}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                        Submitted {new Date(sub.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                    {sub.status === 'COMPLETED' ? (
                      <div className="text-right">
                        <div className="text-2xl font-black text-blue-600 tracking-tight">{sub.score} / {maxPoints}</div>
                        <Badge variant="success">Graded</Badge>
                      </div>
                    ) : (
                      <Badge variant="warning">Grading in Progress</Badge>
                    )}
                  </div>
                  {sub.aiFeedback && (
                    <div className="p-4 bg-slate-50 rounded-xl text-sm text-slate-600 italic border-l-4 border-blue-500">
                      " {sub.aiFeedback} "
                    </div>
                  )}
                </Card>
              );
            })}
            {studentSubmissions.length === 0 && (
              <p className="text-slate-400 text-center py-16 font-medium italic">No results recorded yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
