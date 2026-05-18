<template>
  <view class="buddy-mood" :class="`mood-${currentMood}`">
    <!-- 心情图标 -->
    <view class="mood-icon-wrapper">
      <text class="mood-icon">{{ moodIcon }}</text>
      <view class="mood-glow" v-if="isActive"></view>
    </view>
    
    <!-- 心情文字 -->
    <view class="mood-info">
      <text class="mood-label">{{ moodLabel }}</text>
      <text class="mood-desc" v-if="showDescription">{{ moodDescription }}</text>
    </view>
    
    <!-- 心情历史 (可选) -->
    <view class="mood-history" v-if="showHistory && moodHistory.length > 0">
      <view class="history-label">心情记录</view>
      <view class="history-items">
        <view 
          v-for="(item, index) in moodHistory.slice(-5)" 
          :key="index"
          class="history-item"
          :class="`history-${item.mood}`"
        >
          <text class="history-icon">{{ getMoodIcon(item.mood) }}</text>
        </view>
      </view>
    </view>
    
    <!-- 鼓励提示 -->
    <view class="encouragement-tip" v-if="showEncouragement && encouragementText">
      <text class="tip-icon">💬</text>
      <text class="tip-text">{{ encouragementText }}</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  // 当前心情: happy | encouraging | excited | calm | sad | worried
  mood: {
    type: String,
    default: 'happy'
  },
  // 是否显示描述
  showDescription: {
    type: Boolean,
    default: true
  },
  // 是否显示历史
  showHistory: {
    type: Boolean,
    default: false
  },
  // 心情历史记录
  moodHistory: {
    type: Array,
    default: () => []
  },
  // 是否显示鼓励
  showEncouragement: {
    type: Boolean,
    default: false
  },
  // 鼓励文字
  encouragementText: {
    type: String,
    default: ''
  },
  // 是否活跃
  isActive: {
    type: Boolean,
    default: false
  }
})

const currentMood = ref(props.mood)

// 监听 mood 变化
watch(() => props.mood, (newMood) => {
  currentMood.value = newMood
})

// 心情图标映射
const moodIcons = {
  happy: '😊',
  encouraging: '🤗',
  excited: '🤩',
  calm: '😌',
  sad: '😢',
  worried: '😟'
}

// 心情标签映射
const moodLabels = {
  happy: '开心',
  encouraging: '鼓励中',
  excited: '兴奋',
  calm: '平静',
  sad: '难过',
  worried: '担心'
}

// 心情描述映射
const moodDescriptions = {
  happy: '今天心情很棒！',
  encouraging: '正在为你加油~',
  excited: '太激动了！',
  calm: '心情很平静',
  sad: '需要一些安慰...',
  worried: '有点担心你呢'
}

const moodIcon = computed(() => moodIcons[currentMood.value] || '😊')
const moodLabel = computed(() => moodLabels[currentMood.value] || '开心')
const moodDescription = computed(() => moodDescriptions[currentMood.value] || '')

// 获取心情图标
function getMoodIcon(mood) {
  return moodIcons[mood] || '😊'
}

// 获取鼓励信息
function getEncouragement() {
  if (!props.encouragementText) return ''
  return props.encouragementText
}

defineExpose({
  currentMood
})
</script>

<style scoped>
.buddy-mood {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  padding: 20rpx;
  background: #FFFFFF;
  border-radius: 20rpx;
  border: 2rpx solid #F3F4F6;
  transition: all 0.3s ease;
}

/* 心情颜色 */
.mood-happy {
  border-color: #FCD34D;
  background: linear-gradient(135deg, #FEF3C7 0%, #FFFFFF 100%);
}

.mood-encouraging {
  border-color: #34D399;
  background: linear-gradient(135deg, #D1FAE5 0%, #FFFFFF 100%);
}

.mood-excited {
  border-color: #F472B6;
  background: linear-gradient(135deg, #FCE7F3 0%, #FFFFFF 100%);
}

.mood-calm {
  border-color: #60A5FA;
  background: linear-gradient(135deg, #DBEAFE 0%, #FFFFFF 100%);
}

.mood-sad,
.mood-worried {
  border-color: #9CA3AF;
  background: linear-gradient(135deg, #F3F4F6 0%, #FFFFFF 100%);
}

.mood-icon-wrapper {
  position: relative;
  display: inline-block;
}

.mood-icon {
  font-size: 64rpx;
}

.mood-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 200, 0.6) 0%, transparent 70%);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.5;
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1.2);
  }
}

.mood-info {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.mood-label {
  font-size: 32rpx;
  font-weight: 600;
  color: #374151;
}

.mood-desc {
  font-size: 24rpx;
  color: #6B7280;
}

/* 心情历史 */
.mood-history {
  margin-top: 12rpx;
  padding-top: 12rpx;
  border-top: 1rpx solid #E5E7EB;
}

.history-label {
  font-size: 20rpx;
  color: #9CA3AF;
  margin-bottom: 8rpx;
}

.history-items {
  display: flex;
  gap: 8rpx;
}

.history-item {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F3F4F6;
}

.history-icon {
  font-size: 24rpx;
}

/* 鼓励提示 */
.encouragement-tip {
  display: flex;
  align-items: flex-start;
  gap: 12rpx;
  padding: 16rpx;
  background: #FEF3C7;
  border-radius: 12rpx;
  margin-top: 8rpx;
}

.tip-icon {
  font-size: 28rpx;
  flex-shrink: 0;
}

.tip-text {
  font-size: 24rpx;
  color: #92400E;
  line-height: 1.5;
}
</style>
