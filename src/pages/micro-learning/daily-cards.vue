<template>
  <view class="daily-cards-page">
    <!-- 头部 -->
    <view class="header">
      <view class="header-content">
        <text class="page-title">📖 每日学习卡片</text>
        <text class="page-subtitle">每天进步一点点</text>
      </view>
      <view class="progress-badge" @tap="showProgress">
        <text class="badge-text">已读 {{ readCount }}/{{ store.dailyCards.length }}</text>
      </view>
    </view>

    <!-- 今日卡片 -->
    <view class="today-card-section" v-if="store.todayCard">
      <view class="section-label">今日推荐</view>
      <view 
        class="today-card" 
        :class="{ 'has-animation': store.todayCard.animation }"
        @tap="viewCardDetail(store.todayCard)"
      >
        <view class="card-type-badge">
          <text>{{ getCardTypeName(store.todayCard.type) }}</text>
        </view>
        <view class="card-image-placeholder">
          <text class="card-emoji">{{ getCardEmoji(store.todayCard.type) }}</text>
        </view>
        <view class="card-content">
          <text class="card-title">{{ store.todayCard.title }}</text>
          <text class="card-summary">{{ store.todayCard.summary }}</text>
          <view class="card-meta">
            <text class="meta-tag">{{ store.todayCard.ageGroup }}岁</text>
            <text class="meta-tag">{{ getDifficultyName(store.todayCard.difficulty) }}</text>
          </view>
        </view>
        <view class="read-indicator" v-if="isCardRead(store.todayCard.id)">
          <text>✅ 已读</text>
        </view>
      </view>
    </view>

    <!-- 卡片列表 -->
    <view class="cards-list-section">
      <view class="section-header">
        <text class="section-title">学习卡片</text>
        <text class="card-count">{{ store.dailyCards.length }}张</text>
      </view>
      
      <view class="cards-grid">
        <view 
          v-for="card in store.dailyCards" 
          :key="card.id"
          class="card-item"
          @tap="viewCardDetail(card)"
        >
          <view class="card-item-image">
            <text class="card-emoji-small">{{ getCardEmoji(card.type) }}</text>
          </view>
          <view class="card-item-content">
            <text class="card-item-title">{{ card.title }}</text>
            <view class="card-item-tags">
              <text 
                v-for="tag in card.tags.slice(0, 2)" 
                :key="tag" 
                class="tag"
              >{{ tag }}</text>
            </view>
          </view>
          <view class="read-dot" v-if="isCardRead(card.id)"></view>
        </view>
      </view>
    </view>

    <!-- 加载状态 -->
    <view class="loading-state" v-if="store.loading">
      <text>加载中...</text>
    </view>

    <!-- 空状态 -->
    <view class="empty-state" v-if="!store.loading && store.dailyCards.length === 0">
      <text class="empty-icon">📚</text>
      <text class="empty-title">暂无学习卡片</text>
      <text class="empty-subtitle">稍后再来看看吧</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useMicroLearningStore } from '@/stores/microLearningStore.js'
import { CARD_TYPES, DIFFICULTY } from '@/services/microLearningService.js'

const store = useMicroLearningStore()

// 读取记录
const readCards = ref([])

// 卡片类型名称映射
const cardTypeNames = {
  [CARD_TYPES.DAILY_KNOWLEDGE]: '每日知识',
  [CARD_TYPES.STORY]: '故事',
  [CARD_TYPES.SCIENCE]: '科学',
  [CARD_TYPES.ART]: '艺术',
  [CARD_TYPES.MORAL]: '品德'
}

// 卡片类型emoji映射
const cardEmojis = {
  [CARD_TYPES.DAILY_KNOWLEDGE]: '🌟',
  [CARD_TYPES.STORY]: '📖',
  [CARD_TYPES.SCIENCE]: '🔬',
  [CARD_TYPES.ART]: '🎨',
  [CARD_TYPES.MORAL]: '💝'
}

const readCount = computed(() => {
  return store.dailyCards.filter(card => readCards.value.includes(card.id)).length
})

function getCardTypeName(type) {
  return cardTypeNames[type] || '学习'
}

function getCardEmoji(type) {
  return cardEmojis[type] || '📚'
}

function getDifficultyName(difficulty) {
  const names = {
    [DIFFICULTY.EASY]: '简单',
    [DIFFICULTY.MEDIUM]: '中等',
    [DIFFICULTY.HARD]: '困难'
  }
  return names[difficulty] || '普通'
}

function isCardRead(cardId) {
  return readCards.value.includes(cardId)
}

async function viewCardDetail(card) {
  // 标记为已读
  if (!readCards.value.includes(card.id)) {
    readCards.value.push(card.id)
  }
  
  // 调用store方法
  await store.viewCard(card.id)
  
  // TODO: 跳转到卡片详情页
  uni.showModal({
    title: card.title,
    content: card.content,
    showCancel: false
  })
}

function showProgress() {
  uni.showModal({
    title: '学习进度',
    content: `已阅读 ${readCount.value} / ${store.dailyCards.length} 张卡片`,
    showCancel: false
  })
}

onMounted(async () => {
  await store.loadDailyCards()
  await store.loadUserProgress()
  
  // 加载已读记录
  if (store.userProgress.readCards) {
    readCards.value = [...store.userProgress.readCards]
  }
})
</script>

<style scoped>
.daily-cards-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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

.progress-badge {
  background: rgba(255, 255, 255, 0.2);
  padding: 12rpx 24rpx;
  border-radius: 30rpx;
}

.badge-text {
  color: #ffffff;
  font-size: 24rpx;
}

.today-card-section {
  margin-bottom: 40rpx;
}

.section-label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 24rpx;
  margin-bottom: 16rpx;
  padding-left: 10rpx;
}

.today-card {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 30rpx;
  position: relative;
  box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.15);
}

.today-card.has-animation {
  border: 4rpx solid #FFD700;
}

.card-type-badge {
  position: absolute;
  top: 20rpx;
  right: 20rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
}

.card-image-placeholder {
  width: 120rpx;
  height: 120rpx;
  background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20rpx;
}

.card-emoji {
  font-size: 60rpx;
}

.card-content {
  flex: 1;
}

.card-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 12rpx;
}

.card-summary {
  font-size: 28rpx;
  color: #666;
  line-height: 1.5;
  display: block;
  margin-bottom: 16rpx;
}

.card-meta {
  display: flex;
  gap: 16rpx;
}

.meta-tag {
  background: #f0f0f0;
  color: #666;
  padding: 6rpx 16rpx;
  border-radius: 12rpx;
  font-size: 22rpx;
}

.read-indicator {
  position: absolute;
  bottom: 20rpx;
  right: 20rpx;
  color: #52c41a;
  font-size: 24rpx;
}

.cards-list-section {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 24rpx;
  padding: 30rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #ffffff;
}

.card-count {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.7);
}

.cards-grid {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.card-item {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 24rpx;
  display: flex;
  align-items: center;
  gap: 20rpx;
  position: relative;
}

.card-item-image {
  width: 80rpx;
  height: 80rpx;
  background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-emoji-small {
  font-size: 40rpx;
}

.card-item-content {
  flex: 1;
}

.card-item-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 10rpx;
}

.card-item-tags {
  display: flex;
  gap: 10rpx;
}

.tag {
  background: #f0f0f0;
  color: #666;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  font-size: 20rpx;
}

.read-dot {
  width: 16rpx;
  height: 16rpx;
  background: #52c41a;
  border-radius: 50%;
  position: absolute;
  top: 20rpx;
  right: 20rpx;
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
