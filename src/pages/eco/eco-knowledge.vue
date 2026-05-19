<template>
  <view class="eco-knowledge-page">
    <!-- 头部 -->
    <view class="header">
      <text class="header-title">环保知识库</text>
      <text class="header-subtitle">学习环保知识，成为环保小达人</text>
    </view>

    <!-- 学习进度 -->
    <view class="progress-card">
      <view class="progress-info">
        <text class="progress-label">已学习</text>
        <text class="progress-value">{{ learnedCount }}/{{ totalCount }}</text>
      </view>
      <view class="progress-bar">
        <view class="progress-fill" :style="{ width: progressPercent + '%' }"></view>
      </view>
      <text class="progress-hint">学习全部知识可获得 {{ totalPoints }} 积分</text>
    </view>

    <!-- 分类标签 -->
    <view class="category-tabs">
      <view 
        class="tab-item" 
        :class="{ active: currentCategory === null }"
        @click="switchCategory(null)"
      >
        全部
      </view>
      <view 
        class="tab-item" 
        v-for="cat in knowledgeCategories" 
        :key="cat"
        :class="{ active: currentCategory === cat }"
        @click="switchCategory(cat)"
      >
        {{ cat }}
      </view>
    </view>

    <!-- 知识列表 -->
    <view class="knowledge-list">
      <view 
        class="knowledge-item" 
        v-for="item in filteredKnowledge" 
        :key="item.id"
        @click="showKnowledgeDetail(item)"
      >
        <view class="knowledge-icon" :class="item.category">
          {{ getCategoryIcon(item.category) }}
        </view>
        <view class="knowledge-info">
          <text class="knowledge-title">{{ item.title }}</text>
          <view class="knowledge-meta">
            <text class="knowledge-category">{{ item.category }}</text>
            <text class="knowledge-points">+{{ item.points }}积分</text>
          </view>
        </view>
        <view class="knowledge-status">
          <text v-if="isLearned(item.id)" class="learned-tag">已学习</text>
          <text v-else class="unlearned-icon">></text>
        </view>
      </view>
    </view>

    <!-- 知识详情弹窗 -->
    <uni-popup ref="detailPopup" type="center">
      <view class="detail-popup" v-if="selectedKnowledge">
        <view class="detail-header">
          <text class="detail-icon">{{ getCategoryIcon(selectedKnowledge.category) }}</text>
          <text class="detail-title">{{ selectedKnowledge.title }}</text>
        </view>
        <view class="detail-content">
          <text class="detail-text">{{ selectedKnowledge.content }}</text>
        </view>
        <view class="detail-footer">
          <view class="detail-meta">
            <text class="detail-category">{{ selectedKnowledge.category }}</text>
            <text class="detail-points">+{{ selectedKnowledge.points }}积分</text>
          </view>
          <button 
            v-if="!isLearned(selectedKnowledge.id)" 
            class="learn-btn"
            @click="handleLearn(selectedKnowledge)"
          >
            学习并获得积分
          </button>
          <text v-else class="already-learned">已学习</text>
        </view>
        <view class="detail-close" @click="closeDetail">×</view>
      </view>
    </uni-popup>

    <!-- 知识测试入口 -->
    <view class="quiz-entry" @click="goToQuiz">
      <view class="entry-left">
        <text class="entry-icon">📝</text>
        <view class="entry-info">
          <text class="entry-title">环保知识小测试</text>
          <text class="entry-subtitle">检验你的环保知识</text>
        </view>
      </view>
      <text class="entry-arrow">></text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useEcoStore } from '@/stores/ecoStore.js'

const ecoStore = useEcoStore()

// 当前分类
const currentCategory = ref(null)

// 选中的知识
const selectedKnowledge = ref(null)

// 弹窗引用
const detailPopup = ref(null)

// 知识分类
const knowledgeCategories = computed(() => ecoStore.knowledgeCategories)

// 知识列表
const knowledgeList = computed(() => ecoStore.knowledgeList)

// 已学习的知识ID列表
const learnedKnowledge = computed(() => ecoStore.learnedKnowledge)

// 学习数量
const learnedCount = computed(() => learnedKnowledge.value.length)

// 总数
const totalCount = computed(() => knowledgeList.value.length)

// 总积分
const totalPoints = computed(() => 
  knowledgeList.value.reduce((sum, k) => sum + k.points, 0)
)

// 进度百分比
const progressPercent = computed(() => {
  if (totalCount.value === 0) return 0
  return Math.round((learnedCount.value / totalCount.value) * 100)
})

// 筛选后的知识
const filteredKnowledge = computed(() => {
  if (currentCategory.value) {
    return knowledgeList.value.filter(k => k.category === currentCategory.value)
  }
  return knowledgeList.value
})

// 切换分类
const switchCategory = (category) => {
  currentCategory.value = category
}

// 获取分类图标
const getCategoryIcon = (category) => {
  const icons = {
    '基础概念': '📚',
    '垃圾分类': '🗑️',
    '节约用水': '💧',
    '节约用电': '💡',
    '低碳生活': '🌿',
    '减塑行动': '🥤',
    '生态保护': '🐾',
    '能源知识': '⚡'
  }
  return icons[category] || '🌱'
}

// 检查是否已学习
const isLearned = (knowledgeId) => {
  return learnedKnowledge.value.includes(knowledgeId)
}

// 显示知识详情
const showKnowledgeDetail = (item) => {
  selectedKnowledge.value = item
  detailPopup.value.open()
}

// 关闭详情
const closeDetail = () => {
  detailPopup.value.close()
}

// 学习知识
const handleLearn = (item) => {
  ecoStore.learnKnowledge(item.id)
  closeDetail()
  uni.showToast({ title: `获得${item.points}积分！`, icon: 'success' })
}

// 跳转到测试
const goToQuiz = () => {
  uni.navigateTo({ url: '/pages/eco/eco-quiz' })
}

// 初始化
onMounted(() => {
  ecoStore.init()
})
</script>

<style scoped>
.eco-knowledge-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20rpx;
}

.header {
  padding: 30rpx 0;
}

.header-title {
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
  display: block;
}

.header-subtitle {
  font-size: 26rpx;
  color: #999;
  margin-top: 8rpx;
  display: block;
}

.progress-card {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  border-radius: 16rpx;
  padding: 30rpx;
  color: #fff;
  margin-bottom: 20rpx;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.progress-label {
  font-size: 28rpx;
}

.progress-value {
  font-size: 28rpx;
  font-weight: bold;
}

.progress-bar {
  height: 16rpx;
  background: rgba(255,255,255,0.3);
  border-radius: 8rpx;
  overflow: hidden;
  margin-bottom: 12rpx;
}

.progress-fill {
  height: 100%;
  background: #fff;
  border-radius: 8rpx;
  transition: width 0.3s;
}

.progress-hint {
  font-size: 24rpx;
  opacity: 0.9;
}

.category-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-bottom: 20rpx;
}

.tab-item {
  padding: 12rpx 24rpx;
  background: #fff;
  border-radius: 24rpx;
  font-size: 26rpx;
  color: #666;
}

.tab-item.active {
  background: #11998e;
  color: #fff;
}

.knowledge-list {
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
}

.knowledge-item {
  display: flex;
  align-items: center;
  padding: 24rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.knowledge-item:last-child {
  border-bottom: none;
}

.knowledge-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 16rpx;
  background: #e8f5e9;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  margin-right: 16rpx;
}

.knowledge-info {
  flex: 1;
}

.knowledge-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.knowledge-meta {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.knowledge-category {
  font-size: 22rpx;
  color: #11998e;
  background: #e0f2f1;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
}

.knowledge-points {
  font-size: 22rpx;
  color: #ff9800;
  font-weight: bold;
}

.knowledge-status {
  margin-left: 16rpx;
}

.learned-tag {
  font-size: 24rpx;
  color: #4caf50;
  font-weight: bold;
}

.unlearned-icon {
  font-size: 32rpx;
  color: #ccc;
}

/* 详情弹窗 */
.detail-popup {
  width: 650rpx;
  background: #fff;
  border-radius: 24rpx;
  padding: 40rpx;
  position: relative;
}

.detail-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30rpx;
}

.detail-icon {
  font-size: 72rpx;
  margin-bottom: 16rpx;
}

.detail-title {
  font-size: 34rpx;
  font-weight: bold;
  color: #333;
  text-align: center;
}

.detail-content {
  background: #f9f9f9;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 30rpx;
}

.detail-text {
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
}

.detail-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20rpx;
}

.detail-meta {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.detail-category {
  font-size: 24rpx;
  color: #11998e;
  background: #e0f2f1;
  padding: 6rpx 16rpx;
  border-radius: 8rpx;
}

.detail-points {
  font-size: 26rpx;
  color: #ff9800;
  font-weight: bold;
}

.learn-btn {
  width: 100%;
  padding: 24rpx;
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  color: #fff;
  font-size: 30rpx;
  font-weight: bold;
  border-radius: 44rpx;
  border: none;
}

.already-learned {
  font-size: 28rpx;
  color: #4caf50;
  font-weight: bold;
}

.detail-close {
  position: absolute;
  top: 20rpx;
  right: 24rpx;
  font-size: 48rpx;
  color: #ccc;
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.quiz-entry {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20rpx;
}

.entry-left {
  display: flex;
  align-items: center;
}

.entry-icon {
  font-size: 48rpx;
  margin-right: 16rpx;
}

.entry-info {
  display: flex;
  flex-direction: column;
}

.entry-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}

.entry-subtitle {
  font-size: 24rpx;
  color: #999;
  margin-top: 4rpx;
}

.entry-arrow {
  font-size: 32rpx;
  color: #999;
}
</style>
