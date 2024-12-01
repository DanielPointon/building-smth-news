import { Question } from 'types/question';

export const mockQuestions: Question[] = [
  {
    id: '1',
    question: 'Will AGI be achieved by 2025?',
    probability: 35,
    category: 'AI',
    totalPredictions: 156,
    isFollowing: false,
    data: [
      { date: 'Jan', probability: 30 },
      { date: 'Feb', probability: 32 },
      { date: 'Mar', probability: 35 }
    ],
    articles: [
      {
        id: 'a1',
        title: 'Latest Developments in AGI Research',
        published_date: '2024-03-15',
        author: 'Dr. Sarah Chen',
        content: [
          {
            type: 'text',
            content: 'Recent breakthroughs in neural architectures...'
          }
        ],
        main_image_url: '/api/placeholder/800/400',
        description: 'A comprehensive look at recent AGI developments'
      }
    ]
  },
  {
    id: '2',
    question: 'Will SpaceX achieve successful Starship orbital flight?',
    probability: 85,
    category: 'Space',
    totalPredictions: 234,
    isFollowing: true,
    data: [
      { date: 'Jan', probability: 75 },
      { date: 'Feb', probability: 80 },
      { date: 'Mar', probability: 85 }
    ],
    articles: []
  },
  {
    id: '3',
    question: 'Will global temperatures rise by more than 1.5°C by 2025?',
    probability: 65,
    category: 'Climate',
    totalPredictions: 189,
    isFollowing: false,
    data: [
      { date: 'Jan', probability: 60 },
      { date: 'Feb', probability: 62 },
      { date: 'Mar', probability: 65 }
    ],
    articles: []
  },
  {
    id: '4',
    question: 'Will quantum supremacy be demonstrated in a new domain?',
    probability: 45,
    category: 'Technology',
    totalPredictions: 123,
    isUserQuestion: true,
    isFollowing: false,
    data: [
      { date: 'Jan', probability: 40 },
      { date: 'Feb', probability: 42 },
      { date: 'Mar', probability: 45 }
    ],
    articles: []
  }
];
