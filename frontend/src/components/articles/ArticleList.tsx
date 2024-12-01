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
    <div className="w-4/5 mx-auto space-y-3">
      {displayedArticles.map((article, idx) => (
        <ArticleLink key={idx} article={article} />
      ))}
    </div>
  );
};
