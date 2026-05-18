<template>
  <view class="leaderboard-item" :class="{ highlight: isCurrentBaby }">
    <!-- 排名 -->
    <view class="rank-section">
      <view class="rank-badge" :class="getRankClass(rank)">
        <text v-if="rank <= 3" class="rank-icon">{{ getRankIcon(rank) }}</text>
        <text v-else class="rank-num">{{ rank }}</text>
      </view>
    </view>

    <!-- 宝宝信息 -->
    <view class="info-section">
      <view class="avatar">{{ babyAvatar }}</view>
      <view class="info-text">
        <text class="name">{{ babyName }}</text>
        <text v-if="isCurrentBaby" class="current-tag">我</text>
      </view>
    </view>

    <!-- 积分 -->
    <view class="points-section">
      <text class="points-value">{{ totalPoints }}</text>
      <text class="points-unit">积分</text>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  rank: {
    type: Number,
    required: true
  },
  babyId: {
    type: String,
    required: true
  },
  babyName: {
    type: String,
    required: true
  },
  babyAvatar: {
    type: String,
    default: '👶'
  },
  totalPoints: {
    type: Number,
    default: 0
  },
  isCurrentBaby: {
    type: Boolean,
    default: false
  }
})

// 获取排名样式
const getRankClass = (rank) => {
  if (rank === 1) return 'gold'
  if (rank === 2) return 'silver'
  if (rank === 3) return 'bronze'
  return ''
}

// 获取排名图标
const getRankIcon = (rank) => {
  if (rank === 1) return '🥇'
  if (rank === 2) return '🥈'
  if (rank === 3) return '🥉'
  return ''
}
</script>

<style scoped>
.leaderboard-item {
  display: flex;
  align-items: center;
  padding: 24rpx 30rpx;
  background: #fff;
  border-radius: 16rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.leaderboard-item.highlight {
  background: linear-gradient(135deg, #f0f0ff 0%, #e8e8ff 100%);
  border: 2rpx solid #667eea;
}

.rank-section {
  width: 80rpx;
  display: flex;
  justify-content: center;
}

.rank-badge {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rank-badge.gold {
  background: linear-gradient(135deg, #ffd700 0%, #ffb347 100%);
}

.rank-badge.silver {
  background: linear-gradient(135deg, #c0c0c0 0%, #a9a9a9 100%);
}

.rank-badge.bronze {
  background: linear-gradient(135deg, #cd7f32 0%, #b87333 100%);
}

.rank-icon {
  font-size: 28rpx;
}

.rank-num {
  font-size: 24rpx;
  font-weight: bold;
  color: #666;
}

.info-section {
  flex: 1;
  display: flex;
  align-items: center;
  margin-left: 16rpx;
}

.avatar {
  font-size: 48rpx;
  margin-right: 16rpx;
}

.info-text {
  display: flex;
  align-items: center;
}

.name {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.current-tag {
  margin-left: 12rpx;
  padding: 4rpx 12rpx;
  background: #667eea;
  color: #fff;
  border-radius: 12rpx;
  font-size: 20rpx;
}

.points-section {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.points-value {
  font-size: 32rpx;
  font-weight: bold;
  color: #667eea;
}

.points-unit {
  font-size: 20rpx;
  color: #999;
}
</style>
