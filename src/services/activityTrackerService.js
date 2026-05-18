/**
 * V48 Physical Activity Tracker Service
 * 运动追踪与健康管理系统 - 运动打卡、运动数据统计、健康报告、运动会和运动挑战
 */

// Storage keys
const ACTIVITY_LOGS_KEY = 'activity_logs'
const SPORTS_CHALLENGES_KEY = 'sports_challenges'
const DAILY_GOALS_KEY = 'daily_goals'
const WEEKLY_GOALS_KEY = 'weekly_goals'
const CHALLENGE_TEAMS_KEY = 'challenge_teams'
const ACTIVITY_STREAKS_KEY = 'activity_streaks'
const HEALTH_REPORTS_KEY = 'health_reports'

// ============================================================================
// 运动类型定义
// ============================================================================

export const ACTIVITY_TYPES = {
  running: { id: 'running', name: '跑步', icon: '🏃', color: '#FF6B6B', unit: '公里', factor: 1 },
  swimming: { id: 'swimming', name: '游泳', icon: '🏊', color: '#4ECDC4', unit: '米', factor: 0.01 },
  cycling: { id: 'cycling', name: '骑车', icon: '🚴', color: '#45B7D1', unit: '公里', factor: 1 },
  ball: { id: 'ball', name: '球类', icon: '⚽', color: '#96CEB4', unit: '分钟', factor: 1 },
  yoga: { id: 'yoga', name: '瑜伽', icon: '🧘', color: '#DDA0DD', unit: '分钟', factor: 1 },
  dancing: { id: 'dancing', name: '跳舞', icon: '💃', color: '#FFB6C1', unit: '分钟', factor: 1 },
  hiking: { id: 'hiking', name: '徒步', icon: '🥾', color: '#8B4513', unit: '公里', factor: 1 },
  basketball: { id: 'basketball', name: '篮球', icon: '🏀', color: '#FFA500', unit: '分钟', factor: 1 }
}

export const INTENSITY_LEVELS = {
  low: { id: 'low', name: '低强度', multiplier: 0.5 },
  medium: { id: 'medium', name: '中等强度', multiplier: 1.0 },
  high: { id: 'high', name: '高强度', multiplier: 1.5 }
}

// ============================================================================
// 每日/每周运动目标
// ============================================================================

export const getDailyGoal = () => {
  try {
    const data = uni.getStorageSync(DAILY_GOALS_KEY)
    if (data) return JSON.parse(data)
  } catch (e) {
    console.error('getDailyGoal error:', e)
  }
  return {
    duration: 60,      // 分钟
    calories: 300,     // 卡路里
    steps: 10000      // 步数
  }
}

export const setDailyGoal = (goal) => {
  try {
    uni.setStorageSync(DAILY_GOALS_KEY, JSON.stringify(goal))
    return true
  } catch (e) {
    console.error('setDailyGoal error:', e)
    return false
  }
}

export const getWeeklyGoal = () => {
  try {
    const data = uni.getStorageSync(WEEKLY_GOALS_KEY)
    if (data) return JSON.parse(data)
  } catch (e) {
    console.error('getWeeklyGoal error:', e)
  }
  return {
    days: 5,           // 每周运动天数
    totalDuration: 300, // 总时长（分钟）
    totalCalories: 2000  // 总卡路里
  }
}

export const setWeeklyGoal = (goal) => {
  try {
    uni.setStorageSync(WEEKLY_GOALS_KEY, JSON.stringify(goal))
    return true
  } catch (e) {
    console.error('setWeeklyGoal error:', e)
    return false
  }
}

// ============================================================================
// 运动打卡记录
// ============================================================================

export const getActivityLogs = () => {
  try {
    const data = uni.getStorageSync(ACTIVITY_LOGS_KEY)
    if (data) return JSON.parse(data)
  } catch (e) {
    console.error('getActivityLogs error:', e)
  }
  return getDefaultActivityLogs()
}

export const getDefaultActivityLogs = () => [
  {
    id: 'log_1',
    type: 'running',
    title: '晨跑',
    duration: 30,
    distance: 3.5,
    calories: 200,
    intensity: 'medium',
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    checkInTime: '07:00',
    completed: true,
    notes: '天气很好',
    points: 30
  },
  {
    id: 'log_2',
    type: 'swimming',
    title: '游泳训练',
    duration: 45,
    distance: 1000,
    calories: 350,
    intensity: 'high',
    date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
    checkInTime: '16:00',
    completed: true,
    notes: '学会了自由泳',
    points: 45
  },
  {
    id: 'log_3',
    type: 'cycling',
    title: '周末骑行',
    duration: 60,
    distance: 15,
    calories: 400,
    intensity: 'medium',
    date: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0],
    checkInTime: '09:30',
    completed: true,
    notes: '和爸爸一起',
    points: 40
  }
]

export const addActivityLog = (logData) => {
  try {
    const logs = getActivityLogs()
    const activityType = ACTIVITY_TYPES[logData.type] || ACTIVITY_TYPES.running
    const intensity = INTENSITY_LEVELS[logData.intensity] || INTENSITY_LEVELS.medium
    
    // 计算卡路里和积分
    let calories = logData.calories || 0
    if (!calories && logData.duration) {
      // 基础代谢率估算：每分钟 5-8 卡路里 * 强度系数
      calories = Math.round(logData.duration * 6 * intensity.multiplier)
    }
    
    const points = Math.round(logData.duration * 0.5 * intensity.multiplier + (logData.distance || 0) * 5)
    
    const newLog = {
      id: 'log_' + Date.now(),
      type: logData.type || 'running',
      title: logData.title || activityType.name + '运动',
      duration: logData.duration || 0,
      distance: logData.distance || 0,
      calories: calories,
      intensity: logData.intensity || 'medium',
      date: logData.date || new Date().toISOString().split('T')[0],
      checkInTime: logData.checkInTime || new Date().toTimeString().slice(0, 5),
      completed: true,
      notes: logData.notes || '',
      points: points,
      createdAt: new Date().toISOString()
    }
    
    logs.unshift(newLog)
    uni.setStorageSync(ACTIVITY_LOGS_KEY, JSON.stringify(logs))
    
    // 更新连续打卡记录
    updateActivityStreak()
    
    return newLog
  } catch (e) {
    console.error('addActivityLog error:', e)
    return null
  }
}

export const deleteActivityLog = (logId) => {
  try {
    const logs = getActivityLogs()
    const filtered = logs.filter(log => log.id !== logId)
    uni.setStorageSync(ACTIVITY_LOGS_KEY, JSON.stringify(filtered))
    return true
  } catch (e) {
    console.error('deleteActivityLog error:', e)
    return false
  }
}

export const getTodayLogs = () => {
  const today = new Date().toISOString().split('T')[0]
  const logs = getActivityLogs()
  return logs.filter(log => log.date === today)
}

export const getWeekLogs = () => {
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 86400000)
  const logs = getActivityLogs()
  return logs.filter(log => new Date(log.date) >= weekAgo)
}

export const getMonthLogs = () => {
  const now = new Date()
  const monthAgo = new Date(now.getTime() - 30 * 86400000)
  const logs = getActivityLogs()
  return logs.filter(log => new Date(log.date) >= monthAgo)
}

// ============================================================================
// 连续运动打卡追踪
// ============================================================================

export const getActivityStreak = () => {
  try {
    const data = uni.getStorageSync(ACTIVITY_STREAKS_KEY)
    if (data) return JSON.parse(data)
  } catch (e) {
    console.error('getActivityStreak error:', e)
  }
  return {
    currentStreak: 5,
    longestStreak: 12,
    lastCheckIn: new Date(Date.now() - 86400000).toISOString().split('T')[0]
  }
}

export const updateActivityStreak = () => {
  try {
    const streak = getActivityStreak()
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    
    if (streak.lastCheckIn === today) {
      // 今天已打卡
      return streak
    } else if (streak.lastCheckIn === yesterday) {
      // 昨天打卡了，连续+1
      streak.currentStreak++
      streak.lastCheckIn = today
      if (streak.currentStreak > streak.longestStreak) {
        streak.longestStreak = streak.currentStreak
      }
    } else {
      // 中断了，重新开始
      streak.currentStreak = 1
      streak.lastCheckIn = today
    }
    
    uni.setStorageSync(ACTIVITY_STREAKS_KEY, JSON.stringify(streak))
    return streak
  } catch (e) {
    console.error('updateActivityStreak error:', e)
    return null
  }
}

// ============================================================================
// 运动会活动
// ============================================================================

export const getSportsEvents = () => {
  try {
    const data = uni.getStorageSync(SPORTS_CHALLENGES_KEY)
    if (data) return JSON.parse(data)
  } catch (e) {
    console.error('getSportsEvents error:', e)
  }
  return getDefaultSportsEvents()
}

export const getDefaultSportsEvents = () => [
  {
    id: 'event_1',
    name: '春季运动会',
    description: '一年一度的春季运动盛会，展示你的运动才能！',
    type: 'sports_day',
    startDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
    endDate: new Date(Date.now() + 86400000 * 9).toISOString().split('T')[0],
    status: 'upcoming',
    participantCount: 45,
    maxParticipants: 100,
    events: ['60米跑', '跳远', '投掷', '接力赛'],
    points: 100,
    isJoined: false
  },
  {
    id: 'event_2',
    name: '周末亲子跑',
    description: '和爸爸妈妈一起参加周末慢跑活动',
    type: 'parent_child',
    startDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    endDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    status: 'upcoming',
    participantCount: 28,
    maxParticipants: 50,
    events: ['3公里慢跑', '2公里亲子跑'],
    points: 50,
    isJoined: false
  },
  {
    id: 'event_3',
    name: '游泳挑战赛',
    description: '展示游泳技能，赢取丰厚奖励',
    type: 'competition',
    startDate: new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0],
    endDate: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0],
    status: 'ended',
    participantCount: 36,
    maxParticipants: 50,
    events: ['50米自由泳', '100米蛙泳'],
    points: 80,
    isJoined: true,
    myResult: { rank: 5, score: 85 }
  }
]

export const joinSportsEvent = (eventId) => {
  try {
    const events = getSportsEvents()
    const event = events.find(e => e.id === eventId)
    if (event && event.participantCount < event.maxParticipants) {
      event.participantCount++
      event.isJoined = true
      uni.setStorageSync(SPORTS_CHALLENGES_KEY, JSON.stringify(events))
      return true
    }
    return false
  } catch (e) {
    console.error('joinSportsEvent error:', e)
    return false
  }
}

export const leaveSportsEvent = (eventId) => {
  try {
    const events = getSportsEvents()
    const event = events.find(e => e.id === eventId)
    if (event && event.isJoined) {
      event.participantCount--
      event.isJoined = false
      uni.setStorageSync(SPORTS_CHALLENGES_KEY, JSON.stringify(events))
      return true
    }
    return false
  } catch (e) {
    console.error('leaveSportsEvent error:', e)
    return false
  }
}

// ============================================================================
// 组队运动挑战
// ============================================================================

export const getChallengeTeams = () => {
  try {
    const data = uni.getStorageSync(CHALLENGE_TEAMS_KEY)
    if (data) return JSON.parse(data)
  } catch (e) {
    console.error('getChallengeTeams error:', e)
  }
  return getDefaultChallengeTeams()
}

export const getDefaultChallengeTeams = () => [
  {
    id: 'team_1',
    name: '闪电队',
    leaderId: 'user_001',
    leaderName: '小明',
    memberCount: 3,
    maxMembers: 5,
    totalPoints: 850,
    weeklyGoal: 500,
    weeklyProgress: 320,
    status: 'active',
    challenges: [
      { id: 'ch_1', name: '本周跑步挑战', target: 10, current: 6, unit: '公里' },
      { id: 'ch_2', name: '每日运动30分钟', target: 7, current: 4, unit: '天' }
    ],
    createdAt: Date.now() - 86400000 * 10,
    isJoined: false
  },
  {
    id: 'team_2',
    name: '彩虹队',
    leaderId: 'user_002',
    leaderName: '小红',
    memberCount: 4,
    maxMembers: 5,
    totalPoints: 720,
    weeklyGoal: 400,
    weeklyProgress: 280,
    status: 'active',
    challenges: [
      { id: 'ch_3', name: '游泳距离挑战', target: 2000, current: 1500, unit: '米' },
      { id: 'ch_4', name: '球类运动时长', target: 180, current: 120, unit: '分钟' }
    ],
    createdAt: Date.now() - 86400000 * 5,
    isJoined: true
  }
]

export const createChallengeTeam = (teamData) => {
  try {
    const teams = getChallengeTeams()
    const newTeam = {
      id: 'team_' + Date.now(),
      name: teamData.name || '新队伍',
      leaderId: teamData.leaderId || 'current_user',
      leaderName: teamData.leaderName || '我',
      memberCount: 1,
      maxMembers: teamData.maxMembers || 5,
      totalPoints: 0,
      weeklyGoal: teamData.weeklyGoal || 300,
      weeklyProgress: 0,
      status: 'active',
      challenges: [],
      createdAt: Date.now(),
      isJoined: true
    }
    teams.unshift(newTeam)
    uni.setStorageSync(CHALLENGE_TEAMS_KEY, JSON.stringify(teams))
    return newTeam
  } catch (e) {
    console.error('createChallengeTeam error:', e)
    return null
  }
}

export const joinChallengeTeam = (teamId) => {
  try {
    const teams = getChallengeTeams()
    const team = teams.find(t => t.id === teamId)
    if (team && team.memberCount < team.maxMembers) {
      team.memberCount++
      team.isJoined = true
      uni.setStorageSync(CHALLENGE_TEAMS_KEY, JSON.stringify(teams))
      return true
    }
    return false
  } catch (e) {
    console.error('joinChallengeTeam error:', e)
    return false
  }
}

export const updateTeamProgress = (teamId, challengeId, progress) => {
  try {
    const teams = getChallengeTeams()
    const team = teams.find(t => t.id === teamId)
    if (team) {
      const challenge = team.challenges.find(c => c.id === challengeId)
      if (challenge) {
        challenge.current = progress
        // 计算团队总进度
        team.weeklyProgress = team.challenges.reduce((sum, c) => sum + c.current, 0)
        uni.setStorageSync(CHALLENGE_TEAMS_KEY, JSON.stringify(teams))
        return true
      }
    }
    return false
  } catch (e) {
    console.error('updateTeamProgress error:', e)
    return false
  }
}

// ============================================================================
// 运动积分奖励
// ============================================================================

export const awardActivityPoints = (logId, basePoints) => {
  try {
    // 连续打卡加成
    const streak = getActivityStreak()
    let bonus = 1.0
    if (streak.currentStreak >= 7) {
      bonus = 1.5 // 7天连续加成50%
    } else if (streak.currentStreak >= 3) {
      bonus = 1.2 // 3天连续加成20%
    }
    
    const totalPoints = Math.round(basePoints * bonus)
    return {
      basePoints,
      streakBonus: Math.round(basePoints * (bonus - 1)),
      totalPoints
    }
  } catch (e) {
    console.error('awardActivityPoints error:', e)
    return { basePoints, streakBonus: 0, totalPoints: basePoints }
  }
}

// ============================================================================
// 健康报告生成
// ============================================================================

export const getHealthReports = () => {
  try {
    const data = uni.getStorageSync(HEALTH_REPORTS_KEY)
    if (data) return JSON.parse(data)
  } catch (e) {
    console.error('getHealthReports error:', e)
  }
  return []
}

export const generateHealthReport = () => {
  try {
    const reports = getHealthReports()
    const weekLogs = getWeekLogs()
    const dailyGoal = getDailyGoal()
    const weeklyGoal = getWeeklyGoal()
    const streak = getActivityStreak()
    
    // 计算本周统计数据
    const totalDuration = weekLogs.reduce((sum, log) => sum + (log.duration || 0), 0)
    const totalCalories = weekLogs.reduce((sum, log) => sum + (log.calories || 0), 0)
    const totalDistance = weekLogs.reduce((sum, log) => sum + (log.distance || 0), 0)
    const activeDays = new Set(weekLogs.map(log => log.date)).size
    
    // 计算完成率
    const dailyCompletionRate = Math.min(100, Math.round((totalDuration / (dailyGoal.duration * 7)) * 100))
    const weeklyDaysCompletion = Math.round((activeDays / weeklyGoal.days) * 100)
    
    // 运动类型分布
    const activityDistribution = {}
    weekLogs.forEach(log => {
      const type = ACTIVITY_TYPES[log.type]
      if (type) {
        if (!activityDistribution[type.name]) {
          activityDistribution[type.name] = { count: 0, duration: 0, icon: type.icon }
        }
        activityDistribution[type.name].count++
        activityDistribution[type.name].duration += log.duration || 0
      }
    })
    
    // 生成健康建议
    const suggestions = []
    if (totalDuration < weeklyGoal.totalDuration) {
      suggestions.push('本周运动时长不足，建议每天增加运动时间')
    }
    if (activeDays < weeklyGoal.days) {
      suggestions.push('运动频率可以提高，尝试每天保持适量运动')
    }
    if (streak.currentStreak < 3) {
      suggestions.push('保持连续打卡习惯，从小目标开始更容易坚持')
    }
    if (totalCalories < weeklyGoal.totalCalories) {
      suggestions.push('可以适当增加运动强度，提高卡路里消耗')
    }
    suggestions.push('运动后记得补充水分，保持充足睡眠')
    
    const newReport = {
      id: 'report_' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      weekStart: new Date(Date.now() - 6 * 86400000).toISOString().split('T')[0],
      weekEnd: new Date().toISOString().split('T')[0],
      stats: {
        totalDuration,
        totalCalories,
        totalDistance,
        activeDays,
        avgDailyDuration: Math.round(totalDuration / 7),
        avgDailyCalories: Math.round(totalCalories / 7)
      },
      goals: {
        daily: dailyGoal,
        weekly: weeklyGoal,
        completion: {
          dailyDuration: dailyCompletionRate,
          weeklyDays: weeklyDaysCompletion
        }
      },
      streak: streak,
      activityDistribution,
      suggestions,
      score: Math.round((dailyCompletionRate + weeklyDaysCompletion) / 2),
      createdAt: new Date().toISOString()
    }
    
    reports.unshift(newReport)
    uni.setStorageSync(HEALTH_REPORTS_KEY, JSON.stringify(reports))
    return newReport
  } catch (e) {
    console.error('generateHealthReport error:', e)
    return null
  }
}

// ============================================================================
// 微信运动同步 (模拟)
// ============================================================================

export const syncWechatSports = () => {
  return new Promise((resolve) => {
    // 模拟微信运动同步
    setTimeout(() => {
      const mockSteps = Math.floor(Math.random() * 5000) + 8000
      resolve({
        success: true,
        steps: mockSteps,
        syncedAt: new Date().toISOString()
      })
    }, 1000)
  })
}

// ============================================================================
// 智能手环数据导入 (模拟)
// ============================================================================

export const importBandData = (data) => {
  try {
    // 解析手环数据并创建运动记录
    if (data.steps && data.steps > 0) {
      // 估算跑步距离（步数 * 0.7米 / 1000 = 公里）
      const estimatedDistance = Math.round(data.steps * 0.007 * 10) / 10
      addActivityLog({
        type: 'running',
        title: '手环同步-健走',
        duration: Math.round(data.steps / 100), // 估算时长
        distance: estimatedDistance,
        calories: Math.round(data.steps * 0.04), // 估算卡路里
        intensity: 'low',
        notes: '从智能手环导入'
      })
    }
    return true
  } catch (e) {
    console.error('importBandData error:', e)
    return false
  }
}

// ============================================================================
// 与任务系统联动
// ============================================================================

export const getLinkedTasks = () => {
  // 获取关联的运动相关任务
  return [
    { id: 'task_1', title: '每日运动打卡', type: 'daily', linked: true },
    { id: 'task_2', title: '本周运动目标', type: 'weekly', linked: true }
  ]
}

export const completeLinkedTask = (taskId) => {
  // 完成关联任务，增加积分
  console.log('Task completed via activity:', taskId)
  return true
}

export default {
  ACTIVITY_TYPES,
  INTENSITY_LEVELS,
  getDailyGoal,
  setDailyGoal,
  getWeeklyGoal,
  setWeeklyGoal,
  getActivityLogs,
  addActivityLog,
  deleteActivityLog,
  getTodayLogs,
  getWeekLogs,
  getMonthLogs,
  getActivityStreak,
  updateActivityStreak,
  getSportsEvents,
  joinSportsEvent,
  leaveSportsEvent,
  getChallengeTeams,
  createChallengeTeam,
  joinChallengeTeam,
  updateTeamProgress,
  awardActivityPoints,
  getHealthReports,
  generateHealthReport,
  syncWechatSports,
  importBandData,
  getLinkedTasks,
  completeLinkedTask
}
