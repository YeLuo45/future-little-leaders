import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useBabyStore } from './babyStore'

/**
 * 成就系统管理Store
 * 管理成就定义、宝宝成就进度、成就解锁等
 */

// 成就定义 - M1阶段基础成就
const ACHIEVEMENTS = [
  // 任务相关成就
  {
    id: 'first_task',
    name: '初次任务',
    description: '完成第一个任务',
    icon: '🌟',
    category: 'task',
    condition: { type: 'task_complete', count: 1 },
    pointsAwarded: 10,
    rare: 1
  },
  {
    id: 'task_5',
    name: '小试牛刀',
    description: '累计完成5个任务',
    icon: '⭐',
    category: 'task',
    condition: { type: 'task_complete', count: 5 },
    pointsAwarded: 20,
    rare: 1
  },
  {
    id: 'task_20',
    name: '任务达人',
    description: '累计完成20个任务',
    icon: '🌈',
    category: 'task',
    condition: { type: 'task_complete', count: 20 },
    pointsAwarded: 50,
    rare: 2
  },
  {
    id: 'task_50',
    name: '任务之星',
    description: '累计完成50个任务',
    icon: '💫',
    category: 'task',
    condition: { type: 'task_complete', count: 50 },
    pointsAwarded: 100,
    rare: 3
  },
  // 连续任务成就
  {
    id: 'streak_3',
    name: '三连任务',
    description: '连续3天完成任务',
    icon: '🔥',
    category: 'streak',
    condition: { type: 'task_streak', count: 3 },
    pointsAwarded: 15,
    rare: 1
  },
  {
    id: 'streak_7',
    name: '一周坚持',
    description: '连续7天完成任务',
    icon: '🌟',
    category: 'streak',
    condition: { type: 'task_streak', count: 7 },
    pointsAwarded: 35,
    rare: 2
  },
  {
    id: 'streak_30',
    name: '月度坚持',
    description: '连续30天完成任务',
    icon: '🏆',
    category: 'streak',
    condition: { type: 'task_streak', count: 30 },
    pointsAwarded: 150,
    rare: 3
  },
  // 积分相关成就
  {
    id: 'points_100',
    name: '初具规模',
    description: '累计获得100积分',
    icon: '💰',
    category: 'points',
    condition: { type: 'points_earned', count: 100 },
    pointsAwarded: 5,
    rare: 1
  },
  {
    id: 'points_500',
    name: '储蓄小能人',
    description: '累计获得500积分',
    icon: '💎',
    category: 'points',
    condition: { type: 'points_earned', count: 500 },
    pointsAwarded: 10,
    rare: 2
  },
  {
    id: 'points_1000',
    name: '积分富翁',
    description: '累计获得1000积分',
    icon: '👑',
    category: 'points',
    condition: { type: 'points_earned', count: 1000 },
    pointsAwarded: 25,
    rare: 3
  },
  // 宝宝相关成就
  {
    id: 'add_baby',
    name: '迎接新成员',
    description: '添加第一个宝宝',
    icon: '👶',
    category: 'baby',
    condition: { type: 'baby_added', count: 1 },
    pointsAwarded: 10,
    rare: 1
  },
  {
    id: 'add_baby_2',
    name: '双倍快乐',
    description: '添加第二个宝宝',
    icon: '👫',
    category: 'baby',
    condition: { type: 'baby_added', count: 2 },
    pointsAwarded: 20,
    rare: 2
  },
  // 商城相关成就
  {
    id: 'first_exchange',
    name: '初次兑换',
    description: '完成第一次商品兑换',
    icon: '🎁',
    category: 'shop',
    condition: { type: 'exchange_complete', count: 1 },
    pointsAwarded: 10,
    rare: 1
  },
  {
    id: 'exchange_5',
    name: '兑换达人',
    description: '累计兑换5件商品',
    icon: '🛍️',
    category: 'shop',
    condition: { type: 'exchange_complete', count: 5 },
    pointsAwarded: 25,
    rare: 2
  }
]

export const useAchievementStore = defineStore('achievement', () => {
  // 状态
  const achievements = ref([])      // 成就定义列表
  const babyAchievements = ref({})  // 宝宝成就映射 {babyId: [{achievementId, unlockedAt, ...}]}
  const taskCountByBaby = ref({})   // 宝宝完成任务计数 {babyId: count}
  const streakByBaby = ref({})      // 宝宝连续完成天数 {babyId: {count, lastDate}}
  const totalPointsByBaby = ref({}) // 宝宝累计获得积分 {babyId: totalPoints}
  const exchangeCountByBaby = ref({}) // 宝宝兑换次数 {babyId: count}
  const babyCount = ref(0)          // 宝宝数量
  
  // 获取宝宝Store
  const babyStore = useBabyStore()
  
  // 计算属性
  // 当前宝宝的成就列表
  const currentBabyAchievements = computed(() => {
    const babyId = babyStore.currentBabyId
    if (!babyId) return []
    return getBabyAchievements(babyId)
  })
  
  // 当前宝宝已解锁成就数
  const currentBabyUnlockedCount = computed(() => {
    const babyId = babyStore.currentBabyId
    if (!babyId) return 0
    const babyAchs = babyAchievements.value[babyId] || []
    return babyAchs.filter(a => a.unlocked).length
  })
  
  // 当前宝宝总成就数
  const currentBabyTotalCount = computed(() => {
    return achievements.value.length
  })
  
  // 当前宝宝最近解锁的成就（最多显示3个）
  const currentBabyRecentAchievements = computed(() => {
    const babyId = babyStore.currentBabyId
    if (!babyId) return []
    const babyAchs = babyAchievements.value[babyId] || []
    return babyAchs
      .filter(a => a.unlocked)
      .sort((a, b) => new Date(b.unlockedAt) - new Date(a.unlockedAt))
      .slice(0, 3)
  })
  
  // 获取当前宝宝最近解锁的成就ID列表
  const recentUnlockedIds = computed(() => {
    return currentBabyRecentAchievements.value.map(a => a.id)
  })
  
  // 方法
  // 初始化成就Store
  const init = () => {
    loadAchievements()
    loadBabyAchievements()
    initializeBabyCount()
  }
  
  // 加载成就定义
  const loadAchievements = () => {
    achievements.value = ACHIEVEMENTS
  }
  
  // 加载宝宝成就数据
  const loadBabyAchievements = () => {
    try {
      const stored = uni.getStorageSync('babyAchievements')
      if (stored) {
        babyAchievements.value = JSON.parse(stored)
      }
      
      const storedTaskCount = uni.getStorageSync('taskCountByBaby')
      if (storedTaskCount) {
        taskCountByBaby.value = JSON.parse(storedTaskCount)
      }
      
      const storedStreak = uni.getStorageSync('streakByBaby')
      if (storedStreak) {
        streakByBaby.value = JSON.parse(storedStreak)
      }
      
      const storedTotalPoints = uni.getStorageSync('totalPointsByBaby')
      if (storedTotalPoints) {
        totalPointsByBaby.value = JSON.parse(storedTotalPoints)
      }
      
      const storedExchangeCount = uni.getStorageSync('exchangeCountByBaby')
      if (storedExchangeCount) {
        exchangeCountByBaby.value = JSON.parse(storedExchangeCount)
      }
    } catch (e) {
      console.error('加载宝宝成就数据失败:', e)
    }
  }
  
  // 保存宝宝成就数据
  const saveBabyAchievements = () => {
    try {
      uni.setStorageSync('babyAchievements', JSON.stringify(babyAchievements.value))
    } catch (e) {
      console.error('保存宝宝成就数据失败:', e)
    }
  }
  
  const saveTaskCountByBaby = () => {
    try {
      uni.setStorageSync('taskCountByBaby', JSON.stringify(taskCountByBaby.value))
    } catch (e) {
      console.error('保存任务计数失败:', e)
    }
  }
  
  const saveStreakByBaby = () => {
    try {
      uni.setStorageSync('streakByBaby', JSON.stringify(streakByBaby.value))
    } catch (e) {
      console.error('保存连续天数失败:', e)
    }
  }
  
  const saveTotalPointsByBaby = () => {
    try {
      uni.setStorageSync('totalPointsByBaby', JSON.stringify(totalPointsByBaby.value))
    } catch (e) {
      console.error('保存累计积分失败:', e)
    }
  }
  
  const saveExchangeCountByBaby = () => {
    try {
      uni.setStorageSync('exchangeCountByBaby', JSON.stringify(exchangeCountByBaby.value))
    } catch (e) {
      console.error('保存兑换计数失败:', e)
    }
  }
  
  // 初始化宝宝数量
  const initializeBabyCount = () => {
    babyCount.value = babyStore.babies.length
  }
  
  // 获取宝宝的成就列表（包含解锁状态）
  const getBabyAchievements = (babyId) => {
    if (!babyId) return []
    
    const babyAchs = babyAchievements.value[babyId] || []
    const taskCount = taskCountByBaby.value[babyId] || 0
    const streak = streakByBaby.value[babyId]?.count || 0
    const totalPoints = totalPointsByBaby.value[babyId] || 0
    const exchangeCount = exchangeCountByBaby.value[babyId] || 0
    const currentBabyCount = babyStore.babies.length
    
    return achievements.value.map(achievement => {
      // 查找该宝宝是否已解锁此成就
      const existingAch = babyAchs.find(a => a.id === achievement.id)
      
      if (existingAch) {
        return { ...achievement, ...existingAch, unlocked: true }
      }
      
      // 检查是否满足解锁条件
      const unlocked = checkAchievementCondition(achievement, {
        taskCount,
        streak,
        totalPoints,
        exchangeCount,
        babyCount: currentBabyCount
      })
      
      return {
        ...achievement,
        unlocked,
        unlockedAt: unlocked ? new Date().toISOString() : null
      }
    })
  }
  
  // 检查成就条件是否满足
  const checkAchievementCondition = (achievement, stats) => {
    const { condition } = achievement
    const { taskCount, streak, totalPoints, exchangeCount, babyCount } = stats
    
    switch (condition.type) {
      case 'task_complete':
        return taskCount >= condition.count
      case 'task_streak':
        return streak >= condition.count
      case 'points_earned':
        return totalPoints >= condition.count
      case 'exchange_complete':
        return exchangeCount >= condition.count
      case 'baby_added':
        return babyCount >= condition.count
      default:
        return false
    }
  }
  
  // 解锁成就
  const unlockAchievement = (babyId, achievementId) => {
    if (!babyId || !achievementId) return null
    
    // 初始化宝宝的成就列表
    if (!babyAchievements.value[babyId]) {
      babyAchievements.value[babyId] = []
    }
    
    // 检查是否已解锁
    const existing = babyAchievements.value[babyId].find(a => a.id === achievementId)
    if (existing && existing.unlocked) {
      return null // 已解锁，不再重复解锁
    }
    
    const achievement = achievements.value.find(a => a.id === achievementId)
    if (!achievement) return null
    
    // 创建解锁记录
    const unlockRecord = {
      id: achievementId,
      unlocked: true,
      unlockedAt: new Date().toISOString()
    }
    
    // 添加到宝宝成就列表
    babyAchievements.value[babyId].push(unlockRecord)
    saveBabyAchievements()
    
    // 广播成就解锁事件
    uni.$emit('achievementUnlocked', {
      babyId,
      achievement: { ...achievement, ...unlockRecord }
    })
    
    return achievement
  }
  
  // 检查并解锁成就
  const checkAndUnlockAchievements = (babyId) => {
    if (!babyId) return []
    
    const unlockedList = []
    const babyAchs = babyAchievements.value[babyId] || []
    const taskCount = taskCountByBaby.value[babyId] || 0
    const streak = streakByBaby.value[babyId]?.count || 0
    const totalPoints = totalPointsByBaby.value[babyId] || 0
    const exchangeCount = exchangeCountByBaby.value[babyId] || 0
    const currentBabyCount = babyStore.babies.length
    
    const stats = { taskCount, streak, totalPoints, exchangeCount, babyCount: currentBabyCount }
    
    for (const achievement of achievements.value) {
      // 跳过已解锁的
      const alreadyUnlocked = babyAchs.some(a => a.id === achievement.id && a.unlocked)
      if (alreadyUnlocked) continue
      
      // 检查条件
      if (checkAchievementCondition(achievement, stats)) {
        const unlocked = unlockAchievement(babyId, achievement.id)
        if (unlocked) {
          unlockedList.push(unlocked)
        }
      }
    }
    
    return unlockedList
  }
  
  // 任务完成时调用
  const onTaskComplete = (babyId) => {
    if (!babyId) return []
    
    // 增加任务计数
    taskCountByBaby.value[babyId] = (taskCountByBaby.value[babyId] || 0) + 1
    saveTaskCountByBaby()
    
    // 更新连续天数
    updateStreak(babyId)
    
    // 检查成就
    return checkAndUnlockAchievements(babyId)
  }
  
  // 更新连续完成天数
  const updateStreak = (babyId) => {
    const today = new Date().toISOString().split('T')[0]
    const streakData = streakByBaby.value[babyId] || { count: 0, lastDate: null }
    
    if (streakData.lastDate === today) {
      // 今天已经完成过任务，不增加连续天数
      return
    }
    
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]
    
    if (streakData.lastDate === yesterdayStr) {
      // 昨天完成了任务，连续天数+1
      streakData.count += 1
    } else if (streakData.lastDate !== today) {
      // 中间断开了，重置为1
      streakData.count = 1
    }
    
    streakData.lastDate = today
    streakByBaby.value[babyId] = streakData
    saveStreakByBaby()
  }
  
  // 积分增加时调用
  const onPointsEarned = (babyId, points) => {
    if (!babyId) return []
    
    // 增加累计积分
    totalPointsByBaby.value[babyId] = (totalPointsByBaby.value[babyId] || 0) + points
    saveTotalPointsByBaby()
    
    // 检查成就
    return checkAndUnlockAchievements(babyId)
  }
  
  // 积分扣除时调用（不影响累计获取积分）
  const onPointsDeducted = (babyId, points) => {
    // 积分扣除不影响成就累计
  }
  
  // 宝宝添加时调用
  const onBabyAdded = (babyId) => {
    if (!babyId) return []
    
    // 更新宝宝数量
    babyCount.value = babyStore.babies.length
    
    // 检查成就
    return checkAndUnlockAchievements(babyId)
  }
  
  // 兑换成功时调用
  const onExchangeComplete = (babyId) => {
    if (!babyId) return []
    
    // 增加兑换计数
    exchangeCountByBaby.value[babyId] = (exchangeCountByBaby.value[babyId] || 0) + 1
    saveExchangeCountByBaby()
    
    // 检查成就
    return checkAndUnlockAchievements(babyId)
  }
  
  // 获取成就统计信息
  const getAchievementStats = (babyId) => {
    const babyAchs = babyAchievements.value[babyId] || []
    const unlockedCount = babyAchs.filter(a => a.unlocked).length
    const totalCount = achievements.value.length
    
    // 按类别统计
    const categoryStats = {}
    achievements.value.forEach(achievement => {
      const category = achievement.category
      if (!categoryStats[category]) {
        categoryStats[category] = { total: 0, unlocked: 0 }
      }
      categoryStats[category].total += 1
      const ach = babyAchs.find(a => a.id === achievement.id)
      if (ach && ach.unlocked) {
        categoryStats[category].unlocked += 1
      }
    })
    
    return {
      totalCount,
      unlockedCount,
      lockedCount: totalCount - unlockedCount,
      completionRate: totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0,
      categoryStats
    }
  }
  
  // 获取当前宝宝成就统计
  const currentBabyStats = computed(() => {
    const babyId = babyStore.currentBabyId
    if (!babyId) return null
    return getAchievementStats(babyId)
  })
  
  return {
    // 状态
    achievements,
    babyAchievements,
    taskCountByBaby,
    streakByBaby,
    totalPointsByBaby,
    exchangeCountByBaby,
    babyCount,
    
    // 计算属性
    currentBabyAchievements,
    currentBabyUnlockedCount,
    currentBabyTotalCount,
    currentBabyRecentAchievements,
    recentUnlockedIds,
    currentBabyStats,
    
    // 方法
    init,
    loadAchievements,
    loadBabyAchievements,
    getBabyAchievements,
    checkAndUnlockAchievements,
    unlockAchievement,
    onTaskComplete,
    onPointsEarned,
    onPointsDeducted,
    onBabyAdded,
    onExchangeComplete,
    getAchievementStats
  }
})