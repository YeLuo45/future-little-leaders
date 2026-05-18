// src/utils/heartbeat.js
// V32 Heartbeat Utility — 心跳保活机制

/**
 * Heartbeat Manager
 * 
 * 提供独立的心跳保活机制，可配合 WebSocket 或其他需要保活的连接使用
 * 
 * Features:
 * - Configurable interval and timeout
 * - Automatic recovery on timeout
 * - Callback hooks for connect/disconnect/timeout events
 * - Pause/Resume functionality
 */

export class HeartbeatManager {
  constructor(options = {}) {
    // Configuration
    this.interval = options.interval || 30000 // 30 seconds default
    this.timeout = options.timeout || 5000 // 5 seconds for pong response
    this.maxMissed = options.maxMissed || 3 // Max missed pongs before considering dead
    
    // State
    this._timer = null
    this._timeoutTimer = null
    this._isRunning = false
    this._missedCount = 0
    this._lastPingTime = null
    this._lastPongTime = null
    
    // Callbacks
    this.onPing = options.onPing || (() => {})
    this.onPong = options.onPong || (() => {})
    this.onTimeout = options.onTimeout || (() => {})
    this.onRecovery = options.onRecovery || (() => {})
    this.onMaxMissed = options.onMaxMissed || (() => {})
  }

  // --------------------------------------------------------------------------
  // Public API
  // --------------------------------------------------------------------------

  /**
   * Start heartbeat
   */
  start() {
    if (this._isRunning) {
      console.warn('[Heartbeat] Already running')
      return
    }

    this._isRunning = true
    this._missedCount = 0
    console.log('[Heartbeat] Started')
    
    // Send initial ping
    this._sendPing()
    
    // Start interval
    this._scheduleNext()
  }

  /**
   * Stop heartbeat
   */
  stop() {
    this._clearTimers()
    this._isRunning = false
    this._missedCount = 0
    console.log('[Heartbeat] Stopped')
  }

  /**
   * Pause heartbeat (keeps state but stops sending)
   */
  pause() {
    if (!this._isRunning) return
    
    this._clearTimers()
    this._isRunning = false
    console.log('[Heartbeat] Paused')
  }

  /**
   * Resume heartbeat
   */
  resume() {
    if (this._isRunning) {
      console.warn('[Heartbeat] Already running')
      return
    }

    this._isRunning = true
    console.log('[Heartbeat] Resumed')
    this._sendPing()
    this._scheduleNext()
  }

  /**
   * Record pong response (call when you receive pong)
   * @param {number} timestamp - Optional timestamp of pong received
   */
  recordPong(timestamp = Date.now()) {
    this._lastPongTime = timestamp
    this._missedCount = 0
    this._clearTimeout()
    
    const latency = timestamp - (this._lastPingTime || timestamp)
    this.onPong({ 
      latency,
      timestamp,
      missedCount: this._missedCount 
    })
  }

  /**
   * Get heartbeat status
   * @returns {object} - Current status
   */
  getStatus() {
    return {
      isRunning: this._isRunning,
      interval: this.interval,
      timeout: this.timeout,
      missedCount: this._missedCount,
      lastPingTime: this._lastPingTime,
      lastPongTime: this._lastPongTime,
      latency: this._lastPingTime && this._lastPongTime 
        ? this._lastPongTime - this._lastPingTime 
        : null,
      isHealthy: this._missedCount < this.maxMissed
    }
  }

  /**
   * Update configuration
   * @param {object} options - New options
   */
  updateConfig(options) {
    if (options.interval !== undefined) {
      this.interval = options.interval
    }
    if (options.timeout !== undefined) {
      this.timeout = options.timeout
    }
    if (options.maxMissed !== undefined) {
      this.maxMissed = options.maxMissed
    }
    
    // If running, restart with new config
    if (this._isRunning) {
      this.stop()
      this.start()
    }
  }

  // --------------------------------------------------------------------------
  // Private Methods
  // --------------------------------------------------------------------------

  _scheduleNext() {
    this._clearTimers()
    
    this._timer = setTimeout(() => {
      if (this._isRunning) {
        this._sendPing()
        this._scheduleNext()
      }
    }, this.interval)
  }

  _sendPing() {
    this._lastPingTime = Date.now()
    this._missedCount++
    
    this.onPing({ 
      timestamp: this._lastPingTime,
      missedCount: this._missedCount 
    })
    
    // Set timeout for pong response
    this._timeoutTimer = setTimeout(() => {
      this._handleTimeout()
    }, this.timeout)
  }

  _handleTimeout() {
    console.warn(`[Heartbeat] Pong timeout (missed: ${this._missedCount}/${this.maxMissed})`)
    
    this.onTimeout({ 
      missedCount: this._missedCount,
      timestamp: Date.now()
    })
    
    if (this._missedCount >= this.maxMissed) {
      console.error('[Heartbeat] Max missed pongs reached, connection considered dead')
      this.onMaxMissed({ 
        missedCount: this._missedCount,
        timestamp: Date.now()
      })
      this.stop()
    } else {
      // Try recovery
      this.onRecovery({ 
        missedCount: this._missedCount,
        timestamp: Date.now()
      })
    }
  }

  _clearTimers() {
    if (this._timer) {
      clearTimeout(this._timer)
      this._timer = null
    }
    this._clearTimeout()
  }

  _clearTimeout() {
    if (this._timeoutTimer) {
      clearTimeout(this._timeoutTimer)
      this._timeoutTimer = null
    }
  }
}

// ============================================================================
// Standalone Heartbeat Timer (simpler version)
// ============================================================================

/**
 * Create a simple interval-based heartbeat
 * @param {Function} onTick - Callback on each heartbeat
 * @param {number} intervalMs - Interval in milliseconds
 * @returns {object} - Controller with start/stop methods
 */
export function createHeartbeat(onTick, intervalMs = 30000) {
  let timer = null
  let tickCount = 0
  let isRunning = false

  return {
    start() {
      if (isRunning) return
      isRunning = true
      timer = setInterval(() => {
        tickCount++
        onTick({ tickCount, timestamp: Date.now() })
      }, intervalMs)
    },
    
    stop() {
      if (timer) {
        clearInterval(timer)
        timer = null
      }
      isRunning = false
      tickCount = 0
    },
    
    isRunning() {
      return isRunning
    },
    
    getTickCount() {
      return tickCount
    }
  }
}

// ============================================================================
// Default Export
// ============================================================================

export default HeartbeatManager
