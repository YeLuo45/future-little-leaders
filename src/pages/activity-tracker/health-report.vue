<template>
  <view class="health-report-page">
    <!-- 页面标题 -->
    <view class="page-header">
      <text class="page-title">健康报告</text>
      <view class="header-actions">
        <button class="btn-generate" @click="handleGenerateReport">生成报告</button>
      </view>
    </view>

    <!-- 本周健康评分 -->
    <view class="score-card" v-if="latestReport">
      <view class="score-header">
        <text class="score-date">{{ latestReport.weekStart }} ~ {{ latestReport.weekEnd }}</text>
        <text class="score-label">周健康评分</text>
      </view>
      <view class="score-body">
        <view class="score-circle">
          <text class="score-value">{{ latestReport.score }}</text>
          <text class="score-unit">分</text>
        </view>
        <view class="score-desc">
          <text class="score-level" :class="getScoreLevel(latestReport.score)">
            {{ getScoreText(latestReport.score) }}
          </text>
          <text class="score-hint">{{ getScoreHint(latestReport.score) }}</text>
        </view>
      </view>
    </view>

    <!-- 无报告时 -->
    <view v-else class="no-report-card">
      <text class="no-report-icon">📊</text>
      <text class="no-report-text">还没有健康报告</text>
      <text class="no-report-hint">点击"生成报告"按钮创建本周健康报告</text>
    </view>

    <!-- 本周数据统计 -->
    <view class="section" v-if="latestReport">
      <view class="section-header">
        <text class="section-title">📈 本周数据</text>
      </view>
      <view class="stats-grid">
        <view class="stat-card">
          <text class="stat-icon">⏱️</text>
          <text class="stat-value">{{ latestReport.stats.totalDuration }}</text>
          <text class="stat-label">总时长(分钟)</text>
        </view>
        <view class="stat-card">
          <text class="stat-icon">🔥</text>
          <text class="stat-value">{{ latestReport.stats.totalCalories }}</text>
          <text class="stat-label">消耗卡路里</text>
        </view>
        <view class="stat-card">
          <text class="stat-icon">🏃</text>
          <text class="stat-value">{{ latestReport.stats.totalDistance.toFixed(1) }}</text>
          <text class="stat-label">总公里数</text>
        </view>
        <view class="stat-card">
          <text class="stat-icon">📅</text>
          <text class="stat-value">{{ latestReport.stats.activeDays }}</text>
          <text class="stat-label">运动天数</text>
        </view>
      </view>
      
      <view class="stats-extra">
        <view class="extra-item">
          <text class="extra-label">日均时长</text>
          <text class="extra-value">{{ latestReport.stats.avgDailyDuration }}分钟</text>
        </view>
        <view class="extra-item">
          <text class="extra-label">日均卡路里</text>
          <text class="extra-value">{{ latestReport.stats.avgDailyCalories }}千卡</text>
        </view>
      </view>
    </view>

    <!-- 目标完成情况 -->
    <view class="section" v-if="latestReport">
      <view class="section-header">
        <text class="section-title">🎯 目标完成</text>
      </view>
      <view class="goals-list">
        <view class="goal-item">
          <view class="goal-info">
            <text class="goal-name">每日运动时长</text>
            <text class="goal-target">目标: {{ latestReport.goals.daily.duration }}分钟/天</text>
          </view>
          <view class="goal-progress">
            <view class="progress-bar">
              <view 
                class="progress-fill" 
                :style="{ width: latestReport.goals.completion.dailyDuration + '%' }"
              ></view>
            </view>
            <text class="progress-text">{{ latestReport.goals.completion.dailyDuration }}%</text>
          </view>
        </view>
        <view class="goal-item">
          <view class="goal-info">
            <text class="goal-name">每周运动天数</text>
            <text class="goal-target">目标: {{ latestReport.goals.weekly.days }}天/周</text>
          </view>
          <view class="goal-progress">
            <view class="progress-bar">
              <view 
                class="progress-fill" 
                :style="{ width: latestReport.goals.completion.weeklyDays + '%' }"
              ></view>
            </view>
            <text class="progress-text">{{ latestReport.goals.completion.weeklyDays }}%</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 运动类型分布 -->
    <view class="section" v-if="latestReport && Object.keys(latestReport.activityDistribution).length > 0">
      <view class="section-header">
        <text class="section-title">🏃 运动类型分布</text>
      </view>
      <view class="distribution-list">
        <view 
          v-for="(item, name) in latestReport.activityDistribution" 
          :key="name"
          class="distribution-item"
        >
          <view class="dist-icon">{{ item.icon }}</view>
          <view class="dist-content">
            <text class="dist-name">{{ name }}</text>
            <text class="dist-count">{{ item.count }}次 · {{ item.duration }}分钟</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 连续打卡 -->
    <view class="section" v-if="latestReport">
      <view class="section-header">
        <text class="section-title">🔥 连续打卡</text>
      </view>
      <view class="streak-display">
        <view class="streak-main">
          <text class="streak-number">{{ latestReport.streak.currentStreak }}</text>
          <text class="streak-unit">天</text>
        </view>
        <view class="streak-info">
          <text class="streak-label">当前连续</text>
          <text class="streak-best">最长: {{ latestReport.streak.longestStreak }}天</text>
        </view>
      </view>
    </view>

    <!-- 健康建议 -->
    <view class="section" v-if="latestReport && latestReport.suggestions.length > 0">
      <view class="section-header">
        <text class="section-title">💡 健康建议</text>
      </view>
      <view class="suggestions-list">
        <view 
          v-for="(suggestion, index) in latestReport.suggestions" 
          :key="index"
          class="suggestion-item"
        >
          <text class="suggestion-icon">•</text>
          <text class="suggestion-text">{{ suggestion }}</text>
        </view>
      </view>
    </view>

    <!-- 历史报告 -->
    <view class="section" v-if="historicalReports.length > 0">
      <view class="section-header">
        <text class="section-title">📋 历史报告</text>
      </view>
      <view class="history-list">
        <view 
          v-for="report in historicalReports" 
          :key="report.id"
          class="history-item"
          @click="viewReport(report)"
        >
          <view class="history-date">
            <text class="history-week">{{ report.weekStart }} ~ {{ report.weekEnd }}</text>
            <text class="history-score" :class="getScoreLevel(report.score)">{{ report.score }}分</text>
          </view>
          <text class="history-arrow">›</text>
        </view>
      </view>
    </view>

    <!-- 数据同步入口 -->
    <view class="section sync-section">
      <view class="section-header">
        <text class="section-title">📱 数据同步</text>
      </view>
      <view class="sync-buttons">
        <button class="sync-btn" @click="handleSyncWechat">
          <text class="sync-icon">💚</text>
          <text class="sync-text">微信运动</text>
        </button>
        <button class="sync-btn" @click="handleImportBand">
          <text class="sync-icon">⌚</text>
          <text class="sync-text">手环导入</text>
        </button>
      </view>
    </view>

    <!-- 加载状态 -->
    <view v-if="isGenerating" class="loading-overlay">
      <view class="loading-content">
        <text class="loading-icon">📊</text>
        <text class="loading-text">正在生成健康报告...</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useActivityTrackerStore } from '@/stores/activityTrackerStore.js'

const store = useActivityTrackerStore()

// 加载状态
const isGenerating = ref(false)

// 最新报告
const latestReport = computed(() => {
  return store.healthReports.length > 0 ? store.healthReports[0] : null
})

// 历史报告
const historicalReports = computed(() => {
  return store.healthReports.slice(1)
})

// 获取评分等级
const getScoreLevel = (score) => {
  if (score >= 90) return 'excellent'
  if (score >= 75) return 'good'
  if (score >= 60) return 'fair'
  return 'poor'
}

// 获取评分文字
const getScoreText = (score) => {
  if (score >= 90) return '优秀'
  if (score >= 75) return '良好'
  if (score >= 60) return '一般'
  return '需努力'
}

// 获取评分提示
const getScoreHint = (score) => {
  if (score >= 90) return '太棒了！继续保持！'
  if (score >= 75) return '不错！再接再厉！'
  if (score >= 60) return '有进步空间，加油！'
  return '需要加把劲哦！'
}

// 生成报告
const handleGenerateReport = async () => {
  isGenerating.value = true
  
  setTimeout(() => {
    store.generateHealthReport()
    isGenerating.value = false
    uni.showToast({ title: '报告生成成功!', icon: 'success' })
  }, 1500)
}

// 查看报告
const viewReport = (report) => {
  store.currentReport = report
  // 可以导航到报告详情页
  console.log('View report:', report.id)
}

// 同步微信运动
const handleSyncWechat = async () => {
  uni.showLoading({ title: '同步中...' })
  
  try {
    const result = await store.syncWechatSports()
    uni.hideLoading()
    
    if (result.success) {
      uni.showToast({ 
        title: `同步成功！今日${result.steps}步`, 
        icon: 'success' 
      })
    }
  } catch (e) {
    uni.hideLoading()
    uni.showToast({ title: '同步失败', icon: 'none' })
  }
}

// 导入手环数据
const handleImportBand = () => {
  uni.showModal({
    title: '手环数据导入',
    content: '请确保手环已连接并开启数据同步',
    confirmText: '开始导入',
    success: (res) => {
      if (res.confirm) {
        // 模拟手环数据
        const mockBandData = {
          steps: 8500,
          heartRate: 72,
          sleepHours: 8
        }
        
        const success = store.importBandData(mockBandData)
        if (success) {
          uni.showToast({ title: '导入成功!', icon: 'success' })
        }
      }
    }
  })
}

// 初始化
store.init()
</script>

<style scoped>
.health-report-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 40rpx;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx 32rpx 24rpx;
  background-color: #fff;
}

.page-title {
  font-size: 40rpx;
  font-weight: 600;
  color: #333;
}

.btn-generate {
  padding: 16rpx 32rpx;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  border-radius: 32rpx;
  font-size: 28rpx;
  border: none;
}

/* 评分卡片 */
.score-card {
  margin: 24rpx 32rpx;
  padding: 32rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 24rpx;
  color: #fff;
}

.score-header {
  text-align: center;
  margin-bottom: 24rpx;
}

.score-date {
  font-size: 26rpx;
  opacity: 0.8;
  display: block;
  margin-bottom: 4rpx;
}

.score-label {
  font-size: 28rpx;
  opacity: 0.9;
}

.score-body {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 40rpx;
}

.score-circle {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.score-value {
  font-size: 64rpx;
  font-weight: 700;
}

.score-unit {
  font-size: 28rpx;
  opacity: 0.8;
}

.score-desc {
  flex: 1;
}

.score-level {
  font-size: 48rpx;
  font-weight: 700;
  display: block;
  margin-bottom: 8rpx;
}

.score-level.excellent { color: #FFD700; }
.score-level.good { color: #98FB98; }
.score-level.fair { color: #FFA500; }
.score-level.poor { color: #FF6B6B; }

.score-hint {
  font-size: 26rpx;
  opacity: 0.9;
}

/* 无报告卡片 */
.no-report-card {
  margin: 24rpx 32rpx;
  padding: 80rpx 40rpx;
  background: #fff;
  border-radius: 24rpx;
  text-align: center;
}

.no-report-icon {
  font-size: 80rpx;
  display: block;
  margin-bottom: 16rpx;
}

.no-report-text {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.no-report-hint {
  font-size: 26rpx;
  color: #999;
}

/* 区块 */
.section {
  margin: 24rpx 32rpx;
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
}

.section-header {
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
}

/* 统计数据网格 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16rpx;
  margin-bottom: 20rpx;
}

.stat-card {
  background: #f8f8f8;
  border-radius: 12rpx;
  padding: 20rpx 0;
  text-align: center;
}

.stat-icon {
  font-size: 32rpx;
  display: block;
  margin-bottom: 8rpx;
}

.stat-value {
  font-size: 32rpx;
  font-weight: 700;
  color: #667eea;
  display: block;
}

.stat-label {
  font-size: 22rpx;
  color: #999;
}

.stats-extra {
  display: flex;
  justify-content: space-around;
  padding-top: 16rpx;
  border-top: 1px solid #eee;
}

.extra-item {
  text-align: center;
}

.extra-label {
  font-size: 24rpx;
  color: #999;
  display: block;
  margin-bottom: 4rpx;
}

.extra-value {
  font-size: 28rpx;
  font-weight: 600;
  color: #666;
}

/* 目标完成 */
.goals-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.goal-item {
  padding: 16rpx 0;
}

.goal-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12rpx;
}

.goal-name {
  font-size: 28rpx;
  color: #333;
}

.goal-target {
  font-size: 24rpx;
  color: #999;
}

.goal-progress {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.progress-bar {
  flex: 1;
  height: 16rpx;
  background: #eee;
  border-radius: 8rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 8rpx;
  transition: width 0.3s;
}

.progress-text {
  font-size: 24rpx;
  color: #667eea;
  font-weight: 600;
  min-width: 80rpx;
  text-align: right;
}

/* 运动类型分布 */
.distribution-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.distribution-item {
  display: flex;
  align-items: center;
  padding: 16rpx;
  background: #f8f8f8;
  border-radius: 12rpx;
}

.dist-icon {
  font-size: 40rpx;
  margin-right: 16rpx;
}

.dist-content {
  flex: 1;
}

.dist-name {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
  display: block;
  margin-bottom: 4rpx;
}

.dist-count {
  font-size: 24rpx;
  color: #999;
}

/* 连续打卡 */
.streak-display {
  display: flex;
  align-items: center;
  padding: 24rpx;
  background: linear-gradient(135deg, #FF6B6B, #FF8E53);
  border-radius: 16rpx;
  color: #fff;
}

.streak-main {
  display: flex;
  align-items: baseline;
  margin-right: 32rpx;
}

.streak-number {
  font-size: 80rpx;
  font-weight: 700;
}

.streak-unit {
  font-size: 32rpx;
  margin-left: 8rpx;
}

.streak-info {
  flex: 1;
}

.streak-label {
  font-size: 28rpx;
  display: block;
  margin-bottom: 4rpx;
  opacity: 0.9;
}

.streak-best {
  font-size: 24rpx;
  opacity: 0.8;
}

/* 健康建议 */
.suggestions-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.suggestion-item {
  display: flex;
  align-items: flex-start;
  padding: 12rpx 0;
}

.suggestion-icon {
  color: #667eea;
  font-size: 32rpx;
  margin-right: 12rpx;
  line-height: 1.4;
}

.suggestion-text {
  flex: 1;
  font-size: 28rpx;
  color: #666;
  line-height: 1.5;
}

/* 历史报告 */
.history-list {
  display: flex;
  flex-direction: column;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1px solid #f0f0f0;
}

.history-item:last-child {
  border-bottom: none;
}

.history-date {
  flex: 1;
}

.history-week {
  font-size: 26rpx;
  color: #333;
  display: block;
  margin-bottom: 4rpx;
}

.history-score {
  font-size: 28rpx;
  font-weight: 600;
}

.history-score.excellent { color: #FFD700; }
.history-score.good { color: #52C41A; }
.history-score.fair { color: #FFA500; }
.history-score.poor { color: #FF6B6B; }

.history-arrow {
  font-size: 40rpx;
  color: #ccc;
}

/* 数据同步 */
.sync-section {
  background: #fff;
}

.sync-buttons {
  display: flex;
  gap: 24rpx;
}

.sync-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32rpx 0;
  background: #f8f8f8;
  border-radius: 16rpx;
  border: none;
}

.sync-icon {
  font-size: 48rpx;
  margin-bottom: 12rpx;
}

.sync-text {
  font-size: 26rpx;
  color: #666;
}

/* 加载状态 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.loading-content {
  background: #fff;
  padding: 48rpx 80rpx;
  border-radius: 24rpx;
  text-align: center;
}

.loading-icon {
  font-size: 64rpx;
  display: block;
  margin-bottom: 16rpx;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.loading-text {
  font-size: 28rpx;
  color: #666;
}
</style>
