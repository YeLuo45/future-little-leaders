<template>
  <view class="crafts-page">
    <!-- 头部统计 -->
    <view class="header-card">
      <view class="header-info">
        <text class="header-icon">✂️</text>
        <view class="header-text">
          <text class="header-title">手工制作</text>
          <text class="header-subtitle">发挥创意，动起来</text>
        </view>
      </view>
      <view class="stats-row">
        <view class="stat-item">
          <text class="stat-value">{{ craftTutorials.length }}</text>
          <text class="stat-label">教程总数</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ completedCount }}</text>
          <text class="stat-label">已完成</text>
        </view>
      </view>
    </view>

    <!-- 教程列表 -->
    <view class="tutorial-list">
      <view 
        class="tutorial-card" 
        v-for="tutorial in craftTutorials" 
        :key="tutorial.id"
        @click="handleSelectTutorial(tutorial)"
      >
        <view class="card-header">
          <view class="difficulty-badge" :class="tutorial.difficulty">
            {{ getDifficultyName(tutorial.difficulty) }}
          </view>
          <view class="duration-info">
            <text>⏱️</text>
            <text>{{ tutorial.duration }}分钟</text>
          </view>
        </view>

        <view class="card-body">
          <text class="tutorial-title">{{ tutorial.title }}</text>
          <text class="tutorial-desc">{{ tutorial.description }}</text>
        </view>

        <view class="materials-section">
          <text class="materials-title">材料准备：</text>
          <view class="materials-list">
            <text 
              class="material-tag" 
              v-for="(material, idx) in tutorial.materials" 
              :key="idx"
            >
              {{ material }}
            </text>
          </view>
        </view>

        <view class="card-footer">
          <view class="points-badge">
            <text>+{{ tutorial.points }}积分</text>
          </view>
          <view class="status-badge" v-if="tutorial.isCompleted">
            <text class="status-icon">✓</text>
            <text>已完成</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 教程详情弹窗 -->
    <view class="detail-modal" v-if="selectedTutorial" @click="closeDetail">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">{{ selectedTutorial.title }}</text>
          <text class="close-btn" @click="closeDetail">×</text>
        </view>

        <scroll-view scroll-y class="modal-body">
          <view class="detail-section">
            <text class="section-title">📋 步骤指导</text>
            <view 
              class="step-item" 
              v-for="step in selectedTutorial.steps" 
              :key="step.step"
            >
              <view class="step-number">{{ step.step }}</view>
              <view class="step-content">
                <text class="step-title">{{ step.title }}</text>
                <text class="step-text">{{ step.content }}</text>
              </view>
            </view>
          </view>

          <view class="detail-section">
            <text class="section-title">📦 材料清单</text>
            <view class="materials-grid">
              <text 
                class="material-item" 
                v-for="(material, idx) in selectedTutorial.materials" 
                :key="idx"
              >
                {{ material }}
              </text>
            </view>
          </view>
        </scroll-view>

        <view class="modal-footer">
          <button 
            class="complete-btn" 
            :disabled="selectedTutorial.isCompleted"
            @click="handleComplete"
          >
            {{ selectedTutorial.isCompleted ? '已完成' : '完成教程' }}
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useArtStore } from '@/stores/artStore.js'

const artStore = useArtStore()

const craftTutorials = computed(() => artStore.craftTutorials)
const completedCount = computed(() => artStore.completedCraftCount)
const selectedTutorial = computed(() => artStore.selectedTutorial)

const getDifficultyName = (difficulty) => {
  const names = {
    easy: '简单',
    medium: '中等',
    hard: '困难'
  }
  return names[difficulty] || difficulty
}

const handleSelectTutorial = (tutorial) => {
  artStore.selectTutorial(tutorial)
}

const closeDetail = () => {
  artStore.selectTutorial(null)
}

const handleComplete = () => {
  if (selectedTutorial.value) {
    artStore.completeCraftTutorial(selectedTutorial.value.id)
    uni.showToast({ title: '恭喜完成！', icon: 'success' })
    closeDetail()
  }
}

onMounted(() => {
  artStore.loadCraftTutorials()
})
</script>

<style scoped>
.crafts-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20rpx;
}

.header-card {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.header-info {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.header-icon {
  font-size: 48rpx;
  margin-right: 16rpx;
}

.header-text {
  flex: 1;
}

.header-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #fff;
  display: block;
}

.header-subtitle {
  font-size: 24rpx;
  color: rgba(255,255,255,0.8);
}

.stats-row {
  display: flex;
  gap: 40rpx;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 36rpx;
  font-weight: bold;
  color: #fff;
  display: block;
}

.stat-label {
  font-size: 22rpx;
  color: rgba(255,255,255,0.8);
}

.tutorial-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.tutorial-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.difficulty-badge {
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  color: #fff;
}

.difficulty-badge.easy {
  background: #2ecc71;
}

.difficulty-badge.medium {
  background: #f39c12;
}

.difficulty-badge.hard {
  background: #e74c3c;
}

.duration-info {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 24rpx;
  color: #999;
}

.card-body {
  margin-bottom: 16rpx;
}

.tutorial-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.tutorial-desc {
  font-size: 26rpx;
  color: #666;
}

.materials-section {
  margin-bottom: 16rpx;
}

.materials-title {
  font-size: 24rpx;
  color: #999;
}

.materials-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 8rpx;
}

.material-tag {
  background: #f0f0f0;
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  color: #666;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16rpx;
  border-top: 1px solid #f0f0f0;
}

.points-badge {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 6rpx;
  color: #2ecc71;
  font-size: 24rpx;
}

.status-icon {
  font-size: 24rpx;
}

.detail-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: flex-end;
  z-index: 999;
}

.modal-content {
  background: #fff;
  border-radius: 24rpx 24rpx 0 0;
  width: 100%;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1px solid #f0f0f0;
}

.modal-title {
  font-size: 32rpx;
  font-weight: bold;
}

.close-btn {
  font-size: 48rpx;
  color: #999;
  line-height: 1;
}

.modal-body {
  flex: 1;
  padding: 30rpx;
  max-height: 60vh;
}

.detail-section {
  margin-bottom: 30rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 16rpx;
}

.step-item {
  display: flex;
  margin-bottom: 20rpx;
}

.step-number {
  width: 48rpx;
  height: 48rpx;
  background: #8477fa;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  font-weight: bold;
  margin-right: 16rpx;
  flex-shrink: 0;
}

.step-content {
  flex: 1;
}

.step-title {
  font-size: 26rpx;
  font-weight: 500;
  color: #333;
  display: block;
  margin-bottom: 4rpx;
}

.step-text {
  font-size: 24rpx;
  color: #666;
}

.materials-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.material-item {
  background: #f8f8f8;
  padding: 12rpx 24rpx;
  border-radius: 12rpx;
  font-size: 26rpx;
  color: #666;
}

.modal-footer {
  padding: 30rpx;
  border-top: 1px solid #f0f0f0;
}

.complete-btn {
  width: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-size: 30rpx;
  padding: 24rpx;
  border-radius: 12rpx;
}

.complete-btn[disabled] {
  background: #ccc;
}
</style>
