import React, { useState } from 'react';
import GlobeVisualization from 'components/globe/GlobeVisualisation';
import { ChevronRight, Globe, MapPin, X } from 'lucide-react';
import { Question, Article, DataPoint } from 'types/question';
import { Card, CardContent } from 'components/ui/card';

interface Country {
  name: string;
  code: string;
}

const generateQuestions = (countryName: string): Question[] => {
  const baseQuestions = [
    {
      template: "Will {country} achieve its carbon neutrality targets by 2030?",
      category: "Climate"
    },
    {
      template: "Will {country}'s GDP growth exceed 3% in 2025?",
      category: "Politics"
    },
    {
      template: "Will {country} implement nationwide AI regulations by 2026?",
      category: "Technology"
    },
    {
      template: "Will {country} increase its renewable energy capacity by 50% before 2027?",
      category: "Climate"
    },
    {
      template: "Will {country} experience a change in government leadership by 2025?",
      category: "Politics"
    }
  ] as const;

  return baseQuestions.map((q, index) => {
    // Generate a series of data points for the last 6 months
    const data: DataPoint[] = Array.from({ length: 6 }).map((_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - i));
      return {
        date: date.toISOString().split('T')[0],
        probability: 30 + Math.random() * 40 // Random probability between 30-70
      };
    });

    // Calculate the current probability from the latest data point
    const currentProbability = data[data.length - 1].probability;

    // Generate mock articles
    const articles: Article[] = [
      {
        id: `${countryName}-article-${index}-1`,
        title: `Latest developments in ${countryName}'s ${q.category.toLowerCase()} sector`,
        published_date: new Date().toISOString(),
        author: "Financial Times",
        content: [],
        main_image_url: "",
        description: `Analysis of recent ${q.category.toLowerCase()} trends in ${countryName}`,
        isKeyEvent: true
      },
      {
        id: `${countryName}-article-${index}-2`,
        title: `${countryName} announces new ${q.category.toLowerCase()} initiatives`,
        published_date: new Date().toISOString(),
        author: "Financial Times",
        content: [],
        main_image_url: "",
        description: `New policies and changes in ${countryName}`,
        isKeyEvent: false
      }
    ];

    return {
      id: `${countryName}-${index}`,
      question: q.template.replace("{country}", countryName),
      data,
      articles,
      totalPredictions: Math.floor(Math.random() * 10000) + 1000,
      category: q.category as Question['category'],
      isFollowing: false,
      isUserQuestion: false,
      probability: currentProbability // Added probability property
    };
  });
};

const GlobalPage: React.FC = () => {
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);

  const handleCountrySelect = (countryName: string, countryCode: string) => {
    setSelectedCountry({ name: countryName, code: countryCode });
    setQuestions(generateQuestions(countryName));
  };

  const handleCloseSidebar = () => {
    setSelectedCountry(null);
    setQuestions([]);
  };

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
              {questions.map((question) => (
                <Card key={question.id} className="bg-[rgb(255,241,229)] border-none hover:shadow-md transition-shadow duration-200">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <p className="text-sm text-[rgb(13,118,128)] font-semibold mb-2">
                          {question.category}
                        </p>
                        <p className="text-[rgb(38,42,51)] font-georgia">
                          {question.question}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-2xl font-bold text-[rgb(13,118,128)]">
                          {Math.round(question.data[question.data.length - 1].probability)}%
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
                      <span>{question.totalPredictions?.toLocaleString()} predictions</span>
                      <button className="flex items-center gap-1 text-[rgb(13,118,128)] hover:text-[rgb(11,98,108)] transition-colors group">
                        View Details
                        <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
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
    </div>
  );
};

export default GlobalPage;