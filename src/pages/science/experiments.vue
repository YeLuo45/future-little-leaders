<template>
  <view class="experiments-page">
    <!-- 头部统计卡片 -->
    <view class="header-card">
      <view class="points-display">
        <text class="points-icon">🔬</text>
        <view class="points-info">
          <text class="points-value">{{ sciencePoints.totalPoints }}</text>
          <text class="points-label">科学积分</text>
        </view>
        <view class="level-badge">
          <text>Lv.{{ sciencePoints.level }}</text>
        </view>
      </view>
      <view class="stats-row">
        <view class="stat-item">
          <text class="stat-value">{{ completedCount }}</text>
          <text class="stat-label">已完成</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ experiments.length }}</text>
          <text class="stat-label">实验总数</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ unlockedAwardsCount }}</text>
          <text class="stat-label">成就数</text>
        </view>
      </view>
    </view>

    <!-- 分类筛选 -->
    <view class="filter-section">
      <scroll-view scroll-x class="filter-scroll">
        <view class="filter-tags">
          <view 
            class="filter-tag" 
            :class="{ active: filters.category === '' }"
            @click="handleFilterCategory('')"
          >
            全部
          </view>
          <view 
            class="filter-tag" 
            v-for="cat in categories" 
            :key="cat.id"
            :class="{ active: filters.category === cat.id }"
            :style="filters.category === cat.id ? { backgroundColor: cat.color } : {}"
            @click="handleFilterCategory(cat.id)"
          >
            <text>{{ cat.icon }}</text>
            <text>{{ cat.name }}</text>
          </view>
        </view>
      </scroll-view>
      
      <!-- 难度筛选 -->
      <view class="difficulty-filter">
        <view 
          class="diff-tag" 
          v-for="diff in difficultyLevels" 
          :key="diff.id"
          :class="{ active: filters.difficulty === diff.id }"
          @click="handleFilterDifficulty(diff.id)"
        >
          {{ diff.name }}
        </view>
      </view>
    </view>

    <!-- 实验列表 -->
    <view class="experiment-list">
      <view 
        class="experiment-card" 
        v-for="exp in filteredExperiments" 
        :key="exp.id"
        @click="handleSelectExperiment(exp)"
      >
        <view class="card-header">
          <view class="exp-category" :style="{ backgroundColor: getCategoryColor(exp.category) }">
            {{ getCategoryIcon(exp.category) }}
          </view>
          <view class="exp-meta">
            <text class="exp-difficulty" :style="{ color: getDifficultyColor(exp.difficulty) }">
              {{ getDifficultyName(exp.difficulty) }}
            </text>
            <text class="exp-duration">{{ exp.duration }}分钟</text>
          </view>
        </view>
        
        <view class="card-body">
          <text class="exp-title">{{ exp.title }}</text>
          <text class="exp-desc">{{ exp.description }}</text>
        </view>
        
        <view class="card-footer">
          <view class="safety-info">
            <text class="safety-icon">{{ getSafetyIcon(exp.safetyLevel) }}</text>
            <text class="safety-text">{{ getSafetyName(exp.safetyLevel) }}</text>
          </view>
          <view class="exp-points">
            <text class="points-badge">+{{ exp.points }}</text>
          </view>
          <view class="exp-status" v-if="exp.isCompleted">
            <text class="completed-icon">✓</text>
            <text class="completed-text">已完成</text>
          </view>
        </view>
      </view>
      
      <view class="empty-tip" v-if="filteredExperiments.length === 0">
        <text>暂无符合条件的实验</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useScienceStore } from '@/stores/scienceStore.js'
import { SCIENCE_CATEGORIES, DIFFICULTY_LEVELS, SAFETY_LEVELS } from '@/services/scienceService.js'

const scienceStore = useScienceStore()

// 积分
const sciencePoints = computed(() => scienceStore.sciencePoints)

// 实验列表
const experiments = computed(() => scienceStore.experiments)
const filteredExperiments = computed(() => scienceStore.filteredExperiments)

// 筛选
const filters = computed(() => scienceStore.filters)
const categories = computed(() => scienceStore.categories)
const difficultyLevels = computed(() => scienceStore.difficultyLevels)

// 统计
const completedCount = computed(() => scienceStore.completedExperimentsCount)
const unlockedAwardsCount = computed(() => scienceStore.unlockedAwardsCount)

// 分类相关
const getCategoryIcon = (categoryId) => {
  const cat = Object.values(SCIENCE_CATEGORIES).find(c => c.id === categoryId)
  return cat ? cat.icon : '🔬'
}

const getCategoryColor = (categoryId) => {
  const cat = Object.values(SCIENCE_CATEGORIES).find(c => c.id === categoryId)
  return cat ? cat.color : '#999'
}

// 难度相关
const getDifficultyName = (difficultyId) => {
  const diff = Object.values(DIFFICULTY_LEVELS).find(d => d.id === difficultyId)
  return diff ? diff.name : ''
}

const getDifficultyColor = (difficultyId) => {
  const diff = Object.values(DIFFICULTY_LEVELS).find(d => d.id === difficultyId)
  return diff ? diff.color : '#999'
}

// 安全等级相关
const getSafetyIcon = (safetyLevelId) => {
  const safety = Object.values(SAFETY_LEVELS).find(s => s.id === safetyLevelId)
  return safety ? safety.icon : '✓'
}

const getSafetyName = (safetyLevelId) => {
  const safety = Object.values(SAFETY_LEVELS).find(s => s.id === safetyLevelId)
  return safety ? safety.name : ''
}

// 筛选处理
const handleFilterCategory = (category) => {
  scienceStore.setFilters({ category })
}

const handleFilterDifficulty = (difficulty) => {
  if (filters.value.difficulty === difficulty) {
    scienceStore.setFilters({ difficulty: '' })
  } else {
    scienceStore.setFilters({ difficulty })
  }
}

// 选择实验
const handleSelectExperiment = (exp) => {
  scienceStore.selectExperiment(exp.id)
  uni.navigateTo({ url: '/pages/science/virtual-lab' })
}

// 初始化
onMounted(() => {
  scienceStore.init()
})
</script>

<style scoped>
.experiments-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20rpx;
}

.header-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.points-display {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.points-icon {
  font-size: 48rpx;
  margin-right: 16rpx;
}

.points-info {
  flex: 1;
}

.points-value {
  font-size: 40rpx;
  font-weight: bold;
  color: #fff;
}

.points-label {
  font-size: 24rpx;
  color: rgba(255,255,255,0.8);
}

.level-badge {
  background: rgba(255,255,255,0.2);
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
  color: #fff;
}

.stats-row {
  display: flex;
  justify-content: space-around;
  background: rgba(255,255,255,0.15);
  border-radius: 12rpx;
  padding: 20rpx;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 32rpx;
  font-weight: bold;
  color: #fff;
}

.stat-label {
  font-size: 22rpx;
  color: rgba(255,255,255,0.8);
}

.filter-section {
  background: #fff;
  border-radius: 16rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
}

.filter-scroll {
  white-space: nowrap;
}

.filter-tags {
  display: inline-flex;
  gap: 16rpx;
}

.filter-tag {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 24rpx;
  border-radius: 30rpx;
  background: #f0f0f0;
  font-size: 26rpx;
  color: #666;
  white-space: nowrap;
}

.filter-tag.active {
  background: #667eea;
  color: #fff;
}

.difficulty-filter {
  display: flex;
  gap: 16rpx;
  margin-top: 16rpx;
}

.diff-tag {
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
  background: #f0f0f0;
  font-size: 24rpx;
  color: #666;
}

.diff-tag.active {
  background: #ff6b6b;
  color: #fff;
}

.experiment-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.experiment-card {
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

.exp-category {
  width: 64rpx;
  height: 64rpx;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
}

.exp-meta {
  display: flex;
  gap: 16rpx;
  align-items: center;
}

.exp-difficulty {
  font-size: 24rpx;
  font-weight: 500;
}

.exp-duration {
  font-size: 22rpx;
  color: #999;
}

.card-body {
  margin-bottom: 16rpx;
}

.exp-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
  display: block;
}

.exp-desc {
  font-size: 26rpx;
  color: #666;
  display: block;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 16rpx;
  border-top: 1px solid #f0f0f0;
}

.safety-info {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.safety-icon {
  font-size: 24rpx;
}

.safety-text {
  font-size: 24rpx;
  color: #999;
}

.points-badge {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: #fff;
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  font-weight: 500;
}

.exp-status {
  display: flex;
  align-items: center;
  gap: 6rpx;
}

.completed-icon {
  color: #2ecc71;
  font-size: 24rpx;
}

.completed-text {
  color: #2ecc71;
  font-size: 24rpx;
}

.empty-tip {
  text-align: center;
  padding: 60rpx;
  color: #999;
  font-size: 28rpx;
}
</style>
