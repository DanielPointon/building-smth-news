export class NewsClient {
    private baseURL: string;

    constructor() {
      // FIXME: env
      this.baseURL = "http://localhost:8001";
    }

    private async request<T>(
        endpoint: string,
        method: 'GET' | 'POST',
        body?: any
    ): Promise<T> {
        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: body ? JSON.stringify(body) : undefined,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
                `HTTP error! status: ${response.status}, body: ${errorText}`
            );
        }

        return response.json();
    }

    // create a new article
    async createArticle(article: ArticleInput): Promise<{ article_id: string; message: string }> {
        return this.request('/articles/create', 'POST', article);
    }

    // fetch an article by id
    async getArticle(articleId: string): Promise<ArticleInput> {
        return this.request(`/articles/${articleId}`, 'GET');
    }

    async getArticlesForQuestion(questionId: string): Promise<ArticleInput[]> {
        return this.request(`/articles-for-question/${questionId}`, 'GET');
    }

    // get all questions
    async getQuestions(): Promise<Question[]> {
        return this.request('/questions', 'GET');
    }

    // get questions related to a country
    async getQuestionsByCountry(countryCode: string): Promise<Question[]> {
        return this.request(`/questions/country/${countryCode}`, 'GET');
    }

    // fetch events related to a specific question
    async getEventsForQuestion(questionId: string): Promise<ExtractedEvents> {
        return this.request(`/questions/${questionId}/events`, 'POST', {});
    }

    // generate clusters for a specific question
    async getClustersForQuestion(request: ClusterRequest): Promise<ClusteredSubtopics> {
        return this.request('/get_clusters_for_question', 'POST', request);
    }
}

// models to match the python server types
interface ArticleInput {
    id?: string;
    title: string;
    description: string;
    author: string;
    published_date: string;
    content: ArticleContent[];
    metadata: Record<string, unknown>;
    questions: QuestionInput[];
}

interface ArticleContent {
    root: TextContent | ImageContent;
}

interface TextContent {
    text: string;
}

interface ImageContent {
    image_url: string;
    image_caption: string;
}

interface QuestionInput {
    id: number;
    text: string;
    metadata: Record<string, unknown>;
}

interface Question {
    id: string;
    question: string;
    metadata: Record<string, unknown>;
    index_in_article?: number | null;
}

interface ExtractedEvents {
    question_id: number;
    events: Event[];
}

interface Event {
    event_title?: string;
    event_date?: string;
    article_id: number;
}

interface ClusterRequest {
    question_id: string;
}

interface ClusteredSubtopics {
    question_id: number;
    clusters: Cluster[];
}

interface Cluster {
    cluster_topic: string;
    article_ids: number[];
}
