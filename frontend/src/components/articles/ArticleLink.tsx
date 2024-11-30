import React from 'react';
import { ExternalLink, Newspaper, Sparkles } from 'lucide-react';
import { Article } from '../../types/question';

interface ArticleLinkProps {
  article: Article;
}

export const ArticleLink: React.FC<ArticleLinkProps> = ({ article }) => (
  <a
    href={`/article/${article.id}`}
    target="_blank"
    rel="noopener noreferrer"
    className={`flex items-center justify-between p-4 transition-all duration-300 rounded-lg shadow-md ${
      article.isKeyEvent
        ? 'bg-[rgb(242,223,206)] text-black border border-[rgb(13,118,128)]/30'
        : 'bg-[rgb(242,223,206)] text-black hover:bg-[rgb(232,213,196)]'
    } group`}
  >
    <div className="flex items-center gap-3">
      {article.isKeyEvent ? (
        <Sparkles size={16} className="text-[rgb(13,118,128)]" />
      ) : (
        <Newspaper size={16} className="text-gray-600" />
      )}
      <span className="text-sm">
        {article.title}
      </span>
    </div>
    <ExternalLink
      size={16}
      className="text-gray-600 group-hover:text-[rgb(13,118,128)] transition-colors"
    />
  </a>
);