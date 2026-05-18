<template>
  <view class="gift-points-page">
    <view class="header">
      <text class="page-title">赠送积分</text>
    </view>

    <view class="friend-select-section">
      <text class="section-label">选择好友</text>
      <scroll-view scroll-x class="friend-scroll">
        <view class="friend-list">
          <view
            v-for="friend in friends"
            :key="friend.id"
            class="friend-item"
            :class="{ active: selectedFriend?.id === friend.id }"
            @click="selectFriend(friend)"
          >
            <text class="emoji">{{ getFriendEmoji(friend) }}</text>
            <text class="name">{{ friend.name }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <view class="selected-friend-card" v-if="selectedFriend">
      <view class="friend-info">
        <text class="emoji">{{ getFriendEmoji(selectedFriend) }}</text>
        <view class="details">
          <text class="name">{{ selectedFriend.name }}</text>
          <text class="level">Lv.{{ selectedFriend.level }}</text>
        </view>
      </view>
    </view>

    <view class="points-section">
      <text class="section-label">选择积分数量</text>
      <view class="points-presets">
        <view
          v-for="preset in presets"
          :key="preset"
          class="preset-item"
          :class="{ active: selectedPoints === preset }"
          @click="selectedPoints = preset"
        >
          {{ preset }}
        </view>
      </view>
      <view class="custom-input-wrapper">
        <input
          type="number"
          v-model="selectedPoints"
          class="points-input"
          placeholder="自定义积分数量"
        />
      </view>
    </view>

    <view class="message-section">
      <text class="section-label">留言（选填）</text>
      <textarea
        v-model="message"
        class="message-input"
        placeholder="说点什么鼓励一下小伙伴吧..."
        maxlength="50"
      ></textarea>
      <text class="char-count">{{ message.length }}/50</text>
    </view>

    <view class="info-bar">
      <view class="info-item">
        <text class="label">我的积分</text>
        <text class="value">{{ myPoints }}</text>
      </view>
      <view class="info-item">
        <text class="label">今日剩余</text>
        <text class="value">{{ remainingDaily }} / 50</text>
      </view>
    </view>

    <view class="actions">
      <button class="confirm-btn" @click="confirmSend" :disabled="!canSend">确认赠送</button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useFriendStore } from '@/stores/friendStore'
import { useBabyStore } from '@/stores/babyStore'
import { usePointsStore } from '@/stores/pointsStore'

const friendStore = useFriendStore()
const babyStore = useBabyStore()
const pointsStore = usePointsStore()

const presets = [5, 10, 20, 30, 50]
const selectedFriend = ref(null)
const selectedPoints = ref(10)
const message = ref('')

const friends = computed(() => {
  return friendStore.currentBabyFriends.map(f => {
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

const myPoints = computed(() => pointsStore.currentBabyPoints)
const remainingDaily = computed(() => friendStore.getRemainingDailyGift())

const canSend = computed(() => {
  if (!selectedFriend.value) return false
  const points = parseInt(selectedPoints.value) || 0
  if (points <= 0) return false
  if (points > myPoints.value) return false
  if (points > remainingDaily.value) return false
  return true
})

const getFriendEmoji = (friend) => {
  const emojis = ['👶', '👼', '🧒', '👦', '👧']
  const index = friend.id ? friend.id.charCodeAt(0) % 5 : 0
  return emojis[index]
}

const selectFriend = (friend) => {
  selectedFriend.value = friend
}

const confirmSend = async () => {
  if (!canSend.value || !selectedFriend.value) return

  const success = await friendStore.sendGift(
    selectedFriend.value.friend_baby_id || selectedFriend.value.id,
    parseInt(selectedPoints.value),
    message.value
  )

  if (success) {
    uni.showToast({ title: '赠送成功', icon: 'success' })
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  }
}

onMounted(() => {
  friendStore.init()
  pointsStore.init()
})
</script>

<style scoped>
.gift-points-page {
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

.section-label {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 16rpx;
}

.friend-select-section {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
}

.friend-scroll {
  width: 100%;
}

.friend-list {
  display: flex;
  gap: 24rpx;
}

.friend-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16rpx;
  border-radius: 12rpx;
  background: #f5f5f5;
  min-width: 120rpx;
}

.friend-item.active {
  background: rgba(132, 119, 250, 0.1);
  border: 2rpx solid #8477fa;
}

.friend-item .emoji {
  font-size: 48rpx;
  margin-bottom: 8rpx;
}

.friend-item .name {
  font-size: 24rpx;
  color: #333;
  max-width: 120rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.selected-friend-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
}

.friend-info {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.friend-info .emoji {
  font-size: 60rpx;
}

.details {
  flex: 1;
}

.details .name {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  display: block;
}

.details .level {
  font-size: 24rpx;
  color: #8477fa;
}

.points-section {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
}

.points-presets {
  display: flex;
  gap: 16rpx;
  margin-bottom: 16rpx;
}

.preset-item {
  flex: 1;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #666;
}

.preset-item.active {
  background: #8477fa;
  color: #fff;
}

.custom-input-wrapper {
  margin-top: 16rpx;
}

.points-input {
  width: 100%;
  height: 88rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
  padding: 0 24rpx;
  font-size: 32rpx;
  text-align: center;
}

.message-section {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  position: relative;
}

.message-input {
  width: 100%;
  height: 160rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
  padding: 24rpx;
  font-size: 28rpx;
}

.char-count {
  position: absolute;
  right: 40rpx;
  bottom: 40rpx;
  font-size: 22rpx;
  color: #999;
}

.info-bar {
  display: flex;
  gap: 24rpx;
  margin-bottom: 32rpx;
}

.info-item {
  flex: 1;
  background: #fff;
  border-radius: 12rpx;
  padding: 20rpx;
  text-align: center;
}

.info-item .label {
  font-size: 24rpx;
  color: #666;
  display: block;
  margin-bottom: 8rpx;
}

.info-item .value {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.actions {
  margin-top: 24rpx;
}

.confirm-btn {
  height: 88rpx;
  background: #8477fa;
  color: #fff;
  border-radius: 44rpx;
  font-size: 32rpx;
  border: none;
}

.confirm-btn[disabled] {
  background: #ccc;
  color: #fff;
}
</style>
