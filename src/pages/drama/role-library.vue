<template>
  <view class="role-library-container">
    <!-- 顶部导航 -->
    <view class="nav-header">
      <view class="nav-back" @tap="goBack">
        <text class="back-icon">←</text>
      </view>
      <text class="nav-title">角色库</text>
      <view class="nav-right">
        <text class="progress-text">{{ unlockedCount }}/{{ totalCount }}</text>
      </view>
    </view>

    <!-- 角色列表 -->
    <view class="character-list">
      <view 
        v-for="character in characters" 
        :key="character.id"
        :class="['character-card', { locked: !isUnlocked(character.id) }]"
        @tap="onCharacterTap(character)"
      >
        <view class="character-avatar">
          <text class="avatar-icon">{{ getRoleIcon(character.role) }}</text>
          <view v-if="!isUnlocked(character.id)" class="locked-overlay">
            <text class="locked-icon">🔒</text>
          </view>
        </view>
        <view class="character-info">
          <text class="character-name">{{ character.name }}</text>
          <text class="character-role">
            {{ getRoleInfo()[character.role].icon }} {{ getRoleInfo()[character.role].label }}
          </text>
          <text class="character-desc">{{ character.description }}</text>
        </view>
        <view class="character-actions" v-if="isUnlocked(character.id)">
          <view class="action-btn dress-up" @tap.stop="goToDressUp(character)">
            <text>👗 换装</text>
          </view>
          <view class="action-btn play" @tap.stop="goToPerform(character)">
            <text>🎭 表演</text>
          </view>
        </view>
        <view class="unlock-hint" v-else>
          <text>完成{{ unlockRequirement }}个场景解锁</text>
        </view>
      </view>
    </view>

    <!-- 角色详情弹窗 -->
    <view v-if="showDetail" class="detail-modal" @tap="closeDetail">
      <view class="modal-content" @tap.stop>
        <view class="modal-header">
          <text class="modal-title">{{ selectedCharacter?.name }}</text>
          <text class="modal-close" @tap="closeDetail">×</text>
        </view>
        
        <view class="modal-body">
          <view class="character-portrait">
            <text class="portrait-icon">{{ getRoleIcon(selectedCharacter?.role) }}</text>
          </view>
          
          <view class="character-meta">
            <view class="meta-item">
              <text class="meta-label">角色类型</text>
              <text class="meta-value">
                {{ getRoleInfo()[selectedCharacter?.role]?.icon }} 
                {{ getRoleInfo()[selectedCharacter?.role]?.label }}
              </text>
            </view>
            <view class="meta-item">
              <text class="meta-label">角色描述</text>
              <text class="meta-value">{{ selectedCharacter?.description }}</text>
            </view>
          </view>

          <view class="costume-section" v-if="isUnlocked(selectedCharacter?.id)">
            <text class="section-title">可选服装</text>
            <view class="costume-list">
              <view 
                v-for="costume in selectedCharacter?.costumes" 
                :key="costume"
                :class="['costume-item', { selected: currentCostume === costume }]"
                @tap="selectCostume(costume)"
              >
                <text class="costume-icon">{{ getCostumeIcon(costume) }}</text>
                <text class="costume-name">{{ getCostumeName(costume) }}</text>
              </view>
            </view>
          </view>

          <view class="emotion-section">
            <text class="section-title">表情库</text>
            <view class="emotion-list">
              <text 
                v-for="emotion in selectedCharacter?.emotions" 
                :key="emotion"
                class="emotion-item"
              >
                {{ getEmotionIcon(emotion) }}
              </text>
            </view>
          </view>
        </view>

        <view class="modal-footer">
          <view class="btn dress-up-btn" @tap="goToDressUp(selectedCharacter)">
            <text>👗 换装</text>
          </view>
          <view class="btn perform-btn" @tap="goToPerform(selectedCharacter)">
            <text>🎭 开始表演</text>
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

const showDetail = ref(false)
const selectedCharacter = ref(null)
const currentCostume = ref(null)

const characters = computed(() => dramaStore.characters)
const unlockedCharacters = computed(() => dramaStore.unlockedCharacters)

const totalCount = computed(() => characters.value.length)
const unlockedCount = computed(() => unlockedCharacters.value.length)

const unlockRequirement = computed(() => {
  if (!unlockedCharacters.value.includes('char_002')) return 3
  if (!unlockedCharacters.value.includes('char_003')) return 5
  return 10
})

const getRoleInfo = () => dramaStore.getRoleInfo()

const isUnlocked = (charId) => {
  return unlockedCharacters.value.some(c => c.id === charId)
}

const getRoleIcon = (role) => {
  return getRoleInfo()[role]?.icon || '🎭'
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
  return icons[costume] || '👔'
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

const onCharacterTap = (character) => {
  selectedCharacter.value = character
  if (isUnlocked(character.id)) {
    const costumes = dramaStore.getCharacterCostumes(character.id)
    currentCostume.value = costumes.length > 0 ? costumes[0] : null
  }
  showDetail.value = true
}

const closeDetail = () => {
  showDetail.value = false
  selectedCharacter.value = null
}

const selectCostume = (costume) => {
  currentCostume.value = costume
}

const goBack = () => {
  uni.navigateBack()
}

const goToDressUp = (character) => {
  dramaStore.enterDressUpMode(character)
  uni.navigateTo({ url: '/pages/drama/role-dress-up' })
}

const goToPerform = (character) => {
  dramaStore.selectCharacter(character)
  uni.navigateTo({ url: '/pages/drama/scene-selection' })
}

onMounted(() => {
  dramaStore.loadCharacters()
})
</script>

<style scoped>
.role-library-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  padding-bottom: 120rpx;
}

.nav-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 120rpx 40rpx 30rpx;
  background: linear-gradient(135deg, #ff6b9d 0%, #c44569 100%);
}

.nav-back {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
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
  display: flex;
  align-items: center;
}

.progress-text {
  font-size: 28rpx;
  color: #ffffff;
  opacity: 0.9;
}

.character-list {
  padding: 30rpx 40rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.character-card {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 24rpx;
  padding: 30rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.character-card.locked {
  opacity: 0.6;
}

.character-avatar {
  width: 120rpx;
  height: 120rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.avatar-icon {
  font-size: 64rpx;
}

.locked-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.locked-icon {
  font-size: 40rpx;
}

.character-info {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.character-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #ffffff;
}

.character-role {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.7);
}

.character-desc {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.5);
}

.character-actions {
  display: flex;
  gap: 16rpx;
  margin-top: 8rpx;
}

.action-btn {
  flex: 1;
  padding: 16rpx;
  border-radius: 16rpx;
  text-align: center;
  font-size: 24rpx;
  color: #ffffff;
}

.action-btn.dress-up {
  background: rgba(78, 205, 196, 0.3);
}

.action-btn.play {
  background: rgba(255, 107, 157, 0.3);
}

.unlock-hint {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.5);
  text-align: center;
  margin-top: 8rpx;
}

/* Modal */
.detail-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: flex-end;
  z-index: 100;
}

.modal-content {
  width: 100%;
  background: #1a1a2e;
  border-radius: 40rpx 40rpx 0 0;
  max-height: 80vh;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 40rpx;
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.1);
}

.modal-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #ffffff;
}

.modal-close {
  font-size: 48rpx;
  color: rgba(255, 255, 255, 0.6);
}

.modal-body {
  padding: 30rpx 40rpx;
  max-height: 50vh;
  overflow-y: auto;
}

.character-portrait {
  width: 200rpx;
  height: 200rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  margin: 0 auto 30rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.portrait-icon {
  font-size: 100rpx;
}

.character-meta {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  margin-bottom: 30rpx;
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.meta-label {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.5);
}

.meta-value {
  font-size: 28rpx;
  color: #ffffff;
}

.section-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 16rpx;
}

.costume-section {
  margin-bottom: 30rpx;
}

.costume-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.costume-item {
  width: 140rpx;
  padding: 20rpx;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.costume-item.selected {
  background: rgba(255, 107, 157, 0.2);
  border: 2rpx solid #ff6b9d;
}

.costume-icon {
  font-size: 40rpx;
}

.costume-name {
  font-size: 20rpx;
  color: rgba(255, 255, 255, 0.8);
  text-align: center;
}

.emotion-section {
  margin-bottom: 20rpx;
}

.emotion-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.emotion-item {
  width: 80rpx;
  height: 80rpx;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
}

.modal-footer {
  display: flex;
  gap: 20rpx;
  padding: 30rpx 40rpx;
  border-top: 1rpx solid rgba(255, 255, 255, 0.1);
}

.btn {
  flex: 1;
  padding: 24rpx;
  border-radius: 20rpx;
  text-align: center;
  font-size: 28rpx;
  color: #ffffff;
}

.dress-up-btn {
  background: rgba(78, 205, 196, 0.3);
}

.perform-btn {
  background: linear-gradient(135deg, #ff6b9d 0%, #c44569 100%);
}
</style>
