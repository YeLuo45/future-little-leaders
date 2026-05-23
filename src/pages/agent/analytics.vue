<template>
  <view class="analytics-page">
    <!-- Header -->
    <view class="header">
      <text class="title">学习分析</text>
      <text class="subtitle">Agent Performance Dashboard</text>
    </view>

    <!-- Child Selector -->
    <view class="child-selector">
      <picker :value="childIndex" :range="children" range-key="name" @change="onChildChange">
        <view class="picker-value">
          <text>{{ children[childIndex]?.name || '选择孩子' }}</text>
          <text class="arrow">▼</text>
        </view>
      </picker>
    </view>

    <!-- Overview Cards -->
    <view class="overview-cards">
      <view class="card" v-for="(card, i) in overviewCards" :key="i" :style="{ background: card.color }">
        <text class="card-value">{{ card.value }}</text>
        <text class="card-label">{{ card.label }}</text>
      </view>
    </view>

    <!-- Radar Chart Section -->
    <view class="section">
      <text class="section-title">能力雷达图</text>
      <view class="chart-container" v-html="radarChartSvg"></view>
      <view class="legend">
        <view class="legend-item" v-for="(item, i) in radarLegend" :key="i">
          <view class="legend-dot" :style="{ background: item.color }"></view>
          <text>{{ item.label }}</text>
        </view>
      </view>
    </view>

    <!-- Weekly Comparison -->
    <view class="section">
      <text class="section-title">本周 vs 上周</text>
      <view class="chart-container" v-html="barChartSvg"></view>
    </view>

    <!-- Daily Heatmap -->
    <view class="section">
      <text class="section-title">每日学习时长</text>
      <view class="chart-container" v-html="heatmapSvg"></view>
    </view>

    <!-- Weakness Alert -->
    <view class="section weakness-section" v-if="weaknesses.length > 0">
      <text class="section-title">薄弱点提醒</text>
      <view class="weakness-list">
        <view class="weakness-item" v-for="(w, i) in weaknesses" :key="i" :class="w.level">
          <view class="weakness-header">
            <text class="agent-badge">{{ w.agentType }}</text>
            <text class="level-badge" :class="w.level">{{ w.level === 'critical' ? '⚠️ 需加强' : '⚡ 观察' }}</text>
          </view>
          <text class="weakness-message">{{ w.message }}</text>
          <view class="recommended" v-if="w.recommendedActions?.length > 0">
            <text class="rec-label">推荐练习:</text>
            <text v-for="(action, j) in w.recommendedActions.slice(0, 2)" :key="j" class="rec-item">
              {{ action.action }}
            </text>
          </view>
        </view>
      </view>
    </view>

    <!-- Export Button -->
    <view class="export-section">
      <button class="export-btn" @click="exportReport">导出周报</button>
    </view>
  </view>
</template>

<script>
import { PerformanceDashboard } from '@/services/agent/performanceDashboard.js'
import { RadarChart, BarChart, HeatmapChart } from '@/services/agent/progressChart.js'
import { getWeaknessDetector } from '@/services/agent/weaknessDetector.js'
import { getMemoryService } from '@/services/agent/memoryService.js'

export default {
  data() {
    return {
      childIndex: 0,
      children: [
        { id: 'child1', name: '小明' },
        { id: 'child2', name: '小红' }
      ],
      overviewCards: [
        { label: '本周学习', value: '12h', color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
        { label: '掌握技能', value: '8', color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
        { label: '连续天数', value: '5天', color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }
      ],
      radarChartSvg: '',
      barChartSvg: '',
      heatmapSvg: '',
      radarLegend: [
        { label: '数学', color: '#4f46e5' },
        { label: '中文', color: '#059669' },
        { label: '英语', color: '#d97706' },
        { label: '生活', color: '#dc2626' }
      ],
      weaknesses: [],
      dashboard: null
    }
  },
  onLoad() {
    this.initDashboard()
  },
  methods: {
    async initDashboard() {
      try {
        const memoryService = await getMemoryService()
        this.dashboard = await PerformanceDashboard.getInstance(memoryService)
        await this.loadData()
      } catch (e) {
        console.warn('Dashboard init failed:', e)
        this.renderEmptyCharts()
      }
    },
    async loadData() {
      const childId = this.children[this.childIndex]?.id || 'child1'
      if (!this.dashboard) {
        this.renderEmptyCharts()
        return
      }
      try {
        const radarData = await this.dashboard.getRadarData(childId)
        this.renderRadar(radarData)
        const weekly = await this.dashboard.getWeeklyComparison(childId)
        this.renderBarChart(weekly)
        const heatmap = await this.dashboard.getDailyHeatmap(childId)
        this.renderHeatmap(heatmap)
        await this.loadWeaknesses(childId)
      } catch (e) {
        console.warn('Load data failed:', e)
        this.renderEmptyCharts()
      }
    },
    renderRadar(data) {
      const radar = new RadarChart(null, { size: 280 })
      this.radarChartSvg = radar.render(data)
    },
    renderBarChart(weeklyData) {
      const labels = weeklyData.map(w => w.label)
      const datasets = [
        { label: '本周', data: weeklyData.map(w => w.thisWeek), color: '#4f46e5' },
        { label: '上周', data: weeklyData.map(w => w.lastWeek), color: '#9ca3af' }
      ]
      const bar = new BarChart(null, { width: 340, barWidth: 28, gap: 6 })
      this.barChartSvg = bar.render({ labels, datasets })
    },
    renderHeatmap(data) {
      const heatmap = new HeatmapChart(null, { cellSize: 42, gap: 6 })
      this.heatmapSvg = heatmap.render(data)
    },
    async loadWeaknesses(childId) {
      try {
        const detector = await getWeaknessDetector()
        const memoryService = await getMemoryService()
        this.weaknesses = await detector.detectWeaknesses(childId, memoryService)
      } catch (e) {
        this.weaknesses = []
      }
    },
    renderEmptyCharts() {
      this.radarChartSvg = '<svg width="280" height="280"><text x="140" y="140" text-anchor="middle">暂无数据</text></svg>'
      this.barChartSvg = '<svg width="340" height="200"><text x="170" y="100" text-anchor="middle">暂无数据</text></svg>'
      this.heatmapSvg = '<svg width="300" height="70"><text x="150" y="35" text-anchor="middle">暂无数据</text></svg>'
    },
    onChildChange(e) {
      this.childIndex = e.detail.value
      this.loadData()
    },
    exportReport() {
      uni.showToast({ title: '报告生成中...', icon: 'loading' })
      setTimeout(() => {
        uni.showToast({ title: '报告已生成', icon: 'success' })
      }, 1500)
    }
  }
}
</script>

<style scoped>
.analytics-page {
  min-height: 100vh;
  background: #f3f4f6;
  padding: 20rpx;
}
.header {
  padding: 30rpx 20rpx;
}
.title {
  font-size: 40rpx;
  font-weight: 700;
  color: #1f2937;
  display: block;
}
.subtitle {
  font-size: 24rpx;
  color: #6b7280;
  margin-top: 8rpx;
}
.child-selector {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
}
.picker-value {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 28rpx;
  color: #374151;
}
.arrow {
  color: #9ca3af;
  font-size: 24rpx;
}
.overview-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;
  margin-bottom: 20rpx;
}
.card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16rpx;
  padding: 24rpx 16rpx;
  text-align: center;
}
.card-value {
  font-size: 36rpx;
  font-weight: 700;
  color: #fff;
  display: block;
}
.card-label {
  font-size: 22rpx;
  color: rgba(255,255,255,0.8);
  margin-top: 8rpx;
  display: block;
}
.section {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
}
.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 20rpx;
  display: block;
}
.chart-container {
  display: flex;
  justify-content: center;
  overflow-x: auto;
}
.legend {
  display: flex;
  justify-content: center;
  gap: 24rpx;
  margin-top: 16rpx;
  flex-wrap: wrap;
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 24rpx;
  color: #6b7280;
}
.legend-dot {
  width: 20rpx;
  height: 20rpx;
  border-radius: 50%;
}
.weakness-section {
  background: #fef3c7;
}
.weakness-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}
.weakness-item {
  background: #fff;
  border-radius: 12rpx;
  padding: 20rpx;
  border-left: 6rpx solid #f59e0b;
}
.weakness-item.critical {
  border-left-color: #dc2626;
  background: #fef2f2;
}
.weakness-header {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 12rpx;
}
.agent-badge {
  background: #4f46e5;
  color: #fff;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  font-size: 22rpx;
}
.level-badge {
  font-size: 22rpx;
  padding: 4rpx 8rpx;
  border-radius: 6rpx;
}
.level-badge.warning {
  background: #fef3c7;
  color: #f59e0b;
}
.level-badge.critical {
  background: #fef2f2;
  color: #dc2626;
}
.weakness-message {
  font-size: 26rpx;
  color: #374151;
  display: block;
  margin-bottom: 12rpx;
}
.recommended {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  align-items: center;
}
.rec-label {
  font-size: 22rpx;
  color: #6b7280;
}
.rec-item {
  background: #e0e7ff;
  color: #4338ca;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  font-size: 22rpx;
}
.export-section {
  margin-top: 20rpx;
}
.export-btn {
  width: 100%;
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  color: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  font-size: 28rpx;
  font-weight: 600;
  border: none;
}
</style>