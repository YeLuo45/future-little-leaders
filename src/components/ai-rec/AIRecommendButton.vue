<template>
  <view class="ai-recommend-button" :class="{ 'is-expanded': isExpanded }" @click="handleClick">
    <!-- AI 图标 -->
    <view class="ai-icon">
      <text class="ai-avatar">{{ isExpanded ? '✨' : '🤖' }}</text>
      <!-- 脉冲动画 -->
      <view class="pulse-ring" v-if="showPulse"></view>
    </view>

    <!-- 展开内容 -->
    <view class="expanded-content" v-if="isExpanded">
      <text class="expand-text">AI 推荐</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  showPulse: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click'])

const isExpanded = ref(false)

function handleClick() {
  emit('click')
}
</script>

<style scoped>
.ai-recommend-button {
  position: fixed;
  right: 32rpx;
  bottom: 200rpx;
  z-index: 999;
  display: flex;
  align-items: center;
  gap: 12rpx;
  background: linear-gradient(135deg, #7C3AED 0%, #EC4899 100%);
  border-radius: 50rpx;
  padding: 24rpx;
  box-shadow: 0 8rpx 32rpx rgba(124, 58, 237, 0.4);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.ai-recommend-button:active {
  transform: scale(0.95);
}

.is-expanded {
  border-radius: 40rpx;
}

.ai-icon {
  position: relative;
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ai-avatar {
  font-size: 40rpx;
  line-height: 1;
}

.pulse-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: rgba(124, 58, 237, 0.3);
  animation: pulse 2s ease-out infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(1.8);
    opacity: 0;
  }
}

.expanded-content {
  padding-right: 8rpx;
}

.expand-text {
  font-size: 28rpx;
  font-weight: 600;
  color: #FFFFFF;
  white-space: nowrap;
}
</style>
