<template>
  <view class="page-container">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <view class="nav-left" @tap="goBack">
        <text class="back-icon">←</text>
      </view>
      <text class="nav-title">通知中心</text>
      <view class="nav-right" @tap="clearAll" v-if="notifications.length > 0">
        <text class="clear-text">清空</text>
      </view>
    </view>

    <!-- 通知列表 -->
    <scroll-view scroll-y class="content">
      <!-- 空状态 -->
      <view v-if="notifications.length === 0" class="empty-state">
        <text class="empty-icon">🔔</text>
        <text class="empty-text">暂无通知</text>
        <text class="empty-hint">设置任务提醒后，按时完成任务可获得额外积分奖励哦~</text>
      </view>

      <!-- 通知列表 -->
      <view v-else class="notification-list">
        <!-- 今日提醒 -->
        <view v-if="todayNotifications.length > 0" class="notification-group">
          <view class="group-header">
            <text class="group-title">今日提醒</text>
            <text class="group-count">{{ todayNotifications.length }}条</text>
          </view>
          <view 
            v-for="notification in todayNotifications" 
            :key="notification.id"
            class="notification-item"
            :class="{ unread: !notification.read }"
            @tap="handleNotificationTap(notification)"
          >
            <view class="notification-icon">
              <text>⏰</text>
            </view>
            <view class="notification-content">
              <view class="notification-header">
                <text class="notification-title">{{ notification.taskTitle }}</text>
                <text class="notification-time">{{ formatTime(notification.createdAt) }}</text>
              </view>
              <text class="notification-desc">{{ notification.taskDescription || '任务提醒' }}</text>
              <view class="notification-action" v-if="!notification.read">
                <text class="action-text">点击查看任务</text>
              </view>
            </view>
            <view class="notification-delete" @tap.stop="deleteNotification(notification.id)">
              <text>×</text>
            </view>
          </view>
        </view>

        <!-- 更早提醒 -->
        <view v-if="earlierNotifications.length > 0" class="notification-group">
          <view class="group-header">
            <text class="group-title">更早</text>
            <text class="group-count">{{ earlierNotifications.length }}条</text>
          </view>
          <view 
            v-for="notification in earlierNotifications" 
            :key="notification.id"
            class="notification-item"
            :class="{ unread: !notification.read }"
            @tap="handleNotificationTap(notification)"
          >
            <view class="notification-icon">
              <text>⏰</text>
            </view>
            <view class="notification-content">
              <view class="notification-header">
                <text class="notification-title">{{ notification.taskTitle }}</text>
                <text class="notification-time">{{ formatTime(notification.createdAt) }}</text>
              </view>
              <text class="notification-desc">{{ notification.taskDescription || '任务提醒' }}</text>
            </view>
            <view class="notification-delete" @tap.stop="deleteNotification(notification.id)">
              <text>×</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 标记已读按钮 -->
    <view class="bottom-bar" v-if="unreadCount > 0">
      <button class="mark-read-btn" @tap="markAllRead">标记全部已读</button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useReminderStore } from '@/stores/reminderStore'

const reminderStore = useReminderStore()

const notifications = ref([])

// 今日通知
const todayNotifications = computed(() => {
  const today = new Date().toDateString()
  return notifications.value.filter(n => {
    const notifDate = new Date(n.createdAt)
    return notifDate.toDateString() === today
  })
})

// 更早通知
const earlierNotifications = computed(() => {
  const today = new Date().toDateString()
  return notifications.value.filter(n => {
    const notifDate = new Date(n.createdAt)
    return notifDate.toDateString() !== today
  })
})

// 未读数量
const unreadCount = computed(() => {
  return notifications.value.filter(n => !n.read).length
})

// 格式化时间
const formatTime = (isoString) => {
  const date = new Date(isoString)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 86400000)
  const notifDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  const timeStr = `${hours}:${minutes}`
  
  if (notifDate.getTime() === today.getTime()) {
    return timeStr
  } else if (notifDate.getTime() === yesterday.getTime()) {
    return `昨天 ${timeStr}`
  } else {
    return `${date.getMonth() + 1}/${date.getDate()} ${timeStr}`
  }
}

// 加载通知
const loadNotifications = () => {
  notifications.value = reminderStore.getCurrentBabyNotifications()
}

// 处理通知点击
const handleNotificationTap = (notification) => {
  // 标记为已读
  if (!notification.read) {
    reminderStore.markAsRead(notification.id)
    notification.read = true
  }
  
  // 跳转到任务详情（如果有）
  if (notification.taskId) {
    // 这里可以跳转到任务编辑页
    uni.showToast({
      title: '任务提醒：' + notification.taskTitle,
      icon: 'none'
    })
  }
}

// 删除单条通知
const deleteNotification = (notificationId) => {
  reminderStore.deleteNotification(notificationId)
  loadNotifications()
  
  uni.showToast({
    title: '已删除',
    icon: 'none'
  })
}

// 清空所有通知
const clearAll = () => {
  uni.showModal({
    title: '确认清空',
    content: '确定要清空所有通知吗？',
    success: (res) => {
      if (res.confirm) {
        reminderStore.clearAllNotifications()
        loadNotifications()
        
        uni.showToast({
          title: '已清空',
          icon: 'none'
        })
      }
    }
  })
}

// 标记全部已读
const markAllRead = () => {
  reminderStore.markAllAsRead()
  notifications.value.forEach(n => n.read = true)
  
  uni.showToast({
    title: '已全部标记为已读',
    icon: 'none'
  })
}

// 返回
const goBack = () => {
  uni.navigateBack()
}

// 初始化
onMounted(() => {
  loadNotifications()
  
  // 监听新通知
  uni.$on('reminderNotification', () => {
    loadNotifications()
  })
})

import { onUnmounted } from 'vue'
onUnmounted(() => {
  uni.$off('reminderNotification')
})
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 44px;
  padding: 0 16px;
  background-color: #fff;
  border-bottom: 1px solid #eee;
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-left, .nav-right {
  width: 60px;
}

.back-icon {
  font-size: 20px;
  color: #333;
}

.nav-title {
  font-size: 17px;
  font-weight: 600;
  color: #333;
}

.clear-text {
  font-size: 14px;
  color: #ff3b30;
}

.nav-right {
  text-align: right;
}

.content {
  height: calc(100vh - 44px - 60px);
  padding: 16px;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 40px;
}

.empty-icon {
  font-size: 60px;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 16px;
  color: #666;
  margin-bottom: 8px;
}

.empty-hint {
  font-size: 14px;
  color: #999;
  text-align: center;
  line-height: 1.5;
}

/* 通知列表 */
.notification-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.notification-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px;
}

.group-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.group-count {
  font-size: 12px;
  color: #999;
}

.notification-item {
  display: flex;
  background: #fff;
  border-radius: 12px;
  padding: 14px;
  position: relative;
}

.notification-item.unread {
  background: linear-gradient(135deg, #667eea10 0%, #764ba210 100%);
  border-left: 3px solid #667eea;
}

.notification-icon {
  width: 40px;
  height: 40px;
  background: #f0f0f0;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  margin-right: 12px;
  flex-shrink: 0;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.notification-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.notification-time {
  font-size: 12px;
  color: #999;
  margin-left: 8px;
  flex-shrink: 0;
}

.notification-desc {
  font-size: 13px;
  color: #666;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.notification-action {
  margin-top: 6px;
}

.action-text {
  font-size: 12px;
  color: #667eea;
}

.notification-delete {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #ccc;
  position: absolute;
  top: 8px;
  right: 8px;
}

/* 底部按钮 */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 16px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
  background: #fff;
  border-top: 1px solid #eee;
}

.mark-read-btn {
  width: 100%;
  height: 44px;
  line-height: 44px;
  background: #f5f5f5;
  color: #333;
  font-size: 15px;
  border-radius: 22px;
  border: none;
}

.mark-read-btn:active {
  background: #e5e5e5;
}
</style>
