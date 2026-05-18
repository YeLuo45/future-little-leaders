<template>
  <view class="leaderboard-page">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <view class="back-btn" @click="goBack">
        <text>←</text>
      </view>
      <text class="nav-title">家庭排行榜</text>
      <view class="nav-placeholder"></view>
    </view>

    <!-- 顶部三强 -->
    <view v-if="topThree.length > 0" class="top-three">
      <!-- 第二名 -->
      <view v-if="topThree[1]" class="top-item second">
        <view class="avatar-wrap">
          <text class="avatar">{{ topThree[1].babyAvatar }}</text>
          <view class="rank-badge">2</view>
        </view>
        <text class="baby-name">{{ topThree[1].babyName }}</text>
        <view class="points-wrap">
          <text class="points-icon">⭐</text>
          <text class="points-num">{{ topThree[1].totalPoints }}</text>
        </view>
      </view>
      <view v-else class="top-item placeholder"></view>

      <!-- 第一名 -->
      <view v-if="topThree[0]" class="top-item first">
        <view class="avatar-wrap">
          <text class="avatar crown">👑</text>
          <text class="avatar">{{ topThree[0].babyAvatar }}</text>
          <view class="rank-badge gold">1</view>
        </view>
        <text class="baby-name">{{ topThree[0].babyName }}</text>
        <view class="points-wrap">
          <text class="points-icon">⭐</text>
          <text class="points-num">{{ topThree[0].totalPoints }}</text>
        </view>
      </view>

      <!-- 第三名 -->
      <view v-if="topThree[2]" class="top-item third">
        <view class="avatar-wrap">
          <text class="avatar">{{ topThree[2].babyAvatar }}</text>
          <view class="rank-badge bronze">3</view>
        </view>
        <text class="baby-name">{{ topThree[2].babyName }}</text>
        <view class="points-wrap">
          <text class="points-icon">⭐</text>
          <text class="points-num">{{ topThree[2].totalPoints }}</text>
        </view>
      </view>
      <view v-else class="top-item placeholder"></view>
    </view>

    <!-- 排行列表 -->
    <view class="leaderboard-list">
      <view class="list-header">
        <text class="col-rank">排名</text>
        <text class="col-info">宝宝</text>
        <text class="col-points">积分</text>
      </view>

      <view
        v-for="item in leaderboard"
        :key="item.babyId"
        class="leaderboard-item"
        :class="{ highlight: item.babyId === currentBabyId }"
      >
        <view class="col-rank">
          <text class="rank-num" :class="getRankClass(item.rank)">{{ item.rank }}</text>
        </view>
        <view class="col-info">
          <text class="item-avatar">{{ item.babyAvatar }}</text>
          <text class="item-name">{{ item.babyName }}</text>
        </view>
        <view class="col-points">
          <text class="item-points">{{ item.totalPoints }}</text>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-if="leaderboard.length === 0" class="empty-state">
        <text class="empty-icon">🏆</text>
        <text class="empty-text">暂无排行数据</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useLeaderboardStore } from '@/stores/leaderboardStore.js'
import { useBabyStore } from '@/stores/babyStore.js'

const leaderboardStore = useLeaderboardStore()
const babyStore = useBabyStore()

// 排行榜数据
const leaderboard = computed(() => leaderboardStore.globalLeaderboard)

// 前三名
const topThree = computed(() => leaderboardStore.getTopThree())

// 当前宝宝ID
const currentBabyId = computed(() => babyStore.currentBabyId)

// 返回
const goBack = () => {
  uni.navigateBack()
}

// 获取排名样式类
const getRankClass = (rank) => {
  if (rank === 1) return 'gold'
  if (rank === 2) return 'silver'
  if (rank === 3) return 'bronze'
  return ''
}

// 初始化
onMounted(() => {
  leaderboardStore.init()
})
</script>

<style scoped>
.leaderboard-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx 40rpx;
  background: #fff;
}

.back-btn {
  font-size: 40rpx;
  color: #333;
  padding: 10rpx;
}

.nav-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.nav-placeholder {
  width: 60rpx;
}

/* 顶部三强 */
.top-three {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  padding: 40rpx 20rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.top-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 20rpx;
}

.top-item.placeholder {
  width: 160rpx;
}

.avatar-wrap {
  position: relative;
  margin-bottom: 12rpx;
}

.avatar {
  font-size: 72rpx;
  display: block;
}

.avatar.crown {
  position: absolute;
  top: -30rpx;
  left: 50%;
  transform: translateX(-50%);
  font-size: 40rpx;
}

.rank-badge {
  position: absolute;
  bottom: -8rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 36rpx;
  height: 36rpx;
  background: #ccc;
  color: #fff;
  border-radius: 50%;
  font-size: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.rank-badge.gold {
  background: linear-gradient(135deg, #ffd700 0%, #ffb347 100%);
}

.rank-badge.bronze {
  background: linear-gradient(135deg, #cd7f32 0%, #b87333 100%);
}

.baby-name {
  font-size: 26rpx;
  color: #fff;
  margin-bottom: 8rpx;
  max-width: 120rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.points-wrap {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.2);
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
}

.points-icon {
  font-size: 20rpx;
  margin-right: 4rpx;
}

.points-num {
  font-size: 24rpx;
  color: #fff;
  font-weight: bold;
}

/* 排行列表 */
.leaderboard-list {
  padding: 20rpx;
}

.list-header {
  display: flex;
  padding: 20rpx 30rpx;
  background: #fff;
  border-radius: 16rpx 16rpx 0 0;
  font-size: 24rpx;
  color: #999;
}

.col-rank {
  width: 100rpx;
  text-align: center;
}

.col-info {
  flex: 1;
}

.col-points {
  width: 120rpx;
  text-align: right;
}

.leaderboard-item {
  display: flex;
  align-items: center;
  padding: 24rpx 30rpx;
  background: #fff;
  border-bottom: 1rpx solid #f5f5f5;
}

.leaderboard-item.highlight {
  background: #f0f0ff;
}

.rank-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background: #f5f5f5;
  font-size: 24rpx;
  font-weight: bold;
  color: #666;
}

.rank-num.gold {
  background: linear-gradient(135deg, #ffd700 0%, #ffb347 100%);
  color: #fff;
}

.rank-num.silver {
  background: linear-gradient(135deg, #c0c0c0 0%, #a9a9a9 100%);
  color: #fff;
}

.rank-num.bronze {
  background: linear-gradient(135deg, #cd7f32 0%, #b87333 100%);
  color: #fff;
}

.item-avatar {
  font-size: 40rpx;
  margin-right: 16rpx;
}

.item-name {
  font-size: 28rpx;
  color: #333;
}

.item-points {
  font-size: 28rpx;
  color: #667eea;
  font-weight: bold;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 100rpx 0;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 20rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}
</style>
