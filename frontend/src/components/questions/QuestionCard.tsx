import React, { useState } from 'react';
import { TrendingUp, Sparkles, ChevronRight } from 'lucide-react';
import { ProbabilityGraph } from '../graph/ProbabilityGraph';
import { TradingButtons } from '../trading/TradingButtons';
import { ArticleList } from '../articles/ArticleList';
import { QuestionCardProps, Article } from '../../types/question';

const isValidEvent = (article: Article): article is (Article & { date: string }) => {
  return article.isKeyEvent && typeof article.date === 'string';
};

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  data,
  articles
}) => {
  const [showAllNews, setShowAllNews] = useState<boolean>(false);
  const currentProbability = data[data.length - 1].probability;
  const previousProbability = data[data.length - 2]?.probability;
  const trending = currentProbability > previousProbability;

  const events = articles
    .filter(isValidEvent)
    .map(article => ({
      date: article.date,
      title: article.title
    }));

  return (
    <div className="ft-gradient p-6 mb-6 shadow-xl">
      <div className="flex flex-row items-center justify-between pb-4 border-b border-gray-700">
        <div className="text-xl font-georgia text-white flex items-center gap-2">
          {question}
          {trending && <Sparkles size={16} className="text-[rgb(13,118,128)]" />}
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-2xl font-bold font-georgia ${
            trending ? 'text-[rgb(13,118,128)]' : 'text-red-400'
          }`}>
            {currentProbability}%
          </span>
          <TrendingUp 
            size={20} 
            className={`${
              trending ? 'text-[rgb(13,118,128)] rotate-0' : 'text-red-400 rotate-180'
            }`}
          />
        </div>
      </div>
      
      <div className="py-6 bg-opacity-50">
        <div className="bg-[rgb(28,32,41)] p-4 mb-6 rounded">
          <ProbabilityGraph 
            data={data}
            events={events}
          />
        </div>
        <TradingButtons probability={currentProbability} />
        <div className="mt-6 space-y-2">
          <ArticleList 
            articles={articles} 
            showAll={showAllNews}
          />
        </div>
      </div>

      {articles.length > 2 && (
        <div className="pt-4 border-t border-gray-700">
          <button
            onClick={() => setShowAllNews(prev => !prev)}
            className="flex items-center gap-2 text-sm text-[rgb(13,118,128)] hover:text-white transition-colors group"
          >
            {showAllNews ? 'Show less' : 'Explore more'}
            <ChevronRight 
              size={16} 
              className={`transition-transform duration-300 group-hover:translate-x-1 ${
                showAllNews ? 'rotate-90' : ''
              }`}
            />
          </button>
        </div>
      )}
    </div>
  );
};