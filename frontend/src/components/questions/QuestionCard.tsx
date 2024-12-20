//@ts-nocheck
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp, Sparkles, ChevronRight } from "lucide-react";
import { ProbabilityGraph } from "../graph/ProbabilityGraph";
import { TradingButtons } from "../trading/TradingButtons";
import { ArticleList } from "../articles/ArticleList";
import {
  QuestionCardProps,
  Article,
  Question,
  DataPoint,
} from "../../types/question";
import { MarketsClient, MarketTrade, MarketTrades } from "utils/MarketsClient";

const isValidEvent = (
  article: Article
): article is Article & { date: string } => {
  return (
    !!article.isKeyEvent &&
    article.isKeyEvent &&
    typeof article.published_date === "string"
  );
};

export const QuestionCard: React.FC<QuestionCardProps> = ({
  id,
  question,
  setQuestionData,
  lowHeight,
  compact = false,
}) => {
  const navigate = useNavigate();
  const [showAllNews, setShowAllNews] = useState<boolean>(false);
  const [backupData, setBackupData] = useState<DataPoint[]>([]);
  const [backupProbability, setBackupProbability] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const currentProbability = question.probability ?? backupProbability ?? 50;
  const trending = false;

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const events = question.articles
    ? question.articles.filter(isValidEvent).map((article) => ({
        date: article.date,
        title: article.title,
      }))
    : [];

  useEffect(() => {
    const getBackupData = async () => {
      if (!question.data) {
        const marketsClient = new MarketsClient();
        const trades = await marketsClient.getTrades(id);
        let processedResults = trades.trades.map((event: MarketTrade) => {
          return {
            date: event.time,
            probability: event.price,
          };
        });

        setBackupProbability(trades.trades[trades.trades.length - 1].price);
        setBackupData(processedResults);
      }
    };

    getBackupData();
  }, []);

  let overallData = (question.data ?? backupData).map((point) => ({
    ...point,
    date: new Date(point.date).toLocaleString("en-US", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
  }));

  let overallProbability = question.probability ?? backupProbability;

  const handleQuestionClick = () => {
    navigate(`/question/${id}`);
  };

  const tradingButtonsComponent = (
    <TradingButtons
      question={{
        ...question,
        probability: currentProbability,
        data: overallData ?? [],
        articles: question.articles || [],
      }}
      setQuestionData={setQuestionData}
    />
  );

  return (
    <div 
      className={`bg-[rgb(255,241,229)] ${compact ? 'p-4' : 'p-6'} mb-6 shadow-lg rounded-lg border border-gray-200 transition-opacity duration-1000 ease-in-out ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="flex flex-col">
        <div className={`${compact ? 'pb-2' : 'pb-4'} border-b border-gray-300`}>
          <div
            className="flex flex-row items-center justify-between cursor-pointer hover:opacity-80 transition-opacity"
            onClick={handleQuestionClick}
          >
            <div className={`${compact ? 'text-base' : 'text-xl'} font-georgia text-[rgb(38,42,51)] flex items-center gap-2`}>
              {question.question}
              {trending && (
                <Sparkles size={compact ? 14 : 16} className="text-[rgb(13,118,128)]" />
              )}
            </div>
            <div className="flex items-center gap-2 ml-2">
              <span
                className={`${compact ? 'text-xl' : 'text-2xl'} font-bold font-georgia ${
                  trending ? "text-[rgb(13,118,128)]" : "text-red-600"
                }`}
              >
                {currentProbability}%
              </span>
            </div>
          </div>
          {compact && <div className="mt-2">{tradingButtonsComponent}</div>}
        </div>

        <div className={`${compact ? 'py-3' : 'py-6'}`}>
          <div className={`bg-[rgb(242,223,206)] rounded-lg shadow-sm transition-transform duration-1000 ease-in-out ${
            isVisible ? 'translate-y-0' : 'translate-y-4'
          } ${compact ? 'h-40' : 'h-64'}`}>
            {!lowHeight && (
              <ProbabilityGraph 
                data={overallData} 
                events={events}
                className={`transition-opacity duration-2000 delay-500 ${
                  isVisible ? 'opacity-100' : 'opacity-0'
                } h-full`}
              />
            )}
          </div>

          {!compact && <div className="mt-4">{tradingButtonsComponent}</div>}
        </div>
      </div>

      {question.articles && (
        <div className={`${compact ? 'mt-3' : 'mt-6'} space-y-2`}>
          <ArticleList articles={question.articles} showAll={showAllNews} />
        </div>
      )}

      {question.articles && question.articles.length > 2 && (
        <div className={`${compact ? 'pt-2' : 'pt-4'} border-t border-gray-300`}>
          <button
            onClick={() => setShowAllNews((prev) => !prev)}
            className={`flex items-center gap-2 ${compact ? 'text-xs' : 'text-sm'} text-[rgb(13,118,128)] hover:text-[rgb(11,98,108)] transition-colors group`}
          >
            {showAllNews ? "Show less" : "Explore more"}
            <ChevronRight
              size={compact ? 14 : 16}
              className={`transition-transform duration-300 group-hover:translate-x-1 ${
                showAllNews ? "rotate-90" : ""
              }`}
            />
          </button>
        </div>
      )}
    </div>
  );
};

export default QuestionCard;
