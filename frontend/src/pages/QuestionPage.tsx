// /frontend/src/pages/QuestionPage.tsx

import { useParams } from "react-router-dom";
// import { ProbabilityGraph } from "../components/graph/ProbabilityGraph";
import { TradingButtons } from "../components/trading/TradingButtons";
import { ArticleList } from "../components/articles/ArticleList";
import { useQuestion, useQuestions } from "../hooks/useQuestions";
import { Article, Question } from "../types/question";
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card";
import { useState, useEffect } from "react";
import TopicGraph from "components/TopicGraph";
import {
  ChevronRight,
  TrendingUp,
  Calendar,
  User,
  ExternalLink,
} from "lucide-react";
import { QuestionCard } from "components/questions/QuestionCard";

interface ClusterArticle {
  title: string;
  author: string;
  published_date: string;
  description: string;
}

interface Cluster {
  cluster_topic: string;
  article_list: ClusterArticle[];
}

interface ClusterResponse {
  clusters: Cluster[];
}

interface RelatedQuestionProps {
  question: Question;
}

const RelatedQuestion: React.FC<RelatedQuestionProps> = ({ question }) => {
  const currentProbability =
    question.data[question.data.length - 1].probability;

  return (
    <div className="bg-[rgb(242,223,206)] p-4 rounded-lg hover:shadow-md transition-all duration-200">
      <div className="flex justify-between items-start gap-4 mb-4">
        <div className="flex-1">
          <div className="text-sm text-[rgb(13,118,128)] font-semibold mb-2">
            {question.category}
          </div>
          <h3 className="text-[rgb(38,42,51)] font-georgia">
            {question.question}
          </h3>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xl font-bold text-[rgb(13,118,128)]">
            {currentProbability}%
          </span>
          <TrendingUp size={16} className="text-[rgb(13,118,128)]" />
        </div>
      </div>
      <div className="flex justify-between items-center text-sm text-gray-600">
        <span>
          {question.totalPredictions?.toLocaleString() || 0} predictions
        </span>
        <button className="flex items-center gap-1 text-[rgb(13,118,128)] hover:text-[rgb(11,98,108)] transition-colors group">
          View Details
          <ChevronRight
            size={14}
            className="group-hover:translate-x-1 transition-transform"
          />
        </button>
      </div>
    </div>
  );
};

interface ArticleCardProps {
  article: Article;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article }) => (
  <Card className="bg-[rgb(242,223,206)] hover:shadow-xl transition-shadow duration-300 mb-4">
    <CardContent className="p-6">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <h2 className="text-xl font-georgia text-[rgb(38,42,51)] mb-2">
            {article.title}
          </h2>
          <p className="text-[rgb(38,42,51)]/80 mb-4">{article.description}</p>
          <div className="flex items-center gap-4 text-sm text-[rgb(38,42,51)]/60">
            <div className="flex items-center gap-2">
              <User size={16} />
              <span>{article.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              <span>
                {new Date(article.published_date).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
        {/* {article.main_image_url && (
          <img
            src={article.main_image_url}
            alt={article.title}
            className="w-32 h-32 object-cover rounded-lg"
          />
        )} */}
      </div>
      {/* <div className="flex justify-end mt-4"> */}
      {/* <div className="flex items-center gap-1 text-[rgb(13,118,128)] text-sm group"> */}
      {/* <span>Read more</span> */}
      {/* <ExternalLink
            size={16}
            className="group-hover:translate-x-1 transition-transform"
          /> */}
      {/* </div> */}
      {/* </div> */}
    </CardContent>
  </Card>
);

const QuestionPage: React.FC = () => {
  const { id } = useParams();
  const { loading, question, setQuestionData } = useQuestion(id);
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [selectedCluster, setSelectedCluster] = useState<string | null>(null);

  // Add useEffect to fetch clusters
  useEffect(() => {
    const fetchClusters = async () => {
      if (id) {
        try {
          const response = await fetch(
            "http://localhost:8001/get_fake_clusters_for_question",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ question_id: id }),
            }
          );
          const data: ClusterResponse = await response.json();
          setClusters(data.clusters);
          console.log(data);
        } catch (error) {
          console.error("Error fetching clusters:", error);
        }
      }
    };

    fetchClusters();
  }, [id]);

  const currentQuestion = question;

  const finalArticles: Article[] = [];
  const finalClusters: { cluster_topic: string; article_ids: string[] }[] = [];

  // Unique ID counter for articles
  let articleId = 1;

  // Transform the data
  clusters.forEach((cluster) => {
    const articleIds: string[] = [];

    cluster.article_list.forEach((article) => {
      const articleObj = {
        id: articleId.toString(),
        title: article.title,
        description: article.description,
        author: article.author,
        published_date: article.published_date,
        content: [], // Placeholder for now
        main_image_url: "https://via.placeholder.com/300", // Placeholder image
        isKeyEvent: false, // Default value
      };
      finalArticles.push(articleObj);
      articleIds.push(articleObj.id);
      articleId++;
    });

    finalClusters.push({
      cluster_topic: cluster.cluster_topic,
      article_ids: articleIds,
    });
  });

  console.log("Articles:", finalArticles);
  console.log("Clusters:", finalClusters);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[rgb(13,118,128)]"></div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-lg text-gray-500">Loading</p>
      </div>
    );
  }

  // const currentProbability =
  //   currentQuestion.data[currentQuestion.data.length - 1].probability;

  const handleClusterSelect = (cluster: string) => {
    console.log("Selected cluster:", cluster);
    setSelectedCluster(cluster);
  };

  return (
    <div className="max-w-6xl mx-auto mb-12">
      <Card className="bg-[rgb(255,241,229)] border-none shadow-lg mb-8">
        {/* <CardHeader className="border-b border-gray-200">
          <CardTitle className="text-2xl font-georgia text-[rgb(38,42,51)]">
            {currentQuestion.question}
          </CardTitle>
          <div className="flex items-center gap-4 mt-4">
            <div className="bg-[rgb(242,223,206)] px-4 py-2 rounded-lg">
              <span className="text-sm text-gray-600">Current Probability</span>
              <p className="text-2xl font-bold text-[rgb(13,118,128)]">
                {currentProbability}%
              </p>
            </div>
            {currentQuestion.totalPredictions && (
              <div className="bg-[rgb(242,223,206)] px-4 py-2 rounded-lg">
                <span className="text-sm text-gray-600">Total Predictions</span>
                <p className="text-2xl font-bold text-[rgb(38,42,51)]">
                  {currentQuestion.totalPredictions.toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </CardHeader> */}

        <CardContent className="mt-6">
          <div className="bg-[rgb(242,223,206)] rounded-lg shadow-sm mb-6">
            {/* <ProbabilityGraph 
              data={currentQuestion.data}
              events={[]}
            /> */}
            <QuestionCard
              question={currentQuestion}
              id={currentQuestion.id}
              setQuestionData={setQuestionData}
            />
          </div>

          {/* <TradingButtons
            question={currentQuestion}
            setQuestionData={setQuestionData}
          /> */}

          <div className="mt-8 mb-8">
            <h3 className="text-xl font-georgia text-[rgb(38,42,51)] mb-4">
              Topic Network
            </h3>
            <TopicGraph
              articles={finalArticles}
              clusters={finalClusters}
              onClusterSelect={handleClusterSelect}
            />
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-georgia text-[rgb(38,42,51)] mb-4">
              Related Articles
            </h3>
            <div>
              {finalArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuestionPage;
