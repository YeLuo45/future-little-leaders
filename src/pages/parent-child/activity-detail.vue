<template>
  <view class="activity-detail-page">
    <!-- 顶部导航 -->
    <view class="nav-header">
      <view class="back-btn" @click="goBack">
        <text class="icon">←</text>
      </view>
      <text class="nav-title">活动详情</text>
      <view class="right-btn" @click="shareActivity">
        <text class="icon">📤</text>
      </view>
    </view>

    <!-- 活动信息 -->
    <view v-if="activity" class="activity-header">
      <view class="header-image" :style="{ backgroundColor: getTypeColor(activity.type) }">
        <text class="header-icon">{{ getTypeIcon(activity.type) }}</text>
      </view>
      <view class="header-info">
        <text class="activity-title">{{ activity.title }}</text>
        <text class="activity-desc">{{ activity.description }}</text>
        <view class="activity-meta">
          <view class="meta-tag">
            <text>{{ getAgeLabel(activity.ageGroup) }}</text>
          </view>
          <view class="meta-tag">
            <text>{{ activity.duration }}分钟</text>
          </view>
          <view class="meta-tag">
            <text>{{ getDifficultyLabel(activity.difficulty) }}</text>
          </view>
          <view class="meta-tag highlight">
            <text>+{{ activity.points }}积分</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 材料清单 -->
    <view v-if="activity" class="section materials-section">
      <view class="section-title">
        <text class="title-icon">📦</text>
        <text>材料清单</text>
      </view>
      <view class="materials-list">
        <view 
          v-for="(material, index) in activity.materials" 
          :key="index"
          class="material-item"
        >
          <text class="check-icon">○</text>
          <text class="material-name">{{ material }}</text>
        </view>
      </view>
    </view>

    <!-- 步骤指导 -->
    <view v-if="activity" class="section steps-section">
      <view class="section-title">
        <text class="title-icon">📝</text>
        <text>步骤指导</text>
        <text class="step-indicator">{{ currentStep + 1 }}/{{ activity.steps.length }}</text>
      </view>

      <!-- 步骤卡片 -->
      <view class="step-card">
        <view class="step-progress">
          <view 
            v-for="(step, index) in activity.steps" 
            :key="index"
            :class="['progress-dot', { 
              active: index === currentStep,
              completed: step.completed 
            }]"
            @click="goToStep(index)"
          ></view>
        </view>

        <view class="step-content">
          <view class="step-number">步骤 {{ currentStep + 1 }}</view>
          <text class="step-text">{{ currentStepData?.content }}</text>

          <!-- 计时器 -->
          <view v-if="currentStepData?.timer > 0" class="timer-section">
            <view v-if="!timerRunning" class="timer-display">
              <text class="timer-icon">⏱️</text>
              <text class="timer-text">{{ formatTime(remainingTime) }}</text>
            </view>
            <view v-else class="timer-display running">
              <text class="timer-icon">⏱️</text>
              <text class="timer-text">{{ formatTime(remainingTime) }}</text>
            </view>
            <view class="timer-controls">
              <view v-if="!timerRunning" class="timer-btn start" @click="startTimer">
                <text>开始计时</text>
              </view>
              <view v-else class="timer-btn stop" @click="stopTimer">
                <text>停止</text>
              </view>
              <view class="timer-btn reset" @click="resetTimer">
                <text>重置</text>
              </view>
            </view>
          </view>

          <!-- 步骤完成按钮 -->
          <view class="step-actions">
            <view 
              v-if="!currentStepData?.completed"
              class="complete-btn"
              @click="markStepComplete"
            >
              <text>✓ 标记完成</text>
            </view>
            <view v-else class="completed-badge">
              <text>✓ 已完成</text>
            </view>
          </view>
        </view>

        <!-- 导航按钮 -->
        <view class="step-nav">
          <view 
            :class="['nav-btn', { disabled: currentStep === 0 }]"
            @click="prevStep"
          >
            <text>上一步</text>
          </view>
          <view 
            v-if="currentStep < activity.steps.length - 1"
            class="nav-btn primary"
            @click="nextStep"
          >
            <text>下一步</text>
          </view>
          <view 
            v-else
            class="nav-btn finish"
            @click="finishActivity"
          >
            <text>完成活动</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 成果记录 -->
    <view v-if="activity" class="section photo-section">
      <view class="section-title">
        <text class="title-icon">📸</text>
        <text>成果记录</text>
      </view>
      <view class="photo-upload" @click="takePhoto">
        <view v-if="photoPath" class="photo-preview">
          <image :src="photoPath" mode="aspectFill" class="preview-image" />
        </view>
        <view v-else class="upload-placeholder">
          <text class="upload-icon">📷</text>
          <text class="upload-text">拍照记录成果</text>
        </view>
      </view>
      <view class="photo-input">
        <input 
          type="text" 
          v-model="creationTitle" 
          placeholder="给成果起个名字..."
          class="title-input"
        />
        <textarea 
          v-model="creationDesc" 
          placeholder="描述一下你们的成果..."
          class="desc-input"
        />
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useActivityStore } from '@/stores/activityStore.js'
import { ACTIVITY_TYPES, AGE_GROUPS } from '@/services/activityService.js'

const activityStore = useActivityStore()

const activity = ref(null)
const currentStep = ref(0)
const photoPath = ref('')
const creationTitle = ref('')
const creationDesc = ref('')

// 计时器
const timerRunning = ref(false)
const remainingTime = ref(0)
let timerInterval = null

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const id = currentPage.options?.id
  
  if (id) {
    activity.value = activityStore.loadActivityDetail(id)
    if (activity.value) {
      currentStep.value = 0
      // 初始化计时器
      if (activity.value.steps[0]?.timer) {
        remainingTime.value = activity.value.steps[0].timer
      }
    }
  }
})

onUnmounted(() => {
  if (timerInterval) {
    clearInterval(timerInterval)
  }
})

const currentStepData = computed(() => {
  if (!activity.value) return null
  return activity.value.steps[currentStep.value] || null
})

const getTypeIcon = (type) => {
  const t = ACTIVITY_TYPES[type]
  return t ? t.icon : '🎯'
}

const getTypeColor = (type) => {
  const t = ACTIVITY_TYPES[type]
  return t ? t.color : '#888'
}

const getAgeLabel = (ageGroup) => {
  const g = AGE_GROUPS[ageGroup]
  return g ? g.name : ageGroup
}

const getDifficultyLabel = (difficulty) => {
  const labels = {
    easy: '简单',
    medium: '中等',
    hard: '困难'
  }
  return labels[difficulty] || difficulty
}

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const startTimer = () => {
  if (timerInterval) clearInterval(timerInterval)
  timerRunning.value = true
  timerInterval = setInterval(() => {
    if (remainingTime.value > 0) {
      remainingTime.value--
    } else {
      stopTimer()
      uni.showToast({ title: '时间到！', icon: 'none' })
    }
  }, 1000)
}

const stopTimer = () => {
  timerRunning.value = false
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

const resetTimer = () => {
  stopTimer()
  if (currentStepData.value?.timer) {
    remainingTime.value = currentStepData.value.timer
  } else {
    remainingTime.value = 0
  }
}

const goToStep = (index) => {
  if (activity.value && index >= 0 && index < activity.value.steps.length) {
    stopTimer()
    currentStep.value = index
    if (activity.value.steps[index]?.timer) {
      remainingTime.value = activity.value.steps[index].timer
    } else {
      remainingTime.value = 0
    }
  }
}

const nextStep = () => {
  if (activity.value && currentStep.value < activity.value.steps.length - 1) {
    stopTimer()
    currentStep.value++
    if (activity.value.steps[currentStep.value]?.timer) {
      remainingTime.value = activity.value.steps[currentStep.value].timer
    } else {
      remainingTime.value = 0
    }
  }
}

const prevStep = () => {
  if (currentStep.value > 0) {
    stopTimer()
    currentStep.value--
    if (activity.value.steps[currentStep.value]?.timer) {
      remainingTime.value = activity.value.steps[currentStep.value].timer
    } else {
      remainingTime.value = 0
    }
  }
}

const markStepComplete = () => {
  if (activity.value) {
    activityStore.completeStep(currentStep.value)
    uni.showToast({ title: '步骤完成！', icon: 'success' })
  }
}

const takePhoto = () => {
  uni.chooseImage({
    count: 1,
    sourceType: ['camera'],
    success: (res) => {
      photoPath.value = res.tempFilePaths[0]
    }
  })
}

const finishActivity = () => {
  if (activity.value) {
    // 保存成果
    if (photoPath.value || creationTitle.value) {
      activityStore.saveCreation({
        activityId: activity.value.id,
        activityTitle: activity.value.title,
        title: creationTitle.value || activity.value.title,
        description: creationDesc.value,
        photo: photoPath.value,
        stepsCompleted: activity.value.steps.filter(s => s.completed).length,
        totalSteps: activity.value.steps.length,
        points: activity.value.points
      })
    }
    
    uni.showModal({
      title: '恭喜完成！',
      content: `获得 ${activity.value.points} 积分！`,
      showCancel: false,
      success: () => {
        uni.navigateBack()
      }
    })
  }
}

const shareActivity = () => {
  if (activity.value) {
    uni.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
  }
}

const goBack = () => {
  uni.navigateBack()
}
</script>

<style scoped>
.activity-detail-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 40rpx;
}

.nav-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 30rpx;
  background: #fff;
  position: sticky;
  top: 0;
  z-index: 100;
}

.back-btn, .right-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
  border-radius: 50%;
}

.nav-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #333;
}

.icon {
  font-size: 32rpx;
}

.activity-header {
  background: #fff;
  margin-bottom: 20rpx;
}

.header-image {
  height: 300rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-icon {
  font-size: 120rpx;
}

.header-info {
  padding: 30rpx;
}

.activity-title {
  font-size: 40rpx;
  font-weight: 700;
  color: #333;
  margin-bottom: 16rpx;
  display: block;
}

.activity-desc {
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
  display: block;
  margin-bottom: 20rpx;
}

.activity-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.meta-tag {
  padding: 10rpx 20rpx;
  background: #f5f5f5;
  border-radius: 20rpx;
  font-size: 24rpx;
  color: #666;
}

.meta-tag.highlight {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.section {
  background: #fff;
  margin: 20rpx;
  border-radius: 20rpx;
  padding: 30rpx;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 24rpx;
}

.title-icon {
  font-size: 36rpx;
}

.section-title text:nth-child(2) {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.step-indicator {
  margin-left: auto;
  font-size: 26rpx;
  color: #999;
}

.materials-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.material-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 16rpx 20rpx;
  background: #f9f9f9;
  border-radius: 12rpx;
}

.check-icon {
  font-size: 28rpx;
  color: #999;
}

.material-name {
  font-size: 28rpx;
  color: #333;
}

.step-card {
  background: #f9f9f9;
  border-radius: 20rpx;
  padding: 30rpx;
}

.step-progress {
  display: flex;
  justify-content: center;
  gap: 12rpx;
  margin-bottom: 30rpx;
}

.progress-dot {
  width: 24rpx;
  height: 24rpx;
  border-radius: 50%;
  background: #ddd;
  transition: all 0.3s;
}

.progress-dot.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  transform: scale(1.2);
}

.progress-dot.completed {
  background: #4CAF50;
}

.step-content {
  text-align: center;
}

.step-number {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 16rpx;
}

.step-text {
  font-size: 32rpx;
  color: #333;
  line-height: 1.6;
  display: block;
  margin-bottom: 30rpx;
}

.timer-section {
  margin: 30rpx 0;
}

.timer-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  padding: 20rpx;
  background: #fff;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
}

.timer-display.running {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.timer-display.running .timer-text {
  color: #fff;
}

.timer-icon {
  font-size: 40rpx;
}

.timer-text {
  font-size: 48rpx;
  font-weight: 700;
  color: #333;
  font-family: monospace;
}

.timer-controls {
  display: flex;
  gap: 20rpx;
  justify-content: center;
}

.timer-btn {
  padding: 16rpx 40rpx;
  border-radius: 30rpx;
  font-size: 28rpx;
}

.timer-btn.start {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.timer-btn.stop {
  background: #f44336;
  color: #fff;
}

.timer-btn.reset {
  background: #f5f5f5;
  color: #666;
}

.step-actions {
  margin: 30rpx 0;
}

.complete-btn {
  padding: 24rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-radius: 12rpx;
  font-size: 32rpx;
  text-align: center;
}

.completed-badge {
  padding: 24rpx;
  background: #4CAF50;
  color: #fff;
  border-radius: 12rpx;
  font-size: 32rpx;
  text-align: center;
}

.step-nav {
  display: flex;
  gap: 20rpx;
  margin-top: 30rpx;
}

.nav-btn {
  flex: 1;
  padding: 24rpx;
  background: #fff;
  color: #666;
  border-radius: 12rpx;
  font-size: 28rpx;
  text-align: center;
}

.nav-btn.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.nav-btn.finish {
  background: #4CAF50;
  color: #fff;
}

.nav-btn.disabled {
  opacity: 0.4;
}

.photo-upload {
  margin-bottom: 20rpx;
}

.photo-preview {
  width: 100%;
  height: 400rpx;
  border-radius: 16rpx;
  overflow: hidden;
}

.preview-image {
  width: 100%;
  height: 100%;
}

.upload-placeholder {
  width: 100%;
  height: 300rpx;
  background: #f5f5f5;
  border-radius: 16rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
}

.upload-icon {
  font-size: 80rpx;
}

.upload-text {
  font-size: 28rpx;
  color: #999;
}

.photo-input {
  margin-top: 20rpx;
}

.title-input {
  width: 100%;
  padding: 24rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
  font-size: 28rpx;
  margin-bottom: 16rpx;
}

.desc-input {
  width: 100%;
  padding: 24rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
  font-size: 28rpx;
  min-height: 150rpx;
}
</style>
