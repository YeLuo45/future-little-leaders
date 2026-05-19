<template>
  <view class="role-dress-up-container">
    <!-- 顶部导航 -->
    <view class="nav-header">
      <view class="nav-back" @tap="goBack">
        <text class="back-icon">←</text>
      </view>
      <text class="nav-title">角色换装</text>
      <view class="nav-right"></view>
    </view>

    <!-- 角色展示区 -->
    <view class="character-display">
      <view class="character-stage">
        <view class="character-figure">
          <text class="figure-icon">{{ getRoleIcon() }}</text>
        </view>
        <view class="costume-display">
          <text class="costume-icon">{{ getCostumeIcon() }}</text>
        </view>
        <view class="emotion-display">
          <text class="emotion-icon">{{ currentEmotionIcon }}</text>
        </view>
      </view>
      
      <!-- 角色信息 -->
      <view class="character-info">
        <text class="character-name">{{ character?.name }}</text>
        <text class="character-desc">{{ character?.description }}</text>
      </view>
    </view>

    <!-- 服装选择 -->
    <view class="customize-section">
      <text class="section-title">选择服装</text>
      <scroll-view class="costume-scroll" scroll-x>
        <view class="costume-grid">
          <view 
            v-for="costume in availableCostumes" 
            :key="costume"
            :class="['costume-card', { selected: currentCostume === costume }]"
            @tap="selectCostume(costume)"
          >
            <text class="costume-icon">{{ getCostumeIcon(costume) }}</text>
            <text class="costume-name">{{ getCostumeName(costume) }}</text>
            <view v-if="!isCostumeUnlocked(costume)" class="unlocked-overlay">
              <text class="unlocked-icon">🔒</text>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 表情选择 -->
    <view class="customize-section">
      <text class="section-title">选择表情</text>
      <view class="emotion-grid">
        <view 
          v-for="emotion in availableEmotions" 
          :key="emotion"
          :class="['emotion-card', { selected: currentEmotion === emotion }]"
          @tap="selectEmotion(emotion)"
        >
          <text class="emotion-icon">{{ getEmotionIcon(emotion) }}</text>
          <text class="emotion-name">{{ getEmotionName(emotion) }}</text>
        </view>
      </view>
    </view>

    <!-- 动作选择 -->
    <view class="customize-section">
      <text class="section-title">选择动作</text>
      <view class="action-grid">
        <view 
          v-for="action in availableActions" 
          :key="action.id"
          :class="['action-card', { selected: currentAction === action.id }]"
          @tap="selectAction(action.id)"
        >
          <text class="action-icon">{{ action.icon }}</text>
          <text class="action-name">{{ action.name }}</text>
        </view>
      </view>
    </view>

    <!-- 底部操作 -->
    <view class="bottom-actions">
      <view class="action-btn preview" @tap="previewCharacter">
        <text>👁️ 预览</text>
      </view>
      <view class="action-btn confirm" @tap="confirmSelection">
        <text>✓ 确认</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useDramaStore } from '@/stores/dramaStore'

const dramaStore = useDramaStore()

const currentCostume = ref(null)
const currentEmotion = ref(null)
const currentAction = ref('idle')
const currentEmotionIcon = ref('😊')

const character = computed(() => dramaStore.currentCharacter)
const availableCostumes = computed(() => character.value?.costumes || [])
const availableEmotions = computed(() => character.value?.emotions || [])

const availableActions = [
  { id: 'idle', name: '待机', icon: '🧍' },
  { id: 'walk', name: '行走', icon: '🚶' },
  { id: 'run', name: '跑步', icon: '🏃' },
  { id: 'wave', name: '挥手', icon: '👋' },
  { id: 'bow', name: '鞠躬', icon: '🙇' },
  { id: 'jump', name: '跳跃', icon: '⬆️' },
  { id: 'clap', name: '鼓掌', icon: '👏' },
  { id: 'think', name: '思考', icon: '🤔' }
]

const getRoleIcon = () => {
  if (!character.value) return '🎭'
  const roleInfo = dramaStore.getRoleInfo()
  return roleInfo[character.value.role]?.icon || '🎭'
}

const getCostumeIcon = (costume) => {
  const icons = {
    'red_hood': '🧥',
    'grandma_dress': '👵',
    'hunter_outfit': '🏹',
    'wolf_default': '🐺',
    'grandma_disguise': '👵',
    'green_robe': '🧙',
    'golden_robe': '👑',
    'circus_clown': '🎪',
    'party_clown': '🎉',
    'magic_clown': '🪄',
    'scholar': '📚',
    'theater_director': '🎬',
    'silver_armor': '⚔️',
    'golden_armor': '🏅',
    'dragon_slayer': '🐉'
  }
  return icons[costume || currentCostume.value] || '👔'
}

const getCostumeName = (costume) => {
  const names = {
    'red_hood': '红色斗篷',
    'grandma_dress': '奶奶服装',
    'hunter_outfit': '猎人装',
    'wolf_default': '大灰狼',
    'grandma_disguise': '伪装奶奶',
    'green_robe': '绿色长袍',
    'golden_robe': '金色长袍',
    'circus_clown': '马戏团小丑',
    'party_clown': '派对小丑',
    'magic_clown': '魔术小丑',
    'scholar': '学者',
    'theater_director': '剧场导演',
    'silver_armor': '银色铠甲',
    'golden_armor': '金色铠甲',
    'dragon_slayer': '屠龙勇士'
  }
  return names[costume] || costume
}

const getEmotionIcon = (emotion) => {
  const icons = {
    'happy': '😊',
    'sad': '😢',
    'scared': '😨',
    'brave': '🦸',
    'evil': '😈',
    'hungry': '🍖',
    'clever': '🧠',
    'defeated': '😔',
    'wise': '🧙',
    'calm': '😌',
    'worried': '😟',
    'funny': '🤡',
    'surprised': '😲',
    'proud': '😎',
    'excited': '🤩',
    'peaceful': '☮️',
    'determined': '💪'
  }
  return icons[emotion] || '😊'
}

const getEmotionName = (emotion) => {
  const names = {
    'happy': '开心',
    'sad': '伤心',
    'scared': '害怕',
    'brave': '勇敢',
    'evil': '邪恶',
    'hungry': '饥饿',
    'clever': '聪明',
    'defeated': '沮丧',
    'wise': '睿智',
    'calm': '平静',
    'worried': '担忧',
    'funny': '滑稽',
    'surprised': '惊讶',
    'proud': '骄傲',
    'excited': '兴奋',
    'peaceful': '安宁',
    'determined': '坚定'
  }
  return names[emotion] || emotion
}

const isCostumeUnlocked = (costume) => {
  const unlocked = dramaStore.getCharacterCostumes(character.value?.id)
  return unlocked.includes(costume)
}

const selectCostume = (costume) => {
  if (isCostumeUnlocked(costume) || availableCostumes.value.length === 1) {
    currentCostume.value = costume
  }
}

const selectEmotion = (emotion) => {
  currentEmotion.value = emotion
  currentEmotionIcon.value = getEmotionIcon(emotion)
}

const selectAction = (actionId) => {
  currentAction.value = actionId
}

const previewCharacter = () => {
  uni.showToast({ title: '预览功能开发中', icon: 'none' })
}

const confirmSelection = () => {
  if (currentCostume.value) {
    dramaStore.selectCostume(currentCostume.value)
  }
  uni.showToast({ title: '服装已保存', icon: 'success' })
  setTimeout(() => {
    goBack()
  }, 1000)
}

const goBack = () => {
  dramaStore.exitDressUpMode()
  uni.navigateBack()
}

onMounted(() => {
  if (!character.value) {
    uni.navigateBack()
    return
  }
  const costumes = dramaStore.getCharacterCostumes(character.value.id)
  currentCostume.value = costumes.length > 0 ? costumes[0] : availableCostumes.value[0]
  currentEmotion.value = availableEmotions.value[0] || 'happy'
  currentEmotionIcon.value = getEmotionIcon(currentEmotion.value)
})
</script>

<style scoped>
.role-dress-up-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  padding-bottom: 140rpx;
}

.nav-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 120rpx 40rpx 30rpx;
  background: linear-gradient(135deg, #ff6b9d 0%, #c44569 100%);
}

.nav-back, .nav-right {
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

.character-display {
  padding: 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.character-stage {
  width: 300rpx;
  height: 300rpx;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin-bottom: 30rpx;
}

.character-figure {
  position: absolute;
  top: 20rpx;
}

.figure-icon {
  font-size: 80rpx;
}

.costume-display {
  position: absolute;
  bottom: 40rpx;
}

.costume-icon {
  font-size: 60rpx;
}

.emotion-display {
  position: absolute;
  right: 40rpx;
  top: 60rpx;
}

.emotion-icon {
  font-size: 48rpx;
}

.character-info {
  text-align: center;
}

.character-name {
  font-size: 36rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 8rpx;
}

.character-desc {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.7);
}

.customize-section {
  padding: 30rpx 40rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 20rpx;
}

.costume-scroll {
  white-space: nowrap;
}

.costume-grid {
  display: inline-flex;
  gap: 20rpx;
}

.costume-card {
  width: 160rpx;
  padding: 24rpx;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 20rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  position: relative;
}

.costume-card.selected {
  background: rgba(255, 107, 157, 0.2);
  border: 2rpx solid #ff6b9d;
}

.costume-icon {
  font-size: 48rpx;
}

.costume-name {
  font-size: 20rpx;
  color: rgba(255, 255, 255, 0.8);
  text-align: center;
}

.unlocked-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.unlocked-icon {
  font-size: 40rpx;
}

.emotion-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16rpx;
}

.emotion-card {
  padding: 20rpx;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.emotion-card.selected {
  background: rgba(78, 205, 196, 0.2);
  border: 2rpx solid #4ecdc4;
}

.emotion-icon {
  font-size: 40rpx;
}

.emotion-name {
  font-size: 18rpx;
  color: rgba(255, 255, 255, 0.7);
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16rpx;
}

.action-card {
  padding: 16rpx;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6rpx;
}

.action-card.selected {
  background: rgba(168, 85, 247, 0.2);
  border: 2rpx solid #a855f7;
}

.action-icon {
  font-size: 36rpx;
}

.action-name {
  font-size: 16rpx;
  color: rgba(255, 255, 255, 0.7);
}

.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: 20rpx;
  padding: 30rpx 40rpx;
  background: rgba(26, 26, 46, 0.95);
  border-top: 1rpx solid rgba(255, 255, 255, 0.1);
}

.action-btn {
  flex: 1;
  padding: 24rpx;
  border-radius: 20rpx;
  text-align: center;
  font-size: 28rpx;
  color: #ffffff;
}

.action-btn.preview {
  background: rgba(255, 255, 255, 0.1);
}

.action-btn.confirm {
  background: linear-gradient(135deg, #ff6b9d 0%, #c44569 100%);
}
</style>
