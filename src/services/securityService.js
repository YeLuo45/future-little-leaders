/**
 * V29 Security Service
 * Two-factor verification and security operations (mock implementation)
 */

import { auditPointsChange, auditPasswordChange, auditAnomaly, createAuditLog, AUDIT_EVENTS } from '../utils/securityAudit.js'

/**
 * Verification types
 */
export const VERIFY_TYPES = {
  POINTS_CHANGE: 'points_change',     // Large points change requires verification
  PASSWORD_CHANGE: 'password_change', // Password modification requires SMS
  LOGIN_ALERT: 'login_alert',         // Login from unusual location
  DATA_EXPORT: 'data_export',         // Exporting user data
  ACCOUNT_DELETE: 'account_delete'    // Delete account
}

/**
 * Verification status
 */
export const VERIFY_STATUS = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
  EXPIRED: 'expired'
}

// Verification code storage (mock - use server in production)
const VERIFY_CODES_KEY = 'security_verify_codes'

/**
 * Get stored verification codes
 */
function getStoredCodes() {
  try {
    const stored = uni.getStorageSync(VERIFY_CODES_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

/**
 * Save verification codes
 */
function saveCodes(codes) {
  try {
    uni.setStorageSync(VERIFY_CODES_KEY, JSON.stringify(codes))
  } catch {
    console.warn('[V29] Failed to save verification codes')
  }
}

/**
 * Generate 6-digit verification code
 */
function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * Send verification code (mock - would integrate with SMS gateway)
 * @param {string} phone - Phone number to send code to
 * @param {string} type - Verification type
 * @returns {Promise<object>} - { success, message, code (only in mock/dev) }
 */
export async function sendVerifyCode(phone, type) {
  const code = generateCode()
  const now = Date.now()
  const expiresAt = now + 5 * 60 * 1000 // 5 minutes
  
  // Store code
  const codes = getStoredCodes()
  codes[phone] = {
    code,
    type,
    createdAt: now,
    expiresAt,
    attempts: 0
  }
  saveCodes(codes)
  
  // Log the sending (not the code itself)
  console.log('[V29] Verification code sent to:', maskPhone(phone))
  
  // In mock mode, return the code for testing
  // In production, this would call SMS gateway and NOT return the code
  return {
    success: true,
    message: 'Verification code sent',
    // Mock only - remove in production
    _mockCode: code
  }
}

/**
 * Verify code
 * @param {string} phone - Phone number
 * @param {string} code - User entered code
 * @param {string} type - Expected verification type
 * @returns {Promise<object>} - { success, message }
 */
export async function verifyCode(phone, code, type) {
  const codes = getStoredCodes()
  const stored = codes[phone]
  
  if (!stored) {
    return { success: false, message: 'No verification code sent' }
  }
  
  // Check type
  if (stored.type !== type) {
    return { success: false, message: 'Invalid verification type' }
  }
  
  // Check expiry
  if (Date.now() > stored.expiresAt) {
    delete codes[phone]
    saveCodes(codes)
    return { success: false, message: 'Verification code expired' }
  }
  
  // Check attempts
  if (stored.attempts >= 3) {
    delete codes[phone]
    saveCodes(codes)
    return { success: false, message: 'Too many attempts. Please request new code.' }
  }
  
  // Increment attempts
  stored.attempts++
  saveCodes(codes)
  
  // Verify code
  if (stored.code !== code) {
    return { success: false, message: 'Incorrect verification code' }
  }
  
  // Success - remove code
  delete codes[phone]
  saveCodes(codes)
  
  // Audit the verification
  createAuditLog(AUDIT_EVENTS.SECOND_FACTOR_VERIFY, { type, phone: maskPhone(phone) }, 'success')
  
  return { success: true, message: 'Verification successful' }
}

/**
 * Check if verification is required for given action
 * @param {string} type - Action type
 * @param {object} context - Additional context { pointsChange?, location? }
 * @returns {boolean} - Whether verification is required
 */
export function isVerificationRequired(type, context = {}) {
  switch (type) {
    case VERIFY_TYPES.POINTS_CHANGE:
      // Require verification for points change > 100
      return Math.abs(context.pointsChange || 0) > 100
    
    case VERIFY_TYPES.PASSWORD_CHANGE:
    case VERIFY_TYPES.ACCOUNT_DELETE:
      // Always require verification for sensitive operations
      return true
    
    case VERIFY_TYPES.LOGIN_ALERT:
      // Require verification for unusual location (mock)
      return context.isUnusualLocation || false
    
    default:
      return false
  }
}

/**
 * Mask phone for display
 */
function maskPhone(phone) {
  if (!phone) return ''
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length < 7) return phone
  return cleaned.slice(0, 3) + '****' + cleaned.slice(-4)
}

/**
 * Process points change with verification check
 * @param {number} currentPoints - Current points
 * @param {number} newPoints - New points
 * @param {string} reason - Reason for change
 * @param {string} userPhone - User phone for verification
 * @returns {Promise<object>} - { requiresVerification, pending, auditLog }
 */
export async function processPointsChangeWithVerify(currentPoints, newPoints, reason, userPhone) {
  const change = newPoints - currentPoints
  
  if (!isVerificationRequired(VERIFY_TYPES.POINTS_CHANGE, { pointsChange: change })) {
    // No verification needed - process directly
    const auditLog = auditPointsChange(currentPoints, newPoints, reason)
    return { requiresVerification: false, pending: false, auditLog }
  }
  
  // Send verification code
  const sendResult = await sendVerifyCode(userPhone, VERIFY_TYPES.POINTS_CHANGE)
  
  return {
    requiresVerification: true,
    pending: true,
    verificationSent: sendResult.success,
    _mockCode: sendResult._mockCode // Mock only
  }
}

/**
 * Complete points change after verification
 * @param {string} phone - Phone used for verification
 * @param {string} code - Verification code
 * @param {number} currentPoints - Current points
 * @param {number} newPoints - New points
 * @param {string} reason - Reason for change
 * @returns {Promise<object>} - { success, message, auditLog }
 */
export async function completePointsChangeAfterVerify(phone, code, currentPoints, newPoints, reason) {
  const verifyResult = await verifyCode(phone, code, VERIFY_TYPES.POINTS_CHANGE)
  
  if (!verifyResult.success) {
    return { success: false, message: verifyResult.message }
  }
  
  // Process the points change
  const auditLog = auditPointsChange(currentPoints, newPoints, reason)
  return { success: true, message: 'Points changed successfully', auditLog }
}

/**
 * Process password change with verification
 * @param {string} userPhone - User phone for SMS verification
 * @returns {Promise<object>} - { success, verificationSent, _mockCode }
 */
export async function initiatePasswordChange(userPhone) {
  if (!isVerificationRequired(VERIFY_TYPES.PASSWORD_CHANGE)) {
    return { success: false, message: 'Verification not required' }
  }
  
  const sendResult = await sendVerifyCode(userPhone, VERIFY_TYPES.PASSWORD_CHANGE)
  
  return {
    success: sendResult.success,
    verificationSent: sendResult.success,
    _mockCode: sendResult._mockCode
  }
}

/**
 * Complete password change after verification
 * @param {string} phone - Phone used for verification
 * @param {string} code - Verification code
 * @param {string} newPasswordHash - New password (hashed, not plaintext)
 * @returns {Promise<object>} - { success, message }
 */
export async function completePasswordChangeAfterVerify(phone, code, newPasswordHash) {
  const verifyResult = await verifyCode(phone, code, VERIFY_TYPES.PASSWORD_CHANGE)
  
  if (!verifyResult.success) {
    return { success: false, message: verifyResult.message }
  }
  
  // In real app: update password via API
  // Here we just audit
  auditPasswordChange(true)
  
  return { success: true, message: 'Password changed successfully' }
}

/**
 * Check for unusual login location (mock)
 * @param {string} userId - User ID
 * @param {string} currentLocation - Current location (IP-based)
 * @returns {Promise<object>} - { isUnusual, requiresVerification }
 */
export async function checkLoginLocation(userId, currentLocation) {
  // Mock implementation
  // In production, compare with user's known login locations
  
  const knownLocations = uni.getStorageSync('known_locations_' + userId) || ['127.0.0.1']
  
  const isUnusual = !knownLocations.includes(currentLocation)
  
  if (isUnusual) {
    // Log anomaly
    auditAnomaly('unusual_login_location', {
      userId,
      location: currentLocation,
      knownLocations
    })
    
    return { isUnusual: true, requiresVerification: true }
  }
  
  return { isUnusual: false, requiresVerification: false }
}

/**
 * Add known location for user (call after successful login)
 */
export function addKnownLocation(userId, location) {
  const key = 'known_locations_' + userId
  const locations = uni.getStorageSync(key) || []
  
  if (!locations.includes(location)) {
    locations.push(location)
    // Keep only last 5 locations
    const trimmed = locations.slice(-5)
    uni.setStorageSync(key, trimmed)
  }
}
