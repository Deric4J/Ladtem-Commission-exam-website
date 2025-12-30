
import React, { useState, useEffect } from 'react';
import { Exam, QuestionType, Answer, Submission } from '../types';
import { useApp } from '../context/AppContext';
import { Card, Button } from '../components/Common';

interface ExamTakingProps {
  exam: Exam;
  onComplete: () => void;
}

const ExamTaking: React.FC<ExamTakingProps> = ({ exam, onComplete }) => {
  const { currentUser, addSubmission } = useApp();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [timeLeft, setTimeLeft] = useState(exam.durationMinutes * 60);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleAnswerChange = (value: string) => {
    setAnswers(prev => {
      const filtered = prev.filter(a => a.questionId !== exam.questions[currentQuestionIndex].id);
      return [...filtered, { questionId: exam.questions[currentQuestionIndex].id, value }];
    });
  };

  const handleSubmit = () => {
    if (!currentUser) return;
    
    const submission: Submission = {
      id: `sub_${Date.now()}`,
      examId: exam.id,
      studentId: currentUser.id,
      answers,
      submittedAt: new Date().toISOString(),
      status: 'SUBMITTED'
    };
    
    addSubmission(submission);
    onComplete();
  };

  const currentQuestion = exam.questions[currentQuestionIndex];
  const currentAnswer = answers.find(a => a.questionId === currentQuestion.id)?.value || '';

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header Info */}
      <div className="flex items-center justify-between mb-8 sticky top-20 bg-slate-50/95 backdrop-blur py-4 z-40">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{exam.title}</h2>
          <p className="text-slate-500">Question {currentQuestionIndex + 1} of {exam.questions.length}</p>
        </div>
        <div className={`px-6 py-2 rounded-xl text-xl font-mono font-bold border-2 ${timeLeft < 300 ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' : 'bg-white text-blue-600 border-blue-100'}`}>
          {formatTime(timeLeft)}
        </div>
      </div>

      <div className="mb-8 h-2 bg-slate-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-blue-600 transition-all duration-300"
          style={{ width: `${((currentQuestionIndex + 1) / exam.questions.length) * 100}%` }}
        />
      </div>

      <Card className="mb-8 min-h-[400px]">
        <div className="mb-8">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2 block">
            {currentQuestion.type === QuestionType.MCQ ? 'Multiple Choice' : 'Short Answer'} — {currentQuestion.points} Points
          </span>
          <h3 className="text-xl font-medium text-slate-800 leading-relaxed">
            {currentQuestion.text}
          </h3>
        </div>

        {currentQuestion.type === QuestionType.MCQ ? (
          <div className="space-y-3">
            {currentQuestion.options?.map((opt, i) => (
              <label 
                key={i} 
                className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  currentAnswer === opt 
                    ? 'border-blue-600 bg-blue-50 text-blue-800' 
                    : 'border-slate-100 hover:border-slate-300 bg-white'
                }`}
              >
                <input 
                  type="radio" 
                  name="mcq" 
                  className="hidden" 
                  value={opt} 
                  checked={currentAnswer === opt}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                />
                <div className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center ${currentAnswer === opt ? 'border-blue-600 bg-blue-600' : 'border-slate-300'}`}>
                  {currentAnswer === opt && <div className="w-2 h-2 bg-white rounded-full"></div>}
                </div>
                <span className="font-medium">{opt}</span>
              </label>
            ))}
          </div>
        ) : (
          <textarea 
            className="w-full h-48 p-4 rounded-xl border-2 border-slate-100 focus:border-blue-500 focus:ring-0 resize-none transition-all placeholder:text-slate-400"
            placeholder="Type your response here..."
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(e.target.value)}
          />
        )}
      </Card>

      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          disabled={currentQuestionIndex === 0}
          onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
        >
          Previous Question
        </Button>
        
        {currentQuestionIndex === exam.questions.length - 1 ? (
          <Button onClick={handleSubmit}>
            Finish and Submit Exam
          </Button>
        ) : (
          <Button onClick={() => setCurrentQuestionIndex(prev => prev + 1)}>
            Next Question
          </Button>
        )}
      </div>
    </div>
  );
};

export default ExamTaking;
