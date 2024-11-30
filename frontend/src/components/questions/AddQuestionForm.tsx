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
    <div className="w-full mb-8">
      <form onSubmit={handleSubmit} className="flex gap-4">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Enter a new question..."
          className="flex-1 p-3 rounded-lg bg-gray-800/50 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 backdrop-blur-sm"
        />
        <button
          type="submit"
          className="flex items-center gap-2 px-6 py-3 text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/20"
        >
          Add Question
        </button>
      </form>
    </div>
  );
};