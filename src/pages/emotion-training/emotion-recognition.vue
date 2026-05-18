<template>
  <view class="emotion-recognition-page">
    <!-- 头部 -->
    <view class="header">
      <view class="header-content">
        <text class="page-title">情绪识别训练</text>
        <text class="page-subtitle">学习识别不同情绪</text>
      </view>
    </view>

    <!-- 开始训练 -->
    <view class="start-section" v-if="!store.recognitionExercises.length">
      <view class="section-card">
        <view class="section-icon">🎭</view>
        <text class="section-title">情绪识别练习</text>
        <text class="section-desc">通过情景故事，学习识别不同的情绪</text>
        
        <view class="difficulty-selector">
          <text class="selector-label">选择难度</text>
          <view class="difficulty-btns">
            <view 
              v-for="level in difficultyLevels" 
              :key="level.value"
              class="difficulty-btn"
              :class="{active: selectedDifficulty === level.value}"
              @tap="selectedDifficulty = level.value"
            >
              <text class="level-name">{{ level.name }}</text>
              <text class="level-desc">{{ level.desc }}</text>
            </view>
          </view>
        </view>
        
        <button class="start-btn" @tap="startTraining">
          开始练习
        </button>
      </view>
    </view>

    <!-- 训练进行中 -->
    <view class="training-section" v-else>
      <!-- 进度条 -->
      <view class="progress-bar-container">
        <view class="progress-info">
          <text>进度 {{ store.currentExerciseIndex + 1 }} / {{ store.recognitionExercises.length }}</text>
          <text class="accuracy" v-if="store.exerciseResults.length">正确率 {{ store.exerciseAccuracy }}%</text>
        </view>
        <view class="progress-bar">
          <view 
            class="progress-fill" 
            :style="{width: store.exerciseProgress + '%'}"
          ></view>
        </view>
      </view>

      <!-- 题目卡片 -->
      <view class="question-card" v-if="currentExercise">
        <view class="scenario-header">
          <text class="scenario-label">情景故事</text>
        </view>
        
        <text class="scenario-title">{{ currentExercise.title }}</text>
        <text class="scenario-desc">{{ currentExercise.description }}</text>

        <view class="question-prompt">
          <text>这个小朋友是什么情绪？</text>
        </view>

        <!-- 情绪选项 -->
        <view class="emotion-options">
          <view 
            v-for="emotion in currentExercise.options" 
            :key="emotion"
            class="emotion-option"
            :class="{
              selected: selectedEmotion === emotion,
              correct: showResult && emotion === currentExercise.emotion,
              wrong: showResult && selectedEmotion === emotion && emotion !== currentExercise.emotion
            }"
            @tap="selectEmotion(emotion)"
          >
            <text class="emotion-emoji">{{ getEmotionEmoji(emotion) }}</text>
            <text class="emotion-name">{{ getEmotionName(emotion) }}</text>
          </view>
        </view>

        <!-- 结果反馈 -->
        <view class="result-feedback" v-if="showResult">
          <view class="feedback-content">
            <text class="feedback-emoji">{{ isCorrect ? '✅' : '❌' }}</text>
            <view class="feedback-text">
              <text class="feedback-title">{{ isCorrect ? '回答正确！' : '再想想看' }}</text>
              <text class="feedback-desc">{{ isCorrect ? '你真棒！' : `正确答案是 ${getEmotionEmoji(currentExercise.emotion)} ${getEmotionName(currentExercise.emotion)}` }}</text>
            </view>
          </view>
        </view>

        <!-- 操作按钮 -->
        <view class="action-row">
          <button 
            class="next-btn"
            :disabled="!selectedEmotion"
            @tap="handleNext"
          >
            {{ hasNext ? '下一题' : '查看结果' }}
          </button>
        </view>
      </view>

      <!-- 结果页面 -->
      <view class="result-section" v-if="showFinalResult">
        <view class="result-card">
          <text class="result-emoji">🎉</text>
          <text class="result-title">训练完成！</text>
          
          <view class="result-stats">
            <view class="stat-item">
              <text class="stat-value">{{ store.exerciseAccuracy }}%</text>
              <text class="stat-label">正确率</text>
            </view>
            <view class="stat-item">
              <text class="stat-value">{{ correctCount }}</text>
              <text class="stat-label">正确数</text>
            </view>
            <view class="stat-item">
              <text class="stat-value">{{ store.recognitionExercises.length }}</text>
              <text class="stat-label">总题数</text>
            </view>
          </view>

          <view class="result-message">
            <text v-if="store.exerciseAccuracy >= 80">太棒了！你对情绪的识别能力很强！</text>
            <text v-else-if="store.exerciseAccuracy >= 60">不错的表现！继续练习会越来越好！</text>
            <text v-else>加油！多练习能帮助你更好地识别情绪。</text>
          </view>

          <view class="result-actions">
            <button class="retry-btn" @tap="retryTraining">再练一次</button>
            <button class="back-btn" @tap="goBack">返回</button>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部导航 -->
    <view class="bottom-nav">
      <view class="nav-item" @tap="goToJournal">
        <text class="nav-icon">📝</text>
        <text class="nav-text">情绪日记</text>
      </view>
      <view class="nav-item active">
        <text class="nav-icon">🎭</text>
        <text class="nav-text">识别训练</text>
      </view>
      <view class="nav-item" @tap="goToRelaxation">
        <text class="nav-icon">🧘</text>
        <text class="nav-text">放松练习</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useEmotionStore } from '@/stores/emotionStore.js'
import { EMOTION_TYPES, EMOTION_EMOJIS } from '@/services/emotionTrainingService.js'

const store = useEmotionStore()

// 难度等级
const difficultyLevels = [
  { value: 1, name: '简单', desc: '适合初学者' },
  { value: 2, name: '中等', desc: '需要思考' },
  { value: 3, name: '困难', desc: '挑战一下' }
]

const selectedDifficulty = ref(1)
const selectedEmotion = ref(null)
const showResult = ref(false)
const showFinalResult = ref(false)

const currentExercise = computed(() => store.currentExercise)
const hasNext = computed(() => store.currentExerciseIndex < store.recognitionExercises.length - 1)
const isCorrect = computed(() => selectedEmotion.value === currentExercise.value?.emotion)
const correctCount = computed(() => store.exerciseResults.filter(r => r.correct).length)

// 情绪名称映射
const emotionNames = {
  [EMOTION_TYPES.HAPPY]: '开心',
  [EMOTION_TYPES.SAD]: '伤心',
  [EMOTION_TYPES.ANGRY]: '生气',
  [EMOTION_TYPES.SCARED]: '害怕',
  [EMOTION_TYPES.SURPRISED]: '惊讶',
  [EMOTION_TYPES.DISGUSTED]: '厌恶',
  [EMOTION_TYPES.ANXIOUS]: '焦虑',
  [EMOTION_TYPES.CALM]: '平静',
  [EMOTION_TYPES.GRATEFUL]: '感恩',
  [EMOTION_TYPES.PROUD]: '自豪'
}

function getEmotionEmoji(emotionType) {
  return EMOTION_EMOJIS[emotionType] || '❓'
}

function getEmotionName(emotionType) {
  return emotionNames[emotionType] || emotionType
}

function startTraining() {
  showFinalResult.value = false
  selectedEmotion.value = null
  showResult.value = false
  store.startRecognitionTraining(selectedDifficulty.value, 5)
}

function selectEmotion(emotion) {
  if (showResult.value) return
  selectedEmotion.value = emotion
}

function handleNext() {
  if (!selectedEmotion.value) return

  // 显示结果
  showResult.value = true

  // 记录答案
  store.answerExercise(selectedEmotion.value)

  if (!hasNext.value) {
    // 完成训练
    setTimeout(() => {
      store.finishTraining()
      showFinalResult.value = true
    }, 1500)
  } else {
    // 延迟后进入下一题
    setTimeout(() => {
      selectedEmotion.value = null
      showResult.value = false
    }, 1200)
  }
}

function retryTraining() {
  selectedEmotion.value = null
  showResult.value = false
  showFinalResult.value = false
  startTraining()
}

function goBack() {
  selectedEmotion.value = null
  showResult.value = false
  showFinalResult.value = false
  store.recognitionExercises = []
  store.currentExerciseIndex = 0
  store.exerciseResults = []
}

function goToJournal() {
  uni.navigateTo({ url: '/pages/emotion-training/emotion-journal' })
}

function goToRelaxation() {
  uni.navigateTo({ url: '/pages/emotion-training/relaxation' })
}
</script>

<style scoped>
.emotion-recognition-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120rpx;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60rpx 40rpx 80rpx;
  color: #fff;
}

.header-content {
  text-align: center;
}

.page-title {
  font-size: 40rpx;
  font-weight: 600;
  display: block;
}

.page-subtitle {
  font-size: 28rpx;
  opacity: 0.9;
  margin-top: 10rpx;
  display: block;
}

/* 开始训练 */
.start-section {
  padding: 40rpx 30rpx;
}

.section-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 50rpx 40rpx;
  text-align: center;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.08);
}

.section-icon {
  font-size: 100rpx;
  margin-bottom: 30rpx;
}

.section-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
  display: block;
}

.section-desc {
  font-size: 28rpx;
  color: #666;
  margin-top: 15rpx;
  display: block;
}

.difficulty-selector {
  margin-top: 50rpx;
}

.selector-label {
  font-size: 28rpx;
  color: #666;
  display: block;
  margin-bottom: 25rpx;
}

.difficulty-btns {
  display: flex;
  gap: 20rpx;
}

.difficulty-btn {
  flex: 1;
  background: #f8f8f8;
  border-radius: 16rpx;
  padding: 25rpx 15rpx;
  border: 2rpx solid transparent;
  transition: all 0.3s;
}

.difficulty-btn.active {
  background: #f0e6ff;
  border-color: #764ba2;
}

.level-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  display: block;
}

.level-desc {
  font-size: 22rpx;
  color: #999;
  margin-top: 8rpx;
  display: block;
}

.start-btn {
  margin-top: 50rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-size: 32rpx;
  padding: 25rpx 100rpx;
  border-radius: 50rpx;
  border: none;
}

/* 训练进行中 */
.progress-bar-container {
  padding: 30rpx;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  font-size: 26rpx;
  color: #666;
  margin-bottom: 15rpx;
}

.accuracy {
  color: #667eea;
}

.progress-bar {
  height: 12rpx;
  background: #e8e8e8;
  border-radius: 6rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 6rpx;
  transition: width 0.3s;
}

/* 题目卡片 */
.question-card {
  margin: 0 30rpx;
  background: #fff;
  border-radius: 24rpx;
  padding: 40rpx;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.08);
}

.scenario-header {
  margin-bottom: 25rpx;
}

.scenario-label {
  background: #f0e6ff;
  color: #764ba2;
  font-size: 24rpx;
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
}

.scenario-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
  display: block;
}

.scenario-desc {
  font-size: 28rpx;
  color: #666;
  margin-top: 15rpx;
  display: block;
  line-height: 1.6;
}

.question-prompt {
  margin-top: 40rpx;
  padding: 25rpx;
  background: #f8f8f8;
  border-radius: 12rpx;
  text-align: center;
}

.question-prompt text {
  font-size: 30rpx;
  color: #333;
  font-weight: 500;
}

/* 情绪选项 */
.emotion-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20rpx;
  margin-top: 40rpx;
}

.emotion-option {
  background: #f8f8f8;
  border-radius: 16rpx;
  padding: 30rpx 20rpx;
  text-align: center;
  border: 2rpx solid transparent;
  transition: all 0.3s;
}

.emotion-option.selected {
  border-color: #667eea;
  background: #f0e6ff;
}

.emotion-option.correct {
  border-color: #52c41a;
  background: #f6ffed;
}

.emotion-option.wrong {
  border-color: #ff4d4f;
  background: #fff1f0;
}

.emotion-emoji {
  font-size: 60rpx;
  display: block;
}

.emotion-name {
  font-size: 26rpx;
  color: #333;
  margin-top: 10rpx;
  display: block;
}

/* 结果反馈 */
.result-feedback {
  margin-top: 30rpx;
  padding: 25rpx;
  background: #f8f8f8;
  border-radius: 12rpx;
}

.feedback-content {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.feedback-emoji {
  font-size: 50rpx;
}

.feedback-text {
  flex: 1;
}

.feedback-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  display: block;
}

.feedback-desc {
  font-size: 24rpx;
  color: #666;
  margin-top: 5rpx;
  display: block;
}

.action-row {
  margin-top: 40rpx;
}

.next-btn {
  width: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-size: 32rpx;
  padding: 25rpx;
  border-radius: 50rpx;
  border: none;
}

.next-btn[disabled] {
  background: #ccc;
}

/* 结果页面 */
.result-section {
  padding: 40rpx 30rpx;
}

.result-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 60rpx 40rpx;
  text-align: center;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.08);
}

.result-emoji {
  font-size: 120rpx;
  display: block;
}

.result-title {
  font-size: 40rpx;
  font-weight: 600;
  color: #333;
  margin-top: 30rpx;
  display: block;
}

.result-stats {
  display: flex;
  justify-content: space-around;
  margin-top: 50rpx;
  padding: 30rpx 0;
  border-top: 1rpx solid #eee;
  border-bottom: 1rpx solid #eee;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 48rpx;
  font-weight: 700;
  color: #667eea;
  display: block;
}

.stat-label {
  font-size: 24rpx;
  color: #999;
  margin-top: 10rpx;
  display: block;
}

.result-message {
  margin-top: 40rpx;
  padding: 25rpx;
  background: #f8f8f8;
  border-radius: 12rpx;
}

.result-message text {
  font-size: 28rpx;
  color: #666;
  line-height: 1.5;
}

.result-actions {
  display: flex;
  gap: 20rpx;
  margin-top: 50rpx;
}

.retry-btn {
  flex: 1;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-size: 30rpx;
  padding: 25rpx;
  border-radius: 50rpx;
  border: none;
}

.back-btn {
  flex: 1;
  background: #f8f8f8;
  color: #666;
  font-size: 30rpx;
  padding: 25rpx;
  border-radius: 50rpx;
  border: none;
}

/* 底部导航 */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  display: flex;
  justify-content: space-around;
  padding: 20rpx 0;
  box-shadow: 0 -4rpx 20rpx rgba(0,0,0,0.05);
}

.nav-item {
  text-align: center;
  padding: 10rpx 30rpx;
}

.nav-item.active .nav-icon,
.nav-item.active .nav-text {
  color: #667eea;
}

.nav-icon {
  font-size: 44rpx;
  display: block;
}

.nav-text {
  font-size: 22rpx;
  color: #999;
  margin-top: 5rpx;
  display: block;
}
</style>
