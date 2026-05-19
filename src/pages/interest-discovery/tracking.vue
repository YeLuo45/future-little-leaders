<template>
  <view class="tracking-page">
    <view class="header-section">
      <text class="page-title">兴趣追踪</text>
      <text class="page-subtitle">记录你的兴趣成长</text>
    </view>

    <!-- 追踪统计 -->
    <view class="stats-cards">
      <view class="stat-card">
        <text class="stat-icon">📅</text>
        <text class="stat-value">{{ store.trackingStreak }}</text>
        <text class="stat-label">连续天数</text>
      </view>
      <view class="stat-card">
        <text class="stat-icon">📝</text>
        <text class="stat-value">{{ store.trackingRecords.length }}</text>
        <text class="stat-label">追踪记录</text>
      </view>
      <view class="stat-card">
        <text class="stat-icon">🎯</text>
        <text class="stat-value">{{ store.completedDimensions.length }}</text>
        <text class="stat-label">探索维度</text>
      </view>
    </view>

    <!-- 添加追踪记录 -->
    <view class="add-tracking-section">
      <view class="add-card" @tap="showAddModal = true">
        <text class="add-icon">+</text>
        <text class="add-text">添加追踪记录</text>
      </view>
    </view>

    <!-- 维度分组追踪 -->
    <view 
      v-for="(records, dimensionId) in store.trackingByDimension" 
      :key="dimensionId"
      class="dimension-section"
    >
      <view class="dimension-header">
        <view class="dimension-info">
          <text class="dimension-icon">{{ getDimensionInfo(dimensionId).icon }}</text>
          <text class="dimension-name">{{ getDimensionInfo(dimensionId).name }}</text>
        </view>
        <text class="dimension-count">{{ records.length }}条记录</text>
      </view>
      
      <view class="tracking-list">
        <view 
          v-for="record in records" 
          :key="record.id"
          class="tracking-item"
        >
          <view class="tracking-content">
            <text class="tracking-activity">{{ record.activity }}</text>
            <text v-if="record.notes" class="tracking-notes">{{ record.notes }}</text>
            <text class="tracking-date">{{ formatDate(record.recordedAt) }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view v-if="store.trackingRecords.length === 0" class="empty-state">
      <text class="empty-icon">📊</text>
      <text class="empty-text">还没有追踪记录</text>
      <text class="empty-hint">开始追踪你的兴趣发展吧！</text>
    </view>

    <!-- 添加记录弹窗 -->
    <view v-if="showAddModal" class="modal-mask" @tap="closeModal">
      <view class="add-modal" @tap.stop>
        <text class="modal-title">添加追踪记录</text>
        
        <view class="form-item">
          <text class="form-label">选择维度</text>
          <view class="dimension-picker">
            <view 
              v-for="dim in allDimensions" 
              :key="dim.id"
              class="picker-item"
              :class="{ selected: newRecord.dimensionId === dim.id }"
              @tap="newRecord.dimensionId = dim.id"
            >
              <text>{{ dim.icon }}</text>
              <text class="picker-name">{{ dim.name }}</text>
            </view>
          </view>
        </view>

        <view class="form-item">
          <text class="form-label">活动名称</text>
          <input 
            class="form-input" 
            v-model="newRecord.activity"
            placeholder="今天做了什么活动？"
          />
        </view>

        <view class="form-item">
          <text class="form-label">备注（可选）</text>
          <textarea 
            class="form-textarea"
            v-model="newRecord.notes"
            placeholder="记录你的感受或收获..."
          />
        </view>

        <view class="modal-actions">
          <view class="btn-cancel" @tap="closeModal">取消</view>
          <view class="btn-save" @tap="saveRecord">保存</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, onLoad } from '@dcloudio/uni-app'
import { useInterestDiscoveryStore } from '@/stores/interestDiscoveryStore.js'
import interestDiscoveryService from '@/services/interestDiscoveryService.js'

const store = useInterestDiscoveryStore()

const allDimensions = Object.values(interestDiscoveryService.INTEREST_DIMENSIONS)
const showAddModal = ref(false)

const newRecord = reactive({
  dimensionId: 'science',
  activity: '',
  notes: ''
})

onLoad((options) => {
  store.init()
  if (options?.dimension) {
    newRecord.dimensionId = options.dimension
  }
})

const getDimensionInfo = (dimensionId) => {
  return interestDiscoveryService.INTEREST_DIMENSIONS[dimensionId] || { icon: '❓', name: '未知' }
}

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  const month = date.getMonth() + 1
  const day = date.getDate()
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const weekday = weekdays[date.getDay()]
  return `${month}月${day}日 ${weekday}`
}

const closeModal = () => {
  showAddModal.value = false
  newRecord.activity = ''
  newRecord.notes = ''
}

const saveRecord = () => {
  if (!newRecord.activity.trim()) {
    uni.showToast({ title: '请输入活动名称', icon: 'none' })
    return
  }
  
  store.addTrackingEntry(newRecord.dimensionId, newRecord.activity.trim(), newRecord.notes.trim())
  uni.showToast({ title: '记录已保存', icon: 'success' })
  closeModal()
}
</script>

<style scoped>
.tracking-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding-bottom: 40rpx;
}

.header-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60rpx 40rpx 80rpx;
  color: #fff;
}

.page-title {
  font-size: 44rpx;
  font-weight: 600;
  display: block;
}

.page-subtitle {
  font-size: 28rpx;
  opacity: 0.9;
  margin-top: 8rpx;
  display: block;
}

.stats-cards {
  display: flex;
  gap: 20rpx;
  padding: 30rpx;
  margin-top: -40rpx;
}

.stat-card {
  flex: 1;
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx 20rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
}

.stat-icon {
  font-size: 40rpx;
  margin-bottom: 10rpx;
}

.stat-value {
  font-size: 44rpx;
  font-weight: 700;
  color: #667eea;
}

.stat-label {
  font-size: 24rpx;
  color: #999;
  margin-top: 4rpx;
}

.add-tracking-section {
  padding: 0 30rpx 30rpx;
}

.add-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  border: 2rpx dashed #d0d0d0;
}

.add-icon {
  font-size: 40rpx;
  color: #667eea;
  font-weight: 300;
}

.add-text {
  font-size: 28rpx;
  color: #667eea;
}

.dimension-section {
  margin: 0 30rpx 30rpx;
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;
}

.dimension-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 30rpx;
  background: #f8f9fa;
}

.dimension-info {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.dimension-icon {
  font-size: 36rpx;
}

.dimension-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
}

.dimension-count {
  font-size: 24rpx;
  color: #999;
}

.tracking-list {
  padding: 20rpx 30rpx;
}

.tracking-item {
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.tracking-item:last-child {
  border-bottom: none;
}

.tracking-activity {
  font-size: 28rpx;
  color: #333;
  display: block;
  font-weight: 500;
}

.tracking-notes {
  font-size: 26rpx;
  color: #666;
  display: block;
  margin-top: 8rpx;
}

.tracking-date {
  font-size: 24rpx;
  color: #999;
  display: block;
  margin-top: 8rpx;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 100rpx 0;
}

.empty-icon {
  font-size: 100rpx;
  margin-bottom: 20rpx;
}

.empty-text {
  font-size: 32rpx;
  color: #333;
  font-weight: 500;
}

.empty-hint {
  font-size: 26rpx;
  color: #999;
  margin-top: 10rpx;
}

.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: flex-end;
  z-index: 100;
}

.add-modal {
  width: 100%;
  background: #fff;
  border-radius: 30rpx 30rpx 0 0;
  padding: 40rpx 30rpx;
  padding-bottom: calc(40rpx + env(safe-area-inset-bottom));
}

.modal-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
  display: block;
  text-align: center;
  margin-bottom: 40rpx;
}

.form-item {
  margin-bottom: 30rpx;
}

.form-label {
  font-size: 28rpx;
  color: #666;
  display: block;
  margin-bottom: 12rpx;
}

.dimension-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.picker-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16rpx 20rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
  font-size: 36rpx;
}

.picker-item.selected {
  background: #f0efff;
  border: 2rpx solid #667eea;
}

.picker-name {
  font-size: 22rpx;
  color: #666;
  margin-top: 6rpx;
}

.picker-item.selected .picker-name {
  color: #667eea;
}

.form-input {
  width: 100%;
  padding: 24rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
  font-size: 30rpx;
}

.form-textarea {
  width: 100%;
  padding: 24rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
  font-size: 30rpx;
  min-height: 150rpx;
}

.modal-actions {
  display: flex;
  gap: 20rpx;
  margin-top: 30rpx;
}

.btn-cancel, .btn-save {
  flex: 1;
  padding: 28rpx;
  border-radius: 14rpx;
  text-align: center;
  font-size: 32rpx;
  font-weight: 500;
}

.btn-cancel {
  background: #f0f0f0;
  color: #666;
}

.btn-save {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}
</style>
