/**
 * V77 Growth Journal Store
 * 成长日记系统状态管理
 * 每日反思、周记月记、成长相册、里程碑记录
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import growthJournalService from '@/services/growthJournalService.js'
import { useBabyStore } from './babyStore.js'

export const useGrowthJournalStore = defineStore('growthJournal', () => {
  // ==================== 状态 ====================

  // 每日反思列表
  const dailyReflections = ref([])

  // 周记列表
  const weeklyReviews = ref([])

  // 月记列表
  const monthlyReviews = ref([])

  // 里程碑列表
  const milestones = ref([])

  // 成长相册照片
  const albumPhotos = ref([])

  // 当前选中的记录
  const currentReflection = ref(null)
  const currentWeeklyReview = ref(null)
  const currentMonthlyReview = ref(null)
  const currentMilestone = ref(null)

  // 统计数据
  const statistics = ref({
    reflectionCount: 0,
    weeklyReviewCount: 0,
    monthlyReviewCount: 0,
    milestoneCount: 0,
    photoCount: 0,
    moodStats: {},
    streakDays: 0
  })

  // Store 引用
  let babyStore = null

  // ==================== 初始化 ====================

  const init = () => {
    growthJournalService.init()
    loadDailyReflections()
    loadWeeklyReviews()
    loadMonthlyReviews()
    loadMilestones()
    loadAlbumPhotos()
    loadStatistics()
  }

  // ==================== 计算属性 ====================

  // 按日期排序的反思（最新在前）
  const sortedReflections = computed(() => {
    return [...dailyReflections.value].sort((a, b) => new Date(b.date) - new Date(a.date))
  })

  // 里程碑时间线
  const milestonesTimeline = computed(() => {
    return [...milestones.value].sort((a, b) => new Date(b.date) - new Date(a.date))
  })

  // 相册时间线
  const photosTimeline = computed(() => {
    return [...albumPhotos.value].sort((a, b) => new Date(b.date) - new Date(a.date))
  })

  // 按月份分组的里程碑
  const milestonesByMonth = computed(() => {
    const grouped = {}
    milestonesTimeline.value.forEach(m => {
      const key = m.date.substring(0, 7) // YYYY-MM
      if (!grouped[key]) {
        grouped[key] = []
      }
      grouped[key].push(m)
    })
    return grouped
  })

  // 按月份分组的照片
  const photosByMonth = computed(() => {
    const grouped = {}
    photosTimeline.value.forEach(p => {
      const key = p.date.substring(0, 7) // YYYY-MM
      if (!grouped[key]) {
        grouped[key] = []
      }
      grouped[key].push(p)
    })
    return grouped
  })

  // ==================== 每日反思 Actions ====================

  const loadDailyReflections = () => {
    dailyReflections.value = growthJournalService.getDailyReflections()
  }

  const getReflectionByDate = (date) => {
    return growthJournalService.getDailyReflectionByDate(date)
  }

  const saveDailyReflection = (data) => {
    const reflection = growthJournalService.saveDailyReflection(data)
    loadDailyReflections()
    loadStatistics()
    return reflection
  }

  const getRecentReflections = (days = 7) => {
    return growthJournalService.getRecentReflections(days)
  }

  // ==================== 周记 Actions ====================

  const loadWeeklyReviews = () => {
    weeklyReviews.value = growthJournalService.getWeeklyReviews()
  }

  const getWeeklyReview = (year, week) => {
    return growthJournalService.getWeeklyReviewByWeek(year, week)
  }

  const saveWeeklyReview = (data) => {
    const review = growthJournalService.saveWeeklyReview(data)
    loadWeeklyReviews()
    loadStatistics()
    return review
  }

  // ==================== 月记 Actions ====================

  const loadMonthlyReviews = () => {
    monthlyReviews.value = growthJournalService.getMonthlyReviews()
  }

  const getMonthlyReview = (year, month) => {
    return growthJournalService.getMonthlyReviewByMonth(year, month)
  }

  const saveMonthlyReview = (data) => {
    const review = growthJournalService.saveMonthlyReview(data)
    loadMonthlyReviews()
    loadStatistics()
    return review
  }

  // ==================== 里程碑 Actions ====================

  const loadMilestones = () => {
    milestones.value = growthJournalService.getMilestones()
  }

  const getMilestoneById = (id) => {
    return growthJournalService.getMilestoneById(id)
  }

  const createMilestone = (data) => {
    const milestone = growthJournalService.createMilestone(data)
    loadMilestones()
    loadStatistics()
    return milestone
  }

  const updateMilestone = (id, data) => {
    const milestone = growthJournalService.updateMilestone(id, data)
    loadMilestones()
    return milestone
  }

  const deleteMilestone = (id) => {
    growthJournalService.deleteMilestone(id)
    loadMilestones()
    loadStatistics()
  }

  const getMilestonesByType = (type) => {
    return growthJournalService.getMilestonesByType(type)
  }

  // ==================== 成长相册 Actions ====================

  const loadAlbumPhotos = () => {
    albumPhotos.value = growthJournalService.getAlbumPhotos()
  }

  const addAlbumPhoto = (data) => {
    const photo = growthJournalService.addAlbumPhoto(data)
    loadAlbumPhotos()
    loadStatistics()
    return photo
  }

  const deleteAlbumPhoto = (id) => {
    growthJournalService.deleteAlbumPhoto(id)
    loadAlbumPhotos()
    loadStatistics()
  }

  const getPhotosByMonth = (year, month) => {
    return growthJournalService.getPhotosByMonth(year, month)
  }

  // ==================== 统计 Actions ====================

  const loadStatistics = () => {
    statistics.value = growthJournalService.getStatistics()
  }

  // ==================== 工具函数 ====================

  const getCurrentWeek = () => {
    return growthJournalService.getCurrentWeek()
  }

  const getWeekDateRange = (year, week) => {
    return growthJournalService.getWeekDateRange(year, week)
  }

  return {
    // 状态
    dailyReflections,
    weeklyReviews,
    monthlyReviews,
    milestones,
    albumPhotos,
    currentReflection,
    currentWeeklyReview,
    currentMonthlyReview,
    currentMilestone,
    statistics,

    // 计算属性
    sortedReflections,
    milestonesTimeline,
    photosTimeline,
    milestonesByMonth,
    photosByMonth,

    // 初始化
    init,

    // 每日反思
    loadDailyReflections,
    getReflectionByDate,
    saveDailyReflection,
    getRecentReflections,

    // 周记
    loadWeeklyReviews,
    getWeeklyReview,
    saveWeeklyReview,

    // 月记
    loadMonthlyReviews,
    getMonthlyReview,
    saveMonthlyReview,

    // 里程碑
    loadMilestones,
    getMilestoneById,
    createMilestone,
    updateMilestone,
    deleteMilestone,
    getMilestonesByType,

    // 成长相册
    loadAlbumPhotos,
    addAlbumPhoto,
    deleteAlbumPhoto,
    getPhotosByMonth,

    // 统计
    loadStatistics,

    // 工具
    getCurrentWeek,
    getWeekDateRange
  }
})
