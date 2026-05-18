/**
 * V46 Reading Tracker Store
 * 阅读追踪状态管理
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useBabyStore } from './babyStore.js'
import {
  getBooks,
  filterBooks,
  getRecommendedBooks,
  getBookById,
  addBook,
  updateBook,
  deleteBook,
  getComprehensionQuestions,
  getRandomQuestions,
  getReadingLogs,
  getTodayLog,
  logReading,
  getStreakDays,
  getReadingStats,
  getReadingNotes,
  addReadingNote,
  updateReadingNote,
  deleteReadingNote,
  getReadingTests,
  submitReadingTest,
  getReadingChallenges,
  joinChallenge,
  getChallengeProgress,
  updateChallengeProgress,
  READING_TYPES,
  DIFFICULTY_LEVELS,
  AGE_GROUPS,
  QUESTION_TYPES
} from '@/services/readingService.js'

export const useReadingStore = defineStore('reading', () => {
  // ==================== 状态 ====================

  // 书籍列表
  const books = ref([])

  // 当前选中的书籍
  const currentBook = ref(null)

  // 阅读日志列表
  const readingLogs = ref([])

  // 今日打卡记录
  const todayLog = ref(null)

  // 连续打卡天数
  const streakDays = ref(0)

  // 阅读统计
  const readingStats = ref(null)

  // 阅读笔记列表
  const readingNotes = ref([])

  // 阅读理解测试列表
  const readingTests = ref([])

  // 阅读理解题目
  const comprehensionQuestions = ref([])

  // 当前测试状态
  const currentTest = ref(null)
  const currentQuestionIndex = ref(0)
  const testAnswers = ref([])

  // 阅读挑战列表
  const challenges = ref([])

  // 筛选条件
  const filters = ref({
    type: '',
    difficulty: '',
    ageGroup: '',
    keyword: ''
  })

  // 加载状态
  const isLoading = ref(false)

  // 错误信息
  const errorMessage = ref('')

  // ==================== 计算属性 ====================

  const babyStore = useBabyStore()
  const currentBabyId = computed(() => babyStore.currentBabyId)

  // 筛选后的书籍
  const filteredBooks = computed(() => {
    return filterBooks(filters.value)
  })

  // 推荐书籍
  const recommendedBooks = computed(() => {
    return getRecommendedBooks()
  })

  // 当前阅读理解题目
  const currentQuestion = computed(() => {
    if (comprehensionQuestions.value.length === 0) return null
    return comprehensionQuestions.value[currentQuestionIndex.value] || null
  })

  // 测试进度
  const testProgress = computed(() => {
    if (comprehensionQuestions.value.length === 0) return 0
    return Math.round((currentQuestionIndex.value / comprehensionQuestions.value.length) * 100)
  })

  // 测试正确率
  const testAccuracy = computed(() => {
    if (testAnswers.value.length === 0) return 0
    const correct = testAnswers.value.filter(a => a.correct).length
    return Math.round((correct / testAnswers.value.length) * 100)
  })

  // 是否有今日打卡
  const hasCheckedInToday = computed(() => {
    return todayLog.value !== null
  })

  // 获取挑战类型常量
  const challengeTypes = computed(() => ({
    books: READING_TYPES
  }))

  // ==================== 方法 ====================

  /**
   * 初始化
   */
  const init = () => {
    if (!currentBabyId.value) return
    loadBooks()
    loadReadingLogs(currentBabyId.value)
    loadReadingStats(currentBabyId.value)
    loadChallenges()
  }

  /**
   * 加载书籍列表
   */
  const loadBooks = () => {
    books.value = getBooks()
  }

  /**
   * 设置筛选条件
   */
  const setFilters = (newFilters) => {
    filters.value = { ...filters.value, ...newFilters }
  }

  /**
   * 清除筛选条件
   */
  const clearFilters = () => {
    filters.value = {
      type: '',
      difficulty: '',
      ageGroup: '',
      keyword: ''
    }
  }

  /**
   * 加载书籍详情
   */
  const loadBookDetail = (bookId) => {
    currentBook.value = getBookById(bookId)
    return currentBook.value
  }

  /**
   * 添加书籍
   */
  const addNewBook = (bookData) => {
    const book = addBook(bookData)
    if (book) {
      books.value.unshift(book)
    }
    return book
  }

  /**
   * 编辑书籍
   */
  const editBook = (id, updates) => {
    const book = updateBook(id, updates)
    if (book) {
      const index = books.value.findIndex(b => b.id === id)
      if (index !== -1) {
        books.value[index] = book
      }
    }
    return book
  }

  /**
   * 删除书籍
   */
  const removeBook = (id) => {
    const success = deleteBook(id)
    if (success) {
      books.value = books.value.filter(b => b.id !== id)
    }
    return success
  }

  /**
   * 加载阅读日志
   */
  const loadReadingLogs = (babyId) => {
    readingLogs.value = getReadingLogs(babyId)
    todayLog.value = getTodayLog(babyId)
    streakDays.value = getStreakDays(babyId)
  }

  /**
   * 加载阅读统计
   */
  const loadReadingStats = (babyId, period = 'week') => {
    readingStats.value = getReadingStats(babyId, period)
  }

  /**
   * 记录阅读打卡
   */
  const checkIn = (checkInData) => {
    if (!currentBabyId.value) {
      errorMessage.value = '请先选择宝宝'
      return null
    }

    isLoading.value = true
    errorMessage.value = ''

    try {
      const log = logReading({
        ...checkInData,
        babyId: currentBabyId.value
      })

      if (log) {
        todayLog.value = log
        loadReadingLogs(currentBabyId.value)
        loadReadingStats(currentBabyId.value)
      }

      return log
    } catch (e) {
      errorMessage.value = e.message
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 加载阅读笔记
   */
  const loadReadingNotes = (bookId = null) => {
    if (!currentBabyId.value) return
    readingNotes.value = getReadingNotes(currentBabyId.value, bookId)
  }

  /**
   * 添加阅读笔记
   */
  const addNote = (noteData) => {
    if (!currentBabyId.value) {
      errorMessage.value = '请先选择宝宝'
      return null
    }

    try {
      const note = addReadingNote({
        ...noteData,
        babyId: currentBabyId.value
      })

      if (note) {
        readingNotes.value.unshift(note)
      }

      return note
    } catch (e) {
      errorMessage.value = e.message
      return null
    }
  }

  /**
   * 编辑阅读笔记
   */
  const editNote = (id, updates) => {
    const note = updateReadingNote(id, updates)
    if (note) {
      const index = readingNotes.value.findIndex(n => n.id === id)
      if (index !== -1) {
        readingNotes.value[index] = note
      }
    }
    return note
  }

  /**
   * 删除阅读笔记
   */
  const removeNote = (id) => {
    const success = deleteReadingNote(id)
    if (success) {
      readingNotes.value = readingNotes.value.filter(n => n.id !== id)
    }
    return success
  }

  /**
   * 开始阅读理解测试
   */
  const startComprehensionTest = (bookId, count = 3) => {
    comprehensionQuestions.value = getRandomQuestions(bookId, count)
    currentQuestionIndex.value = 0
    testAnswers.value = []
    currentTest.value = {
      bookId,
      questions: comprehensionQuestions.value,
      startedAt: new Date().toISOString()
    }
    return comprehensionQuestions.value
  }

  /**
   * 回答题目
   */
  const answerQuestion = (selectedAnswer) => {
    if (!currentQuestion.value) return null

    const correct = selectedAnswer === currentQuestion.value.answer

    const answer = {
      questionId: currentQuestion.value.id,
      selected: selectedAnswer,
      correctAnswer: currentQuestion.value.answer,
      correct
    }

    testAnswers.value.push(answer)

    const hasNext = currentQuestionIndex.value < comprehensionQuestions.value.length - 1
    if (hasNext) {
      currentQuestionIndex.value++
    }

    return { correct, hasNext }
  }

  /**
   * 提交测试
   */
  const submitTest = () => {
    if (!currentBabyId.value || !currentTest.value) {
      return null
    }

    const test = submitReadingTest({
      babyId: currentBabyId.value,
      bookId: currentTest.value.bookId,
      bookTitle: currentBook.value?.title || '',
      questions: comprehensionQuestions.value,
      answers: testAnswers.value
    })

    if (test) {
      readingTests.value.unshift(test)
    }

    return test
  }

  /**
   * 重置测试
   */
  const resetTest = () => {
    currentTest.value = null
    currentQuestionIndex.value = 0
    testAnswers.value = []
    comprehensionQuestions.value = []
  }

  /**
   * 加载阅读测试历史
   */
  const loadReadingTests = () => {
    if (!currentBabyId.value) return
    readingTests.value = getReadingTests(currentBabyId.value)
  }

  /**
   * 加载挑战列表
   */
  const loadChallenges = () => {
    challenges.value = getReadingChallenges()
  }

  /**
   * 加入挑战
   */
  const participateInChallenge = (challengeId) => {
    if (!currentBabyId.value) {
      errorMessage.value = '请先选择宝宝'
      return null
    }

    const progress = joinChallenge(challengeId, currentBabyId.value)
    return progress
  }

  /**
   * 获取挑战进度
   */
  const loadChallengeProgress = (challengeId) => {
    if (!currentBabyId.value) return null
    return getChallengeProgress(challengeId, currentBabyId.value)
  }

  /**
   * 更新挑战进度
   */
  const refreshChallengeProgress = (challengeId, value) => {
    if (!currentBabyId.value) return null
    return updateChallengeProgress(challengeId, currentBabyId.value, value)
  }

  /**
   * 宝宝切换时重新加载
   */
  const onBabyChange = (babyId) => {
    loadReadingLogs(babyId)
    loadReadingStats(babyId)
    loadReadingNotes()
    loadReadingTests()
  }

  // ==================== 暴露 ====================

  return {
    // 状态
    books,
    currentBook,
    readingLogs,
    todayLog,
    streakDays,
    readingStats,
    readingNotes,
    readingTests,
    comprehensionQuestions,
    currentTest,
    currentQuestionIndex,
    testAnswers,
    challenges,
    filters,
    isLoading,
    errorMessage,

    // 计算属性
    currentBabyId,
    filteredBooks,
    recommendedBooks,
    currentQuestion,
    testProgress,
    testAccuracy,
    hasCheckedInToday,

    // 方法
    init,
    loadBooks,
    setFilters,
    clearFilters,
    loadBookDetail,
    addNewBook,
    editBook,
    removeBook,
    loadReadingLogs,
    loadReadingStats,
    checkIn,
    loadReadingNotes,
    addNote,
    editNote,
    removeNote,
    startComprehensionTest,
    answerQuestion,
    submitTest,
    resetTest,
    loadReadingTests,
    loadChallenges,
    participateInChallenge,
    loadChallengeProgress,
    refreshChallengeProgress,
    onBabyChange,

    // 常量
    READING_TYPES,
    DIFFICULTY_LEVELS,
    AGE_GROUPS,
    QUESTION_TYPES
  }
})
