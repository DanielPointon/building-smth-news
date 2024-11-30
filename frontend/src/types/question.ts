// types/question.ts
export interface Article {
  id: string;
  title: string;
  published_date: string;
  author: string;
  content: Array<{
    type: "text" | "image";
    content?: string;
    image_url?: string;
    description?: string;
  }>;
  main_image_url: string;
  description: string;
  isKeyEvent?: boolean;
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
  probability: number | null;
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
  probability: number | null;
  data: DataPoint[];
  articles: Article[];
}

export interface Cluster {
  cluster_topic: string;
  article_ids: string[];
}