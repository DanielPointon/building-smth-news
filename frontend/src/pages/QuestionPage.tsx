import { useParams } from 'react-router-dom';
import { ProbabilityGraph } from '../components/graph/ProbabilityGraph';
import { TradingButtons } from '../components/trading/TradingButtons';
import { ArticleList } from '../components/articles/ArticleList';
import { useQuestions } from '../hooks/useQuestions';
import { Article } from '../types/question';
import { Card, CardContent, CardHeader, CardTitle } from 'components/ui/card';
import { useState } from 'react';
import TopicGraph from 'components/TopicGraph';

// Mock clusters data - replace with actual API data
const mockClusters = [
  {
    cluster_topic: "Economic Impact",
    article_ids: ["1", "2", "3"]
  },
  {
    cluster_topic: "Technology Adoption",
    article_ids: ["4", "5"]
  },
  {
    cluster_topic: "Social Implications",
    article_ids: ["6", "7", "8"]
  }
];

const QuestionPage = () => {
  const { id } = useParams();
  const { questions } = useQuestions();
  const [selectedCluster, setSelectedCluster] = useState<string | null>(null);
  
  const question = questions.find(q => q.id === id);

  if (!question) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-lg text-gray-500">Question not found</p>
      </div>
    );
  }

  const handleClusterSelect = (cluster: string) => {
    console.log('Selected cluster:', cluster);
    setSelectedCluster(cluster);
  };

  const currentProbability = question.data[question.data.length - 1].probability;

  return (
    <div className="max-w-6xl mx-auto">
      <Card className="bg-[rgb(255,241,229)] border-none shadow-lg mb-8">
        <CardHeader className="border-b border-gray-200">
          <CardTitle className="text-2xl font-georgia text-[rgb(38,42,51)]">
            {question.question}
          </CardTitle>
          <div className="flex items-center gap-4 mt-4">
            <div className="bg-[rgb(242,223,206)] px-4 py-2 rounded-lg">
              <span className="text-sm text-gray-600">Current Probability</span>
              <p className="text-2xl font-bold text-[rgb(13,118,128)]">
                {currentProbability}%
              </p>
            </div>
            {question.totalPredictions && (
              <div className="bg-[rgb(242,223,206)] px-4 py-2 rounded-lg">
                <span className="text-sm text-gray-600">Total Predictions</span>
                <p className="text-2xl font-bold text-[rgb(38,42,51)]">
                  {question.totalPredictions.toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="mt-6">
          <div className="bg-[rgb(242,223,206)] rounded-lg shadow-sm mb-6">
            <ProbabilityGraph 
              data={question.data}
              events={[]}
            />
          </div>

          <TradingButtons marketId={question.id} probability={currentProbability} />

          <div className="mt-8 mb-8">
            <h3 className="text-xl font-georgia text-[rgb(38,42,51)] mb-4">Topic Network</h3>
            <TopicGraph 
              clusters={mockClusters}
              onClusterSelect={handleClusterSelect}
            />
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-georgia text-[rgb(38,42,51)] mb-4">Related Articles</h3>
            <ArticleList 
              articles={question.articles} 
              showAll={true}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuestionPage;