<template>
  <view class="friends-page">
    <view class="header">
      <text class="page-title">我的同伴</text>
      <view class="header-actions">
        <button class="add-btn" @click="goAddFriend">添加同伴</button>
      </view>
    </view>

    <view class="tab-section">
      <view class="tab" :class="{ active: activeTab === 'friends' }" @click="activeTab = 'friends'">
        同伴 ({{ friends.length }})
      </view>
      <view class="tab" :class="{ active: activeTab === 'requests' }" @click="activeTab = 'requests'">
        邀请 ({{ pendingRequests.length }})
      </view>
      <view class="tab" :class="{ active: activeTab === 'gifts' }" @click="activeTab = 'gifts'">
        积分记录
      </view>
    </view>

    <view class="content-section">
      <!-- 同伴列表 -->
      <view v-if="activeTab === 'friends'" class="friends-list">
        <view v-if="friends.length === 0" class="empty-state">
          <text class="empty-icon">👫</text>
          <text class="empty-text">还没有同伴，快去添加吧~</text>
          <button class="add-first-btn" @click="goAddFriend">添加同伴</button>
        </view>
        <view v-else>
          <friend-card
            v-for="friend in friendsWithInfo"
            :key="friend.id"
            :friend="friend"
            @click="goFriendDetail"
            @gift="openGiftModal"
            @challenge="goChallenge"
          />
        </view>
      </view>

      <!-- 邀请列表 -->
      <view v-if="activeTab === 'requests'" class="requests-list">
        <view v-if="pendingRequests.length === 0" class="empty-state">
          <text class="empty-icon">📨</text>
          <text class="empty-text">暂无待处理的邀请</text>
        </view>
        <view v-else>
          <view v-for="request in pendingRequestsWithInfo" :key="request.id" class="request-card">
            <view class="request-info">
              <text class="emoji">{{ getEmoji(request.owner_baby_id) }}</text>
              <view class="request-details">
                <text class="name">{{ getBabyName(request.owner_baby_id) }}</text>
                <text class="time">{{ formatTime(request.created_at) }}</text>
              </view>
            </view>
            <view class="request-actions">
              <button class="reject-btn" @click="rejectRequest(request.id)">拒绝</button>
              <button class="accept-btn" @click="acceptRequest(request.id)">接受</button>
            </view>
          </view>
        </view>
      </view>

      <!-- 积分记录 -->
      <view v-if="activeTab === 'gifts'" class="gifts-list">
        <view class="gift-tabs">
          <view class="gift-tab" :class="{ active: giftTab === 'sent' }" @click="giftTab = 'sent'">
            已送出 ({{ sentGifts.length }})
          </view>
          <view class="gift-tab" :class="{ active: giftTab === 'received' }" @click="giftTab = 'received'">
            已收到 ({{ receivedGifts.length }})
          </view>
        </view>

        <view v-if="giftTab === 'sent'">
          <view v-if="sentGifts.length === 0" class="empty-state">
            <text class="empty-icon">🎁</text>
            <text class="empty-text">还没有送出过积分</text>
          </view>
          <view v-else>
            <view v-for="gift in sentGifts" :key="gift.id" class="gift-card sent">
              <view class="gift-info">
                <text class="points">-{{ gift.points }}</text>
                <text class="to">送给 {{ getBabyName(gift.to_baby_id) }}</text>
              </view>
              <text class="message" v-if="gift.message">{{ gift.message }}</text>
              <text class="time">{{ formatTime(gift.created_at) }}</text>
            </view>
          </view>
        </view>

        <view v-if="giftTab === 'received'">
          <view v-if="receivedGifts.length === 0" class="empty-state">
            <text class="empty-icon">🎁</text>
            <text class="empty-text">还没有收到过积分</text>
          </view>
          <view v-else>
            <view v-for="gift in receivedGifts" :key="gift.id" class="gift-card received">
              <view class="gift-info">
                <text class="points">+{{ gift.points }}</text>
                <text class="from">来自 {{ getBabyName(gift.from_baby_id) }}</text>
              </view>
              <text class="message" v-if="gift.message">{{ gift.message }}</text>
              <text class="time">{{ formatTime(gift.created_at) }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <gift-modal
      :visible="showGiftModal"
      :friend="selectedFriend"
      :remaining-points="remainingDailyGift"
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
import friendCard from '@/components/social/friend-card.vue'
import giftModal from '@/components/social/gift-modal.vue'

const friendStore = useFriendStore()
const babyStore = useBabyStore()
const pointsStore = usePointsStore()

const activeTab = ref('friends')
const giftTab = ref('sent')
const showGiftModal = ref(false)
const selectedFriend = ref(null)

const friends = computed(() => friendStore.currentBabyFriends)
const pendingRequests = computed(() => friendStore.pendingFriendRequests)
const sentGifts = computed(() => friendStore.sentGifts)
const receivedGifts = computed(() => friendStore.receivedGifts)
const remainingDailyGift = computed(() => friendStore.getRemainingDailyGift())
const myPoints = computed(() => pointsStore.currentBabyPoints)

const friendsWithInfo = computed(() => {
  return friends.value.map(f => {
    const baby = babyStore.babies.find(b => b.id === f.friend_baby_id)
    const points = pointsStore.getBabyPoints(f.friend_baby_id)
    return {
      ...f,
      ...baby,
      points,
      level: Math.floor(points / 100) + 1
    }
  })
})

const pendingRequestsWithInfo = computed(() => {
  return pendingRequests.value.map(r => ({
    ...r,
    ...babyStore.babies.find(b => b.id === r.owner_baby_id)
  }))
})

const getBabyName = (babyId) => {
  const baby = babyStore.babies.find(b => b.id === babyId)
  return baby?.name || '神秘小伙伴'
}

const getEmoji = (babyId) => {
  const emojis = ['👶', '👼', '🧒', '👦', '👧']
  const index = babyId ? babyId.charCodeAt(0) % 5 : 0
  return emojis[index]
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

const goAddFriend = () => {
  uni.navigateTo({ url: '/pages/social/add-friend' })
}

const goFriendDetail = (friend) => {
  uni.navigateTo({ url: `/pages/social/friend-detail?id=${friend.id}&friendBabyId=${friend.friend_baby_id}` })
}

const goChallenge = (friend) => {
  uni.navigateTo({ url: '/pages/social/challenge' })
}

const openGiftModal = (friend) => {
  selectedFriend.value = friend
  showGiftModal.value = true
}

const closeGiftModal = () => {
  showGiftModal.value = false
  selectedFriend.value = null
}

const confirmSendGift = async ({ points, message }) => {
  if (!selectedFriend.value) return
  const success = await friendStore.sendGift(selectedFriend.value.friend_baby_id, points, message)
  if (success) {
    closeGiftModal()
  }
}

const acceptRequest = (requestId) => {
  friendStore.acceptFriend(requestId)
  uni.showToast({ title: '已接受', icon: 'success' })
}

const rejectRequest = (requestId) => {
  friendStore.removeFriend(requestId)
  uni.showToast({ title: '已拒绝', icon: 'none' })
}

onMounted(() => {
  friendStore.init()
  pointsStore.init()
})
</script>

<style scoped>
.friends-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 24rpx;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.page-title {
  font-size: 40rpx;
  font-weight: 700;
  color: #333;
}

.add-btn {
  font-size: 26rpx;
  padding: 12rpx 24rpx;
  background: #8477fa;
  color: #fff;
  border-radius: 30rpx;
  border: none;
}

.tab-section {
  display: flex;
  background: #fff;
  border-radius: 16rpx;
  padding: 8rpx;
  margin-bottom: 24rpx;
}

.tab {
  flex: 1;
  text-align: center;
  padding: 20rpx;
  font-size: 28rpx;
  color: #666;
  border-radius: 12rpx;
}

.tab.active {
  background: #8477fa;
  color: #fff;
}

.content-section {
  min-height: 60vh;
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
  margin-bottom: 32rpx;
}

.add-first-btn {
  font-size: 28rpx;
  padding: 20rpx 48rpx;
  background: #8477fa;
  color: #fff;
  border-radius: 40rpx;
  border: none;
}

.request-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  background: #fff;
  border-radius: 16rpx;
  margin-bottom: 16rpx;
}

.request-info {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.emoji {
  font-size: 60rpx;
}

.request-details {
  display: flex;
  flex-direction: column;
}

.name {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
}

.time {
  font-size: 22rpx;
  color: #999;
}

.request-actions {
  display: flex;
  gap: 12rpx;
}

.reject-btn,
.accept-btn {
  font-size: 24rpx;
  padding: 12rpx 24rpx;
  border-radius: 8rpx;
  border: none;
}

.reject-btn {
  background: #f5f5f5;
  color: #666;
}

.accept-btn {
  background: #8477fa;
  color: #fff;
}

.gift-tabs {
  display: flex;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.gift-tab {
  flex: 1;
  text-align: center;
  padding: 16rpx;
  font-size: 26rpx;
  color: #666;
  background: #fff;
  border-radius: 12rpx;
}

.gift-tab.active {
  background: #8477fa;
  color: #fff;
}

.gift-card {
  padding: 24rpx;
  background: #fff;
  border-radius: 16rpx;
  margin-bottom: 16rpx;
}

.gift-info {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 8rpx;
}

.points {
  font-size: 36rpx;
  font-weight: 700;
}

.gift-card.sent .points {
  color: #ff6b6b;
}

.gift-card.received .points {
  color: #51cf66;
}

.to,
.from {
  font-size: 26rpx;
  color: #666;
}

.message {
  font-size: 26rpx;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.time {
  font-size: 22rpx;
  color: #999;
}
</style>
