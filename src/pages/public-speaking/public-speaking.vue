<template>
  <view class="public-speaking-page">
    <!-- 头部 -->
    <view class="header-card">
      <view class="header-left">
        <text class="header-icon">🎤</text>
        <view class="header-info">
          <text class="title">演讲与口才</text>
          <text class="subtitle">培养领导力基础能力</text>
        </view>
      </view>
      <view class="header-right">
        <view class="points-badge">
          <text class="points-icon">⭐</text>
          <text class="points-value">{{ totalPoints }}</text>
        </view>
      </view>
    </view>

    <!-- 能力雷达图区域 -->
    <view class="ability-section">
      <view class="section-title">
        <text>我的能力</text>
        <text class="ability-level">Lv.{{ abilityLevel }}</text>
      </view>
      <view class="ability-grid">
        <view class="ability-item">
          <view class="ability-circle" :style="{ '--progress': abilityScores.clarity + '%' }">
            <text class="ability-value">{{ abilityScores.clarity }}</text>
          </view>
          <text class="ability-label">清晰度</text>
        </view>
        <view class="ability-item">
          <view class="ability-circle" :style="{ '--progress': abilityScores.confidence + '%' }">
            <text class="ability-value">{{ abilityScores.confidence }}</text>
          </view>
          <text class="ability-label">自信度</text>
        </view>
        <view class="ability-item">
          <view class="ability-circle" :style="{ '--progress': abilityScores.expression + '%' }">
            <text class="ability-value">{{ abilityScores.expression }}</text>
          </view>
          <text class="ability-label">表达力</text>
        </view>
        <view class="ability-item">
          <view class="ability-circle" :style="{ '--progress': abilityScores.structure + '%' }">
            <text class="ability-value">{{ abilityScores.structure }}</text>
          </view>
          <text class="ability-label">结构化</text>
        </view>
      </view>
    </view>

    <!-- 三大模块 -->
    <view class="modules-section">
      <!-- 演讲模板 -->
      <view class="module-card" @click="goToTemplates">
        <view class="module-icon">📝</view>
        <view class="module-content">
          <text class="module-title">演讲模板</text>
          <text class="module-desc">学习各类演讲结构</text>
          <view class="module-progress">
            <view class="progress-bar">
              <view class="progress-fill" :style="{ width: practiceProgress.percentage + '%' }"></view>
            </view>
            <text class="progress-text">{{ practiceProgress.completed }}/{{ practiceProgress.total }}</text>
          </view>
        </view>
        <text class="module-arrow">›</text>
      </view>

      <!-- 练习场 -->
      <view class="module-card" @click="goToPractice">
        <view class="module-icon">🎙️</view>
        <view class="module-content">
          <text class="module-title">演讲练习</text>
          <text class="module-desc">录音回放、语速停顿训练</text>
          <view class="module-stats">
            <text class="stat-item">⏱️ {{ formatTime(totalPracticeTime) }}</text>
            <text class="stat-item">🔥 {{ streakDays }}天</text>
          </view>
        </view>
        <text class="module-arrow">›</text>
      </view>

      <!-- 演讲挑战 -->
      <view class="module-card challenge" @click="goToChallenges">
        <view class="module-icon">🏆</view>
        <view class="module-content">
          <text class="module-title">演讲挑战</text>
          <text class="module-desc">计时演讲、评分反馈</text>
          <view class="module-progress">
            <view class="progress-bar">
              <view class="progress-fill challenge-fill" :style="{ width: challengeProgress.percentage + '%' }"></view>
            </view>
            <text class="progress-text">{{ challengeProgress.completed }}/{{ challengeProgress.total }}</text>
          </view>
        </view>
        <text class="module-arrow">›</text>
      </view>
    </view>

    <!-- 快捷入口 -->
    <view class="quick-section">
      <view class="section-title">快捷入口</view>
      <view class="quick-grid">
        <view class="quick-item" @click="goToRecordings">
          <text class="quick-icon">🎧</text>
          <text class="quick-label">录音回放</text>
        </view>
        <view class="quick-item" @click="goToPacing">
          <text class="quick-icon">⚡</text>
          <text class="quick-label">语速训练</text>
        </view>
        <view class="quick-item" @click="goToPause">
          <text class="quick-icon">⏸️</text>
          <text class="quick-label">停顿训练</text>
        </view>
        <view class="quick-item" @click="goToHistory">
          <text class="quick-icon">📜</text>
          <text class="quick-label">练习历史</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { usePublicSpeakingStore } from '@/stores/publicSpeakingStore.js'

const store = usePublicSpeakingStore()

// 计算属性
const totalPoints = computed(() => store.totalPoints)
const abilityScores = computed(() => store.abilityScores)
const practiceProgress = computed(() => store.practiceProgress)
const challengeProgress = computed(() => store.challengeProgress)
const streakDays = computed(() => store.streakDays)
const totalPracticeTime = computed(() => store.totalPracticeTime)

// 能力等级
const abilityLevel = computed(() => {
  const avg = (abilityScores.value.clarity + abilityScores.value.confidence + 
               abilityScores.value.expression + abilityScores.value.structure) / 4
  if (avg >= 80) return 5
  if (avg >= 60) return 4
  if (avg >= 40) return 3
  if (avg >= 20) return 2
  return 1
})

// 格式化时间
const formatTime = (seconds) => {
  if (!seconds) return '0分钟'
  const mins = Math.floor(seconds / 60)
  if (mins < 60) return `${mins}分钟`
  const hours = Math.floor(mins / 60)
  const remainingMins = mins % 60
  return `${hours}小时${remainingMins}分钟`
}

// 导航函数
const goToTemplates = () => {
  uni.navigateTo({ url: '/pages/public-speaking/templates' })
}

const goToPractice = () => {
  uni.navigateTo({ url: '/pages/public-speaking/practice' })
}

const goToChallenges = () => {
  uni.navigateTo({ url: '/pages/public-speaking/challenges' })
}

const goToRecordings = () => {
  uni.navigateTo({ url: '/pages/public-speaking/recordings' })
}

const goToPacing = () => {
  uni.navigateTo({ url: '/pages/public-speaking/pacing' })
}

const goToPause = () => {
  uni.navigateTo({ url: '/pages/public-speaking/pause' })
}

const goToHistory = () => {
  uni.navigateTo({ url: '/pages/public-speaking/history' })
}

onMounted(() => {
  store.init()
})
</script>

<style scoped>
.public-speaking-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20rpx;
  padding-bottom: 40rpx;
}

.header-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 24rpx;
  padding: 40rpx 30rpx;
  color: #fff;
  margin-bottom: 20rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
}

.header-icon {
  font-size: 64rpx;
  margin-right: 20rpx;
}

.header-info {
  display: flex;
  flex-direction: column;
}

.title {
  font-size: 40rpx;
  font-weight: bold;
}

.subtitle {
  font-size: 26rpx;
  opacity: 0.9;
  margin-top: 4rpx;
}

.points-badge {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.2);
  padding: 12rpx 24rpx;
  border-radius: 30rpx;
}

.points-icon {
  font-size: 32rpx;
  margin-right: 8rpx;
}

.points-value {
  font-size: 32rpx;
  font-weight: bold;
}

/* 能力区域 */
.ability-section {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.ability-level {
  font-size: 24rpx;
  color: #667eea;
  background: rgba(102, 126, 234, 0.1);
  padding: 4rpx 16rpx;
  border-radius: 20rpx;
}

.ability-grid {
  display: flex;
  justify-content: space-between;
}

.ability-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.ability-circle {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background: conic-gradient(#667eea var(--progress), #eee var(--progress));
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.ability-circle::before {
  content: '';
  position: absolute;
  width: 76rpx;
  height: 76rpx;
  background: #fff;
  border-radius: 50%;
}

.ability-value {
  position: relative;
  font-size: 28rpx;
  font-weight: bold;
  color: #667eea;
}

.ability-label {
  font-size: 24rpx;
  color: #666;
  margin-top: 8rpx;
}

/* 模块区域 */
.modules-section {
  margin-bottom: 20rpx;
}

.module-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 16rpx;
  display: flex;
  align-items: center;
  transition: all 0.3s;
}

.module-card:active {
  background: #f8f8f8;
}

.module-icon {
  width: 100rpx;
  height: 100rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48rpx;
  margin-right: 24rpx;
}

.module-card.challenge .module-icon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.module-content {
  flex: 1;
}

.module-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 4rpx;
}

.module-desc {
  font-size: 24rpx;
  color: #999;
  display: block;
  margin-bottom: 12rpx;
}

.module-progress {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.progress-bar {
  flex: 1;
  height: 8rpx;
  background: #eee;
  border-radius: 4rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 4rpx;
  transition: width 0.3s;
}

.progress-fill.challenge-fill {
  background: linear-gradient(90deg, #f093fb 0%, #f5576c 100%);
}

.progress-text {
  font-size: 22rpx;
  color: #999;
  min-width: 60rpx;
}

.module-stats {
  display: flex;
  gap: 20rpx;
}

.stat-item {
  font-size: 22rpx;
  color: #667eea;
}

.module-arrow {
  font-size: 48rpx;
  color: #ccc;
  margin-left: 16rpx;
}

/* 快捷入口 */
.quick-section {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20rpx;
}

.quick-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx 0;
  border-radius: 12rpx;
  background: #f8f9fa;
  transition: all 0.3s;
}

.quick-item:active {
  background: #eee;
}

.quick-icon {
  font-size: 48rpx;
  margin-bottom: 8rpx;
}

.quick-label {
  font-size: 22rpx;
  color: #666;
}
</style>
