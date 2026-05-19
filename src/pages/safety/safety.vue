<template>
  <view class="safety-page">
    <!-- 头部 -->
    <view class="header">
      <text class="header-title">安全教育</text>
      <text class="header-subtitle">网络安全、校园安全、家庭安全、急救知识</text>
    </view>

    <!-- 学习进度 -->
    <view class="progress-card">
      <view class="progress-info">
        <text class="progress-label">已学习</text>
        <text class="progress-value">{{ safetyStore.learnedCount }}/{{ safetyStore.totalCount }}</text>
      </view>
      <view class="progress-bar">
        <view class="progress-fill" :style="{ width: safetyStore.learningProgress + '%' }"></view>
      </view>
      <text class="progress-hint">学习安全知识，培养自我保护能力</text>
    </view>

    <!-- 分类卡片 -->
    <view class="category-grid">
      <view 
        class="category-card"
        v-for="cat in categories"
        :key="cat.key"
        :style="{ borderColor: cat.color }"
        @click="goToCategory(cat.key)"
      >
        <view class="category-icon" :style="{ backgroundColor: cat.color + '20' }">
          <text class="icon">{{ cat.icon }}</text>
        </view>
        <view class="category-info">
          <text class="category-name">{{ cat.name }}</text>
          <text class="category-desc">{{ cat.description }}</text>
          <view class="category-progress">
            <view class="mini-progress-bar">
              <view 
                class="mini-progress-fill" 
                :style="{ width: safetyStore.categoryProgress[cat.key] + '%', backgroundColor: cat.color }"
              ></view>
            </view>
            <text class="mini-progress-text">{{ safetyStore.categoryProgress[cat.key] || 0 }}%</text>
          </view>
        </view>
        <text class="arrow">></text>
      </view>
    </view>

    <!-- 快速入口 -->
    <view class="quick-entry">
      <view class="entry-title">安全知识测试</view>
      <view class="entry-list">
        <view class="entry-item" @click="startQuiz(null)">
          <text class="entry-icon">📝</text>
          <text class="entry-text">综合测试</text>
        </view>
        <view class="entry-item" @click="startQuiz('online')">
          <text class="entry-icon">💻</text>
          <text class="entry-text">网络安全测试</text>
        </view>
        <view class="entry-item" @click="startQuiz('campus')">
          <text class="entry-icon">🏫</text>
          <text class="entry-text">校园安全测试</text>
        </view>
        <view class="entry-item" @click="startQuiz('first_aid')">
          <text class="entry-icon">🏥</text>
          <text class="entry-text">急救知识测试</text>
        </view>
      </view>
    </view>

    <!-- 最近学习记录 -->
    <view class="recent-section" v-if="recentLearned.length > 0">
      <view class="section-title">最近学习</view>
      <view class="recent-list">
        <view 
          class="recent-item"
          v-for="item in recentLearned"
          :key="item.id"
          @click="showKnowledgeDetail(item)"
        >
          <text class="recent-icon">{{ getCategoryIcon(item.category) }}</text>
          <view class="recent-info">
            <text class="recent-title">{{ item.title }}</text>
            <text class="recent-time">{{ formatTime(item.learnedAt) }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useSafetyStore } from '@/stores/safetyStore.js'
import { SAFETY_CATEGORIES, CATEGORY_INFO, getSafetyKnowledgeById } from '@/services/safetyService.js'

const safetyStore = useSafetyStore()

// 分类数据
const categories = computed(() => [
  {
    key: SAFETY_CATEGORIES.ONLINE,
    name: '网络安全',
    icon: '💻',
    color: '#3498DB',
    description: '网络素养、隐私保护'
  },
  {
    key: SAFETY_CATEGORIES.CAMPUS,
    name: '校园安全',
    icon: '🏫',
    color: '#27AE60',
    description: '校园守则、应急逃生'
  },
  {
    key: SAFETY_CATEGORIES.HOME,
    name: '家庭安全',
    icon: '🏠',
    color: '#E74C3C',
    description: '用电安全、陌生人应对'
  },
  {
    key: SAFETY_CATEGORIES.FIRST_AID,
    name: '急救知识',
    icon: '🏥',
    color: '#9B59B6',
    description: '急救技能、安全演练'
  }
])

// 最近学习的知识
const recentLearned = computed(() => {
  return safetyStore.learnedKnowledgeIds.slice(0, 3).map(id => getSafetyKnowledgeById(id)).filter(Boolean)
})

onMounted(() => {
  safetyStore.init()
})

// 跳转分类页
const goToCategory = (category) => {
  safetyStore.switchCategory(category)
  uni.navigateTo({
    url: `/pages/safety/online-safety?category=${category}`
  })
}

// 开始测试
const startQuiz = (category) => {
  safetyStore.startQuiz(category, 5)
  uni.navigateTo({
    url: `/pages/safety/quiz`
  })
}

// 显示知识详情
const showKnowledgeDetail = (knowledge) => {
  safetyStore.selectKnowledge(knowledge)
  uni.navigateTo({
    url: `/pages/safety/knowledge-detail?id=${knowledge.id}`
  })
}

// 获取分类图标
const getCategoryIcon = (category) => {
  return safetyStore.getCategoryIcon(category)
}

// 格式化时间
const formatTime = (isoString) => {
  if (!isoString) return ''
  const date = new Date(isoString)
  const now = new Date()
  const diff = now - date
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前'
  if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前'
  return Math.floor(diff / 86400000) + '天前'
}
</script>

<style scoped>
.safety-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 20px;
}

.header {
  background: linear-gradient(135deg, #3498DB 0%, #2ECC71 100%);
  padding: 30px 20px;
  color: #fff;
}

.header-title {
  font-size: 24px;
  font-weight: bold;
  display: block;
  margin-bottom: 8px;
}

.header-subtitle {
  font-size: 14px;
  opacity: 0.9;
  display: block;
}

.progress-card {
  background: #fff;
  margin: -20px 15px 15px;
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
  margin-bottom: 10px;
}

.progress-label {
  font-size: 14px;
  color: #666;
}

.progress-value {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.progress-bar {
  height: 8px;
  background: #eee;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3498DB, #2ECC71);
  border-radius: 4px;
  transition: width 0.3s;
}

.progress-hint {
  font-size: 12px;
  color: #999;
}

.category-grid {
  padding: 0 15px;
}

.category-card {
  background: #fff;
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  border-left: 4px solid;
}

.category-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
}

.icon {
  font-size: 24px;
}

.category-info {
  flex: 1;
}

.category-name {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 4px;
}

.category-desc {
  font-size: 12px;
  color: #999;
  display: block;
  margin-bottom: 6px;
}

.category-progress {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mini-progress-bar {
  flex: 1;
  height: 4px;
  background: #eee;
  border-radius: 2px;
  overflow: hidden;
}

.mini-progress-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.3s;
}

.mini-progress-text {
  font-size: 11px;
  color: #999;
  width: 32px;
  text-align: right;
}

.arrow {
  font-size: 18px;
  color: #ccc;
  margin-left: 10px;
}

.quick-entry {
  background: #fff;
  margin: 15px;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.entry-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 12px;
}

.entry-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.entry-item {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.entry-icon {
  font-size: 20px;
}

.entry-text {
  font-size: 13px;
  color: #333;
}

.recent-section {
  margin: 15px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
}

.recent-list {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.recent-item {
  padding: 12px 15px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.recent-item:last-child {
  border-bottom: none;
}

.recent-icon {
  font-size: 24px;
}

.recent-info {
  flex: 1;
}

.recent-title {
  font-size: 14px;
  color: #333;
  display: block;
  margin-bottom: 2px;
}

.recent-time {
  font-size: 12px;
  color: #999;
}
</style>
