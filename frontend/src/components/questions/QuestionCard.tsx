import React, { useState } from 'react';
import { TrendingUp, Sparkles, ChevronRight } from 'lucide-react';
import { ProbabilityGraph } from '../graph/ProbabilityGraph';
import { TradingButtons } from '../trading/TradingButtons';
import { ArticleList } from '../articles/ArticleList';
import { QuestionCardProps, Article } from '../../types/question';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from 'components/ui/card';
import { COLORS } from '../../constants/color';

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
    <Card className="bg-white border border-gray-200 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold text-gray-800">
          <div className="flex items-center gap-2">
            {question}
            {trending && <Sparkles size={16} className="text-purple-500" />}
          </div>
        </CardTitle>
        <div className="flex items-center gap-2">
          <span 
            className={`text-2xl font-bold ${
              trending ? 'text-green-500' : 'text-red-500'
            }`}
          >
            {currentProbability}%
          </span>
          <TrendingUp 
            size={20} 
            className={`${
              trending ? 'text-green-500 rotate-0' : 'text-red-500 rotate-180'
            }`}
          />
        </div>
      </CardHeader>
      
      <CardContent>
        <ProbabilityGraph 
          data={data}
          events={events}
        />
        <TradingButtons probability={currentProbability} />
        <div className="mt-4">
          <ArticleList 
            articles={articles} 
            showAll={showAllNews}
          />
        </div>
      </CardContent>

      {articles.length > 2 && (
        <CardFooter>
          <button
            onClick={() => setShowAllNews(prev => !prev)}
            className="flex items-center gap-2 text-sm text-purple-500 hover:text-purple-600 transition-colors mt-2 group"
          >
            {showAllNews ? 'Show less' : 'Explore more'}
            <ChevronRight 
              size={16} 
              className={`transition-transform duration-300 group-hover:translate-x-1 ${
                showAllNews ? 'rotate-90' : ''
              }`}
            />
          </button>
        </CardFooter>
      )}
    </Card>
  );
};