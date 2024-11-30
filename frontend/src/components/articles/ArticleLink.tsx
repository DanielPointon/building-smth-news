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
    className={`flex items-center justify-between p-3 rounded-lg transition-all duration-300 ${
      article.isKeyEvent 
        ? 'bg-gradient-to-r from-purple-900/50 to-blue-900/50 border border-purple-500/30' 
        : 'bg-gray-800/50 hover:bg-gray-700/50'
    } group backdrop-blur-sm`}
  >
    <div className="flex items-center gap-3">
      {article.isKeyEvent ? (
        <Sparkles size={16} className="text-purple-400" />
      ) : (
        <Newspaper size={16} className="text-gray-400" />
      )}
      <span className="text-sm text-gray-300">{article.title}</span>
    </div>
    <ExternalLink 
      size={16} 
      className="text-gray-400 group-hover:text-purple-400 transition-colors" 
    />
  </a>
);
