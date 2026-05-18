<template>
  <view class="exchange-records-page">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <view class="back-btn" @click="goBack">
        <text>←</text>
      </view>
      <text class="nav-title">兑换记录</text>
      <view class="nav-placeholder"></view>
    </view>

    <!-- 积分余额提示 -->
    <view class="points-tip">
      <text>当前积分：</text>
      <text class="points-value">{{ currentPoints }}</text>
    </view>

    <!-- 记录列表 -->
    <scroll-view class="records-list" scroll-y @scrolltolower="onScrollBottom">
      <view v-if="records.length > 0" class="records-container">
        <view
          v-for="record in records"
          :key="record.id"
          class="record-item"
        >
          <view class="record-icon">{{ record.rewardItemIcon || '🎁' }}</view>
          <view class="record-info">
            <text class="record-name">{{ record.rewardItemName }}</text>
            <text class="record-time">{{ formatTime(record.exchangedAt) }}</text>
          </view>
          <view class="record-points">
            <text class="points-cost">-{{ record.pointsCost }}</text>
            <text class="record-status" :class="record.status">{{ getStatusText(record.status) }}</text>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-else class="empty-state">
        <text class="empty-icon">📜</text>
        <text class="empty-text">暂无兑换记录</text>
        <view class="empty-action" @click="goToShop">
          <text>去兑换</text>
        </view>
      </view>

      <!-- 加载更多 -->
      <view v-if="hasMore && records.length > 0" class="load-more">
        <text>加载中...</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useBabyStore } from '@/stores/babyStore.js'
import { usePointsStore } from '@/stores/pointsStore.js'
import { getExchangeRecords } from '@/services/rewardService.js'

const babyStore = useBabyStore()
const pointsStore = usePointsStore()

// 兑换记录
const records = ref([])

// 分页
const page = ref(1)
const pageSize = 20
const hasMore = ref(false)

// 当前积分
const currentPoints = computed(() => {
  const babyId = babyStore.currentBabyId
  return pointsStore.getBabyPoints(babyId)
})

// 返回
const goBack = () => {
  uni.navigateBack()
}

// 格式化时间
const formatTime = (timeStr) => {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hour}:${minute}`
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    completed: '已完成',
    pending: '处理中',
    failed: '失败'
  }
  return statusMap[status] || status
}

// 加载记录
const loadRecords = () => {
  const babyId = babyStore.currentBabyId
  if (!babyId) return

  const allRecords = getExchangeRecords(babyId)
  records.value = allRecords.slice(0, page.value * pageSize)
  hasMore.value = allRecords.length > page.value * pageSize
}

// 滚动到底部
const onScrollBottom = () => {
  if (hasMore.value) {
    page.value++
    loadRecords()
  }
}

// 去商城
const goToShop = () => {
  uni.navigateTo({
    url: '/pages/reward/reward-shop'
  })
}

// 初始化
onMounted(() => {
  loadRecords()
})
</script>

<style scoped>
.exchange-records-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx 40rpx;
  background: #fff;
}

.back-btn {
  font-size: 40rpx;
  color: #333;
  padding: 10rpx;
}

.nav-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.nav-placeholder {
  width: 60rpx;
}

.points-tip {
  padding: 20rpx 40rpx;
  background: #fff;
  font-size: 26rpx;
  color: #666;
  display: flex;
  align-items: center;
}

.points-value {
  color: #667eea;
  font-weight: bold;
  margin-left: 8rpx;
}

.records-list {
  height: calc(100vh - 200rpx);
  padding: 20rpx;
}

.records-container {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.record-item {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
}

.record-icon {
  font-size: 56rpx;
  margin-right: 20rpx;
}

.record-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.record-name {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
  margin-bottom: 8rpx;
}

.record-time {
  font-size: 22rpx;
  color: #999;
}

.record-points {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.points-cost {
  font-size: 28rpx;
  color: #ff4d4f;
  font-weight: bold;
  margin-bottom: 4rpx;
}

.record-status {
  font-size: 20rpx;
  padding: 4rpx 12rpx;
  border-radius: 10rpx;
}

.record-status.completed {
  background: #e6f7e6;
  color: #52c41a;
}

.record-status.pending {
  background: #fff7e6;
  color: #faad14;
}

.record-status.failed {
  background: #fff1f0;
  color: #ff4d4f;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 200rpx 0;
}

.empty-icon {
  font-size: 100rpx;
  margin-bottom: 20rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
  margin-bottom: 40rpx;
}

.empty-action {
  padding: 20rpx 60rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-radius: 50rpx;
  font-size: 28rpx;
}

.load-more {
  text-align: center;
  padding: 30rpx;
  font-size: 24rpx;
  color: #999;
}
</style>
