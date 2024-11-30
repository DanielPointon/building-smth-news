// /frontend/src/components/pages/BrowsePage.tsx

import React from 'react';
import { AddQuestionForm } from '../components/questions/AddQuestionForm';
import { useQuestions } from '../hooks/useQuestions';
import { Alert, AlertDescription } from 'components/ui/alert';
import { QuestionCard } from 'components/questions/QuestionCard';

export const BrowsePage: React.FC = () => {
  const { questions, addQuestion } = useQuestions();

  return (
    <div>
      <div className="bg-[rgb(242,223,206)] p-6 mb-8">
        <h1 className="text-2xl font-georgia text-[rgb(38,42,51)] mb-4">
          Market Predictions
        </h1>
        <p className="text-[rgb(38,42,51)]">
          Track and trade on future outcomes across global markets and events
        </p>
      </div>
      <div className="space-y-6">
<<<<<<< HEAD
        <div className="space-y-6">
          {questions.map((q) => (
            <QuestionCard
              id={q.id}
              key={q.id}
              question={q.question}
              data={q.data}
||||||| parent of 7bb3636 (rm trailing whitespace)
        {questions.map((q) => (
          <QuestionCard 
            key={q.id}
            question={q.question}
            data={q.data}
=======
        {questions.map((q) => (
          <QuestionCard
            key={q.id}
            question={q.question}
            data={q.data}
>>>>>>> 7bb3636 (rm trailing whitespace)
            articles={q.articles}
            />
          ))}
        </div>
      </div>
    </div>

  );
};
