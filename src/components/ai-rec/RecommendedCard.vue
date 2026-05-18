<template>
  <view class="recommended-card" :class="{ 'card-enter': isEnter }" @click="handleClick">
    <!-- 卡片头部 -->
    <view class="card-header">
      <view class="task-icon">{{ task.icon || '📝' }}</view>
      <view class="task-info">
        <text class="task-name">{{ task.name }}</text>
        <view class="task-meta">
          <DifficultyBadge :level="task.difficulty" />
          <text class="task-points">+{{ task.points }}积分</text>
        </view>
      </view>
    </view>

    <!-- 推荐理由 -->
    <view class="card-body" v-if="task.reason">
      <text class="reason-label">推荐理由</text>
      <text class="reason-text">{{ task.reason }}</text>
    </view>

    <!-- 操作按钮 -->
    <view class="card-actions">
      <button class="action-btn accept-btn" @click.stop="handleAccept">
        <text>接受</text>
      </button>
      <button class="action-btn skip-btn" @click.stop="handleSkip">
        <text>换一批</text>
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import DifficultyBadge from './DifficultyBadge.vue'

const props = defineProps({
  task: {
    type: Object,
    required: true,
    default: () => ({
      id: '',
      name: '任务名称',
      type: 'study',
      points: 10,
      difficulty: 'medium',
      reason: '',
      icon: '📝'
    })
  }
})

const emit = defineEmits(['accept', 'skip', 'click'])

const isEnter = ref(false)

onMounted(() => {
  // 延迟入场动画
  setTimeout(() => {
    isEnter.value = true
  }, 50)
})

function handleClick() {
  emit('click', props.task)
}

function handleAccept() {
  emit('accept', props.task)
}

function handleSkip() {
  emit('skip', props.task)
}
</script>

<style scoped>
.recommended-card {
  background: #FFFFFF;
  border-radius: 24rpx;
  padding: 28rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(124, 58, 237, 0.08);
  opacity: 0;
  transform: translateY(20rpx);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.card-enter {
  opacity: 1;
  transform: translateY(0);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.task-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 20rpx;
  background: linear-gradient(135deg, #7C3AED 0%, #EC4899 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  flex-shrink: 0;
}

.task-info {
  flex: 1;
  min-width: 0;
}

.task-name {
  font-size: 32rpx;
  font-weight: 600;
  color: #1F2937;
  display: block;
  margin-bottom: 8rpx;
}

.task-meta {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.task-points {
  font-size: 24rpx;
  color: #7C3AED;
  font-weight: 500;
}

.card-body {
  margin-top: 20rpx;
  padding: 16rpx 20rpx;
  background: #FAFAFA;
  border-radius: 16rpx;
}

.reason-label {
  font-size: 22rpx;
  color: #7C3AED;
  font-weight: 500;
  display: block;
  margin-bottom: 6rpx;
}

.reason-text {
  font-size: 26rpx;
  color: #6B7280;
  line-height: 1.5;
}

.card-actions {
  display: flex;
  gap: 16rpx;
  margin-top: 20rpx;
}

.action-btn {
  flex: 1;
  height: 72rpx;
  border-radius: 36rpx;
  font-size: 28rpx;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  margin: 0;
}

.accept-btn {
  background: linear-gradient(135deg, #7C3AED 0%, #8B5CF6 100%);
  color: #FFFFFF;
}

.skip-btn {
  background: #F3F4F6;
  color: #6B7280;
}

.skip-btn::after {
  border: none;
}
</style>
