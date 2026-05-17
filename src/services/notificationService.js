/**
 * V7 NotificationService — 家庭通知中枢 (Nanobot 12通道风格)
 * 
 * 支持 12 个通知通道，SQLite 持久化，复用 V4 SyncEngine 轮询机制
 * 
 * Storage: SQLite (notifications + notification_preferences tables)
 * 
 * 使用方式：
 *   import NotificationService from './services/notificationService'
 *   NotificationService.sendTaskAssigned(childId, title, points)
 */

'use strict';

// ============================================================================
// 12 通道定义
// ============================================================================

export const CHANNELS = {
  TASK: 'task',                 // 📋 任务通知
  ACHIEVEMENT: 'achievement',   // 🎉 成就通知
  POINTS: 'points',             // 💰 积分通知
  REMINDER: 'reminder',         // ⏰ 定时提醒
  FLOW: 'flow',                 // 🔄 流程通知
  SKILL_TREE: 'skill_tree',     // 🌱 技能树通知
  STREAK: 'streak',             // 🔥 连续打卡
  GROWTH_REPORT: 'growth_report', // 📊 成长报告
  FAMILY_BROADCAST: 'family_broadcast', // 📢 家庭广播
  SYSTEM: 'system',             // ⚙️ 系统通知
  SYNC: 'sync',                 // ☁️ 同步通知
  COLLABORATION: 'collaboration'  // 👥 协作通知
}

export const CHANNEL_INFO = {
  [CHANNELS.TASK]: { name: '任务通知', icon: '📋', color: '#4A90D9' },
  [CHANNELS.ACHIEVEMENT]: { name: '成就通知', icon: '🎉', color: '#52C41A' },
  [CHANNELS.POINTS]: { name: '积分通知', icon: '💰', color: '#FA8C16' },
  [CHANNELS.REMINDER]: { name: '定时提醒', icon: '⏰', color: '#1890FF' },
  [CHANNELS.FLOW]: { name: '流程通知', icon: '🔄', color: '#722ED1' },
  [CHANNELS.SKILL_TREE]: { name: '技能树通知', icon: '🌱', color: '#13C2C2' },
  [CHANNELS.STREAK]: { name: '连续打卡', icon: '🔥', color: '#F5222D' },
  [CHANNELS.GROWTH_REPORT]: { name: '成长报告', icon: '📊', color: '#EB2F96' },
  [CHANNELS.FAMILY_BROADCAST]: { name: '家庭广播', icon: '📢', color: '#7C3AED' },
  [CHANNELS.SYSTEM]: { name: '系统通知', icon: '⚙️', color: '#999999' },
  [CHANNELS.SYNC]: { name: '同步通知', icon: '☁️', color: '#2F54EB' },
  [CHANNELS.COLLABORATION]: { name: '协作通知', icon: '👥', color: '#FAAD14' }
}

// Tab channel mapping (for 5 main tabs)
export const TAB_CHANNELS = {
  all: Object.values(CHANNELS),
  task: [CHANNELS.TASK],
  achievement: [CHANNELS.ACHIEVEMENT],
  points: [CHANNELS.POINTS],
  system: [CHANNELS.SYSTEM, CHANNELS.SYNC, CHANNELS.FAMILY_BROADCAST]
}

// ============================================================================
// Notification Types
// ============================================================================

export const NotificationType = {
  // Task types
  TASK_ASSIGNED: 'task_assigned',
  TASK_APPROVED: 'task_approved',
  TASK_REJECTED: 'task_rejected',
  TASK_RESUBMITTED: 'task_resubmitted',
  
  // Achievement types
  ACHIEVEMENT_UNLOCKED: 'achievement_unlocked',
  
  // Points types
  POINTS_EARNED: 'points_earned',
  
  // Reminder types
  REMINDER_DAILY: 'reminder_daily',
  
  // Flow types
  FLOW_STARTED: 'flow_started',
  FLOW_TASK_REMINDER: 'flow_task_reminder',
  
  // Skill tree types
  SKILL_NODE_UNLOCKED: 'skill_node_unlocked',
  SKILL_NODE_PROGRESS: 'skill_node_progress',
  
  // Streak types
  STREAK_WARNING: 'streak_warning',
  STREAK_BROKEN: 'streak_broken',
  
  // Growth report types
  GROWTH_REPORT_READY: 'growth_report_ready',
  
  // Family broadcast types
  FAMILY_ANNOUNCEMENT: 'family_announcement',
  
  // System types
  SYSTEM_ANNOUNCEMENT: 'system_announcement',
  
  // Sync types
  SYNC_COMPLETED: 'sync_completed',
  SYNC_FAILED: 'sync_failed',
  
  // Collaboration types
  COLLAB_INVITATION: 'collab_invitation'
}

const TypeLabels = {
  [NotificationType.TASK_ASSIGNED]: '📋 新任务',
  [NotificationType.TASK_APPROVED]: '✅ 任务通过',
  [NotificationType.TASK_REJECTED]: '❌ 任务打回',
  [NotificationType.TASK_RESUBMITTED]: '🔄 重新提交',
  [NotificationType.ACHIEVEMENT_UNLOCKED]: '🎉 成就解锁',
  [NotificationType.POINTS_EARNED]: '💰 积分到账',
  [NotificationType.REMINDER_DAILY]: '⏰ 每日提醒',
  [NotificationType.FLOW_STARTED]: '🔄 流程开始',
  [NotificationType.FLOW_TASK_REMINDER]: '🔄 流程提醒',
  [NotificationType.SKILL_NODE_UNLOCKED]: '🌱 节点解锁',
  [NotificationType.SKILL_NODE_PROGRESS]: '🌱 节点进度',
  [NotificationType.STREAK_WARNING]: '🔥 连续打卡警告',
  [NotificationType.STREAK_BROKEN]: '🔥 连续中断',
  [NotificationType.GROWTH_REPORT_READY]: '📊 成长报告',
  [NotificationType.FAMILY_ANNOUNCEMENT]: '📢 家庭公告',
  [NotificationType.SYSTEM_ANNOUNCEMENT]: '⚙️ 系统公告',
  [NotificationType.SYNC_COMPLETED]: '☁️ 同步完成',
  [NotificationType.SYNC_FAILED]: '☁️ 同步失败',
  [NotificationType.COLLAB_INVITATION]: '👥 协作邀请'
}

// ============================================================================
// SQLite Database Functions
// ============================================================================

let db = null

async function getDb() {
  if (db) return db
  
  try {
    const sqlite = await import('../db/sqlite.js')
    db = sqlite
    return db
  } catch (e) {
    console.error('[V7] Failed to import sqlite:', e)
    return null
  }
}

function generateId() {
  return 'notif_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8)
}

// ============================================================================
// NotificationService
// ============================================================================

const NotificationService = {
  CHANNELS,
  CHANNEL_INFO,
  NotificationType,

  /**
   * 初始化通知服务
   */
  async init() {
    const sqlite = await getDb()
    if (!sqlite) {
      console.warn('[V7] SQLite not available, using localStorage fallback')
    }
  },

  /**
   * 发送通知
   * @param {object} notification - { channel, type, recipientId, senderId, title, content, data, priority }
   */
  async send(notification) {
    const sqlite = await getDb()
    const id = generateId()
    const now = new Date().toISOString()
    
    const n = {
      id,
      channel: notification.channel || 'system',
      type: notification.type || 'unknown',
      recipientId: notification.recipientId,
      senderId: notification.senderId || null,
      title: notification.title || '',
      content: notification.content || '',
      data: notification.data || null,
      priority: notification.priority || 'normal',
      read: false,
      createdAt: now,
      expiresAt: notification.expiresAt || null,
      synced: 0
    }
    
    // Try SQLite first, fallback to localStorage
    if (sqlite && sqlite.insertNotification) {
      const result = sqlite.insertNotification(n)
      if (result.success) {
        console.log('[V7] Notification saved to SQLite:', n.type, n.recipientId)
      } else {
        // Fallback to localStorage
        saveToLocalStorage(n)
      }
    } else {
      saveToLocalStorage(n)
    }
    
    // Emit events
    uni.$emit('collab:notification', n)
    uni.$emit('notification:updated', { recipientId: n.recipientId })
    emitBadgeUpdate(n.recipientId)
    
    console.log('[V7] Notification sent:', n.channel, n.type, n.recipientId)
    return n
  },

  /**
   * 获取通知列表
   * @param {string} recipientId
   * @param {object} options - { channel, read, limit, offset }
   */
  async getNotifications(recipientId, options = {}) {
    const sqlite = await getDb()
    
    if (sqlite && sqlite.getNotifications) {
      return sqlite.getNotifications(recipientId, options)
    }
    
    // Fallback to localStorage
    return getFromLocalStorage(recipientId, options)
  },

  /**
   * 获取未读通知数
   * @param {string} recipientId
   * @param {string} channel - optional
   */
  async getUnreadCount(recipientId, channel = null) {
    const sqlite = await getDb()
    
    if (sqlite && sqlite.getUnreadNotificationCount) {
      return sqlite.getUnreadNotificationCount(recipientId, channel)
    }
    
    // Fallback
    const all = getFromLocalStorage(recipientId)
    return all.filter(n => !n.read).length
  },

  /**
   * 获取各通道未读计数
   * @param {string} recipientId
   */
  async getChannelUnreadCounts(recipientId) {
    const sqlite = await getDb()
    
    if (sqlite && sqlite.getChannelUnreadCounts) {
      return sqlite.getChannelUnreadCounts(recipientId)
    }
    
    // Fallback
    const all = getFromLocalStorage(recipientId)
    const counts = {}
    all.filter(n => !n.read).forEach(n => {
      counts[n.channel] = (counts[n.channel] || 0) + 1
    })
    return counts
  },

  /**
   * 标记单条已读
   * @param {string} notificationId
   */
  async markRead(notificationId) {
    const sqlite = await getDb()
    
    if (sqlite && sqlite.markNotificationRead) {
      sqlite.markNotificationRead(notificationId)
    }
    
    // Also update localStorage
    markReadLocalStorage(notificationId)
    
    uni.$emit('notification:updated', {})
    emitBadgeUpdate()
  },

  /**
   * 全部已读
   * @param {string} recipientId
   */
  async markAllRead(recipientId) {
    const sqlite = await getDb()
    
    if (sqlite && sqlite.markAllNotificationsRead) {
      sqlite.markAllNotificationsRead(recipientId)
    }
    
    markAllReadLocalStorage(recipientId)
    
    uni.$emit('notification:updated', { recipientId })
    emitBadgeUpdate(recipientId)
  },

  /**
   * 删除单条通知
   * @param {string} notificationId
   */
  async deleteNotification(notificationId) {
    const sqlite = await getDb()
    
    if (sqlite && sqlite.deleteNotification) {
      sqlite.deleteNotification(notificationId)
    }
    
    deleteFromLocalStorage(notificationId)
    uni.$emit('notification:updated', {})
    emitBadgeUpdate()
  },

  /**
   * 清空所有通知
   * @param {string} recipientId
   */
  async clearAll(recipientId) {
    const sqlite = await getDb()
    
    if (sqlite && sqlite.getNotifications) {
      const all = sqlite.getNotifications(recipientId, { limit: 1000 })
      all.forEach(n => {
        if (sqlite.deleteNotification) {
          sqlite.deleteNotification(n.id)
        }
      })
    }
    
    clearAllLocalStorage(recipientId)
    uni.$emit('notification:updated', { recipientId })
    emitBadgeUpdate(recipientId)
  },

  // ==========================================================================
  // Convenience send methods (backward compatible)
  // ==========================================================================

  /**
   * 任务分配通知（发给孩子）
   */
  sendTaskAssigned(childId, taskTitle, points, taskId) {
    return this.send({
      channel: CHANNELS.TASK,
      type: NotificationType.TASK_ASSIGNED,
      recipientId: childId,
      title: '新任务',
      content: `任务「${taskTitle}」，奖励${points}积分`,
      data: { taskId, taskTitle, points },
    })
  },

  /**
   * 任务审核通过通知（发给孩子）
   */
  sendTaskApproved(childId, taskTitle, points, taskId) {
    return this.send({
      channel: CHANNELS.TASK,
      type: NotificationType.TASK_APPROVED,
      recipientId: childId,
      title: '任务通过',
      content: `任务「${taskTitle}」审核通过，+${points}积分已到账`,
      data: { taskId, taskTitle, points },
    })
  },

  /**
   * 任务打回通知（发给孩子）
   */
  sendTaskRejected(childId, taskTitle, reason, taskId) {
    return this.send({
      channel: CHANNELS.TASK,
      type: NotificationType.TASK_REJECTED,
      recipientId: childId,
      title: '任务打回',
      content: `任务「${taskTitle}」被打回：${reason}`,
      data: { taskId, taskTitle, reason },
    })
  },

  /**
   * 任务重新提交通知（发给家长）
   */
  sendTaskResubmitted(parentId, taskTitle, childId, childName) {
    return this.send({
      channel: CHANNELS.TASK,
      type: NotificationType.TASK_RESUBMITTED,
      recipientId: parentId || 'family_broadcast',
      title: '任务重新提交',
      content: `${childName}重新提交了任务「${taskTitle}」，请审核`,
      data: { childId, taskTitle },
    })
  },

  /**
   * 成就解锁通知（发给双方）
   */
  sendAchievementUnlocked(childId, childName, achievementName, achievementIcon) {
    // 给孩子发
    this.send({
      channel: CHANNELS.ACHIEVEMENT,
      type: NotificationType.ACHIEVEMENT_UNLOCKED,
      recipientId: childId,
      title: '成就解锁',
      content: `🎉 你解锁了「${achievementName}」`,
      data: { achievementName, achievementIcon },
    })
    // 给家长广播
    this.send({
      channel: CHANNELS.ACHIEVEMENT,
      type: NotificationType.ACHIEVEMENT_UNLOCKED,
      recipientId: 'family_broadcast',
      title: '成就解锁',
      content: `🎉 ${childName}解锁了「${achievementName}」`,
      data: { childId, childName, achievementName, achievementIcon },
    })
  },

  /**
   * 积分到账通知（发给孩子）
   */
  sendPointsEarned(childId, points, reason) {
    return this.send({
      channel: CHANNELS.POINTS,
      type: NotificationType.POINTS_EARNED,
      recipientId: childId,
      title: '积分到账',
      content: `+${points}积分到账（${reason}）`,
      data: { points, reason },
    })
  },

  // ==========================================================================
  // V7 New notification methods
  // ==========================================================================

  /**
   * 技能树节点解锁
   */
  sendSkillNodeUnlocked(babyId, childName, nodeName, nodeIcon) {
    this.send({
      channel: CHANNELS.SKILL_TREE,
      type: NotificationType.SKILL_NODE_UNLOCKED,
      recipientId: babyId,
      title: '技能解锁',
      content: `🌱 ${childName}解锁了新技能「${nodeName}」`,
      data: { nodeName, nodeIcon },
    })
  },

  /**
   * 技能树节点进度更新
   */
  sendSkillNodeProgress(babyId, nodeName, current, target) {
    this.send({
      channel: CHANNELS.SKILL_TREE,
      type: NotificationType.SKILL_NODE_PROGRESS,
      recipientId: babyId,
      title: '技能进度',
      content: `🌱 「${nodeName}」进度 ${current}/${target}`,
      data: { nodeName, current, target },
    })
  },

  /**
   * Flow 流程开始
   */
  sendFlowStarted(babyId, flowName) {
    return this.send({
      channel: CHANNELS.FLOW,
      type: NotificationType.FLOW_STARTED,
      recipientId: babyId,
      title: '流程开始',
      content: `🔄 「${flowName}」流程已启动`,
      data: { flowName },
    })
  },

  /**
   * Flow 流程任务提醒
   */
  sendFlowTaskReminder(babyId, taskTitle, time) {
    return this.send({
      channel: CHANNELS.FLOW,
      type: NotificationType.FLOW_TASK_REMINDER,
      recipientId: babyId,
      title: '流程提醒',
      content: `🔄 「${taskTitle}」待完成，截止${time}`,
      data: { taskTitle, time },
    })
  },

  /**
   * 连续打卡警告（快中断前）
   */
  sendStreakWarning(babyId, streakDays) {
    return this.send({
      channel: CHANNELS.STREAK,
      type: NotificationType.STREAK_WARNING,
      recipientId: babyId,
      title: '打卡提醒',
      content: `🔥 已连续打卡${streakDays}天，今天记得打卡哦！`,
      data: { streakDays },
    })
  },

  /**
   * 连续打卡中断
   */
  sendStreakBroken(babyId, streakDays) {
    return this.send({
      channel: CHANNELS.STREAK,
      type: NotificationType.STREAK_BROKEN,
      recipientId: babyId,
      title: '打卡中断',
      content: `😢 连续打卡${streakDays}天已中断，明天重新开始吧！`,
      data: { streakDays },
    })
  },

  /**
   * 成长报告生成完毕
   */
  sendGrowthReportReady(babyId, period) {
    return this.send({
      channel: CHANNELS.GROWTH_REPORT,
      type: NotificationType.GROWTH_REPORT_READY,
      recipientId: babyId,
      title: '成长报告',
      content: `📊 ${period}成长报告已生成，快来看看吧！`,
      data: { period },
    })
  },

  /**
   * 系统公告
   */
  sendSystemAnnouncement(title, content) {
    return this.send({
      channel: CHANNELS.SYSTEM,
      type: NotificationType.SYSTEM_ANNOUNCEMENT,
      recipientId: 'family_broadcast',
      title,
      content,
      priority: 'high'
    })
  },

  // ==========================================================================
  // Preference management
  // ==========================================================================

  /**
   * 更新渠道偏好
   */
  async updatePreference(babyId, channel, prefs) {
    const sqlite = await getDb()
    
    if (sqlite && sqlite.updateNotificationPreference) {
      return sqlite.updateNotificationPreference(babyId, channel, prefs)
    }
    
    // Fallback to localStorage
    const key = `notif_prefs_${babyId}_${channel}`
    uni.setStorageSync(key, prefs)
    return { success: true }
  },

  /**
   * 获取渠道偏好
   */
  async getPreferences(babyId) {
    const sqlite = await getDb()
    
    if (sqlite && sqlite.getNotificationPreferences) {
      return sqlite.getNotificationPreferences(babyId)
    }
    
    // Fallback - return defaults
    return Object.keys(CHANNELS).map(ch => ({
      babyId,
      channel: CHANNELS[ch],
      enabled: true
    }))
  },

  // ==========================================================================
  // Utils
  // ==========================================================================

  /**
   * 格式化时间显示
   */
  formatTime(createdAt) {
    if (!createdAt) return ''
    const ts = typeof createdAt === 'string' ? new Date(createdAt).getTime() : createdAt
    const now = Date.now()
    const diff = now - ts
    if (diff < 60000) return '刚刚'
    if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前'
    if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前'
    const d = new Date(ts)
    return `${d.getMonth() + 1}月${d.getDate()}日`
  },

  /**
   * 获取通知类型标签
   */
  getTypeLabel(type) {
    return TypeLabels[type] || type
  },

  /**
   * 获取通道信息
   */
  getChannelInfo(channel) {
    return CHANNEL_INFO[channel] || { name: channel, icon: '📌', color: '#999999' }
  }
}

// ============================================================================
// LocalStorage fallback functions
// ============================================================================

const STORAGE_KEY = 'collab_notifications'

function loadFromLocalStorage() {
  try {
    const stored = uni.getStorageSync(STORAGE_KEY)
    if (!stored) return []
    const parsed = typeof stored === 'string' ? JSON.parse(stored) : stored
    return Array.isArray(parsed) ? parsed : []
  } catch (e) {
    return []
  }
}

function saveToLocalStorage(n) {
  const list = loadFromLocalStorage()
  list.unshift(n)
  // Keep max 100 notifications in localStorage fallback
  if (list.length > 100) {
    list.splice(100)
  }
  try {
    uni.setStorageSync(STORAGE_KEY, JSON.stringify(list))
  } catch (e) {
    console.error('[V7] LocalStorage save failed:', e)
  }
}

function getFromLocalStorage(recipientId, options = {}) {
  const { channel, read, limit = 50 } = options
  let list = loadFromLocalStorage()
  
  list = list.filter(n => 
    n.recipientId === recipientId || n.recipientId === 'family_broadcast'
  )
  
  if (channel) {
    list = list.filter(n => n.channel === channel)
  }
  
  if (read !== undefined) {
    list = list.filter(n => n.read === read)
  }
  
  return list.slice(0, limit)
}

function markReadLocalStorage(notificationId) {
  const list = loadFromLocalStorage()
  const n = list.find(x => x.id === notificationId)
  if (n) {
    n.read = true
    uni.setStorageSync(STORAGE_KEY, JSON.stringify(list))
  }
}

function markAllReadLocalStorage(recipientId) {
  const list = loadFromLocalStorage()
  list.forEach(n => {
    if (n.recipientId === recipientId && !n.read) {
      n.read = true
    }
  })
  uni.setStorageSync(STORAGE_KEY, JSON.stringify(list))
}

function deleteFromLocalStorage(notificationId) {
  const list = loadFromLocalStorage()
  const filtered = list.filter(x => x.id !== notificationId)
  uni.setStorageSync(STORAGE_KEY, JSON.stringify(filtered))
}

function clearAllLocalStorage(recipientId) {
  const list = loadFromLocalStorage()
  const filtered = list.filter(x => x.recipientId !== recipientId)
  uni.setStorageSync(STORAGE_KEY, JSON.stringify(filtered))
}

// ============================================================================
// Badge update helper
// ============================================================================

async function emitBadgeUpdate(recipientId) {
  try {
    const count = await NotificationService.getUnreadCount(recipientId || '')
    const counts = await NotificationService.getChannelUnreadCounts(recipientId || '')
    uni.$emit('notification:badge:update', { total: count, channelCounts: counts })
  } catch (e) {
    // ignore
  }
}

module.exports = NotificationService
export default NotificationService