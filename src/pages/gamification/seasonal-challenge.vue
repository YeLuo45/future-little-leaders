<template>
  <view class="page-container" :class="{ 'dark-mode': isDarkMode }">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <view class="nav-left" @tap="goBack">
        <text class="icon">←</text>
      </view>
      <view class="nav-title">赛季挑战</view>
      <view class="nav-right">
        <text class="fragments-btn" @tap="showFragments">💎 {{ gamificationStore.userFragments }}</text>
      </view>
    </view>

    <!-- 赛季卡片 -->
    <SeasonalCard 
      v-if="currentSeason" 
      :season="currentSeason"
    >
      <template #challenges>
        <!-- 挑战列表 -->
        <view class="challenges-list">
          <view 
            class="challenge-item"
            v-for="challenge in gamificationStore.seasonalChallenges"
            :key="challenge.id"
            :class="{ completed: challenge.status === 'completed' }"
          >
            <view class="challenge-icon">
              <text class="icon-emoji">{{ challenge.icon }}</text>
              <view v-if="challenge.status === 'completed'" class="check-badge">✓</view>
            </view>
            <view class="challenge-info">
              <view class="challenge-header">
                <text class="challenge-title">{{ challenge.title }}</text>
                <view class="challenge-reward">
                  <text class="reward-points">+{{ challenge.pointsReward }}</text>
                </view>
              </view>
              <text class="challenge-desc">{{ challenge.description }}</text>
              <view class="challenge-progress">
                <view class="progress-bar">
                  <view 
                    class="progress-fill" 
                    :style="{ width: getProgressPercent(challenge) + '%' }"
                  ></view>
                </view>
                <text class="progress-text">{{ challenge.progress }}/{{ challenge.target }}</text>
              </view>
            </view>
            <view v-if="challenge.isExclusive" class="exclusive-tag">限定</view>
          </view>
        </view>
      </template>
    </SeasonalCard>

    <!-- 赛季总览 -->
    <view class="season-overview">
      <view class="overview-card">
        <view class="overview-item">
          <text class="overview-value">{{ gamificationStore.completedChallenges.length }}</text>
          <text class="overview-label">已完成</text>
        </view>
        <view class="overview-divider"></view>
        <view class="overview-item">
          <text class="overview-value">{{ gamificationStore.overallProgress }}%</text>
          <text class="overview-label">完成度</text>
        </view>
        <view class="overview-divider"></view>
        <view class="overview-item">
          <text class="overview-value">{{ gamificationStore.ongoingChallenges.length }}</text>
          <text class="overview-label">进行中</text>
        </view>
      </view>
    </view>

    <!-- 赛季专属奖励 -->
    <view class="exclusive-rewards">
      <text class="section-title">🏆 赛季专属</text>
      <view class="rewards-grid">
        <view class="reward-card" v-for="badge in seasonalBadges" :key="badge.id">
          <view class="reward-badge">
            <text class="badge-emoji">{{ badge.icon }}</text>
          </view>
          <text class="badge-name">{{ badge.name }}</text>
          <text class="badge-tier">{{ getTierName(badge.tier) }}</text>
        </view>
      </view>
    </view>

    <!-- 历史赛季入口 -->
    <view class="history-section" @tap="goToHistory">
      <view class="history-content">
        <text class="history-icon">📜</text>
        <text class="history-title">历史赛季</text>
        <text class="history-arrow">→</text>
      </view>
    </view>
  </view>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { isDarkTheme } from '@/utils/themeUtils.js'
import { useGamificationStore } from '@/stores/gamificationStore'
import SeasonalCard from '@/components/gamification/SeasonalCard.vue'
import { BADGE_TIERS } from '@/services/gamificationService.js'

export default {
  name: 'SeasonalChallenge',
  components: { SeasonalCard },
  setup() {
    const isDarkMode = ref(false)
    const gamificationStore = useGamificationStore()

    const currentSeason = computed(() => gamificationStore.currentSeason)

    const seasonalBadges = computed(() => {
      return gamificationStore.allBadges.filter(b => b.category === 'seasonal')
    })

    const getProgressPercent = (challenge) => {
      if (challenge.target === 0) return 0
      return Math.min(100, Math.round((challenge.progress / challenge.target) * 100))
    }

    const getTierName = (tierId) => {
      return BADGE_TIERS[tierId]?.name || tierId
    }

    const showFragments = () => {
      uni.showToast({ 
        title: `拥有 ${gamificationStore.userFragments} 碎片`, 
        icon: 'none' 
      })
    }

    const goBack = () => {
      uni.navigateBack()
    }

    const goToHistory = () => {
      uni.navigateTo({ url: '/pages/gamification/leaderboard?tab=history' })
    }

    onMounted(() => {
      isDarkMode.value = isDarkTheme()
      gamificationStore.init()
    })

    return {
      isDarkMode,
      gamificationStore,
      currentSeason,
      seasonalBadges,
      getProgressPercent,
      getTierName,
      showFragments,
      goBack,
      goToHistory
    }
  }
}
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 120rpx;
}

.dark-mode {
  background-color: #1a1a1a;
  color: #ffffff;
}

.nav-bar {
  display: flex;
  align-items: center;
  height: 88rpx;
  background: linear-gradient(135deg, #8B5CF6, #7C3AED);
  padding: 90rpx 40rpx 60rpx 40rpx;
  position: relative;
}

.nav-left {
  position: absolute;
  left: 30rpx;
  z-index: 1;
}

.icon {
  color: white;
  font-size: 48rpx;
  font-weight: bold;
}

.nav-title {
  flex: 1;
  text-align: center;
  color: white;
  font-size: 48rpx;
  font-weight: bold;
}

.nav-right {
  position: absolute;
  right: 30rpx;
}

.fragments-btn {
  background: rgba(255, 255, 255, 0.2);
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  color: #fff;
  font-size: 24rpx;
}

/* 挑战列表 */
.challenges-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.challenge-item {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16rpx;
  padding: 20rpx;
  position: relative;
  color: #333;
}

.dark-mode .challenge-item {
  background: rgba(0, 0, 0, 0.3);
  color: #fff;
}

.challenge-item.completed {
  opacity: 0.7;
}

.challenge-icon {
  width: 80rpx;
  height: 80rpx;
  background: linear-gradient(135deg, #8B5CF6, #7C3AED);
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
}

.icon-emoji {
  font-size: 40rpx;
}

.check-badge {
  position: absolute;
  top: -6rpx;
  right: -6rpx;
  width: 32rpx;
  height: 32rpx;
  background: #52c41a;
  border-radius: 50%;
  color: #fff;
  font-size: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.challenge-info {
  flex: 1;
  min-width: 0;
}

.challenge-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6rpx;
}

.challenge-title {
  font-size: 30rpx;
  font-weight: bold;
}

.challenge-reward {
  background: linear-gradient(135deg, #FFD700, #FFA500);
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
}

.reward-points {
  font-size: 22rpx;
  font-weight: bold;
  color: #333;
}

.challenge-desc {
  font-size: 24rpx;
  color: #666;
  display: block;
  margin-bottom: 12rpx;
}

.dark-mode .challenge-desc {
  color: #aaa;
}

.challenge-progress {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.progress-bar {
  flex: 1;
  height: 10rpx;
  background: #e0e0e0;
  border-radius: 5rpx;
  overflow: hidden;
}

.dark-mode .progress-bar {
  background: rgba(255, 255, 255, 0.2);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #8B5CF6, #7C3AED);
  border-radius: 5rpx;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 22rpx;
  color: #8B5CF6;
  font-weight: bold;
  min-width: 60rpx;
}

.exclusive-tag {
  position: absolute;
  top: 12rpx;
  right: 12rpx;
  background: linear-gradient(135deg, #FF6B6B, #EE5A5A);
  color: #fff;
  font-size: 18rpx;
  padding: 4rpx 10rpx;
  border-radius: 8rpx;
}

/* 赛季总览 */
.season-overview {
  padding: 20rpx;
}

.overview-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  display: flex;
  justify-content: space-around;
  align-items: center;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
}

.dark-mode .overview-card {
  background: #2a2a2a;
}

.overview-item {
  text-align: center;
}

.overview-value {
  font-size: 48rpx;
  font-weight: bold;
  color: #8B5CF6;
  display: block;
}

.overview-label {
  font-size: 24rpx;
  color: #999;
  display: block;
  margin-top: 6rpx;
}

.overview-divider {
  width: 2rpx;
  height: 60rpx;
  background: #e0e0e0;
}

.dark-mode .overview-divider {
  background: #444;
}

/* 专属奖励 */
.exclusive-rewards {
  padding: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  display: block;
  margin-bottom: 20rpx;
  color: #333;
}

.dark-mode .section-title {
  color: #fff;
}

.rewards-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16rpx;
}

.reward-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 20rpx;
  text-align: center;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.dark-mode .reward-card {
  background: #2a2a2a;
}

.reward-badge {
  width: 80rpx;
  height: 80rpx;
  margin: 0 auto 12rpx;
  background: linear-gradient(135deg, #FFD700, #FFA500);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.badge-emoji {
  font-size: 40rpx;
}

.badge-name {
  font-size: 22rpx;
  font-weight: bold;
  color: #333;
  display: block;
}

.dark-mode .badge-name {
  color: #fff;
}

.badge-tier {
  font-size: 18rpx;
  color: #999;
  display: block;
  margin-top: 4rpx;
}

/* 历史赛季 */
.history-section {
  margin: 20rpx;
}

.history-content {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.dark-mode .history-content {
  background: #2a2a2a;
}

.history-icon {
  font-size: 40rpx;
  margin-right: 16rpx;
}

.history-title {
  flex: 1;
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}

.dark-mode .history-title {
  color: #fff;
}

.history-arrow {
  font-size: 32rpx;
  color: #999;
}
</style>
