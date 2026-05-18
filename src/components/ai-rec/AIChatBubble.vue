<template>
  <view class="chat-bubble" :class="[`bubble-${role}`, { 'is-animating': isAnimating }]">
    <!-- AI 头像 -->
    <view class="bubble-avatar" v-if="role === 'ai'">
      <text>🤖</text>
    </view>

    <!-- 消息内容 -->
    <view class="bubble-content">
      <text class="bubble-text">{{ content }}</text>

      <!-- 时间戳 -->
      <text class="bubble-time" v-if="timestamp">{{ formatTime(timestamp) }}</text>

      <!-- 动作按钮 -->
      <view class="bubble-actions" v-if="actions && actions.length > 0">
        <view
          v-for="(action, index) in actions"
          :key="index"
          class="action-chip"
          @click="handleAction(action)"
        >
          <text>{{ action.label || action.type }}</text>
        </view>
      </view>
    </view>

    <!-- 用户头像 -->
    <view class="bubble-avatar user-avatar" v-if="role === 'user'">
      <text>👶</text>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  role: {
    type: String,
    default: 'ai',
    validator: (v) => ['ai', 'user'].includes(v)
  },
  content: {
    type: String,
    default: ''
  },
  timestamp: {
    type: String,
    default: ''
  },
  actions: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['action'])

const isAnimating = ref(false)

onMounted(() => {
  setTimeout(() => {
    isAnimating.value = true
  }, 50)
})

function formatTime(timeStr) {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

function handleAction(action) {
  emit('action', action)
}
</script>

<style scoped>
.chat-bubble {
  display: flex;
  gap: 16rpx;
  margin-bottom: 24rpx;
  opacity: 0;
  transform: translateY(10rpx);
  transition: all 0.2s ease-out;
}

.is-animating {
  opacity: 1;
  transform: translateY(0);
}

.bubble-ai {
  flex-direction: row;
}

.bubble-user {
  flex-direction: row-reverse;
}

.bubble-avatar {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #7C3AED 0%, #EC4899 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  flex-shrink: 0;
}

.user-avatar {
  background: linear-gradient(135deg, #10B981 0%, #34D399 100%);
}

.bubble-content {
  max-width: 520rpx;
  padding: 20rpx 24rpx;
  border-radius: 24rpx;
  position: relative;
}

.bubble-ai .bubble-content {
  background: #FFFFFF;
  border: 2rpx solid #F3F4F6;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
}

.bubble-user .bubble-content {
  background: linear-gradient(135deg, #7C3AED 0%, #EC4899 100%);
  color: #FFFFFF;
}

.bubble-text {
  font-size: 28rpx;
  line-height: 1.6;
  color: #1F2937;
}

.bubble-user .bubble-text {
  color: #FFFFFF;
}

.bubble-time {
  display: block;
  font-size: 20rpx;
  color: #9CA3AF;
  margin-top: 8rpx;
}

.bubble-user .bubble-time {
  color: rgba(255, 255, 255, 0.7);
}

.bubble-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 16rpx;
}

.action-chip {
  padding: 8rpx 16rpx;
  background: #F3F4F6;
  border-radius: 16rpx;
  font-size: 22rpx;
  color: #7C3AED;
}

.bubble-user .action-chip {
  background: rgba(255, 255, 255, 0.2);
  color: #FFFFFF;
}
</style>
