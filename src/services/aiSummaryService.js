// src/services/aiSummaryService.js
// V9 AI 成长总结服务 - 调用 LLM API + 模板回退

import { getAISummaryCache, insertAISummaryCache, invalidateAICache } from '@/db/sqlite.js'

// 缓存有效期（毫秒）
const CACHE_TTL = {
  week: 6 * 60 * 60 * 1000,  // 6小时
  month: 24 * 60 * 60 * 1000 // 24小时
}

// 生成鼓励文案（模板回退用）
const generateEncouragement = (babyData) => {
  const currentStreak = babyData.currentStreak || babyData.current_streak || 0
  const totalTasks = babyData.totalTasks || babyData.tasks_completed || 0

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

// 获取 token（模拟实现）
const getToken = () => {
  try {
    return uni.getStorageSync('auth_token') || ''
  } catch (e) {
    return ''
  }
}

/**
 * 聚合成长数据 stats
 * @param {string} babyId - 宝宝ID
 * @param {string} period - 'week' | 'month'
 * @returns {object} stats 数据
 */
export function buildGrowthStats(babyId, period = 'week') {
  const babies = getBabiesFromStorage()
  const baby = babies.find(b => b.id === babyId)
  if (!baby) return null

  const taskList = getTaskListFromStorage()
  const babyTasks = taskList.filter(t => t.babyId === babyId)
  const completedTasks = babyTasks.filter(t => t.status === 'completed')

  // 计算周期内数据
  const now = new Date()
  const periodMs = period === 'week' ? 7 * 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000
  const startDate = new Date(now.getTime() - periodMs)

  const periodTasks = completedTasks.filter(t => {
    if (!t.completedAt) return false
    return new Date(t.completedAt) >= startDate
  })

  // 统计标签
  const tagUsage = {}
  periodTasks.forEach(task => {
    if (task.tags && Array.isArray(task.tags)) {
      task.tags.forEach(tag => {
        tagUsage[tag] = (tagUsage[tag] || 0) + 1
      })
    }
  })
  const topTags = Object.entries(tagUsage)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  // 连续打卡
  const currentStreak = calculateStreakDays(taskList, babyId)
  const longestStreak = calculateLongestStreak(taskList, babyId)

  // 积分
  const pointsStore = getPointsStore()
  const pointsRecords = pointsStore ? pointsStore.getPointsHistory(babyId) : []
  const periodPoints = pointsRecords
    .filter(p => p.type === 'earn' && new Date(p.createdAt) >= startDate)
    .reduce((sum, p) => sum + (p.amount || 0), 0)

  // 等级
  const totalPoints = pointsRecords.filter(p => p.type === 'earn').reduce((sum, p) => sum + (p.amount || 0), 0)
  const level = Math.floor(totalPoints / 100) + 1

  // 成就
  const achievementStore = getAchievementStore()
  const achievements = achievementStore ? (achievementStore.unlockedList || []).slice(0, 5) : []

  // 技能树进度（简化）
  const skillTreeProgress = { unlocked: 0, total: 20 }

  return {
    baby_id: babyId,
    baby_name: baby.name,
    period,
    stats: {
      tasks_completed: periodTasks.length,
      points_earned: periodPoints,
      achievements_unlocked: achievements.length,
      current_streak: currentStreak,
      longest_streak: longestStreak,
      level,
      top_tags: topTags,
      completion_rate: period === 'week' ? Math.min(1, periodTasks.length / 7) : Math.min(1, periodTasks.length / 30)
    },
    achievements: achievements.map(a => ({ name: a.title, icon: a.icon || '🏆' })),
    skill_tree_progress: skillTreeProgress
  }
}

/**
 * 调用 AI API 生成总结
 * @param {string} babyId - 宝宝ID
 * @param {string} period - 'week' | 'month'
 * @returns {object} { summary, strengths, suggestions, highlights }
 */
export async function generateAISummary(babyId, period = 'week') {
  // 检查缓存
  const cached = getAISummaryCache(babyId, period)
  if (cached) {
    const age = Date.now() - new Date(cached.generatedAt).getTime()
    if (age < CACHE_TTL[period]) {
      console.log('[AI Summary] Using cached result')
      return {
        summary: cached.summary,
        strengths: JSON.parse(cached.strengths || '[]'),
        suggestions: JSON.parse(cached.suggestions || '[]'),
        highlights: JSON.parse(cached.highlights || '[]')
      }
    }
  }

  const data = buildGrowthStats(babyId, period)
  if (!data) {
    return generateTemplateSummary({})
  }

  try {
    const response = await uni.request({
      url: '/api/v1/ai/growth-summary',
      method: 'POST',
      header: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      },
      data
    })

    if (response.statusCode === 200 && response.data) {
      const result = response.data
      // 缓存结果
      insertAISummaryCache(babyId, period, result.summary, result.strengths, result.suggestions, result.highlights)
      return result
    }
    throw new Error('API request failed')
  } catch (e) {
    console.log('[AI Summary] API failed, using template fallback:', e.message)
    return generateTemplateSummary(data)
  }
}

/**
 * 模板分析优势
 * @param {object} stats - 统计数据
 * @returns {array} 优势列表（最多3条）
 */
export function analyzeStrengths(stats) {
  const strengths = []
  const s = stats.stats || stats

  if (s.current_streak >= 7 || s.currentStreak >= 7) strengths.push('连续打卡习惯好')
  if (s.completion_rate >= 0.8 || (s.stats && s.stats.completion_rate >= 0.8)) strengths.push('任务完成率高')
  if (s.top_tags?.[0]?.count >= 5 || (s.stats && s.stats.top_tags?.[0]?.count >= 5)) {
    const tag = s.top_tags?.[0]?.tag || s.stats?.top_tags?.[0]?.tag
    if (tag) strengths.push(`${tag}类任务表现突出`)
  }
  if (s.achievements_unlocked >= 3 || s.achievements?.length >= 3) strengths.push('成就解锁数量多')
  if (s.level >= 5 || (s.stats && s.stats.level >= 5)) strengths.push('成长等级较高')

  return strengths.slice(0, 3)
}

/**
 * 模板生成建议
 * @param {object} stats - 统计数据
 * @returns {array} 建议列表（最多3条）
 */
export function generateSuggestions(stats) {
  const suggestions = []
  const s = stats.stats || stats
  const tags = s.top_tags?.map(t => t.tag) || (s.stats?.top_tags?.map(t => t.tag) || [])

  if (!tags.includes('运动') && !tags.includes('体育')) suggestions.push('建议增加运动类任务')
  if (!tags.includes('习惯')) suggestions.push('建议加强习惯养成类任务')
  if (!tags.includes('学习') && !tags.includes('知识')) suggestions.push('可以尝试学习类任务')
  if (s.current_streak < 3 || s.currentStreak < 3) suggestions.push('先从每日一个小任务开始培养连续习惯')
  if (s.completion_rate < 0.5 && s.stats) suggestions.push('注意提高任务完成率哦')

  return suggestions.slice(0, 3)
}

/**
 * 检测亮点
 * @param {object} stats - 统计数据
 * @returns {array} 亮点列表
 */
export function detectHighlights(stats) {
  const highlights = []
  const s = stats.stats || stats

  if (s.tasks_completed > 10 || s.totalTasks > 10) highlights.push('单周完成任务数创新高')
  if ((s.current_streak >= s.longest_streak || s.currentStreak >= s.longestStreak) &&
      (s.current_streak > 3 || s.currentStreak > 3)) {
    highlights.push('连续打卡天数追平历史记录')
  }
  if (s.achievements_unlocked >= 2 || s.achievements?.length >= 2) {
    highlights.push('本周解锁了多个新成就')
  }

  return highlights
}

/**
 * 模板生成总结（回退方案）
 * @param {object} data - buildGrowthStats 返回的数据
 * @returns {object} { summary, strengths, suggestions, highlights }
 */
export function generateTemplateSummary(data) {
  const stats = data.stats || data
  const babyName = data.baby_name || '宝宝'

  return {
    summary: generateEncouragement(stats),
    strengths: analyzeStrengths(data),
    suggestions: generateSuggestions(data),
    highlights: detectHighlights(data)
  }
}

// ==================== 辅助函数 ====================

const getBabiesFromStorage = () => {
  try {
    const stored = uni.getStorageSync('babies')
    if (stored) return typeof stored === 'string' ? JSON.parse(stored) : stored
  } catch (e) {}
  return []
}

const getTaskListFromStorage = () => {
  try {
    const stored = uni.getStorageSync('taskList')
    if (stored) return typeof stored === 'string' ? JSON.parse(stored) : stored
  } catch (e) {}
  return []
}

const getPointsStore = () => {
  try {
    const { usePointsStore } = require('./pointsStore')
    return usePointsStore()
  } catch (e) {
    return null
  }
}

const getAchievementStore = () => {
  try {
    const { useAchievementStore } = require('./achievementStore')
    return useAchievementStore()
  } catch (e) {
    return null
  }
}

const calculateStreakDays = (taskRecords, babyId) => {
  if (!taskRecords || taskRecords.length === 0) return 0
  const babyTasks = babyId
    ? taskRecords.filter(t => t.babyId === babyId && t.completedAt)
    : taskRecords.filter(t => t.completedAt)
  if (babyTasks.length === 0) return 0

  const completedDates = [...new Set(
    babyTasks.map(t => new Date(t.completedAt).toISOString().split('T')[0])
  )].sort().reverse()
  if (completedDates.length === 0) return 0

  let streak = 0
  let currentDate = new Date()
  for (let i = 0; i < 365; i++) {
    const dateStr = currentDate.toISOString().split('T')[0]
    if (completedDates.includes(dateStr)) {
      streak++
      currentDate.setDate(currentDate.getDate() - 1)
    } else break
  }
  return streak
}

const calculateLongestStreak = (taskRecords, babyId) => {
  if (!taskRecords || taskRecords.length === 0) return 0
  const babyTasks = babyId
    ? taskRecords.filter(t => t.babyId === babyId && t.completedAt)
    : taskRecords.filter(t => t.completedAt)
  const completedDates = [...new Set(
    babyTasks.map(t => new Date(t.completedAt).toISOString().split('T')[0])
  )].sort()
  if (completedDates.length === 0) return 0

  let maxStreak = 1, currentStreak = 1
  for (let i = 1; i < completedDates.length; i++) {
    const diffDays = (new Date(completedDates[i]) - new Date(completedDates[i-1])) / 86400000
    if (diffDays === 1) {
      currentStreak++
      maxStreak = Math.max(maxStreak, currentStreak)
    } else currentStreak = 1
  }
  return maxStreak
}

export default {
  buildGrowthStats,
  generateAISummary,
  analyzeStrengths,
  generateSuggestions,
  detectHighlights,
  generateTemplateSummary,
  invalidateAICache
}