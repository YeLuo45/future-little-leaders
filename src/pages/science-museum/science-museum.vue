<template>
  <view class="science-museum-page">
    <!-- 顶部标题 -->
    <view class="header">
      <text class="title">科学博物馆</text>
      <text class="subtitle">虚拟博物馆参观 · 科技史展览 · 科学互动展品</text>
    </view>

    <!-- 统计卡片 -->
    <view class="stats-section">
      <view class="stat-card">
        <text class="stat-icon">🏛️</text>
        <text class="stat-value">{{ statistics.unlockedHalls }}/{{ statistics.totalHalls }}</text>
        <text class="stat-label">已解锁展厅</text>
      </view>
      <view class="stat-card">
        <text class="stat-icon">🔬</text>
        <text class="stat-value">{{ statistics.completedExhibits }}/{{ statistics.totalExhibits }}</text>
        <text class="stat-label">已完成展品</text>
      </view>
      <view class="stat-card">
        <text class="stat-icon">📒</text>
        <text class="stat-value">{{ statistics.unlockedCollectibles }}/{{ statistics.totalCollectibles }}</text>
        <text class="stat-label">收藏成就</text>
      </view>
    </view>

    <!-- 总积分 -->
    <view class="score-section">
      <view class="score-badge">
        <text class="score-icon">⭐</text>
        <text class="score-text">总积分: {{ statistics.totalPoints }}</text>
      </view>
    </view>

    <!-- 功能入口 -->
    <view class="modules-section">
      <text class="section-title">博物馆导览</text>

      <!-- 博物馆展厅 -->
      <view class="module-card" @click="goToHalls">
        <view class="module-icon">🏛️</view>
        <view class="module-info">
          <text class="module-name">博物馆展厅</text>
          <text class="module-desc">科技史 · 物理 · 化学 · 生物 · 宇宙 · 地球</text>
        </view>
        <view class="module-arrow">›</view>
      </view>

      <!-- 科学收藏册 -->
      <view class="module-card" @click="goToCollection">
        <view class="module-icon">📒</view>
        <view class="module-info">
          <text class="module-name">科学收藏册</text>
          <text class="module-desc">展品印章收集 · 成就奖励</text>
        </view>
        <view class="module-arrow">›</view>
      </view>
    </view>

    <!-- 展厅预览 -->
    <view class="halls-preview-section">
      <text class="section-title">展厅预览</text>
      <scroll-view scroll-x class="halls-scroll">
        <view 
          v-for="hall in halls" 
          :key="hall.id" 
          class="hall-preview-card"
          :class="{ locked: !isHallUnlocked(hall.id) }"
          @click="previewHall(hall.id)"
        >
          <text class="hall-preview-icon">{{ HALL_TYPE_INFO[hall.type]?.icon || '🏛️' }}</text>
          <text class="hall-preview-name">{{ hall.name }}</text>
          <text class="hall-preview-status">{{ isHallUnlocked(hall.id) ? '已解锁' : '🔒' }}</text>
        </view>
      </scroll-view>
    </view>

    <!-- 学习提示 -->
    <view class="tips-section">
      <text class="section-title">参观须知</text>
      <view class="tip-card">
        <text class="tip-icon">💡</text>
        <view class="tip-content">
          <text class="tip-title">互动探索</text>
          <text class="tip-text">博物馆中的每个展品都可以互动体验，仔细观察会发生什么</text>
        </view>
      </view>
      <view class="tip-card">
        <text class="tip-icon">🔖</text>
        <view class="tip-content">
          <text class="tip-title">收集印章</text>
          <text class="tip-text">完成展品体验后可以获得印章，集齐印章解锁收藏成就</text>
        </view>
      </view>
      <view class="tip-card">
        <text class="tip-icon">🔓</text>
        <view class="tip-content">
          <text class="tip-title">解锁新展厅</text>
          <text class="tip-text">完成当前展厅所有展品，即可解锁下一个展厅</text>
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
    goToHalls() {
      uni.navigateTo({ url: '/pages/science-museum/hall-list' })
    },
    goToCollection() {
      uni.navigateTo({ url: '/pages/science-museum/collection-book' })
    },
    previewHall(hallId) {
      if (!this.isHallUnlocked(hallId)) {
        uni.showToast({ title: '展厅未解锁', icon: 'none' })
        return
      }
      this.smStore.selectHall(hallId)
      uni.navigateTo({ url: `/pages/science-museum/hall-detail?hallId=${hallId}` })
    }
  }
}
</script>

<style scoped>
.science-museum-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #e8f4f8 0%, #d4e8f2 50%, #f0e6d3 100%);
  padding: 20rpx;
}

.header {
  text-align: center;
  padding: 40rpx 0;
}

.title {
  font-size: 48rpx;
  font-weight: bold;
  color: #1a5f7a;
  display: block;
}

.subtitle {
  font-size: 28rpx;
  color: rgba(26, 95, 122, 0.8);
  margin-top: 10rpx;
}

.stats-section {
  display: flex;
  justify-content: space-around;
  margin: 30rpx 20rpx;
}

.stat-card {
  background: rgba(255, 255, 255, 0.4);
  border-radius: 20rpx;
  padding: 30rpx;
  text-align: center;
  flex: 1;
  margin: 0 10rpx;
  backdrop-filter: blur(10px);
}

.stat-icon {
  font-size: 48rpx;
  display: block;
}

.stat-value {
  font-size: 32rpx;
  font-weight: bold;
  color: #1a5f7a;
  display: block;
  margin-top: 10rpx;
}

.stat-label {
  font-size: 24rpx;
  color: rgba(26, 95, 122, 0.8);
  display: block;
  margin-top: 5rpx;
}

.score-section {
  text-align: center;
  margin: 20rpx;
}

.score-badge {
  display: inline-flex;
  align-items: center;
  background: rgba(255, 215, 0, 0.3);
  border-radius: 50rpx;
  padding: 15rpx 40rpx;
}

.score-icon {
  font-size: 36rpx;
  margin-right: 10rpx;
}

.score-text {
  font-size: 28rpx;
  color: #b8860b;
  font-weight: bold;
}

.modules-section {
  margin: 30rpx 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #1a5f7a;
  margin-bottom: 20rpx;
  display: block;
}

.module-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.module-icon {
  width: 80rpx;
  height: 80rpx;
  background: linear-gradient(135deg, #e8f4f8 0%, #d4e8f2 100%);
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
}

.module-info {
  flex: 1;
  margin-left: 20rpx;
}

.module-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
}

.module-desc {
  font-size: 24rpx;
  color: #666;
  display: block;
  margin-top: 5rpx;
}

.module-arrow {
  font-size: 48rpx;
  color: #999;
}

.halls-preview-section {
  margin: 30rpx 20rpx;
}

.halls-scroll {
  white-space: nowrap;
  width: 100%;
}

.hall-preview-card {
  display: inline-block;
  width: 200rpx;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16rpx;
  padding: 24rpx;
  margin-right: 20rpx;
  text-align: center;
  vertical-align: top;
}

.hall-preview-card.locked {
  opacity: 0.6;
}

.hall-preview-icon {
  font-size: 60rpx;
  display: block;
}

.hall-preview-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-top: 10rpx;
}

.hall-preview-status {
  font-size: 22rpx;
  color: #666;
  display: block;
  margin-top: 5rpx;
}

.tips-section {
  margin: 30rpx 20rpx;
}

.tip-card {
  background: rgba(255, 255, 255, 0.25);
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
  display: flex;
  align-items: flex-start;
  backdrop-filter: blur(10px);
}

.tip-icon {
  font-size: 36rpx;
  margin-right: 16rpx;
}

.tip-content {
  flex: 1;
}

.tip-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #1a5f7a;
  display: block;
}

.tip-text {
  font-size: 24rpx;
  color: rgba(26, 95, 122, 0.8);
  display: block;
  margin-top: 8rpx;
  line-height: 1.4;
}
</style>
