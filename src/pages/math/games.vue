<template>
  <view class="games-page">
    <!-- 头部 -->
    <view class="header-card">
      <view class="header-info">
        <text class="header-icon">🎮</text>
        <view class="header-text">
          <text class="header-title">数学游戏</text>
          <text class="header-subtitle">加减乘除，趣味闯关</text>
        </view>
      </view>
      <view class="stats-row">
        <view class="stat-item">
          <text class="stat-value">{{ gameRecords.length }}</text>
          <text class="stat-label">闯关次数</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ totalCorrectRate }}%</text>
          <text class="stat-label">正确率</text>
        </view>
      </view>
    </view>

    <!-- 游戏选择 -->
    <view class="game-select-section" v-if="!currentGame.isPlaying">
      <view class="section-title">
        <text>选择运算</text>
      </view>
      <view class="operation-grid">
        <view 
          v-for="op in operations" 
          :key="op.id"
          class="operation-card"
          :class="{ active: selectedOperation === op.id }"
          @click="selectOperation(op.id)"
        >
          <text class="op-icon">{{ op.icon }}</text>
          <text class="op-name">{{ op.name }}</text>
        </view>
      </view>

      <view class="section-title">
        <text>选择难度</text>
      </view>
      <view class="difficulty-grid">
        <view 
          v-for="diff in difficulties" 
          :key="diff.id"
          class="difficulty-card"
          :class="{ active: selectedDifficulty === diff.id }"
          @click="selectDifficulty(diff.id)"
        >
          <text class="diff-name">{{ diff.name }}</text>
          <text class="diff-range">{{ diff.min }}-{{ diff.max }}</text>
        </view>
      </view>

      <view class="start-btn" @click="startGame">
        <text>开始挑战</text>
      </view>
    </view>

    <!-- 游戏进行中 -->
    <view class="game-playground" v-if="currentGame.isPlaying">
      <view class="game-progress">
        <view class="progress-info">
          <text>第 {{ currentGame.currentIndex + 1 }} / {{ currentGame.problems.length }} 题</text>
          <text>✅ {{ currentGame.correctAnswers }} 正确</text>
        </view>
        <view class="progress-bar">
          <view class="progress-fill" :style="{ width: progressPercent + '%' }"></view>
        </view>
      </view>

      <view class="problem-card">
        <view class="problem-text">
          <text class="num">{{ currentGame.currentProblem?.a }}</text>
          <text class="symbol">{{ currentGame.currentProblem?.symbol }}</text>
          <text class="num">{{ currentGame.currentProblem?.b }}</text>
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

      <view class="quit-btn" @click="quitGame">
        <text>退出</text>
      </view>
    </view>

    <!-- 游戏结果 -->
    <view class="game-result" v-if="showResult && !currentGame.isPlaying">
      <view class="result-card">
        <text class="result-icon">🎉</text>
        <text class="result-title">本轮完成！</text>
        
        <view class="result-stats">
          <view class="result-stat">
            <text class="stat-num">{{ lastResult?.correctAnswers || 0 }}</text>
            <text class="stat-desc">正确题数</text>
          </view>
          <view class="result-stat">
            <text class="stat-num">{{ lastResult?.totalQuestions || 0 }}</text>
            <text class="stat-desc">总题数</text>
          </view>
          <view class="result-stat">
            <text class="stat-num">{{ lastResult?.stars || 0 }}⭐</text>
            <text class="stat-desc">获得星星</text>
          </view>
        </view>

        <view class="stars-display">
          <text v-for="i in 3" :key="i" class="star" :class="{ active: i <= (lastResult?.stars || 0) }">
            {{ i <= (lastResult?.stars || 0) ? '⭐' : '☆' }}
          </text>
        </view>

        <view class="result-actions">
          <view class="action-btn secondary" @click="backToSelect">
            <text>返回</text>
          </view>
          <view class="action-btn primary" @click="replayGame">
            <text>再来一次</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 历史记录 -->
    <view class="history-section" v-if="!currentGame.isPlaying && !showResult">
      <view class="section-title">
        <text>闯关记录</text>
      </view>
      <view class="history-list">
        <view class="history-item" v-for="record in gameRecords" :key="record.id">
          <view class="history-left">
            <text class="history-op">{{ getOpName(record.operation) }}</text>
            <text class="history-diff">{{ getDiffName(record.difficulty) }}</text>
          </view>
          <view class="history-right">
            <text class="history-score">{{ record.correctAnswers }}/{{ record.totalQuestions }}</text>
            <text class="history-stars">{{ '⭐'.repeat(record.stars) }}</text>
          </view>
        </view>
        <view class="empty-tip" v-if="gameRecords.length === 0">
          <text>暂无记录，快去挑战吧！</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useMathStore } from '@/stores/mathStore.js'
import { MATH_OPERATIONS, DIFFICULTY_LEVELS } from '@/services/mathService.js'

const mathStore = useMathStore()

const selectedOperation = ref('add')
const selectedDifficulty = ref('easy')
const userAnswer = ref('')
const showResult = ref(false)
const lastResult = ref(null)

const operations = computed(() => Object.values(MATH_OPERATIONS))
const difficulties = computed(() => Object.values(DIFFICULTY_LEVELS))

const currentGame = computed(() => mathStore.currentGame)
const gameRecords = computed(() => mathStore.gameRecords)

const totalCorrectRate = computed(() => {
  if (gameRecords.value.length === 0) return 0
  const total = gameRecords.value.reduce((sum, r) => sum + r.totalQuestions, 0)
  const correct = gameRecords.value.reduce((sum, r) => sum + r.correctAnswers, 0)
  return total > 0 ? Math.round((correct / total) * 100) : 0
})

const progressPercent = computed(() => {
  if (!currentGame.value.problems.length) return 0
  return Math.round((currentGame.value.currentIndex / currentGame.value.problems.length) * 100)
})

const selectOperation = (op) => {
  selectedOperation.value = op
}

const selectDifficulty = (diff) => {
  selectedDifficulty.value = diff
}

const startGame = () => {
  showResult.value = false
  lastResult.value = null
  userAnswer.value = ''
  mathStore.startGame(selectedOperation.value, selectedDifficulty.value, 10)
}

const submitAnswer = () => {
  if (!userAnswer.value) return
  
  const result = mathStore.submitAnswer(parseInt(userAnswer.value))
  
  if (result.isFinished) {
    lastResult.value = result.record
    showResult.value = true
  }
  
  userAnswer.value = ''
}

const quitGame = () => {
  mathStore.endGame()
  showResult.value = false
}

const backToSelect = () => {
  showResult.value = false
  lastResult.value = null
}

const replayGame = () => {
  startGame()
}

const getOpName = (opId) => {
  const names = { add: '加法', subtract: '减法', multiply: '乘法', divide: '除法' }
  return names[opId] || opId
}

const getDiffName = (diffId) => {
  const names = { easy: '简单', medium: '中等', hard: '困难', expert: '专家' }
  return names[diffId] || diffId
}

onMounted(() => {
  mathStore.loadGameRecords()
})
</script>

<style scoped>
.games-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20rpx;
}

.header-card {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
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

.operation-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16rpx;
}

.operation-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx 16rpx;
  text-align: center;
  border: 2px solid transparent;
}

.operation-card.active {
  border-color: #f5576c;
  background: #fff0f3;
}

.op-icon {
  font-size: 40rpx;
  display: block;
  margin-bottom: 8rpx;
}

.op-name {
  font-size: 24rpx;
  color: #666;
}

.difficulty-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
}

.difficulty-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  text-align: center;
  border: 2px solid transparent;
}

.difficulty-card.active {
  border-color: #f5576c;
  background: #fff0f3;
}

.diff-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.diff-range {
  font-size: 22rpx;
  color: #999;
}

.start-btn {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: #fff;
  text-align: center;
  padding: 24rpx;
  border-radius: 50rpx;
  font-size: 32rpx;
  font-weight: bold;
  margin-top: 40rpx;
}

.game-playground {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
}

.game-progress {
  margin-bottom: 40rpx;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  font-size: 26rpx;
  color: #666;
  margin-bottom: 12rpx;
}

.progress-bar {
  height: 12rpx;
  background: #eee;
  border-radius: 6rpx;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  border-radius: 6rpx;
  transition: width 0.3s;
}

.problem-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20rpx;
  padding: 60rpx;
  text-align: center;
  margin-bottom: 40rpx;
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
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
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

.game-result {
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
  margin-bottom: 30rpx;
}

.result-stat {
  text-align: center;
}

.stat-num {
  font-size: 40rpx;
  font-weight: bold;
  color: #f5576c;
  display: block;
  margin-bottom: 8rpx;
}

.stat-desc {
  font-size: 22rpx;
  color: #999;
}

.stars-display {
  margin-bottom: 30rpx;
}

.star {
  font-size: 48rpx;
  margin: 0 8rpx;
  color: #ddd;
}

.star.active {
  color: #ffd700;
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
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
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

.history-op {
  font-size: 28rpx;
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
  align-items: center;
  gap: 16rpx;
}

.history-score {
  font-size: 26rpx;
  color: #f5576c;
  font-weight: bold;
}

.history-stars {
  font-size: 22rpx;
  color: #ffd700;
}

.empty-tip {
  text-align: center;
  padding: 60rpx;
  color: #999;
  font-size: 26rpx;
}
</style>
