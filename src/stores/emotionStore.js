// src/stores/emotionStore.js
// V44 Emotional Intelligence Training Store
// 情绪智力训练状态管理

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useBabyStore } from './babyStore.js'
import {
  createEmotionJournal,
  getEmotionJournals,
  getEmotionStatistics,
  getRecognitionExercises,
  getRandomRecognitionExercises,
  getEmotionVocabulary,
  getAllEmotionVocabulary,
  recordTrainingProgress,
  getTrainingProgress,
  getRelaxationExercises,
  recordRelaxationSession,
  getRelaxationHistory,
  getRelaxationStats,
  getRegulationSuggestions,
  EMOTION_TYPES,
  EMOTION_EMOJIS,
  EMOTION_COLORS,
  TRAINING_TYPES,
  RELAXATION_TYPES,
  EMOTION_CATEGORIES
} from '@/services/emotionTrainingService.js'

export const useEmotionStore = defineStore('emotion', () => {
  // ==================== 状态 ====================
  
  // 情绪日记列表
  const emotionJournals = ref([])
  
  // 情绪统计
  const emotionStats = ref(null)
  
  // 当前选中的情绪
  const selectedEmotion = ref(null)
  
  // 情绪识别练习
  const recognitionExercises = ref([])
  
  // 当前练习索引
  const currentExerciseIndex = ref(0)
  
  // 练习结果
  const exerciseResults = ref([])
  
  // 情绪词汇
  const emotionVocabulary = ref({})
  
  // 放松练习
  const relaxationExercises = ref([])
  
  // 放松练习历史
  const relaxationHistory = ref([])
  
  // 放松练习统计
  const relaxationStats = ref(null)
  
  // 训练进度
  const trainingProgress = ref([])
  
  // 是否正在加载
  const isLoading = ref(false)
  
  // 错误信息
  const errorMessage = ref('')
  
  // 今日情绪
  const todayEmotion = ref(null)
  
  // ==================== 计算属性 ====================
  
  const babyStore = useBabyStore()
  
  // 当前宝宝ID
  const currentBabyId = computed(() => babyStore.currentBabyId)
  
  // 是否有情绪日记
  const hasJournals = computed(() => emotionJournals.value.length > 0)
  
  // 最近的日记
  const recentJournals = computed(() => emotionJournals.value.slice(0, 5))
  
  // 当前练习
  const currentExercise = computed(() => {
    if (recognitionExercises.value.length === 0) return null
    return recognitionExercises.value[currentExerciseIndex.value] || null
  })
  
  // 练习进度
  const exerciseProgress = computed(() => {
    if (recognitionExercises.value.length === 0) return 0
    return Math.round((currentExerciseIndex.value / recognitionExercises.value.length) * 100)
  })
  
  // 练习正确率
  const exerciseAccuracy = computed(() => {
    if (exerciseResults.value.length === 0) return 0
    const correct = exerciseResults.value.filter(r => r.correct).length
    return Math.round((correct / exerciseResults.value.length) * 100)
  })
  
  // 正面情绪比例
  const positiveRatio = computed(() => {
    if (!emotionStats.value) return 0
    return Math.round(emotionStats.value.positiveRatio * 100)
  })
  
  // 负面情绪比例
  const negativeRatio = computed(() => {
    if (!emotionStats.value) return 0
    return Math.round(emotionStats.value.negativeRatio * 100)
  })
  
  // 主要情绪
  const dominantEmotion = computed(() => {
    if (!emotionStats.value || !emotionStats.value.dominantEmotion) return null
    return {
      type: emotionStats.value.dominantEmotion,
      emoji: EMOTION_EMOJIS[emotionStats.value.dominantEmotion],
      color: EMOTION_COLORS[emotionStats.value.dominantEmotion]
    }
  })
  
  // 放松练习完成率
  const relaxationCompletionRate = computed(() => {
    if (!relaxationStats.value || relaxationStats.value.totalSessions === 0) return 0
    return Math.round((relaxationStats.value.completedSessions / relaxationStats.value.totalSessions) * 100)
  })
  
  // ==================== 方法 ====================
  
  /**
   * 初始化
   */
  const init = () => {
    if (!currentBabyId.value) return
    
    loadEmotionJournals(currentBabyId.value)
    loadEmotionStats(currentBabyId.value)
    loadRelaxationExercises()
    loadRelaxationStats(currentBabyId.value)
    loadEmotionVocabulary()
  }
  
  /**
   * 加载情绪日记
   */
  const loadEmotionJournals = (babyId) => {
    emotionJournals.value = getEmotionJournals(babyId, { limit: 50 })
  }
  
  /**
   * 加载情绪统计
   */
  const loadEmotionStats = (babyId) => {
    emotionStats.value = getEmotionStatistics(babyId, 'week')
  }
  
  /**
   * 创建情绪日记
   */
  const addEmotionJournal = (journalData) => {
    if (!currentBabyId.value) {
      errorMessage.value = '请先选择宝宝'
      return null
    }
    
    isLoading.value = true
    errorMessage.value = ''
    
    try {
      const journal = createEmotionJournal({
        ...journalData,
        babyId: currentBabyId.value
      })
      
      // 更新本地状态
      emotionJournals.value.unshift(journal)
      
      // 刷新统计
      loadEmotionStats(currentBabyId.value)
      
      return journal
    } catch (e) {
      errorMessage.value = e.message
      return null
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * 选择情绪
   */
  const selectEmotion = (emotionType) => {
    selectedEmotion.value = emotionType
    
    // 获取该情绪的调节建议
    const suggestions = getRegulationSuggestions(emotionType)
    
    return suggestions
  }
  
  /**
   * 开始情绪识别训练
   */
  const startRecognitionTraining = (difficulty = 1, count = 5) => {
    recognitionExercises.value = getRandomRecognitionExercises(count, difficulty)
    currentExerciseIndex.value = 0
    exerciseResults.value = []
  }
  
  /**
   * 回答练习
   */
  const answerExercise = (selectedEmotion) => {
    if (!currentExercise.value) return null
    
    const correct = selectedEmotion === currentExercise.value.emotion
    
    const result = {
      exerciseId: currentExercise.value.id,
      selectedEmotion,
      correctEmotion: currentExercise.value.emotion,
      correct,
      timestamp: new Date().toISOString()
    }
    
    exerciseResults.value.push(result)
    
    // 移动到下一个
    const hasNext = currentExerciseIndex.value < recognitionExercises.value.length - 1
    if (hasNext) {
      currentExerciseIndex.value++
    }
    
    return { correct, hasNext }
  }
  
  /**
   * 完成练习
   */
  const finishTraining = () => {
    if (!currentBabyId.value || exerciseResults.value.length === 0) return null
    
    const correctCount = exerciseResults.value.filter(r => r.correct).length
    const result = {
      score: exerciseAccuracy.value,
      correctCount,
      totalCount: exerciseResults.value.length,
      duration: 0
    }
    
    // 记录进度
    const progress = recordTrainingProgress(currentBabyId.value, TRAINING_TYPES.RECOGNITION, result)
    trainingProgress.value.unshift(progress)
    
    return result
  }
  
  /**
   * 获取情绪词汇
   */
  const loadEmotionVocabulary = () => {
    emotionVocabulary.value = getAllEmotionVocabulary()
  }
  
  /**
   * 获取特定情绪的词汇
   */
  const getEmotionWords = (emotionType) => {
    return getEmotionVocabulary(emotionType)
  }
  
  /**
   * 加载放松练习
   */
  const loadRelaxationExercises = () => {
    relaxationExercises.value = getRelaxationExercises()
  }
  
  /**
   * 记录放松练习
   */
  const logRelaxationSession = (sessionData) => {
    if (!currentBabyId.value) {
      errorMessage.value = '请先选择宝宝'
      return null
    }
    
    try {
      const session = recordRelaxationSession(currentBabyId.value, {
        ...sessionData,
        babyId: currentBabyId.value
      })
      
      relaxationHistory.value.unshift(session)
      loadRelaxationStats(currentBabyId.value)
      
      return session
    } catch (e) {
      errorMessage.value = e.message
      return null
    }
  }
  
  /**
   * 加载放松统计
   */
  const loadRelaxationStats = (babyId) => {
    relaxationStats.value = getRelaxationStats(babyId)
  }
  
  /**
   * 获取调节建议
   */
  const getSuggestions = (emotionType) => {
    return getRegulationSuggestions(emotionType)
  }
  
  /**
   * 加载训练进度
   */
  const loadTrainingProgress = (trainingType) => {
    if (!currentBabyId.value) return []
    
    trainingProgress.value = getTrainingProgress(currentBabyId.value, trainingType)
    return trainingProgress.value
  }
  
  /**
   * 切换宝宝时重新加载
   */
  const onBabyChange = (babyId) => {
    loadEmotionJournals(babyId)
    loadEmotionStats(babyId)
    loadRelaxationStats(babyId)
  }
  
  /**
   * 获取情绪颜色
   */
  const getEmotionColor = (emotionType) => {
    return EMOTION_COLORS[emotionType] || '#999999'
  }
  
  /**
   * 获取情绪emoji
   */
  const getEmotionEmoji = (emotionType) => {
    return EMOTION_EMOJIS[emotionType] || '❓'
  }
  
  /**
   * 检查是否是正面情绪
   */
  const isPositiveEmotion = (emotionType) => {
    const positiveEmotions = [EMOTION_TYPES.HAPPY, EMOTION_TYPES.CALM, EMOTION_TYPES.GRATEFUL, EMOTION_TYPES.PROUD]
    return positiveEmotions.includes(emotionType)
  }
  
  /**
   * 检查是否是负面情绪
   */
  const isNegativeEmotion = (emotionType) => {
    const negativeEmotions = [EMOTION_TYPES.SAD, EMOTION_TYPES.ANGRY, EMOTION_TYPES.SCARED, EMOTION_TYPES.DISGUSTED, EMOTION_TYPES.ANXIOUS]
    return negativeEmotions.includes(emotionType)
  }
  
  // ==================== 暴露 ====================
  
  return {
    // 状态
    emotionJournals,
    emotionStats,
    selectedEmotion,
    recognitionExercises,
    currentExerciseIndex,
    exerciseResults,
    emotionVocabulary,
    relaxationExercises,
    relaxationHistory,
    relaxationStats,
    trainingProgress,
    isLoading,
    errorMessage,
    todayEmotion,
    
    // 计算属性
    currentBabyId,
    hasJournals,
    recentJournals,
    currentExercise,
    exerciseProgress,
    exerciseAccuracy,
    positiveRatio,
    negativeRatio,
    dominantEmotion,
    relaxationCompletionRate,
    
    // 方法
    init,
    loadEmotionJournals,
    loadEmotionStats,
    addEmotionJournal,
    selectEmotion,
    startRecognitionTraining,
    answerExercise,
    finishTraining,
    loadEmotionVocabulary,
    getEmotionWords,
    loadRelaxationExercises,
    logRelaxationSession,
    loadRelaxationStats,
    getSuggestions,
    loadTrainingProgress,
    onBabyChange,
    getEmotionColor,
    getEmotionEmoji,
    isPositiveEmotion,
    isNegativeEmotion
  }
})
