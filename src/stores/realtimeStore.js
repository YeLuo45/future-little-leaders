// src/stores/realtimeStore.js
// V32 Real-time Store — 接收 WebSocket 事件，驱动 UI 实时更新

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import wsConnectionManager, { ConnectionState, EventTypes } from '@/services/wsConnectionManager.js'
import cloudFunctions from '@/services/cloudFunctions.js'

/**
 * V32 Real-time Store
 * 
 * 管理所有实时事件：
 * - 任务完成事件
 * - 积分变动事件
 * - 成就解锁事件
 * - 同步冲突事件
 * - 在线状态事件
 * 
 * 同时管理连接状态和通知队列
 */
export const useRealtimeStore = defineStore('realtime', () => {
  // ===========================================================================
  // Connection State
  // ===========================================================================
  const connectionState = ref(ConnectionState.DISCONNECTED)
  const isConnected = computed(() => connectionState.value === ConnectionState.CONNECTED)
  const isConnecting = computed(() => connectionState.value === ConnectionState.CONNECTING)
  const isReconnecting = computed(() => connectionState.value === ConnectionState.RECONNECTING)
  
  // ===========================================================================
  // Event State
  // ===========================================================================
  
  // Recent events (last 50)
  const recentEvents = ref([])
  
  // Task completed events
  const taskCompletedEvents = ref([])
  
  // Points change events
  const pointsChangeEvents = ref([])
  
  // Achievement unlock events
  const achievementEvents = ref([])
  
  // Presence (online devices)
  const onlineDevices = ref([])
  
  // Sync conflicts
  const syncConflicts = ref([])
  
  // ===========================================================================
  // Notification Queue (for UI toast display)
  // ===========================================================================
  const notificationQueue = ref([])
  const activeNotifications = ref([])
  const maxActiveNotifications = 3
  
  // ===========================================================================
  // Points Animation Queue (for floating +1 display)
  // ===========================================================================
  const pointsAnimations = ref([])
  
  // ===========================================================================
  // Cloud Function Results
  // ===========================================================================
  const cloudFunctionLogs = ref([])
  
  // ===========================================================================
  // Initialization
  // ===========================================================================
  
  /**
   * Initialize real-time connection and event listeners
   */
  function init() {
    // Sync connection state with WebSocket manager
    syncConnectionState()
    
    // Register event listeners
    registerEventListeners()
    
    console.log('[RealtimeStore] Initialized')
  }
  
  /**
   * Sync connection state from WebSocket manager
   */
  function syncConnectionState() {
    // Watch for state changes
    connectionState.value = wsConnectionManager.state.value
    
    // Update when WebSocket state changes
    wsConnectionManager.on('*', handleGlobalEvent)
    
    // Watch presence updates
    wsConnectionManager.on(EventTypes.PRESENCE_UPDATE, handlePresenceUpdate)
  }
  
  /**
   * Register event handlers
   */
  function registerEventListeners() {
    // Task completed
    wsConnectionManager.on(EventTypes.TASK_COMPLETED, handleTaskCompleted)
    
    // Points changed
    wsConnectionManager.on(EventTypes.POINTS_CHANGED, handlePointsChanged)
    
    // Achievement unlocked
    wsConnectionManager.on(EventTypes.ACHIEVEMENT_UNLOCKED, handleAchievementUnlocked)
    
    // Sync required
    wsConnectionManager.on(EventTypes.SYNC_REQUIRED, handleSyncRequired)
    
    // Presence update
    wsConnectionManager.on(EventTypes.PRESENCE_UPDATE, handlePresenceUpdate)
  }
  
  // ===========================================================================
  // Event Handlers
  // ===========================================================================
  
  function handleGlobalEvent(event) {
    const { type, payload } = event
    
    // Add to recent events
    recentEvents.value.unshift({
      id: `${type}_${Date.now()}`,
      type,
      payload,
      timestamp: Date.now()
    })
    
    // Keep only last 50
    if (recentEvents.value.length > 50) {
      recentEvents.value.pop()
    }
  }
  
  function handleTaskCompleted(payload) {
    console.log('[RealtimeStore] Task completed:', payload)
    
    // Store event
    taskCompletedEvents.value.unshift({
      id: `task_${Date.now()}`,
      ...payload,
      timestamp: Date.now()
    })
    
    // Keep only last 20
    if (taskCompletedEvents.value.length > 20) {
      taskCompletedEvents.value.pop()
    }
    
    // Execute cloud function
    executeCloudFunction('onTaskCompleted', payload)
    
    // Show notification
    addNotification({
      type: 'task_completed',
      title: '🎉 任务完成',
      message: `获得 ${payload.finalPoints || payload.basePoints || 0} 积分`,
      icon: '✨',
      duration: 3000,
      data: payload
    })
    
    // Add points animation
    if (payload.finalPoints || payload.basePoints) {
      addPointsAnimation(payload.childId || 'unknown', payload.finalPoints || payload.basePoints)
    }
  }
  
  function handlePointsChanged(payload) {
    console.log('[RealtimeStore] Points changed:', payload)
    
    // Store event
    pointsChangeEvents.value.unshift({
      id: `points_${Date.now()}`,
      ...payload,
      timestamp: Date.now()
    })
    
    // Keep only last 20
    if (pointsChangeEvents.value.length > 20) {
      pointsChangeEvents.value.pop()
    }
    
    // Execute cloud function
    executeCloudFunction('onPointsChanged', payload)
    
    // Show notification for significant changes
    if (payload.notification) {
      addNotification(payload.notification)
    }
    
    // Add points animation for positive changes
    if (payload.pointDiff > 0) {
      addPointsAnimation(payload.childId || 'unknown', payload.pointDiff)
    }
  }
  
  function handleAchievementUnlocked(payload) {
    console.log('[RealtimeStore] Achievement unlocked:', payload)
    
    // Store event
    achievementEvents.value.unshift({
      id: `achievement_${Date.now()}`,
      ...payload,
      timestamp: Date.now()
    })
    
    // Keep only last 20
    if (achievementEvents.value.length > 20) {
      achievementEvents.value.pop()
    }
    
    // Show special achievement notification
    addNotification({
      type: 'achievement',
      title: '🏆 成就解锁',
      message: payload.name || '新成就',
      icon: payload.icon || '🎖️',
      duration: 5000,
      data: payload
    })
  }
  
  function handleSyncRequired(payload) {
    console.log('[RealtimeStore] Sync required:', payload)
    
    // Store conflict
    syncConflicts.value.unshift({
      id: `sync_${Date.now()}`,
      ...payload,
      timestamp: Date.now()
    })
    
    // Show notification
    addNotification({
      type: 'sync_required',
      title: '🔄 同步冲突',
      message: '数据已更新，需要刷新页面',
      icon: '🔄',
      duration: 3000,
      data: payload
    })
  }
  
  function handlePresenceUpdate(payload) {
    console.log('[RealtimeStore] Presence update:', payload)
    
    if (payload.devices) {
      onlineDevices.value = payload.devices
    } else {
      // Single device update
      const existingIndex = onlineDevices.value.findIndex(
        d => d.deviceId === payload.deviceId
      )
      
      if (existingIndex >= 0) {
        if (payload.online === false) {
          onlineDevices.value.splice(existingIndex, 1)
        } else {
          onlineDevices.value[existingIndex] = payload
        }
      } else if (payload.online !== false) {
        onlineDevices.value.push(payload)
      }
    }
  }
  
  // ===========================================================================
  // Cloud Function Execution
  // ===========================================================================
  
  async function executeCloudFunction(name, data) {
    try {
      const result = await cloudFunctions.executeFunction(name, data)
      
      // Log result
      cloudFunctionLogs.value.unshift({
        function: name,
        input: data,
        output: result,
        timestamp: Date.now()
      })
      
      // Keep only last 50 logs
      if (cloudFunctionLogs.value.length > 50) {
        cloudFunctionLogs.value.pop()
      }
      
      // Handle cloud function results
      if (name === 'onTaskCompleted' && result.newAchievements?.length > 0) {
        result.newAchievements.forEach(achievement => {
          handleAchievementUnlocked(achievement)
        })
      }
      
      return result
    } catch (err) {
      console.error(`[RealtimeStore] Cloud function error (${name}):`, err)
      return null
    }
  }
  
  // ===========================================================================
  // Notification Management
  // ===========================================================================
  
  /**
   * Add notification to queue
   */
  function addNotification(notification) {
    const id = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const notif = {
      id,
      ...notification,
      createdAt: Date.now()
    }
    
    notificationQueue.value.push(notif)
    
    // Auto-remove after duration
    const duration = notification.duration || 3000
    setTimeout(() => {
      removeNotification(id)
    }, duration)
    
    // Show immediately if under limit
    if (activeNotifications.value.length < maxActiveNotifications) {
      activeNotifications.value.push(notif)
    }
    
    return id
  }
  
  /**
   * Remove notification
   */
  function removeNotification(id) {
    const queueIndex = notificationQueue.value.findIndex(n => n.id === id)
    if (queueIndex > -1) {
      notificationQueue.value.splice(queueIndex, 1)
    }
    
    const activeIndex = activeNotifications.value.findIndex(n => n.id === id)
    if (activeIndex > -1) {
      activeNotifications.value.splice(activeIndex, 1)
    }
    
    // Show next in queue if available
    if (notificationQueue.value.length > 0 && 
        activeNotifications.value.length < maxActiveNotifications) {
      const next = notificationQueue.value.shift()
      if (next) {
        activeNotifications.value.push(next)
      }
    }
  }
  
  /**
   * Clear all notifications
   */
  function clearNotifications() {
    notificationQueue.value = []
    activeNotifications.value = []
  }
  
  // ===========================================================================
  // Points Animation
  // ===========================================================================
  
  /**
   * Add floating points animation
   */
  function addPointsAnimation(targetId, points) {
    const id = `anim_${Date.now()}`
    
    pointsAnimations.value.push({
      id,
      targetId,
      points: typeof points === 'number' ? points : parseInt(points) || 0,
      createdAt: Date.now()
    })
    
    // Auto-remove after animation (2 seconds)
    setTimeout(() => {
      removePointsAnimation(id)
    }, 2000)
  }
  
  /**
   * Remove points animation
   */
  function removePointsAnimation(id) {
    const index = pointsAnimations.value.findIndex(a => a.id === id)
    if (index > -1) {
      pointsAnimations.value.splice(index, 1)
    }
  }
  
  // ===========================================================================
  // Connection Actions
  // ===========================================================================
  
  /**
   * Connect to real-time server
   */
  function connect(url = 'wss://mock-server.example.com/ws') {
    wsConnectionManager.connect(url)
    connectionState.value = wsConnectionManager.state.value
  }
  
  /**
   * Disconnect from server
   */
  function disconnect() {
    wsConnectionManager.disconnect()
    connectionState.value = ConnectionState.DISCONNECTED
  }
  
  /**
   * Mock connect (for testing without real server)
   */
  function mockConnect() {
    wsConnectionManager.mockConnect()
    connectionState.value = wsConnectionManager.state.value
  }
  
  /**
   * Mock disconnect
   */
  function mockDisconnect() {
    wsConnectionManager.mockDisconnect()
    connectionState.value = ConnectionState.DISCONNECTED
  }
  
  /**
   * Simulate event (for testing)
   */
  function simulateEvent(eventType, data) {
    wsConnectionManager.simulateEvent(eventType, data)
  }
  
  /**
   * Simulate task completed
   */
  function simulateTaskCompleted(childId = 'child_001', points = 10) {
    const payload = {
      taskId: `task_${Date.now()}`,
      childId,
      basePoints: points,
      bonusApplied: Math.random() > 0.7
    }
    simulateEvent(EventTypes.TASK_COMPLETED, payload)
  }
  
  /**
   * Simulate points changed
   */
  function simulatePointsChanged(childId = 'child_001', change = 10) {
    const payload = {
      childId,
      previousPoints: 100,
      newPoints: 100 + change,
      changeType: 'earn',
      reason: 'task_reward'
    }
    simulateEvent(EventTypes.POINTS_CHANGED, payload)
  }
  
  /**
   * Simulate achievement unlocked
   */
  function simulateAchievementUnlocked() {
    const achievements = [
      { id: 'first_task', name: '初次任务', description: '完成第一个任务', icon: '🌟' },
      { id: 'streak_7', name: '连续7天', description: '连续7天完成任务', icon: '🔥' },
      { id: 'points_100', name: '积分达人', description: '累计获得100积分', icon: '💎' },
      { id: 'early_bird', name: '早起鸟儿', description: '早上完成任务', icon: '🌅' }
    ]
    const achievement = achievements[Math.floor(Math.random() * achievements.length)]
    simulateEvent(EventTypes.ACHIEVEMENT_UNLOCKED, {
      ...achievement,
      childId: 'child_001',
      timestamp: Date.now()
    })
  }
  
  // ===========================================================================
  // Computed / Getters
  // ===========================================================================
  
  const totalTaskCompleted = computed(() => taskCompletedEvents.value.length)
  const totalAchievements = computed(() => achievementEvents.value.length)
  
  const recentPointsChanges = computed(() => 
    pointsChangeEvents.value.slice(0, 10)
  )
  
  const hasActiveNotifications = computed(() => 
    activeNotifications.value.length > 0
  )
  
  const hasConflicts = computed(() => 
    syncConflicts.value.length > 0
  )
  
  return {
    // State
    connectionState,
    isConnected,
    isConnecting,
    isReconnecting,
    recentEvents,
    taskCompletedEvents,
    pointsChangeEvents,
    achievementEvents,
    onlineDevices,
    syncConflicts,
    notificationQueue,
    activeNotifications,
    pointsAnimations,
    cloudFunctionLogs,
    
    // Computed
    totalTaskCompleted,
    totalAchievements,
    recentPointsChanges,
    hasActiveNotifications,
    hasConflicts,
    
    // Actions
    init,
    connect,
    disconnect,
    mockConnect,
    mockDisconnect,
    simulateEvent,
    simulateTaskCompleted,
    simulatePointsChanged,
    simulateAchievementUnlocked,
    addNotification,
    removeNotification,
    clearNotifications,
    addPointsAnimation,
    removePointsAnimation,
    executeCloudFunction
  }
})
