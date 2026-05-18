<template>
  <view class="points-mall-page">
    <!-- Points Banner -->
    <view class="points-banner">
      <view class="points-info">
        <text class="points-label">我的积分</text>
        <text class="points-value">{{ currentPoints }}</text>
      </view>
      <view class="points-actions">
        <view class="action-btn" @click="goToRecords">
          <text>积分记录</text>
        </view>
      </view>
    </view>

    <!-- Category Tabs -->
    <view class="category-tabs">
      <view
        v-for="cat in categories"
        :key="cat.id"
        class="tab-item"
        :class="{ active: currentCategory === cat.id }"
        @click="switchCategory(cat.id)"
      >
        <text class="tab-icon">{{ cat.icon }}</text>
        <text class="tab-name">{{ cat.name }}</text>
      </view>
    </view>

    <!-- Items Grid -->
    <scroll-view class="items-grid" scroll-y @scrolltolower="onScrollBottom">
      <view class="grid-container">
        <view
          v-for="item in displayItems"
          :key="item.id"
          class="item-card"
          @click="goToDetail(item)"
        >
          <view class="item-icon">{{ item.icon }}</view>
          <view class="item-info">
            <text class="item-name">{{ item.name }}</text>
            <text class="item-desc">{{ item.description }}</text>
            <view class="item-bottom">
              <view class="item-points">
                <text class="points-icon">⭐</text>
                <text class="points-num">{{ item.pointsCost }}</text>
              </view>
              <view class="exchange-btn" @click.stop="quickExchange(item)">
                兑换
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- Empty State -->
      <view v-if="displayItems.length === 0" class="empty-state">
        <text class="empty-icon">🎁</text>
        <text class="empty-text">暂无商品</text>
      </view>
    </scroll-view>

    <!-- Toast -->
    <view class="toast" v-if="toast.show" :class="toast.type">
      {{ toast.message }}
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRewardStore } from '@/stores/rewardStore.js'
import { usePointsStore } from '@/stores/pointsStore.js'
import { useBabyStore } from '@/stores/babyStore.js'
import { CATEGORY_NAMES, CATEGORY_ICONS, CATEGORIES } from '@/data/rewardItems.js'
import { exchangeReward } from '@/services/rewardService.js'

const rewardStore = useRewardStore()
const pointsStore = usePointsStore()
const babyStore = useBabyStore()

// State
const currentCategory = ref('all')
const toast = ref({ show: false, message: '', type: 'success' })

// Current Points
const currentPoints = computed(() => {
  const babyId = babyStore.currentBabyId
  return pointsStore.getBabyPoints(babyId)
})

// Categories (includes "all")
const categories = computed(() => {
  const cats = [
    { id: 'all', name: '全部', icon: '📦' },
    ...rewardStore.getActiveCategories()
  ]
  return cats
})

// Display items by category
const displayItems = computed(() => {
  return rewardStore.getItemsByCategory(currentCategory.value)
})

// Switch category
const switchCategory = (category) => {
  currentCategory.value = category
}

// Go to detail
const goToDetail = (item) => {
  uni.navigateTo({
    url: `/pages/reward/reward-detail?id=${item.id}`
  })
}

// Go to records
const goToRecords = () => {
  uni.navigateTo({
    url: '/pages/reward/exchange-records'
  })
}

// Quick exchange
const quickExchange = async (item) => {
  const babyId = babyStore.currentBabyId
  if (!babyId) {
    showToast('请先选择宝宝', 'error')
    return
  }

  // Check points
  if (currentPoints.value < item.pointsCost) {
    showToast('积分不足', 'error')
    return
  }

  const result = await exchangeReward(babyId, item.id)

  if (result.success) {
    showToast('兑换成功！')
    pointsStore.refreshPoints(babyId)
  } else {
    showToast(result.message, 'error')
  }
}

// Scroll to bottom
const onScrollBottom = () => {
  // Extend for load more
}

// Show toast
const showToast = (message, type = 'success') => {
  toast.value = { show: true, message, type }
  setTimeout(() => {
    toast.value.show = false
  }, 2000)
}

// Init
onMounted(async () => {
  await rewardStore.init()
})
</script>

<style scoped>
.points-mall-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.points-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx 40rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.points-info {
  display: flex;
  flex-direction: column;
}

.points-label {
  font-size: 24rpx;
  opacity: 0.9;
}

.points-value {
  font-size: 48rpx;
  font-weight: bold;
  margin-top: 8rpx;
}

.action-btn {
  padding: 16rpx 24rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 30rpx;
  font-size: 24rpx;
}

.category-tabs {
  display: flex;
  flex-wrap: wrap;
  padding: 20rpx;
  background: #fff;
  gap: 16rpx;
}

.tab-item {
  display: flex;
  align-items: center;
  padding: 12rpx 24rpx;
  border-radius: 30rpx;
  background: #f5f5f5;
  font-size: 24rpx;
  color: #666;
}

.tab-item.active {
  background: #667eea;
  color: #fff;
}

.tab-icon {
  margin-right: 8rpx;
}

.items-grid {
  height: calc(100vh - 300rpx);
  padding: 20rpx;
}

.grid-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.item-card {
  width: calc(50% - 10rpx);
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.item-icon {
  font-size: 80rpx;
  text-align: center;
  padding: 20rpx 0;
}

.item-info {
  display: flex;
  flex-direction: column;
}

.item-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.item-desc {
  font-size: 22rpx;
  color: #999;
  margin-bottom: 16rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-points {
  display: flex;
  align-items: center;
}

.points-icon {
  font-size: 24rpx;
  margin-right: 4rpx;
}

.points-num {
  font-size: 28rpx;
  color: #ff9500;
  font-weight: bold;
}

.exchange-btn {
  padding: 8rpx 24rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-radius: 20rpx;
  font-size: 22rpx;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
}

.empty-icon {
  font-size: 100rpx;
  margin-bottom: 20rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}

.toast {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.8);
  color: #fff;
  padding: 20rpx 40rpx;
  border-radius: 10rpx;
  font-size: 28rpx;
  z-index: 9999;
}

.toast.error {
  background: rgba(255, 59, 48, 0.9);
}
</style>
