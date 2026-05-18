/**
 * V57 Micro Learning Store
 * 碎片化学习状态管理
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useBabyStore } from './babyStore.js'
import {
  CARD_TYPES,
  DIFFICULTY,
  LESSON_TYPES,
  CHALLENGE_STATUS,
  getDailyCards,
  getCardById,
  markCardAsRead,
  getMicroLessons,
  getLessonById,
  updateLessonProgress,
  getQuickRefList,
  searchQuickRef,
  getFavoriteRefs,
  addFavoriteRef,
  removeFavoriteRef,
  isFavoriteRef,
  getDailyChallenges,
  completeChallenge,
  getUserProgress,
  resetDailyChallenges
} from '@/services/microLearningService.js'

export const useMicroLearningStore = defineStore('microLearning', () => {
  // ==================== 状态 ====================

  // 每日学习卡片
  const dailyCards = ref([])
  const todayCard = ref(null)
  const currentCard = ref(null)

  // 微课堂
  const lessons = ref([])
  const currentLesson = ref(null)

  // 知识速查
  const quickRefList = ref([])
  const favoriteRefs = ref([])
  const searchResults = ref([])
  const selectedCategory = ref('')

  // 每日挑战
  const challenges = ref([])
  const currentChallenge = ref(null)

  // 用户进度
  const userProgress = ref({
    totalPoints: 0,
    streakDays: 0,
    completedLessons: 0,
    totalLessons: 0,
    readCardsCount: 0,
    totalCards: 0
  })

  // 加载状态
  const loading = ref(false)

  // ==================== 计算属性 ====================

  // 可完成的挑战数量
  const availableChallengesCount = computed(() => {
    return challenges.value.filter(c => c.status === CHALLENGE_STATUS.AVAILABLE).length
  })

  // 收藏的速查条目数量
  const favoriteRefsCount = computed(() => {
    return favoriteRefs.value.length
  })

  // 学习进度百分比
  const learningProgress = computed(() => {
    if (userProgress.value.totalLessons === 0) return 0
    return Math.round((userProgress.value.completedLessons / userProgress.value.totalLessons) * 100)
  })

  // ==================== 卡片相关 ====================

  /**
   * 加载每日学习卡片
   */
  async function loadDailyCards() {
    loading.value = true
    try {
      const result = getDailyCards(5)
      dailyCards.value = result.cards
      todayCard.value = result.todayCard
    } catch (e) {
      console.error('Error loading daily cards:', e)
    } finally {
      loading.value = false
    }
  }

  /**
   * 查看卡片详情
   */
  async function viewCard(cardId) {
    const card = getCardById(cardId)
    if (card) {
      currentCard.value = card
      markCardAsRead(cardId)
      // 更新本地状态
      if (userProgress.value.readCardsCount !== undefined) {
        userProgress.value.readCardsCount++
      }
    }
    return card
  }

  // ==================== 微课相关 ====================

  /**
   * 加载微课列表
   */
  async function loadLessons(filters = {}) {
    loading.value = true
    try {
      lessons.value = getMicroLessons(filters)
    } catch (e) {
      console.error('Error loading lessons:', e)
    } finally {
      loading.value = false
    }
  }

  /**
   * 查看微课详情
   */
  async function viewLesson(lessonId) {
    const lesson = getLessonById(lessonId)
    if (lesson) {
      currentLesson.value = lesson
    }
    return lesson
  }

  /**
   * 更新微课进度
   */
  async function setLessonProgress(lessonId, progress) {
    updateLessonProgress(lessonId, progress)
    // 重新加载当前微课
    if (currentLesson.value && currentLesson.value.id === lessonId) {
      currentLesson.value = getLessonById(lessonId)
    }
    // 刷新用户进度
    loadUserProgress()
  }

  // ==================== 知识速查相关 ====================

  /**
   * 加载知识速查列表
   */
  async function loadQuickRef(category = '') {
    loading.value = true
    selectedCategory.value = category
    try {
      quickRefList.value = getQuickRefList(category)
    } catch (e) {
      console.error('Error loading quick ref:', e)
    } finally {
      loading.value = false
    }
  }

  /**
   * 搜索知识速查
   */
  async function searchRef(keyword) {
    if (!keyword || keyword.trim() === '') {
      searchResults.value = []
      return
    }
    searchResults.value = searchQuickRef(keyword)
  }

  /**
   * 加载收藏的速查
   */
  async function loadFavorites() {
    favoriteRefs.value = getFavoriteRefs()
  }

  /**
   * 切换收藏状态
   */
  async function toggleFavorite(refId) {
    if (isFavoriteRef(refId)) {
      removeFavoriteRef(refId)
    } else {
      addFavoriteRef(refId)
    }
    // 刷新收藏列表
    await loadFavorites()
    return isFavoriteRef(refId)
  }

  /**
   * 检查是否已收藏
   */
  function checkIsFavorite(refId) {
    return isFavoriteRef(refId)
  }

  // ==================== 挑战相关 ====================

  /**
   * 加载每日挑战
   */
  async function loadChallenges() {
    loading.value = true
    try {
      // 重置每日挑战
      resetDailyChallenges()
      challenges.value = getDailyChallenges()
    } catch (e) {
      console.error('Error loading challenges:', e)
    } finally {
      loading.value = false
    }
  }

  /**
   * 开始挑战
   */
  async function startChallenge(challengeId) {
    const challenge = challenges.value.find(c => c.id === challengeId)
    if (challenge && challenge.status === CHALLENGE_STATUS.AVAILABLE) {
      currentChallenge.value = challenge
    }
    return challenge
  }

  /**
   * 提交挑战答案
   */
  async function submitChallenge(challengeId, answers) {
    const result = completeChallenge(challengeId, answers)
    if (result.success) {
      // 刷新挑战列表
      await loadChallenges()
      // 刷新用户进度
      await loadUserProgress()
    }
    return result
  }

  // ==================== 用户进度相关 ====================

  /**
   * 加载用户学习进度
   */
  async function loadUserProgress() {
    try {
      userProgress.value = getUserProgress()
    } catch (e) {
      console.error('Error loading user progress:', e)
    }
  }

  return {
    // 状态
    dailyCards,
    todayCard,
    currentCard,
    lessons,
    currentLesson,
    quickRefList,
    favoriteRefs,
    searchResults,
    selectedCategory,
    challenges,
    currentChallenge,
    userProgress,
    loading,
    
    // 计算属性
    availableChallengesCount,
    favoriteRefsCount,
    learningProgress,
    
    // 卡片相关
    loadDailyCards,
    viewCard,
    
    // 微课相关
    loadLessons,
    viewLesson,
    setLessonProgress,
    
    // 知识速查相关
    loadQuickRef,
    searchRef,
    loadFavorites,
    toggleFavorite,
    checkIsFavorite,
    
    // 挑战相关
    loadChallenges,
    startChallenge,
    submitChallenge,
    
    // 用户进度相关
    loadUserProgress
  }
})
