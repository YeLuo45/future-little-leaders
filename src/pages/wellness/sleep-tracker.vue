<template>
  <view class="sleep-tracker-page">
    <!-- 页面标题 -->
    <view class="page-header">
      <text class="page-title">睡眠追踪</text>
      <view class="header-actions">
        <button class="btn-record" @click="showRecordModal = true">+ 记录</button>
      </view>
    </view>

    <!-- 今晚睡眠卡片 -->
    <view class="tonight-card" v-if="store.todaySleep">
      <view class="card-header">
        <text class="card-title">今晚睡眠</text>
        <text class="card-date">{{ store.formatDate(store.selectedDate) }}</text>
      </view>
      <view class="sleep-stats">
        <view class="stat-item">
          <text class="stat-icon">😴</text>
          <text class="stat-value">{{ store.formatDuration(store.todaySleep.duration) }}</text>
          <text class="stat-label">睡眠时长</text>
        </view>
        <view class="stat-item">
          <text class="stat-icon">{{ store.sleepQualityLevel?.icon || '😊' }}</text>
          <text class="stat-value">{{ store.todaySleep.qualityScore }}</text>
          <text class="stat-label">质量评分</text>
        </view>
        <view class="stat-item">
          <text class="stat-icon">⭐</text>
          <text class="stat-value">+{{ store.todaySleep.points }}</text>
          <text class="stat-label">获得积分</text>
        </view>
      </view>
      <view class="sleep-times">
        <view class="time-item">
          <text class="time-label">入睡</text>
          <text class="time-value">{{ store.formatTime(store.todaySleep.bedtime) }}</text>
        </view>
        <view class="time-arrow">→</view>
        <view class="time-item">
          <text class="time-label">起床</text>
          <text class="time-value">{{ store.formatTime(store.todaySleep.wakeupTime) }}</text>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view class="empty-card" v-else>
      <text class="empty-icon">🌙</text>
      <text class="empty-text">还没有今晚的睡眠记录</text>
      <text class="empty-hint">点击上方"记录"按钮开始追踪睡眠</text>
    </view>

    <!-- 连续打卡 -->
    <view class="streak-card">
      <view class="streak-info">
        <text class="streak-icon">🔥</text>
        <view class="streak-details">
          <text class="streak-count">连续 {{ store.sleepStreak.currentStreak }} 天</text>
          <text class="streak-label">按时睡眠</text>
        </view>
      </view>
      <view class="streak-best">
        <text class="best-label">最长连续</text>
        <text class="best-value">{{ store.sleepStreak.longestStreak }} 天</text>
      </view>
    </view>

    <!-- 快速记录入口 -->
    <view class="quick-actions">
      <view class="action-item" @click="goToReport">
        <text class="action-icon">📊</text>
        <text class="action-text">睡眠报告</text>
      </view>
      <view class="action-item" @click="goToHabits">
        <text class="action-icon">💪</text>
        <text class="action-text">健康习惯</text>
      </view>
      <view class="action-item" @click="handleExport">
        <text class="action-icon">📤</text>
        <text class="action-text">导出数据</text>
      </view>
    </view>

    <!-- 本周概览 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">本周概览</text>
        <text class="section-subtitle">共 {{ store.weekStats.nights || 0 }} 晚记录</text>
      </view>
      <view class="week-overview">
        <view class="overview-item">
          <text class="overview-value">{{ store.weekStats.avgDuration || 0 }}</text>
          <text class="overview-label">平均时长(小时)</text>
        </view>
        <view class="overview-item">
          <text class="overview-value">{{ store.weekStats.avgQuality || 0 }}</text>
          <text class="overview-label">平均质量</text>
        </view>
        <view class="overview-item">
          <text class="overview-value">{{ store.weekStats.totalDuration || 0 }}</text>
          <text class="overview-label">总时长(小时)</text>
        </view>
      </view>
    </view>

    <!-- 今日小贴士 -->
    <view class="tip-card" v-if="store.todayTip">
      <text class="tip-icon">{{ store.todayTip.icon }}</text>
      <view class="tip-content">
        <text class="tip-title">{{ store.todayTip.title }}</text>
        <text class="tip-text">{{ store.todayTip.content }}</text>
      </view>
    </view>

    <!-- 记录弹窗 -->
    <view class="modal-overlay" v-if="showRecordModal" @click="showRecordModal = false">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">记录睡眠</text>
          <text class="modal-close" @click="showRecordModal = false">✕</text>
        </view>
        
        <view class="form-group">
          <text class="form-label">入睡时间</text>
          <view class="time-picker" @click="showBedtimePicker = true">
            <text>{{ formData.bedtime || '选择时间' }}</text>
            <text class="picker-arrow">▼</text>
          </view>
        </view>
        
        <view class="form-group">
          <text class="form-label">起床时间</text>
          <view class="time-picker" @click="showWakeupPicker = true">
            <text>{{ formData.wakeupTime || '选择时间' }}</text>
            <text class="picker-arrow">▼</text>
          </view>
        </view>
        
        <view class="form-group">
          <text class="form-label">睡眠质量</text>
          <view class="quality-options">
            <view 
              class="quality-option" 
              :class="{ active: formData.quality === 'excellent' }"
              @click="formData.quality = 'excellent'"
            >
              <text>😴</text>
              <text class="option-text">优秀</text>
            </view>
            <view 
              class="quality-option" 
              :class="{ active: formData.quality === 'good' }"
              @click="formData.quality = 'good'"
            >
              <text>🙂</text>
              <text class="option-text">良好</text>
            </view>
            <view 
              class="quality-option" 
              :class="{ active: formData.quality === 'fair' }"
              @click="formData.quality = 'fair'"
            >
              <text>😐</text>
              <text class="option-text">一般</text>
            </view>
            <view 
              class="quality-option" 
              :class="{ active: formData.quality === 'poor' }"
              @click="formData.quality = 'poor'"
            >
              <text>😫</text>
              <text class="option-text">较差</text>
            </view>
          </view>
        </view>
        
        <view class="form-group">
          <text class="form-label">备注（可选）</text>
          <input 
            class="form-input" 
            v-model="formData.notes" 
            placeholder="添加备注..."
          />
        </view>
        
        <view class="modal-actions">
          <button class="btn-cancel" @click="showRecordModal = false">取消</button>
          <button class="btn-save" @click="handleSave">保存</button>
        </view>
      </view>
    </view>

    <!-- 时间选择器 -->
    <view class="modal-overlay" v-if="showBedtimePicker" @click="showBedtimePicker = false">
      <view class="time-picker-modal" @click.stop>
        <view class="picker-header">
          <text>选择入睡时间</text>
        </view>
        <picker-view 
          class="picker-view" 
          :value="bedtimeValue" 
          @change="onBedtimeChange"
        >
          <picker-view-column>
            <view class="picker-item" v-for="h in hours" :key="h">{{ h }}时</view>
          </picker-view-column>
          <picker-view-column>
            <view class="picker-item" v-for="m in minutes" :key="m">{{ m }}分</view>
          </picker-view-column>
        </picker-view>
        <button class="picker-confirm" @click="confirmBedtime">确定</button>
      </view>
    </view>

    <view class="modal-overlay" v-if="showWakeupPicker" @click="showWakeupPicker = false">
      <view class="time-picker-modal" @click.stop>
        <view class="picker-header">
          <text>选择起床时间</text>
        </view>
        <picker-view 
          class="picker-view" 
          :value="wakeupValue" 
          @change="onWakeupChange"
        >
          <picker-view-column>
            <view class="picker-item" v-for="h in hours" :key="h">{{ h }}时</view>
          </picker-view-column>
          <picker-view-column>
            <view class="picker-item" v-for="m in minutes" :key="m">{{ m }}分</view>
          </picker-view-column>
        </picker-view>
        <button class="picker-confirm" @click="confirmWakeup">确定</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useWellnessStore } from '@/stores/wellnessStore.js'

const store = useWellnessStore()

// UI状态
const showRecordModal = ref(false)
const showBedtimePicker = ref(false)
const showWakeupPicker = ref(false)

// 表单数据
const formData = reactive({
  bedtime: '',
  wakeupTime: '',
  quality: 'good',
  notes: ''
})

// 时间选择器数据
const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'))
const minutes = ['00', '15', '30', '45']
const bedtimeValue = ref([21, 0])
const wakeupValue = ref([7, 0])

// 生命周期
onMounted(() => {
  store.init()
})

// 方法
const handleSave = () => {
  if (!formData.bedtime || !formData.wakeupTime) {
    uni.showToast({ title: '请选择时间', icon: 'none' })
    return
  }
  
  const success = store.addSleepLog({
    bedtime: formData.bedtime,
    wakeupTime: formData.wakeupTime,
    quality: formData.quality,
    notes: formData.notes
  })
  
  if (success) {
    uni.showToast({ title: '记录成功', icon: 'success' })
    showRecordModal.value = false
    formData.bedtime = ''
    formData.wakeupTime = ''
    formData.quality = 'good'
    formData.notes = ''
  }
}

const onBedtimeChange = (e) => {
  const [h, m] = e.detail.value
  formData.bedtime = `${hours[h]}:${minutes[m]}`
}

const onWakeupChange = (e) => {
  const [h, m] = e.detail.value
  formData.wakeupTime = `${hours[h]}:${minutes[m]}`
}

const confirmBedtime = () => {
  if (!formData.bedtime) {
    formData.bedtime = '21:00'
  }
  showBedtimePicker.value = false
}

const confirmWakeup = () => {
  if (!formData.wakeupTime) {
    formData.wakeupTime = '07:00'
  }
  showWakeupPicker.value = false
}

const goToReport = () => {
  uni.navigateTo({ url: '/pages/wellness/sleep-report' })
}

const goToHabits = () => {
  uni.navigateTo({ url: '/pages/wellness/habits' })
}

const handleExport = () => {
  const data = store.exportData()
  uni.showModal({
    title: '导出数据',
    content: `共 ${data.sleepLogs.length} 条睡眠记录，${data.waterLogs.length} 条饮水记录`,
    showCancel: false
  })
}
</script>

<style scoped>
.sleep-tracker-page {
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

.btn-record {
  background: #fff;
  color: #667eea;
  border: none;
  border-radius: 30rpx;
  padding: 16rpx 32rpx;
  font-size: 28rpx;
  font-weight: bold;
}

.tonight-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.card-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 30rpx;
}

.card-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.card-date {
  font-size: 26rpx;
  color: #999;
}

.sleep-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 30rpx;
}

.stat-item {
  text-align: center;
}

.stat-icon {
  font-size: 48rpx;
  display: block;
  margin-bottom: 10rpx;
}

.stat-value {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  display: block;
}

.stat-label {
  font-size: 24rpx;
  color: #999;
}

.sleep-times {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20rpx;
  background: #f8f8f8;
  border-radius: 10rpx;
}

.time-item {
  text-align: center;
}

.time-label {
  font-size: 24rpx;
  color: #999;
  display: block;
}

.time-value {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.time-arrow {
  margin: 0 40rpx;
  color: #999;
  font-size: 28rpx;
}

.empty-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 60rpx 30rpx;
  text-align: center;
  margin-bottom: 20rpx;
}

.empty-icon {
  font-size: 80rpx;
  display: block;
  margin-bottom: 20rpx;
}

.empty-text {
  font-size: 30rpx;
  color: #333;
  display: block;
  margin-bottom: 10rpx;
}

.empty-hint {
  font-size: 26rpx;
  color: #999;
}

.streak-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.streak-info {
  display: flex;
  align-items: center;
}

.streak-icon {
  font-size: 60rpx;
  margin-right: 20rpx;
}

.streak-count {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
}

.streak-label {
  font-size: 26rpx;
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
  color: #667eea;
  font-weight: bold;
}

.quick-actions {
  display: flex;
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.action-item {
  flex: 1;
  text-align: center;
}

.action-icon {
  font-size: 48rpx;
  display: block;
  margin-bottom: 10rpx;
}

.action-text {
  font-size: 26rpx;
  color: #666;
}

.section {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}

.section-subtitle {
  font-size: 26rpx;
  color: #999;
}

.week-overview {
  display: flex;
  justify-content: space-around;
}

.overview-item {
  text-align: center;
}

.overview-value {
  font-size: 36rpx;
  font-weight: bold;
  color: #667eea;
  display: block;
  margin-bottom: 10rpx;
}

.overview-label {
  font-size: 24rpx;
  color: #999;
}

.tip-card {
  display: flex;
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.tip-icon {
  font-size: 60rpx;
  margin-right: 20rpx;
}

.tip-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 10rpx;
}

.tip-text {
  font-size: 26rpx;
  color: #666;
  line-height: 1.5;
}

/* Modal Styles */
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
  margin-bottom: 30rpx;
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

.form-group {
  margin-bottom: 30rpx;
}

.form-label {
  font-size: 28rpx;
  color: #666;
  display: block;
  margin-bottom: 15rpx;
}

.time-picker {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f5f5f5;
  border-radius: 10rpx;
  padding: 20rpx;
  font-size: 30rpx;
  color: #333;
}

.picker-arrow {
  color: #999;
  font-size: 24rpx;
}

.quality-options {
  display: flex;
  justify-content: space-between;
}

.quality-option {
  flex: 1;
  text-align: center;
  padding: 20rpx;
  background: #f5f5f5;
  border-radius: 10rpx;
  margin: 0 5rpx;
}

.quality-option.active {
  background: #667eea;
  color: #fff;
}

.quality-option text:first-child {
  font-size: 40rpx;
  display: block;
  margin-bottom: 10rpx;
}

.option-text {
  font-size: 24rpx;
}

.form-input {
  background: #f5f5f5;
  border-radius: 10rpx;
  padding: 20rpx;
  font-size: 30rpx;
}

.modal-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 30rpx;
}

.btn-cancel,
.btn-save {
  flex: 1;
  padding: 20rpx;
  border-radius: 10rpx;
  font-size: 30rpx;
  border: none;
}

.btn-cancel {
  background: #f5f5f5;
  color: #666;
  margin-right: 20rpx;
}

.btn-save {
  background: #667eea;
  color: #fff;
}

/* Time Picker Modal */
.time-picker-modal {
  background: #fff;
  border-radius: 20rpx;
  width: 90%;
  max-width: 600rpx;
  overflow: hidden;
}

.picker-header {
  text-align: center;
  padding: 30rpx;
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  border-bottom: 1rpx solid #eee;
}

.picker-view {
  height: 400rpx;
}

.picker-item {
  text-align: center;
  line-height: 80rpx;
  font-size: 30rpx;
}

.picker-confirm {
  background: #667eea;
  color: #fff;
  border: none;
  border-radius: 0;
  margin-top: 20rpx;
}
</style>
