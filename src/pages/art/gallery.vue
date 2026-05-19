<template>
  <view class="gallery-page">
    <!-- 头部 -->
    <view class="header-card">
      <view class="header-info">
        <text class="header-icon">🖼️</text>
        <view class="header-text">
          <text class="header-title">作品展示</text>
          <text class="header-subtitle">欣赏和分享创意作品</text>
        </view>
      </view>
      <view class="stats-row">
        <view class="stat-item">
          <text class="stat-value">{{ galleryWorks.length }}</text>
          <text class="stat-label">作品总数</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ likedCount }}</text>
          <text class="stat-label">我的点赞</text>
        </view>
      </view>
    </view>

    <!-- 筛选栏 -->
    <view class="filter-section">
      <view class="filter-tabs">
        <view 
          class="filter-tab" 
          :class="{ active: currentFilter === 'all' }"
          @click="handleFilter('all')"
        >
          全部
        </view>
        <view 
          class="filter-tab" 
          :class="{ active: currentFilter === 'drawing' }"
          @click="handleFilter('drawing')"
        >
          🎨 绘画
        </view>
        <view 
          class="filter-tab" 
          :class="{ active: currentFilter === 'craft' }"
          @click="handleFilter('craft')"
        >
          ✂️ 手工
        </view>
      </view>
    </view>

    <!-- 作品网格 -->
    <view class="works-grid">
      <view 
        class="work-card" 
        v-for="work in filteredWorks" 
        :key="work.id"
        @click="handleSelectWork(work)"
      >
        <view class="work-image">
          <image v-if="work.imageData" :src="work.imageData" mode="aspectFill" />
          <view v-else class="work-placeholder">
            <text>{{ work.type === 'drawing' ? '🎨' : '✂️' }}</text>
          </view>
        </view>
        <view class="work-info">
          <text class="work-title">{{ work.title }}</text>
          <text class="work-author">by {{ work.author }}</text>
          <view class="work-meta">
            <view class="meta-item">
              <text>{{ work.likes }}</text>
              <text>❤️</text>
            </view>
            <view class="meta-item">
              <text>{{ work.comments }}</text>
              <text>💬</text>
            </view>
          </view>
        </view>
        <view class="work-actions">
          <view 
            class="action-btn" 
            :class="{ liked: work.isLiked }"
            @click.stop="handleLike(work.id)"
          >
            <text>{{ work.isLiked ? '❤️' : '🤍' }}</text>
          </view>
          <view class="action-btn" @click.stop="handleShare(work.id)">
            <text>📤</text>
          </view>
          <view class="action-btn" @click.stop="handleCollect(work.id)">
            <text>⭐</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view class="empty-tip" v-if="filteredWorks.length === 0">
      <text>暂无作品</text>
    </view>

    <!-- 作品详情弹窗 -->
    <view class="detail-modal" v-if="selectedWork" @click="closeDetail">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">{{ selectedWork.title }}</text>
          <text class="close-btn" @click="closeDetail">×</text>
        </view>

        <scroll-view scroll-y class="modal-body">
          <view class="detail-image">
            <image v-if="selectedWork.imageData" :src="selectedWork.imageData" mode="aspectFit" />
            <view v-else class="image-placeholder">
              <text>{{ selectedWork.type === 'drawing' ? '🎨' : '✂️' }}</text>
            </view>
          </view>

          <view class="detail-info">
            <view class="author-row">
              <text class="author-label">作者：</text>
              <text class="author-name">{{ selectedWork.author }}</text>
            </view>
            <view class="date-row">
              <text class="date-label">创作时间：</text>
              <text class="date-value">{{ formatDate(selectedWork.createdAt) }}</text>
            </view>
          </view>

          <view class="detail-actions">
            <view 
              class="detail-action-btn" 
              :class="{ active: selectedWork.isLiked }"
              @click="handleLike(selectedWork.id)"
            >
              <text>{{ selectedWork.isLiked ? '❤️' : '🤍' }}</text>
              <text>{{ selectedWork.likes }} 点赞</text>
            </view>
            <view class="detail-action-btn" @click="handleShare(selectedWork.id)">
              <text>📤</text>
              <text>分享</text>
            </view>
            <view class="detail-action-btn" @click="handleCollect(selectedWork.id)">
              <text>⭐</text>
              <text>收藏</text>
            </view>
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useArtStore } from '@/stores/artStore.js'

const artStore = useArtStore()

const currentFilter = ref('all')
const selectedWork = ref(null)

const galleryWorks = computed(() => artStore.galleryWorks)

const filteredWorks = computed(() => {
  if (currentFilter.value === 'all') {
    return galleryWorks.value
  }
  return galleryWorks.value.filter(w => w.type === currentFilter.value)
})

const likedCount = computed(() => {
  return galleryWorks.value.filter(w => w.isLiked).length
})

const handleFilter = (filter) => {
  currentFilter.value = filter
}

const handleSelectWork = (work) => {
  selectedWork.value = work
}

const closeDetail = () => {
  selectedWork.value = null
}

const handleLike = (workId) => {
  artStore.likeGalleryWork(workId)
  // Update selected work if open
  if (selectedWork.value && selectedWork.value.id === workId) {
    selectedWork.value = galleryWorks.value.find(w => w.id === workId)
  }
}

const handleShare = (workId) => {
  uni.showToast({ title: '分享成功', icon: 'success' })
  artStore.shareGalleryWork(workId)
}

const handleCollect = (workId) => {
  uni.showToast({ title: '已收藏', icon: 'success' })
  artStore.collectGalleryWork(workId)
}

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

onMounted(() => {
  artStore.loadGalleryWorks()
})
</script>

<style scoped>
.gallery-page {
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

.filter-section {
  background: #fff;
  border-radius: 16rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
}

.filter-tabs {
  display: flex;
  gap: 20rpx;
}

.filter-tab {
  padding: 12rpx 32rpx;
  border-radius: 30rpx;
  background: #f0f0f0;
  font-size: 26rpx;
  color: #666;
}

.filter-tab.active {
  background: #8477fa;
  color: #fff;
}

.works-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.work-card {
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
}

.work-image {
  height: 200rpx;
  background: #f0f0f0;
}

.work-image image {
  width: 100%;
  height: 100%;
}

.work-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 60rpx;
}

.work-info {
  padding: 16rpx;
}

.work-title {
  font-size: 26rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 4rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.work-author {
  font-size: 22rpx;
  color: #999;
  display: block;
  margin-bottom: 8rpx;
}

.work-meta {
  display: flex;
  gap: 16rpx;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4rpx;
  font-size: 22rpx;
  color: #999;
}

.work-actions {
  display: flex;
  justify-content: space-around;
  padding: 12rpx 16rpx;
  border-top: 1px solid #f0f0f0;
}

.action-btn {
  font-size: 28rpx;
}

.action-btn.liked {
  color: #e74c3c;
}

.empty-tip {
  text-align: center;
  padding: 60rpx;
  color: #999;
  font-size: 28rpx;
}

.detail-modal {
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
  max-height: 80vh;
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
  max-height: 60vh;
}

.detail-image {
  height: 400rpx;
  background: #f0f0f0;
  border-radius: 16rpx;
  overflow: hidden;
  margin-bottom: 20rpx;
}

.detail-image image {
  width: 100%;
  height: 100%;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 100rpx;
}

.detail-info {
  margin-bottom: 20rpx;
}

.author-row, .date-row {
  display: flex;
  margin-bottom: 8rpx;
}

.author-label, .date-label {
  font-size: 26rpx;
  color: #999;
}

.author-name, .date-value {
  font-size: 26rpx;
  color: #333;
}

.detail-actions {
  display: flex;
  gap: 20rpx;
}

.detail-action-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  padding: 20rpx;
  background: #f0f0f0;
  border-radius: 12rpx;
  font-size: 24rpx;
  color: #666;
}

.detail-action-btn.active {
  background: #ffe0e0;
  color: #e74c3c;
}
</style>
