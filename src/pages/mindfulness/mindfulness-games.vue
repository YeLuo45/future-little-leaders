<template>
  <view class="mindfulness-games-page">
    <!-- 顶部导航 -->
    <view class="nav-header">
      <text class="back-btn" @click="goBack">‹</text>
      <text class="nav-title">正念游戏</text>
      <text class="nav-placeholder"></text>
    </view>

    <!-- 类型筛选 -->
    <view class="filter-section">
      <view
        v-for="type in gameTypes"
        :key="type.value"
        class="filter-tag"
        :class="{ active: selectedType === type.value }"
        :style="selectedType === type.value ? { background: type.color } : {}"
        @click="filterByType(type.value)"
      >
        {{ type.icon }} {{ type.label }}
      </view>
    </view>

    <!-- 游戏列表 -->
    <view class="games-list">
      <view
        v-for="game in filteredGames"
        :key="game.id"
        class="game-card"
        @click="selectGame(game)"
      >
        <view class="game-header">
          <view class="type-badge" :style="{ background: getTypeInfo(game.type).color }">
            {{ getTypeInfo(game.type).icon }} {{ getTypeInfo(game.type).label }}
          </view>
          <view v-if="getProgress(game.id).completed" class="completed-badge">
            ★ {{ getProgress(game.id).stars }}星
          </view>
        </view>
        <text class="game-title">{{ game.title }}</text>
        <text class="game-desc">{{ game.description }}</text>
        <view class="game-footer">
          <text class="difficulty-tag">难度: {{ game.difficulty }}</text>
          <text class="best-score" v-if="getProgress(game.id).bestScore > 0">
            最高分: {{ getProgress(game.id).bestScore }}
          </text>
        </view>
      </view>

      <view v-if="filteredGames.length === 0" class="empty-state">
        <text>暂无正念游戏</text>
      </view>
    </view>

    <!-- 游戏详情弹窗 -->
    <view v-if="showGameModal" class="modal-overlay" @click="closeModal">
      <view class="modal-content game-modal" @click.stop>
        <view class="modal-header">
          <text class="modal-title">{{ currentGame.title }}</text>
          <text class="modal-close" @click="closeModal">×</text>
        </view>

        <view class="game-info">
          <view class="info-badge">
            {{ getTypeInfo(currentGame.type).icon }}
            {{ getTypeInfo(currentGame.type).label }}
          </view>
          <text class="info-difficulty">难度: {{ currentGame.difficulty }}</text>
        </view>

        <view class="tips-section">
          <text class="tips-title">游戏提示</text>
          <view v-for="(tip, index) in currentGame.tips" :key="index" class="tip-item">
            <text class="tip-icon">💡</text>
            <text class="tip-text">{{ tip }}</text>
          </view>
        </view>

        <view class="modal-actions">
          <button class="action-btn start" @click="startGame">
            开始游戏
          </button>
        </view>
      </view>
    </view>

    <!-- 专注力训练: 数字搜索 -->
    <view v-if="isPlayingGame && currentGame.type === 'focus' && currentGame.title === '数字专注'" class="game-session">
      <view class="session-header">
        <text class="session-title">数字专注</text>
        <view class="session-stats">
          <text>用时: {{ gameTime }}秒</text>
          <text>下一个: {{ nextNumber }}</text>
        </view>
      </view>

      <view class="number-grid">
        <view
          v-for="(num, index) in numberGrid"
          :key="index"
          class="number-cell"
          :class="{ found: foundNumbers.includes(num), current: num === nextNumber }"
          @click="clickNumber(num)"
        >
          <text>{{ num }}</text>
        </view>
      </view>

      <button class="quit-btn" @click="quitGame">退出游戏</button>
    </view>

    <!-- 呼吸游戏: 呼吸同步 -->
    <view v-if="isPlayingGame && currentGame.type === 'relax' && currentGame.title === '呼吸同步'" class="game-session">
      <view class="session-header">
        <text class="session-title">呼吸同步</text>
        <view class="session-stats">
          <text>第 {{ breathRound }} / {{ currentGame.rounds }} 轮</text>
          <text>得分: {{ gameScore }}</text>
        </view>
      </view>

      <view class="breath-sync-circle">
        <view class="sync-circle" :class="syncPhase"></view>
        <view class="sync-inner">
          <text class="sync-text">{{ syncText }}</text>
        </view>
      </view>

      <view class="sync-instruction">
        <text>点击"吸气"时吸气，点击"呼气"时呼气</text>
      </view>

      <view class="sync-controls">
        <button
          class="sync-btn inhale"
          :class="{ active: syncPhase === 'inhale' }"
          @click="handleSyncClick('inhale')"
        >
          吸气
        </button>
        <button
          class="sync-btn exhale"
          :class="{ active: syncPhase === 'exhale' }"
          @click="handleSyncClick('exhale')"
        >
          呼气
        </button>
      </view>

      <button class="quit-btn" @click="quitGame">退出游戏</button>
    </view>

    <!-- 正念游戏: 五感探索 -->
    <view v-if="isPlayingGame && currentGame.type === 'awareness' && currentGame.title === '五感探索'" class="game-session">
      <view class="session-header">
        <text class="session-title">五感探索</text>
        <view class="session-stats">
          <text>剩余时间: {{ awarenessTime }}秒</text>
        </view>
      </view>

      <view class="awareness-card">
        <view class="awareness-step">
          <text class="sense-label">{{ currentSense }}</text>
          <text class="sense-prompt">{{ currentPrompt }}</text>
        </view>

        <view class="awareness-input">
          <input
            v-if="!showAwarenessResult"
            type="text"
            v-model="awarenessInput"
            placeholder="输入你的发现..."
            class="awareness-textinput"
          />
          <view v-else class="awareness-result">
            <text>已记录: {{ awarenessResult }}</text>
          </view>
        </view>

        <view class="awareness-progress">
          <text>已完成: {{ awarenessCompleted }}/5</text>
        </view>
      </view>

      <view class="awareness-controls">
        <button v-if="!showAwarenessResult" class="action-btn" @click="submitAwareness">
          记录
        </button>
        <button v-else-if="awarenessCompleted < 5" class="action-btn" @click="nextSense">
          下一个
        </button>
        <button v-else class="action-btn complete" @click="finishAwarenessGame">
          完成
        </button>
      </view>

      <button class="quit-btn" @click="quitGame">退出游戏</button>
    </view>

    <!-- 放松挑战 -->
    <view v-if="isPlayingGame && currentGame.type === 'relax' && currentGame.title === '放松挑战'" class="game-session">
      <view class="session-header">
        <text class="session-title">放松挑战</text>
        <view class="session-stats">
          <text>剩余时间: {{ relaxTime }}秒</text>
        </view>
      </view>

      <view class="relax-circle" :class="{ tense: isTense }">
        <text class="relax-text">{{ relaxStatus }}</text>
      </view>

      <view class="relax-instruction">
        <text v-if="!isRelaxed">点击"紧绷"然后放松，感受肌肉变化</text>
        <text v-else>保持放松状态...</text>
      </view>

      <view class="relax-controls">
        <button class="relax-btn tense" @click="toggleTense" :disabled="relaxTime <= 0">
          {{ isTense ? '松开!' : '紧绷' }}
        </button>
      </view>

      <view class="relax-progress">
        <text>放松时间: {{ relaxedTime }}秒</text>
      </view>

      <button class="quit-btn" @click="quitGame">退出游戏</button>
    </view>

    <!-- 游戏完成弹窗 -->
    <view v-if="showCompleteModal" class="modal-overlay">
      <view class="modal-content complete-modal">
        <text class="complete-icon">🎉</text>
        <text class="complete-title">{{ completeTitle }}</text>
        <text class="complete-score">得分: {{ finalScore }}</text>
        <text class="complete-stars">{{ '★'.repeat(finalStars) }}{{ '☆'.repeat(3 - finalStars) }}</text>
        <view class="complete-actions">
          <button class="action-btn" @click="closeCompleteModal">继续</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { useMindfulnessStore } from '@/stores/mindfulnessStore.js'
import { GAME_TYPE_INFO, MINDFULNESS_GAME_TYPE } from '@/stores/mindfulnessStore.js'

export default {
  data() {
    return {
      selectedType: null,
      showGameModal: false,
      currentGame: null,
      isPlayingGame: false,

      // Number focus game
      numberGrid: [],
      nextNumber: 1,
      foundNumbers: [],
      gameTime: 0,
      gameTimer: null,

      // Breath sync game
      syncPhase: 'inhale',
      syncText: '吸气',
      breathRound: 0,
      breathTimer: null,
      breathPhaseTimer: null,
      gameScore: 0,

      // Awareness game
      awarenessTime: 120,
      awarenessTimer: null,
      currentSenseIndex: 0,
      currentSense: '',
      currentPrompt: '',
      awarenessInput: '',
      awarenessResult: '',
      awarenessCompleted: 0,
      showAwarenessResult: false,

      // Relax challenge game
      relaxTime: 30,
      relaxTimer: null,
      isTense: false,
      isRelaxed: false,
      relaxedTime: 0,

      // Completion
      showCompleteModal: false,
      completeTitle: '',
      finalScore: 0,
      finalStars: 0
    }
  },
  computed: {
    mgStore() {
      return useMindfulnessStore()
    },
    gameTypes() {
      return Object.values(MINDFULNESS_GAME_TYPE).map(type => ({
        value: type,
        ...GAME_TYPE_INFO[type]
      }))
    },
    filteredGames() {
      if (!this.selectedType) {
        return this.mgStore.mindfulnessGames
      }
      return this.mgStore.mindfulnessGames.filter(g => g.type === this.selectedType)
    }
  },
  onLoad() {
    this.mgStore.init()
  },
  onUnload() {
    this.clearAllTimers()
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    getTypeInfo(type) {
      return GAME_TYPE_INFO[type] || {}
    },
    filterByType(type) {
      this.selectedType = this.selectedType === type ? null : type
    },
    getProgress(gameId) {
      return this.mgStore.getGameProgress(gameId)
    },
    selectGame(game) {
      this.currentGame = game
      this.showGameModal = true
    },
    closeModal() {
      this.showGameModal = false
      this.currentGame = null
    },
    startGame() {
      this.showGameModal = false
      this.isPlayingGame = true

      if (this.currentGame.title === '数字专注') {
        this.initNumberGame()
      } else if (this.currentGame.title === '呼吸同步') {
        this.initBreathSyncGame()
      } else if (this.currentGame.title === '五感探索') {
        this.initAwarenessGame()
      } else if (this.currentGame.title === '放松挑战') {
        this.initRelaxGame()
      }
    },

    // ========== Number Focus Game ==========
    initNumberGame() {
      // Generate shuffled numbers 1-25
      const numbers = Array.from({ length: 25 }, (_, i) => i + 1)
      this.shuffleArray(numbers)
      this.numberGrid = numbers
      this.nextNumber = 1
      this.foundNumbers = []
      this.gameTime = 0
      this.gameTimer = setInterval(() => {
        this.gameTime++
      }, 1000)
    },
    shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]
      }
    },
    clickNumber(num) {
      if (num === this.nextNumber) {
        this.foundNumbers.push(num)
        this.nextNumber++
        if (this.nextNumber > 25) {
          this.finishNumberGame()
        }
      }
    },
    finishNumberGame() {
      clearInterval(this.gameTimer)
      // Score based on time: faster = higher score
      let score = Math.max(0, 100 - this.gameTime * 2)
      this.showGameComplete(score)
    },

    // ========== Breath Sync Game ==========
    initBreathSyncGame() {
      this.breathRound = 0
      this.gameScore = 0
      this.startBreathCycle()
    },
    startBreathCycle() {
      if (this.breathRound >= this.currentGame.rounds) {
        this.finishBreathSyncGame()
        return
      }

      this.breathRound++
      let phase = 'inhale'
      this.syncPhase = 'inhale'
      this.syncText = '吸气'

      this.breathTimer = setTimeout(() => {
        phase = 'exhale'
        this.syncPhase = 'exhale'
        this.syncText = '呼气'
      }, 4000)

      this.breathPhaseTimer = setTimeout(() => {
        clearTimeout(this.breathTimer)
        this.startBreathCycle()
      }, 7000)
    },
    handleSyncClick(action) {
      if (action === this.syncPhase) {
        this.gameScore += 10
      }
    },
    finishBreathSyncGame() {
      clearTimeout(this.breathTimer)
      clearTimeout(this.breathPhaseTimer)
      let score = this.gameScore
      this.showGameComplete(score)
    },

    // ========== Awareness Game ==========
    initAwarenessGame() {
      this.awarenessTime = 120
      this.awarenessCompleted = 0
      this.showAwarenessResult = false
      this.awarenessInput = ''
      this.awarenessResult = ''
      this.setNextSense()
      this.awarenessTimer = setInterval(() => {
        this.awarenessTime--
        if (this.awarenessTime <= 0) {
          this.finishAwarenessGame()
        }
      }, 1000)
    },
    setNextSense() {
      const senses = [
        { name: '视觉', prompt: '看看周围，说出5样你看到的东西' },
        { name: '听觉', prompt: '仔细倾听，说出3种你听到的声音' },
        { name: '触觉', prompt: '感受身体，说出3种你触摸到的感觉' },
        { name: '嗅觉', prompt: '闻一闻，说出2种你闻到的气味' },
        { name: '感觉', prompt: '注意内心，感受此刻的情绪状态' }
      ]
      const sense = senses[this.awarenessCompleted]
      this.currentSense = sense.name
      this.currentPrompt = sense.prompt
    },
    submitAwareness() {
      if (this.awarenessInput.trim()) {
        this.awarenessResult = this.awarenessInput
        this.showAwarenessResult = true
      }
    },
    nextSense() {
      this.awarenessCompleted++
      if (this.awarenessCompleted >= 5) {
        this.finishAwarenessGame()
      } else {
        this.showAwarenessResult = false
        this.awarenessInput = ''
        this.awarenessResult = ''
        this.setNextSense()
      }
    },
    finishAwarenessGame() {
      clearInterval(this.awarenessTimer)
      let score = Math.min(100, this.awarenessCompleted * 20)
      this.showGameComplete(score)
    },

    // ========== Relax Challenge Game ==========
    initRelaxGame() {
      this.relaxTime = 30
      this.relaxedTime = 0
      this.isTense = false
      this.isRelaxed = false
      this.relaxTimer = setInterval(() => {
        this.relaxTime--
        if (this.isRelaxed && !this.isTense) {
          this.relaxedTime++
        }
        if (this.relaxTime <= 0) {
          this.finishRelaxGame()
        }
      }, 1000)
    },
    get relaxStatus() {
      if (this.isTense) return '紧绷!'
      if (this.isRelaxed) return '放松...'
      return '点击紧绷开始'
    },
    toggleTense() {
      if (!this.isTense) {
        this.isTense = true
        setTimeout(() => {
          this.isTense = false
          this.isRelaxed = true
        }, 2000)
      }
    },
    finishRelaxGame() {
      clearInterval(this.relaxTimer)
      let score = Math.min(100, this.relaxedTime * 3)
      this.showGameComplete(score)
    },

    // ========== Common ==========
    showGameComplete(score) {
      this.finalScore = score
      this.finalStars = score >= 90 ? 3 : score >= 70 ? 2 : 1
      this.completeTitle = this.currentGame.title + '完成!'
      this.mgStore.completeGame(this.currentGame.id, score)
      this.isPlayingGame = false
      this.showCompleteModal = true
    },
    quitGame() {
      this.clearAllTimers()
      this.isPlayingGame = false
    },
    clearAllTimers() {
      if (this.gameTimer) clearInterval(this.gameTimer)
      if (this.breathTimer) clearTimeout(this.breathTimer)
      if (this.breathPhaseTimer) clearTimeout(this.breathPhaseTimer)
      if (this.awarenessTimer) clearInterval(this.awarenessTimer)
      if (this.relaxTimer) clearInterval(this.relaxTimer)
    },
    closeCompleteModal() {
      this.showCompleteModal = false
      this.currentGame = null
      this.finalScore = 0
      this.finalStars = 0
    }
  }
}
</script>

<style scoped>
.mindfulness-games-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #a8edea 0%, #fed6e3 100%);
  padding: 20rpx;
}

.nav-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 20rpx;
  margin-bottom: 20rpx;
}

.back-btn {
  font-size: 48rpx;
  color: #2d5a5a;
  padding: 10rpx 20rpx;
}

.nav-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #2d5a5a;
}

.nav-placeholder {
  width: 80rpx;
}

.filter-section {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-bottom: 30rpx;
}

.filter-tag {
  background: rgba(255, 255, 255, 0.5);
  padding: 16rpx 24rpx;
  border-radius: 30rpx;
  font-size: 26rpx;
  color: #2d5a5a;
}

.filter-tag.active {
  color: #fff;
}

.games-list {
  padding-bottom: 40rpx;
}

.game-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.game-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.type-badge {
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  color: #fff;
}

.completed-badge {
  color: #faad14;
  font-size: 24rpx;
}

.game-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 10rpx;
}

.game-desc {
  font-size: 26rpx;
  color: #666;
  display: block;
  margin-bottom: 16rpx;
}

.game-footer {
  display: flex;
  gap: 20rpx;
}

.difficulty-tag, .best-score {
  font-size: 24rpx;
  color: #999;
}

.empty-state {
  text-align: center;
  padding: 60rpx;
  color: #999;
  font-size: 28rpx;
}

/* Modal styles */
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
  z-index: 1000;
}

.modal-content {
  background: #fff;
  border-radius: 30rpx;
  padding: 40rpx;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.modal-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.modal-close {
  font-size: 50rpx;
  color: #999;
  padding: 10rpx;
}

.game-info {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 30rpx;
}

.info-badge {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
  padding: 10rpx 20rpx;
  border-radius: 20rpx;
  font-size: 26rpx;
  color: #2d5a5a;
}

.info-difficulty {
  font-size: 28rpx;
  color: #666;
}

.tips-section {
  margin-bottom: 30rpx;
}

.tips-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 20rpx;
}

.tip-item {
  display: flex;
  align-items: center;
  margin-bottom: 12rpx;
}

.tip-icon {
  font-size: 28rpx;
  margin-right: 12rpx;
}

.tip-text {
  font-size: 26rpx;
  color: #666;
}

.modal-actions {
  display: flex;
  justify-content: center;
}

.action-btn {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
  color: #2d5a5a;
  font-size: 32rpx;
  font-weight: bold;
  padding: 24rpx 60rpx;
  border-radius: 50rpx;
  border: none;
}

.action-btn.start {
  background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%);
  color: #fff;
}

.action-btn.complete {
  background: linear-gradient(135deg, #faad14 0%, #d87700 100%);
  color: #fff;
}

/* Game Session */
.game-session {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(180deg, #a8edea 0%, #fed6e3 100%);
  padding: 40rpx;
  z-index: 900;
}

.session-header {
  text-align: center;
  margin-bottom: 40rpx;
}

.session-title {
  font-size: 40rpx;
  font-weight: bold;
  color: #2d5a5a;
  display: block;
}

.session-stats {
  display: flex;
  justify-content: center;
  gap: 40rpx;
  margin-top: 16rpx;
}

.session-stats text {
  font-size: 28rpx;
  color: rgba(45, 90, 90, 0.8);
}

/* Number Grid */
.number-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12rpx;
  padding: 20rpx;
}

.number-cell {
  aspect-ratio: 1;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
  font-weight: bold;
  color: #2d5a5a;
}

.number-cell.current {
  background: #52c41a;
  color: #fff;
}

.number-cell.found {
  background: rgba(45, 90, 90, 0.2);
  color: rgba(45, 90, 90, 0.4);
}

/* Breath Sync */
.breath-sync-circle {
  width: 400rpx;
  height: 400rpx;
  margin: 60rpx auto;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.sync-circle {
  width: 200rpx;
  height: 200rpx;
  border-radius: 50%;
  background: rgba(82, 196, 26, 0.3);
  transition: all 1s ease-in-out;
}

.sync-circle.inhale {
  width: 350rpx;
  height: 350rpx;
  background: rgba(82, 196, 26, 0.5);
}

.sync-circle.exhale {
  width: 200rpx;
  height: 200rpx;
  background: rgba(114, 46, 209, 0.3);
}

.sync-inner {
  position: absolute;
}

.sync-text {
  font-size: 40rpx;
  font-weight: bold;
  color: #2d5a5a;
}

.sync-instruction {
  text-align: center;
  margin: 30rpx;
}

.sync-instruction text {
  font-size: 28rpx;
  color: rgba(45, 90, 90, 0.7);
}

.sync-controls {
  display: flex;
  justify-content: center;
  gap: 40rpx;
  margin-top: 40rpx;
}

.sync-btn {
  padding: 30rpx 60rpx;
  border-radius: 50rpx;
  font-size: 32rpx;
  border: none;
  opacity: 0.5;
}

.sync-btn.inhale {
  background: rgba(82, 196, 26, 0.3);
  color: #52c41a;
}

.sync-btn.exhale {
  background: rgba(114, 46, 209, 0.3);
  color: #722ed1;
}

.sync-btn.active {
  opacity: 1;
  transform: scale(1.1);
}

/* Awareness */
.awareness-card {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 30rpx;
  padding: 40rpx;
  margin: 20rpx;
}

.awareness-step {
  text-align: center;
  margin-bottom: 30rpx;
}

.sense-label {
  font-size: 48rpx;
  color: #2d5a5a;
  display: block;
  margin-bottom: 16rpx;
}

.sense-prompt {
  font-size: 32rpx;
  color: #666;
  display: block;
}

.awareness-input {
  margin: 30rpx 0;
}

.awareness-textinput {
  width: 100%;
  padding: 20rpx;
  border: 2rpx solid #a8edea;
  border-radius: 16rpx;
  font-size: 28rpx;
}

.awareness-result {
  padding: 20rpx;
  background: rgba(82, 196, 26, 0.1);
  border-radius: 16rpx;
  text-align: center;
}

.awareness-result text {
  font-size: 28rpx;
  color: #52c41a;
}

.awareness-progress {
  text-align: center;
  margin-top: 20rpx;
}

.awareness-progress text {
  font-size: 28rpx;
  color: rgba(45, 90, 90, 0.7);
}

.awareness-controls {
  display: flex;
  justify-content: center;
  margin-top: 30rpx;
}

/* Relax */
.relax-circle {
  width: 300rpx;
  height: 300rpx;
  border-radius: 50%;
  background: rgba(82, 196, 26, 0.3);
  margin: 80rpx auto;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.5s;
}

.relax-circle.tense {
  background: rgba(245, 34, 45, 0.3);
  transform: scale(0.9);
}

.relax-text {
  font-size: 36rpx;
  font-weight: bold;
  color: #2d5a5a;
}

.relax-instruction {
  text-align: center;
  margin: 30rpx;
}

.relax-instruction text {
  font-size: 28rpx;
  color: rgba(45, 90, 90, 0.7);
}

.relax-controls {
  display: flex;
  justify-content: center;
  margin-top: 40rpx;
}

.relax-btn {
  padding: 30rpx 80rpx;
  border-radius: 50rpx;
  font-size: 32rpx;
  border: none;
}

.relax-btn.tense {
  background: rgba(245, 34, 45, 0.3);
  color: #f5222d;
}

.relax-btn:disabled {
  opacity: 0.5;
}

.relax-progress {
  text-align: center;
  margin-top: 30rpx;
}

.relax-progress text {
  font-size: 28rpx;
  color: #52c41a;
}

.quit-btn {
  display: block;
  margin: 40rpx auto 0;
  background: transparent;
  border: none;
  color: rgba(45, 90, 90, 0.6);
  font-size: 28rpx;
  padding: 20rpx;
}

/* Complete Modal */
.complete-modal {
  text-align: center;
}

.complete-icon {
  font-size: 100rpx;
  display: block;
  margin-bottom: 20rpx;
}

.complete-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 16rpx;
}

.complete-score {
  font-size: 32rpx;
  color: #666;
  display: block;
  margin-bottom: 8rpx;
}

.complete-stars {
  font-size: 48rpx;
  color: #faad14;
  display: block;
  margin-bottom: 30rpx;
}

.complete-actions {
  display: flex;
  justify-content: center;
}
</style>
