<template>
  <view class="world-tour-page">
    <!-- 头部 -->
    <view class="header-card">
      <view class="header-left">
        <text class="tour-icon">🌍</text>
        <view class="header-info">
          <text class="title">环球旅行</text>
          <text class="subtitle">探索世界每个角落</text>
        </view>
      </view>
      <view class="stats-badge">
        <text class="stats-num">{{ countriesVisited }}</text>
        <text class="stats-label">已访问</text>
      </view>
    </view>

    <!-- 统计卡片 -->
    <view class="stats-row">
      <view class="stat-item">
        <text class="stat-icon">🏳️</text>
        <text class="stat-value">{{ destinations.length }}</text>
        <text class="stat-label">目的地</text>
      </view>
      <view class="stat-item">
        <text class="stat-icon">⭐</text>
        <text class="stat-value">{{ totalPoints }}</text>
        <text class="stat-label">积分</text>
      </view>
      <view class="stat-item">
        <text class="stat-icon">🏆</text>
        <text class="stat-value">{{ badges.length }}</text>
        <text class="stat-label">徽章</text>
      </view>
    </view>

    <!-- 大洲筛选 -->
    <view class="continent-filter">
      <view
        class="continent-tag"
        :class="{ active: selectedContinent === '全部' }"
        @click="filterByContinent('全部')"
      >
        全部
      </view>
      <view
        class="continent-tag"
        :class="{ active: selectedContinent === '亚洲' }"
        @click="filterByContinent('亚洲')"
      >
        亚洲
      </view>
      <view
        class="continent-tag"
        :class="{ active: selectedContinent === '欧洲' }"
        @click="filterByContinent('欧洲')"
      >
        欧洲
      </view>
      <view
        class="continent-tag"
        :class="{ active: selectedContinent === '北美洲' }"
        @click="filterByContinent('北美洲')"
      >
        北美
      </view>
      <view
        class="continent-tag"
        :class="{ active: selectedContinent === '南美洲' }"
        @click="filterByContinent('南美洲')"
      >
        南美
      </view>
      <view
        class="continent-tag"
        :class="{ active: selectedContinent === '非洲' }"
        @click="filterByContinent('非洲')"
      >
        非洲
      </view>
    </view>

    <!-- 目的地列表 -->
    <view class="destinations-list">
      <view
        class="destination-card"
        v-for="dest in filteredDestinations"
        :key="dest.id"
        :class="{ visited: isVisited(dest.id) }"
        @click="openDestinationDetail(dest)"
      >
        <view class="dest-header">
          <view class="dest-flag">{{ getContinentEmoji(dest.continent) }}</view>
          <view class="dest-country">
            <text class="country-name">{{ dest.country }}</text>
            <text class="city-name">{{ dest.city }}</text>
          </view>
          <view class="visited-tag" v-if="isVisited(dest.id)">✓ 已访问</view>
        </view>

        <text class="dest-desc">{{ dest.description }}</text>

        <view class="dest-highlights">
          <text
            class="highlight-tag"
            v-for="(h, idx) in dest.highlights.slice(0, 3)"
            :key="idx"
          >
            {{ h }}
          </text>
        </view>

        <view class="dest-footer">
          <view class="continent-badge">
            <text>{{ dest.continent }}</text>
          </view>
          <text class="dest-points">+{{ dest.points }}积分</text>
        </view>
      </view>
    </view>

    <!-- 目的地详情弹窗 -->
    <uni-popup ref="destPopup" type="bottom">
      <view class="dest-popup" v-if="selectedDest">
        <view class="popup-header">
          <view class="popup-country">
            <text class="popup-country-name">{{ selectedDest.country }}</text>
            <text class="popup-city-name">{{ selectedDest.city }}</text>
          </view>
          <view class="close-btn" @click="closeDestinationDetail">
            <text>✕</text>
          </view>
        </view>

        <scroll-view class="popup-content" scroll-y>
          <text class="popup-desc">{{ selectedDest.description }}</text>

          <view class="popup-section">
            <text class="section-title">必游景点</text>
            <view class="highlights-grid">
              <view
                class="highlight-item"
                v-for="(h, idx) in selectedDest.highlights"
                :key="idx"
              >
                <text class="highlight-icon">📍</text>
                <text class="highlight-text">{{ h }}</text>
              </view>
            </view>
          </view>

          <view class="popup-section">
            <text class="section-title">文化特色</text>
            <view class="culture-tag">
              <text>{{ selectedDest.culture }}</text>
            </view>
          </view>

          <view class="popup-section">
            <text class="section-title">难度</text>
            <view class="difficulty-info">
              <text class="difficulty-text">{{ getDifficultyText(selectedDest.difficulty) }}</text>
              <text class="difficulty-points">+{{ selectedDest.points }}积分</text>
            </view>
          </view>
        </scroll-view>

        <view class="popup-footer">
          <button
            class="checkin-btn"
            :class="{ visited: isVisited(selectedDest.id) }"
            @click="handleCheckin(selectedDest)"
          >
            {{ isVisited(selectedDest.id) ? '已访问' : '立即打卡' }}
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

const selectedContinent = ref('全部')
const selectedDest = ref(null)
const destPopup = ref(null)

const destinations = computed(() => geographyStore.destinations)
const countriesVisited = computed(() => geographyStore.countriesVisited)
const totalPoints = computed(() => geographyStore.totalPoints)
const badges = computed(() => geographyStore.badges)
const checkins = computed(() => geographyStore.checkins)

const filteredDestinations = computed(() => {
  return geographyStore.getDestinationsByContinent(selectedContinent.value)
})

const isVisited = (destId) => {
  return checkins.value.some(c => c.destinationId === destId)
}

const getContinentEmoji = (continent) => {
  const map = {
    '亚洲': '🌏',
    '欧洲': '🏰',
    '北美洲': '🗽',
    '南美洲': '💃',
    '非洲': '🦁',
    '大洋洲': '🦘'
  }
  return map[continent] || '🌍'
}

const getDifficultyText = (difficulty) => {
  const map = {
    'easy': '简单',
    'medium': '中等',
    'hard': '挑战'
  }
  return map[difficulty] || '普通'
}

const filterByContinent = (continent) => {
  selectedContinent.value = continent
}

const openDestinationDetail = (dest) => {
  selectedDest.value = dest
  destPopup.value.open()
}

const closeDestinationDetail = () => {
  destPopup.value.close()
}

const handleCheckin = (dest) => {
  if (!isVisited(dest.id)) {
    geographyStore.checkin(dest.id)
    uni.showToast({ title: `打卡成功！获得${dest.points}积分`, icon: 'success' })
    closeDestinationDetail()
  }
}

onMounted(() => {
  geographyStore.init()
})
</script>

<style scoped>
.world-tour-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20rpx;
}

.header-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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

.tour-icon {
  font-size: 64rpx;
  margin-right: 20rpx;
}

.header-info {
  display: flex;
  flex-direction: column;
}

.title {
  font-size: 40rpx;
  font-weight: bold;
}

.subtitle {
  font-size: 26rpx;
  opacity: 0.9;
  margin-top: 4rpx;
}

.stats-badge {
  background: rgba(255,255,255,0.2);
  border-radius: 16rpx;
  padding: 16rpx 24rpx;
  text-align: center;
}

.stats-num {
  font-size: 36rpx;
  font-weight: bold;
  display: block;
}

.stats-label {
  font-size: 24rpx;
  opacity: 0.9;
}

.stats-row {
  display: flex;
  justify-content: space-around;
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-icon {
  font-size: 40rpx;
  margin-bottom: 8rpx;
}

.stat-value {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.stat-label {
  font-size: 24rpx;
  color: #999;
  margin-top: 4rpx;
}

.continent-filter {
  display: flex;
  gap: 12rpx;
  flex-wrap: wrap;
  margin-bottom: 20rpx;
}

.continent-tag {
  font-size: 26rpx;
  padding: 12rpx 24rpx;
  background: #fff;
  color: #666;
  border-radius: 50rpx;
}

.continent-tag.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.destinations-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.destination-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
}

.destination-card.visited {
  border: 2rpx solid #4caf50;
}

.dest-header {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}

.dest-flag {
  font-size: 48rpx;
  margin-right: 16rpx;
}

.dest-country {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.country-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.city-name {
  font-size: 26rpx;
  color: #666;
  margin-top: 4rpx;
}

.visited-tag {
  font-size: 24rpx;
  color: #4caf50;
  font-weight: bold;
}

.dest-desc {
  font-size: 26rpx;
  color: #666;
  line-height: 1.5;
  margin-bottom: 16rpx;
}

.dest-highlights {
  display: flex;
  gap: 12rpx;
  flex-wrap: wrap;
  margin-bottom: 16rpx;
}

.highlight-tag {
  font-size: 22rpx;
  padding: 6rpx 16rpx;
  background: #f0f0f0;
  color: #666;
  border-radius: 8rpx;
}

.dest-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.continent-badge {
  font-size: 22rpx;
  padding: 6rpx 16rpx;
  background: #e8e0f0;
  color: #764ba2;
  border-radius: 8rpx;
}

.dest-points {
  font-size: 26rpx;
  color: #ff9800;
  font-weight: bold;
}

/* 弹窗样式 */
.dest-popup {
  background: #fff;
  border-radius: 32rpx 32rpx 0 0;
  max-height: 75vh;
  display: flex;
  flex-direction: column;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #eee;
}

.popup-country {
  display: flex;
  flex-direction: column;
}

.popup-country-name {
  font-size: 38rpx;
  font-weight: bold;
  color: #333;
}

.popup-city-name {
  font-size: 28rpx;
  color: #666;
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
  max-height: 50vh;
}

.popup-desc {
  font-size: 28rpx;
  color: #333;
  line-height: 1.6;
  display: block;
  margin-bottom: 30rpx;
}

.popup-section {
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 16rpx;
}

.highlights-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12rpx;
}

.highlight-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx;
  background: #f9f9f9;
  border-radius: 8rpx;
}

.highlight-icon {
  font-size: 28rpx;
}

.highlight-text {
  font-size: 26rpx;
  color: #333;
}

.culture-tag {
  display: inline-block;
  padding: 12rpx 24rpx;
  background: #e8e0f0;
  color: #764ba2;
  border-radius: 8rpx;
  font-size: 26rpx;
}

.difficulty-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.difficulty-text {
  font-size: 26rpx;
  color: #333;
}

.difficulty-points {
  font-size: 28rpx;
  color: #ff9800;
  font-weight: bold;
}

.popup-footer {
  padding: 20rpx 30rpx;
  border-top: 1rpx solid #eee;
}

.checkin-btn {
  width: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-radius: 50rpx;
  font-size: 32rpx;
  font-weight: bold;
  border: none;
  padding: 24rpx;
}

.checkin-btn.visited {
  background: #ccc;
}
</style>
