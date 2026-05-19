/**
 * V70 Language Store
 * 语言学习状态管理
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import languageService from '@/services/languageService.js'

export const useLanguageStore = defineStore('language', () => {
  // ==================== 状态 ====================
  
  // 支持的语言列表
  const supportedLanguages = ref([])
  
  // 当前选中的语言
  const currentLanguage = ref(null)
  
  // 用户学习的语言
  const activeLanguages = ref([])
  
  // 语言学习进度
  const languageProgress = ref({})
  
  // 词汇数据
  const vocabulary = ref([])
  const vocabularyCategories = ref([])
  
  // 口语对话数据
  const speakingDialogues = ref([])
  
  // 用户统计
  const userStats = ref(null)
  
  // 加载状态
  const isLoading = ref(false)
  
  // ==================== 初始化 ====================
  
  const init = () => {
    loadSupportedLanguages()
    loadUserStats()
  }
  
  const loadSupportedLanguages = () => {
    supportedLanguages.value = languageService.getSupportedLanguages()
  }
  
  const loadUserStats = () => {
    userStats.value = languageService.getUserStats()
    activeLanguages.value = userStats.value.activeLanguages
    languageProgress.value = userStats.value.languageStats
    
    // 设置默认语言
    if (!currentLanguage.value && activeLanguages.value.length > 0) {
      currentLanguage.value = activeLanguages.value[0]
    }
  }
  
  // ==================== 计算属性 ====================
  
  // 总积分
  const totalPoints = computed(() => userStats.value?.totalPoints || 0)
  
  // 连续学习天数
  const streakDays = computed(() => userStats.value?.streakDays || 0)
  
  // 当前语言信息
  const currentLanguageInfo = computed(() => {
    if (!currentLanguage.value) return null
    return languageService.getLanguageInfo(currentLanguage.value)
  })
  
  // 当前语言的课程章节
  const currentChapters = computed(() => {
    if (!currentLanguage.value) return []
    return languageService.getCourseChapters(currentLanguage.value)
  })
  
  // 当前语言的词汇
  const currentVocabulary = computed(() => {
    if (!currentLanguage.value) return []
    return languageService.getVocabulary(currentLanguage.value)
  })
  
  // 当前语言的词汇学习进度
  const currentVocabularyProgress = computed(() => {
    if (!currentLanguage.value) return { total: 0, learned: 0, percentage: 0 }
    return languageService.getVocabularyProgress(currentLanguage.value)
  })
  
  // 当前语言的口语进度
  const currentSpeakingProgress = computed(() => {
    if (!currentLanguage.value) return { total: 0, completed: 0, percentage: 0 }
    return languageService.getSpeakingProgress(currentLanguage.value)
  })
  
  // 当前语言的口语对话
  const currentSpeakingDialogues = computed(() => {
    if (!currentLanguage.value) return []
    return languageService.getSpeakingDialogues(currentLanguage.value)
  })
  
  // ==================== 操作方法 ====================
  
  // 选择语言
  const selectLanguage = (langId) => {
    currentLanguage.value = langId
    // 加载该语言的数据
    vocabulary.value = languageService.getVocabulary(langId)
    vocabularyCategories.value = languageService.getVocabularyCategories(langId)
    speakingDialogues.value = languageService.getSpeakingDialogues(langId)
  }
  
  // 添加学习语言
  const addLanguage = (langId) => {
    languageService.addActiveLanguage(langId)
    loadUserStats()
  }
  
  // 完成课程学习
  const completeLesson = (chapterId, lessonIndex) => {
    if (!currentLanguage.value) return
    const result = languageService.completeLesson(currentLanguage.value, chapterId, lessonIndex)
    loadUserStats()
    languageService.updateStreak()
    return result
  }
  
  // 获取课程内容
  const getLessons = (chapterId) => {
    if (!currentLanguage.value) return []
    return languageService.getCourseLessons(currentLanguage.value, chapterId)
  }
  
  // 学习词汇
  const learnVocabulary = (wordIndex) => {
    if (!currentLanguage.value) return
    const result = languageService.learnVocabulary(currentLanguage.value, wordIndex)
    loadUserStats()
    languageService.updateStreak()
    return result
  }
  
  // 获取分类词汇
  const getVocabularyByCategory = (category) => {
    if (!currentLanguage.value) return []
    return languageService.getVocabularyByCategory(currentLanguage.value, category)
  }
  
  // 完成口语练习
  const completeSpeakingPractice = (dialogueId, score) => {
    if (!currentLanguage.value) return
    const result = languageService.completeSpeakingPractice(currentLanguage.value, dialogueId, score)
    loadUserStats()
    languageService.updateStreak()
    return result
  }
  
  // 获取特定语言的进度
  const getLanguageProgress = (langId) => {
    return languageProgress.value[langId] || null
  }
  
  // 获取特定语言的词汇进度
  const getVocabularyProgressByLang = (langId) => {
    return languageService.getVocabularyProgress(langId)
  }
  
  // 获取特定语言的口语进度
  const getSpeakingProgressByLang = (langId) => {
    return languageService.getSpeakingProgress(langId)
  }
  
  return {
    // 状态
    supportedLanguages,
    currentLanguage,
    activeLanguages,
    languageProgress,
    vocabulary,
    vocabularyCategories,
    speakingDialogues,
    userStats,
    isLoading,
    
    // 计算属性
    totalPoints,
    streakDays,
    currentLanguageInfo,
    currentChapters,
    currentVocabulary,
    currentVocabularyProgress,
    currentSpeakingProgress,
    currentSpeakingDialogues,
    
    // 方法
    init,
    selectLanguage,
    addLanguage,
    completeLesson,
    getLessons,
    learnVocabulary,
    getVocabularyByCategory,
    completeSpeakingPractice,
    getLanguageProgress,
    getVocabularyProgressByLang,
    getSpeakingProgressByLang
  }
})
