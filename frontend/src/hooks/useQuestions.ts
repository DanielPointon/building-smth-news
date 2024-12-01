import { useContext, useEffect, useState } from 'react'
import { ApiContentContext, UserContext } from '../App'
import { MarketsClient } from '../utils/MarketsClient'
import { Question } from 'types/question'
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
}

export const useQuestions = (): UseQuestions => {
  for (const question of mockQuestions) {
    const client = new MarketsClient();
    client.createMarket({ name: question.question, description: "" }).then(
      market => question.id = market.id
    );
  }

  const [reloadKey, _setReloadKey] = useContext(ApiContentContext);
  const userId = useContext(UserContext)

  const [questions, setQuestions] = useState<Question[]>([])
  const [userQuestions, setUserQuestions] = useState<Question[]>([])
  const [followedQuestions, setFollowedQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true)
        // Use mock data instead of API call
        setQuestions(mockQuestions)

        console.log(mockQuestions);

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
  }, [userId, reloadKey])

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
    error
  }
}
