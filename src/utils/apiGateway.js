/**
 * V31 API Gateway + Rate Limiting
 * Unified API entry point with routing, auth, logging, and anti-scraping
 * 
 * Architecture:
 * - /api/* → Gateway → Backend Services
 * - Token Bucket rate limiting
 * - Request/Response logging with data masking
 * - Anti-scraping protection
 */

import { createRateLimiter, RATE_LIMIT_RESPONSE } from '../middleware/rateLimit.js'

// ============================================================================
// API Gateway Configuration
// ============================================================================

const API_GATEWAY_CONFIG = {
  // Base URL for API requests
  baseURL: 'https://api.future-little-leaders.com',
  
  // Route definitions: path pattern → service mapping
  routes: {
    '/api/auth': 'auth-service',
    '/api/user': 'user-service',
    '/api/task': 'task-service',
    '/api/family': 'family-service',
    '/api/gamification': 'gamification-service',
    '/api/notification': 'notification-service'
  },
  
  // Default timeout in ms
  timeout: 10000,
  
  // Enable request logging
  enableLogging: true,
  
  // Enable anti-scraping
  enableAntiScraping: true,
  
  // Honeypot routes (trap for scrapers)
  honeypotRoutes: ['/api/admin/debug', '/api/internal/secret']
}

// ============================================================================
// Sensitive Data Masking
// ============================================================================

const SENSITIVE_FIELDS = [
  'password', 'token', 'accessToken', 'refreshToken', 'secret',
  'phone', 'mobile', 'email', 'idCard', 'bankCard',
  'creditCard', 'cvv', 'address', 'realName'
]

/**
 * Mask sensitive data in objects
 * @param {any} data - Data to mask
 * @param {number} depth - Current recursion depth
 * @returns {any} - Masked data
 */
function maskSensitiveData(data, depth = 0) {
  if (depth > 5) return '[MAX_DEPTH]'
  if (data === null || data === undefined) return data
  
  if (Array.isArray(data)) {
    return data.map(item => maskSensitiveData(item, depth + 1))
  }
  
  if (typeof data === 'object') {
    const masked = {}
    for (const [key, value] of Object.entries(data)) {
      if (SENSITIVE_FIELDS.some(f => key.toLowerCase().includes(f.toLowerCase()))) {
        masked[key] = '***MASKED***'
      } else if (typeof value === 'object') {
        masked[key] = maskSensitiveData(value, depth + 1)
      } else {
        masked[key] = value
      }
    }
    return masked
  }
  
  return data
}

// ============================================================================
// Request Logger
// ============================================================================

class RequestLogger {
  constructor(enabled = true) {
    this.enabled = enabled
    this.logs = []
    this.maxLogs = 100
  }
  
  /**
   * Log an API request
   */
  logRequest(request) {
    if (!this.enabled) return
    
    const entry = {
      id: this.generateId(),
      timestamp: Date.now(),
      method: request.method || 'GET',
      path: request.path || request.url,
      status: request.status,
      duration: request.duration || 0,
      requestSize: this.getSize(request.data),
      responseSize: this.getSize(request.response),
      userId: request.userId,
      ip: request.ip,
      userAgent: request.userAgent,
      error: request.error
    }
    
    this.logs.push(entry)
    if (this.logs.length > this.maxLogs) {
      this.logs.shift()
    }
    
    // Console output with formatting
    this.outputLog(entry)
    
    return entry
  }
  
  /**
   * Output log entry to console
   */
  outputLog(entry) {
    const status = entry.status || '---'
    const duration = entry.duration ? `${entry.duration}ms` : '---'
    const statusIcon = this.getStatusIcon(entry.status)
    
    console.log(
      `%c[API Gateway]%c ${statusIcon} ${entry.method} ${entry.path} ${status} ${duration}`,
      'color: #1890ff; font-weight: bold',
      `color: ${this.getStatusColor(entry.status)}`
    )
    
    if (entry.error) {
      console.error('[API Gateway] Error:', entry.error)
    }
  }
  
  getStatusIcon(status) {
    if (!status) return '⏳'
    if (status >= 200 && status < 300) return '✅'
    if (status >= 400 && status < 500) return '⚠️'
    if (status >= 500) return '❌'
    if (status === 429) return '🚫'
    return '❓'
  }
  
  getStatusColor(status) {
    if (!status) return '#666'
    if (status >= 200 && status < 300) return '#52c41a'
    if (status >= 400 && status < 500) return '#faad14'
    if (status >= 500) return '#ff4d4f'
    if (status === 429) return '#f5222d'
    return '#666'
  }
  
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
  }
  
  getSize(data) {
    if (!data) return 0
    if (typeof data === 'string') return data.length
    return JSON.stringify(data).length
  }
  
  /**
   * Get all logs
   */
  getLogs() {
    return [...this.logs]
  }
  
  /**
   * Clear logs
   */
  clearLogs() {
    this.logs = []
  }
  
  /**
   * Get logs filtered by criteria
   */
  queryLogs(criteria = {}) {
    return this.logs.filter(log => {
      if (criteria.method && log.method !== criteria.method) return false
      if (criteria.path && !log.path.includes(criteria.path)) return false
      if (criteria.status && log.status !== criteria.status) return false
      if (criteria.userId && log.userId !== criteria.userId) return false
      if (criteria.startTime && log.timestamp < criteria.startTime) return false
      if (criteria.endTime && log.timestamp > criteria.endTime) return false
      return true
    })
  }
}

// ============================================================================
// Anti-Scraping Protection
// ============================================================================

class AntiScraping {
  constructor(config = {}) {
    this.enabled = config.enabled ?? true
    // Suspicious User-Agent patterns
    this.suspiciousAgents = [
      /scraper/i, /crawler/i, /spider/i, /bot/i, /curl/i,
      /python-requests/i, /java\//i, /go-http/i, /node-fetch/i,
      /wget/i, /httpclient/i, /libwww/i
    ]
    // Track error counts per identifier
    this.errorCounts = {}
    this.errorThreshold = 10 // Errors before potential ban
    this.errorWindow = 60000 // 1 minute window
  }
  
  /**
   * Check if request is suspicious
   */
  check(request) {
    if (!this.enabled) return { suspicious: false }
    
    const reasons = []
    
    // Check User-Agent
    if (this.isSuspiciousUA(request.headers?.['user-agent'])) {
      reasons.push('suspicious_ua')
    }
    
    // Check for honeypot routes
    if (this.isHoneypotRoute(request.path)) {
      reasons.push('honeypot')
    }
    
    // Check error frequency
    const identifier = request.ip || request.userId || 'unknown'
    if (this.hasHighErrorRate(identifier)) {
      reasons.push('high_error_rate')
    }
    
    return {
      suspicious: reasons.length > 0,
      reasons,
      shouldBlock: reasons.includes('honeypot') || reasons.includes('high_error_rate')
    }
  }
  
  isSuspiciousUA(ua) {
    if (!ua) return true // No UA is suspicious
    return this.suspiciousAgents.some(pattern => pattern.test(ua))
  }
  
  isHoneypotRoute(path) {
    return API_GATEWAY_CONFIG.honeypotRoutes.includes(path)
  }
  
  /**
   * Record an error for a request
   */
  recordError(identifier) {
    const now = Date.now()
    if (!this.errorCounts[identifier]) {
      this.errorCounts[identifier] = []
    }
    this.errorCounts[identifier].push(now)
    // Clean old entries
    this.errorCounts[identifier] = this.errorCounts[identifier].filter(
      t => now - t < this.errorWindow
    )
  }
  
  hasHighErrorRate(identifier) {
    const errors = this.errorCounts[identifier] || []
    return errors.length >= this.errorThreshold
  }
  
  /**
   * Get error count for identifier
   */
  getErrorCount(identifier) {
    return (this.errorCounts[identifier] || []).length
  }
}

// ============================================================================
// JWT Token Utilities (Mock Implementation)
// ============================================================================

const JWT_CONFIG = {
  secret: 'future-little-leaders-secret-key', // In production, use env variable
  algorithm: 'HS256'
}

/**
 * Parse JWT token (without verification for client-side)
 */
function parseJWT(token) {
  if (!token) return null
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
    return payload
  } catch {
    return null
  }
}

/**
 * Check if token is expired
 */
function isTokenExpired(token) {
  const payload = parseJWT(token)
  if (!payload || !payload.exp) return true
  return Date.now() >= payload.exp * 1000
}

/**
 * Get user ID from token
 */
function getUserIdFromToken(token) {
  const payload = parseJWT(token)
  return payload?.sub || payload?.userId || null
}

// ============================================================================
// API Gateway Class
// ============================================================================

class APIGateway {
  constructor(config = {}) {
    this.config = { ...API_GATEWAY_CONFIG, ...config }
    this.logger = new RequestLogger(this.config.enableLogging)
    this.antiScraping = new AntiScraping({ enabled: this.config.enableAntiScraping })
    // Rate limiters by key type
    this.rateLimiters = {
      ip: createRateLimiter({ key: 'ip', windowMs: 60000, maxRequests: 100 }),
      user: createRateLimiter({ key: 'user', windowMs: 60000, maxRequests: 60 }),
      apiKey: createRateLimiter({ key: 'apiKey', windowMs: 1000, maxRequests: 10 })
    }
  }
  
  /**
   * Get rate limiter by type
   */
  getRateLimiter(type = 'ip') {
    return this.rateLimiters[type] || this.rateLimiters.ip
  }
  
  /**
   * Configure rate limiter
   */
  configureRateLimit(type, options) {
    this.rateLimiters[type] = createRateLimiter({ key: type, ...options })
  }
  
  /**
   * Check rate limit for request
   */
  checkRateLimit(request) {
    // Determine limiter key based on available info
    let limiterType = 'ip'
    let identifier = request.ip || this.getClientIP(request)
    
    if (request.headers?.['x-api-key']) {
      limiterType = 'apiKey'
      identifier = request.headers['x-api-key']
    } else if (request.userId) {
      limiterType = 'user'
      identifier = request.userId
    }
    
    const limiter = this.getRateLimiter(limiterType)
    const result = limiter.check(identifier)
    
    return {
      ...result,
      limiterType,
      identifier
    }
  }
  
  getClientIP(request) {
    return request.ip || 
           request.headers?.['x-forwarded-for']?.split(',')[0] ||
           request.headers?.['x-real-ip'] ||
           '127.0.0.1'
  }
  
  /**
   * Determine target service from path
   */
  route(path) {
    for (const [pattern, service] of Object.entries(this.config.routes)) {
      if (path.startsWith(pattern)) {
        return service
      }
    }
    return 'unknown'
  }
  
  /**
   * Validate JWT token
   */
  validateToken(token) {
    if (!token) {
      return { valid: false, reason: 'no_token' }
    }
    
    if (isTokenExpired(token)) {
      return { valid: false, reason: 'token_expired' }
    }
    
    // In production, verify signature here
    // For client-side mock, just check expiry
    const payload = parseJWT(token)
    if (!payload) {
      return { valid: false, reason: 'invalid_token' }
    }
    
    return { valid: true, payload }
  }
  
  /**
   * Extract token from request
   */
  extractToken(request) {
    const authHeader = request.headers?.authorization
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.slice(7)
    }
    return request.headers?.['x-access-token'] || request.token
  }
  
  /**
   * Process request through gateway
   */
  async processRequest(requestConfig) {
    const startTime = Date.now()
    const requestId = this.logger.generateId()
    
    // Build normalized request object
    const request = {
      id: requestId,
      method: requestConfig.method || 'GET',
      path: requestConfig.path || requestConfig.url,
      headers: requestConfig.header || requestConfig.headers || {},
      data: requestConfig.data,
      userId: requestConfig.userId,
      ip: this.getClientIP(requestConfig),
      userAgent: (requestConfig.header || requestConfig.headers || {})['user-agent']
    }
    
    // Step 1: Anti-scraping check
    const scrapResult = this.antiScraping.check(request)
    if (scrapResult.shouldBlock) {
      return this.createErrorResponse(403, 'Request blocked', {
        code: 'BLOCKED',
        reason: scrapResult.reasons.join(',')
      }, startTime, request)
    }
    
    // Step 2: Rate limiting
    const rateLimitResult = this.checkRateLimit(request)
    if (rateLimitResult.limited) {
      return this.createRateLimitResponse(rateLimitResult, startTime, request)
    }
    
    // Step 3: Authentication (if required)
    if (requestConfig.requiresAuth !== false) {
      const token = this.extractToken(requestConfig)
      const tokenResult = this.validateToken(token)
      if (!tokenResult.valid) {
        return this.createErrorResponse(401, 'Unauthorized', {
          code: 'AUTH_FAILED',
          reason: tokenResult.reason
        }, startTime, request)
      }
      request.userId = tokenResult.payload.sub || tokenResult.payload.userId
    }
    
    // Step 4: Execute actual request
    try {
      const response = await this.executeRequest(requestConfig)
      
      // Record success
      const duration = Date.now() - startTime
      request.status = response.statusCode || response.status || 200
      request.duration = duration
      request.response = response.data
      
      this.logger.logRequest(request)
      
      return response
    } catch (error) {
      // Record error
      this.antiScraping.recordError(request.ip || request.userId || 'unknown')
      
      const duration = Date.now() - startTime
      request.status = error.statusCode || error.status || 500
      request.duration = duration
      request.error = error.message
      
      this.logger.logRequest(request)
      
      return this.createErrorResponse(
        request.status,
        error.message || 'Request failed',
        { code: 'REQUEST_FAILED' },
        startTime,
        request
      )
    }
  }
  
  /**
   * Execute the actual HTTP request
   */
  executeRequest(requestConfig) {
    return new Promise((resolve, reject) => {
      const url = requestConfig.path?.startsWith('http')
        ? requestConfig.path
        : this.config.baseURL + requestConfig.path
      
      const options = {
        url,
        method: requestConfig.method || 'GET',
        header: requestConfig.header || requestConfig.headers || {},
        data: requestConfig.data,
        timeout: requestConfig.timeout || this.config.timeout,
        success: (res) => resolve(res),
        fail: (err) => reject(err)
      }
      
      // Use uni.request for uni-app
      if (typeof uni !== 'undefined' && uni.request) {
        uni.request(options)
      } else if (typeof fetch !== 'undefined') {
        // Fallback to fetch for non-uni-app
        fetch(url, {
          method: options.method,
          headers: options.header,
          body: options.data ? JSON.stringify(options.data) : undefined
        })
          .then(res => res.json().then(data => resolve({ statusCode: res.status, data })))
          .catch(reject)
      } else {
        reject(new Error('No HTTP client available'))
      }
    })
  }
  
  /**
   * Create error response
   */
  createErrorResponse(status, message, extra = {}, startTime, request) {
    const response = {
      statusCode: status,
      data: {
        success: false,
        message,
        ...extra,
        timestamp: Date.now(),
        duration: Date.now() - startTime
      }
    }
    
    if (request) {
      request.status = status
      request.duration = Date.now() - startTime
      request.response = response.data
      this.logger.logRequest(request)
    }
    
    return response
  }
  
  /**
   * Create rate limit response (429)
   */
  createRateLimitResponse(rateLimitResult, startTime, request) {
    const retryAfter = Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
    
    const response = {
      statusCode: 429,
      header: {
        'Retry-After': retryAfter.toString(),
        'X-RateLimit-Limit': rateLimitResult.limit.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': rateLimitResult.resetTime.toString()
      },
      data: {
        success: false,
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests. Please try again later.',
        retryAfter,
        limit: rateLimitResult.limit,
        windowMs: rateLimitResult.windowMs
      }
    }
    
    if (request) {
      request.status = 429
      request.duration = Date.now() - startTime
      request.response = response.data
      this.logger.logRequest(request)
    }
    
    return response
  }
  
  /**
   * Get gateway logs
   */
  getLogs(criteria) {
    return this.logger.queryLogs(criteria)
  }
  
  /**
   * Get gateway stats
   */
  getStats() {
    return {
      totalRequests: this.logger.logs.length,
      recentLogs: this.logger.getLogs().slice(-10),
      rateLimitTypes: Object.keys(this.rateLimiters)
    }
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

const apiGateway = new APIGateway()

export default apiGateway

// Named exports for individual components
export { APIGateway, RequestLogger, AntiScraping, maskSensitiveData }

// Export config for external access
export { API_GATEWAY_CONFIG, RATE_LIMIT_RESPONSE }
