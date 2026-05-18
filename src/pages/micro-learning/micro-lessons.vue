<template>
  <view class="micro-lessons-page">
    <!-- 头部 -->
    <view class="header">
      <view class="header-content">
        <text class="page-title">🎬 微课堂</text>
        <text class="page-subtitle">5分钟轻松学习</text>
      </view>
      <view class="progress-info" @tap="showProgress">
        <text class="progress-text">进度 {{ store.learningProgress }}%</text>
      </view>
    </view>

    <!-- 统计卡片 -->
    <view class="stats-bar">
      <view class="stat-item">
        <text class="stat-value">{{ store.userProgress.completedLessons }}</text>
        <text class="stat-label">已完成</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item">
        <text class="stat-value">{{ store.userProgress.totalLessons }}</text>
        <text class="stat-label">总课程</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item">
        <text class="stat-value">{{ store.userProgress.totalPoints }}</text>
        <text class="stat-label">获得积分</text>
      </view>
    </view>

    <!-- 筛选栏 -->
    <view class="filter-bar">
      <view 
        class="filter-chip" 
        :class="{active: selectedType === ''}"
        @tap="clearFilter"
      >
        全部
      </view>
      <view 
        v-for="(info, type) in LESSON_TYPES_CONFIG" 
        :key="type"
        class="filter-chip"
        :class="{active: selectedType === type}"
        @tap="setFilter(type)"
      >
        {{ info.name }}
      </view>
    </view>

    <!-- 课程列表 -->
    <view class="lessons-list">
      <view 
        v-for="lesson in store.lessons" 
        :key="lesson.id"
        class="lesson-card"
        @tap="viewLessonDetail(lesson)"
      >
        <view class="lesson-thumbnail">
          <text class="lesson-icon">{{ getLessonIcon(lesson.type) }}</text>
          <view class="lesson-duration">
            <text>{{ formatDuration(lesson.duration) }}</text>
          </view>
        </view>
        <view class="lesson-info">
          <view class="lesson-type-tag" :style="{background: getLessonColor(lesson.type)}">
            {{ getLessonTypeName(lesson.type) }}
          </view>
          <text class="lesson-title">{{ lesson.title }}</text>
          <text class="lesson-desc">{{ lesson.description }}</text>
          <view class="lesson-meta">
            <text class="meta-tag">{{ lesson.ageGroup }}岁</text>
            <text class="meta-tag">{{ getDifficultyName(lesson.difficulty) }}</text>
          </view>
          <!-- 进度条 -->
          <view class="progress-bar" v-if="lesson.progress > 0">
            <view class="progress-fill" :style="{width: lesson.progress + '%'}"></view>
          </view>
          <text class="progress-text" v-if="lesson.progress > 0">已完成 {{ lesson.progress }}%</text>
        </view>
        <view class="lesson-status">
          <text v-if="lesson.completed" class="completed-badge">✅ 完成</text>
          <text v-else-if="lesson.progress > 0" class="learning-badge">🔄 学习</text>
        </view>
      </view>
    </view>

    <!-- 加载状态 -->
    <view class="loading-state" v-if="store.loading">
      <text>加载中...</text>
    </view>

    <!-- 空状态 -->
    <view class="empty-state" v-if="!store.loading && store.lessons.length === 0">
      <text class="empty-icon">🎓</text>
      <text class="empty-title">暂无微课</text>
      <text class="empty-subtitle">即将上线，敬请期待</text>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useMicroLearningStore } from '@/stores/microLearningStore.js'
import { LESSON_TYPES, DIFFICULTY } from '@/services/microLearningService.js'

const store = useMicroLearningStore()

const selectedType = ref('')

const LESSON_TYPES_CONFIG = {
  [LESSON_TYPES.VIDEO]: { name: '视频课', icon: '🎬' },
  [LESSON_TYPES.INTERACTIVE]: { name: '互动课', icon: '🎮' },
  [LESSON_TYPES.QUIZ]: { name: '答题课', icon: '❓' }
}

const LESSON_ICONS = {
  [LESSON_TYPES.VIDEO]: '🎬',
  [LESSON_TYPES.INTERACTIVE]: '🎮',
  [LESSON_TYPES.QUIZ]: '❓'
}

const LESSON_COLORS = {
  [LESSON_TYPES.VIDEO]: '#1890ff',
  [LESSON_TYPES.INTERACTIVE]: '#52c41a',
  [LESSON_TYPES.QUIZ]: '#faad14'
}

function getLessonIcon(type) {
  return LESSON_ICONS[type] || '📚'
}

function getLessonColor(type) {
  return LESSON_COLORS[type] || '#666'
}

function getLessonTypeName(type) {
  return LESSON_TYPES_CONFIG[type]?.name || '微课'
}

function getDifficultyName(difficulty) {
  const names = {
    [DIFFICULTY.EASY]: '简单',
    [DIFFICULTY.MEDIUM]: '中等',
    [DIFFICULTY.HARD]: '困难'
  }
  return names[difficulty] || '普通'
}

function formatDuration(seconds) {
  const minutes = Math.floor(seconds / 60)
  return `${minutes}分钟`
}

function clearFilter() {
  selectedType.value = ''
  store.loadLessons({})
}

function setFilter(type) {
  selectedType.value = type
  store.loadLessons({ type })
}

async function viewLessonDetail(lesson) {
  await store.viewLesson(lesson.id)
  
  // 显示课程详情
  uni.showModal({
    title: lesson.title,
    content: `类型：${getLessonTypeName(lesson.type)}\n时长：${formatDuration(lesson.duration)}\n难度：${getDifficultyName(lesson.difficulty)}\n\n${lesson.description}`,
    confirmText: lesson.progress > 0 ? '继续学习' : '开始学习',
    cancelText: '返回',
    success: (res) => {
      if (res.confirm) {
        // TODO: 跳转到学习页面
        simulateLearning(lesson)
      }
    }
  })
}

function simulateLearning(lesson) {
  // 模拟学习进度
  let progress = lesson.progress || 0
  const interval = setInterval(() => {
    progress += 10
    if (progress >= 100) {
      progress = 100
      clearInterval(interval)
      uni.showToast({ title: '🎉 学习完成', icon: 'success' })
    }
    store.setLessonProgress(lesson.id, progress)
  }, 500)
}

function showProgress() {
  uni.showModal({
    title: '学习进度',
    content: `已完成课程：${store.userProgress.completedLessons} / ${store.userProgress.totalLessons}\n总进度：${store.learningProgress}%\n获得积分：${store.userProgress.totalPoints}`,
    showCancel: false
  })
}

onMounted(async () => {
  await store.loadLessons()
  await store.loadUserProgress()
})
</script>

<style scoped>
.micro-lessons-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  padding: 20rpx;
  padding-top: calc(20rpx + env(safe-area-inset-top));
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx 20rpx;
}

.header-content {
  display: flex;
  flex-direction: column;
}

.page-title {
  font-size: 40rpx;
  font-weight: bold;
  color: #ffffff;
}

.page-subtitle {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 8rpx;
}

.progress-info {
  background: rgba(255, 255, 255, 0.2);
  padding: 12rpx 24rpx;
  border-radius: 30rpx;
}

.progress-text {
  color: #ffffff;
  font-size: 24rpx;
}

.stats-bar {
  display: flex;
  justify-content: space-around;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 20rpx;
  padding: 30rpx 20rpx;
  margin-bottom: 30rpx;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 40rpx;
  font-weight: bold;
  color: #ffffff;
}

.stat-label {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 8rpx;
}

.stat-divider {
  width: 2rpx;
  background: rgba(255, 255, 255, 0.3);
}

.filter-bar {
  display: flex;
  gap: 16rpx;
  margin-bottom: 30rpx;
  overflow-x: auto;
  padding: 10rpx 0;
}

.filter-chip {
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
  padding: 12rpx 28rpx;
  border-radius: 30rpx;
  font-size: 26rpx;
  white-space: nowrap;
}

.filter-chip.active {
  background: #ffffff;
  color: #11998e;
}

.lessons-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.lesson-card {
  background: #ffffff;
  border-radius: 20rpx;
  padding: 24rpx;
  display: flex;
  gap: 24rpx;
  position: relative;
}

.lesson-thumbnail {
  width: 140rpx;
  height: 140rpx;
  background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  flex-shrink: 0;
}

.lesson-icon {
  font-size: 60rpx;
}

.lesson-duration {
  position: absolute;
  bottom: 8rpx;
  right: 8rpx;
  background: rgba(0, 0, 0, 0.6);
  color: #ffffff;
  padding: 4rpx 10rpx;
  border-radius: 8rpx;
  font-size: 20rpx;
}

.lesson-info {
  flex: 1;
  min-width: 0;
}

.lesson-type-tag {
  display: inline-block;
  color: #ffffff;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  font-size: 20rpx;
  margin-bottom: 10rpx;
}

.lesson-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.lesson-desc {
  font-size: 24rpx;
  color: #666;
  display: block;
  margin-bottom: 12rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.lesson-meta {
  display: flex;
  gap: 12rpx;
}

.meta-tag {
  background: #f0f0f0;
  color: #666;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  font-size: 20rpx;
}

.progress-bar {
  height: 8rpx;
  background: #e8e8e8;
  border-radius: 4rpx;
  margin-top: 12rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  border-radius: 4rpx;
  transition: width 0.3s;
}

.lesson-status {
  position: absolute;
  top: 20rpx;
  right: 20rpx;
}

.completed-badge {
  font-size: 24rpx;
}

.learning-badge {
  font-size: 24rpx;
}

.loading-state {
  text-align: center;
  padding: 60rpx;
  color: #ffffff;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
}

.empty-icon {
  font-size: 100rpx;
  margin-bottom: 30rpx;
}

.empty-title {
  font-size: 32rpx;
  color: #ffffff;
  font-weight: bold;
  margin-bottom: 16rpx;
}

.empty-subtitle {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.7);
}
</style>
