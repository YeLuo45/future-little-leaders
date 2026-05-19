<template>
  <view class="scene-selection-container">
    <!-- 顶部导航 -->
    <view class="nav-header">
      <view class="nav-back" @tap="goBack">
        <text class="back-icon">←</text>
      </view>
      <text class="nav-title">情景表演</text>
      <view class="nav-right">
        <text class="progress-text">{{ completedCount }}/{{ totalCount }}</text>
      </view>
    </view>

    <!-- 角色选择 -->
    <view class="character-select-section">
      <text class="section-title">选择角色</text>
      <scroll-view class="character-scroll" scroll-x>
        <view class="character-list">
          <view 
            v-for="char in unlockedCharacters" 
            :key="char.id"
            :class="['character-item', { selected: selectedCharacter?.id === char.id }]"
            @tap="selectCharacter(char)"
          >
            <text class="char-icon">{{ getRoleIcon(char.role) }}</text>
            <text class="char-name">{{ char.name }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 场景类型筛选 -->
    <view class="filter-section">
      <view class="filter-tabs">
        <view 
          v-for="type in sceneTypes" 
          :key="type.key"
          :class="['filter-tab', { active: currentFilter === type.key }]"
          @tap="setFilter(type.key)"
        >
          <text class="tab-icon">{{ type.icon }}</text>
          <text class="tab-label">{{ type.label }}</text>
        </view>
      </view>
    </view>

    <!-- 场景列表 -->
    <view class="scene-list">
      <view 
        v-for="scene in filteredScenes" 
        :key="scene.id"
        :class="['scene-card', { completed: isCompleted(scene.id) }]"
        @tap="goToPerformance(scene)"
      >
        <view class="card-header">
          <view class="scene-type">
            <text class="type-icon">{{ getSceneTypeInfo()[scene.type].icon }}</text>
            <text class="type-label">{{ getSceneTypeInfo()[scene.type].label }}</text>
          </view>
          <view class="difficulty" :style="{ color: getDifficultyInfo()[scene.difficulty].color }">
            <text v-for="i in scene.difficulty" :key="i">⭐</text>
          </view>
        </view>
        
        <text class="scene-title">{{ scene.title }}</text>
        <text class="scene-desc">{{ scene.description }}</text>
        
        <view class="card-footer">
          <view class="scene-role">
            <text>{{ getRoleIcon(scene.role) }} {{ getRoleInfo()[scene.role]?.label }}</text>
          </view>
          <view v-if="isCompleted(scene.id)" class="completed-badge">
            <text>✓ 已完成</text>
          </view>
          <view v-else class="start-badge">
            <text>开始 →</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view v-if="filteredScenes.length === 0" class="empty-state">
      <text class="empty-icon">🎭</text>
      <text class="empty-text">暂无可用场景</text>
      <text class="empty-hint">解锁更多角色以获得更多场景</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useDramaStore } from '@/stores/dramaStore'

const dramaStore = useDramaStore()

const currentFilter = ref('all')
const selectedCharacter = ref(null)

const sceneTypes = [
  { key: 'all', icon: '🎭', label: '全部' },
  { key: 'fairy_tale', icon: '🏰', label: '童话' },
  { key: 'adventure', icon: '🗺️', label: '冒险' },
  { key: 'daily_life', icon: '🏠', label: '生活' },
  { key: 'history', icon: '⚔️', label: '历史' },
  { key: 'sci_fi', icon: '🚀', label: '科幻' }
]

const scenes = computed(() => dramaStore.scenes)
const unlockedCharacters = computed(() => dramaStore.unlockedCharacters)
const completedScenes = computed(() => {
  // 从用户统计中获取已完成的场景
  return dramaStore.userStats?.completedScenes || 0
})
const totalCount = computed(() => scenes.value.length)
const completedCount = computed(() => completedScenes.value)

const filteredScenes = computed(() => {
  if (currentFilter.value === 'all') {
    return scenes.value
  }
  return scenes.value.filter(s => s.type === currentFilter.value)
})

const getSceneTypeInfo = () => dramaStore.getSceneTypeInfo()
const getDifficultyInfo = () => dramaStore.getDifficultyInfo()
const getRoleInfo = () => dramaStore.getRoleInfo()

const getRoleIcon = (role) => {
  return getRoleInfo()[role]?.icon || '🎭'
}

const setFilter = (key) => {
  currentFilter.value = key
}

const selectCharacter = (char) => {
  selectedCharacter.value = char
  dramaStore.selectCharacter(char)
}

const isCompleted = (sceneId) => {
  // 简单实现，实际应该从store中检查
  return false
}

const goBack = () => {
  uni.navigateBack()
}

const goToPerformance = (scene) => {
  if (!selectedCharacter.value) {
    uni.showToast({ title: '请先选择角色', icon: 'none' })
    return
  }
  dramaStore.selectScene(scene)
  uni.navigateTo({ url: `/pages/drama/scene-performance?id=${scene.id}&charId=${selectedCharacter.value.id}` })
}

onMounted(() => {
  dramaStore.loadScenes()
  dramaStore.loadCharacters()
  if (unlockedCharacters.value.length > 0) {
    selectedCharacter.value = unlockedCharacters.value[0]
    dramaStore.selectCharacter(unlockedCharacters.value[0])
  }
})
</script>

<style scoped>
.scene-selection-container {
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
  display: flex;
  align-items: center;
}

.progress-text {
  font-size: 28rpx;
  color: #ffffff;
}

.character-select-section {
  padding: 30rpx 40rpx 20rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 16rpx;
}

.character-scroll {
  white-space: nowrap;
}

.character-list {
  display: inline-flex;
  gap: 20rpx;
}

.character-item {
  width: 120rpx;
  padding: 20rpx;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 20rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  border: 2rpx solid transparent;
}

.character-item.selected {
  background: rgba(78, 205, 196, 0.2);
  border-color: #4ecdc4;
}

.char-icon {
  font-size: 48rpx;
}

.char-name {
  font-size: 20rpx;
  color: rgba(255, 255, 255, 0.8);
  text-align: center;
}

.filter-section {
  padding: 0 40rpx 20rpx;
}

.filter-tabs {
  display: flex;
  gap: 12rpx;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.filter-tab {
  display: flex;
  align-items: center;
  gap: 6rpx;
  padding: 12rpx 20rpx;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 30rpx;
  white-space: nowrap;
}

.filter-tab.active {
  background: rgba(78, 205, 196, 0.3);
}

.tab-icon {
  font-size: 24rpx;
}

.tab-label {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.8);
}

.scene-list {
  padding: 0 40rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.scene-card {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 24rpx;
  padding: 30rpx;
}

.scene-card.completed {
  border: 2rpx solid rgba(34, 197, 94, 0.5);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.scene-type {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.type-icon {
  font-size: 24rpx;
}

.type-label {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.7);
}

.difficulty {
  font-size: 18rpx;
}

.scene-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 12rpx;
  display: block;
}

.scene-desc {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 20rpx;
  display: block;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.scene-role {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.6);
}

.completed-badge {
  background: rgba(34, 197, 94, 0.2);
  padding: 8rpx 20rpx;
  border-radius: 16rpx;
  font-size: 22rpx;
  color: #22c55e;
}

.start-badge {
  background: rgba(78, 205, 196, 0.2);
  padding: 8rpx 20rpx;
  border-radius: 16rpx;
  font-size: 22rpx;
  color: #4ecdc4;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 40rpx;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 20rpx;
}

.empty-text {
  font-size: 32rpx;
  color: #ffffff;
  margin-bottom: 12rpx;
}

.empty-hint {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.5);
}
</style>
