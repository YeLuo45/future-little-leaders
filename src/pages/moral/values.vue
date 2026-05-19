<template>
  <view class="moral-values-page">
    <!-- 顶部导航 -->
    <view class="nav-header">
      <view class="back-btn" @tap="goBack">
        <text class="icon">←</text>
      </view>
      <text class="nav-title">价值观学习</text>
      <view class="nav-right">
        <text class="points-badge" @tap="showPoints">{{ valuePoints }}积分</text>
      </view>
    </view>

    <!-- 核心价值观展示 -->
    <view class="values-showcase">
      <text class="section-title">核心价值观</text>
      <view class="values-grid">
        <view 
          class="value-item" 
          v-for="value in coreValues" 
          :key="value"
          :style="{ backgroundColor: getValueColor(value) }"
          @tap="selectValue(value)"
        >
          <text class="value-emoji">{{ getValueEmoji(value) }}</text>
          <text class="value-name">{{ value }}</text>
        </view>
      </view>
    </view>

    <!-- 学习进度 -->
    <view class="progress-section" v-if="valueStatsData">
      <text class="section-title">学习进度</text>
      <view class="progress-list">
        <view class="progress-item" v-for="(stat, value) in valueStatsData" :key="value" v-if="stat.count > 0">
          <view class="progress-header">
            <text class="progress-name">{{ getValueEmoji(value) }} {{ value }}</text>
            <text class="progress-score">{{ stat.avgScore }}分</text>
          </view>
          <view class="progress-bar">
            <view class="progress-fill" :style="{ width: stat.avgScore + '%', backgroundColor: getValueColor(value) }"></view>
          </view>
          <text class="progress-count">已学习{{ stat.count }}次</text>
        </view>
      </view>
    </view>

    <!-- 情景判断题入口 -->
    <view class="quiz-section" @tap="startQuiz">
      <view class="quiz-icon">
        <text class="icon-text">🎯</text>
      </view>
      <view class="quiz-info">
        <text class="quiz-title">情景判断题</text>
        <text class="quiz-desc">通过情景故事学习价值观判断</text>
      </view>
      <text class="quiz-arrow">→</text>
    </view>

    <!-- 答题界面 -->
    <view class="quiz-container" v-if="showQuiz">
      <view class="quiz-header">
        <text class="quiz-progress">第{{ currentScenarioIndex + 1 }}/{{ scenarios.length }}题</text>
        <text class="quiz-close" @tap="closeQuiz">关闭</text>
      </view>

      <view class="quiz-card" v-if="currentScenario">
        <text class="quiz-question">{{ currentScenario.title }}</text>
        <text class="quiz-desc">{{ currentScenario.description }}</text>

        <view class="quiz-options">
          <view 
            class="quiz-option" 
            v-for="option in currentScenario.options" 
            :key="option.value"
            :class="{ selected: selectedOption === option.value, correct: showResult && option.isCorrect, wrong: showResult && selectedOption === option.value && !option.isCorrect }"
            @tap="selectOption(option.value)"
          >
            <text class="option-text">{{ option.text }}</text>
          </view>
        </view>

        <view class="quiz-result" v-if="showResult">
          <text class="result-icon">{{ lastResult && lastResult.correct ? '✅' : '❌' }}</text>
          <text class="result-text">{{ lastResult && lastResult.correct ? '回答正确！' : '回答错误' }}</text>
          <text class="result-explanation">{{ currentScenario.explanation }}</text>
          <text class="result-points" v-if="lastResult">获得{{ lastResult.points }}积分</text>
        </view>

        <view class="quiz-actions" v-if="!showResult">
          <button class="btn-submit" @tap="submitAnswer" :disabled="!selectedOption">提交答案</button>
        </view>
        <view class="quiz-actions" v-else>
          <button class="btn-next" @tap="nextQuestion">
            {{ hasNext ? '下一题' : '完成学习' }}
          </button>
        </view>
      </view>
    </view>

    <!-- 学习结果 -->
    <view class="result-section" v-if="showResultSummary">
      <view class="result-card">
        <text class="result-title">学习完成！</text>
        <view class="result-stats">
          <view class="stat-item">
            <text class="stat-value">{{ quizResult.score }}%</text>
            <text class="stat-label">正确率</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ quizResult.correctCount }}</text>
            <text class="stat-label">正确题数</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ quizResult.points }}</text>
            <text class="stat-label">获得积分</text>
          </view>
        </view>
        <button class="btn-done" @tap="finishLearning">完成学习</button>
      </view>
    </view>

    <!-- 徽章展示 -->
    <view class="badges-section">
      <view class="section-header">
        <text class="section-title">品德徽章</text>
        <text class="badge-count">{{ badgeCount }}个</text>
      </view>
      <scroll-view class="badges-scroll" scroll-x>
        <view class="badges-list">
          <view class="badge-item" v-for="badge in badges" :key="badge.id">
            <text class="badge-icon">{{ badge.icon }}</text>
            <text class="badge-title">{{ badge.title }}</text>
          </view>
          <view class="badge-item empty" v-if="badges.length === 0">
            <text class="badge-icon">🏅</text>
            <text class="badge-title">暂无徽章</text>
          </view>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script>
import { useMoralEducationStore } from '@/stores/moralEducationStore.js'
import { VALUE_EMOJIS, VALUE_COLORS } from '@/services/moralEducationService.js'

export default {
  data() {
    return {
      selectedValue: null,
      showQuiz: false,
      selectedOption: null,
      showResult: false,
      lastResult: null,
      showResultSummary: false,
      quizResult: null
    }
  },
  computed: {
    coreValues() {
      return this.store.getCoreValuesList()
    },
    scenarios() {
      return this.store.scenarios
    },
    currentScenario() {
      return this.store.currentScenario
    },
    currentScenarioIndex() {
      return this.store.currentScenarioIndex
    },
    hasNext() {
      return this.currentScenarioIndex < this.scenarios.length - 1
    },
    valueStatsData() {
      return this.store.valueStatsData
    },
    valuePoints() {
      return this.store.valuePoints
    },
    badges() {
      return this.store.badges
    },
    badgeCount() {
      return this.store.badgeCount
    }
  },
  onLoad() {
    this.store.loadValueStats()
  },
  methods: {
    store() {
      return useMoralEducationStore()
    },
    goBack() {
      uni.navigateBack()
    },
    getValueEmoji(value) {
      return VALUE_EMOJIS[value] || '⭐'
    },
    getValueColor(value) {
      return VALUE_COLORS[value] || '#999999'
    },
    selectValue(value) {
      this.selectedValue = value
    },
    showPoints() {
      uni.showToast({
        title: `当前${this.valuePoints}积分`,
        icon: 'none'
      })
    },
    startQuiz() {
      this.store.loadScenarios(5)
      this.showQuiz = true
      this.showResultSummary = false
      this.selectedOption = null
      this.showResult = false
    },
    closeQuiz() {
      this.showQuiz = false
    },
    selectOption(value) {
      if (!this.showResult) {
        this.selectedOption = value
      }
    },
    submitAnswer() {
      if (!this.selectedOption) return
      
      this.lastResult = this.store.answerScenario(this.selectedOption)
      this.showResult = true
    },
    nextQuestion() {
      if (this.hasNext) {
        this.selectedOption = null
        this.showResult = false
        this.lastResult = null
      } else {
        this.quizResult = this.store.finishValueLearning()
        this.showQuiz = false
        this.showResultSummary = true
      }
    },
    finishLearning() {
      this.showResultSummary = false
    }
  }
}
</script>

<style scoped>
.moral-values-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 30rpx;
}

.nav-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 30rpx;
  background-color: #ffffff;
}

.back-btn, .nav-right {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-btn .icon {
  font-size: 36rpx;
  color: #333;
}

.nav-title {
  font-size: 34rpx;
  font-weight: bold;
  color: #333;
}

.points-badge {
  font-size: 26rpx;
  color: #8477fa;
  background-color: #f0f0f0;
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
}

.values-showcase {
  background-color: #ffffff;
  padding: 30rpx;
  margin-top: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 20rpx;
}

.values-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16rpx;
}

.value-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20rpx 10rpx;
  border-radius: 16rpx;
}

.value-emoji {
  font-size: 40rpx;
  margin-bottom: 8rpx;
}

.value-name {
  font-size: 22rpx;
  color: #ffffff;
  text-align: center;
}

.progress-section {
  background-color: #ffffff;
  padding: 30rpx;
  margin-top: 20rpx;
}

.progress-list {
  margin-top: 16rpx;
}

.progress-item {
  margin-bottom: 24rpx;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8rpx;
}

.progress-name {
  font-size: 28rpx;
  color: #333;
}

.progress-score {
  font-size: 28rpx;
  color: #8477fa;
  font-weight: bold;
}

.progress-bar {
  height: 12rpx;
  background-color: #f0f0f0;
  border-radius: 6rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 6rpx;
  transition: width 0.3s;
}

.progress-count {
  font-size: 24rpx;
  color: #999;
  margin-top: 4rpx;
}

.quiz-section {
  display: flex;
  align-items: center;
  background-color: #ffffff;
  padding: 30rpx;
  margin-top: 20rpx;
}

.quiz-icon {
  width: 100rpx;
  height: 100rpx;
  background-color: #8477fa;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-text {
  font-size: 48rpx;
}

.quiz-info {
  flex: 1;
  margin-left: 20rpx;
}

.quiz-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.quiz-desc {
  font-size: 26rpx;
  color: #666;
}

.quiz-arrow {
  font-size: 40rpx;
  color: #999;
}

.quiz-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.quiz-header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  padding: 30rpx;
  background-color: #ffffff;
}

.quiz-progress {
  font-size: 28rpx;
  color: #333;
}

.quiz-close {
  font-size: 28rpx;
  color: #999;
}

.quiz-card {
  width: 90%;
  background-color: #ffffff;
  border-radius: 24rpx;
  padding: 40rpx;
  max-height: 70vh;
  overflow-y: auto;
}

.quiz-question {
  font-size: 34rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 16rpx;
}

.quiz-desc {
  font-size: 28rpx;
  color: #666;
  display: block;
  margin-bottom: 30rpx;
  line-height: 1.6;
}

.quiz-options {
  margin-bottom: 30rpx;
}

.quiz-option {
  background-color: #f5f5f5;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
  border: 2rpx solid transparent;
}

.quiz-option.selected {
  border-color: #8477fa;
  background-color: #f0edff;
}

.quiz-option.correct {
  border-color: #4caf50;
  background-color: #e8f5e9;
}

.quiz-option.wrong {
  border-color: #f44336;
  background-color: #ffebee;
}

.option-text {
  font-size: 30rpx;
  color: #333;
}

.quiz-result {
  text-align: center;
  padding: 20rpx;
  background-color: #f9f9f9;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
}

.result-icon {
  font-size: 64rpx;
  display: block;
  margin-bottom: 10rpx;
}

.result-text {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 10rpx;
}

.result-explanation {
  font-size: 26rpx;
  color: #666;
  display: block;
  margin-bottom: 10rpx;
  line-height: 1.6;
}

.result-points {
  font-size: 28rpx;
  color: #8477fa;
  font-weight: bold;
}

.quiz-actions {
  margin-top: 20rpx;
}

.btn-submit, .btn-next {
  width: 100%;
  height: 88rpx;
  background-color: #8477fa;
  color: #ffffff;
  font-size: 32rpx;
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
}

.btn-submit[disabled] {
  background-color: #cccccc;
}

.btn-next {
  background-color: #4caf50;
}

.result-section {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.result-card {
  width: 85%;
  background-color: #ffffff;
  border-radius: 24rpx;
  padding: 50rpx;
  text-align: center;
}

.result-title {
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 40rpx;
}

.result-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 40rpx;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 48rpx;
  font-weight: bold;
  color: #8477fa;
  display: block;
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 24rpx;
  color: #666;
}

.btn-done {
  width: 100%;
  height: 88rpx;
  background-color: #8477fa;
  color: #ffffff;
  font-size: 32rpx;
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
}

.badges-section {
  background-color: #ffffff;
  padding: 30rpx;
  margin-top: 20rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.badge-count {
  font-size: 26rpx;
  color: #8477fa;
}

.badges-scroll {
  width: 100%;
}

.badges-list {
  display: flex;
  padding-bottom: 10rpx;
}

.badge-item {
  width: 160rpx;
  margin-right: 20rpx;
  text-align: center;
  flex-shrink: 0;
}

.badge-item .badge-icon {
  font-size: 64rpx;
  display: block;
  margin-bottom: 8rpx;
}

.badge-title {
  font-size: 24rpx;
  color: #666;
}

.badge-item.empty .badge-icon {
  opacity: 0.5;
}
</style>
