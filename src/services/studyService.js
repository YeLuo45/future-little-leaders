/**
 * Study Room Service
 * 负责自习室、专注计时、白噪音背景音、学习统计
 */

import { getCurrentMemberId } from './familyService'

// Storage keys
const STUDY_RECORDS_KEY = 'study_records'
const STUDY_CONFIG_KEY = 'study_config'
const STUDY_STREAK_KEY = 'study_streak'

// Default settings
const DEFAULT_STUDY_CONFIG = {
  breakInterval: 25,    // 休息提醒间隔(分钟)
  defaultScene: 'library',  // 默认场景
  autoStartBreak: false    // 是否自动开始休息
}

// ============ 学习记录 ============

// 获取学习记录
export const getStudyRecords = () => {
  try {
    const stored = uni.getStorageSync(STUDY_RECORDS_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (e) {
    console.error('[StudyService] 获取学习记录失败:', e)
    return []
  }
}

// 保存学习记录
export const saveStudyRecords = (records) => {
  uni.setStorageSync(STUDY_RECORDS_KEY, JSON.stringify(records))
}

// 添加学习记录
export const addStudyRecord = (recordData) => {
  const memberId = getCurrentMemberId()
  const member = getCurrentMember()
  const record = {
    id: 'study_' + Date.now(),
    createdBy: memberId,
    createdAt: new Date().toISOString(),
    date: new Date().toISOString().split('T')[0],  // YYYY-MM-DD
    duration: recordData.duration || 0,  // 时长(分钟)
    scene: recordData.scene || 'library',
    task: recordData.task || '',
    completed: recordData.completed || false,
    ...recordData
  }
  
  const records = getStudyRecords()
  records.unshift(record)
  
  // 只保留最近200条
  if (records.length > 200) {
    saveStudyRecords(records.slice(0, 200))
  } else {
    saveStudyRecords(records)
  }
  
  // 更新连续学习天数
  updateStudyStreak()
  
  return record
}

// 获取今日学习统计
export const getTodayStudyStats = () => {
  const today = new Date().toISOString().split('T')[0]
  const records = getStudyRecords()
  const todayRecords = records.filter(r => r.date === today && r.completed)
  
  return {
    totalMinutes: todayRecords.reduce((sum, r) => sum + (r.duration || 0), 0),
    sessionCount: todayRecords.length,
    currentStreak: getCurrentStreak()
  }
}

// 获取本周学习统计
export const getWeekStudyStats = () => {
  const records = getStudyRecords()
  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - now.getDay())
  weekStart.setHours(0, 0, 0, 0)
  
  const weekRecords = records.filter(r => {
    const recordDate = new Date(r.date)
    return recordDate >= weekStart && r.completed
  })
  
  // 按天统计
  const dailyStats = {}
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart)
    date.setDate(weekStart.getDate() + i)
    const dateStr = date.toISOString().split('T')[0]
    dailyStats[dateStr] = { minutes: 0, count: 0 }
  }
  
  weekRecords.forEach(r => {
    if (dailyStats[r.date]) {
      dailyStats[r.date].minutes += r.duration || 0
      dailyStats[r.date].count++
    }
  })
  
  return {
    dailyStats,
    totalMinutes: weekRecords.reduce((sum, r) => sum + (r.duration || 0), 0),
    totalSessions: weekRecords.length
  }
}

// 获取总学习分钟数
export const getTotalStudyMinutes = () => {
  const records = getStudyRecords()
  return records.reduce((sum, r) => sum + (r.duration || 0), 0)
}

// ============ 学习连续天数 ============

// 获取连续学习天数
export const getCurrentStreak = () => {
  try {
    const stored = uni.getStorageSync(STUDY_STREAK_KEY)
    return stored ? JSON.parse(stored) : { current: 0, lastDate: null }
  } catch (e) {
    return { current: 0, lastDate: null }
  }
}

// 更新学习连续天数
export const updateStudyStreak = () => {
  const streak = getCurrentStreak()
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]
  
  if (streak.lastDate === today) {
    // 今天已经记录
    return streak
  } else if (streak.lastDate === yesterdayStr) {
    // 昨天学习了，今天继续
    streak.current++
    streak.lastDate = today
  } else {
    // 中断了，重新开始
    streak.current = 1
    streak.lastDate = today
  }
  
  uni.setStorageSync(STUDY_STREAK_KEY, JSON.stringify(streak))
  return streak
}

// ============ 学习配置 ============

// 获取学习配置
export const getStudyConfig = () => {
  try {
    const stored = uni.getStorageSync(STUDY_CONFIG_KEY)
    return stored ? { ...DEFAULT_STUDY_CONFIG, ...JSON.parse(stored) } : DEFAULT_STUDY_CONFIG
  } catch (e) {
    return DEFAULT_STUDY_CONFIG
  }
}

// 保存学习配置
export const saveStudyConfig = (config) => {
  uni.setStorageSync(STUDY_CONFIG_KEY, JSON.stringify(config))
}

// ============ 导出 ============

export default {
  // Study Records
  getStudyRecords,
  saveStudyRecords,
  addStudyRecord,
  getTodayStudyStats,
  getWeekStudyStats,
  getTotalStudyMinutes,
  
  // Streak
  getCurrentStreak,
  updateStudyStreak,
  
  // Config
  getStudyConfig,
  saveStudyConfig
}
