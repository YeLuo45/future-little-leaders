<template>
  <view class="pause-page">
    <!-- 顶部导航 -->
    <view class="nav-header">
      <text class="back-btn" @click="goBack">‹</text>
      <text class="nav-title">停顿训练</text>
      <text class="nav-placeholder"></text>
    </view>

    <!-- 停顿说明 -->
    <view class="info-card">
      <text class="info-title">为什么要停顿？</text>
      <text class="info-text">恰当的停顿可以让演讲更有节奏感，让听众有时间思考重点，也能让自己整理思路。停顿不是尴尬，而是演讲的艺术。</text>
    </view>

    <!-- 停顿类型 -->
    <view class="pause-types">
      <view
        v-for="(pause, key) in pauseData"
        :key="key"
        class="pause-card"
        :class="{ active: selectedType === key }"
        @click="selectType(key)"
      >
        <view class="pause-header">
          <text class="pause-duration">{{ pause.duration }}秒</text>
          <view class="pause-icon">{{ getPauseEmoji(pause.duration) }}</view>
        </view>
        <text class="pause-name">{{ pause.description }}</text>
        <text class="pause-usage">{{ pause.usage }}</text>
      </view>
    </view>

    <!-- 训练区域 -->
    <view class="training-area">
      <view class="training-header">
        <text class="training-title">停顿练习</text>
        <text class="training-subtitle">跟随节奏练习停顿</text>
      </view>

      <!-- 练习内容 -->
      <view class="practice-content">
        <view class="practice-text">
          <text v-for="(segment, index) in practiceSegments" :key="index">
            <text :class="{ highlight: segment.isHighlight }">{{ segment.text }}</text>
          </text>
        </view>
        
        <!-- 当前状态 -->
        <view class="current-state">
          <view class="state-display" :class="{ speaking: isSpeaking, pausing: isPausing }">
            <text class="state-icon">{{ isSpeaking ? '🎤' : (isPausing ? '⏸️' : '➡️') }}</text>
            <text class="state-text">{{ isSpeaking ? '说话中...' : (isPausing ? '停顿中' : '准备开始') }}</text>
          </view>
          
          <view class="state-timer" v-if="isPausing">
            <text class="timer-value">{{ pauseCountdown }}秒</text>
          </view>
        </view>
      </view>

      <!-- 控制按钮 -->
      <view class="control-section">
        <button class="control-btn" :disabled="isFinished" @click="togglePractice">
          {{ isSpeaking ? '暂停' : (isPausing ? '继续' : (isFinished ? '重新开始' : '开始练习')) }}
        </button>
      </view>

      <!-- 练习步骤 -->
      <view class="practice-steps">
        <view
          v-for="(step, index) in practiceSteps"
          :key="index"
          class="step-item"
          :class="{ active: currentStep === index, completed: currentStep > index }"
        >
          <view class="step-number">
            <text v-if="currentStep > index">✓</text>
            <text v-else>{{ index + 1 }}</text>
          </view>
          <view class="step-content">
            <text class="step-text">{{ step.text }}</text>
            <text class="step-duration" v-if="step.duration">{{ step.duration }}秒</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 完成提示 -->
    <view v-if="showCompleteTip" class="complete-tip">
      <text>🎉 停顿练习完成！记住：恰当的停顿让演讲更精彩。</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { usePublicSpeakingStore } from '@/stores/publicSpeakingStore.js'

const store = usePublicSpeakingStore()

// 状态
const selectedType = ref('mediumPause')
const isSpeaking = ref(false)
const isPausing = ref(false)
const isFinished = ref(false)
const currentStep = ref(0)
const pauseCountdown = ref(0)
const showCompleteTip = ref(false)

// 练习步骤
const practiceSteps = [
  { text: '大家好', duration: null, isSpeaking: true },
  { text: '，', duration: 0.5, isSpeaking: false },
  { text: '今天我想和大家分享', duration: null, isSpeaking: true },
  { text: '，', duration: 1, isSpeaking: false },
  { text: '一个有趣的故事', duration: null, isSpeaking: true },
  { text: '。', duration: 2, isSpeaking: false }
]

// 计算属性
const pauseData = computed(() => store.getPauseTraining())

const practiceSegments = computed(() => {
  const segments = []
  practiceSteps.forEach((step, index) => {
    segments.push({
      text: step.text,
      isHighlight: currentStep.value === index
    })
    if (step.duration && index < practiceSteps.length - 1) {
      segments.push({
        text: '[停顿]',
        isHighlight: false
      })
    }
  })
  return segments
})

// 方法
const goBack = () => {
  uni.navigateBack()
}

const getPauseEmoji = (duration) => {
  if (duration <= 0.5) return '·'
  if (duration <= 1) return '··'
  return '···'
}

const selectType = (type) => {
  selectedType.value = type
}

let practiceInterval = null
let pauseTimer = null

const togglePractice = () => {
  if (isFinished.value) {
    resetPractice()
    return
  }
  
  if (isSpeaking.value) {
    // 暂停说话，进入停顿
    isSpeaking.value = false
    isPausing.value = true
    const currentStepData = practiceSteps[currentStep.value]
    if (currentStepData.duration) {
      pauseCountdown.value = currentStepData.duration
      startPauseTimer()
    }
  } else if (isPausing.value) {
    // 停止停顿，进入下一句
    stopPauseTimer()
    isPausing.value = false
    currentStep.value++
    if (currentStep.value >= practiceSteps.length) {
      finishPractice()
    } else {
      isSpeaking.value = true
    }
  } else {
    // 开始
    isSpeaking.value = true
  }
}

const startPauseTimer = () => {
  pauseTimer = setInterval(() => {
    pauseCountdown.value -= 0.1
    if (pauseCountdown.value <= 0) {
      stopPauseTimer()
      isPausing.value = false
      currentStep.value++
      if (currentStep.value >= practiceSteps.length) {
        finishPractice()
      } else {
        isSpeaking.value = true
      }
    }
  }, 100)
}

const stopPauseTimer = () => {
  if (pauseTimer) {
    clearInterval(pauseTimer)
    pauseTimer = null
  }
}

const finishPractice = () => {
  isFinished.value = true
  showCompleteTip.value = true
  uni.showToast({ title: '练习完成！', icon: 'success' })
}

const resetPractice = () => {
  isFinished.value = false
  showCompleteTip.value = false
  currentStep.value = 0
  isSpeaking.value = false
  isPausing.value = false
  pauseCountdown.value = 0
}

onMounted(() => {
  store.init()
})

onUnmounted(() => {
  if (practiceInterval) clearInterval(practiceInterval)
  if (pauseTimer) clearInterval(pauseTimer)
})
</script>

<style scoped>
.pause-page {
  min-height: 100vh;
  background: #f5f5f5;
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

/* 信息卡片 */
.info-card {
  margin: 20rpx 30rpx;
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
}

.info-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.info-text {
  font-size: 24rpx;
  color: #666;
  line-height: 1.6;
}

/* 停顿类型 */
.pause-types {
  display: flex;
  gap: 16rpx;
  padding: 0 30rpx;
  margin-bottom: 24rpx;
}

.pause-card {
  flex: 1;
  background: #fff;
  border-radius: 16rpx;
  padding: 20rpx;
  border: 4rpx solid transparent;
  transition: all 0.3s;
}

.pause-card.active {
  border-color: #667eea;
}

.pause-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8rpx;
}

.pause-duration {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.pause-icon {
  font-size: 28rpx;
  color: #667eea;
  letter-spacing: 4rpx;
}

.pause-name {
  font-size: 22rpx;
  color: #666;
  display: block;
  margin-bottom: 4rpx;
}

.pause-usage {
  font-size: 20rpx;
  color: #999;
}

/* 训练区域 */
.training-area {
  margin: 0 30rpx;
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
}

.training-header {
  text-align: center;
  margin-bottom: 24rpx;
}

.training-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 4rpx;
}

.training-subtitle {
  font-size: 24rpx;
  color: #999;
}

/* 练习内容 */
.practice-content {
  background: #f8f9fa;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 24rpx;
  text-align: center;
}

.practice-text {
  font-size: 28rpx;
  color: #333;
  line-height: 2;
  margin-bottom: 24rpx;
}

.highlight {
  color: #667eea;
  font-weight: bold;
}

.current-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
}

.state-display {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 16rpx 32rpx;
  border-radius: 30rpx;
  background: #eee;
}

.state-display.speaking {
  background: rgba(102, 126, 234, 0.1);
}

.state-display.pausing {
  background: rgba(250, 173, 20, 0.1);
}

.state-icon {
  font-size: 32rpx;
}

.state-text {
  font-size: 26rpx;
  color: #666;
}

.state-timer {
  text-align: center;
}

.timer-value {
  font-size: 48rpx;
  font-weight: bold;
  color: #faad14;
}

/* 控制按钮 */
.control-section {
  display: flex;
  justify-content: center;
  margin-bottom: 24rpx;
}

.control-btn {
  width: 200rpx;
  height: 80rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 40rpx;
  color: #fff;
  font-size: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.control-btn[disabled] {
  background: #ccc;
}

/* 练习步骤 */
.practice-steps {
  border-top: 1rpx solid #eee;
  padding-top: 24rpx;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 12rpx 0;
  opacity: 0.5;
}

.step-item.active {
  opacity: 1;
}

.step-item.completed {
  opacity: 0.7;
}

.step-number {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background: #eee;
  color: #999;
  font-size: 22rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.step-item.active .step-number {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.step-item.completed .step-number {
  background: #52c41a;
  color: #fff;
}

.step-content {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.step-text {
  font-size: 26rpx;
  color: #333;
}

.step-duration {
  font-size: 22rpx;
  color: #faad14;
}

/* 完成提示 */
.complete-tip {
  margin: 20rpx 30rpx;
  padding: 20rpx;
  background: rgba(82, 196, 26, 0.1);
  border-radius: 12rpx;
  text-align: center;
}

.complete-tip text {
  font-size: 26rpx;
  color: #52c41a;
}
</style>
