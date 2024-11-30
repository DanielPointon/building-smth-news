import React from 'react';
import { Article } from '../../types/question';
import { ArticleLink } from './ArticleLink';

interface ArticleListProps {
  articles: Article[];
  showAll: boolean;
}

export const ArticleList: React.FC<ArticleListProps> = ({ articles, showAll }) => {
  const displayedArticles = showAll ? articles : articles.slice(0, 2);
  
  return (
    <div className="space-y-2">
      {displayedArticles.map((article, idx) => (
        <ArticleLink key={idx} article={article} />
      ))}
    </div>
  );
};