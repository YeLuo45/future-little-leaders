<template>
  <view class="coop-puzzles-page">
    <!-- 顶部标题 -->
    <view class="header">
      <text class="title">协作解谜</text>
      <text class="subtitle">家庭团队配合</text>
    </view>

    <!-- 积分展示 -->
    <view class="score-card">
      <view class="score-item">
        <text class="score-value">{{ coopStats.score }}</text>
        <text class="score-label">协作积分</text>
      </view>
      <view class="score-divider"></view>
      <view class="score-item">
        <text class="score-value">{{ coopStats.solved }}/{{ coopStats.total }}</text>
        <text class="score-label">已解答</text>
      </view>
    </view>

    <!-- 当前谜题 -->
    <view v-if="currentPuzzle" class="puzzle-card">
      <view class="puzzle-header">
        <text class="puzzle-title">{{ currentPuzzle.title }}</text>
        <view class="difficulty-badge" :class="'level-' + currentPuzzle.difficulty">
          <text>{{ difficultyText }}</text>
        </view>
      </view>

      <text class="puzzle-description">{{ currentPuzzle.description }}</text>

      <!-- 谜题内容区 -->
      <view class="puzzle-content">
        <view v-if="currentPuzzle.type === 'math'" class="math-puzzle">
          <text class="puzzle-question">2, 4, 8, 16, ?</text>
        </view>
        <view v-else-if="currentPuzzle.type === 'pattern'" class="pattern-puzzle">
          <text class="puzzle-question">三角形、正方形、五边形、？</text>
        </view>
        <view v-else-if="currentPuzzle.type === 'word'" class="word-puzzle">
          <text class="puzzle-question">天空 → 空 → ？</text>
        </view>
        <view v-else class="logic-puzzle">
          <text class="puzzle-question">{{ currentPuzzle.description }}</text>
        </view>
      </view>

      <!-- 提示按钮 -->
      <view class="hint-section">
        <text class="hint-text" v-if="showHint">{{ currentPuzzle.hint }}</text>
        <button class="hint-btn" @click="toggleHint" v-if="!showHint">显示提示</button>
      </view>

      <!-- 答案输入 -->
      <view class="answer-section">
        <input
          class="answer-input"
          v-model="userAnswer"
          placeholder="输入你的答案"
          :disabled="isSubmitting"
        />
        <button
          class="submit-btn"
          @click="submitAnswer"
          :disabled="!userAnswer || isSubmitting"
        >
          {{ isSubmitting ? '提交中...' : '提交答案' }}
        </button>
      </view>

      <!-- 结果反馈 -->
      <view v-if="resultMessage" class="result-section" :class="resultClass">
        <text>{{ resultMessage }}</text>
      </view>
    </view>

    <!-- 无更多谜题 -->
    <view v-else class="completed-card">
      <text class="completed-icon">🎉</text>
      <text class="completed-title">太棒了！</text>
      <text class="completed-text">所有谜题都已解答完毕</text>
      <view class="final-score">
        <text class="final-score-label">最终得分</text>
        <text class="final-score-value">{{ coopStats.score }}</text>
      </view>
    </view>

    <!-- 家庭排行榜 -->
    <view class="leaderboard-section">
      <text class="section-title">家庭排行榜</text>
      <view class="leaderboard-list">
        <view
          v-for="(member, index) in leaderboard"
          :key="member.name"
          class="leaderboard-item"
        >
          <view class="rank-badge" :class="'rank-' + (index + 1)">
            <text>{{ index + 1 }}</text>
          </view>
          <text class="member-name">{{ member.name }}</text>
          <text class="member-score">{{ member.score }}分</text>
        </view>
        <view v-if="leaderboard.length === 0" class="empty-leaderboard">
          <text>暂无排行数据</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { useGameStore } from '@/stores/gameStore.js'

export default {
  data() {
    return {
      userAnswer: '',
      showHint: false,
      isSubmitting: false,
      resultMessage: '',
      resultClass: ''
    }
  },
  computed: {
    gameStore() {
      return useGameStore()
    },
    currentPuzzle() {
      return this.gameStore.currentPuzzle
    },
    coopStats() {
      return this.gameStore.coopStats
    },
    leaderboard() {
      return this.gameStore.leaderboard
    },
    difficultyText() {
      if (!this.currentPuzzle) return ''
      const levels = { 1: '简单', 2: '中等', 3: '困难' }
      return levels[this.currentPuzzle.difficulty] || '普通'
    }
  },
  onLoad() {
    this.gameStore.init()
  },
  methods: {
    toggleHint() {
      this.showHint = !this.showHint
    },
    submitAnswer() {
      if (!this.userAnswer || this.isSubmitting) return

      this.isSubmitting = true
      this.resultMessage = ''

      const result = this.gameStore.submitPuzzleAnswer(this.userAnswer, '我')

      this.isSubmitting = false

      if (result) {
        if (result.success) {
          this.resultClass = 'success'
          this.resultMessage = result.message + ` +${result.exp}经验 +${result.points}积分`
          this.userAnswer = ''
          this.showHint = false

          if (result.isLastPuzzle) {
            uni.showToast({ title: '恭喜完成所有谜题！', icon: 'success' })
          }
        } else {
          this.resultClass = 'error'
          this.resultMessage = result.message
          if (result.hint) {
            this.resultMessage += ' 提示: ' + result.hint
          }
        }
      }
    }
  }
}
</script>

<style scoped>
.coop-puzzles-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
  padding: 20rpx;
}

.header {
  text-align: center;
  padding: 40rpx 0;
}

.title {
  font-size: 48rpx;
  font-weight: bold;
  color: #ffffff;
  display: block;
}

.subtitle {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 10rpx;
}

.score-card {
  display: flex;
  background: #ffffff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.score-item {
  flex: 1;
  text-align: center;
}

.score-value {
  font-size: 48rpx;
  font-weight: bold;
  color: #667eea;
  display: block;
}

.score-label {
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
}

.score-divider {
  width: 2rpx;
  background: #eee;
  margin: 0 20rpx;
}

.puzzle-card {
  background: #ffffff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.puzzle-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.puzzle-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.difficulty-badge {
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
}

.difficulty-badge.level-1 {
  background: #e8f5e9;
  color: #4caf50;
}

.difficulty-badge.level-2 {
  background: #fff3e0;
  color: #ff9800;
}

.difficulty-badge.level-3 {
  background: #ffebee;
  color: #f44336;
}

.puzzle-description {
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
}

.puzzle-content {
  background: #f8f9fa;
  border-radius: 12rpx;
  padding: 30rpx;
  margin: 20rpx 0;
  text-align: center;
}

.puzzle-question {
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
}

.hint-section {
  text-align: center;
  margin: 20rpx 0;
}

.hint-text {
  font-size: 26rpx;
  color: #ff9800;
  background: #fff3e0;
  padding: 16rpx 24rpx;
  border-radius: 8rpx;
  display: inline-block;
}

.hint-btn {
  font-size: 26rpx;
  color: #667eea;
  background: none;
  border: none;
  padding: 10rpx;
}

.answer-section {
  display: flex;
  gap: 20rpx;
  margin-top: 20rpx;
}

.answer-input {
  flex: 1;
  height: 80rpx;
  border: 2rpx solid #ddd;
  border-radius: 12rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
}

.submit-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  border: none;
  border-radius: 12rpx;
  padding: 0 40rpx;
  font-size: 28rpx;
}

.submit-btn[disabled] {
  background: #ccc;
}

.result-section {
  margin-top: 20rpx;
  padding: 20rpx;
  border-radius: 12rpx;
  text-align: center;
  font-size: 28rpx;
}

.result-section.success {
  background: #e8f5e9;
  color: #4caf50;
}

.result-section.error {
  background: #ffebee;
  color: #f44336;
}

.completed-card {
  background: #ffffff;
  border-radius: 20rpx;
  padding: 60rpx 30rpx;
  margin: 20rpx;
  text-align: center;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.completed-icon {
  font-size: 100rpx;
  display: block;
  margin-bottom: 20rpx;
}

.completed-title {
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
}

.completed-text {
  font-size: 28rpx;
  color: #666;
  margin-top: 10rpx;
}

.final-score {
  margin-top: 30rpx;
  padding: 20rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
}

.final-score-label {
  font-size: 24rpx;
  color: #999;
}

.final-score-value {
  font-size: 60rpx;
  font-weight: bold;
  color: #667eea;
  display: block;
  margin-top: 10rpx;
}

.leaderboard-section {
  background: #ffffff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
}

.leaderboard-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.leaderboard-item {
  display: flex;
  align-items: center;
  padding: 16rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
}

.rank-badge {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  font-weight: bold;
  margin-right: 16rpx;
}

.rank-badge.rank-1 {
  background: #ffd700;
  color: #fff;
}

.rank-badge.rank-2 {
  background: #c0c0c0;
  color: #fff;
}

.rank-badge.rank-3 {
  background: #cd7f32;
  color: #fff;
}

.rank-badge.rank-4,
.rank-badge.rank-5 {
  background: #e0e0e0;
  color: #666;
}

.member-name {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}

.member-score {
  font-size: 28rpx;
  font-weight: bold;
  color: #667eea;
}

.empty-leaderboard {
  text-align: center;
  padding: 40rpx;
  color: #999;
  font-size: 28rpx;
}
</style>
