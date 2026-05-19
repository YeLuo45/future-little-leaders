<template>
  <view class="badges-page">
    <view class="header-section">
      <text class="page-title">成就徽章</text>
      <text class="page-subtitle">见证你的兴趣探索之旅</text>
    </view>

    <!-- 已获得徽章 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">已获得</text>
        <text class="section-count">{{ store.badges.length }}个</text>
      </view>
      
      <view v-if="store.badges.length > 0" class="badges-grid">
        <view 
          v-for="badge in store.badges" 
          :key="badge.id"
          class="badge-card earned"
        >
          <text class="badge-icon">{{ badge.badge.icon }}</text>
          <text class="badge-name">{{ badge.badge.name }}</text>
          <text class="badge-desc">{{ badge.badge.description }}</text>
          <text class="badge-date">{{ formatDate(badge.awardedAt) }}</text>
        </view>
      </view>
      
      <view v-else class="empty-badges">
        <text class="empty-icon">🏅</text>
        <text class="empty-text">还没有获得徽章</text>
        <text class="empty-hint">开始探索来获得你的第一枚徽章吧！</text>
      </view>
    </view>

    <!-- 徽章墙 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">徽章墙</text>
      </view>
      
      <view class="badges-wall">
        <view 
          v-for="badge in allBadgesList" 
          :key="badge.id"
          class="badge-item"
          :class="{ earned: isBadgeEarned(badge.id) }"
        >
          <text class="badge-icon">{{ badge.icon }}</text>
          <text class="badge-name">{{ badge.name }}</text>
          <view v-if="isBadgeEarned(badge.id)" class="earned-check">✓</view>
        </view>
      </view>
    </view>

    <!-- 获取条件说明 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">徽章获取条件</text>
      </view>
      
      <view class="conditions-list">
        <view class="condition-item">
          <text class="condition-icon">🎯</text>
          <view class="condition-info">
            <text class="condition-name">兴趣探索者</text>
            <text class="condition-desc">完成首次兴趣测评</text>
          </view>
          <view v-if="isBadgeEarned('first_assessment')" class="condition-status completed">已完成</view>
          <view v-else class="condition-status">未完成</view>
        </view>
        
        <view class="condition-item">
          <text class="condition-icon">🌟</text>
          <view class="condition-info">
            <text class="condition-name">探索小达人</text>
            <text class="condition-desc">完成5次探索活动</text>
          </view>
          <view v-if="isBadgeEarned('five_explorations')" class="condition-status completed">已完成</view>
          <view v-else class="condition-status">未完成</view>
        </view>
        
        <view class="condition-item">
          <text class="condition-icon">💎</text>
          <view class="condition-info">
            <text class="condition-name">探索小专家</text>
            <text class="condition-desc">完成10次探索活动</text>
          </view>
          <view v-if="isBadgeEarned('ten_explorations')" class="condition-status completed">已完成</view>
          <view v-else class="condition-status">未完成</view>
        </view>
        
        <view class="condition-item">
          <text class="condition-icon">📈</text>
          <view class="condition-info">
            <text class="condition-name">坚持追踪者</text>
            <text class="condition-desc">连续7天记录兴趣活动</text>
          </view>
          <view v-if="isBadgeEarned('consistent_tracker')" class="condition-status completed">已完成</view>
          <view v-else class="condition-status">未完成</view>
        </view>
        
        <view class="condition-item">
          <text class="condition-icon">🏆</text>
          <view class="condition-info">
            <text class="condition-name">全能探索家</text>
            <text class="condition-desc">体验所有兴趣维度的活动</text>
          </view>
          <view v-if="isBadgeEarned('all_dimension_explorer')" class="condition-status completed">已完成</view>
          <view v-else class="condition-status">未完成</view>
        </view>
        
        <view class="condition-item">
          <text class="condition-icon">🎓</text>
          <view class="condition-info">
            <text class="condition-name">深度学习者</text>
            <text class="condition-desc">在某个兴趣领域完成3次进阶活动</text>
          </view>
          <view v-if="isBadgeEarned('deep_learner')" class="condition-status completed">已完成</view>
          <view v-else class="condition-status">未完成</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { onLoad } from '@dcloudio/uni-app'
import { useInterestDiscoveryStore } from '@/stores/interestDiscoveryStore.js'
import interestDiscoveryService from '@/services/interestDiscoveryService.js'

const store = useInterestDiscoveryStore()

const allBadgesList = Object.values(interestDiscoveryService.ACHIEVEMENT_BADGES)

onLoad(() => {
  store.init()
})

const isBadgeEarned = (badgeId) => {
  return store.badges.some(b => b.badgeId === badgeId)
}

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
}
</script>

<style scoped>
.badges-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding-bottom: 40rpx;
}

.header-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60rpx 40rpx 80rpx;
  color: #fff;
}

.page-title {
  font-size: 44rpx;
  font-weight: 600;
  display: block;
}

.page-subtitle {
  font-size: 28rpx;
  opacity: 0.9;
  margin-top: 8rpx;
  display: block;
}

.section {
  background: #fff;
  margin: 30rpx;
  border-radius: 20rpx;
  padding: 30rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.section-count {
  font-size: 26rpx;
  color: #667eea;
}

.badges-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.badge-card {
  background: #f8f9fa;
  border-radius: 16rpx;
  padding: 30rpx;
  text-align: center;
}

.badge-card.earned {
  background: linear-gradient(135deg, #667eea10 0%, #764baa10 100%);
  border: 2rpx solid #667eea30;
}

.badge-icon {
  font-size: 72rpx;
  display: block;
  margin-bottom: 12rpx;
}

.badge-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  display: block;
}

.badge-desc {
  font-size: 22rpx;
  color: #666;
  display: block;
  margin-top: 6rpx;
}

.badge-date {
  font-size: 20rpx;
  color: #999;
  display: block;
  margin-top: 8rpx;
}

.empty-badges {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 0;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 16rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.empty-hint {
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
}

.badges-wall {
  display: flex;
  flex-wrap: wrap;
  gap: 30rpx;
  justify-content: flex-start;
}

.badge-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 120rpx;
  position: relative;
}

.badge-item .badge-icon {
  font-size: 64rpx;
  filter: grayscale(100%);
  opacity: 0.4;
}

.badge-item.earned .badge-icon {
  filter: none;
  opacity: 1;
}

.badge-item .badge-name {
  font-size: 22rpx;
  color: #999;
  text-align: center;
  margin-top: 8rpx;
}

.badge-item.earned .badge-name {
  color: #333;
}

.earned-check {
  position: absolute;
  top: 0;
  right: 0;
  width: 32rpx;
  height: 32rpx;
  background: #52c41a;
  color: #fff;
  border-radius: 50%;
  font-size: 20rpx;
  display: flex;
  justify-content: center;
  align-items: center;
}

.conditions-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.condition-item {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
  gap: 16rpx;
}

.condition-icon {
  font-size: 48rpx;
}

.condition-info {
  flex: 1;
}

.condition-name {
  font-size: 28rpx;
  font-weight: 500;
  color: #333;
  display: block;
}

.condition-desc {
  font-size: 24rpx;
  color: #999;
  display: block;
  margin-top: 4rpx;
}

.condition-status {
  font-size: 22rpx;
  color: #999;
  background: #fff;
  padding: 6rpx 16rpx;
  border-radius: 8rpx;
}

.condition-status.completed {
  color: #52c41a;
  background: #f6ffed;
}
</style>
