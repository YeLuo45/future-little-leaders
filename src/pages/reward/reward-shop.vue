<template>
  <view class="reward-shop-page">
    <!-- 顶部积分余额 -->
    <view class="points-banner">
      <view class="points-info">
        <text class="points-label">我的积分</text>
        <text class="points-value">{{ currentPoints }}</text>
      </view>
      <view class="points-actions">
        <view class="action-btn" @click="goToRecords">
          <text>兑换记录</text>
        </view>
      </view>
    </view>

    <!-- 分类Tab筛选 -->
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

    <!-- 商品列表 -->
    <scroll-view
      class="items-grid"
      scroll-y
      @scrolltolower="onScrollBottom"
    >
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
              <view class="exchange-btn">兑换</view>
            </view>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-if="displayItems.length === 0" class="empty-state">
        <text class="empty-icon">🎁</text>
        <text class="empty-text">暂无商品</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRewardStore } from '@/stores/rewardStore.js'
import { usePointsStore } from '@/stores/pointsStore.js'
import { useBabyStore } from '@/stores/babyStore.js'
import { CATEGORY_NAMES, CATEGORY_ICONS, CATEGORIES } from '@/data/rewardItems.js'

const rewardStore = useRewardStore()
const pointsStore = usePointsStore()
const babyStore = useBabyStore()

// 当前分类
const currentCategory = ref('all')

// 当前积分
const currentPoints = computed(() => {
  const babyId = babyStore.currentBabyId
  return pointsStore.getBabyPoints(babyId)
})

// 分类列表（包含"全部"）
const categories = computed(() => {
  const cats = [
    { id: 'all', name: '全部', icon: '📦' },
    ...rewardStore.getActiveCategories()
  ]
  return cats
})

// 根据当前分类筛选商品
const displayItems = computed(() => {
  return rewardStore.getItemsByCategory(currentCategory.value)
})

// 切换分类
const switchCategory = (category) => {
  currentCategory.value = category
}

// 跳转商品详情
const goToDetail = (item) => {
  uni.navigateTo({
    url: `/pages/reward/reward-detail?id=${item.id}`
  })
}

// 跳转兑换记录
const goToRecords = () => {
  uni.navigateTo({
    url: '/pages/reward/exchange-records'
  })
}

// 滚动到底部
const onScrollBottom = () => {
  // 可扩展加载更多
}

// 初始化
onMounted(async () => {
  await rewardStore.init()
})
</script>

<style scoped>
.reward-shop-page {
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
</style>
