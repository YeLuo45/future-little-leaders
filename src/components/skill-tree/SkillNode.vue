<template>
  <view 
    class="skill-node" 
    :class="[status, { 'pulse': status === 'available' }]"
    :style="nodeStyle"
    @tap="onTap"
  >
    <view class="node-circle">
      <text class="node-icon">{{ node.icon || '⭐' }}</text>
    </view>
    <view class="node-label">
      <text class="node-name">{{ node.name }}</text>
      <text class="node-tier">Tier {{ node.tier }}</text>
    </view>
    <!-- 进度环 -->
    <view class="progress-ring" v-if="status !== 'unlocked' && conditionCount > 0">
      <svg class="ring-svg" viewBox="0 0 40 40">
        <circle 
          class="ring-bg" 
          cx="20" cy="20" r="16" 
          stroke-width="3"
        />
        <circle 
          class="ring-fill" 
          cx="20" cy="20" r="16" 
          stroke-width="3"
          :stroke-dasharray="`${progressPercent * 1.0} 100`"
          :stroke="nodeColor"
        />
      </svg>
      <text class="ring-text">{{ currentProgress }}/{{ conditionCount }}</text>
    </view>
    <!-- 已解锁标记 -->
    <view class="unlocked-badge" v-if="status === 'unlocked'">
      <text class="badge-icon">✓</text>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  node: {
    type: Object,
    required: true
  },
  status: {
    type: String,
    default: 'locked' // locked, available, unlocked
  },
  currentProgress: {
    type: Number,
    default: 0
  },
  nodeColor: {
    type: String,
    default: '#4A90D9'
  },
  size: {
    type: Number,
    default: 120
  }
})

const emit = defineEmits(['tap'])

const conditionCount = computed(() => props.node.conditionCount || 0)

const progressPercent = computed(() => {
  if (!conditionCount.value) return 0
  return Math.min(100, (props.currentProgress / conditionCount.value) * 100)
})

const nodeStyle = computed(() => {
  const baseSize = props.size
  return {
    width: `${baseSize}rpx`,
    height: `${baseSize}rpx`
  }
})

const onTap = () => {
  emit('tap', props.node)
}
</script>

<style scoped>
.skill-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: pointer;
}

.node-circle {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border: 4rpx solid #e0e0e0;
}

.skill-node.locked .node-circle {
  background: #f5f5f5;
  border-color: #d9d9d9;
}

.skill-node.available .node-circle {
  border-color: #1890ff;
  box-shadow: 0 0 20rpx rgba(24, 144, 255, 0.4);
}

.skill-node.unlocked .node-circle {
  background: linear-gradient(135deg, #52c41a, #389e0d);
  border-color: #52c41a;
  box-shadow: 0 0 20rpx rgba(82, 196, 26, 0.4);
}

.node-icon {
  font-size: 40rpx;
}

.skill-node.locked .node-icon {
  opacity: 0.5;
}

.node-label {
  margin-top: 8rpx;
  text-align: center;
}

.node-name {
  font-size: 22rpx;
  color: #333;
  display: block;
  white-space: nowrap;
}

.skill-node.locked .node-name {
  color: #999;
}

.node-tier {
  font-size: 18rpx;
  color: #999;
}

/* 可用状态闪烁动画 */
.skill-node.pulse .node-circle {
  animation: pulse-animation 2s ease-in-out infinite;
}

@keyframes pulse-animation {
  0%, 100% {
    box-shadow: 0 0 20rpx rgba(24, 144, 255, 0.4);
  }
  50% {
    box-shadow: 0 0 30rpx rgba(24, 144, 255, 0.7);
  }
}

/* 进度环 */
.progress-ring {
  position: absolute;
  top: -5rpx;
  right: -5rpx;
  width: 40rpx;
  height: 40rpx;
}

.ring-svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.ring-bg {
  fill: none;
  stroke: #e0e0e0;
}

.ring-fill {
  fill: none;
  stroke-linecap: round;
  transition: stroke-dasharray 0.3s ease;
}

.ring-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 10rpx;
  color: #666;
  white-space: nowrap;
}

/* 已解锁徽章 */
.unlocked-badge {
  position: absolute;
  top: -5rpx;
  right: -5rpx;
  width: 32rpx;
  height: 32rpx;
  background: #52c41a;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx solid #fff;
}

.badge-icon {
  font-size: 18rpx;
  color: #fff;
  font-weight: bold;
}
</style>