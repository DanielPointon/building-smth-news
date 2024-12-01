import { useParams } from "react-router-dom";
import { TradingButtons } from "../components/trading/TradingButtons";
import { useQuestion } from "../hooks/useQuestions";
import { Article, Question } from "../types/question";
import { Card, CardContent } from "components/ui/card";
import { useState, useEffect } from "react";
import TopicGraph from "components/TopicGraph";
import { User, Calendar, ExternalLink } from "lucide-react";
import QuestionCard from "components/questions/QuestionCard";

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
      </div>
    </CardContent>
  </Card>
);

const LoadingTopicClusters: React.FC = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-[600px] bg-[rgb(242,223,206)] rounded-lg opacity-50" />
    <div className="space-y-2">
      <div className="h-4 bg-[rgb(242,223,206)] rounded w-1/4" />
      <div className="h-4 bg-[rgb(242,223,206)] rounded w-1/2" />
    </div>
  </div>
);

const QuestionPage: React.FC = () => {
  const { id } = useParams();
  const { loading, question, setQuestionData } = useQuestion(id);
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [selectedCluster, setSelectedCluster] = useState<string | null>(null);
  const [loadingClusters, setLoadingClusters] = useState(true);

  useEffect(() => {
    const fetchClusters = async () => {
      if (id) {
        try {
          setLoadingClusters(true);
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
        } catch (error) {
          console.error("Error fetching clusters:", error);
        } finally {
          setLoadingClusters(false);
        }
      }
    };

    fetchClusters();
  }, [id]);

  const currentQuestion = question;

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

  const finalArticles: Article[] = [];
  const finalClusters: { cluster_topic: string; article_ids: string[] }[] = [];

  let articleId = 1;

  clusters && clusters.forEach((cluster) => { 
    const articleIds: string[] = [];
 
    cluster && cluster.article_list && cluster.article_list.forEach((article) => {
      const articleObj = {
        id: articleId.toString(),
        title: article.title,
        description: article.description,
        author: article.author,
        published_date: article.published_date,
        content: [],
        main_image_url: "https://via.placeholder.com/300",
        isKeyEvent: false,
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

  const handleClusterSelect = (cluster: string) => {
    setSelectedCluster(cluster);
  };

  const getSelectedClusterArticles = (): Article[] => {
    if (!selectedCluster) return [];

    const selectedClusterData = clusters.find(
      (c) => c.cluster_topic === selectedCluster
    );
    if (!selectedClusterData) return [];

    return selectedClusterData.article_list.map((article, index) => ({
      id: index.toString(),
      title: article.title,
      description: article.description,
      author: article.author,
      published_date: article.published_date,
      content: [],
      main_image_url: "https://via.placeholder.com/300",
      isKeyEvent: false,
    }));
  };

  return (
    <div className="max-w-6xl mx-auto mb-12">
      <Card className="bg-[rgb(255,241,229)] border-none shadow-lg mb-8">
        <CardContent className="mt-6">
          <div className="bg-[rgb(242,223,206)] rounded-lg shadow-sm mb-6">
            <QuestionCard
              question={currentQuestion}
              id={currentQuestion.id}
              setQuestionData={setQuestionData}
            />
          </div>

          <div className="mt-8 mb-8">
            <h3 className="text-xl font-georgia text-[rgb(38,42,51)] mb-4">
              Topic Clusters
            </h3>

            <div className="mb-8">
              {loadingClusters ? (
                <LoadingTopicClusters />
              ) : (
                <TopicGraph
                  clusters={finalClusters}
                  articles={finalArticles}
                  onClusterSelect={handleClusterSelect}
                />
              )}
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-georgia text-[rgb(38,42,51)] mb-4">
              {selectedCluster
                ? `Articles: ${selectedCluster}`
                : "Select a topic cluster to view its articles"}
            </h3>
            <div>
              {selectedCluster ? (
                getSelectedClusterArticles().map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">
                  Click on a topic cluster above to view its related articles
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuestionPage;