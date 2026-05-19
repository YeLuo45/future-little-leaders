<template>
  <view class="hall-detail-page">
    <!-- 顶部标题 -->
    <view class="header">
      <view class="hall-badge">
        <text class="hall-icon">{{ HALL_TYPE_INFO[hall?.type]?.icon || '🏛️' }}</text>
        <text class="hall-name">{{ hall?.name || '展厅' }}</text>
      </view>
      <text class="hall-desc">{{ hall?.description }}</text>
      
      <!-- 进度 -->
      <view class="progress-info">
        <text class="progress-label">进度: {{ progress.completed }}/{{ progress.total }}</text>
        <view class="progress-bar">
          <view class="progress-fill" :style="{ width: progress.percentage + '%' }"></view>
        </view>
        <text class="progress-percent">{{ progress.percentage }}%</text>
      </view>
    </view>

    <!-- 展品列表 -->
    <view class="exhibits-section">
      <text class="section-title">展厅展品</text>
      
      <view class="exhibits-list">
        <view 
          v-for="exhibit in hallExhibits" 
          :key="exhibit.id" 
          class="exhibit-card"
          :class="{ completed: getExhibitProgress(exhibit.id).completed }"
          @click="viewExhibit(exhibit)"
        >
          <view class="exhibit-icon-wrap">
            <text class="exhibit-icon">{{ EXHIBIT_TYPE_INFO[exhibit.type]?.icon || '🔬' }}</text>
            <view v-if="getExhibitProgress(exhibit.id).completed" class="stamp-badge">
              <text class="stamp-count">{{ getExhibitProgress(exhibit.id).stamps }}</text>
            </view>
          </view>
          
          <view class="exhibit-content">
            <text class="exhibit-name">{{ exhibit.name }}</text>
            <text class="exhibit-desc">{{ exhibit.description }}</text>
            
            <view class="exhibit-meta">
              <view class="exhibit-type-tag" :style="{ background: EXHIBIT_TYPE_INFO[exhibit.type]?.color + '20', color: EXHIBIT_TYPE_INFO[exhibit.type]?.color }">
                {{ EXHIBIT_TYPE_INFO[exhibit.type]?.label }}
              </view>
              <text class="exhibit-points">+{{ exhibit.points }}分</text>
              
              <view v-if="getExhibitProgress(exhibit.id).completed" class="completed-tag">
                ✓ 已完成
              </view>
            </view>
          </view>
          
          <view class="exhibit-arrow">›</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { useScienceMuseumStore, HALL_TYPE_INFO, EXHIBIT_TYPE_INFO } from '@/stores/scienceMuseumStore.js'

export default {
  data() {
    return {
      HALL_TYPE_INFO,
      EXHIBIT_TYPE_INFO,
      hallId: ''
    }
  },
  computed: {
    smStore() {
      return useScienceMuseumStore()
    },
    hall() {
      return this.smStore.currentHall
    },
    hallExhibits() {
      return this.smStore.currentHallExhibits
    },
    progress() {
      if (!this.hallId) return { completed: 0, total: 0, percentage: 0 }
      return this.smStore.getHallProgress(this.hallId)
    }
  },
  onLoad(options) {
    if (options.hallId) {
      this.hallId = options.hallId
      this.smStore.selectHall(options.hallId)
    }
  },
  methods: {
    getExhibitProgress(exhibitId) {
      return this.smStore.getExhibitProgress(exhibitId)
    },
    viewExhibit(exhibit) {
      this.smStore.selectExhibit(exhibit.id)
      uni.navigateTo({ url: `/pages/science-museum/exhibit-detail?exhibitId=${exhibit.id}` })
    }
  }
}
</script>

<style scoped>
.hall-detail-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #e8f4f8 0%, #d4e8f2 100%);
  padding: 20rpx;
}

.header {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.hall-badge {
  display: flex;
  align-items: center;
  margin-bottom: 12rpx;
}

.hall-icon {
  font-size: 48rpx;
  margin-right: 16rpx;
}

.hall-name {
  font-size: 36rpx;
  font-weight: bold;
  color: #1a5f7a;
}

.hall-desc {
  font-size: 26rpx;
  color: #666;
  display: block;
  line-height: 1.4;
}

.progress-info {
  display: flex;
  align-items: center;
  margin-top: 20rpx;
  padding-top: 20rpx;
  border-top: 1px solid rgba(26, 95, 122, 0.1);
}

.progress-label {
  font-size: 24rpx;
  color: #1a5f7a;
  margin-right: 16rpx;
}

.progress-bar {
  flex: 1;
  height: 12rpx;
  background: rgba(26, 95, 122, 0.2);
  border-radius: 6rpx;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #1890FF, #52C41A);
  border-radius: 6rpx;
  transition: width 0.3s;
}

.progress-percent {
  font-size: 24rpx;
  color: #1a5f7a;
  font-weight: bold;
  margin-left: 16rpx;
}

.exhibits-section {
  padding: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #1a5f7a;
  margin-bottom: 20rpx;
  display: block;
}

.exhibits-list {
  display: flex;
  flex-direction: column;
}

.exhibit-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
}

.exhibit-card.completed {
  background: linear-gradient(135deg, rgba(82, 196, 26, 0.1) 0%, rgba(255, 255, 255, 0.95) 100%);
}

.exhibit-icon-wrap {
  position: relative;
  width: 90rpx;
  height: 90rpx;
  background: linear-gradient(135deg, #e8f4f8 0%, #d4e8f2 100%);
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.exhibit-icon {
  font-size: 44rpx;
}

.stamp-badge {
  position: absolute;
  top: -8rpx;
  right: -8rpx;
  width: 36rpx;
  height: 36rpx;
  background: #F5222D;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stamp-count {
  font-size: 20rpx;
  color: #fff;
  font-weight: bold;
}

.exhibit-content {
  flex: 1;
  margin-left: 20rpx;
}

.exhibit-name {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  display: block;
}

.exhibit-desc {
  font-size: 24rpx;
  color: #666;
  display: block;
  margin-top: 6rpx;
  line-height: 1.3;
}

.exhibit-meta {
  display: flex;
  align-items: center;
  margin-top: 12rpx;
  flex-wrap: wrap;
}

.exhibit-type-tag {
  font-size: 20rpx;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  margin-right: 12rpx;
}

.exhibit-points {
  font-size: 22rpx;
  color: #b8860b;
  font-weight: bold;
  margin-right: 12rpx;
}

.completed-tag {
  font-size: 20rpx;
  color: #52C41A;
  font-weight: bold;
}

.exhibit-arrow {
  font-size: 44rpx;
  color: #ccc;
  margin-left: 12rpx;
}
</style>
