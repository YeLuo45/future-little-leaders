<template>
  <view class="gift-modal" v-if="visible" @click="onClose">
    <view class="modal-content" @click.stop>
      <view class="modal-header">
        <text class="title">送给 {{ friendName }} 积分</text>
        <text class="close-btn" @click="onClose">×</text>
      </view>

      <view class="friend-info">
        <text class="emoji">{{ friendEmoji }}</text>
        <text class="name">{{ friendName }}</text>
      </view>

      <view class="points-input-section">
        <text class="label">选择积分数量</text>
        <view class="points-presets">
          <view
            v-for="preset in presets"
            :key="preset"
            class="preset-item"
            :class="{ active: selectedPoints === preset }"
            @click="selectPreset(preset)"
          >
            {{ preset }}
          </view>
        </view>
        <input
          type="number"
          v-model="selectedPoints"
          class="points-input"
          placeholder="自定义积分"
          @input="onCustomInput"
        />
      </view>

      <view class="message-section">
        <text class="label">留言（选填）</text>
        <textarea
          v-model="message"
          class="message-input"
          placeholder="说点什么吧..."
          maxlength="50"
        ></textarea>
      </view>

      <view class="remaining-info">
        <text>今日剩余可赠送: {{ remainingPoints }} 积分</text>
        <text>我的积分: {{ myPoints }} 积分</text>
      </view>

      <view class="actions">
        <button class="cancel-btn" @click="onClose">取消</button>
        <button class="confirm-btn" @click="onConfirm" :disabled="!canSend">确认赠送</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  friend: {
    type: Object,
    default: null
  },
  remainingPoints: {
    type: Number,
    default: 50
  },
  myPoints: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['close', 'confirm'])

const presets = [5, 10, 20, 30, 50]
const selectedPoints = ref(10)
const message = ref('')

const friendName = computed(() => props.friend?.name || '小伙伴')

const friendEmoji = computed(() => {
  const emojis = ['👶', '👼', '🧒', '👦', '👧']
  const index = props.friend?.id?.charCodeAt(0) % 5 || 0
  return emojis[index]
})

const canSend = computed(() => {
  const points = parseInt(selectedPoints.value) || 0
  return points > 0 && points <= props.remainingPoints && points <= props.myPoints
})

const selectPreset = (preset) => {
  selectedPoints.value = preset
}

const onCustomInput = () => {
  // Custom input handled by v-model
}

const onClose = () => {
  emit('close')
}

const onConfirm = () => {
  if (!canSend.value) return
  emit('confirm', {
    points: parseInt(selectedPoints.value),
    message: message.value
  })
  resetForm()
}

const resetForm = () => {
  selectedPoints.value = 10
  message.value = ''
}

watch(() => props.visible, (val) => {
  if (val) {
    resetForm()
  }
})
</script>

<style scoped>
.gift-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  width: 100%;
  background: #ffffff;
  border-radius: 24rpx 24rpx 0 0;
  padding: 32rpx;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32rpx;
}

.title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
}

.close-btn {
  font-size: 48rpx;
  color: #999;
  padding: 0 16rpx;
}

.friend-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 32rpx;
}

.emoji {
  font-size: 80rpx;
  margin-bottom: 12rpx;
}

.name {
  font-size: 28rpx;
  color: #666;
}

.points-input-section {
  margin-bottom: 32rpx;
}

.label {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 16rpx;
  display: block;
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
  color: #ffffff;
}

.points-input {
  width: 100%;
  height: 88rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
  padding: 0 24rpx;
  font-size: 32rpx;
}

.message-section {
  margin-bottom: 32rpx;
}

.message-input {
  width: 100%;
  height: 160rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
  padding: 24rpx;
  font-size: 28rpx;
}

.remaining-info {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  margin-bottom: 32rpx;
  font-size: 24rpx;
  color: #999;
}

.actions {
  display: flex;
  gap: 24rpx;
}

.cancel-btn,
.confirm-btn {
  flex: 1;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 44rpx;
  font-size: 32rpx;
}

.cancel-btn {
  background: #f5f5f5;
  color: #666;
}

.confirm-btn {
  background: #8477fa;
  color: #ffffff;
}

.confirm-btn[disabled] {
  background: #ccc;
  color: #fff;
}
</style>
