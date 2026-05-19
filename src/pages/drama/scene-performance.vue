<template>
  <view class="scene-performance-container">
    <!-- 顶部导航 -->
    <view class="nav-header">
      <view class="nav-back" @tap="goBack">
        <text class="back-icon">←</text>
      </view>
      <text class="nav-title">情景表演</text>
      <view class="nav-right"></view>
    </view>

    <!-- 表演进行中 -->
    <view v-if="!showResult" class="performance-area">
      <!-- 角色展示 -->
      <view class="character-showcase">
        <view class="character-display">
          <text class="role-icon">{{ getRoleIcon() }}</text>
          <text class="costume-icon">{{ getCostumeIcon() }}</text>
        </view>
        <view class="character-info">
          <text class="char-name">{{ selectedCharacter?.name || '未选择角色' }}</text>
        </view>
      </view>

      <!-- 场景信息 -->
      <view class="scene-info-card">
        <view class="scene-header">
          <text class="scene-type">
            {{ getSceneTypeInfo()[scene?.type]?.icon }}
            {{ getSceneTypeInfo()[scene?.type]?.label }}
          </text>
          <view class="difficulty" :style="{ color: getDifficultyInfo()[scene?.difficulty]?.color }">
            <text v-for="i in scene?.difficulty" :key="i">⭐</text>
          </view>
        </view>
        <text class="scene-title">{{ scene?.title }}</text>
      </view>

      <!-- 情景描述 -->
      <view class="situation-card">
        <view class="situation-header">
          <text class="situation-icon">📜</text>
          <text class="situation-label">情景</text>
        </view>
        <text class="situation-text">{{ scene?.situation }}</text>
      </view>

      <!-- 选项列表 -->
      <view class="choices-section">
        <text class="section-title">你的选择</text>
        <view class="choices-list">
          <view 
            v-for="(choice, index) in scene?.choices" 
            :key="choice.id"
            :class="['choice-card', { selected: selectedChoice?.id === choice.id }]"
            @tap="selectChoice(choice)"
          >
            <view class="choice-letter">
              <text>{{ String.fromCharCode(65 + index) }}</text>
            </view>
            <text class="choice-text">{{ choice.text }}</text>
          </view>
        </view>
      </view>

      <!-- 确认按钮 -->
      <view class="confirm-section">
        <view 
          :class="['confirm-btn', { disabled: !selectedChoice }]"
          @tap="confirmChoice"
        >
          <text>确认选择</text>
        </view>
      </view>
    </view>

    <!-- 结果展示 -->
    <view v-else class="result-area">
      <view class="result-card">
        <view class="result-header">
          <text class="result-icon">{{ result?.level?.icon || '🎭' }}</text>
          <text class="result-grade" :style="{ color: result?.level?.color }">
            {{ result?.level?.label || 'S' }} 级
          </text>
        </view>
        
        <view class="score-display">
          <text class="score-label">得分</text>
          <text class="score-value">{{ result?.score || 0 }}</text>
        </view>

        <view class="feedback-section">
          <text class="feedback-title">评语</text>
          <text class="feedback-text">{{ result?.feedback }}</text>
        </view>

        <view class="tips-section">
          <text class="tips-title">💡 小贴士</text>
          <text class="tips-text">{{ scene?.tips }}</text>
        </view>

        <view class="result-actions">
          <view class="action-btn secondary" @tap="replayScene">
            <text>再试一次</text>
          </view>
          <view class="action-btn primary" @tap="goToNextScene">
            <text>下一个场景</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useDramaStore } from '@/stores/dramaStore'

const dramaStore = useDramaStore()

const selectedChoice = ref(null)
const showResult = ref(false)
const result = ref(null)

const scene = computed(() => dramaStore.currentScene)
const selectedCharacter = computed(() => dramaStore.currentCharacter)

const getSceneTypeInfo = () => dramaStore.getSceneTypeInfo()
const getDifficultyInfo = () => dramaStore.getDifficultyInfo()
const getRoleInfo = () => dramaStore.getRoleInfo()

const getRoleIcon = () => {
  if (!selectedCharacter.value) return '🎭'
  return getRoleInfo()[selectedCharacter.value.role]?.icon || '🎭'
}

const getCostumeIcon = () => {
  if (!selectedCharacter.value) return '👔'
  const costumeMap = {
    'red_hood': '🧥',
    'grandma_dress': '👵',
    'hunter_outfit': '🏹',
    'wolf_default': '🐺',
    'green_robe': '🧙',
    'circus_clown': '🎪',
    'scholar': '📚',
    'silver_armor': '⚔️',
    'golden_armor': '🏅',
    'dragon_slayer': '🐉'
  }
  const costume = selectedCharacter.value.defaultCostume || selectedCharacter.value.costumes?.[0]
  return costumeMap[costume] || '👔'
}

const selectChoice = (choice) => {
  selectedChoice.value = choice
}

const confirmChoice = () => {
  if (!selectedChoice.value) return
  
  const performanceResult = dramaStore.completePerformance(
    selectedChoice.value.id,
    selectedChoice.value.score
  )
  
  result.value = performanceResult
  showResult.value = true
}

const replayScene = () => {
  selectedChoice.value = null
  showResult.value = false
  result.value = null
}

const goToNextScene = () => {
  // 获取推荐的下个场景
  const nextScene = dramaStore.getRecommendedScene()
  if (nextScene) {
    dramaStore.selectScene(nextScene)
    replayScene()
  } else {
    uni.showToast({ title: '暂无更多场景', icon: 'none' })
    setTimeout(() => {
      goBack()
    }, 1500)
  }
}

const goBack = () => {
  uni.navigateBack()
}

onMounted(() => {
  if (!scene.value) {
    uni.showToast({ title: '未选择场景', icon: 'none' })
    setTimeout(() => {
      goBack()
    }, 1000)
    return
  }
  dramaStore.startPerformance(scene.value)
})
</script>

<style scoped>
.scene-performance-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  padding-bottom: 120rpx;
}

.nav-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 120rpx 40rpx 30rpx;
  background: linear-gradient(135deg, #4ecdc4 0%, #26a69a 100%);
}

.nav-back {
  width: 60rpx;
}

.back-icon {
  font-size: 40rpx;
  color: #ffffff;
}

.nav-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #ffffff;
}

.nav-right {
  width: 60rpx;
}

.performance-area {
  padding: 30rpx 40rpx;
}

.character-showcase {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30rpx;
}

.character-display {
  width: 200rpx;
  height: 200rpx;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
}

.role-icon {
  font-size: 64rpx;
}

.costume-icon {
  font-size: 48rpx;
}

.char-name {
  font-size: 28rpx;
  color: #ffffff;
  margin-top: 16rpx;
}

.scene-info-card {
  background: rgba(78, 205, 196, 0.1);
  border: 1rpx solid rgba(78, 205, 196, 0.3);
  border-radius: 20rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
}

.scene-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}

.scene-type {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.7);
}

.difficulty {
  font-size: 18rpx;
}

.scene-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #ffffff;
}

.situation-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20rpx;
  padding: 24rpx;
  margin-bottom: 30rpx;
}

.situation-header {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-bottom: 12rpx;
}

.situation-icon {
  font-size: 28rpx;
}

.situation-label {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.6);
}

.situation-text {
  font-size: 28rpx;
  color: #ffffff;
  line-height: 1.6;
}

.choices-section {
  margin-bottom: 30rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 16rpx;
  display: block;
}

.choices-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.choice-card {
  display: flex;
  align-items: center;
  gap: 20rpx;
  background: rgba(255, 255, 255, 0.05);
  border: 2rpx solid transparent;
  border-radius: 16rpx;
  padding: 24rpx;
  transition: all 0.3s ease;
}

.choice-card.selected {
  background: rgba(78, 205, 196, 0.15);
  border-color: #4ecdc4;
}

.choice-letter {
  width: 50rpx;
  height: 50rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  font-weight: bold;
  color: #ffffff;
  flex-shrink: 0;
}

.choice-card.selected .choice-letter {
  background: #4ecdc4;
  color: #1a1a2e;
}

.choice-text {
  font-size: 26rpx;
  color: #ffffff;
  line-height: 1.5;
}

.confirm-section {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 30rpx 40rpx;
  background: rgba(26, 26, 46, 0.95);
  border-top: 1rpx solid rgba(255, 255, 255, 0.1);
}

.confirm-btn {
  background: linear-gradient(135deg, #4ecdc4 0%, #26a69a 100%);
  padding: 24rpx;
  border-radius: 20rpx;
  text-align: center;
  font-size: 30rpx;
  font-weight: bold;
  color: #ffffff;
}

.confirm-btn.disabled {
  opacity: 0.5;
}

/* Result Area */
.result-area {
  padding: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
}

.result-card {
  width: 100%;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 30rpx;
  padding: 40rpx;
  text-align: center;
}

.result-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 30rpx;
}

.result-icon {
  font-size: 100rpx;
}

.result-grade {
  font-size: 48rpx;
  font-weight: bold;
}

.score-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  margin-bottom: 30rpx;
}

.score-label {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.6);
}

.score-value {
  font-size: 72rpx;
  font-weight: bold;
  color: #ffffff;
}

.feedback-section, .tips-section {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  text-align: left;
}

.feedback-title {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 8rpx;
  display: block;
}

.feedback-text {
  font-size: 28rpx;
  color: #ffffff;
  line-height: 1.5;
}

.tips-title {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 8rpx;
  display: block;
}

.tips-text {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.5;
}

.result-actions {
  display: flex;
  gap: 20rpx;
  margin-top: 30rpx;
}

.action-btn {
  flex: 1;
  padding: 24rpx;
  border-radius: 20rpx;
  text-align: center;
  font-size: 28rpx;
  color: #ffffff;
}

.action-btn.secondary {
  background: rgba(255, 255, 255, 0.1);
}

.action-btn.primary {
  background: linear-gradient(135deg, #4ecdc4 0%, #26a69a 100%);
}
</style>
