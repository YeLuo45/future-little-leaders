/**
 * Review Mode — Knowledge point review with flash cards
 * V104: Spaced repetition review and learning verification
 */

class ReviewMode {
  constructor(conversationStore) {
    this.store = conversationStore
    this.currentReview = null
    this.cardIndex = 0
  }

  // Start a review session for a topic
  startReviewSession(childId, agentId, options = {}) {
    const conversations = this.store.getConversations(childId, agentId, {
      limit: options.topic ? 50 : 20
    }).items

    // Extract knowledge points from conversations
    const cards = []
    const seenTopics = new Set()

    conversations.forEach(conv => {
      const topics = conv.metadata.topics || []
      topics.forEach(topic => {
        if (!seenTopics.has(topic)) {
          seenTopics.add(topic)
          cards.push({
            topic: topic,
            conversationId: conv.id,
            agentId: agentId,
            difficulty: this.estimateDifficulty(conv),
            lastReviewed: null,
            reviewCount: 0
          })
        }
      })
    })

    // Shuffle and limit
    const shuffled = cards.sort(() => Math.random() - 0.5).slice(0, 20)

    this.currentReview = {
      childId: childId,
      agentId: agentId,
      cards: shuffled,
      currentIndex: 0,
      correct: 0,
      incorrect: 0,
      startTime: Date.now()
    }

    return this.currentReview
  }

  estimateDifficulty(conversation) {
    // Estimate difficulty based on message complexity and topic
    const avgLength = conversation.messages.reduce((sum, m) => sum + (m.content?.length || 0), 0) / conversation.messages.length
    if (avgLength > 200) return 'hard'
    if (avgLength > 100) return 'medium'
    return 'easy'
  }

  // Get current flash card
  getCurrentCard() {
    if (!this.currentReview) return null
    const card = this.currentReview.cards[this.currentReview.currentIndex]
    if (!card) return null

    // Generate flash card content
    const conv = this.store.getConversation(
      this.currentReview.childId,
      this.currentReview.agentId,
      card.conversationId
    )

    return {
      topic: card.topic,
      difficulty: card.difficulty,
      question: this.generateQuestion(card.topic, conv),
      answer: this.generateAnswer(card.topic, conv),
      progress: {
        current: this.currentReview.currentIndex + 1,
        total: this.currentReview.cards.length,
        correct: this.currentReview.correct
      }
    }
  }

  generateQuestion(topic, conversation) {
    const agentLabel = this.getAgentLabel(this.currentReview.agentId)
    const questions = [
      `${topic} 的核心要点是什么？`,
      `关于 ${topic}，你学到了什么？`,
      `用一句话解释 ${topic}`,
      `${agentLabel} 是怎么讲解 ${topic} 的？`,
      `${topic} 在生活中怎么应用？`
    ]
    return questions[Math.floor(Math.random() * questions.length)]
  }

  generateAnswer(topic, conversation) {
    // Find relevant messages about this topic
    const relevantMessages = conversation?.messages?.filter(m =>
      m.content?.includes(topic) || m.content?.length > 50
    ) || []

    if (relevantMessages.length > 0) {
      // Return a snippet from the conversation
      const msg = relevantMessages[Math.floor(Math.random() * relevantMessages.length)]
      return msg.content?.substring(0, 200) + (msg.content?.length > 200 ? '...' : '') || `关于 ${topic} 的学习内容`
    }
    return `在 ${agentLabel} 的课程中学习了 ${topic}，建议回顾课程内容加深理解。`
  }

  getAgentLabel(agentId) {
    return { math: '数学', chinese: '中文', english: '英语', life: '生活' }[agentId] || agentId
  }

  // Submit answer for current card
  submitAnswer(correct) {
    if (!this.currentReview) return null

    if (correct) {
      this.currentReview.correct++
    } else {
      this.currentReview.incorrect++
    }

    this.currentReview.currentIndex++

    // Check if review is complete
    if (this.currentReview.currentIndex >= this.currentReview.cards.length) {
      return this.finishReview()
    }

    return {
      isComplete: false,
      progress: {
        current: this.currentReview.currentIndex + 1,
        total: this.currentReview.cards.length,
        correct: this.currentReview.correct,
        incorrect: this.currentReview.incorrect
      }
    }
  }

  // Finish review session
  finishReview() {
    if (!this.currentReview) return null

    const duration = Date.now() - this.currentReview.startTime
    const result = {
      isComplete: true,
      totalCards: this.currentReview.cards.length,
      correct: this.currentReview.correct,
      incorrect: this.currentReview.incorrect,
      duration: duration,
      score: Math.round((this.currentReview.correct / this.currentReview.cards.length) * 100),
      recommendation: this.getRecommendation()
    }

    this.currentReview = null
    return result
  }

  getRecommendation() {
    if (!this.currentReview) return ''
    const score = this.currentReview.correct / this.currentReview.cards.length

    if (score >= 0.8) return '掌握良好，继续保持！'
    if (score >= 0.6) return '基本掌握，建议复习薄弱点'
    if (score >= 0.4) return '需要加强练习'
    return '建议重新学习相关课程'
  }

  // Get review history
  getReviewHistory(childId, limit = 10) {
    const stats = this.store.getStats(childId)
    return {
      totalReviews: stats.total,
      thisWeek: stats.thisWeek,
      favorites: stats.favorites,
      byAgent: stats.byAgent
    }
  }

  // Get weak topics for review
  getWeakTopics(childId) {
    const agents = ['math', 'chinese', 'english', 'life']
    const weakTopics = []

    agents.forEach(agentId => {
      const convs = this.store.getConversations(childId, agentId, { limit: 20 }).items
      const topicScores = new Map()

      convs.forEach(conv => {
        const topics = conv.metadata.topics || []
        topics.forEach(topic => {
          if (!topicScores.has(topic)) {
            topicScores.set(topic, { count: 0, scores: [] })
          }
          const data = topicScores.get(topic)
          data.count++
          if (conv.metadata.satisfaction) {
            data.scores.push(conv.metadata.satisfaction)
          }
        })
      })

      topicScores.forEach((data, topic) => {
        if (data.count >= 2) {
          const avgScore = data.scores.length > 0
            ? data.scores.reduce((a, b) => a + b, 0) / data.scores.length
            : 3 // Default middle score
          if (avgScore < 3.5) {
            weakTopics.push({ topic, agentId, avgScore, count: data.count })
          }
        }
      })
    })

    return weakTopics.sort((a, b) => a.avgScore - b.avgScore)
  }
}

// Spaced repetition scheduler
class SpacedRepetition {
  constructor() {
    this.intervals = {
      easy: [1, 3, 7, 14, 30], // days
      medium: [1, 2, 5, 10, 20],
      hard: [1, 1, 2, 3, 5]
    }
  }

  getNextReviewDate(difficulty, correctCount) {
    const intervalList = this.intervals[difficulty] || this.intervals.medium
    const index = Math.min(correctCount, intervalList.length - 1)
    const days = intervalList[index]
    const next = new Date()
    next.setDate(next.getDate() + days)
    return next.toISOString().split('T')[0]
  }

  shouldReview(topicData) {
    if (!topicData.nextReview) return true
    return new Date(topicData.nextReview) <= new Date()
  }
}

let reviewInstance = null

export function getReviewMode(conversationStore) {
  if (!reviewInstance) {
    reviewInstance = new ReviewMode(conversationStore)
  }
  return reviewInstance
}

export { ReviewMode, SpacedRepetition }