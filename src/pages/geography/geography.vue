<template>
  <view class="geography-page">
    <!-- 头部统计 -->
    <view class="header-card">
      <view class="header-left">
        <text class="geo-icon">📚</text>
        <view class="header-info">
          <text class="points-value">{{ factsLearned }}</text>
          <text class="points-label">已学知识</text>
        </view>
      </view>
      <view class="header-right">
        <view class="total-stat">
          <text class="stat-num">{{ geographyFacts.length }}</text>
          <text class="stat-label">知识总数</text>
        </view>
      </view>
    </view>

    <!-- 功能入口 -->
    <view class="feature-grid">
      <view class="feature-card" @click="goToWorldTour">
        <text class="feature-icon">🌍</text>
        <text class="feature-title">环球旅行</text>
        <text class="feature-desc">探索世界各国</text>
      </view>
      <view class="feature-card" @click="goToCulture">
        <text class="feature-icon">🎭</text>
        <text class="feature-title">文化发现</text>
        <text class="feature-desc">了解各国文化</text>
      </view>
      <view class="feature-card" @click="goToPenPals">
        <text class="feature-icon">✉️</text>
        <text class="feature-title">国际笔友</text>
        <text class="feature-desc">交外国朋友</text>
      </view>
      <view class="feature-card" @click="goToLanguage">
        <text class="feature-icon">🗣️</text>
        <text class="feature-title">语言学习</text>
        <text class="feature-desc">学习外语基础</text>
      </view>
    </view>

    <!-- 地理知识分类 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">地理知识</text>
        <view class="category-filter">
          <view
            class="filter-tag"
            :class="{ active: currentCategory === '全部' }"
            @click="filterByCategory('全部')"
          >
            全部
          </view>
          <view
            class="filter-tag"
            :class="{ active: currentCategory === '地理概念' }"
            @click="filterByCategory('地理概念')"
          >
            概念
          </view>
          <view
            class="filter-tag"
            :class="{ active: currentCategory === '地形地貌' }"
            @click="filterByCategory('地形地貌')"
          >
            地形
          </view>
        </view>
      </view>

      <view class="facts-list">
        <view
          class="fact-item"
          v-for="fact in filteredFacts"
          :key="fact.id"
          @click="openFactDetail(fact)"
        >
          <view class="fact-icon">
            <text>{{ getCategoryEmoji(fact.category) }}</text>
          </view>
          <view class="fact-content">
            <text class="fact-title">{{ fact.title }}</text>
            <view class="fact-meta">
              <text class="fact-category">{{ fact.category }}</text>
              <text class="fact-points">+{{ fact.points }}</text>
            </view>
          </view>
          <view class="fact-status">
            <text v-if="isLearned(fact.id)" class="learned-icon">✓</text>
            <text v-else class="unlearned-icon">○</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 知识详情弹窗 -->
    <uni-popup ref="factPopup" type="bottom">
      <view class="fact-popup" v-if="selectedFact">
        <view class="popup-header">
          <view class="popup-icon">{{ getCategoryEmoji(selectedFact.category) }}</view>
          <view class="popup-title-wrap">
            <text class="popup-title">{{ selectedFact.title }}</text>
            <text class="popup-category">{{ selectedFact.category }}</text>
          </view>
          <view class="close-btn" @click="closeFactDetail">
            <text>✕</text>
          </view>
        </view>

        <scroll-view class="popup-content" scroll-y>
          <text class="fact-content-text">{{ selectedFact.content }}</text>
          <view class="fact-info">
            <text class="info-item">适用年龄: {{ selectedFact.ageRange }}岁</text>
            <text class="info-item">学习积分: +{{ selectedFact.points }}</text>
          </view>
        </scroll-view>

        <view class="popup-footer">
          <button
            class="learn-btn"
            :class="{ completed: isLearned(selectedFact.id) }"
            @click="handleLearnFact(selectedFact.id)"
          >
            {{ isLearned(selectedFact.id) ? '已学习' : '学习+' + selectedFact.points + '积分' }}
          </button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useGeographyStore } from '@/stores/geographyStore.js'

const geographyStore = useGeographyStore()

const currentCategory = ref('全部')
const selectedFact = ref(null)
const factPopup = ref(null)

const factsLearned = computed(() => geographyStore.factsLearned)
const geographyFacts = computed(() => geographyStore.geographyFacts)

const filteredFacts = computed(() => {
  const category = currentCategory.value
  if (category === '全部') return geographyFacts.value
  return geographyFacts.value.filter(f => f.category === category)
})

const isLearned = (factId) => {
  return geographyStore.isFactLearned(factId)
}

const getCategoryEmoji = (category) => {
  const map = {
    '地理概念': '🌐',
    '地形地貌': '🏔️',
    '气候': '🌡️',
    '生态系统': '🌳',
    '国家地理': '🏳️',
    '人文地理': '🏙️'
  }
  return map[category] || '📖'
}

const filterByCategory = (category) => {
  currentCategory.value = category
}

const openFactDetail = (fact) => {
  selectedFact.value = fact
  factPopup.value.open()
}

const closeFactDetail = () => {
  factPopup.value.close()
}

const handleLearnFact = (factId) => {
  if (!isLearned(factId)) {
    geographyStore.learnGeographyFact(factId)
    uni.showToast({ title: '学习成功+' + selectedFact.value.points + '积分', icon: 'success' })
  }
}

const goToWorldTour = () => {
  uni.navigateTo({ url: '/pages/geography/world-tour' })
}

const goToCulture = () => {
  uni.navigateTo({ url: '/pages/geography/culture' })
}

const goToPenPals = () => {
  uni.navigateTo({ url: '/pages/geography/pen-pals' })
}

const goToLanguage = () => {
  uni.navigateTo({ url: '/pages/geography/language' })
}

onMounted(() => {
  geographyStore.init()
})
</script>

<style scoped>
.geography-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20rpx;
}

.header-card {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  border-radius: 24rpx;
  padding: 40rpx 30rpx;
  color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.header-left {
  display: flex;
  align-items: center;
}

.geo-icon {
  font-size: 64rpx;
  margin-right: 20rpx;
}

.header-info {
  display: flex;
  flex-direction: column;
}

.points-value {
  font-size: 56rpx;
  font-weight: bold;
}

.points-label {
  font-size: 26rpx;
  opacity: 0.9;
}

.header-right {
  background: rgba(255,255,255,0.2);
  border-radius: 16rpx;
  padding: 16rpx 24rpx;
}

.total-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-num {
  font-size: 36rpx;
  font-weight: bold;
}

.stat-label {
  font-size: 24rpx;
  opacity: 0.9;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
  margin-bottom: 20rpx;
}

.feature-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.feature-icon {
  font-size: 56rpx;
  margin-bottom: 8rpx;
}

.feature-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}

.feature-desc {
  font-size: 24rpx;
  color: #999;
}

.section {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
  flex-wrap: wrap;
  gap: 16rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.category-filter {
  display: flex;
  gap: 8rpx;
}

.filter-tag {
  font-size: 24rpx;
  padding: 8rpx 16rpx;
  background: #f0f0f0;
  color: #666;
  border-radius: 8rpx;
}

.filter-tag.active {
  background: #11998e;
  color: #fff;
}

.facts-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.fact-item {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background: #f9f9f9;
  border-radius: 12rpx;
  gap: 16rpx;
}

.fact-icon {
  width: 80rpx;
  height: 80rpx;
  background: #fff;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  flex-shrink: 0;
}

.fact-content {
  flex: 1;
}

.fact-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  display: block;
}

.fact-meta {
  display: flex;
  gap: 12rpx;
  margin-top: 8rpx;
}

.fact-category {
  font-size: 22rpx;
  color: #11998e;
}

.fact-points {
  font-size: 22rpx;
  color: #ff9800;
  font-weight: bold;
}

.fact-status {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.learned-icon {
  color: #4caf50;
  font-size: 32rpx;
  font-weight: bold;
}

.unlearned-icon {
  color: #ccc;
  font-size: 32rpx;
}

/* 详情弹窗 */
.fact-popup {
  background: #fff;
  border-radius: 32rpx 32rpx 0 0;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
}

.popup-header {
  display: flex;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #eee;
}

.popup-icon {
  width: 80rpx;
  height: 80rpx;
  background: #f0f9f8;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48rpx;
  margin-right: 20rpx;
  flex-shrink: 0;
}

.popup-title-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.popup-title {
  font-size: 34rpx;
  font-weight: bold;
  color: #333;
}

.popup-category {
  font-size: 24rpx;
  color: #11998e;
  margin-top: 4rpx;
}

.close-btn {
  width: 60rpx;
  height: 60rpx;
  background: #f5f5f5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  color: #666;
}

.popup-content {
  flex: 1;
  padding: 30rpx;
  max-height: 40vh;
}

.fact-content-text {
  font-size: 28rpx;
  color: #333;
  line-height: 1.6;
}

.fact-info {
  display: flex;
  gap: 24rpx;
  margin-top: 24rpx;
}

.info-item {
  font-size: 24rpx;
  color: #999;
}

.popup-footer {
  padding: 20rpx 30rpx;
  border-top: 1rpx solid #eee;
}

.learn-btn {
  width: 100%;
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  color: #fff;
  border-radius: 50rpx;
  font-size: 32rpx;
  font-weight: bold;
  border: none;
  padding: 24rpx;
}

.learn-btn.completed {
  background: #ccc;
}
</style>
