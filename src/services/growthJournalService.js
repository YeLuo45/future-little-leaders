/**
 * V77 Growth Journal Service
 * 成长日记系统服务层
 * 每日反思、周记月记、成长相册、里程碑记录
 */

// ============================================================================
// Types & Constants
// ============================================================================

// 心情类型
export const MOOD_TYPE = {
  HAPPY: 'happy',           // 开心
  EXCITED: 'excited',       // 兴奋
  CALM: 'calm',             // 平静
  WORRIED: 'worried',       // 担忧
  SAD: 'sad',               // 难过
  ANGRY: 'angry',           // 生气
  GRATEFUL: 'grateful',     // 感恩
  CONFIDENT: 'confident'    // 自信
}

export const MOOD_INFO = {
  [MOOD_TYPE.HAPPY]: { label: '开心', icon: '😊', color: '#52C41A' },
  [MOOD_TYPE.EXCITED]: { label: '兴奋', icon: '🤩', color: '#FA8C16' },
  [MOOD_TYPE.CALM]: { label: '平静', icon: '😌', color: '#1890FF' },
  [MOOD_TYPE.WORRIED]: { label: '担忧', icon: '😟', color: '#FAAD14' },
  [MOOD_TYPE.SAD]: { label: '难过', icon: '😢', color: '#722ED1' },
  [MOOD_TYPE.ANGRY]: { label: '生气', icon: '😠', color: '#F5222D' },
  [MOOD_TYPE.GRATEFUL]: { label: '感恩', icon: '🙏', color: '#EB2F96' },
  [MOOD_TYPE.CONFIDENT]: { label: '自信', icon: '💪', color: '#13C2C2' }
}

// 反思类别
export const REFLECTION_CATEGORY = {
  HARVEST: 'harvest',       // 收获
  SHORTAGE: 'shortage',     // 不足
  IMPROVEMENT: 'improvement', // 改进
  GRATITUDE: 'gratitude',   // 感恩
  GOAL: 'goal'              // 目标
}

export const REFLECTION_CATEGORY_INFO = {
  [REFLECTION_CATEGORY.HARVEST]: { label: '收获', icon: '🌟', color: '#52C41A' },
  [REFLECTION_CATEGORY.SHORTAGE]: { label: '不足', icon: '📝', color: '#FA8C16' },
  [REFLECTION_CATEGORY.IMPROVEMENT]: { label: '改进', icon: '💡', color: '#1890FF' },
  [REFLECTION_CATEGORY.GRATITUDE]: { label: '感恩', icon: '🙏', color: '#EB2F96' },
  [REFLECTION_CATEGORY.GOAL]: { label: '目标', icon: '🎯', color: '#722ED1' }
}

// 周记/月记类型
export const REVIEW_TYPE = {
  WEEKLY: 'weekly',
  MONTHLY: 'monthly'
}

// 里程碑类型
export const MILESTONE_TYPE = {
  ACHIEVEMENT: 'achievement',     // 成就
  BREAKTHROUGH: 'breakthrough',   // 突破
  LEARNING: 'learning',           // 学习
  HABIT: 'habit',                 // 习惯
  SOCIAL: 'social',               // 社交
  CREATIVE: 'creative'            // 创作
}

export const MILESTONE_INFO = {
  [MILESTONE_TYPE.ACHIEVEMENT]: { label: '成就', icon: '🏆', color: '#FA8C16' },
  [MILESTONE_TYPE.BREAKTHROUGH]: { label: '突破', icon: '🚀', color: '#1890FF' },
  [MILESTONE_TYPE.LEARNING]: { label: '学习', icon: '📚', color: '#52C41A' },
  [MILESTONE_TYPE.HABIT]: { label: '习惯', icon: '✨', color: '#722ED1' },
  [MILESTONE_TYPE.SOCIAL]: { label: '社交', icon: '👨‍👩‍👧', color: '#EB2F96' },
  [MILESTONE_TYPE.CREATIVE]: { label: '创作', icon: '🎨', color: '#13C2C2' }
}

// 记录状态
export const JOURNAL_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published'
}

// localStorage keys
const DAILY_REFLECTIONS_KEY = 'growth_journal_daily_reflections'
const WEEKLY_REVIEWS_KEY = 'growth_journal_weekly_reviews'
const MONTHLY_REVIEWS_KEY = 'growth_journal_monthly_reviews'
const MILESTONES_KEY = 'growth_journal_milestones'
const ALBUM_PHOTOS_KEY = 'growth_journal_album_photos'

// ============================================================================
// Helper Functions
// ============================================================================

const generateId = () => {
  return 'gj_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
}

const getLocalData = (key, defaultValue = []) => {
  try {
    const data = uni.getStorageSync(key)
    return data ? JSON.parse(data) : defaultValue
  } catch (e) {
    console.error(`Failed to get ${key}:`, e)
    return defaultValue
  }
}

const setLocalData = (key, data) => {
  try {
    uni.setStorageSync(key, JSON.stringify(data))
  } catch (e) {
    console.error(`Failed to set ${key}:`, e)
  }
}

// ============================================================================
// Service API
// ============================================================================

const growthJournalService = {
  // -------------------- 初始化 --------------------
  init() {
    // 确保存储键存在
    if (!uni.getStorageSync(DAILY_REFLECTIONS_KEY)) {
      uni.setStorageSync(DAILY_REFLECTIONS_KEY, '[]')
    }
    if (!uni.getStorageSync(WEEKLY_REVIEWS_KEY)) {
      uni.setStorageSync(WEEKLY_REVIEWS_KEY, '[]')
    }
    if (!uni.getStorageSync(MONTHLY_REVIEWS_KEY)) {
      uni.setStorageSync(MONTHLY_REVIEWS_KEY, '[]')
    }
    if (!uni.getStorageSync(MILESTONES_KEY)) {
      uni.setStorageSync(MILESTONES_KEY, '[]')
    }
    if (!uni.getStorageSync(ALBUM_PHOTOS_KEY)) {
      uni.setStorageSync(ALBUM_PHOTOS_KEY, '[]')
    }
  },

  // -------------------- 每日反思 --------------------

  // 获取所有每日反思
  getDailyReflections() {
    return getLocalData(DAILY_REFLECTIONS_KEY)
  },

  // 获取指定日期的反思
  getDailyReflectionByDate(date) {
    const reflections = this.getDailyReflections()
    return reflections.find(r => r.date === date)
  },

  // 创建/更新每日反思
  saveDailyReflection(data) {
    const reflections = this.getDailyReflections()
    const now = new Date().toISOString()
    const existingIndex = reflections.findIndex(r => r.date === data.date)

    const reflection = {
      id: existingIndex >= 0 ? reflections[existingIndex].id : generateId(),
      date: data.date,
      mood: data.mood || MOOD_TYPE.CALM,
      content: data.content || '',
      harvests: data.harvests || [],      // 收获
      shortages: data.shortages || [],   // 不足
      improvements: data.improvements || [], // 改进
      gratitudes: data.gratitudes || [], // 感恩
      goals: data.goals || [],            // 目标
      status: data.status || JOURNAL_STATUS.PUBLISHED,
      createdAt: existingIndex >= 0 ? reflections[existingIndex].createdAt : now,
      updatedAt: now
    }

    if (existingIndex >= 0) {
      reflections[existingIndex] = reflection
    } else {
      reflections.unshift(reflection)
    }

    setLocalData(DAILY_REFLECTIONS_KEY, reflections)
    return reflection
  },

  // 获取最近N天的反思
  getRecentReflections(days = 7) {
    const reflections = this.getDailyReflections()
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)
    return reflections.filter(r => new Date(r.date) >= cutoffDate)
  },

  // -------------------- 周记 --------------------

  // 获取所有周记
  getWeeklyReviews() {
    return getLocalData(WEEKLY_REVIEWS_KEY)
  },

  // 获取指定周的周记
  getWeeklyReviewByWeek(year, week) {
    const reviews = this.getWeeklyReviews()
    return reviews.find(r => r.year === year && r.week === week)
  },

  // 创建/更新周记
  saveWeeklyReview(data) {
    const reviews = this.getWeeklyReviews()
    const now = new Date().toISOString()
    const existingIndex = reviews.findIndex(r => r.year === data.year && r.week === data.week)

    const review = {
      id: existingIndex >= 0 ? reviews[existingIndex].id : generateId(),
      year: data.year,
      week: data.week,
      startDate: data.startDate,
      endDate: data.endDate,
      summary: data.summary || '',
      achievements: data.achievements || [],
      challenges: data.challenges || [],
      goals: data.goals || [],
      growthAnalysis: data.growthAnalysis || '',
      status: data.status || JOURNAL_STATUS.PUBLISHED,
      createdAt: existingIndex >= 0 ? reviews[existingIndex].createdAt : now,
      updatedAt: now
    }

    if (existingIndex >= 0) {
      reviews[existingIndex] = review
    } else {
      reviews.unshift(review)
    }

    setLocalData(WEEKLY_REVIEWS_KEY, reviews)
    return review
  },

  // -------------------- 月记 --------------------

  // 获取所有月记
  getMonthlyReviews() {
    return getLocalData(MONTHLY_REVIEWS_KEY)
  },

  // 获取指定月的月记
  getMonthlyReviewByMonth(year, month) {
    const reviews = this.getMonthlyReviews()
    return reviews.find(r => r.year === year && r.month === month)
  },

  // 创建/更新月记
  saveMonthlyReview(data) {
    const reviews = this.getMonthlyReviews()
    const now = new Date().toISOString()
    const existingIndex = reviews.findIndex(r => r.year === data.year && r.month === data.month)

    const review = {
      id: existingIndex >= 0 ? reviews[existingIndex].id : generateId(),
      year: data.year,
      month: data.month,
      summary: data.summary || '',
      achievements: data.achievements || [],
      challenges: data.challenges || [],
      goals: data.goals || [],
      growthAnalysis: data.growthAnalysis || '',
      highlights: data.highlights || [],
      status: data.status || JOURNAL_STATUS.PUBLISHED,
      createdAt: existingIndex >= 0 ? reviews[existingIndex].createdAt : now,
      updatedAt: now
    }

    if (existingIndex >= 0) {
      reviews[existingIndex] = review
    } else {
      reviews.unshift(review)
    }

    setLocalData(MONTHLY_REVIEWS_KEY, reviews)
    return review
  },

  // -------------------- 里程碑 --------------------

  // 获取所有里程碑
  getMilestones() {
    return getLocalData(MILESTONES_KEY)
  },

  // 获取单个里程碑
  getMilestoneById(id) {
    const milestones = this.getMilestones()
    return milestones.find(m => m.id === id)
  },

  // 创建里程碑
  createMilestone(data) {
    const milestones = this.getMilestones()
    const now = new Date().toISOString()

    const milestone = {
      id: generateId(),
      title: data.title,
      description: data.description || '',
      type: data.type || MILESTONE_TYPE.ACHIEVEMENT,
      date: data.date || new Date().toISOString().split('T')[0],
      photos: data.photos || [],
      tags: data.tags || [],
      babyId: data.babyId || null,
      status: JOURNAL_STATUS.PUBLISHED,
      createdAt: now,
      updatedAt: now
    }

    milestones.unshift(milestone)
    setLocalData(MILESTONES_KEY, milestones)
    return milestone
  },

  // 更新里程碑
  updateMilestone(id, data) {
    const milestones = this.getMilestones()
    const index = milestones.findIndex(m => m.id === id)
    if (index < 0) return null

    milestones[index] = {
      ...milestones[index],
      ...data,
      id,
      updatedAt: new Date().toISOString()
    }

    setLocalData(MILESTONES_KEY, milestones)
    return milestones[index]
  },

  // 删除里程碑
  deleteMilestone(id) {
    const milestones = this.getMilestones()
    const filtered = milestones.filter(m => m.id !== id)
    setLocalData(MILESTONES_KEY, filtered)
  },

  // 按类型获取里程碑
  getMilestonesByType(type) {
    const milestones = this.getMilestones()
    return milestones.filter(m => m.type === type)
  },

  // 获取里程碑时间线
  getMilestonesTimeline() {
    const milestones = this.getMilestones()
    return milestones.sort((a, b) => new Date(b.date) - new Date(a.date))
  },

  // -------------------- 成长相册 --------------------

  // 获取所有相册照片
  getAlbumPhotos() {
    return getLocalData(ALBUM_PHOTOS_KEY)
  },

  // 添加相册照片
  addAlbumPhoto(data) {
    const photos = this.getAlbumPhotos()
    const now = new Date().toISOString()

    const photo = {
      id: generateId(),
      url: data.url,
      thumbnail: data.thumbnail || data.url,
      description: data.description || '',
      date: data.date || now.split('T')[0],
      milestoneId: data.milestoneId || null,
      babyId: data.babyId || null,
      tags: data.tags || [],
      createdAt: now
    }

    photos.unshift(photo)
    setLocalData(ALBUM_PHOTOS_KEY, photos)
    return photo
  },

  // 删除相册照片
  deleteAlbumPhoto(id) {
    const photos = this.getAlbumPhotos()
    const filtered = photos.filter(p => p.id !== id)
    setLocalData(ALBUM_PHOTOS_KEY, filtered)
  },

  // 按月份获取照片
  getPhotosByMonth(year, month) {
    const photos = this.getAlbumPhotos()
    return photos.filter(p => {
      const photoDate = new Date(p.date)
      return photoDate.getFullYear() === year && photoDate.getMonth() + 1 === month
    })
  },

  // 获取照片时间线
  getPhotosTimeline() {
    const photos = this.getAlbumPhotos()
    return photos.sort((a, b) => new Date(b.date) - new Date(a.date))
  },

  // -------------------- 统计数据 --------------------

  // 获取统计数据
  getStatistics() {
    const reflections = this.getDailyReflections()
    const weeklyReviews = this.getWeeklyReviews()
    const monthlyReviews = this.getMonthlyReviews()
    const milestones = this.getMilestones()
    const photos = this.getAlbumPhotos()

    // 统计心情分布
    const moodStats = {}
    Object.keys(MOOD_TYPE).forEach(key => {
      moodStats[MOOD_TYPE[key]] = 0
    })
    reflections.forEach(r => {
      if (r.mood && moodStats[r.mood] !== undefined) {
        moodStats[r.mood]++
      }
    })

    // 连续记录天数
    let streakDays = 0
    const sortedReflections = [...reflections].sort((a, b) => new Date(b.date) - new Date(a.date))
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let i = 0; i < sortedReflections.length; i++) {
      const refDate = new Date(sortedReflections[i].date)
      refDate.setHours(0, 0, 0, 0)
      const expectedDate = new Date(today)
      expectedDate.setDate(today.getDate() - i)

      if (refDate.getTime() === expectedDate.getTime()) {
        streakDays++
      } else {
        break
      }
    }

    return {
      reflectionCount: reflections.length,
      weeklyReviewCount: weeklyReviews.length,
      monthlyReviewCount: monthlyReviews.length,
      milestoneCount: milestones.length,
      photoCount: photos.length,
      moodStats,
      streakDays
    }
  },

  // -------------------- 工具函数 --------------------

  // 获取当前周数
  getCurrentWeek() {
    const now = new Date()
    const start = new Date(now.getFullYear(), 0, 1)
    const diff = now - start
    const oneWeek = 604800000
    return Math.ceil(diff / oneWeek)
  },

  // 获取指定日期所在周的周一和周日
  getWeekDateRange(year, week) {
    const simple = new Date(year, 0, 1 + (week - 1) * 7)
    const dow = simple.getDay()
    const ISOweekStart = simple
    if (dow <= 4) {
      ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1)
    } else {
      ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay())
    }
    const ISOweekEnd = new Date(ISOweekStart)
    ISOweekEnd.setDate(ISOweekStart.getDate() + 6)

    return {
      startDate: ISOweekStart.toISOString().split('T')[0],
      endDate: ISOweekEnd.toISOString().split('T')[0]
    }
  }
}

export default growthJournalService
