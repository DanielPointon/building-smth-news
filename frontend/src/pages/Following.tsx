import React from 'react';
import { useQuestions } from '../hooks/useQuestions';
import { QuestionCard } from 'components/questions/QuestionCard';

export const FollowingPage: React.FC = () => {
  const { followedQuestions, setQuestionData } = useQuestions();

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-100">Following</h2>
      {followedQuestions.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          You're not following any questions yet
        </div>
      ) : (
        followedQuestions.map((q) => (
          <QuestionCard 
            id={q.id}
            key={q.id}
            question={q}
            setQuestionData={setQuestionData}
          />
        ))
      )}
    </div>
  );
};
