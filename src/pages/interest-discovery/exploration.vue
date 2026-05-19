<template>
  <view class="exploration-page">
    <view class="header-section">
      <text class="page-title">探索活动</text>
      <text class="page-subtitle">发现更多兴趣可能</text>
    </view>

    <!-- 已测评用户：按维度分类 -->
    <view v-if="store.hasProfile" class="dimension-tabs">
      <view 
        v-for="dim in allDimensions" 
        :key="dim.id"
        class="tab-item"
        :class="{ active: selectedDimension === dim.id }"
        @tap="selectedDimension = dim.id"
      >
        <text>{{ dim.icon }}</text>
        <text class="tab-name">{{ dim.name }}</text>
      </view>
    </view>

    <!-- 活动列表 -->
    <view class="activities-list">
      <view 
        v-for="activity in filteredActivities" 
        :key="activity.id"
        class="activity-item"
        @tap="goToDetail(activity)"
      >
        <view class="activity-icon-wrap">
          <text class="activity-icon">{{ activity.icon }}</text>
        </view>
        <view class="activity-content">
          <view class="activity-header">
            <text class="activity-title">{{ activity.title }}</text>
            <view class="difficulty-tag" :class="activity.difficulty">
              {{ difficultyLabels[activity.difficulty] }}
            </view>
          </view>
          <text class="activity-desc">{{ activity.description }}</text>
          <view class="activity-meta">
            <text class="meta-item">⏱️ {{ activity.duration }}分钟</text>
            <text class="meta-item">📈 +{{ getExp(activity) }}exp</text>
            <view 
              v-if="isCompleted(activity.id)" 
              class="completed-tag"
            >
              ✓ 已完成
            </view>
          </view>
        </view>
        <text class="arrow">›</text>
      </view>
    </view>

    <!-- 空状态 -->
    <view v-if="filteredActivities.length === 0" class="empty-state">
      <text class="empty-icon">🔍</text>
      <text class="empty-text">暂无活动</text>
    </view>

    <!-- 底部统计 -->
    <view class="bottom-stats">
      <view class="stat-item">
        <text class="stat-value">{{ store.totalExplorations }}</text>
        <text class="stat-label">探索次数</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item">
        <text class="stat-value">{{ store.uniqueExplorations }}</text>
        <text class="stat-label">不同活动</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item">
        <text class="stat-value">{{ store.expGainedFromExploration }}</text>
        <text class="stat-label">获得经验</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onLoad } from '@dcloudio/uni-app'
import { useInterestDiscoveryStore } from '@/stores/interestDiscoveryStore.js'
import interestDiscoveryService from '@/services/interestDiscoveryService.js'

const store = useInterestDiscoveryStore()

const allDimensions = interestDiscoveryService.INTEREST_DIMENSIONS
const allActivities = interestDiscoveryService.EXPLORATION_ACTIVITIES
const selectedDimension = ref('all')

const difficultyLabels = {
  easy: '简单',
  medium: '中等',
  hard: '挑战'
}

const filteredActivities = computed(() => {
  if (selectedDimension.value === 'all') {
    return allActivities
  }
  return allActivities.filter(a => a.dimension === selectedDimension.value)
})

const isCompleted = (activityId) => {
  return store.explorationRecords.some(r => r.activityId === activityId)
}

const getExp = (activity) => {
  return interestDiscoveryService.calculateExplorationExp(activity.difficulty)
}

const goToDetail = (activity) => {
  uni.navigateTo({
    url: `/pages/interest-discovery/activity-detail?activity=${encodeURIComponent(JSON.stringify(activity))}`
  })
}
</script>

<style scoped>
.exploration-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding-bottom: 160rpx;
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

.dimension-tabs {
  display: flex;
  gap: 16rpx;
  padding: 30rpx;
  overflow-x: auto;
  background: #fff;
  margin-top: -40rpx;
  border-radius: 20rpx 20rpx 0 0;
  margin-bottom: 2rpx;
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16rpx 24rpx;
  border-radius: 12rpx;
  background: #f5f5f5;
  flex-shrink: 0;
  font-size: 36rpx;
}

.tab-item.active {
  background: #f0efff;
}

.tab-name {
  font-size: 22rpx;
  color: #666;
  margin-top: 6rpx;
}

.tab-item.active .tab-name {
  color: #667eea;
  font-weight: 500;
}

.activities-list {
  padding: 20rpx 30rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.activity-item {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 4rpx 15rpx rgba(0, 0, 0, 0.05);
}

.activity-icon-wrap {
  width: 100rpx;
  height: 100rpx;
  background: #f8f9fa;
  border-radius: 20rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 24rpx;
}

.activity-icon {
  font-size: 56rpx;
}

.activity-content {
  flex: 1;
}

.activity-header {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 8rpx;
}

.activity-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
}

.difficulty-tag {
  font-size: 20rpx;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  color: #fff;
}

.difficulty-tag.easy {
  background: #52c41a;
}

.difficulty-tag.medium {
  background: #faad14;
}

.difficulty-tag.hard {
  background: #ff4d4f;
}

.activity-desc {
  font-size: 26rpx;
  color: #666;
  display: block;
  margin-bottom: 12rpx;
}

.activity-meta {
  display: flex;
  gap: 20rpx;
  align-items: center;
}

.meta-item {
  font-size: 24rpx;
  color: #999;
}

.completed-tag {
  font-size: 22rpx;
  color: #52c41a;
  background: #f6ffed;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
}

.arrow {
  font-size: 48rpx;
  color: #ccc;
  margin-left: 16rpx;
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

.bottom-stats {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 30rpx 40rpx;
  padding-bottom: calc(30rpx + env(safe-area-inset-bottom));
  display: flex;
  justify-content: space-around;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 40rpx;
  font-weight: 600;
  color: #667eea;
}

.stat-label {
  font-size: 24rpx;
  color: #999;
  margin-top: 4rpx;
}

.stat-divider {
  width: 2rpx;
  height: 60rpx;
  background: #e8e8e8;
}
</style>
