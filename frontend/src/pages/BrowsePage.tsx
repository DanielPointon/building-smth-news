// /frontend/src/components/pages/BrowsePage.tsx

import React from 'react';
import { AddQuestionForm } from '../components/questions/AddQuestionForm';
import { QuestionCard } from '../components/questions/QuestionCard';
import { useQuestions } from '../hooks/useQuestions';
import { Alert, AlertDescription } from 'components/ui/alert';

export const BrowsePage: React.FC = () => {
  const { questions, addQuestion } = useQuestions();

  return (
    <div className="space-y-6">
      <div className="bg-[rgb(38,42,51)] p-6 mb-8 shadow-lg">
        <AddQuestionForm onSubmit={addQuestion} />
        
        <div className="mt-4 py-4 px-6 bg-[rgb(28,32,41)] border-l-2 border-[rgb(13,118,128)]">
          <p className="text-sm text-gray-300">
            Trending questions are updated in real-time based on community predictions
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {questions.map((q) => (
          <QuestionCard 
            key={q.id}
            question={q.question}
            data={q.data}
            articles={q.articles}
          />
        ))}
      </div>
    </div>
  );
};