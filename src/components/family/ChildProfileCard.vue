<!--
  儿童资料卡片组件
  用于在多儿童仪表盘中展示单个儿童的概览信息
-->
<template>
  <view class="child-profile-card" :class="{ active: isSelected }" @tap="onSelect">
    <!-- 头像区域 -->
    <view class="avatar-section">
      <view class="avatar-wrapper">
        <text class="avatar-emoji">{{ child.avatar || '👶' }}</text>
        <view v-if="child.rank <= 3" class="rank-badge" :class="'rank-' + child.rank">
          {{ child.rank === 1 ? '🥇' : child.rank === 2 ? '🥈' : '🥉' }}
        </view>
      </view>
    </view>

    <!-- 信息区域 -->
    <view class="info-section">
      <text class="child-name">{{ child.name }}</text>
      <text class="child-age">{{ child.age || '年龄未知' }}</text>
    </view>

    <!-- 积分展示 -->
    <view class="points-section">
      <text class="points-value">{{ displayPoints }}</text>
      <text class="points-label">积分</text>
    </view>

    <!-- 快捷操作 -->
    <view class="quick-actions">
      <view class="action-btn" @tap.stop="onTransfer" hover-class="hover">
        <text class="action-icon">↔️</text>
      </view>
      <view class="action-btn" @tap.stop="onChallenge" hover-class="hover">
        <text class="action-icon">🏆</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  child: {
    type: Object,
    required: true
  },
  isSelected: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['select', 'transfer', 'challenge'])

const displayPoints = computed(() => {
  return props.child.points || 0
})

const onSelect = () => {
  emit('select', props.child.id)
}

const onTransfer = () => {
  emit('transfer', props.child.id)
}

const onChallenge = () => {
  emit('challenge', props.child.id)
}
</script>

<style scoped>
.child-profile-card {
  display: flex;
  align-items: center;
  padding: 24rpx;
  margin: 12rpx 16rpx;
  background: #ffffff;
  border-radius: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

.child-profile-card.active {
  background: linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%);
  box-shadow: 0 4rpx 20rpx rgba(139, 92, 246, 0.3);
}

.child-profile-card.active .child-name,
.child-profile-card.active .child-age,
.child-profile-card.active .points-value,
.child-profile-card.active .points-label {
  color: #ffffff;
}

.avatar-section {
  margin-right: 24rpx;
}

.avatar-wrapper {
  position: relative;
  width: 100rpx;
  height: 100rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F3F4F6;
  border-radius: 50%;
}

.avatar-emoji {
  font-size: 56rpx;
}

.rank-badge {
  position: absolute;
  top: -8rpx;
  right: -8rpx;
  font-size: 24rpx;
}

.info-section {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.child-name {
  font-size: 32rpx;
  font-weight: 600;
  color: #1F2937;
  margin-bottom: 8rpx;
}

.child-age {
  font-size: 24rpx;
  color: #6B7280;
}

.points-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 24rpx;
}

.points-value {
  font-size: 36rpx;
  font-weight: 700;
  color: #8B5CF6;
}

.points-label {
  font-size: 20rpx;
  color: #6B7280;
}

.quick-actions {
  display: flex;
  gap: 12rpx;
}

.action-btn {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F3F4F6;
  border-radius: 12rpx;
}

.action-icon {
  font-size: 28rpx;
}

.hover {
  opacity: 0.7;
}
</style>
