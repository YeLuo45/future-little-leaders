<template>
  <view class="bounty-board-page">
    <!-- Header -->
    <view class="board-header">
      <view class="header-info">
        <text class="header-title">悬赏任务</text>
        <text class="header-subtitle">完成悬赏任务获取双倍积分</text>
      </view>
      <view class="vip-badge" v-if="isVIP">
        <text>👑 VIP双倍</text>
      </view>
    </view>

    <!-- Bounty Types -->
    <view class="bounty-types">
      <view
        v-for="type in bountyTypes"
        :key="type.id"
        class="type-item"
        :class="{ active: currentType === type.id }"
        @click="switchType(type.id)"
      >
        <text class="type-icon">{{ type.icon }}</text>
        <text class="type-name">{{ type.name }}</text>
      </view>
    </view>

    <!-- Bounty Tasks -->
    <scroll-view class="bounty-list" scroll-y>
      <view class="bounty-container">
        <view
          v-for="task in displayTasks"
          :key="task.id"
          class="bounty-card"
          :class="{ 'is-claimed': isClaimed(task.id), 'is-expired': isTaskExpired(task) }"
        >
          <!-- Bounty Header -->
          <view class="bounty-header">
            <view class="bounty-type-tag">
              <text>{{ getBountyTypeInfo(task.bountyType)?.icon }}</text>
              <text>{{ getBountyTypeInfo(task.bountyType)?.name }}</text>
            </view>
            <view class="bounty-points">
              <text class="points-icon">⭐</text>
              <text class="points-value">{{ task.points }}</text>
              <text class="points-multi" v-if="isVIP">×2</text>
            </view>
          </view>

          <!-- Bounty Content -->
          <view class="bounty-content">
            <text class="bounty-title">{{ task.title }}</text>
            <text class="bounty-desc">{{ task.description }}</text>
          </view>

          <!-- Bounty Footer -->
          <view class="bounty-footer">
            <view class="bounty-meta">
              <text class="meta-item" v-if="task.expiresAt">
                ⏰ {{ formatTimeLeft(task.expiresAt) }}
              </text>
              <text class="meta-item">
                👥 {{ task.claimantCount || 0 }}人已领取
              </text>
            </view>

            <view class="bounty-action">
              <view
                v-if="isTaskExpired(task)"
                class="action-btn expired"
              >
                已过期
              </view>
              <view
                v-else-if="isClaimed(task.id)"
                class="action-btn claimed"
              >
                已领取
              </view>
              <view
                v-else
                class="action-btn claim"
                @click="claimTask(task)"
              >
                立即领取
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- Empty State -->
      <view v-if="displayTasks.length === 0" class="empty-state">
        <text class="empty-icon">🎯</text>
        <text class="empty-text">暂无可领取的悬赏任务</text>
      </view>
    </scroll-view>

    <!-- My Claims Section -->
    <view class="my-claims-section">
      <view class="section-header" @click="toggleClaims">
        <text class="section-title">我的悬赏记录</text>
        <text class="toggle-icon">{{ showClaims ? '▲' : '▼' }}</text>
      </view>

      <view class="claims-list" v-if="showClaims">
        <view
          v-for="claim in myClaims"
          :key="claim.id"
          class="claim-item"
        >
          <view class="claim-info">
            <text class="claim-status" :class="claim.status">
              {{ claim.status === 'completed' ? '✅' : '⏳' }}
            </text>
            <text class="claim-task">{{ claim.taskTitle || '悬赏任务' }}</text>
          </view>
          <text class="claim-date">{{ formatDate(claim.claimedAt) }}</text>
        </view>

        <view v-if="myClaims.length === 0" class="empty-claims">
          <text>暂无悬赏记录</text>
        </view>
      </view>
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
import { claimBounty, completeBounty, BOUNTY_TYPES } from '@/services/subscriptionService.js'

const subscriptionStore = useSubscriptionStore()
const babyStore = useBabyStore()

// State
const currentType = ref('all')
const showClaims = ref(false)
const toast = ref({ show: false, message: '', type: 'success' })

// VIP status
const isVIP = computed(() => subscriptionStore.isCurrentBabyVIP)

// Bounty types
const bountyTypes = computed(() => Object.values(BOUNTY_TYPES))

// Get bounty type info
const getBountyTypeInfo = (typeId) => {
  return BOUNTY_TYPES[typeId]
}

// Display tasks by type filter
const displayTasks = computed(() => {
  const tasks = subscriptionStore.currentBabyBounties
  if (currentType.value === 'all') {
    return tasks
  }
  return tasks.filter(t => t.bountyType === currentType.value)
})

// My claims
const myClaims = computed(() => subscriptionStore.currentBabyBountyClaims)

// Switch type filter
const switchType = (typeId) => {
  currentType.value = typeId
}

// Check if task is claimed
const isClaimed = (taskId) => {
  return subscriptionStore.isBountyClaimed(taskId)
}

// Check if task is expired
const isTaskExpired = (task) => {
  if (!task.expiresAt) return false
  return new Date(task.expiresAt) < new Date()
}

// Format time left
const formatTimeLeft = (expiresAt) => {
  if (!expiresAt) return '无期限'
  const now = new Date()
  const expiry = new Date(expiresAt)
  const diff = expiry - now

  if (diff <= 0) return '已过期'

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

  if (days > 0) return `${days}天${hours}小时`
  if (hours > 0) return `${hours}小时`
  return '即将过期'
}

// Format date
const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
}

// Toggle claims visibility
const toggleClaims = () => {
  showClaims.value = !showClaims.value
}

// Claim task
const handleClaimTask = async (task) => {
  const babyId = babyStore.currentBabyId
  if (!babyId) {
    showToast('请先选择宝宝', 'error')
    return
  }

  const result = await claimBounty(babyId, task.id)

  if (result.success) {
    showToast('领取成功！')
    subscriptionStore.refresh()
  } else {
    showToast(result.message, 'error')
  }
}

// Alias for template
const claimTask = handleClaimTask

// Show toast
const showToast = (message, type = 'success') => {
  toast.value = { show: true, message, type }
  setTimeout(() => {
    toast.value.show = false
  }, 2000)
}

// Init
onMounted(async () => {
  await subscriptionStore.init()
})
</script>

<style scoped>
.bounty-board-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.board-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 40rpx 30rpx;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: #fff;
}

.header-title {
  font-size: 36rpx;
  font-weight: bold;
}

.header-subtitle {
  font-size: 24rpx;
  opacity: 0.9;
  margin-top: 8rpx;
}

.vip-badge {
  background: rgba(255, 255, 255, 0.2);
  padding: 10rpx 20rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
}

.bounty-types {
  display: flex;
  gap: 16rpx;
  padding: 20rpx 30rpx;
  background: #fff;
  overflow-x: auto;
}

.type-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 24rpx;
  background: #f5f5f5;
  border-radius: 30rpx;
  white-space: nowrap;
}

.type-item.active {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: #fff;
}

.type-icon {
  font-size: 28rpx;
}

.type-name {
  font-size: 24rpx;
}

.bounty-list {
  height: calc(100vh - 500rpx);
  padding: 20rpx 30rpx;
}

.bounty-container {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.bounty-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.bounty-card.is-claimed {
  opacity: 0.7;
}

.bounty-card.is-expired {
  opacity: 0.5;
}

.bounty-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.bounty-type-tag {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 6rpx 16rpx;
  background: #fff0f0;
  border-radius: 20rpx;
  font-size: 22rpx;
  color: #f5576c;
}

.bounty-points {
  display: flex;
  align-items: center;
  gap: 4rpx;
}

.points-icon {
  font-size: 24rpx;
}

.points-value {
  font-size: 32rpx;
  font-weight: bold;
  color: #ff9500;
}

.points-multi {
  font-size: 20rpx;
  color: #52c41a;
  margin-left: 4rpx;
}

.bounty-content {
  margin-bottom: 16rpx;
}

.bounty-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.bounty-desc {
  font-size: 24rpx;
  color: #666;
  display: block;
}

.bounty-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16rpx;
  border-top: 1rpx solid #f0f0f0;
}

.bounty-meta {
  display: flex;
  gap: 20rpx;
}

.meta-item {
  font-size: 22rpx;
  color: #999;
}

.bounty-action {
  display: flex;
}

.action-btn {
  padding: 10rpx 24rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
}

.action-btn.claim {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: #fff;
}

.action-btn.claimed {
  background: #f5f5f5;
  color: #999;
}

.action-btn.expired {
  background: #f5f5f5;
  color: #ccc;
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
  font-size: 28rpx;
  color: #999;
}

.my-claims-section {
  background: #fff;
  margin-top: 20rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.section-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.toggle-icon {
  font-size: 24rpx;
  color: #999;
}

.claims-list {
  padding: 0 30rpx 20rpx;
}

.claim-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.claim-item:last-child {
  border-bottom: none;
}

.claim-info {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.claim-status {
  font-size: 28rpx;
}

.claim-status.completed {
  color: #52c41a;
}

.claim-status.in_progress {
  color: #faad14;
}

.claim-task {
  font-size: 26rpx;
  color: #333;
}

.claim-date {
  font-size: 22rpx;
  color: #999;
}

.empty-claims {
  text-align: center;
  padding: 40rpx;
  color: #999;
  font-size: 24rpx;
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
