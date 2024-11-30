import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, User, ExternalLink } from 'lucide-react';
import { Card, CardContent } from 'components/ui/card';

interface Article {
  id: string;
  title: string;
  published_date: string;
  author: string;
  content: Array<{
    type: "text" | "image";
    content?: string;
    image_url?: string;
    description?: string;
  }>;
  main_image_url: string;
  description: string;
}

const ArticlesPage = () => {
  const [articles, setArticles] = useState([] as Article[]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await fetch('http://localhost:8000/articles');
        if (!response.ok) throw new Error('Failed to fetch articles');
        const data = await response.json();
        setArticles(data);
      } catch (error) {
        console.error('Error fetching articles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  const handleArticleClick = (id: string) => {
    navigate(`/article/${id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[rgb(13,118,128)]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-georgia text-[rgb(38,42,51)] mb-6">Latest Articles</h1>
      <div className="space-y-6">
        {articles.map((article) => (
          <Card 
            key={article.id}
            className="bg-[rgb(255,241,229)] hover:shadow-xl transition-shadow duration-300 cursor-pointer"
            // onClick={() => handleArticleClick(article.id)}
          >
            <CardContent className="p-6">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <h2 className="text-xl font-georgia text-[rgb(38,42,51)] mb-2">
                    {article.title}
                  </h2>
                  <p className="text-gray-600 mb-4">{article.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <User size={16} />
                      <span>{article.author}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarDays size={16} />
                      <span>{new Date(article.published_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                {article.main_image_url && (
                  <img 
                    src={article.main_image_url} 
                    alt={article.title}
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                )}
              </div>
              <div className="flex justify-end mt-4">
                <div className="flex items-center gap-1 text-[rgb(13,118,128)] text-sm group">
                  <span>Read more</span>
                  <ExternalLink size={16} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ArticlesPage;
