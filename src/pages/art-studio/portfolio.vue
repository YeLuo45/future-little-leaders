<template>
  <view class="portfolio-page">
    <!-- 页面标题 -->
    <view class="page-header">
      <text class="page-title">🎨 我的作品集</text>
      <view class="header-stats">
        <view class="stat-item">
          <text class="stat-value">{{ store.artPoints.totalPoints }}</text>
          <text class="stat-label">艺术积分</text>
        </view>
      </view>
    </view>

    <!-- 积分进度卡片 -->
    <view class="points-card">
      <view class="points-header">
        <view class="level-badge">
          <text class="level-icon">🎭</text>
          <text class="level-text">Lvl.{{ store.artPoints.level }}</text>
        </view>
        <view class="points-info">
          <text class="points-label">艺术等级</text>
          <text class="points-next">再获得 {{ store.pointsToNextLevel }} 积分升级</text>
        </view>
      </view>
      <view class="points-progress">
        <view class="progress-bar">
          <view
            class="progress-fill"
            :style="{ width: (100 - store.pointsToNextLevel / 100 * 100) + '%' }"
          ></view>
        </view>
      </view>
    </view>

    <!-- 统计概览 -->
    <view class="stats-overview">
      <view class="stat-card">
        <text class="stat-icon">📊</text>
        <text class="stat-number">{{ store.totalWorks }}</text>
        <text class="stat-name">作品总数</text>
      </view>
      <view class="stat-card">
        <text class="stat-icon">⏱️</text>
        <text class="stat-number">{{ store.artPoints.totalHours }}</text>
        <text class="stat-name">创作时长</text>
      </view>
      <view class="stat-card">
        <text class="stat-icon">🔥</text>
        <text class="stat-number">{{ store.artPoints.streak?.current || 0 }}</text>
        <text class="stat-name">连续创作</text>
      </view>
      <view class="stat-card">
        <text class="stat-icon">🏆</text>
        <text class="stat-number">{{ store.unlockedAchievements.length }}</text>
        <text class="stat-name">已获成就</text>
      </view>
    </view>

    <!-- Tab 切换 -->
    <view class="tab-header">
      <view
        class="tab-item"
        :class="{ active: currentTab === 'works' }"
        @click="currentTab = 'works'"
      >
        <text>全部作品</text>
      </view>
      <view
        class="tab-item"
        :class="{ active: currentTab === 'timeline' }"
        @click="currentTab = 'timeline'"
      >
        <text>成长时间线</text>
      </view>
      <view
        class="tab-item"
        :class="{ active: currentTab === 'achievements' }"
        @click="currentTab = 'achievements'"
      >
        <text>成就</text>
      </view>
    </view>

    <!-- 全部作品 -->
    <view v-if="currentTab === 'works'" class="tab-content">
      <!-- 筛选器 -->
      <view class="filter-bar">
        <view
          class="filter-item"
          :class="{ active: filterType === 'all' }"
          @click="filterType = 'all'"
        >
          全部
        </view>
        <view
          v-for="type in store.artTypes"
          :key="type.id"
          class="filter-item"
          :class="{ active: filterType === type.id }"
          @click="filterType = type.id"
        >
          {{ type.icon }} {{ type.name }}
        </view>
      </view>

      <!-- 作品列表 -->
      <view v-if="filteredWorks.length > 0" class="works-grid">
        <view
          v-for="work in filteredWorks"
          :key="work.id"
          class="work-card"
          @click="showWorkDetail(work)"
        >
          <view class="work-thumbnail" :style="{ backgroundColor: getArtTypeColor(work.type) }">
            <text class="work-icon">{{ getArtTypeIcon(work.type) }}</text>
            <view v-if="work.isFavorite" class="favorite-badge">❤️</view>
          </view>
          <view class="work-info">
            <text class="work-title">{{ work.title }}</text>
            <text class="work-date">{{ formatDate(work.createdAt) }}</text>
            <view class="work-meta">
              <text class="work-points">+{{ work.points }}</text>
              <text class="work-shares">分享 {{ work.shareCount }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-else class="empty-state">
        <text class="empty-icon">🎨</text>
        <text class="empty-text">还没有作品</text>
        <text class="empty-hint">开始你的第一次艺术创作吧！</text>
      </view>
    </view>

    <!-- 成长时间线 -->
    <view v-if="currentTab === 'timeline'" class="tab-content">
      <view v-if="store.timeline.length > 0" class="timeline">
        <view
          v-for="(item, index) in store.timeline"
          :key="item.id"
          class="timeline-item"
          :class="item.type"
        >
          <view class="timeline-marker">
            <view class="marker-dot"></view>
            <view v-if="index < store.timeline.length - 1" class="marker-line"></view>
          </view>
          <view class="timeline-content">
            <view class="timeline-header">
              <text class="timeline-type">{{ item.type === 'work' ? '作品' : '挑战' }}</text>
              <text class="timeline-date">{{ formatDate(item.date) }}</text>
            </view>
            <text class="timeline-title">{{ item.title }}</text>
            <view class="timeline-meta">
              <text class="timeline-art-type">{{ getArtTypeIcon(item.artType) }} {{ getArtTypeName(item.artType) }}</text>
              <text class="timeline-points">+{{ item.points }}积分</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-else class="empty-state">
        <text class="empty-icon">📅</text>
        <text class="empty-text">暂无记录</text>
        <text class="empty-hint">开始创作后，这里会记录你的艺术成长轨迹</text>
      </view>
    </view>

    <!-- 成就 -->
    <view v-if="currentTab === 'achievements'" class="tab-content">
      <view class="achievements-grid">
        <view
          v-for="achievement in store.achievements"
          :key="achievement.id"
          class="achievement-card"
          :class="{ unlocked: achievement.isUnlocked, locked: !achievement.isUnlocked }"
        >
          <text class="achievement-icon">{{ achievement.icon }}</text>
          <text class="achievement-name">{{ achievement.name }}</text>
          <text class="achievement-desc">{{ achievement.description }}</text>
          <text v-if="achievement.isUnlocked" class="achievement-date">
            {{ formatDate(achievement.unlockedAt) }}
          </text>
          <text v-else class="achievement-lock">🔒</text>
        </view>
      </view>
    </view>

    <!-- 作品详情弹窗 -->
    <view v-if="selectedWork" class="modal-overlay" @click="selectedWork = null">
      <view class="work-detail-modal" @click.stop>
        <view class="modal-header">
          <text class="modal-title">{{ selectedWork.title }}</text>
          <text class="modal-close" @click="selectedWork = null">✕</text>
        </view>

        <view class="modal-body">
          <!-- 作品缩略图 -->
          <view class="detail-thumbnail" :style="{ backgroundColor: getArtTypeColor(selectedWork.type) }">
            <text class="detail-icon">{{ getArtTypeIcon(selectedWork.type) }}</text>
          </view>

          <!-- 作品信息 -->
          <view class="detail-info">
            <view class="info-row">
              <text class="info-label">创作类型：</text>
              <text class="info-value">{{ getArtTypeIcon(selectedWork.type) }} {{ getArtTypeName(selectedWork.type) }}</text>
            </view>
            <view class="info-row">
              <text class="info-label">创作时长：</text>
              <text class="info-value">{{ selectedWork.duration }} 分钟</text>
            </view>
            <view class="info-row">
              <text class="info-label">获得积分：</text>
              <text class="info-value points">+{{ selectedWork.points }}</text>
            </view>
            <view v-if="selectedWork.tags && selectedWork.tags.length > 0" class="info-row">
              <text class="info-label">标签：</text>
              <view class="tag-list">
                <text v-for="tag in selectedWork.tags" :key="tag" class="tag">{{ tag }}</text>
              </view>
            </view>
            <view v-if="selectedWork.description" class="info-row">
              <text class="info-label">描述：</text>
              <text class="info-value">{{ selectedWork.description }}</text>
            </view>
          </view>

          <!-- AI 反馈 -->
          <view v-if="selectedWork.feedback" class="ai-feedback">
            <text class="feedback-header">💡 AI 评价</text>
            <text class="feedback-content">{{ selectedWork.feedback }}</text>
          </view>

          <!-- 操作按钮 -->
          <view class="detail-actions">
            <button
              class="action-btn"
              :class="{ active: selectedWork.isFavorite }"
              @click="toggleFavorite(selectedWork)"
            >
              {{ selectedWork.isFavorite ? '❤️ 收藏' : '🤍 收藏' }}
            </button>
            <button class="action-btn share" @click="shareWork(selectedWork)">
              📤 分享
            </button>
            <button class="action-btn delete" @click="deleteWork(selectedWork)">
              🗑️ 删除
            </button>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useArtStudioStore } from '@/stores/artStudioStore.js'

const store = useArtStudioStore()

// Tab 状态
const currentTab = ref('works')
const filterType = ref('all')
const selectedWork = ref(null)

// 筛选后的作品
const filteredWorks = computed(() => {
  if (filterType.value === 'all') {
    return store.artWorks
  }
  return store.artWorks.filter(w => w.type === filterType.value)
})

// 获取艺术类型颜色
const getArtTypeColor = (type) => {
  const artType = store.artTypes.find(t => t.id === type)
  return artType?.color || '#FF6B6B'
}

// 获取艺术类型图标
const getArtTypeIcon = (type) => {
  const artType = store.artTypes.find(t => t.id === type)
  return artType?.icon || '🎨'
}

// 获取艺术类型名称
const getArtTypeName = (type) => {
  const artType = store.artTypes.find(t => t.id === type)
  return artType?.name || '绘画'
}

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

// 显示作品详情
const showWorkDetail = (work) => {
  selectedWork.value = work
}

// 切换收藏
const toggleFavorite = (work) => {
  store.toggleFavorite(work.id)
  // 更新本地状态
  if (selectedWork.value) {
    selectedWork.value.isFavorite = !selectedWork.value.isFavorite
  }
}

// 分享作品
const shareWork = (work) => {
  store.shareArtWork(work.id)
  uni.showToast({ title: '分享成功！', icon: 'success' })
  // 更新本地状态
  if (selectedWork.value) {
    selectedWork.value.shareCount++
  }
}

// 删除作品
const deleteWork = (work) => {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这个作品吗？',
    success: (res) => {
      if (res.confirm) {
        store.deleteArtWork(work.id)
        selectedWork.value = null
        uni.showToast({ title: '删除成功', icon: 'success' })
      }
    }
  })
}

// 初始化
onMounted(() => {
  store.init()
})
</script>

<style scoped>
.portfolio-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 40rpx;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx 32rpx 24rpx;
  background-color: #fff;
}

.page-title {
  font-size: 40rpx;
  font-weight: 600;
  color: #333;
}

.header-stats {
  display: flex;
  gap: 24rpx;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 32rpx;
  font-weight: 700;
  color: #FF6B6B;
}

.stat-label {
  font-size: 20rpx;
  color: #999;
}

/* 积分卡片 */
.points-card {
  margin: 0 32rpx 24rpx;
  padding: 24rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20rpx;
  color: #fff;
}

.points-header {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.level-badge {
  display: flex;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.2);
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
  margin-right: 20rpx;
}

.level-icon {
  font-size: 32rpx;
  margin-right: 8rpx;
}

.level-text {
  font-size: 28rpx;
  font-weight: 600;
}

.points-info {
  flex: 1;
}

.points-label {
  font-size: 24rpx;
  opacity: 0.8;
}

.points-next {
  font-size: 22rpx;
  opacity: 0.7;
}

.points-progress {
  width: 100%;
}

.progress-bar {
  width: 100%;
  height: 12rpx;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 6rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #FFD700;
  border-radius: 6rpx;
  transition: width 0.3s;
}

/* 统计概览 */
.stats-overview {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16rpx;
  margin: 0 32rpx 24rpx;
}

.stat-card {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 20rpx 12rpx;
  text-align: center;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.stat-icon {
  font-size: 32rpx;
  display: block;
  margin-bottom: 8rpx;
}

.stat-number {
  font-size: 32rpx;
  font-weight: 700;
  color: #333;
  display: block;
}

.stat-name {
  font-size: 20rpx;
  color: #999;
}

/* Tab 切换 */
.tab-header {
  display: flex;
  background-color: #fff;
  padding: 0 32rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 24rpx 0;
  font-size: 28rpx;
  color: #666;
  position: relative;
}

.tab-item.active {
  color: #FF6B6B;
  font-weight: 600;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60rpx;
  height: 4rpx;
  background-color: #FF6B6B;
  border-radius: 2rpx;
}

.tab-content {
  padding: 24rpx 32rpx;
}

/* 筛选栏 */
.filter-bar {
  display: flex;
  gap: 12rpx;
  margin-bottom: 24rpx;
  flex-wrap: wrap;
}

.filter-item {
  padding: 12rpx 20rpx;
  background-color: #fff;
  border-radius: 24rpx;
  font-size: 24rpx;
  color: #666;
  border: 2rpx solid transparent;
}

.filter-item.active {
  background-color: #FFE4E1;
  color: #FF6B6B;
  border-color: #FF6B6B;
}

/* 作品网格 */
.works-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.work-card {
  background-color: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.work-thumbnail {
  height: 180rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.work-icon {
  font-size: 64rpx;
}

.favorite-badge {
  position: absolute;
  top: 12rpx;
  right: 12rpx;
  font-size: 28rpx;
}

.work-info {
  padding: 16rpx;
}

.work-title {
  font-size: 26rpx;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 4rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.work-date {
  font-size: 20rpx;
  color: #999;
  display: block;
  margin-bottom: 8rpx;
}

.work-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.work-points {
  font-size: 22rpx;
  color: #FF6B6B;
  font-weight: 600;
}

.work-shares {
  font-size: 20rpx;
  color: #999;
}

/* 时间线 */
.timeline {
  position: relative;
}

.timeline-item {
  display: flex;
  margin-bottom: 24rpx;
}

.timeline-marker {
  width: 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.marker-dot {
  width: 16rpx;
  height: 16rpx;
  background-color: #FF6B6B;
  border-radius: 50%;
  margin-top: 8rpx;
}

.marker-line {
  width: 4rpx;
  flex: 1;
  background-color: #E0E0E0;
  margin-top: 8rpx;
}

.timeline-content {
  flex: 1;
  background-color: #fff;
  border-radius: 12rpx;
  padding: 16rpx;
  margin-left: 16rpx;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8rpx;
}

.timeline-type {
  font-size: 20rpx;
  color: #fff;
  background-color: #FF6B6B;
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
}

.timeline-item.challenge .timeline-type {
  background-color: #9B59B6;
}

.timeline-date {
  font-size: 22rpx;
  color: #999;
}

.timeline-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.timeline-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.timeline-art-type {
  font-size: 22rpx;
  color: #666;
}

.timeline-points {
  font-size: 22rpx;
  color: #FF6B6B;
  font-weight: 600;
}

/* 成就网格 */
.achievements-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.achievement-card {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  text-align: center;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.achievement-card.locked {
  background-color: #f5f5f5;
  opacity: 0.7;
}

.achievement-icon {
  font-size: 48rpx;
  display: block;
  margin-bottom: 12rpx;
}

.achievement-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 4rpx;
}

.achievement-desc {
  font-size: 22rpx;
  color: #666;
  display: block;
  margin-bottom: 8rpx;
}

.achievement-date {
  font-size: 20rpx;
  color: #999;
}

.achievement-lock {
  font-size: 24rpx;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 80rpx 40rpx;
}

.empty-icon {
  font-size: 80rpx;
  display: block;
  margin-bottom: 16rpx;
}

.empty-text {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.empty-hint {
  font-size: 24rpx;
  color: #999;
}

/* 作品详情弹窗 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.work-detail-modal {
  width: 90%;
  max-height: 85vh;
  background-color: #fff;
  border-radius: 24rpx;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.modal-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.modal-close {
  font-size: 40rpx;
  color: #999;
  padding: 8rpx;
}

.modal-body {
  padding: 24rpx 32rpx;
  max-height: 60vh;
  overflow-y: auto;
}

.detail-thumbnail {
  height: 200rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24rpx;
}

.detail-icon {
  font-size: 80rpx;
}

.detail-info {
  margin-bottom: 24rpx;
}

.info-row {
  display: flex;
  margin-bottom: 12rpx;
  flex-wrap: wrap;
}

.info-label {
  font-size: 26rpx;
  color: #666;
  min-width: 120rpx;
}

.info-value {
  font-size: 26rpx;
  color: #333;
  flex: 1;
}

.info-value.points {
  color: #FF6B6B;
  font-weight: 600;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
}

.tag {
  font-size: 22rpx;
  color: #666;
  background-color: #f0f0f0;
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
}

.ai-feedback {
  background-color: #FFF9E6;
  border-radius: 12rpx;
  padding: 16rpx;
  margin-bottom: 24rpx;
  border-left: 4rpx solid #FFD700;
}

.feedback-header {
  font-size: 26rpx;
  font-weight: 600;
  color: #B8860B;
  display: block;
  margin-bottom: 8rpx;
}

.feedback-content {
  font-size: 24rpx;
  color: #8B7355;
  line-height: 1.5;
}

.detail-actions {
  display: flex;
  gap: 16rpx;
}

.action-btn {
  flex: 1;
  padding: 20rpx;
  border-radius: 12rpx;
  font-size: 26rpx;
  border: none;
  background-color: #f0f0f0;
  color: #666;
}

.action-btn.active {
  background-color: #FFE4E1;
  color: #FF6B6B;
}

.action-btn.share {
  background-color: #E3F2FD;
  color: #2196F3;
}

.action-btn.delete {
  background-color: #FFEBEE;
  color: #F44336;
}
</style>
