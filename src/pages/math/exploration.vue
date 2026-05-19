<template>
  <view class="exploration-page">
    <!-- 头部 -->
    <view class="header-card">
      <view class="header-info">
        <text class="header-icon">🔭</text>
        <view class="header-text">
          <text class="header-title">数学探索</text>
          <text class="header-subtitle">几何、代数、概率、趣味数学</text>
        </view>
      </view>
      <view class="stats-row">
        <view class="stat-item">
          <text class="stat-value">{{ mathStore.learnedLessonsCount }}</text>
          <text class="stat-label">已学习</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">/ {{ mathStore.totalLessonsCount }}</text>
          <text class="stat-label">总课时</text>
        </view>
      </view>
    </view>

    <!-- 话题列表 -->
    <view class="topics-section" v-if="!selectedTopic">
      <view class="category-tabs">
        <view 
          class="category-tab"
          :class="{ active: selectedCategory === 'all' }"
          @click="selectCategory('all')"
        >
          全部
        </view>
        <view 
          class="category-tab"
          :class="{ active: selectedCategory === 'geometry' }"
          @click="selectCategory('geometry')"
        >
          🔷 几何
        </view>
        <view 
          class="category-tab"
          :class="{ active: selectedCategory === 'algebra' }"
          @click="selectCategory('algebra')"
        >
          🔢 代数
        </view>
        <view 
          class="category-tab"
          :class="{ active: selectedCategory === 'probability' }"
          @click="selectCategory('probability')"
        >
          📊 概率
        </view>
        <view 
          class="category-tab"
          :class="{ active: selectedCategory === 'fun_math' }"
          @click="selectCategory('fun_math')"
        >
          🧩 趣味
        </view>
      </view>

      <view class="topics-list">
        <view 
          class="topic-card"
          v-for="topic in filteredTopics" 
          :key="topic.id"
          @click="handleSelectTopic(topic)"
        >
          <view class="topic-icon">{{ topic.icon }}</view>
          <view class="topic-content">
            <text class="topic-title">{{ topic.title }}</text>
            <text class="topic-desc">{{ topic.description }}</text>
            <view class="topic-meta">
              <view class="meta-item">
                <text>{{ topic.lessons.length }} 课时</text>
              </view>
              <view class="meta-item">
                <text>{{ topic.points }} 积分</text>
              </view>
              <view class="meta-item">
                <text>{{ getLearnedCount(topic) }}/{{ topic.lessons.length }}</text>
              </view>
            </view>
          </view>
          <view class="topic-arrow">›</view>
        </view>
      </view>
    </view>

    <!-- 话题详情 -->
    <view class="topic-detail" v-if="selectedTopic">
      <view class="detail-header">
        <view class="back-btn" @click="closeTopic">
          <text>‹ 返回</text>
        </view>
        <view class="topic-header-info">
          <text class="detail-icon">{{ selectedTopic.icon }}</text>
          <text class="detail-title">{{ selectedTopic.title }}</text>
        </view>
      </view>

      <view class="lessons-list">
        <view 
          class="lesson-item"
          v-for="(lesson, index) in selectedTopic.lessons" 
          :key="lesson.id"
          @click="handleSelectLesson(lesson)"
        >
          <view class="lesson-number" :class="{ learned: lesson.isLearned }">
            {{ lesson.isLearned ? '✓' : index + 1 }}
          </view>
          <view class="lesson-content">
            <text class="lesson-title">{{ lesson.title }}</text>
            <text class="lesson-status">{{ lesson.isLearned ? '已学习' : '未学习' }}</text>
          </view>
          <view class="lesson-arrow">›</view>
        </view>
      </view>
    </view>

    <!-- 课程详情弹窗 -->
    <view class="lesson-modal" v-if="selectedLesson" @click="closeLesson">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">{{ selectedLesson.title }}</text>
          <text class="close-btn" @click="closeLesson">×</text>
        </view>

        <scroll-view scroll-y class="modal-body">
          <view class="lesson-text">
            <text>{{ selectedLesson.content }}</text>
          </view>

          <view class="lesson-actions">
            <view 
              class="learn-btn"
              :class="{ learned: selectedLesson.isLearned }"
              @click="handleLearnLesson"
            >
              <text>{{ selectedLesson.isLearned ? '✓ 已学习' : '标记为已学习' }}</text>
            </view>
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useMathStore } from '@/stores/mathStore.js'

const mathStore = useMathStore()

const selectedCategory = ref('all')
const selectedTopic = ref(null)
const selectedLesson = ref(null)

const topics = computed(() => mathStore.explorationTopics)

const filteredTopics = computed(() => {
  if (selectedCategory.value === 'all') {
    return topics.value
  }
  return topics.value.filter(t => t.category === selectedCategory.value)
})

const getLearnedCount = (topic) => {
  return topic.lessons.filter(l => l.isLearned).length
}

const selectCategory = (category) => {
  selectedCategory.value = category
}

const handleSelectTopic = (topic) => {
  selectedTopic.value = topic
  mathStore.selectTopic(topic)
}

const closeTopic = () => {
  selectedTopic.value = null
}

const handleSelectLesson = (lesson) => {
  selectedLesson.value = lesson
  mathStore.selectLesson(lesson)
}

const closeLesson = () => {
  selectedLesson.value = null
}

const handleLearnLesson = () => {
  if (!selectedLesson.value || selectedLesson.value.isLearned) return
  
  mathStore.learnLesson(selectedTopic.value.id, selectedLesson.value.id)
  
  // Update local state
  const topic = topics.value.find(t => t.id === selectedTopic.value.id)
  if (topic) {
    const lesson = topic.lessons.find(l => l.id === selectedLesson.value.id)
    if (lesson) {
      lesson.isLearned = true
    }
  }
  
  // Update selected topic and lesson
  if (selectedTopic.value) {
    const updatedTopic = topics.value.find(t => t.id === selectedTopic.value.id)
    if (updatedTopic) {
      selectedTopic.value = updatedTopic
    }
  }
  if (selectedLesson.value) {
    const topic = topics.value.find(t => t.id === selectedTopic.value?.id)
    if (topic) {
      const lesson = topic.lessons.find(l => l.id === selectedLesson.value?.id)
      if (lesson) {
        selectedLesson.value = lesson
      }
    }
  }
  
  uni.showToast({ title: '学习完成！', icon: 'success' })
}

onMounted(() => {
  mathStore.loadExplorationTopics()
})
</script>

<style scoped>
.exploration-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20rpx;
}

.header-card {
  background: linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%);
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

.category-tabs {
  display: flex;
  gap: 12rpx;
  margin-bottom: 20rpx;
  overflow-x: auto;
  padding-bottom: 10rpx;
}

.category-tab {
  padding: 12rpx 24rpx;
  border-radius: 30rpx;
  background: #fff;
  font-size: 24rpx;
  color: #666;
  white-space: nowrap;
  flex-shrink: 0;
}

.category-tab.active {
  background: #a18cd1;
  color: #fff;
}

.topics-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.topic-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  display: flex;
  align-items: center;
}

.topic-icon {
  font-size: 48rpx;
  margin-right: 20rpx;
}

.topic-content {
  flex: 1;
}

.topic-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.topic-desc {
  font-size: 24rpx;
  color: #999;
  display: block;
  margin-bottom: 12rpx;
}

.topic-meta {
  display: flex;
  gap: 20rpx;
}

.meta-item {
  font-size: 22rpx;
  color: #a18cd1;
  background: #f5f0ff;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
}

.topic-arrow {
  font-size: 40rpx;
  color: #ccc;
}

.topic-detail {
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;
}

.detail-header {
  background: linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%);
  padding: 30rpx;
}

.back-btn {
  color: #fff;
  font-size: 28rpx;
  margin-bottom: 20rpx;
}

.topic-header-info {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.detail-icon {
  font-size: 48rpx;
}

.detail-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #fff;
}

.lessons-list {
  padding: 20rpx;
}

.lesson-item {
  display: flex;
  align-items: center;
  padding: 24rpx;
  border-bottom: 1px solid #f0f0f0;
}

.lesson-item:last-child {
  border-bottom: none;
}

.lesson-number {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background: #f0f0f0;
  color: #999;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  font-weight: bold;
  margin-right: 20rpx;
}

.lesson-number.learned {
  background: #a18cd1;
  color: #fff;
}

.lesson-content {
  flex: 1;
}

.lesson-title {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
  display: block;
  margin-bottom: 4rpx;
}

.lesson-status {
  font-size: 22rpx;
  color: #999;
}

.lesson-arrow {
  font-size: 36rpx;
  color: #ccc;
}

.lesson-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.modal-content {
  background: #fff;
  border-radius: 24rpx;
  width: 90%;
  max-height: 70vh;
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
  padding: 30rpx;
  max-height: 50vh;
}

.lesson-text {
  background: #f9f5ff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
}

.lesson-text text {
  font-size: 28rpx;
  color: #333;
  line-height: 1.8;
}

.lesson-actions {
  display: flex;
  gap: 20rpx;
}

.learn-btn {
  flex: 1;
  background: linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%);
  color: #fff;
  text-align: center;
  padding: 24rpx;
  border-radius: 16rpx;
  font-size: 28rpx;
  font-weight: bold;
}

.learn-btn.learned {
  background: #f0f0f0;
  color: #999;
}
</style>
