/**
 * V31 Rate Limiting Middleware
 * Token Bucket algorithm implementation for uni-app
 * 
 * Features:
 * - Token Bucket algorithm
 * - Configurable limits per IP/User/API Key
 * - 429 Too Many Requests response
 * - Persistent storage using localStorage
 */

// ============================================================================
// Token Bucket Algorithm
// ============================================================================

/**
 * Token Bucket Rate Limiter
 * 
 * @param {Object} options
 * @param {string} options.key - Limiter identifier type (ip/user/apiKey)
 * @param {number} options.windowMs - Time window in milliseconds (default: 60000 = 1 min)
 * @param {number} options.maxRequests - Max requests per window (default: 100)
 * @param {number} options.bucketSize - Token bucket size (default: same as maxRequests)
 * @param {number} options.refillRate - Tokens added per second (default: bucketSize/windowMs * 1000)
 */
function createTokenBucket(options = {}) {
  const {
    key = 'default',
    windowMs = 60000,
    maxRequests = 100,
    bucketSize = maxRequests,
    refillRate = bucketSize / (windowMs / 1000)
  } = options
  
  // Storage key for persistence
  const STORAGE_KEY = `rate_limit_${key}`
  
  /**
   * Get bucket state from storage
   */
  function getBucket() {
    try {
      const stored = uni.getStorageSync(STORAGE_KEY)
      if (stored) {
        const bucket = JSON.parse(stored)
        // Check if bucket has expired
        if (Date.now() > bucket.expiresAt) {
          // Reset bucket
          return createFreshBucket()
        }
        return bucket
      }
    } catch (e) {
      console.warn('[RateLimit] Failed to load bucket:', e)
    }
    return createFreshBucket()
  }
  
  /**
   * Save bucket state to storage
   */
  function saveBucket(bucket) {
    try {
      uni.setStorageSync(STORAGE_KEY, JSON.stringify(bucket))
    } catch (e) {
      console.warn('[RateLimit] Failed to save bucket:', e)
    }
  }
  
  /**
   * Create fresh bucket state
   */
  function createFreshBucket() {
    return {
      tokens: bucketSize,
      lastRefill: Date.now(),
      expiresAt: Date.now() + windowMs,
      requestCount: 0
    }
  }
  
  /**
   * Refill tokens based on elapsed time
   */
  function refillTokens(bucket) {
    const now = Date.now()
    const elapsed = now - bucket.lastRefill
    
    if (elapsed > 0) {
      // Calculate tokens to add
      const tokensToAdd = (elapsed / 1000) * refillRate
      bucket.tokens = Math.min(bucketSize, bucket.tokens + tokensToAdd)
      bucket.lastRefill = now
    }
    
    return bucket
  }
  
  return {
    /**
     * Check if request is allowed and consume token if so
     * @param {string} identifier - IP/User/API Key identifier
     * @returns {Object} - { allowed, remaining, limit, resetTime, retryAfter }
     */
    check(identifier) {
      const bucketKey = `${STORAGE_KEY}_${identifier}`
      
      let bucket
      try {
        const stored = uni.getStorageSync(bucketKey)
        if (stored) {
          bucket = JSON.parse(stored)
          // Check if bucket has expired
          if (Date.now() > bucket.expiresAt) {
            bucket = createFreshBucket()
          }
        } else {
          bucket = createFreshBucket()
        }
      } catch (e) {
        bucket = createFreshBucket()
      }
      
      // Refill tokens
      bucket = refillTokens(bucket)
      
      // Check if we have tokens available
      if (bucket.tokens >= 1) {
        // Consume token
        bucket.tokens -= 1
        bucket.requestCount += 1
        bucket.expiresAt = Date.now() + windowMs
        
        // Save state
        try {
          uni.setStorageSync(bucketKey, JSON.stringify(bucket))
        } catch (e) {
          console.warn('[RateLimit] Failed to save bucket:', e)
        }
        
        return {
          allowed: true,
          remaining: Math.floor(bucket.tokens),
          limit: maxRequests,
          windowMs,
          resetTime: bucket.expiresAt,
          retryAfter: 0
        }
      } else {
        // No tokens available - rate limited
        const retryAfter = Math.ceil((bucket.expiresAt - Date.now()) / 1000)
        
        return {
          allowed: false,
          limited: true,
          remaining: 0,
          limit: maxRequests,
          windowMs,
          resetTime: bucket.expiresAt,
          retryAfter: Math.max(0, retryAfter)
        }
      }
    },
    
    /**
     * Reset limiter for a specific identifier
     */
    reset(identifier) {
      const bucketKey = `${STORAGE_KEY}_${identifier}`
      try {
        uni.removeStorageSync(bucketKey)
        return true
      } catch (e) {
        console.warn('[RateLimit] Failed to reset bucket:', e)
        return false
      }
    },
    
    /**
     * Reset all limiters
     */
    resetAll() {
      try {
        // Clear all rate limit keys
        const keys = uni.getStorageInfoSync().keys || []
        keys.forEach(k => {
          if (k.startsWith(STORAGE_KEY)) {
            uni.removeStorageSync(k)
          }
        })
        return true
      } catch (e) {
        console.warn('[RateLimit] Failed to reset all buckets:', e)
        return false
      }
    },
    
    /**
     * Get limiter statistics
     */
    getStats(identifier) {
      const bucketKey = `${STORAGE_KEY}_${identifier}`
      try {
        const stored = uni.getStorageSync(bucketKey)
        if (stored) {
          const bucket = JSON.parse(stored)
          return {
            tokens: bucket.tokens,
            requestCount: bucket.requestCount,
            resetTime: bucket.expiresAt,
            retryAfter: Math.max(0, Math.ceil((bucket.expiresAt - Date.now()) / 1000))
          }
        }
      } catch (e) {
        console.warn('[RateLimit] Failed to get stats:', e)
      }
      return null
    }
  }
}

// ============================================================================
// Pre-configured Rate Limiters
// ============================================================================

/**
 * IP-based rate limiter (100 requests per minute)
 */
const ipRateLimiter = createTokenBucket({
  key: 'ip',
  windowMs: 60000,
  maxRequests: 100
})

/**
 * User-based rate limiter (60 requests per minute)
 */
const userRateLimiter = createTokenBucket({
  key: 'user',
  windowMs: 60000,
  maxRequests: 60
})

/**
 * API Key-based rate limiter (10 requests per second)
 */
const apiKeyRateLimiter = createTokenBucket({
  key: 'apiKey',
  windowMs: 1000,
  maxRequests: 10
})

/**
 * Strict rate limiter for sensitive operations (5 requests per minute)
 */
const strictRateLimiter = createTokenBucket({
  key: 'strict',
  windowMs: 60000,
  maxRequests: 5
})

// ============================================================================
// Rate Limit Response Factory
// ============================================================================

/**
 * Create 429 Too Many Requests response
 */
function createRateLimitResponse(limitResult, customMessage) {
  return {
    statusCode: 429,
    status: 429,
    header: {
      'Content-Type': 'application/json',
      'Retry-After': limitResult.retryAfter.toString(),
      'X-RateLimit-Limit': limitResult.limit.toString(),
      'X-RateLimit-Remaining': limitResult.remaining.toString(),
      'X-RateLimit-Reset': limitResult.resetTime.toString()
    },
    data: {
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: customMessage || 'Too many requests. Please try again later.',
        retryAfter: limitResult.retryAfter,
        limit: limitResult.limit,
        windowMs: limitResult.windowMs
      }
    }
  }
}

/**
 * Create rate limit exceeded error object
 */
function createRateLimitError(limitResult) {
  return {
    isRateLimited: true,
    code: 'RATE_LIMIT_EXCEEDED',
    message: `Rate limit exceeded. Try again in ${limitResult.retryAfter} seconds.`,
    retryAfter: limitResult.retryAfter,
    limit: limitResult.limit,
    remaining: limitResult.remaining,
    resetTime: limitResult.resetTime
  }
}

// ============================================================================
// Rate Limit Middleware Factory
// ============================================================================

/**
 * Create rate limit middleware
 * 
 * @param {Object} options - Configuration options
 * @param {string} options.type - Limiter type ('ip', 'user', 'apiKey', 'strict', or 'custom')
 * @param {Function} options.keyGenerator - Custom function to generate identifier
 * @param {Object} options.customConfig - Custom limiter config when type='custom'
 * @returns {Function} - Middleware function
 */
function createRateLimitMiddleware(options = {}) {
  const {
    type = 'ip',
    keyGenerator = null,
    customConfig = null
  } = options
  
  // Get or create limiter
  let limiter
  if (type === 'custom' && customConfig) {
    limiter = createTokenBucket(customConfig)
  } else {
    switch (type) {
      case 'ip':
        limiter = ipRateLimiter
        break
      case 'user':
        limiter = userRateLimiter
        break
      case 'apiKey':
        limiter = apiKeyRateLimiter
        break
      case 'strict':
        limiter = strictRateLimiter
        break
      default:
        limiter = ipRateLimiter
    }
  }
  
  /**
   * Middleware function
   * @param {Object} request - Request object
   * @param {Object} response - Response object (optional, for H5/compat)
   * @returns {Object|null} - Rate limit result or null if allowed
   */
  return function rateLimitMiddleware(request, response) {
    // Generate identifier
    let identifier
    if (keyGenerator && typeof keyGenerator === 'function') {
      identifier = keyGenerator(request)
    } else {
      // Default identifier logic
      identifier = 
        request.headers?.['x-api-key'] ||
        request.headers?.['x-user-id'] ||
        request.userId ||
        request.ip ||
        request.clientIp ||
        getClientIP(request) ||
        'anonymous'
    }
    
    // Check rate limit
    const result = limiter.check(identifier)
    
    // Attach rate limit info to request
    request.rateLimit = result
    
    // Return error response if limited
    if (!result.allowed) {
      // For uni-app, we just return the result
      // The calling code should handle the 429 response
      return createRateLimitError(result)
    }
    
    return null // null means allowed
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get client IP from request
 */
function getClientIP(request) {
  return (
    request.headers?.['x-forwarded-for']?.split(',')[0] ||
    request.headers?.['x-real-ip'] ||
    request.headers?.['client-ip'] ||
    request.ip ||
    '127.0.0.1'
  )
}

/**
 * Async wrapper for middleware in Pinia/actions
 */
function withRateLimit(promise, options = {}) {
  const middleware = createRateLimitMiddleware(options)
  
  return async function rateLimitedAction(request) {
    const rateLimitResult = middleware(request)
    
    if (rateLimitResult?.isRateLimited) {
      return Promise.reject(rateLimitResult)
    }
    
    return promise(request)
  }
}

// ============================================================================
// Exports
// ============================================================================

export {
  createTokenBucket,
  createRateLimitMiddleware,
  createRateLimitResponse,
  createRateLimitError,
  ipRateLimiter,
  userRateLimiter,
  apiKeyRateLimiter,
  strictRateLimiter,
  withRateLimit,
  getClientIP
}

// Default export
export default createTokenBucket

// Constants for rate limit responses
export const RATE_LIMIT_RESPONSE = {
  CODE: 'RATE_LIMIT_EXCEEDED',
  MESSAGE: 'Too many requests. Please try again later.'
}
