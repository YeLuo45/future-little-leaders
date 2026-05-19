<template>
  <view class="coding-challenges-page">
    <!-- 顶部标题 -->
    <view class="header">
      <text class="title">🏆 编程挑战</text>
      <text class="subtitle">算法基础 · 积分奖励</text>
    </view>

    <!-- 用户状态卡片 -->
    <view class="user-stats-card">
      <view class="stat-item">
        <text class="stat-value">{{ stats.totalPoints }}</text>
        <text class="stat-label">总积分</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item">
        <text class="stat-value">{{ stats.rank }}</text>
        <text class="stat-label">等级</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item">
        <text class="stat-value">{{ stats.challengesCompleted }}</text>
        <text class="stat-label">已完成</text>
      </view>
    </view>

    <!-- 挑战列表 -->
    <view class="challenges-section">
      <text class="section-title">挑战列表</text>
      
      <!-- 筛选标签 -->
      <scroll-view scroll-x class="filter-tabs">
        <view
          v-for="filter in filters"
          :key="filter.id"
          :class="['filter-tab', { active: activeFilter === filter.id }]"
          @click="setFilter(filter.id)"
        >
          {{ filter.name }}
        </view>
      </scroll-view>

      <!-- 挑战卡片列表 -->
      <view class="challenges-list">
        <view
          v-for="challenge in filteredChallenges"
          :key="challenge.id"
          :class="['challenge-card', { completed: isCompleted(challenge.id) }]"
          @click="selectChallenge(challenge)"
        >
          <view class="challenge-main">
            <view class="challenge-header">
              <text class="challenge-title">{{ challenge.title }}</text>
              <text class="challenge-difficulty" :class="'level-' + challenge.difficulty">
                {{ getDifficultyName(challenge.difficulty) }}
              </text>
            </view>
            <text class="challenge-desc">{{ challenge.description }}</text>
            <view class="challenge-meta">
              <text class="meta-item">📚 {{ challenge.category }}</text>
              <text class="meta-item">⭐ {{ challenge.points }}分</text>
              <text class="meta-item">✨ {{ challenge.exp }}经验</text>
            </view>
          </view>
          <view v-if="isCompleted(challenge.id)" class="completed-badge">✓ 已完成</view>
        </view>
      </view>
    </view>

    <!-- 挑战详情弹窗 -->
    <view v-if="selectedChallenge" class="challenge-modal" @click="closeModal">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">{{ selectedChallenge.title }}</text>
          <text class="close-btn" @click="closeModal">×</text>
        </view>
        
        <view class="modal-body">
          <!-- 挑战信息 -->
          <view class="info-section">
            <text class="info-desc">{{ selectedChallenge.description }}</text>
            <view class="info-tags">
              <text class="info-tag category">{{ selectedChallenge.category }}</text>
              <text class="info-tag difficulty" :class="'level-' + selectedChallenge.difficulty">
                {{ getDifficultyName(selectedChallenge.difficulty) }}
              </text>
            </view>
          </view>

          <!-- 挑战内容 -->
          <view class="challenge-section">
            <text class="section-label">挑战任务</text>
            <text class="challenge-task">{{ selectedChallenge.challenge }}</text>
          </view>

          <!-- 提示 -->
          <view class="hint-section" @click="toggleHint">
            <text class="hint-icon">💡</text>
            <text class="hint-text">{{ showHint ? selectedChallenge.hint : '点击查看提示' }}</text>
          </view>

          <!-- 代码模板 -->
          <view class="code-section">
            <text class="section-label">代码模板</text>
            <view class="code-template">
              <text>{{ selectedChallenge.template }}</text>
            </view>
          </view>

          <!-- 代码输入 -->
          <view class="input-section">
            <text class="section-label">编写你的答案</text>
            <textarea
              class="code-input"
              v-model="userCode"
              placeholder="在这里编写代码..."
              maxlength="1000"
            />
          </view>

          <!-- 奖励信息 -->
          <view class="reward-section">
            <view class="reward-item">
              <text class="reward-icon">⭐</text>
              <text class="reward-value">+{{ selectedChallenge.exp }}</text>
              <text class="reward-label">经验</text>
            </view>
            <view class="reward-item">
              <text class="reward-icon">🏅</text>
              <text class="reward-value">+{{ selectedChallenge.points }}</text>
              <text class="reward-label">积分</text>
            </view>
          </view>

          <!-- 提交按钮 -->
          <view class="submit-section">
            <text class="reset-btn" @click="resetCode">重置</text>
            <text class="submit-btn" @click="submitAnswer">提交答案</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 完成提示 -->
    <view v-if="showSuccessToast" class="success-toast">
      <text class="toast-icon">🎉</text>
      <text class="toast-text">挑战完成！</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useCodingEducationStore } from '@/stores/codingEducationStore.js'

const store = useCodingEducationStore()

const activeFilter = ref('all')
const selectedChallenge = ref(null)
const userCode = ref('')
const showHint = ref(false)
const showSuccessToast = ref(false)

const filters = [
  { id: 'all', name: '全部' },
  { id: 'output', name: '输出' },
  { id: 'loop', name: '循环' },
  { id: 'array', name: '数组' },
  { id: 'algorithm', name: '算法' },
  { id: 'string', name: '字符串' }
]

const challenges = computed(() => store.challenges)
const completedChallenges = computed(() => store.completedChallenges)
const stats = computed(() => store.getStats)

const filteredChallenges = computed(() => {
  if (activeFilter.value === 'all') {
    return challenges.value
  }
  return challenges.value.filter(c => c.category === activeFilter.value)
})

const setFilter = (filterId) => {
  activeFilter.value = filterId
}

const isCompleted = (challengeId) => {
  return completedChallenges.value.includes(challengeId)
}

const getDifficultyName = (level) => {
  const names = { 1: '入门', 2: '基础', 3: '进阶', 4: '高级' }
  return names[level] || '入门'
}

const selectChallenge = (challenge) => {
  selectedChallenge.value = challenge
  userCode.value = challenge.template || ''
  showHint.value = false
  store.selectChallenge(challenge)
}

const closeModal = () => {
  selectedChallenge.value = null
}

const toggleHint = () => {
  showHint.value = !showHint.value
}

const resetCode = () => {
  if (selectedChallenge.value) {
    userCode.value = selectedChallenge.value.template || ''
  }
  showHint.value = false
}

const submitAnswer = () => {
  if (!userCode.value.trim()) {
    uni.showToast({ title: '请输入代码', icon: 'none' })
    return
  }
  
  if (selectedChallenge.value) {
    store.submitChallenge(selectedChallenge.value.id, userCode.value)
    showSuccessToast.value = true
    setTimeout(() => {
      showSuccessToast.value = false
      closeModal()
    }, 1500)
  }
}

// 初始化
store.loadChallenges()
</script>

<style scoped>
.coding-challenges-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  padding: 20rpx;
}

.header {
  text-align: center;
  padding: 30rpx 0;
}

.title {
  font-size: 40rpx;
  font-weight: bold;
  color: #ffffff;
  display: block;
}

.subtitle {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 10rpx;
  display: block;
}

.user-stats-card {
  display: flex;
  justify-content: space-around;
  align-items: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 25rpx;
  padding: 30rpx;
  margin-bottom: 25rpx;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 36rpx;
  font-weight: bold;
  color: #ffffff;
}

.stat-label {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 5rpx;
}

.stat-divider {
  width: 2rpx;
  height: 60rpx;
  background: rgba(255, 255, 255, 0.3);
}

.challenges-section {
  background: #ffffff;
  border-radius: 30rpx;
  padding: 25rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
}

.filter-tabs {
  display: flex;
  white-space: nowrap;
  margin-bottom: 20rpx;
}

.filter-tab {
  padding: 12rpx 28rpx;
  margin-right: 15rpx;
  background: #f0f0f0;
  border-radius: 20rpx;
  font-size: 24rpx;
  color: #666;
}

.filter-tab.active {
  background: #11998e;
  color: #ffffff;
}

.challenges-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.challenge-card {
  background: #f8f9fa;
  border-radius: 20rpx;
  padding: 25rpx;
  position: relative;
}

.challenge-card.completed {
  background: #e8f5e9;
}

.challenge-main {
  flex: 1;
}

.challenge-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10rpx;
}

.challenge-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.challenge-difficulty {
  padding: 5rpx 15rpx;
  border-radius: 10rpx;
  font-size: 20rpx;
  color: #ffffff;
}

.challenge-difficulty.level-1 { background: #4CAF50; }
.challenge-difficulty.level-2 { background: #2196F3; }
.challenge-difficulty.level-3 { background: #FF9800; }
.challenge-difficulty.level-4 { background: #f44336; }

.challenge-desc {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 15rpx;
  display: block;
}

.challenge-meta {
  display: flex;
  gap: 20rpx;
}

.meta-item {
  font-size: 22rpx;
  color: #999;
}

.completed-badge {
  position: absolute;
  top: 20rpx;
  right: 20rpx;
  padding: 8rpx 20rpx;
  background: #4CAF50;
  color: #ffffff;
  border-radius: 15rpx;
  font-size: 22rpx;
}

.challenge-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  width: 100%;
  max-height: 90vh;
  background: #ffffff;
  border-radius: 40rpx 40rpx 0 0;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #eee;
}

.modal-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.close-btn {
  width: 50rpx;
  height: 50rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  color: #999;
}

.modal-body {
  padding: 30rpx;
  max-height: calc(90vh - 100rpx);
  overflow-y: auto;
}

.info-section {
  margin-bottom: 25rpx;
}

.info-desc {
  font-size: 26rpx;
  color: #666;
  display: block;
  margin-bottom: 15rpx;
}

.info-tags {
  display: flex;
  gap: 15rpx;
}

.info-tag {
  padding: 8rpx 20rpx;
  border-radius: 15rpx;
  font-size: 22rpx;
}

.info-tag.category {
  background: #e3f2fd;
  color: #1976D2;
}

.info-tag.difficulty {
  color: #ffffff;
}

.info-tag.difficulty.level-1 { background: #4CAF50; }
.info-tag.difficulty.level-2 { background: #2196F3; }
.info-tag.difficulty.level-3 { background: #FF9800; }
.info-tag.difficulty.level-4 { background: #f44336; }

.challenge-section {
  margin-bottom: 25rpx;
}

.section-label {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 10rpx;
  display: block;
}

.challenge-task {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
  display: block;
  padding: 20rpx;
  background: #f8f9fa;
  border-radius: 15rpx;
}

.hint-section {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background: #fff3e0;
  border-radius: 15rpx;
  margin-bottom: 25rpx;
}

.hint-icon {
  font-size: 32rpx;
  margin-right: 15rpx;
}

.hint-text {
  font-size: 26rpx;
  color: #e65100;
}

.code-section {
  margin-bottom: 25rpx;
}

.code-template {
  background: #1a1a2e;
  border-radius: 15rpx;
  padding: 20rpx;
}

.code-template text {
  font-family: monospace;
  font-size: 24rpx;
  color: #00ff00;
  white-space: pre-wrap;
}

.input-section {
  margin-bottom: 25rpx;
}

.code-input {
  width: 100%;
  height: 200rpx;
  background: #f5f5f5;
  border-radius: 15rpx;
  padding: 20rpx;
  font-family: monospace;
  font-size: 24rpx;
  box-sizing: border-box;
}

.reward-section {
  display: flex;
  justify-content: center;
  gap: 50rpx;
  margin-bottom: 30rpx;
}

.reward-item {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.reward-icon {
  font-size: 32rpx;
}

.reward-value {
  font-size: 32rpx;
  font-weight: bold;
  color: #E91E63;
}

.reward-label {
  font-size: 22rpx;
  color: #999;
}

.submit-section {
  display: flex;
  gap: 20rpx;
}

.reset-btn {
  flex: 1;
  padding: 20rpx;
  background: #f0f0f0;
  border-radius: 30rpx;
  font-size: 28rpx;
  color: #666;
  text-align: center;
}

.submit-btn {
  flex: 2;
  padding: 20rpx;
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  border-radius: 30rpx;
  font-size: 28rpx;
  color: #ffffff;
  text-align: center;
}

.success-toast {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.8);
  padding: 40rpx 60rpx;
  border-radius: 30rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 2000;
}

.toast-icon {
  font-size: 80rpx;
  margin-bottom: 20rpx;
}

.toast-text {
  font-size: 32rpx;
  color: #ffffff;
}
</style>
