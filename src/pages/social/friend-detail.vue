<template>
  <view class="friend-detail-page">
    <view class="header">
      <text class="page-title">同伴详情</text>
    </view>

    <view v-if="!friendInfo" class="empty-state">
      <text class="empty-icon">🔍</text>
      <text class="empty-text">未找到该同伴信息</text>
    </view>

    <view v-else class="content">
      <view class="profile-card">
        <view class="avatar-section">
          <image v-if="friendInfo.avatar" :src="friendInfo.avatar" class="avatar" mode="aspectFill" />
          <text v-else class="avatar-emoji">{{ emoji }}</text>
        </view>
        <view class="profile-info">
          <text class="name">{{ friendInfo.name || '神秘小伙伴' }}</text>
          <view class="tags">
            <text class="level-tag">Lv.{{ friendInfo.level || 1 }}</text>
            <text class="age-tag" v-if="friendInfo.birthdate">{{ formatAge(friendInfo.birthdate) }}</text>
          </view>
        </view>
      </view>

      <view class="stats-card">
        <view class="stat-item">
          <text class="stat-value">{{ friendInfo.points || 0 }}</text>
          <text class="stat-label">积分</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ friendInfo.taskCount || 0 }}</text>
          <text class="stat-label">完成任务</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ friendInfo.challengeWin || 0 }}</text>
          <text class="stat-label">挑战胜利</text>
        </view>
      </view>

      <view class="actions-card">
        <text class="card-title">互动</text>
        <view class="action-buttons">
          <button class="action-btn gift-btn" @click="openGiftModal">
            <text class="btn-icon">🎁</text>
            <text class="btn-text">送积分</text>
          </button>
          <button class="action-btn challenge-btn" @click="goChallenge">
            <text class="btn-icon">🏆</text>
            <text class="btn-text">发起挑战</text>
          </button>
        </view>
      </view>

      <view class="history-card">
        <text class="card-title">互动记录</text>
        <view class="history-list">
          <view v-if="giftHistory.length === 0" class="empty-history">
            <text>还没有互动记录</text>
          </view>
          <view v-else>
            <view v-for="item in giftHistory" :key="item.id" class="history-item">
              <view class="history-info">
                <text class="history-type">{{ item.type === 'sent' ? '送给TA' : '收到TA' }}</text>
                <text class="history-points" :class="item.type">{{ item.points }}分</text>
              </view>
              <text class="history-time">{{ formatTime(item.created_at) }}</text>
            </view>
          </view>
        </view>
      </view>

      <view class="danger-zone">
        <button class="remove-btn" @click="confirmRemove">删除好友</button>
      </view>
    </view>

    <gift-modal
      :visible="showGiftModal"
      :friend="friendInfo"
      :remaining-points="remainingDaily"
      :my-points="myPoints"
      @close="closeGiftModal"
      @confirm="confirmSendGift"
    />
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useFriendStore } from '@/stores/friendStore'
import { useBabyStore } from '@/stores/babyStore'
import { usePointsStore } from '@/stores/pointsStore'
import giftModal from '@/components/social/gift-modal.vue'

const friendStore = useFriendStore()
const babyStore = useBabyStore()
const pointsStore = usePointsStore()

const friendBabyId = ref('')
const showGiftModal = ref(false)

const friendInfo = computed(() => {
  if (!friendBabyId.value) return null
  const baby = babyStore.babies.find(b => b.id === friendBabyId.value)
  if (!baby) return null
  const points = pointsStore.getBabyPoints(friendBabyId.value)
  return {
    ...baby,
    points,
    level: Math.floor(points / 100) + 1
  }
})

const emoji = computed(() => {
  const emojis = ['👶', '👼', '🧒', '👦', '👧']
  const index = friendBabyId.value ? friendBabyId.value.charCodeAt(0) % 5 : 0
  return emojis[index]
})

const remainingDaily = computed(() => friendStore.getRemainingDailyGift())
const myPoints = computed(() => pointsStore.currentBabyPoints)

const giftHistory = computed(() => {
  if (!friendBabyId.value) return []
  const babyId = babyStore.currentBabyId

  const sent = friendStore.sentGifts
    .filter(g => g.to_baby_id === friendBabyId.value)
    .map(g => ({ ...g, type: 'sent' }))

  const received = friendStore.receivedGifts
    .filter(g => g.from_baby_id === friendBabyId.value)
    .map(g => ({ ...g, type: 'received' }))

  return [...sent, ...received].sort((a, b) => {
    return new Date(b.created_at) - new Date(a.created_at)
  })
})

const formatAge = (birthdate) => {
  return babyStore.formatAge(birthdate)
}

const formatTime = (isoString) => {
  const date = new Date(isoString)
  const now = new Date()
  const diff = now - date
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  return `${Math.floor(diff / 86400000)}天前`
}

const openGiftModal = () => {
  showGiftModal.value = true
}

const closeGiftModal = () => {
  showGiftModal.value = false
}

const confirmSendGift = async ({ points, message }) => {
  const success = await friendStore.sendGift(friendBabyId.value, points, message)
  if (success) {
    closeGiftModal()
  }
}

const goChallenge = () => {
  uni.navigateTo({ url: '/pages/social/challenge' })
}

const confirmRemove = () => {
  uni.showModal({
    title: '删除好友',
    content: '确定要删除该好友吗？删除后将不再显示在同伴列表中。',
    success: (res) => {
      if (res.confirm) {
        removeFriend()
      }
    }
  })
}

const removeFriend = () => {
  const friend = friendStore.friends.find(
    f => f.owner_baby_id === babyStore.currentBabyId && f.friend_baby_id === friendBabyId.value
  )
  if (friend) {
    friendStore.removeFriend(friend.id)
    uni.showToast({ title: '已删除', icon: 'success' })
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  }
}

onMounted(() => {
  friendStore.init()
  pointsStore.init()

  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  if (currentPage.options) {
    friendBabyId.value = currentPage.options.friendBabyId || ''
  }
})
</script>

<style scoped>
.friend-detail-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 24rpx;
}

.header {
  margin-bottom: 24rpx;
}

.page-title {
  font-size: 40rpx;
  font-weight: 700;
  color: #333;
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
  margin-bottom: 24rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.profile-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 32rpx;
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
}

.avatar-emoji {
  width: 120rpx;
  height: 120rpx;
  font-size: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border-radius: 50%;
}

.profile-info {
  flex: 1;
}

.name {
  font-size: 40rpx;
  font-weight: 700;
  color: #333;
  display: block;
  margin-bottom: 12rpx;
}

.tags {
  display: flex;
  gap: 12rpx;
}

.level-tag {
  font-size: 24rpx;
  color: #8477fa;
  background: rgba(132, 119, 250, 0.1);
  padding: 6rpx 16rpx;
  border-radius: 8rpx;
}

.age-tag {
  font-size: 24rpx;
  color: #666;
  background: #f5f5f5;
  padding: 6rpx 16rpx;
  border-radius: 8rpx;
}

.stats-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 32rpx;
  display: flex;
  justify-content: space-around;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 48rpx;
  font-weight: 700;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 24rpx;
  color: #999;
}

.actions-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 24rpx;
}

.card-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 20rpx;
}

.action-buttons {
  display: flex;
  gap: 24rpx;
}

.action-btn {
  flex: 1;
  height: 120rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 16rpx;
  border: none;
}

.gift-btn {
  background: linear-gradient(135deg, #ff9a9e 0%, #ffecd2 100%);
}

.challenge-btn {
  background: linear-gradient(135deg, #8477fa 0%, #a599fa 100%);
}

.btn-icon {
  font-size: 48rpx;
  margin-bottom: 8rpx;
}

.btn-text {
  font-size: 28rpx;
  color: #333;
}

.history-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 24rpx;
}

.history-list {
  margin-top: 16rpx;
}

.empty-history {
  text-align: center;
  padding: 40rpx 0;
  color: #999;
  font-size: 26rpx;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
}

.history-item:last-child {
  border-bottom: none;
}

.history-info {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.history-type {
  font-size: 26rpx;
  color: #666;
}

.history-points {
  font-size: 28rpx;
  font-weight: 600;
}

.history-points.sent {
  color: #ff6b6b;
}

.history-points.received {
  color: #51cf66;
}

.history-time {
  font-size: 22rpx;
  color: #999;
}

.danger-zone {
  margin-top: 24rpx;
}

.remove-btn {
  width: 100%;
  height: 88rpx;
  background: #fff;
  color: #ff6b6b;
  border: 1rpx solid #ff6b6b;
  border-radius: 44rpx;
  font-size: 32rpx;
}
</style>
