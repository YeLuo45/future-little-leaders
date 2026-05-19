<template>
  <view class="templates-page">
    <!-- 顶部导航 -->
    <view class="nav-header">
      <text class="back-btn" @click="goBack">‹</text>
      <text class="nav-title">演讲模板</text>
      <text class="nav-placeholder"></text>
    </view>

    <!-- 分类标签 -->
    <view class="category-tabs">
      <view
        class="category-tab"
        :class="{ active: currentCategory === 'all' }"
        @click="selectCategory('all')"
      >
        <text>全部</text>
      </view>
      <view
        v-for="cat in categories"
        :key="cat.id"
        class="category-tab"
        :class="{ active: currentCategory === cat.id }"
        @click="selectCategory(cat.id)"
      >
        <text>{{ cat.icon }}</text>
        <text>{{ cat.name }}</text>
      </view>
    </view>

    <!-- 模板列表 -->
    <view class="templates-list">
      <view
        v-for="template in filteredTemplates"
        :key="template.id"
        class="template-card"
        @click="openTemplate(template)"
      >
        <view class="template-header">
          <view class="template-category">
            <text>{{ getCategoryIcon(template.category) }}</text>
            <text>{{ getCategoryName(template.category) }}</text>
          </view>
          <view class="template-difficulty" :style="{ background: getDifficultyColor(template.difficulty) }">
            {{ getDifficultyText(template.difficulty) }}
          </view>
        </view>
        
        <text class="template-title">{{ template.title }}</text>
        
        <view class="template-meta">
          <view class="meta-item">
            <text>⏱️</text>
            <text>{{ template.duration }}秒</text>
          </view>
          <view class="meta-item">
            <text>📝</text>
            <text>{{ template.structure.length }}部分</text>
          </view>
        </view>

        <!-- 结构预览 -->
        <view class="structure-preview">
          <view
            v-for="(part, index) in template.structure.slice(0, 3)"
            :key="index"
            class="structure-item"
          >
            <text class="part-label">{{ part.part }}</text>
          </view>
          <text v-if="template.structure.length > 3" class="more-parts">
            +{{ template.structure.length - 3 }}部分
          </text>
        </view>
      </view>

      <view v-if="filteredTemplates.length === 0" class="empty-state">
        <text>暂无模板</text>
      </view>
    </view>

    <!-- 模板详情弹窗 -->
    <view v-if="showTemplateModal" class="modal-overlay" @click="closeTemplateModal">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">{{ selectedTemplate?.title }}</text>
          <text class="modal-close" @click="closeTemplateModal">×</text>
        </view>

        <view class="modal-body">
          <!-- 基本信息 -->
          <view class="info-row">
            <view class="info-item">
              <text>⏱️ {{ selectedTemplate?.duration }}秒</text>
            </view>
            <view class="info-item">
              <text>{{ getDifficultyText(selectedTemplate?.difficulty) }}</text>
            </view>
          </view>

          <!-- 结构 -->
          <view class="section-block">
            <text class="block-title">📋 演讲结构</text>
            <view
              v-for="(part, index) in selectedTemplate?.structure"
              :key="index"
              class="structure-block"
            >
              <view class="part-header">
                <text class="part-number">{{ index + 1 }}</text>
                <text class="part-name">{{ part.part }}</text>
              </view>
              <text class="part-content">{{ part.content }}</text>
            </view>
          </view>

          <!-- 技巧 -->
          <view class="section-block">
            <text class="block-title">💡 演讲技巧</text>
            <view
              v-for="(tip, index) in selectedTemplate?.tips"
              :key="index"
              class="tip-item"
            >
              <text class="tip-text">{{ tip }}</text>
            </view>
          </view>

          <!-- 评分标准 -->
          <view class="section-block">
            <text class="block-title">📊 评分标准</text>
            <view class="criteria-grid">
              <view
                v-for="(score, key) in selectedTemplate?.scoreCriteria"
                :key="key"
                class="criteria-item"
              >
                <text class="criteria-label">{{ getCriteriaLabel(key) }}</text>
                <text class="criteria-value">{{ score }}%</text>
              </view>
            </view>
          </view>
        </view>

        <view class="modal-footer">
          <button class="practice-btn" @click="startPractice">
            <text>🎤 开始练习</text>
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { usePublicSpeakingStore } from '@/stores/publicSpeakingStore.js'

const store = usePublicSpeakingStore()

// 状态
const currentCategory = ref('all')
const showTemplateModal = ref(false)
const selectedTemplate = ref(null)

// 计算属性
const categories = computed(() => store.categories)

const filteredTemplates = computed(() => {
  if (currentCategory.value === 'all') {
    return store.templates
  }
  return store.getTemplatesByCategory(currentCategory.value)
})

// 方法
const goBack = () => {
  uni.navigateBack()
}

const selectCategory = (categoryId) => {
  currentCategory.value = categoryId
}

const getCategoryIcon = (categoryId) => {
  const cat = store.getCategoryInfo(categoryId)
  return cat?.icon || '📝'
}

const getCategoryName = (categoryId) => {
  const cat = store.getCategoryInfo(categoryId)
  return cat?.name || ''
}

const getDifficultyColor = (difficulty) => {
  const colors = {
    beginner: '#52c41a',
    intermediate: '#faad14',
    advanced: '#f5222d'
  }
  return colors[difficulty] || '#999'
}

const getDifficultyText = (difficulty) => {
  const texts = {
    beginner: '初级',
    intermediate: '中级',
    advanced: '高级'
  }
  return texts[difficulty] || ''
}

const getCriteriaLabel = (key) => {
  const labels = {
    clarity: '清晰度',
    confidence: '自信度',
    expression: '表达力',
    structure: '结构化',
    logic: '逻辑性',
    engagement: '吸引力',
    content: '内容'
  }
  return labels[key] || key
}

const openTemplate = (template) => {
  selectedTemplate.value = template
  showTemplateModal.value = true
}

const closeTemplateModal = () => {
  showTemplateModal.value = false
  selectedTemplate.value = null
}

const startPractice = () => {
  if (selectedTemplate.value) {
    closeTemplateModal()
    uni.navigateTo({
      url: `/pages/public-speaking/practice?templateId=${selectedTemplate.value.id}`
    })
  }
}

onMounted(() => {
  store.init()
})
</script>

<style scoped>
.templates-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.nav-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 40rpx 30rpx 20rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.back-btn {
  font-size: 60rpx;
  color: #ffffff;
  font-weight: bold;
}

.nav-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #ffffff;
}

.nav-placeholder {
  width: 60rpx;
}

.category-tabs {
  display: flex;
  gap: 16rpx;
  padding: 20rpx 30rpx;
  background: #fff;
  overflow-x: auto;
}

.category-tab {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 24rpx;
  background: #f5f5f5;
  border-radius: 30rpx;
  white-space: nowrap;
  font-size: 26rpx;
  color: #666;
  transition: all 0.3s;
}

.category-tab.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.templates-list {
  padding: 20rpx 30rpx;
}

.template-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.template-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.template-category {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 24rpx;
  color: #666;
}

.template-difficulty {
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  color: #fff;
}

.template-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 16rpx;
}

.template-meta {
  display: flex;
  gap: 24rpx;
  margin-bottom: 16rpx;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 24rpx;
  color: #999;
}

.structure-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.structure-item {
  padding: 8rpx 16rpx;
  background: #f5f5f5;
  border-radius: 8rpx;
}

.part-label {
  font-size: 22rpx;
  color: #667eea;
}

.more-parts {
  padding: 8rpx 16rpx;
  font-size: 22rpx;
  color: #999;
}

.empty-state {
  text-align: center;
  padding: 100rpx;
  color: #999;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 999;
}

.modal-content {
  background: #fff;
  border-radius: 30rpx 30rpx 0 0;
  width: 100%;
  max-height: 85vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #eee;
  position: sticky;
  top: 0;
  background: #fff;
}

.modal-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.modal-close {
  font-size: 50rpx;
  color: #999;
}

.modal-body {
  padding: 20rpx 30rpx;
}

.info-row {
  display: flex;
  gap: 20rpx;
  margin-bottom: 24rpx;
}

.info-item {
  padding: 8rpx 20rpx;
  background: #f5f5f5;
  border-radius: 20rpx;
  font-size: 26rpx;
  color: #666;
}

.section-block {
  margin-bottom: 24rpx;
}

.block-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 16rpx;
}

.structure-block {
  background: #f8f9fa;
  border-radius: 12rpx;
  padding: 16rpx;
  margin-bottom: 12rpx;
}

.part-header {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 8rpx;
}

.part-number {
  width: 40rpx;
  height: 40rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  color: #fff;
  font-size: 22rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.part-name {
  font-size: 26rpx;
  font-weight: bold;
  color: #333;
}

.part-content {
  font-size: 24rpx;
  color: #666;
  padding-left: 52rpx;
}

.tip-item {
  padding: 12rpx 16rpx;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 8rpx;
  margin-bottom: 8rpx;
}

.tip-text {
  font-size: 24rpx;
  color: #667eea;
}

.criteria-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12rpx;
}

.criteria-item {
  display: flex;
  justify-content: space-between;
  padding: 12rpx 16rpx;
  background: #f5f5f5;
  border-radius: 8rpx;
}

.criteria-label {
  font-size: 24rpx;
  color: #666;
}

.criteria-value {
  font-size: 24rpx;
  font-weight: bold;
  color: #667eea;
}

.modal-footer {
  padding: 20rpx 30rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  border-top: 1rpx solid #eee;
}

.practice-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 44rpx;
  color: #fff;
  font-size: 32rpx;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
