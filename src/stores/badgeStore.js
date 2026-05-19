import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useBabyStore } from './babyStore'

/**
 * V79 Badge System Store
 * 多维度徽章收集、稀有度等级、徽章展示墙
 */

// 徽章稀有度等级
export const BADGE_RARITY = {
  COMMON: { id: 1, name: '普通', color: '#999999', gradient: 'linear-gradient(135deg, #999, #666)' },
  RARE: { id: 2, name: '稀有', color: '#3b82f6', gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' },
  LEGENDARY: { id: 3, name: '传说', color: '#f59e0b', gradient: 'linear-gradient(135deg, #f59e0b, #d97706)' },
  MYTHIC: { id: 4, name: '神话', color: '#8B5CF6', gradient: 'linear-gradient(135deg, #8B5CF6, #7C3AED)' }
}

// 徽章分类
export const BADGE_CATEGORIES = {
  LEARNING: { id: 'learning', name: '学习', icon: '📚', color: '#3b82f6' },
  SPORTS: { id: 'sports', name: '运动', icon: '🏃', color: '#22c55e' },
  SOCIAL: { id: 'social', name: '社交', icon: '👥', color: '#ec4899' },
  CREATIVE: { id: 'creative', name: '创造', icon: '🎨', color: '#f97316' }
}

// V79 徽章定义 - 按分类组织
const V79_BADGES = [
  // ========== 学习类徽章 ==========
  {
    id: 'badge_learning_1',
    name: '学习起步',
    description: '完成第一个学习任务',
    icon: '📖',
    category: 'learning',
    rarity: 1,
    condition: { type: 'learning_task_complete', count: 1 },
    pointsReward: 10
  },
  {
    id: 'badge_learning_5',
    name: '学习小将',
    description: '累计完成5个学习任务',
    icon: '📗',
    category: 'learning',
    rarity: 1,
    condition: { type: 'learning_task_complete', count: 5 },
    pointsReward: 25
  },
  {
    id: 'badge_learning_20',
    name: '学习达人',
    description: '累计完成20个学习任务',
    icon: '📘',
    category: 'learning',
    rarity: 2,
    condition: { type: 'learning_task_complete', count: 20 },
    pointsReward: 60
  },
  {
    id: 'badge_learning_50',
    name: '学习之星',
    description: '累计完成50个学习任务',
    icon: '🏆',
    category: 'learning',
    rarity: 3,
    condition: { type: 'learning_task_complete', count: 50 },
    pointsReward: 150
  },
  {
    id: 'badge_learning_streak_7',
    name: '学习坚持',
    description: '连续7天完成学习任务',
    icon: '🔥',
    category: 'learning',
    rarity: 2,
    condition: { type: 'learning_streak', count: 7 },
    pointsReward: 50
  },
  {
    id: 'badge_learning_streak_30',
    name: '学习楷模',
    description: '连续30天完成学习任务',
    icon: '💫',
    category: 'learning',
    rarity: 4,
    condition: { type: 'learning_streak', count: 30 },
    pointsReward: 300
  },
  {
    id: 'badge_reading_books',
    name: '小书虫',
    description: '累计阅读10本书籍',
    icon: '📚',
    category: 'learning',
    rarity: 2,
    condition: { type: 'books_read', count: 10 },
    pointsReward: 80
  },
  {
    id: 'badge_math_master',
    name: '数学小能手',
    description: '完成数学练习50次',
    icon: '🔢',
    category: 'learning',
    rarity: 2,
    condition: { type: 'math_exercises', count: 50 },
    pointsReward: 70
  },

  // ========== 运动类徽章 ==========
  {
    id: 'badge_sports_1',
    name: '运动起步',
    description: '完成第一个运动任务',
    icon: '⚽',
    category: 'sports',
    rarity: 1,
    condition: { type: 'sports_task_complete', count: 1 },
    pointsReward: 10
  },
  {
    id: 'badge_sports_5',
    name: '运动小将',
    description: '累计完成5个运动任务',
    icon: '🏀',
    category: 'sports',
    rarity: 1,
    condition: { type: 'sports_task_complete', count: 5 },
    pointsReward: 25
  },
  {
    id: 'badge_sports_20',
    name: '运动健将',
    description: '累计完成20个运动任务',
    icon: '🏅',
    category: 'sports',
    rarity: 2,
    condition: { type: 'sports_task_complete', count: 20 },
    pointsReward: 60
  },
  {
    id: 'badge_sports_50',
    name: '运动之星',
    description: '累计完成50个运动任务',
    icon: '🥇',
    category: 'sports',
    rarity: 3,
    condition: { type: 'sports_task_complete', count: 50 },
    pointsReward: 150
  },
  {
    id: 'badge_sports_streak_7',
    name: '运动坚持',
    description: '连续7天完成运动任务',
    icon: '💪',
    category: 'sports',
    rarity: 2,
    condition: { type: 'sports_streak', count: 7 },
    pointsReward: 50
  },
  {
    id: 'badge_sports_streak_30',
    name: '运动楷模',
    description: '连续30天完成运动任务',
    icon: '🏆',
    category: 'sports',
    rarity: 4,
    condition: { type: 'sports_streak', count: 30 },
    pointsReward: 300
  },
  {
    id: 'badge_early_bird',
    name: '早起鸟儿',
    description: '累计早起30次',
    icon: '🌅',
    category: 'sports',
    rarity: 2,
    condition: { type: 'early_rises', count: 30 },
    pointsReward: 80
  },

  // ========== 社交类徽章 ==========
  {
    id: 'badge_social_1',
    name: '社交起步',
    description: '完成第一个社交任务',
    icon: '👋',
    category: 'social',
    rarity: 1,
    condition: { type: 'social_task_complete', count: 1 },
    pointsReward: 10
  },
  {
    id: 'badge_social_5',
    name: '社交小将',
    description: '累计完成5个社交任务',
    icon: '🤝',
    category: 'social',
    rarity: 1,
    condition: { type: 'social_task_complete', count: 5 },
    pointsReward: 25
  },
  {
    id: 'badge_social_20',
    name: '社交达人',
    description: '累计完成20个社交任务',
    icon: '⭐',
    category: 'social',
    rarity: 2,
    condition: { type: 'social_task_complete', count: 20 },
    pointsReward: 60
  },
  {
    id: 'badge_social_50',
    name: '社交之星',
    description: '累计完成50个社交任务',
    icon: '🌟',
    category: 'social',
    rarity: 3,
    condition: { type: 'social_task_complete', count: 50 },
    pointsReward: 150
  },
  {
    id: 'badge_friend_maker',
    name: '广交朋友',
    description: '结交新朋友10次',
    icon: '👫',
    category: 'social',
    rarity: 2,
    condition: { type: 'new_friends', count: 10 },
    pointsReward: 70
  },
  {
    id: 'badge_helper',
    name: '小帮手',
    description: '帮助他人20次',
    icon: '💝',
    category: 'social',
    rarity: 2,
    condition: { type: 'helped_others', count: 20 },
    pointsReward: 80
  },
  {
    id: 'badge_team_player',
    name: '团队之星',
    description: '参与团队任务10次',
    icon: '👨‍👩‍👧‍👦',
    category: 'social',
    rarity: 3,
    condition: { type: 'team_tasks', count: 10 },
    pointsReward: 120
  },

  // ========== 创造类徽章 ==========
  {
    id: 'badge_creative_1',
    name: '创造起步',
    description: '完成第一个创造任务',
    icon: '🎨',
    category: 'creative',
    rarity: 1,
    condition: { type: 'creative_task_complete', count: 1 },
    pointsReward: 10
  },
  {
    id: 'badge_creative_5',
    name: '创造小将',
    description: '累计完成5个创造任务',
    icon: '🖌️',
    category: 'creative',
    rarity: 1,
    condition: { type: 'creative_task_complete', count: 5 },
    pointsReward: 25
  },
  {
    id: 'badge_creative_20',
    name: '创造达人',
    description: '累计完成20个创造任务',
    icon: '🎭',
    category: 'creative',
    rarity: 2,
    condition: { type: 'creative_task_complete', count: 20 },
    pointsReward: 60
  },
  {
    id: 'badge_creative_50',
    name: '创造之星',
    description: '累计完成50个创造任务',
    icon: '🏆',
    category: 'creative',
    rarity: 3,
    condition: { type: 'creative_task_complete', count: 50 },
    pointsReward: 150
  },
  {
    id: 'badge_artist',
    name: '小艺术家',
    description: '完成绘画作品20幅',
    icon: '🖼️',
    category: 'creative',
    rarity: 2,
    condition: { type: 'artworks_created', count: 20 },
    pointsReward: 80
  },
  {
    id: 'badge_music_talent',
    name: '音乐小才子',
    description: '完成音乐练习30次',
    icon: '🎵',
    category: 'creative',
    rarity: 2,
    condition: { type: 'music_practices', count: 30 },
    pointsReward: 90
  },
  {
    id: 'badge_innovator',
    name: '创新小达人',
    description: '完成创新作品10个',
    icon: '💡',
    category: 'creative',
    rarity: 3,
    condition: { type: 'innovations_created', count: 10 },
    pointsReward: 130
  }
]

export const useBadgeStore = defineStore('badge', () => {
  // ========== 状态 ==========
  const badges = ref([])                        // 徽章定义列表
  const babyBadges = ref({})                   // 宝宝徽章映射 {babyId: [{badgeId, unlockedAt, progress}]}
  const learningTaskCount = ref({})           // 学习任务计数 {babyId: count}
  const learningStreak = ref({})               // 学习连续天数 {babyId: {count, lastDate}}
  const sportsTaskCount = ref({})              // 运动任务计数 {babyId: count}
  const sportsStreak = ref({})                // 运动连续天数 {babyId: {count, lastDate}}
  const socialTaskCount = ref({})              // 社交任务计数 {babyId: count}
  const socialStreak = ref({})                // 社交连续天数 {babyId: {count, lastDate}}
  const creativeTaskCount = ref({})            // 创造任务计数 {babyId: count}
  const creativeStreak = ref({})              // 创造连续天数 {babyId: {count, lastDate}}
  const bookCount = ref({})                   // 阅读书籍数 {babyId: count}
  const mathCount = ref({})                   // 数学练习数 {babyId: count}
  const earlyRiseCount = ref({})              // 早起次数 {babyId: count}
  const friendCount = ref({})                 // 新朋友数 {babyId: count}
  const helpCount = ref({})                  // 帮助他人次数 {babyId: count}
  const teamTaskCount = ref({})               // 团队任务数 {babyId: count}
  const artworkCount = ref({})                // 绘画作品数 {babyId: count}
  const musicCount = ref({})                  // 音乐练习数 {babyId: count}
  const innovationCount = ref({})              // 创新作品数 {babyId: count}

  // 获取宝宝Store
  const babyStore = useBabyStore()

  // ========== 计算属性 ==========
  
  // 当前宝宝的徽章列表
  const currentBabyBadges = computed(() => {
    const babyId = babyStore.currentBabyId
    if (!babyId) return []
    return getBabyBadges(babyId)
  })

  // 当前宝宝已解锁徽章数
  const currentBabyUnlockedCount = computed(() => {
    const babyId = babyStore.currentBabyId
    if (!babyId) return 0
    const babyBadgeList = babyBadges.value[babyId] || []
    return babyBadgeList.filter(b => b.unlocked).length
  })

  // 当前宝宝总徽章数
  const currentBabyTotalCount = computed(() => {
    return badges.value.length
  })

  // 当前宝宝收集率
  const currentBabyCompletionRate = computed(() => {
    if (currentBabyTotalCount.value === 0) return 0
    return Math.round((currentBabyUnlockedCount.value / currentBabyTotalCount.value) * 100)
  })

  // 按分类分组的徽章
  const badgesByCategory = computed(() => {
    const result = {
      learning: [],
      sports: [],
      social: [],
      creative: []
    }
    badges.value.forEach(badge => {
      if (result[badge.category]) {
        result[badge.category].push(badge)
      }
    })
    return result
  })

  // 当前宝宝已解锁的徽章（用于展示墙）
  const currentBabyUnlockedBadges = computed(() => {
    const babyId = babyStore.currentBabyId
    if (!babyId) return []
    const babyBadgeList = babyBadges.value[babyId] || []
    return babyBadgeList.filter(b => b.unlocked)
  })

  // ========== 方法 ==========

  // 初始化徽章Store
  const init = () => {
    loadBadges()
    loadBabyBadges()
  }

  // 加载徽章定义
  const loadBadges = () => {
    badges.value = V79_BADGES
  }

  // 加载宝宝徽章数据
  const loadBabyBadges = () => {
    try {
      const stored = uni.getStorageSync('v79_baby_badges')
      if (stored) {
        babyBadges.value = JSON.parse(stored)
      }
      
      const storedLearningTask = uni.getStorageSync('v79_learning_task_count')
      if (storedLearningTask) {
        learningTaskCount.value = JSON.parse(storedLearningTask)
      }
      
      const storedLearningStreak = uni.getStorageSync('v79_learning_streak')
      if (storedLearningStreak) {
        learningStreak.value = JSON.parse(storedLearningStreak)
      }
      
      const storedSportsTask = uni.getStorageSync('v79_sports_task_count')
      if (storedSportsTask) {
        sportsTaskCount.value = JSON.parse(storedSportsTask)
      }
      
      const storedSportsStreak = uni.getStorageSync('v79_sports_streak')
      if (storedSportsStreak) {
        sportsStreak.value = JSON.parse(storedSportsStreak)
      }
      
      const storedSocialTask = uni.getStorageSync('v79_social_task_count')
      if (storedSocialTask) {
        socialTaskCount.value = JSON.parse(storedSocialTask)
      }
      
      const storedSocialStreak = uni.getStorageSync('v79_social_streak')
      if (storedSocialStreak) {
        socialStreak.value = JSON.parse(storedSocialStreak)
      }
      
      const storedCreativeTask = uni.getStorageSync('v79_creative_task_count')
      if (storedCreativeTask) {
        creativeTaskCount.value = JSON.parse(storedCreativeTask)
      }
      
      const storedCreativeStreak = uni.getStorageSync('v79_creative_streak')
      if (storedCreativeStreak) {
        creativeStreak.value = JSON.parse(storedCreativeStreak)
      }
      
      // 加载其他计数
      const storedBookCount = uni.getStorageSync('v79_book_count')
      if (storedBookCount) bookCount.value = JSON.parse(storedBookCount)
      
      const storedMathCount = uni.getStorageSync('v79_math_count')
      if (storedMathCount) mathCount.value = JSON.parse(storedMathCount)
      
      const storedEarlyRise = uni.getStorageSync('v79_early_rise_count')
      if (storedEarlyRise) earlyRiseCount.value = JSON.parse(storedEarlyRise)
      
      const storedFriendCount = uni.getStorageSync('v79_friend_count')
      if (storedFriendCount) friendCount.value = JSON.parse(storedFriendCount)
      
      const storedHelpCount = uni.getStorageSync('v79_help_count')
      if (storedHelpCount) helpCount.value = JSON.parse(storedHelpCount)
      
      const storedTeamTask = uni.getStorageSync('v79_team_task_count')
      if (storedTeamTask) teamTaskCount.value = JSON.parse(storedTeamTask)
      
      const storedArtwork = uni.getStorageSync('v79_artwork_count')
      if (storedArtwork) artworkCount.value = JSON.parse(storedArtwork)
      
      const storedMusic = uni.getStorageSync('v79_music_count')
      if ( storedMusic) musicCount.value = JSON.parse(storedMusic)
      
      const storedInnovation = uni.getStorageSync('v79_innovation_count')
      if (storedInnovation) innovationCount.value = JSON.parse(storedInnovation)
      
    } catch (e) {
      console.error('加载宝宝徽章数据失败:', e)
    }
  }

  // 保存宝宝徽章数据
  const saveBabyBadges = () => {
    try {
      uni.setStorageSync('v79_baby_badges', JSON.stringify(babyBadges.value))
    } catch (e) {
      console.error('保存宝宝徽章数据失败:', e)
    }
  }

  // 获取宝宝的徽章列表（包含解锁状态和进度）
  const getBabyBadges = (babyId) => {
    if (!babyId) return []
    
    const babyBadgeList = babyBadges.value[babyId] || []
    
    return badges.value.map(badge => {
      // 查找该宝宝是否已解锁此徽章
      const existingBadge = babyBadgeList.find(b => b.badgeId === badge.id)
      
      if (existingBadge) {
        return {
          ...badge,
          unlocked: true,
          unlockedAt: existingBadge.unlockedAt,
          progress: 100
        }
      }
      
      // 计算进度
      const progress = calculateBadgeProgress(babyId, badge)
      
      return {
        ...badge,
        unlocked: false,
        unlockedAt: null,
        progress
      }
    })
  }

  // 计算徽章进度
  const calculateBadgeProgress = (babyId, badge) => {
    const condition = badge.condition
    const current = getProgressValue(babyId, condition.type)
    const target = condition.count
    return Math.min(Math.round((current / target) * 100), 100)
  }

  // 获取进度值
  const getProgressValue = (babyId, type) => {
    switch (type) {
      case 'learning_task_complete':
        return learningTaskCount.value[babyId] || 0
      case 'learning_streak':
        return learningStreak.value[babyId]?.count || 0
      case 'sports_task_complete':
        return sportsTaskCount.value[babyId] || 0
      case 'sports_streak':
        return sportsStreak.value[babyId]?.count || 0
      case 'social_task_complete':
        return socialTaskCount.value[babyId] || 0
      case 'social_streak':
        return socialStreak.value[babyId]?.count || 0
      case 'creative_task_complete':
        return creativeTaskCount.value[babyId] || 0
      case 'creative_streak':
        return creativeStreak.value[babyId]?.count || 0
      case 'books_read':
        return bookCount.value[babyId] || 0
      case 'math_exercises':
        return mathCount.value[babyId] || 0
      case 'early_rises':
        return earlyRiseCount.value[babyId] || 0
      case 'new_friends':
        return friendCount.value[babyId] || 0
      case 'helped_others':
        return helpCount.value[babyId] || 0
      case 'team_tasks':
        return teamTaskCount.value[babyId] || 0
      case 'artworks_created':
        return artworkCount.value[babyId] || 0
      case 'music_practices':
        return musicCount.value[babyId] || 0
      case 'innovations_created':
        return innovationCount.value[babyId] || 0
      default:
        return 0
    }
  }

  // 获取进度文字
  const getProgressText = (babyId, badge) => {
    const condition = badge.condition
    const current = getProgressValue(babyId, condition.type)
    const target = condition.count
    return `${current}/${target}`
  }

  // 检查徽章条件是否满足
  const checkBadgeCondition = (badge, babyId) => {
    const condition = badge.condition
    const current = getProgressValue(babyId, condition.type)
    return current >= condition.count
  }

  // 解锁徽章
  const unlockBadge = (babyId, badgeId) => {
    if (!babyId || !badgeId) return null
    
    // 初始化宝宝的徽章列表
    if (!babyBadges.value[babyId]) {
      babyBadges.value[babyId] = []
    }
    
    // 检查是否已解锁
    const existing = babyBadges.value[babyId].find(b => b.badgeId === badgeId)
    if (existing && existing.unlocked) {
      return null
    }
    
    const badge = badges.value.find(b => b.id === badgeId)
    if (!badge) return null
    
    // 创建解锁记录
    const unlockRecord = {
      badgeId,
      unlocked: true,
      unlockedAt: new Date().toISOString()
    }
    
    // 添加到宝宝徽章列表
    babyBadges.value[babyId].push(unlockRecord)
    saveBabyBadges()
    
    // 广播徽章解锁事件
    uni.$emit('v79BadgeUnlocked', {
      babyId,
      badge: { ...badge, ...unlockRecord }
    })
    
    return badge
  }

  // 检查并解锁徽章
  const checkAndUnlockBadges = (babyId) => {
    if (!babyId) return []
    
    const unlockedList = []
    const babyBadgeList = babyBadges.value[babyId] || []
    
    for (const badge of badges.value) {
      // 跳过已解锁的
      const alreadyUnlocked = babyBadgeList.some(b => b.badgeId === badge.id && b.unlocked)
      if (alreadyUnlocked) continue
      
      // 检查条件
      if (checkBadgeCondition(badge, babyId)) {
        const unlocked = unlockBadge(babyId, badge.id)
        if (unlocked) {
          unlockedList.push(unlocked)
        }
      }
    }
    
    return unlockedList
  }

  // 更新连续天数
  const updateStreak = (babyId, streakType) => {
    const today = new Date().toISOString().split('T')[0]
    let streakData
    
    switch (streakType) {
      case 'learning':
        streakData = learningStreak.value[babyId] || { count: 0, lastDate: null }
        break
      case 'sports':
        streakData = sportsStreak.value[babyId] || { count: 0, lastDate: null }
        break
      case 'social':
        streakData = socialStreak.value[babyId] || { count: 0, lastDate: null }
        break
      case 'creative':
        streakData = creativeStreak.value[babyId] || { count: 0, lastDate: null }
        break
      default:
        return
    }
    
    if (streakData.lastDate === today) {
      return // 今天已经完成过
    }
    
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]
    
    if (streakData.lastDate === yesterdayStr) {
      streakData.count += 1
    } else if (streakData.lastDate !== today) {
      streakData.count = 1
    }
    
    streakData.lastDate = today
    
    switch (streakType) {
      case 'learning':
        learningStreak.value[babyId] = streakData
        uni.setStorageSync('v79_learning_streak', JSON.stringify(learningStreak.value))
        break
      case 'sports':
        sportsStreak.value[babyId] = streakData
        uni.setStorageSync('v79_sports_streak', JSON.stringify(sportsStreak.value))
        break
      case 'social':
        socialStreak.value[babyId] = streakData
        uni.setStorageSync('v79_social_streak', JSON.stringify(socialStreak.value))
        break
      case 'creative':
        creativeStreak.value[babyId] = streakData
        uni.setStorageSync('v79_creative_streak', JSON.stringify(creativeStreak.value))
        break
    }
  }

  // ========== 任务完成回调 ==========

  // 学习任务完成
  const onLearningTaskComplete = (babyId) => {
    if (!babyId) return []
    learningTaskCount.value[babyId] = (learningTaskCount.value[babyId] || 0) + 1
    uni.setStorageSync('v79_learning_task_count', JSON.stringify(learningTaskCount.value))
    updateStreak(babyId, 'learning')
    return checkAndUnlockBadges(babyId)
  }

  // 运动任务完成
  const onSportsTaskComplete = (babyId) => {
    if (!babyId) return []
    sportsTaskCount.value[babyId] = (sportsTaskCount.value[babyId] || 0) + 1
    uni.setStorageSync('v79_sports_task_count', JSON.stringify(sportsTaskCount.value))
    updateStreak(babyId, 'sports')
    return checkAndUnlockBadges(babyId)
  }

  // 社交任务完成
  const onSocialTaskComplete = (babyId) => {
    if (!babyId) return []
    socialTaskCount.value[babyId] = (socialTaskCount.value[babyId] || 0) + 1
    uni.setStorageSync('v79_social_task_count', JSON.stringify(socialTaskCount.value))
    updateStreak(babyId, 'social')
    return checkAndUnlockBadges(babyId)
  }

  // 创造任务完成
  const onCreativeTaskComplete = (babyId) => {
    if (!babyId) return []
    creativeTaskCount.value[babyId] = (creativeTaskCount.value[babyId] || 0) + 1
    uni.setStorageSync('v79_creative_task_count', JSON.stringify(creativeTaskCount.value))
    updateStreak(babyId, 'creative')
    return checkAndUnlockBadges(babyId)
  }

  // 阅读书籍
  const onBookRead = (babyId) => {
    if (!babyId) return []
    bookCount.value[babyId] = (bookCount.value[babyId] || 0) + 1
    uni.setStorageSync('v79_book_count', JSON.stringify(bookCount.value))
    return checkAndUnlockBadges(babyId)
  }

  // 数学练习
  const onMathExercise = (babyId) => {
    if (!babyId) return []
    mathCount.value[babyId] = (mathCount.value[babyId] || 0) + 1
    uni.setStorageSync('v79_math_count', JSON.stringify(mathCount.value))
    return checkAndUnlockBadges(babyId)
  }

  // 早起
  const onEarlyRise = (babyId) => {
    if (!babyId) return []
    earlyRiseCount.value[babyId] = (earlyRiseCount.value[babyId] || 0) + 1
    uni.setStorageSync('v79_early_rise_count', JSON.stringify(earlyRiseCount.value))
    return checkAndUnlockBadges(babyId)
  }

  // 结交新朋友
  const onNewFriend = (babyId) => {
    if (!babyId) return []
    friendCount.value[babyId] = (friendCount.value[babyId] || 0) + 1
    uni.setStorageSync('v79_friend_count', JSON.stringify(friendCount.value))
    return checkAndUnlockBadges(babyId)
  }

  // 帮助他人
  const onHelpOthers = (babyId) => {
    if (!babyId) return []
    helpCount.value[babyId] = (helpCount.value[babyId] || 0) + 1
    uni.setStorageSync('v79_help_count', JSON.stringify(helpCount.value))
    return checkAndUnlockBadges(babyId)
  }

  // 参与团队任务
  const onTeamTask = (babyId) => {
    if (!babyId) return []
    teamTaskCount.value[babyId] = (teamTaskCount.value[babyId] || 0) + 1
    uni.setStorageSync('v79_team_task_count', JSON.stringify(teamTaskCount.value))
    return checkAndUnlockBadges(babyId)
  }

  // 完成绘画作品
  const onArtworkCreated = (babyId) => {
    if (!babyId) return []
    artworkCount.value[babyId] = (artworkCount.value[babyId] || 0) + 1
    uni.setStorageSync('v79_artwork_count', JSON.stringify(artworkCount.value))
    return checkAndUnlockBadges(babyId)
  }

  // 音乐练习
  const onMusicPractice = (babyId) => {
    if (!babyId) return []
    musicCount.value[babyId] = (musicCount.value[babyId] || 0) + 1
    uni.setStorageSync('v79_music_count', JSON.stringify(musicCount.value))
    return checkAndUnlockBadges(babyId)
  }

  // 完成创新作品
  const onInnovationCreated = (babyId) => {
    if (!babyId) return []
    innovationCount.value[babyId] = (innovationCount.value[babyId] || 0) + 1
    uni.setStorageSync('v79_innovation_count', JSON.stringify(innovationCount.value))
    return checkAndUnlockBadges(babyId)
  }

  // 获取稀有度信息
  const getRarityInfo = (rarity) => {
    return BADGE_RARITY[Object.keys(BADGE_RARITY).find(key => BADGE_RARITY[key].id === rarity)] || BADGE_RARITY.COMMON
  }

  // 获取分类信息
  const getCategoryInfo = (categoryId) => {
    return BADGE_CATEGORIES[Object.keys(BADGE_CATEGORIES).find(key => BADGE_CATEGORIES[key].id === categoryId)] || BADGE_CATEGORIES.LEARNING
  }

  // 获取展示墙数据
  const getShowcaseBadges = (babyId) => {
    if (!babyId) return []
    const babyBadgeList = babyBadges.value[babyId] || []
    return babyBadgeList.filter(b => b.unlocked).map(record => {
      const badge = badges.value.find(b => b.id === record.badgeId)
      if (badge) {
        return {
          ...badge,
          ...record,
          rarityInfo: getRarityInfo(badge.rarity)
        }
      }
      return null
    }).filter(b => b !== null)
  }

  // 生成分享数据
  const generateShareData = (babyId) => {
    const unlockedBadges = getShowcaseBadges(babyId)
    const babyName = babyStore.currentBabyName || '小宝宝'
    
    return {
      title: `${babyName}的徽章收藏`,
      description: `已收集 ${unlockedBadges.length} / ${badges.value.length} 枚徽章`,
      badges: unlockedBadges.slice(0, 6), // 最多分享6个
      totalCount: badges.value.length,
      unlockedCount: unlockedBadges.length,
      completionRate: currentBabyCompletionRate.value
    }
  }

  return {
    // 状态
    badges,
    babyBadges,
    
    // 计算属性
    currentBabyBadges,
    currentBabyUnlockedCount,
    currentBabyTotalCount,
    currentBabyCompletionRate,
    badgesByCategory,
    currentBabyUnlockedBadges,
    
    // 方法
    init,
    loadBadges,
    loadBabyBadges,
    getBabyBadges,
    getProgressText,
    checkBadgeCondition,
    unlockBadge,
    checkAndUnlockBadges,
    onLearningTaskComplete,
    onSportsTaskComplete,
    onSocialTaskComplete,
    onCreativeTaskComplete,
    onBookRead,
    onMathExercise,
    onEarlyRise,
    onNewFriend,
    onHelpOthers,
    onTeamTask,
    onArtworkCreated,
    onMusicPractice,
    onInnovationCreated,
    getRarityInfo,
    getCategoryInfo,
    getShowcaseBadges,
    generateShareData,
    BADGE_RARITY,
    BADGE_CATEGORIES
  }
})
