<template>
  <view class="challenge-practice-page">
    <!-- 顶部导航 -->
    <view class="nav-header">
      <text class="back-btn" @click="goBack">‹</text>
      <text class="nav-title">{{ challenge?.title || '挑战练习' }}</text>
      <text class="nav-placeholder"></text>
    </view>

    <!-- 挑战内容 -->
    <view class="challenge-content">
      <!-- 计时器 -->
      <view class="timer-section">
        <view class="timer-display">
          <text class="timer-icon">⏱️</text>
          <text class="timer-value">{{ formatTime(currentTime) }}</text>
        </view>
        <view class="timer-progress">
          <view class="timer-bar" :style="{ width: timerProgress + '%' }"></view>
        </view>
        <text class="timer-target">目标: {{ challenge?.duration }}秒</text>
      </view>

      <!-- 即兴/辩论话题 -->
      <view v-if="challenge?.type === 'impromptu' || challenge?.type === 'debate'" class="topic-section">
        <text class="topic-label">{{ challenge?.type === 'impromptu' ? '🎲 即兴话题' : '⚔️ 辩论话题' }}</text>
        <view class="topic-card">
          <text class="topic-text">{{ currentTopic || (challenge?.impromptuTopics?.[0]) || (challenge?.debateTopics?.[0]) }}</text>
        </view>
      </view>

      <!-- 演讲区域 -->
      <view class="speaking-area">
        <view class="speaking-status">
          <text class="status-icon">{{ isRecording ? '🎤' : '⏸️' }}</text>
          <text class="status-text">{{ isRecording ? '录音中...' : '准备开始' }}</text>
        </view>
        
        <view class="speaking-hint">
          <text v-if="challenge?.type === 'impromptu'">请围绕上面的话题进行即兴演讲</text>
          <text v-else-if="challenge?.type === 'debate'">请发表你的观点</text>
          <text v-else>请完成{{ challenge?.duration }}秒的计时演讲</text>
        </view>
      </view>

      <!-- 录音控制 -->
      <view class="record-controls">
        <view class="record-btn" :class="{ recording: isRecording }" @click="toggleRecording">
          <text class="record-icon">{{ isRecording ? '⏹️' : '🎤' }}</text>
          <text class="record-text">{{ isRecording ? '停止' : '开始' }}</text>
        </view>
      </view>

      <!-- 完成按钮 -->
      <view class="complete-section">
        <button class="complete-btn" @click="finishChallenge">完成挑战</button>
      </view>
    </view>

    <!-- 完成弹窗 -->
    <view v-if="showCompleteModal" class="modal-overlay">
      <view class="modal-content complete-modal">
        <view class="complete-icon">🏆</view>
        <text class="complete-title">挑战完成！</text>
        
        <view class="score-section">
          <text class="score-label">得分</text>
          <text class="score-value">{{ finalScore }}</text>
        </view>
        
        <view class="rewards-section">
          <text class="rewards-label">获得奖励</text>
          <view class="rewards-display">
            <text>⭐ {{ earnedPoints }} 积分</text>
            <text>🏅 {{ challenge?.rewards?.badge }}</text>
          </view>
        </view>
        
        <view class="complete-actions">
          <button class="done-btn" @click="closeModal">完成</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { usePublicSpeakingStore } from '@/stores/publicSpeakingStore.js'

const store = usePublicSpeakingStore()

// 状态
const challenge = ref(null)
const currentTopic = ref('')
const isRecording = ref(false)
const currentTime = ref(0)
const showCompleteModal = ref(false)
const finalScore = ref(0)
const earnedPoints = ref(0)

let timerInterval = null

// 计算属性
const timerProgress = computed(() => {
  if (!challenge.value) return 0
  return Math.min((currentTime.value / challenge.value.duration) * 100, 100)
})

// 方法
const goBack = () => {
  if (isRecording.value || currentTime.value > 0) {
    uni.showModal({
      title: '提示',
      content: '挑战进行中，确定要退出吗？',
      success: (res) => {
        if (res.confirm) {
          stopTimer()
          uni.navigateBack()
        }
      }
    })
  } else {
    uni.navigateBack()
  }
}

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const toggleRecording = () => {
  isRecording.value = !isRecording.value
  
  if (isRecording.value) {
    uni.showToast({ title: '开始挑战', icon: 'none' })
    startTimer()
  } else {
    stopTimer()
  }
}

const startTimer = () => {
  timerInterval = setInterval(() => {
    currentTime.value++
  }, 1000)
}

const stopTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

const finishChallenge = () => {
  stopTimer()
  isRecording.value = false
  
  // 计算得分
  if (challenge.value) {
    const duration = challenge.value.duration
    const minDuration = challenge.value.requirements?.minDuration || duration * 0.8
    const maxDuration = challenge.value.requirements?.maxDuration || duration * 1.2
    
    let score = 70
    if (currentTime.value >= minDuration && currentTime.value <= maxDuration) {
      score += 30
    } else if (currentTime.value < minDuration) {
      score = Math.round(score * (currentTime.value / minDuration))
    } else {
      score = Math.round(score * (1 - (currentTime.value - maxDuration) / maxDuration * 0.3))
    }
    
    finalScore.value = Math.min(100, Math.max(0, score))
    earnedPoints.value = challenge.value.rewards?.points || 0
    
    // 保存挑战结果
    store.completeChallenge(challenge.value.id, finalScore.value, {
      duration: currentTime.value,
      topic: currentTopic.value
    })
  }
  
  showCompleteModal.value = true
}

const closeModal = () => {
  showCompleteModal.value = false
  uni.navigateBack()
}

onMounted(() => {
  store.init()
  
  // 获取挑战信息
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const challengeId = currentPage?.options?.challengeId
  const topic = currentPage?.options?.topic
  
  if (challengeId) {
    challenge.value = store.getChallenge(challengeId)
  }
  
  if (topic) {
    currentTopic.value = decodeURIComponent(topic)
  }
})

onUnmounted(() => {
  stopTimer()
})
</script>

<style scoped>
.challenge-practice-page {
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

.challenge-content {
  padding: 30rpx;
}

/* 计时器 */
.timer-section {
  background: #fff;
  border-radius: 20rpx;
  padding: 40rpx 30rpx;
  margin-bottom: 24rpx;
  text-align: center;
}

.timer-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  margin-bottom: 20rpx;
}

.timer-icon {
  font-size: 40rpx;
}

.timer-value {
  font-size: 72rpx;
  font-weight: bold;
  color: #f5576c;
  font-variant-numeric: tabular-nums;
}

.timer-progress {
  height: 8rpx;
  background: #eee;
  border-radius: 4rpx;
  overflow: hidden;
  margin-bottom: 12rpx;
}

.timer-bar {
  height: 100%;
  background: linear-gradient(90deg, #f093fb 0%, #f5576c 100%);
  transition: width 0.3s;
}

.timer-target {
  font-size: 24rpx;
  color: #999;
}

/* 话题区域 */
.topic-section {
  margin-bottom: 24rpx;
}

.topic-label {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 12rpx;
}

.topic-card {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  border-radius: 16rpx;
  padding: 30rpx;
  text-align: center;
}

.topic-text {
  font-size: 32rpx;
  color: #fff;
  font-weight: bold;
  line-height: 1.5;
}

/* 演讲区域 */
.speaking-area {
  background: #fff;
  border-radius: 20rpx;
  padding: 60rpx 30rpx;
  margin-bottom: 24rpx;
  text-align: center;
}

.speaking-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.status-icon {
  font-size: 80rpx;
}

.status-text {
  font-size: 28rpx;
  color: #666;
}

.speaking-hint {
  font-size: 26rpx;
  color: #999;
}

/* 录音控制 */
.record-controls {
  display: flex;
  justify-content: center;
  margin-bottom: 24rpx;
}

.record-btn {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.record-btn.recording {
  background: linear-gradient(135deg, #f5222d 0%, #fa8c16 100%);
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.record-icon {
  font-size: 48rpx;
  margin-bottom: 8rpx;
}

.record-text {
  font-size: 24rpx;
  color: #fff;
}

/* 完成区域 */
.complete-section {
  margin-top: 20rpx;
}

.complete-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  border-radius: 44rpx;
  font-size: 32rpx;
  font-weight: bold;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 完成弹窗 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.complete-modal {
  background: #fff;
  border-radius: 30rpx;
  width: 80%;
  padding: 40rpx 30rpx;
  text-align: center;
}

.complete-icon {
  font-size: 100rpx;
  margin-bottom: 20rpx;
}

.complete-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 30rpx;
}

.score-section {
  margin-bottom: 24rpx;
}

.score-label {
  font-size: 26rpx;
  color: #999;
  display: block;
  margin-bottom: 8rpx;
}

.score-value {
  font-size: 80rpx;
  font-weight: bold;
  color: #f5576c;
}

.rewards-section {
  margin-bottom: 30rpx;
}

.rewards-label {
  font-size: 26rpx;
  color: #999;
  display: block;
  margin-bottom: 12rpx;
}

.rewards-display {
  display: flex;
  justify-content: center;
  gap: 30rpx;
}

.rewards-display text {
  font-size: 28rpx;
  color: #f5576c;
  font-weight: bold;
}

.complete-actions {
  display: flex;
  justify-content: center;
}

.done-btn {
  width: 200rpx;
  height: 80rpx;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  border-radius: 40rpx;
  font-size: 28rpx;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
