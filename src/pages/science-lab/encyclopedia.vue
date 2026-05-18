<template>
  <view class="encyclopedia-page">
    <!-- 页面标题 -->
    <view class="page-header">
      <text class="page-title">📚 科学百科</text>
      <text class="page-subtitle">探索科学的奥秘</text>
    </view>

    <!-- 分类导航 -->
    <view class="category-nav">
      <view 
        class="category-tab"
        :class="{ active: selectedCategory === cat.id }"
        v-for="cat in categories"
        :key="cat.id"
        @click="selectedCategory = cat.id"
      >
        <text class="cat-icon">{{ cat.icon }}</text>
        <text class="cat-name">{{ cat.name }}</text>
      </view>
    </view>

    <!-- 百科内容 -->
    <view class="encyclopedia-content">
      <view class="section-header">
        <text class="section-title">{{ currentCategoryName }}</text>
        <text class="section-count">{{ filteredArticles.length }} 篇</text>
      </view>

      <view v-if="filteredArticles.length === 0" class="empty-state">
        <text class="empty-icon">📖</text>
        <text class="empty-text">暂无内容</text>
      </view>

      <view class="article-list">
        <view 
          class="article-card"
          v-for="article in filteredArticles"
          :key="article.id"
          @click="viewArticle(article)"
        >
          <view class="article-icon" :style="{ backgroundColor: getCategoryColor(article.category) }">
            <text>{{ article.icon }}</text>
          </view>
          <view class="article-info">
            <text class="article-title">{{ article.title }}</text>
            <text class="article-preview">{{ article.content.substring(0, 50) }}...</text>
            <view class="article-tags">
              <text class="article-tag" :class="article.difficulty">{{ getDifficultyText(article.difficulty) }}</text>
              <text v-if="article.isRead" class="article-read">已阅读</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 文章详情弹窗 -->
    <uni-popup ref="articlePopup" type="bottom">
      <view class="article-popup" v-if="currentArticle">
        <view class="popup-header">
          <view class="popup-icon" :style="{ backgroundColor: getCategoryColor(currentArticle.category) }">
            <text>{{ currentArticle.icon }}</text>
          </view>
          <view class="popup-title-area">
            <text class="popup-title">{{ currentArticle.title }}</text>
            <text class="popup-category">{{ getCategoryName(currentArticle.category) }}</text>
          </view>
          <text class="popup-close" @click="closeArticle">✕</text>
        </view>
        
        <scroll-view class="popup-content" scroll-y>
          <text class="article-body">{{ currentArticle.content }}</text>
          
          <view class="fun-facts" v-if="currentArticle.funFacts?.length">
            <text class="facts-title">🌟 有趣的事实</text>
            <view class="fact-list">
              <text class="fact-item" v-for="(fact, idx) in currentArticle.funFacts" :key="idx">
                {{ fact }}
              </text>
            </view>
          </view>
          
          <view class="related-experiments" v-if="currentArticle.relatedExperiments?.length">
            <text class="related-title">🔬 相关实验</text>
            <view class="related-list">
              <text 
                class="related-item"
                v-for="expId in currentArticle.relatedExperiments"
                :key="expId"
                @click="goToExperiment(expId)"
              >
                {{ getExperimentName(expId) }}
              </text>
            </view>
          </view>
        </scroll-view>
        
        <view class="popup-footer">
          <button 
            class="btn-read" 
            :class="{ completed: currentArticle.isRead }"
            @click="markAsRead"
          >
            {{ currentArticle.isRead ? '✓ 已阅读' : '标记为已阅读' }}
          </button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
import { useScienceLabStore } from '@/stores/scienceLabStore.js'
import scienceLabService from '@/services/scienceLabService.js'

export default {
  data() {
    return {
      selectedCategory: 'all'
    }
  },
  computed: {
    store() {
      return useScienceLabStore()
    },
    categories() {
      return [
        { id: 'all', name: '全部', icon: '📚' },
        { id: 'chemistry', name: '化学', icon: '🧪' },
        { id: 'physics', name: '物理', icon: '⚡' },
        { id: 'biology', name: '生物', icon: '🌱' },
        { id: 'earth', name: '地球', icon: '🌍' },
        { id: 'astronomy', name: '天文', icon: '🚀' },
        { id: 'stories', name: '故事', icon: '🏆' }
      ]
    },
    currentCategoryName() {
      const cat = this.categories.find(c => c.id === this.selectedCategory)
      return cat ? cat.name : '全部'
    },
    filteredArticles() {
      if (this.selectedCategory === 'all') {
        return this.store.encyclopedia
      }
      return this.store.encyclopedia.filter(a => a.category === this.selectedCategory)
    },
    currentArticle() {
      return this.store.currentArticle
    }
  },
  onLoad() {
    this.store.init()
  },
  methods: {
    viewArticle(article) {
      this.store.selectArticle(article.id)
      this.$refs.articlePopup.open()
    },
    closeArticle() {
      this.$refs.articlePopup.close()
    },
    markAsRead() {
      if (!this.currentArticle?.isRead) {
        this.store.markArticleRead()
        uni.showToast({ title: '已标记为阅读', icon: 'success' })
      }
    },
    goToExperiment(expId) {
      this.$refs.articlePopup.close()
      // 跳转到虚拟实验室
      uni.navigateTo({ url: '/pages/science-lab/virtual-lab' })
    },
    getExperimentName(expId) {
      const experiments = scienceLabService.getScienceExperiments()
      const exp = experiments.find(e => e.id === expId)
      return exp ? exp.title : expId
    },
    getCategoryColor(category) {
      const colors = {
        chemistry: '#9B59B6',
        physics: '#3498DB',
        biology: '#27AE60',
        earth: '#E67E22',
        astronomy: '#2C3E50',
        stories: '#f39c12'
      }
      return colors[category] || '#999'
    },
    getCategoryName(category) {
      const cat = this.categories.find(c => c.id === category)
      return cat ? cat.name : category
    },
    getDifficultyText(difficulty) {
      const texts = { easy: '基础', medium: '进阶', hard: '高级' }
      return texts[difficulty] || difficulty
    }
  }
}
</script>

<style scoped>
.encyclopedia-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 20px;
}

.page-header {
  background: linear-gradient(135deg, #4a90e2 0%, #7b68ee 100%);
  padding: 20px;
  color: #fff;
}

.page-title {
  font-size: 20px;
  font-weight: bold;
  display: block;
}

.page-subtitle {
  font-size: 13px;
  opacity: 0.9;
  margin-top: 5px;
}

.category-nav {
  display: flex;
  gap: 8px;
  padding: 15px;
  overflow-x: auto;
  background: #fff;
  white-space: nowrap;
}

.category-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 15px;
  border-radius: 10px;
  background: #f5f5f5;
  min-width: 55px;
}

.category-tab.active {
  background: linear-gradient(135deg, #4a90e2 0%, #7b68ee 100%);
  color: #fff;
}

.cat-icon {
  font-size: 22px;
}

.cat-name {
  font-size: 11px;
  margin-top: 4px;
}

.encyclopedia-content {
  padding: 15px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.section-count {
  font-size: 12px;
  color: #999;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
  color: #999;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 10px;
}

.article-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.article-card {
  display: flex;
  background: #fff;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.article-icon {
  width: 55px;
  height: 55px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  flex-shrink: 0;
}

.article-info {
  flex: 1;
  margin-left: 12px;
}

.article-title {
  font-size: 15px;
  font-weight: bold;
  color: #333;
  display: block;
}

.article-preview {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
  display: block;
  line-height: 1.4;
}

.article-tags {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.article-tag {
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 4px;
}

.article-tag.easy {
  color: #27ae60;
  background: #e8f8f0;
}

.article-tag.medium {
  color: #f39c12;
  background: #fef9e7;
}

.article-tag.hard {
  color: #e74c3c;
  background: #fdedec;
}

.article-read {
  font-size: 10px;
  color: #4a90e2;
  background: #e8f4fd;
  padding: 2px 8px;
  border-radius: 4px;
}

/* Article Popup */
.article-popup {
  background: #fff;
  border-radius: 20px 20px 0 0;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.popup-header {
  display: flex;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.popup-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
}

.popup-title-area {
  flex: 1;
  margin-left: 12px;
}

.popup-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  display: block;
}

.popup-category {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}

.popup-close {
  font-size: 20px;
  color: #999;
  padding: 5px;
}

.popup-content {
  flex: 1;
  padding: 20px;
  max-height: 50vh;
}

.article-body {
  font-size: 15px;
  color: #333;
  line-height: 1.8;
  display: block;
}

.fun-facts {
  margin-top: 20px;
  padding: 15px;
  background: linear-gradient(135deg, #fffbe6 0%, #fff 100%);
  border-radius: 12px;
  border: 1px solid #f0c36d;
}

.facts-title {
  font-size: 14px;
  font-weight: bold;
  color: #f39c12;
  display: block;
  margin-bottom: 10px;
}

.fact-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.fact-item {
  font-size: 13px;
  color: #666;
  line-height: 1.5;
  padding-left: 15px;
  position: relative;
}

.fact-item::before {
  content: '•';
  position: absolute;
  left: 0;
  color: #f39c12;
}

.related-experiments {
  margin-top: 20px;
}

.related-title {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 10px;
}

.related-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.related-item {
  font-size: 12px;
  color: #4a90e2;
  background: #e8f4fd;
  padding: 6px 12px;
  border-radius: 15px;
}

.popup-footer {
  padding: 15px 20px;
  border-top: 1px solid #f0f0f0;
}

.btn-read {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #4a90e2 0%, #7b68ee 100%);
  color: #fff;
  border: none;
  border-radius: 25px;
  font-size: 14px;
}

.btn-read.completed {
  background: #eee;
  color: #999;
}
</style>
