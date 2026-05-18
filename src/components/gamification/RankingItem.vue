<template>
  <view class="ranking-item" :class="{ 'is-current-user': isCurrentUser }">
    <!-- 排名 -->
    <view class="rank-section">
      <view class="rank-badge" :class="'rank-' + item.rank">
        <text class="rank-number" v-if="item.rank > 3">{{ item.rank }}</text>
        <text class="rank-medal" v-else>{{ getMedalIcon(item.rank) }}</text>
      </view>
    </view>

    <!-- 用户信息 -->
    <view class="user-section">
      <view class="user-avatar">
        <text class="avatar-emoji">{{ item.avatar }}</text>
        <view v-if="isCurrentUser" class="current-badge">我</view>
      </view>
      <view class="user-info">
        <text class="user-name">{{ item.childName }}</text>
        <text class="user-score">{{ item.points }} 积分</text>
      </view>
    </view>

    <!-- 分数/排名变化 -->
    <view class="score-section">
      <view class="score-value">{{ item.score.toFixed(1) }}</view>
      <view class="rank-change" :class="changeClass">
        <text class="change-icon">{{ changeIcon }}</text>
        <text class="change-value">{{ Math.abs(item.change) }}</text>
      </view>
    </view>
  </view>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'RankingItem',
  props: {
    item: {
      type: Object,
      required: true
    },
    currentUserId: {
      type: String,
      default: ''
    }
  },
  setup(props) {
    const isCurrentUser = computed(() => {
      return props.item.childId === props.currentUserId
    })

    const getMedalIcon = (rank) => {
      const medals = { 1: '🥇', 2: '🥈', 3: '🥉' }
      return medals[rank] || ''
    }

    const changeClass = computed(() => {
      if (props.item.change > 0) return 'up'
      if (props.item.change < 0) return 'down'
      return 'same'
    })

    const changeIcon = computed(() => {
      if (props.item.change > 0) return '↑'
      if (props.item.change < 0) return '↓'
      return '-'
    })

    return {
      isCurrentUser,
      getMedalIcon,
      changeClass,
      changeIcon
    }
  }
}
</script>

<style scoped>
.ranking-item {
  display: flex;
  align-items: center;
  padding: 20rpx 24rpx;
  background: #fff;
  border-radius: 16rpx;
  margin-bottom: 12rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}

.ranking-item.is-current-user {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.05));
  border: 2rpx solid rgba(139, 92, 246, 0.3);
}

.rank-section {
  width: 80rpx;
  display: flex;
  justify-content: center;
}

.rank-badge {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
}

.rank-badge.rank-1 {
  background: linear-gradient(135deg, #FFD700, #FFA500);
}

.rank-badge.rank-2 {
  background: linear-gradient(135deg, #C0C0C0, #A8A8A8);
}

.rank-badge.rank-3 {
  background: linear-gradient(135deg, #CD7F32, #A5673F);
}

.rank-number {
  font-size: 26rpx;
  font-weight: bold;
  color: #666;
}

.rank-medal {
  font-size: 32rpx;
}

.user-section {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-left: 16rpx;
}

.user-avatar {
  position: relative;
  width: 72rpx;
  height: 72rpx;
  background: linear-gradient(135deg, #8B5CF6, #7C3AED);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-emoji {
  font-size: 40rpx;
}

.current-badge {
  position: absolute;
  bottom: -6rpx;
  right: -6rpx;
  background: #8B5CF6;
  color: #fff;
  font-size: 16rpx;
  padding: 2rpx 8rpx;
  border-radius: 8rpx;
  font-weight: bold;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.user-name {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}

.user-score {
  font-size: 22rpx;
  color: #999;
}

.score-section {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6rpx;
}

.score-value {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.rank-change {
  display: flex;
  align-items: center;
  gap: 4rpx;
  font-size: 20rpx;
  padding: 2rpx 8rpx;
  border-radius: 8rpx;
}

.rank-change.up {
  color: #52c41a;
  background: rgba(82, 196, 26, 0.1);
}

.rank-change.down {
  color: #ff4d4f;
  background: rgba(255, 77, 79, 0.1);
}

.rank-change.same {
  color: #999;
  background: rgba(153, 153, 153, 0.1);
}

.change-icon {
  font-size: 18rpx;
}

.change-value {
  font-weight: bold;
}
</style>
