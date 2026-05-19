<template>
  <view class="quest-detail-container">
    <!-- 顶部区域 -->
    <view class="header-section">
      <view class="header-bg"></view>
      <view class="header-content">
        <view class="nav-bar">
          <text class="back-btn" @tap="goBack">←</text>
          <text class="title">任务详情</text>
          <view class="placeholder"></view>
        </view>
      </view>
    </view>

    <!-- 任务详情内容 -->
    <scroll-view scroll-y class="content-scroll">
      <view class="quest-content" v-if="currentQuest">
        <!-- 任务信息卡片 -->
        <view class="quest-info-card">
          <view class="quest-header">
            <view class="role-badge">
              {{ getRoleInfo()[currentQuest.role].icon }} {{ getRoleInfo()[currentQuest.role].label }}
            </view>
            <view class="difficulty-badge" :style="{ color: getDifficultyInfo()[currentQuest.difficulty].color }">
              <text v-for="i in currentQuest.difficulty" :key="i">⭐</text>
            </view>
          </view>
          
          <text class="quest-title">{{ currentQuest.title }}</text>
          <text class="quest-desc">{{ currentQuest.description }}</text>
          
          <!-- 任务目标 -->
          <view class="objectives-section">
            <text class="section-title">📋 任务目标</text>
            <view class="objectives-list">
              <view 
                v-for="(objective, index) in currentQuest.objectives" 
                :key="index"
                :class="['objective-item', { completed: isObjectiveCompleted(index) }]"
              >
                <view class="objective-check">
                  <text v-if="isObjectiveCompleted(index)">✓</text>
                  <text v-else>{{ index + 1 }}</text>
                </view>
                <text class="objective-text">{{ objective }}</text>
              </view>
            </view>
          </view>
          
          <!-- 奖励预览 -->
          <view class="rewards-section">
            <text class="section-title">🎁 任务奖励</text>
            <view class="rewards-grid">
              <view class="reward-item main">
                <text class="reward-value">+{{ currentQuest.rewards.points }}</text>
                <text class="reward-label">积分</text>
              </view>
              <view class="reward-item">
                <text class="reward-icon">{{ STATS_INFO[LEADERSHIP_STATS.INFLUENCE].icon }}</text>
                <text class="reward-value">+{{ currentQuest.rewards.influence }}</text>
                <text class="reward-label">影响力</text>
              </view>
              <view class="reward-item">
                <text class="reward-icon">{{ STATS_INFO[LEADERSHIP_STATS.DECISION].icon }}</text>
                <text class="reward-value">+{{ currentQuest.rewards.decision }}</text>
                <text class="reward-label">决策力</text>
              </view>
              <view class="reward-item">
                <text class="reward-icon">{{ STATS_INFO[LEADERSHIP_STATS.COMMUNICATION].icon }}</text>
                <text class="reward-value">+{{ currentQuest.rewards.communication }}</text>
                <text class="reward-label">沟通力</text>
              </view>
            </view>
          </view>
        </view>
        
        <!-- 完成状态 -->
        <view class="completion-card" v-if="isCompleted">
          <text class="completion-icon">🏆</text>
          <text class="completion-text">任务已完成</text>
          <view class="completion-result" v-if="completionResult">
            <text>获得 {{ completionResult.rewards.points }} 积分</text>
            <text v-if="completionResult.leveledUp">升级到 Lv.{{ completionResult.newLevel }}！</text>
          </view>
        </view>
        
        <!-- 操作按钮 -->
        <view class="action-section" v-if="!isCompleted">
          <view class="action-btn primary" @tap="startQuest" v-if="!isInProgress">
            <text>开始任务</text>
          </view>
          
          <view class="action-btn secondary" @tap="abandonQuest" v-if="isInProgress">
            <text>放弃任务</text>
          </view>
        </view>
      </view>
      
      <view v-else class="empty-state">
        <text>任务不存在</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useLeadershipStore } from '@/stores/leadershipStore'
import { LEADERSHIP_STATS, STATS_INFO } from '@/services/leadershipService'

const leadershipStore = useLeadershipStore()

const completionResult = ref(null)

const currentQuest = computed(() => leadershipStore.currentQuest)

const isCompleted = computed(() => {
  if (!currentQuest.value) return false
  return leadershipStore.completedQuests.some(q => q.id === currentQuest.value.id)
})

const isInProgress = computed(() => {
  if (!currentQuest.value) return false
  return leadershipStore.activeQuest?.questId === currentQuest.value.id
})

const getRoleInfo = () => leadershipStore.getRoleInfo()
const getDifficultyInfo = () => leadershipStore.getDifficultyInfo()

const isObjectiveCompleted = (index) => {
  if (!isInProgress.value) return false
  return leadershipStore.activeQuest?.currentObjectiveIndex >= index
}

const goBack = () => {
  uni.navigateBack()
}

const startQuest = () => {
  if (!currentQuest.value) return
  leadershipStore.startQuest(currentQuest.value)
  leadershipStore.acceptQuest(currentQuest.value.id)
  
  // 模拟完成任务流程
  uni.showModal({
    title: '任务进行中',
    content: '任务目标：\n' + currentQuest.value.objectives.join('\n'),
    showCancel: false,
    confirmText: '完成任务',
    success: (res) => {
      if (res.confirm) {
        completeQuest()
      }
    }
  })
}

const completeQuest = () => {
  if (!currentQuest.value) return
  const result = leadershipStore.completeQuest(currentQuest.value.id, {
    objectives: currentQuest.value.objectives
  })
  completionResult.value = result
  
  if (result?.leveledUp) {
    uni.showModal({
      title: '🎉 升级了！',
      content: `恭喜升级到 Lv.${result.newLevel}！`,
      showCancel: false
    })
  }
}

const abandonQuest = () => {
  if (!currentQuest.value) return
  uni.showModal({
    title: '确认放弃',
    content: '确定要放弃这个任务吗？',
    success: (res) => {
      if (res.confirm) {
        leadershipStore.abandonQuest(currentQuest.value.id)
        goBack()
      }
    }
  })
}
</script>

<style scoped>
.quest-detail-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
}

.header-section {
  position: relative;
  padding: 120rpx 40rpx 40rpx;
}

.header-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 200rpx;
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

.content-scroll {
  height: calc(100vh - 240rpx);
  padding: 0 40rpx;
}

.quest-content {
  padding-bottom: 120rpx;
}

.quest-info-card {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 24rpx;
  padding: 40rpx;
  margin-top: -20rpx;
}

.quest-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.role-badge {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.7);
  background: rgba(255, 255, 255, 0.1);
  padding: 10rpx 20rpx;
  border-radius: 20rpx;
}

.difficulty-badge {
  font-size: 24rpx;
}

.quest-title {
  font-size: 40rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 16rpx;
  display: block;
}

.quest-desc {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.6;
  margin-bottom: 40rpx;
  display: block;
}

.section-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 24rpx;
  display: block;
}

.objectives-section {
  margin-bottom: 40rpx;
}

.objectives-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.objective-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 20rpx;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16rpx;
  transition: all 0.3s ease;
}

.objective-item.completed {
  background: rgba(82, 196, 26, 0.15);
}

.objective-check {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.6);
}

.objective-item.completed .objective-check {
  background: #52C41A;
  color: #ffffff;
}

.objective-text {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
  flex: 1;
}

.rewards-section {
  margin-top: 40rpx;
}

.rewards-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.reward-item {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16rpx;
  padding: 30rpx 20rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.reward-item.main {
  background: linear-gradient(135deg, rgba(240, 147, 251, 0.2) 0%, rgba(245, 87, 108, 0.2) 100%);
  grid-column: span 2;
}

.reward-icon {
  font-size: 40rpx;
}

.reward-value {
  font-size: 36rpx;
  font-weight: bold;
  color: #ffffff;
}

.reward-label {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.6);
}

.completion-card {
  background: linear-gradient(135deg, rgba(82, 196, 26, 0.2) 0%, rgba(82, 196, 26, 0.05) 100%);
  border-radius: 24rpx;
  padding: 60rpx 40rpx;
  margin-top: 30rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
}

.completion-icon {
  font-size: 80rpx;
}

.completion-text {
  font-size: 32rpx;
  font-weight: bold;
  color: #52C41A;
}

.completion-result {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  margin-top: 10rpx;
}

.completion-result text {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.8);
}

.action-section {
  margin-top: 40rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.action-btn {
  padding: 30rpx;
  border-radius: 50rpx;
  text-align: center;
  font-size: 32rpx;
  font-weight: bold;
}

.action-btn.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
}

.action-btn.secondary {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 100rpx;
}

.empty-state text {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.5);
}
</style>
