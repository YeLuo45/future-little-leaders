<template>
  <view class="hall-list-page">
    <!-- 顶部标题 -->
    <view class="header">
      <text class="title">博物馆展厅</text>
      <text class="subtitle">选择你感兴趣的展厅开始探索</text>
    </view>

    <!-- 展厅列表 -->
    <view class="halls-list">
      <view 
        v-for="hall in halls" 
        :key="hall.id" 
        class="hall-card"
        :class="{ locked: !isHallUnlocked(hall.id) }"
        @click="selectHall(hall)"
      >
        <view class="hall-banner">
          <text class="hall-icon">{{ HALL_TYPE_INFO[hall.type]?.icon || '🏛️' }}</text>
          <view v-if="!isHallUnlocked(hall.id)" class="lock-overlay">
            <text class="lock-icon">🔒</text>
          </view>
        </view>
        
        <view class="hall-content">
          <text class="hall-name">{{ hall.name }}</text>
          <text class="hall-desc">{{ hall.description }}</text>
          
          <view class="hall-meta">
            <view class="hall-progress">
              <text class="progress-text">进度: {{ getHallProgress(hall.id).completed }}/{{ getHallProgress(hall.id).total }}</text>
              <view class="progress-bar">
                <view class="progress-fill" :style="{ width: getHallProgress(hall.id).percentage + '%' }"></view>
              </view>
            </view>
            
            <view v-if="!isHallUnlocked(hall.id)" class="unlock-hint">
              <text class="hint-icon">🔓</text>
              <text class="hint-text">{{ hall.unlockCondition }}</text>
            </view>
          </view>
        </view>
        
        <view class="hall-arrow">›</view>
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
    getHallProgress(hallId) {
      return this.smStore.getHallProgress(hallId)
    },
    selectHall(hall) {
      if (!this.isHallUnlocked(hall.id)) {
        uni.showToast({ title: hall.unlockCondition || '展厅未解锁', icon: 'none' })
        return
      }
      this.smStore.selectHall(hall.id)
      uni.navigateTo({ url: `/pages/science-museum/hall-detail?hallId=${hall.id}` })
    }
  }
}
</script>

<style scoped>
.hall-list-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #e8f4f8 0%, #d4e8f2 100%);
  padding: 20rpx;
}

.header {
  text-align: center;
  padding: 30rpx 0;
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

.halls-list {
  padding: 20rpx;
}

.hall-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
  position: relative;
}

.hall-card.locked {
  opacity: 0.75;
}

.hall-banner {
  width: 120rpx;
  height: 120rpx;
  background: linear-gradient(135deg, #e8f4f8 0%, #d4e8f2 100%);
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.hall-icon {
  font-size: 60rpx;
}

.lock-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lock-icon {
  font-size: 40rpx;
}

.hall-content {
  flex: 1;
  margin-left: 24rpx;
}

.hall-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
}

.hall-desc {
  font-size: 24rpx;
  color: #666;
  display: block;
  margin-top: 8rpx;
  line-height: 1.3;
}

.hall-meta {
  margin-top: 12rpx;
}

.hall-progress {
  display: flex;
  align-items: center;
}

.progress-text {
  font-size: 22rpx;
  color: #1a5f7a;
  margin-right: 12rpx;
}

.progress-bar {
  flex: 1;
  height: 8rpx;
  background: rgba(26, 95, 122, 0.2);
  border-radius: 4rpx;
  max-width: 200rpx;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #1890FF, #52C41A);
  border-radius: 4rpx;
  transition: width 0.3s;
}

.unlock-hint {
  display: flex;
  align-items: center;
  margin-top: 8rpx;
}

.hint-icon {
  font-size: 24rpx;
  margin-right: 6rpx;
}

.hint-text {
  font-size: 22rpx;
  color: #999;
}

.hall-arrow {
  font-size: 48rpx;
  color: #ccc;
  margin-left: 16rpx;
}
</style>
