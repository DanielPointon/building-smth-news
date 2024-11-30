// /frontend/src/components/questions/AddQuestionForm.tsx

import React, { useState } from 'react';

interface AddQuestionFormProps {
  onSubmit: (question: { question: string; initialProbability: number }) => void;
}

export const AddQuestionForm: React.FC<AddQuestionFormProps> = ({ onSubmit }) => {
  const [question, setQuestion] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim()) {
      onSubmit({
        question: question.trim(),
        initialProbability: 50 // Default starting probability
      });
      setQuestion('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-4">
      <input
        type="text"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Enter a new question..."
        className="flex-1 p-3 bg-[rgb(28,32,41)] border border-gray-700 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[rgb(13,118,128)] focus:ring-1 focus:ring-[rgb(13,118,128)]"
      />
      <button
        type="submit"
        className="px-6 py-3 text-white bg-[rgb(13,118,128)] hover:bg-[rgb(11,98,108)] transition-all duration-300 shadow-lg flex items-center gap-2"
      >
        Add Question
      </button>
    </form>
  );
};