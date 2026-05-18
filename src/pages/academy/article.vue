<!-- 知识库文章页 -->
<template>
  <view class="article-page">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <view class="nav-left" @tap="goBack">
        <text class="icon">←</text>
      </view>
      <text class="nav-title">知识库</text>
      <view class="nav-right"></view>
    </view>

    <!-- 分类筛选 -->
    <view class="filter-bar">
      <scroll-view scroll-x class="filter-scroll">
        <view class="filter-group">
          <text
            class="filter-chip"
            :class="{ active: store.selectedCategory === '全部' }"
            @tap="setFilter('全部')"
          >全部</text>
          <text
            v-for="cat in categories"
            :key="cat"
            class="filter-chip"
            :class="{ active: store.selectedCategory === cat }"
            @tap="setFilter(cat)"
          >{{ cat }}</text>
        </view>
      </scroll-view>
    </view>

    <!-- 文章列表 -->
    <view class="article-list" v-if="!store.isLoadingArticles">
      <ArticleCard
        v-for="(article, index) in store.filteredArticles"
        :key="article.id"
        :article="article"
        :style="{ animationDelay: `${index * 80}ms` }"
        @click="viewArticle(article)"
      />
    </view>

    <!-- 加载状态 -->
    <view class="loading-state" v-else>
      <view class="loading-spinner"></view>
      <text class="loading-text">加载中...</text>
    </view>

    <!-- 空状态 -->
    <view class="empty-state" v-if="!store.isLoadingArticles && store.filteredArticles.length === 0">
      <text class="empty-icon">📭</text>
      <text class="empty-text">暂无相关文章</text>
    </view>

    <!-- 文章详情弹窗 -->
    <view class="article-detail-modal" v-if="currentArticle" @tap="closeDetail">
      <view class="detail-content" @tap.stop>
        <!-- 关闭按钮 -->
        <view class="detail-close" @tap="closeDetail">
          <text>✕</text>
        </view>

        <!-- 文章头部 -->
        <view class="detail-header">
          <view class="detail-tags">
            <text class="detail-tag category">{{ currentArticle.category }}</text>
            <text class="detail-tag dimension">{{ currentArticle.dimension }}</text>
          </view>
          <text class="detail-title">{{ currentArticle.title }}</text>
          <view class="detail-meta">
            <text class="detail-date">{{ currentArticle.date }}</text>
            <text class="detail-readtime">约{{ currentArticle.readTime }}分钟</text>
          </view>
        </view>

        <!-- 文章正文 -->
        <scroll-view scroll-y class="detail-body">
          <text class="detail-text">{{ currentArticle.content }}</text>

          <!-- 相关视频 -->
          <view class="related-videos" v-if="currentArticle.relatedVideos?.length">
            <text class="related-title">相关视频课程</text>
            <view class="related-list">
              <view
                v-for="videoId in currentArticle.relatedVideos"
                :key="videoId"
                class="related-item"
                @tap="goToCourse(videoId)"
              >
                <text class="related-icon">🎬</text>
                <text class="related-name">{{ getCourseName(videoId) }}</text>
                <text class="related-arrow">›</text>
              </view>
            </view>
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAcademyStore } from '@/stores/academyStore.js'
import ArticleCard from '@/components/academy/ArticleCard.vue'

const store = useAcademyStore()
const currentArticle = ref(null)

const categories = ['0-3岁', '3-6岁', '6-12岁']

onMounted(async () => {
  if (store.articles.length === 0) {
    await store.loadArticles()
  }
})

function setFilter(category) {
  store.setArticleFilter(category, '全部')
}

function goBack() {
  uni.navigateBack()
}

async function viewArticle(article) {
  currentArticle.value = article
  await store.markArticleRead(article.id)
}

function closeDetail() {
  currentArticle.value = null
}

function goToCourse(courseId) {
  closeDetail()
  uni.navigateTo({ url: `/pages/academy/course?id=${courseId}` })
}

function getCourseName(courseId) {
  const course = store.courses.find(c => c.id === courseId)
  return course?.title || '课程'
}
</script>

<style scoped>
.article-page {
  min-height: 100vh;
  background: #F8FAFC;
  padding-bottom: 40rpx;
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  padding: 0 32rpx;
  background: #FFFFFF;
  border-bottom: 1rpx solid #E5E7EB;
}

.nav-left, .nav-right {
  width: 80rpx;
}

.icon {
  font-size: 40rpx;
  color: #1F2937;
}

.nav-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #1F2937;
}

.filter-bar {
  padding: 20rpx 0;
  background: #FFFFFF;
  border-bottom: 1rpx solid #F3F4F6;
}

.filter-scroll {
  padding: 0 32rpx;
  white-space: nowrap;
}

.filter-group {
  display: inline-flex;
  gap: 16rpx;
}

.filter-chip {
  display: inline-block;
  padding: 12rpx 28rpx;
  border-radius: 32rpx;
  font-size: 26rpx;
  color: #6B7280;
  background: #F3F4F6;
  white-space: nowrap;
}

.filter-chip.active {
  background: #2563EB;
  color: #FFFFFF;
  font-weight: 500;
}

.article-list {
  padding: 24rpx 32rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 0;
}

.loading-spinner {
  width: 64rpx;
  height: 64rpx;
  border: 4rpx solid #E5E7EB;
  border-top-color: #2563EB;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  margin-top: 20rpx;
  font-size: 28rpx;
  color: #6B7280;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 0;
}

.empty-icon {
  font-size: 96rpx;
  margin-bottom: 24rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #6B7280;
}

/* 文章详情弹窗 */
.article-detail-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: flex;
  align-items: flex-end;
}

.detail-content {
  width: 100%;
  max-height: 90vh;
  background: #FFFFFF;
  border-radius: 32rpx 32rpx 0 0;
  padding: 32rpx;
  position: relative;
}

.detail-close {
  position: absolute;
  top: 32rpx;
  right: 32rpx;
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background: #F3F4F6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  color: #6B7280;
  z-index: 10;
}

.detail-header {
  margin-bottom: 32rpx;
}

.detail-tags {
  display: flex;
  gap: 12rpx;
  margin-bottom: 16rpx;
}

.detail-tag {
  display: inline-block;
  padding: 6rpx 16rpx;
  border-radius: 8rpx;
  font-size: 22rpx;
  font-weight: 500;
}

.detail-tag.category {
  background: #DBEAFE;
  color: #2563EB;
}

.detail-tag.dimension {
  background: #FEF3C7;
  color: #D97706;
}

.detail-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #1F2937;
  line-height: 1.4;
  display: block;
  margin-bottom: 16rpx;
}

.detail-meta {
  display: flex;
  gap: 24rpx;
}

.detail-date, .detail-readtime {
  font-size: 24rpx;
  color: #9CA3AF;
}

.detail-body {
  max-height: 60vh;
}

.detail-text {
  font-size: 30rpx;
  color: #4B5563;
  line-height: 1.8;
  display: block;
}

.related-videos {
  margin-top: 40rpx;
  padding-top: 32rpx;
  border-top: 1rpx solid #E5E7EB;
}

.related-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #1F2937;
  display: block;
  margin-bottom: 20rpx;
}

.related-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.related-item {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background: #F8FAFC;
  border-radius: 16rpx;
}

.related-icon {
  font-size: 32rpx;
  margin-right: 16rpx;
}

.related-name {
  flex: 1;
  font-size: 26rpx;
  color: #4B5563;
}

.related-arrow {
  font-size: 32rpx;
  color: #9CA3AF;
}
</style>
