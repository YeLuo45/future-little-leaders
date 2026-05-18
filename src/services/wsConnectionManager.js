// src/services/wsConnectionManager.js
// V32 WebSocket Connection Manager — 自动重连、心跳保活、多端同步

import { ref, computed } from 'vue'

// ============================================================================
// Connection States
// ============================================================================
export const ConnectionState = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  RECONNECTING: 'reconnecting',
  ERROR: 'error'
}

// ============================================================================
// Event Types
// ============================================================================
export const EventTypes = {
  TASK_COMPLETED: 'task.completed',
  POINTS_CHANGED: 'points.changed',
  ACHIEVEMENT_UNLOCKED: 'achievement.unlocked',
  SYNC_REQUIRED: 'sync.required',
  PRESENCE_UPDATE: 'presence.update'
}

// ============================================================================
// WebSocket Connection Manager (Singleton)
// ============================================================================
class WSConnectionManager {
  constructor() {
    // Connection state
    this.state = ref(ConnectionState.DISCONNECTED)
    this.isConnected = computed(() => this.state.value === ConnectionState.CONNECTED)
    this.isConnecting = computed(() => this.state.value === ConnectionState.CONNECTING)
    this.isReconnecting = computed(() => this.state.value === ConnectionState.RECONNECTING)
    
    // Configuration
    this.config = {
      url: null,
      reconnect: true,
      reconnectInterval: 1000,
      maxReconnectInterval: 30000,
      reconnectDecay: 1.5,
      maxReconnectAttempts: 10,
      heartbeatInterval: 30000,
      heartbeatTimeout: 5000
    }
    
    // Internal state
    this._socket = null
    this._reconnectAttempts = 0
    this._reconnectTimer = null
    this._heartbeatTimer = null
    this._heartbeatTimeoutTimer = null
    this._eventHandlers = new Map()
    this._presenceDevices = new Map()
    this._lastPongTime = null
    
    // Message queue for offline buffering
    this._messageQueue = []
  }

  // --------------------------------------------------------------------------
  // Public API
  // --------------------------------------------------------------------------

  /**
   * Connect to WebSocket server
   * @param {string} url - WebSocket server URL
   * @param {object} options - Connection options
   */
  connect(url, options = {}) {
    if (this.state.value === ConnectionState.CONNECTED || 
        this.state.value === ConnectionState.CONNECTING) {
      console.warn('[WS] Already connected or connecting')
      return
    }

    this.config.url = url
    Object.assign(this.config, options)
    this._reconnectAttempts = 0

    this._doConnect()
  }

  /**
   * Disconnect from server
   */
  disconnect() {
    this.config.reconnect = false
    this._clearTimers()
    this._closeSocket()
    this.state.value = ConnectionState.DISCONNECTED
    console.log('[WS] Disconnected')
  }

  /**
   * Send message through WebSocket
   * @param {string|object} data - Message to send
   * @returns {boolean} - Whether message was sent
   */
  send(data) {
    const message = typeof data === 'string' ? data : JSON.stringify(data)
    
    if (this.state.value !== ConnectionState.CONNECTED) {
      // Queue message for later
      this._messageQueue.push(message)
      console.log('[WS] Message queued (offline):', message)
      return false
    }

    try {
      this._socket.send(message)
      return true
    } catch (err) {
      console.error('[WS] Send error:', err)
      return false
    }
  }

  /**
   * Subscribe to event
   * @param {string} eventType - Event type to subscribe
   * @param {Function} handler - Event handler callback
   */
  on(eventType, handler) {
    if (!this._eventHandlers.has(eventType)) {
      this._eventHandlers.set(eventType, [])
    }
    this._eventHandlers.get(eventType).push(handler)
  }

  /**
   * Unsubscribe from event
   * @param {string} eventType - Event type
   * @param {Function} handler - Handler to remove
   */
  off(eventType, handler) {
    const handlers = this._eventHandlers.get(eventType)
    if (handlers) {
      const index = handlers.indexOf(handler)
      if (index > -1) {
        handlers.splice(index, 1)
      }
    }
  }

  /**
   * Get online devices (presence)
   * @returns {Array} - List of online devices
   */
  getOnlineDevices() {
    return Array.from(this._presenceDevices.values())
  }

  /**
   * Update local presence
   * @param {object} deviceInfo - Device information
   */
  updatePresence(deviceInfo) {
    const deviceId = deviceInfo.deviceId || 'unknown'
    this._presenceDevices.set(deviceId, {
      ...deviceInfo,
      lastSeen: Date.now()
    })
    
    // Broadcast presence update
    this._broadcast(EventTypes.PRESENCE_UPDATE, {
      deviceId,
      ...deviceInfo,
      timestamp: Date.now()
    })
  }

  // --------------------------------------------------------------------------
  // Mock Connect/Disconnect (for demo without real server)
  // --------------------------------------------------------------------------

  /**
   * Mock connect — simulates connection without real server
   */
  mockConnect() {
    this.state.value = ConnectionState.CONNECTING
    console.log('[WS] Mock connecting...')

    setTimeout(() => {
      this.state.value = ConnectionState.CONNECTED
      this._reconnectAttempts = 0
      console.log('[WS] Mock connected')
      
      // Start heartbeat
      this._startHeartbeat()
      
      // Flush queued messages
      this._flushMessageQueue()
      
      // Emit mock presence
      this._emitMockPresence()
    }, 500)
  }

  /**
   * Mock disconnect
   */
  mockDisconnect() {
    this._clearTimers()
    this.state.value = ConnectionState.DISCONNECTED
    this._socket = null
    console.log('[WS] Mock disconnected')
  }

  /**
   * Simulate reconnect
   */
  mockReconnect() {
    if (this.state.value === ConnectionState.CONNECTED) {
      this.mockDisconnect()
    }
    
    this.state.value = ConnectionState.RECONNECTING
    console.log('[WS] Mock reconnecting...')

    setTimeout(() => {
      this.mockConnect()
    }, 1000)
  }

  /**
   * Simulate random event (for testing)
   * @param {string} eventType - Event type
   * @param {object} data - Event data
   */
  simulateEvent(eventType, data) {
    if (this.state.value !== ConnectionState.CONNECTED) {
      console.warn('[WS] Cannot simulate event: not connected')
      return
    }
    this._emit(eventType, data)
  }

  // --------------------------------------------------------------------------
  // Private Methods
  // --------------------------------------------------------------------------

  _doConnect() {
    this.state.value = ConnectionState.CONNECTING
    console.log('[WS] Connecting to:', this.config.url)

    try {
      // Mock: use native WebSocket if available, otherwise simulate
      if (typeof WebSocket !== 'undefined') {
        this._socket = new WebSocket(this.config.url)
        this._setupSocketHandlers()
      } else {
        // Fallback to mock
        setTimeout(() => this.mockConnect(), 100)
      }
    } catch (err) {
      console.error('[WS] Connection error:', err)
      this.state.value = ConnectionState.ERROR
      this._scheduleReconnect()
    }
  }

  _setupSocketHandlers() {
    if (!this._socket) return

    this._socket.onopen = () => {
      console.log('[WS] Connected')
      this.state.value = ConnectionState.CONNECTED
      this._reconnectAttempts = 0
      this._startHeartbeat()
      this._flushMessageQueue()
    }

    this._socket.onclose = (event) => {
      console.log('[WS] Connection closed:', event.code, event.reason)
      this._clearTimers()
      this.state.value = ConnectionState.DISCONNECTED
      this._scheduleReconnect()
    }

    this._socket.onerror = (err) => {
      console.error('[WS] Error:', err)
      this.state.value = ConnectionState.ERROR
    }

    this._socket.onmessage = (event) => {
      this._handleMessage(event.data)
    }
  }

  _handleMessage(data) {
    try {
      const message = JSON.parse(data)
      const { type, payload } = message
      
      // Handle heartbeat pong
      if (type === 'pong') {
        this._lastPongTime = Date.now()
        this._clearHeartbeatTimeout()
        return
      }

      // Emit to handlers
      this._emit(type, payload)
    } catch (err) {
      console.error('[WS] Failed to parse message:', err)
    }
  }

  _emit(type, payload) {
    const handlers = this._eventHandlers.get(type)
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(payload)
        } catch (err) {
          console.error(`[WS] Handler error for ${type}:`, err)
        }
      })
    }

    // Also emit to global listeners
    const globalHandlers = this._eventHandlers.get('*')
    if (globalHandlers) {
      globalHandlers.forEach(handler => {
        try {
          handler({ type, payload })
        } catch (err) {
          console.error('[WS] Global handler error:', err)
        }
      })
    }
  }

  _broadcast(type, payload) {
    const message = JSON.stringify({ type, payload })
    if (this.state.value === ConnectionState.CONNECTED && this._socket) {
      this._socket.send(message)
    }
  }

  _scheduleReconnect() {
    if (!this.config.reconnect) return
    if (this._reconnectAttempts >= this.config.maxReconnectAttempts) {
      console.log('[WS] Max reconnect attempts reached')
      return
    }

    // Exponential backoff
    const delay = Math.min(
      this.config.reconnectInterval * Math.pow(this.config.reconnectDecay, this._reconnectAttempts),
      this.config.maxReconnectInterval
    )

    console.log(`[WS] Reconnecting in ${delay}ms (attempt ${this._reconnectAttempts + 1})`)
    this.state.value = ConnectionState.RECONNECTING

    this._reconnectTimer = setTimeout(() => {
      this._reconnectAttempts++
      this._doConnect()
    }, delay)
  }

  _closeSocket() {
    if (this._socket) {
      try {
        this._socket.close()
      } catch (err) {
        console.error('[WS] Error closing socket:', err)
      }
      this._socket = null
    }
  }

  _clearTimers() {
    clearTimeout(this._reconnectTimer)
    clearInterval(this._heartbeatTimer)
    clearTimeout(this._heartbeatTimeoutTimer)
  }

  _startHeartbeat() {
    this._clearHeartbeatTimeout()
    
    this._heartbeatTimer = setInterval(() => {
      if (this.state.value === ConnectionState.CONNECTED) {
        this._sendPing()
      }
    }, this.config.heartbeatInterval)
  }

  _sendPing() {
    try {
      this._socket.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }))
      
      // Set timeout for pong response
      this._heartbeatTimeoutTimer = setTimeout(() => {
        console.warn('[WS] Heartbeat timeout, reconnecting...')
        this._closeSocket()
        this._scheduleReconnect()
      }, this.config.heartbeatTimeout)
    } catch (err) {
      console.error('[WS] Ping error:', err)
    }
  }

  _clearHeartbeatTimeout() {
    if (this._heartbeatTimeoutTimer) {
      clearTimeout(this._heartbeatTimeoutTimer)
      this._heartbeatTimeoutTimer = null
    }
  }

  _flushMessageQueue() {
    while (this._messageQueue.length > 0 && this.state.value === ConnectionState.CONNECTED) {
      const message = this._messageQueue.shift()
      this.send(message)
    }
  }

  _emitMockPresence() {
    const devices = [
      { deviceId: 'parent-phone', deviceName: '爸爸的手机', type: 'parent', online: true },
      { deviceId: 'child-tablet', deviceName: '孩子的平板', type: 'child', online: true }
    ]
    
    devices.forEach(device => {
      this._presenceDevices.set(device.deviceId, {
        ...device,
        lastSeen: Date.now()
      })
    })

    this._emit(EventTypes.PRESENCE_UPDATE, {
      devices: Array.from(this._presenceDevices.values()),
      timestamp: Date.now()
    })
  }
}

// ============================================================================
// Singleton Export
// ============================================================================
const wsConnectionManager = new WSConnectionManager()

export default wsConnectionManager

// Named exports for convenience
export { wsConnectionManager, ConnectionState, EventTypes }
