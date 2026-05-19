// src/stores/safetyStore.js
// V63 Safety Education Store
// 安全教育状态管理

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useBabyStore } from './babyStore.js'
import {
  getSafetyKnowledge,
  getSafetyKnowledgeByCategory,
  getSafetyKnowledgeById,
  getSafetyStats,
  markSafetyKnowledgeLearned,
  isKnowledgeLearned,
  getLearnedKnowledgeIds,
  getSafetyQuizQuestions,
  saveSafetyQuizScore,
  getSafetyQuizHistory,
  SAFETY_CATEGORIES,
  CATEGORY_INFO
} from '@/services/safetyService.js'

export const useSafetyStore = defineStore('safety', () => {
  // ==================== 状态 ====================
  
  // 当前选中的分类
  const currentCategory = ref(null)
  
  // 安全知识列表
  const safetyKnowledge = ref([])
  
  // 当前选中的知识详情
  const selectedKnowledge = ref(null)
  
  // 已学习的知识ID列表
  const learnedKnowledgeIds = ref([])
  
  // 安全统计
  const safetyStats = ref(null)
  
  // Quiz题目
  const quizQuestions = ref([])
  
  // 当前Quiz索引
  const currentQuestionIndex = ref(0)
  
  // Quiz答案
  const quizAnswers = ref([])
  
  // Quiz历史
  const quizHistory = ref([])
  
  // 是否正在加载
  const isLoading = ref(false)
  
  // 错误信息
  const errorMessage = ref('')
  
  // ==================== 计算属性 ====================
  
  const babyStore = useBabyStore()
  
  // 当前宝宝ID
  const currentBabyId = computed(() => babyStore.currentBabyId)
  
  // 已学习数量
  const learnedCount = computed(() => learnedKnowledgeIds.value.length)
  
  // 总知识数量
  const totalCount = computed(() => safetyKnowledge.value.length)
  
  // 当前题目
  const currentQuestion = computed(() => {
    if (quizQuestions.value.length === 0) return null
    return quizQuestions.value[currentQuestionIndex.value] || null
  })
  
  // Quiz进度
  const quizProgress = computed(() => {
    if (quizQuestions.value.length === 0) return 0
    return Math.round((currentQuestionIndex.value / quizQuestions.value.length) * 100)
  })
  
  // 学习进度（百分比）
  const learningProgress = computed(() => {
    if (totalCount.value === 0) return 0
    return Math.round((learnedCount.value / totalCount.value) * 100)
  })
  
  // 按分类的学习进度
  const categoryProgress = computed(() => {
    if (!safetyStats.value) return {}
    const progress = {}
    Object.keys(safetyStats.value.byCategory).forEach(cat => {
      const catStats = safetyStats.value.byCategory[cat]
      progress[cat] = catStats.total > 0 
        ? Math.round((catStats.learned / catStats.total) * 100) 
        : 0
    })
    return progress
  })
  
  // 今日是否学习过
  const learnedToday = computed(() => {
    // 如果有已学习的知识，视为今日已学习
    return learnedKnowledgeIds.value.length > 0
  })
  
  // ==================== 方法 ====================
  
  /**
   * 初始化
   */
  const init = () => {
    if (!currentBabyId.value) return
    
    loadSafetyKnowledge()
    loadSafetyStats()
    loadLearnedKnowledge()
    loadQuizHistory()
  }
  
  /**
   * 切换分类
   */
  const switchCategory = (category) => {
    currentCategory.value = category
    if (category) {
      safetyKnowledge.value = getSafetyKnowledgeByCategory(category)
    } else {
      safetyKnowledge.value = getSafetyKnowledge()
    }
  }
  
  /**
   * 加载安全知识
   */
  const loadSafetyKnowledge = (category = null) => {
    if (category) {
      safetyKnowledge.value = getSafetyKnowledgeByCategory(category)
    } else {
      safetyKnowledge.value = getSafetyKnowledge()
    }
  }
  
  /**
   * 选择知识详情
   */
  const selectKnowledge = (knowledge) => {
    selectedKnowledge.value = knowledge
  }
  
  /**
   * 加载安全统计
   */
  const loadSafetyStats = () => {
    if (!currentBabyId.value) return
    safetyStats.value = getSafetyStats(currentBabyId.value)
  }
  
  /**
   * 加载已学习知识
   */
  const loadLearnedKnowledge = () => {
    if (!currentBabyId.value) return
    learnedKnowledgeIds.value = getLearnedKnowledgeIds(currentBabyId.value)
  }
  
  /**
   * 检查知识是否已学习
   */
  const checkLearned = (knowledgeId) => {
    return learnedKnowledgeIds.value.includes(knowledgeId)
  }
  
  /**
   * 学习知识
   */
  const learnKnowledge = (knowledgeId) => {
    if (!currentBabyId.value) {
      errorMessage.value = '请先选择宝宝'
      return null
    }
    
    isLoading.value = true
    errorMessage.value = ''
    
    try {
      const record = markSafetyKnowledgeLearned(currentBabyId.value, knowledgeId)
      
      // 更新本地状态
      if (!learnedKnowledgeIds.value.includes(knowledgeId)) {
        learnedKnowledgeIds.value.push(knowledgeId)
      }
      
      // 刷新统计
      loadSafetyStats()
      
      return record
    } catch (e) {
      errorMessage.value = e.message
      return null
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * 加载Quiz历史
   */
  const loadQuizHistory = () => {
    if (!currentBabyId.value) return
    quizHistory.value = getSafetyQuizHistory(currentBabyId.value)
  }
  
  /**
   * 开始Quiz
   */
  const startQuiz = (category = null, count = 5) => {
    quizQuestions.value = getSafetyQuizQuestions(category, count)
    currentQuestionIndex.value = 0
    quizAnswers.value = []
  }
  
  /**
   * 回答Quiz
   */
  const answerQuestion = (answerIndex) => {
    if (!currentQuestion.value) return null
    
    const correct = answerIndex === currentQuestion.value.correctAnswer
    
    const answer = {
      questionId: currentQuestion.value.id,
      selectedAnswer: answerIndex,
      correctAnswer: currentQuestion.value.correctAnswer,
      correct,
      points: correct ? currentQuestion.value.points : 0
    }
    
    quizAnswers.value.push(answer)
    
    // 移动到下一题
    const hasNext = currentQuestionIndex.value < quizQuestions.value.length - 1
    if (hasNext) {
      currentQuestionIndex.value++
    }
    
    return { correct, hasNext }
  }
  
  /**
   * 完成Quiz
   */
  const finishQuiz = () => {
    if (!currentBabyId.value || quizAnswers.value.length === 0) return null
    
    const correctCount = quizAnswers.value.filter(a => a.correct).length
    const totalPoints = quizAnswers.value.reduce((sum, a) => sum + a.points, 0)
    const score = Math.round((correctCount / quizAnswers.value.length) * 100)
    
    const result = {
      score,
      correctCount,
      totalQuestions: quizAnswers.value.length,
      points: totalPoints,
      category: currentCategory.value
    }
    
    // 保存成绩
    saveSafetyQuizScore(currentBabyId.value, result)
    
    // 刷新历史
    loadQuizHistory()
    
    return result
  }
  
  /**
   * 获取分类信息
   */
  const getCategoryInfo = (category) => {
    return CATEGORY_INFO[category] || null
  }
  
  /**
   * 获取所有分类信息
   */
  const getAllCategoryInfo = () => {
    return Object.values(CATEGORY_INFO)
  }
  
  /**
   * 切换宝宝时重新加载
   */
  const onBabyChange = (babyId) => {
    loadSafetyKnowledge(currentCategory.value)
    loadSafetyStats()
    loadLearnedKnowledge()
    loadQuizHistory()
  }
  
  /**
   * 获取分类图标
   */
  const getCategoryIcon = (category) => {
    return CATEGORY_INFO[category]?.icon || '📚'
  }
  
  /**
   * 获取分类颜色
   */
  const getCategoryColor = (category) => {
    return CATEGORY_INFO[category]?.color || '#999999'
  }
  
  // ==================== 暴露 ====================
  
  return {
    // 状态
    currentCategory,
    safetyKnowledge,
    selectedKnowledge,
    learnedKnowledgeIds,
    safetyStats,
    quizQuestions,
    currentQuestionIndex,
    quizAnswers,
    quizHistory,
    isLoading,
    errorMessage,
    
    // 计算属性
    currentBabyId,
    learnedCount,
    totalCount,
    currentQuestion,
    quizProgress,
    learningProgress,
    categoryProgress,
    learnedToday,
    
    // 方法
    init,
    switchCategory,
    loadSafetyKnowledge,
    selectKnowledge,
    loadSafetyStats,
    loadLearnedKnowledge,
    checkLearned,
    learnKnowledge,
    loadQuizHistory,
    startQuiz,
    answerQuestion,
    finishQuiz,
    getCategoryInfo,
    getAllCategoryInfo,
    onBabyChange,
    getCategoryIcon,
    getCategoryColor
  }
})
