// /frontend/src/components/pages/BrowsePage.tsx

import React from 'react';
import { AddQuestionForm } from '../components/questions/AddQuestionForm';
import { useQuestions } from '../hooks/useQuestions';
import { Alert, AlertDescription } from 'components/ui/alert';
import { QuestionCard } from 'components/questions/QuestionCard';

export const BrowsePage: React.FC = () => {
  const { questions, addQuestion } = useQuestions();

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        {questions.map((q) => (
          <QuestionCard 
            id={q.id}
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