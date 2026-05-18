<template>
  <view class="sleep-report-page">
    <!-- 页面标题 -->
    <view class="page-header">
      <text class="page-title">睡眠报告</text>
      <view class="header-actions">
        <button class="btn-export" @click="handleExport">导出</button>
      </view>
    </view>

    <!-- 周期切换 -->
    <view class="period-tabs">
      <view 
        class="tab-item" 
        :class="{ active: period === 'week' }"
        @click="changePeriod('week')"
      >
        本周
      </view>
      <view 
        class="tab-item" 
        :class="{ active: period === 'month' }"
        @click="changePeriod('month')"
      >
        本月
      </view>
    </view>

    <!-- 睡眠概览 -->
    <view class="overview-card" v-if="report">
      <view class="overview-header">
        <text class="overview-title">{{ period === 'week' ? '本周' : '本月' }}睡眠概览</text>
        <text class="overview-nights">共 {{ report.totalNights }} 晚</text>
      </view>
      <view class="overview-stats">
        <view class="stat-circle">
          <view class="circle-inner">
            <text class="stat-value">{{ report.averageDuration }}</text>
            <text class="stat-unit">小时</text>
          </view>
          <text class="stat-label">平均时长</text>
        </view>
        <view class="stat-circle quality">
          <view class="circle-inner">
            <text class="stat-value">{{ report.averageQuality }}</text>
            <text class="stat-unit">分</text>
          </view>
          <text class="stat-label">平均质量</text>
        </view>
      </view>
    </view>

    <!-- 最佳夜晚 -->
    <view class="best-night-card" v-if="report && report.bestNight">
      <view class="best-badge">
        <text class="badge-icon">🏆</text>
        <text class="badge-text">最佳夜晚</text>
      </view>
      <view class="best-info">
        <text class="best-date">{{ formatDate(report.bestNight.date) }}</text>
        <view class="best-stats">
          <text class="best-duration">{{ store.formatDuration(report.bestNight.duration) }}</text>
          <text class="best-quality">质量 {{ report.bestNight.qualityScore }}分</text>
        </view>
      </view>
    </view>

    <!-- 睡眠趋势图 -->
    <view class="trend-card">
      <text class="card-title">睡眠趋势</text>
      <view class="trend-chart" v-if="report && report.trends && report.trends.length > 0">
        <view class="chart-placeholder">
          <view 
            class="bar" 
            v-for="(item, index) in report.trends" 
            :key="index"
            :style="{ height: getBarHeight(item.duration) + 'rpx' }"
          >
            <text class="bar-value">{{ item.duration }}h</text>
          </view>
        </view>
        <view class="chart-labels">
          <text 
            class="chart-label" 
            v-for="(item, index) in report.trends" 
            :key="index"
          >
            {{ formatShortDate(item.date) }}
          </text>
        </view>
      </view>
      <view class="empty-trend" v-else>
        <text class="empty-icon">📈</text>
        <text class="empty-text">暂无趋势数据</text>
      </view>
    </view>

    <!-- 睡眠建议 -->
    <view class="suggestions-card">
      <text class="card-title">睡眠建议</text>
      <view class="suggestion-list" v-if="report && report.suggestions">
        <view 
          class="suggestion-item" 
          v-for="(item, index) in report.suggestions" 
          :key="index"
        >
          <text class="suggestion-icon">{{ getSuggestionIcon(item.type) }}</text>
          <text class="suggestion-text">{{ item.text }}</text>
        </view>
      </view>
    </view>

    <!-- 历史记录 -->
    <view class="history-section">
      <text class="section-title">历史记录</text>
      <view class="history-list" v-if="currentLogs.length > 0">
        <view 
          class="history-item" 
          v-for="log in currentLogs" 
          :key="log.id"
        >
          <view class="history-date">
            <text class="date-text">{{ formatDate(log.date) }}</text>
            <text class="weekday">{{ getWeekday(log.date) }}</text>
          </view>
          <view class="history-stats">
            <view class="history-stat">
              <text class="history-icon">😴</text>
              <text class="history-value">{{ store.formatDuration(log.duration) }}</text>
            </view>
            <view class="history-stat">
              <text class="history-icon">⭐</text>
              <text class="history-value">{{ log.qualityScore }}分</text>
            </view>
          </view>
          <view class="history-actions">
            <text 
              class="delete-btn" 
              @click="handleDelete(log.id)"
            >
              删除
            </text>
          </view>
        </view>
      </view>
      <view class="empty-history" v-else>
        <text class="empty-icon">📋</text>
        <text class="empty-text">暂无历史记录</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useWellnessStore } from '@/stores/wellnessStore.js'

const store = useWellnessStore()

const period = ref('week')

const report = computed(() => store.currentReport)

const currentLogs = computed(() => {
  return period.value === 'week' ? store.weekSleepLogs : store.monthSleepLogs
})

const changePeriod = (p) => {
  period.value = p
  store.changeReportPeriod(p)
}

const getBarHeight = (duration) => {
  // 假设最大高度为 200rpx，对应 12 小时睡眠
  const maxHeight = 200
  const maxDuration = 12
  return Math.min(maxHeight, (duration / maxDuration) * maxHeight)
}

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

const formatShortDate = (dateStr) => {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}/${date.getDate()}`
}

const getWeekday = (dateStr) => {
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const date = new Date(dateStr)
  return weekdays[date.getDay()]
}

const getSuggestionIcon = (type) => {
  const icons = {
    duration: '⏰',
    quality: '😴',
    time: '🌙',
    praise: '🎉'
  }
  return icons[type] || '💡'
}

const handleExport = () => {
  const data = store.exportData()
  uni.showModal({
    title: '导出数据',
    content: `共 ${data.sleepLogs.length} 条睡眠记录`,
    showCancel: false
  })
}

const handleDelete = (id) => {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这条睡眠记录吗？',
    success: (res) => {
      if (res.confirm) {
        const success = store.removeSleepLog(id)
        if (success) {
          uni.showToast({ title: '删除成功', icon: 'success' })
        }
      }
    }
  })
}
</script>

<style scoped>
.sleep-report-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20rpx;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20rpx;
  margin-bottom: 20rpx;
}

.page-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #fff;
}

.btn-export {
  background: #fff;
  color: #667eea;
  border: none;
  border-radius: 30rpx;
  padding: 16rpx 32rpx;
  font-size: 28rpx;
  font-weight: bold;
}

.period-tabs {
  display: flex;
  background: #fff;
  border-radius: 20rpx;
  padding: 10rpx;
  margin-bottom: 20rpx;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 20rpx;
  border-radius: 15rpx;
  font-size: 28rpx;
  color: #666;
}

.tab-item.active {
  background: #667eea;
  color: #fff;
}

.overview-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.overview-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 30rpx;
}

.overview-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}

.overview-nights {
  font-size: 26rpx;
  color: #999;
}

.overview-stats {
  display: flex;
  justify-content: space-around;
}

.stat-circle {
  width: 200rpx;
  height: 200rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.stat-circle.quality {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.circle-inner {
  text-align: center;
}

.stat-value {
  font-size: 48rpx;
  font-weight: bold;
  color: #fff;
  display: block;
}

.stat-unit {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
}

.stat-label {
  font-size: 26rpx;
  color: #666;
  margin-top: 15rpx;
}

.best-night-card {
  background: linear-gradient(135deg, #ffd700 0%, #ffb347 100%);
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  display: flex;
  align-items: center;
}

.best-badge {
  display: flex;
  align-items: center;
  margin-right: 30rpx;
}

.badge-icon {
  font-size: 40rpx;
  margin-right: 10rpx;
}

.badge-text {
  font-size: 28rpx;
  font-weight: bold;
  color: #fff;
}

.best-info {
  flex: 1;
}

.best-date {
  font-size: 28rpx;
  color: #fff;
  display: block;
  margin-bottom: 10rpx;
}

.best-stats {
  display: flex;
}

.best-duration {
  font-size: 32rpx;
  font-weight: bold;
  color: #fff;
  margin-right: 20rpx;
}

.best-quality {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.9);
}

.trend-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.card-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 30rpx;
}

.trend-chart {
  height: 300rpx;
}

.chart-placeholder {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  height: 250rpx;
  padding: 0 20rpx;
}

.bar {
  width: 60rpx;
  background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
  border-radius: 10rpx 10rpx 0 0;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 10rpx;
}

.bar-value {
  font-size: 20rpx;
  color: #fff;
}

.chart-labels {
  display: flex;
  justify-content: space-around;
  padding: 0 10rpx;
  margin-top: 10rpx;
}

.chart-label {
  font-size: 22rpx;
  color: #999;
  width: 60rpx;
  text-align: center;
}

.empty-trend {
  text-align: center;
  padding: 60rpx;
}

.empty-icon {
  font-size: 60rpx;
  display: block;
  margin-bottom: 20rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}

.suggestions-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.suggestion-list {
  display: flex;
  flex-direction: column;
}

.suggestion-item {
  display: flex;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-icon {
  font-size: 36rpx;
  margin-right: 20rpx;
}

.suggestion-text {
  flex: 1;
  font-size: 28rpx;
  color: #666;
  line-height: 1.5;
}

.history-section {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 20rpx;
}

.history-list {
  display: flex;
  flex-direction: column;
}

.history-item {
  display: flex;
  align-items: center;
  padding: 25rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.history-item:last-child {
  border-bottom: none;
}

.history-date {
  width: 150rpx;
}

.date-text {
  font-size: 28rpx;
  color: #333;
  display: block;
  margin-bottom: 5rpx;
}

.weekday {
  font-size: 24rpx;
  color: #999;
}

.history-stats {
  flex: 1;
  display: flex;
}

.history-stat {
  display: flex;
  align-items: center;
  margin-right: 30rpx;
}

.history-icon {
  font-size: 28rpx;
  margin-right: 10rpx;
}

.history-value {
  font-size: 26rpx;
  color: #666;
}

.history-actions {
  width: 100rpx;
  text-align: right;
}

.delete-btn {
  font-size: 26rpx;
  color: #ff5722;
}

.empty-history {
  text-align: center;
  padding: 60rpx;
}

.empty-history .empty-icon {
  font-size: 60rpx;
  display: block;
  margin-bottom: 20rpx;
}

.empty-history .empty-text {
  font-size: 28rpx;
  color: #999;
}
</style>
