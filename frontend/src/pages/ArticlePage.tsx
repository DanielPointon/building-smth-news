// @ts-nocheck
import { useState, useEffect, Fragment } from "react";
import { useParams } from "react-router-dom";
import { QuestionCard } from "../components/questions/QuestionCard";

export const ArticlePage: React.FC = () => {
  const { id } = useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [paragraphOffsets, setParagraphOffsets] = useState<number[]>([]);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:8001/articles/${id}`);
        if (!response.ok) {
          throw new Error("Article not found");
        }
        const data = await response.json();
        setQuestions(data.questions);
        setArticle(data);
      } catch (error) {
        console.error("Error fetching article:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  useEffect(() => {
    if (!article || questions.length === 0) return;

    const calculateOffsets = () => {
      const offsets = questions.map((question) => {
        const paragraph = document.getElementById(
          `paragraph-${question.index_in_article}`
        );
        if (!paragraph) return 0;

        const offset = paragraph.offsetTop;
        const adjustedOffset = offset + 414;

        return adjustedOffset;
      });

      setParagraphOffsets(offsets);
    };

    calculateOffsets();
    window.addEventListener("resize", calculateOffsets);
    return () => window.removeEventListener("resize", calculateOffsets);
  }, [questions, article]);

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!article) {
    return <div className="text-center py-8">Article not found</div>;
  }

  return (
    <div className="grid grid-cols-12 gap-8">
      <div className="col-span-8">
        <div className="p-8 shadow-lg rounded-lg relative">
          <h1 className="text-3xl font-bold mb-4">{article.title}</h1>
          <p className="text-gray-600 text-lg mb-4">{article.description}</p>
          <img
            src={article.main_image_url}
            alt={article.description}
            className="w-full h-auto mb-6 rounded-lg"
          />
          <div className="text-gray-600 mb-6">
            <span>
              {new Date(article.published_date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            <span className="mx-2">•</span>
            <span>{article.author}</span>
          </div>
          <div className="prose max-w-none relative">
            {article.content.map((item, index) => (
              <Fragment key={index}>
                {item.text && (
                  <p
                    id={`paragraph-${index}`}
                    className={`mb-4 transition-all duration-200 ${
                      questions.some((q) => q.index_in_article === index)
                        ? "bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500"
                        : ""
                    }`}
                  >
                    {item.text}
                  </p>
                )}
                {item.image_url && (
                  <figure className="my-6">
                    <img
                      src={item.image_url}
                      alt={item.image_caption || "Article image"}
                      className="max-w-[400px] w-full h-auto rounded-lg mx-auto block"
                    />
                    {item.image_caption && (
                      <figcaption className="text-center text-gray-600 mt-2">
                        {item.image_caption}
                      </figcaption>
                    )}
                  </figure>
                )}
              </Fragment>
            ))}
          </div>
        </div>
      </div>

      <div className="col-span-4 relative">
        {questions.map((question, index) => (
          <div
            key={question.id}
            style={{
              position: "absolute",
              top: paragraphOffsets[index],
              left: 0,
              right: 0,
            }}
          >
            <div className="relative">
              <div className="absolute -left-8 top-1/2 w-8 h-[2px] bg-gray-300"></div>
              <QuestionCard {...question} question={question} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};