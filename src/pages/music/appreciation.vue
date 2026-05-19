<template>
  <view class="appreciation-page">
    <!-- 页面标题 -->
    <view class="page-header">
      <text class="page-title">🎵 音乐欣赏</text>
      <view class="header-actions">
        <view class="search-btn" @click="showSearch = !showSearch">
          <text>🔍</text>
        </view>
      </view>
    </view>

    <!-- 搜索栏 -->
    <view v-if="showSearch" class="search-bar">
      <input
        class="search-input"
        v-model="searchKeyword"
        placeholder="搜索音乐、作曲家..."
        @confirm="handleSearch"
      />
      <button class="search-clear" @click="clearSearch">清空</button>
    </view>

    <!-- 音乐分类导航 -->
    <scroll-view class="category-nav" scroll-x>
      <view
        class="category-tab"
        :class="{ active: selectedCategory === '' }"
        @click="selectCategory('')"
      >
        <text>全部</text>
      </view>
      <view
        v-for="cat in store.MUSIC_CATEGORIES"
        :key="cat.id"
        class="category-tab"
        :class="{ active: selectedCategory === cat.id }"
        @click="selectCategory(cat.id)"
      >
        <text class="cat-icon">{{ cat.icon }}</text>
        <text class="cat-name">{{ cat.name }}</text>
      </view>
    </scroll-view>

    <!-- 播放控制栏 -->
    <view v-if="store.currentMusic" class="player-bar">
      <view class="player-info" @click="goToPlayer">
        <image class="player-cover" :src="store.currentMusic.cover" mode="aspectFill" />
        <view class="player-text">
          <text class="player-title">{{ store.currentMusic.title }}</text>
          <text class="player-composer">{{ store.currentMusic.composer }}</text>
        </view>
      </view>
      <view class="player-controls">
        <text class="control-btn" @click="togglePlay">
          {{ store.isPlaying ? '⏸️' : '▶️' }}
        </text>
        <text class="control-btn" @click="stopMusic">⏹️</text>
      </view>
      <view class="player-progress">
        <view class="progress-bar" :style="{ width: store.playProgress + '%' }"></view>
      </view>
    </view>

    <!-- 推荐音乐 -->
    <view v-if="!selectedCategory && store.recommendedMusic.length > 0" class="section">
      <view class="section-header">
        <text class="section-title">🌟 为你推荐</text>
        <text class="section-more" @click="showAllRecommend = true">更多</text>
      </view>
      <scroll-view class="music-scroll" scroll-x>
        <view
          v-for="music in store.recommendedMusic"
          :key="music.id"
          class="music-card"
          @click="playMusic(music)"
        >
          <image class="music-cover" :src="music.cover" mode="aspectFill" />
          <view class="music-overlay">
            <text class="play-icon">▶️</text>
          </view>
          <text class="music-title">{{ music.title }}</text>
          <text class="music-composer">{{ music.composer }}</text>
        </view>
      </scroll-view>
    </view>

    <!-- 分类音乐列表 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">{{ getCategoryTitle() }}</text>
        <text class="section-count">{{ displayedMusic.length }} 首</text>
      </view>
      <view class="music-list">
        <view
          v-for="music in displayedMusic"
          :key="music.id"
          class="music-item"
          :class="{ playing: store.currentMusic?.id === music.id }"
          @click="playMusic(music)"
        >
          <view class="music-item-left">
            <image class="item-cover" :src="music.cover" mode="aspectFill" />
            <view v-if="store.currentMusic?.id === music.id && store.isPlaying" class="playing-indicator">
              <text class="wave">🎵</text>
            </view>
          </view>
          <view class="music-item-info">
            <text class="item-title">{{ music.title }}</text>
            <text class="item-composer">{{ music.composer }}</text>
            <view class="item-tags">
              <text class="tag" v-for="tag in music.tags.slice(0, 2)" :key="tag">{{ tag }}</text>
            </view>
          </view>
          <view class="music-item-right">
            <text class="duration">{{ formatDuration(music.duration) }}</text>
            <text class="difficulty" :style="{ color: getDifficultyColor(music.difficulty) }">
              {{ getDifficultyText(music.difficulty) }}
            </text>
          </view>
        </view>
      </view>
    </view>

    <!-- 音乐知识卡片 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">📚 音乐小知识</text>
      </view>
      <view class="knowledge-list">
        <view
          v-for="knowledge in store.musicKnowledge"
          :key="knowledge.id"
          class="knowledge-card"
          @click="showKnowledge(knowledge)"
        >
          <text class="knowledge-icon">{{ knowledge.icon }}</text>
          <view class="knowledge-content">
            <text class="knowledge-title">{{ knowledge.title }}</text>
            <text class="knowledge-preview">{{ knowledge.content.substring(0, 50) }}...</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 音乐详情弹窗 -->
    <view v-if="showMusicDetail" class="modal-overlay" @click="showMusicDetail = false">
      <view class="modal-content music-detail-modal" @click.stop>
        <view class="modal-header">
          <text class="modal-title">音乐详情</text>
          <text class="modal-close" @click="showMusicDetail = false">✕</text>
        </view>
        <view v-if="selectedMusic" class="detail-body">
          <image class="detail-cover" :src="selectedMusic.cover" mode="aspectFill" />
          <view class="detail-info">
            <text class="detail-title">{{ selectedMusic.title }}</text>
            <text class="detail-composer">作曲：{{ selectedMusic.composer }}</text>
            <view class="detail-tags">
              <text class="detail-tag" v-for="tag in selectedMusic.tags" :key="tag">{{ tag }}</text>
            </view>
            <text class="detail-desc">{{ selectedMusic.description }}</text>
            <view class="detail-meta">
              <text class="meta-item">时长：{{ formatDuration(selectedMusic.duration) }}</text>
              <text class="meta-item">难度：{{ getDifficultyText(selectedMusic.difficulty) }}</text>
              <text class="meta-item">适合：{{ selectedMusic.suitableAge }}</text>
            </view>
          </view>
          <button class="btn-play-music" @click="playMusic(selectedMusic)">
            ▶️ 播放音乐
          </button>
        </view>
      </view>
    </view>

    <!-- 知识详情弹窗 -->
    <view v-if="showKnowledgeDetail" class="modal-overlay" @click="showKnowledgeDetail = false">
      <view class="modal-content knowledge-modal" @click.stop>
        <view class="modal-header">
          <text class="modal-title">{{ selectedKnowledge?.title }}</text>
          <text class="modal-close" @click="showKnowledgeDetail = false">✕</text>
        </view>
        <view class="knowledge-body">
          <text class="knowledge-full-content">{{ selectedKnowledge?.content }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useMusicStore } from '@/stores/musicStore.js'

const store = useMusicStore()

// 状态
const showSearch = ref(false)
const searchKeyword = ref('')
const selectedCategory = ref('')
const showMusicDetail = ref(false)
const showKnowledgeDetail = ref(false)
const selectedMusic = ref(null)
const selectedKnowledge = ref(null)

// 显示的音乐列表
const displayedMusic = computed(() => {
  let list = selectedCategory.value
    ? store.musicLibrary.filter(m => m.category === selectedCategory.value)
    : store.filteredMusic
  
  if (searchKeyword.value) {
    const kw = searchKeyword.value.toLowerCase()
    list = list.filter(m =>
      m.title.toLowerCase().includes(kw) ||
      m.composer.toLowerCase().includes(kw) ||
      m.description.toLowerCase().includes(kw)
    )
  }
  
  return list
})

// 获取分类标题
const getCategoryTitle = () => {
  if (selectedCategory.value) {
    const cat = Object.values(store.MUSIC_CATEGORIES).find(c => c.id === selectedCategory.value)
    return cat ? `${cat.icon} ${cat.name}` : '全部音乐'
  }
  return '🎵 全部音乐'
}

// 选择分类
const selectCategory = (category) => {
  selectedCategory.value = category
}

// 搜索
const handleSearch = () => {
  store.setFilters({ keyword: searchKeyword.value })
}

// 清空搜索
const clearSearch = () => {
  searchKeyword.value = ''
  store.clearFilters()
}

// 播放音乐
const playMusic = (music) => {
  selectedMusic.value = music
  store.playMusic(music)
  showMusicDetail.value = true
}

// 切换播放
const togglePlay = () => {
  if (store.isPlaying) {
    store.pauseMusic()
  } else {
    store.currentMusic && store.playMusic(store.currentMusic)
  }
}

// 停止播放
const stopMusic = () => {
  store.stopMusic()
}

// 跳转播放器
const goToPlayer = () => {
  // 可以跳转到专门的播放器页面
}

// 显示知识
const showKnowledge = (knowledge) => {
  selectedKnowledge.value = knowledge
  showKnowledgeDetail.value = true
}

// 格式化时长
const formatDuration = (seconds) => {
  if (!seconds) return '--:--'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// 获取难度文本
const getDifficultyText = (diff) => {
  const levels = { 1: '简单', 2: '中等', 3: '困难' }
  return levels[diff] || '未知'
}

// 获取难度颜色
const getDifficultyColor = (diff) => {
  const colors = { 1: '#2ECC71', 2: '#F39C12', 3: '#E74C3C' }
  return colors[diff] || '#999'
}

// 初始化
onMounted(() => {
  store.init()
})
</script>

<style scoped>
.appreciation-page {
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

.header-actions {
  display: flex;
  gap: 16rpx;
}

.search-btn {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  border-radius: 50%;
}

/* 搜索栏 */
.search-bar {
  display: flex;
  padding: 16rpx 32rpx;
  background-color: #fff;
  gap: 16rpx;
}

.search-input {
  flex: 1;
  height: 72rpx;
  padding: 0 24rpx;
  background-color: #f5f5f5;
  border-radius: 36rpx;
  font-size: 28rpx;
}

.search-clear {
  padding: 0 24rpx;
  background-color: #E0F7FA;
  color: #00897B;
  border-radius: 24rpx;
  font-size: 24rpx;
  border: none;
}

/* 分类导航 */
.category-nav {
  display: flex;
  padding: 24rpx 32rpx;
  background-color: #fff;
  white-space: nowrap;
}

.category-tab {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  padding: 16rpx 24rpx;
  margin-right: 16rpx;
  background-color: #f5f5f5;
  border-radius: 24rpx;
  min-width: 100rpx;
}

.category-tab.active {
  background: linear-gradient(135deg, #4ECDC4, #44A08D);
}

.category-tab.active .cat-name {
  color: #fff;
}

.cat-icon {
  font-size: 32rpx;
  margin-bottom: 4rpx;
}

.cat-name {
  font-size: 22rpx;
  color: #666;
}

/* 播放控制栏 */
.player-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  padding: 16rpx 32rpx;
  box-shadow: 0 -4rpx 20rpx rgba(0,0,0,0.1);
  z-index: 100;
}

.player-info {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.player-cover {
  width: 80rpx;
  height: 80rpx;
  border-radius: 12rpx;
}

.player-text {
  flex: 1;
}

.player-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  display: block;
}

.player-composer {
  font-size: 22rpx;
  color: #999;
}

.player-controls {
  display: flex;
  gap: 24rpx;
}

.control-btn {
  font-size: 40rpx;
}

.player-progress {
  height: 4rpx;
  background-color: #E0E0E0;
  border-radius: 2rpx;
  margin-top: 12rpx;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #4ECDC4, #44A08D);
  border-radius: 2rpx;
  transition: width 0.3s;
}

/* 音乐卡片 */
.section {
  margin: 24rpx 32rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.section-more {
  font-size: 26rpx;
  color: #4ECDC4;
}

.section-count {
  font-size: 24rpx;
  color: #999;
}

.music-scroll {
  display: flex;
  white-space: nowrap;
}

.music-card {
  display: inline-block;
  width: 200rpx;
  margin-right: 20rpx;
  vertical-align: top;
}

.music-cover {
  width: 200rpx;
  height: 200rpx;
  border-radius: 16rpx;
  background-color: #E0E0E0;
}

.music-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 200rpx;
  height: 200rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0,0,0,0.3);
  border-radius: 16rpx;
  opacity: 0;
  transition: opacity 0.3s;
}

.music-card:active .music-overlay {
  opacity: 1;
}

.play-icon {
  font-size: 48rpx;
  color: #fff;
}

.music-title {
  display: block;
  font-size: 26rpx;
  font-weight: 600;
  color: #333;
  margin-top: 12rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.music-composer {
  display: block;
  font-size: 22rpx;
  color: #999;
  margin-top: 4rpx;
}

/* 音乐列表 */
.music-list {
  background-color: #fff;
  border-radius: 16rpx;
  overflow: hidden;
}

.music-item {
  display: flex;
  align-items: center;
  padding: 20rpx 24rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.music-item:last-child {
  border-bottom: none;
}

.music-item.playing {
  background-color: #E0F7FA;
}

.music-item-left {
  position: relative;
}

.item-cover {
  width: 100rpx;
  height: 100rpx;
  border-radius: 12rpx;
  background-color: #E0E0E0;
}

.playing-indicator {
  position: absolute;
  top: -8rpx;
  right: -8rpx;
}

.wave {
  font-size: 24rpx;
  animation: wave 0.5s infinite alternate;
}

@keyframes wave {
  from { transform: scale(1); }
  to { transform: scale(1.2); }
}

.music-item-info {
  flex: 1;
  margin-left: 20rpx;
}

.item-title {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
}

.item-composer {
  display: block;
  font-size: 24rpx;
  color: #999;
  margin-top: 4rpx;
}

.item-tags {
  display: flex;
  gap: 8rpx;
  margin-top: 8rpx;
}

.tag {
  padding: 4rpx 12rpx;
  background-color: #f0f0f0;
  border-radius: 12rpx;
  font-size: 20rpx;
  color: #666;
}

.music-item-right {
  text-align: right;
}

.duration {
  display: block;
  font-size: 24rpx;
  color: #999;
}

.difficulty {
  display: block;
  font-size: 22rpx;
  margin-top: 4rpx;
}

/* 知识卡片 */
.knowledge-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.knowledge-card {
  display: flex;
  align-items: flex-start;
  padding: 24rpx;
  background-color: #fff;
  border-radius: 16rpx;
}

.knowledge-icon {
  font-size: 48rpx;
  margin-right: 20rpx;
}

.knowledge-content {
  flex: 1;
}

.knowledge-title {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
}

.knowledge-preview {
  display: block;
  font-size: 24rpx;
  color: #666;
  margin-top: 8rpx;
  line-height: 1.4;
}

/* 弹窗 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0,0,0,0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  width: 90%;
  max-height: 80vh;
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
}

.modal-close {
  font-size: 40rpx;
  color: #999;
}

.detail-body {
  padding: 32rpx;
}

.detail-cover {
  width: 100%;
  height: 300rpx;
  border-radius: 16rpx;
  background-color: #E0E0E0;
}

.detail-info {
  margin-top: 24rpx;
}

.detail-title {
  display: block;
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
}

.detail-composer {
  display: block;
  font-size: 26rpx;
  color: #666;
  margin-top: 8rpx;
}

.detail-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 16rpx;
}

.detail-tag {
  padding: 8rpx 20rpx;
  background-color: #E0F7FA;
  border-radius: 20rpx;
  font-size: 24rpx;
  color: #00897B;
}

.detail-desc {
  display: block;
  font-size: 28rpx;
  color: #666;
  margin-top: 20rpx;
  line-height: 1.6;
}

.detail-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 24rpx;
  margin-top: 20rpx;
}

.meta-item {
  font-size: 24rpx;
  color: #999;
}

.btn-play-music {
  width: 100%;
  margin-top: 32rpx;
  padding: 24rpx;
  background: linear-gradient(135deg, #4ECDC4, #44A08D);
  color: #fff;
  border-radius: 48rpx;
  font-size: 32rpx;
  font-weight: 600;
  border: none;
}

.knowledge-body {
  padding: 32rpx;
}

.knowledge-full-content {
  font-size: 30rpx;
  color: #333;
  line-height: 1.8;
}
</style>
