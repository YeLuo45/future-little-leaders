<template>
  <view class="mental-math-page">
    <!-- 头部 -->
    <view class="header-card">
      <view class="header-info">
        <text class="header-icon">⚡</text>
        <view class="header-text">
          <text class="header-title">速算训练</text>
          <text class="header-subtitle">时间挑战，准确率统计</text>
        </view>
      </view>
      <view class="stats-row">
        <view class="stat-item">
          <text class="stat-value">{{ mentalMathRecords.length }}</text>
          <text class="stat-label">训练次数</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ mathStore.averageAccuracy }}%</text>
          <text class="stat-label">平均准确率</text>
        </view>
      </view>
    </view>

    <!-- 模式选择 -->
    <view class="mode-select-section" v-if="!mentalMathState.isRunning">
      <view class="section-title">
        <text>选择模式</text>
      </view>
      <view class="mode-grid">
        <view 
          class="mode-card"
          :class="{ active: selectedMode === 'timed_challenge' }"
          @click="selectMode('timed_challenge')"
        >
          <text class="mode-icon">⏱️</text>
          <text class="mode-name">时间挑战</text>
          <text class="mode-desc">在限定时间内回答更多问题</text>
        </view>
        <view 
          class="mode-card"
          :class="{ active: selectedMode === 'accuracy_training' }"
          @click="selectMode('accuracy_training')"
        >
          <text class="mode-icon">🎯</text>
          <text class="mode-name">准确率训练</text>
          <text class="mode-desc">30题，追求最高正确率</text>
        </view>
      </view>

      <view class="section-title">
        <text>选择难度</text>
      </view>
      <view class="difficulty-row">
        <view 
          v-for="diff in difficulties" 
          :key="diff.id"
          class="diff-btn"
          :class="{ active: selectedDifficulty === diff.id }"
          @click="selectDifficulty(diff.id)"
        >
          {{ diff.name }}
        </view>
      </view>

      <view class="duration-section" v-if="selectedMode === 'timed_challenge'">
        <view class="section-title">
          <text>训练时长</text>
        </view>
        <view class="duration-row">
          <view 
            v-for="dur in durations" 
            :key="dur"
            class="dur-btn"
            :class="{ active: selectedDuration === dur }"
            @click="selectDuration(dur)"
          >
            {{ dur }}秒
          </view>
        </view>
      </view>

      <view class="start-btn" @click="startTraining">
        <text>开始训练</text>
      </view>
    </view>

    <!-- 训练进行中 -->
    <view class="training-section" v-if="mentalMathState.isRunning">
      <view class="timer-display">
        <view class="timer-circle">
          <text class="timer-num">{{ mentalMathState.timeLeft }}</text>
          <text class="timer-unit">秒</text>
        </view>
      </view>

      <view class="progress-info">
        <text>第 {{ mentalMathState.currentIndex + 1 }} 题</text>
        <text>✅ {{ mentalMathState.correctAnswers }} 正确</text>
      </view>

      <view class="problem-card">
        <view class="problem-text">
          <text class="num">{{ currentProblem?.a }}</text>
          <text class="symbol">{{ currentProblem?.symbol }}</text>
          <text class="num">{{ currentProblem?.b }}</text>
          <text class="symbol">=</text>
          <text class="unknown">?</text>
        </view>
      </view>

      <view class="answer-section">
        <input 
          class="answer-input" 
          type="number" 
          v-model="userAnswer" 
          placeholder="输入答案"
          @confirm="submitAnswer"
          focus
        />
        <view class="submit-btn" @click="submitAnswer">
          <text>确认</text>
        </view>
      </view>

      <view class="quit-btn" @click="quitTraining">
        <text>退出训练</text>
      </view>
    </view>

    <!-- 训练结果 -->
    <view class="result-section" v-if="showResult && !mentalMathState.isRunning">
      <view class="result-card">
        <text class="result-icon">🎉</text>
        <text class="result-title">训练完成！</text>
        
        <view class="result-stats">
          <view class="result-stat">
            <text class="stat-num">{{ lastResult?.accuracy || 0 }}%</text>
            <text class="stat-desc">准确率</text>
          </view>
          <view class="result-stat">
            <text class="stat-num">{{ lastResult?.correctAnswers || 0 }}</text>
            <text class="stat-desc">正确题数</text>
          </view>
          <view class="result-stat">
            <text class="stat-num">{{ lastResult?.totalQuestions || 0 }}</text>
            <text class="stat-desc">总题数</text>
          </view>
        </view>

        <view class="accuracy-bar">
          <view class="accuracy-fill" :style="{ width: (lastResult?.accuracy || 0) + '%' }"></view>
        </view>

        <view class="result-actions">
          <view class="action-btn secondary" @click="backToSelect">
            <text>返回</text>
          </view>
          <view class="action-btn primary" @click="replayTraining">
            <text>再来一次</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 历史记录 -->
    <view class="history-section" v-if="!mentalMathState.isRunning && !showResult">
      <view class="section-title">
        <text>训练记录</text>
      </view>
      <view class="history-list">
        <view class="history-item" v-for="record in mentalMathRecords" :key="record.id">
          <view class="history-left">
            <text class="history-mode">{{ getModeName(record.type) }}</text>
            <text class="history-diff">{{ getDiffName(record.difficulty) }}</text>
          </view>
          <view class="history-right">
            <text class="history-accuracy" :class="{ high: record.accuracy >= 90 }">
              {{ record.accuracy }}%
            </text>
            <text class="history-date">{{ formatDate(record.completedAt) }}</text>
          </view>
        </view>
        <view class="empty-tip" v-if="mentalMathRecords.length === 0">
          <text>暂无记录，开始你的第一次训练吧！</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useMathStore } from '@/stores/mathStore.js'

const mathStore = useMathStore()

const selectedMode = ref('timed_challenge')
const selectedDifficulty = ref('medium')
const selectedDuration = ref(60)
const userAnswer = ref('')
const showResult = ref(false)
const lastResult = ref(null)
let timerInterval = null

const difficulties = [
  { id: 'easy', name: '简单' },
  { id: 'medium', name: '中等' },
  { id: 'hard', name: '困难' }
]

const durations = [30, 60, 120]

const mentalMathState = computed(() => mathStore.mentalMathState)
const mentalMathRecords = computed(() => mathStore.mentalMathRecords)

const currentProblem = computed(() => {
  if (!mentalMathState.value.problems || !mentalMathState.value.problems.length) return null
  return mentalMathState.value.problems[mentalMathState.value.currentIndex]
})

const selectMode = (mode) => {
  selectedMode.value = mode
}

const selectDifficulty = (diff) => {
  selectedDifficulty.value = diff
}

const selectDuration = (dur) => {
  selectedDuration.value = dur
}

const startTraining = () => {
  showResult.value = false
  lastResult.value = null
  userAnswer.value = ''
  
  const duration = selectedMode.value === 'timed_challenge' ? selectedDuration.value : 120
  mathStore.startMentalMath(selectedMode.value, selectedDifficulty.value, duration)
  
  // Start timer for timed challenge mode
  if (selectedMode.value === 'timed_challenge') {
    timerInterval = setInterval(() => {
      if (mathStore.mentalMathState.timeLeft > 0) {
        mathStore.updateTimeLeft(mathStore.mentalMathState.timeLeft - 1)
      } else {
        finishTraining()
      }
    }, 1000)
  }
}

const submitAnswer = () => {
  if (!userAnswer.value) return
  
  const result = mathStore.submitMentalAnswer(parseInt(userAnswer.value))
  
  if (result.isFinished) {
    finishTraining()
  }
  
  userAnswer.value = ''
}

const finishTraining = () => {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
  
  const finalRecord = {
    type: mentalMathState.value.mode,
    difficulty: selectedDifficulty.value,
    duration: mentalMathState.value.duration,
    totalQuestions: mentalMathState.value.problems.length,
    correctAnswers: mentalMathState.value.correctAnswers
  }
  
  mathStore.endMentalMath()
  
  // Save final record
  const record = mathStore.saveMentalMathRecord
    ? mathStore.saveMentalMathRecord(finalRecord)
    : null
  
  lastResult.value = record || {
    ...finalRecord,
    accuracy: Math.round((finalRecord.correctAnswers / finalRecord.totalQuestions) * 100)
  }
  
  showResult.value = true
}

const quitTraining = () => {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
  mathStore.endMentalMath()
  showResult.value = false
}

const backToSelect = () => {
  showResult.value = false
  lastResult.value = null
}

const replayTraining = () => {
  startTraining()
}

const getModeName = (modeId) => {
  const names = {
    'timed_challenge': '时间挑战',
    'accuracy_training': '准确率训练'
  }
  return names[modeId] || modeId
}

const getDiffName = (diffId) => {
  const names = { easy: '简单', medium: '中等', hard: '困难' }
  return names[diffId] || diffId
}

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now - date
  if (diff < 86400000) return '今天'
  if (diff < 86400000 * 2) return '昨天'
  return `${date.getMonth() + 1}/${date.getDate()}`
}

onMounted(() => {
  mathStore.loadMentalMathRecords()
})

onUnmounted(() => {
  if (timerInterval) {
    clearInterval(timerInterval)
  }
})
</script>

<style scoped>
.mental-math-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20rpx;
}

.header-card {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.header-info {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.header-icon {
  font-size: 48rpx;
  margin-right: 16rpx;
}

.header-text {
  flex: 1;
}

.header-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #fff;
  display: block;
}

.header-subtitle {
  font-size: 24rpx;
  color: rgba(255,255,255,0.8);
}

.stats-row {
  display: flex;
  gap: 40rpx;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 36rpx;
  font-weight: bold;
  color: #fff;
  display: block;
}

.stat-label {
  font-size: 22rpx;
  color: rgba(255,255,255,0.8);
}

.section-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin: 30rpx 0 20rpx;
}

.mode-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
}

.mode-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  text-align: center;
  border: 2px solid transparent;
}

.mode-card.active {
  border-color: #fa709a;
  background: #fff5f7;
}

.mode-icon {
  font-size: 48rpx;
  display: block;
  margin-bottom: 12rpx;
}

.mode-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.mode-desc {
  font-size: 22rpx;
  color: #999;
}

.difficulty-row, .duration-row {
  display: flex;
  gap: 16rpx;
}

.diff-btn, .dur-btn {
  flex: 1;
  background: #fff;
  border-radius: 12rpx;
  padding: 20rpx;
  text-align: center;
  font-size: 26rpx;
  color: #666;
  border: 2px solid transparent;
}

.diff-btn.active, .dur-btn.active {
  border-color: #fa709a;
  background: #fff5f7;
  color: #fa709a;
  font-weight: bold;
}

.duration-section {
  margin-top: 10rpx;
}

.start-btn {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  color: #fff;
  text-align: center;
  padding: 24rpx;
  border-radius: 50rpx;
  font-size: 32rpx;
  font-weight: bold;
  margin-top: 40rpx;
}

.training-section {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
}

.timer-display {
  display: flex;
  justify-content: center;
  margin-bottom: 30rpx;
}

.timer-circle {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.timer-num {
  font-size: 56rpx;
  font-weight: bold;
  color: #fff;
}

.timer-unit {
  font-size: 22rpx;
  color: rgba(255,255,255,0.8);
}

.progress-info {
  display: flex;
  justify-content: space-between;
  font-size: 26rpx;
  color: #666;
  margin-bottom: 20rpx;
}

.problem-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20rpx;
  padding: 60rpx;
  text-align: center;
  margin-bottom: 30rpx;
}

.problem-text {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20rpx;
}

.num {
  font-size: 56rpx;
  font-weight: bold;
  color: #fff;
}

.symbol {
  font-size: 48rpx;
  color: #fff;
}

.unknown {
  font-size: 56rpx;
  font-weight: bold;
  color: #ffd93d;
}

.answer-section {
  display: flex;
  gap: 20rpx;
  margin-bottom: 20rpx;
}

.answer-input {
  flex: 1;
  background: #f5f5f5;
  border-radius: 16rpx;
  padding: 24rpx;
  font-size: 32rpx;
  text-align: center;
}

.submit-btn {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  color: #fff;
  padding: 24rpx 48rpx;
  border-radius: 16rpx;
  font-size: 28rpx;
}

.quit-btn {
  text-align: center;
  color: #999;
  font-size: 26rpx;
  padding: 20rpx;
}

.result-section {
  background: #fff;
  border-radius: 20rpx;
  padding: 40rpx;
}

.result-card {
  text-align: center;
}

.result-icon {
  font-size: 80rpx;
  display: block;
  margin-bottom: 20rpx;
}

.result-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 30rpx;
}

.result-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20rpx;
}

.result-stat {
  text-align: center;
}

.stat-num {
  font-size: 40rpx;
  font-weight: bold;
  color: #fa709a;
  display: block;
  margin-bottom: 8rpx;
}

.stat-desc {
  font-size: 22rpx;
  color: #999;
}

.accuracy-bar {
  height: 16rpx;
  background: #eee;
  border-radius: 8rpx;
  margin-bottom: 30rpx;
}

.accuracy-fill {
  height: 100%;
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  border-radius: 8rpx;
  transition: width 0.5s;
}

.result-actions {
  display: flex;
  gap: 20rpx;
}

.action-btn {
  flex: 1;
  padding: 24rpx;
  border-radius: 16rpx;
  font-size: 28rpx;
  text-align: center;
}

.action-btn.primary {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  color: #fff;
}

.action-btn.secondary {
  background: #f5f5f5;
  color: #666;
}

.history-section {
  margin-top: 30rpx;
}

.history-list {
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  border-bottom: 1px solid #f0f0f0;
}

.history-item:last-child {
  border-bottom: none;
}

.history-left {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.history-mode {
  font-size: 26rpx;
  color: #333;
  font-weight: bold;
}

.history-diff {
  font-size: 22rpx;
  color: #999;
  background: #f5f5f5;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
}

.history-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4rpx;
}

.history-accuracy {
  font-size: 28rpx;
  font-weight: bold;
  color: #666;
}

.history-accuracy.high {
  color: #4cd964;
}

.history-date {
  font-size: 22rpx;
  color: #999;
}

.empty-tip {
  text-align: center;
  padding: 60rpx;
  color: #999;
  font-size: 26rpx;
}
</style>
