
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card, Button, Badge } from '../components/Common';
import { geminiService } from '../services/geminiService';
import { QuestionType, Submission } from '../types';
import { Icons } from '../constants';
import ExamCreating from './ExamCreating';

const ExaminerDashboard: React.FC = () => {
  const { exams, submissions, updateSubmission } = useApp();
  const [isCreating, setIsCreating] = useState(false);
  const [gradingId, setGradingId] = useState<string | null>(null);

  const handleAiGrade = async (submission: Submission) => {
    setGradingId(submission.id);
    const exam = exams.find(e => e.id === submission.examId);
    if (!exam) return;

    let totalScore = 0;
    let feedbacks: string[] = [];

    for (const q of exam.questions) {
      const answer = submission.answers.find(a => a.questionId === q.id);
      if (!answer) continue;

      if (q.type === QuestionType.MCQ) {
        if (answer.value === q.correctAnswer) {
          totalScore += q.points;
        }
      } else {
        const result = await geminiService.gradeShortAnswer(q, answer);
        totalScore += result.score;
        feedbacks.push(result.feedback);
      }
    }

    const finalFeedback = await geminiService.generateOverallFeedback(
      exam.title, 
      totalScore, 
      exam.questions.reduce((s, q) => s + q.points, 0)
    );

    updateSubmission(submission.id, {
      score: totalScore,
      aiFeedback: finalFeedback,
      status: 'COMPLETED'
    });
    setGradingId(null);
  };

  if (isCreating) return <ExamCreating onCancel={() => setIsCreating(false)} />;

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Examiner Portal</h1>
          <p className="text-slate-500">Manage your exams and evaluate candidate performance with AI assistance.</p>
        </div>
        <Button variant="secondary" onClick={() => setIsCreating(true)}>
          <Icons.Plus /> Create New Exam
        </Button>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-slate-800">Pending Submissions</h2>
          <div className="space-y-4">
            {submissions.map(sub => {
              const exam = exams.find(e => e.id === sub.examId);
              return (
                <Card key={sub.id}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-800">{exam?.title}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-slate-500">Student ID: {sub.studentId}</span>
                        <span className="text-xs text-slate-300">•</span>
                        <span className="text-xs text-slate-500">{new Date(sub.submittedAt).toLocaleString()}</span>
                      </div>
                    </div>
                    {sub.status === 'SUBMITTED' ? (
                      <Button 
                        size="sm" 
                        isLoading={gradingId === sub.id} 
                        onClick={() => handleAiGrade(sub)}
                      >
                        <Icons.Brain /> Use AI Grading
                      </Button>
                    ) : (
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-600">{sub.score} Pts</div>
                        <Badge variant="success">Completed</Badge>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
            {submissions.length === 0 && (
              <div className="text-center py-20 bg-white rounded-xl border border-slate-100">
                <p className="text-slate-400">No submissions to display yet.</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-800">Manage Exams</h2>
          {exams.map(exam => (
            <Card key={exam.id} className="border-l-4 border-l-blue-500">
              <h4 className="font-bold text-slate-800">{exam.title}</h4>
              <p className="text-xs text-slate-500 mt-1">{exam.questions.length} Questions • {exam.durationMinutes} Mins</p>
              <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                <div className="text-xs font-semibold text-slate-400">
                  {submissions.filter(s => s.examId === exam.id).length} Submissions
                </div>
                <button className="text-blue-600 text-xs font-bold hover:underline">Edit Exam</button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExaminerDashboard;
