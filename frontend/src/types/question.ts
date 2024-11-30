// types/question.ts
export interface Article {
  title: string;
  url: string;
  date?: string;
  isKeyEvent: boolean;
}

export interface DataPoint {
  date: string;
  probability: number;
}

export interface Event {
  date: string;
  title: string;
}

export interface Question {
  id: string;
  question: string;
  data: DataPoint[];
  articles: Article[];
  totalPredictions?: number;
  category?: 'AI' | 'Space' | 'Politics' | 'Technology' | 'Climate';
  isFollowing?: boolean;
  isUserQuestion?: boolean;
}

export interface QuestionCardProps {
  id: string;
  question: string;
  data: DataPoint[];
  articles: Article[];
}