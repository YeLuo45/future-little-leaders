<!-- 学习进度组件 -->
<template>
  <view class="learning-progress">
    <view class="progress-header">
      <text class="progress-title">我的学习进度</text>
      <text class="progress-points">🎫 {{ stats.pointsEarned }} 积分</text>
    </view>

    <view class="progress-stats">
      <view class="stat-card">
        <view class="stat-icon" style="background: linear-gradient(135deg, #2563EB 0%, #3B82F6 100%);">
          <text>📖</text>
        </view>
        <view class="stat-info">
          <text class="stat-value">{{ stats.articlesRead }}</text>
          <text class="stat-label">已读文章</text>
        </view>
      </view>

      <view class="stat-card">
        <view class="stat-icon" style="background: linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%);">
          <text>🎬</text>
        </view>
        <view class="stat-info">
          <text class="stat-value">{{ stats.coursesCompleted }}</text>
          <text class="stat-label">完成课程</text>
        </view>
      </view>

      <view class="stat-card">
        <view class="stat-icon" style="background: linear-gradient(135deg, #10B981 0%, #34D399 100%);">
          <text>⏱</text>
        </view>
        <view class="stat-info">
          <text class="stat-value">{{ formatTime(stats.totalLearningTime) }}</text>
          <text class="stat-label">学习时长</text>
        </view>
      </view>
    </view>

    <!-- 进度环 -->
    <view class="progress-rings">
      <view class="ring-item">
        <view class="ring-chart">
          <svg viewBox="0 0 100 100" class="ring-svg">
            <circle cx="50" cy="50" r="40" class="ring-bg" />
            <circle
              cx="50"
              cy="50"
              r="40"
              class="ring-progress"
              :stroke-dasharray="`${articleProgress * 2.51} 251`"
            />
          </svg>
          <text class="ring-value">{{ articleProgress }}%</text>
        </view>
        <text class="ring-label">文章阅读</text>
      </view>

      <view class="ring-item">
        <view class="ring-chart">
          <svg viewBox="0 0 100 100" class="ring-svg">
            <circle cx="50" cy="50" r="40" class="ring-bg" />
            <circle
              cx="50"
              cy="50"
              r="40"
              class="ring-progress course"
              :stroke-dasharray="`${courseProgress * 2.51} 251`"
            />
          </svg>
          <text class="ring-value">{{ courseProgress }}%</text>
        </view>
        <text class="ring-label">课程完成</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  stats: {
    type: Object,
    default: () => ({
      totalLearningTime: 0,
      coursesCompleted: 0,
      articlesRead: 0,
      pointsEarned: 0
    })
  }
})

// Mock total counts for progress calculation
const totalArticles = 20
const totalCourses = 10

const articleProgress = computed(() => {
  return Math.min(100, Math.round((props.stats.articlesRead / totalArticles) * 100))
})

const courseProgress = computed(() => {
  return Math.min(100, Math.round((props.stats.coursesCompleted / totalCourses) * 100))
})

function formatTime(seconds) {
  if (seconds < 60) return `${seconds}s`
  const mins = Math.floor(seconds / 60)
  if (mins < 60) return `${mins}分钟`
  const hours = Math.floor(mins / 60)
  return `${hours}小时${mins % 60}分`
}
</script>

<style scoped>
.learning-progress {
  margin: 24rpx 32rpx;
  padding: 28rpx;
  background: #FFFFFF;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
}

.progress-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;
}

.progress-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #1F2937;
}

.progress-points {
  font-size: 24rpx;
  color: #F59E0B;
  font-weight: 500;
}

.progress-stats {
  display: flex;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.stat-card {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 16rpx;
  background: #F8FAFC;
  border-radius: 16rpx;
}

.stat-icon {
  width: 56rpx;
  height: 56rpx;
  border-radius: 14rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  flex-shrink: 0;
}

.stat-info {
  min-width: 0;
}

.stat-value {
  font-size: 28rpx;
  font-weight: 600;
  color: #1F2937;
  display: block;
  line-height: 1.2;
}

.stat-label {
  font-size: 18rpx;
  color: #6B7280;
  display: block;
}

.progress-rings {
  display: flex;
  justify-content: center;
  gap: 80rpx;
  padding-top: 16rpx;
  border-top: 1rpx solid #F3F4F6;
}

.ring-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.ring-chart {
  position: relative;
  width: 120rpx;
  height: 120rpx;
}

.ring-svg {
  transform: rotate(-90deg);
  width: 100%;
  height: 100%;
}

.ring-bg {
  fill: none;
  stroke: #E5E7EB;
  stroke-width: 8;
}

.ring-progress {
  fill: none;
  stroke: #2563EB;
  stroke-width: 8;
  stroke-linecap: round;
  transition: stroke-dasharray 0.6s ease;
}

.ring-progress.course {
  stroke: #F59E0B;
}

.ring-value {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 26rpx;
  font-weight: 600;
  color: #1F2937;
}

.ring-label {
  font-size: 22rpx;
  color: #6B7280;
}
</style>
