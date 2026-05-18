<template>
  <view class="quick-ref-page">
    <!-- 头部 -->
    <view class="header">
      <view class="header-content">
        <text class="page-title">🔍 知识速查</text>
        <text class="page-subtitle">快速查找知识点</text>
      </view>
      <view class="favorites-btn" @tap="goToFavorites">
        <text>❤️ {{ store.favoriteRefsCount }}</text>
      </view>
    </view>

    <!-- 搜索栏 -->
    <view class="search-bar">
      <input 
        class="search-input" 
        placeholder="搜索关键词..."
        v-model="searchKeyword"
        @confirm="doSearch"
        @input="onSearchInput"
      />
      <view class="search-btn" @tap="doSearch">
        <text>🔍</text>
      </view>
    </view>

    <!-- 分类筛选 -->
    <view class="category-bar">
      <view 
        class="category-chip" 
        :class="{active: selectedCategory === ''}"
        @tap="selectCategory('')"
      >
        全部
      </view>
      <view 
        v-for="cat in categories" 
        :key="cat.id"
        class="category-chip"
        :class="{active: selectedCategory === cat.id}"
        @tap="selectCategory(cat.id)"
      >
        {{ cat.emoji }} {{ cat.name }}
      </view>
    </view>

    <!-- 搜索结果模式 -->
    <view v-if="isSearchMode" class="search-results">
      <view class="results-header">
        <text class="results-count">找到 {{ store.searchResults.length }} 条结果</text>
        <text class="clear-search" @tap="clearSearch">清除</text>
      </view>
      
      <view 
        v-for="ref in store.searchResults" 
        :key="ref.id"
        class="ref-card"
        @tap="viewRefDetail(ref)"
      >
        <view class="ref-icon">
          <text>{{ getCategoryEmoji(ref.category) }}</text>
        </view>
        <view class="ref-content">
          <text class="ref-title">{{ ref.title }}</text>
          <text class="ref-preview">{{ ref.content.substring(0, 50) }}...</text>
          <view class="ref-tags">
            <text 
              v-for="kw in ref.keywords.slice(0, 3)" 
              :key="kw"
              class="keyword-tag"
            >{{ kw }}</text>
          </view>
        </view>
        <view class="favorite-btn" @tap.stop="toggleFavorite(ref.id)">
          <text>{{ isFavorite(ref.id) ? '❤️' : '🤍' }}</text>
        </view>
      </view>
    </view>

    <!-- 常规列表模式 -->
    <view v-else class="ref-list">
      <view 
        v-for="ref in store.quickRefList" 
        :key="ref.id"
        class="ref-card"
        @tap="viewRefDetail(ref)"
      >
        <view class="ref-icon">
          <text>{{ getCategoryEmoji(ref.category) }}</text>
        </view>
        <view class="ref-content">
          <text class="ref-title">{{ ref.title }}</text>
          <text class="ref-preview">{{ ref.content.substring(0, 60) }}...</text>
          <view class="ref-tags">
            <text 
              v-for="kw in ref.keywords.slice(0, 3)" 
              :key="kw"
              class="keyword-tag"
            >{{ kw }}</text>
          </view>
        </view>
        <view class="favorite-btn" @tap.stop="toggleFavorite(ref.id)">
          <text>{{ isFavorite(ref.id) ? '❤️' : '🤍' }}</text>
        </view>
      </view>
    </view>

    <!-- 加载状态 -->
    <view class="loading-state" v-if="store.loading">
      <text>加载中...</text>
    </view>

    <!-- 空状态 -->
    <view class="empty-state" v-if="!store.loading && !isSearchMode && store.quickRefList.length === 0">
      <text class="empty-icon">📚</text>
      <text class="empty-title">暂无知识条目</text>
      <text class="empty-subtitle">内容即将上线</text>
    </view>
    
    <!-- 搜索空状态 -->
    <view class="empty-state" v-if="!store.loading && isSearchMode && store.searchResults.length === 0">
      <text class="empty-icon">🔍</text>
      <text class="empty-title">没有找到相关结果</text>
      <text class="empty-subtitle">换个关键词试试</text>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useMicroLearningStore } from '@/stores/microLearningStore.js'

const store = useMicroLearningStore()

const searchKeyword = ref('')
const selectedCategory = ref('')
const isSearchMode = ref(false)
const searchTimer = ref(null)

const categories = [
  { id: 'science', name: '科学', emoji: '🔬' },
  { id: 'math', name: '数学', emoji: '🔢' },
  { id: 'language', name: '语文', emoji: '📝' },
  { id: 'nature', name: '自然', emoji: '🌿' }
]

function getCategoryEmoji(category) {
  const cat = categories.find(c => c.id === category)
  return cat ? cat.emoji : '📖'
}

function selectCategory(category) {
  selectedCategory.value = category
  isSearchMode.value = false
  store.loadQuickRef(category)
}

function onSearchInput() {
  // 防抖处理
  if (searchTimer.value) {
    clearTimeout(searchTimer.value)
  }
  if (!searchKeyword.value.trim()) {
    isSearchMode.value = false
    store.searchResults = []
    return
  }
  searchTimer.value = setTimeout(() => {
    doSearch()
  }, 300)
}

function doSearch() {
  if (!searchKeyword.value.trim()) {
    isSearchMode.value = false
    return
  }
  isSearchMode.value = true
  store.searchRef(searchKeyword.value)
}

function clearSearch() {
  searchKeyword.value = ''
  isSearchMode.value = false
  store.searchResults = []
}

function isFavorite(refId) {
  return store.checkIsFavorite(refId)
}

async function toggleFavorite(refId) {
  await store.toggleFavorite(refId)
}

function viewRefDetail(ref) {
  uni.showModal({
    title: ref.title,
    content: ref.content,
    confirmText: '我记住了',
    cancelText: '关闭',
    success: (res) => {
      if (res.confirm) {
        // 用户确认已阅读
        if (!isFavorite(ref.id)) {
          toggleFavorite(ref.id)
        }
      }
    }
  })
}

function goToFavorites() {
  // TODO: 跳转到收藏页面
  uni.showModal({
    title: '我的收藏',
    content: `共 ${store.favoriteRefsCount} 条收藏知识`,
    showCancel: false
  })
}

onMounted(async () => {
  await store.loadQuickRef()
  await store.loadFavorites()
})
</script>

<style scoped>
.quick-ref-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #fc4a1a 0%, #f7b733 100%);
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

.favorites-btn {
  background: rgba(255, 255, 255, 0.2);
  padding: 12rpx 24rpx;
  border-radius: 30rpx;
  color: #ffffff;
  font-size: 24rpx;
}

.search-bar {
  display: flex;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.search-input {
  flex: 1;
  background: #ffffff;
  border-radius: 30rpx;
  padding: 20rpx 30rpx;
  font-size: 28rpx;
}

.search-btn {
  width: 80rpx;
  height: 80rpx;
  background: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
}

.category-bar {
  display: flex;
  gap: 16rpx;
  margin-bottom: 30rpx;
  overflow-x: auto;
  padding: 10rpx 0;
}

.category-chip {
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
  padding: 12rpx 24rpx;
  border-radius: 30rpx;
  font-size: 26rpx;
  white-space: nowrap;
}

.category-chip.active {
  background: #ffffff;
  color: #fc4a1a;
}

.search-results, .ref-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.results-count {
  color: #ffffff;
  font-size: 26rpx;
}

.clear-search {
  color: rgba(255, 255, 255, 0.8);
  font-size: 26rpx;
  text-decoration: underline;
}

.ref-card {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 24rpx;
  display: flex;
  gap: 20rpx;
  position: relative;
}

.ref-icon {
  width: 80rpx;
  height: 80rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  flex-shrink: 0;
}

.ref-content {
  flex: 1;
  min-width: 0;
}

.ref-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.ref-preview {
  font-size: 24rpx;
  color: #666;
  display: block;
  margin-bottom: 12rpx;
}

.ref-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}

.keyword-tag {
  background: #f0f0f0;
  color: #666;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  font-size: 20rpx;
}

.favorite-btn {
  position: absolute;
  top: 20rpx;
  right: 20rpx;
  font-size: 32rpx;
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
