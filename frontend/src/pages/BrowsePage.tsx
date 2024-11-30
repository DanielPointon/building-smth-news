import React from 'react';
import { useQuestions } from '../hooks/useQuestions';
import { Alert, AlertDescription } from 'components/ui/alert';
import { QuestionCard } from 'components/questions/QuestionCard';

export const BrowsePage: React.FC = () => {
  const { questions, loading, error } = useQuestions();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[rgb(13,118,128)]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert>
        <AlertDescription>
          Error loading questions: {error}
        </AlertDescription>
      </Alert>
    );
  }

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
      
      {questions.length === 0 ? (
        <div className="text-center py-8 text-gray-600">
          No predictions available at the moment.
        </div>
      ) : (
        <div className="space-y-6">
          {questions.map((q) => (
            <QuestionCard
              key={q.id}
              id={q.id}
              question={q.question}
              probability={q.probability}
              data={q.data}
              articles={q.articles}
            />
          ))}
        </div>
      )}
    </div>
  );
};
