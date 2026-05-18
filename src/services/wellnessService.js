/**
 * V52 Sleep & Wellness Tracker Service
 * 睡眠与健康追踪 - 睡眠时间记录、睡眠质量分析、健康报告、wellness习惯养成
 */

// Storage keys
const SLEEP_LOGS_KEY = 'sleep_logs'
const SLEEP_STREAKS_KEY = 'sleep_streaks'
const WELLNESS_HABITS_KEY = 'wellness_habits'
const WATER_LOGS_KEY = 'water_logs'
const EYE_BREAKS_KEY = 'eye_breaks'
const POSTURE_LOGS_KEY = 'posture_logs'
const SLEEP_REPORTS_KEY = 'sleep_reports'

// ============================================================================
// 睡眠质量等级
// ============================================================================

export const SLEEP_QUALITY = {
  excellent: { id: 'excellent', name: '优秀', minScore: 90, color: '#4CAF50', icon: '😴' },
  good: { id: 'good', name: '良好', minScore: 75, color: '#8BC34A', icon: '🙂' },
  fair: { id: 'fair', name: '一般', minScore: 60, color: '#FFC107', icon: '😐' },
  poor: { id: 'poor', name: '较差', minScore: 0, color: '#FF5722', icon: '😫' }
}

export const getSleepQuality = (score) => {
  if (score >= 90) return SLEEP_QUALITY.excellent
  if (score >= 75) return SLEEP_QUALITY.good
  if (score >= 60) return SLEEP_QUALITY.fair
  return SLEEP_QUALITY.poor
}

// ============================================================================
// 睡眠记录操作
// ============================================================================

export const getSleepLogs = () => {
  try {
    const data = uni.getStorageSync(SLEEP_LOGS_KEY)
    if (data) return JSON.parse(data)
  } catch (e) {
    console.error('getSleepLogs error:', e)
  }
  return []
}

export const saveSleepLog = (log) => {
  try {
    const logs = getSleepLogs()
    const existingIndex = logs.findIndex(l => l.date === log.date)
    
    if (existingIndex >= 0) {
      logs[existingIndex] = { ...logs[existingIndex], ...log, updatedAt: new Date().toISOString() }
    } else {
      logs.push({
        id: 'sleep_' + Date.now(),
        createdAt: new Date().toISOString(),
        ...log
      })
    }
    
    uni.setStorageSync(SLEEP_LOGS_KEY, JSON.stringify(logs))
    updateSleepStreak(log.date)
    return true
  } catch (e) {
    console.error('saveSleepLog error:', e)
    return false
  }
}

export const deleteSleepLog = (id) => {
  try {
    const logs = getSleepLogs()
    const filtered = logs.filter(l => l.id !== id)
    uni.setStorageSync(SLEEP_LOGS_KEY, JSON.stringify(filtered))
    return true
  } catch (e) {
    console.error('deleteSleepLog error:', e)
    return false
  }
}

export const getTodaySleepLog = () => {
  const today = new Date().toISOString().split('T')[0]
  const logs = getSleepLogs()
  return logs.find(l => l.date === today) || null
}

export const getSleepLogsByDateRange = (startDate, endDate) => {
  const logs = getSleepLogs()
  return logs.filter(l => l.date >= startDate && l.date <= endDate)
}

export const getWeekSleepLogs = () => {
  const today = new Date()
  const weekAgo = new Date(today)
  weekAgo.setDate(weekAgo.getDate() - 7)
  
  const startDate = weekAgo.toISOString().split('T')[0]
  const endDate = today.toISOString().split('T')[0]
  
  return getSleepLogsByDateRange(startDate, endDate)
}

export const getMonthSleepLogs = () => {
  const today = new Date()
  const monthAgo = new Date(today)
  monthAgo.setDate(monthAgo.getDate() - 30)
  
  const startDate = monthAgo.toISOString().split('T')[0]
  const endDate = today.toISOString().split('T')[0]
  
  return getSleepLogsByDateRange(startDate, endDate)
}

// ============================================================================
// 睡眠连续追踪
// ============================================================================

export const getSleepStreak = () => {
  try {
    const data = uni.getStorageSync(SLEEP_STREAKS_KEY)
    if (data) return JSON.parse(data)
  } catch (e) {
    console.error('getSleepStreak error:', e)
  }
  return { currentStreak: 0, longestStreak: 0, lastSleepDate: '' }
}

export const updateSleepStreak = (date) => {
  try {
    const streak = getSleepStreak()
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0]
    
    if (streak.lastSleepDate === yesterday || streak.lastSleepDate === today) {
      if (streak.lastSleepDate !== today) {
        streak.currentStreak += 1
      }
    } else if (streak.lastSleepDate !== today) {
      streak.currentStreak = 1
    }
    
    streak.lastSleepDate = today
    streak.longestStreak = Math.max(streak.longestStreak, streak.currentStreak)
    
    uni.setStorageSync(SLEEP_STREAKS_KEY, JSON.stringify(streak))
    return streak
  } catch (e) {
    console.error('updateSleepStreak error:', e)
    return { currentStreak: 0, longestStreak: 0, lastSleepDate: '' }
  }
}

// ============================================================================
// 睡眠积分奖励
// ============================================================================

export const calculateSleepPoints = (log) => {
  let points = 0
  
  // 基础分数：按时睡觉 +10，早起 +10
  const bedHour = new Date(log.bedtime).getHours()
  const wakeHour = new Date(log.wakeupTime).getHours()
  
  if (bedHour >= 21 && bedHour < 23) points += 10
  if (wakeHour >= 6 && wakeHour < 8) points += 10
  
  // 睡眠时长奖励
  const duration = log.duration
  if (duration >= 8 && duration <= 10) points += 20
  else if (duration >= 7 && duration < 8) points += 15
  else if (duration >= 10 && duration < 12) points += 10
  
  // 质量分数加成
  points += Math.floor(log.qualityScore / 10)
  
  // 连续打卡加成
  const streak = getSleepStreak()
  if (streak.currentStreak >= 7) points += 15
  else if (streak.currentStreak >= 3) points += 5
  
  return points
}

// ============================================================================
// 健康习惯追踪
// ============================================================================

export const getWaterLogs = () => {
  try {
    const data = uni.getStorageSync(WATER_LOGS_KEY)
    if (data) return JSON.parse(data)
  } catch (e) {
    console.error('getWaterLogs error:', e)
  }
  return []
}

export const addWaterLog = (amount = 250) => {
  try {
    const today = new Date().toISOString().split('T')[0]
    const logs = getWaterLogs()
    
    const todayLog = logs.find(l => l.date === today) || { date: today, glasses: 0, totalMl: 0 }
    todayLog.glasses += 1
    todayLog.totalMl += amount
    todayLog.updatedAt = new Date().toISOString()
    
    if (!todayLog.id) {
      todayLog.id = 'water_' + Date.now()
      logs.push(todayLog)
    }
    
    uni.setStorageSync(WATER_LOGS_KEY, JSON.stringify(logs))
    return todayLog
  } catch (e) {
    console.error('addWaterLog error:', e)
    return null
  }
}

export const getTodayWaterLog = () => {
  const today = new Date().toISOString().split('T')[0]
  const logs = getWaterLogs()
  return logs.find(l => l.date === today) || { date: today, glasses: 0, totalMl: 0 }
}

export const getEyeBreakLogs = () => {
  try {
    const data = uni.getStorageSync(EYE_BREAKS_KEY)
    if (data) return JSON.parse(data)
  } catch (e) {
    console.error('getEyeBreakLogs error:', e)
  }
  return []
}

export const addEyeBreakLog = () => {
  try {
    const today = new Date().toISOString().split('T')[0]
    const logs = getEyeBreakLogs()
    
    const todayLog = logs.find(l => l.date === today) || { date: today, breaks: 0 }
    todayLog.breaks += 1
    todayLog.updatedAt = new Date().toISOString()
    
    if (!todayLog.id) {
      todayLog.id = 'eye_' + Date.now()
      logs.push(todayLog)
    }
    
    uni.setStorageSync(EYE_BREAKS_KEY, JSON.stringify(logs))
    return todayLog
  } catch (e) {
    console.error('addEyeBreakLog error:', e)
    return null
  }
}

export const getTodayEyeBreaks = () => {
  const today = new Date().toISOString().split('T')[0]
  const logs = getEyeBreakLogs()
  const todayLog = logs.find(l => l.date === today)
  return todayLog ? todayLog.breaks : 0
}

export const getPostureLogs = () => {
  try {
    const data = uni.getStorageSync(POSTURE_LOGS_KEY)
    if (data) return JSON.parse(data)
  } catch (e) {
    console.error('getPostureLogs error:', e)
  }
  return []
}

export const addPostureLog = (good = true) => {
  try {
    const today = new Date().toISOString().split('T')[0]
    const logs = getPostureLogs()
    
    const todayLog = logs.find(l => l.date === today) || { date: today, goodCount: 0, badCount: 0 }
    if (good) todayLog.goodCount += 1
    else todayLog.badCount += 1
    todayLog.updatedAt = new Date().toISOString()
    
    if (!todayLog.id) {
      todayLog.id = 'posture_' + Date.now()
      logs.push(todayLog)
    }
    
    uni.setStorageSync(POSTURE_LOGS_KEY, JSON.stringify(logs))
    return todayLog
  } catch (e) {
    console.error('addPostureLog error:', e)
    return null
  }
}

export const getTodayPostureLog = () => {
  const today = new Date().toISOString().split('T')[0]
  const logs = getPostureLogs()
  return logs.find(l => l.date === today) || { date: today, goodCount: 0, badCount: 0 }
}

// ============================================================================
// 睡眠报告生成
// ============================================================================

export const generateSleepReport = (logs) => {
  if (!logs || logs.length === 0) {
    return {
      averageDuration: 0,
      averageQuality: 0,
      totalNights: 0,
      bestNight: null,
      trends: [],
      suggestions: []
    }
  }
  
  const totalDuration = logs.reduce((sum, l) => sum + (l.duration || 0), 0)
  const totalQuality = logs.reduce((sum, l) => sum + (l.qualityScore || 0), 0)
  const averageDuration = (totalDuration / logs.length).toFixed(1)
  const averageQuality = Math.round(totalQuality / logs.length)
  
  const bestNight = logs.reduce((best, l) => {
    if (!best || (l.qualityScore > best.qualityScore)) return l
    return best
  }, null)
  
  // 趋势分析
  const sortedLogs = [...logs].sort((a, b) => a.date.localeCompare(b.date))
  const trends = sortedLogs.slice(-7).map(l => ({
    date: l.date,
    duration: l.duration,
    quality: l.qualityScore
  }))
  
  // 睡眠建议
  const suggestions = []
  
  if (averageDuration < 7) {
    suggestions.push({ type: 'duration', text: '建议每晚保证7-9小时的睡眠时间，有助于身体发育。' })
  } else if (averageDuration > 10) {
    suggestions.push({ type: 'duration', text: '睡眠时间过长可能会影响精神状态，建议控制在9小时以内。' })
  }
  
  if (averageQuality < 70) {
    suggestions.push({ type: 'quality', text: '睡眠质量有待提高，建议睡前减少电子设备使用，营造安静的睡眠环境。' })
  }
  
  // 检查是否经常晚睡
  const lateNights = logs.filter(l => {
    const hour = new Date(l.bedtime).getHours()
    return hour >= 23
  }).length
  
  if (lateNights / logs.length > 0.5) {
    suggestions.push({ type: 'time', text: '建议养成早睡习惯，晚上10点前入睡有利于生长激素分泌。' })
  }
  
  // 检查是否经常晚起
  const lateWakeups = logs.filter(l => {
    const hour = new Date(l.wakeupTime).getHours()
    return hour >= 8
  }).length
  
  if (lateWakeups / logs.length > 0.7) {
    suggestions.push({ type: 'time', text: '建议培养早起习惯，早晨的阳光有助于调节生物钟。' })
  }
  
  if (suggestions.length === 0) {
    suggestions.push({ type: 'praise', text: '继续保持良好的睡眠习惯！规律的睡眠有助于健康成长。' })
  }
  
  return {
    averageDuration,
    averageQuality,
    totalNights: logs.length,
    bestNight,
    trends,
    suggestions
  }
}

// ============================================================================
// 数据导出
// ============================================================================

export const exportWellnessData = () => {
  const sleepLogs = getSleepLogs()
  const waterLogs = getWaterLogs()
  const eyeBreaks = getEyeBreakLogs()
  const postureLogs = getPostureLogs()
  const sleepStreak = getSleepStreak()
  
  return {
    exportDate: new Date().toISOString(),
    sleepLogs,
    waterLogs,
    eyeBreaks,
    postureLogs,
    sleepStreak
  }
}

// ============================================================================
// 与任务系统联动
// ============================================================================

export const checkWellnessIntegration = () => {
  const todaySleep = getTodaySleepLog()
  const todayWater = getTodayWaterLog()
  const todayEyeBreaks = getTodayEyeBreaks()
  
  return {
    hasSleepLog: !!todaySleep,
    waterGoalMet: todayWater.totalMl >= 2000, // 8杯水
    eyeBreaksGoalMet: todayEyeBreaks >= 3, // 每小时休息一次
    sleepPoints: todaySleep ? calculateSleepPoints(todaySleep) : 0
  }
}

// ============================================================================
// 健康小贴士
// ============================================================================

export const WELLNESS_TIPS = [
  { id: 1, category: 'sleep', icon: '😴', title: '睡前放松', content: '睡前1小时避免使用电子设备，可以阅读书籍或听轻音乐。' },
  { id: 2, category: 'sleep', icon: '🌡️', title: '适宜室温', content: '卧室温度保持在18-22摄氏度最适宜入睡。' },
  { id: 3, category: 'water', icon: '💧', title: '定时饮水', content: '养成每小时喝水的习惯，不要等到口渴才喝。' },
  { id: 4, category: 'water', icon: '🥛', title: '早起一杯水', content: '早晨起床后喝一杯温水，帮助唤醒身体。' },
  { id: 5, category: 'eye', icon: '👀', title: '20-20-20法则', content: '每使用电子设备20分钟，远眺20英尺外的物体20秒。' },
  { id: 6, category: 'eye', icon: '🌿', title: '眼部放松', content: '感觉眼睛疲劳时，可以闭眼休息或做眼保健操。' },
  { id: 7, category: 'posture', icon: '🪑', title: '正确坐姿', content: '保持背部挺直，肩膀放松，眼睛与屏幕保持适当距离。' },
  { id: 8, category: 'posture', icon: '🏃', title: '定时活动', content: '每坐45-60分钟，站起来活动5-10分钟。' }
]

export const getWellnessTipByCategory = (category) => {
  return WELLNESS_TIPS.filter(tip => tip.category === category)
}

export const getRandomWellnessTip = () => {
  const index = Math.floor(Math.random() * WELLNESS_TIPS.length)
  return WELLNESS_TIPS[index]
}

export default {
  // 睡眠质量
  SLEEP_QUALITY,
  getSleepQuality,
  
  // 睡眠记录
  getSleepLogs,
  saveSleepLog,
  deleteSleepLog,
  getTodaySleepLog,
  getSleepLogsByDateRange,
  getWeekSleepLogs,
  getMonthSleepLogs,
  
  // 连续追踪
  getSleepStreak,
  
  // 积分
  calculateSleepPoints,
  
  // 健康习惯
  getWaterLogs,
  addWaterLog,
  getTodayWaterLog,
  getEyeBreakLogs,
  addEyeBreakLog,
  getTodayEyeBreaks,
  getPostureLogs,
  addPostureLog,
  getTodayPostureLog,
  
  // 报告
  generateSleepReport,
  
  // 导出
  exportWellnessData,
  
  // 联动
  checkWellnessIntegration,
  
  // 小贴士
  WELLNESS_TIPS,
  getWellnessTipByCategory,
  getRandomWellnessTip
}
