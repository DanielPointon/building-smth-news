import React from 'react';
import { Article } from '../../types/question';

interface ArticleListProps {
  articles: Article[];
  showAll: boolean;
}

export const ArticleList: React.FC<ArticleListProps> = ({ articles, showAll }) => {
  const displayedArticles = showAll ? articles : articles.slice(0, 2);

  return (
    <div className="space-y-6">
      {displayedArticles.map((article, idx) => (
        <div
          key={idx}
          className="flex items-center border-b border-gray-200 pb-4 mb-4"
        >
          {/* Thumbnail */}
          <div className="w-1/4">
            <img
              src={article.main_image_url || 'default-image-url.jpg'}
              alt={article.title}
              className="rounded-sm w-full h-auto object-cover"
            />
          </div>

          {/* Content */}
          <div className="flex-1 px-4">
            {/* Title */}
            <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 cursor-pointer">
              {article.title}
            </h3>
            {/* Description */}
            <p className="text-gray-700 text-sm mt-1">
              {article.description || 'No description available.'}
            </p>
          </div>

          {/* Save/Bookmark */}
          <div className="text-gray-500 text-sm text-right">
            <button className="flex items-center gap-1 hover:text-blue-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M5 3a2 2 0 00-2 2v14l7-3 7 3V5a2 2 0 00-2-2H5z" />
              </svg>
              Save
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
