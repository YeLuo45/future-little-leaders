<template>
  <view class="buddy-avatar" :class="[`mood-${currentMood}`, `expression-${expression}`, { 'is-animating': isAnimating }]">
    <!-- 头像容器 -->
    <view class="avatar-wrapper" @click="handleAvatarClick">
      <!-- 表情背景 -->
      <view class="avatar-bg">
        <!-- 眼睛 -->
        <view class="eyes">
          <view class="eye eye-left" :class="{ 'is-blinking': isBlinking }"></view>
          <view class="eye eye-right" :class="{ 'is-blinking': isBlinking }"></view>
        </view>
        <!-- 嘴巴 -->
        <view class="mouth" :class="`mouth-${expression}`"></view>
        <!-- 腮红 -->
        <view class="blush blush-left" v-if="showBlush"></view>
        <view class="blush blush-right" v-if="showBlush"></view>
      </view>
      
      <!-- 装饰物 -->
      <view class="avatar-accessory" v-if="accessoryType">
        <text v-if="accessoryType === 'star'">⭐</text>
        <text v-if="accessoryType === 'crown'">👑</text>
        <text v-if="accessoryType === 'bow'">🎀</text>
      </view>
    </view>
    
    <!-- 动画效果层 -->
    <view class="animation-layer" v-if="currentAnimation">
      <text class="animation-icon" v-if="currentAnimation === 'clap'">👏</text>
      <text class="animation-icon" v-if="currentAnimation === 'dance'">💃</text>
      <text class="animation-icon" v-if="currentAnimation === 'cheer'">🙌</text>
      <text class="animation-icon" v-if="currentAnimation === 'wave'">👋</text>
    </view>
    
    <!-- 名字标签 -->
    <view class="buddy-name-tag">
      <text class="buddy-name">{{ buddyName }}</text>
      <text class="buddy-level">Lv.{{ level }}</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  // 当前心情: happy | encouraging | excited | calm | sad | worried
  mood: {
    type: String,
    default: 'happy'
  },
  // 表情: smile | laugh | surprised | thinking | worried | asleep
  expression: {
    type: String,
    default: 'smile'
  },
  // 配件类型
  accessoryType: {
    type: String,
    default: ''
  },
  // 伙伴名字
  buddyName: {
    type: String,
    default: '小伙伴'
  },
  // 等级
  level: {
    type: Number,
    default: 1
  },
  // 是否显示腮红
  showBlush: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click', 'animationEnd'])

const currentMood = ref(props.mood)
const currentAnimation = ref('')
const isAnimating = ref(false)
const isBlinking = ref(false)

let blinkInterval = null
let animationTimeout = null

// 表情映射
const moodExpressionMap = {
  happy: 'smile',
  encouraging: 'smile',
  excited: 'laugh',
  calm: 'smile',
  sad: 'worried',
  worried: 'worried'
}

// 监听 mood 变化
watch(() => props.mood, (newMood) => {
  currentMood.value = newMood
  updateExpression()
})

// 更新表情
function updateExpression() {
  if (!props.expression || props.expression === 'auto') {
    // 根据心情自动选择表情
  }
}

// 开始眨眼
function startBlinking() {
  blinkInterval = setInterval(() => {
    isBlinking.value = true
    setTimeout(() => {
      isBlinking.value = false
    }, 150)
  }, 3000)
}

// 停止眨眼
function stopBlinking() {
  if (blinkInterval) {
    clearInterval(blinkInterval)
    blinkInterval = null
  }
}

// 点击头像
function handleAvatarClick() {
  // 随机触发动画
  const animations = ['clap', 'dance', 'cheer', 'wave']
  const randomAnim = animations[Math.floor(Math.random() * animations.length)]
  playAnimation(randomAnim)
  emit('click')
}

// 播放动画
function playAnimation(animType) {
  if (animationTimeout) {
    clearTimeout(animationTimeout)
  }
  currentAnimation.value = animType
  isAnimating.value = true
  
  animationTimeout = setTimeout(() => {
    currentAnimation.value = ''
    isAnimating.value = false
    emit('animationEnd')
  }, 1500)
}

// 设置心情
function setMood(mood) {
  currentMood.value = mood
}

// 停止所有动画
function stopAnimation() {
  if (animationTimeout) {
    clearTimeout(animationTimeout)
  }
  currentAnimation.value = ''
  isAnimating.value = false
}

onMounted(() => {
  setTimeout(() => {
    isAnimating.value = true
  }, 100)
  startBlinking()
})

onUnmounted(() => {
  stopBlinking()
  stopAnimation()
})

defineExpose({
  playAnimation,
  setMood,
  stopAnimation,
  currentMood,
  currentAnimation
})
</script>

<style scoped>
.buddy-avatar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
  position: relative;
}

.avatar-wrapper {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  position: relative;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.avatar-wrapper:active {
  transform: scale(0.95);
}

/* 心情背景颜色 */
.mood-happy .avatar-wrapper {
  background: linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%);
}

.mood-encouraging .avatar-wrapper {
  background: linear-gradient(135deg, #34D399 0%, #10B981 100%);
}

.mood-excited .avatar-wrapper {
  background: linear-gradient(135deg, #F472B6 0%, #EC4899 100%);
}

.mood-calm .avatar-wrapper {
  background: linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%);
}

.mood-sad .avatar-wrapper,
.mood-worried .avatar-wrapper {
  background: linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%);
}

.avatar-bg {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  position: relative;
  overflow: hidden;
}

/* 眼睛 */
.eyes {
  display: flex;
  justify-content: center;
  gap: 40rpx;
  margin-top: 50rpx;
}

.eye {
  width: 24rpx;
  height: 24rpx;
  border-radius: 50%;
  background: #1F2937;
  transition: all 0.15s ease;
}

.eye-left,
.eye-right {
  position: relative;
}

.eye-left::after,
.eye-right::after {
  content: '';
  position: absolute;
  width: 8rpx;
  height: 8rpx;
  border-radius: 50%;
  background: white;
  top: 4rpx;
  right: 4rpx;
}

.is-blinking .eye {
  height: 4rpx;
  margin-top: 10rpx;
}

.is-blinking .eye::after {
  display: none;
}

/* 嘴巴 */
.mouth {
  width: 40rpx;
  height: 20rpx;
  margin: 20rpx auto 0;
  border-radius: 0 0 20rpx 20rpx;
  background: #EF4444;
  transition: all 0.2s ease;
}

.mouth-smile {
  border-radius: 0 0 20rpx 20rpx;
}

.mouth-laugh {
  width: 50rpx;
  height: 30rpx;
  border-radius: 0 0 25rpx 25rpx;
}

.mouth-surprised {
  width: 30rpx;
  height: 30rpx;
  border-radius: 50%;
  margin-top: 15rpx;
}

.mouth-thinking {
  width: 30rpx;
  height: 15rpx;
  border-radius: 10rpx;
  transform: rotate(-10deg);
}

.mouth-worried {
  border-radius: 20rpx 20rpx 0 0;
  background: #EF4444;
  transform: rotate(180deg);
  margin-top: 25rpx;
}

.mouth-asleep {
  width: 30rpx;
  height: 4rpx;
  border-radius: 4rpx;
  margin-top: 25rpx;
}

/* 腮红 */
.blush {
  position: absolute;
  width: 24rpx;
  height: 12rpx;
  border-radius: 50%;
  background: rgba(255, 100, 100, 0.4);
  top: 85rpx;
}

.blush-left {
  left: 20rpx;
}

.blush-right {
  right: 20rpx;
}

/* 配件 */
.avatar-accessory {
  position: absolute;
  top: -10rpx;
  right: -10rpx;
  font-size: 40rpx;
}

/* 动画效果层 */
.animation-layer {
  position: absolute;
  top: -30rpx;
  left: 50%;
  transform: translateX(-50%);
  pointer-events: none;
}

.animation-icon {
  font-size: 60rpx;
  animation: floatUp 1.5s ease-out forwards;
}

@keyframes floatUp {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(-60rpx) scale(1.5);
  }
}

/* 名字标签 */
.buddy-name-tag {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rpx;
}

.buddy-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #374151;
}

.buddy-level {
  font-size: 20rpx;
  color: #9CA3AF;
  background: #F3F4F6;
  padding: 2rpx 12rpx;
  border-radius: 10rpx;
}

/* 动画状态 */
.is-animating .avatar-wrapper {
  animation: bounce 0.5s ease;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10rpx);
  }
}
</style>
