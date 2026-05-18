<template>
  <view class="seasonal-card" :class="'season-' + season.id">
    <!-- 赛季头部 -->
    <view class="card-header">
      <view class="season-badge">
        <text class="season-icon">{{ season.icon }}</text>
        <text class="season-name">{{ season.name }}赛季</text>
      </view>
      <view class="season-timer" v-if="seasonInfo">
        <text class="timer-label">剩余</text>
        <text class="timer-value">{{ seasonInfo.remainingDays }}</text>
        <text class="timer-unit">天</text>
      </view>
    </view>

    <!-- 赛季进度 -->
    <view class="season-progress" v-if="seasonInfo">
      <view class="progress-info">
        <text class="progress-label">赛季进度</text>
        <text class="progress-percent">{{ seasonInfo.progressPercent }}%</text>
      </view>
      <view class="progress-bar">
        <view class="progress-fill" :style="{ width: seasonInfo.progressPercent + '%' }"></view>
      </view>
      <view class="progress-dates">
        <text>{{ formatDate(seasonInfo.startDate) }}</text>
        <text>{{ formatDate(seasonInfo.endDate) }}</text>
      </view>
    </view>

    <!-- 赛季奖励预览 -->
    <view class="season-rewards">
      <text class="rewards-title">🏆 赛季奖励</text>
      <view class="rewards-list">
        <view class="reward-item">
          <text class="reward-icon">🥇</text>
          <text class="reward-name">冠军</text>
          <text class="reward-detail">500积分 + 限定徽章</text>
        </view>
        <view class="reward-item">
          <text class="reward-icon">🥈</text>
          <text class="reward-name">亚军</text>
          <text class="reward-detail">300积分 + 限定徽章</text>
        </view>
        <view class="reward-item">
          <text class="reward-icon">🥉</text>
          <text class="reward-name">季军</text>
          <text class="reward-detail">200积分 + 限定徽章</text>
        </view>
      </view>
    </view>

    <!-- 任务列表插槽 -->
    <view class="challenges-section">
      <text class="section-title">📋 赛季任务</text>
      <slot name="challenges"></slot>
    </view>
  </view>
</template>

<script>
import { computed } from 'vue'
import { useGamificationStore } from '@/stores/gamificationStore'

export default {
  name: 'SeasonalCard',
  props: {
    season: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const gamificationStore = useGamificationStore()
    const seasonInfo = computed(() => gamificationStore.currentSeasonInfo)

    const formatDate = (date) => {
      if (!date) return ''
      const d = new Date(date)
      return `${d.getMonth() + 1}/${d.getDate()}`
    }

    return {
      seasonInfo,
      formatDate
    }
  }
}
</script>

<style scoped>
.seasonal-card {
  background: linear-gradient(135deg, var(--season-color, #8B5CF6), var(--season-color-dark, #7C3AED));
  border-radius: 24rpx;
  padding: 30rpx;
  color: #fff;
  margin: 20rpx;
  box-shadow: 0 8rpx 24rpx rgba(139, 92, 246, 0.3);
}

.season-spring { --season-color: #FF6B6B; --season-color-dark: #EE5A5A; }
.season-summer { --season-color: #4ECDC4; --season-color-dark: #3DBDB5; }
.season-autumn { --season-color: #FFA94D; --season-color-dark: #FF9500; }
.season-winter { --season-color: #74C0FC; --season-color-dark: #5AB0FC; }

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.season-badge {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.season-icon {
  font-size: 48rpx;
}

.season-name {
  font-size: 36rpx;
  font-weight: bold;
}

.season-timer {
  background: rgba(255, 255, 255, 0.2);
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  gap: 6rpx;
}

.timer-label {
  font-size: 22rpx;
  opacity: 0.8;
}

.timer-value {
  font-size: 32rpx;
  font-weight: bold;
}

.timer-unit {
  font-size: 22rpx;
}

.season-progress {
  margin-bottom: 24rpx;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}

.progress-label {
  font-size: 26rpx;
  opacity: 0.9;
}

.progress-percent {
  font-size: 28rpx;
  font-weight: bold;
}

.progress-bar {
  height: 16rpx;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 8rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #FFD700;
  border-radius: 8rpx;
  transition: width 0.3s ease;
}

.progress-dates {
  display: flex;
  justify-content: space-between;
  margin-top: 8rpx;
  font-size: 20rpx;
  opacity: 0.7;
}

.season-rewards {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 16rpx;
  padding: 20rpx;
  margin-bottom: 24rpx;
}

.rewards-title {
  font-size: 28rpx;
  font-weight: bold;
  display: block;
  margin-bottom: 16rpx;
}

.rewards-list {
  display: flex;
  gap: 16rpx;
}

.reward-item {
  flex: 1;
  text-align: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12rpx;
  padding: 12rpx 8rpx;
}

.reward-icon {
  font-size: 32rpx;
  display: block;
  margin-bottom: 4rpx;
}

.reward-name {
  font-size: 24rpx;
  font-weight: bold;
  display: block;
}

.reward-detail {
  font-size: 18rpx;
  opacity: 0.8;
  display: block;
  margin-top: 4rpx;
}

.challenges-section {
  margin-top: 16rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: bold;
  display: block;
  margin-bottom: 16rpx;
}
</style>
