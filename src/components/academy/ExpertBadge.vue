<!-- 专家徽章组件 -->
<template>
  <view class="expert-badge">
    <view class="badge-avatar">
      <text class="avatar-icon">👨‍🏫</text>
    </view>
    <view class="badge-info">
      <text class="badge-name">{{ name }}</text>
      <text class="badge-title">{{ title }}</text>
    </view>
    <view class="badge-verified">
      <text>✓</text>
    </view>
  </view>
</template>

<script setup>
defineProps({
  name: {
    type: String,
    default: '专家'
  },
  title: {
    type: String,
    default: '认证专家'
  }
})
</script>

<style scoped>
.expert-badge {
  display: inline-flex;
  align-items: center;
  gap: 12rpx;
  padding: 8rpx 16rpx;
  background: #FAFAFA;
  border-radius: 32rpx;
}

.badge-avatar {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #10B981 0%, #34D399 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-icon {
  font-size: 24rpx;
}

.badge-info {
  display: flex;
  flex-direction: column;
}

.badge-name {
  font-size: 24rpx;
  font-weight: 500;
  color: #1F2937;
  line-height: 1.2;
}

.badge-title {
  font-size: 18rpx;
  color: #6B7280;
  line-height: 1.2;
}

.badge-verified {
  width: 32rpx;
  height: 32rpx;
  border-radius: 50%;
  background: #10B981;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18rpx;
  color: #FFFFFF;
}
</style>
