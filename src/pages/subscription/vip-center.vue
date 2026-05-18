<template>
  <view class="vip-center-page">
    <!-- VIP Header -->
    <view class="vip-header" :class="{ 'is-vip': isVIP }">
      <view class="vip-badge">
        <text class="vip-icon">{{ isVIP ? '👑' : '⭐' }}</text>
        <view class="vip-info">
          <text class="vip-title">{{ isVIP ? 'VIP会员' : '普通用户' }}</text>
          <text class="vip-subtitle" v-if="isVIP">
            {{ vipInfo.daysLeft }}天后到期
          </text>
          <text class="vip-subtitle" v-else>
            开通VIP享专属特权
          </text>
        </view>
      </view>

      <!-- VIP Benefits Quick View -->
      <view class="benefits-preview" v-if="isVIP">
        <text class="benefit-tag" v-for="feature in displayFeatures" :key="feature.id">
          {{ feature.icon }} {{ feature.name }}
        </text>
      </view>
    </view>

    <!-- Subscription Plans -->
    <view class="plans-section">
      <text class="section-title">选择套餐</text>
      <view class="plans-grid">
        <view
          v-for="plan in availablePlans"
          :key="plan.id"
          class="plan-card"
          :class="{ recommended: plan.id === 'vip_yearly', selected: selectedPlan === plan.id }"
          @click="selectPlan(plan.id)"
        >
          <view class="plan-header">
            <text class="plan-name">{{ plan.name }}</text>
            <text class="plan-name-en">{{ plan.nameEn }}</text>
          </view>
          <view class="plan-price">
            <text class="currency">¥</text>
            <text class="amount">{{ plan.price }}</text>
          </view>
          <view class="plan-bonus">
            <text>赠送 {{ plan.points }} 积分</text>
          </view>
          <view class="plan-features">
            <text
              v-for="featureId in plan.features"
              :key="featureId"
              class="feature-item"
            >
              ✓ {{ getPrivilegeName(featureId) }}
            </text>
          </view>
          <view class="plan-tag" v-if="plan.id === 'vip_yearly'">
            推荐
          </view>
        </view>
      </view>
    </view>

    <!-- All Privileges -->
    <view class="privileges-section">
      <text class="section-title">VIP特权</text>
      <view class="privileges-grid">
        <view
          v-for="privilege in allPrivileges"
          :key="privilege.id"
          class="privilege-card"
        >
          <text class="privilege-icon">{{ privilege.icon }}</text>
          <text class="privilege-name">{{ privilege.name }}</text>
          <text class="privilege-desc">{{ privilege.description }}</text>
        </view>
      </view>
    </view>

    <!-- Subscribe Button -->
    <view class="subscribe-action">
      <button
        class="subscribe-btn"
        :class="{ 'is-vip': isVIP }"
        @click="handleSubscribe"
        :disabled="isSubscribing"
      >
        {{ isVIP ? '续订VIP' : '立即开通' }}
      </button>
      <view class="subscribe-note" v-if="!isVIP">
        <text>连续订阅享8折优惠</text>
      </view>
    </view>

    <!-- Subscription Management -->
    <view class="management-section" v-if="isVIP">
      <view class="section-title">订阅管理</view>
      <view class="management-card">
        <view class="info-row">
          <text class="label">当前套餐</text>
          <text class="value">{{ vipInfo?.planName || '-' }}</text>
        </view>
        <view class="info-row">
          <text class="label">到期时间</text>
          <text class="value">{{ formatDate(vipInfo?.expiresAt) }}</text>
        </view>
        <view class="info-row">
          <text class="label">自动续费</text>
          <switch
            :checked="vipInfo?.autoRenew"
            @change="toggleAutoRenew"
            color="#667eea"
          />
        </view>
      </view>

      <button class="cancel-btn" @click="handleCancel">取消订阅</button>
    </view>

    <!-- Toast -->
    <view class="toast" v-if="toast.show" :class="toast.type">
      {{ toast.message }}
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useSubscriptionStore } from '@/stores/subscriptionStore.js'
import { useBabyStore } from '@/stores/babyStore.js'
import { subscribeVIP, cancelVIP, VIP_PRIVILEGES } from '@/services/subscriptionService.js'

const subscriptionStore = useSubscriptionStore()
const babyStore = useBabyStore()

// State
const selectedPlan = ref('vip_monthly')
const isSubscribing = ref(false)
const toast = ref({ show: false, message: '', type: 'success' })

// VIP Status
const isVIP = computed(() => subscriptionStore.isCurrentBabyVIP)
const vipInfo = computed(() => subscriptionStore.currentBabyVIP)
const availablePlans = computed(() => subscriptionStore.availablePlans)
const allPrivileges = computed(() => subscriptionStore.allPrivileges)

// Display first 4 features as preview
const displayFeatures = computed(() => {
  const features = Object.values(VIP_PRIVILEGES)
  return features.slice(0, 4)
})

// Get privilege name by feature ID
const getPrivilegeName = (featureId) => {
  return VIP_PRIVILEGES[featureId]?.name || featureId
}

// Select plan
const selectPlan = (planId) => {
  selectedPlan.value = planId
}

// Format date
const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`
}

// Show toast
const showToast = (message, type = 'success') => {
  toast.value = { show: true, message, type }
  setTimeout(() => {
    toast.value.show = false
  }, 2000)
}

// Handle subscribe
const handleSubscribe = async () => {
  const babyId = babyStore.currentBabyId
  if (!babyId) {
    showToast('请先选择宝宝', 'error')
    return
  }

  isSubscribing.value = true

  try {
    const result = await subscribeVIP(babyId, selectedPlan.value)

    if (result.success) {
      showToast('订阅成功！')
      subscriptionStore.refresh()
    } else {
      showToast(result.message, 'error')
    }
  } catch (e) {
    showToast('订阅失败，请重试', 'error')
  } finally {
    isSubscribing.value = false
  }
}

// Toggle auto renew
const toggleAutoRenew = async (e) => {
  const babyId = babyStore.currentBabyId
  if (!babyId) return

  const enabled = e.detail.value

  if (!enabled) {
    try {
      const result = await cancelVIP(babyId)
      if (result.success) {
        showToast('已取消自动续费')
        subscriptionStore.refresh()
      } else {
        showToast(result.message, 'error')
        // Revert switch
        e.detail.value = true
      }
    } catch (e) {
      showToast('操作失败', 'error')
    }
  }
}

// Handle cancel
const handleCancel = async () => {
  const babyId = babyStore.currentBabyId
  if (!babyId) return

  try {
    const result = await cancelVIP(babyId)
    if (result.success) {
      showToast('已取消自动续费')
      subscriptionStore.refresh()
    } else {
      showToast(result.message, 'error')
    }
  } catch (e) {
    showToast('操作失败', 'error')
  }
}

// Init
onMounted(async () => {
  await subscriptionStore.init()
})
</script>

<style scoped>
.vip-center-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 40rpx;
}

.vip-header {
  background: linear-gradient(135deg, #a0a0a0 0%, #666666 100%);
  padding: 60rpx 40rpx 40rpx;
  color: #fff;
}

.vip-header.is-vip {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.vip-badge {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.vip-icon {
  font-size: 80rpx;
}

.vip-info {
  display: flex;
  flex-direction: column;
}

.vip-title {
  font-size: 40rpx;
  font-weight: bold;
}

.vip-subtitle {
  font-size: 24rpx;
  opacity: 0.9;
  margin-top: 8rpx;
}

.benefits-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-top: 30rpx;
}

.benefit-tag {
  padding: 8rpx 20rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20rpx;
  font-size: 22rpx;
}

.plans-section {
  padding: 40rpx 30rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 30rpx;
  display: block;
}

.plans-grid {
  display: flex;
  gap: 20rpx;
}

.plan-card {
  flex: 1;
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx 20rpx;
  position: relative;
  border: 2rpx solid #eee;
  transition: all 0.3s;
}

.plan-card.selected {
  border-color: #667eea;
  box-shadow: 0 4rpx 20rpx rgba(102, 126, 234, 0.2);
}

.plan-card.recommended {
  border-color: #667eea;
}

.plan-header {
  text-align: center;
  margin-bottom: 20rpx;
}

.plan-name {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  display: block;
}

.plan-name-en {
  font-size: 20rpx;
  color: #999;
}

.plan-price {
  text-align: center;
  margin-bottom: 10rpx;
}

.currency {
  font-size: 24rpx;
  color: #ff6b6b;
}

.amount {
  font-size: 48rpx;
  font-weight: bold;
  color: #ff6b6b;
}

.plan-bonus {
  text-align: center;
  font-size: 22rpx;
  color: #52c41a;
  margin-bottom: 20rpx;
}

.plan-features {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.feature-item {
  font-size: 20rpx;
  color: #666;
  text-align: center;
}

.plan-tag {
  position: absolute;
  top: -10rpx;
  right: 20rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
  font-size: 20rpx;
}

.privileges-section {
  padding: 0 30rpx 40rpx;
}

.privileges-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20rpx;
}

.privilege-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx 20rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10rpx;
}

.privilege-icon {
  font-size: 50rpx;
}

.privilege-name {
  font-size: 24rpx;
  font-weight: bold;
  color: #333;
}

.privilege-desc {
  font-size: 18rpx;
  color: #999;
  text-align: center;
}

.subscribe-action {
  padding: 0 30rpx 40rpx;
}

.subscribe-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-radius: 44rpx;
  font-size: 32rpx;
  font-weight: bold;
  border: none;
}

.subscribe-btn.is-vip {
  background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
}

.subscribe-note {
  text-align: center;
  margin-top: 20rpx;
  font-size: 22rpx;
  color: #999;
}

.management-section {
  padding: 0 30rpx;
}

.management-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.info-row:last-child {
  border-bottom: none;
}

.label {
  font-size: 28rpx;
  color: #666;
}

.value {
  font-size: 28rpx;
  color: #333;
}

.cancel-btn {
  width: 100%;
  height: 80rpx;
  background: #fff;
  color: #999;
  border-radius: 40rpx;
  font-size: 28rpx;
  margin-top: 30rpx;
  border: 1rpx solid #ddd;
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
