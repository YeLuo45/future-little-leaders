<template>
  <view class="exhibit-detail-page">
    <!-- 顶部展品信息 -->
    <view class="header">
      <view class="exhibit-badge">
        <text class="exhibit-icon">{{ EXHIBIT_TYPE_INFO[exhibit?.type]?.icon || '🔬' }}</text>
        <view class="exhibit-type-tag" :style="{ background: EXHIBIT_TYPE_INFO[exhibit?.type]?.color + '20', color: EXHIBIT_TYPE_INFO[exhibit?.type]?.color }">
          {{ EXHIBIT_TYPE_INFO[exhibit?.type]?.label }}
        </view>
      </view>
      
      <text class="exhibit-name">{{ exhibit?.name }}</text>
      <text class="exhibit-desc">{{ exhibit?.description }}</text>
      
      <!-- 难度和积分 -->
      <view class="exhibit-meta">
        <view class="meta-item">
          <text class="meta-icon">⭐</text>
          <text class="meta-label">难度</text>
          <text class="meta-value">{{ exhibit?.difficulty || 1 }}</text>
        </view>
        <view class="meta-item">
          <text class="meta-icon">🏆</text>
          <text class="meta-label">积分</text>
          <text class="meta-value">+{{ exhibit?.points || 10 }}</text>
        </view>
        <view v-if="isCompleted" class="meta-item completed">
          <text class="meta-icon">✓</text>
          <text class="meta-label">状态</text>
          <text class="meta-value">已完成</text>
        </view>
      </view>
    </view>

    <!-- 原理讲解 -->
    <view v-if="exhibit?.principle" class="section principle-section">
      <text class="section-title">📖 科学原理</text>
      <view class="principle-card">
        <text class="principle-text">{{ exhibit.principle }}</text>
      </view>
    </view>

    <!-- 历史背景 -->
    <view v-if="exhibit?.history" class="section history-section">
      <text class="section-title">📜 历史背景</text>
      <view class="history-card">
        <text class="history-text">{{ exhibit.history }}</text>
      </view>
    </view>

    <!-- 互动体验 -->
    <view v-if="exhibit?.type === 'interactive' && exhibit?.interactiveSteps" class="section interactive-section">
      <text class="section-title">🎮 互动体验</text>
      <view class="steps-list">
        <view 
          v-for="(step, index) in exhibit.interactiveSteps" 
          :key="index"
          class="step-item"
        >
          <view class="step-number">{{ index + 1 }}</view>
          <text class="step-text">{{ step }}</text>
        </view>
      </view>
    </view>

    <!-- 实验演示 -->
    <view v-if="exhibit?.type === 'demo' && exhibit?.demoSteps" class="section demo-section">
      <text class="section-title">🔬 实验演示</text>
      <view class="steps-list">
        <view 
          v-for="(step, index) in exhibit.demoSteps" 
          :key="index"
          class="step-item"
        >
          <view class="step-number">{{ index + 1 }}</view>
          <text class="step-text">{{ step }}</text>
        </view>
      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="action-section">
      <button 
        v-if="!isCompleted" 
        class="complete-btn" 
        @click="completeExhibit"
      >
        <text class="btn-icon">✓</text>
        <text class="btn-text">完成展品体验</text>
      </button>
      
      <button 
        v-else 
        class="completed-btn"
        disabled
      >
        <text class="btn-icon">✓</text>
        <text class="btn-text">已收集印章 × {{ exhibitProgress.stamps }}</text>
      </button>
    </view>
  </view>
</template>

<script>
import { useScienceMuseumStore, EXHIBIT_TYPE_INFO } from '@/stores/scienceMuseumStore.js'

export default {
  data() {
    return {
      EXHIBIT_TYPE_INFO,
      exhibitId: ''
    }
  },
  computed: {
    smStore() {
      return useScienceMuseumStore()
    },
    exhibit() {
      return this.smStore.currentExhibit
    },
    exhibitProgress() {
      return this.smStore.getExhibitProgress(this.exhibitId)
    },
    isCompleted() {
      return this.exhibitProgress.completed
    }
  },
  onLoad(options) {
    if (options.exhibitId) {
      this.exhibitId = options.exhibitId
      this.smStore.selectExhibit(options.exhibitId)
    }
  },
  methods: {
    completeExhibit() {
      const result = this.smStore.completeExhibit(this.exhibitId, 1)
      if (result) {
        uni.showToast({
          title: `获得 ${result.points} 积分和 1 个印章！`,
          icon: 'success'
        })
      }
    }
  }
}
</script>

<style scoped>
.exhibit-detail-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #e8f4f8 0%, #d4e8f2 100%);
  padding: 20rpx;
  padding-bottom: 120rpx;
}

.header {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.exhibit-badge {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}

.exhibit-icon {
  font-size: 56rpx;
  margin-right: 16rpx;
}

.exhibit-type-tag {
  font-size: 22rpx;
  padding: 6rpx 16rpx;
  border-radius: 10rpx;
}

.exhibit-name {
  font-size: 38rpx;
  font-weight: bold;
  color: #1a5f7a;
  display: block;
}

.exhibit-desc {
  font-size: 26rpx;
  color: #666;
  display: block;
  margin-top: 10rpx;
  line-height: 1.4;
}

.exhibit-meta {
  display: flex;
  justify-content: flex-start;
  margin-top: 24rpx;
  padding-top: 24rpx;
  border-top: 1px solid rgba(26, 95, 122, 0.1);
}

.meta-item {
  display: flex;
  align-items: center;
  margin-right: 40rpx;
}

.meta-item.completed {
  color: #52C41A;
}

.meta-icon {
  font-size: 28rpx;
  margin-right: 8rpx;
}

.meta-label {
  font-size: 22rpx;
  color: #999;
  margin-right: 6rpx;
}

.meta-value {
  font-size: 26rpx;
  font-weight: bold;
  color: #1a5f7a;
}

.section {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
}

.section-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #1a5f7a;
  margin-bottom: 16rpx;
  display: block;
}

.principle-card,
.history-card {
  background: linear-gradient(135deg, rgba(24, 144, 255, 0.08) 0%, rgba(82, 196, 26, 0.08) 100%);
  border-radius: 16rpx;
  padding: 20rpx;
}

.principle-text,
.history-text {
  font-size: 26rpx;
  color: #333;
  line-height: 1.6;
}

.steps-list {
  display: flex;
  flex-direction: column;
}

.step-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 16rpx;
}

.step-item:last-child {
  margin-bottom: 0;
}

.step-number {
  width: 44rpx;
  height: 44rpx;
  background: linear-gradient(135deg, #1890FF, #52C41A);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  color: #fff;
  font-weight: bold;
  margin-right: 16rpx;
  flex-shrink: 0;
}

.step-text {
  font-size: 26rpx;
  color: #333;
  line-height: 1.5;
  flex: 1;
}

.action-section {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.complete-btn {
  width: 100%;
  background: linear-gradient(135deg, #1890FF, #52C41A);
  border: none;
  border-radius: 50rpx;
  padding: 28rpx 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.completed-btn {
  width: 100%;
  background: linear-gradient(135deg, #d9d9d9, #bfbfbf);
  border: none;
  border-radius: 50rpx;
  padding: 28rpx 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-icon {
  font-size: 32rpx;
  color: #fff;
  margin-right: 10rpx;
}

.btn-text {
  font-size: 30rpx;
  color: #fff;
  font-weight: bold;
}
</style>
