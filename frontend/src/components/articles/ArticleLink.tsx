import React from 'react';
import { ExternalLink } from 'lucide-react';
import { Article } from '../../types/question';

interface ArticleLinkProps {
  article: Article;
}

const ArticleLink: React.FC<ArticleLinkProps> = ({ article }) => (
  <a 
    href={article.url} 
    target="_blank" 
    rel="noopener noreferrer"
    className="block group"
  >
    <div className="flex items-center justify-between py-3 border-t border-gray-100 first:border-t-0">
      <div className="flex-1">
        <h4 className="font-serif text-base text-gray-900 group-hover:text-gray-600 transition-colors leading-snug">
          {article.title}
        </h4>
        {article.isKeyEvent && (
          <span className="text-xs uppercase tracking-wider text-gray-500 mt-1">
            Key Development
          </span>
        )}
      </div>
      <ExternalLink 
        size={14} 
        className="text-gray-400 group-hover:text-gray-600 transition-colors ml-4" 
      />
    </div>
  </a>
);

export default ArticleLink;