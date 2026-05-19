<template>
  <view class="pacing-page">
    <!-- 顶部导航 -->
    <view class="nav-header">
      <text class="back-btn" @click="goBack">‹</text>
      <text class="nav-title">语速训练</text>
      <text class="nav-placeholder"></text>
    </view>

    <!-- 语速说明 -->
    <view class="info-card">
      <text class="info-title">什么是语速？</text>
      <text class="info-text">语速是指说话的速度，通常用每分钟说出的单词数（WPM）来衡量。合适的语速能让你的演讲更加清晰、有感染力。</text>
    </view>

    <!-- 语速等级 -->
    <view class="pacing-levels">
      <view
        v-for="(level, key) in pacingData"
        :key="key"
        class="level-card"
        :class="{ active: selectedLevel === key }"
        @click="selectLevel(key)"
      >
        <view class="level-header">
          <text class="level-wpm">{{ level.wpm }} WPM</text>
          <view class="level-indicator" :style="{ background: getLevelColor(key) }"></view>
        </view>
        <text class="level-name">{{ level.description }}</text>
        <text class="level-usage">{{ level.ideal }}</text>
      </view>
    </view>

    <!-- 训练区域 -->
    <view class="training-area">
      <view class="training-header">
        <text class="training-title">跟读训练</text>
        <text class="training-subtitle">跟读下面的句子，感受语速变化</text>
      </view>

      <view class="training-content">
        <view class="sample-text">
          <text>{{ currentSampleText }}</text>
        </view>
        
        <!-- 实时语速显示 -->
        <view class="realtime-pacing">
          <view class="pacing-display">
            <text class="pacing-label">当前语速</text>
            <text class="pacing-value" :style="{ color: getPacingColor() }">
              {{ currentWPM }} WPM
            </text>
          </view>
          <view class="pacing-bar">
            <view class="pacing-fill" :style="{ width: getPacingFillWidth() + '%', background: getPacingColor() }"></view>
          </view>
        </view>
      </view>

      <!-- 控制按钮 -->
      <view class="control-section">
        <view class="record-btn" :class="{ recording: isRecording }" @click="toggleRecording">
          <text class="record-icon">{{ isRecording ? '⏹️' : '🎤' }}</text>
          <text class="record-text">{{ isRecording ? '停止' : '开始跟读' }}</text>
        </view>
      </view>

      <!-- 语速提示 -->
      <view class="pacing-tips">
        <view class="tip-item" v-if="selectedLevel === 'slow'">
          <text>💡 慢速适合重要内容强调，让听众有时间消化</text>
        </view>
        <view class="tip-item" v-else-if="selectedLevel === 'moderate'">
          <text>💡 中速是日常对话的自然节奏</text>
        </view>
        <view class="tip-item" v-else>
          <text>💡 快速适合激情演讲，但不宜全程使用</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { usePublicSpeakingStore } from '@/stores/publicSpeakingStore.js'

const store = usePublicSpeakingStore()

// 状态
const selectedLevel = ref('moderate')
const isRecording = ref(false)
const currentWPM = ref(0)

// 样本文本
const sampleTexts = [
  '大家好，我是小明，很高兴今天能站在这里和大家分享我的故事。',
  '春天来了，花儿开了，草地上的小草也绿了，一切都充满了生机。',
  '读书使人明智，旅行使人开阔，思考使人深刻。',
  '成功的秘诀在于坚持不懈的努力和对梦想的执着追求。',
  '时间是世界上最公平的资源，每个人每天都拥有相同的24小时。'
]

const currentSampleIndex = ref(0)

// 计算属性
const pacingData = computed(() => store.getPacingTraining())

const currentSampleText = computed(() => {
  return sampleTexts[currentSampleIndex.value]
})

// 方法
const goBack = () => {
  uni.navigateBack()
}

const getLevelColor = (level) => {
  const colors = {
    slow: '#52c41a',
    moderate: '#faad14',
    fast: '#f5222d'
  }
  return colors[level] || '#999'
}

const selectLevel = (level) => {
  selectedLevel.value = level
  currentSampleIndex.value = (currentSampleIndex.value + 1) % sampleTexts.length
}

const getPacingColor = () => {
  if (currentWPM.value < 100) return '#52c41a'
  if (currentWPM.value < 140) return '#faad14'
  return '#f5222d'
}

const getPacingFillWidth = () => {
  return Math.min((currentWPM.value / 200) * 100, 100)
}

const toggleRecording = () => {
  isRecording.value = !isRecording.value
  
  if (isRecording.value) {
    uni.showToast({ title: '开始跟读，注意语速', icon: 'none' })
    // 模拟语速检测
    simulateWPM()
  } else {
    currentWPM.value = 0
    uni.showToast({ title: '跟读结束', icon: 'success' })
  }
}

let wpmInterval = null

const simulateWPM = () => {
  const targetWPM = pacingData.value[selectedLevel.value]?.wpm || 120
  
  wpmInterval = setInterval(() => {
    if (!isRecording.value) {
      clearInterval(wpmInterval)
      return
    }
    // 模拟语速波动
    currentWPM.value = Math.round(targetWPM + (Math.random() - 0.5) * 40)
  }, 500)
}

onMounted(() => {
  store.init()
})

// 组件卸载时清理
import { onUnmounted } from 'vue'
onUnmounted(() => {
  if (wpmInterval) {
    clearInterval(wpmInterval)
  }
})
</script>

<style scoped>
.pacing-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.nav-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 40rpx 30rpx 20rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.back-btn {
  font-size: 60rpx;
  color: #ffffff;
  font-weight: bold;
}

.nav-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #ffffff;
}

.nav-placeholder {
  width: 60rpx;
}

/* 信息卡片 */
.info-card {
  margin: 20rpx 30rpx;
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
}

.info-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.info-text {
  font-size: 24rpx;
  color: #666;
  line-height: 1.6;
}

/* 语速等级 */
.pacing-levels {
  display: flex;
  gap: 16rpx;
  padding: 0 30rpx;
  margin-bottom: 24rpx;
}

.level-card {
  flex: 1;
  background: #fff;
  border-radius: 16rpx;
  padding: 20rpx;
  border: 4rpx solid transparent;
  transition: all 0.3s;
}

.level-card.active {
  border-color: #667eea;
}

.level-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8rpx;
}

.level-wpm {
  font-size: 24rpx;
  font-weight: bold;
  color: #333;
}

.level-indicator {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
}

.level-name {
  font-size: 22rpx;
  color: #666;
  display: block;
  margin-bottom: 4rpx;
}

.level-usage {
  font-size: 20rpx;
  color: #999;
}

/* 训练区域 */
.training-area {
  margin: 0 30rpx;
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
}

.training-header {
  text-align: center;
  margin-bottom: 24rpx;
}

.training-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 4rpx;
}

.training-subtitle {
  font-size: 24rpx;
  color: #999;
}

.sample-text {
  background: #f8f9fa;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 24rpx;
  text-align: center;
}

.sample-text text {
  font-size: 28rpx;
  color: #333;
  line-height: 1.8;
}

/* 实时语速 */
.realtime-pacing {
  margin-bottom: 30rpx;
}

.pacing-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8rpx;
}

.pacing-label {
  font-size: 24rpx;
  color: #666;
}

.pacing-value {
  font-size: 36rpx;
  font-weight: bold;
}

.pacing-bar {
  height: 12rpx;
  background: #eee;
  border-radius: 6rpx;
  overflow: hidden;
}

.pacing-fill {
  height: 100%;
  transition: width 0.3s, background 0.3s;
}

/* 控制按钮 */
.control-section {
  display: flex;
  justify-content: center;
  margin-bottom: 24rpx;
}

.record-btn {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.record-btn.recording {
  background: linear-gradient(135deg, #f5222d 0%, #fa8c16 100%);
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.record-icon {
  font-size: 48rpx;
  margin-bottom: 8rpx;
}

.record-text {
  font-size: 24rpx;
  color: #fff;
}

/* 提示 */
.pacing-tips {
  text-align: center;
}

.tip-item {
  display: inline-block;
  padding: 12rpx 20rpx;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 20rpx;
}

.tip-item text {
  font-size: 24rpx;
  color: #667eea;
}
</style>
