<template>
  <view class="activity-detail-page">
    <!-- 顶部活动信息 -->
    <view class="activity-header" :style="{ backgroundColor: dimension?.color + '20' }">
      <view class="header-icon">{{ activity?.icon }}</view>
      <view class="header-info">
        <text class="activity-title">{{ activity?.title }}</text>
        <view class="activity-tags">
          <text class="tag dimension-tag">{{ dimension?.name }}</text>
          <text class="tag difficulty-tag" :class="activity?.difficulty">
            {{ difficultyLabels[activity?.difficulty] }}
          </text>
        </view>
      </view>
    </view>

    <!-- 活动描述 -->
    <view class="section">
      <text class="section-title">活动介绍</text>
      <text class="section-text">{{ activity?.description }}</text>
    </view>

    <!-- 活动信息 -->
    <view class="section">
      <text class="section-title">活动信息</text>
      <view class="info-grid">
        <view class="info-item">
          <text class="info-icon">⏱️</text>
          <text class="info-label">预计时长</text>
          <text class="info-value">{{ activity?.duration }}分钟</text>
        </view>
        <view class="info-item">
          <text class="info-icon">📈</text>
          <text class="info-label">获得经验</text>
          <text class="info-value">+{{ exp }} exp</text>
        </view>
        <view class="info-item">
          <text class="info-icon">📊</text>
          <text class="info-label">难度等级</text>
          <text class="info-value">{{ difficultyLabels[activity?.difficulty] }}</text>
        </view>
        <view class="info-item">
          <text class="info-icon">🏷️</text>
          <text class="info-label">兴趣维度</text>
          <text class="info-value">{{ dimension?.name }}</text>
        </view>
      </view>
    </view>

    <!-- 完成记录 -->
    <view v-if="hasCompleted" class="section">
      <text class="section-title">完成记录</text>
      <view class="completion-records">
        <view 
          v-for="record in completionRecords" 
          :key="record.id"
          class="record-item"
        >
          <text class="record-icon">✓</text>
          <text class="record-text">{{ formatDate(record.completedAt) }}</text>
          <text class="record-exp">+{{ record.expGained }} exp</text>
        </view>
      </view>
    </view>

    <!-- 底部按钮 -->
    <view class="bottom-actions">
      <view 
        v-if="hasCompleted" 
        class="btn-recomplete"
        @tap="markComplete"
      >
        再次完成
      </view>
      <view 
        v-else 
        class="btn-complete"
        @tap="markComplete"
      >
        完成探索
      </view>
    </view>

    <!-- 完成弹窗 -->
    <view v-if="showCompleteModal" class="complete-modal-mask" @tap="closeModal">
      <view class="complete-modal" @tap.stop>
        <text class="modal-icon">🎉</text>
        <text class="modal-title">探索完成！</text>
        <text class="modal-subtitle">你完成了一次有趣的探索</text>
        <view class="exp gained">
          <text class="exp-label">经验 +{{ exp }}</text>
        </view>
        <view class="modal-btns">
          <view class="modal-btn primary" @tap="goToTracking">去追踪</view>
          <view class="modal-btn secondary" @tap="closeModal">继续探索</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onLoad } from '@dcloudio/uni-app'
import { useInterestDiscoveryStore } from '@/stores/interestDiscoveryStore.js'
import interestDiscoveryService from '@/services/interestDiscoveryService.js'

const store = useInterestDiscoveryStore()

let activityData = null

const activity = ref(null)
const showCompleteModal = ref(false)

const difficultyLabels = {
  easy: '简单',
  medium: '中等',
  hard: '挑战'
}

onLoad((options) => {
  if (options.activity) {
    activityData = JSON.parse(decodeURIComponent(options.activity))
    activity.value = activityData
  }
  store.loadExplorationRecords()
})

const dimension = computed(() => {
  if (!activity.value) return null
  return interestDiscoveryService.INTEREST_DIMENSIONS[activity.value.dimension]
})

const exp = computed(() => {
  if (!activity.value) return 0
  return interestDiscoveryService.calculateExplorationExp(activity.value.difficulty)
})

const hasCompleted = computed(() => {
  if (!activity.value) return false
  return store.explorationRecords.some(r => r.activityId === activity.value.id)
})

const completionRecords = computed(() => {
  if (!activity.value) return []
  return store.explorationRecords.filter(r => r.activityId === activity.value.id)
})

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
}

const markComplete = () => {
  if (!activity.value) return
  
  store.completeExploration(activity.value)
  showCompleteModal.value = true
}

const closeModal = () => {
  showCompleteModal.value = false
}

const goToTracking = () => {
  showCompleteModal.value = false
  uni.navigateTo({
    url: '/pages/interest-discovery/tracking?dimension=' + activity.value.dimension
  })
}
</script>

<style scoped>
.activity-detail-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding-bottom: 150rpx;
}

.activity-header {
  padding: 60rpx 40rpx;
  display: flex;
  align-items: center;
  gap: 30rpx;
}

.header-icon {
  font-size: 100rpx;
  width: 140rpx;
  height: 140rpx;
  background: #fff;
  border-radius: 30rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.1);
}

.header-info {
  flex: 1;
}

.activity-title {
  font-size: 40rpx;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 16rpx;
}

.activity-tags {
  display: flex;
  gap: 12rpx;
}

.tag {
  font-size: 24rpx;
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
}

.dimension-tag {
  background: #fff;
  color: #666;
}

.difficulty-tag {
  color: #fff;
}

.difficulty-tag.easy {
  background: #52c41a;
}

.difficulty-tag.medium {
  background: #faad14;
}

.difficulty-tag.hard {
  background: #ff4d4f;
}

.section {
  background: #fff;
  margin: 20rpx 30rpx;
  border-radius: 20rpx;
  padding: 30rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 16rpx;
}

.section-text {
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.info-item {
  background: #f8f9fa;
  border-radius: 12rpx;
  padding: 20rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.info-icon {
  font-size: 40rpx;
  margin-bottom: 8rpx;
}

.info-label {
  font-size: 22rpx;
  color: #999;
  display: block;
}

.info-value {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  display: block;
  margin-top: 4rpx;
}

.completion-records {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.record-item {
  display: flex;
  align-items: center;
  padding: 16rpx;
  background: #f8f9fa;
  border-radius: 10rpx;
}

.record-icon {
  width: 40rpx;
  height: 40rpx;
  background: #52c41a;
  color: #fff;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24rpx;
  margin-right: 16rpx;
}

.record-text {
  flex: 1;
  font-size: 26rpx;
  color: #666;
}

.record-exp {
  font-size: 24rpx;
  color: #52c41a;
  font-weight: 500;
}

.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 30rpx 40rpx;
  padding-bottom: calc(30rpx + env(safe-area-inset-bottom));
  background: #fff;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.btn-complete, .btn-recomplete {
  padding: 28rpx;
  border-radius: 14rpx;
  text-align: center;
  font-size: 32rpx;
  font-weight: 500;
}

.btn-complete {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.btn-recomplete {
  background: #f0f0f0;
  color: #666;
}

.complete-modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.complete-modal {
  width: 600rpx;
  background: #fff;
  border-radius: 24rpx;
  padding: 50rpx 40rpx;
  text-align: center;
}

.modal-icon {
  font-size: 100rpx;
  display: block;
  margin-bottom: 20rpx;
}

.modal-title {
  font-size: 40rpx;
  font-weight: 600;
  color: #333;
  display: block;
}

.modal-subtitle {
  font-size: 28rpx;
  color: #666;
  display: block;
  margin-bottom: 30rpx;
}

.exp.gained {
  display: inline-block;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 16rpx 40rpx;
  border-radius: 30rpx;
  margin-bottom: 30rpx;
}

.exp-label {
  color: #fff;
  font-size: 32rpx;
  font-weight: 600;
}

.modal-btns {
  display: flex;
  gap: 20rpx;
}

.modal-btn {
  flex: 1;
  padding: 24rpx;
  border-radius: 12rpx;
  font-size: 30rpx;
  font-weight: 500;
}

.modal-btn.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.modal-btn.secondary {
  background: #f0f0f0;
  color: #666;
}
</style>
