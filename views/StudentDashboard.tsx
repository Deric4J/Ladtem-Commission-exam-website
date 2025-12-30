
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card, Button, Badge } from '../components/Common';
import ExamTaking from './ExamTaking';

const StudentDashboard: React.FC = () => {
  const { exams, submissions, currentUser } = useApp();
  const [activeExamId, setActiveExamId] = useState<string | null>(null);

  const studentSubmissions = submissions.filter(s => s.studentId === currentUser?.id);
  
  const getSubmissionForExam = (examId: string) => studentSubmissions.find(s => s.examId === examId);

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
