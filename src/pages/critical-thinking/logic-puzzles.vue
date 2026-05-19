<template>
  <view class="logic-puzzles-page">
    <!-- 顶部导航 -->
    <view class="nav-header">
      <text class="back-btn" @click="goBack">‹</text>
      <text class="nav-title">逻辑谜题</text>
      <text class="nav-placeholder"></text>
    </view>

    <!-- 难度筛选 -->
    <view class="filter-section">
      <view
        v-for="diff in difficultyLevels"
        :key="diff.value"
        class="filter-tag"
        :class="{ active: selectedDifficulty === diff.value }"
        :style="selectedDifficulty === diff.value ? { background: diff.color } : {}"
        @click="filterByDifficulty(diff.value)"
      >
        {{ diff.label }}
      </view>
    </view>

    <!-- 谜题列表 -->
    <view class="puzzles-list">
      <view
        v-for="puzzle in filteredPuzzles"
        :key="puzzle.id"
        class="puzzle-card"
        @click="selectPuzzle(puzzle)"
      >
        <view class="puzzle-header">
          <view class="difficulty-badge" :style="{ background: getDifficultyInfo(puzzle.difficulty).color }">
            {{ getDifficultyInfo(puzzle.difficulty).label }}
          </view>
          <view v-if="getPuzzleProgress(puzzle.id).completed" class="completed-badge">
            ✓ 已完成
          </view>
        </view>
        <text class="puzzle-title">{{ puzzle.title }}</text>
        <text class="puzzle-desc">{{ puzzle.description.substring(0, 50) }}...</text>
        <view class="puzzle-footer">
          <text class="category-tag">{{ puzzle.category }}</text>
          <text class="attempts-text" v-if="getPuzzleProgress(puzzle.id).attempts > 0">
            尝试: {{ getPuzzleProgress(puzzle.id).attempts }}次
          </text>
        </view>
      </view>

      <view v-if="filteredPuzzles.length === 0" class="empty-state">
        <text>暂无谜题</text>
      </view>
    </view>

    <!-- 谜题详情弹窗 -->
    <view v-if="showPuzzleModal" class="modal-overlay" @click="closePuzzleModal">
      <view class="modal-content puzzle-modal" @click.stop>
        <view class="modal-header">
          <text class="modal-title">{{ currentPuzzle.title }}</text>
          <text class="modal-close" @click="closePuzzleModal">×</text>
        </view>
        
        <view class="difficulty-info">
          <view class="diff-badge" :style="{ background: getDifficultyInfo(currentPuzzle.difficulty).color }">
            {{ getDifficultyInfo(currentPuzzle.difficulty).label }}
          </view>
          <text class="hint-btn" @click="showHint = !showHint">
            {{ showHint ? '隐藏提示' : '显示提示' }}
          </text>
        </view>

        <view v-if="showHint" class="hint-box">
          <text class="hint-label">💡 提示:</text>
          <text class="hint-text">{{ currentPuzzle.hint }}</text>
        </view>

        <view class="puzzle-content">
          <text class="puzzle-question">{{ currentPuzzle.description }}</text>
        </view>

        <view class="options-list">
          <view
            v-for="(option, index) in currentPuzzle.options"
            :key="index"
            class="option-item"
            :class="{
              selected: selectedAnswer === option,
              correct: showResult && option === currentPuzzle.answer,
              wrong: showResult && selectedAnswer === option && option !== currentPuzzle.answer
            }"
            @click="selectAnswer(option)"
          >
            <text class="option-letter">{{ String.fromCharCode(65 + index) }}.</text>
            <text class="option-text">{{ option }}</text>
          </view>
        </view>

        <view v-if="showResult" class="result-section">
          <view v-if="isCorrect" class="result-correct">
            <text class="result-icon">🎉</text>
            <text class="result-text">回答正确！</text>
            <text class="score-text">+{{ lastScore }}分</text>
          </view>
          <view v-else class="result-wrong">
            <text class="result-icon">🤔</text>
            <text class="result-text">回答错误，正确答案是: {{ currentPuzzle.answer }}</text>
          </view>
          <view class="explanation-box">
            <text class="explanation-label">📝 解析:</text>
            <text class="explanation-text">{{ currentPuzzle.explanation }}</text>
          </view>
        </view>

        <view class="modal-actions">
          <button v-if="!showResult" class="submit-btn" @click="submitAnswer" :disabled="!selectedAnswer">
            提交答案
          </button>
          <button v-else class="next-btn" @click="nextPuzzle">
            下一题
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { useCriticalThinkingStore, PUZZLE_DIFFICULTY, PUZZLE_DIFFICULTY_INFO } from '@/stores/criticalThinkingStore.js'

export default {
  data() {
    return {
      selectedDifficulty: null,
      showPuzzleModal: false,
      currentPuzzle: null,
      selectedAnswer: null,
      showResult: false,
      isCorrect: false,
      lastScore: 0,
      showHint: false,
      difficultyLevels: [
        { value: null, label: '全部', color: '#666' },
        { value: PUZZLE_DIFFICULTY.EASY, label: '简单', color: PUZZLE_DIFFICULTY_INFO[PUZZLE_DIFFICULTY.EASY].color },
        { value: PUZZLE_DIFFICULTY.MEDIUM, label: '中等', color: PUZZLE_DIFFICULTY_INFO[PUZZLE_DIFFICULTY.MEDIUM].color },
        { value: PUZZLE_DIFFICULTY.HARD, label: '困难', color: PUZZLE_DIFFICULTY_INFO[PUZZLE_DIFFICULTY.HARD].color }
      ]
    }
  },
  computed: {
    ctStore() {
      return useCriticalThinkingStore()
    },
    puzzles() {
      return this.ctStore.logicPuzzles
    },
    filteredPuzzles() {
      if (!this.selectedDifficulty) return this.puzzles
      return this.ctStore.getPuzzlesByDifficulty(this.selectedDifficulty)
    }
  },
  onLoad() {
    this.ctStore.init()
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    getDifficultyInfo(difficulty) {
      return PUZZLE_DIFFICULTY_INFO[difficulty] || {}
    },
    filterByDifficulty(difficulty) {
      this.selectedDifficulty = difficulty
    },
    selectPuzzle(puzzle) {
      this.currentPuzzle = puzzle
      this.selectedAnswer = null
      this.showResult = false
      this.isCorrect = false
      this.showHint = false
      this.showPuzzleModal = true
    },
    closePuzzleModal() {
      this.showPuzzleModal = false
    },
    selectAnswer(option) {
      if (!this.showResult) {
        this.selectedAnswer = option
      }
    },
    submitAnswer() {
      if (!this.selectedAnswer || !this.currentPuzzle) return

      const result = this.ctStore.submitPuzzleAnswer(this.currentPuzzle.id, this.selectedAnswer)
      this.showResult = true
      this.isCorrect = result.correct
      this.lastScore = result.score || 0
    },
    nextPuzzle() {
      this.closePuzzleModal()
      const currentIndex = this.filteredPuzzles.findIndex(p => p.id === this.currentPuzzle.id)
      if (currentIndex < this.filteredPuzzles.length - 1) {
        setTimeout(() => {
          this.selectPuzzle(this.filteredPuzzles[currentIndex + 1])
        }, 300)
      } else {
        uni.showToast({ title: '已完成所有谜题', icon: 'success' })
      }
    },
    getPuzzleProgress(puzzleId) {
      return this.ctStore.getPuzzleProgress(puzzleId)
    }
  }
}
</script>

<style scoped>
.logic-puzzles-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f5f7fa 0%, #c3cfe2 100%);
}

.nav-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 40rpx 30rpx 20rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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

.filter-section {
  display: flex;
  padding: 20rpx 30rpx;
  gap: 16rpx;
}

.filter-tag {
  padding: 12rpx 24rpx;
  border-radius: 30rpx;
  background: #ffffff;
  font-size: 26rpx;
  color: #666;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.filter-tag.active {
  color: #ffffff;
}

.puzzles-list {
  padding: 20rpx 30rpx;
}

.puzzle-card {
  background: #ffffff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.puzzle-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.difficulty-badge {
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  color: #ffffff;
}

.completed-badge {
  font-size: 22rpx;
  color: #52c41a;
}

.puzzle-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 10rpx;
}

.puzzle-desc {
  font-size: 26rpx;
  color: #666;
  display: block;
  margin-bottom: 16rpx;
  line-height: 1.4;
}

.puzzle-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.category-tag {
  font-size: 22rpx;
  color: #667eea;
  background: rgba(102, 126, 234, 0.1);
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
}

.attempts-text {
  font-size: 22rpx;
  color: #999;
}

.empty-state {
  text-align: center;
  padding: 100rpx;
  color: #999;
}

/* Modal Styles */
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

.modal-content {
  background: #ffffff;
  border-radius: 30rpx;
  width: 90%;
  max-height: 85vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #eee;
}

.modal-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  flex: 1;
}

.modal-close {
  font-size: 50rpx;
  color: #999;
  padding: 0 20rpx;
}

.difficulty-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 30rpx;
}

.diff-badge {
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
  color: #ffffff;
}

.hint-btn {
  font-size: 26rpx;
  color: #667eea;
}

.hint-box {
  margin: 0 30rpx 20rpx;
  background: #fff9e6;
  border-radius: 16rpx;
  padding: 20rpx;
}

.hint-label {
  font-size: 26rpx;
  color: #faad14;
  display: block;
  margin-bottom: 8rpx;
}

.hint-text {
  font-size: 26rpx;
  color: #666;
  line-height: 1.4;
}

.puzzle-content {
  padding: 0 30rpx 20rpx;
}

.puzzle-question {
  font-size: 28rpx;
  color: #333;
  line-height: 1.6;
}

.options-list {
  padding: 0 30rpx;
}

.option-item {
  display: flex;
  padding: 24rpx;
  background: #f8f9fa;
  border-radius: 16rpx;
  margin-bottom: 16rpx;
  border: 2rpx solid transparent;
}

.option-item.selected {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.1);
}

.option-item.correct {
  border-color: #52c41a;
  background: rgba(82, 196, 26, 0.1);
}

.option-item.wrong {
  border-color: #f5222d;
  background: rgba(245, 34, 45, 0.1);
}

.option-letter {
  font-size: 28rpx;
  font-weight: bold;
  color: #667eea;
  margin-right: 16rpx;
}

.option-text {
  font-size: 28rpx;
  color: #333;
  flex: 1;
}

.result-section {
  padding: 20rpx 30rpx;
}

.result-correct {
  text-align: center;
  padding: 20rpx;
  background: rgba(82, 196, 26, 0.1);
  border-radius: 16rpx;
  margin-bottom: 20rpx;
}

.result-wrong {
  text-align: center;
  padding: 20rpx;
  background: rgba(245, 34, 45, 0.1);
  border-radius: 16rpx;
  margin-bottom: 20rpx;
}

.result-icon {
  font-size: 48rpx;
  display: block;
}

.result-text {
  font-size: 28rpx;
  color: #333;
  display: block;
  margin-top: 10rpx;
}

.score-text {
  font-size: 32rpx;
  color: #52c41a;
  font-weight: bold;
  display: block;
  margin-top: 10rpx;
}

.explanation-box {
  background: #f8f9fa;
  border-radius: 16rpx;
  padding: 20rpx;
}

.explanation-label {
  font-size: 26rpx;
  color: #667eea;
  display: block;
  margin-bottom: 10rpx;
}

.explanation-text {
  font-size: 26rpx;
  color: #666;
  line-height: 1.5;
}

.modal-actions {
  padding: 30rpx;
}

.submit-btn,
.next-btn {
  width: 100%;
  padding: 24rpx;
  border-radius: 50rpx;
  font-size: 32rpx;
  font-weight: bold;
  color: #ffffff;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

.submit-btn[disabled] {
  background: #ccc;
}

.next-btn {
  background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%);
}
</style>
