<template>
  <view class="drama-container">
    <!-- 顶部标题区 -->
    <view class="header-section">
      <view class="header-bg"></view>
      <view class="header-content">
        <view class="user-info">
          <text class="greeting">{{ greeting }}</text>
          <text class="subtitle">创意戏剧</text>
        </view>
      </view>
    </view>

    <!-- 属性卡片 -->
    <view class="stats-cards">
      <view class="stat-card influence">
        <text class="stat-icon">🎭</text>
        <view class="stat-info">
          <text class="stat-value">{{ influence }}</text>
          <text class="stat-label">影响力</text>
        </view>
      </view>
      <view class="stat-card creativity">
        <text class="stat-icon">💡</text>
        <view class="stat-info">
          <text class="stat-value">{{ creativity }}</text>
          <text class="stat-label">创造力</text>
        </view>
      </view>
      <view class="stat-card expression">
        <text class="stat-icon">🎤</text>
        <view class="stat-info">
          <text class="stat-value">{{ expression }}</text>
          <text class="stat-label">表现力</text>
        </view>
      </view>
    </view>

    <!-- 功能入口 -->
    <view class="feature-grid">
      <view class="feature-item" @tap="goToRoleLibrary">
        <view class="feature-icon">👥</view>
        <text class="feature-title">角色库</text>
        <text class="feature-desc">选择你的角色</text>
        <view class="feature-badge" v-if="characterProgress.unlocked < characterProgress.total">
          <text>{{ characterProgress.unlocked }}/{{ characterProgress.total }}</text>
        </view>
      </view>
      
      <view class="feature-item" @tap="goToSceneSelection">
        <view class="feature-icon">🎬</view>
        <text class="feature-title">情景表演</text>
        <text class="feature-desc">角色扮演练习</text>
        <view class="feature-badge" v-if="sceneProgress.completed < sceneProgress.total">
          <text>{{ sceneProgress.completed }}/{{ sceneProgress.total }}</text>
        </view>
      </view>
      
      <view class="feature-item" @tap="goToScriptCreation">
        <view class="feature-icon">✍️</view>
        <text class="feature-title">剧本创作</text>
        <text class="feature-desc">编写你的故事</text>
        <view class="feature-badge">
          <text>{{ createdScriptsCount }}</text>
        </view>
      </view>
      
      <view class="feature-item" @tap="goToDramaWorkshop">
        <view class="feature-icon">🎪</view>
        <text class="feature-title">戏剧工坊</text>
        <text class="feature-desc">学习表演技巧</text>
      </view>
    </view>

    <!-- 推荐场景 -->
    <view class="recommended-section" v-if="recommendedScene">
      <view class="section-header">
        <text class="section-title">推荐场景</text>
      </view>
      <view class="recommended-card" @tap="goToScene(recommendedScene)">
        <view class="card-header">
          <text class="scene-type">
            {{ getSceneTypeInfo()[recommendedScene.type].icon }}
            {{ getSceneTypeInfo()[recommendedScene.type].label }}
          </text>
          <view class="difficulty" :style="{ color: getDifficultyInfo()[recommendedScene.difficulty].color }">
            <text v-for="i in recommendedScene.difficulty" :key="i">⭐</text>
          </view>
        </view>
        <text class="card-title">{{ recommendedScene.title }}</text>
        <text class="card-desc">{{ recommendedScene.description }}</text>
        <view class="card-footer">
          <text class="start-btn">开始表演</text>
        </view>
      </view>
    </view>

    <!-- 快捷入口 -->
    <view class="quick-actions">
      <view class="action-item" @tap="goToRoleLibrary">
        <text class="action-icon">👗</text>
        <text class="action-text">角色换装</text>
      </view>
      <view class="action-item" @tap="goToScriptCreation">
        <text class="action-icon">📝</text>
        <text class="action-text">继续创作</text>
      </view>
      <view class="action-item" @tap="showAchievements">
        <text class="action-icon">🏆</text>
        <text class="action-text">我的成就</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useDramaStore } from '@/stores/dramaStore'
import dramaService from '@/services/dramaService'

const dramaStore = useDramaStore()

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return '早上好，小演员！'
  if (hour < 18) return '下午好，小演员！'
  return '晚上好，小演员！'
})

const influence = computed(() => dramaStore.influence)
const creativity = computed(() => dramaStore.creativity)
const expression = computed(() => dramaStore.expression)
const sceneProgress = computed(() => dramaStore.sceneProgress)
const characterProgress = computed(() => dramaStore.characterProgress)
const createdScriptsCount = computed(() => dramaStore.createdScriptsCount)
const recommendedScene = computed(() => dramaStore.getRecommendedScene())

const getSceneTypeInfo = () => dramaStore.getSceneTypeInfo()
const getDifficultyInfo = () => dramaStore.getDifficultyInfo()

const goToRoleLibrary = () => {
  uni.navigateTo({ url: '/pages/drama/role-library' })
}

const goToSceneSelection = () => {
  uni.navigateTo({ url: '/pages/drama/scene-selection' })
}

const goToScriptCreation = () => {
  uni.navigateTo({ url: '/pages/drama/script-creation' })
}

const goToDramaWorkshop = () => {
  uni.showToast({ title: '戏剧工坊即将开放', icon: 'none' })
}

const goToScene = (scene) => {
  dramaStore.selectScene(scene)
  uni.navigateTo({ url: `/pages/drama/scene-performance?id=${scene.id}` })
}

const showAchievements = () => {
  uni.showToast({ title: '成就系统开发中', icon: 'none' })
}

onMounted(() => {
  dramaStore.init()
})
</script>

<style scoped>
.drama-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  padding-bottom: 120rpx;
}

.header-section {
  position: relative;
  padding: 120rpx 40rpx 40rpx;
}

.header-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 200rpx;
  background: linear-gradient(135deg, #ff6b9d 0%, #c44569 100%);
  border-radius: 0 0 40rpx 40rpx;
}

.header-content {
  position: relative;
  z-index: 1;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.greeting {
  font-size: 40rpx;
  font-weight: bold;
  color: #ffffff;
}

.subtitle {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
}

.stats-cards {
  display: flex;
  gap: 16rpx;
  padding: 0 40rpx;
  margin-top: -20rpx;
}

.stat-card {
  flex: 1;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16rpx;
  padding: 20rpx 12rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.stat-icon {
  font-size: 36rpx;
}

.stat-info {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 28rpx;
  font-weight: bold;
  color: #ffffff;
}

.stat-label {
  font-size: 18rpx;
  color: rgba(255, 255, 255, 0.7);
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24rpx;
  padding: 40rpx;
  margin-top: 20rpx;
}

.feature-item {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 24rpx;
  padding: 30rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  position: relative;
}

.feature-icon {
  font-size: 56rpx;
  margin-bottom: 8rpx;
}

.feature-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #ffffff;
}

.feature-desc {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.6);
}

.feature-badge {
  position: absolute;
  top: 16rpx;
  right: 16rpx;
  background: rgba(255, 107, 157, 0.8);
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
  font-size: 18rpx;
  color: #ffffff;
}

.recommended-section {
  padding: 0 40rpx;
  margin-top: 20rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #ffffff;
}

.recommended-card {
  background: linear-gradient(135deg, rgba(255, 107, 157, 0.2) 0%, rgba(196, 69, 105, 0.1) 100%);
  border: 1rpx solid rgba(255, 107, 157, 0.3);
  border-radius: 24rpx;
  padding: 30rpx;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.scene-type {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
}

.difficulty {
  font-size: 20rpx;
}

.card-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 12rpx;
}

.card-desc {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 20rpx;
}

.card-footer {
  display: flex;
  justify-content: flex-end;
}

.start-btn {
  background: linear-gradient(135deg, #ff6b9d 0%, #c44569 100%);
  padding: 12rpx 32rpx;
  border-radius: 20rpx;
  font-size: 26rpx;
  color: #ffffff;
}

.quick-actions {
  display: flex;
  justify-content: space-around;
  padding: 40rpx;
  margin-top: 20rpx;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.action-icon {
  font-size: 48rpx;
}

.action-text {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.8);
}
</style>
