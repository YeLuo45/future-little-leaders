// src/services/cloudFunctions.js
// V32 Cloud Functions Mock — 无服务端代码的数据处理逻辑

import { ref } from 'vue'

// ============================================================================
// Cloud Function Results Store
// ============================================================================
const functionResults = ref({})
const functionLogs = ref([])

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Log function execution
 */
function log(fnName, input, output, duration) {
  functionLogs.value.push({
    function: fnName,
    input,
    output,
    duration: `${duration}ms`,
    timestamp: Date.now()
  })
  
  // Keep last 100 logs
  if (functionLogs.value.length > 100) {
    functionLogs.value.shift()
  }
}

/**
 * Simulate async delay
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// ============================================================================
// Cloud Functions
// ============================================================================

/**
 * onTaskCompleted — 任务完成触发（积分计算/成就检查）
 * 
 * Triggered when a task is completed
 * - Calculates points earned
 * - Checks for achievements
 * - Updates user stats
 * 
 * @param {object} taskData - Task completion data
 * @param {string} taskData.taskId - Task ID
 * @param {string} taskData.childId - Child ID
 * @param {number} taskData.basePoints - Base points for task
 * @param {boolean} taskData.bonusApplied - Whether bonus was applied
 * @returns {Promise<object>} - Result with points and achievements
 */
export async function onTaskCompleted(taskData) {
  const startTime = Date.now()
  
  // Simulate processing
  await delay(50 + Math.random() * 100)
  
  const { taskId, childId, basePoints = 10, bonusApplied = false } = taskData
  
  // Calculate final points
  let finalPoints = basePoints
  const bonuses = []
  
  if (bonusApplied) {
    finalPoints *= 1.5
    bonuses.push({ type: 'combo', multiplier: 1.5, description: '连续完成奖励' })
  }
  
  // Check for streak bonus (mock: 20% chance)
  if (Math.random() > 0.8) {
    finalPoints *= 1.2
    bonuses.push({ type: 'streak', multiplier: 1.2, description: '连续任务奖励' })
  }
  
  finalPoints = Math.round(finalPoints)
  
  // Check for new achievements (mock logic)
  const newAchievements = []
  
  // First task of the day
  const todayTasks = Object.values(functionResults.value)
    .filter(r => r.function === 'onTaskCompleted' && r.childId === childId)
    .length
  
  if (todayTasks === 0) {
    newAchievements.push({
      id: 'early_bird',
      name: '早起鸟儿',
      description: '今日完成第一个任务',
      icon: '🌅'
    })
  }
  
  // 10 tasks milestone
  if (todayTasks === 9) {
    newAchievements.push({
      id: 'task_master_10',
      name: '任务大师',
      description: '今日完成10个任务',
      icon: '🏆'
    })
  }
  
  const result = {
    taskId,
    childId,
    basePoints,
    finalPoints,
    bonuses,
    newAchievements,
    streakCount: todayTasks + 1,
    timestamp: Date.now()
  }
  
  functionResults.value[`task_${taskId}_${Date.now()}`] = {
    function: 'onTaskCompleted',
    ...result
  }
  
  log('onTaskCompleted', taskData, result, Date.now() - startTime)
  
  return result
}

/**
 * onPointsChanged — 积分变动触发（反作弊检查/通知）
 * 
 * Triggered when points change
 * - Validates point changes
 * - Anti-cheat checks
 * - Sends notifications
 * 
 * @param {object} pointsData - Points change data
 * @param {string} pointsData.childId - Child ID
 * @param {number} pointsData.previousPoints - Previous point total
 * @param {number} pointsData.newPoints - New point total
 * @param {string} pointsData.changeType - Type of change (earn, spend, adjust)
 * @param {string} pointsData.reason - Reason for change
 * @returns {Promise<object>} - Validation result
 */
export async function onPointsChanged(pointsData) {
  const startTime = Date.now()
  
  await delay(30 + Math.random() * 50)
  
  const { childId, previousPoints, newPoints, changeType, reason } = pointsData
  
  const pointDiff = newPoints - previousPoints
  
  // Anti-cheat validation
  const validation = {
    valid: true,
    flags: [],
    risk: 'low'
  }
  
  // Check for suspicious changes
  if (pointDiff > 1000) {
    validation.flags.push('large_point_increase')
    validation.risk = 'medium'
  }
  
  if (pointDiff < -1000) {
    validation.flags.push('large_point_decrease')
    validation.risk = 'medium'
  }
  
  // Check for rapid changes (more than 10 changes in 1 second)
  const recentChanges = functionLogs.value.filter(log => 
    log.function === 'onPointsChanged' && 
    Date.now() - log.timestamp < 1000
  )
  
  if (recentChanges.length > 10) {
    validation.flags.push('rapid_changes')
    validation.risk = 'high'
    validation.valid = false
  }
  
  // Check for impossible values
  if (newPoints < 0) {
    validation.flags.push('negative_points')
    validation.valid = false
  }
  
  // Determine notification needed
  let notification = null
  
  if (pointDiff > 0 && pointDiff >= 50) {
    notification = {
      type: 'points_earned',
      title: '积分 +' + pointDiff,
      message: `恭喜获得 ${pointDiff} 积分！`,
      childId
    }
  } else if (pointDiff < 0 && Math.abs(pointDiff) >= 50) {
    notification = {
      type: 'points_spent',
      title: '积分 -' + Math.abs(pointDiff),
      message: `消耗 ${Math.abs(pointDiff)} 积分`,
      childId
    }
  }
  
  const result = {
    childId,
    previousPoints,
    newPoints,
    changeType,
    reason,
    pointDiff,
    validation,
    notification,
    timestamp: Date.now()
  }
  
  functionResults.value[`points_${childId}_${Date.now()}`] = {
    function: 'onPointsChanged',
    ...result
  }
  
  log('onPointsChanged', pointsData, result, Date.now() - startTime)
  
  return result
}

/**
 * onDailyReset — 每日重置（签到状态/日常任务）
 * 
 * Triggered daily for reset operations
 * - Resets daily task status
 * - Updates streak counters
 * - Awards daily login bonus
 * 
 * @param {object} resetData - Reset data
 * @param {string} resetData.childId - Child ID
 * @param {string} resetData.date - Reset date (YYYY-MM-DD)
 * @returns {Promise<object>} - Reset results
 */
export async function onDailyReset(resetData) {
  const startTime = Date.now()
  
  await delay(100 + Math.random() * 200)
  
  const { childId, date } = resetData
  
  // Mock: check if user was active yesterday
  const yesterdayActive = Math.random() > 0.3
  const yesterdayStreak = yesterdayActive ? Math.floor(Math.random() * 30) + 1 : 0
  
  // Calculate new streak
  let newStreak = 1 // Reset to 1 for login
  if (yesterdayActive && yesterdayStreak > 0) {
    newStreak = yesterdayStreak + 1
  }
  
  // Daily login bonus
  let dailyBonus = 5
  if (newStreak >= 7) dailyBonus = 15
  if (newStreak >= 30) dailyBonus = 30
  
  // Generate daily tasks (mock: 5 random tasks)
  const dailyTasks = [
    { id: 'daily_1', title: '阅读 30 分钟', points: 10, completed: false },
    { id: 'daily_2', title: '整理房间', points: 8, completed: false },
    { id: 'daily_3', title: '运动 20 分钟', points: 12, completed: false },
    { id: 'daily_4', title: '帮助家人', points: 6, completed: false },
    { id: 'daily_5', title: '完成作业', points: 15, completed: false }
  ]
  
  // Check for missed daily tasks from yesterday
  const missedTasks = yesterdayActive ? [] : dailyTasks.slice(0, 3)
  
  const result = {
    childId,
    date,
    previousStreak: yesterdayStreak,
    newStreak,
    dailyBonus,
    dailyTasks,
    missedTasks,
    signInTime: Date.now(),
    timestamp: Date.now()
  }
  
  functionResults.value[`reset_${childId}_${date}`] = {
    function: 'onDailyReset',
    ...result
  }
  
  log('onDailyReset', resetData, result, Date.now() - startTime)
  
  return result
}

// ============================================================================
// Cloud Function Executor
// ============================================================================

/**
 * Execute a cloud function by name
 * @param {string} name - Function name
 * @param {object} data - Input data
 * @returns {Promise<object>} - Function result
 */
export async function executeFunction(name, data) {
  const functions = {
    onTaskCompleted,
    onPointsChanged,
    onDailyReset
  }
  
  if (!functions[name]) {
    throw new Error(`Unknown cloud function: ${name}`)
  }
  
  return functions[name](data)
}

/**
 * Get function execution logs
 * @returns {Array} - Execution logs
 */
export function getFunctionLogs() {
  return functionLogs.value
}

/**
 * Get function results
 * @returns {object} - Function results
 */
export function getFunctionResults() {
  return functionResults.value
}

/**
 * Clear function logs and results
 */
export function clearFunctionHistory() {
  functionLogs.value = []
  functionResults.value = {}
}

// ============================================================================
// Default Export
// ============================================================================
export default {
  onTaskCompleted,
  onPointsChanged,
  onDailyReset,
  executeFunction,
  getFunctionLogs,
  getFunctionResults,
  clearFunctionHistory
}
