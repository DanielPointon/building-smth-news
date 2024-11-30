import React from 'react';
import { AddQuestionForm } from '../components/questions/AddQuestionForm';
import { useQuestions } from '../hooks/useQuestions';
import QuestionCard from 'components/questions/QuestionCard';

export const BrowsePage: React.FC = () => {
  const { questions, addQuestion } = useQuestions();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <h1 className="font-serif text-5xl font-bold mb-6">Prediction Markets</h1>
          <p className="text-xl text-gray-500 max-w-3xl">
            Track and trade on the world's most important questions. Get real-time insights into global events and future outcomes.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-12 gap-12">
          {/* Main Column */}
          <div className="col-span-8">
            <div className="mb-12">
              <h2 className="font-serif text-2xl font-bold mb-8">Featured Markets</h2>
              <AddQuestionForm onSubmit={addQuestion} />
            </div>

            <div className="divide-y divide-gray-200">
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

          {/* Sidebar */}
          <div className="col-span-4">
            <div className="sticky top-8">
              <div className="bg-gray-50 p-6 mb-8">
                <h3 className="font-serif text-lg font-bold mb-4">Popular Categories</h3>
                <div className="space-y-3">
                  <a href="#" className="block text-gray-600 hover:text-gray-900">Technology</a>
                  <a href="#" className="block text-gray-600 hover:text-gray-900">Politics</a>
                  <a href="#" className="block text-gray-600 hover:text-gray-900">Science</a>
                  <a href="#" className="block text-gray-600 hover:text-gray-900">Climate</a>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="font-serif text-lg font-bold mb-4">Trending Markets</h3>
                {questions.slice(0, 3).map((q, index) => (
                  <div key={index} className="mb-4 pb-4 border-b border-gray-100 last:border-0">
                    <a href="#" className="text-base text-gray-900 hover:text-gray-600 font-serif">
                      {q.question}
                    </a>
                    <p className="text-sm text-gray-500 mt-1">
                      {q.data[q.data.length - 1].probability}% probability
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};