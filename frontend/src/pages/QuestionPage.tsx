import { useParams } from 'react-router-dom';
import { ProbabilityGraph } from '../components/graph/ProbabilityGraph';
import { TradingButtons } from '../components/trading/TradingButtons';
import { ArticleList } from '../components/articles/ArticleList';
import { useQuestions } from '../hooks/useQuestions';
import { Article } from '../types/question';
import { Card, CardContent, CardHeader, CardTitle } from 'components/ui/card';

// Define Event type if not already defined in types/question.ts
interface Event {
  date: string;
  title: string;
}

// Type guard to ensure article has required fields
function isValidArticle(article: Article): article is Article & { published_date: string } {
  return article.isKeyEvent === true && typeof article.published_date === 'string';
}

const QuestionPage = () => {
  const { id } = useParams();
  const { questions } = useQuestions();
  console.log(questions);
  const question = questions.find(q => q.id === id);

  if (!question) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-lg text-gray-500">Question not found</p>
      </div>
    );
  }

  const currentProbability = question.data[question.data.length - 1].probability;

  const validEvents: Event[] = question.articles
    .filter(isValidArticle)
    .map(article => ({
      date: article.published_date,
      title: article.title
    }));

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="bg-[rgb(255,241,229)] border-none shadow-lg">
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
              events={validEvents}
            />
          </div>

          <TradingButtons marketId={question.id} probability={currentProbability} />

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
