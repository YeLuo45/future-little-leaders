<template>
  <view class="interest-discovery">
    <!-- 顶部标题区 -->
    <view class="header-section">
      <text class="header-title">兴趣发现</text>
      <text class="header-subtitle">探索你的兴趣世界</text>
    </view>

    <!-- 未测评状态 -->
    <view v-if="!store.hasProfile" class="start-assessment-section">
      <view class="assessment-card" @tap="goToAssessment">
        <view class="card-icon">🎯</view>
        <view class="card-content">
          <text class="card-title">发现你的兴趣</text>
          <text class="card-desc">完成3分钟测评，了解自己的兴趣倾向</text>
        </view>
        <view class="card-arrow">›</view>
      </view>
    </view>

    <!-- 已测评状态：兴趣概览 -->
    <view v-else class="profile-overview">
      <!-- 顶部兴趣维度 -->
      <view class="dimensions-scroll">
        <view 
          v-for="dim in store.topInterests" 
          :key="dim.id"
          class="dimension-chip"
          :style="{ backgroundColor: dim.color + '20', borderColor: dim.color }"
        >
          <text>{{ dim.icon }}</text>
          <text class="dim-name">{{ dim.name }}</text>
        </view>
      </view>

      <!-- 快捷入口卡片 -->
      <view class="quick-actions">
        <view class="action-card" @tap="goToAssessment">
          <text class="action-icon">🔄</text>
          <text class="action-label">重新测评</text>
        </view>
        <view class="action-card" @tap="goToExploration">
          <text class="action-icon">🚀</text>
          <text class="action-label">探索活动</text>
        </view>
        <view class="action-card" @tap="goToTracking">
          <text class="action-icon">📊</text>
          <text class="action-label">兴趣追踪</text>
        </view>
        <view class="action-card" @tap="goToBadges">
          <text class="action-icon">🏅</text>
          <text class="action-label">成就徽章</text>
        </view>
      </view>

      <!-- 探索进度 -->
      <view class="exploration-progress-section">
        <view class="section-header">
          <text class="section-title">探索进度</text>
          <text class="section-more" @tap="goToExploration">查看全部 ›</text>
        </view>
        <view class="progress-grid">
          <view 
            v-for="path in store.learningPathData" 
            :key="path.dimension.id"
            class="progress-item"
          >
            <view class="progress-icon">{{ path.dimension.icon }}</view>
            <view class="progress-info">
              <text class="progress-name">{{ path.dimension.name }}</text>
              <view class="progress-bar">
                <view 
                  class="progress-fill"
                  :style="{ 
                    width: path.progress + '%',
                    backgroundColor: path.dimension.color
                  }"
                ></view>
              </view>
            </view>
            <text class="progress-count">{{ path.completedCount }}/{{ path.activities.length }}</text>
          </view>
        </view>
      </view>

      <!-- 推荐活动 -->
      <view class="recommended-section">
        <view class="section-header">
          <text class="section-title">为你推荐</text>
          <text class="section-more" @tap="goToExploration">更多 ›</text>
        </view>
        <scroll-view scroll-x class="activities-scroll">
          <view 
            v-for="activity in store.recommendedActivities" 
            :key="activity.id"
            class="activity-card"
            @tap="goToActivityDetail(activity)"
          >
            <view class="activity-icon">{{ activity.icon }}</view>
            <view class="activity-badge" :class="activity.difficulty">
              {{ difficultyLabel[activity.difficulty] }}
            </view>
            <text class="activity-title">{{ activity.title }}</text>
            <text class="activity-dim">{{ interestDimensions[activity.dimension]?.name }}</text>
          </view>
        </scroll-view>
      </view>
    </view>

    <!-- 成就徽章展示 -->
    <view v-if="store.badges.length > 0" class="badges-section">
      <view class="section-header">
        <text class="section-title">已获徽章</text>
        <text class="section-more" @tap="goToBadges">全部 ›</text>
      </view>
      <scroll-view scroll-x class="badges-scroll">
        <view 
          v-for="badge in store.recentBadges" 
          :key="badge.id"
          class="badge-item"
        >
          <text class="badge-icon">{{ badge.badge.icon }}</text>
          <text class="badge-name">{{ badge.badge.name }}</text>
        </view>
      </scroll-view>
    </view>

    <!-- 底部导航 -->
    <view class="bottom-nav">
      <view class="nav-item active">
        <text class="nav-icon">🏠</text>
        <text class="nav-label">首页</text>
      </view>
      <view class="nav-item" @tap="goToExploration">
        <text class="nav-icon">🚀</text>
        <text class="nav-label">探索</text>
      </view>
      <view class="nav-item" @tap="goToTracking">
        <text class="nav-icon">📊</text>
        <text class="nav-label">追踪</text>
      </view>
      <view class="nav-item" @tap="goToBadges">
        <text class="nav-icon">🏅</text>
        <text class="nav-label">徽章</text>
      </view>
    </view>

    <!-- 徽章获得弹窗 -->
    <view v-if="store.showBadgeModal" class="badge-modal-mask" @tap="store.closeBadgeModal">
      <view class="badge-modal" @tap.stop>
        <view class="modal-title">🎉 获得新徽章</view>
        <view 
          v-for="badge in store.newBadges" 
          :key="badge.id"
          class="new-badge-item"
        >
          <text class="new-badge-icon">{{ badge.badge.icon }}</text>
          <view class="new-badge-info">
            <text class="new-badge-name">{{ badge.badge.name }}</text>
            <text class="new-badge-desc">{{ badge.badge.description }}</text>
          </view>
        </view>
        <view class="modal-btn" @tap="store.closeBadgeModal">太棒了！</view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { onLoad } from '@dcloudio/uni-app'
import { useInterestDiscoveryStore } from '@/stores/interestDiscoveryStore.js'

const store = useInterestDiscoveryStore()

const interestDimensions = {
  science: { name: '科学探索', icon: '🔬' },
  art: { name: '艺术创作', icon: '🎨' },
  sports: { name: '体育运动', icon: '⚽' },
  reading: { name: '阅读写作', icon: '📚' },
  social: { name: '社交合作', icon: '🤝' },
  nature: { name: '自然观察', icon: '🌳' }
}

const difficultyLabel = {
  easy: '简单',
  medium: '中等',
  hard: '挑战'
}

onLoad(() => {
  store.init()
})

const goToAssessment = () => {
  uni.navigateTo({ url: '/pages/interest-discovery/assessment' })
}

const goToExploration = () => {
  uni.navigateTo({ url: '/pages/interest-discovery/exploration' })
}

const goToTracking = () => {
  uni.navigateTo({ url: '/pages/interest-discovery/tracking' })
}

const goToBadges = () => {
  uni.navigateTo({ url: '/pages/interest-discovery/badges' })
}

const goToActivityDetail = (activity) => {
  uni.navigateTo({ 
    url: `/pages/interest-discovery/activity-detail?activity=${encodeURIComponent(JSON.stringify(activity))}` 
  })
}
</script>

<style scoped>
.interest-discovery {
  min-height: 100vh;
  background: #f5f7fa;
  padding-bottom: 120rpx;
}

.header-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60rpx 40rpx 80rpx;
  color: #fff;
}

.header-title {
  font-size: 48rpx;
  font-weight: 600;
  display: block;
}

.header-subtitle {
  font-size: 28rpx;
  opacity: 0.9;
  margin-top: 8rpx;
  display: block;
}

.start-assessment-section {
  padding: 30rpx;
  margin-top: -40rpx;
}

.assessment-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 40rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.08);
}

.card-icon {
  font-size: 64rpx;
  margin-right: 30rpx;
}

.card-content {
  flex: 1;
}

.card-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  display: block;
}

.card-desc {
  font-size: 26rpx;
  color: #666;
  margin-top: 8rpx;
  display: block;
}

.card-arrow {
  font-size: 48rpx;
  color: #ccc;
}

.profile-overview {
  padding: 30rpx;
  margin-top: -40rpx;
}

.dimensions-scroll {
  display: flex;
  gap: 20rpx;
  overflow-x: auto;
  padding: 10rpx 0 20rpx;
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.dimension-chip {
  display: flex;
  align-items: center;
  padding: 16rpx 24rpx;
  border-radius: 30rpx;
  border: 2rpx solid;
  white-space: nowrap;
  font-size: 28rpx;
}

.dim-name {
  margin-left: 10rpx;
  color: #333;
  font-weight: 500;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20rpx;
  margin-bottom: 30rpx;
}

.action-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx 10rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 4rpx 15rpx rgba(0, 0, 0, 0.05);
}

.action-icon {
  font-size: 48rpx;
  margin-bottom: 10rpx;
}

.action-label {
  font-size: 24rpx;
  color: #666;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.section-more {
  font-size: 26rpx;
  color: #999;
}

.exploration-progress-section {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 15rpx rgba(0, 0, 0, 0.05);
}

.progress-grid {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.progress-item {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.progress-icon {
  font-size: 40rpx;
  width: 60rpx;
  text-align: center;
}

.progress-info {
  flex: 1;
}

.progress-name {
  font-size: 26rpx;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.progress-bar {
  height: 12rpx;
  background: #f0f0f0;
  border-radius: 6rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 6rpx;
  transition: width 0.3s;
}

.progress-count {
  font-size: 24rpx;
  color: #999;
  width: 80rpx;
  text-align: right;
}

.recommended-section {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 15rpx rgba(0, 0, 0, 0.05);
}

.activities-scroll {
  display: flex;
  gap: 20rpx;
  overflow-x: auto;
  padding: 10rpx 0;
}

.activity-card {
  width: 200rpx;
  flex-shrink: 0;
  background: #f8f9fa;
  border-radius: 16rpx;
  padding: 24rpx;
  position: relative;
}

.activity-icon {
  font-size: 56rpx;
  margin-bottom: 12rpx;
}

.activity-badge {
  position: absolute;
  top: 16rpx;
  right: 16rpx;
  font-size: 20rpx;
  padding: 4rpx 10rpx;
  border-radius: 10rpx;
  color: #fff;
}

.activity-badge.easy {
  background: #52c41a;
}

.activity-badge.medium {
  background: #faad14;
}

.activity-badge.hard {
  background: #ff4d4f;
}

.activity-title {
  font-size: 26rpx;
  font-weight: 500;
  color: #333;
  display: block;
  margin-bottom: 6rpx;
}

.activity-dim {
  font-size: 22rpx;
  color: #999;
}

.badges-section {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin: 0 30rpx 30rpx;
  box-shadow: 0 4rpx 15rpx rgba(0, 0, 0, 0.05);
}

.badges-scroll {
  display: flex;
  gap: 30rpx;
  overflow-x: auto;
  padding: 10rpx 0;
}

.badge-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 120rpx;
  flex-shrink: 0;
}

.badge-icon {
  font-size: 64rpx;
  margin-bottom: 8rpx;
}

.badge-name {
  font-size: 22rpx;
  color: #666;
  text-align: center;
  display: block;
}

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100rpx;
  background: #fff;
  display: flex;
  justify-content: space-around;
  align-items: center;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);
  padding-bottom: env(safe-area-inset-bottom);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10rpx 30rpx;
}

.nav-item.active .nav-label {
  color: #667eea;
}

.nav-icon {
  font-size: 40rpx;
}

.nav-label {
  font-size: 22rpx;
  color: #999;
  margin-top: 4rpx;
}

.badge-modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.badge-modal {
  width: 600rpx;
  background: #fff;
  border-radius: 24rpx;
  padding: 40rpx;
}

.modal-title {
  font-size: 36rpx;
  font-weight: 600;
  text-align: center;
  color: #333;
  margin-bottom: 30rpx;
}

.new-badge-item {
  display: flex;
  align-items: center;
  padding: 24rpx;
  background: #f8f9fa;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
}

.new-badge-icon {
  font-size: 72rpx;
  margin-right: 24rpx;
}

.new-badge-info {
  flex: 1;
}

.new-badge-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  display: block;
}

.new-badge-desc {
  font-size: 24rpx;
  color: #666;
  margin-top: 6rpx;
  display: block;
}

.modal-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  text-align: center;
  padding: 24rpx;
  border-radius: 12rpx;
  font-size: 32rpx;
  font-weight: 500;
  margin-top: 20rpx;
}
</style>
