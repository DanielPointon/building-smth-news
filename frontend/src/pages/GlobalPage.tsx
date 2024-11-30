import React, { useState } from 'react';
import GlobeVisualization from 'components/globe/GlobeVisualisation';
import { ChevronRight, Globe, MapPin, X } from 'lucide-react';
import { Card, CardContent } from 'components/ui/card';

interface Country {
  name: string;
  code: string;
}

interface MockQuestion {
  id: string;
  title: string;
  probability: number;
  category: string;
  date: string;
}

const generateMockQuestions = (countryName: string): MockQuestion[] => {
  const baseQuestions = [
    {
      template: "Will {country} achieve its carbon neutrality targets by 2030?",
      category: "Climate"
    },
    {
      template: "Will {country}'s GDP growth exceed 3% in 2025?",
      category: "Economy"
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
  ];

  return baseQuestions.map((q, index) => ({
    id: `${countryName}-${index}`,
    title: q.template.replace("{country}", countryName),
    probability: Math.floor(Math.random() * 40) + 30,
    category: q.category,
    date: "2024-12-31"
  }));
};

const GlobalPage = () => {
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [questions, setQuestions] = useState<MockQuestion[]>([]);

  const handleCountrySelect = (countryName: string, countryCode: string) => {
    setSelectedCountry({ name: countryName, code: countryCode });
    setQuestions(generateMockQuestions(countryName));
  };

  const handleCloseSidebar = () => {
    setSelectedCountry(null);
    setQuestions([]);
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="p-6 bg-[rgb(242,223,206)]">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-georgia text-[rgb(38,42,51)] mb-4 flex items-center gap-2">
            <Globe className="w-8 h-8 text-[rgb(13,118,128)]" />
            Global Market Explorer
          </h1>
          <p className="text-[rgb(38,42,51)]">
            Select a country to explore its prediction markets and global economic indicators
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Globe Container */}
        <div className="flex-1 relative">
          <GlobeVisualization
            onCountrySelect={handleCountrySelect}
            selectedCountry={selectedCountry?.code}
          />
        </div>

        {/* Sliding Sidebar */}
        <div
          className={`absolute right-0 top-0 h-full w-96 transform transition-transform duration-300 ease-in-out ${
            selectedCountry ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="h-full bg-white shadow-xl border-l border-gray-200">
            {selectedCountry && (
              <>
                <div className="p-4 border-b border-gray-200 bg-[rgb(242,223,206)] flex justify-between items-center">
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

                <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-5rem)]">
                  {questions.map((question) => (
                    <Card key={question.id} className="bg-[rgb(255,241,229)] border-none hover:shadow-md transition-shadow duration-200">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <p className="text-sm text-[rgb(13,118,128)] font-semibold mb-2">
                              {question.category}
                            </p>
                            <p className="text-[rgb(38,42,51)] font-georgia">
                              {question.title}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-2xl font-bold text-[rgb(13,118,128)]">
                              {question.probability}%
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
                          <span>Closes {new Date(question.date).toLocaleDateString()}</span>
                          <button className="flex items-center gap-1 text-[rgb(13,118,128)] hover:text-[rgb(11,98,108)] transition-colors group">
                            View Details
                            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalPage;