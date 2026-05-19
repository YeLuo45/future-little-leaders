<template>
  <view class="challenges-page">
    <!-- 顶部导航 -->
    <view class="nav-header">
      <text class="back-btn" @click="goBack">‹</text>
      <text class="nav-title">演讲挑战</text>
      <text class="nav-placeholder"></text>
    </view>

    <!-- 挑战进度 -->
    <view class="progress-card">
      <view class="progress-info">
        <text class="progress-title">挑战进度</text>
        <text class="progress-count">{{ challengeProgress.completed }}/{{ challengeProgress.total }}</text>
      </view>
      <view class="progress-bar">
        <view class="progress-fill" :style="{ width: challengeProgress.percentage + '%' }"></view>
      </view>
    </view>

    <!-- 挑战列表 -->
    <view class="challenges-list">
      <view
        v-for="challenge in challenges"
        :key="challenge.id"
        class="challenge-card"
        :class="{ completed: isCompleted(challenge.id) }"
        @click="openChallenge(challenge)"
      >
        <view class="challenge-header">
          <view class="challenge-type">
            <text class="type-icon">{{ getChallengeIcon(challenge.type) }}</text>
            <text class="type-name">{{ getChallengeTypeName(challenge.type) }}</text>
          </view>
          <view class="difficulty-badge" :style="{ background: getDifficultyColor(challenge.difficulty) }">
            {{ getDifficultyText(challenge.difficulty) }}
          </view>
        </view>

        <text class="challenge-title">{{ challenge.title }}</text>
        <text class="challenge-desc">{{ challenge.description }}</text>

        <view class="challenge-meta">
          <view class="meta-item">
            <text>⏱️</text>
            <text>{{ challenge.duration }}秒</text>
          </view>
          <view class="meta-item reward">
            <text>⭐</text>
            <text>+{{ challenge.rewards.points }}</text>
          </view>
        </view>

        <view v-if="isCompleted(challenge.id)" class="completed-overlay">
          <text class="completed-icon">✓</text>
          <text class="completed-score">{{ getChallengeScore(challenge.id) }}</text>
        </view>
      </view>
    </view>

    <!-- 挑战详情弹窗 -->
    <view v-if="showChallengeModal" class="modal-overlay" @click="closeChallengeModal">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">{{ selectedChallenge?.title }}</text>
          <text class="modal-close" @click="closeChallengeModal">×</text>
        </view>

        <view class="modal-body">
          <!-- 挑战信息 -->
          <view class="info-section">
            <view class="info-row">
              <view class="info-item">
                <text class="info-icon">⏱️</text>
                <text>{{ selectedChallenge?.duration }}秒</text>
              </view>
              <view class="info-item">
                <text class="info-icon">⭐</text>
                <text>+{{ selectedChallenge?.rewards.points }}积分</text>
              </view>
            </view>
          </view>

          <!-- 即兴话题 -->
          <view v-if="selectedChallenge?.type === 'impromptu'" class="topic-section">
            <text class="section-label">随机话题</text>
            <view class="topic-display">
              <text class="topic-text">{{ randomTopic }}</text>
              <text class="refresh-btn" @click="refreshTopic">🔄</text>
            </view>
          </view>

          <!-- 辩论话题 -->
          <view v-if="selectedChallenge?.type === 'debate'" class="topic-section">
            <text class="section-label">辩论话题</text>
            <view class="topic-display">
              <text class="topic-text">{{ selectedChallenge.debateTopics?.[0] || '待定' }}</text>
            </view>
          </view>

          <!-- 挑战要求 -->
          <view class="requirements-section">
            <text class="section-label">挑战要求</text>
            <view class="requirement-list">
              <view v-if="selectedChallenge?.requirements.minDuration" class="requirement-item">
                <text>✓</text>
                <text>时长: {{ selectedChallenge.requirements.minDuration }}-{{ selectedChallenge.requirements.maxDuration }}秒</text>
              </view>
              <view v-if="selectedChallenge?.requirements.hasBeginning" class="requirement-item">
                <text>✓</text>
                <text>有开场</text>
              </view>
              <view v-if="selectedChallenge?.requirements.hasMiddle" class="requirement-item">
                <text>✓</text>
                <text>有内容</text>
              </view>
              <view v-if="selectedChallenge?.requirements.hasEnd" class="requirement-item">
                <text>✓</text>
                <text>有结尾</text>
              </view>
              <view v-if="selectedChallenge?.requirements.hasPoint" class="requirement-item">
                <text>✓</text>
                <text>有明确观点</text>
              </view>
              <view v-if="selectedChallenge?.requirements.hasReasons" class="requirement-item">
                <text>✓</text>
                <text>有理由支撑</text>
              </view>
              <view v-if="selectedChallenge?.requirements.hasConclusion" class="requirement-item">
                <text>✓</text>
                <text>有总结</text>
              </view>
            </view>
          </view>

          <!-- 奖励徽章 -->
          <view class="badge-section">
            <text class="section-label">完成奖励</text>
            <view class="badge-display">
              <text class="badge-icon">🏅</text>
              <text class="badge-name">{{ selectedChallenge?.rewards.badge }}</text>
            </view>
          </view>
        </view>

        <view class="modal-footer">
          <button class="start-btn" @click="startChallenge">
            <text>🎤 开始挑战</text>
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { usePublicSpeakingStore } from '@/stores/publicSpeakingStore.js'

const store = usePublicSpeakingStore()

// 状态
const showChallengeModal = ref(false)
const selectedChallenge = ref(null)
const randomTopic = ref('')

// 计算属性
const challenges = computed(() => store.challenges)
const challengeProgress = computed(() => store.challengeProgress)
const completedRecords = computed(() => store.getChallengeRecords())

// 方法
const goBack = () => {
  uni.navigateBack()
}

const getChallengeIcon = (type) => {
  const icons = {
    timed: '⏱️',
    impromptu: '🎲',
    debate: '⚔️'
  }
  return icons[type] || '🏆'
}

const getChallengeTypeName = (type) => {
  const names = {
    timed: '计时挑战',
    impromptu: '即兴演讲',
    debate: '辩论挑战'
  }
  return names[type] || '挑战'
}

const getDifficultyColor = (difficulty) => {
  const colors = {
    beginner: '#52c41a',
    intermediate: '#faad14',
    advanced: '#f5222d'
  }
  return colors[difficulty] || '#999'
}

const getDifficultyText = (difficulty) => {
  const texts = {
    beginner: '初级',
    intermediate: '中级',
    advanced: '高级'
  }
  return texts[difficulty] || ''
}

const isCompleted = (challengeId) => {
  return completedRecords.value.some(r => r.challengeId === challengeId)
}

const getChallengeScore = (challengeId) => {
  const record = completedRecords.value.find(r => r.challengeId === challengeId)
  return record?.score || 0
}

const openChallenge = (challenge) => {
  selectedChallenge.value = challenge
  
  if (challenge.type === 'impromptu' && challenge.impromptuTopics) {
    refreshTopic()
  }
  
  showChallengeModal.value = true
}

const closeChallengeModal = () => {
  showChallengeModal.value = false
  selectedChallenge.value = null
}

const refreshTopic = () => {
  if (selectedChallenge.value?.impromptuTopics) {
    const topics = selectedChallenge.value.impromptuTopics
    randomTopic.value = topics[Math.floor(Math.random() * topics.length)]
  }
}

const startChallenge = () => {
  if (selectedChallenge.value) {
    closeChallengeModal()
    uni.navigateTo({
      url: `/pages/public-speaking/challenge-practice?challengeId=${selectedChallenge.value.id}&topic=${encodeURIComponent(randomTopic.value)}`
    })
  }
}

onMounted(() => {
  store.init()
})
</script>

<style scoped>
.challenges-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.nav-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 40rpx 30rpx 20rpx;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.back-btn {
  font-size: 60rpx;
  color: #ffffff;
  font-weight: bold;
}

.nav-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #ffffff;
}

.nav-placeholder {
  width: 60rpx;
}

/* 进度卡片 */
.progress-card {
  background: #fff;
  margin: 20rpx 30rpx;
  border-radius: 16rpx;
  padding: 24rpx;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.progress-title {
  font-size: 28rpx;
  color: #666;
}

.progress-count {
  font-size: 28rpx;
  font-weight: bold;
  color: #f5576c;
}

.progress-bar {
  height: 12rpx;
  background: #eee;
  border-radius: 6rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #f093fb 0%, #f5576c 100%);
  transition: width 0.3s;
}

/* 挑战列表 */
.challenges-list {
  padding: 0 30rpx 30rpx;
}

.challenge-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  position: relative;
  overflow: hidden;
}

.challenge-card.completed {
  opacity: 0.8;
}

.challenge-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.challenge-type {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.type-icon {
  font-size: 28rpx;
}

.type-name {
  font-size: 24rpx;
  color: #999;
}

.difficulty-badge {
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  color: #fff;
}

.challenge-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.challenge-desc {
  font-size: 26rpx;
  color: #666;
  display: block;
  margin-bottom: 16rpx;
}

.challenge-meta {
  display: flex;
  gap: 24rpx;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 24rpx;
  color: #999;
}

.meta-item.reward {
  color: #f5576c;
  font-weight: bold;
}

.completed-overlay {
  position: absolute;
  top: 20rpx;
  right: 20rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(82, 196, 26, 0.9);
  border-radius: 16rpx;
  padding: 12rpx 20rpx;
}

.completed-icon {
  font-size: 28rpx;
  color: #fff;
}

.completed-score {
  font-size: 22rpx;
  color: #fff;
  font-weight: bold;
}

/* Modal */
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

.modal-content {
  background: #fff;
  border-radius: 30rpx 30rpx 0 0;
  width: 100%;
  max-height: 85vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #eee;
  position: sticky;
  top: 0;
  background: #fff;
}

.modal-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.modal-close {
  font-size: 50rpx;
  color: #999;
}

.modal-body {
  padding: 20rpx 30rpx;
}

.info-section {
  margin-bottom: 24rpx;
}

.info-row {
  display: flex;
  gap: 20rpx;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 24rpx;
  background: #f5f5f5;
  border-radius: 20rpx;
  font-size: 26rpx;
  color: #666;
}

.info-icon {
  font-size: 28rpx;
}

.topic-section {
  margin-bottom: 24rpx;
}

.section-label {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 12rpx;
}

.topic-display {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  border-radius: 16rpx;
}

.topic-text {
  font-size: 30rpx;
  color: #fff;
  font-weight: bold;
  flex: 1;
}

.refresh-btn {
  font-size: 36rpx;
  padding: 0 16rpx;
}

.requirements-section {
  margin-bottom: 24rpx;
}

.requirement-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.requirement-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 8rpx 16rpx;
  background: rgba(82, 196, 26, 0.1);
  border-radius: 8rpx;
  font-size: 24rpx;
  color: #52c41a;
}

.badge-section {
  margin-bottom: 24rpx;
}

.badge-display {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 20rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
}

.badge-icon {
  font-size: 48rpx;
}

.badge-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.modal-footer {
  padding: 20rpx 30rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  border-top: 1rpx solid #eee;
}

.start-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  border-radius: 44rpx;
  color: #fff;
  font-size: 32rpx;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
