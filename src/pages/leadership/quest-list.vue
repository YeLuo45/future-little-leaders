<template>
  <view class="quest-list-container">
    <!-- 顶部标题 -->
    <view class="header">
      <view class="header-bg"></view>
      <view class="header-content">
        <view class="nav-bar">
          <text class="back-btn" @tap="goBack">←</text>
          <text class="title">领导力任务</text>
          <view class="placeholder"></view>
        </view>
        <view class="header-stats">
          <view class="stat-item">
            <text class="stat-value">{{ questProgress.completed }}</text>
            <text class="stat-label">已完成</text>
          </view>
          <view class="stat-divider"></view>
          <view class="stat-item">
            <text class="stat-value">{{ questProgress.total - questProgress.completed }}</text>
            <text class="stat-label">进行中</text>
          </view>
          <view class="stat-divider"></view>
          <view class="stat-item">
            <text class="stat-value">{{ questProgress.percentage }}%</text>
            <text class="stat-label">完成率</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 筛选区 -->
    <view class="filter-section">
      <view class="filter-tabs">
        <view 
          v-for="filter in filters" 
          :key="filter.key"
          :class="['filter-tab', { active: currentFilter === filter.key }]"
          @tap="setFilter(filter.key)"
        >
          <text>{{ filter.label }}</text>
        </view>
      </view>
    </view>

    <!-- 任务列表 -->
    <scroll-view scroll-y class="quest-scroll">
      <view class="quest-list">
        <view 
          v-for="quest in filteredQuests" 
          :key="quest.id"
          :class="['quest-card', { completed: isQuestCompleted(quest.id) }]"
          @tap="goToQuestDetail(quest)"
        >
          <view class="quest-status" v-if="isQuestCompleted(quest.id)">
            <text>✓</text>
          </view>
          <view class="quest-main">
            <view class="quest-header">
              <view class="quest-info">
                <text class="quest-role-badge">
                  {{ getRoleInfo()[quest.role].icon }} {{ getRoleInfo()[quest.role].label }}
                </text>
                <view class="quest-difficulty">
                  <text v-for="i in quest.difficulty" :key="i">⭐</text>
                </view>
              </view>
              <view class="quest-reward-badge">
                <text>+{{ quest.rewards.points }}</text>
              </view>
            </view>
            <text class="quest-title">{{ quest.title }}</text>
            <text class="quest-desc">{{ quest.description }}</text>
            <view class="quest-objectives">
              <text class="objectives-label">任务目标：</text>
              <text class="objectives-text">{{ quest.objectives.join(' → ') }}</text>
            </view>
            <view class="quest-stats">
              <view class="quest-stat">
                <text>💪 影响力 +{{ quest.rewards.influence }}</text>
              </view>
              <view class="quest-stat">
                <text>🎯 决策力 +{{ quest.rewards.decision }}</text>
              </view>
              <view class="quest-stat">
                <text>💬 沟通力 +{{ quest.rewards.communication }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
      <view v-if="filteredQuests.length === 0" class="empty-state">
        <text class="empty-icon">📋</text>
        <text class="empty-text">暂无任务</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useLeadershipStore } from '@/stores/leadershipStore'

const leadershipStore = useLeadershipStore()

const currentFilter = ref('all')
const filters = [
  { key: 'all', label: '全部' },
  { key: 'easy', label: '简单' },
  { key: 'medium', label: '中等' },
  { key: 'hard', label: '困难' }
]

const difficultyMap = {
  easy: 1,
  medium: 2,
  hard: 3
}

const filteredQuests = computed(() => {
  const quests = leadershipStore.quests
  if (currentFilter.value === 'all') {
    return quests
  }
  const difficulty = difficultyMap[currentFilter.value]
  return quests.filter(q => q.difficulty === difficulty)
})

const questProgress = computed(() => leadershipStore.questProgress)

const getRoleInfo = () => leadershipStore.getRoleInfo()

const isQuestCompleted = (questId) => {
  const completed = leadershipStore.completedQuests
  return completed.some(q => q.id === questId)
}

const setFilter = (key) => {
  currentFilter.value = key
}

const goBack = () => {
  uni.navigateBack()
}

const goToQuestDetail = (quest) => {
  leadershipStore.selectQuest(quest)
  uni.navigateTo({ url: `/pages/leadership/quest-detail?id=${quest.id}` })
}
</script>

<style scoped>
.quest-list-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
}

.header {
  position: relative;
  padding: 120rpx 40rpx 40rpx;
}

.header-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 240rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 0 0 40rpx 40rpx;
}

.header-content {
  position: relative;
  z-index: 1;
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 40rpx;
}

.back-btn {
  font-size: 40rpx;
  color: #ffffff;
  padding: 10rpx 20rpx;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #ffffff;
}

.placeholder {
  width: 60rpx;
}

.header-stats {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 40rpx;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 20rpx;
  padding: 30rpx;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.stat-value {
  font-size: 40rpx;
  font-weight: bold;
  color: #ffffff;
}

.stat-label {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.7);
}

.stat-divider {
  width: 2rpx;
  height: 60rpx;
  background: rgba(255, 255, 255, 0.2);
}

.filter-section {
  padding: 30rpx 40rpx;
}

.filter-tabs {
  display: flex;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16rpx;
  padding: 8rpx;
}

.filter-tab {
  flex: 1;
  padding: 20rpx 0;
  text-align: center;
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.6);
  border-radius: 12rpx;
  transition: all 0.3s ease;
}

.filter-tab.active {
  background: rgba(255, 255, 255, 0.15);
  color: #ffffff;
}

.quest-scroll {
  height: calc(100vh - 400rpx);
  padding: 0 40rpx;
}

.quest-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  padding-bottom: 40rpx;
}

.quest-card {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 24rpx;
  overflow: hidden;
  position: relative;
}

.quest-card.completed {
  opacity: 0.7;
}

.quest-status {
  position: absolute;
  top: 20rpx;
  right: 20rpx;
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background: #52C41A;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 28rpx;
  font-weight: bold;
}

.quest-main {
  padding: 30rpx;
}

.quest-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20rpx;
}

.quest-info {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.quest-role-badge {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.7);
}

.quest-difficulty {
  font-size: 20rpx;
  color: #FFD700;
}

.quest-reward-badge {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
  color: #ffffff;
  font-weight: bold;
}

.quest-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 12rpx;
}

.quest-desc {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 20rpx;
  line-height: 1.5;
}

.quest-objectives {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
}

.objectives-label {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 8rpx;
  display: block;
}

.objectives-text {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
}

.quest-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.quest-stat {
  background: rgba(255, 255, 255, 0.05);
  padding: 10rpx 16rpx;
  border-radius: 10rpx;
}

.quest-stat text {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 20rpx;
}

.empty-text {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.5);
}
</style>
