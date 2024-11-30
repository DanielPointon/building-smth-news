import React from "react";
import { useParams } from "react-router-dom";

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

export const ArticlePage: React.FC = () => {
  const { id } = useParams();
  const [article, setArticle] = React.useState<Article | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:8000/articles/${id}`);
        if (!response.ok) {
          throw new Error("Article not found");
        }
        const data = await response.json();
        console.log(data);
        setArticle(data);
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
    <div className="p-8 shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold mb-4">{article.title}</h1>
      <p className="text-gray-600 text-lg mb-4">{article.description}</p>
      <div className="text-gray-600 mb-6">
        <span>{new Date(article.published_date).toLocaleDateString()}</span>
        <span className="mx-2">•</span>
        <span>{article.author}</span>
      </div>
      <img
        src={article.main_image_url}
        alt={article.description}
        className="w-full h-auto mb-6 rounded-lg"
      />

      <div className="prose max-w-none">
        {article.content.map((item, index) => (
          <React.Fragment key={index}>
            {item.type === "text" && <p className="mb-4">{item.content}</p>}
            {item.type === "image" && (
              <img
                src={item.image_url}
                alt={item.description || "Article image"}
                className="max-w-[400px] w-full h-auto my-6 rounded-lg mx-auto block"
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
