<!-- src/pages/growth-report/growth-report.vue -->
<template>
  <view class="page-container">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <view class="nav-left" @tap="goBack">
        <text class="back-icon">←</text>
      </view>
      <text class="nav-title">M2成长报告</text>
      <view class="nav-right">
        <text class="refresh-btn" @tap="onRefresh">刷新</text>
      </view>
    </view>

    <!-- 宝宝选择器 -->
    <view class="baby-selector" v-if="babies.length > 1">
      <picker :range="babies" range-key="name" @change="onBabyChange">
        <view class="picker-view">
          <text class="picker-label">当前宝宝：</text>
          <text class="picker-value">{{ currentBabyName }}</text>
          <text class="picker-arrow">▼</text>
        </view>
      </picker>
    </view>

    <scroll-view scroll-y class="report-content" @scrolltolower="loadMore">
      <!-- 加载状态 -->
      <view v-if="loading" class="loading-view">
        <text>加载中...</text>
      </view>

      <!-- 报告内容 -->
      <view v-else-if="report" class="report-wrapper">
        <!-- 宝宝信息卡片 -->
        <view class="baby-card">
          <view class="baby-info">
            <image 
              class="baby-avatar" 
              :src="report.baby.avatar || '/static/avatar.svg'" 
              mode="aspectFill"
            />
            <view class="baby-details">
              <text class="baby-name">{{ report.baby.babyName }}</text>
              <view class="baby-level">
                <text class="level-badge">Lv.{{ report.baby.level }}</text>
                <text class="exp-text">{{ report.baby.exp }}/{{ report.baby.expToNextLevel }} EXP</text>
              </view>
            </view>
          </view>
          <!-- 经验值进度条 -->
          <view class="exp-progress">
            <view class="exp-bar">
              <view class="exp-fill" :style="{ width: report.baby.levelProgress + '%' }"></view>
            </view>
          </view>
        </view>

        <!-- 核心数据 -->
        <view class="stats-section">
          <view class="section-title">成长数据</view>
          <view class="stats-grid">
            <view class="stat-item">
              <text class="stat-value">{{ report.stats.tasksCompleted }}</text>
              <text class="stat-label">完成任务</text>
            </view>
            <view class="stat-item highlight">
              <text class="stat-value">{{ report.stats.currentStreak }}</text>
              <text class="stat-label">连续打卡</text>
            </view>
            <view class="stat-item">
              <text class="stat-value">{{ report.stats.longestStreak }}</text>
              <text class="stat-label">最长连续</text>
            </view>
            <view class="stat-item highlight-orange">
              <text class="stat-value">{{ report.stats.totalPoints }}</text>
              <text class="stat-label">累计积分</text>
            </view>
          </view>
        </view>

        <!-- 本周进度 -->
        <view class="weekly-section">
          <view class="section-header">
            <text class="section-title">本周进度</text>
            <text class="section-date" v-if="report.weekRange">
              {{ report.weekRange.startDate }} ~ {{ report.weekRange.endDate }}
            </text>
          </view>
          <view class="weekly-progress">
            <view class="progress-circle">
              <view class="progress-ring">
                <text class="progress-value">{{ report.baby.weeklyProgress.tasksCompleted }}</text>
                <text class="progress-label">完成/7天</text>
              </view>
            </view>
            <view class="weekly-stats">
              <view class="weekly-stat-item">
                <text class="weekly-stat-label">本周任务</text>
                <text class="weekly-stat-value">{{ report.stats.weeklyTasks }}</text>
              </view>
              <view class="weekly-stat-item">
                <text class="weekly-stat-label">完成率</text>
                <text class="weekly-stat-value">{{ report.baby.weeklyProgress.completionRate.toFixed(0) }}%</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 雷达图区域 -->
        <view class="radar-section">
          <view class="section-title">能力雷达</view>
          <view class="radar-container">
            <view class="radar-legend">
              <view class="legend-item">
                <view class="legend-dot"></view>
                <text>任务完成</text>
              </view>
              <view class="legend-item">
                <view class="legend-dot"></view>
                <text>连续打卡</text>
              </view>
              <view class="legend-item">
                <view class="legend-dot"></view>
                <text>等级</text>
              </view>
              <view class="legend-item">
                <view class="legend-dot"></view>
                <text>标签使用</text>
              </view>
              <view class="legend-item">
                <view class="legend-dot"></view>
                <text>积分获取</text>
              </view>
            </view>
            <view class="radar-chart">
              <!-- 简易雷达图 -->
              <view class="radar-bg">
                <view v-for="i in 5" :key="i" class="radar-circle" :class="'radar-circle-' + i"></view>
                <view class="radar-center">
                  <text class="radar-score">{{ calculateOverallScore() }}</text>
                  <text class="radar-score-label">综合评分</text>
                </view>
              </view>
              <view class="radar-data" :style="radarStyle">
                <view class="radar-point" v-for="(item, index) in radarPoints" :key="index" 
                  :style="{ left: item.x + 'px', top: item.y + 'px' }">
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- 常用标签 -->
        <view class="tags-section" v-if="report.baby.topTags && report.baby.topTags.length > 0">
          <view class="section-title">常用标签</view>
          <view class="tags-list">
            <view 
              v-for="(tag, index) in report.baby.topTags" 
              :key="index"
              class="tag-item"
            >
              <text class="tag-name">{{ tag.tag }}</text>
              <text class="tag-count">{{ tag.count }}次</text>
            </view>
          </view>
        </view>

        <!-- 鼓励文案 -->
        <view class="encourage-section">
          <text class="encourage-text">{{ report.encouragementMessage }}</text>
        </view>

        <!-- 历史记录入口 -->
        <view class="history-section" @tap="navigateToHistory">
          <text class="history-title">查看完整历史报告</text>
          <text class="history-arrow">></text>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-else class="empty-view">
        <text class="empty-icon">📊</text>
        <text class="empty-text">暂无成长报告数据</text>
        <text class="empty-hint">完成任务开始积累数据吧</text>
      </view>

      <!-- 底部安全区 -->
      <view class="safe-area-bottom"></view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import growthReportService from '@/services/growthReportService'

// 宝宝列表
const babies = ref([])
const currentBabyId = ref('')
const loading = ref(false)
const report = ref(null)
const historyWeekly = ref([])

// 当前宝宝名称
const currentBabyName = computed(() => {
  const baby = babies.value.find(b => b.id === currentBabyId.value)
  return baby ? baby.name : '未知宝宝'
})

// 雷达图样式
const radarStyle = computed(() => {
  if (!report.value || !report.value.radarData) return {}
  
  const data = report.value.radarData
  const centerX = 75
  const centerY = 75
  const maxRadius = 65
  
  // 计算各维度数值对应的位置（5个维度：任务、打卡、等级、标签、积分）
  const values = [
    data.tasks / 100,      // 任务
    data.streak / 100,     // 打卡
    data.level / 100,      // 等级
    data.tags / 100,       // 标签
    data.points / 100     // 积分
  ]
  
  // 五个点的角度（从顶部开始，顺时针）
  const angles = [-90, -18, 54, 126, 198] // degrees
  
  const points = values.map((val, i) => {
    const angle = angles[i] * (Math.PI / 180)
    const radius = val * maxRadius
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    }
  })
  
  // 生成多边形路径
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z'
  
  return {
    clipPath: `polygon(${points.map(p => `${(p.x/150)*100}% ${(p.y/150)*100}%`).join(', ')})`
  }
})

// 雷达图数据点
const radarPoints = computed(() => {
  if (!report.value || !report.value.radarData) return []
  
  const data = report.value.radarData
  const centerX = 75
  const centerY = 75
  const maxRadius = 65
  
  const values = [
    data.tasks / 100,
    data.streak / 100,
    data.level / 100,
    data.tags / 100,
    data.points / 100
  ]
  
  const angles = [-90, -18, 54, 126, 198]
  
  return values.map((val, i) => {
    const angle = angles[i] * (Math.PI / 180)
    const radius = val * maxRadius
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    }
  })
})

// 计算综合评分
const calculateOverallScore = () => {
  if (!report.value || !report.value.radarData) return 0
  
  const data = report.value.radarData
  const score = Math.round(
    (data.tasks * 0.25 + data.streak * 0.25 + data.level * 0.2 + data.tags * 0.15 + data.points * 0.15) * 100
  )
  
  return Math.min(100, score)
}

// 加载成长报告
const loadGrowthReport = () => {
  loading.value = true
  
  try {
    const data = growthReportService.getGrowthReport(currentBabyId.value)
    report.value = data
    
    if (data) {
      historyWeekly.value = growthReportService.getHistoryReports(currentBabyId.value)
    }
  } catch (e) {
    console.error('加载成长报告失败:', e)
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

// 刷新数据
const onRefresh = () => {
  loadGrowthReport()
  uni.showToast({
    title: '已刷新',
    icon: 'success',
    duration: 1000
  })
}

// 加载宝宝列表
const loadBabies = () => {
  try {
    const stored = uni.getStorageSync('babies')
    babies.value = stored ? JSON.parse(stored) : []
    
    const storedBabyId = uni.getStorageSync('currentBabyId')
    currentBabyId.value = storedBabyId || (babies.value.length > 0 ? babies.value[0].id : '')
  } catch (e) {
    console.error('加载宝宝列表失败:', e)
    babies.value = []
  }
}

// 切换宝宝
const onBabyChange = (e) => {
  const idx = e.detail.value
  if (idx >= 0 && idx < babies.value.length) {
    currentBabyId.value = babies.value[idx].id
    uni.setStorageSync('currentBabyId', currentBabyId.value)
    loadGrowthReport()
    
    uni.showToast({
      title: `已切换到"${babies.value[idx].name}"`,
      icon: 'none',
      duration: 1500
    })
  }
}

// 跳转到历史报告
const navigateToHistory = () => {
  uni.navigateTo({
    url: '/pages/report/report'
  })
}

// 返回上一页
const goBack = () => {
  uni.navigateBack()
}

// 加载更多
const loadMore = () => {
  // 可扩展分页加载
}

// 初始化
onMounted(() => {
  loadBabies()
  loadGrowthReport()
})
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 44px;
  padding: 0 16px;
  background-color: #fff;
  border-bottom: 1px solid #eee;
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-left {
  width: 60px;
}

.back-icon {
  font-size: 20px;
  color: #333;
}

.nav-title {
  font-size: 17px;
  font-weight: 600;
  color: #333;
}

.nav-right {
  width: 60px;
  text-align: right;
}

.refresh-btn {
  font-size: 14px;
  color: #007aff;
}

.baby-selector {
  background-color: #fff;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.picker-view {
  display: flex;
  align-items: center;
}

.picker-label {
  font-size: 14px;
  color: #666;
}

.picker-value {
  font-size: 14px;
  color: #333;
  font-weight: 500;
  margin-right: 8px;
}

.picker-arrow {
  font-size: 12px;
  color: #999;
}

.report-content {
  height: calc(100vh - 44px);
  padding: 16px;
}

.loading-view {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #999;
}

/* 宝宝卡片 */
.baby-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
  color: #fff;
}

.baby-info {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.baby-avatar {
  width: 60px;
  height: 60px;
  border-radius: 30px;
  border: 3px solid rgba(255, 255, 255, 0.5);
  margin-right: 16px;
}

.baby-details {
  flex: 1;
}

.baby-name {
  font-size: 20px;
  font-weight: 600;
  display: block;
  margin-bottom: 4px;
}

.baby-level {
  display: flex;
  align-items: center;
}

.level-badge {
  background-color: rgba(255, 255, 255, 0.2);
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  margin-right: 8px;
}

.exp-text {
  font-size: 12px;
  opacity: 0.8;
}

.exp-progress {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  height: 8px;
  overflow: hidden;
}

.exp-bar {
  height: 100%;
  border-radius: 8px;
  transition: width 0.3s ease;
}

.exp-fill {
  height: 100%;
  background-color: #fff;
  border-radius: 8px;
}

/* 统计数据区 */
.stats-section {
  background-color: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.stat-item {
  background-color: #f8f8f8;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
}

.stat-item.highlight {
  background-color: #e8f5e9;
}

.stat-item.highlight-orange {
  background-color: #fff3e0;
}

.stat-value {
  display: block;
  font-size: 28px;
  font-weight: 700;
  color: #333;
  margin-bottom: 4px;
}

.stat-item.highlight .stat-value {
  color: #00b578;
}

.stat-item.highlight-orange .stat-value {
  color: #ff9500;
}

.stat-label {
  font-size: 12px;
  color: #666;
}

/* 本周进度 */
.weekly-section {
  background-color: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-date {
  font-size: 12px;
  color: #999;
}

.weekly-progress {
  display: flex;
  align-items: center;
}

.progress-circle {
  width: 100px;
  height: 100px;
  background-color: #f0f0f0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
}

.progress-ring {
  width: 80px;
  height: 80px;
  background-color: #fff;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.progress-value {
  font-size: 24px;
  font-weight: 700;
  color: #667eea;
}

.progress-label {
  font-size: 10px;
  color: #999;
}

.weekly-stats {
  flex: 1;
}

.weekly-stat-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f5f5f5;
}

.weekly-stat-item:last-child {
  border-bottom: none;
}

.weekly-stat-label {
  font-size: 14px;
  color: #666;
}

.weekly-stat-value {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

/* 雷达图 */
.radar-section {
  background-color: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.radar-container {
  display: flex;
  align-items: center;
}

.radar-legend {
  width: 100px;
}

.legend-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #667eea;
  margin-right: 8px;
}

.legend-item text {
  font-size: 12px;
  color: #666;
}

.radar-chart {
  flex: 1;
  height: 150px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.radar-bg {
  position: absolute;
  width: 150px;
  height: 150px;
}

.radar-circle {
  position: absolute;
  border: 1px solid #e0e0e0;
  border-radius: 50%;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

.radar-circle-1 { width: 30px; height: 30px; }
.radar-circle-2 { width: 60px; height: 60px; }
.radar-circle-3 { width: 90px; height: 90px; }
.radar-circle-4 { width: 120px; height: 120px; }
.radar-circle-5 { width: 150px; height: 150px; }

.radar-center {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.radar-score {
  display: block;
  font-size: 24px;
  font-weight: 700;
  color: #667eea;
}

.radar-score-label {
  font-size: 10px;
  color: #999;
}

.radar-data {
  position: absolute;
  width: 150px;
  height: 150px;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.3), rgba(118, 75, 162, 0.3));
  clip-path: polygon(50% 0%, 93% 24%, 93% 76%, 50% 100%, 7% 76%, 7% 24%);
}

.radar-point {
  position: absolute;
  width: 10px;
  height: 10px;
  background-color: #667eea;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  border: 2px solid #fff;
}

/* 标签 */
.tags-section {
  background-color: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-item {
  display: flex;
  align-items: center;
  background-color: #f0f0f0;
  border-radius: 16px;
  padding: 6px 12px;
}

.tag-name {
  font-size: 12px;
  color: #333;
  margin-right: 4px;
}

.tag-count {
  font-size: 10px;
  color: #999;
}

/* 鼓励文案 */
.encourage-section {
  background-color: #fff8e6;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  text-align: center;
}

.encourage-text {
  font-size: 14px;
  color: #b8860b;
  line-height: 1.5;
}

/* 历史记录 */
.history-section {
  background-color: #fff;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.history-title {
  font-size: 14px;
  color: #333;
}

.history-arrow {
  font-size: 14px;
  color: #999;
}

/* 空状态 */
.empty-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 60px;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 16px;
  color: #333;
  margin-bottom: 8px;
}

.empty-hint {
  font-size: 14px;
  color: #999;
}

.safe-area-bottom {
  height: 20px;
}
</style>
