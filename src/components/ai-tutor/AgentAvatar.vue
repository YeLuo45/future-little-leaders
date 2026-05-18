<template>
  <view class="agent-avatar" :class="[`agent-${agentId}`, `mood-${mood}`, { 'is-active': isActive }]">
    <view class="avatar-wrapper">
      <text class="avatar-emoji">{{ emoji }}</text>
      <view class="status-dot" v-if="showStatus && isActive"></view>
    </view>
    <text class="agent-name" v-if="showName">{{ name }}</text>
  </view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  // Agent ID
  agentId: {
    type: String,
    default: 'orchestrator'
  },
  // Agent 名称
  name: {
    type: String,
    default: ''
  },
  // Agent emoji
  emoji: {
    type: String,
    default: '🎓'
  },
  // 当前心情
  mood: {
    type: String,
    default: 'happy'
  },
  // 是否显示名称
  showName: {
    type: Boolean,
    default: false
  },
  // 是否显示状态点
  showStatus: {
    type: Boolean,
    default: true
  },
  // 是否活跃
  isActive: {
    type: Boolean,
    default: false
  },
  // 大小: small, medium, large
  size: {
    type: String,
    default: 'medium'
  }
})

// 心情样式映射
const moodStyles = {
  happy: '#FCD34D',
  encouraging: '#34D399',
  excited: '#F472B6',
  calm: '#60A5FA',
  serious: '#9CA3AF'
}
</script>

<style scoped>
.agent-avatar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.avatar-wrapper {
  position: relative;
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.agent-avatar.is-active .avatar-wrapper {
  transform: scale(1.1);
  box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.15);
}

.avatar-emoji {
  font-size: 40rpx;
  line-height: 1;
}

.status-dot {
  position: absolute;
  bottom: 4rpx;
  right: 4rpx;
  width: 16rpx;
  height: 16rpx;
  background: #10B981;
  border-radius: 50%;
  border: 3rpx solid #FFFFFF;
}

.agent-name {
  font-size: 22rpx;
  color: #6B7280;
  text-align: center;
  max-width: 100rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Agent特定样式 */
.agent-orchestrator .avatar-wrapper {
  background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
}

.agent-math .avatar-wrapper {
  background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
}

.agent-chinese .avatar-wrapper {
  background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
}

.agent-english .avatar-wrapper {
  background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
}

.agent-life .avatar-wrapper {
  background: linear-gradient(135deg, #10B981 0%, #059669 100%);
}

/* 心情动画 */
.mood-excited .avatar-wrapper {
  animation: bounce 0.6s ease infinite alternate;
}

.mood-happy .avatar-wrapper {
  animation: pulse 2s ease infinite;
}

@keyframes bounce {
  from { transform: translateY(0); }
  to { transform: translateY(-4rpx); }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
</style>
