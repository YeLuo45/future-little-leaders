<template>
  <view class="habits-page">
    <!-- 页面标题 -->
    <view class="page-header">
      <text class="page-title">健康习惯</text>
      <view class="header-tip" @click="showTipModal = true">
        <text class="tip-icon">💡</text>
      </view>
    </view>

    <!-- 饮水追踪 -->
    <view class="habit-card water-card">
      <view class="habit-header">
        <view class="habit-title-row">
          <text class="habit-icon">💧</text>
          <text class="habit-title">饮水追踪</text>
        </view>
        <text class="habit-subtitle">今日目标: 8杯水 (2000ml)</text>
      </view>
      
      <view class="water-progress">
        <view class="progress-circle" :style="{ '--percent': store.waterGoalProgress + '%' }">
          <text class="progress-value">{{ store.todayWater.glasses }}</text>
          <text class="progress-unit">杯</text>
        </view>
        <view class="progress-info">
          <text class="progress-amount">{{ store.todayWater.totalMl }}ml</text>
          <text class="progress-target">目标 2000ml</text>
        </view>
      </view>
      
      <view class="water-buttons">
        <view class="water-btn" @click="addWater(250)">
          <text class="btn-icon">🥤</text>
          <text class="btn-text">+250ml</text>
        </view>
        <view class="water-btn" @click="addWater(500)">
          <text class="btn-icon">🫗</text>
          <text class="btn-text">+500ml</text>
        </view>
        <view class="water-btn" @click="addWater(1000)">
          <text class="btn-icon">🪣</text>
          <text class="btn-text">+1000ml</text>
        </view>
      </view>
    </view>

    <!-- 护眼提醒 -->
    <view class="habit-card eye-card">
      <view class="habit-header">
        <view class="habit-title-row">
          <text class="habit-icon">👀</text>
          <text class="habit-title">护眼提醒</text>
        </view>
        <text class="habit-subtitle">每用眼1小时，休息一下</text>
      </view>
      
      <view class="eye-progress">
        <view class="progress-circle eye" :style="{ '--percent': store.eyeBreakGoalProgress + '%' }">
          <text class="progress-value">{{ store.todayEyeBreaks }}</text>
          <text class="progress-unit">次</text>
        </view>
        <view class="progress-info">
          <text class="progress-label">今日护眼休息</text>
          <text class="progress-target">目标 6 次</text>
        </view>
      </view>
      
      <view class="action-button">
        <button class="btn-record" @click="handleEyeBreak">
          <text class="btn-icon">🌿</text>
          <text>记录护眼休息</text>
        </button>
      </view>
    </view>

    <!-- 坐姿提醒 -->
    <view class="habit-card posture-card">
      <view class="habit-header">
        <view class="habit-title-row">
          <text class="habit-icon">🪑</text>
          <text class="habit-title">坐姿提醒</text>
        </view>
        <text class="habit-subtitle">保持正确坐姿，健康成长</text>
      </view>
      
      <view class="posture-stats">
        <view class="posture-score">
          <view class="score-circle" :class="{ good: store.postureScore >= 80, medium: store.postureScore >= 60 && store.postureScore < 80, poor: store.postureScore < 60 }">
            <text class="score-value">{{ store.postureScore }}</text>
            <text class="score-unit">分</text>
          </view>
          <text class="score-label">姿势评分</text>
        </view>
        <view class="posture-details">
          <view class="detail-item">
            <text class="detail-icon good">✓</text>
            <text class="detail-label">正确</text>
            <text class="detail-value">{{ store.todayPosture.goodCount }} 次</text>
          </view>
          <view class="detail-item">
            <text class="detail-icon bad">✗</text>
            <text class="detail-label">不正确</text>
            <text class="detail-value">{{ store.todayPosture.badCount }} 次</text>
          </view>
        </view>
      </view>
      
      <view class="action-buttons">
        <button class="btn-good" @click="handlePosture(true)">
          <text>✓ 姿势正确</text>
        </button>
        <button class="btn-bad" @click="handlePosture(false)">
          <text>✗ 需要调整</text>
        </button>
      </view>
    </view>

    <!-- 任务联动状态 -->
    <view class="integration-card" v-if="store.integrationStatus">
      <text class="integration-title">📋 任务联动</text>
      <view class="integration-list">
        <view class="integration-item">
          <text class="item-icon">{{ store.integrationStatus.hasSleepLog ? '✓' : '○' }}</text>
          <text class="item-text">睡眠记录</text>
          <text class="item-status">{{ store.integrationStatus.hasSleepLog ? '已完成' : '待完成' }}</text>
        </view>
        <view class="integration-item">
          <text class="item-icon">{{ store.integrationStatus.waterGoalMet ? '✓' : '○' }}</text>
          <text class="item-text">饮水目标</text>
          <text class="item-status">{{ store.integrationStatus.waterGoalMet ? '已完成' : '待完成' }}</text>
        </view>
        <view class="integration-item">
          <text class="item-icon">{{ store.integrationStatus.eyeBreaksGoalMet ? '✓' : '○' }}</text>
          <text class="item-text">护眼休息</text>
          <text class="item-status">{{ store.integrationStatus.eyeBreaksGoalMet ? '已完成' : '待完成' }}</text>
        </view>
      </view>
      <view class="points-earned" v-if="store.integrationStatus.sleepPoints > 0">
        <text class="points-label">睡眠积分</text>
        <text class="points-value">+{{ store.integrationStatus.sleepPoints }}</text>
      </view>
    </view>

    <!-- 健康小贴士列表 -->
    <view class="tips-section">
      <text class="section-title">健康小贴士</text>
      <view class="tips-list">
        <view 
          class="tip-card" 
          v-for="tip in wellnessTips" 
          :key="tip.id"
        >
          <text class="tip-icon">{{ tip.icon }}</text>
          <view class="tip-content">
            <text class="tip-title">{{ tip.title }}</text>
            <text class="tip-text">{{ tip.content }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 贴士弹窗 -->
    <view class="modal-overlay" v-if="showTipModal" @click="showTipModal = false">
      <view class="modal-content tip-modal" @click.stop>
        <view class="modal-header">
          <text class="modal-title">💡 健康提示</text>
          <text class="modal-close" @click="showTipModal = false">✕</text>
        </view>
        <view class="modal-body">
          <text class="tip-main">{{ currentTip?.content }}</text>
          <view class="tip-actions">
            <button class="btn-next" @click="nextTip">下一个</button>
            <button class="btn-close" @click="showTipModal = false">关闭</button>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useWellnessStore } from '@/stores/wellnessStore.js'
import wellnessService from '@/services/wellnessService.js'

const store = useWellnessStore()

const showTipModal = ref(false)
const currentTip = ref(null)

const wellnessTips = wellnessService.WELLNESS_TIPS

onMounted(() => {
  store.init()
  currentTip.value = wellnessService.getRandomWellnessTip()
})

const addWater = (amount) => {
  const result = store.addWater(amount)
  if (result) {
    uni.showToast({ title: `+${amount}ml`, icon: 'success' })
  }
}

const handleEyeBreak = () => {
  store.addEyeBreak()
  uni.showToast({ title: '护眼休息 +1', icon: 'success' })
}

const handlePosture = (good) => {
  store.addPosture(good)
  const msg = good ? '姿势正确 +1' : '需要调整 +1'
  uni.showToast({ title: msg, icon: 'success' })
}

const nextTip = () => {
  currentTip.value = wellnessService.getRandomWellnessTip()
}
</script>

<style scoped>
.habits-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20rpx;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20rpx;
  margin-bottom: 20rpx;
}

.page-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #fff;
}

.header-tip {
  padding: 10rpx 20rpx;
}

.tip-icon {
  font-size: 36rpx;
}

.habit-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.habit-header {
  margin-bottom: 30rpx;
}

.habit-title-row {
  display: flex;
  align-items: center;
  margin-bottom: 10rpx;
}

.habit-icon {
  font-size: 40rpx;
  margin-right: 15rpx;
}

.habit-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.habit-subtitle {
  font-size: 26rpx;
  color: #999;
}

/* Water Card */
.water-card {
  background: linear-gradient(135deg, #e0f7fa 0%, #80deea 100%);
}

.water-progress {
  display: flex;
  align-items: center;
  margin-bottom: 30rpx;
}

.progress-circle {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  background: conic-gradient(#00bcd4 calc(var(--percent) * 3.6deg), #e0e0e0 0);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-right: 30rpx;
}

.progress-circle::before {
  content: '';
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: #fff;
  position: absolute;
}

.progress-circle {
  position: relative;
}

.progress-circle .progress-value,
.progress-circle .progress-unit {
  position: relative;
  z-index: 1;
}

.progress-circle.eye {
  background: conic-gradient(#9c27b0 calc(var(--percent) * 3.6deg), #e0e0e0 0);
}

.progress-value {
  font-size: 48rpx;
  font-weight: bold;
  color: #333;
}

.progress-unit {
  font-size: 24rpx;
  color: #666;
}

.progress-info {
  flex: 1;
}

.progress-amount {
  font-size: 36rpx;
  font-weight: bold;
  color: #00acc1;
  display: block;
  margin-bottom: 10rpx;
}

.progress-label {
  font-size: 28rpx;
  color: #666;
  display: block;
  margin-bottom: 10rpx;
}

.progress-target {
  font-size: 26rpx;
  color: #999;
}

.water-buttons {
  display: flex;
  justify-content: space-between;
}

.water-btn {
  flex: 1;
  background: #fff;
  border-radius: 15rpx;
  padding: 25rpx;
  text-align: center;
  margin: 0 10rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.btn-icon {
  font-size: 40rpx;
  display: block;
  margin-bottom: 10rpx;
}

.btn-text {
  font-size: 26rpx;
  color: #333;
}

/* Eye Card */
.eye-card {
  background: linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%);
}

.eye-progress {
  display: flex;
  align-items: center;
  margin-bottom: 30rpx;
}

.action-button {
  display: flex;
  justify-content: center;
}

.btn-record {
  background: #9c27b0;
  color: #fff;
  border: none;
  border-radius: 30rpx;
  padding: 20rpx 60rpx;
  font-size: 28rpx;
  display: flex;
  align-items: center;
}

.btn-record .btn-icon {
  margin-right: 10rpx;
  margin-bottom: 0;
}

/* Posture Card */
.posture-card {
  background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
}

.posture-stats {
  display: flex;
  align-items: center;
  margin-bottom: 30rpx;
}

.posture-score {
  margin-right: 40rpx;
}

.score-circle {
  width: 140rpx;
  height: 140rpx;
  border-radius: 50%;
  background: #e0e0e0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.score-circle.good {
  background: linear-gradient(135deg, #4caf50 0%, #81c784 100%);
}

.score-circle.medium {
  background: linear-gradient(135deg, #ff9800 0%, #ffb74d 100%);
}

.score-circle.poor {
  background: linear-gradient(135deg, #f44336 0%, #e57373 100%);
}

.score-value {
  font-size: 42rpx;
  font-weight: bold;
  color: #fff;
}

.score-unit {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.8);
}

.score-label {
  font-size: 26rpx;
  color: #666;
  display: block;
  text-align: center;
  margin-top: 10rpx;
}

.posture-details {
  flex: 1;
}

.detail-item {
  display: flex;
  align-items: center;
  margin-bottom: 15rpx;
}

.detail-icon {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15rpx;
  font-size: 24rpx;
  color: #fff;
}

.detail-icon.good {
  background: #4caf50;
}

.detail-icon.bad {
  background: #f44336;
}

.detail-label {
  font-size: 28rpx;
  color: #666;
  margin-right: 20rpx;
}

.detail-value {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
}

.action-buttons {
  display: flex;
  justify-content: space-between;
}

.btn-good,
.btn-bad {
  flex: 1;
  padding: 20rpx;
  border: none;
  border-radius: 15rpx;
  font-size: 28rpx;
}

.btn-good {
  background: #4caf50;
  color: #fff;
  margin-right: 15rpx;
}

.btn-bad {
  background: #f44336;
  color: #fff;
  margin-left: 15rpx;
}

/* Integration Card */
.integration-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.integration-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 20rpx;
}

.integration-list {
  display: flex;
  flex-direction: column;
}

.integration-item {
  display: flex;
  align-items: center;
  padding: 15rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.integration-item:last-child {
  border-bottom: none;
}

.item-icon {
  font-size: 32rpx;
  margin-right: 15rpx;
}

.item-text {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}

.item-status {
  font-size: 26rpx;
  color: #999;
}

.points-earned {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid #eee;
}

.points-label {
  font-size: 28rpx;
  color: #666;
}

.points-value {
  font-size: 36rpx;
  font-weight: bold;
  color: #ff9800;
}

/* Tips Section */
.tips-section {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 20rpx;
}

.tips-list {
  display: flex;
  flex-direction: column;
}

.tip-card {
  display: flex;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.tip-card:last-child {
  border-bottom: none;
}

.tip-icon {
  font-size: 48rpx;
  margin-right: 20rpx;
}

.tip-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.tip-text {
  font-size: 26rpx;
  color: #666;
  line-height: 1.5;
}

/* Modal */
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
  background: #fff;
  border-radius: 20rpx;
  width: 90%;
  max-width: 600rpx;
  padding: 30rpx;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.modal-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.modal-close {
  font-size: 40rpx;
  color: #999;
}

.modal-body {
  padding: 20rpx 0;
}

.tip-main {
  font-size: 30rpx;
  color: #333;
  line-height: 1.6;
  display: block;
  margin-bottom: 30rpx;
}

.tip-actions {
  display: flex;
  justify-content: space-between;
}

.btn-next,
.btn-close {
  flex: 1;
  padding: 20rpx;
  border: none;
  border-radius: 10rpx;
  font-size: 28rpx;
}

.btn-next {
  background: #667eea;
  color: #fff;
  margin-right: 15rpx;
}

.btn-close {
  background: #e0e0e0;
  color: #666;
  margin-left: 15rpx;
}
</style>
