<!-- src/pages/report/report.vue -->
<template>
  <view class="page-container">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <view class="nav-left" @tap="goBack">←</view>
      <text class="nav-title">成长报告</text>
      <view class="nav-right"></view>
    </view>

    <scroll-view scroll-y class="report-content">
      <!-- 本周周报 -->
      <view class="report-section">
        <view class="section-header">
          <text class="section-title">本周周报</text>
          <text class="section-date">{{ currentWeekStart }} ~ {{ currentWeekEnd }}</text>
        </view>

        <view class="stats-grid">
          <view class="stat-card">
            <text class="stat-value">{{ weeklyReport.tasksCompleted }}</text>
            <text class="stat-label">完成任务</text>
          </view>
          <view class="stat-card">
            <text class="stat-value">{{ weeklyReport.pointsEarned }}</text>
            <text class="stat-label">获得积分</text>
          </view>
          <view class="stat-card">
            <text class="stat-value">{{ weeklyReport.streakDays }}</text>
            <text class="stat-label">连续天数</text>
          </view>
        </view>

        <!-- 鼓励文案 -->
        <view class="encourage-text">
          {{ getEncourageMessage() }}
        </view>
      </view>

      <!-- 历史周报 -->
      <view class="report-section">
        <text class="section-title">历史周报</text>
        <view class="history-list">
          <view
            v-for="report in historyWeekly"
            :key="report.week"
            class="history-item"
            @tap="showWeeklyDetail(report)"
          >
            <view class="history-info">
              <text class="history-week">{{ report.week }}</text>
              <text class="history-date">{{ report.startDate }} ~ {{ report.endDate }}</text>
            </view>
            <view class="history-stats">
              <text>{{ report.tasksCompleted }}任务</text>
              <text class="history-points">/ {{ report.pointsEarned }}积分</text>
            </view>
          </view>
          <view v-if="historyWeekly.length === 0" class="empty-tip">
            <text>暂无历史周报</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 周报详情弹窗 -->
    <uni-popup ref="detailPopup" type="center">
      <view class="detail-modal" v-if="selectedReport">
        <view class="detail-header">
          <text class="detail-title">{{ selectedReport.week }}</text>
          <text class="detail-date">{{ selectedReport.startDate }} ~ {{ selectedReport.endDate }}</text>
        </view>

        <view class="detail-stats">
          <view class="detail-stat-row">
            <text class="detail-stat-label">完成任务</text>
            <text class="detail-stat-value">{{ selectedReport.tasksCompleted }}</text>
          </view>
          <view class="detail-stat-row">
            <text class="detail-stat-label">获得积分</text>
            <text class="detail-stat-value positive">{{ selectedReport.pointsEarned }}</text>
          </view>
          <view class="detail-stat-row">
            <text class="detail-stat-label">支出积分</text>
            <text class="detail-stat-value negative">{{ selectedReport.pointsSpent }}</text>
          </view>
          <view class="detail-stat-row">
            <text class="detail-stat-label">连续天数</text>
            <text class="detail-stat-value">{{ selectedReport.streakDays }}</text>
          </view>
        </view>

        <button class="detail-close-btn" @tap="closeDetail">关闭</button>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useReportStore } from '@/stores/reportStore'

const reportStore = useReportStore()

// 当前周报数据
const weeklyReport = ref({
  tasksCompleted: 0,
  pointsEarned: 0,
  streakDays: 0
})

const currentWeekStart = ref('')
const currentWeekEnd = ref('')

// 历史周报
const historyWeekly = ref([])

// 详情弹窗
const detailPopup = ref(null)
const selectedReport = ref(null)

// 获取鼓励文案
const getEncourageMessage = () => {
  const { tasksCompleted, streakDays } = weeklyReport.value

  if (streakDays >= 7) {
    return '太棒了！连续打卡' + streakDays + '天，你是最棒的！继续保持哦~'
  } else if (streakDays >= 3) {
    return '不错哦！已经连续打卡' + streakDays + '天了，继续加油！'
  } else if (tasksCompleted >= 10) {
    return '本周完成了' + tasksCompleted + '个任务，真是个小能手！'
  } else if (tasksCompleted >= 5) {
    return '完成了' + tasksCompleted + '个任务，继续努力，下周会更棒！'
  } else if (tasksCompleted > 0) {
    return '完成了' + tasksCompleted + '个任务，慢慢来，每天进步一点点~'
  } else {
    return '本周还没有完成任务哦，快去添加任务开始打卡吧！'
  }
}

// 显示周报详情
const showWeeklyDetail = (report) => {
  selectedReport.value = report
  detailPopup.value.open()
}

// 关闭详情弹窗
const closeDetail = () => {
  detailPopup.value.close()
}

// 返回上一页
const goBack = () => {
  uni.navigateBack()
}

// 初始化
onMounted(() => {
  reportStore.init()

  // 获取当前周日期范围
  const currentWeek = reportStore.getCurrentWeek()
  const weekDates = reportStore.getWeekDates(currentWeek)
  currentWeekStart.value = weekDates.startDate
  currentWeekEnd.value = weekDates.endDate

  // 获取本周周报
  const currentWeeklyReport = reportStore.getCurrentWeeklyReport()
  if (currentWeeklyReport) {
    weeklyReport.value = currentWeeklyReport
  }

  // 获取历史周报
  historyWeekly.value = reportStore.getHistoryWeeklyReports()
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
}

.nav-left {
  width: 60px;
  font-size: 18px;
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
  font-size: 14px;
  color: #666;
}

.report-content {
  height: calc(100vh - 44px);
  padding: 16px;
}

.report-section {
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

.section-title {
  font-size: 17px;
  font-weight: 600;
  color: #333;
}

.section-date {
  font-size: 13px;
  color: #999;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.stat-card {
  background-color: #f8f8f8;
  border-radius: 8px;
  padding: 16px 8px;
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #666;
}

.encourage-text {
  background-color: #fff8e6;
  border-radius: 8px;
  padding: 12px;
  font-size: 14px;
  color: #b8860b;
  line-height: 1.5;
  text-align: center;
}

.history-list {
  margin-top: 12px;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.history-item:last-child {
  border-bottom: none;
}

.history-info {
  display: flex;
  flex-direction: column;
}

.history-week {
  font-size: 15px;
  font-weight: 500;
  color: #333;
}

.history-date {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}

.history-stats {
  font-size: 13px;
  color: #666;
}

.history-points {
  color: #ff9500;
}

.empty-tip {
  text-align: center;
  padding: 24px;
  color: #999;
  font-size: 14px;
}

/* 详情弹窗 */
.detail-modal {
  width: 300px;
  background-color: #fff;
  border-radius: 16px;
  padding: 24px;
}

.detail-header {
  text-align: center;
  margin-bottom: 20px;
}

.detail-title {
  display: block;
  font-size: 20px;
  font-weight: 700;
  color: #333;
}

.detail-date {
  font-size: 13px;
  color: #999;
  margin-top: 4px;
}

.detail-stats {
  margin-bottom: 20px;
}

.detail-stat-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #f5f5f5;
}

.detail-stat-row:last-child {
  border-bottom: none;
}

.detail-stat-label {
  font-size: 14px;
  color: #666;
}

.detail-stat-value {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.detail-stat-value.positive {
  color: #ff9500;
}

.detail-stat-value.negative {
  color: #00b578;
}

.detail-close-btn {
  width: 100%;
  height: 44px;
  line-height: 44px;
  background-color: #007aff;
  color: #fff;
  border-radius: 22px;
  font-size: 16px;
  margin-top: 8px;
}
</style>
