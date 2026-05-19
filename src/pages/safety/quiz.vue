<template>
  <view class="quiz-page">
    <!-- 头部进度 -->
    <view class="header">
      <view class="header-top">
        <view class="back-btn" @click="goBack">×</view>
        <view class="progress-info">
          <text class="progress-text">{{ currentIndex + 1 }}/{{ totalQuestions }}</text>
        </view>
      </view>
      <view class="progress-bar">
        <view class="progress-fill" :style="{ width: progressPercent + '%' }"></view>
      </view>
    </view>

    <!-- 题目区域 -->
    <view class="question-area" v-if="currentQuestion">
      <view class="question-card">
        <text class="question-text">{{ currentQuestion.question }}</text>
      </view>

      <!-- 选项 -->
      <view class="options-list">
        <view 
          class="option-item"
          v-for="(option, index) in currentQuestion.options"
          :key="index"
          :class="{ selected: selectedAnswer === index, correct: showResult && index === currentQuestion.correctAnswer, wrong: showResult && selectedAnswer === index && index !== currentQuestion.correctAnswer }"
          @click="handleSelectOption(index)"
        >
          <view class="option-letter">{{ String.fromCharCode(65 + index) }}</view>
          <text class="option-text">{{ option.text }}</text>
        </view>
      </view>
    </view>

    <!-- 结果区域 -->
    <view class="result-area" v-if="quizFinished">
      <view class="result-card">
        <text class="result-icon">🎉</text>
        <text class="result-title">测试完成！</text>
        <view class="result-score">
          <text class="score-value">{{ quizResult.score }}</text>
          <text class="score-label">分</text>
        </view>
        <view class="result-stats">
          <view class="stat-item">
            <text class="stat-value">{{ quizResult.correctCount }}</text>
            <text class="stat-label">正确</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ quizResult.totalQuestions - quizResult.correctCount }}</text>
            <text class="stat-label">错误</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">+{{ quizResult.points }}</text>
            <text class="stat-label">积分</text>
          </view>
        </view>
        <view class="result-actions">
          <button class="action-btn retry" @click="retryQuiz">再测一次</button>
          <button class="action-btn back" @click="goBack">返回</button>
        </view>
      </view>
    </view>

    <!-- 下一题按钮 -->
    <view class="next-btn-area" v-if="selectedAnswer !== null && !quizFinished">
      <button 
        class="next-btn" 
        :class="{ disabled: !hasNext }"
        :disabled="!hasNext"
        @click="handleNext"
      >
        {{ hasNext ? '下一题' : '查看结果' }}
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useSafetyStore } from '@/stores/safetyStore.js'

const safetyStore = useSafetyStore()

const selectedAnswer = ref(null)
const showResult = ref(false)
const quizFinished = ref(false)
const quizResult = ref(null)
const currentIndex = ref(0)
const category = ref(null)

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = currentPage.options || {}
  
  if (options.category) {
    category.value = options.category
    safetyStore.startQuiz(options.category, 5)
  }
  
  if (safetyStore.quizQuestions.length === 0) {
    safetyStore.startQuiz(null, 5)
  }
})

const currentQuestion = computed(() => {
  return safetyStore.currentQuestion
})

const totalQuestions = computed(() => {
  return safetyStore.quizQuestions.length
})

const progressPercent = computed(() => {
  if (totalQuestions.value === 0) return 0
  return Math.round(((currentIndex.value + 1) / totalQuestions.value) * 100)
})

const hasNext = computed(() => {
  return currentIndex.value < safetyStore.quizQuestions.length - 1
})

const handleSelectOption = (index) => {
  if (showResult.value) return
  
  selectedAnswer.value = index
  showResult.value = true
  
  const result = safetyStore.answerQuestion(index)
}

const handleNext = () => {
  if (hasNext.value) {
    currentIndex.value++
    selectedAnswer.value = null
    showResult.value = false
  } else {
    // 完成Quiz
    quizResult.value = safetyStore.finishQuiz()
    quizFinished.value = true
  }
}

const retryQuiz = () => {
  safetyStore.startQuiz(category.value, 5)
  currentIndex.value = 0
  selectedAnswer.value = null
  showResult.value = false
  quizFinished.value = false
  quizResult.value = null
}

const goBack = () => {
  uni.navigateBack()
}
</script>

<style scoped>
.quiz-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.header {
  background: #fff;
  padding: 15px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.header-top {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.back-btn {
  font-size: 24px;
  color: #999;
  width: 30px;
}

.progress-info {
  flex: 1;
  text-align: center;
}

.progress-text {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.progress-bar {
  height: 6px;
  background: #eee;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3498DB, #2ECC71);
  border-radius: 3px;
  transition: width 0.3s;
}

.question-area {
  padding: 20px 15px 100px;
}

.question-card {
  background: #fff;
  border-radius: 16px;
  padding: 25px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.question-text {
  font-size: 16px;
  color: #333;
  line-height: 1.6;
  display: block;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.option-item {
  background: #fff;
  border-radius: 12px;
  padding: 15px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  border: 2px solid transparent;
}

.option-item.selected {
  border-color: #3498DB;
  background: #EBF5FF;
}

.option-item.correct {
  border-color: #27AE60;
  background: #E8F8F5;
}

.option-item.wrong {
  border-color: #E74C3C;
  background: #FDEDEC;
}

.option-letter {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
  color: #666;
  margin-right: 12px;
}

.option-item.selected .option-letter {
  background: #3498DB;
  color: #fff;
}

.option-item.correct .option-letter {
  background: #27AE60;
  color: #fff;
}

.option-item.wrong .option-letter {
  background: #E74C3C;
  color: #fff;
}

.option-text {
  font-size: 14px;
  color: #333;
  flex: 1;
}

.next-btn-area {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 15px;
  background: #fff;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.05);
}

.next-btn {
  width: 100%;
  height: 48px;
  border-radius: 24px;
  background: linear-gradient(135deg, #3498DB, #2ECC71);
  color: #fff;
  font-size: 16px;
  font-weight: bold;
  border: none;
}

.next-btn.disabled {
  background: #ccc;
}

/* 结果区域 */
.result-area {
  padding: 40px 20px;
}

.result-card {
  background: #fff;
  border-radius: 16px;
  padding: 30px;
  text-align: center;
  box-shadow: 0 2px 15px rgba(0,0,0,0.1);
}

.result-icon {
  font-size: 64px;
  display: block;
  margin-bottom: 15px;
}

.result-title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 20px;
}

.result-score {
  display: flex;
  align-items: baseline;
  justify-content: center;
  margin-bottom: 25px;
}

.score-value {
  font-size: 48px;
  font-weight: bold;
  color: #3498DB;
}

.score-label {
  font-size: 18px;
  color: #999;
  margin-left: 5px;
}

.result-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 25px;
  padding: 15px 0;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  display: block;
}

.stat-label {
  font-size: 12px;
  color: #999;
}

.result-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  flex: 1;
  height: 44px;
  border-radius: 22px;
  font-size: 14px;
  border: none;
}

.action-btn.retry {
  background: linear-gradient(135deg, #3498DB, #2ECC71);
  color: #fff;
}

.action-btn.back {
  background: #f0f0f0;
  color: #666;
}
</style>
