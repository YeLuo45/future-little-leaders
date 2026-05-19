<template>
  <view class="meditation-page">
    <!-- 顶部导航 -->
    <view class="nav-header">
      <text class="back-btn" @click="goBack">‹</text>
      <text class="nav-title">冥想练习</text>
      <text class="nav-placeholder"></text>
    </view>

    <!-- 类型筛选 -->
    <view class="filter-section">
      <view
        v-for="type in meditationTypes"
        :key="type.value"
        class="filter-tag"
        :class="{ active: selectedType === type.value }"
        :style="selectedType === type.value ? { background: type.color } : {}"
        @click="filterByType(type.value)"
      >
        {{ type.icon }} {{ type.label }}
      </view>
    </view>

    <!-- 冥想列表 -->
    <view class="meditations-list">
      <view
        v-for="meditation in filteredMeditations"
        :key="meditation.id"
        class="meditation-card"
        @click="selectMeditation(meditation)"
      >
        <view class="meditation-header">
          <view class="type-badge" :style="{ background: getTypeInfo(meditation.type).color }">
            {{ getTypeInfo(meditation.type).icon }} {{ getTypeInfo(meditation.type).label }}
          </view>
          <view v-if="getProgress(meditation.id).completed" class="completed-badge">
            ✓ 已完成
          </view>
        </view>
        <text class="meditation-title">{{ meditation.title }}</text>
        <text class="meditation-desc">{{ meditation.description }}</text>
        <view class="meditation-footer">
          <text class="duration-tag">⏱ {{ formatDuration(meditation.duration) }}</text>
          <text class="difficulty-tag">难度: {{ meditation.difficulty }}</text>
        </view>
      </view>

      <view v-if="filteredMeditations.length === 0" class="empty-state">
        <text>暂无冥想练习</text>
      </view>
    </view>

    <!-- 冥想详情弹窗 -->
    <view v-if="showMeditationModal" class="modal-overlay" @click="closeModal">
      <view class="modal-content meditation-modal" @click.stop>
        <view class="modal-header">
          <text class="modal-title">{{ currentMeditation.title }}</text>
          <text class="modal-close" @click="closeModal">×</text>
        </view>

        <view class="meditation-info">
          <view class="info-badge">
            {{ getTypeInfo(currentMeditation.type).icon }}
            {{ getTypeInfo(currentMeditation.type).label }}
          </view>
          <text class="info-duration">⏱ {{ formatDuration(currentMeditation.duration) }}</text>
        </view>

        <view class="steps-preview">
          <text class="steps-title">冥想步骤</text>
          <view v-for="(step, index) in currentMeditation.steps" :key="index" class="step-item">
            <text class="step-num">{{ index + 1 }}</text>
            <text class="step-text">{{ step }}</text>
          </view>
        </view>

        <view class="modal-actions">
          <button class="action-btn start" @click="startMeditation">
            开始冥想
          </button>
        </view>
      </view>
    </view>

    <!-- 冥想进行中 -->
    <view v-if="isMeditating" class="meditation-session">
      <view class="session-header">
        <text class="session-title">{{ currentMeditation.title }}</text>
        <view class="session-progress">
          <text>第 {{ currentStep + 1 }} 步 / 共 {{ currentMeditation.steps.length }} 步</text>
        </view>
      </view>

      <!-- 圆形进度 -->
      <view class="circle-progress">
        <view class="circle-bg"></view>
        <view
          class="circle-fill"
          :style="{ transform: `rotate(${progressAngle}deg)` }"
        ></view>
        <view class="circle-content">
          <text class="step-number">{{ currentStep + 1 }}</text>
          <text class="step-total">/ {{ currentMeditation.steps.length }}</text>
        </view>
      </view>

      <!-- 步骤内容 -->
      <view class="step-content">
        <text class="step-text">{{ currentMeditation.steps[currentStep] }}</text>
      </view>

      <!-- 呼吸提示 -->
      <view class="breath-indicator">
        <text class="breath-text">{{ breathText }}</text>
      </view>

      <!-- 控制按钮 -->
      <view class="session-controls">
        <button class="control-btn prev" @click="prevStep" :disabled="currentStep === 0">
          ← 上一步
        </button>
        <button class="control-btn next" @click="nextStep">
          {{ currentStep === currentMeditation.steps.length - 1 ? '完成' : '下一步' }}
        </button>
      </view>

      <button class="quit-btn" @click="quitMeditation">结束冥想</button>
    </view>

    <!-- 完成弹窗 -->
    <view v-if="showCompleteModal" class="modal-overlay">
      <view class="modal-content complete-modal">
        <text class="complete-icon">🎉</text>
        <text class="complete-title">冥想完成！</text>
        <text class="complete-score">获得 {{ earnedScore }} 积分</text>
        <view class="complete-actions">
          <button class="action-btn" @click="closeCompleteModal">继续</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { useMindfulnessStore } from '@/stores/mindfulnessStore.js'
import { MEDITATION_TYPE_INFO, MEDITATION_TYPE } from '@/stores/mindfulnessStore.js'

export default {
  data() {
    return {
      selectedType: null,
      showMeditationModal: false,
      currentMeditation: null,
      isMeditating: false,
      currentStep: 0,
      progressAngle: 0,
      breathText: '吸气...',
      breathTimer: null,
      showCompleteModal: false,
      earnedScore: 0,
      meditationTimer: null,
      elapsedSeconds: 0
    }
  },
  computed: {
    mgStore() {
      return useMindfulnessStore()
    },
    meditationTypes() {
      return Object.values(MEDITATION_TYPE).map(type => ({
        value: type,
        ...MEDITATION_TYPE_INFO[type]
      }))
    },
    filteredMeditations() {
      if (!this.selectedType) {
        return this.mgStore.meditations
      }
      return this.mgStore.meditations.filter(m => m.type === this.selectedType)
    }
  },
  onLoad() {
    this.mgStore.init()
  },
  onUnload() {
    this.clearTimers()
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    getTypeInfo(type) {
      return MEDITATION_TYPE_INFO[type] || {}
    },
    filterByType(type) {
      this.selectedType = this.selectedType === type ? null : type
    },
    formatDuration(seconds) {
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${mins}分${secs > 0 ? secs + '秒' : ''}`
    },
    getProgress(meditationId) {
      return this.mgStore.getMeditationProgress(meditationId)
    },
    selectMeditation(meditation) {
      this.currentMeditation = meditation
      this.showMeditationModal = true
    },
    closeModal() {
      this.showMeditationModal = false
      this.currentMeditation = null
    },
    startMeditation() {
      this.showMeditationModal = false
      this.isMeditating = true
      this.currentStep = 0
      this.elapsedSeconds = 0
      this.startBreathTimer()
      this.startMeditationTimer()
    },
    startBreathTimer() {
      let phase = 'inhale'
      this.breathText = '吸气...'
      this.breathTimer = setInterval(() => {
        if (phase === 'inhale') {
          phase = 'exhale'
          this.breathText = '呼气...'
        } else {
          phase = 'inhale'
          this.breathText = '吸气...'
        }
      }, 4000)
    },
    startMeditationTimer() {
      this.meditationTimer = setInterval(() => {
        this.elapsedSeconds++
        this.progressAngle = (this.currentStep / this.currentMeditation.steps.length) * 360
      }, 1000)
    },
    clearTimers() {
      if (this.breathTimer) {
        clearInterval(this.breathTimer)
        this.breathTimer = null
      }
      if (this.meditationTimer) {
        clearInterval(this.meditationTimer)
        this.meditationTimer = null
      }
    },
    prevStep() {
      if (this.currentStep > 0) {
        this.currentStep--
        this.updateProgress()
      }
    },
    nextStep() {
      if (this.currentStep < this.currentMeditation.steps.length - 1) {
        this.currentStep++
        this.updateProgress()
      } else {
        this.completeMeditation()
      }
    },
    updateProgress() {
      this.progressAngle = (this.currentStep / this.currentMeditation.steps.length) * 360
    },
    quitMeditation() {
      this.clearTimers()
      this.isMeditating = false
      this.currentStep = 0
      this.progressAngle = 0
    },
    completeMeditation() {
      this.clearTimers()
      const result = this.mgStore.completeMeditation(
        this.currentMeditation.id,
        this.elapsedSeconds
      )
      this.earnedScore = result?.score || 1
      this.isMeditating = false
      this.showCompleteModal = true
    },
    closeCompleteModal() {
      this.showCompleteModal = false
      this.currentStep = 0
      this.progressAngle = 0
      this.currentMeditation = null
    }
  }
}
</script>

<style scoped>
.meditation-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #a8edea 0%, #fed6e3 100%);
  padding: 20rpx;
}

.nav-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 20rpx;
  margin-bottom: 20rpx;
}

.back-btn {
  font-size: 48rpx;
  color: #2d5a5a;
  padding: 10rpx 20rpx;
}

.nav-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #2d5a5a;
}

.nav-placeholder {
  width: 80rpx;
}

.filter-section {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-bottom: 30rpx;
}

.filter-tag {
  background: rgba(255, 255, 255, 0.5);
  padding: 16rpx 24rpx;
  border-radius: 30rpx;
  font-size: 26rpx;
  color: #2d5a5a;
}

.filter-tag.active {
  color: #fff;
}

.meditations-list {
  padding-bottom: 40rpx;
}

.meditation-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.meditation-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.type-badge {
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  color: #fff;
}

.completed-badge {
  color: #52c41a;
  font-size: 24rpx;
}

.meditation-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 10rpx;
}

.meditation-desc {
  font-size: 26rpx;
  color: #666;
  display: block;
  margin-bottom: 16rpx;
}

.meditation-footer {
  display: flex;
  gap: 20rpx;
}

.duration-tag, .difficulty-tag {
  font-size: 24rpx;
  color: #999;
}

.empty-state {
  text-align: center;
  padding: 60rpx;
  color: #999;
  font-size: 28rpx;
}

/* Modal styles */
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
  z-index: 1000;
}

.modal-content {
  background: #fff;
  border-radius: 30rpx;
  padding: 40rpx;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.modal-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.modal-close {
  font-size: 50rpx;
  color: #999;
  padding: 10rpx;
}

.meditation-info {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 30rpx;
}

.info-badge {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
  padding: 10rpx 20rpx;
  border-radius: 20rpx;
  font-size: 26rpx;
  color: #2d5a5a;
}

.info-duration {
  font-size: 28rpx;
  color: #666;
}

.steps-preview {
  margin-bottom: 30rpx;
}

.steps-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 20rpx;
}

.step-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 16rpx;
}

.step-num {
  width: 40rpx;
  height: 40rpx;
  background: #a8edea;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  color: #2d5a5a;
  margin-right: 16rpx;
  flex-shrink: 0;
}

.step-text {
  font-size: 26rpx;
  color: #666;
  flex: 1;
  line-height: 1.5;
}

.modal-actions {
  display: flex;
  justify-content: center;
}

.action-btn {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
  color: #2d5a5a;
  font-size: 32rpx;
  font-weight: bold;
  padding: 24rpx 60rpx;
  border-radius: 50rpx;
  border: none;
}

.action-btn.start {
  background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%);
  color: #fff;
}

/* Meditation session */
.meditation-session {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(180deg, #a8edea 0%, #fed6e3 100%);
  padding: 40rpx;
  z-index: 900;
}

.session-header {
  text-align: center;
  margin-bottom: 40rpx;
}

.session-title {
  font-size: 40rpx;
  font-weight: bold;
  color: #2d5a5a;
  display: block;
}

.session-progress {
  margin-top: 16rpx;
}

.session-progress text {
  font-size: 28rpx;
  color: rgba(45, 90, 90, 0.8);
}

.circle-progress {
  width: 300rpx;
  height: 300rpx;
  margin: 40rpx auto;
  position: relative;
}

.circle-bg {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
}

.circle-fill {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: conic-gradient(#52c41a 0deg, transparent 0deg);
  transition: transform 0.3s;
}

.circle-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.step-number {
  font-size: 72rpx;
  font-weight: bold;
  color: #2d5a5a;
  display: block;
}

.step-total {
  font-size: 28rpx;
  color: rgba(45, 90, 90, 0.8);
}

.step-content {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 20rpx;
  padding: 40rpx;
  margin: 40rpx 20rpx;
  text-align: center;
}

.step-text {
  font-size: 32rpx;
  color: #333;
  line-height: 1.6;
}

.breath-indicator {
  text-align: center;
  margin: 30rpx;
}

.breath-text {
  font-size: 36rpx;
  color: #2d5a5a;
  opacity: 0.7;
}

.session-controls {
  display: flex;
  justify-content: space-around;
  margin-top: 40rpx;
}

.control-btn {
  padding: 24rpx 50rpx;
  border-radius: 50rpx;
  font-size: 30rpx;
  border: none;
}

.control-btn.prev {
  background: rgba(255, 255, 255, 0.5);
  color: #2d5a5a;
}

.control-btn.next {
  background: #52c41a;
  color: #fff;
}

.control-btn:disabled {
  opacity: 0.5;
}

.quit-btn {
  display: block;
  margin: 40rpx auto 0;
  background: transparent;
  border: none;
  color: rgba(45, 90, 90, 0.6);
  font-size: 28rpx;
  padding: 20rpx;
}

/* Complete modal */
.complete-modal {
  text-align: center;
}

.complete-icon {
  font-size: 100rpx;
  display: block;
  margin-bottom: 20rpx;
}

.complete-title {
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 16rpx;
}

.complete-score {
  font-size: 32rpx;
  color: #52c41a;
  display: block;
  margin-bottom: 30rpx;
}

.complete-actions {
  display: flex;
  justify-content: center;
}
</style>
