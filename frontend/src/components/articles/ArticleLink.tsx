import React from 'react';
import { ExternalLink, Newspaper, Sparkles } from 'lucide-react';
import { Article } from '../../types/question';
import { COLORS } from '../../constants/color';

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
        ? 'bg-gradient-to-r from-COLORS.graph.events[0]/50 to-COLORS.graph.events[1]/50 border border-COLORS.graph.events[0]/30' 
        : 'bg-COLORS.background.card/50 hover:bg-COLORS.background.card/70'
    } group backdrop-blur-sm`}
  >
    <div className="flex items-center gap-3">
      {article.isKeyEvent ? (
        <Sparkles size={16} className="text-COLORS.graph.events[0]" />
      ) : (
        <Newspaper size={16} className="text-COLORS.text.muted" />
      )}
      <span className="text-sm text-COLORS.text.secondary">{article.title}</span>
    </div>
    <ExternalLink 
      size={16} 
      className={`text-COLORS.text.muted group-hover:text-COLORS.graph.events[0] transition-colors`} 
    />
  </a>
);