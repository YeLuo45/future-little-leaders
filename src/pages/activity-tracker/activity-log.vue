<template>
  <view class="activity-log-page">
    <!-- 页面标题 -->
    <view class="page-header">
      <text class="page-title">运动打卡</text>
      <view class="header-actions">
        <button class="btn-add" @click="showAddModal = true">+ 打卡</button>
      </view>
    </view>

    <!-- 今日目标进度 -->
    <view class="daily-goal-card">
      <view class="goal-header">
        <text class="goal-title">今日目标</text>
        <text class="goal-date">{{ formatDate(selectedDate) }}</text>
      </view>
      <view class="goal-progress">
        <view class="progress-item">
          <view class="progress-circle" :style="{ '--percent': dailyGoalProgress.duration + '%' }">
            <text class="progress-value">{{ store.todayStats.totalDuration }}</text>
            <text class="progress-unit">分钟</text>
          </view>
          <text class="progress-label">运动时长</text>
          <text class="progress-target">目标: {{ store.dailyGoal.duration }}分钟</text>
        </view>
        <view class="progress-item">
          <view class="progress-circle calories" :style="{ '--percent': dailyGoalProgress.calories + '%' }">
            <text class="progress-value">{{ store.todayStats.totalCalories }}</text>
            <text class="progress-unit">千卡</text>
          </view>
          <text class="progress-label">消耗卡路里</text>
          <text class="progress-target">目标: {{ store.dailyGoal.calories }}千卡</text>
        </view>
      </view>
    </view>

    <!-- 连续打卡 -->
    <view class="streak-card">
      <view class="streak-info">
        <text class="streak-icon">🔥</text>
        <view class="streak-details">
          <text class="streak-count">连续 {{ store.activityStreak.currentStreak }} 天</text>
          <text class="streak-label">运动打卡</text>
        </view>
      </view>
      <view class="streak-best">
        <text class="best-label">最长连续</text>
        <text class="best-value">{{ store.activityStreak.longestStreak }} 天</text>
      </view>
    </view>

    <!-- 今日打卡列表 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">今日打卡</text>
        <text class="section-count">{{ store.todayLogs.length }} 项</text>
      </view>
      
      <view v-if="store.todayLogs.length === 0" class="empty-state">
        <text class="empty-icon">🏃</text>
        <text class="empty-text">今日还没有运动记录</text>
        <text class="empty-hint">点击上方"打卡"按钮开始记录</text>
      </view>
      
      <view v-else class="log-list">
        <view 
          class="log-card" 
          v-for="log in store.todayLogs" 
          :key="log.id"
        >
          <view class="log-icon" :style="{ backgroundColor: getActivityColor(log.type) }">
            <text>{{ getActivityIcon(log.type) }}</text>
          </view>
          <view class="log-content">
            <text class="log-title">{{ log.title }}</text>
            <view class="log-meta">
              <text class="log-time">{{ log.checkInTime }}</text>
              <text class="log-duration">{{ log.duration }}分钟</text>
              <text v-if="log.distance" class="log-distance">{{ log.distance }}公里</text>
            </view>
            <text v-if="log.notes" class="log-notes">{{ log.notes }}</text>
          </view>
          <view class="log-points">
            <text class="points-value">+{{ log.points }}</text>
            <text class="points-label">积分</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 本周概览 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">本周概览</text>
      </view>
      <view class="week-overview">
        <view class="overview-item">
          <text class="overview-value">{{ store.weekStats.totalDuration }}</text>
          <text class="overview-label">总时长(分钟)</text>
        </view>
        <view class="overview-item">
          <text class="overview-value">{{ store.weekStats.totalCalories }}</text>
          <text class="overview-label">总卡路里</text>
        </view>
        <view class="overview-item">
          <text class="overview-value">{{ store.weekStats.activeDays }}</text>
          <text class="overview-label">运动天数</text>
        </view>
        <view class="overview-item">
          <text class="overview-value">{{ store.weekStats.totalDistance.toFixed(1) }}</text>
          <text class="overview-label">总公里数</text>
        </view>
      </view>
    </view>

    <!-- 历史记录 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">历史记录</text>
      </view>
      <view v-if="recentLogs.length === 0" class="empty-state small">
        <text class="empty-text">暂无历史记录</text>
      </view>
      <view v-else class="log-list history">
        <view 
          class="log-card" 
          v-for="log in recentLogs" 
          :key="log.id"
        >
          <view class="log-date-badge">{{ formatShortDate(log.date) }}</view>
          <view class="log-icon small" :style="{ backgroundColor: getActivityColor(log.type) }">
            <text>{{ getActivityIcon(log.type) }}</text>
          </view>
          <view class="log-content">
            <text class="log-title">{{ log.title }}</text>
            <text class="log-meta">{{ log.duration }}分钟 · {{ log.calories }}千卡</text>
          </view>
          <text class="log-points small">+{{ log.points }}</text>
        </view>
      </view>
    </view>

    <!-- 添加打卡弹窗 -->
    <view v-if="showAddModal" class="modal-overlay" @click="showAddModal = false">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">添加运动记录</text>
          <text class="modal-close" @click="showAddModal = false">✕</text>
        </view>
        
        <view class="modal-body">
          <!-- 运动类型 -->
          <view class="form-group">
            <text class="form-label">运动类型</text>
            <view class="activity-type-grid">
              <view 
                v-for="type in store.activityTypes" 
                :key="type.id"
                class="type-item"
                :class="{ active: newLog.type === type.id }"
                :style="{ '--type-color': type.color }"
                @click="newLog.type = type.id"
              >
                <text class="type-icon">{{ type.icon }}</text>
                <text class="type-name">{{ type.name }}</text>
              </view>
            </view>
          </view>

          <!-- 运动名称 -->
          <view class="form-group">
            <text class="form-label">运动名称</text>
            <input 
              class="form-input" 
              v-model="newLog.title" 
              placeholder="如: 晨跑、游泳训练"
            />
          </view>

          <!-- 时长 -->
          <view class="form-group">
            <text class="form-label">运动时长 (分钟)</text>
            <input 
              class="form-input" 
              type="number" 
              v-model="newLog.duration" 
              placeholder="请输入时长"
            />
          </view>

          <!-- 距离(可选) -->
          <view class="form-group" v-if="showDistance">
            <text class="form-label">运动距离 (公里)</text>
            <input 
              class="form-input" 
              type="digit" 
              v-model="newLog.distance" 
              placeholder="请输入距离"
            />
          </view>

          <!-- 强度 -->
          <view class="form-group">
            <text class="form-label">运动强度</text>
            <view class="intensity-options">
              <view 
                v-for="level in store.intensityLevels" 
                :key="level.id"
                class="intensity-item"
                :class="{ active: newLog.intensity === level.id }"
                @click="newLog.intensity = level.id"
              >
                {{ level.name }}
              </view>
            </view>
          </view>

          <!-- 备注 -->
          <view class="form-group">
            <text class="form-label">备注</text>
            <textarea 
              class="form-textarea" 
              v-model="newLog.notes" 
              placeholder="记录你的运动感受..."
            />
          </view>
        </view>

        <view class="modal-footer">
          <button class="btn-cancel" @click="showAddModal = false">取消</button>
          <button class="btn-confirm" @click="handleAddLog">保存</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { useActivityTrackerStore } from '@/stores/activityTrackerStore.js'
import activityTrackerService from '@/services/activityTrackerService.js'

const store = useActivityTrackerStore()

// 页面状态
const showAddModal = ref(false)
const selectedDate = ref(new Date().toISOString().split('T')[0])

// 新记录表单
const newLog = reactive({
  type: 'running',
  title: '',
  duration: '',
  distance: '',
  intensity: 'medium',
  notes: ''
})

// 运动类型（显示距离字段的）
const showDistanceTypes = ['running', 'cycling', 'hiking']
const showDistance = computed(() => showDistanceTypes.includes(newLog.type))

// 历史记录（排除今日）
const recentLogs = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return store.activityLogs.filter(log => log.date !== today).slice(0, 10)
})

// 获取运动类型图标
const getActivityIcon = (type) => {
  const types = activityTrackerService.ACTIVITY_TYPES
  return types[type]?.icon || '🏃'
}

// 获取运动类型颜色
const getActivityColor = (type) => {
  const types = activityTrackerService.ACTIVITY_TYPES
  return types[type]?.color || '#FF6B6B'
}

// 格式化日期
const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

const formatShortDate = (dateStr) => {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}/${date.getDate()}`
}

// 添加记录
const handleAddLog = () => {
  if (!newLog.duration) {
    uni.showToast({ title: '请输入运动时长', icon: 'none' })
    return
  }
  
  const result = store.addActivityLog({
    type: newLog.type,
    title: newLog.title || undefined,
    duration: parseInt(newLog.duration),
    distance: newLog.distance ? parseFloat(newLog.distance) : 0,
    intensity: newLog.intensity,
    notes: newLog.notes,
    date: selectedDate.value
  })
  
  if (result) {
    uni.showToast({ title: '打卡成功！', icon: 'success' })
    showAddModal.value = false
    // 重置表单
    newLog.type = 'running'
    newLog.title = ''
    newLog.duration = ''
    newLog.distance = ''
    newLog.intensity = 'medium'
    newLog.notes = ''
  }
}

// 初始化
store.init()
</script>

<style scoped>
.activity-log-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 40rpx;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx 32rpx 24rpx;
  background-color: #fff;
}

.page-title {
  font-size: 40rpx;
  font-weight: 600;
  color: #333;
}

.btn-add {
  padding: 16rpx 32rpx;
  background: linear-gradient(135deg, #FF6B6B, #FF8E53);
  color: #fff;
  border-radius: 32rpx;
  font-size: 28rpx;
  border: none;
}

/* 每日目标卡片 */
.daily-goal-card {
  margin: 24rpx 32rpx;
  padding: 32rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 24rpx;
  color: #fff;
}

.goal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32rpx;
}

.goal-title {
  font-size: 32rpx;
  font-weight: 600;
}

.goal-date {
  font-size: 26rpx;
  opacity: 0.8;
}

.goal-progress {
  display: flex;
  justify-content: space-around;
}

.progress-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.progress-circle {
  width: 140rpx;
  height: 140rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 12rpx;
  position: relative;
}

.progress-circle::before {
  content: '';
  position: absolute;
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  clip-path: polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, 50% 0%);
  transform: rotate(-90deg);
}

.progress-value {
  font-size: 40rpx;
  font-weight: 700;
  z-index: 1;
}

.progress-unit {
  font-size: 22rpx;
  opacity: 0.8;
  z-index: 1;
}

.progress-label {
  font-size: 26rpx;
  margin-bottom: 4rpx;
}

.progress-target {
  font-size: 22rpx;
  opacity: 0.7;
}

/* 连续打卡卡片 */
.streak-card {
  margin: 24rpx 32rpx;
  padding: 24rpx 32rpx;
  background: #fff;
  border-radius: 16rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.streak-info {
  display: flex;
  align-items: center;
}

.streak-icon {
  font-size: 56rpx;
  margin-right: 16rpx;
}

.streak-count {
  font-size: 32rpx;
  font-weight: 600;
  color: #FF6B6B;
}

.streak-label {
  font-size: 24rpx;
  color: #999;
}

.streak-best {
  text-align: right;
}

.best-label {
  font-size: 24rpx;
  color: #999;
  display: block;
}

.best-value {
  font-size: 28rpx;
  color: #666;
}

/* 区块 */
.section {
  margin: 24rpx 32rpx;
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
}

.section-count {
  font-size: 24rpx;
  color: #999;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 60rpx 0;
}

.empty-state.small {
  padding: 30rpx 0;
}

.empty-icon {
  font-size: 80rpx;
  display: block;
  margin-bottom: 16rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #666;
}

.empty-hint {
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
}

/* 打卡记录列表 */
.log-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.log-card {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background: #f8f8f8;
  border-radius: 12rpx;
  position: relative;
}

.log-card.history {
  padding-left: 100rpx;
}

.log-date-badge {
  position: absolute;
  left: 20rpx;
  top: 20rpx;
  font-size: 22rpx;
  color: #999;
}

.log-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 16rpx;
  background: #FF6B6B;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  flex-shrink: 0;
}

.log-icon.small {
  width: 60rpx;
  height: 60rpx;
  font-size: 30rpx;
}

.log-content {
  flex: 1;
  margin-left: 20rpx;
}

.log-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 6rpx;
}

.log-meta {
  display: flex;
  gap: 16rpx;
  font-size: 24rpx;
  color: #999;
}

.log-notes {
  font-size: 24rpx;
  color: #666;
  margin-top: 6rpx;
}

.log-points {
  text-align: right;
  min-width: 80rpx;
}

.log-points.small {
  min-width: 60rpx;
}

.points-value {
  font-size: 32rpx;
  font-weight: 600;
  color: #FF6B6B;
  display: block;
}

.points-label {
  font-size: 22rpx;
  color: #999;
}

.log-points.small .points-value {
  font-size: 26rpx;
}

/* 本周概览 */
.week-overview {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16rpx;
}

.overview-item {
  text-align: center;
  padding: 16rpx 0;
}

.overview-value {
  font-size: 32rpx;
  font-weight: 600;
  color: #667eea;
  display: block;
}

.overview-label {
  font-size: 22rpx;
  color: #999;
  margin-top: 4rpx;
}

/* 弹窗 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.modal-content {
  width: 100%;
  max-height: 85vh;
  background: #fff;
  border-radius: 24rpx 24rpx 0 0;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx;
  border-bottom: 1px solid #eee;
}

.modal-title {
  font-size: 32rpx;
  font-weight: 600;
}

.modal-close {
  font-size: 40rpx;
  color: #999;
  padding: 10rpx;
}

.modal-body {
  padding: 32rpx;
  max-height: 60vh;
  overflow-y: auto;
}

.modal-footer {
  display: flex;
  gap: 24rpx;
  padding: 24rpx 32rpx;
  border-top: 1px solid #eee;
}

.btn-cancel {
  flex: 1;
  padding: 24rpx 0;
  background: #f5f5f5;
  color: #666;
  border-radius: 12rpx;
  border: none;
  font-size: 30rpx;
}

.btn-confirm {
  flex: 1;
  padding: 24rpx 0;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  border-radius: 12rpx;
  border: none;
  font-size: 30rpx;
}

/* 表单 */
.form-group {
  margin-bottom: 32rpx;
}

.form-label {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
  display: block;
  margin-bottom: 16rpx;
}

.form-input {
  width: 100%;
  padding: 20rpx 24rpx;
  border: 1px solid #ddd;
  border-radius: 12rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}

.form-textarea {
  width: 100%;
  padding: 20rpx 24rpx;
  border: 1px solid #ddd;
  border-radius: 12rpx;
  font-size: 28rpx;
  min-height: 120rpx;
  box-sizing: border-box;
}

.activity-type-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16rpx;
}

.type-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx 0;
  border: 2px solid #eee;
  border-radius: 12rpx;
  transition: all 0.2s;
}

.type-item.active {
  border-color: var(--type-color);
  background: rgba(102, 126, 234, 0.1);
}

.type-icon {
  font-size: 40rpx;
  margin-bottom: 8rpx;
}

.type-name {
  font-size: 22rpx;
  color: #666;
}

.intensity-options {
  display: flex;
  gap: 16rpx;
}

.intensity-item {
  flex: 1;
  padding: 16rpx 0;
  text-align: center;
  border: 2px solid #eee;
  border-radius: 12rpx;
  font-size: 26rpx;
  color: #666;
}

.intensity-item.active {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
}
</style>
