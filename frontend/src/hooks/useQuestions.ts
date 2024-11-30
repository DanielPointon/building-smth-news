import { useState } from 'react';
import { Question } from '../types/question';

const INITIAL_QUESTIONS: Question[] = [
  {
    id: '1',
    question: "Will AI surpass human intelligence by 2030?",
    category: 'AI',
    totalPredictions: 15234,
    data: [
      { date: 'Jan', probability: 45 },
      { date: 'Feb', probability: 48 },
      { date: 'Mar', probability: 52 },
      { date: 'Apr', probability: 58 }
    ],
    articles: [
      {
        title: "Google DeepMind Achieves Major Breakthrough in AGI Research",
        url: "#",
        date: 'Feb',
        isKeyEvent: true
      },
      {
        title: "Leading AI Researchers Debate Intelligence Metrics",
        url: "#",
        date: 'Feb',
        isKeyEvent: false
      },
      {
        title: "New Neural Architecture Shows Human-Level Reasoning",
        url: "#",
        date: 'Mar',
        isKeyEvent: true
      },
      {
        title: "Ethics Board Releases AI Safety Guidelines",
        url: "#",
        date: 'Apr',
        isKeyEvent: false
      }
    ]
  },
  {
    id: '2',
    question: "Will SpaceX successfully land on Mars by 2026?",
    category: 'Space',
    totalPredictions: 8721,
    data: [
      { date: 'Jan', probability: 65 },
      { date: 'Feb', probability: 62 },
      { date: 'Mar', probability: 59 },
      { date: 'Apr', probability: 64 }
    ],
    articles: [
      {
        title: "SpaceX Starship Completes Orbital Test Flight",
        url: "#",
        date: 'Feb',
        isKeyEvent: true
      },
      {
        title: "Mars Mission Timeline Updated",
        url: "#",
        date: 'Mar',
        isKeyEvent: false
      },
      {
        title: "Revolutionary Propulsion System Test Successful",
        url: "#",
        date: 'Mar',
        isKeyEvent: true
      }
    ]
  },
  {
    id: '3',
    question: "Will global temperatures rise by more than 1.5°C by 2025?",
    category: 'Climate',
    totalPredictions: 12453,
    data: [
      { date: 'Jan', probability: 72 },
      { date: 'Feb', probability: 75 },
      { date: 'Mar', probability: 78 },
      { date: 'Apr', probability: 82 }
    ],
    articles: [
      {
        title: "Record Breaking Temperatures in Pacific Region",
        url: "#",
        date: 'Feb',
        isKeyEvent: true
      },
      {
        title: "New Climate Model Predictions Released",
        url: "#",
        date: 'Mar',
        isKeyEvent: true
      },
      {
        title: "Global Climate Summit Announces New Measures",
        url: "#",
        date: 'Apr',
        isKeyEvent: false
      }
    ]
  },
  {
    id: '4',
    question: "Will Apple release AR glasses in 2024?",
    category: 'Technology',
    totalPredictions: 9876,
    data: [
      { date: 'Jan', probability: 82 },
      { date: 'Feb', probability: 78 },
      { date: 'Mar', probability: 85 },
      { date: 'Apr', probability: 88 }
    ],
    articles: [
      {
        title: "Apple Supplier Leaks AR Component Production",
        url: "#",
        date: 'Feb',
        isKeyEvent: true
      },
      {
        title: "Patent Filing Reveals New AR Interface",
        url: "#",
        date: 'Mar',
        isKeyEvent: true
      },
      {
        title: "Industry Analysts Predict Q4 Launch",
        url: "#",
        date: 'Apr',
        isKeyEvent: false
      }
    ]
  }
];

interface UseQuestions {
  questions: Question[];
  userQuestions: Question[];
  followedQuestions: Question[];
  addQuestion: (questionData: { question: string; initialProbability: number }) => void;
  toggleFollowQuestion: (questionId: string) => void;
  getQuestionsByCategory: (category: Question['category']) => Question[];
}

export const useQuestions = (): UseQuestions => {
  const [questions, setQuestions] = useState<Question[]>(INITIAL_QUESTIONS);
  const [userQuestions, setUserQuestions] = useState<Question[]>([]);
  const [followedQuestions, setFollowedQuestions] = useState<Question[]>([]);

  const addQuestion = (questionData: { question: string; initialProbability: number }) => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      question: questionData.question,
      data: [{
        date: new Date().toLocaleDateString(),
        probability: questionData.initialProbability
      }],
      articles: [],
      totalPredictions: 0,
      isUserQuestion: true
    };

    setQuestions(prev => [...prev, newQuestion]);
    setUserQuestions(prev => [...prev, newQuestion]);
  };

  const toggleFollowQuestion = (questionId: string) => {
    const question = questions.find(q => q.id === questionId);
    if (!question) return;

    const updatedQuestion = { ...question, isFollowing: !question.isFollowing };
    
    setQuestions(prev => 
      prev.map(q => q.id === questionId ? updatedQuestion : q)
    );

    if (updatedQuestion.isFollowing) {
      setFollowedQuestions(prev => [...prev, updatedQuestion]);
    } else {
      setFollowedQuestions(prev => 
        prev.filter(q => q.id !== questionId)
      );
    }
  };

  const getQuestionsByCategory = (category: Question['category']) => {
    return questions.filter(q => q.category === category);
  };

  return {
    questions,
    userQuestions,
    followedQuestions,
    addQuestion,
    toggleFollowQuestion,
    getQuestionsByCategory
  };
};