
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Exam, Question, QuestionType } from '../types';
import { Card, Button } from '../components/Common';

const ExamCreating: React.FC<{ onCancel: () => void }> = ({ onCancel }) => {
  const { addExam, currentUser } = useApp();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(60);
  const [questions, setQuestions] = useState<Partial<Question>[]>([]);

  const handleAddQuestion = (type: QuestionType) => {
    setQuestions([...questions, { 
      id: `q_${Date.now()}_${questions.length}`, 
      type, 
      text: '', 
      points: 5,
      options: type === QuestionType.MCQ ? ['', '', '', ''] : undefined
    }]);
  };

  const handleSave = () => {
    if (!currentUser) return;
    const newExam: Exam = {
      id: `exam_${Date.now()}`,
      title,
      description,
      durationMinutes: duration,
      questions: questions as Question[],
      createdBy: currentUser.id,
      createdAt: new Date().toISOString()
    };
    addExam(newExam);
    onCancel();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Create New Examination</h1>
          <p className="text-slate-500">Define the assessment criteria and questions.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={handleSave} disabled={!title || questions.length === 0}>Save Exam</Button>
        </div>
      </header>

      <Card title="Exam Configuration">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Exam Title</label>
            <input 
              type="text" 
              className="w-full p-3 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none"
              placeholder="e.g. Constitutional Law Basics"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
            <textarea 
              className="w-full p-3 rounded-lg border border-slate-200 focus:border-blue-500 outline-none h-24"
              placeholder="What will students be tested on?"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Duration (Minutes)</label>
            <input 
              type="number" 
              className="w-full p-3 rounded-lg border border-slate-200 focus:border-blue-500 outline-none"
              value={duration}
              onChange={e => setDuration(parseInt(e.target.value))}
            />
          </div>
        </div>
      </Card>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">Assessment Questions</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => handleAddQuestion(QuestionType.MCQ)}>+ MCQ</Button>
            <Button variant="outline" size="sm" onClick={() => handleAddQuestion(QuestionType.SHORT_ANSWER)}>+ Short Answer</Button>
          </div>
        </div>

        {questions.map((q, idx) => (
          <Card key={q.id} title={`Question ${idx + 1}: ${q.type}`} actions={<Button variant="outline" size="sm" onClick={() => setQuestions(questions.filter((_, i) => i !== idx))}>Remove</Button>}>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Question Prompt</label>
                <input 
                  type="text" 
                  className="w-full p-3 bg-slate-50 rounded-lg border border-slate-100 focus:bg-white focus:border-blue-500 outline-none"
                  value={q.text}
                  onChange={e => {
                    const next = [...questions];
                    next[idx].text = e.target.value;
                    setQuestions(next);
                  }}
                />
              </div>
              <div className="flex gap-4">
                 <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Points</label>
                    <input 
                      type="number" 
                      className="w-full p-3 bg-slate-50 rounded-lg border border-slate-100 outline-none"
                      value={q.points}
                      onChange={e => {
                        const next = [...questions];
                        next[idx].points = parseInt(e.target.value);
                        setQuestions(next);
                      }}
                    />
                 </div>
                 {q.type === QuestionType.SHORT_ANSWER && (
                   <div className="flex-[2]">
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Grading Rubric (AI Guidance)</label>
                    <input 
                      type="text" 
                      className="w-full p-3 bg-slate-50 rounded-lg border border-slate-100 outline-none"
                      placeholder="Keywords or concepts to look for..."
                      value={q.rubric || ''}
                      onChange={e => {
                        const next = [...questions];
                        next[idx].rubric = e.target.value;
                        setQuestions(next);
                      }}
                    />
                   </div>
                 )}
              </div>

              {q.type === QuestionType.MCQ && (
                <div className="grid grid-cols-2 gap-4">
                  {q.options?.map((opt, optIdx) => (
                    <div key={optIdx} className="flex items-center gap-2">
                      <input 
                        type="radio" 
                        name={`correct_${q.id}`} 
                        checked={q.correctAnswer === opt && opt !== ''}
                        onChange={() => {
                          const next = [...questions];
                          next[idx].correctAnswer = opt;
                          setQuestions(next);
                        }}
                      />
                      <input 
                        className="flex-1 p-2 bg-slate-50 border border-slate-100 rounded outline-none text-sm"
                        placeholder={`Option ${optIdx + 1}`}
                        value={opt}
                        onChange={e => {
                          const next = [...questions];
                          if(next[idx].options) {
                             next[idx].options![optIdx] = e.target.value;
                             setQuestions(next);
                          }
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ExamCreating;
