/**
 * Time Management Service
 * 负责日程管理、番茄钟、习惯追踪和时间统计
 */

import { getCurrentMemberId, getCurrentMember, getFamilyMembers } from './familyService'

// Storage keys
const SCHEDULES_KEY = 'time_schedules'
const POMODORO_RECORDS_KEY = 'pomodoro_records'
const HABITS_KEY = 'time_habits'
const HABIT_RECORDS_KEY = 'habit_records'
const TIME_TRACKING_KEY = 'time_tracking'

// Default settings
const DEFAULT_POMODORO_CONFIG = {
  workDuration: 25,      // 工作时长(分钟)
  shortBreak: 5,          // 短休息时长(分钟)
  longBreak: 15,         // 长休息时长(分钟)
  longBreakInterval: 4    // 多久进行长休息(次)
}

// ============ 日程管理 ============

// 获取日程列表
export const getSchedules = () => {
  try {
    const stored = uni.getStorageSync(SCHEDULES_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (e) {
    console.error('[TimeService] 获取日程失败:', e)
    return []
  }
}

// 保存日程列表
export const saveSchedules = (schedules) => {
  uni.setStorageSync(SCHEDULES_KEY, JSON.stringify(schedules))
}

// 创建日程
export const createSchedule = (scheduleData) => {
  const memberId = getCurrentMemberId()
  const schedule = {
    id: 'schedule_' + Date.now(),
    createdBy: memberId,
    createdAt: new Date().toISOString(),
    title: scheduleData.title || '',
    description: scheduleData.description || '',
    startTime: scheduleData.startTime || '',  // HH:MM
    endTime: scheduleData.endTime || '',      // HH:MM
    date: scheduleData.date || '',            // YYYY-MM-DD
    type: scheduleData.type || 'general',     // general, study, exercise, rest
    reminder: scheduleData.reminder || null,  // 提醒时间
    completed: false,
    ...scheduleData
  }
  
  const schedules = getSchedules()
  schedules.push(schedule)
  saveSchedules(schedules)
  
  return schedule
}

// 更新日程
export const updateSchedule = (scheduleId, updates) => {
  const schedules = getSchedules()
  const index = schedules.findIndex(s => s.id === scheduleId)
  
  if (index === -1) {
    throw new Error('日程不存在')
  }
  
  schedules[index] = { ...schedules[index], ...updates }
  saveSchedules(schedules)
  
  return schedules[index]
}

// 删除日程
export const deleteSchedule = (scheduleId) => {
  const schedules = getSchedules()
  const filtered = schedules.filter(s => s.id !== scheduleId)
  saveSchedules(filtered)
}

// 获取指定日期的日程
export const getSchedulesByDate = (date) => {
  const schedules = getSchedules()
  return schedules
    .filter(s => s.date === date)
    .sort((a, b) => {
      if (!a.startTime || !b.startTime) return 0
      return a.startTime.localeCompare(b.startTime)
    })
}

// 完成任务
export const completeSchedule = (scheduleId) => {
  return updateSchedule(scheduleId, {
    completed: true,
    completedAt: new Date().toISOString()
  })
}

// ============ 番茄钟 ============

// 获取番茄钟配置
export const getPomodoroConfig = () => {
  try {
    const stored = uni.getStorageSync('pomodoro_config')
    return stored ? { ...DEFAULT_POMODORO_CONFIG, ...JSON.parse(stored) } : DEFAULT_POMODORO_CONFIG
  } catch (e) {
    return DEFAULT_POMODORO_CONFIG
  }
}

// 保存番茄钟配置
export const savePomodoroConfig = (config) => {
  uni.setStorageSync('pomodoro_config', JSON.stringify(config))
}

// 获取番茄钟记录
export const getPomodoroRecords = () => {
  try {
    const stored = uni.getStorageSync(POMODORO_RECORDS_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (e) {
    console.error('[TimeService] 获取番茄钟记录失败:', e)
    return []
  }
}

// 保存番茄钟记录
export const savePomodoroRecords = (records) => {
  uni.setStorageSync(POMODORO_RECORDS_KEY, JSON.stringify(records))
}

// 添加番茄钟记录
export const addPomodoroRecord = (recordData) => {
  const memberId = getCurrentMemberId()
  const record = {
    id: 'pom_' + Date.now(),
    createdBy: memberId,
    createdAt: new Date().toISOString(),
    date: new Date().toISOString().split('T')[0],  // YYYY-MM-DD
    duration: recordData.duration || 25,  // 时长(分钟)
    type: recordData.type || 'work',      // work, break
    completed: recordData.completed || false,
    taskTitle: recordData.taskTitle || '',
    ...recordData
  }
  
  const records = getPomodoroRecords()
  records.unshift(record)
  
  // 只保留最近100条
  if (records.length > 100) {
    savePomodoroRecords(records.slice(0, 100))
  } else {
    savePomodoroRecords(records)
  }
  
  return record
}

// 获取今日番茄统计
export const getTodayPomodoroStats = () => {
  const today = new Date().toISOString().split('T')[0]
  const records = getPomodoroRecords()
  const todayRecords = records.filter(r => r.date === today && r.type === 'work' && r.completed)
  
  return {
    completedCount: todayRecords.length,
    totalMinutes: todayRecords.reduce((sum, r) => sum + (r.duration || 0), 0)
  }
}

// 获取本周番茄统计
export const getWeekPomodoroStats = () => {
  const records = getPomodoroRecords()
  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - now.getDay())
  weekStart.setHours(0, 0, 0, 0)
  
  const weekRecords = records.filter(r => {
    const recordDate = new Date(r.date)
    return recordDate >= weekStart && r.type === 'work' && r.completed
  })
  
  // 按天统计
  const dailyStats = {}
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart)
    date.setDate(weekStart.getDate() + i)
    const dateStr = date.toISOString().split('T')[0]
    dailyStats[dateStr] = { count: 0, minutes: 0 }
  }
  
  weekRecords.forEach(r => {
    if (dailyStats[r.date]) {
      dailyStats[r.date].count++
      dailyStats[r.date].minutes += r.duration || 0
    }
  })
  
  return {
    dailyStats,
    totalCount: weekRecords.length,
    totalMinutes: weekRecords.reduce((sum, r) => sum + (r.duration || 0), 0)
  }
}

// ============ 习惯追踪 ============

// 获取习惯列表
export const getHabits = () => {
  try {
    const stored = uni.getStorageSync(HABITS_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (e) {
    console.error('[TimeService] 获取习惯失败:', e)
    return []
  }
}

// 保存习惯列表
export const saveHabits = (habits) => {
  uni.setStorageSync(HABITS_KEY, JSON.stringify(habits))
}

// 创建习惯
export const createHabit = (habitData) => {
  const memberId = getCurrentMemberId()
  const habit = {
    id: 'habit_' + Date.now(),
    createdBy: memberId,
    createdAt: new Date().toISOString(),
    title: habitData.title || '',
    description: habitData.description || '',
    icon: habitData.icon || '⭐',
    frequency: habitData.frequency || 'daily',  // daily, weekly
    targetDays: habitData.targetDays || [],     // 每周目标天数 [0-6]
    reminderTime: habitData.reminderTime || null,
    color: habitData.color || '#8477fa',
    enabled: true,
    ...habitData
  }
  
  const habits = getHabits()
  habits.push(habit)
  saveHabits(habits)
  
  return habit
}

// 更新习惯
export const updateHabit = (habitId, updates) => {
  const habits = getHabits()
  const index = habits.findIndex(h => h.id === habitId)
  
  if (index === -1) {
    throw new Error('习惯不存在')
  }
  
  habits[index] = { ...habits[index], ...updates }
  saveHabits(habits)
  
  return habits[index]
}

// 删除习惯
export const deleteHabit = (habitId) => {
  const habits = getHabits()
  const filtered = habits.filter(h => h.id !== habitId)
  saveHabits(filtered)
}

// 获取习惯打卡记录
export const getHabitRecords = () => {
  try {
    const stored = uni.getStorageSync(HABIT_RECORDS_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (e) {
    console.error('[TimeService] 获取习惯记录失败:', e)
    return []
  }
}

// 保存习惯记录
export const saveHabitRecords = (records) => {
  uni.setStorageSync(HABIT_RECORDS_KEY, JSON.stringify(records))
}

// 打卡习惯
export const checkInHabit = (habitId, date = null) => {
  const targetDate = date || new Date().toISOString().split('T')[0]
  const records = getHabitRecords()
  
  // 检查是否已打卡
  const existing = records.find(r => r.habitId === habitId && r.date === targetDate)
  if (existing) {
    return existing
  }
  
  const record = {
    id: 'habit_record_' + Date.now(),
    habitId,
    date: targetDate,
    checkedAt: new Date().toISOString()
  }
  
  records.unshift(record)
  saveHabitRecords(records)
  
  return record
}

// 取消打卡
export const uncheckHabit = (habitId, date = null) => {
  const targetDate = date || new Date().toISOString().split('T')[0]
  const records = getHabitRecords()
  const filtered = records.filter(r => !(r.habitId === habitId && r.date === targetDate))
  saveHabitRecords(filtered)
}

// 获取习惯的连续打卡天数
export const getHabitStreak = (habitId) => {
  const records = getHabitRecords()
  const habitRecords = records
    .filter(r => r.habitId === habitId)
    .map(r => r.date)
    .sort()
    .reverse()
  
  if (habitRecords.length === 0) return 0
  
  let streak = 0
  const today = new Date()
  let checkDate = new Date(today)
  
  // 检查今天是否打卡
  const todayStr = today.toISOString().split('T')[0]
  const yesterdayStr = new Date(today.setDate(today.getDate() - 1)).toISOString().split('T')[0]
  
  if (habitRecords[0] === todayStr) {
    streak = 1
    checkDate = new Date(today.setDate(today.getDate() - 1))
  } else if (habitRecords[0] === yesterdayStr) {
    // 昨天打卡了，从昨天开始算
    streak = 1
    checkDate = new Date(today.setDate(today.getDate() - 1))
  } else {
    return 0
  }
  
  // 向前计算连续天数
  for (let i = 1; i < habitRecords.length; i++) {
    const expectedDate = new Date(checkDate)
    expectedDate.setDate(checkDate.getDate() - 1)
    const expectedStr = expectedDate.toISOString().split('T')[0]
    
    if (habitRecords[i] === expectedStr) {
      streak++
      checkDate = expectedDate
    } else {
      break
    }
  }
  
  return streak
}

// 获取指定日期的习惯打卡情况
export const getHabitRecordsByDate = (date) => {
  const records = getHabitRecords()
  return records.filter(r => r.date === date)
}

// ============ 时间追踪 ============

// 获取时间追踪数据
export const getTimeTracking = () => {
  try {
    const stored = uni.getStorageSync(TIME_TRACKING_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch (e) {
    console.error('[TimeService] 获取时间追踪失败:', e)
    return {}
  }
}

// 开始追踪任务时间
export const startTimeTracking = (taskId, taskTitle) => {
  const memberId = getCurrentMemberId()
  const tracking = getTimeTracking()
  
  tracking[taskId] = {
    taskId,
    taskTitle,
    startTime: new Date().toISOString(),
    createdBy: memberId
  }
  
  uni.setStorageSync(TIME_TRACKING_KEY, JSON.stringify(tracking))
  return tracking[taskId]
}

// 停止追踪并记录
export const stopTimeTracking = (taskId) => {
  const tracking = getTimeTracking()
  const record = tracking[taskId]
  
  if (!record) return null
  
  const endTime = new Date()
  const startTime = new Date(record.startTime)
  const duration = Math.round((endTime - startTime) / 60000)  // 分钟
  
  // 保存到习惯记录（作为时间块）
  const records = getHabitRecords()
  records.unshift({
    id: 'time_record_' + Date.now(),
    type: 'time_block',
    taskId: record.taskId,
    taskTitle: record.taskTitle,
    date: new Date().toISOString().split('T')[0],
    startTime: record.startTime,
    endTime: endTime.toISOString(),
    duration,
    createdBy: record.createdBy
  })
  
  // 只保留最近500条
  if (records.length > 500) {
    saveHabitRecords(records.slice(0, 500))
  }
  
  // 清除追踪
  delete tracking[taskId]
  uni.setStorageSync(TIME_TRACKING_KEY, JSON.stringify(tracking))
  
  return { duration, startTime: record.startTime, endTime: endTime.toISOString() }
}

// 获取正在追踪的任务
export const getActiveTracking = () => {
  const tracking = getTimeTracking()
  return Object.values(tracking)
}

// 获取时间使用分析
export const getTimeAnalytics = (startDate, endDate) => {
  const records = getHabitRecords()
  const filtered = records.filter(r => {
    if (!r.date) return false
    return r.date >= startDate && r.date <= endDate
  })
  
  // 按任务标题统计
  const taskStats = {}
  filtered.forEach(r => {
    if (r.taskTitle) {
      if (!taskStats[r.taskTitle]) {
        taskStats[r.taskTitle] = { count: 0, totalMinutes: 0 }
      }
      taskStats[r.taskTitle].count++
      taskStats[r.taskTitle].totalMinutes += r.duration || 0
    }
  })
  
  // 按日期统计
  const dateStats = {}
  filtered.forEach(r => {
    if (r.date) {
      if (!dateStats[r.date]) {
        dateStats[r.date] = 0
      }
      dateStats[r.date] += r.duration || 0
    }
  })
  
  return {
    taskStats,
    dateStats,
    totalMinutes: filtered.reduce((sum, r) => sum + (r.duration || 0), 0),
    totalBlocks: filtered.length
  }
}

// ============ 导出 ============

export default {
  // Schedule
  getSchedules,
  saveSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  getSchedulesByDate,
  completeSchedule,
  
  // Pomodoro
  getPomodoroConfig,
  savePomodoroConfig,
  getPomodoroRecords,
  addPomodoroRecord,
  getTodayPomodoroStats,
  getWeekPomodoroStats,
  
  // Habits
  getHabits,
  saveHabits,
  createHabit,
  updateHabit,
  deleteHabit,
  getHabitRecords,
  getHabitRecordsByDate,
  checkInHabit,
  uncheckHabit,
  getHabitStreak,
  
  // Time Tracking
  getTimeTracking,
  startTimeTracking,
  stopTimeTracking,
  getActiveTracking,
  getTimeAnalytics
}
