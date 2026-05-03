<!-- 成就徽章组件 -->
<template>
  <view class="achievement-badge" :class="{ 'small': size === 'small', 'large': size === 'large' }">
    <view class="badge-icon">{{ achievement.icon || '🏆' }}</view>
    <view v-if="showName" class="badge-name">{{ achievement.name }}</view>
    <view v-if="showDesc" class="badge-desc">{{ achievement.description }}</view>
    <view v-if="showPoints && achievement.pointsAwarded" class="badge-points">
      +{{ achievement.pointsAwarded }}
    </view>
  </view>
</template>

<script>
export default {
  name: 'AchievementBadge',
  
  props: {
    achievement: {
      type: Object,
      required: true,
      default: () => ({ icon: '🏆', name: '成就', description: '' })
    },
    size: {
      type: String,
      default: 'normal' // 'small', 'normal', 'large'
    },
    showName: {
      type: Boolean,
      default: true
    },
    showDesc: {
      type: Boolean,
      default: false
    },
    showPoints: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style scoped>
.achievement-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx;
  background: linear-gradient(135deg, #8B5CF6, #7C3AED);
  border-radius: 16rpx;
  color: #fff;
  min-width: 120rpx;
}

.achievement-badge.small {
  padding: 10rpx;
  min-width: 80rpx;
  border-radius: 12rpx;
}

.achievement-badge.large {
  padding: 30rpx;
  min-width: 160rpx;
  border-radius: 20rpx;
}

.badge-icon {
  font-size: 48rpx;
  margin-bottom: 8rpx;
}

.small .badge-icon {
  font-size: 36rpx;
}

.large .badge-icon {
  font-size: 64rpx;
}

.badge-name {
  font-size: 24rpx;
  font-weight: bold;
  text-align: center;
}

.small .badge-name {
  font-size: 20rpx;
}

.large .badge-name {
  font-size: 28rpx;
}

.badge-desc {
  font-size: 20rpx;
  opacity: 0.8;
  text-align: center;
  margin-top: 4rpx;
}

.badge-points {
  font-size: 22rpx;
  margin-top: 8rpx;
  background-color: rgba(255, 255, 255, 0.2);
  padding: 4rpx 12rpx;
  border-radius: 20rpx;
}
</style>
