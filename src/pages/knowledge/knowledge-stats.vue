<!-- 知识树统计页面 -->
<template>
  <view class="stats-page">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <view class="nav-left" @tap="goBack">
        <text class="icon">←</text>
      </view>
      <text class="nav-title">学习统计</text>
      <view class="nav-right"></view>
    </view>

    <!-- 统计内容 -->
    <scroll-view scroll-y class="stats-content">
      <!-- 总体统计卡片 -->
      <view class="overall-stats-card" :style="{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }">
        <view class="stats-grid">
          <view class="stat-item">
            <text class="stat-value">{{ store.totalProgress.completed }}</text>
            <text class="stat-label">已完成节点</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ store.totalProgress.total }}</text>
            <text class="stat-label">总节点数</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ todayStats.totalMinutes }}</text>
            <text class="stat-label">今日学习(分钟)</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ todayStats.sessionCount }}</text>
            <text class="stat-label">今日学习次数</text>
          </view>
        </view>
      </view>

      <!-- 各学科进度 -->
      <view class="subject-progress-section">
        <text class="section-title">学科进度</text>
        <view class="progress-list">
          <view 
            v-for="tree in store.knowledgeTrees" 
            :key="tree.id"
            class="progress-item"
          >
            <view class="progress-header">
              <view class="progress-icon" :style="{ background: tree.color + '20' }">
                <text>{{ tree.icon }}</text>
              </view>
              <view class="progress-info">
                <text class="progress-name">{{ tree.name }}</text>
                <text class="progress-detail">{{ tree.description }}</text>
              </view>
              <view class="progress-percent" :style="{ color: tree.color }">
                {{ getTreeProgress(tree.id).percent }}%
              </view>
            </view>
            <view class="progress-bar-bg">
              <view 
                class="progress-bar-fill" 
                :style="{ width: getTreeProgress(tree.id).percent + '%', background: tree.color }"
              ></view>
            </view>
            <text class="progress-count">
              {{ getTreeProgress(tree.id).completed }}/{{ getTreeProgress(tree.id).total }} 节点
            </text>
          </view>
        </view>
      </view>

      <!-- 本周学习趋势 -->
      <view class="week-trend-section">
        <text class="section-title">本周学习趋势</text>
        <view class="trend-chart">
          <view 
            v-for="(day, idx) in weekDays" 
            :key="idx"
            class="trend-day"
          >
            <view class="trend-bar-container">
              <view 
                class="trend-bar" 
                :style="{ 
                  height: getDayHeight(weekStats.dailyStats[day.date]) + 'rpx',
                  background: getDayHeight(weekStats.dailyStats[day.date]) > 0 ? '#667eea' : '#E5E7EB'
                }"
              ></view>
            </view>
            <text class="trend-label">{{ day.label }}</text>
            <text class="trend-value">{{ weekStats.dailyStats[day.date]?.minutes || 0 }}m</text>
          </view>
        </view>
      </view>

      <!-- 最近学习记录 -->
      <view class="recent-records-section">
        <text class="section-title">最近学习</text>
        <view class="record-list">
          <view 
            v-for="record in recentRecords" 
            :key="record.id"
            class="record-item"
          >
            <view class="record-icon" :class="record.type">
              <text v-if="record.type === 'complete'">🎉</text>
              <text v-else-if="record.type === 'practice'">📝</text>
              <text v-else>📖</text>
            </view>
            <view class="record-info">
              <text class="record-title">{{ record.nodeId }}</text>
              <text class="record-time">{{ formatTime(record.timestamp) }}</text>
            </view>
            <view v-if="record.type === 'complete'" class="record-badge">
              <text>完成</text>
            </view>
          </view>
          <view v-if="recentRecords.length === 0" class="empty-tip">
            <text>暂无学习记录，开始学习吧！</text>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useKnowledgeTreeStore } from '@/stores/knowledgeTreeStore.js'
import { getTodayLearningStats, getWeekLearningStats, getLearningHistory } from '@/services/knowledgeTreeService.js'

const store = useKnowledgeTreeStore()

const todayStats = ref({
  totalMinutes: 0,
  sessionCount: 0,
  completedNodes: 0
})

const weekStats = ref({
  dailyStats: {},
  totalMinutes: 0,
  totalSessions: 0,
  completedNodes: 0
})

const recentRecords = ref([])

const weekDays = [
  { date: '', label: '周日' },
  { date: '', label: '周一' },
  { date: '', label: '周二' },
  { date: '', label: '周三' },
  { date: '', label: '周四' },
  { date: '', label: '周五' },
  { date: '', label: '周六' }
]

onMounted(() => {
  store.init()
  loadStats()
})

const loadStats = () => {
  if (!store.currentBabyId) return
  
  // 今日统计
  todayStats.value = getTodayLearningStats(store.currentBabyId)
  
  // 本周统计
  weekStats.value = getWeekLearningStats(store.currentBabyId)
  
  // 设置周日期
  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - now.getDay())
  
  weekDays.forEach((day, idx) => {
    const d = new Date(weekStart)
    d.setDate(weekStart.getDate() + idx)
    day.date = d.toISOString().split('T')[0]
  })
  
  // 最近学习记录
  recentRecords.value = getLearningHistory(store.currentBabyId, 10)
}

const getTreeProgress = (treeId) => {
  return store.getTreeProgress(treeId)
}

const getDayHeight = (dayStats) => {
  if (!dayStats || dayStats.minutes === 0) return 20
  // 按比例计算高度，最高60rpx
  return Math.max(20, Math.min(60, dayStats.minutes * 2))
}

const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前'
  if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前'
  if (diff < 604800000) return Math.floor(diff / 86400000) + '天前'
  
  return date.toLocaleDateString()
}

const goBack = () => {
  uni.navigateBack()
}
</script>

<style scoped>
.stats-page {
  min-height: 100vh;
  background: #F8FAFC;
  display: flex;
  flex-direction: column;
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  padding: 0 32rpx;
  background: #FFFFFF;
  border-bottom: 1rpx solid #E5E7EB;
}

.nav-left, .nav-right {
  width: 80rpx;
}

.icon {
  font-size: 40rpx;
}

.nav-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #1F2937;
}

.stats-content {
  flex: 1;
  padding: 24rpx 32rpx;
}

/* 总体统计卡片 */
.overall-stats-card {
  padding: 32rpx;
  border-radius: 24rpx;
  color: #fff;
  margin-bottom: 32rpx;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 32rpx;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 48rpx;
  font-weight: bold;
  display: block;
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 24rpx;
  opacity: 0.9;
}

/* 学科进度 */
.subject-progress-section {
  margin-bottom: 32rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1F2937;
  margin-bottom: 20rpx;
  display: block;
}

.progress-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.progress-item {
  background: #fff;
  padding: 24rpx;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04);
}

.progress-header {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 16rpx;
}

.progress-icon {
  width: 64rpx;
  height: 64rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
}

.progress-info {
  flex: 1;
}

.progress-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #1F2937;
  display: block;
  margin-bottom: 4rpx;
}

.progress-detail {
  font-size: 22rpx;
  color: #9CA3AF;
}

.progress-percent {
  font-size: 32rpx;
  font-weight: bold;
}

.progress-bar-bg {
  height: 12rpx;
  background: #E5E7EB;
  border-radius: 6rpx;
  overflow: hidden;
  margin-bottom: 8rpx;
}

.progress-bar-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.progress-count {
  font-size: 22rpx;
  color: #9CA3AF;
}

/* 本周趋势 */
.week-trend-section {
  margin-bottom: 32rpx;
}

.trend-chart {
  background: #fff;
  padding: 32rpx;
  border-radius: 16rpx;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04);
}

.trend-day {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.trend-bar-container {
  height: 60rpx;
  display: flex;
  align-items: flex-end;
}

.trend-bar {
  width: 32rpx;
  border-radius: 4rpx 4rpx 0 0;
  min-height: 20rpx;
  transition: height 0.3s ease;
}

.trend-label {
  font-size: 20rpx;
  color: #9CA3AF;
}

.trend-value {
  font-size: 18rpx;
  color: #6B7280;
}

/* 最近学习 */
.recent-records-section {
  padding-bottom: 40rpx;
}

.record-list {
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04);
}

.record-item {
  display: flex;
  align-items: center;
  padding: 24rpx;
  border-bottom: 1rpx solid #F3F4F6;
}

.record-item:last-child {
  border-bottom: none;
}

.record-icon {
  width: 64rpx;
  height: 64rpx;
  border-radius: 16rpx;
  background: #F3F4F6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
}

.record-icon.complete {
  background: #F0FDF4;
}

.record-info {
  flex: 1;
  margin-left: 16rpx;
}

.record-title {
  font-size: 28rpx;
  color: #1F2937;
  display: block;
  margin-bottom: 4rpx;
}

.record-time {
  font-size: 22rpx;
  color: #9CA3AF;
}

.record-badge {
  background: #52c41a;
  color: #fff;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  font-size: 20rpx;
}

.empty-tip {
  padding: 48rpx;
  text-align: center;
  color: #9CA3AF;
  font-size: 26rpx;
}
</style>
