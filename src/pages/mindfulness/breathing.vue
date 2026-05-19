<template>
  <view class="breathing-page">
    <!-- 顶部导航 -->
    <view class="nav-header">
      <text class="back-btn" @click="goBack">‹</text>
      <text class="nav-title">呼吸训练</text>
      <text class="nav-placeholder"></text>
    </view>

    <!-- 类型筛选 -->
    <view class="filter-section">
      <view
        v-for="type in breathingTypes"
        :key="type.value"
        class="filter-tag"
        :class="{ active: selectedType === type.value }"
        :style="selectedType === type.value ? { background: type.color } : {}"
        @click="filterByType(type.value)"
      >
        {{ type.icon }} {{ type.label }}
      </view>
    </view>

    <!-- 呼吸训练列表 -->
    <view class="breathing-list">
      <view
        v-for="breathing in filteredBreathings"
        :key="breathing.id"
        class="breathing-card"
        @click="selectBreathing(breathing)"
      >
        <view class="breathing-header">
          <view class="type-badge" :style="{ background: getTypeInfo(breathing.type).color }">
            {{ getTypeInfo(breathing.type).icon }} {{ getTypeInfo(breathing.type).label }}
          </view>
          <view v-if="getProgress(breathing.id).completed" class="completed-badge">
            ✓ 已完成
          </view>
        </view>
        <text class="breathing-title">{{ breathing.title }}</text>
        <text class="breathing-desc">{{ breathing.description }}</text>
        <view class="breathing-footer">
          <text class="rhythm-tag">吸气{{ breathing.inhale }}s · 屏息{{ breathing.hold }}s · 呼气{{ breathing.exhale }}s</text>
          <text class="cycles-tag">{{ breathing.cycles }}圈</text>
        </view>
      </view>

      <view v-if="filteredBreathings.length === 0" class="empty-state">
        <text>暂无呼吸训练</text>
      </view>
    </view>

    <!-- 呼吸训练详情弹窗 -->
    <view v-if="showBreathingModal" class="modal-overlay" @click="closeModal">
      <view class="modal-content breathing-modal" @click.stop>
        <view class="modal-header">
          <text class="modal-title">{{ currentBreathing.title }}</text>
          <text class="modal-close" @click="closeModal">×</text>
        </view>

        <view class="breathing-info">
          <view class="info-badge">
            {{ getTypeInfo(currentBreathing.type).icon }}
            {{ getTypeInfo(currentBreathing.type).label }}
          </view>
          <text class="info-rhythm">
            {{ currentBreathing.inhale }}s - {{ currentBreathing.hold }}s - {{ currentBreathing.exhale }}s
          </text>
        </view>

        <view class="steps-preview">
          <text class="steps-title">练习步骤</text>
          <view v-for="(step, index) in currentBreathing.steps" :key="index" class="step-item">
            <text class="step-num">{{ index + 1 }}</text>
            <text class="step-text">{{ step }}</text>
          </view>
        </view>

        <view class="modal-actions">
          <button class="action-btn start" @click="startBreathing">
            开始练习
          </button>
        </view>
      </view>
    </view>

    <!-- 呼吸训练进行中 -->
    <view v-if="isBreathing" class="breathing-session">
      <view class="session-header">
        <text class="session-title">{{ currentBreathing.title }}</text>
        <view class="session-progress">
          <text>第 {{ currentCycle }} 圈 / 共 {{ currentBreathing.cycles }} 圈</text>
        </view>
      </view>

      <!-- 呼吸动画圆圈 -->
      <view class="breath-circle-container">
        <view class="breath-circle" :class="breathPhase"></view>
        <view class="breath-inner">
          <text class="breath-phase-text">{{ phaseText }}</text>
          <text class="breath-count">{{ count }}</text>
        </view>
      </view>

      <!-- 当前阶段 -->
      <view class="phase-indicator">
        <view class="phase-item" :class="{ active: breathPhase === 'inhale' }">
          <text>吸气</text>
          <text class="phase-time">{{ currentBreathing.inhale }}s</text>
        </view>
        <view class="phase-item" :class="{ active: breathPhase === 'hold' }">
          <text>屏息</text>
          <text class="phase-time">{{ currentBreathing.hold }}s</text>
        </view>
        <view class="phase-item" :class="{ active: breathPhase === 'exhale' }">
          <text>呼气</text>
          <text class="phase-time">{{ currentBreathing.exhale }}s</text>
        </view>
      </view>

      <!-- 进度条 -->
      <view class="progress-bar-container">
        <view class="progress-bar" :style="{ width: progressPercent + '%' }"></view>
      </view>

      <!-- 控制按钮 -->
      <view class="session-controls">
        <button class="control-btn quit" @click="quitBreathing">结束练习</button>
      </view>
    </view>

    <!-- 完成弹窗 -->
    <view v-if="showCompleteModal" class="modal-overlay">
      <view class="modal-content complete-modal">
        <text class="complete-icon">🎉</text>
        <text class="complete-title">练习完成！</text>
        <text class="complete-stats">完成 {{ completedCycles }} 圈</text>
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
import { BREATHING_TYPE_INFO, BREATHING_TYPE } from '@/stores/mindfulnessStore.js'

export default {
  data() {
    return {
      selectedType: null,
      showBreathingModal: false,
      currentBreathing: null,
      isBreathing: false,
      breathPhase: 'inhale', // inhale, hold, exhale
      phaseText: '吸气',
      count: 0,
      currentCycle: 1,
      progressPercent: 0,
      breathTimer: null,
      countTimer: null,
      showCompleteModal: false,
      earnedScore: 0,
      completedCycles: 0
    }
  },
  computed: {
    mgStore() {
      return useMindfulnessStore()
    },
    breathingTypes() {
      return Object.values(BREATHING_TYPE).map(type => ({
        value: type,
        ...BREATHING_TYPE_INFO[type]
      }))
    },
    filteredBreathings() {
      if (!this.selectedType) {
        return this.mgStore.breathingExercises
      }
      return this.mgStore.breathingExercises.filter(b => b.type === this.selectedType)
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
      return BREATHING_TYPE_INFO[type] || {}
    },
    filterByType(type) {
      this.selectedType = this.selectedType === type ? null : type
    },
    getProgress(breathingId) {
      return this.mgStore.getBreathingProgress(breathingId)
    },
    selectBreathing(breathing) {
      this.currentBreathing = breathing
      this.showBreathingModal = true
    },
    closeModal() {
      this.showBreathingModal = false
      this.currentBreathing = null
    },
    startBreathing() {
      this.showBreathingModal = false
      this.isBreathing = true
      this.currentCycle = 1
      this.progressPercent = 0
      this.startBreathCycle()
    },
    startBreathCycle() {
      const b = this.currentBreathing
      let phase = 'inhale'
      this.breathPhase = 'inhale'
      this.phaseText = '吸气'
      this.count = b.inhale

      // Inhale phase
      this.countTimer = setInterval(() => {
        if (this.count > 1) {
          this.count--
        }
      }, 1000)

      this.breathTimer = setTimeout(() => {
        clearInterval(this.countTimer)
        // Hold phase
        if (b.hold > 0) {
          phase = 'hold'
          this.breathPhase = 'hold'
          this.phaseText = '屏息'
          this.count = b.hold
          this.countTimer = setInterval(() => {
            if (this.count > 1) {
              this.count--
            }
          }, 1000)
          this.breathTimer = setTimeout(() => {
            clearInterval(this.countTimer)
            // Exhale phase
            this.breathPhase = 'exhale'
            this.phaseText = '呼气'
            this.count = b.exhale
            this.countTimer = setInterval(() => {
              if (this.count > 1) {
                this.count--
              }
            }, 1000)
            this.breathTimer = setTimeout(() => {
              clearInterval(this.countTimer)
              // Cycle complete
              this.currentCycle++
              if (this.currentCycle <= b.cycles) {
                this.updateProgress()
                this.startBreathCycle()
              } else {
                this.completeBreathing()
              }
            }, b.exhale * 1000)
          }, b.hold * 1000)
        } else {
          // No hold phase, go directly to exhale
          this.breathPhase = 'exhale'
          this.phaseText = '呼气'
          this.count = b.exhale
          this.countTimer = setInterval(() => {
            if (this.count > 1) {
              this.count--
            }
          }, 1000)
          this.breathTimer = setTimeout(() => {
            clearInterval(this.countTimer)
            // Cycle complete
            this.currentCycle++
            if (this.currentCycle <= b.cycles) {
              this.updateProgress()
              this.startBreathCycle()
            } else {
              this.completeBreathing()
            }
          }, b.exhale * 1000)
        }
      }, b.inhale * 1000)
    },
    updateProgress() {
      const totalPhases = this.currentBreathing.cycles
      this.progressPercent = ((this.currentCycle - 1) / totalPhases) * 100
    },
    clearTimers() {
      if (this.breathTimer) {
        clearTimeout(this.breathTimer)
        this.breathTimer = null
      }
      if (this.countTimer) {
        clearInterval(this.countTimer)
        this.countTimer = null
      }
    },
    quitBreathing() {
      this.clearTimers()
      this.isBreathing = false
      this.breathPhase = 'inhale'
    },
    completeBreathing() {
      this.clearTimers()
      this.completedCycles = this.currentBreathing.cycles
      const result = this.mgStore.completeBreathing(
        this.currentBreathing.id,
        this.completedCycles
      )
      this.earnedScore = result?.score || 1
      this.isBreathing = false
      this.showCompleteModal = true
    },
    closeCompleteModal() {
      this.showCompleteModal = false
      this.currentBreathing = null
      this.completedCycles = 0
      this.earnedScore = 0
    }
  }
}
</script>

<style scoped>
.breathing-page {
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

.breathing-list {
  padding-bottom: 40rpx;
}

.breathing-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.breathing-header {
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

.breathing-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 10rpx;
}

.breathing-desc {
  font-size: 26rpx;
  color: #666;
  display: block;
  margin-bottom: 16rpx;
}

.breathing-footer {
  display: flex;
  gap: 20rpx;
}

.rhythm-tag, .cycles-tag {
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

.breathing-info {
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

.info-rhythm {
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

/* Breathing session */
.breathing-session {
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

.breath-circle-container {
  width: 400rpx;
  height: 400rpx;
  margin: 60rpx auto;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.breath-circle {
  width: 200rpx;
  height: 200rpx;
  border-radius: 50%;
  background: rgba(82, 196, 26, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 1s ease-in-out;
}

.breath-circle.inhale {
  width: 350rpx;
  height: 350rpx;
  background: rgba(82, 196, 26, 0.5);
}

.breath-circle.hold {
  width: 350rpx;
  height: 350rpx;
  background: rgba(24, 144, 255, 0.5);
}

.breath-circle.exhale {
  width: 200rpx;
  height: 200rpx;
  background: rgba(114, 46, 209, 0.3);
}

.breath-inner {
  position: absolute;
  text-align: center;
}

.breath-phase-text {
  font-size: 36rpx;
  color: #2d5a5a;
  display: block;
  font-weight: bold;
}

.breath-count {
  font-size: 72rpx;
  color: #2d5a5a;
  display: block;
  margin-top: 10rpx;
}

.phase-indicator {
  display: flex;
  justify-content: center;
  gap: 40rpx;
  margin: 40rpx 0;
}

.phase-item {
  text-align: center;
  opacity: 0.5;
  transition: opacity 0.3s;
}

.phase-item.active {
  opacity: 1;
}

.phase-item text:first-child {
  font-size: 28rpx;
  color: #2d5a5a;
  display: block;
}

.phase-time {
  font-size: 24rpx;
  color: rgba(45, 90, 90, 0.6);
}

.progress-bar-container {
  width: 80%;
  height: 16rpx;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 8rpx;
  margin: 40rpx auto;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: #52c41a;
  border-radius: 8rpx;
  transition: width 0.3s;
}

.session-controls {
  display: flex;
  justify-content: center;
  margin-top: 60rpx;
}

.control-btn.quit {
  padding: 24rpx 60rpx;
  border-radius: 50rpx;
  background: transparent;
  border: 2rpx solid rgba(45, 90, 90, 0.3);
  color: rgba(45, 90, 90, 0.6);
  font-size: 28rpx;
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

.complete-stats {
  font-size: 28rpx;
  color: #666;
  display: block;
  margin-bottom: 8rpx;
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
