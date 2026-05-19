<template>
  <view class="rhythm-game-page">
    <!-- 页面标题 -->
    <view class="page-header">
      <text class="page-title">🥁 节奏游戏</text>
      <view class="header-stats">
        <text class="stat-item">🏆 {{ totalScore }}</text>
      </view>
    </view>

    <!-- 游戏进度 -->
    <view class="progress-section">
      <view class="progress-info">
        <text class="progress-label">游戏解锁进度</text>
        <text class="progress-value">{{ store.gameProgress }}%</text>
      </view>
      <view class="progress-bar">
        <view class="progress-fill" :style="{ width: store.gameProgress + '%' }"></view>
      </view>
    </view>

    <!-- 游戏选择 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">选择游戏</text>
      </view>
      <view class="game-grid">
        <view
          v-for="game in store.rhythmGames"
          :key="game.id"
          class="game-card"
          :class="{ locked: !isGameUnlocked(game), playing: store.currentGame?.id === game.id }"
          @click="selectGame(game)"
        >
          <view class="game-icon">{{ game.icon }}</view>
          <view class="game-info">
            <text class="game-title">{{ game.title }}</text>
            <text class="game-desc">{{ game.description }}</text>
            <view class="game-meta">
              <text class="game-difficulty" :style="{ color: getDifficultyColor(game.difficulty) }">
                {{ getDifficultyText(game.difficulty) }}
              </text>
              <text class="game-bpm">{{ game.bpm }} BPM</text>
            </view>
          </view>
          <view v-if="!isGameUnlocked(game)" class="lock-overlay">
            <text class="lock-icon">🔒</text>
            <text class="lock-level">Lv.{{ game.unlockLevel }}</text>
          </view>
          <view v-else-if="game.maxScore > 0" class="best-score">
            <text class="score-label">最高分</text>
            <text class="score-value">{{ game.maxScore }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 游戏说明 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">🎯 游戏规则</text>
      </view>
      <view class="rules-card">
        <view class="rule-item">
          <text class="rule-icon">1️⃣</text>
          <text class="rule-text">跟随节拍器的节奏，点击屏幕上的圆圈</text>
        </view>
        <view class="rule-item">
          <text class="rule-icon">2️⃣</text>
          <text class="rule-text">点击时机越准确，得分越高</text>
        </view>
        <view class="rule-item">
          <text class="rule-icon">3️⃣</text>
          <text class="rule-text">连续正确点击可以获得连击加分</text>
        </view>
        <view class="rule-item">
          <text class="rule-icon">4️⃣</text>
          <text class="rule-text">Perfect 精准完美，Good 良好，Miss 错过</text>
        </view>
      </view>
    </view>

    <!-- 演奏区域（游戏进行时） -->
    <view v-if="showGameArea" class="game-area">
      <view class="game-area-header">
        <view class="game-area-title">
          <text class="game-name">{{ selectedGame?.title }}</text>
          <text class="game-timer">{{ formatTime(gameTime) }}</text>
        </view>
        <view class="game-stats">
          <view class="stat-box">
            <text class="stat-label">分数</text>
            <text class="stat-value score">{{ gameScore }}</text>
          </view>
          <view class="stat-box">
            <text class="stat-label">连击</text>
            <text class="stat-value combo">{{ currentCombo }}</text>
          </view>
          <view class="stat-box">
            <text class="stat-label">准确率</text>
            <text class="stat-value accuracy">{{ accuracy }}%</text>
          </view>
        </view>
      </view>

      <!-- 节拍轨道 -->
      <view class="beat-track">
        <view
          v-for="(beat, index) in beats"
          :key="index"
          class="beat-circle"
          :class="{ perfect: beat.result === 'perfect', good: beat.result === 'good', miss: beat.result === 'miss' }"
          :style="{ left: beat.x + '%', top: beat.targetY + 'px' }"
        >
          <text v-if="beat.result">{{ getResultText(beat.result) }}</text>
        </view>
      </view>

      <!-- 点击区域 -->
      <view class="tap-area" @click="handleTap">
        <text class="tap-hint">点击此处</text>
      </view>

      <!-- 节拍指示器 -->
      <view class="beat-indicator">
        <view
          v-for="i in 4"
          :key="i"
          class="beat-dot"
          :class="{ active: currentBeat === i }"
        ></view>
      </view>

      <!-- 游戏控制 -->
      <view class="game-controls">
        <button class="btn-pause" @click="pauseGame">
          {{ isPaused ? '▶️ 继续' : '⏸️ 暂停' }}
        </button>
        <button class="btn-quit" @click="quitGame">退出游戏</button>
      </view>
    </view>

    <!-- 游戏结束弹窗 -->
    <view v-if="showResultModal" class="modal-overlay">
      <view class="modal-content result-modal">
        <view class="result-header">
          <text class="result-title">🎉 游戏结束</text>
        </view>
        <view class="result-body">
          <view class="result-score">
            <text class="final-score">{{ finalScore }}</text>
            <text class="score-suffix">分</text>
          </view>
          <view class="result-stats">
            <view class="result-stat">
              <text class="stat-label">准确率</text>
              <text class="stat-value">{{ finalAccuracy }}%</text>
            </view>
            <view class="result-stat">
              <text class="stat-label">最大连击</text>
              <text class="stat-value">{{ finalMaxCombo }}</text>
            </view>
            <view class="result-stat">
              <text class="stat-label">Perfect</text>
              <text class="stat-value perfect">{{ perfectCount }}</text>
            </view>
            <view class="result-stat">
              <text class="stat-label">Good</text>
              <text class="stat-value good">{{ goodCount }}</text>
            </view>
            <view class="result-stat">
              <text class="stat-label">Miss</text>
              <text class="stat-value miss">{{ missCount }}</text>
            </view>
          </view>
          <view class="result-rating">
            <text class="rating-label">评价：</text>
            <text class="rating-value">{{ getRating() }}</text>
          </view>
        </view>
        <view class="result-footer">
          <button class="btn-retry" @click="retryGame">再玩一次</button>
          <button class="btn-close" @click="closeResult">返回</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useMusicStore } from '@/stores/musicStore.js'

const store = useMusicStore()

// 状态
const showGameArea = ref(false)
const showResultModal = ref(false)
const selectedGame = ref(null)
const isPaused = ref(false)
const gameTime = ref(0)
const gameScore = ref(0)
const currentCombo = ref(0)
const accuracy = ref(100)
const beats = ref([])
const currentBeat = ref(0)
const totalHits = ref(0)
const perfectHits = ref(0)
const goodHits = ref(0)
const missHits = ref(0)

// 游戏结果
const finalScore = ref(0)
const finalAccuracy = ref(0)
const finalMaxCombo = ref(0)
const perfectCount = ref(0)
const goodCount = ref(0)
const missCount = ref(0)

// 定时器
let gameTimer = null
let beatTimer = null
let bpmInterval = null

// 总分
const totalScore = computed(() => {
  return store.rhythmGames.reduce((sum, g) => sum + (g.maxScore || 0), 0)
})

// 判断游戏是否解锁
const isGameUnlocked = (game) => {
  if (game.isUnlocked) return true
  const level = 1 // 从 babyStore 获取
  return (game.unlockLevel || 0) <= level
}

// 获取难度文本
const getDifficultyText = (diff) => {
  const levels = { easy: '简单', medium: '中等', hard: '困难' }
  return levels[diff] || diff
}

// 获取难度颜色
const getDifficultyColor = (diff) => {
  const colors = { easy: '#2ECC71', medium: '#F39C12', hard: '#E74C3C' }
  return colors[diff] || '#999'
}

// 获取结果文本
const getResultText = (result) => {
  const texts = { perfect: 'Perfect!', good: 'Good!', miss: 'Miss' }
  return texts[result] || ''
}

// 选择游戏
const selectGame = (game) => {
  if (!isGameUnlocked(game)) {
    uni.showToast({ title: `需要达到 Lv.${game.unlockLevel} 解锁`, icon: 'none' })
    return
  }
  selectedGame.value = game
  startGame()
}

// 开始游戏
const startGame = () => {
  showGameArea.value = true
  showResultModal.value = false
  
  // 重置状态
  gameTime.value = selectedGame.value.duration
  gameScore.value = 0
  currentCombo.value = 0
  accuracy.value = 100
  beats.value = []
  totalHits.value = 0
  perfectHits.value = 0
  goodHits.value = 0
  missHits.value = 0
  currentBeat.value = 0
  isPaused.value = false

  store.startGame(selectedGame.value)
  
  // 启动游戏定时器
  gameTimer = setInterval(() => {
    if (!isPaused.value) {
      gameTime.value--
      if (gameTime.value <= 0) {
        endGame()
      }
    }
  }, 1000)

  // 启动节拍生成器
  const bpm = selectedGame.value.bpm
  const interval = 60000 / bpm
  
  bpmInterval = setInterval(() => {
    if (!isPaused.value) {
      generateBeat()
    }
  }, interval)
}

// 生成节拍
const generateBeat = () => {
  currentBeat.value = (currentBeat.value % 4) + 1
  
  // 随机生成一个节拍目标位置
  const targetX = 20 + Math.random() * 60
  const beat = {
    id: Date.now(),
    x: targetX,
    targetY: 200,
    result: null,
    hit: false
  }
  beats.value.push(beat)

  // 2秒后自动判定为 miss
  setTimeout(() => {
    if (!beat.hit && beat.result === null) {
      beat.result = 'miss'
      missHits.value++
      currentCombo.value = 0
      updateAccuracy()
    }
  }, 1500)

  // 清理过期的节拍
  setTimeout(() => {
    beats.value = beats.value.filter(b => b.id !== beat.id)
  }, 2000)
}

// 处理点击
const handleTap = () => {
  if (isPaused.value) return
  
  // 找到最近的未击中的节拍
  const targetBeat = beats.value.find(b => !b.hit && b.result === null)
  
  if (targetBeat) {
    targetBeat.hit = true
    
    // 判定准确性（简化版：基于时间）
    const timeSinceCreate = Date.now() - targetBeat.id
    if (timeSinceCreate < 200) {
      targetBeat.result = 'perfect'
      perfectHits.value++
      currentCombo.value++
      gameScore.value += 100 * (1 + currentCombo.value * 0.1)
    } else if (timeSinceCreate < 400) {
      targetBeat.result = 'good'
      goodHits.value++
      currentCombo.value++
      gameScore.value += 50 * (1 + currentCombo.value * 0.05)
    } else {
      targetBeat.result = 'good'
      goodHits.value++
      currentCombo.value++
      gameScore.value += 30
    }
    
    updateAccuracy()
    gameScore.value = Math.round(gameScore.value)
  }
}

// 更新准确率
const updateAccuracy = () => {
  const total = perfectHits.value + goodHits.value + missHits.value
  if (total === 0) {
    accuracy.value = 100
    return
  }
  accuracy.value = Math.round(((perfectHits.value * 100 + goodHits.value * 50) / (total * 100)) * 100)
}

// 暂停游戏
const pauseGame = () => {
  isPaused.value = !isPaused.value
}

// 退出游戏
const quitGame = () => {
  clearInterval(gameTimer)
  clearInterval(beatTimer)
  clearInterval(bpmInterval)
  showGameArea.value = false
  store.endGame(0, 0)
}

// 结束游戏
const endGame = () => {
  clearInterval(gameTimer)
  clearInterval(beatTimer)
  clearInterval(bpmInterval)

  // 保存结果
  finalScore.value = gameScore.value
  finalAccuracy.value = accuracy.value
  finalMaxCombo.value = currentCombo.value
  perfectCount.value = perfectHits.value
  goodCount.value = goodHits.value
  missCount.value = missHits.value

  store.endGame(finalScore.value, finalAccuracy.value)
  
  showResultModal.value = true
}

// 重试
const retryGame = () => {
  showResultModal.value = false
  startGame()
}

// 关闭结果
const closeResult = () => {
  showResultModal.value = false
  showGameArea.value = false
}

// 格式化时间
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// 获取评价
const getRating = () => {
  if (finalAccuracy.value >= 95) return '⭐ SSS - 完美！'
  if (finalAccuracy.value >= 90) return '⭐⭐ SS - 太棒了！'
  if (finalAccuracy.value >= 80) return '⭐⭐⭐ A - 很不错！'
  if (finalAccuracy.value >= 70) return 'B - 继续加油！'
  if (finalAccuracy.value >= 60) return 'C - 还需努力！'
  return 'D - 多加练习！'
}

// 初始化
onMounted(() => {
  store.loadRhythmGames()
})

onUnmounted(() => {
  if (gameTimer) clearInterval(gameTimer)
  if (beatTimer) clearInterval(beatTimer)
  if (bpmInterval) clearInterval(bpmInterval)
})
</script>

<style scoped>
.rhythm-game-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 40rpx;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx 32rpx 24rpx;
  background-color: #fff;
}

.page-title {
  font-size: 40rpx;
  font-weight: 600;
  color: #333;
}

.header-stats {
  display: flex;
  gap: 24rpx;
}

.stat-item {
  font-size: 28rpx;
  color: #666;
}

/* 进度 */
.progress-section {
  margin: 24rpx 32rpx;
  padding: 24rpx;
  background-color: #fff;
  border-radius: 16rpx;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12rpx;
}

.progress-label {
  font-size: 26rpx;
  color: #666;
}

.progress-value {
  font-size: 26rpx;
  color: #4ECDC4;
  font-weight: 600;
}

.progress-bar {
  height: 12rpx;
  background-color: #E0E0E0;
  border-radius: 6rpx;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4ECDC4, #44A08D);
  border-radius: 6rpx;
  transition: width 0.3s;
}

/* 游戏卡片 */
.section {
  margin: 24rpx 32rpx;
}

.section-header {
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.game-grid {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.game-card {
  display: flex;
  align-items: center;
  padding: 24rpx;
  background-color: #fff;
  border-radius: 16rpx;
  position: relative;
  overflow: hidden;
}

.game-card.locked {
  opacity: 0.6;
}

.game-card.playing {
  border: 2rpx solid #4ECDC4;
}

.game-icon {
  font-size: 64rpx;
  margin-right: 20rpx;
}

.game-info {
  flex: 1;
}

.game-title {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
}

.game-desc {
  display: block;
  font-size: 24rpx;
  color: #666;
  margin-top: 6rpx;
}

.game-meta {
  display: flex;
  gap: 16rpx;
  margin-top: 8rpx;
}

.game-difficulty {
  font-size: 22rpx;
  font-weight: 600;
}

.game-bpm {
  font-size: 22rpx;
  color: #999;
}

.lock-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0,0,0,0.3);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.lock-icon {
  font-size: 48rpx;
}

.lock-level {
  font-size: 24rpx;
  color: #fff;
  margin-top: 8rpx;
}

.best-score {
  text-align: center;
  padding: 12rpx 20rpx;
  background-color: #FFF9C4;
  border-radius: 12rpx;
}

.score-label {
  display: block;
  font-size: 20rpx;
  color: #F39C12;
}

.score-value {
  display: block;
  font-size: 32rpx;
  font-weight: 700;
  color: #F39C12;
}

/* 游戏规则 */
.rules-card {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
}

.rule-item {
  display: flex;
  align-items: center;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.rule-item:last-child {
  border-bottom: none;
}

.rule-icon {
  font-size: 36rpx;
  margin-right: 16rpx;
}

.rule-text {
  font-size: 28rpx;
  color: #666;
  line-height: 1.4;
}

/* 游戏区域 */
.game-area {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
  z-index: 1000;
}

.game-area-header {
  padding: 32rpx;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.game-area-title {
  display: flex;
  flex-direction: column;
}

.game-name {
  font-size: 32rpx;
  font-weight: 600;
  color: #fff;
}

.game-timer {
  font-size: 48rpx;
  font-weight: 700;
  color: #4ECDC4;
  margin-top: 8rpx;
}

.game-stats {
  display: flex;
  gap: 16rpx;
}

.stat-box {
  background-color: rgba(255,255,255,0.1);
  padding: 12rpx 20rpx;
  border-radius: 12rpx;
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 20rpx;
  color: rgba(255,255,255,0.7);
}

.stat-value {
  display: block;
  font-size: 28rpx;
  font-weight: 700;
  color: #fff;
}

.stat-value.score {
  color: #FFD700;
}

.stat-value.combo {
  color: #4ECDC4;
}

.stat-value.accuracy {
  color: #9B59B6;
}

/* 节拍轨道 */
.beat-track {
  position: absolute;
  top: 200rpx;
  left: 0;
  right: 0;
  height: 400rpx;
}

.beat-circle {
  position: absolute;
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background-color: #4ECDC4;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  font-weight: 600;
  color: #fff;
  transition: all 0.3s;
}

.beat-circle.perfect {
  background-color: #FFD700;
  transform: translate(-50%, -50%) scale(1.2);
}

.beat-circle.good {
  background-color: #3498DB;
}

.beat-circle.miss {
  background-color: #E74C3C;
  opacity: 0.5;
}

/* 点击区域 */
.tap-area {
  position: absolute;
  bottom: 300rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 300rpx;
  height: 300rpx;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(78,205,196,0.3) 0%, rgba(78,205,196,0.1) 100%);
  border: 4rpx solid #4ECDC4;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tap-hint {
  font-size: 28rpx;
  color: #4ECDC4;
}

/* 节拍指示器 */
.beat-indicator {
  position: absolute;
  bottom: 150rpx;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 24rpx;
}

.beat-dot {
  width: 20rpx;
  height: 20rpx;
  border-radius: 50%;
  background-color: rgba(255,255,255,0.3);
  transition: all 0.2s;
}

.beat-dot.active {
  background-color: #4ECDC4;
  transform: scale(1.5);
}

/* 游戏控制 */
.game-controls {
  position: absolute;
  bottom: 60rpx;
  left: 32rpx;
  right: 32rpx;
  display: flex;
  gap: 24rpx;
}

.btn-pause, .btn-quit {
  flex: 1;
  padding: 24rpx;
  border-radius: 48rpx;
  font-size: 28rpx;
  font-weight: 600;
  border: none;
}

.btn-pause {
  background-color: #4ECDC4;
  color: #fff;
}

.btn-quit {
  background-color: rgba(255,255,255,0.1);
  color: #fff;
}

/* 结果弹窗 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0,0,0,0.7);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.result-modal {
  width: 85%;
  background-color: #fff;
  border-radius: 32rpx;
  overflow: hidden;
}

.result-header {
  padding: 40rpx;
  background: linear-gradient(135deg, #4ECDC4, #44A08D);
  text-align: center;
}

.result-title {
  font-size: 40rpx;
  font-weight: 700;
  color: #fff;
}

.result-body {
  padding: 40rpx;
}

.result-score {
  text-align: center;
  margin-bottom: 32rpx;
}

.final-score {
  font-size: 96rpx;
  font-weight: 800;
  color: #FFD700;
}

.score-suffix {
  font-size: 32rpx;
  color: #F39C12;
}

.result-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.result-stat {
  text-align: center;
  padding: 16rpx;
  background-color: #f5f5f5;
  border-radius: 12rpx;
}

.stat-label {
  display: block;
  font-size: 22rpx;
  color: #666;
}

.stat-value {
  display: block;
  font-size: 32rpx;
  font-weight: 700;
  color: #333;
}

.stat-value.perfect {
  color: #FFD700;
}

.stat-value.good {
  color: #3498DB;
}

.stat-value.miss {
  color: #E74C3C;
}

.result-rating {
  text-align: center;
  padding: 20rpx;
  background-color: #FFF9C4;
  border-radius: 12rpx;
}

.rating-label {
  font-size: 28rpx;
  color: #666;
}

.rating-value {
  font-size: 32rpx;
  font-weight: 700;
  color: #F39C12;
}

.result-footer {
  display: flex;
  gap: 24rpx;
  padding: 0 40rpx 40rpx;
}

.btn-retry, .btn-close {
  flex: 1;
  padding: 24rpx;
  border-radius: 48rpx;
  font-size: 30rpx;
  font-weight: 600;
  border: none;
}

.btn-retry {
  background: linear-gradient(135deg, #4ECDC4, #44A08D);
  color: #fff;
}

.btn-close {
  background-color: #f0f0f0;
  color: #666;
}
</style>
