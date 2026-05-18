<template>
  <view class="friend-card" @click="onClick">
    <view class="avatar-section">
      <image v-if="friend.avatar" :src="friend.avatar" class="avatar" mode="aspectFill" />
      <text v-else class="avatar-emoji">{{ defaultEmoji }}</text>
    </view>
    <view class="info-section">
      <text class="name">{{ friend.name || '小伙伴' }}</text>
      <view class="stats">
        <text class="level">Lv.{{ friend.level || 1 }}</text>
        <text class="points">{{ friend.points || 0 }}积分</text>
      </view>
    </view>
    <view class="action-section">
      <slot name="actions">
        <button class="action-btn" @click.stop="onGiftClick" v-if="showGiftBtn">送积分</button>
        <button class="action-btn primary" @click.stop="onChallengeClick" v-if="showChallengeBtn">挑战</button>
      </slot>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  friend: {
    type: Object,
    required: true
  },
  showGiftBtn: {
    type: Boolean,
    default: true
  },
  showChallengeBtn: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['click', 'gift', 'challenge'])

const defaultEmoji = computed(() => {
  const emojis = ['👶', '👼', '🧒', '👦', '👧']
  const index = props.friend.id ? props.friend.id.charCodeAt(0) % 5 : 0
  return emojis[index]
})

const onClick = () => {
  emit('click', props.friend)
}

const onGiftClick = () => {
  emit('gift', props.friend)
}

const onChallengeClick = () => {
  emit('challenge', props.friend)
}
</script>

<style scoped>
.friend-card {
  display: flex;
  align-items: center;
  padding: 24rpx;
  background: #ffffff;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.avatar-section {
  margin-right: 24rpx;
}

.avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
}

.avatar-emoji {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100rpx;
  height: 100rpx;
  font-size: 60rpx;
  background: #f5f5f5;
  border-radius: 50%;
}

.info-section {
  flex: 1;
}

.name {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 8rpx;
}

.stats {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.level {
  font-size: 24rpx;
  color: #8477fa;
  background: rgba(132, 119, 250, 0.1);
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
}

.points {
  font-size: 24rpx;
  color: #666;
}

.action-section {
  display: flex;
  gap: 12rpx;
}

.action-btn {
  font-size: 24rpx;
  padding: 12rpx 24rpx;
  border-radius: 8rpx;
  background: #f5f5f5;
  color: #666;
  border: none;
}

.action-btn.primary {
  background: #8477fa;
  color: #ffffff;
}
</style>
