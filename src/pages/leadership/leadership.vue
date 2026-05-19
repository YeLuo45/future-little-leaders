<template>
  <view class="leadership-container">
    <!-- 顶部标题区 -->
    <view class="header-section">
      <view class="header-bg"></view>
      <view class="header-content">
        <view class="user-info">
          <text class="greeting">{{ greeting }}</text>
          <text class="level-badge">{{ levelTitle }}</text>
        </view>
        <view class="exp-bar-container">
          <text class="exp-label">Lv.{{ level }}</text>
          <view class="exp-bar">
            <view class="exp-fill" :style="{ width: expProgress + '%' }"></view>
          </view>
          <text class="exp-text">{{ expProgress }}%</text>
        </view>
      </view>
    </view>

    <!-- 领导力属性卡片 -->
    <view class="stats-cards">
      <view class="stat-card influence">
        <text class="stat-icon">{{ STATS_INFO[LEADERSHIP_STATS.INFLUENCE].icon }}</text>
        <view class="stat-info">
          <text class="stat-value">{{ leadershipStats.influence }}</text>
          <text class="stat-label">{{ STATS_INFO[LEADERSHIP_STATS.INFLUENCE].label }}</text>
        </view>
      </view>
      <view class="stat-card decision">
        <text class="stat-icon">{{ STATS_INFO[LEADERSHIP_STATS.DECISION].icon }}</text>
        <view class="stat-info">
          <text class="stat-value">{{ leadershipStats.decision }}</text>
          <text class="stat-label">{{ STATS_INFO[LEADERSHIP_STATS.DECISION].label }}</text>
        </view>
      </view>
      <view class="stat-card communication">
        <text class="stat-icon">{{ STATS_INFO[LEADERSHIP_STATS.COMMUNICATION].icon }}</text>
        <view class="stat-info">
          <text class="stat-value">{{ leadershipStats.communication }}</text>
          <text class="stat-label">{{ STATS_INFO[LEADERSHIP_STATS.COMMUNICATION].label }}</text>
        </view>
      </view>
    </view>

    <!-- 进度概览 -->
    <view class="progress-overview">
      <view class="progress-item" @tap="switchTab('quests')">
        <view class="progress-circle">
          <text class="progress-value">{{ questProgress.completed }}/{{ questProgress.total }}</text>
        </view>
        <text class="progress-label">领导力任务</text>
      </view>
      <view class="progress-item" @tap="switchTab('scenarios')">
        <view class="progress-circle">
          <text class="progress-value">{{ scenarioProgress.completed }}/{{ scenarioProgress.total }}</text>
        </view>
        <text class="progress-label">角色扮演</text>
      </view>
      <view class="progress-item" @tap="switchTab('stats')">
        <view class="progress-circle total">
          <text class="progress-value">{{ totalScore }}</text>
        </view>
        <text class="progress-label">总评分</text>
      </view>
    </view>

    <!-- Tab切换区 -->
    <view class="tab-container">
      <view class="tab-header">
        <view 
          v-for="tab in tabs" 
          :key="tab.key"
          :class="['tab-item', { active: currentTab === tab.key }]"
          @tap="switchTab(tab.key)"
        >
          <text>{{ tab.label }}</text>
        </view>
      </view>

      <!-- 领导力任务Tab -->
      <view v-if="currentTab === 'quests'" class="tab-content">
        <view class="section-header">
          <text class="section-title">领导力任务</text>
          <text class="section-more" @tap="goToQuestList">更多</text>
        </view>
        <view class="quest-list">
          <view 
            v-for="quest in displayQuests" 
            :key="quest.id"
            class="quest-card"
            @tap="goToQuestDetail(quest)"
          >
            <view class="quest-header">
              <text class="quest-role">{{ getRoleInfo()[quest.role].icon }} {{ getRoleInfo()[quest.role].label }}</text>
              <view class="quest-difficulty" :style="{ color: getDifficultyInfo()[quest.difficulty].color }">
                <text v-for="i in quest.difficulty" :key="i">⭐</text>
              </view>
            </view>
            <text class="quest-title">{{ quest.title }}</text>
            <text class="quest-desc">{{ quest.description }}</text>
            <view class="quest-rewards">
              <text class="reward-item">+{{ quest.rewards.points }}积分</text>
              <text class="reward-item">影响力+{{ quest.rewards.influence }}</text>
              <text class="reward-item">决策力+{{ quest.rewards.decision }}</text>
              <text class="reward-item">沟通力+{{ quest.rewards.communication }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 角色扮演Tab -->
      <view v-if="currentTab === 'scenarios'" class="tab-content">
        <view class="section-header">
          <text class="section-title">角色扮演</text>
          <text class="section-more" @tap="goToScenarioList">更多</text>
        </view>
        <view class="scenario-list">
          <view 
            v-for="scenario in displayScenarios" 
            :key="scenario.id"
            class="scenario-card"
            @tap="goToScenarioPlay(scenario)"
          >
            <view class="scenario-header">
              <text class="scenario-type">{{ getScenarioTypeInfo()[scenario.type].icon }} {{ getScenarioTypeInfo()[scenario.type].label }}</text>
              <text class="scenario-role">{{ getRoleInfo()[scenario.role].icon }} {{ getRoleInfo()[scenario.role].label }}</text>
            </view>
            <text class="scenario-title">{{ scenario.title }}</text>
            <text class="scenario-desc">{{ scenario.description }}</text>
          </view>
        </view>
      </view>

      <!-- 领导力数据Tab -->
      <view v-if="currentTab === 'stats'" class="tab-content">
        <view class="section-header">
          <text class="section-title">领导力数据</text>
        </view>
        
        <!-- 雷达图区域 -->
        <view class="stats-chart">
          <view class="chart-placeholder">
            <text class="chart-icon">📊</text>
            <text class="chart-label">能力雷达图</text>
          </view>
          <view class="stats-summary">
            <view class="summary-item">
              <text class="summary-value">{{ totalScore }}</text>
              <text class="summary-label">综合评分</text>
            </view>
            <view class="summary-item">
              <text class="summary-value">{{ completedQuests.length }}</text>
              <text class="summary-label">已完成任务</text>
            </view>
            <view class="summary-item">
              <text class="summary-value">{{ completedScenarios.length }}</text>
              <text class="summary-label">已完成场景</text>
            </view>
          </view>
        </view>

        <!-- 成长轨迹 -->
        <view class="growth-trail">
          <text class="trail-title">成长轨迹</text>
          <view class="trail-list" v-if="growthTrail.length > 0">
            <view 
              v-for="(item, index) in growthTrail.slice(0, 5)" 
              :key="index"
              class="trail-item"
            >
              <view class="trail-dot"></view>
              <view class="trail-content">
                <text class="trail-type">{{ item.type === 'quest' ? '📋' : '🎭' }}</text>
                <text class="trail-text">{{ item.title }}</text>
                <text class="trail-time">{{ formatTime(item.timestamp) }}</text>
              </view>
            </view>
          </view>
          <view v-else class="trail-empty">
            <text>暂无成长记录，开始你的领导力之旅吧！</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useLeadershipStore } from '@/stores/leadershipStore'
import { LEADERSHIP_STATS, STATS_INFO } from '@/services/leadershipService'

const leadershipStore = useLeadershipStore()

const currentTab = ref('quests')
const tabs = [
  { key: 'quests', label: '领导力任务' },
  { key: 'scenarios', label: '角色扮演' },
  { key: 'stats', label: '领导力数据' }
]

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return '早上好，未来的领袖！'
  if (hour < 18) return '下午好，未来的领袖！'
  return '晚上好，未来的领袖！'
})

const leadershipStats = computed(() => leadershipStore.leadershipStats)
const level = computed(() => leadershipStore.level)
const levelTitle = computed(() => leadershipStore.levelTitle)
const expProgress = computed(() => leadershipStore.expProgress)
const totalScore = computed(() => leadershipStore.totalScore)
const questProgress = computed(() => leadershipStore.questProgress)
const scenarioProgress = computed(() => leadershipStore.scenarioProgress)
const completedQuests = computed(() => leadershipStore.completedQuests)
const completedScenarios = computed(() => leadershipStore.completedScenarios)
const growthTrail = computed(() => leadershipStore.growthTrail)

const displayQuests = computed(() => leadershipStore.quests.slice(0, 3))
const displayScenarios = computed(() => leadershipStore.scenarios.slice(0, 3))

const getRoleInfo = () => leadershipStore.getRoleInfo()
const getDifficultyInfo = () => leadershipStore.getDifficultyInfo()
const getScenarioTypeInfo = () => leadershipStore.getScenarioTypeInfo()

const switchTab = (key) => {
  currentTab.value = key
}

const goToQuestList = () => {
  uni.navigateTo({ url: '/pages/leadership/quest-list' })
}

const goToQuestDetail = (quest) => {
  leadershipStore.selectQuest(quest)
  uni.navigateTo({ url: `/pages/leadership/quest-detail?id=${quest.id}` })
}

const goToScenarioList = () => {
  uni.navigateTo({ url: '/pages/leadership/scenario-list' })
}

const goToScenarioPlay = (scenario) => {
  leadershipStore.selectScenario(scenario)
  uni.navigateTo({ url: `/pages/leadership/scenario-play?id=${scenario.id}` })
}

const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${month}月${day}日`
}

onMounted(() => {
  leadershipStore.init()
})
</script>

<style scoped>
.leadership-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  padding-bottom: 120rpx;
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

.user-info {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 20rpx;
}

.greeting {
  font-size: 36rpx;
  font-weight: bold;
  color: #ffffff;
}

.level-badge {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  padding: 8rpx 24rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
  color: #ffffff;
}

.exp-bar-container {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.exp-label {
  font-size: 24rpx;
  color: #ffffff;
  opacity: 0.8;
}

.exp-bar {
  flex: 1;
  height: 12rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 6rpx;
  overflow: hidden;
}

.exp-fill {
  height: 100%;
  background: linear-gradient(90deg, #f093fb 0%, #f5576c 100%);
  border-radius: 6rpx;
  transition: width 0.3s ease;
}

.exp-text {
  font-size: 24rpx;
  color: #ffffff;
  opacity: 0.8;
}

.stats-cards {
  display: flex;
  gap: 20rpx;
  padding: 0 40rpx;
  margin-top: -20rpx;
}

.stat-card {
  flex: 1;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20rpx;
  padding: 30rpx 20rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
}

.stat-icon {
  font-size: 48rpx;
}

.stat-value {
  font-size: 36rpx;
  font-weight: bold;
  color: #ffffff;
}

.stat-label {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.7);
}

.progress-overview {
  display: flex;
  justify-content: space-around;
  padding: 40rpx;
  margin-top: 20rpx;
}

.progress-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
}

.progress-circle {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.05) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx solid rgba(255, 255, 255, 0.2);
}

.progress-circle.total {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.progress-value {
  font-size: 28rpx;
  font-weight: bold;
  color: #ffffff;
}

.progress-label {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.7);
}

.tab-container {
  margin: 0 40rpx;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 30rpx;
  overflow: hidden;
}

.tab-header {
  display: flex;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 30rpx 30rpx 0 0;
}

.tab-item {
  flex: 1;
  padding: 30rpx 0;
  text-align: center;
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.6);
  transition: all 0.3s ease;
}

.tab-item.active {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.1);
}

.tab-content {
  padding: 30rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #ffffff;
}

.section-more {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.6);
}

.quest-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.quest-card {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 20rpx;
  padding: 30rpx;
}

.quest-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.quest-role {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.7);
}

.quest-difficulty {
  font-size: 20rpx;
}

.quest-title {
  font-size: 30rpx;
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

.quest-rewards {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.reward-item {
  font-size: 22rpx;
  color: #52C41A;
  background: rgba(82, 196, 26, 0.15);
  padding: 6rpx 16rpx;
  border-radius: 10rpx;
}

.scenario-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.scenario-card {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 20rpx;
  padding: 30rpx;
}

.scenario-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.scenario-type {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.7);
}

.scenario-role {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.7);
}

.scenario-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 12rpx;
}

.scenario-desc {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.5;
}

.stats-chart {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
}

.chart-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40rpx 0;
  border: 2rpx dashed rgba(255, 255, 255, 0.2);
  border-radius: 16rpx;
  margin-bottom: 30rpx;
}

.chart-icon {
  font-size: 60rpx;
  margin-bottom: 16rpx;
}

.chart-label {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.6);
}

.stats-summary {
  display: flex;
  justify-content: space-around;
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.summary-value {
  font-size: 40rpx;
  font-weight: bold;
  color: #ffffff;
}

.summary-label {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.6);
}

.growth-trail {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 20rpx;
  padding: 30rpx;
}

.trail-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 24rpx;
}

.trail-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.trail-item {
  display: flex;
  gap: 16rpx;
}

.trail-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background: #667eea;
  margin-top: 8rpx;
}

.trail-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.trail-type {
  font-size: 24rpx;
}

.trail-text {
  font-size: 26rpx;
  color: #ffffff;
}

.trail-time {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.5);
}

.trail-empty {
  text-align: center;
  padding: 40rpx 0;
}

.trail-empty text {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.5);
}
</style>
