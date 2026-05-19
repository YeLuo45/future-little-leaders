<template>
  <view class="knowledge-node" :class="[`status-${status}`]" :style="nodeStyle">
    <!-- 背景圆形 -->
    <view class="node-bg" :style="bgStyle">
      <!-- 解锁状态图标 -->
      <view v-if="status === 'completed'" class="status-icon completed-icon">
        <text>✓</text>
      </view>
      <view v-else-if="status === 'in_progress'" class="status-icon progress-icon">
        <text class="progress-text">{{ progress }}</text>
      </view>
      <view v-else-if="status === 'available'" class="status-icon available-icon">
        <text>▶</text>
      </view>
      <view v-else class="status-icon locked-icon">
        <text>🔒</text>
      </view>
    </view>
    
    <!-- 节点名称 -->
    <text class="node-name" :class="nameClass">{{ node.name }}</text>
    
    <!-- 进度条 -->
    <view v-if="status === 'in_progress'" class="progress-bar">
      <view class="progress-fill" :style="{ width: progress + '%' }"></view>
    </view>
    
    <!-- 解锁动画效果 -->
    <view v-if="showUnlockAnimation" class="unlock-animation">
      <view class="unlock-ring"></view>
      <view class="unlock-ring delay-1"></view>
      <view class="unlock-ring delay-2"></view>
    </view>
  </view>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  node: {
    type: Object,
    default: () => ({})
  },
  status: {
    type: String,
    default: 'locked'  // locked, available, in_progress, completed
  },
  progress: {
    type: Number,
    default: 0
  },
  color: {
    type: String,
    default: '#4A90D9'
  },
  size: {
    type: Number,
    default: 100
  }
})

// 解锁动画
const showUnlockAnimation = ref(false)
watch(() => props.status, (newStatus, oldStatus) => {
  if (newStatus === 'completed' && oldStatus !== 'completed') {
    showUnlockAnimation.value = true
    setTimeout(() => {
      showUnlockAnimation.value = false
    }, 1000)
  }
})

const nodeStyle = computed(() => ({
  width: `${props.size}rpx`,
  height: `${props.size + 30}rpx`
}))

const bgStyle = computed(() => {
  const baseColor = props.color
  let bgColor = '#E5E7EB' // locked
  let borderColor = '#D1D5DB'
  let shadowColor = 'rgba(0,0,0,0.1)'
  
  switch (props.status) {
    case 'completed':
      bgColor = '#52c41a'
      borderColor = '#389e0d'
      shadowColor = 'rgba(82, 196, 26, 0.3)'
      break
    case 'in_progress':
      bgColor = baseColor
      borderColor = baseColor
      shadowColor = `${baseColor}50`
      break
    case 'available':
      bgColor = '#fff'
      borderColor = baseColor
      shadowColor = `${baseColor}30`
      break
    default:
      bgColor = '#E5E7EB'
      borderColor = '#D1D5DB'
  }
  
  return {
    width: `${props.size - 10}rpx`,
    height: `${props.size - 10}rpx`,
    backgroundColor: bgColor,
    borderColor: borderColor,
    boxShadow: `0 4rpx 12rpx ${shadowColor}`
  }
})

const nameClass = computed(() => {
  if (props.status === 'locked') return 'name-locked'
  if (props.status === 'completed') return 'name-completed'
  return 'name-active'
})
</script>

<style scoped>
.knowledge-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.node-bg {
  border-radius: 50%;
  border: 3rpx solid;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.status-icon {
  font-size: 32rpx;
  color: #fff;
}

.locked-icon {
  opacity: 0.5;
}

.available-icon {
  color: #1890ff;
}

.completed-icon {
  font-size: 40rpx;
}

.progress-text {
  font-size: 24rpx;
  font-weight: bold;
}

.node-name {
  font-size: 22rpx;
  margin-top: 8rpx;
  text-align: center;
  max-width: 120rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.name-locked {
  color: #9CA3AF;
}

.name-active {
  color: #374151;
  font-weight: 500;
}

.name-completed {
  color: #52c41a;
  font-weight: 500;
}

.progress-bar {
  width: 80rpx;
  height: 6rpx;
  background: #E5E7EB;
  border-radius: 3rpx;
  margin-top: 6rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #52c41a, #73d13d);
  border-radius: 3rpx;
  transition: width 0.3s ease;
}

/* 解锁动画 */
.unlock-animation {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.unlock-ring {
  position: absolute;
  width: 120rpx;
  height: 120rpx;
  border: 4rpx solid #52c41a;
  border-radius: 50%;
  animation: unlockPulse 1s ease-out forwards;
  opacity: 0;
}

.unlock-ring.delay-1 {
  animation-delay: 0.2s;
}

.unlock-ring.delay-2 {
  animation-delay: 0.4s;
}

@keyframes unlockPulse {
  0% {
    transform: translate(-50%, -50%) scale(0.5);
    opacity: 0.8;
  }
  100% {
    transform: translate(-50%, -50%) scale(2);
    opacity: 0;
  }
}
</style>
