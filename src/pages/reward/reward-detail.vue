<template>
  <view class="reward-detail-page">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <view class="back-btn" @click="goBack">
        <text>←</text>
      </view>
      <text class="nav-title">商品详情</text>
      <view class="nav-placeholder"></view>
    </view>

    <!-- 商品信息 -->
    <view v-if="item" class="detail-content">
      <!-- 大图标 -->
      <view class="item-hero">
        <text class="hero-icon">{{ item.icon }}</text>
      </view>

      <!-- 基本信息 -->
      <view class="item-header">
        <text class="item-name">{{ item.name }}</text>
        <view class="category-tag">
          <text>{{ categoryName }}</text>
        </view>
      </view>

      <!-- 描述 -->
      <view class="item-desc-section">
        <text class="section-title">商品说明</text>
        <text class="item-desc">{{ item.description }}</text>
      </view>

      <!-- 积分信息 -->
      <view class="points-section">
        <view class="points-card">
          <text class="points-label">所需积分</text>
          <view class="points-display">
            <text class="points-icon">⭐</text>
            <text class="points-value">{{ item.pointsCost }}</text>
          </view>
        </view>
        <view class="balance-card">
          <text class="balance-label">我的积分</text>
          <view class="balance-display">
            <text class="balance-value">{{ currentPoints }}</text>
          </view>
        </view>
      </view>

      <!-- 积分提示 -->
      <view v-if="currentPoints < item.pointsCost" class="insufficient-tip">
        <text>⚠️ 积分不足，还需 {{ item.pointsCost - currentPoints }} 积分</text>
      </view>

      <!-- 库存提示 -->
      <view class="stock-tip">
        <text v-if="item.stock === -1">📦 库存：无限</text>
        <text v-else>📦 库存：{{ item.stock }}</text>
      </view>
    </view>

    <!-- 空状态 -->
    <view v-else class="empty-state">
      <text class="empty-icon">❓</text>
      <text class="empty-text">商品不存在</text>
    </view>

    <!-- 底部兑换按钮 -->
    <view v-if="item" class="bottom-bar">
      <view class="exchange-button" :class="{ disabled: !canExchange }" @click="handleExchange">
        <text v-if="isExchanging">兑换中...</text>
        <text v-else-if="hasExchangedItem">已兑换</text>
        <text v-else>立即兑换</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRewardStore } from '@/stores/rewardStore.js'
import { usePointsStore } from '@/stores/pointsStore.js'
import { useBabyStore } from '@/stores/babyStore.js'
import { exchangeReward, hasExchanged } from '@/services/rewardService.js'
import { CATEGORY_NAMES } from '@/data/rewardItems.js'

const rewardStore = useRewardStore()
const pointsStore = usePointsStore()
const babyStore = useBabyStore()

// 商品ID
const itemId = ref('')

// 当前商品
const item = ref(null)

// 兑换中状态
const isExchanging = ref(false)

// 分类名称
const categoryName = computed(() => {
  if (!item.value) return ''
  return CATEGORY_NAMES[item.value.category] || item.value.category
})

// 当前积分
const currentPoints = computed(() => {
  const babyId = babyStore.currentBabyId
  return pointsStore.getBabyPoints(babyId)
})

// 是否可以兑换
const canExchange = computed(() => {
  if (!item.value) return false
  if (hasExchangedItem.value) return false
  return currentPoints.value >= item.value.pointsCost
})

// 是否已兑换过此商品
const hasExchangedItem = computed(() => {
  const babyId = babyStore.currentBabyId
  if (!babyId || !item.value) return false
  return hasExchanged(babyId, item.value.id)
})

// 返回上一页
const goBack = () => {
  uni.navigateBack()
}

// 处理兑换
const handleExchange = async () => {
  if (!canExchange.value || isExchanging.value) return

  // 确认兑换
  uni.showModal({
    title: '确认兑换',
    content: `确定要兑换「${item.value.name}」吗？将消耗 ${item.value.pointsCost} 积分。`,
    success: async (res) => {
      if (res.confirm) {
        await doExchange()
      }
    }
  })
}

// 执行兑换
const doExchange = async () => {
  const babyId = babyStore.currentBabyId
  if (!babyId) {
    uni.showToast({ title: '请先选择宝宝', icon: 'none' })
    return
  }

  isExchanging.value = true

  try {
    const result = await exchangeReward(babyId, item.value.id)

    if (result.success) {
      uni.showToast({ title: '兑换成功！', icon: 'success' })
      // 延迟返回，让用户看到成功提示
      setTimeout(() => {
        goBack()
      }, 1500)
    } else {
      uni.showToast({ title: result.message, icon: 'none' })
    }
  } catch (e) {
    console.error('[V12] 兑换异常:', e)
    uni.showToast({ title: '兑换失败，请重试', icon: 'none' })
  } finally {
    isExchanging.value = false
  }
}

// 初始化
onMounted(async () => {
  await rewardStore.init()

  // 获取页面参数
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = currentPage.options || {}

  if (options.id) {
    itemId.value = options.id
    item.value = rewardStore.getItemById(itemId.value)
  }
})
</script>

<style scoped>
.reward-detail-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120rpx;
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

.detail-content {
  padding: 20rpx;
}

.item-hero {
  background: #fff;
  border-radius: 24rpx;
  padding: 60rpx;
  text-align: center;
  margin-bottom: 20rpx;
}

.hero-icon {
  font-size: 160rpx;
}

.item-header {
  background: #fff;
  border-radius: 24rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.item-name {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.category-tag {
  padding: 8rpx 20rpx;
  background: #667eea;
  color: #fff;
  border-radius: 20rpx;
  font-size: 22rpx;
}

.item-desc-section {
  background: #fff;
  border-radius: 24rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 16rpx;
  display: block;
}

.item-desc {
  font-size: 26rpx;
  color: #666;
  line-height: 1.6;
}

.points-section {
  display: flex;
  gap: 20rpx;
  margin-bottom: 20rpx;
}

.points-card,
.balance-card {
  flex: 1;
  background: #fff;
  border-radius: 24rpx;
  padding: 30rpx;
  text-align: center;
}

.points-label,
.balance-label {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 12rpx;
  display: block;
}

.points-display,
.balance-display {
  display: flex;
  align-items: center;
  justify-content: center;
}

.points-icon {
  font-size: 32rpx;
  margin-right: 8rpx;
}

.points-value {
  font-size: 48rpx;
  font-weight: bold;
  color: #ff9500;
}

.balance-value {
  font-size: 48rpx;
  font-weight: bold;
  color: #667eea;
}

.insufficient-tip {
  background: #fff0f0;
  color: #ff4d4f;
  padding: 20rpx 30rpx;
  border-radius: 16rpx;
  font-size: 24rpx;
  text-align: center;
  margin-bottom: 20rpx;
}

.stock-tip {
  text-align: center;
  font-size: 24rpx;
  color: #999;
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
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx 40rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background: #fff;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.exchange-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  text-align: center;
  padding: 28rpx 0;
  border-radius: 50rpx;
  font-size: 32rpx;
  font-weight: bold;
}

.exchange-button.disabled {
  background: #ccc;
  color: #fff;
}
</style>
