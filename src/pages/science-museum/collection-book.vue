<template>
  <view class="collection-book-page">
    <!-- 顶部标题 -->
    <view class="header">
      <text class="title">科学收藏册</text>
      <text class="subtitle">收集展品印章，解锁成就奖励</text>
      
      <!-- 收集进度 -->
      <view class="collection-stats">
        <view class="stat-item">
          <text class="stat-value">{{ statistics.totalStamps }}</text>
          <text class="stat-label">已收集印章</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ statistics.unlockedCollectibles }}/{{ statistics.totalCollectibles }}</text>
          <text class="stat-label">已解锁成就</text>
        </view>
      </view>
    </view>

    <!-- 成就列表 -->
    <view class="collectibles-section">
      <text class="section-title">🏆 成就奖励</text>
      
      <view class="collectibles-list">
        <view 
          v-for="item in collectibles" 
          :key="item.id" 
          class="collectible-card"
          :class="{ unlocked: getCollectibleProgress(item.id).unlocked }"
        >
          <view class="collectible-icon-wrap">
            <text class="collectible-icon">{{ item.icon }}</text>
            <view v-if="getCollectibleProgress(item.id).unlocked" class="unlocked-badge">✓</view>
          </view>
          
          <view class="collectible-content">
            <text class="collectible-name">{{ item.name }}</text>
            <text class="collectible-desc">{{ item.description }}</text>
            
            <view class="collectible-progress">
              <view class="progress-bar">
                <view 
                  class="progress-fill" 
                  :style="{ width: Math.min((getCollectibleProgress(item.id).count / item.requireCount) * 100, 100) + '%' }"
                ></view>
              </view>
              <text class="progress-text">{{ getCollectibleProgress(item.id).count }}/{{ item.requireCount }}</text>
            </view>
          </view>
          
          <view v-if="getCollectibleProgress(item.id).unlocked" class="unlocked-mark">
            <text class="mark-icon">🎉</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 已解锁展厅徽章 -->
    <view class="halls-badges-section">
      <text class="section-title">🏛️ 展厅进度</text>
      
      <view class="halls-badges">
        <view 
          v-for="hall in halls" 
          :key="hall.id" 
          class="hall-badge-item"
          :class="{ unlocked: isHallUnlocked(hall.id) }"
        >
          <text class="hall-badge-icon">{{ HALL_TYPE_INFO[hall.type]?.icon || '🏛️' }}</text>
          <text class="hall-badge-name">{{ hall.name }}</text>
          <text class="hall-badge-status">
            {{ isHallUnlocked(hall.id) ? '已解锁' : '未解锁' }}
          </text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { useScienceMuseumStore, HALL_TYPE_INFO } from '@/stores/scienceMuseumStore.js'

export default {
  data() {
    return {
      HALL_TYPE_INFO
    }
  },
  computed: {
    smStore() {
      return useScienceMuseumStore()
    },
    statistics() {
      return this.smStore.statistics
    },
    collectibles() {
      return this.smStore.collectibles
    },
    halls() {
      return this.smStore.halls
    }
  },
  onLoad() {
    this.smStore.init()
  },
  methods: {
    isHallUnlocked(hallId) {
      return this.smStore.isHallUnlocked(hallId)
    },
    getCollectibleProgress(collectibleId) {
      return this.smStore.getCollectibleProgress(collectibleId)
    }
  }
}
</script>

<style scoped>
.collection-book-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #e8f4f8 0%, #f0e6d3 100%);
  padding: 20rpx;
}

.header {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
  text-align: center;
}

.title {
  font-size: 40rpx;
  font-weight: bold;
  color: #1a5f7a;
  display: block;
}

.subtitle {
  font-size: 26rpx;
  color: rgba(26, 95, 122, 0.8);
  margin-top: 8rpx;
}

.collection-stats {
  display: flex;
  justify-content: center;
  margin-top: 24rpx;
  padding-top: 24rpx;
  border-top: 1px solid rgba(26, 95, 122, 0.1);
}

.stat-item {
  margin: 0 40rpx;
  text-align: center;
}

.stat-value {
  font-size: 36rpx;
  font-weight: bold;
  color: #1a5f7a;
  display: block;
}

.stat-label {
  font-size: 22rpx;
  color: #666;
  display: block;
  margin-top: 4rpx;
}

.collectibles-section,
.halls-badges-section {
  padding: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #1a5f7a;
  margin-bottom: 20rpx;
  display: block;
}

.collectibles-list {
  display: flex;
  flex-direction: column;
}

.collectible-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
  position: relative;
}

.collectible-card.unlocked {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 255, 255, 0.95) 100%);
  border: 2rpx solid rgba(255, 215, 0, 0.3);
}

.collectible-icon-wrap {
  width: 90rpx;
  height: 90rpx;
  background: linear-gradient(135deg, #e8f4f8 0%, #d4e8f2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.collectible-card.unlocked .collectible-icon-wrap {
  background: linear-gradient(135deg, #ffd700 0%, #ffb800 100%);
}

.collectible-icon {
  font-size: 44rpx;
}

.unlocked-badge {
  position: absolute;
  bottom: -4rpx;
  right: -4rpx;
  width: 32rpx;
  height: 32rpx;
  background: #52C41A;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18rpx;
  color: #fff;
  font-weight: bold;
}

.collectible-content {
  flex: 1;
  margin-left: 20rpx;
}

.collectible-name {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  display: block;
}

.collectible-desc {
  font-size: 24rpx;
  color: #666;
  display: block;
  margin-top: 4rpx;
}

.collectible-progress {
  display: flex;
  align-items: center;
  margin-top: 12rpx;
}

.progress-bar {
  flex: 1;
  height: 10rpx;
  background: rgba(26, 95, 122, 0.15);
  border-radius: 5rpx;
  max-width: 300rpx;
}

.collectible-card.unlocked .progress-bar {
  background: rgba(255, 215, 0, 0.3);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #1890FF, #52C41A);
  border-radius: 5rpx;
  transition: width 0.3s;
}

.collectible-card.unlocked .progress-fill {
  background: linear-gradient(90deg, #ffd700, #ffb800);
}

.progress-text {
  font-size: 22rpx;
  color: #1a5f7a;
  margin-left: 12rpx;
  font-weight: bold;
}

.unlocked-mark {
  margin-left: 12rpx;
}

.mark-icon {
  font-size: 36rpx;
}

.halls-badges-section {
  margin-top: 20rpx;
}

.halls-badges {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.hall-badge-item {
  width: 31%;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 16rpx;
  padding: 20rpx 10rpx;
  text-align: center;
  margin-bottom: 16rpx;
  opacity: 0.5;
}

.hall-badge-item.unlocked {
  background: rgba(255, 255, 255, 0.95);
  opacity: 1;
}

.hall-badge-icon {
  font-size: 48rpx;
  display: block;
}

.hall-badge-name {
  font-size: 22rpx;
  color: #333;
  display: block;
  margin-top: 8rpx;
}

.hall-badge-status {
  font-size: 18rpx;
  color: #999;
  display: block;
  margin-top: 4rpx;
}

.hall-badge-item.unlocked .hall-badge-status {
  color: #52C41A;
}
</style>
