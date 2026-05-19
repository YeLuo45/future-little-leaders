<template>
  <view class="code-blocks-page">
    <!-- 顶部标题 -->
    <view class="header">
      <text class="title">💻 代码块学习</text>
      <text class="subtitle">学习变量、循环、条件</text>
    </view>

    <!-- 进度条 -->
    <view class="progress-section">
      <view class="progress-info">
        <text class="level-name">{{ currentLevel?.title || '加载中...' }}</text>
        <text class="progress-text">{{ completedLevels.length }}/{{ codeBlockLevels.length }} 完成</text>
      </view>
      <view class="progress-bar">
        <view class="progress-fill" :style="{ width: progressPercent + '%' }"></view>
      </view>
    </view>

    <!-- 关卡导航 -->
    <scroll-view scroll-x class="level-tabs">
      <view
        v-for="(level, index) in codeBlockLevels"
        :key="level.id"
        :class="['level-tab', { active: currentLevelIndex === index, completed: completedLevels.includes(level.id) }]"
        @click="selectLevel(index)"
      >
        <text class="level-num">{{ index + 1 }}</text>
        <text class="level-title">{{ level.title }}</text>
      </view>
    </scroll-view>

    <!-- 当前关卡内容 -->
    <view v-if="currentLevel" class="level-content">
      <!-- 关卡描述 -->
      <view class="challenge-card">
        <view class="challenge-header">
          <text class="difficulty" :class="'level-' + currentLevel.difficulty">
            {{ getDifficultyName(currentLevel.difficulty) }}
          </text>
          <text class="exp-points">+{{ currentLevel.exp }} 经验</text>
        </view>
        <text class="challenge-title">{{ currentLevel.challenge }}</text>
        <text class="challenge-desc">{{ currentLevel.description }}</text>
        
        <!-- 涉及的积木 -->
        <view class="blocks-used">
          <text class="blocks-label">涉及积木:</text>
          <view class="blocks-tags">
            <text v-for="blockType in currentLevel.blocks" :key="blockType" class="block-tag">
              {{ getBlockIcon(blockType) }} {{ blockType }}
            </text>
          </view>
        </view>
      </view>

      <!-- 提示 -->
      <view class="hint-card" @click="toggleHint">
        <text class="hint-icon">💡</text>
        <text class="hint-text">{{ showHint ? currentLevel.hint : '点击查看提示' }}</text>
      </view>

      <!-- 代码输入区 -->
      <view class="code-input-section">
        <text class="section-title">编写代码</text>
        <textarea
          class="code-input"
          v-model="userCode"
          placeholder="在这里编写你的代码..."
          maxlength="500"
        />
        <view class="code-actions">
          <text class="reset-btn" @click="resetCode">重置</text>
          <text class="submit-btn" @click="submitCode">提交答案</text>
        </view>
      </view>

      <!-- 导航按钮 -->
      <view class="nav-buttons">
        <text
          class="nav-btn prev"
          :class="{ disabled: currentLevelIndex === 0 }"
          @click="prevLevel"
        >上一关</text>
        <text
          class="nav-btn next"
          :class="{ disabled: currentLevelIndex === codeBlockLevels.length - 1 }"
          @click="nextLevel"
        >下一关</text>
      </view>
    </view>

    <!-- 完成弹窗 -->
    <view v-if="showCompleteModal" class="complete-modal" @click="closeModal">
      <view class="modal-content" @click.stop>
        <text class="complete-icon">🎉</text>
        <text class="complete-title">太棒了！</text>
        <text class="complete-desc">你完成了 {{ currentLevel?.title }}</text>
        <view class="reward-info">
          <text class="reward-item">+{{ currentLevel?.exp }} 经验</text>
          <text class="reward-item">+{{ currentLevel?.points }} 积分</text>
        </view>
        <text class="modal-close" @click="closeModal">继续学习</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useCodingEducationStore } from '@/stores/codingEducationStore.js'

const store = useCodingEducationStore()

const userCode = ref('')
const showHint = ref(false)
const showCompleteModal = ref(false)

const codeBlockLevels = computed(() => store.codeBlockLevels)
const currentLevelIndex = computed(() => store.currentLevelIndex)
const currentLevel = computed(() => store.getCurrentLevel())
const completedLevels = computed(() => store.completedLevels)

const progressPercent = computed(() => {
  if (codeBlockLevels.value.length === 0) return 0
  return Math.round((completedLevels.value.length / codeBlockLevels.value.length) * 100)
})

const selectLevel = (index) => {
  store.setActiveTab(index)
  resetCode()
}

const toggleHint = () => {
  showHint.value = !showHint.value
}

const resetCode = () => {
  userCode.value = ''
  showHint.value = false
}

const submitCode = () => {
  if (!userCode.value.trim()) {
    uni.showToast({ title: '请输入代码', icon: 'none' })
    return
  }
  
  if (currentLevel.value) {
    store.completeLevel(currentLevel.value.id, currentLevel.value.exp, currentLevel.value.points)
    showCompleteModal.value = true
  }
}

const prevLevel = () => {
  store.prevLevel()
  resetCode()
}

const nextLevel = () => {
  store.nextLevel()
  resetCode()
}

const closeModal = () => {
  showCompleteModal.value = false
}

const getDifficultyName = (level) => {
  const names = { 1: '入门', 2: '基础', 3: '进阶', 4: '高级' }
  return names[level] || '入门'
}

const getBlockIcon = (blockType) => {
  const icons = {
    event: '🚩',
    motion: '➡️',
    looks: '👤',
    sound: '🔊',
    control: '🔁',
    variable: '📦',
    operator: '➕',
    sensing: '👀'
  }
  return icons[blockType] || '📦'
}

// 初始化
store.loadCodeBlockLevels()
</script>

<style scoped>
.code-blocks-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  padding: 20rpx;
}

.header {
  text-align: center;
  padding: 30rpx 0;
}

.title {
  font-size: 40rpx;
  font-weight: bold;
  color: #ffffff;
  display: block;
}

.subtitle {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 10rpx;
  display: block;
}

.progress-section {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20rpx;
  padding: 25rpx;
  margin-bottom: 20rpx;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15rpx;
}

.level-name {
  font-size: 28rpx;
  color: #ffffff;
  font-weight: bold;
}

.progress-text {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
}

.progress-bar {
  height: 12rpx;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 6rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #ffffff;
  border-radius: 6rpx;
  transition: width 0.3s;
}

.level-tabs {
  display: flex;
  white-space: nowrap;
  padding: 10rpx 0;
  margin-bottom: 20rpx;
}

.level-tab {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  padding: 15rpx 30rpx;
  margin: 0 8rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20rpx;
}

.level-tab.active {
  background: rgba(255, 255, 255, 0.4);
}

.level-tab.completed {
  background: rgba(76, 175, 80, 0.4);
}

.level-num {
  width: 40rpx;
  height: 40rpx;
  background: rgba(255, 255, 255, 0.3);
  color: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  margin-bottom: 8rpx;
}

.level-tab.completed .level-num {
  background: #4CAF50;
}

.level-title {
  font-size: 22rpx;
  color: #ffffff;
}

.level-content {
  background: #ffffff;
  border-radius: 30rpx;
  padding: 30rpx;
}

.challenge-card {
  background: #f8f9fa;
  border-radius: 20rpx;
  padding: 25rpx;
  margin-bottom: 20rpx;
}

.challenge-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15rpx;
}

.difficulty {
  padding: 5rpx 15rpx;
  border-radius: 10rpx;
  font-size: 22rpx;
  color: #ffffff;
}

.difficulty.level-1 { background: #4CAF50; }
.difficulty.level-2 { background: #2196F3; }
.difficulty.level-3 { background: #FF9800; }
.difficulty.level-4 { background: #f44336; }

.exp-points {
  font-size: 24rpx;
  color: #E91E63;
}

.challenge-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 10rpx;
}

.challenge-desc {
  font-size: 26rpx;
  color: #666;
  display: block;
  margin-bottom: 15rpx;
}

.blocks-used {
  margin-top: 15rpx;
}

.blocks-label {
  font-size: 24rpx;
  color: #999;
  display: block;
  margin-bottom: 10rpx;
}

.blocks-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}

.block-tag {
  padding: 8rpx 15rpx;
  background: #e3f2fd;
  border-radius: 15rpx;
  font-size: 22rpx;
  color: #1976D2;
}

.hint-card {
  display: flex;
  align-items: center;
  padding: 25rpx;
  background: #fff3e0;
  border-radius: 20rpx;
  margin-bottom: 20rpx;
}

.hint-icon {
  font-size: 36rpx;
  margin-right: 15rpx;
}

.hint-text {
  font-size: 26rpx;
  color: #e65100;
  flex: 1;
}

.code-input-section {
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 15rpx;
  display: block;
}

.code-input {
  width: 100%;
  height: 200rpx;
  background: #f5f5f5;
  border-radius: 15rpx;
  padding: 20rpx;
  font-size: 26rpx;
  font-family: monospace;
  box-sizing: border-box;
}

.code-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15rpx;
  margin-top: 15rpx;
}

.reset-btn {
  padding: 15rpx 35rpx;
  background: #f0f0f0;
  border-radius: 25rpx;
  font-size: 26rpx;
  color: #666;
}

.submit-btn {
  padding: 15rpx 35rpx;
  background: #4CAF50;
  border-radius: 25rpx;
  font-size: 26rpx;
  color: #ffffff;
}

.nav-buttons {
  display: flex;
  justify-content: space-between;
}

.nav-btn {
  padding: 18rpx 50rpx;
  border-radius: 30rpx;
  font-size: 28rpx;
}

.nav-btn.prev {
  background: #f0f0f0;
  color: #666;
}

.nav-btn.next {
  background: #667eea;
  color: #ffffff;
}

.nav-btn.disabled {
  opacity: 0.5;
}

.complete-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #ffffff;
  border-radius: 30rpx;
  padding: 50rpx;
  text-align: center;
  width: 75%;
}

.complete-icon {
  font-size: 100rpx;
  display: block;
  margin-bottom: 20rpx;
}

.complete-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 15rpx;
}

.complete-desc {
  font-size: 28rpx;
  color: #666;
  display: block;
  margin-bottom: 25rpx;
}

.reward-info {
  display: flex;
  justify-content: center;
  gap: 30rpx;
  margin-bottom: 30rpx;
}

.reward-item {
  padding: 10rpx 25rpx;
  background: #fff3e0;
  border-radius: 20rpx;
  font-size: 26rpx;
  color: #e65100;
}

.modal-close {
  display: inline-block;
  padding: 18rpx 60rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  border-radius: 30rpx;
  font-size: 28rpx;
}
</style>
