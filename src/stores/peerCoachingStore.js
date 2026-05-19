/**
 * V78 Peer Coaching Store
 * 同伴辅导系统状态管理
 * 学习伙伴匹配、同伴答疑、互评反馈
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import peerCoachingService, {
  MATCH_STATUS,
  SKILL_CATEGORY,
  SKILL_INFO,
  MATCH_TYPE,
  QUESTION_STATUS,
  FEEDBACK_TYPE
} from '@/services/peerCoachingService.js'

export const usePeerCoachingStore = defineStore('peerCoaching', () => {
  // ==================== 状态 ====================

  // 学习伙伴匹配
  const buddyMatch = ref(null)
  const recommendedBuddies = ref([])
  
  // 同伴答疑
  const questions = ref([])
  const currentQuestion = ref(null)
  const questionAnswers = ref([])
  
  // 互评反馈
  const myFeedbacks = ref([])
  const buddyFeedbacks = ref([])
  const feedbackStats = ref({
    sentCount: 0,
    receivedCount: 0,
    avgRating: 0,
    progressCount: 0,
    encouragementCount: 0
  })
  
  // 统计数据
  const statistics = ref({
    matchCount: 0,
    questionCount: 0,
    answerCount: 0,
    feedbackCount: 0
  })
  
  // 当前选中标签
  const currentTab = ref('match')

  // ==================== 初始化 ====================

  const init = () => {
    peerCoachingService.init()
    loadBuddyMatch()
    loadQuestions()
    loadFeedbacks()
    loadStatistics()
    loadRecommendedBuddies()
  }

  // ==================== 计算属性 ====================

  // 是否已匹配伙伴
  const hasBuddy = computed(() => {
    return buddyMatch.value && buddyMatch.value.status === MATCH_STATUS.MATCHED
  })

  // 我的问题（按时间排序）
  const sortedMyQuestions = computed(() => {
    return [...questions.value].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  })

  // 伙伴的问题
  const sortedBuddyQuestions = computed(() => {
    return questions.value
      .filter(q => q.partnerId === buddyMatch.value?.partnerId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  })

  // 待回答的问题
  const openQuestions = computed(() => {
    return questions.value.filter(q => q.status === QUESTION_STATUS.OPEN)
  })

  // 已采纳的问题
  const answeredQuestions = computed(() => {
    return questions.value.filter(q => q.status === QUESTION_STATUS.ANSWERED)
  })

  // ==================== 学习伙伴匹配 Actions ====================

  const loadBuddyMatch = () => {
    buddyMatch.value = peerCoachingService.getCurrentUserMatch()
  }

  const loadRecommendedBuddies = () => {
    recommendedBuddies.value = peerCoachingService.getRecommendedBuddies()
  }

  const createBuddyMatch = (data) => {
    const match = peerCoachingService.createBuddyMatch(data)
    loadBuddyMatch()
    return match
  }

  const updateBuddyMatch = (id, data) => {
    const match = peerCoachingService.updateBuddyMatch(id, data)
    loadBuddyMatch()
    return match
  }

  const findAndMatchBuddy = (userProfile) => {
    const match = peerCoachingService.findAndMatchBuddy(userProfile)
    loadBuddyMatch()
    loadRecommendedBuddies()
    return match
  }

  const getMatchSuggestions = (skills, interests) => {
    // 基于技能和兴趣推荐伙伴
    const buddies = recommendedBuddies.value
    return buddies.filter(b => {
      const hasSkillMatch = b.skills?.some(s => skills.includes(s))
      const hasInterestMatch = b.interests?.some(i => interests.includes(i))
      return hasSkillMatch || hasInterestMatch
    })
  }

  // ==================== 同伴答疑 Actions ====================

  const loadQuestions = () => {
    questions.value = peerCoachingService.getQuestions()
  }

  const loadQuestionDetail = (id) => {
    currentQuestion.value = peerCoachingService.getQuestionById(id)
    questionAnswers.value = peerCoachingService.getAnswersByQuestion(id)
  }

  const postQuestion = (data) => {
    const question = peerCoachingService.postQuestion(data)
    loadQuestions()
    loadStatistics()
    return question
  }

  const acceptAnswer = (questionId, answerId) => {
    peerCoachingService.acceptAnswer(questionId, answerId)
    loadQuestions()
    loadQuestionDetail(questionId)
  }

  const closeQuestion = (id) => {
    peerCoachingService.closeQuestion(id)
    loadQuestions()
  }

  const addAnswer = (data) => {
    const answer = peerCoachingService.addAnswer(data)
    loadQuestionDetail(data.questionId)
    loadStatistics()
    return answer
  }

  const getMyQuestions = () => {
    return peerCoachingService.getMyQuestions()
  }

  const getBuddyQuestions = () => {
    return peerCoachingService.getBuddyQuestions()
  }

  // ==================== 互评反馈 Actions ====================

  const loadFeedbacks = () => {
    myFeedbacks.value = peerCoachingService.getMyFeedbacks()
    buddyFeedbacks.value = peerCoachingService.getBuddyFeedbacks()
    feedbackStats.value = peerCoachingService.getFeedbackStats()
  }

  const sendFeedback = (data) => {
    const feedback = peerCoachingService.sendFeedback(data)
    loadFeedbacks()
    loadStatistics()
    return feedback
  }

  const updateFeedback = (id, data) => {
    const feedback = peerCoachingService.updateFeedback(id, data)
    loadFeedbacks()
    return feedback
  }

  const getProgressFeedbacks = () => {
    return buddyFeedbacks.value.filter(f => f.type === FEEDBACK_TYPE.PROGRESS)
  }

  const getEncouragementFeedbacks = () => {
    return buddyFeedbacks.value.filter(f => f.type === FEEDBACK_TYPE.ENCOURAGEMENT)
  }

  // ==================== 统计 Actions ====================

  const loadStatistics = () => {
    const allFeedbacks = peerCoachingService.getFeedbacks()
    const allAnswers = peerCoachingService.getAnswers()
    const allMatches = peerCoachingService.getBuddyMatches()
    
    statistics.value = {
      matchCount: allMatches.filter(m => m.status === MATCH_STATUS.MATCHED).length,
      questionCount: questions.value.length,
      answerCount: allAnswers.length,
      feedbackCount: allFeedbacks.length
    }
  }

  // ==================== 工具函数 ====================

  const getSkillInfo = (skill) => {
    return SKILL_INFO[skill] || { label: skill, icon: '📌', color: '#999' }
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now - date
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) return '今天'
    if (days === 1) return '昨天'
    if (days < 7) return `${days}天前`
    
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
  }

  return {
    // 状态
    buddyMatch,
    recommendedBuddies,
    questions,
    currentQuestion,
    questionAnswers,
    myFeedbacks,
    buddyFeedbacks,
    feedbackStats,
    statistics,
    currentTab,

    // 计算属性
    hasBuddy,
    sortedMyQuestions,
    sortedBuddyQuestions,
    openQuestions,
    answeredQuestions,

    // 初始化
    init,

    // 学习伙伴匹配
    loadBuddyMatch,
    loadRecommendedBuddies,
    createBuddyMatch,
    updateBuddyMatch,
    findAndMatchBuddy,
    getMatchSuggestions,

    // 同伴答疑
    loadQuestions,
    loadQuestionDetail,
    postQuestion,
    acceptAnswer,
    closeQuestion,
    addAnswer,
    getMyQuestions,
    getBuddyQuestions,

    // 互评反馈
    loadFeedbacks,
    sendFeedback,
    updateFeedback,
    getProgressFeedbacks,
    getEncouragementFeedbacks,

    // 统计
    loadStatistics,

    // 工具
    getSkillInfo,
    formatDate
  }
})
