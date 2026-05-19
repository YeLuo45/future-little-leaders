<template>
  <view class="mood-analytics-page">
    <!-- 顶部导航 -->
    <view class="header">
      <view class="header-left" @click="goBack">
        <text class="icon">←</text>
      </view>
      <view class="header-title">
        <text>情绪分析</text>
      </view>
      <view class="header-right">
        <text class="icon" @click="togglePeriod">{{ period === 'week' ? '月' : '周' }}</text>
      </view>
    </view>

    <!-- 统计概览 -->
    <view class="stats-overview">
      <view class="stat-card">
        <text class="stat-value">{{ store.statistics.totalRecords }}</text>
        <text class="stat-label">总记录</text>
      </view>
      <view class="stat-card">
        <text class="stat-value">{{ currentPeriodData.length }}</text>
        <text class="stat-label">{{ period === 'week' ? '本周' : '本月' }}</text>
      </view>
      <view class="stat-card">
        <text class="stat-value">{{ store.statistics.averageIntensity }}</text>
        <text class="stat-label">平均强度</text>
      </view>
      <view class="stat-card">
        <view class="dominant-mood">
          <text class="dominant-emoji">{{ store.getMoodEmoji(store.statistics.dominantMood) }}</text>
        </view>
        <text class="stat-label">主要情绪</text>
      </view>
    </view>

    <!-- 情绪趋势图 -->
    <view class="trend-section">
      <view class="section-header">
        <text class="section-title">{{ period === 'week' ? '本周' : '本月' }}情绪趋势</text>
      </view>
      <view class="trend-chart">
        <view class="chart-y-axis">
          <text>5</text>
          <text>3</text>
          <text>1</text>
        </view>
        <view class="chart-content">
          <view class="chart-grid">
            <view class="grid-line" v-for="i in 5" :key="i"></view>
          </view>
          <view class="chart-bars">
            <view 
              v-for="(item, index) in currentPeriodData" 
              :key="index"
              class="bar-item"
            >
              <view 
                class="bar" 
                :style="{
                  height: item.intensity * 20 + '%',
                  backgroundColor: item.mood ? store.getMoodColor(item.mood) : '#e0e0e0'
                }"
              >
                <text class="bar-emoji" v-if="item.mood">{{ store.getMoodEmoji(item.mood) }}</text>
              </view>
              <text class="bar-label">{{ period === 'week' ? item.day : item.day + '日' }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 情绪分布 -->
    <view class="distribution-section">
      <view class="section-header">
        <text class="section-title">情绪分布</text>
      </view>
      <view class="distribution-content">
        <view class="pie-container">
          <view class="pie-chart" :style="pieStyle">
            <view 
              v-for="(segment, index) in pieSegments" 
              :key="index"
              class="pie-segment"
              :style="segment.style"
            ></view>
          </view>
          <view class="pie-center">
            <text class="total-count">{{ totalDistribution }}</text>
            <text class="total-label">条记录</text>
          </view>
        </view>
        <view class="legend">
          <view 
            v-for="(item, type) in store.statistics.moodDistribution" 
            :key="type"
            class="legend-item"
          >
            <view class="legend-color" :style="{backgroundColor: store.getMoodColor(type)}"></view>
            <text class="legend-label">{{ store.getMoodName(type) }}</text>
            <text class="legend-count">{{ item.count }}次</text>
            <text class="legend-percent">{{ getPercent(item.count) }}%</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 情绪调节建议 -->
    <view class="tips-section">
      <view class="section-header">
        <text class="section-title">💡 调节建议</text>
      </view>
      <view class="tips-cards">
        <view class="tip-card" @click="goToBreathing">
          <text class="tip-icon">🌬️</text>
          <text class="tip-name">深呼吸</text>
          <text class="tip-desc">平缓情绪</text>
        </view>
        <view class="tip-card" @click="goToMindfulness">
          <text class="tip-icon">🧠</text>
          <text class="tip-name">正念冥想</text>
          <text class="tip-desc">放松身心</text>
        </view>
        <view class="tip-card" @click="goToJournal">
          <text class="tip-icon">📝</text>
          <text class="tip-name">写日记</text>
          <text class="tip-desc">记录感受</text>
        </view>
      </view>
    </view>

    <!-- 历史记录列表 -->
    <view class="history-section">
      <view class="section-header">
        <text class="section-title">详细记录</text>
      </view>
      <view 
        v-for="record in store.moodRecords" 
        :key="record.id"
        class="history-item"
      >
        <view class="history-date-col">
          <text class="history-month">{{ formatMonth(record.date) }}</text>
          <text class="history-day">{{ formatDay(record.date) }}</text>
        </view>
        <view class="history-emotion-col">
          <view class="emotion-badge" :style="{backgroundColor: store.getMoodColor(record.mood)}">
            <text>{{ store.getMoodEmoji(record.mood) }}</text>
          </view>
        </view>
        <view class="history-content-col">
          <text class="history-mood-name">{{ store.getMoodName(record.mood) }}</text>
          <view class="history-intensity">
            <view 
              v-for="i in 5" 
              :key="i"
              class="intensity-dot"
              :class="{filled: i <= record.intensity}"
            ></view>
          </view>
          <text class="history-trigger" v-if="record.trigger">{{ record.trigger }}</text>
          <text class="history-note" v-if="record.note">{{ record.note }}</text>
        </view>
      </view>

      <view v-if="store.moodRecords.length === 0" class="empty-state">
        <text class="empty-icon">📊</text>
        <text class="empty-text">还没有情绪记录</text>
        <button class="start-btn" @click="goToJournal">去记录</button>
      </view>
    </view>
  </view>
</template>

<script>
import { useMoodStore } from '@/stores/moodStore.js'

export default {
  data() {
    return {
      period: 'week' // 'week' | 'month'
    }
  },
  computed: {
    store() {
      return useMoodStore()
    },
    currentPeriodData() {
      return this.period === 'week' 
        ? this.store.statistics.weeklyData 
        : this.store.statistics.monthlyData
    },
    totalDistribution() {
      const dist = this.store.statistics.moodDistribution
      let total = 0
      for (const key in dist) {
        total += dist[key].count
      }
      return total
    },
    pieStyle() {
      // 简单实现，实际应该用canvas或svg
      return {}
    },
    pieSegments() {
      const dist = this.store.statistics.moodDistribution
      const total = this.totalDistribution
      if (total === 0) return []
      
      const segments = []
      let currentAngle = 0
      
      for (const mood in dist) {
        const percent = dist[mood].count / total
        const angle = percent * 360
        segments.push({
          mood,
          percent,
          angle,
          startAngle: currentAngle,
          style: {
            backgroundColor: this.store.getMoodColor(mood)
          }
        })
        currentAngle += angle
      }
      
      return segments
    }
  },
  onLoad() {
    this.store.init()
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    togglePeriod() {
      this.period = this.period === 'week' ? 'month' : 'week'
    },
    getPercent(count) {
      if (this.totalDistribution === 0) return 0
      return Math.round(count / this.totalDistribution * 100)
    },
    formatMonth(dateStr) {
      const date = new Date(dateStr)
      return `${date.getMonth() + 1}月`
    },
    formatDay(dateStr) {
      const date = new Date(dateStr)
      return `${date.getDate()}日`
    },
    goToBreathing() {
      // 返回上一页进行呼吸练习
      uni.navigateBack()
    },
    goToMindfulness() {
      uni.navigateBack()
    },
    goToJournal() {
      uni.navigateTo({
        url: '/pages/mood/mood-journal'
      })
    }
  }
}
</script>

<style scoped>
.mood-analytics-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 30px;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 16px;
  background: linear-gradient(135deg, #8477fa 0%, #a599fa 100%);
  color: white;
}

.header-left, .header-right {
  width: 40px;
}

.header-title {
  flex: 1;
  text-align: center;
  font-size: 18px;
  font-weight: bold;
}

.icon {
  font-size: 20px;
}

.stats-overview {
  display: flex;
  padding: 16px;
  gap: 8px;
}

.stat-card {
  flex: 1;
  background: white;
  border-radius: 12px;
  padding: 16px 8px;
  text-align: center;
}

.stat-value {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  display: block;
}

.stat-label {
  font-size: 11px;
  color: #999;
  margin-top: 4px;
  display: block;
}

.dominant-mood {
  display: flex;
  justify-content: center;
}

.dominant-emoji {
  font-size: 28px;
}

.trend-section, .distribution-section, .tips-section, .history-section {
  padding: 16px;
}

.section-header {
  margin-bottom: 12px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.trend-chart {
  background: white;
  border-radius: 12px;
  padding: 16px;
  display: flex;
}

.chart-y-axis {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-right: 8px;
  font-size: 10px;
  color: #999;
  text-align: right;
  width: 20px;
}

.chart-content {
  flex: 1;
  position: relative;
  height: 150px;
}

.chart-grid {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.grid-line {
  border-bottom: 1px dashed #e0e0e0;
}

.chart-bars {
  position: absolute;
  bottom: 20px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  height: calc(100% - 20px);
}

.bar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.bar {
  width: 24px;
  min-height: 8px;
  border-radius: 4px 4px 0 0;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  margin-bottom: 4px;
}

.bar-emoji {
  font-size: 14px;
  margin-top: 2px;
}

.bar-label {
  font-size: 10px;
  color: #999;
}

.distribution-content {
  background: white;
  border-radius: 12px;
  padding: 16px;
}

.pie-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
  position: relative;
}

.pie-chart {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: #e0e0e0;
  position: relative;
  overflow: hidden;
}

.pie-segment {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
}

.pie-center {
  position: absolute;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.total-count {
  font-size: 20px;
  font-weight: bold;
  color: #333;
}

.total-label {
  font-size: 10px;
  color: #999;
}

.legend {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  padding: 8px;
  background: #f5f5f5;
  border-radius: 8px;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 8px;
}

.legend-label {
  flex: 1;
  font-size: 12px;
  color: #333;
}

.legend-count {
  font-size: 11px;
  color: #999;
  margin-right: 4px;
}

.legend-percent {
  font-size: 11px;
  color: #8477fa;
  font-weight: bold;
}

.tips-cards {
  display: flex;
  gap: 12px;
}

.tip-card {
  flex: 1;
  background: white;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
}

.tip-icon {
  font-size: 28px;
  display: block;
  margin-bottom: 8px;
}

.tip-name {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  display: block;
}

.tip-desc {
  font-size: 11px;
  color: #999;
}

.history-section {
  padding-bottom: 30px;
}

.history-item {
  display: flex;
  background: white;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 8px;
}

.history-date-col {
  width: 50px;
  text-align: center;
}

.history-month {
  font-size: 12px;
  color: #999;
}

.history-day {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.history-emotion-col {
  margin-right: 12px;
}

.emotion-badge {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.history-content-col {
  flex: 1;
}

.history-mood-name {
  font-size: 14px;
  font-weight: bold;
  color: #333;
}

.history-intensity {
  display: flex;
  gap: 4px;
  margin: 4px 0;
}

.intensity-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #e0e0e0;
}

.intensity-dot.filled {
  background-color: #FFD93D;
}

.history-trigger {
  font-size: 12px;
  color: #999;
  display: block;
}

.history-note {
  font-size: 12px;
  color: #666;
  display: block;
  margin-top: 4px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.empty-text {
  font-size: 14px;
  color: #999;
  margin-bottom: 16px;
}

.start-btn {
  background: linear-gradient(135deg, #8477fa 0%, #a599fa 100%);
  color: white;
  border: none;
  border-radius: 20px;
  padding: 10px 24px;
  font-size: 14px;
}
</style>
