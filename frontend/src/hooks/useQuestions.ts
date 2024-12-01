import { useContext, useEffect, useState } from 'react'
import { ApiContentContext, UserContext } from '../App'
import { MarketsClient } from '../utils/MarketsClient'
import { NewsClient } from '../utils/NewsClient'
import { Article, DataPoint, Question } from 'types/question'
import { mockQuestions } from 'MockQuestions'

interface UseQuestions {
  questions: Question[]
  userQuestions: Question[]
  followedQuestions: Question[]
  addQuestion: (questionData: { question: string; initialProbability: number }) => void
  toggleFollowQuestion: (questionId: string) => void
  getQuestionsByCategory: (category: Question['category']) => Question[]
  loading: boolean
  error: string | null
  setQuestionData: (question: Question) => void
}

export const useQuestions = (): UseQuestions => {
  const [reloadKey, _setReloadKey] = useContext(ApiContentContext);
  const userId = useContext(UserContext)

  const [questions, setQuestions] = useState<Question[]>([])
  const [userQuestions, setUserQuestions] = useState<Question[]>([])
  const [followedQuestions, setFollowedQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const setQuestionData = async (q: Question) => {
    const marketsClient = new MarketsClient();
    const info = await marketsClient.getTrades(q.id.toString());
    const data = info.trades.map(t => ({ date: t.time, probability: t.price }));
    const midpoint = info.midpoint;

    q.data = data;
    q.probability = midpoint;

    setQuestions(prev => {
      const idx = userQuestions.findIndex(e => e.id == q.id);
      return [...prev.slice(0, idx), q, ...prev.slice(idx)];
    });
  };


  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true)
        // Use mock data instead of API call

        const newsClient = new NewsClient();
        const marketsClient = new MarketsClient();

        const newsQuestions = await newsClient.getQuestions();

        let newQuestions: Question[] = []

        let i = 0;
        for (const q of newsQuestions) {
          let data: DataPoint[];
          let midpoint: number | null = null

          if (i < 10) {
            const info = await marketsClient.getTrades(q.id.toString());
            data = info.trades.map(t => ({ date: t.time, probability: t.price }));
            midpoint = info.midpoint;
          } else {
            data = []
          }

          const articles = await newsClient.getArticlesForQuestion(q.id.toString());

          if (!articles) {
            continue;
          }

          newQuestions.push({
            id: q.id,
            question: q.question,
            probability: midpoint,
            data: data,
            articles: articles as unknown as Article[]
          })
        }

        setQuestions(newQuestions)

        console.log(newQuestions);

        // Set user questions
        const userQs = mockQuestions.filter(q => q.isUserQuestion)
        setUserQuestions(userQs)

        // Set followed questions
        const followedQs = mockQuestions.filter(q => q.isFollowing)
        setFollowedQuestions(followedQs)

        setError(null)
      } catch (err) {
        console.error('Error fetching questions:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch questions')
      } finally {
        setLoading(false)
      }
    }

    fetchQuestions()
  }, [userId])

  const addQuestion = async (questionData: { question: string; initialProbability: number }) => {
    try {
      // Create new mock question
      const newQuestion: Question = {
        id: `${Date.now()}`,
        question: questionData.question,
        probability: questionData.initialProbability,
        data: [
          {
            date: new Date().toLocaleDateString('en-US', { month: 'short' }),
            probability: questionData.initialProbability
          }
        ],
        articles: [],
        isUserQuestion: true,
        category: 'Technology' // Default category
      }

      setQuestions(prev => [...prev, newQuestion])
      setUserQuestions(prev => [...prev, newQuestion])
    } catch (error) {
      console.error('Error adding question:', error)
      throw error
    }
  }

  const toggleFollowQuestion = (questionId: string) => {
    const question = questions.find(q => q.id === questionId)
    if (!question) return

    const updatedQuestion = { ...question, isFollowing: !question.isFollowing }

    setQuestions(prev =>
      prev.map(q => q.id === questionId ? updatedQuestion : q)
    )

    if (updatedQuestion.isFollowing) {
      setFollowedQuestions(prev => [...prev, updatedQuestion])
    } else {
      setFollowedQuestions(prev =>
        prev.filter(q => q.id !== questionId)
      )
    }
  }

  const getQuestionsByCategory = (category: Question['category']) => {
    return questions.filter(q => q.category === category)
  }

  return {
    questions,
    userQuestions,
    followedQuestions,
    addQuestion,
    toggleFollowQuestion,
    getQuestionsByCategory,
    loading,
    error,
    setQuestionData
  }
}
