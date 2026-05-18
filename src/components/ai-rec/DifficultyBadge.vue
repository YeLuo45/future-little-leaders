<template>
  <view class="difficulty-badge" :class="[`difficulty-${level}`]" :style="badgeStyle">
    <text class="badge-icon">{{ iconMap[level] || '📊' }}</text>
    <text class="badge-text">{{ label }}</text>
  </view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  // 难度等级: 'easy' | 'medium' | 'hard'
  level: {
    type: String,
    default: 'medium',
    validator: (v) => ['easy', 'medium', 'hard'].includes(v)
  },
  // 是否显示原因
  showReason: {
    type: Boolean,
    default: false
  }
})

const iconMap = {
  easy: '🌱',
  medium: '⚡',
  hard: '🔥'
}

const labelMap = {
  easy: '简单',
  medium: '中等',
  hard: '困难'
}

const colorMap = {
  easy: '#10B981',
  medium: '#F59E0B',
  hard: '#EF4444'
}

const label = computed(() => labelMap[props.level] || '中等')

const badgeStyle = computed(() => ({
  '--badge-color': colorMap[props.level] || colorMap.medium
}))
</script>

<style scoped>
.difficulty-badge {
  display: inline-flex;
  align-items: center;
  gap: 4rpx;
  padding: 4rpx 12rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  font-weight: 500;
  background-color: var(--badge-color);
  opacity: 0.15;
  color: var(--badge-color);
}

.difficulty-badge .badge-icon {
  font-size: 20rpx;
}

.difficulty-easy {
  opacity: 1;
  background-color: rgba(16, 185, 129, 0.12);
  color: #10B981;
}

.difficulty-medium {
  opacity: 1;
  background-color: rgba(245, 158, 11, 0.12);
  color: #F59E0B;
}

.difficulty-hard {
  opacity: 1;
  background-color: rgba(239, 68, 68, 0.12);
  color: #EF4444;
}
</style>
