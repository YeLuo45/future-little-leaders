// src/stores/reminderStore.js
// 任务提醒Store - 管理任务提醒的设置、存储和触发

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useBabyStore } from './babyStore'

// localStorage keys
const REMINDERS_KEY = 'task_reminders'
const NOTIFICATIONS_KEY = 'reminder_notifications'

// 提醒类型
const REMINDER_TYPES = {
  BEFORE: 'before',   // 任务开始前提醒
  AT_TIME: 'at_time', // 准时提醒
  CUSTOM: 'custom'    // 自定义时间
}

// 提醒提前时间选项（分钟）
const BEFORE_OPTIONS = [
  { label: '不提醒', value: 0 },
  { label: '5分钟前', value: 5 },
  { label: '15分钟前', value: 15 },
  { label: '30分钟前', value: 30 },
  { label: '1小时前', value: 60 },
  { label: '2小时前', value: 120 }
]

export const useReminderStore = defineStore('reminder', () => {
  // 状态
  const reminders = ref({})       // 任务提醒映射 { taskId: reminderData }
  const notifications = ref([])   // 通知列表
  const isEnabled = ref(true)     // 全局提醒开关
  
  // 获取宝宝Store
  const babyStore = useBabyStore()
  
  // 计算属性
  // 当前宝宝的提醒数量
  const currentBabyReminderCount = computed(() => {
    const babyId = babyStore.currentBabyId
    if (!babyId) return 0
    return Object.keys(reminders.value).filter(taskId => {
      const r = reminders.value[taskId]
      return r && r.babyId === babyId
    }).length
  })
  
  // 获取未读通知数量
  const unreadCount = computed(() => {
    return notifications.value.filter(n => !n.read).length
  })
  
  // 方法
  // 加载提醒数据
  const loadReminders = () => {
    try {
      const stored = uni.getStorageSync(REMINDERS_KEY)
      if (stored) {
        reminders.value = JSON.parse(stored)
      }
    } catch (e) {
      console.error('[ReminderStore] 加载提醒失败:', e)
      reminders.value = {}
    }
  }
  
  // 保存提醒数据
  const saveReminders = () => {
    try {
      uni.setStorageSync(REMINDERS_KEY, JSON.stringify(reminders.value))
      return true
    } catch (e) {
      console.error('[ReminderStore] 保存提醒失败:', e)
      return false
    }
  }
  
  // 加载通知数据
  const loadNotifications = () => {
    try {
      const stored = uni.getStorageSync(NOTIFICATIONS_KEY)
      if (stored) {
        notifications.value = JSON.parse(stored)
      }
    } catch (e) {
      console.error('[ReminderStore] 加载通知失败:', e)
      notifications.value = []
    }
  }
  
  // 保存通知数据
  const saveNotifications = () => {
    try {
      uni.setStorageSync(NOTIFICATIONS_KEY, JSON.stringify(notifications.value))
      return true
    } catch (e) {
      console.error('[ReminderStore] 保存通知失败:', e)
      return false
    }
  }
  
  // 设置任务提醒
  const setReminder = (taskId, taskData, reminderTime, babyId) => {
    if (!taskId) return false
    
    const reminder = {
      taskId,
      babyId: babyId || babyStore.currentBabyId,
      taskTitle: taskData.title || '',
      taskDescription: taskData.description || '',
      reminderTime,        // 提醒时间 (Date or HH:MM format)
      reminderType: reminderTime instanceof Date ? REMINDER_TYPES.AT_TIME : REMINDER_TYPES.CUSTOM,
      enabled: true,
      createdAt: new Date().toISOString()
    }
    
    reminders.value[taskId] = reminder
    saveReminders()
    
    // 触发定时检查
    scheduleReminderCheck()
    
    return true
  }
  
  // 移除任务提醒
  const removeReminder = (taskId) => {
    if (reminders.value[taskId]) {
      delete reminders.value[taskId]
      saveReminders()
      return true
    }
    return false
  }
  
  // 获取任务提醒
  const getReminder = (taskId) => {
    return reminders.value[taskId] || null
  }
  
  // 获取当前宝宝的所有提醒
  const getCurrentBabyReminders = () => {
    const babyId = babyStore.currentBabyId
    if (!babyId) return []
    
    return Object.values(reminders.value)
      .filter(r => r && r.babyId === babyId && r.enabled)
      .sort((a, b) => {
        const aTime = a.reminderTime instanceof Date ? a.reminderTime.getTime() : new Date(`2000/01/01 ${a.reminderTime}`).getTime()
        const bTime = b.reminderTime instanceof Date ? b.reminderTime.getTime() : new Date(`2000/01/01 ${b.reminderTime}`).getTime()
        return aTime - bTime
      })
  }
  
  // 添加通知
  const addNotification = (reminder) => {
    const notification = {
      id: Date.now().toString(),
      babyId: reminder.babyId,
      taskId: reminder.taskId,
      taskTitle: reminder.taskTitle,
      taskDescription: reminder.taskDescription,
      reminderTime: reminder.reminderTime instanceof Date ? reminder.reminderTime.toISOString() : reminder.reminderTime,
      type: 'reminder',
      read: false,
      createdAt: new Date().toISOString()
    }
    
    notifications.value.unshift(notification)
    
    // 最多保留100条通知
    if (notifications.value.length > 100) {
      notifications.value = notifications.value.slice(0, 100)
    }
    
    saveNotifications()
    
    // 触发通知事件（用于页面显示toast）
    uni.$emit('reminderNotification', notification)
    
    return notification
  }
  
  // 标记通知为已读
  const markAsRead = (notificationId) => {
    const notification = notifications.value.find(n => n.id === notificationId)
    if (notification) {
      notification.read = true
      saveNotifications()
      return true
    }
    return false
  }
  
  // 标记所有通知为已读
  const markAllAsRead = () => {
    notifications.value.forEach(n => {
      n.read = true
    })
    saveNotifications()
    return true
  }
  
  // 删除通知
  const deleteNotification = (notificationId) => {
    const index = notifications.value.findIndex(n => n.id === notificationId)
    if (index !== -1) {
      notifications.value.splice(index, 1)
      saveNotifications()
      return true
    }
    return false
  }
  
  // 清空所有通知
  const clearAllNotifications = () => {
    notifications.value = []
    saveNotifications()
    return true
  }
  
  // 获取当前宝宝的通知
  const getCurrentBabyNotifications = () => {
    const babyId = babyStore.currentBabyId
    if (!babyId) return []
    
    return notifications.value
      .filter(n => n.babyId === babyId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }
  
  // 检查是否应该触发提醒
  const shouldTriggerReminder = (reminder) => {
    if (!reminder || !reminder.enabled || !isEnabled.value) return false
    
    const now = new Date()
    let reminderDate
    
    if (reminder.reminderTime instanceof Date) {
      reminderDate = new Date(reminder.reminderTime)
    } else {
      // HH:MM 格式，今天的该时间
      const [hours, minutes] = reminder.reminderTime.split(':').map(Number)
      reminderDate = new Date()
      reminderDate.setHours(hours, minutes, 0, 0)
    }
    
    // 如果提醒时间已过，不触发
    if (reminderDate <= now) return false
    
    // 检查是否在1分钟窗口内
    const diff = reminderDate.getTime() - now.getTime()
    return diff <= 60000 && diff >= 0
  }
  
  // 定时检查提醒（每分钟检查一次）
  let checkInterval = null
  
  const scheduleReminderCheck = () => {
    if (checkInterval) {
      clearInterval(checkInterval)
    }
    
    checkInterval = setInterval(() => {
      checkAndTriggerReminders()
    }, 30000) // 每30秒检查一次
  }
  
  // 检查并触发提醒
  const checkAndTriggerReminders = () => {
    if (!isEnabled.value) return
    
    const babyId = babyStore.currentBabyId
    if (!babyId) return
    
    Object.values(reminders.value).forEach(reminder => {
      if (shouldTriggerReminder(reminder)) {
        addNotification(reminder)
        // 触发一次后禁用，直到下次任务时间重新设置
        reminder.enabled = false
        saveReminders()
      }
    })
  }
  
  // 格式化提醒时间显示
  const formatReminderTime = (reminder) => {
    if (!reminder) return ''
    
    if (reminder.reminderTime instanceof Date) {
      const date = new Date(reminder.reminderTime)
      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      
      if (date.toDateString() === today.toDateString()) {
        return `今天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
      } else if (date.toDateString() === tomorrow.toDateString()) {
        return `明天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
      } else {
        return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
      }
    } else {
      // HH:MM 格式
      return `每天 ${reminder.reminderTime}`
    }
  }
  
  // 初始化Store
  const init = () => {
    loadReminders()
    loadNotifications()
    scheduleReminderCheck()
  }
  
  // 清理
  const cleanup = () => {
    if (checkInterval) {
      clearInterval(checkInterval)
      checkInterval = null
    }
  }
  
  return {
    // 状态
    reminders,
    notifications,
    isEnabled,
    
    // 计算属性
    currentBabyReminderCount,
    unreadCount,
    
    // 方法
    init,
    cleanup,
    setReminder,
    removeReminder,
    getReminder,
    getCurrentBabyReminders,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    getCurrentBabyNotifications,
    shouldTriggerReminder,
    checkAndTriggerReminders,
    formatReminderTime,
    
    // 常量
    REMINDER_TYPES,
    BEFORE_OPTIONS
  }
})
