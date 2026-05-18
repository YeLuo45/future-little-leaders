<template>
  <view class="page-container" :class="{ 'dark-mode': isDarkMode }">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <view class="nav-left" @tap="goBack">
        <text class="icon">←</text>
      </view>
      <view class="nav-title">排行榜</view>
      <view class="nav-right"></view>
    </view>

    <!-- Tab 切换 -->
    <view class="tab-bar">
      <view 
        class="tab-item" 
        :class="{ active: activeTab === 'current' }"
        @tap="switchTab('current')"
      >
        <text>当前赛季</text>
      </view>
      <view 
        class="tab-item" 
        :class="{ active: activeTab === 'history' }"
        @tap="switchTab('history')"
      >
        <text>历史赛季</text>
      </view>
    </view>

    <!-- 当前赛季排行榜 -->
    <view v-if="activeTab === 'current'">
      <!-- 赛季信息 -->
      <view class="season-header" v-if="gamificationStore.currentSeason">
        <view class="season-info">
          <text class="season-icon">{{ gamificationStore.currentSeason.icon }}</text>
          <text class="season-name">{{ gamificationStore.currentSeason.name }}赛季</text>
        </view>
        <view class="season-timer">
          <text class="timer-label">剩余</text>
          <text class="timer-value">{{ remainingDays }}</text>
          <text class="timer-unit">天</text>
        </view>
      </view>

      <!-- 排行榜范围切换 -->
      <view class="scope-tabs">
        <view 
          class="scope-tab" 
          :class="{ active: scope === 'global' }"
          @tap="changeScope('global')"
        >
          <text>全服</text>
        </view>
        <view 
          class="scope-tab" 
          :class="{ active: scope === 'class' }"
          @tap="changeScope('class')"
        >
          <text>班级</text>
        </view>
        <view 
          class="scope-tab" 
          :class="{ active: scope === 'friend' }"
          @tap="changeScope('friend')"
        >
          <text>好友</text>
        </view>
      </view>

      <!-- Top 3 展示 -->
      <view class="top-three" v-if="leaderboard.length >= 3">
        <view class="top-item second">
          <view class="avatar-wrapper">
            <text class="avatar-emoji">{{ leaderboard[1]?.avatar }}</text>
          </view>
          <text class="rank-medal">🥈</text>
          <text class="user-name">{{ leaderboard[1]?.childName }}</text>
          <text class="user-points">{{ leaderboard[1]?.points }}</text>
        </view>
        <view class="top-item first">
          <view class="avatar-wrapper crown">
            <text class="avatar-emoji">{{ leaderboard[0]?.avatar }}</text>
          </view>
          <text class="rank-medal">🥇</text>
          <text class="user-name">{{ leaderboard[0]?.childName }}</text>
          <text class="user-points">{{ leaderboard[0]?.points }}</text>
        </view>
        <view class="top-item third">
          <view class="avatar-wrapper">
            <text class="avatar-emoji">{{ leaderboard[2]?.avatar }}</text>
          </view>
          <text class="rank-medal">🥉</text>
          <text class="user-name">{{ leaderboard[2]?.childName }}</text>
          <text class="user-points">{{ leaderboard[2]?.points }}</text>
        </view>
      </view>

      <!-- 排行榜列表 -->
      <view class="ranking-list">
        <RankingItem 
          v-for="(item, index) in leaderboard.slice(3)"
          :key="item.childId"
          :item="item"
          :currentUserId="currentUserId"
        />
      </view>

      <!-- 我的排名 -->
      <view class="my-ranking" v-if="myRanking">
        <text class="my-label">我的排名</text>
        <RankingItem :item="myRanking" :currentUserId="currentUserId" />
      </view>
    </view>

    <!-- 历史赛季 -->
    <view v-if="activeTab === 'history'" class="history-content">
      <view 
        class="history-item" 
        v-for="season in gamificationStore.historicalSeasons"
        :key="season.id"
        @tap="viewSeasonDetail(season)"
      >
        <view class="season-badge">
          <text class="season-icon">{{ season.icon }}</text>
        </view>
        <view class="season-info">
          <text class="season-name">{{ season.name }}</text>
          <text class="season-status">已结束</text>
        </view>
        <view class="season-arrow">→</view>
      </view>
    </view>

    <!-- 赛季奖励说明 -->
    <view class="rewards-info" v-if="activeTab === 'current'">
      <text class="rewards-title">🏆 赛季结束奖励</text>
      <view class="rewards-list">
        <view class="reward-tier">
          <text class="tier-icon">🥇</text>
          <view class="tier-details">
            <text class="tier-rank">第1名</text>
            <text class="tier-reward">500积分 + 限定徽章</text>
          </view>
        </view>
        <view class="reward-tier">
          <text class="tier-icon">🥈</text>
          <view class="tier-details">
            <text class="tier-rank">第2名</text>
            <text class="tier-reward">300积分 + 限定徽章</text>
          </view>
        </view>
        <view class="reward-tier">
          <text class="tier-icon">🥉</text>
          <view class="tier-details">
            <text class="tier-rank">第3名</text>
            <text class="tier-reward">200积分 + 限定徽章</text>
          </view>
        </view>
        <view class="reward-tier">
          <text class="tier-icon">🎖️</text>
          <view class="tier-details">
            <text class="tier-rank">Top 10</text>
            <text class="tier-reward">100积分</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { isDarkTheme } from '@/utils/themeUtils.js'
import { useGamificationStore } from '@/stores/gamificationStore'
import RankingItem from '@/components/gamification/RankingItem.vue'

export default {
  name: 'Leaderboard',
  components: { RankingItem },
  setup() {
    const isDarkMode = ref(false)
    const gamificationStore = useGamificationStore()
    const activeTab = ref('current')
    const scope = ref('global')
    const currentUserId = ref('user_current')

    const leaderboard = computed(() => gamificationStore.leaderboard)

    const remainingDays = computed(() => {
      return gamificationStore.currentSeasonInfo?.remainingDays || 0
    })

    const myRanking = computed(() => {
      // 模拟当前用户排名
      return {
        rank: 15,
        childId: 'user_current',
        childName: '我',
        avatar: '🧒',
        points: 980,
        score: 65.3,
        change: 2
      }
    })

    const switchTab = (tab) => {
      activeTab.value = tab
    }

    const changeScope = (newScope) => {
      scope.value = newScope
      gamificationStore.loadLeaderboard(newScope)
    }

    const viewSeasonDetail = (season) => {
      uni.showToast({ title: `查看 ${season.name} 详情`, icon: 'none' })
    }

    const goBack = () => {
      uni.navigateBack()
    }

    onMounted(() => {
      isDarkMode.value = isDarkTheme()
      gamificationStore.init()
      gamificationStore.loadLeaderboard('global')
    })

    return {
      isDarkMode,
      gamificationStore,
      activeTab,
      scope,
      currentUserId,
      leaderboard,
      remainingDays,
      myRanking,
      switchTab,
      changeScope,
      viewSeasonDetail,
      goBack
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

/* Tab 切换 */
.tab-bar {
  display: flex;
  background: #fff;
  padding: 0 40rpx;
}

.dark-mode .tab-bar {
  background: #2a2a2a;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 24rpx 0;
  font-size: 30rpx;
  color: #666;
  position: relative;
}

.dark-mode .tab-item {
  color: #999;
}

.tab-item.active {
  color: #8B5CF6;
  font-weight: bold;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60rpx;
  height: 6rpx;
  background-color: #8B5CF6;
  border-radius: 3rpx;
}

/* 赛季头部 */
.season-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  background: linear-gradient(135deg, #8B5CF6, #7C3AED);
  color: #fff;
}

.season-info {
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

/* 排行榜范围 */
.scope-tabs {
  display: flex;
  padding: 20rpx;
  gap: 16rpx;
}

.scope-tab {
  flex: 1;
  text-align: center;
  padding: 16rpx;
  background: #fff;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #666;
}

.dark-mode .scope-tab {
  background: #2a2a2a;
  color: #999;
}

.scope-tab.active {
  background: linear-gradient(135deg, #8B5CF6, #7C3AED);
  color: #fff;
}

/* Top 3 展示 */
.top-three {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  padding: 30rpx 20rpx 50rpx;
  gap: 20rpx;
  background: linear-gradient(180deg, rgba(139, 92, 246, 0.1) 0%, transparent 100%);
}

.top-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.top-item.first {
  transform: translateY(-20rpx);
}

.top-item .avatar-wrapper {
  width: 100rpx;
  height: 100rpx;
  background: linear-gradient(135deg, #8B5CF6, #7C3AED);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.top-item.first .avatar-wrapper {
  width: 120rpx;
  height: 120rpx;
  box-shadow: 0 8rpx 24rpx rgba(139, 92, 246, 0.4);
}

.top-item .avatar-wrapper.crown::before {
  content: '👑';
  position: absolute;
  top: -30rpx;
  font-size: 32rpx;
}

.avatar-emoji {
  font-size: 48rpx;
}

.top-item.first .avatar-emoji {
  font-size: 60rpx;
}

.rank-medal {
  font-size: 40rpx;
}

.top-item.first .rank-medal {
  font-size: 48rpx;
}

.user-name {
  font-size: 26rpx;
  font-weight: bold;
  color: #333;
}

.dark-mode .user-name {
  color: #fff;
}

.user-points {
  font-size: 22rpx;
  color: #8B5CF6;
  font-weight: bold;
}

/* 排行榜列表 */
.ranking-list {
  padding: 20rpx;
}

/* 我的排名 */
.my-ranking {
  padding: 20rpx;
  border-top: 2rpx solid #e0e0e0;
  margin-top: 20rpx;
}

.dark-mode .my-ranking {
  border-color: #333;
}

.my-label {
  font-size: 24rpx;
  color: #999;
  display: block;
  margin-bottom: 12rpx;
}

/* 历史赛季 */
.history-content {
  padding: 20rpx;
}

.history-item {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.dark-mode .history-item {
  background: #2a2a2a;
}

.season-badge {
  width: 80rpx;
  height: 80rpx;
  background: linear-gradient(135deg, #FFD700, #FFA500);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
}

.season-icon {
  font-size: 40rpx;
}

.season-info {
  flex: 1;
}

.season-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
}

.dark-mode .season-name {
  color: #fff;
}

.season-status {
  font-size: 24rpx;
  color: #999;
  display: block;
  margin-top: 6rpx;
}

.season-arrow {
  font-size: 32rpx;
  color: #999;
}

/* 赛季奖励 */
.rewards-info {
  padding: 20rpx;
  margin-top: 20rpx;
}

.rewards-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 20rpx;
}

.dark-mode .rewards-title {
  color: #fff;
}

.rewards-list {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.dark-mode .rewards-list {
  background: #2a2a2a;
}

.reward-tier {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.dark-mode .reward-tier {
  border-color: #333;
}

.reward-tier:last-child {
  border-bottom: none;
}

.tier-icon {
  font-size: 40rpx;
}

.tier-details {
  flex: 1;
}

.tier-rank {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  display: block;
}

.dark-mode .tier-rank {
  color: #fff;
}

.tier-reward {
  font-size: 24rpx;
  color: #666;
  display: block;
  margin-top: 4rpx;
}

.dark-mode .tier-reward {
  color: #aaa;
}
</style>
