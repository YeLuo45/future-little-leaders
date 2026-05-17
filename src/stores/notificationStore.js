/**
 * V7 Notification Store — Pinia Store for notification state
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useNotificationStore = defineStore('notification', () => {
  // State
  const notifications = ref([])
  const unreadCount = ref(0)
  const channelCounts = ref({})
  const currentTab = ref('all')
  const isLoading = ref(false)
  
  // Computed
  const hasUnread = computed(() => unreadCount.value > 0)
  
  const tabChannels = {
    all: ['task', 'achievement', 'points', 'reminder', 'flow', 'skill_tree', 'streak', 'growth_report', 'family_broadcast', 'system', 'sync', 'collaboration'],
    task: ['task'],
    achievement: ['achievement'],
    points: ['points'],
    system: ['system', 'sync', 'family_broadcast']
  }
  
  const filteredNotifications = computed(() => {
    if (currentTab.value === 'all') {
      return notifications.value
    }
    const channels = tabChannels[currentTab.value] || []
    return notifications.value.filter(n => channels.includes(n.channel))
  })
  
  // Grouped by date
  const groupedNotifications = computed(() => {
    const groups = {
      today: [],
      yesterday: [],
      older: []
    }
    
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    const yesterdayStart = todayStart - 86400000
    
    // Unread first
    const sorted = [...filteredNotifications.value].sort((a, b) => {
      if (a.read !== b.read) return a.read ? 1 : -1
      return new Date(b.createdAt) - new Date(a.createdAt)
    })
    
    sorted.forEach(n => {
      const createdAt = new Date(n.createdAt).getTime()
      if (createdAt >= todayStart) {
        groups.today.push(n)
      } else if (createdAt >= yesterdayStart) {
        groups.yesterday.push(n)
      } else {
        groups.older.push(n)
      }
    })
    
    return groups
  })
  
  // Actions
  async function loadNotifications(recipientId, options = {}) {
    isLoading.value = true
    try {
      const NotificationService = require('../services/notificationService').default || require('../services/notificationService')
      const list = await NotificationService.getNotifications(recipientId, {
        limit: 50,
        ...options
      })
      notifications.value = list
    } catch (e) {
      console.error('[V7 Store] Load notifications failed:', e)
    } finally {
      isLoading.value = false
    }
  }
  
  async function refreshUnreadCount(recipientId) {
    try {
      const NotificationService = require('../services/notificationService').default || require('../services/notificationService')
      unreadCount.value = await NotificationService.getUnreadCount(recipientId)
      channelCounts.value = await NotificationService.getChannelUnreadCounts(recipientId)
    } catch (e) {
      console.error('[V7 Store] Refresh unread count failed:', e)
    }
  }
  
  async function markAsRead(notificationId) {
    try {
      const NotificationService = require('../services/notificationService').default || require('../services/notificationService')
      await NotificationService.markRead(notificationId)
      const n = notifications.value.find(x => x.id === notificationId)
      if (n) n.read = true
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    } catch (e) {
      console.error('[V7 Store] Mark read failed:', e)
    }
  }
  
  async function markAllAsRead(recipientId) {
    try {
      const NotificationService = require('../services/notificationService').default || require('../services/notificationService')
      await NotificationService.markAllRead(recipientId)
      notifications.value.forEach(n => n.read = true)
      unreadCount.value = 0
      channelCounts.value = {}
    } catch (e) {
      console.error('[V7 Store] Mark all read failed:', e)
    }
  }
  
  async function deleteNotification(notificationId) {
    try {
      const NotificationService = require('../services/notificationService').default || require('../services/notificationService')
      await NotificationService.deleteNotification(notificationId)
      const idx = notifications.value.findIndex(x => x.id === notificationId)
      if (idx !== -1) {
        if (!notifications.value[idx].read) {
          unreadCount.value = Math.max(0, unreadCount.value - 1)
        }
        notifications.value.splice(idx, 1)
      }
    } catch (e) {
      console.error('[V7 Store] Delete failed:', e)
    }
  }
  
  function setTab(tab) {
    currentTab.value = tab
  }
  
  // Listen for badge updates
  function initBadgeListener() {
    uni.$on('notification:badge:update', ({ total, channelCounts: counts }) => {
      unreadCount.value = total
      channelCounts.value = counts || {}
    })
  }
  
  return {
    // State
    notifications,
    unreadCount,
    channelCounts,
    currentTab,
    isLoading,
    // Computed
    hasUnread,
    filteredNotifications,
    groupedNotifications,
    // Actions
    loadNotifications,
    refreshUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    setTab,
    initBadgeListener
  }
})