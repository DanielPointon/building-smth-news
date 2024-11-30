import React from 'react';
import { useQuestions } from '../hooks/useQuestions';
import QuestionCard from 'components/questions/QuestionCard';

export const MyQuestionsPage: React.FC = () => {
  const { userQuestions } = useQuestions();

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-100">My Questions</h2>
      {userQuestions.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          You haven't created any questions yet
        </div>
      ) : (
        userQuestions.map((q) => (
          <QuestionCard 
            key={q.id}
            question={q.question}
            data={q.data}
            articles={q.articles}
          />
        ))
      )}
    </div>
  );
};
