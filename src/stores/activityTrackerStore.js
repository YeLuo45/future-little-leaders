/**
 * V48 Physical Activity Tracker Store
 * 运动追踪与健康管理系统 Store - 运动打卡、运动数据统计、健康报告、运动会和运动挑战
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import activityTrackerService from '@/services/activityTrackerService.js'

export const useActivityTrackerStore = defineStore('activityTracker', () => {
  // =========================================================================
  // 状态
  // =========================================================================
  
  // 运动打卡记录
  const activityLogs = ref([])
  const todayLogs = ref([])
  const weekLogs = ref([])
  
  // 目标
  const dailyGoal = ref({ duration: 60, calories: 300, steps: 10000 })
  const weeklyGoal = ref({ days: 5, totalDuration: 300, totalCalories: 2000 })
  
  // 连续打卡
  const activityStreak = ref({ currentStreak: 0, longestStreak: 0, lastCheckIn: '' })
  
  // 运动会
  const sportsEvents = ref([])
  
  // 组队挑战
  const challengeTeams = ref([])
  
  // 健康报告
  const healthReports = ref([])
  const currentReport = ref(null)
  
  // UI 状态
  const currentTab = ref('log') // log | challenges | report
  const selectedDate = ref(new Date().toISOString().split('T')[0])
  
  // =========================================================================
  // 初始化
  // =========================================================================
  
  const init = () => {
    loadActivityLogs()
    loadTodayLogs()
    loadWeekLogs()
    loadDailyGoal()
    loadWeeklyGoal()
    loadActivityStreak()
    loadSportsEvents()
    loadChallengeTeams()
    loadHealthReports()
  }
  
  // =========================================================================
  // 加载方法
  // =========================================================================
  
  const loadActivityLogs = () => {
    activityLogs.value = activityTrackerService.getActivityLogs()
  }
  
  const loadTodayLogs = () => {
    todayLogs.value = activityTrackerService.getTodayLogs()
  }
  
  const loadWeekLogs = () => {
    weekLogs.value = activityTrackerService.getWeekLogs()
  }
  
  const loadDailyGoal = () => {
    dailyGoal.value = activityTrackerService.getDailyGoal()
  }
  
  const loadWeeklyGoal = () => {
    weeklyGoal.value = activityTrackerService.getWeeklyGoal()
  }
  
  const loadActivityStreak = () => {
    activityStreak.value = activityTrackerService.getActivityStreak()
  }
  
  const loadSportsEvents = () => {
    sportsEvents.value = activityTrackerService.getSportsEvents()
  }
  
  const loadChallengeTeams = () => {
    challengeTeams.value = activityTrackerService.getChallengeTeams()
  }
  
  const loadHealthReports = () => {
    healthReports.value = activityTrackerService.getHealthReports()
  }
  
  // =========================================================================
  // 运动打卡方法
  // =========================================================================
  
  const addActivityLog = (logData) => {
    const newLog = activityTrackerService.addActivityLog(logData)
    if (newLog) {
      loadActivityLogs()
      loadTodayLogs()
      loadWeekLogs()
      loadActivityStreak()
      return newLog
    }
    return null
  }
  
  const deleteActivityLog = (logId) => {
    const success = activityTrackerService.deleteActivityLog(logId)
    if (success) {
      loadActivityLogs()
      loadTodayLogs()
      loadWeekLogs()
    }
    return success
  }
  
  const setDailyGoal = (goal) => {
    const success = activityTrackerService.setDailyGoal(goal)
    if (success) loadDailyGoal()
    return success
  }
  
  const setWeeklyGoal = (goal) => {
    const success = activityTrackerService.setWeeklyGoal(goal)
    if (success) loadWeeklyGoal()
    return success
  }
  
  // =========================================================================
  // 运动会方法
  // =========================================================================
  
  const joinSportsEvent = (eventId) => {
    const success = activityTrackerService.joinSportsEvent(eventId)
    if (success) loadSportsEvents()
    return success
  }
  
  const leaveSportsEvent = (eventId) => {
    const success = activityTrackerService.leaveSportsEvent(eventId)
    if (success) loadSportsEvents()
    return success
  }
  
  // =========================================================================
  // 组队挑战方法
  // =========================================================================
  
  const createChallengeTeam = (teamData) => {
    const newTeam = activityTrackerService.createChallengeTeam(teamData)
    if (newTeam) {
      loadChallengeTeams()
      return newTeam
    }
    return null
  }
  
  const joinChallengeTeam = (teamId) => {
    const success = activityTrackerService.joinChallengeTeam(teamId)
    if (success) loadChallengeTeams()
    return success
  }
  
  const updateTeamProgress = (teamId, challengeId, progress) => {
    const success = activityTrackerService.updateTeamProgress(teamId, challengeId, progress)
    if (success) loadChallengeTeams()
    return success
  }
  
  // =========================================================================
  // 健康报告方法
  // =========================================================================
  
  const generateHealthReport = () => {
    const report = activityTrackerService.generateHealthReport()
    if (report) {
      loadHealthReports()
      currentReport.value = report
      return report
    }
    return null
  }
  
  // =========================================================================
  // 微信运动同步
  // =========================================================================
  
  const syncWechatSports = async () => {
    return await activityTrackerService.syncWechatSports()
  }
  
  // =========================================================================
  // 手环数据导入
  // =========================================================================
  
  const importBandData = (data) => {
    const success = activityTrackerService.importBandData(data)
    if (success) {
      loadActivityLogs()
      loadTodayLogs()
      loadWeekLogs()
    }
    return success
  }
  
  // =========================================================================
  // 计算属性
  // =========================================================================
  
  // 今日统计
  const todayStats = computed(() => {
    return {
      totalDuration: todayLogs.value.reduce((sum, log) => sum + (log.duration || 0), 0),
      totalCalories: todayLogs.value.reduce((sum, log) => sum + (log.calories || 0), 0),
      totalDistance: todayLogs.value.reduce((sum, log) => sum + (log.distance || 0), 0),
      activityCount: todayLogs.value.length
    }
  })
  
  // 本周统计
  const weekStats = computed(() => {
    return {
      totalDuration: weekLogs.value.reduce((sum, log) => sum + (log.duration || 0), 0),
      totalCalories: weekLogs.value.reduce((sum, log) => sum + (log.calories || 0), 0),
      totalDistance: weekLogs.value.reduce((sum, log) => sum + (log.distance || 0), 0),
      activeDays: new Set(weekLogs.value.map(log => log.date)).size
    }
  })
  
  // 目标完成度
  const dailyGoalProgress = computed(() => {
    const stats = todayStats.value
    return {
      duration: Math.min(100, Math.round((stats.totalDuration / dailyGoal.value.duration) * 100)),
      calories: Math.min(100, Math.round((stats.totalCalories / dailyGoal.value.calories) * 100)),
      steps: 0 // 步数需要单独计算
    }
  })
  
  const weeklyGoalProgress = computed(() => {
    const stats = weekStats.value
    return {
      days: Math.min(100, Math.round((stats.activeDays / weeklyGoal.value.days) * 100)),
      duration: Math.min(100, Math.round((stats.totalDuration / weeklyGoal.value.totalDuration) * 100)),
      calories: Math.min(100, Math.round((stats.totalCalories / weeklyGoal.value.totalCalories) * 100))
    }
  })
  
  // 即将到来的运动会
  const upcomingEvents = computed(() => {
    return sportsEvents.value.filter(e => e.status === 'upcoming').slice(0, 3)
  })
  
  // 我参与的运动会
  const joinedEvents = computed(() => {
    return sportsEvents.value.filter(e => e.isJoined)
  })
  
  // 我参与的队伍
  const myTeams = computed(() => {
    return challengeTeams.value.filter(t => t.isJoined)
  })
  
  // 运动类型列表
  const activityTypes = computed(() => Object.values(activityTrackerService.ACTIVITY_TYPES))
  
  // 强度等级列表
  const intensityLevels = computed(() => Object.values(activityTrackerService.INTENSITY_LEVELS))
  
  return {
    // 状态
    activityLogs,
    todayLogs,
    weekLogs,
    dailyGoal,
    weeklyGoal,
    activityStreak,
    sportsEvents,
    challengeTeams,
    healthReports,
    currentReport,
    currentTab,
    selectedDate,
    
    // 加载方法
    init,
    loadActivityLogs,
    loadTodayLogs,
    loadWeekLogs,
    loadDailyGoal,
    loadWeeklyGoal,
    loadActivityStreak,
    loadSportsEvents,
    loadChallengeTeams,
    loadHealthReports,
    
    // 运动打卡方法
    addActivityLog,
    deleteActivityLog,
    setDailyGoal,
    setWeeklyGoal,
    
    // 运动会方法
    joinSportsEvent,
    leaveSportsEvent,
    
    // 组队挑战方法
    createChallengeTeam,
    joinChallengeTeam,
    updateTeamProgress,
    
    // 健康报告方法
    generateHealthReport,
    
    // 同步方法
    syncWechatSports,
    importBandData,
    
    // 计算属性
    todayStats,
    weekStats,
    dailyGoalProgress,
    weeklyGoalProgress,
    upcomingEvents,
    joinedEvents,
    myTeams,
    activityTypes,
    intensityLevels
  }
})
