import React, { useState } from 'react';

interface AddQuestionFormProps {
  onSubmit: (question: { question: string; initialProbability: number }) => void;
}

export const AddQuestionForm: React.FC<AddQuestionFormProps> = ({ onSubmit }) => {
  const [question, setQuestion] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim()) {
      onSubmit({
        question: question.trim(),
        initialProbability: 50
      });
      setQuestion('');
      setIsExpanded(false);
    }
  };

  return (
    <div className="bg-gray-50 p-6 font-serif">
      <h3 className="text-xl font-bold mb-4">Create New Market</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-500 mb-2">
            What would you like to predict?
          </label>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            placeholder="Enter your question..."
            className="w-full border-b border-gray-200 py-2 text-lg focus:outline-none focus:border-gray-400 bg-transparent"
          />
        </div>

        {isExpanded && (
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-gray-900 text-white px-6 py-2 hover:bg-gray-800 transition-colors"
            >
              Create Market
            </button>
          </div>
        )}
      </form>
    </div>
  );
};