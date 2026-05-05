// src/services/growthReportService.js
// 成长报告服务 - 提供报告数据的获取、生成和管理功能

import { useAchievementStore } from '@/stores/achievementStore'
import { usePointsStore } from '@/stores/pointsStore'

// localStorage keys
const GROWTH_REPORT_KEY = 'growth_report_data'
const LAST_REFRESH_KEY = 'growth_report_last_refresh'

// 成长报告数据类型定义
/**
 * @typedef {Object} BabyGrowthData
 * @property {string} babyId - 宝宝ID
 * @property {string} babyName - 宝宝名称
 * @property {number} level - 当前等级
 * @property {number} exp - 当前经验值
 * @property {number} totalTasks - 累计完成任务数
 * @property {number} totalPoints - 累计获得积分
 * @property {number} currentStreak - 当前连续打卡天数
 * @property {number} longestStreak - 最长连续打卡天数
 * @property {Object} weeklyProgress - 每周进度数据
 * @property {Array} tagUsage - 标签使用统计
 */

/**
 * @typedef {Object} GrowthReport
 * @property {string} id - 报告ID
 * @property {string} babyId - 宝宝ID
 * @property {string} generatedAt - 生成时间
 * @property {Object} stats - 统计数据
 * @property {Array} achievements - 成就列表
 * @property {Object} radarData - 雷达图数据
 */

// 获取报告Store实例
const getReportStore = () => {
  try {
    return useReportStore()
  } catch (e) {
    console.error('[GrowthReportService] 获取ReportStore失败:', e)
    return null
  }
}

// 获取成就Store实例
const getAchievementStore = () => {
  try {
    return useAchievementStore()
  } catch (e) {
    console.error('[GrowthReportService] 获取AchievementStore失败:', e)
    return null
  }
}

// 获取积分Store实例
const getPointsStore = () => {
  try {
    return usePointsStore()
  } catch (e) {
    console.error('[GrowthReportService] 获取PointsStore失败:', e)
    return null
  }
}

// 从本地存储获取宝宝列表
const getBabiesFromStorage = () => {
  try {
    const stored = uni.getStorageSync('babies')
    if (stored) {
      return typeof stored === 'string' ? JSON.parse(stored) : stored
    }
  } catch (e) {
    console.error('[GrowthReportService] 获取宝宝列表失败:', e)
  }
  return []
}

// 从本地存储获取任务列表
const getTaskListFromStorage = () => {
  try {
    const stored = uni.getStorageSync('taskList')
    if (stored) {
      return typeof stored === 'string' ? JSON.parse(stored) : stored
    }
  } catch (e) {
    console.error('[GrowthReportService] 获取任务列表失败:', e)
  }
  return []
}

// 获取当前选中的宝宝ID
const getCurrentBabyId = () => {
  try {
    return uni.getStorageSync('currentBabyId') || ''
  } catch (e) {
    return ''
  }
}

// 计算宝宝等级和经验值
const calculateLevelAndExp = (totalExp) => {
  // 等级计算公式：每级需要100 * level点经验
  let level = 1
  let remainingExp = totalExp
  const expNeeded = []
  
  while (remainingExp >= level * 100) {
    remainingExp -= level * 100
    expNeeded.push(level * 100)
    level++
  }
  
  return {
    level,
    currentExp: remainingExp,
    expToNextLevel: level * 100,
    progress: level > 1 ? (remainingExp / (level * 100)) * 100 : (totalExp / 100) * 100
  }
}

// 计算连续打卡天数
const calculateStreakDays = (taskRecords, babyId, endDate) => {
  if (!taskRecords || taskRecords.length === 0) return 0
  
  // 过滤指定宝宝的任务记录
  const babyTasks = babyId 
    ? taskRecords.filter(t => t.babyId === babyId && t.completedAt)
    : taskRecords.filter(t => t.completedAt)
  
  if (babyTasks.length === 0) return 0
  
  // 获取有完成任务的日期列表
  const completedDates = [...new Set(
    babyTasks
      .map(t => new Date(t.completedAt).toISOString().split('T')[0])
  )].sort().reverse()
  
  if (completedDates.length === 0) return 0
  
  let streak = 0
  let currentDate = new Date(endDate || new Date().toISOString().split('T')[0])
  
  for (let i = 0; i < 365; i++) {
    const dateStr = currentDate.toISOString().split('T')[0]
    if (completedDates.includes(dateStr)) {
      streak++
      currentDate.setDate(currentDate.getDate() - 1)
    } else {
      break
    }
  }
  
  return streak
}

// 获取本周开始和结束日期
const getWeekDateRange = (weekStr) => {
  const [year, week] = weekStr.split('-W').map(Number)
  const jan1 = new Date(year, 0, 1)
  const days = (week - 1) * 7
  const startDate = new Date(jan1.getTime() + days * 86400000)
  const endDate = new Date(startDate.getTime() + 6 * 86400000)
  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0]
  }
}

// 生成单个宝宝的成长报告
const generateBabyGrowthReport = (babyId, taskRecords, pointsRecords) => {
  const babies = getBabiesFromStorage()
  const baby = babies.find(b => b.id === babyId)
  
  if (!baby) {
    return null
  }
  
  // 过滤该宝宝的任务记录
  const babyTasks = taskRecords.filter(t => t.babyId === babyId)
  const babyPoints = pointsRecords.filter(p => p.babyId === babyId)
  
  // 统计累计数据
  const totalTasks = babyTasks.filter(t => t.status === 'completed').length
  const totalPoints = babyPoints
    .filter(p => p.type === 'earn')
    .reduce((sum, p) => sum + (p.amount || 0), 0)
  
  // 计算等级和经验
  const levelInfo = calculateLevelAndExp(totalPoints)
  
  // 计算连续打卡天数
  const currentStreak = calculateStreakDays(taskRecords, babyId)
  
  // 计算最长连续打卡
  const longestStreak = calculateLongestStreak(taskRecords, babyId)
  
  // 获取本周数据
  const reportStore = getReportStore()
  const currentWeek = reportStore ? reportStore.getCurrentWeek() : ''
  const weekRange = currentWeek ? getWeekDateRange(currentWeek) : null
  
  // 统计本周完成的任务
  let weeklyTasks = 0
  if (weekRange) {
    weeklyTasks = babyTasks.filter(t => {
      if (!t.completedAt) return false
      const date = new Date(t.completedAt).toISOString().split('T')[0]
      return date >= weekRange.startDate && date <= weekRange.endDate
    }).length
  }
  
  // 统计标签使用
  const tagUsage = {}
  babyTasks.forEach(task => {
    if (task.tags && Array.isArray(task.tags)) {
      task.tags.forEach(tag => {
        tagUsage[tag] = (tagUsage[tag] || 0) + 1
      })
    }
  })
  
  // 按使用次数排序
  const sortedTags = Object.entries(tagUsage)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
  
  return {
    babyId,
    babyName: baby.name,
    avatar: baby.avatar || '',
    level: levelInfo.level,
    exp: levelInfo.currentExp,
    expToNextLevel: levelInfo.expToNextLevel,
    levelProgress: levelInfo.progress,
    totalTasks,
    totalPoints,
    currentStreak,
    longestStreak,
    weeklyTasks,
    weeklyProgress: {
      tasksCompleted: weeklyTasks,
      completionRate: weeklyTasks > 0 ? Math.min(100, (weeklyTasks / 7) * 100) : 0
    },
    topTags: sortedTags
  }
}

// 计算最长连续打卡天数
const calculateLongestStreak = (taskRecords, babyId) => {
  if (!taskRecords || taskRecords.length === 0) return 0
  
  const babyTasks = babyId 
    ? taskRecords.filter(t => t.babyId === babyId && t.completedAt)
    : taskRecords.filter(t => t.completedAt)
  
  const completedDates = [...new Set(
    babyTasks
      .map(t => new Date(t.completedAt).toISOString().split('T')[0])
  )].sort()
  
  if (completedDates.length === 0) return 0
  
  let maxStreak = 1
  let currentStreak = 1
  
  for (let i = 1; i < completedDates.length; i++) {
    const prevDate = new Date(completedDates[i - 1])
    const currDate = new Date(completedDates[i])
    const diffDays = (currDate - prevDate) / 86400000
    
    if (diffDays === 1) {
      currentStreak++
      maxStreak = Math.max(maxStreak, currentStreak)
    } else {
      currentStreak = 1
    }
  }
  
  return maxStreak
}

// 生成雷达图数据
const generateRadarData = (babyData) => {
  return {
    tasks: Math.min(100, babyData.totalTasks / 5), // 最多100
    streak: Math.min(100, babyData.currentStreak), // 最多100天
    level: Math.min(100, babyData.level), // 最多100级
    tags: Math.min(100, babyData.topTags.length * 20), // 最多5个标签100%
    points: Math.min(100, babyData.totalPoints / 100) // 每100积分10%
  }
}

// 获取成长报告
const getGrowthReport = (babyId) => {
  const reportStore = getReportStore()
  const achievementStore = getAchievementStore()
  const pointsStore = getPointsStore()
  
  if (!reportStore) {
    return null
  }
  
  // 初始化Store
  reportStore.init()
  
  // 获取基础数据
  const taskList = getTaskListFromStorage()
  const pointsRecords = pointsStore ? pointsStore.getPointsHistory(babyId) : []
  const currentBabyId = babyId || getCurrentBabyId()
  
  // 生成宝宝成长数据
  const babyGrowthData = generateBabyGrowthReport(currentBabyId, taskList, pointsRecords)
  
  if (!babyGrowthData) {
    return null
  }
  
  // 获取已解锁的成就
  const unlockedAchievements = achievementStore 
    ? achievementStore.unlockedList || []
    : []
  
  // 生成雷达图数据
  const radarData = generateRadarData(babyGrowthData)
  
  // 获取本周和上月对比
  const currentWeek = reportStore.getCurrentWeek()
  const weekDates = reportStore.getWeekDates(currentWeek)
  const currentWeeklyReport = reportStore.getCurrentWeeklyReport()
  
  // 构建完整报告
  const report = {
    id: `${currentBabyId}_${Date.now()}`,
    babyId: currentBabyId,
    generatedAt: new Date().toISOString(),
    baby: babyGrowthData,
    achievements: unlockedAchievements.slice(0, 5), // 只取前5个
    achievementCount: unlockedAchievements.length,
    stats: {
      tasksCompleted: babyGrowthData.totalTasks,
      currentStreak: babyGrowthData.currentStreak,
      longestStreak: babyGrowthData.longestStreak,
      weeklyTasks: babyGrowthData.weeklyTasks,
      totalPoints: babyGrowthData.totalPoints
    },
    radarData,
    weekRange,
    currentWeeklyReport,
    encouragementMessage: generateEncouragement(babyGrowthData)
  }
  
  return report
}

// 生成鼓励文案
const generateEncouragement = (babyData) => {
  const { currentStreak, totalTasks, level } = babyData
  
  if (currentStreak >= 30) {
    return `太厉害了！已经连续打卡${currentStreak}天，你是最棒的！继续保持哦~`
  } else if (currentStreak >= 7) {
    return `不错哦！已经连续打卡${currentStreak}天了，继续加油！`
  } else if (totalTasks >= 100) {
    return `已经完成了${totalTasks}个任务，真是个任务小能手！`
  } else if (totalTasks >= 50) {
    return `完成了${totalTasks}个任务，继续努力！`
  } else if (totalTasks >= 10) {
    return `完成了${totalTasks}个任务，每天进步一点点~`
  } else if (totalTasks > 0) {
    return `完成了${totalTasks}个任务，开始就是进步！`
  } else {
    return '还没有完成任务哦，快去添加任务开始打卡吧！'
  }
}

// 获取历史成长报告列表
const getHistoryReports = (babyId) => {
  const reportStore = getReportStore()
  
  if (!reportStore) {
    return []
  }
  
  reportStore.init()
  
  const currentBabyId = babyId || getCurrentBabyId()
  const historyWeekly = reportStore.getHistoryWeeklyReports()
  
  // 过滤指定宝宝的历史报告
  return historyWeekly.filter(report => {
    return !report.babyId || report.babyId === currentBabyId
  })
}

// 获取宝宝列表（带成长数据）
const getBabiesWithGrowthData = () => {
  const babies = getBabiesFromStorage()
  const taskList = getTaskListFromStorage()
  const pointsStore = getPointsStore()
  
  return babies.map(baby => {
    const pointsRecords = pointsStore ? pointsStore.getPointsHistory(baby.id) : []
    return generateBabyGrowthReport(baby.id, taskList, pointsRecords)
  }).filter(Boolean)
}

// 刷新成长报告数据
const refreshGrowthReport = (babyId) => {
  const currentBabyId = babyId || getCurrentBabyId()
  
  // 保存刷新时间
  uni.setStorageSync(LAST_REFRESH_KEY, Date.now().toString())
  
  return getGrowthReport(currentBabyId)
}

// 获取上次刷新时间
const getLastRefreshTime = () => {
  try {
    const timestamp = uni.getStorageSync(LAST_REFRESH_KEY)
    return timestamp ? parseInt(timestamp) : 0
  } catch (e) {
    return 0
  }
}

// 判断是否需要刷新（超过1小时）
const shouldRefresh = () => {
  const lastRefresh = getLastRefreshTime()
  const oneHour = 60 * 60 * 1000
  return Date.now() - lastRefresh > oneHour
}

export default {
  getGrowthReport,
  getHistoryReports,
  getBabiesWithGrowthData,
  refreshGrowthReport,
  generateBabyGrowthReport,
  calculateLevelAndExp,
  getLastRefreshTime,
  shouldRefresh
}
