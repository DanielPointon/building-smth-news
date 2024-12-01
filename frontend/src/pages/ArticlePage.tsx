//@ts-nocheck
import { useState, useEffect, Fragment } from "react";
import { useParams } from "react-router-dom";
import { QuestionCard } from "../components/questions/QuestionCard";
import { Article } from "types/question";

export const ArticlePage: React.FC = () => {
  const { id } = useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [paragraphOffsets, setParagraphOffsets] = useState<{top: number, height: number}[]>([]);

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
        if (!paragraph) return { top: 0, height: 0 };

        const paragraphRect = paragraph.getBoundingClientRect();
        const scrollTop = window.scrollY;
        
        return {
          top: paragraphRect.top + scrollTop,
          height: paragraphRect.height
        };
      });

      setParagraphOffsets(offsets);
    };

    calculateOffsets();
    window.addEventListener("resize", calculateOffsets);
    window.addEventListener("scroll", calculateOffsets);
    window.addEventListener("load", calculateOffsets);
    
    return () => {
      window.removeEventListener("resize", calculateOffsets);
      window.removeEventListener("scroll", calculateOffsets);
      window.removeEventListener("load", calculateOffsets);
    };
  }, [questions, article]);

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!article) {
    return <div className="text-center py-8">Article not found</div>;
  }

  const QUESTION_CARD_WIDTH = 280; // Reduced from 320
  const CARD_OFFSET = "4rem";
  
  const getLinePosition = (cardCenterY: number, paragraphCenterY: number) => {
    const isAbove = cardCenterY < paragraphCenterY;
    const cardOffset = isAbove ? 20 : -20;
    
    return {
      x1: "0",
      y1: "50",
      x2: "100%",
      y2: "50",
      cardTransform: `translateY(${cardOffset}px)`,
    };
  };

  return (
    <div className="container mx-auto px-8 md:px-12 lg:px-16 relative">
      <style>
        {`
          @keyframes dashedMove {
            to {
              stroke-dashoffset: -20;
            }
          }
          .connector-line {
            animation: dashedMove 0.5s linear infinite;
          }
        `}
      </style>
      <div className="max-w-xl mx-auto relative"> {/* Changed from max-w-2xl to max-w-xl */}
        <div className="absolute inset-0 w-full">
          {questions.map((question, index) => {
            const isLeft = index % 2 === 1;
            const offset = paragraphOffsets[index];
            const centerY = offset?.top + (offset?.height / 2) || 0;
            const linePosition = getLinePosition(centerY, centerY);
            
            return (
              <div
                key={question.id}
                style={{
                  position: "absolute",
                  top: centerY,
                  [isLeft ? "left" : "right"]: "100%",
                  width: `${QUESTION_CARD_WIDTH}px`,
                  marginLeft: isLeft ? CARD_OFFSET : 0,
                  marginRight: isLeft ? 0 : CARD_OFFSET,
                  transform: "translateY(-50%)",
                }}
                className="flex items-center"
              >
                <div className="relative flex-1">
                  <div 
                    className="absolute top-1/2 w-16"
                    style={{
                      [isLeft ? "right" : "left"]: "100%",
                      height: "2px",
                      transform: linePosition.cardTransform,
                    }}
                  >
                    <svg
                      width="100%"
                      height="100"
                      style={{
                        overflow: "visible",
                        position: "absolute",
                        top: "-50px",
                      }}
                    >
                      <line
                        x1={isLeft ? "100%" : "0"}
                        y1={linePosition.y1}
                        x2={isLeft ? "0" : "100%"}
                        y2={linePosition.y2}
                        stroke="#93C5FD"
                        strokeWidth="2"
                        strokeDasharray="4 4"
                        className="connector-line"
                        transform={`rotate(${isLeft ? 15 : -15} ${isLeft ? "100" : "0"} 50)`}
                      />
                    </svg>
                  </div>
                  <QuestionCard {...question} question={question} lowHeight={true} />
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-white p-8 shadow-lg rounded-lg">
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
          <div className="prose max-w-none">
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
    </div>
  );
};

export default ArticlePage;