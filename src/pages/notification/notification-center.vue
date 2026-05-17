<!-- V7 通知中心 — 重构：Tab分组 + 日期分组 + 未读置顶 -->
<template>
  <view class="page-container">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <view class="nav-left" @tap="goBack">
        <text class="icon">←</text>
      </view>
      <text class="nav-title">通知中心</text>
      <view class="nav-right" @tap="goToSettings">
        <text class="settings-icon">⚙️</text>
      </view>
    </view>

    <!-- Tab 切换 -->
    <view class="tab-bar">
      <view 
        v-for="tab in tabs" 
        :key="tab.key"
        class="tab-item"
        :class="{ active: currentTab === tab.key }"
        @tap="switchTab(tab.key)"
      >
        <text class="tab-text">{{ tab.label }}</text>
        <view class="tab-badge" v-if="getTabUnread(tab.key) > 0">
          <text class="badge-text">{{ getTabUnread(tab.key) > 99 ? '99+' : getTabUnread(tab.key) }}</text>
        </view>
      </view>
    </view>

    <!-- 通知列表 -->
    <scroll-view scroll-y class="notif-list" @scrolltolower="loadMore">
      <view v-if="groupedNotifications.today.length > 0">
        <view class="date-header">
          <text class="date-label">今天</text>
        </view>
        <NotificationItem
          v-for="notif in groupedNotifications.today"
          :key="notif.id"
          :notification="notif"
          @tap="onNotifTap"
          @delete="onDelete"
        />
      </view>

      <view v-if="groupedNotifications.yesterday.length > 0">
        <view class="date-header">
          <text class="date-label">昨天</text>
        </view>
        <NotificationItem
          v-for="notif in groupedNotifications.yesterday"
          :key="notif.id"
          :notification="notif"
          @tap="onNotifTap"
          @delete="onDelete"
        />
      </view>

      <view v-if="groupedNotifications.older.length > 0">
        <view class="date-header">
          <text class="date-label">更早</text>
        </view>
        <NotificationItem
          v-for="notif in groupedNotifications.older"
          :key="notif.id"
          :notification="notif"
          @tap="onNotifTap"
          @delete="onDelete"
        />
      </view>

      <!-- 空状态 -->
      <view v-if="isEmpty" class="empty-state">
        <text class="empty-icon">🔔</text>
        <text class="empty-text">暂无通知</text>
        <text class="empty-hint">完成家庭任务后，你会收到通知</text>
      </view>

      <!-- 加载更多 -->
      <view v-if="hasMore && !isEmpty" class="load-more" @tap="loadMore">
        <text>加载更多</text>
      </view>
    </scroll-view>

    <!-- 底部操作栏 -->
    <view class="bottom-bar" v-if="notifications.length > 0">
      <view class="mark-all-btn" @tap="markAllRead">
        <text>全部已读</text>
      </view>
      <view class="clear-btn" @tap="clearAll">
        <text>清空</text>
      </view>
    </view>

    <!-- 通知详情弹窗 -->
    <view v-if="selectedNotif" class="notif-detail-overlay" @tap="closeDetail">
      <view class="notif-detail-card" @tap.stop>
        <text class="detail-icon">{{ getChannelIcon(selectedNotif.channel) }}</text>
        <text class="detail-title">{{ selectedNotif.title }}</text>
        <text class="detail-content">{{ selectedNotif.content }}</text>
        <text class="detail-time">{{ formatDetailTime(selectedNotif.createdAt) }}</text>
        <view class="detail-actions" v-if="selectedNotif.actions && selectedNotif.actions.length">
          <button 
            v-for="(action, idx) in selectedNotif.actions" 
            :key="idx"
            class="detail-action-btn"
            :class="action.action"
            @tap="handleAction(action)"
          >
            {{ action.label }}
          </button>
        </view>
        <button class="detail-btn" @tap="closeDetail">关闭</button>
      </view>
    </view>
  </view>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import NotificationItem from '@/components/notification/NotificationItem.vue'

export default {
  components: { NotificationItem },
  setup() {
    const notifications = ref([])
    const selectedNotif = ref(null)
    const currentTab = ref('all')
    const page = ref(0)
    const pageSize = 20
    const hasMore = ref(false)
    const channelCounts = ref({})
    const currentBabyId = ref('')

    const tabs = [
      { key: 'all', label: '全部' },
      { key: 'task', label: '任务' },
      { key: 'achievement', label: '成就' },
      { key: 'points', label: '积分' },
      { key: 'system', label: '系统' }
    ]

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

    const groupedNotifications = computed(() => {
      const groups = {
        today: [],
        yesterday: [],
        older: []
      }
      
      const now = new Date()
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
      const yesterdayStart = todayStart - 86400000
      
      // Unread first, then by date
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

    const isEmpty = computed(() => {
      return groupedNotifications.value.today.length === 0 &&
             groupedNotifications.value.yesterday.length === 0 &&
             groupedNotifications.value.older.length === 0
    })

    const loadNotifications = async () => {
      try {
        const NotificationService = require('../../services/notificationService').default || require('../../services/notificationService')
        currentBabyId.value = uni.getStorageSync('currentBabyId') || ''
        
        const list = await NotificationService.getNotifications(currentBabyId.value, {
          limit: (page.value + 1) * pageSize
        })
        notifications.value = list
        hasMore.value = list.length >= (page.value + 1) * pageSize
        
        // Get channel counts
        channelCounts.value = await NotificationService.getChannelUnreadCounts(currentBabyId.value)
      } catch (e) {
        console.error('加载通知失败:', e)
      }
    }

    const loadMore = () => {
      if (hasMore.value) {
        page.value++
        loadNotifications()
      }
    }

    const switchTab = (tab) => {
      currentTab.value = tab
    }

    const getTabUnread = (tabKey) => {
      if (tabKey === 'all') {
        return Object.values(channelCounts.value).reduce((a, b) => a + b, 0)
      }
      const channels = tabChannels[tabKey] || []
      return channels.reduce((sum, ch) => sum + (channelCounts.value[ch] || 0), 0)
    }

    const getChannelIcon = (channel) => {
      const icons = {
        task: '📋', achievement: '🎉', points: '💰', reminder: '⏰',
        flow: '🔄', skill_tree: '🌱', streak: '🔥', growth_report: '📊',
        family_broadcast: '📢', system: '⚙️', sync: '☁️', collaboration: '👥'
      }
      return icons[channel] || '📌'
    }

    const formatDetailTime = (createdAt) => {
      if (!createdAt) return ''
      const d = new Date(createdAt)
      return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
    }

    const onNotifTap = async (notif) => {
      selectedNotif.value = notif
      // Auto mark as read
      if (!notif.read) {
        try {
          const NotificationService = require('../../services/notificationService').default || require('../../services/notificationService')
          await NotificationService.markRead(notif.id)
          notif.read = true
          channelCounts.value[notif.channel] = Math.max(0, (channelCounts.value[notif.channel] || 0) - 1)
        } catch (e) {
          console.error('标记已读失败:', e)
        }
      }
    }

    const onDelete = async (id) => {
      try {
        const NotificationService = require('../../services/notificationService').default || require('../../services/notificationService')
        await NotificationService.deleteNotification(id)
        const idx = notifications.value.findIndex(n => n.id === id)
        if (idx !== -1) {
          if (!notifications.value[idx].read) {
            channelCounts.value[notifications.value[idx].channel] = Math.max(0, (channelCounts.value[notifications.value[idx].channel] || 0) - 1)
          }
          notifications.value.splice(idx, 1)
        }
        uni.showToast({ title: '已删除', icon: 'none' })
      } catch (e) {
        console.error('删除失败:', e)
      }
    }

    const markAllRead = async () => {
      try {
        const NotificationService = require('../../services/notificationService').default || require('../../services/notificationService')
        await NotificationService.markAllRead(currentBabyId.value)
        notifications.value.forEach(n => n.read = true)
        channelCounts.value = {}
        uni.showToast({ title: '已全部已读', icon: 'success' })
      } catch (e) {
        console.error('全部已读失败:', e)
      }
    }

    const clearAll = async () => {
      uni.showModal({
        title: '确认清空',
        content: '确定要清空所有通知吗？',
        success: async (res) => {
          if (res.confirm) {
            try {
              const NotificationService = require('../../services/notificationService').default || require('../../services/notificationService')
              await NotificationService.clearAll(currentBabyId.value)
              notifications.value = []
              channelCounts.value = {}
              uni.showToast({ title: '已清空', icon: 'success' })
            } catch (e) {
              console.error('清空失败:', e)
            }
          }
        }
      })
    }

    const handleAction = (action) => {
      // Handle action.payload based on action.action type
      console.log('[V7] Action:', action)
      closeDetail()
    }

    const closeDetail = () => {
      selectedNotif.value = null
    }

    const goBack = () => {
      uni.navigateBack()
    }

    const goToSettings = () => {
      uni.navigateTo({
        url: '/pages/notification/notification-settings'
      })
    }

    onMounted(() => {
      loadNotifications()

      // Listen for notification updates
      uni.$on('notification:updated', () => {
        loadNotifications()
      })
    })

    onUnmounted(() => {
      uni.$off('notification:updated')
    })

    return {
      notifications,
      selectedNotif,
      currentTab,
      hasMore,
      tabs,
      groupedNotifications,
      isEmpty,
      switchTab,
      getTabUnread,
      getChannelIcon,
      formatDetailTime,
      onNotifTap,
      onDelete,
      markAllRead,
      clearAll,
      handleAction,
      closeDetail,
      loadMore,
      goBack,
      goToSettings
    }
  }
}
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}
.nav-bar {
  display: flex;
  align-items: center;
  height: 88rpx;
  background: linear-gradient(135deg, #8B5CF6, #7C3AED);
  padding: 90rpx 40rpx 60rpx;
  position: relative;
}
.nav-left { position: absolute; left: 30rpx; }
.icon { color: white; font-size: 48rpx; font-weight: bold; }
.nav-title { flex: 1; text-align: center; color: white; font-size: 36rpx; font-weight: bold; }
.nav-right { position: absolute; right: 30rpx; }
.settings-icon { font-size: 40rpx; }

.tab-bar {
  display: flex;
  background: white;
  padding: 0 16rpx;
  border-bottom: 1rpx solid #F0F0F0;
}
.tab-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24rpx 0;
  position: relative;
}
.tab-item.active {
  border-bottom: 4rpx solid #8B5CF6;
}
.tab-item.active .tab-text {
  color: #8B5CF6;
  font-weight: bold;
}
.tab-text {
  font-size: 28rpx;
  color: #666;
}
.tab-badge {
  position: absolute;
  top: 12rpx;
  right: 16rpx;
  min-width: 32rpx;
  height: 32rpx;
  background: #F5222D;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 8rpx;
}
.badge-text {
  color: white;
  font-size: 20rpx;
  font-weight: bold;
}

.notif-list {
  height: calc(100vh - 340rpx);
  padding: 20rpx;
}

.date-header {
  padding: 16rpx 0;
}
.date-label {
  font-size: 24rpx;
  color: #999;
  font-weight: 500;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 120rpx;
}
.empty-icon { font-size: 100rpx; margin-bottom: 30rpx; }
.empty-text { font-size: 32rpx; color: #333; font-weight: bold; margin-bottom: 16rpx; }
.empty-hint { font-size: 26rpx; color: #999; }

.load-more {
  text-align: center;
  padding: 30rpx;
  color: #8B5CF6;
  font-size: 26rpx;
}

.bottom-bar {
  display: flex;
  gap: 24rpx;
  padding: 24rpx 32rpx;
  background: white;
  border-top: 1rpx solid #F0F0F0;
}
.mark-all-btn, .clear-btn {
  flex: 1;
  text-align: center;
  padding: 20rpx 0;
  border-radius: 40rpx;
  font-size: 28rpx;
}
.mark-all-btn {
  background: #F5F3FF;
  color: #7C3AED;
}
.clear-btn {
  background: #FFF1F0;
  color: #F5222D;
}

.notif-detail-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}
.notif-detail-card {
  background: white;
  border-radius: 24rpx;
  padding: 48rpx;
  margin: 40rpx;
  max-width: 600rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.detail-icon { font-size: 80rpx; margin-bottom: 24rpx; }
.detail-title { font-size: 36rpx; font-weight: bold; color: #333; margin-bottom: 16rpx; text-align: center; }
.detail-content { font-size: 28rpx; color: #666; text-align: center; line-height: 1.6; margin-bottom: 24rpx; }
.detail-time { font-size: 24rpx; color: #999; margin-bottom: 24rpx; }
.detail-actions {
  display: flex;
  gap: 24rpx;
  margin-bottom: 24rpx;
}
.detail-action-btn {
  padding: 16rpx 40rpx;
  border-radius: 40rpx;
  font-size: 28rpx;
  border: none;
}
.detail-action-btn.approve {
  background: #F6FFED;
  color: #52C41A;
}
.detail-action-btn.reject {
  background: #FFF1F0;
  color: #F5222D;
}
.detail-btn {
  background: #8B5CF6;
  color: white;
  border: none;
  border-radius: 40rpx;
  padding: 20rpx 60rpx;
  font-size: 28rpx;
}
</style>