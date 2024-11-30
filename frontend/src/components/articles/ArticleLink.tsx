// /frontend/src/components/articles/ArticleLink.tsx

import React from 'react';
import { ExternalLink, Newspaper, Sparkles } from 'lucide-react';
import { Article } from '../../types/question';

interface ArticleLinkProps {
  article: Article;
}

export const ArticleLink: React.FC<ArticleLinkProps> = ({ article }) => (
  <a 
    href={article.url} 
    target="_blank" 
    rel="noopener noreferrer"
    className={`flex items-center justify-between p-4 transition-all duration-300 rounded-lg shadow-md ${
      article.isKeyEvent 
        ? 'bg-[rgb(28,32,41)] text-white border border-[rgb(13,118,128)]/30' 
        : 'bg-[rgb(28,32,41)] text-gray-200 hover:bg-[rgb(33,37,46)]'
    } group`}
  >
    <div className="flex items-center gap-3">
      {article.isKeyEvent ? (
        <Sparkles size={16} className="text-[rgb(13,118,128)]" />
      ) : (
        <Newspaper size={16} className="text-gray-400" />
      )}
      <span className="text-sm">
        {article.title}
      </span>
    </div>
    <ExternalLink 
      size={16} 
      className="text-gray-400 group-hover:text-[rgb(13,118,128)] transition-colors" 
    />
  </a>
);