<template>
  <view class="board-games-page">
    <!-- 顶部标题 -->
    <view class="header">
      <text class="title">棋盘游戏</text>
      <text class="subtitle">家庭游戏夜 · 历史对战记录</text>
    </view>

    <!-- 游戏选择 -->
    <view class="games-section">
      <text class="section-title">选择游戏</text>
      <view class="games-grid">
        <view
          v-for="game in boardGames"
          :key="game.id"
          class="game-card"
          :style="{ borderColor: game.color }"
          @click="selectGame(game)"
        >
          <text class="game-icon">{{ game.icon }}</text>
          <text class="game-name">{{ game.name }}</text>
          <text class="game-desc">{{ game.description }}</text>
          <view class="game-stats">
            <text class="stat">玩了{{ game.played }}次</text>
            <text class="stat">胜{{ game.wins }}次</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 当前游戏会话 -->
    <view v-if="currentSession" class="session-section">
      <text class="section-title">游戏进行中</text>

      <view class="session-card">
        <text class="session-game-name">
          {{ getCurrentGameName() }}
        </text>

        <!-- 玩家位置 -->
        <view class="players-board">
          <view
            v-for="(player, index) in currentSession.players"
            :key="index"
            class="player-position"
          >
            <view
              class="player-piece"
              :style="{
                left: getPiecePosition(index) + '%',
                background: getPlayerColor(index)
              }"
            >
              <text>{{ player.charAt(0) }}</text>
            </view>
            <text class="player-name">{{ player }}</text>
            <text class="player-score">{{ currentSession.scores[index] }}分</text>
          </view>
        </view>

        <!-- 进度条 -->
        <view class="board-progress">
          <view class="progress-track">
            <view
              class="progress-current"
              :style="{ width: getMaxProgress() + '%' }"
            ></view>
          </view>
          <view class="progress-labels">
            <text>起点</text>
            <text>终点</text>
          </view>
        </view>

        <!-- 当前玩家提示 -->
        <view class="current-player-hint">
          <text>轮到 {{ currentSession.players[currentSession.currentPlayerIndex] }} 了</text>
        </view>

        <!-- 操作按钮 -->
        <view class="session-actions">
          <button class="roll-btn" @click="rollDice">
            🎲 掷骰子
          </button>
          <button class="finish-btn" @click="showFinishDialog">
            结束游戏
          </button>
        </view>
      </view>
    </view>

    <!-- 历史记录 -->
    <view class="history-section">
      <text class="section-title">历史对战</text>
      <view class="history-list">
        <view
          v-for="game in boardGameStats"
          :key="game.id"
          class="history-card"
        >
          <view class="history-header">
            <text class="history-icon">{{ getGameIcon(game.id) }}</text>
            <text class="history-name">{{ game.name }}</text>
          </view>
          <view class="history-stats">
            <view class="history-stat">
              <text class="value">{{ game.played }}</text>
              <text class="label">总场次</text>
            </view>
            <view class="history-stat">
              <text class="value">{{ game.wins }}</text>
              <text class="label">获胜</text>
            </view>
            <view class="history-stat">
              <text class="value">{{ game.winRate }}%</text>
              <text class="label">胜率</text>
            </view>
          </view>
        </view>

        <view v-if="boardGameStats.length === 0" class="empty-history">
          <text>暂无历史记录</text>
        </view>
      </view>
    </view>

    <!-- 开始游戏弹窗 -->
    <view v-if="showStartDialog" class="dialog-overlay" @click="closeStartDialog">
      <view class="dialog-content" @click.stop>
        <text class="dialog-title">开始游戏</text>
        <text class="dialog-game-name">{{ selectedGame.name }}</text>

        <view class="player-input-section">
          <text class="input-label">添加玩家</text>
          <view class="player-input-row">
            <input
              class="player-input"
              v-model="newPlayerName"
              placeholder="玩家名称"
            />
            <button class="add-player-btn" @click="addPlayer">添加</button>
          </view>
          <view class="players-list">
            <view
              v-for="(player, index) in newPlayers"
              :key="index"
              class="player-tag"
            >
              <text>{{ player }}</text>
              <text class="remove-btn" @click="removePlayer(index)">×</text>
            </view>
          </view>
        </view>

        <view class="dialog-actions">
          <button class="cancel-btn" @click="closeStartDialog">取消</button>
          <button
            class="start-btn"
            @click="startGame"
            :disabled="newPlayers.length < 2"
          >
            开始 ({{ newPlayers.length }}/2+)
          </button>
        </view>
      </view>
    </view>

    <!-- 掷骰子结果弹窗 -->
    <view v-if="showDiceResult" class="dialog-overlay" @click="closeDiceResult">
      <view class="dialog-content dice-result" @click.stop>
        <text class="dice-number">{{ diceValue }}</text>
        <text class="dice-text">🎲</text>
      </view>
    </view>
  </view>
</template>

<script>
import { useGameStore } from '@/stores/gameStore.js'
import gameService from '@/services/gameService.js'

export default {
  data() {
    return {
      selectedGame: null,
      showStartDialog: false,
      showDiceResult: false,
      diceValue: 0,
      newPlayerName: '',
      newPlayers: [],
      playerColors: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#DDA0DD', '#87CEEB']
    }
  },
  computed: {
    gameStore() {
      return useGameStore()
    },
    boardGames() {
      return this.gameStore.boardGames
    },
    boardGameStats() {
      return this.gameStore.boardGameStats
    },
    currentSession() {
      return this.gameStore.currentGameSession
    }
  },
  onLoad() {
    this.gameStore.init()
  },
  methods: {
    selectGame(game) {
      if (this.currentSession) {
        uni.showToast({ title: '当前有游戏进行中', icon: 'none' })
        return
      }
      this.selectedGame = game
      this.newPlayers = ['爸爸', '孩子']
      this.showStartDialog = true
    },
    closeStartDialog() {
      this.showStartDialog = false
      this.newPlayerName = ''
    },
    addPlayer() {
      if (this.newPlayerName && !this.newPlayers.includes(this.newPlayerName)) {
        this.newPlayers.push(this.newPlayerName)
        this.newPlayerName = ''
      }
    },
    removePlayer(index) {
      this.newPlayers.splice(index, 1)
    },
    startGame() {
      if (this.newPlayers.length < 2) {
        uni.showToast({ title: '至少需要2名玩家', icon: 'none' })
        return
      }
      this.gameStore.startBoardGame(this.selectedGame.id, this.newPlayers)
      this.closeStartDialog()
      uni.showToast({ title: '游戏开始！', icon: 'success' })
    },
    getCurrentGameName() {
      if (!this.currentSession || !this.selectedGame) return ''
      const game = this.boardGames.find(g => g.id === this.currentSession.gameId)
      return game ? game.name : ''
    },
    getPiecePosition(playerIndex) {
      if (!this.currentSession) return 0
      const game = this.boardGames.find(g => g.id === this.currentSession.gameId)
      const squares = game ? game.squares : 30
      const position = this.currentSession.positions[playerIndex]
      return (position / squares) * 100
    },
    getPlayerColor(index) {
      return this.playerColors[index % this.playerColors.length]
    },
    getMaxProgress() {
      if (!this.currentSession) return 0
      const game = this.boardGames.find(g => g.id === this.currentSession.gameId)
      const squares = game ? game.squares : 30
      const maxPosition = Math.max(...this.currentSession.positions)
      return (maxPosition / squares) * 100
    },
    rollDice() {
      this.diceValue = Math.floor(Math.random() * 6) + 1
      this.showDiceResult = true

      setTimeout(() => {
        this.closeDiceResult()
        const currentIndex = this.currentSession.currentPlayerIndex
        this.gameStore.movePiece(currentIndex, this.diceValue)
      }, 1500)
    },
    closeDiceResult() {
      this.showDiceResult = false
    },
    showFinishDialog() {
      uni.showModal({
        title: '结束游戏',
        content: '确定要结束当前游戏吗？',
        success: (res) => {
          if (res.confirm) {
            this.finishGame()
          }
        }
      })
    },
    finishGame() {
      if (!this.currentSession) return

      const winner = this.currentSession.winner ||
        this.currentSession.players[this.currentSession.scores.indexOf(Math.max(...this.currentSession.scores))]
      const scores = [...this.currentSession.scores]

      this.gameStore.finishGame(winner, scores)
      uni.showToast({
        title: winner ? `${winner}获胜！` : '游戏结束',
        icon: 'success'
      })
    },
    getGameIcon(gameId) {
      const game = this.boardGames.find(g => g.id === gameId)
      return game ? game.icon : '🎲'
    }
  }
}
</script>

<style scoped>
.board-games-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #a8edea 0%, #fed6e3 100%);
  padding: 20rpx;
}

.header {
  text-align: center;
  padding: 40rpx 0;
}

.title {
  font-size: 48rpx;
  font-weight: bold;
  color: #333;
  display: block;
}

.subtitle {
  font-size: 28rpx;
  color: #666;
  margin-top: 10rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
}

.games-section {
  margin: 20rpx;
}

.games-grid {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.game-card {
  background: #ffffff;
  border-radius: 20rpx;
  padding: 30rpx;
  border-left: 8rpx solid;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.game-icon {
  font-size: 60rpx;
  display: block;
  margin-bottom: 10rpx;
}

.game-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.game-desc {
  font-size: 26rpx;
  color: #666;
  margin-top: 8rpx;
}

.game-stats {
  display: flex;
  gap: 20rpx;
  margin-top: 12rpx;
}

.game-stats .stat {
  font-size: 24rpx;
  color: #999;
}

.session-section {
  margin: 20rpx;
}

.session-card {
  background: #ffffff;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.session-game-name {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  text-align: center;
  display: block;
  margin-bottom: 30rpx;
}

.players-board {
  position: relative;
  height: 200rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
  margin-bottom: 20rpx;
}

.player-position {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.player-piece {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 28rpx;
  font-weight: bold;
  box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.2);
  transition: left 0.5s ease;
}

.player-name {
  font-size: 22rpx;
  color: #666;
  margin-top: 8rpx;
}

.player-score {
  font-size: 24rpx;
  color: #333;
  font-weight: bold;
}

.board-progress {
  margin: 20rpx 0;
}

.progress-track {
  height: 12rpx;
  background: #e0e0e0;
  border-radius: 6rpx;
  overflow: hidden;
}

.progress-current {
  height: 100%;
  background: linear-gradient(90deg, #a8edea 0%, #fed6e3 100%);
  border-radius: 6rpx;
  transition: width 0.5s;
}

.progress-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 8rpx;
  font-size: 22rpx;
  color: #999;
}

.current-player-hint {
  text-align: center;
  padding: 16rpx;
  background: #fff3e0;
  border-radius: 8rpx;
  margin: 20rpx 0;
}

.current-player-hint text {
  font-size: 28rpx;
  color: #ff9800;
  font-weight: bold;
}

.session-actions {
  display: flex;
  gap: 20rpx;
}

.roll-btn,
.finish-btn {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  border-radius: 40rpx;
  font-size: 32rpx;
  border: none;
}

.roll-btn {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
  color: #333;
}

.finish-btn {
  background: #f0f0f0;
  color: #666;
}

.history-section {
  margin: 20rpx;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.history-card {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 4rpx 15rpx rgba(0, 0, 0, 0.08);
}

.history-header {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}

.history-icon {
  font-size: 40rpx;
  margin-right: 12rpx;
}

.history-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.history-stats {
  display: flex;
  gap: 30rpx;
}

.history-stat {
  text-align: center;
}

.history-stat .value {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
}

.history-stat .label {
  font-size: 22rpx;
  color: #999;
  margin-top: 4rpx;
}

.empty-history {
  text-align: center;
  padding: 60rpx;
  color: #999;
  font-size: 28rpx;
  background: #ffffff;
  border-radius: 20rpx;
}

.dialog-overlay {
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

.dialog-content {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 40rpx;
  width: 80%;
  max-width: 600rpx;
}

.dialog-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  text-align: center;
  display: block;
}

.dialog-game-name {
  font-size: 28rpx;
  color: #666;
  text-align: center;
  display: block;
  margin-top: 8rpx;
}

.player-input-section {
  margin-top: 30rpx;
}

.input-label {
  font-size: 28rpx;
  color: #333;
  display: block;
  margin-bottom: 12rpx;
}

.player-input-row {
  display: flex;
  gap: 16rpx;
}

.player-input {
  flex: 1;
  height: 70rpx;
  border: 2rpx solid #ddd;
  border-radius: 12rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
}

.add-player-btn {
  background: #667eea;
  color: #fff;
  border: none;
  border-radius: 12rpx;
  padding: 0 30rpx;
  font-size: 28rpx;
}

.players-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 16rpx;
}

.player-tag {
  display: flex;
  align-items: center;
  background: #f0f0f0;
  padding: 10rpx 20rpx;
  border-radius: 30rpx;
  font-size: 26rpx;
  color: #333;
}

.remove-btn {
  margin-left: 8rpx;
  color: #999;
  font-size: 32rpx;
}

.dialog-actions {
  display: flex;
  gap: 20rpx;
  margin-top: 30rpx;
}

.cancel-btn,
.start-btn {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  border-radius: 40rpx;
  font-size: 28rpx;
  border: none;
}

.cancel-btn {
  background: #f0f0f0;
  color: #666;
}

.start-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
}

.start-btn[disabled] {
  background: #ccc;
}

.dice-result {
  text-align: center;
  padding: 60rpx;
}

.dice-number {
  font-size: 120rpx;
  font-weight: bold;
  color: #667eea;
  display: block;
}

.dice-text {
  font-size: 80rpx;
  margin-top: 20rpx;
  display: block;
}
</style>
