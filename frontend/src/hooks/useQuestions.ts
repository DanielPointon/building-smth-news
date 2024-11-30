import { useContext, useEffect, useState } from 'react'
import { ApiContentContext, UserContext } from '../App'
import { Market, MarketsClient } from '../utils/MarketsClient'
import { Question } from 'types/question'

// Define Article type
interface Article {
    id: string
    author: string
    title: string
    published_date: string
    isKeyEvent: boolean
    description: string
    main_image_url: string
    content: any[] // You might want to define a more specific type for content
}

// Update the interface to include loading and error
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

const questionsFromMarkets = async (markets: Market[]): Promise<Question[]> => {
    const client = new MarketsClient()
    const questions: Question[] = []

    for (const m of markets) {
        try {
            const trades = await client.getTrades(m.id)

            // Format trades into the data points expected by the UI
            const data = trades.trades.map(t => ({
                date: new Date(t.time).toLocaleDateString('en-US', { month: 'short' }),
                probability: Math.round(t.price)
            }))

            // Only add markets that have trade data
            if (data.length > 0) {
                questions.push({
                    id: m.id,
                    probability: trades.midpoint,
                    question: m.name,
                    category: 'AI', // You might want to get this from market metadata
                    totalPredictions: data.length,
                    data: data,
                    articles: [], // You might want to fetch related articles if available
                })
            }
        } catch (error) {
            console.error(`Error fetching trades for market ${m.id}:`, error)
        }
    }

    return questions
}

export const useQuestions = (): UseQuestions => {
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
                const client = new MarketsClient()
                const marketsResponse = await client.getMarkets(userId)

                if (!marketsResponse.markets) {
                    throw new Error('No markets data received')
                }

                const fetchedQuestions = await questionsFromMarkets(marketsResponse.markets)

                setQuestions(fetchedQuestions)

                // Also set user questions if userId matches
                const userQs = fetchedQuestions.filter(q => q.isUserQuestion)
                setUserQuestions(userQs)

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
            const client = new MarketsClient()
            const newMarket = await client.createMarket({
                name: questionData.question,
                description: 'Created via UI'
            })

            // Create initial order to set probability
            await client.createOrder(newMarket.id, {
                user_id: userId,
                side: 'bid',
                price: questionData.initialProbability,
                quantity: 100 // Initial liquidity
            })

            // Refetch questions to include the new one
            const marketsResponse = await client.getMarkets(userId)
            const updatedQuestions = await questionsFromMarkets(marketsResponse.markets)
            setQuestions(updatedQuestions)
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
