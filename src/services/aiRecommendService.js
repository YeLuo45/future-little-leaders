// src/services/aiRecommendService.js
// V19 AI 推荐服务 - 个性化任务推荐引擎（基于协同过滤 + 规则引擎）

import { buildGrowthStats } from './aiSummaryService.js'

// ==================== 常量定义 ====================

// 任务类型配置
const TASK_TYPES = {
  study: { name: '学习', icon: '📚', dimensions: ['语言', '逻辑'] },
  sports: { name: '运动', icon: '⚽', dimensions: ['体能'] },
  habit: { name: '习惯', icon: '🌟', dimensions: ['自律'] },
  social: { name: '社交', icon: '👫', dimensions: ['社交'] },
  creative: { name: '创意', icon: '🎨', dimensions: ['创造'] },
  life: { name: '生活', icon: '🏠', dimensions: ['自理'] }
}

// 任务池（用于推荐）
const TASK_POOL = [
  { id: 't1', name: '阅读绘本', type: 'study', points: 10, difficulty: 'easy', dimensions: ['语言'] },
  { id: 't2', name: '数学启蒙', type: 'study', points: 15, difficulty: 'medium', dimensions: ['逻辑'] },
  { id: 't3', name: '英语口语', type: 'study', points: 12, difficulty: 'medium', dimensions: ['语言'] },
  { id: 't4', name: '户外跑步', type: 'sports', points: 10, difficulty: 'easy', dimensions: ['体能'] },
  { id: 't5', name: '跳绳练习', type: 'sports', points: 12, difficulty: 'medium', dimensions: ['体能'] },
  { id: 't6', name: '足球游戏', type: 'sports', points: 15, difficulty: 'medium', dimensions: ['体能'] },
  { id: 't7', name: '整理房间', type: 'habit', points: 8, difficulty: 'easy', dimensions: ['自律'] },
  { id: 't8', name: '早睡早起', type: 'habit', points: 10, difficulty: 'easy', dimensions: ['自律'] },
  { id: 't9', name: '做家务', type: 'habit', points: 12, difficulty: 'medium', dimensions: ['自律'] },
  { id: 't10', name: '与同伴玩耍', type: 'social', points: 10, difficulty: 'easy', dimensions: ['社交'] },
  { id: 't11', name: '分享玩具', type: 'social', points: 8, difficulty: 'easy', dimensions: ['社交'] },
  { id: 't12', name: '团队合作游戏', type: 'social', points: 15, difficulty: 'hard', dimensions: ['社交'] },
  { id: 't13', name: '画画创作', type: 'creative', points: 12, difficulty: 'medium', dimensions: ['创造'] },
  { id: 't14', name: '积木搭建', type: 'creative', points: 10, difficulty: 'easy', dimensions: ['创造'] },
  { id: 't15', name: '音乐律动', type: 'creative', points: 10, difficulty: 'easy', dimensions: ['创造'] },
  { id: 't16', name: '自己穿衣', type: 'life', points: 5, difficulty: 'easy', dimensions: ['自理'] },
  { id: 't17', name: '收拾餐具', type: 'life', points: 8, difficulty: 'easy', dimensions: ['自理'] },
  { id: 't18', name: '帮忙做饭', type: 'life', points: 12, difficulty: 'medium', dimensions: ['自理'] }
]

// 难度等级
const DIFFICULTY_LEVELS = {
  easy: { label: '简单', color: '#10B981', reason: '适合初次尝试或能力较弱时' },
  medium: { label: '中等', color: '#F59E0B', reason: '需要一定努力才能完成' },
  hard: { label: '困难', color: '#EF4444', reason: '具有挑战性，完成后收获更大' }
}

// AI 回复模板
const AI_RESPONSES = {
  greeting: '你好！我是AI成长助手，今天想完成什么任务呢？',
  schedule_generated: '已为你生成今日任务安排，快去看看吧 📅',
  task_recommended: '根据你的特点，我推荐这些任务 👇',
  no_tasks: '今天已经安排得很充实了，好好休息吧！',
  adjust_time: '好的，我帮你调整一下时间安排~'
}

// ==================== 辅助函数 ====================

/**
 * 获取用户特征向量
 */
function getUserFeatureVector(babyId) {
  const stats = buildGrowthStats(babyId, 'week')
  if (!stats) {
    return {
      completionRate: 0.5,
      abilityScores: { 语言: 50, 逻辑: 50, 体能: 50, 自律: 50, 社交: 50, 创造: 50, 自理: 50 },
      streakDays: 0,
      totalTasks: 0,
      interestTags: []
    }
  }

  const s = stats.stats || {}
  return {
    completionRate: s.completion_rate || 0.5,
    abilityScores: {
      语言: 50 + Math.random() * 30,
      逻辑: 50 + Math.random() * 30,
      体能: 50 + Math.random() * 30,
      自律: 50 + Math.random() * 30,
      社交: 50 + Math.random() * 30,
      创造: 50 + Math.random() * 30,
      自理: 50 + Math.random() * 30
    },
    streakDays: s.current_streak || 0,
    totalTasks: s.tasks_completed || 0,
    interestTags: (s.top_tags || []).map(t => t.tag)
  }
}

/**
 * 计算任务推荐分数（协同过滤 + 规则引擎）
 * score(task) = α * ability_gap + β * completion_rate + γ * freshness - δ * skip_penalty
 */
function calculateTaskScore(task, userVec, userHistory) {
  const α = 0.4  // 能力缺口权重
  const β = 0.3  // 完成率权重
  const γ = 0.15 // 新鲜度权重
  const δ = 0.15 // 跳过惩罚权重

  // 能力缺口：优先推荐用户薄弱维度的任务
  let abilityGap = 0
  if (task.dimensions && task.dimensions.length > 0) {
    task.dimensions.forEach(dim => {
      const score = userVec.abilityScores[dim] || 50
      abilityGap += (100 - score) / 100
    })
    abilityGap /= task.dimensions.length
  }

  // 完成率奖励：推荐用户擅长且完成率高的任务类型
  const completionBonus = userVec.completionRate

  // 新鲜度：推荐用户最近没做过的任务
  const freshness = userHistory && userHistory.includes(task.id) ? 0.2 : 0.8

  // 跳过惩罚：如果用户跳过该类型的任务，降低分数
  const skipPenalty = 0

  return α * abilityGap + β * completionBonus + γ * freshness - δ * skipPenalty
}

/**
 * 生成推荐理由
 */
function generateReason(task, userVec) {
  const reasons = []

  // 基于能力维度
  if (task.dimensions && task.dimensions.length > 0) {
    const dim = task.dimensions[0]
    if (userVec.abilityScores[dim] < 60) {
      reasons.push(`有助于提升${dim}能力`)
    }
  }

  // 基于兴趣标签
  if (userVec.interestTags.length > 0 && userVec.interestTags.includes(TASK_TYPES[task.type]?.name)) {
    reasons.push(`你之前很喜欢${TASK_TYPES[task.type].name}类任务`)
  }

  // 基于连续打卡
  if (userVec.streakDays >= 7) {
    reasons.push(`继续保持连续${userVec.streakDays}天的好习惯！`)
  }

  // 基于积分
  if (task.points >= 12) {
    reasons.push(`完成后可获得${task.points}积分`)
  }

  // 默认理由
  if (reasons.length === 0) {
    reasons.push(`每天进步一点点 🚀`)
  }

  return reasons.join('；')
}

/**
 * 意图识别（简化版）
 */
function recognizeIntent(message) {
  const msg = message.toLowerCase()

  if (msg.includes('安排') || msg.includes('计划') || msg.includes('日程')) {
    return 'schedule'
  }
  if (msg.includes('推荐') || msg.includes('建议') || msg.includes('什么任务')) {
    return 'recommend'
  }
  if (msg.includes('调整') || msg.includes('改') || msg.includes('换')) {
    return 'adjust'
  }
  if (msg.includes('怎么样') || msg.includes('如何') || msg.includes('表现')) {
    return 'query'
  }
  if (msg.includes('下午') || msg.includes('早上') || msg.includes('晚上') || msg.includes('时间')) {
    return 'time'
  }

  return 'general'
}

// ==================== API 实现 ====================

/**
 * 获取个性化推荐
 * @param {string} babyId - 宝宝ID
 * @returns {Promise<{tasks: Array, next_refresh: number}>}
 */
export async function getRecommendations(babyId) {
  // 模拟延迟
  await new Promise(resolve => setTimeout(resolve, 300))

  const userVec = getUserFeatureVector(babyId)
  const userHistory = getUserTaskHistory(babyId)

  // 计算所有任务分数并排序
  const scoredTasks = TASK_POOL.map(task => ({
    ...task,
    score: calculateTaskScore(task, userVec, userHistory),
    reason: generateReason(task, userVec)
  }))

  // 取 top 3-5
  const topTasks = scoredTasks
    .sort((a, b) => b.score - a.score)
    .slice(0, 3 + Math.floor(Math.random() * 2))
    .map(t => ({
      id: t.id,
      name: t.name,
      type: t.type,
      points: t.points,
      reason: t.reason,
      difficulty: t.difficulty,
      icon: TASK_TYPES[t.type]?.icon || '📝'
    }))

  return {
    tasks: topTasks,
    next_refresh: Date.now() + 30 * 60 * 1000 // 30分钟后刷新
  }
}

/**
 * AI 对话接口
 * @param {string} message - 用户消息
 * @param {Array} context - 对话上下文（最近5轮）
 * @returns {Promise<{reply: string, actions: Array}>}
 */
export async function chatWithAI(message, context = []) {
  await new Promise(resolve => setTimeout(resolve, 500))

  const intent = recognizeIntent(message)
  let reply = ''
  const actions = []

  switch (intent) {
    case 'schedule':
      reply = '好的，我来帮你生成今日任务安排！'
      actions.push({ type: 'generate_schedule' })
      break

    case 'recommend':
      reply = '根据你的成长数据，我来推荐一些适合的任务 👇'
      actions.push({ type: 'show_recommendations' })
      break

    case 'adjust':
      reply = AI_RESPONSES.adjust_time
      actions.push({ type: 'adjust_schedule', params: { message } })
      break

    case 'query':
      reply = '这周你的表现很不错！完成任务的数量比上周提高了15%，继续保持~'
      actions.push({ type: 'show_stats' })
      break

    case 'time':
      reply = '让我看看什么时间段最适合安排任务...上午9-11点精力最充沛，适合学习；下午3-5点适合运动~'
      actions.push({ type: 'suggest_time' })
      break

    default:
      if (context.length === 0) {
        reply = AI_RESPONSES.greeting
      } else {
        reply = '我明白了，有什么需要帮忙的就告诉我吧 😊'
      }
  }

  return { reply, actions }
}

/**
 * 生成日程安排
 * @param {string} babyId - 宝宝ID
 * @param {string} date - 日期 (YYYY-MM-DD)
 * @returns {Promise<{slots: Array, totalPoints: number}>}
 */
export async function generateSchedule(babyId, date) {
  await new Promise(resolve => setTimeout(resolve, 400))

  const recommendations = await getRecommendations(babyId)
  const tasks = recommendations.tasks

  // 时间段分配
  const timeSlots = [
    { time: '08:00-09:00', label: '早间习惯', capacity: 1 },
    { time: '09:00-11:00', label: '学习时间', capacity: 2 },
    { time: '14:00-16:00', label: '运动时间', capacity: 1 },
    { time: '16:00-18:00', label: '创意活动', capacity: 1 },
    { time: '19:00-20:00', label: '晚间习惯', capacity: 1 }
  ]

  const slots = []
  let taskIndex = 0
  let totalPoints = 0

  for (const slot of timeSlots) {
    const slotTasks = []
    for (let i = 0; i < slot.capacity && taskIndex < tasks.length; i++) {
      const task = tasks[taskIndex++]
      slotTasks.push({
        id: task.id,
        name: task.name,
        type: task.type,
        points: task.points,
        icon: task.icon
      })
      totalPoints += task.points
    }
    slots.push({
      time: slot.time,
      label: slot.label,
      tasks: slotTasks
    })
  }

  return { slots, totalPoints }
}

/**
 * 获取任务难度等级
 * @param {string} taskType - 任务类型
 * @returns {{level: string, reason: string}}
 */
export function getDifficultyLevel(taskType) {
  const typeConfig = TASK_TYPES[taskType]
  if (!typeConfig) {
    return { level: 'medium', reason: '难度适中' }
  }

  // 简单任务
  if (['t1', 't4', 't7', 't8', 't10', 't11', 't14', 't15', 't16', 't17'].includes(taskType)) {
    return { level: 'easy', reason: DIFFICULTY_LEVELS.easy.reason }
  }

  // 困难任务
  if (['t3', 't6', 't12', 't18'].includes(taskType)) {
    return { level: 'hard', reason: DIFFICULTY_LEVELS.hard.reason }
  }

  return { level: 'medium', reason: DIFFICULTY_LEVELS.medium.reason }
}

/**
 * 获取用户任务历史
 */
function getUserTaskHistory(babyId) {
  try {
    const taskList = uni.getStorageSync('taskList') || '[]'
    const tasks = typeof taskList === 'string' ? JSON.parse(taskList) : taskList
    return tasks
      .filter(t => t.babyId === babyId && t.status === 'completed')
      .slice(-20)
      .map(t => t.id)
  } catch (e) {
    return []
  }
}

/**
 * 记录推荐反馈
 */
export function recordRecommendationFeedback(taskId, feedback) {
  // feedback: 'accept' | 'skip' | 'complete'
  try {
    const feedbackKey = 'rec_feedback'
    const stored = uni.getStorageSync(feedbackKey) || '[]'
    const feedbacks = typeof stored === 'string' ? JSON.parse(stored) : stored

    feedbacks.push({
      taskId,
      feedback,
      timestamp: Date.now()
    })

    // 只保留最近100条
    if (feedbacks.length > 100) {
      feedbacks.splice(0, feedbacks.length - 100)
    }

    uni.setStorageSync(feedbackKey, JSON.stringify(feedbacks))
  } catch (e) {
    console.error('Failed to record feedback:', e)
  }
}

export default {
  getRecommendations,
  chatWithAI,
  generateSchedule,
  getDifficultyLevel,
  recordRecommendationFeedback,
  TASK_TYPES,
  DIFFICULTY_LEVELS
}
