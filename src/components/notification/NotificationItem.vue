<!-- V7 NotificationItem — 单条通知组件 -->
<template>
  <view 
    class="notification-item" 
    :class="{ unread: !notification.read, 'high-priority': notification.priority === 'high' || notification.priority === 'urgent' }"
    @tap="onTap"
  >
    <!-- 通道图标 -->
    <view class="channel-icon" :style="{ background: channelInfo.color + '20' }">
      <text class="icon">{{ channelInfo.icon }}</text>
    </view>

    <!-- 内容区域 -->
    <view class="content">
      <view class="header">
        <text class="title">{{ notification.title }}</text>
        <text class="time">{{ formatTime(notification.createdAt) }}</text>
      </view>
      <text class="body">{{ notification.content }}</text>
      
      <!-- 操作按钮 -->
      <view class="actions" v-if="notification.actions && notification.actions.length">
        <view 
          v-for="(action, idx) in notification.actions" 
          :key="idx"
          class="action-btn"
          :class="action.action"
          @tap.stop="onAction(action)"
        >
          {{ action.label }}
        </view>
      </view>
    </view>

    <!-- 未读指示点 -->
    <view class="unread-dot" v-if="!notification.read"></view>

    <!-- 删除按钮 -->
    <view class="delete-btn" @tap.stop="onDelete">
      <text>✕</text>
    </view>
  </view>
</template>

<script>
import { computed } from 'vue'

export default {
  props: {
    notification: {
      type: Object,
      required: true
    }
  },
  emits: ['tap', 'action', 'delete'],
  setup(props, { emit }) {
    const channelInfo = computed(() => {
      const info = {
        task: { icon: '📋', color: '#4A90D9' },
        achievement: { icon: '🎉', color: '#52C41A' },
        points: { icon: '💰', color: '#FA8C16' },
        reminder: { icon: '⏰', color: '#1890FF' },
        flow: { icon: '🔄', color: '#722ED1' },
        skill_tree: { icon: '🌱', color: '#13C2C2' },
        streak: { icon: '🔥', color: '#F5222D' },
        growth_report: { icon: '📊', color: '#EB2F96' },
        family_broadcast: { icon: '📢', color: '#7C3AED' },
        system: { icon: '⚙️', color: '#999999' },
        sync: { icon: '☁️', color: '#2F54EB' },
        collaboration: { icon: '👥', color: '#FAAD14' }
      }
      return info[props.notification.channel] || { icon: '📌', color: '#999999' }
    })

    const formatTime = (createdAt) => {
      if (!createdAt) return ''
      const ts = typeof createdAt === 'string' ? new Date(createdAt).getTime() : createdAt
      const now = Date.now()
      const diff = now - ts
      if (diff < 60000) return '刚刚'
      if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前'
      if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前'
      const d = new Date(ts)
      return `${d.getMonth() + 1}月${d.getDate()}日`
    }

    const onTap = () => {
      emit('tap', props.notification)
    }

    const onAction = (action) => {
      emit('action', { notification: props.notification, action })
    }

    const onDelete = () => {
      emit('delete', props.notification.id)
    }

    return {
      channelInfo,
      formatTime,
      onTap,
      onAction,
      onDelete
    }
  }
}
</script>

<style scoped>
.notification-item {
  display: flex;
  align-items: flex-start;
  padding: 24rpx;
  background: white;
  border-radius: 16rpx;
  margin-bottom: 16rpx;
  gap: 20rpx;
  position: relative;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.04);
  transition: transform 0.2s;
}

.notification-item:active {
  transform: scale(0.98);
}

.notification-item.unread {
  border-left: 6rpx solid #8B5CF6;
}

.notification-item.high-priority {
  background: #FFF5F5;
}

.channel-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.channel-icon .icon {
  font-size: 40rpx;
}

.content {
  flex: 1;
  min-width: 0;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8rpx;
}

.title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.time {
  font-size: 22rpx;
  color: #999;
}

.body {
  font-size: 26rpx;
  color: #666;
  line-height: 1.5;
  display: block;
}

.actions {
  display: flex;
  gap: 16rpx;
  margin-top: 16rpx;
}

.action-btn {
  padding: 8rpx 24rpx;
  border-radius: 30rpx;
  font-size: 24rpx;
  background: #F5F3FF;
  color: #7C3AED;
}

.action-btn.approve {
  background: #F6FFED;
  color: #52C41A;
}

.action-btn.reject {
  background: #FFF1F0;
  color: #F5222D;
}

.unread-dot {
  position: absolute;
  top: 24rpx;
  right: 80rpx;
  width: 16rpx;
  height: 16rpx;
  background: #8B5CF6;
  border-radius: 50%;
}

.delete-btn {
  position: absolute;
  top: 16rpx;
  right: 16rpx;
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ccc;
  font-size: 28rpx;
}
</style>