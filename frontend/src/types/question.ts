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
  probability: number | null | undefined;
  data: DataPoint[];
  articles: Article[];
  totalPredictions?: number;
  category?: 'AI' | 'Space' | 'Politics' | 'Technology' | 'Climate';
  isFollowing?: boolean;
  isUserQuestion?: boolean;
}

type PartialQuestion = Omit<Question, 'articles' | 'data'>;

export interface QuestionCardProps {
  id: string;
  question: PartialQuestion & { 'articles'?: Article[], data?: DataPoint[]};
  setQuestionData: (question: Question) => void;
}

export interface Cluster {
  cluster_topic: string;
  article_ids: string[];
}
