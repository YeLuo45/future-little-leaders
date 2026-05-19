<template>
  <view class="culture-page">
    <!-- 头部 -->
    <view class="header-card">
      <view class="header-left">
        <text class="culture-icon">🎭</text>
        <view class="header-info">
          <text class="title">文化发现</text>
          <text class="subtitle">探索世界各国文化</text>
        </view>
      </view>
      <view class="stats-badge">
        <text class="stats-num">{{ culturesExplored }}</text>
        <text class="stats-label">已探索</text>
      </view>
    </view>

    <!-- 文化分类 -->
    <view class="category-tabs">
      <view
        class="tab-item"
        :class="{ active: currentCategory === '全部' }"
        @click="filterByCategory('全部')"
      >
        全部
      </view>
      <view
        class="tab-item"
        :class="{ active: currentCategory === '节日庆典' }"
        @click="filterByCategory('节日庆典')"
      >
        节日
      </view>
      <view
        class="tab-item"
        :class="{ active: currentCategory === '美食文化' }"
        @click="filterByCategory('美食文化')"
      >
        美食
      </view>
      <view
        class="tab-item"
        :class="{ active: currentCategory === '流行文化' }"
        @click="filterByCategory('流行文化')"
      >
        流行
      </view>
    </view>

    <!-- 文化列表 -->
    <view class="culture-list">
      <view
        class="culture-card"
        v-for="culture in filteredCultures"
        :key="culture.id"
        @click="openCultureDetail(culture)"
      >
        <view class="card-left">
          <text class="culture-icon-large">{{ culture.icon }}</text>
        </view>
        <view class="card-content">
          <view class="card-header">
            <text class="culture-title">{{ culture.title }}</text>
            <view class="learned-badge" v-if="isLearned(culture.id)">
              <text>✓</text>
            </view>
          </view>
          <text class="culture-country">{{ culture.country }}</text>
          <text class="culture-desc">{{ culture.description }}</text>
          <view class="card-footer">
            <view class="category-tag">{{ culture.category }}</view>
            <text class="points-tag">+{{ culture.points }}积分</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 文化详情弹窗 -->
    <uni-popup ref="culturePopup" type="bottom">
      <view class="culture-popup" v-if="selectedCulture">
        <view class="popup-header">
          <view class="popup-icon">{{ selectedCulture.icon }}</view>
          <view class="popup-title-wrap">
            <text class="popup-title">{{ selectedCulture.title }}</text>
            <text class="popup-country">{{ selectedCulture.country }}</text>
          </view>
          <view class="close-btn" @click="closeCultureDetail">
            <text>✕</text>
          </view>
        </view>

        <scroll-view class="popup-content" scroll-y>
          <text class="culture-content">{{ selectedCulture.content }}</text>

          <view class="popup-section">
            <text class="section-title">传统习俗</text>
            <view class="traditions-list">
              <view
                class="tradition-item"
                v-for="(t, idx) in selectedCulture.traditions"
                :key="idx"
              >
                <text class="tradition-icon">🎯</text>
                <text class="tradition-text">{{ t }}</text>
              </view>
            </view>
          </view>

          <view class="popup-section">
            <text class="section-title">特色美食</text>
            <view class="food-list">
              <view
                class="food-item"
                v-for="(f, idx) in selectedCulture.food"
                :key="idx"
              >
                <text class="food-icon">🍽️</text>
                <text class="food-text">{{ f }}</text>
              </view>
            </view>
          </view>
        </scroll-view>

        <view class="popup-footer">
          <button
            class="learn-btn"
            :class="{ completed: isLearned(selectedCulture.id) }"
            @click="handleLearnCulture(selectedCulture.id)"
          >
            {{ isLearned(selectedCulture.id) ? '已探索' : '探索+' + selectedCulture.points + '积分' }}
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
const selectedCulture = ref(null)
const culturePopup = ref(null)

const culturesExplored = computed(() => geographyStore.culturesExplored)

const cultureList = computed(() => {
  if (currentCategory.value === '全部') {
    return geographyStore.cultureList
  }
  return geographyStore.getCulturesByCategory(currentCategory.value)
})

const filteredCultures = computed(() => cultureList.value)

const isLearned = (cultureId) => {
  return geographyStore.isCultureLearned(cultureId)
}

const filterByCategory = (category) => {
  currentCategory.value = category
}

const openCultureDetail = (culture) => {
  selectedCulture.value = culture
  culturePopup.value.open()
}

const closeCultureDetail = () => {
  culturePopup.value.close()
}

const handleLearnCulture = (cultureId) => {
  if (!isLearned(cultureId)) {
    const culture = selectedCulture.value
    geographyStore.learnCulture(cultureId)
    uni.showToast({ title: '探索成功+' + culture.points + '积分', icon: 'success' })
  }
}

onMounted(() => {
  geographyStore.init()
})
</script>

<style scoped>
.culture-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20rpx;
}

.header-card {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
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

.culture-icon {
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

.category-tabs {
  display: flex;
  gap: 12rpx;
  margin-bottom: 20rpx;
  background: #fff;
  padding: 16rpx;
  border-radius: 16rpx;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 16rpx;
  font-size: 28rpx;
  color: #666;
  border-radius: 12rpx;
}

.tab-item.active {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: #fff;
  font-weight: bold;
}

.culture-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.culture-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  display: flex;
  gap: 20rpx;
}

.card-left {
  flex-shrink: 0;
}

.culture-icon-large {
  font-size: 80rpx;
}

.card-content {
  flex: 1;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4rpx;
}

.culture-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.learned-badge {
  width: 40rpx;
  height: 40rpx;
  background: #4caf50;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 24rpx;
}

.culture-country {
  font-size: 26rpx;
  color: #f5576c;
  display: block;
  margin-bottom: 8rpx;
}

.culture-desc {
  font-size: 26rpx;
  color: #666;
  line-height: 1.4;
  display: block;
  margin-bottom: 12rpx;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.category-tag {
  font-size: 22rpx;
  padding: 6rpx 16rpx;
  background: #fce4ec;
  color: #f5576c;
  border-radius: 8rpx;
}

.points-tag {
  font-size: 26rpx;
  color: #ff9800;
  font-weight: bold;
}

/* 弹窗样式 */
.culture-popup {
  background: #fff;
  border-radius: 32rpx 32rpx 0 0;
  max-height: 75vh;
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
  background: #fce4ec;
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

.popup-country {
  font-size: 26rpx;
  color: #f5576c;
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

.culture-content {
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

.traditions-list,
.food-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.tradition-item,
.food-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 12rpx 16rpx;
  background: #f9f9f9;
  border-radius: 8rpx;
}

.tradition-icon,
.food-icon {
  font-size: 28rpx;
}

.tradition-text,
.food-text {
  font-size: 26rpx;
  color: #333;
}

.popup-footer {
  padding: 20rpx 30rpx;
  border-top: 1rpx solid #eee;
}

.learn-btn {
  width: 100%;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
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
