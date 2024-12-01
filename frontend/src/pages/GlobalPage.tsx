import React, { useEffect, useState, useMemo } from 'react';
import GlobeVisualization from 'components/globe/GlobeVisualisation';
import { ChevronRight, Globe, MapPin, X } from 'lucide-react';
import { Card, CardContent } from 'components/ui/card';
import { NewsClient, Question } from 'utils/NewsClient';
import { QuestionCard } from 'components/questions/QuestionCard';

const GlobalPage: React.FC = () => {
  const [selectedCountry, setSelectedCountry] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionData, setQuestionData] = useState<any>(null);
  
  // Create newsClient once using useMemo
  const newsClient = useMemo(() => new NewsClient(), []);

  console.log("News Client");
  console.log(newsClient);

  useEffect(() => {
    let isSubscribed = true;

    const fetchQuestions = async () => {
      if (selectedCountry) {
        try {
          const questions = await newsClient.getQuestionsByCountry(selectedCountry.code);
          if (isSubscribed) {
            setQuestions(questions);
          }
        } catch (error) {
          console.error('Error fetching questions:', error);
        }
      }
    };

    fetchQuestions();

    // Cleanup function to prevent setting state on unmounted component
    return () => {
      isSubscribed = false;
    };
  }, [selectedCountry]); // Remove newsClient from dependencies

  const handleCountrySelect = (countryName: string, countryCode: string) => {
    setSelectedCountry({ name: countryName, code: countryCode });
  };

  const handleCloseSidebar = () => {
    setSelectedCountry(null);
    setQuestions([]);
    setQuestionData(null);
  };

  // Rest of the component remains the same...
  return (
    <div className="h-screen flex">
      {/* Sidebar */}
      <div className="w-96 bg-[rgb(255,241,229)] border-r border-gray-200 flex flex-col">
        {/* Header Content */}
        <div className="p-6 bg-[rgb(242,223,206)] border-b border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-8 h-8 text-[rgb(13,118,128)]" />
            <h1 className="text-2xl font-georgia text-[rgb(38,42,51)]">
              Global Market Explorer
            </h1>
          </div>
          {!selectedCountry && (
            <p className="text-[rgb(38,42,51)]">
              Select a country to explore its prediction markets and global economic indicators
            </p>
          )}
        </div>

        {/* Selected Country Content */}
        {selectedCountry ? (
          <div className="flex-1 flex flex-col">
            <div className="p-4 bg-[rgb(242,223,206)] border-b border-gray-200 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[rgb(13,118,128)]" />
                <h2 className="text-xl font-georgia text-[rgb(38,42,51)]">
                  {selectedCountry.name}
                </h2>
              </div>
              <button
                onClick={handleCloseSidebar}
                className="text-gray-500 hover:text-[rgb(13,118,128)] transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
              {questions.map((q) => (
                <QuestionCard
                  key={q.id}
                  id={q.id}
                  question={{
                    ...q,
                    probability: undefined,
                  }}
                  setQuestionData={setQuestionData}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-6 bg-[rgb(255,241,229)]">
            <div className="text-gray-500 text-center animate-pulse">
              <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              Click on a country to view its markets
            </div>
          </div>
        )}
      </div>

      {/* Globe Container */}
      <div className="flex-1">
        <GlobeVisualization
          onCountrySelect={handleCountrySelect}
          selectedCountry={selectedCountry?.code}
        />
      </div>

      {/* Question Data Sidebar */}
      {questionData && (
        <div className="w-96 bg-[rgb(255,241,229)] border-l border-gray-200 flex flex-col">
          {/* Add your question data sidebar content here */}
        </div>
      )}
    </div>
  );
};

export default GlobalPage;