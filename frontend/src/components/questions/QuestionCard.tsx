import React, { useState } from 'react';
import { TrendingUp, ChevronRight } from 'lucide-react';
import { ProbabilityGraph } from '../graph/ProbabilityGraph';
import { TradingButtons } from '../trading/TradingButtons';
import { ArticleList } from '../articles/ArticleList';
import { QuestionCardProps, Article } from '../../types/question';
import { Event } from '../../types/graph';

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  data,
  articles
}) => {
  const [showAllNews, setShowAllNews] = useState<boolean>(false);
  const currentProbability = data[data.length - 1].probability;
  const previousProbability = data[data.length - 2]?.probability;
  const trending = currentProbability > previousProbability;

  // Fixed type checking for events
  const events: Event[] = articles
    .filter((article): article is Article & { date: string } => {
      return article.isKeyEvent && typeof article.date === 'string';
    })
    .map(article => ({
      date: article.date,
      title: article.title
    }));

  return (
    <div className="mb-12 border-b border-gray-200 pb-8">
      {/* Headline Section */}
      <div className="mb-4">
        <h2 className="font-serif text-2xl font-bold leading-tight tracking-tight text-gray-900 mb-2">
          {question}
        </h2>
        <div className="flex items-center gap-3 text-sm text-gray-500 font-serif">
          <span>PREDICTION MARKETS</span>
          <span>•</span>
          <div className="flex items-center gap-2">
            <span className={`font-bold ${trending ? 'text-green-700' : 'text-red-700'}`}>
              {currentProbability}%
            </span>
            <TrendingUp 
              size={16} 
              className={`${trending ? 'text-green-700 rotate-0' : 'text-red-700 rotate-180'}`}
            />
          </div>
        </div>
      </div>

      {/* Graph Section */}
      <div className="mb-6">
        <ProbabilityGraph data={data} events={events} />
      </div>

      {/* Trading Section */}
      <div className="mb-6">
        <TradingButtons probability={currentProbability} />
      </div>

      {/* Related Articles Section */}
      <div className="mt-8">
        <h3 className="font-serif text-lg font-bold mb-4 text-gray-900">Related Coverage</h3>
        <div className="space-y-4">
          <ArticleList articles={articles} showAll={showAllNews} />
          {articles.length > 2 && (
            <button
              onClick={() => setShowAllNews(prev => !prev)}
              className="font-serif text-sm text-gray-500 hover:text-gray-700 transition-colors mt-4 flex items-center gap-1 group"
            >
              {showAllNews ? 'Show Less' : 'See More Coverage'}
              <ChevronRight 
                size={14} 
                className={`transition-transform duration-300 group-hover:translate-x-1 ${
                  showAllNews ? 'rotate-90' : ''
                }`}
              />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;