import React from 'react';
import { AddQuestionForm } from '../components/questions/AddQuestionForm';
import { QuestionCard } from '../components/questions/QuestionCard';
import { useQuestions } from '../hooks/useQuestions';
import { Alert, AlertDescription } from 'components/ui/alert';

export const BrowsePage: React.FC = () => {
  const { questions, addQuestion } = useQuestions();

  return (
    <div className="space-y-6">
      <AddQuestionForm onSubmit={addQuestion} />
      
      <Alert className="mb-6 bg-gray-800 border-gray-700">
        <AlertDescription className="text-sm text-gray-300">
          Trending questions are updated in real-time based on community predictions
        </AlertDescription>
      </Alert>

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
