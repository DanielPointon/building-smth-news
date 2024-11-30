import React from "react";
import { useParams } from "react-router-dom";

interface Article {
  id: string;
  title: string;
  date: string;
  author: string;
  content: string;
  imageUrl: string;
  description: string;
}

export const ArticlePage: React.FC = () => {
  const { id } = useParams();
  const [article, setArticle] = React.useState<Article | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // This is a placeholder for the future database fetch
    // TODO: Implement actual database fetch
    const fetchArticle = async () => {
      try {
        setLoading(true);
        // Simulate API call
        // Replace this with actual API call later
        const mockArticle: Article = {
          id: id || "",
          title: "Sample Article",
          date: "2024-03-21",
          author: "John Kelly",
          content: "This is a sample article content.",
          imageUrl: "https://avatars.githubusercontent.com/u/32420055?v=4",
          description: "This is a sample article description.",
        };
        setArticle(mockArticle);
      } catch (error) {
        console.error("Error fetching article:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!article) {
    return <div className="text-center py-8">Article not found</div>;
  }

  return (
    // <div className="bg-white rounded-lg shadow-md p-8">
    <div className="p-8 shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold mb-4">{article.title}</h1>
      <p className="text-gray-600 text-lg mb-4">{article.description}</p>
      <div className="text-gray-600 mb-6">
        <span>{new Date(article.date).toLocaleDateString()}</span>
        <span className="mx-2">•</span>
        <span>{article.author}</span>
      </div>
      {article.imageUrl && (
        <img
          src={article.imageUrl}
          alt={article.title}
          className="max-w-[200px] w-full h-auto mb-6 rounded-lg mx-auto block"
        />
      )}
      <div className="prose max-w-none">{article.content}</div>
    </div>
  );
};
