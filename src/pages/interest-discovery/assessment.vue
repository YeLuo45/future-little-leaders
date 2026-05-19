<template>
  <view class="assessment-page">
    <!-- 顶部进度 -->
    <view class="progress-header">
      <view class="progress-bar">
        <view 
          class="progress-fill" 
          :style="{ width: progressPercent + '%' }"
        ></view>
      </view>
      <text class="progress-text">{{ currentIndex + 1 }}/{{ totalQuestions }}</text>
    </view>

    <!-- 题目区域 -->
    <view class="question-section">
      <text class="question-number">问题 {{ currentIndex + 1 }}</text>
      <text class="question-text">{{ currentQuestion?.question }}</text>
      
      <!-- 选项列表 -->
      <view class="options-list">
        <view 
          v-for="(option, index) in currentQuestion?.options" 
          :key="index"
          class="option-item"
          :class="{ selected: answers[currentIndex] === index }"
          @tap="selectOption(index)"
        >
          <view class="option-radio">
            <view v-if="answers[currentIndex] === index" class="radio-inner"></view>
          </view>
          <text class="option-text">{{ option.text }}</text>
        </view>
      </view>
    </view>

    <!-- 底部按钮 -->
    <view class="bottom-actions">
      <view 
        v-if="currentIndex > 0" 
        class="btn-prev"
        @tap="prevQuestion"
      >
        ‹ 上一题
      </view>
      <view 
        v-if="currentIndex < totalQuestions - 1" 
        class="btn-next"
        :class="{ disabled: answers[currentIndex] === undefined }"
        @tap="nextQuestion"
      >
        下一题 ›
      </view>
      <view 
        v-else 
        class="btn-submit"
        :class="{ disabled: !allAnswered }"
        @tap="submitAssessment"
      >
        完成测评
      </view>
    </view>

    <!-- 结果展示 -->
    <view v-if="showResults" class="results-overlay">
      <view class="results-card">
        <text class="results-icon">🎯</text>
        <text class="results-title">测评完成！</text>
        <text class="results-subtitle">你的兴趣倾向分析</text>
        
        <view class="results-list">
          <view 
            v-for="(interest, idx) in topInterests" 
            :key="interest.id"
            class="result-item"
          >
            <view class="result-rank">{{ idx + 1 }}</view>
            <view class="result-icon">{{ interest.icon }}</view>
            <view class="result-info">
              <text class="result-name">{{ interest.name }}</text>
              <text class="result-desc">{{ interest.description }}</text>
            </view>
            <view class="result-bar">
              <view 
                class="result-fill"
                :style="{ 
                  width: interest.percent + '%',
                  backgroundColor: interest.color
                }"
              ></view>
            </view>
          </view>
        </view>

        <view class="btn-continue" @tap="goBack">
          开始探索之旅
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useInterestDiscoveryStore } from '@/stores/interestDiscoveryStore.js'
import interestDiscoveryService from '@/services/interestDiscoveryService.js'

const store = useInterestDiscoveryStore()

const questions = interestDiscoveryService.ASSESSMENT_QUESTIONS
const totalQuestions = questions.length
const answers = ref([])
const showResults = ref(false)
const results = ref([])

const currentIndex = ref(0)
const currentQuestion = computed(() => questions[currentIndex.value])
const progressPercent = computed(() => Math.round(((currentIndex.value + 1) / totalQuestions) * 100))
const allAnswered = computed(() => answers.value.filter(a => a !== undefined).length === totalQuestions)

const selectOption = (index) => {
  answers.value[currentIndex.value] = index
}

const prevQuestion = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
  }
}

const nextQuestion = () => {
  if (answers.value[currentIndex.value] !== undefined && currentIndex.value < totalQuestions - 1) {
    currentIndex.value++
  }
}

const submitAssessment = () => {
  if (!allAnswered.value) {
    uni.showToast({ title: '请完成所有问题', icon: 'none' })
    return
  }

  // 处理结果
  const dimensionScores = interestDiscoveryService.processAssessmentResults(answers.value)
  const maxScore = Math.max(...Object.values(dimensionScores))
  
  results.value = Object.entries(dimensionScores)
    .map(([id, score]) => {
      const dim = interestDiscoveryService.INTEREST_DIMENSIONS[id]
      return {
        id,
        score,
        percent: Math.round((score / maxScore) * 100),
        ...dim
      }
    })
    .sort((a, b) => b.score - a.score)

  // 提交到store
  store.startAssessment()
  answers.value.forEach((ans, idx) => store.answerQuestion(ans))
  store.submitAssessment()

  showResults.value = true
}

const topInterests = computed(() => results.value.slice(0, 3))

const goBack = () => {
  uni.navigateBack()
}
</script>

<style scoped>
.assessment-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding-bottom: 150rpx;
}

.progress-header {
  background: #fff;
  padding: 30rpx;
  display: flex;
  align-items: center;
  gap: 20rpx;
  position: sticky;
  top: 0;
  z-index: 10;
}

.progress-bar {
  flex: 1;
  height: 8rpx;
  background: #e8e8e8;
  border-radius: 4rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 4rpx;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 26rpx;
  color: #666;
  min-width: 80rpx;
  text-align: right;
}

.question-section {
  padding: 60rpx 40rpx;
}

.question-number {
  font-size: 26rpx;
  color: #667eea;
  font-weight: 500;
  display: block;
  margin-bottom: 20rpx;
}

.question-text {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
  line-height: 1.5;
  display: block;
  margin-bottom: 50rpx;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.option-item {
  display: flex;
  align-items: center;
  padding: 30rpx;
  background: #fff;
  border-radius: 16rpx;
  border: 2rpx solid #e8e8e8;
  transition: all 0.2s;
}

.option-item.selected {
  border-color: #667eea;
  background: #f8f7ff;
}

.option-radio {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  border: 3rpx solid #d0d0d0;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 24rpx;
}

.option-item.selected .option-radio {
  border-color: #667eea;
}

.radio-inner {
  width: 24rpx;
  height: 24rpx;
  border-radius: 50%;
  background: #667eea;
}

.option-text {
  flex: 1;
  font-size: 30rpx;
  color: #333;
  line-height: 1.4;
}

.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 30rpx 40rpx;
  padding-bottom: calc(30rpx + env(safe-area-inset-bottom));
  background: #fff;
  display: flex;
  gap: 20rpx;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.btn-prev, .btn-next, .btn-submit {
  flex: 1;
  padding: 28rpx;
  border-radius: 14rpx;
  text-align: center;
  font-size: 32rpx;
  font-weight: 500;
}

.btn-prev {
  background: #f0f0f0;
  color: #666;
}

.btn-next {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.btn-next.disabled {
  opacity: 0.5;
}

.btn-submit {
  background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%);
  color: #fff;
}

.btn-submit.disabled {
  opacity: 0.5;
}

.results-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
  padding: 40rpx;
}

.results-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 50rpx 40rpx;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  text-align: center;
}

.results-icon {
  font-size: 100rpx;
  display: block;
  margin-bottom: 20rpx;
}

.results-title {
  font-size: 40rpx;
  font-weight: 600;
  color: #333;
  display: block;
}

.results-subtitle {
  font-size: 28rpx;
  color: #666;
  display: block;
  margin-bottom: 40rpx;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 30rpx;
  margin-bottom: 40rpx;
  text-align: left;
}

.result-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 20rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
  position: relative;
}

.result-rank {
  width: 40rpx;
  height: 40rpx;
  background: #667eea;
  color: #fff;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24rpx;
  font-weight: 600;
}

.result-icon {
  font-size: 48rpx;
}

.result-info {
  flex: 1;
}

.result-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  display: block;
}

.result-desc {
  font-size: 22rpx;
  color: #999;
  display: block;
  margin-top: 4rpx;
}

.result-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 6rpx;
  background: #e8e8e8;
  border-radius: 0 0 12rpx 12rpx;
  overflow: hidden;
}

.result-fill {
  height: 100%;
  transition: width 0.5s ease;
}

.btn-continue {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  padding: 28rpx;
  border-radius: 14rpx;
  font-size: 32rpx;
  font-weight: 500;
}
</style>
