<template>
  <view class="category-page">
    <!-- 头部 -->
    <view class="header" :style="{ backgroundColor: categoryColor }">
      <view class="header-back" @click="goBack">←</view>
      <view class="header-content">
        <text class="header-icon">{{ categoryIcon }}</text>
        <text class="header-title">{{ categoryName }}</text>
        <text class="header-subtitle">{{ categoryDescription }}</text>
      </view>
    </view>

    <!-- 学习进度 -->
    <view class="progress-card">
      <view class="progress-info">
        <text class="progress-label">已学习</text>
        <text class="progress-value">{{ learnedCount }}/{{ totalCount }}</text>
      </view>
      <view class="progress-bar">
        <view class="progress-fill" :style="{ width: categoryProgress + '%', backgroundColor: categoryColor }"></view>
      </view>
    </view>

    <!-- 知识列表 -->
    <view class="knowledge-list">
      <view 
        class="knowledge-item"
        v-for="item in safetyStore.safetyKnowledge"
        :key="item.id"
        @click="showDetail(item)"
      >
        <view class="knowledge-icon" :class="getDifficultyClass(item.difficulty)">
          {{ getDifficultyIcon(item.difficulty) }}
        </view>
        <view class="knowledge-info">
          <text class="knowledge-title">{{ item.title }}</text>
          <view class="knowledge-meta">
            <text class="knowledge-difficulty" :style="{ color: categoryColor }">
              {{ getDifficultyText(item.difficulty) }}
            </text>
            <text class="knowledge-points">+{{ item.points }}积分</text>
          </view>
        </view>
        <view class="knowledge-status">
          <text v-if="isLearned(item.id)" class="learned-icon">✓</text>
          <text v-else class="unlearned-icon">></text>
        </view>
      </view>
    </view>

    <!-- 开始测试按钮 -->
    <view class="quiz-section">
      <button class="quiz-btn" :style="{ backgroundColor: categoryColor }" @click="startQuiz">
        开始{{ categoryName }}测试
      </button>
    </view>

    <!-- 知识详情弹窗 -->
    <uni-popup ref="detailPopup" type="center">
      <view class="detail-popup" v-if="selectedKnowledge">
        <view class="detail-header">
          <text class="detail-icon">{{ getDifficultyIcon(selectedKnowledge.difficulty) }}</text>
          <text class="detail-title">{{ selectedKnowledge.title }}</text>
        </view>
        <scroll-view class="detail-scroll" scroll-y>
          <view class="detail-content">
            <text class="detail-text">{{ selectedKnowledge.content }}</text>
          </view>
          
          <view class="detail-tips">
            <text class="tips-title">急救提示</text>
            <view class="tip-item" v-for="(tip, index) in selectedKnowledge.tips" :key="index">
              <text class="tip-bullet">•</text>
              <text class="tip-text">{{ tip }}</text>
            </view>
          </view>
        </scroll-view>
        
        <view class="detail-footer">
          <view class="detail-meta">
            <text class="detail-points">+{{ selectedKnowledge.points }}积分</text>
          </view>
          <button 
            v-if="!isLearned(selectedKnowledge.id)" 
            class="learn-btn"
            :style="{ backgroundColor: categoryColor }"
            @click="handleLearn(selectedKnowledge)"
          >
            学习并获得积分
          </button>
          <text v-else class="already-learned">已学习 ✓</text>
        </view>
        <view class="detail-close" @click="closeDetail">×</view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useSafetyStore } from '@/stores/safetyStore.js'
import { SAFETY_CATEGORIES, CATEGORY_INFO } from '@/services/safetyService.js'

const safetyStore = useSafetyStore()
const detailPopup = ref(null)
const selectedKnowledge = ref(null)

const category = ref(SAFETY_CATEGORIES.FIRST_AID)

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = currentPage.options || {}
  
  if (options.category) {
    category.value = options.category
  }
  
  safetyStore.switchCategory(category.value)
})

const categoryName = computed(() => CATEGORY_INFO[category.value]?.name || '急救知识')
const categoryIcon = computed(() => CATEGORY_INFO[category.value]?.icon || '🏥')
const categoryColor = computed(() => CATEGORY_INFO[category.value]?.color || '#9B59B6')
const categoryDescription = computed(() => CATEGORY_INFO[category.value]?.description || '')

const learnedCount = computed(() => {
  return safetyStore.safetyKnowledge.filter(item => safetyStore.checkLearned(item.id)).length
})

const totalCount = computed(() => safetyStore.safetyKnowledge.length)

const categoryProgress = computed(() => {
  if (totalCount.value === 0) return 0
  return Math.round((learnedCount.value / totalCount.value) * 100)
})

const goBack = () => {
  uni.navigateBack()
}

const isLearned = (id) => {
  return safetyStore.checkLearned(id)
}

const getDifficultyClass = (difficulty) => {
  return 'difficulty-' + difficulty
}

const getDifficultyIcon = (difficulty) => {
  const icons = { 1: '⭐', 2: '⭐⭐', 3: '⭐⭐⭐' }
  return icons[difficulty] || '⭐'
}

const getDifficultyText = (difficulty) => {
  const texts = { 1: '简单', 2: '中等', 3: '困难' }
  return texts[difficulty] || '简单'
}

const showDetail = (knowledge) => {
  selectedKnowledge.value = knowledge
  detailPopup.value.open()
}

const closeDetail = () => {
  detailPopup.value.close()
  selectedKnowledge.value = null
}

const handleLearn = (knowledge) => {
  safetyStore.learnKnowledge(knowledge.id)
  closeDetail()
}

const startQuiz = () => {
  safetyStore.startQuiz(category.value, 5)
  uni.navigateTo({
    url: `/pages/safety/quiz?category=${category.value}`
  })
}
</script>

<style scoped>
.category-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 80px;
}

.header {
  padding: 20px;
  color: #fff;
  position: relative;
}

.header-back {
  font-size: 24px;
  margin-bottom: 10px;
}

.header-content {
  text-align: center;
}

.header-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 10px;
}

.header-title {
  font-size: 24px;
  font-weight: bold;
  display: block;
  margin-bottom: 5px;
}

.header-subtitle {
  font-size: 14px;
  opacity: 0.9;
  display: block;
}

.progress-card {
  background: #fff;
  margin: -15px 15px 15px;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  position: relative;
  z-index: 1;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.progress-label {
  font-size: 14px;
  color: #666;
}

.progress-value {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.progress-bar {
  height: 6px;
  background: #eee;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s;
}

.knowledge-list {
  padding: 0 15px;
}

.knowledge-item {
  background: #fff;
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.knowledge-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  font-size: 18px;
}

.difficulty-1 {
  background: #E8F8F5;
  color: #27AE60;
}

.difficulty-2 {
  background: #FEF9E7;
  color: #F39C12;
}

.difficulty-3 {
  background: #FDEDEC;
  color: #E74C3C;
}

.knowledge-info {
  flex: 1;
}

.knowledge-title {
  font-size: 15px;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 4px;
}

.knowledge-meta {
  display: flex;
  align-items: center;
  gap: 10px;
}

.knowledge-difficulty {
  font-size: 12px;
}

.knowledge-points {
  font-size: 12px;
  color: #999;
}

.knowledge-status {
  margin-left: 10px;
}

.learned-icon {
  color: #27AE60;
  font-size: 18px;
  font-weight: bold;
}

.unlearned-icon {
  color: #ccc;
  font-size: 18px;
}

.quiz-section {
  padding: 15px;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.05);
}

.quiz-btn {
  width: 100%;
  height: 44px;
  border-radius: 22px;
  color: #fff;
  font-size: 16px;
  font-weight: bold;
  border: none;
  line-height: 44px;
}

.detail-popup {
  width: 320px;
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  position: relative;
}

.detail-header {
  padding: 20px;
  text-align: center;
  background: linear-gradient(135deg, #9B59B6 0%, #8E44AD 100%);
  color: #fff;
}

.detail-icon {
  font-size: 36px;
  display: block;
  margin-bottom: 8px;
}

.detail-title {
  font-size: 18px;
  font-weight: bold;
  display: block;
}

.detail-scroll {
  max-height: 300px;
  padding: 15px;
}

.detail-content {
  margin-bottom: 15px;
}

.detail-text {
  font-size: 14px;
  color: #333;
  line-height: 1.6;
}

.detail-tips {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 12px;
}

.tips-title {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 8px;
}

.tip-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 6px;
}

.tip-bullet {
  color: #27AE60;
  margin-right: 8px;
}

.tip-text {
  font-size: 13px;
  color: #666;
  flex: 1;
}

.detail-footer {
  padding: 15px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid #eee;
}

.detail-meta {
  display: flex;
  align-items: center;
}

.detail-points {
  font-size: 16px;
  font-weight: bold;
  color: #27AE60;
}

.learn-btn {
  padding: 8px 20px;
  border-radius: 20px;
  color: #fff;
  font-size: 14px;
  border: none;
}

.already-learned {
  color: #27AE60;
  font-size: 14px;
  font-weight: bold;
}

.detail-close {
  position: absolute;
  top: 10px;
  right: 15px;
  font-size: 24px;
  color: #fff;
  opacity: 0.8;
}
</style>
