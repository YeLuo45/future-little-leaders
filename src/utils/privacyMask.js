/**
 * V29 Privacy Mask Utility
 * Privacy data masking for sensitive information
 */

/**
 * Mask phone number, showing only first 3 and last 4 digits
 * @param {string} phone - Phone number
 * @returns {string} - Masked phone number e.g. "138****5678"
 */
export function maskPhone(phone) {
  if (!phone || typeof phone !== 'string') return ''
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length < 7) return phone
  return cleaned.slice(0, 3) + '****' + cleaned.slice(-4)
}

/**
 * Mask child name - show only first and last character
 * @param {string} name - Child name
 * @param {boolean} fullDisplay - If true, show full name (for necessary scenarios)
 * @returns {string} - Masked name e.g. "李**" or full name if fullDisplay=true
 */
export function maskName(name, fullDisplay = false) {
  if (!name || typeof name !== 'string') return ''
  if (fullDisplay) return name
  const chars = name.trim()
  if (chars.length === 1) return chars + '*'
  if (chars.length === 2) return chars
  return chars[0] + '*'.repeat(chars.length - 2) + chars[chars.length - 1]
}

/**
 * Mask ID card number
 * @param {string} idCard - ID card number
 * @returns {string} - Masked ID card e.g. "110***********1234"
 */
export function maskIdCard(idCard) {
  if (!idCard || typeof idCard !== 'string') return ''
  const cleaned = idCard.replace(/\D/g, '')
  if (cleaned.length < 8) return idCard
  return cleaned.slice(0, 3) + '*'.repeat(cleaned.length - 7) + cleaned.slice(-4)
}

/**
 * Mask email address
 * @param {string} email - Email address
 * @returns {string} - Masked email e.g. "t***@example.com"
 */
export function maskEmail(email) {
  if (!email || typeof email !== 'string') return ''
  const parts = email.split('@')
  if (parts.length !== 2) return email
  const local = parts[0]
  const domain = parts[1]
  if (local.length <= 2) return email
  return local[0] + '*'.repeat(Math.min(local.length - 1, 5)) + '@' + domain
}

/**
 * Sanitize log message - remove sensitive fields
 * @param {string|object} message - Log message or object
 * @returns {string} - Sanitized log message
 */
export function sanitizeLog(message) {
  if (!message) return ''
  
  const sensitiveFields = [
    'password', 'passwd', 'pwd', 'secret', 'token', 'apiKey', 'apikey',
    'phone', 'mobile', 'tel', 'idCard', 'id_number', 'identity',
    'name', 'realName', 'email', 'address', 'bankCard', 'cardNo'
  ]
  
  if (typeof message === 'object') {
    const sanitized = {}
    for (const key in message) {
      if (sensitiveFields.some(f => key.toLowerCase().includes(f.toLowerCase()))) {
        sanitized[key] = '***MASKED***'
      } else if (typeof message[key] === 'object') {
        sanitized[key] = sanitizeLog(message[key])
      } else {
        sanitized[key] = message[key]
      }
    }
    return JSON.stringify(sanitized)
  }
  
  return String(message)
}

/**
 * Mask points value for display
 * @param {number} points - Points value
 * @returns {string} - Masked points if needed
 */
export function maskPoints(points) {
  if (typeof points !== 'number') return '0'
  return points.toLocaleString()
}
