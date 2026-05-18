/**
 * V52 Sleep & Wellness Tracker Store
 * 睡眠与健康追踪 Store - 睡眠记录、睡眠质量分析、健康报告、wellness习惯
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import wellnessService from '@/services/wellnessService.js'

export const useWellnessStore = defineStore('wellness', () => {
  // =========================================================================
  // 状态
  // =========================================================================
  
  // 睡眠记录
  const sleepLogs = ref([])
  const todaySleep = ref(null)
  const weekSleepLogs = ref([])
  const monthSleepLogs = ref([])
  
  // 睡眠连续
  const sleepStreak = ref({ currentStreak: 0, longestStreak: 0, lastSleepDate: '' })
  
  // 睡眠报告
  const currentReport = ref(null)
  
  // 健康习惯
  const todayWater = ref({ date: '', glasses: 0, totalMl: 0 })
  const todayEyeBreaks = ref(0)
  const todayPosture = ref({ date: '', goodCount: 0, badCount: 0 })
  
  // UI状态
  const currentTab = ref('sleep') // sleep | habits | report
  const selectedDate = ref(new Date().toISOString().split('T')[0])
  
  // =========================================================================
  // 初始化
  // =========================================================================
  
  const init = () => {
    loadSleepLogs()
    loadTodaySleep()
    loadWeekSleepLogs()
    loadMonthSleepLogs()
    loadSleepStreak()
    loadTodayWater()
    loadTodayEyeBreaks()
    loadTodayPosture()
    generateReport()
  }
  
  // =========================================================================
  // 加载方法
  // =========================================================================
  
  const loadSleepLogs = () => {
    sleepLogs.value = wellnessService.getSleepLogs()
  }
  
  const loadTodaySleep = () => {
    todaySleep.value = wellnessService.getTodaySleepLog()
  }
  
  const loadWeekSleepLogs = () => {
    weekSleepLogs.value = wellnessService.getWeekSleepLogs()
  }
  
  const loadMonthSleepLogs = () => {
    monthSleepLogs.value = wellnessService.getMonthSleepLogs()
  }
  
  const loadSleepStreak = () => {
    sleepStreak.value = wellnessService.getSleepStreak()
  }
  
  const loadTodayWater = () => {
    todayWater.value = wellnessService.getTodayWaterLog()
  }
  
  const loadTodayEyeBreaks = () => {
    todayEyeBreaks.value = wellnessService.getTodayEyeBreaks()
  }
  
  const loadTodayPosture = () => {
    todayPosture.value = wellnessService.getTodayPostureLog()
  }
  
  // =========================================================================
  // 计算属性
  // =========================================================================
  
  const weekStats = computed(() => {
    const logs = weekSleepLogs.value
    if (logs.length === 0) {
      return { totalDuration: 0, avgQuality: 0, avgDuration: 0 }
    }
    
    const totalDuration = logs.reduce((sum, l) => sum + (l.duration || 0), 0)
    const totalQuality = logs.reduce((sum, l) => sum + (l.qualityScore || 0), 0)
    
    return {
      totalDuration,
      avgQuality: Math.round(totalQuality / logs.length),
      avgDuration: (totalDuration / logs.length).toFixed(1),
      nights: logs.length
    }
  })
  
  const monthStats = computed(() => {
    const logs = monthSleepLogs.value
    if (logs.length === 0) {
      return { totalDuration: 0, avgQuality: 0, avgDuration: 0 }
    }
    
    const totalDuration = logs.reduce((sum, l) => sum + (l.duration || 0), 0)
    const totalQuality = logs.reduce((sum, l) => sum + (l.qualityScore || 0), 0)
    
    return {
      totalDuration,
      avgQuality: Math.round(totalQuality / logs.length),
      avgDuration: (totalDuration / logs.length).toFixed(1),
      nights: logs.length
    }
  })
  
  const sleepQualityLevel = computed(() => {
    if (!todaySleep.value) return null
    return wellnessService.getSleepQuality(todaySleep.value.qualityScore)
  })
  
  const waterGoalProgress = computed(() => {
    const goal = 2000 // 8杯水 * 250ml
    return Math.min(100, Math.round((todayWater.value.totalMl / goal) * 100))
  })
  
  const eyeBreakGoalProgress = computed(() => {
    const goal = 6 // 每小时休息一次，6小时学习
    return Math.min(100, Math.round((todayEyeBreaks.value / goal) * 100))
  })
  
  const postureScore = computed(() => {
    const total = todayPosture.value.goodCount + todayPosture.value.badCount
    if (total === 0) return 100
    return Math.round((todayPosture.value.goodCount / total) * 100)
  })
  
  const integrationStatus = computed(() => {
    return wellnessService.checkWellnessIntegration()
  })
  
  const todayTip = computed(() => {
    return wellnessService.getRandomWellnessTip()
  })
  
  // =========================================================================
  // 睡眠记录操作
  // =========================================================================
  
  const addSleepLog = (logData) => {
    const duration = calculateSleepDuration(logData.bedtime, logData.wakeupTime)
    const qualityScore = calculateQualityScore(duration, logData.quality)
    
    const log = {
      ...logData,
      date: new Date().toISOString().split('T')[0],
      duration,
      qualityScore,
      points: wellnessService.calculateSleepPoints({ ...logData, duration, qualityScore })
    }
    
    const success = wellnessService.saveSleepLog(log)
    if (success) {
      loadSleepLogs()
      loadTodaySleep()
      loadWeekSleepLogs()
      loadMonthSleepLogs()
      loadSleepStreak()
      generateReport()
    }
    return success
  }
  
  const removeSleepLog = (id) => {
    const success = wellnessService.deleteSleepLog(id)
    if (success) {
      loadSleepLogs()
      loadTodaySleep()
      loadWeekSleepLogs()
      loadMonthSleepLogs()
      loadSleepStreak()
      generateReport()
    }
    return success
  }
  
  const calculateSleepDuration = (bedtime, wakeupTime) => {
    const bed = new Date(bedtime)
    const wake = new Date(wakeupTime)
    let diff = (wake - bed) / (1000 * 60 * 60) // 小时
    
    // 如果 wakeupTime 在 bedtime 之前，说明跨天
    if (diff < 0) {
      diff += 24
    }
    
    return parseFloat(diff.toFixed(1))
  }
  
  const calculateQualityScore = (duration, quality) => {
    let score = 0
    
    // 时长评分 (40%)
    if (duration >= 8 && duration <= 9) score += 40
    else if (duration >= 7 && duration < 8) score += 35
    else if (duration >= 9 && duration <= 10) score += 35
    else if (duration >= 6 && duration < 7) score += 25
    else score += 15
    
    // 主观质量评分 (60%)
    const qualityMap = { excellent: 60, good: 50, fair: 40, poor: 20 }
    score += qualityMap[quality] || 40
    
    return Math.min(100, score)
  }
  
  // =========================================================================
  // 健康习惯操作
  // =========================================================================
  
  const addWater = (amount = 250) => {
    const result = wellnessService.addWaterLog(amount)
    if (result) {
      loadTodayWater()
    }
    return result
  }
  
  const addEyeBreak = () => {
    const result = wellnessService.addEyeBreakLog()
    if (result) {
      loadTodayEyeBreaks()
    }
    return result
  }
  
  const addPosture = (good = true) => {
    const result = wellnessService.addPostureLog(good)
    if (result) {
      loadTodayPosture()
    }
    return result
  }
  
  // =========================================================================
  // 报告生成
  // =========================================================================
  
  const generateReport = () => {
    const period = currentTab.value === 'sleep' ? 'week' : 'month'
    const logs = period === 'week' ? weekSleepLogs.value : monthSleepLogs.value
    currentReport.value = wellnessService.generateSleepReport(logs)
  }
  
  const changeReportPeriod = (period) => {
    if (period === 'week') {
      currentReport.value = wellnessService.generateSleepReport(weekSleepLogs.value)
    } else {
      currentReport.value = wellnessService.generateSleepReport(monthSleepLogs.value)
    }
  }
  
  // =========================================================================
  // 数据导出
  // =========================================================================
  
  const exportData = () => {
    return wellnessService.exportWellnessData()
  }
  
  // =========================================================================
  // 工具方法
  // =========================================================================
  
  const formatDuration = (hours) => {
    const h = Math.floor(hours)
    const m = Math.round((hours - h) * 60)
    if (m === 0) return `${h}小时`
    return `${h}小时${m}分钟`
  }
  
  const formatTime = (timeString) => {
    const date = new Date(timeString)
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  }
  
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return `${date.getMonth() + 1}月${date.getDate()}日`
  }
  
  return {
    // 状态
    sleepLogs,
    todaySleep,
    weekSleepLogs,
    monthSleepLogs,
    sleepStreak,
    currentReport,
    todayWater,
    todayEyeBreaks,
    todayPosture,
    currentTab,
    selectedDate,
    
    // 计算属性
    weekStats,
    monthStats,
    sleepQualityLevel,
    waterGoalProgress,
    eyeBreakGoalProgress,
    postureScore,
    integrationStatus,
    todayTip,
    
    // 方法
    init,
    loadSleepLogs,
    loadTodaySleep,
    loadWeekSleepLogs,
    loadMonthSleepLogs,
    loadSleepStreak,
    loadTodayWater,
    loadTodayEyeBreaks,
    loadTodayPosture,
    
    // 睡眠操作
    addSleepLog,
    removeSleepLog,
    calculateSleepDuration,
    calculateQualityScore,
    
    // 健康习惯操作
    addWater,
    addEyeBreak,
    addPosture,
    
    // 报告
    generateReport,
    changeReportPeriod,
    
    // 导出
    exportData,
    
    // 工具
    formatDuration,
    formatTime,
    formatDate
  }
})
