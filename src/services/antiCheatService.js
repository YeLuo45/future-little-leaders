/**
 * V30 Anti-Cheat Service
 * Intelligent anomaly detection for gamified points system
 */

import { auditAnomaly, AUDIT_EVENTS } from '../utils/securityAudit.js'

// Detection thresholds
const THRESHOLDS = {
  // High frequency task completion (tasks per 5 minutes)
  HIGH_FREQ_TASKS: 10,
  // Points change exceeding this % from historical average
  POINTS_ANOMALY_RATE: 3, // 3x historical average
  // Number of check-ins during night hours (0-5 AM) to trigger alert
  NIGHT_CHECKIN_COUNT: 3,
  // Suspicious device change count per day
  DEVICE_CHANGE_COUNT: 3
}

// Anomaly types
export const ANOMALY_TYPES = {
  HIGH_FREQUENCY: 'high_frequency_tasks',
  POINTS_ANOMALY: 'points_anomaly',
  NIGHT_CHECKIN: 'night_checkin',
  DEVICE_FINGERPRINT: 'device_fingerprint',
  RAPID_FIRE: 'rapid_fire_completion'
}

// Anti-cheat actions
export const ANTI_CHEAT_ACTIONS = {
  FREEZE_POINTS: 'freeze_points',       // Freeze during investigation
  DEDUCT_POINTS: 'deduct_points',      // Confirmed violation
  RESTRICT_TASKS: 'restrict_tasks',    // Limit high-frequency tasks
  NOTIFY_PARENT: 'notify_parent'       // Alert parents
}

// Storage keys
const ACTIVITY_LOG_KEY = 'anti_cheat_activity_log'
const DEVICE_FP_KEY = 'anti_cheat_device_fp'

/**
 * Get activity log for a baby
 */
function getActivityLog(babyId) {
  try {
    const key = ACTIVITY_LOG_KEY + '_' + babyId
    const stored = uni.getStorageSync(key)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

/**
 * Save activity log
 */
function saveActivityLog(babyId, logs) {
  try {
    const key = ACTIVITY_LOG_KEY + '_' + babyId
    // Keep last 500 entries
    const trimmed = logs.slice(-500)
    uni.setStorageSync(key, JSON.stringify(trimmed))
  } catch {
    console.warn('[V30] Failed to save activity log')
  }
}

/**
 * Get device fingerprint (mock implementation)
 */
export function getDeviceFingerprint() {
  try {
    const systemInfo = uni.getSystemInfoSync()
    return {
      platform: systemInfo.platform || 'unknown',
      os: systemInfo.system || 'unknown',
      appVersion: systemInfo.appVersion || '1.0.0',
      deviceId: uni.getStorageSync('deviceId') || generateDeviceId()
    }
  } catch {
    return {
      platform: 'unknown',
      os: 'unknown',
      appVersion: '1.0.0',
      deviceId: generateDeviceId()
    }
  }
}

/**
 * Generate unique device ID
 */
function generateDeviceId() {
  const id = 'device_' + Date.now() + '_' + Math.random().toString(36).slice(2, 10)
  uni.setStorageSync('deviceId', id)
  return id
}

/**
 * Check if timestamp is during night hours (0-5 AM)
 */
function isNightTime(timestamp) {
  const hour = new Date(timestamp).getHours()
  return hour >= 0 && hour < 5
}

/**
 * Record activity (task completion, check-in, points change)
 * @param {string} babyId - Baby ID
 * @param {object} activity - { type: 'task'|'checkin'|'points', data, timestamp }
 */
export function recordActivity(babyId, activity) {
  const logs = getActivityLog(babyId)
  logs.push({
    ...activity,
    timestamp: activity.timestamp || Date.now(),
    deviceFingerprint: getDeviceFingerprint()
  })
  saveActivityLog(babyId, logs)
  
  // Run anomaly detection on each record
  const anomalies = detectAnomalies(babyId)
  return anomalies
}

/**
 * Detect anomalies based on activity log
 * @param {string} babyId - Baby ID
 * @returns {Array} - Array of detected anomalies
 */
export function detectAnomalies(babyId) {
  const logs = getActivityLog(babyId)
  const anomalies = []
  const now = Date.now()
  
  // 1. High frequency task detection (last 5 minutes)
  const fiveMinutesAgo = now - 5 * 60 * 1000
  const recentTasks = logs.filter(log => 
    log.type === 'task' && log.timestamp > fiveMinutesAgo
  )
  if (recentTasks.length >= THRESHOLDS.HIGH_FREQ_TASKS) {
    anomalies.push({
      type: ANOMALY_TYPES.HIGH_FREQUENCY,
      severity: 'high',
      count: recentTasks.length,
      timeWindow: '5 minutes',
      detectedAt: now
    })
  }
  
  // 2. Rapid fire completion (tasks within 10 seconds)
  const taskTimestamps = logs.filter(log => log.type === 'task').map(log => log.timestamp)
  for (let i = 1; i < taskTimestamps.length; i++) {
    if (taskTimestamps[i] - taskTimestamps[i-1] < 10000) {
      anomalies.push({
        type: ANOMALY_TYPES.RAPID_FIRE,
        severity: 'medium',
        interval: taskTimestamps[i] - taskTimestamps[i-1],
        detectedAt: now
      })
      break // Only report once per check
    }
  }
  
  // 3. Night check-in anomaly
  const todayStart = new Date().setHours(0, 0, 0, 0)
  const nightCheckins = logs.filter(log =>
    log.type === 'checkin' &&
    log.timestamp > todayStart &&
    isNightTime(log.timestamp)
  )
  if (nightCheckins.length >= THRESHOLDS.NIGHT_CHECKIN_COUNT) {
    anomalies.push({
      type: ANOMALY_TYPES.NIGHT_CHECKIN,
      severity: 'high',
      count: nightCheckins.length,
      detectedAt: now
    })
  }
  
  // 4. Points anomaly (vs historical average)
  const pointsLogs = logs.filter(log => log.type === 'points')
  if (pointsLogs.length >= 10) {
    const recentPointsLogs = pointsLogs.slice(-20)
    const avgPoints = recentPointsLogs.reduce((sum, log) => sum + Math.abs(log.data.change || 0), 0) / recentPointsLogs.length
    
    const lastPointsChange = Math.abs(pointsLogs[pointsLogs.length - 1]?.data?.change || 0)
    if (lastPointsChange > avgPoints * THRESHOLDS.POINTS_ANOMALY_RATE && avgPoints > 0) {
      anomalies.push({
        type: ANOMALY_TYPES.POINTS_ANOMALY,
        severity: 'medium',
        change: lastPointsChange,
        historicalAvg: avgPoints,
        ratio: lastPointsChange / avgPoints,
        detectedAt: now
      })
    }
  }
  
  // 5. Device fingerprint changes
  const deviceChanges = detectDeviceChanges(babyId, logs)
  if (deviceChanges.count >= THRESHOLDS.DEVICE_CHANGE_COUNT) {
    anomalies.push({
      type: ANOMALY_TYPES.DEVICE_FINGERPRINT,
      severity: 'high',
      devices: deviceChanges.devices,
      detectedAt: now
    })
  }
  
  // Log anomalies to audit
  anomalies.forEach(anomaly => {
    auditAnomaly('anti_cheat_' + anomaly.type, {
      babyId,
      severity: anomaly.severity,
      details: anomaly
    })
    console.log('[V30] Anomaly detected:', anomaly.type, anomaly.severity)
  })
  
  return anomalies
}

/**
 * Detect device fingerprint changes
 */
function detectDeviceChanges(babyId, logs) {
  const deviceMap = new Map()
  const recentLogs = logs.slice(-50)
  
  recentLogs.forEach(log => {
    if (log.deviceFingerprint) {
      const fp = log.deviceFingerprint.deviceId
      if (!deviceMap.has(fp)) {
        deviceMap.set(fp, 0)
      }
      deviceMap.set(fp, deviceMap.get(fp) + 1)
    }
  })
  
  return {
    count: deviceMap.size,
    devices: Array.from(deviceMap.keys())
  }
}

/**
 * Get anti-cheat status for a baby
 * @param {string} babyId - Baby ID
 * @returns {object} - { isFrozen, restrictionLevel, recentAnomalies }
 */
export function getAntiCheatStatus(babyId) {
  const frozenKey = 'anti_cheat_frozen_' + babyId
  const restrictionKey = 'anti_cheat_restriction_' + babyId
  
  const isFrozen = uni.getStorageSync(frozenKey) || false
  const restrictionLevel = uni.getStorageSync(restrictionKey) || 'none'
  const anomalies = detectAnomalies(babyId)
  
  return {
    isFrozen,
    restrictionLevel,
    recentAnomalies: anomalies.slice(0, 5),
    anomalyCount: anomalies.length
  }
}

/**
 * Take anti-cheat action
 * @param {string} babyId - Baby ID
 * @param {string} action - Action from ANTI_CHEAT_ACTIONS
 * @param {object} params - Action parameters
 */
export function takeAntiCheatAction(babyId, action, params = {}) {
  const now = Date.now()
  
  switch (action) {
    case ANTI_CHEAT_ACTIONS.FREEZE_POINTS:
      const frozenKey = 'anti_cheat_frozen_' + babyId
      uni.setStorageSync(frozenKey, true)
      // Auto-unfreeze after 24 hours
      uni.setStorageSync('anti_cheat_freeze_expires_' + babyId, now + 24 * 60 * 60 * 1000)
      console.log('[V30] Points frozen for baby:', babyId)
      break
      
    case ANTI_CHEAT_ACTIONS.DEDUCT_POINTS:
      // Points deduction handled by caller (pointsStore)
      console.log('[V30] Points deduction action for baby:', babyId, params)
      break
      
    case ANTI_CHEAT_ACTIONS.RESTRICT_TASKS:
      const restrictionKey = 'anti_cheat_restriction_' + babyId
      uni.setStorageSync(restrictionKey, params.level || 'medium')
      console.log('[V30] Task restriction set for baby:', babyId, params.level)
      break
      
    case ANTI_CHEAT_ACTIONS.NOTIFY_PARENT:
      // Emit notification event
      try {
        uni.$emit('anti-cheat:notify-parent', {
          babyId,
          type: params.noticeType || 'warning',
          message: params.message || 'Abnormal activity detected',
          timestamp: now
        })
      } catch {
        // uni not available
      }
      console.log('[V30] Parent notification sent for baby:', babyId)
      break
  }
  
  // Log action to audit
  auditAnomaly('anti_cheat_action', {
    babyId,
    action,
    params
  })
}

/**
 * Clear freeze if expired
 * @param {string} babyId - Baby ID
 */
export function clearExpiredFreeze(babyId) {
  const expiresAt = uni.getStorageSync('anti_cheat_freeze_expires_' + babyId)
  if (expiresAt && Date.now() > expiresAt) {
    uni.removeStorageSync('anti_cheat_frozen_' + babyId)
    uni.removeStorageSync('anti_cheat_freeze_expires_' + babyId)
    console.log('[V30] Freeze expired for baby:', babyId)
  }
}

/**
 * Check if points are frozen for baby
 * @param {string} babyId - Baby ID
 * @returns {boolean}
 */
export function isPointsFrozen(babyId) {
  clearExpiredFreeze(babyId)
  return uni.getStorageSync('anti_cheat_frozen_' + babyId) || false
}

/**
 * Get activity summary for a baby
 * @param {string} babyId - Baby ID
 * @param {number} days - Number of days to look back
 * @returns {object} - Activity statistics
 */
export function getActivitySummary(babyId, days = 7) {
  const logs = getActivityLog(babyId)
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000
  
  const filteredLogs = logs.filter(log => log.timestamp > cutoff)
  
  const taskCount = filteredLogs.filter(log => log.type === 'task').length
  const checkinCount = filteredLogs.filter(log => log.type === 'checkin').length
  const pointsChanges = filteredLogs.filter(log => log.type === 'points')
  
  const totalPointsChange = pointsChanges.reduce((sum, log) => sum + (log.data?.change || 0), 0)
  const avgPointsPerDay = taskCount > 0 ? totalPointsChange / days : 0
  
  return {
    period: days,
    taskCount,
    checkinCount,
    totalPointsChange,
    avgPointsPerDay,
    activityLogs: filteredLogs.slice(-20) // Last 20 activities
  }
}

/**
 * Report suspicious activity (for parent/teacher)
 * @param {object} report - { reporterId, babyId, type, description, evidence }
 * @returns {object} - { success, reportId }
 */
export function reportSuspiciousActivity(report) {
  const reportId = 'report_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8)
  
  // Store report
  const reports = getReports()
  reports.push({
    id: reportId,
    ...report,
    status: 'pending',
    createdAt: Date.now()
  })
  saveReports(reports)
  
  console.log('[V30] Suspicious activity reported:', reportId)
  
  return {
    success: true,
    reportId
  }
}

/**
 * Get reports
 */
function getReports() {
  try {
    const stored = uni.getStorageSync('anti_cheat_reports')
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

/**
 * Save reports
 */
function saveReports(reports) {
  try {
    uni.setStorageSync('anti_cheat_reports', JSON.stringify(reports))
  } catch {
    console.warn('[V30] Failed to save reports')
  }
}

/**
 * Get reports for admin review
 * @param {string} status - Filter by status (optional)
 * @returns {Array}
 */
export function getReportsForReview(status = null) {
  const reports = getReports()
  if (status) {
    return reports.filter(r => r.status === status)
  }
  return reports
}

/**
 * Update report status (admin only - mock)
 * @param {string} reportId - Report ID
 * @param {string} status - 'pending'|'reviewed'|'resolved'|'dismissed'
 * @param {string} adminNote - Admin note
 */
export function updateReportStatus(reportId, status, adminNote = '') {
  const reports = getReports()
  const report = reports.find(r => r.id === reportId)
  if (report) {
    report.status = status
    report.adminNote = adminNote
    report.reviewedAt = Date.now()
    saveReports(reports)
  }
}
