<template>
  <view class="focus-stats-page">
    <!-- 顶部导航 -->
    <view class="header">
      <view class="header-left" @click="goBack">
        <text class="icon">←</text>
      </view>
      <view class="header-title">
        <text>专注统计</text>
      </view>
      <view class="header-right"></view>
    </view>

    <!-- 概览统计 -->
    <view class="overview-section">
      <view class="overview-card total">
        <text class="overview-value">{{ totalMinutes }}</text>
        <text class="overview-label">总学习分钟</text>
      </view>
      <view class="overview-row">
        <view class="overview-card">
          <text class="overview-value">{{ todayMinutes }}</text>
          <text class="overview-label">今日分钟</text>
        </view>
        <view class="overview-card">
          <text class="overview-value">{{ weekMinutes }}</text>
          <text class="overview-label">本周分钟</text>
        </view>
      </view>
    </view>

    <!-- 专注力曲线 -->
    <view class="chart-section">
      <view class="section-title">
        <text>本周专注力曲线</text>
      </view>
      <view class="chart-container">
        <view class="chart-y-axis">
          <text v-for="y in yAxisLabels" :key="y" class="y-label">{{ y }}</text>
        </view>
        <view class="chart-content">
          <view class="chart-bars">
            <view
              v-for="(day, index) in weekData"
              :key="index"
              class="bar-wrapper"
            >
              <view
                class="bar"
                :style="{ height: getBarHeight(day.minutes) + '%' }"
                :class="{ today: day.isToday }"
              ></view>
              <text class="bar-label">{{ day.label }}</text>
            </view>
          </view>
          <view class="chart-grid">
            <view v-for="i in 4" :key="i" class="grid-line"></view>
          </view>
        </view>
      </view>
    </view>

    <!-- 专注时段分析 -->
    <view class="time-analysis-section">
      <view class="section-title">
        <text>专注时段分析</text>
      </view>
      <view class="time-slots">
        <view
          v-for="slot in timeSlots"
          :key="slot.label"
          class="time-slot"
        >
          <text class="slot-icon">{{ slot.icon }}</text>
          <text class="slot-label">{{ slot.label }}</text>
          <view class="slot-bar-container">
            <view
              class="slot-bar"
              :style="{ width: slot.percentage + '%' }"
            ></view>
          </view>
          <text class="slot-value">{{ slot.minutes }}分钟</text>
        </view>
      </view>
    </view>

    <!-- 排行榜 -->
    <view class="leaderboard-section">
      <view class="section-title">
        <text>专注力排行榜</text>
      </view>
      <view class="leaderboard-list">
        <view
          v-for="(item, index) in leaderboard"
          :key="item.id"
          class="leaderboard-item"
          :class="{ 'top-three': index < 3 }"
        >
          <view class="rank">{{ index + 1 }}</view>
          <view class="user-info">
            <text class="user-name">{{ item.name }}</text>
            <text class="user-badge">{{ item.badge }}</text>
          </view>
          <view class="user-stats">
            <text class="user-minutes">{{ item.minutes }}</text>
            <text class="user-label">分钟</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 学习记录 -->
    <view class="records-section">
      <view class="section-title">
        <text>最近学习记录</text>
      </view>
      <view class="records-list">
        <view
          v-for="record in recentRecords"
          :key="record.id"
          class="record-item"
        >
          <view class="record-left">
            <text class="record-date">{{ record.date }}</text>
            <text class="record-task">{{ record.task || '自主学习' }}</text>
          </view>
          <view class="record-right">
            <text class="record-minutes">{{ record.minutes }}</text>
            <text class="record-label">分钟</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { useStudyStore } from '@/stores/studyStore'

export default {
  data() {
    return {
      timeSlots: [
        { label: '清晨', icon: '🌅', minutes: 0, percentage: 0 },
        { label: '上午', icon: '☀️', minutes: 0, percentage: 0 },
        { label: '下午', icon: '🌤️', minutes: 0, percentage: 0 },
        { label: '傍晚', icon: '🌇', minutes: 0, percentage: 0 },
        { label: '夜晚', icon: '🌙', minutes: 0, percentage: 0 }
      ],
      yAxisLabels: ['高', '', '中', '', '低'],
      leaderboard: [
        { id: '1', name: '小明', badge: '学习达人', minutes: 1250 },
        { id: '2', name: '小红', badge: '专注之星', minutes: 1080 },
        { id: '3', name: '小华', badge: '进步先锋', minutes: 950 },
        { id: '4', name: '小亮', badge: '坚持不懈', minutes: 820 },
        { id: '5', name: '小芳', badge: '新星崛起', minutes: 680 }
      ],
      recentRecords: []
    }
  },
  computed: {
    totalMinutes() {
      return this.studyStore.totalStudyMinutes
    },
    todayMinutes() {
      return this.studyStore.todayStudyStats.totalMinutes
    },
    weekMinutes() {
      return this.studyStore.weekStudyStats.totalMinutes
    },
    weekData() {
      const weekStats = this.studyStore.weekStudyStats
      const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
      const today = new Date().getDay()
      const result = []
      
      for (let i = 0; i < 7; i++) {
        const date = new Date()
        date.setDate(date.getDate() - (today - i))
        const dateStr = date.toISOString().split('T')[0]
        const dayData = weekStats.dailyStats && weekStats.dailyStats[dateStr]
          ? weekStats.dailyStats[dateStr]
          : { minutes: 0 }
        
        result.push({
          label: days[i],
          minutes: dayData.minutes || 0,
          isToday: i === today
        })
      }
      
      return result
    },
    studyStore() {
      return useStudyStore()
    }
  },
  onLoad() {
    this.studyStore.init()
    this.loadRecentRecords()
    this.calculateTimeSlots()
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    getBarHeight(minutes) {
      if (!minutes || minutes === 0) return 5
      const maxMinutes = Math.max(...this.weekData.map(d => d.minutes), 60)
      return Math.max((minutes / maxMinutes) * 100, 5)
    },
    loadRecentRecords() {
      const records = this.studyStore.getStudyRecords()
      this.recentRecords = records.slice(0, 10).map(r => {
        const date = new Date(r.createdAt)
        return {
          id: r.id,
          date: `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`,
          task: r.taskTitle || r.task,
          minutes: r.duration
        }
      })
      
      if (this.recentRecords.length === 0) {
        this.recentRecords = [
          { id: '1', date: '5/18 14:30', task: '数学作业', minutes: 45 },
          { id: '2', date: '5/18 09:15', task: '英语阅读', minutes: 30 },
          { id: '3', date: '5/17 19:00', task: '物理复习', minutes: 60 },
          { id: '4', date: '5/17 15:45', task: '语文作文', minutes: 40 }
        ]
      }
    },
    calculateTimeSlots() {
      const records = this.studyStore.getStudyRecords()
      const slotMinutes = [0, 0, 0, 0, 0]
      
      records.forEach(r => {
        const hour = new Date(r.createdAt).getHours()
        if (hour >= 5 && hour < 9) slotMinutes[0] += r.duration || 0
        else if (hour >= 9 && hour < 12) slotMinutes[1] += r.duration || 0
        else if (hour >= 12 && hour < 14) slotMinutes[2] += r.duration || 0
        else if (hour >= 14 && hour < 18) slotMinutes[2] += r.duration || 0
        else if (hour >= 18 && hour < 21) slotMinutes[3] += r.duration || 0
        else slotMinutes[4] += r.duration || 0
      })
      
      const total = Math.max(slotMinutes.reduce((a, b) => a + b, 1), 1)
      this.timeSlots = this.timeSlots.map((slot, i) => ({
        ...slot,
        minutes: slotMinutes[i],
        percentage: (slotMinutes[i] / total) * 100
      }))
    }
  }
}
</script>

<style scoped>
.focus-stats-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 16px;
  background-color: #5b8def;
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

.overview-section {
  padding: 16px;
}

.overview-card {
  background-color: white;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  flex: 1;
}

.overview-card.total {
  background: linear-gradient(135deg, #5b8def 0%, #7aa3f5 100%);
  color: white;
  margin-bottom: 12px;
}

.overview-row {
  display: flex;
  gap: 12px;
}

.overview-value {
  display: block;
  font-size: 32px;
  font-weight: bold;
}

.overview-label {
  display: block;
  font-size: 12px;
  opacity: 0.8;
  margin-top: 4px;
}

.chart-section {
  background-color: white;
  padding: 16px;
  margin-bottom: 12px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 16px;
}

.chart-container {
  display: flex;
  height: 160px;
}

.chart-y-axis {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-right: 8px;
  padding-top: 8px;
  padding-bottom: 24px;
}

.y-label {
  font-size: 10px;
  color: #999;
}

.chart-content {
  flex: 1;
  position: relative;
}

.chart-bars {
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  height: 120px;
  position: relative;
  z-index: 1;
}

.bar-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
}

.bar {
  width: 24px;
  background-color: #d9e6ff;
  border-radius: 4px 4px 0 0;
  transition: height 0.3s;
  margin-top: auto;
}

.bar.today {
  background-color: #5b8def;
}

.bar-label {
  font-size: 10px;
  color: #999;
  margin-top: 8px;
}

.chart-grid {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.grid-line {
  border-bottom: 1px dashed #eee;
}

.time-analysis-section {
  background-color: white;
  padding: 16px;
  margin-bottom: 12px;
}

.time-slots {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.time-slot {
  display: flex;
  align-items: center;
  gap: 12px;
}

.slot-icon {
  font-size: 20px;
  width: 30px;
  text-align: center;
}

.slot-label {
  font-size: 14px;
  color: #666;
  width: 40px;
}

.slot-bar-container {
  flex: 1;
  height: 8px;
  background-color: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.slot-bar {
  height: 100%;
  background-color: #5b8def;
  border-radius: 4px;
  transition: width 0.3s;
}

.slot-value {
  font-size: 12px;
  color: #999;
  width: 60px;
  text-align: right;
}

.leaderboard-section {
  background-color: white;
  padding: 16px;
  margin-bottom: 12px;
}

.leaderboard-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.leaderboard-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background-color: #f8f8f8;
  border-radius: 8px;
}

.leaderboard-item.top-three {
  background-color: #fffbe6;
}

.rank {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: #ddd;
  color: white;
  font-weight: bold;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
}

.top-three .rank {
  background-color: #faad14;
}

.user-info {
  flex: 1;
}

.user-name {
  display: block;
  font-size: 14px;
  font-weight: bold;
  color: #333;
}

.user-badge {
  display: block;
  font-size: 11px;
  color: #999;
}

.user-stats {
  text-align: right;
}

.user-minutes {
  display: block;
  font-size: 16px;
  font-weight: bold;
  color: #5b8def;
}

.user-label {
  display: block;
  font-size: 10px;
  color: #999;
}

.records-section {
  background-color: white;
  padding: 16px;
  margin-bottom: 12px;
}

.records-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.record-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background-color: #f8f8f8;
  border-radius: 8px;
}

.record-left {
  display: flex;
  flex-direction: column;
}

.record-date {
  display: block;
  font-size: 12px;
  color: #999;
}

.record-task {
  display: block;
  font-size: 14px;
  color: #333;
  margin-top: 2px;
}

.record-right {
  text-align: right;
}

.record-minutes {
  display: block;
  font-size: 18px;
  font-weight: bold;
  color: #5b8def;
}

.record-label {
  display: block;
  font-size: 10px;
  color: #999;
}
</style>
