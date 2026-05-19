<template>
  <view class="eco-tasks-page">
    <!-- 头部统计卡片 -->
    <view class="header-card">
      <view class="points-display">
        <text class="points-icon">🌱</text>
        <view class="points-info">
          <text class="points-value">{{ totalPoints }}</text>
          <text class="points-label">环保积分</text>
        </view>
      </view>
      <view class="stats-row">
        <view class="stat-item">
          <text class="stat-value">{{ taskStats.totalCompleted || 0 }}</text>
          <text class="stat-label">完成任务</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ taskStats.todayCompleted || 0 }}/{{ taskStats.todayTotal || 3 }}</text>
          <text class="stat-label">今日进度</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ badges.length }}</text>
          <text class="stat-label">徽章数</text>
        </view>
      </view>
    </view>

    <!-- 环保贡献统计 -->
    <view class="eco-contribution-card">
      <view class="contribution-title">我的环保贡献</view>
      <view class="contribution-stats">
        <view class="contribution-item">
          <text class="contribution-icon">💧</text>
          <text class="contribution-value">{{ userStats?.waterSaved || 0 }}L</text>
          <text class="contribution-label">节水</text>
        </view>
        <view class="contribution-item">
          <text class="contribution-icon">⚡</text>
          <text class="contribution-value">{{ userStats?.electricitySaved || 0 }}度</text>
          <text class="contribution-label">节电</text>
        </view>
        <view class="contribution-item">
          <text class="contribution-icon">🌿</text>
          <text class="contribution-value">{{ userStats?.carbonReduced || 0 }}kg</text>
          <text class="contribution-label">减碳</text>
        </view>
      </view>
    </view>

    <!-- 今日任务 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">今日环保任务</text>
        <text class="section-subtitle">{{ todayTasks.length }}个任务</text>
      </view>
      
      <view class="task-list">
        <view 
          class="task-item" 
          v-for="task in todayTasks" 
          :key="task.id"
          :class="{ completed: task.completed }"
        >
          <view class="task-icon" :class="task.category">
            {{ getTaskIcon(task.category) }}
          </view>
          <view class="task-info">
            <text class="task-title">{{ task.title }}</text>
            <text class="task-desc">{{ task.description }}</text>
            <view class="task-meta">
              <text class="task-category-tag">{{ task.category }}</text>
              <text class="task-points">+{{ task.points }}积分</text>
            </view>
          </view>
          <view class="task-action">
            <button 
              v-if="!task.completed" 
              class="complete-btn"
              @click="handleCompleteTask(task)"
            >
              完成
            </button>
            <text v-else class="completed-tag">✓已完成</text>
          </view>
        </view>
      </view>

      <view class="empty-tip" v-if="todayTasks.length === 0">
        <text>暂无任务</text>
      </view>
    </view>

    <!-- 徽章展示 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">我的徽章</text>
      </view>
      
      <view class="badges-grid" v-if="badges.length > 0">
        <view 
          class="badge-item" 
          v-for="badge in badges" 
          :key="badge.id"
        >
          <text class="badge-icon">{{ badge.icon }}</text>
          <text class="badge-name">{{ badge.name }}</text>
        </view>
      </view>
      
      <view class="badges-empty" v-else>
        <text class="empty-text">完成挑战获得徽章吧！</text>
      </view>
    </view>

    <!-- 排行榜入口 -->
    <view class="leaderboard-entry" @click="goToLeaderboard">
      <view class="entry-left">
        <text class="entry-icon">🏆</text>
        <view class="entry-info">
          <text class="entry-title">环保排行榜</text>
          <text class="entry-subtitle">查看你在环保小达人们中的排名</text>
        </view>
      </view>
      <text class="entry-arrow">></text>
    </view>
  </view>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useEcoStore } from '@/stores/ecoStore.js'

const ecoStore = useEcoStore()

// 总积分
const totalPoints = computed(() => ecoStore.totalPoints)

// 今日任务
const todayTasks = computed(() => ecoStore.todayTasks)

// 用户统计
const userStats = computed(() => ecoStore.userStats)

// 任务统计
const taskStats = computed(() => ecoStore.taskStats)

// 徽章
const badges = computed(() => ecoStore.badges)

// 获取任务图标
const getTaskIcon = (category) => {
  const icons = {
    '垃圾分类': '🗑️',
    '节约用电': '💡',
    '低碳出行': '🚲',
    '资源回收': '♻️',
    '节约用水': '💧',
    '绿色生活': '🌿',
    '环保教育': '📚',
    '减塑行动': '🥤'
  }
  return icons[category] || '🌱'
}

// 完成任务的处理
const handleCompleteTask = (task) => {
  uni.showModal({
    title: '完成任务',
    content: `确认完成"${task.title}"吗？`,
    success: (res) => {
      if (res.confirm) {
        const result = ecoStore.completeTask(task.id)
        if (result) {
          uni.showToast({ title: `获得${task.points}积分！`, icon: 'success' })
        }
      }
    }
  })
}

// 跳转到排行榜
const goToLeaderboard = () => {
  uni.navigateTo({ url: '/pages/eco/leaderboard' })
}

// 初始化
onMounted(() => {
  ecoStore.init()
})
</script>

<style scoped>
.eco-tasks-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20rpx;
}

.header-card {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  border-radius: 24rpx;
  padding: 40rpx 30rpx;
  color: #fff;
  margin-bottom: 20rpx;
}

.points-display {
  display: flex;
  align-items: center;
  margin-bottom: 30rpx;
}

.points-icon {
  font-size: 64rpx;
  margin-right: 20rpx;
}

.points-info {
  display: flex;
  flex-direction: column;
}

.points-value {
  font-size: 56rpx;
  font-weight: bold;
}

.points-label {
  font-size: 26rpx;
  opacity: 0.9;
}

.stats-row {
  display: flex;
  justify-content: space-around;
  background: rgba(255,255,255,0.2);
  border-radius: 16rpx;
  padding: 20rpx;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 36rpx;
  font-weight: bold;
  display: block;
}

.stat-label {
  font-size: 24rpx;
  opacity: 0.85;
  display: block;
  margin-top: 4rpx;
}

.eco-contribution-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
}

.contribution-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.contribution-stats {
  display: flex;
  justify-content: space-around;
}

.contribution-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.contribution-icon {
  font-size: 40rpx;
  margin-bottom: 8rpx;
}

.contribution-value {
  font-size: 32rpx;
  font-weight: bold;
  color: #11998e;
}

.contribution-label {
  font-size: 24rpx;
  color: #666;
  margin-top: 4rpx;
}

.section {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.section-subtitle {
  font-size: 24rpx;
  color: #999;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.task-item {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background: #f9f9f9;
  border-radius: 12rpx;
  border: 2rpx solid transparent;
}

.task-item.completed {
  background: #e8f5e9;
  border-color: #81c784;
}

.task-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 16rpx;
  background: #e8f5e9;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  margin-right: 16rpx;
}

.task-info {
  flex: 1;
}

.task-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  display: block;
}

.task-desc {
  font-size: 24rpx;
  color: #666;
  margin-top: 4rpx;
  display: block;
}

.task-meta {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-top: 8rpx;
}

.task-category-tag {
  font-size: 20rpx;
  background: #e0f2f1;
  color: #11998e;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
}

.task-points {
  font-size: 22rpx;
  color: #ff9800;
  font-weight: bold;
}

.task-action {
  margin-left: 16rpx;
}

.complete-btn {
  padding: 12rpx 24rpx;
  font-size: 24rpx;
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  color: #fff;
  border-radius: 24rpx;
  border: none;
}

.completed-tag {
  font-size: 24rpx;
  color: #4caf50;
  font-weight: bold;
}

.badges-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.badge-item {
  width: 140rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx;
  background: #f9f9f9;
  border-radius: 12rpx;
}

.badge-icon {
  font-size: 56rpx;
  margin-bottom: 8rpx;
}

.badge-name {
  font-size: 22rpx;
  color: #666;
  text-align: center;
}

.badges-empty {
  text-align: center;
  padding: 40rpx;
}

.empty-text {
  font-size: 26rpx;
  color: #999;
}

.leaderboard-entry {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.entry-left {
  display: flex;
  align-items: center;
}

.entry-icon {
  font-size: 48rpx;
  margin-right: 16rpx;
}

.entry-info {
  display: flex;
  flex-direction: column;
}

.entry-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}

.entry-subtitle {
  font-size: 24rpx;
  color: #999;
  margin-top: 4rpx;
}

.entry-arrow {
  font-size: 32rpx;
  color: #999;
}

.empty-tip {
  text-align: center;
  padding: 40rpx;
  color: #999;
  font-size: 28rpx;
}
</style>
