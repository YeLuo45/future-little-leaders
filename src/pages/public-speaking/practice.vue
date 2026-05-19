<template>
  <view class="practice-page">
    <!-- 顶部导航 -->
    <view class="nav-header">
      <text class="back-btn" @click="goBack">‹</text>
      <text class="nav-title">演讲练习</text>
      <text class="nav-placeholder"></text>
    </view>

    <!-- 练习模式选择 -->
    <view v-if="!isPracticing" class="mode-selection">
      <view class="mode-header">
        <text class="mode-title">选择练习模式</text>
      </view>
      
      <view class="mode-cards">
        <view class="mode-card" @click="startPractice('template')">
          <text class="mode-icon">📝</text>
          <text class="mode-name">模板练习</text>
          <text class="mode-desc">跟随模板结构练习</text>
        </view>
        
        <view class="mode-card" @click="startPractice('free')">
          <text class="mode-icon">🎙️</text>
          <text class="mode-name">自由练习</text>
          <text class="mode-desc">无限制自由演讲</text>
        </view>
        
        <view class="mode-card" @click="startPractice('pacing')">
          <text class="mode-icon">⚡</text>
          <text class="mode-name">语速训练</text>
          <text class="mode-desc">控制演讲节奏</text>
        </view>
        
        <view class="mode-card" @click="startPractice('pause')">
          <text class="mode-icon">⏸️</text>
          <text class="mode-name">停顿训练</text>
          <text class="mode-desc">学会适时停顿</text>
        </view>
      </view>
    </view>

    <!-- 练习中界面 -->
    <view v-else class="practicing-area">
      <!-- 计时器 -->
      <view class="timer-section">
        <view class="timer-display">
          <text class="timer-icon">⏱️</text>
          <text class="timer-value">{{ formatTime(currentTime) }}</text>
        </view>
        <view class="timer-progress">
          <view class="timer-bar" :style="{ width: timerProgress + '%' }"></view>
        </view>
        <text class="timer-target">目标: {{ targetDuration }}秒</text>
      </view>

      <!-- 模板内容 -->
      <view v-if="practiceMode === 'template' && currentTemplate" class="template-content">
        <view class="current-part">
          <text class="part-label">当前部分</text>
          <text class="part-name">{{ currentPartName }}</text>
        </view>
        
        <view class="part-guidance">
          <text class="guidance-text">{{ currentPartContent }}</text>
        </view>
        
        <!-- 结构进度 -->
        <view class="structure-progress">
          <view
            v-for="(part, index) in currentTemplate.structure"
            :key="index"
            class="progress-dot"
            :class="{ active: index === currentPartIndex, completed: index < currentPartIndex }"
          >
            <text v-if="index < currentPartIndex">✓</text>
            <text v-else>{{ index + 1 }}</text>
          </view>
        </view>
      </view>

      <!-- 自由练习/语速/停顿模式 -->
      <view v-else class="free-content">
        <view class="practice-hint">
          <text v-if="practiceMode === 'free'">🎤 请开始你的演讲</text>
          <text v-else-if="practiceMode === 'pacing'">⚡ 语速: {{ currentPacing }}</text>
          <text v-else-if="practiceMode === 'pause'">⏸️ 停顿训练模式</text>
        </view>
        
        <view class="speaking-area">
          <text class="speaking-icon">🎙️</text>
          <text class="speaking-status">{{ isRecording ? '录音中...' : '准备就绪' }}</text>
        </view>
      </view>

      <!-- 录音控制 -->
      <view class="record-controls">
        <view class="record-btn" :class="{ recording: isRecording }" @click="toggleRecording">
          <text class="record-icon">{{ isRecording ? '⏹️' : '🎤' }}</text>
          <text class="record-text">{{ isRecording ? '停止' : '开始' }}</text>
        </view>
      </view>

      <!-- 语速指示器 -->
      <view v-if="practiceMode === 'pacing'" class="pacing-indicator">
        <view class="pacing-bar">
          <view class="pacing-level" :style="{ width: pacingLevel + '%' }"></view>
        </view>
        <view class="pacing-labels">
          <text>慢</text>
          <text>中</text>
          <text>快</text>
        </view>
      </view>

      <!-- 暂停提示 -->
      <view v-if="practiceMode === 'pause' && showPauseTip" class="pause-tip">
        <text>⏸️ 适时停顿可以让听众思考</text>
      </view>

      <!-- 操作按钮 -->
      <view class="action-buttons">
        <button class="cancel-btn" @click="cancelPractice">取消</button>
        <button class="complete-btn" @click="finishPractice">完成练习</button>
      </view>
    </view>

    <!-- 完成弹窗 -->
    <view v-if="showCompleteModal" class="modal-overlay">
      <view class="modal-content complete-modal">
        <view class="complete-icon">🎉</view>
        <text class="complete-title">练习完成！</text>
        
        <view class="score-section">
          <text class="score-label">综合得分</text>
          <text class="score-value">{{ finalScore }}</text>
        </view>
        
        <view class="ability-scores">
          <view class="score-item">
            <text>清晰度</text>
            <text class="item-value">{{ abilityScores.clarity }}</text>
          </view>
          <view class="score-item">
            <text>自信度</text>
            <text class="item-value">{{ abilityScores.confidence }}</text>
          </view>
          <view class="score-item">
            <text>表达力</text>
            <text class="item-value">{{ abilityScores.expression }}</text>
          </view>
          <view class="score-item">
            <text>结构化</text>
            <text class="item-value">{{ abilityScores.structure }}</text>
          </view>
        </view>
        
        <view class="practice-stats">
          <text>练习时长: {{ formatTime(totalTime) }}</text>
          <text>获得积分: +{{ earnedPoints }}</text>
        </view>
        
        <view class="complete-actions">
          <button class="re-record-btn" @click="reRecord">重新录制</button>
          <button class="close-btn" @click="closeComplete">关闭</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { usePublicSpeakingStore } from '@/stores/publicSpeakingStore.js'

const store = usePublicSpeakingStore()

// 状态
const isPracticing = ref(false)
const practiceMode = ref(null)
const isRecording = ref(false)
const currentTime = ref(0)
const targetDuration = ref(60)
const currentPartIndex = ref(0)
const showCompleteModal = ref(false)
const finalScore = ref(0)
const totalTime = ref(0)
const pacingLevel = ref(50)
const showPauseTip = ref(false)

// 数据
const currentTemplate = ref(null)
const abilityScores = ref({ clarity: 0, confidence: 0, expression: 0, structure: 0 })
const earnedPoints = ref(0)

// 计时器
let timerInterval = null

// 计算属性
const currentPartName = computed(() => {
  if (!currentTemplate.value) return ''
  return currentTemplate.value.structure[currentPartIndex.value]?.part || ''
})

const currentPartContent = computed(() => {
  if (!currentTemplate.value) return ''
  return currentTemplate.value.structure[currentPartIndex.value]?.content || ''
})

const timerProgress = computed(() => {
  return Math.min((currentTime.value / targetDuration.value) * 100, 100)
})

const currentPacing = computed(() => {
  if (pacingLevel.value < 35) return '慢速'
  if (pacingLevel.value < 70) return '中速'
  return '快速'
})

// 方法
const goBack = () => {
  if (isPracticing.value) {
    uni.showModal({
      title: '提示',
      content: '练习进行中，确定要退出吗？',
      success: (res) => {
        if (res.confirm) {
          stopPractice()
          uni.navigateBack()
        }
      }
    })
  } else {
    uni.navigateBack()
  }
}

const startPractice = (mode) => {
  practiceMode.value = mode
  
  if (mode === 'template') {
    // 从URL参数或选择器获取模板
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]
    const templateId = currentPage?.options?.templateId
    
    if (templateId) {
      currentTemplate.value = store.getTemplate(templateId)
      if (currentTemplate.value) {
        targetDuration.value = currentTemplate.value.duration
      }
    }
    
    if (!currentTemplate.value) {
      uni.showToast({ title: '请先选择模板', icon: 'none' })
      return
    }
  } else if (mode === 'free') {
    targetDuration.value = 120
  } else if (mode === 'pacing') {
    targetDuration.value = 60
    pacingLevel.value = 50
  } else if (mode === 'pause') {
    targetDuration.value = 60
  }
  
  isPracticing.value = true
  currentTime.value = 0
  currentPartIndex.value = 0
  
  // 开始计时
  timerInterval = setInterval(() => {
    currentTime.value++
    
    // 语速训练模式模拟
    if (practiceMode.value === 'pacing' && isRecording.value) {
      // 模拟语速变化
      pacingLevel.value = Math.max(10, Math.min(90, pacingLevel.value + (Math.random() - 0.5) * 10))
    }
    
    // 停顿训练提示
    if (practiceMode.value === 'pause' && currentTime.value > 0 && currentTime.value % 15 === 0) {
      showPauseTip.value = true
      setTimeout(() => {
        showPauseTip.value = false
      }, 3000)
    }
  }, 1000)
}

const toggleRecording = () => {
  isRecording.value = !isRecording.value
  
  if (isRecording.value) {
    uni.showToast({ title: '开始录音', icon: 'none' })
  } else {
    // 自动切换到下一部分（模板模式）
    if (practiceMode.value === 'template' && currentTemplate.value) {
      if (currentPartIndex.value < currentTemplate.value.structure.length - 1) {
        currentPartIndex.value++
      }
    }
  }
}

const cancelPractice = () => {
  stopPractice()
  uni.navigateBack()
}

const stopPractice = () => {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
  isPracticing.value = false
  isRecording.value = false
  practiceMode.value = null
}

const finishPractice = () => {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
  
  totalTime.value = currentTime.value
  
  // 计算得分（模拟）
  if (practiceMode.value === 'template') {
    // 模板模式：根据完成度评分
    const completionRate = (currentPartIndex.value + 1) / currentTemplate.value.structure.length
    finalScore.value = Math.round(60 + completionRate * 40)
  } else {
    // 自由模式：根据时长评分
    finalScore.value = currentTime.value >= 30 ? Math.round(70 + Math.random() * 30) : Math.round(currentTime.value * 2)
  }
  
  // 能力评分
  abilityScores.value = {
    clarity: Math.round(finalScore.value * (0.8 + Math.random() * 0.4)),
    confidence: Math.round(finalScore.value * (0.8 + Math.random() * 0.4)),
    expression: Math.round(finalScore.value * (0.8 + Math.random() * 0.4)),
    structure: practiceMode.value === 'template' ? finalScore.value : Math.round(finalScore.value * 0.7)
  }
  
  // 计算积分
  earnedPoints.value = Math.floor(finalScore.value / 10)
  
  // 保存结果
  if (practiceMode.value === 'template' && currentTemplate.value) {
    store.completePractice(currentTemplate.value.id, finalScore.value, {
      duration: totalTime.value,
      ...abilityScores.value
    })
  }
  
  isRecording.value = false
  showCompleteModal.value = true
}

const reRecord = () => {
  showCompleteModal.value = false
  startPractice(practiceMode.value)
}

const closeComplete = () => {
  showCompleteModal.value = false
  uni.navigateBack()
}

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

onMounted(() => {
  store.init()
})

onUnmounted(() => {
  if (timerInterval) {
    clearInterval(timerInterval)
  }
})
</script>

<style scoped>
.practice-page {
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

/* 模式选择 */
.mode-selection {
  padding: 30rpx;
}

.mode-header {
  margin-bottom: 24rpx;
}

.mode-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.mode-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.mode-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 40rpx 30rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.3s;
}

.mode-card:active {
  background: #f0f0f0;
  transform: scale(0.98);
}

.mode-icon {
  font-size: 64rpx;
  margin-bottom: 16rpx;
}

.mode-name {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.mode-desc {
  font-size: 24rpx;
  color: #999;
}

/* 练习中界面 */
.practicing-area {
  padding: 30rpx;
}

.timer-section {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 24rpx;
  text-align: center;
}

.timer-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  margin-bottom: 20rpx;
}

.timer-icon {
  font-size: 40rpx;
}

.timer-value {
  font-size: 72rpx;
  font-weight: bold;
  color: #667eea;
  font-variant-numeric: tabular-nums;
}

.timer-progress {
  height: 8rpx;
  background: #eee;
  border-radius: 4rpx;
  overflow: hidden;
  margin-bottom: 12rpx;
}

.timer-bar {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s;
}

.timer-target {
  font-size: 24rpx;
  color: #999;
}

/* 模板内容 */
.template-content {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 24rpx;
}

.current-part {
  margin-bottom: 20rpx;
}

.part-label {
  font-size: 24rpx;
  color: #999;
  display: block;
  margin-bottom: 4rpx;
}

.part-name {
  font-size: 36rpx;
  font-weight: bold;
  color: #667eea;
}

.part-guidance {
  background: #f8f9fa;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
}

.guidance-text {
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
}

.structure-progress {
  display: flex;
  justify-content: center;
  gap: 16rpx;
}

.progress-dot {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background: #eee;
  color: #999;
  font-size: 22rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.progress-dot.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.progress-dot.completed {
  background: #52c41a;
  color: #fff;
}

/* 自由内容 */
.free-content {
  background: #fff;
  border-radius: 20rpx;
  padding: 60rpx 30rpx;
  margin-bottom: 24rpx;
  text-align: center;
}

.practice-hint {
  font-size: 32rpx;
  color: #667eea;
  margin-bottom: 40rpx;
}

.speaking-area {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.speaking-icon {
  font-size: 100rpx;
  margin-bottom: 20rpx;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.speaking-status {
  font-size: 28rpx;
  color: #999;
}

/* 录音控制 */
.record-controls {
  display: flex;
  justify-content: center;
  margin-bottom: 24rpx;
}

.record-btn {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.record-btn.recording {
  background: linear-gradient(135deg, #f5222d 0%, #fa8c16 100%);
  animation: pulse-record 1s infinite;
}

@keyframes pulse-record {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.record-icon {
  font-size: 48rpx;
  margin-bottom: 8rpx;
}

.record-text {
  font-size: 24rpx;
  color: #fff;
}

/* 语速指示器 */
.pacing-indicator {
  background: #fff;
  border-radius: 20rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
}

.pacing-bar {
  height: 16rpx;
  background: linear-gradient(90deg, #52c41a 0%, #faad14 50%, #f5222d 100%);
  border-radius: 8rpx;
  overflow: hidden;
  margin-bottom: 8rpx;
}

.pacing-level {
  height: 100%;
  background: #fff;
  width: 50%;
  transition: width 0.3s;
}

.pacing-labels {
  display: flex;
  justify-content: space-between;
  font-size: 22rpx;
  color: #999;
}

/* 暂停提示 */
.pause-tip {
  background: rgba(102, 126, 234, 0.1);
  border-radius: 12rpx;
  padding: 16rpx;
  text-align: center;
  margin-bottom: 24rpx;
}

.pause-tip text {
  font-size: 26rpx;
  color: #667eea;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  gap: 20rpx;
}

.cancel-btn {
  flex: 1;
  height: 88rpx;
  background: #fff;
  border-radius: 44rpx;
  font-size: 32rpx;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
}

.complete-btn {
  flex: 2;
  height: 88rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 44rpx;
  font-size: 32rpx;
  font-weight: bold;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 完成弹窗 */
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

.complete-modal {
  background: #fff;
  border-radius: 30rpx;
  width: 80%;
  padding: 40rpx 30rpx;
  text-align: center;
}

.complete-icon {
  font-size: 100rpx;
  margin-bottom: 20rpx;
}

.complete-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 30rpx;
}

.score-section {
  margin-bottom: 30rpx;
}

.score-label {
  font-size: 26rpx;
  color: #999;
  display: block;
  margin-bottom: 8rpx;
}

.score-value {
  font-size: 80rpx;
  font-weight: bold;
  color: #667eea;
}

.ability-scores {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
  margin-bottom: 30rpx;
}

.score-item {
  display: flex;
  justify-content: space-between;
  padding: 12rpx 16rpx;
  background: #f5f5f5;
  border-radius: 8rpx;
  font-size: 24rpx;
  color: #666;
}

.item-value {
  font-weight: bold;
  color: #667eea;
}

.practice-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 30rpx;
  font-size: 24rpx;
  color: #999;
}

.complete-actions {
  display: flex;
  gap: 20rpx;
}

.re-record-btn {
  flex: 1;
  height: 80rpx;
  background: #fff;
  border: 2rpx solid #667eea;
  border-radius: 40rpx;
  font-size: 28rpx;
  color: #667eea;
}

.close-btn {
  flex: 1;
  height: 80rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 40rpx;
  font-size: 28rpx;
  color: #fff;
}
</style>
