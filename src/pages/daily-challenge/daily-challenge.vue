<!-- V80 Daily Challenge 每日挑战页面 -->
<template>
  <view class="page-container">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <view class="nav-left" @tap="goBack">
        <text class="icon">←</text>
      </view>
      <text class="nav-title">每日挑战</text>
      <view class="nav-right" @tap="showCalendar">
        <text class="icon">📅</text>
      </view>
    </view>

    <!-- 连续挑战徽章 -->
    <view class="streak-header">
      <view class="streak-info">
        <text class="streak-icon">🔥</text>
        <view class="streak-text">
          <text class="streak-count">{{ dailyChallengeStore.streakDays }}</text>
          <text class="streak-label">连续挑战天数</text>
        </view>
      </view>
      <view class="streak-reward" v-if="dailyChallengeStore.nextStreakReward">
        <text class="next-milestone">距离{{ dailyChallengeStore.nextStreakReward.days }}天奖励还差</text>
        <text class="days-left">{{ dailyChallengeStore.nextStreakReward.days - dailyChallengeStore.streakDays }}天</text>
      </view>
    </view>

    <!-- 进度卡片 -->
    <view class="progress-card">
      <view class="progress-header">
        <text class="progress-title">今日任务</text>
        <text class="progress-count">{{ dailyChallengeStore.completedTodayCount }}/{{ dailyChallengeStore.todayTasks.length }}</text>
      </view>
      <view class="progress-bar">
        <view class="progress-fill" :style="{ width: dailyChallengeStore.todayProgress + '%' }"></view>
      </view>
      <view class="progress-footer">
        <text class="total-points">累计积分: {{ dailyChallengeStore.challengePoints }}</text>
        <text class="today-points">+{{ todayEarnedPoints }} 今日</text>
      </view>
    </view>

    <!-- 难度筛选 -->
    <view class="difficulty-filter">
      <view
        v-for="level in difficultyLevels"
        :key="level.key"
        class="difficulty-tab"
        :class="{ active: activeDifficulty === level.key }"
        @tap="activeDifficulty = level.key"
      >
        <text class="diff-icon">{{ level.icon }}</text>
        <text class="diff-name">{{ level.name }}</text>
      </view>
    </view>

    <!-- 任务列表 -->
    <scroll-view scroll-y class="task-list">
      <view v-if="filteredTasks.length > 0">
        <view
          v-for="task in filteredTasks"
          :key="task.id"
          class="task-card"
          :class="{ completed: task.completed }"
        >
          <!-- 左侧：任务信息 -->
          <view class="task-left">
            <view class="task-main">
              <text class="task-title">{{ task.title }}</text>
              <view class="task-meta">
                <text class="task-category">{{ categoryLabels[task.category] || task.category }}</text>
                <text class="task-difficulty" :class="`diff-${task.difficulty}`">
                  {{ difficultyLabels[task.difficulty] }}
                </text>
              </view>
            </view>
          </view>

          <!-- 右侧：积分和操作 -->
          <view class="task-right">
            <view class="task-points">
              <text class="points-value">+{{ task.points }}</text>
              <text class="points-label">积分</text>
            </view>
            <button
              v-if="!task.completed"
              class="complete-btn"
              :class="`btn-${task.difficulty}`"
              @tap="handleComplete(task)"
            >
              完成
            </button>
            <text v-else class="completed-badge">✓ 已完成</text>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-else class="empty-state">
        <text class="empty-icon">🎯</text>
        <text class="empty-text">今日任务已全部完成！</text>
        <text class="empty-hint">明天再来领取新的挑战吧</text>
      </view>
    </scroll-view>

    <!-- 日历弹窗 -->
    <view v-if="showCalendarModal" class="modal-overlay" @tap="showCalendarModal = false">
      <view class="calendar-modal" @tap.stop>
        <view class="modal-header">
          <text class="modal-title">挑战日历</text>
          <text class="modal-close" @tap="showCalendarModal = false">×</text>
        </view>

        <!-- 月份切换 -->
        <view class="month-nav">
          <text class="month-btn" @tap="prevMonth">‹</text>
          <text class="month-label">{{ currentYear }}年{{ currentMonth }}月</text>
          <text class="month-btn" @tap="nextMonth">›</text>
        </view>

        <!-- 统计数据 -->
        <view class="month-stats" v-if="monthlyStats">
          <view class="stat-item">
            <text class="stat-value">{{ monthlyStats.activeDays }}</text>
            <text class="stat-label">活跃天数</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ monthlyStats.totalPoints }}</text>
            <text class="stat-label">累计积分</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ monthlyStats.completionRate }}%</text>
            <text class="stat-label">完成率</text>
          </view>
        </view>

        <!-- 星期标题 -->
        <view class="weekday-row">
          <text v-for="day in weekDays" :key="day" class="weekday">{{ day }}</text>
        </view>

        <!-- 日历网格 -->
        <view class="calendar-grid">
          <view
            v-for="(day, index) in calendarDays"
            :key="index"
            class="calendar-day"
            :class="{
              'has-task': day && day.completed,
              'is-today': day && day.date === todayString,
              'is-empty': !day
            }"
          >
            <text v-if="day">{{ day.day }}</text>
            <view v-if="day && day.completed" class="day-dot"></view>
          </view>
        </view>
      </view>
    </view>

    <!-- 完成结果弹窗 -->
    <view v-if="showResultModal" class="modal-overlay" @tap="showResultModal = false">
      <view class="result-modal" @tap.stop>
        <text class="result-icon">🎉</text>
        <text class="result-title">任务完成！</text>
        <view class="result-points">
          <text class="points-earned">+{{ resultData.points }}</text>
          <text class="points-unit">积分</text>
        </view>
        <view class="result-detail">
          <view class="detail-item">
            <text class="detail-label">任务积分</text>
            <text class="detail-value">+{{ resultData.points - resultData.streakBonus }}</text>
          </view>
          <view class="detail-item" v-if="resultData.streakBonus > 0">
            <text class="detail-label">连续加成</text>
            <text class="detail-value streak">+{{ resultData.streakBonus }}</text>
          </view>
          <view class="detail-item milestone" v-if="resultData.milestone">
            <text class="detail-label">里程碑奖励</text>
            <text class="detail-value">+{{ resultData.milestone.bonus }}</text>
          </view>
        </view>
        <view class="streak-info-result">
          <text class="streak-fire">🔥</text>
          <text class="streak-text-result">已连续 {{ resultData.streakDays }} 天</text>
        </view>
        <button class="result-close-btn" @tap="showResultModal = false">继续挑战</button>
      </view>
    </view>

    <!-- 底部导航提示 -->
    <view class="bottom-tip" v-if="!dailyChallengeStore.allCompletedToday && dailyChallengeStore.completedTodayCount > 0">
      <text>再完成 {{ dailyChallengeStore.todayTasks.length - dailyChallengeStore.completedTodayCount }} 个任务即可完成今日挑战</text>
    </view>
  </view>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useDailyChallengeStore } from '@/stores/dailyChallengeStore'
import { useBabyStore } from '@/stores/babyStore'

export default {
  setup() {
    const dailyChallengeStore = useDailyChallengeStore()
    const babyStore = useBabyStore()

    const activeDifficulty = ref('all')
    const showCalendarModal = ref(false)
    const showResultModal = ref(false)
    const resultData = ref({})
    const currentYear = ref(new Date().getFullYear())
    const currentMonth = ref(new Date().getMonth() + 1)

    const weekDays = ['日', '一', '二', '三', '四', '五', '六']

    const difficultyLabels = {
      easy: '简单',
      medium: '中等',
      hard: '困难',
      expert: '专家'
    }

    const categoryLabels = {
      reading: '阅读',
      writing: '写作',
      math: '数学',
      language: '语言',
      health: '健康',
      life: '生活',
      art: '艺术',
      science: '科学',
      critical: '思维'
    }

    const difficultyLevels = [
      { key: 'all', name: '全部', icon: '📋' },
      { key: 'easy', name: '简单', icon: '⭐' },
      { key: 'medium', name: '中等', icon: '🌟' },
      { key: 'hard', name: '困难', icon: '💫' },
      { key: 'expert', name: '专家', icon: '👑' }
    ]

    const todayString = computed(() => dailyChallengeStore.getTodayString())

    const todayEarnedPoints = computed(() => {
      return dailyChallengeStore.todayTasks
        .filter(t => t.completed)
        .reduce((sum, t) => sum + t.points, 0)
    })

    const filteredTasks = computed(() => {
      if (activeDifficulty.value === 'all') {
        return dailyChallengeStore.todayTasks
      }
      return dailyChallengeStore.todayTasks.filter(t => t.difficulty === activeDifficulty.value)
    })

    const monthlyStats = computed(() => {
      return dailyChallengeStore.getMonthlyStats(currentYear.value, currentMonth.value)
    })

    const calendarDays = computed(() => {
      if (!monthlyStats.value) return []
      const { calendar } = monthlyStats.value
      const firstDay = new Date(currentYear.value, currentMonth.value - 1, 1).getDay()
      const days = []

      // 填充空白
      for (let i = 0; i < firstDay; i++) {
        days.push(null)
      }
      // 填充日期
      days.push(...calendar)
      return days
    })

    const handleComplete = (task) => {
      const result = dailyChallengeStore.completeTask(task.id)
      if (result.success) {
        resultData.value = result
        showResultModal.value = true
      } else {
        uni.showToast({ title: result.message, icon: 'none' })
      }
    }

    const showCalendar = () => {
      showCalendarModal.value = true
    }

    const prevMonth = () => {
      if (currentMonth.value === 1) {
        currentMonth.value = 12
        currentYear.value--
      } else {
        currentMonth.value--
      }
    }

    const nextMonth = () => {
      if (currentMonth.value === 12) {
        currentMonth.value = 1
        currentYear.value++
      } else {
        currentMonth.value++
      }
    }

    const goBack = () => {
      uni.navigateBack()
    }

    onMounted(() => {
      dailyChallengeStore.init()
    })

    return {
      dailyChallengeStore,
      activeDifficulty,
      showCalendarModal,
      showResultModal,
      resultData,
      currentYear,
      currentMonth,
      weekDays,
      difficultyLabels,
      categoryLabels,
      difficultyLevels,
      todayString,
      todayEarnedPoints,
      filteredTasks,
      monthlyStats,
      calendarDays,
      handleComplete,
      showCalendar,
      prevMonth,
      nextMonth,
      goBack
    }
  }
}
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.nav-bar {
  display: flex;
  align-items: center;
  height: 88rpx;
  background: linear-gradient(135deg, #FF6B35, #F7931E);
  padding: 90rpx 40rpx 60rpx;
  position: relative;
}

.nav-left, .nav-right {
  width: 60rpx;
}

.icon {
  color: white;
  font-size: 48rpx;
  font-weight: bold;
}

.nav-title {
  flex: 1;
  text-align: center;
  color: white;
  font-size: 36rpx;
  font-weight: bold;
}

.streak-header {
  background: linear-gradient(135deg, #FF6B35, #F7931E);
  padding: 30rpx 40rpx 40rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.streak-info {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.streak-icon {
  font-size: 64rpx;
}

.streak-text {
  display: flex;
  flex-direction: column;
}

.streak-count {
  font-size: 56rpx;
  font-weight: bold;
  color: white;
  line-height: 1;
}

.streak-label {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
}

.streak-reward {
  text-align: right;
}

.next-milestone {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.8);
  display: block;
}

.days-left {
  font-size: 32rpx;
  color: white;
  font-weight: bold;
}

.progress-card {
  background: white;
  margin: -20rpx 30rpx 20rpx;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
  position: relative;
  z-index: 1;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.progress-title {
  font-size: 30rpx;
  color: #333;
  font-weight: bold;
}

.progress-count {
  font-size: 28rpx;
  color: #FF6B35;
  font-weight: bold;
}

.progress-bar {
  height: 16rpx;
  background: #f0f0f0;
  border-radius: 8rpx;
  overflow: hidden;
  margin-bottom: 20rpx;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #FF6B35, #F7931E);
  border-radius: 8rpx;
  transition: width 0.3s ease;
}

.progress-footer {
  display: flex;
  justify-content: space-between;
}

.total-points {
  font-size: 26rpx;
  color: #666;
}

.today-points {
  font-size: 26rpx;
  color: #FF6B35;
  font-weight: bold;
}

.difficulty-filter {
  display: flex;
  gap: 16rpx;
  padding: 0 30rpx 20rpx;
  overflow-x: auto;
}

.difficulty-tab {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 24rpx;
  background: white;
  border-radius: 30rpx;
  white-space: nowrap;
}

.difficulty-tab.active {
  background: linear-gradient(135deg, #FF6B35, #F7931E);
}

.difficulty-tab.active .diff-name {
  color: white;
}

.diff-icon {
  font-size: 24rpx;
}

.diff-name {
  font-size: 24rpx;
  color: #666;
}

.task-list {
  height: calc(100vh - 600rpx);
  padding: 0 30rpx;
}

.task-card {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.task-card.completed {
  opacity: 0.7;
}

.task-left {
  flex: 1;
}

.task-main {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.task-title {
  font-size: 30rpx;
  color: #333;
  font-weight: bold;
}

.task-meta {
  display: flex;
  gap: 16rpx;
  align-items: center;
}

.task-category {
  font-size: 22rpx;
  color: #999;
  background: #f5f5f5;
  padding: 4rpx 16rpx;
  border-radius: 20rpx;
}

.task-difficulty {
  font-size: 22rpx;
  padding: 4rpx 16rpx;
  border-radius: 20rpx;
}

.diff-easy {
  color: #10B981;
  background: #E8F8F0;
}

.diff-medium {
  color: #F59E0B;
  background: #FEF9E8;
}

.diff-hard {
  color: #EF4444;
  background: #FEE8E8;
}

.diff-expert {
  color: #8B5CF6;
  background: #F3E8FF;
}

.task-right {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.task-points {
  text-align: center;
}

.points-value {
  font-size: 36rpx;
  color: #FF6B35;
  font-weight: bold;
  display: block;
}

.points-label {
  font-size: 20rpx;
  color: #999;
}

.complete-btn {
  padding: 16rpx 36rpx;
  border-radius: 30rpx;
  font-size: 26rpx;
  border: none;
  color: white;
}

.btn-easy {
  background: #10B981;
}

.btn-medium {
  background: #F59E0B;
}

.btn-hard {
  background: #EF4444;
}

.btn-expert {
  background: #8B5CF6;
}

.completed-badge {
  font-size: 26rpx;
  color: #10B981;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 120rpx;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 30rpx;
}

.empty-text {
  font-size: 32rpx;
  color: #333;
  font-weight: bold;
  margin-bottom: 16rpx;
}

.empty-hint {
  font-size: 26rpx;
  color: #999;
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 999;
}

.calendar-modal {
  background: white;
  border-radius: 30rpx 30rpx 0 0;
  width: 100%;
  max-height: 80vh;
  padding: 30rpx;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.modal-title {
  font-size: 34rpx;
  font-weight: bold;
  color: #333;
}

.modal-close {
  font-size: 60rpx;
  color: #999;
  line-height: 1;
}

.month-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.month-btn {
  font-size: 48rpx;
  color: #FF6B35;
  padding: 0 20rpx;
}

.month-label {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}

.month-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 30rpx;
  padding: 20rpx;
  background: #f9f9f9;
  border-radius: 16rpx;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 36rpx;
  font-weight: bold;
  color: #FF6B35;
  display: block;
}

.stat-label {
  font-size: 22rpx;
  color: #666;
}

.weekday-row {
  display: flex;
  margin-bottom: 16rpx;
}

.weekday {
  flex: 1;
  text-align: center;
  font-size: 24rpx;
  color: #999;
}

.calendar-grid {
  display: flex;
  flex-wrap: wrap;
}

.calendar-day {
  width: 14.28%;
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  color: #333;
  position: relative;
}

.calendar-day.is-empty {
  color: transparent;
}

.calendar-day.has-task {
  color: white;
  background: #FF6B35;
  border-radius: 50%;
}

.calendar-day.is-today {
  border: 2rpx solid #FF6B35;
  border-radius: 50%;
}

.calendar-day.has-task.is-today {
  background: #FF6B35;
}

.day-dot {
  width: 8rpx;
  height: 8rpx;
  background: white;
  border-radius: 50%;
  position: absolute;
  bottom: 8rpx;
}

/* 结果弹窗 */
.result-modal {
  background: white;
  border-radius: 30rpx;
  width: 80%;
  padding: 50rpx 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.result-icon {
  font-size: 100rpx;
  margin-bottom: 20rpx;
}

.result-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 30rpx;
}

.result-points {
  text-align: center;
  margin-bottom: 30rpx;
}

.points-earned {
  font-size: 72rpx;
  font-weight: bold;
  color: #FF6B35;
}

.points-unit {
  font-size: 28rpx;
  color: #666;
}

.result-detail {
  width: 100%;
  background: #f9f9f9;
  border-radius: 16rpx;
  padding: 20rpx;
  margin-bottom: 30rpx;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 10rpx 0;
}

.detail-label {
  font-size: 26rpx;
  color: #666;
}

.detail-value {
  font-size: 26rpx;
  color: #333;
  font-weight: bold;
}

.detail-value.streak {
  color: #FF6B35;
}

.detail-item.milestone {
  border-top: 1rpx solid #eee;
  margin-top: 10rpx;
  padding-top: 20rpx;
}

.streak-info-result {
  display: flex;
  align-items: center;
  gap: 10rpx;
  margin-bottom: 40rpx;
}

.streak-fire {
  font-size: 40rpx;
}

.streak-text-result {
  font-size: 28rpx;
  color: #FF6B35;
  font-weight: bold;
}

.result-close-btn {
  width: 100%;
  padding: 24rpx;
  background: linear-gradient(135deg, #FF6B35, #F7931E);
  color: white;
  border-radius: 30rpx;
  font-size: 30rpx;
  border: none;
}

.bottom-tip {
  position: fixed;
  bottom: 40rpx;
  left: 30rpx;
  right: 30rpx;
  background: linear-gradient(135deg, #FF6B35, #F7931E);
  color: white;
  padding: 20rpx 30rpx;
  border-radius: 30rpx;
  text-align: center;
  font-size: 26rpx;
  box-shadow: 0 4rpx 20rpx rgba(255, 107, 53, 0.3);
}
</style>
