<template>
  <view class="scenario-list-container">
    <!-- 顶部标题 -->
    <view class="header">
      <view class="header-bg"></view>
      <view class="header-content">
        <view class="nav-bar">
          <text class="back-btn" @tap="goBack">←</text>
          <text class="title">角色扮演</text>
          <view class="placeholder"></view>
        </view>
        <view class="header-stats">
          <view class="stat-item">
            <text class="stat-value">{{ scenarioProgress.completed }}</text>
            <text class="stat-label">已完成</text>
          </view>
          <view class="stat-divider"></view>
          <view class="stat-item">
            <text class="stat-value">{{ scenarioProgress.total }}</text>
            <text class="stat-label">总场景</text>
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

    <!-- 场景列表 -->
    <scroll-view scroll-y class="scenario-scroll">
      <view class="scenario-list">
        <view 
          v-for="scenario in filteredScenarios" 
          :key="scenario.id"
          :class="['scenario-card', { completed: isScenarioCompleted(scenario.id) }]"
          @tap="goToScenarioPlay(scenario)"
        >
          <view class="scenario-status" v-if="isScenarioCompleted(scenario.id)">
            <text>✓</text>
          </view>
          <view class="scenario-main">
            <view class="scenario-header">
              <view class="scenario-type-badge">
                {{ getScenarioTypeInfo()[scenario.type].icon }} {{ getScenarioTypeInfo()[scenario.type].label }}
              </view>
              <view class="scenario-role-badge">
                {{ getRoleInfo()[scenario.role].icon }} {{ getRoleInfo()[scenario.role].label }}
              </view>
            </view>
            <text class="scenario-title">{{ scenario.title }}</text>
            <text class="scenario-desc">{{ scenario.description }}</text>
            <view class="scenario-context">
              <text class="context-label">背景：</text>
              <text class="context-text">{{ scenario.context }}</text>
            </view>
          </view>
        </view>
      </view>
      <view v-if="filteredScenarios.length === 0" class="empty-state">
        <text class="empty-icon">🎭</text>
        <text class="empty-text">暂无场景</text>
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
  { key: 'conflict', label: '冲突解决' },
  { key: 'team_building', label: '团队建设' },
  { key: 'decision_making', label: '决策场景' },
  { key: 'crisis', label: '危机处理' }
]

const filteredScenarios = computed(() => {
  const scenarios = leadershipStore.scenarios
  if (currentFilter.value === 'all') {
    return scenarios
  }
  return scenarios.filter(s => s.type === currentFilter.value)
})

const scenarioProgress = computed(() => leadershipStore.scenarioProgress)

const getRoleInfo = () => leadershipStore.getRoleInfo()
const getScenarioTypeInfo = () => leadershipStore.getScenarioTypeInfo()

const isScenarioCompleted = (scenarioId) => {
  return leadershipStore.completedScenarios.some(s => s.id === scenarioId)
}

const setFilter = (key) => {
  currentFilter.value = key
}

const goBack = () => {
  uni.navigateBack()
}

const goToScenarioPlay = (scenario) => {
  leadershipStore.selectScenario(scenario)
  uni.navigateTo({ url: `/pages/leadership/scenario-play?id=${scenario.id}` })
}
</script>

<style scoped>
.scenario-list-container {
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
  height: 200rpx;
  background: linear-gradient(135deg, #722ed1 0%, #eb4888 100%);
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
  gap: 60rpx;
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
  flex-wrap: wrap;
  gap: 12rpx;
}

.filter-tab {
  padding: 16rpx 24rpx;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 30rpx;
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.6);
  transition: all 0.3s ease;
}

.filter-tab.active {
  background: linear-gradient(135deg, #722ed1 0%, #eb4888 100%);
  color: #ffffff;
}

.scenario-scroll {
  height: calc(100vh - 360rpx);
  padding: 0 40rpx;
}

.scenario-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  padding-bottom: 40rpx;
}

.scenario-card {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 24rpx;
  overflow: hidden;
  position: relative;
}

.scenario-card.completed {
  opacity: 0.7;
}

.scenario-status {
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

.scenario-main {
  padding: 30rpx;
}

.scenario-header {
  display: flex;
  gap: 16rpx;
  margin-bottom: 20rpx;
}

.scenario-type-badge {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.7);
  background: rgba(255, 255, 255, 0.1);
  padding: 8rpx 16rpx;
  border-radius: 16rpx;
}

.scenario-role-badge {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.7);
  background: rgba(114, 46, 209, 0.3);
  padding: 8rpx 16rpx;
  border-radius: 16rpx;
}

.scenario-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 12rpx;
  display: block;
}

.scenario-desc {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 20rpx;
  line-height: 1.5;
  display: block;
}

.scenario-context {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12rpx;
  padding: 20rpx;
}

.context-label {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 8rpx;
  display: block;
}

.context-text {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.5;
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
