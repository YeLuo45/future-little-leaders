<!-- 日常仪式主页 -->
<template>
  <view class="page-container">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <view class="nav-left" @tap="goBack">
        <text class="icon">←</text>
      </view>
      <text class="nav-title">日常仪式</text>
      <view class="nav-right" @tap="showAddSpecialDay">
        <text class="icon">+</text>
      </view>
    </view>

    <!-- 今日状态卡片 -->
    <view class="today-status-card">
      <view class="status-header">
        <text class="date-text">{{ todayDate }}</text>
        <text class="weekday-text">{{ weekdayText }}</text>
      </view>
      <view class="status-content">
        <view class="status-item morning" :class="{ completed: store.isMorningComplete }">
          <text class="status-icon">🌅</text>
          <text class="status-label">晨间惯例</text>
          <text class="status-streak" v-if="store.morningStreak > 0">🔥 {{ store.morningStreak }}天</text>
        </view>
        <view class="status-divider">|</view>
        <view class="status-item evening" :class="{ completed: store.isEveningComplete }">
          <text class="status-icon">🌙</text>
          <text class="status-label">晚间惯例</text>
          <text class="status-streak" v-if="store.eveningStreak > 0">🔥 {{ store.eveningStreak }}天</text>
        </view>
      </view>
    </view>

    <!-- 模块选择卡片 -->
    <view class="modules-section">
      <text class="section-title">仪式模块</text>
      
      <!-- 晨间惯例卡片 -->
      <view class="module-card morning-card" @tap="navigateTo('morning-routine')">
        <view class="module-header">
          <view class="module-icon-wrapper morning">
            <text class="module-icon">🌅</text>
          </view>
          <view class="module-info">
            <text class="module-title">晨间惯例</text>
            <text class="module-subtitle">起床仪式 · 早间检查</text>
          </view>
          <view class="module-arrow">›</view>
        </view>
        <view class="module-progress">
          <view class="progress-bar">
            <view class="progress-fill morning" :style="{ width: store.morningProgress + '%' }"></view>
          </view>
          <text class="progress-text">{{ store.morningProgress }}%</text>
        </view>
      </view>

      <!-- 晚间惯例卡片 -->
      <view class="module-card evening-card" @tap="navigateTo('evening-routine')">
        <view class="module-header">
          <view class="module-icon-wrapper evening">
            <text class="module-icon">🌙</text>
          </view>
          <view class="module-info">
            <text class="module-title">晚间惯例</text>
            <text class="module-subtitle">睡前仪式 · 日终总结</text>
          </view>
          <view class="module-arrow">›</view>
        </view>
        <view class="module-progress">
          <view class="progress-bar">
            <view class="progress-fill evening" :style="{ width: store.eveningProgress + '%' }"></view>
          </view>
          <text class="progress-text">{{ store.eveningProgress }}%</text>
        </view>
      </view>

      <!-- 特别日仪式卡片 -->
      <view class="module-card special-card" @tap="navigateTo('special-days')">
        <view class="module-header">
          <view class="module-icon-wrapper special">
            <text class="module-icon">🎉</text>
          </view>
          <view class="module-info">
            <text class="module-title">特别日仪式</text>
            <text class="module-subtitle">生日 · 成就庆祝</text>
          </view>
          <view class="module-badge" v-if="store.upcomingSpecialDays.length > 0">
            {{ store.upcomingSpecialDays.length }}
          </view>
        </view>
        <view class="upcoming-days" v-if="store.upcomingSpecialDays.length > 0">
          <text class="upcoming-label">即将到来:</text>
          <text class="upcoming-item" v-for="day in store.upcomingSpecialDays.slice(0, 2)" :key="day.id">
            {{ day.icon || '⭐' }} {{ day.name }}
          </text>
        </view>
      </view>
    </view>

    <!-- 本周统计 -->
    <view class="stats-section">
      <text class="section-title">本周统计</text>
      <view class="stats-grid">
        <view class="stat-card">
          <text class="stat-value">{{ store.weekRecords.length }}</text>
          <text class="stat-label">完成次数</text>
        </view>
        <view class="stat-card">
          <text class="stat-value">{{ store.totalExpGained }}</text>
          <text class="stat-label">获得经验</text>
        </view>
        <view class="stat-card">
          <text class="stat-value">{{ store.morningStreak }}</text>
          <text class="stat-label">晨间连续</text>
        </view>
        <view class="stat-card">
          <text class="stat-value">{{ store.eveningStreak }}</text>
          <text class="stat-label">晚间连续</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { onMounted, computed } from from 'vue'
import { useDailyCeremoniesStore } from '@/stores/dailyCeremoniesStore.js'
import { useBabyStore } from '@/stores/babyStore.js'

export default {
  setup() {
    const store = useDailyCeremoniesStore()
    const babyStore = useBabyStore()

    onMounted(() => {
      store.init()
      babyStore.loadBabies()
      if (babyStore.currentBabyId) {
        store.setCurrentBaby(babyStore.currentBabyId)
      }
    })

    const todayDate = computed(() => {
      const now = new Date()
      const month = now.getMonth() + 1
      const day = now.getDate()
      return `${month}月${day}日`
    })

    const weekdayText = computed(() => {
      const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
      const now = new Date()
      return weekdays[now.getDay()]
    })

    const navigateTo = (page) => {
      uni.navigateTo({ url: `/pages/daily-ceremonies/${page}` })
    }

    const goBack = () => {
      uni.navigateBack()
    }

    const showAddSpecialDay = () => {
      uni.navigateTo({ url: '/pages/daily-ceremonies/add-special-day' })
    }

    return {
      store,
      todayDate,
      weekdayText,
      navigateTo,
      goBack,
      showAddSpecialDay
    }
  }
}
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
  padding-bottom: 40rpx;
}

.nav-bar {
  display: flex;
  align-items: center;
  padding: 60px 32rpx 32rpx;
  background: transparent;
}

.nav-left .icon, .nav-right .icon {
  font-size: 48rpx;
  color: #fff;
}

.nav-title {
  flex: 1;
  text-align: center;
  font-size: 36rpx;
  font-weight: bold;
  color: #fff;
}

.nav-right {
  width: 60rpx;
  text-align: center;
}

.today-status-card {
  margin: 0 32rpx 32rpx;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24rpx;
  padding: 32rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.date-text {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.weekday-text {
  font-size: 28rpx;
  color: #666;
}

.status-content {
  display: flex;
  align-items: center;
  justify-content: space-around;
}

.status-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx 40rpx;
  border-radius: 16rpx;
  background: #f5f5f5;
  opacity: 0.6;
}

.status-item.completed {
  background: #e8f5e9;
  opacity: 1;
}

.status-icon {
  font-size: 48rpx;
  margin-bottom: 8rpx;
}

.status-label {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 4rpx;
}

.status-streak {
  font-size: 22rpx;
  color: #ff6b6b;
  font-weight: bold;
}

.status-divider {
  font-size: 48rpx;
  color: #ddd;
}

.modules-section {
  margin: 0 32rpx 32rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #fff;
  margin-bottom: 20rpx;
  display: block;
}

.module-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 28rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
}

.module-header {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.module-icon-wrapper {
  width: 80rpx;
  height: 80rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
}

.module-icon-wrapper.morning {
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
}

.module-icon-wrapper.evening {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
}

.module-icon-wrapper.special {
  background: linear-gradient(135deg, #ffecd2 0%, #ff9a9e 100%);
}

.module-icon {
  font-size: 40rpx;
}

.module-info {
  flex: 1;
}

.module-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 4rpx;
}

.module-subtitle {
  font-size: 24rpx;
  color: #999;
}

.module-arrow {
  font-size: 48rpx;
  color: #ccc;
}

.module-badge {
  background: #ff6b6b;
  color: #fff;
  font-size: 22rpx;
  padding: 4rpx 16rpx;
  border-radius: 20rpx;
}

.module-progress {
  display: flex;
  align-items: center;
}

.progress-bar {
  flex: 1;
  height: 12rpx;
  background: #f0f0f0;
  border-radius: 6rpx;
  overflow: hidden;
  margin-right: 16rpx;
}

.progress-fill {
  height: 100%;
  border-radius: 6rpx;
  transition: width 0.3s;
}

.progress-fill.morning {
  background: linear-gradient(90deg, #fcb69f, #ff9a9e);
}

.progress-fill.evening {
  background: linear-gradient(90deg, #a8edea, #fed6e3);
}

.progress-text {
  font-size: 24rpx;
  color: #999;
  min-width: 60rpx;
  text-align: right;
}

.upcoming-days {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12rpx;
}

.upcoming-label {
  font-size: 24rpx;
  color: #999;
}

.upcoming-item {
  font-size: 24rpx;
  color: #666;
  background: #f5f5f5;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
}

.stats-section {
  margin: 0 32rpx;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16rpx;
}

.stat-card {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 16rpx;
  padding: 20rpx 8rpx;
  text-align: center;
  backdrop-filter: blur(10px);
}

.stat-value {
  font-size: 36rpx;
  font-weight: bold;
  color: #fff;
  display: block;
  margin-bottom: 4rpx;
}

.stat-label {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.8);
}
</style>
