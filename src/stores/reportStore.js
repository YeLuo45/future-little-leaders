// src/stores/reportStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'

// localStorage keys
const WEEKLY_REPORTS_KEY = 'weekly_reports'
const MONTHLY_REPORTS_KEY = 'monthly_reports'

export const useReportStore = defineStore('report', () => {
  const weeklyReports = ref([])
  const monthlyReports = ref([])

  // 获取当前周次 ISO 格式
  const getCurrentWeek = () => {
    const now = new Date()
    const year = new Date(now.getFullYear(), 0, 1)
    // 计算 ISO 周数
    const days = Math.ceil(((now - year) / 86400000 + year.getDay() + 1) / 7)
    return `${now.getFullYear()}-W${String(days).padStart(2, '0')}`
  }

  // 获取本周开始和结束日期
  const getWeekDates = (weekStr) => {
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

  // 生成周报
  const generateWeeklyReport = (taskRecords, pointsRecords, babyId) => {
    const week = getCurrentWeek()
    const { startDate, endDate } = getWeekDates(week)

    // 过滤本周数据
    const weekTasks = taskRecords.filter(t => {
      if (!t.completedAt) return false
      const taskDate = new Date(t.completedAt).toISOString().split('T')[0]
      return taskDate >= startDate && taskDate <= endDate
    })

    const weekPoints = pointsRecords.filter(p => {
      if (!p.createdAt) return false
      const pointDate = new Date(p.createdAt).toISOString().split('T')[0]
      return pointDate >= startDate && pointDate <= endDate
    })

    // 计算连续打卡天数
    const streakDays = calculateStreak(taskRecords, endDate)

    const report = {
      week,
      startDate,
      endDate,
      tasksCompleted: weekTasks.length,
      tasksTotal: weekTasks.length,
      pointsEarned: weekPoints.filter(p => p.type === 'earn').reduce((sum, p) => sum + (p.amount || 0), 0),
      pointsSpent: weekPoints.filter(p => p.type === 'spend').reduce((sum, p) => sum + (p.amount || 0), 0),
      streakDays,
      topTags: [],
      babyProgress: {}
    }

    // 按宝宝统计
    if (babyId) {
      const babyTasks = weekTasks.filter(t => t.babyId === babyId)
      report.babyProgress = {
        [babyId]: {
          tasksCompleted: babyTasks.length,
          level: 1
        }
      }
    }

    // 检查是否已存在
    const existingIndex = weeklyReports.value.findIndex(r => r.week === week)
    if (existingIndex >= 0) {
      weeklyReports.value[existingIndex] = report
    } else {
      weeklyReports.value.push(report)
    }

    save()
    return report
  }

  // 生成月报
  const generateMonthlyReport = (taskRecords, pointsRecords) => {
    const now = new Date()
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const startDate = `${month}-01`
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    const endDate = `${month}-${String(lastDay).padStart(2, '0')}`

    // 过滤当月数据
    const monthTasks = taskRecords.filter(t => {
      if (!t.completedAt) return false
      const taskDate = new Date(t.completedAt).toISOString().split('T')[0]
      return taskDate >= startDate && taskDate <= endDate
    })

    const monthPoints = pointsRecords.filter(p => {
      if (!p.createdAt) return false
      const pointDate = new Date(p.createdAt).toISOString().split('T')[0]
      return pointDate >= startDate && pointDate <= endDate
    })

    // 计算最长连续天数
    const longestStreak = calculateLongestStreak(taskRecords)

    const report = {
      month,
      startDate,
      endDate,
      tasksCompleted: monthTasks.length,
      pointsEarned: monthPoints.filter(p => p.type === 'earn').reduce((sum, p) => sum + (p.amount || 0), 0),
      pointsSpent: monthPoints.filter(p => p.type === 'spend').reduce((sum, p) => sum + (p.amount || 0), 0),
      longestStreak,
      achievementsUnlocked: 0,
      babyProgress: {}
    }

    // 检查是否已存在
    const existingIndex = monthlyReports.value.findIndex(r => r.month === month)
    if (existingIndex >= 0) {
      monthlyReports.value[existingIndex] = report
    } else {
      monthlyReports.value.push(report)
    }

    save()
    return report
  }

  // 计算连续打卡天数
  const calculateStreak = (taskRecords, endDate) => {
    if (!taskRecords || taskRecords.length === 0) return 0

    // 获取有完成任务的日期列表
    const completedDates = [...new Set(
      taskRecords
        .filter(t => t.completedAt)
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

  // 计算最长连续天数
  const calculateLongestStreak = (taskRecords) => {
    if (!taskRecords || taskRecords.length === 0) return 0

    const completedDates = [...new Set(
      taskRecords
        .filter(t => t.completedAt)
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

  // 获取本周报告
  const getCurrentWeeklyReport = () => {
    const week = getCurrentWeek()
    return weeklyReports.value.find(r => r.week === week)
  }

  // 获取历史周报（排除本周）
  const getHistoryWeeklyReports = () => {
    const currentWeek = getCurrentWeek()
    return weeklyReports.value
      .filter(r => r.week !== currentWeek)
      .sort((a, b) => b.week.localeCompare(a.week))
  }

  // 保存
  const save = () => {
    uni.setStorageSync(WEEKLY_REPORTS_KEY, JSON.stringify(weeklyReports.value))
    uni.setStorageSync(MONTHLY_REPORTS_KEY, JSON.stringify(monthlyReports.value))
  }

  // 初始化
  const init = () => {
    try {
      const weekly = uni.getStorageSync(WEEKLY_REPORTS_KEY)
      const monthly = uni.getStorageSync(MONTHLY_REPORTS_KEY)
      weeklyReports.value = weekly ? JSON.parse(weekly) : []
      monthlyReports.value = monthly ? JSON.parse(monthly) : []
    } catch (e) {
      weeklyReports.value = []
      monthlyReports.value = []
    }
  }

  return {
    weeklyReports,
    monthlyReports,
    getCurrentWeek,
    getWeekDates,
    generateWeeklyReport,
    generateMonthlyReport,
    getCurrentWeeklyReport,
    getHistoryWeeklyReports,
    init
  }
})
