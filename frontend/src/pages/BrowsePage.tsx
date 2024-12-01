import React from "react";
import { useQuestions } from "../hooks/useQuestions";
import { Alert, AlertDescription } from "components/ui/alert";
import { QuestionCard } from "components/questions/QuestionCard";
import { ViewToggle } from "../components/navigation/ViewToggle";

export const BrowsePage: React.FC = () => {
  const { questions, loading, error, setQuestionData } = useQuestions();

  const truncatedQuestions = questions.slice(0,20);
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[rgb(13,118,128)]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert>
        <AlertDescription>Error loading questions: {error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div>
      {/* <div className="bg-[rgb(242,223,206)] p-6 mb-8 rounded-lg"> */}
      <div className="w-4/5 mx-auto space-y-6 border border-gray-200 rounded-lg p-6 mb-8 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-georgia text-[rgb(38,42,51)]">
            Prediction Markets
          </h1>
          <ViewToggle />
        </div>
        <p className="text-[rgb(38,42,51)]">
        Explore the questions shaping the future. 
        </p>
      </div>

      {truncatedQuestions.length === 0 ? (
        <div className="text-center py-8 text-gray-600">
          No predictions available at the moment.
        </div>
      ) : (
        <div className="w-4/5 mx-auto space-y-6">
          {truncatedQuestions.map((q) => (
            <QuestionCard
              key={q.id}
              id={q.id}
              question={q}
              setQuestionData={setQuestionData}
            />
          ))}
        </div>
      )}
    </div>
  );
};
