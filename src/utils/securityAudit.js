/**
 * V29 Security Audit Log
 * Records all sensitive operations for compliance
 */

import { sanitizeLog } from './privacyMask.js'

// Audit event types
export const AUDIT_EVENTS = {
  POINTS_CHANGE: 'points_change',
  PASSWORD_CHANGE: 'password_change',
  ACCOUNT_MODIFY: 'account_modify',
  LOGIN_SUCCESS: 'login_success',
  LOGIN_FAIL: 'login_fail',
  LOGOUT: 'logout',
  DATA_EXPORT: 'data_export',
  PRIVACY_SETTINGS_CHANGE: 'privacy_settings_change',
  SECOND_FACTOR_VERIFY: 'second_factor_verify',
  ANOMALY_DETECTED: 'anomaly_detected'
}

// Storage key
const AUDIT_STORAGE_KEY = 'security_audit_log'

/**
 * Get current user info (mock - replace with actual auth)
 */
function getCurrentUser() {
  try {
    const userInfo = uni.getStorageSync('userInfo')
    return userInfo || { id: 'anonymous', name: 'Anonymous' }
  } catch {
    return { id: 'anonymous', name: 'Anonymous' }
  }
}

/**
 * Get current timestamp
 */
function getTimestamp() {
  return new Date().toISOString()
}

/**
 * Get client IP (mock - in real app use server-side logging)
 */
function getClientIP() {
  try {
    return uni.getStorageSync('clientIP') || '127.0.0.1'
  } catch {
    return '127.0.0.1'
  }
}

/**
 * Get device info
 */
function getDeviceInfo() {
  try {
    const systemInfo = uni.getSystemInfoSync()
    return {
      platform: systemInfo.platform || 'unknown',
      os: systemInfo.system || 'unknown',
      appVersion: systemInfo.appVersion || '1.0.0'
    }
  } catch {
    return { platform: 'unknown', os: 'unknown', appVersion: '1.0.0' }
  }
}

/**
 * Create audit log entry
 * @param {string} eventType - Event type from AUDIT_EVENTS
 * @param {object} details - Event details (sensitive fields will be masked)
 * @param {string} status - 'success' | 'fail' | 'warning'
 */
export function createAuditLog(eventType, details = {}, status = 'success') {
  const entry = {
    id: 'audit_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
    timestamp: getTimestamp(),
    eventType,
    userId: getCurrentUser().id,
    userName: getCurrentUser().name,
    ip: getClientIP(),
    device: getDeviceInfo(),
    details: sanitizeLog(details),
    status
  }
  
  // Save to storage
  saveAuditLog(entry)
  
  // Emit event for real-time monitoring
  try {
    uni.$emit('security:audit', entry)
  } catch {
    // Ignore if uni not available
  }
  
  console.log('[V29] Audit:', entry.eventType, entry.userId, entry.status)
  return entry
}

/**
 * Save audit log to storage
 */
function saveAuditLog(entry) {
  try {
    const logs = getAuditLogs()
    logs.unshift(entry) // Add to beginning
    
    // Keep only last 1000 entries
    const trimmed = logs.slice(0, 1000)
    uni.setStorageSync(AUDIT_STORAGE_KEY, JSON.stringify(trimmed))
  } catch {
    console.warn('[V29] Failed to save audit log')
  }
}

/**
 * Get all audit logs
 * @returns {Array} - Array of audit log entries
 */
export function getAuditLogs() {
  try {
    const stored = uni.getStorageSync(AUDIT_STORAGE_KEY)
    if (!stored) return []
    return JSON.parse(stored)
  } catch {
    return []
  }
}

/**
 * Get audit logs by user
 * @param {string} userId - User ID
 * @param {object} options - { limit, offset, eventType, startDate, endDate }
 * @returns {Array} - Filtered audit logs
 */
export function getAuditLogsByUser(userId, options = {}) {
  let logs = getAuditLogs()
  
  // Filter by user
  logs = logs.filter(log => log.userId === userId)
  
  // Filter by event type
  if (options.eventType) {
    logs = logs.filter(log => log.eventType === options.eventType)
  }
  
  // Filter by date range
  if (options.startDate) {
    logs = logs.filter(log => new Date(log.timestamp) >= new Date(options.startDate))
  }
  if (options.endDate) {
    logs = logs.filter(log => new Date(log.timestamp) <= new Date(options.endDate))
  }
  
  // Pagination
  const offset = options.offset || 0
  const limit = options.limit || 50
  return logs.slice(offset, offset + limit)
}

/**
 * Export audit logs as CSV
 * @param {Array} logs - Logs to export (default: all)
 * @returns {string} - CSV formatted string
 */
export function exportAuditLogsAsCSV(logs = null) {
  const data = logs || getAuditLogs()
  
  const headers = ['ID', 'Timestamp', 'Event Type', 'User ID', 'User Name', 'IP', 'Platform', 'OS', 'Status', 'Details']
  const rows = data.map(log => [
    log.id,
    log.timestamp,
    log.eventType,
    log.userId,
    log.userName,
    log.ip,
    log.device?.platform || '',
    log.device?.os || '',
    log.status,
    JSON.stringify(log.details)
  ])
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n')
  
  return csvContent
}

/**
 * Download audit logs as file
 * @param {string} format - 'csv' | 'json'
 */
export function downloadAuditLogs(format = 'csv') {
  const logs = getAuditLogs()
  
  if (format === 'csv') {
    const content = exportAuditLogsAsCSV(logs)
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `audit_logs_${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  } else {
    const content = JSON.stringify(logs, null, 2)
    const blob = new Blob([content], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `audit_logs_${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    URL.revokeObjectURL(url)
  }
}

// Convenience functions for common audit events

/**
 * Log points change
 */
export function auditPointsChange(pointsBefore, pointsAfter, reason) {
  return createAuditLog(AUDIT_EVENTS.POINTS_CHANGE, {
    pointsBefore,
    pointsAfter,
    change: pointsAfter - pointsBefore,
    reason
  }, Math.abs(pointsAfter - pointsBefore) > 100 ? 'warning' : 'success')
}

/**
 * Log password change
 */
export function auditPasswordChange(success = true) {
  return createAuditLog(AUDIT_EVENTS.PASSWORD_CHANGE, {}, success ? 'success' : 'fail')
}

/**
 * Log account modification
 */
export function auditAccountModify(field, oldValue, newValue) {
  return createAuditLog(AUDIT_EVENTS.ACCOUNT_MODIFY, {
    field,
    oldValue: '***MASKED***',
    newValue: '***MASKED***'
  }, 'success')
}

/**
 * Log login event
 */
export function auditLogin(userId, success = true, failReason = '') {
  return createAuditLog(
    success ? AUDIT_EVENTS.LOGIN_SUCCESS : AUDIT_EVENTS.LOGIN_FAIL,
    { failReason },
    success ? 'success' : 'fail'
  )
}

/**
 * Log anomaly detection (e.g., unusual location login)
 */
export function auditAnomaly(type, details) {
  return createAuditLog(AUDIT_EVENTS.ANOMALY_DETECTED, { anomalyType: type, ...details }, 'warning')
}
