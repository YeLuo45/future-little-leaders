<!-- V95 World Culture Explorer 世界文化探索系统 -->
<template>
  <view class="world-culture-page">
    <!-- 头部 -->
    <view class="header">
      <view class="header-content">
        <text class="page-title">🌍 世界文化探索</text>
        <text class="page-subtitle">环球之旅 · 多元文化 · 精彩体验</text>
      </view>
      <view class="points-badge" @tap="showStatistics">
        <text class="points-icon">🏆</text>
        <text class="points-value">{{ store.statistics.totalPoints }}</text>
      </view>
    </view>

    <!-- 统计概览 -->
    <view class="stats-overview">
      <view class="stat-card">
        <text class="stat-icon">📍</text>
        <text class="stat-value">{{ store.statistics.completedCultures }}/{{ store.statistics.totalCultures }}</text>
        <text class="stat-label">已探索</text>
      </view>
      <view class="stat-card">
        <text class="stat-icon">🎫</text>
        <text class="stat-value">{{ store.statistics.totalStamps }}</text>
        <text class="stat-label">印章收集</text>
      </view>
      <view class="stat-card">
        <text class="stat-icon">⭐</text>
        <text class="stat-value">{{ store.statistics.explorationRate }}%</text>
        <text class="stat-label">探索进度</text>
      </view>
    </view>

    <!-- Tab导航 -->
    <view class="tab-bar">
      <view 
        class="tab" 
        :class="{active: store.currentTab === 'journey'}"
        @tap="switchTab('journey')"
      >
        <text class="tab-icon">✈️</text>
        <text class="tab-text">环球之旅</text>
      </view>
      <view 
        class="tab" 
        :class="{active: store.currentTab === 'customs'}"
        @tap="switchTab('customs')"
      >
        <text class="tab-icon">🎎</text>
        <text class="tab-text">风土人情</text>
      </view>
      <view 
        class="tab" 
        :class="{active: store.currentTab === 'activities'}"
        @tap="switchTab('activities')"
      >
        <text class="tab-icon">🎨</text>
        <text class="tab-text">文化体验</text>
      </view>
    </view>

    <!-- 子Tab筛选 -->
    <view class="sub-tab-bar" v-if="getSubTabs().length > 1">
      <view 
        class="sub-tab" 
        :class="{active: store.currentSubTab === 'all'}"
        @tap="switchSubTab('all')"
      >
        全部
      </view>
      <view 
        class="sub-tab" 
        v-for="tab in getSubTabs()"
        :key="tab.key"
        :class="{active: store.currentSubTab === tab.key}"
        @tap="switchSubTab(tab.key)"
      >
        {{ tab.name }}
      </view>
    </view>

    <!-- 文化列表 -->
    <scroll-view class="culture-list" scroll-y @scrolltolower="loadMore">
      <view class="culture-grid">
        <view 
          class="culture-card" 
          v-for="culture in displayedCultures"
          :key="culture.id"
          @tap="goToDetail(culture)"
        >
          <!-- 封面 -->
          <view class="card-cover" :style="{backgroundColor: getCoverColor(culture.subType)}">
            <text class="cover-emoji">{{ getCultureEmoji(culture.subType) }}</text>
            <!-- 状态标签 -->
            <view class="status-tag" v-if="getCultureStatus(culture.id)">
              <text class="status-text">{{ getStatusText(culture.id) }}</text>
            </view>
            <!-- 印章标记 -->
            <view class="stamp-badge" v-if="store.isStampCollected(culture.id)">
              <text class="stamp-icon">🎫</text>
            </view>
          </view>
          
          <!-- 内容 -->
          <view class="card-content">
            <text class="card-name">{{ culture.name }}</text>
            <text class="card-desc">{{ culture.description }}</text>
            
            <!-- 标签 -->
            <view class="card-tags">
              <text class="tag" v-for="(tag, idx) in culture.tags.slice(0, 2)" :key="idx">{{ tag }}</text>
            </view>
            
            <!-- 底部信息 -->
            <view class="card-footer">
              <view class="difficulty">
                <text class="diff-icon">{{ getDifficultyIcon(culture.difficulty) }}</text>
                <text class="diff-text">{{ getDifficultyText(culture.difficulty) }}</text>
              </view>
              <view class="points">
                <text class="points-icon">⭐</text>
                <text class="points-value">+{{ culture.points }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view class="empty-state" v-if="displayedCultures.length === 0">
        <text class="empty-icon">🌍</text>
        <text class="empty-text">暂无文化内容</text>
        <text class="empty-hint">敬请期待更多精彩内容</text>
      </view>
    </scroll-view>

    <!-- 底部印章展示 -->
    <view class="stamps-section" v-if="store.stamps.length > 0">
      <text class="section-title">我的印章</text>
      <scroll-view class="stamps-scroll" scroll-x>
        <view class="stamps-row">
          <view class="stamp-item" v-for="stamp in store.stamps.slice(0, 10)" :key="stamp.id">
            <text class="stamp-emoji">🎫</text>
            <text class="stamp-name">{{ stamp.cultureName }}</text>
          </view>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useWorldCultureStore } from '@/stores/worldCultureStore.js'
import { CULTURE_TYPE, JOURNEY_TYPE, CUSTOMS_TYPE, ACTIVITIES_TYPE, DIFFICULTY_LEVEL, EXPLORE_STATUS } from '@/services/worldCultureService.js'

const store = useWorldCultureStore()

// 当前显示的文化列表
const displayedCultures = computed(() => {
  switch (store.currentTab) {
    case 'journey':
      if (store.currentSubTab === 'all') {
        return store.cultures.filter(c => c.type === CULTURE_TYPE.JOURNEY)
      }
      return store.cultures.filter(c => c.type === CULTURE_TYPE.JOURNEY && c.subType === store.currentSubTab)
    case 'customs':
      if (store.currentSubTab === 'all') {
        return store.cultures.filter(c => c.type === CULTURE_TYPE.CUSTOMS)
      }
      return store.cultures.filter(c => c.type === CULTURE_TYPE.CUSTOMS && c.subType === store.currentSubTab)
    case 'activities':
      if (store.currentSubTab === 'all') {
        return store.cultures.filter(c => c.type === CULTURE_TYPE.ACTIVITIES)
      }
      return store.cultures.filter(c => c.type === CULTURE_TYPE.ACTIVITIES && c.subType === store.currentSubTab)
    default:
      return store.cultures
  }
})

// 获取子Tab配置
function getSubTabs() {
  const tabConfig = {
    journey: [
      { key: JOURNEY_TYPE.WORLD_TRIP, name: '环球之旅' },
      { key: JOURNEY_TYPE.COUNTRY_EXPLORE, name: '国家探索' },
      { key: JOURNEY_TYPE.CULTURE_ROUTE, name: '文化路线' }
    ],
    customs: [
      { key: CUSTOMS_TYPE.LOCAL_CUSTOMS, name: '风土人情' },
      { key: CUSTOMS_TYPE.FESTIVAL, name: '节日庆典' },
      { key: CUSTOMS_TYPE.TRADITION, name: '传统习俗' }
    ],
    activities: [
      { key: ACTIVITIES_TYPE.CULTURAL_ACTIVITY, name: '文化活动' },
      { key: ACTIVITIES_TYPE.HANDICRAFT, name: '手工制作' },
      { key: ACTIVITIES_TYPE.FOOD_EXPLORE, name: '美食探索' }
    ]
  }
  return tabConfig[store.currentTab] || []
}

// 切换Tab
function switchTab(tab) {
  store.switchTab(tab)
}

// 切换子Tab
function switchSubTab(subTab) {
  store.switchSubTab(subTab)
}

// 获取文化状态
function getCultureStatus(cultureId) {
  return store.getCultureStatus(cultureId)
}

// 获取状态文字
function getStatusText(cultureId) {
  const status = store.getCultureStatus(cultureId)
  switch (status) {
    case EXPLORE_STATUS.IN_PROGRESS:
      return '进行中'
    case EXPLORE_STATUS.COMPLETED:
      return '已完成'
    default:
      return ''
  }
}

// 获取难度图标
function getDifficultyIcon(difficulty) {
  switch (difficulty) {
    case DIFFICULTY_LEVEL.EASY:
      return '🟢'
    case DIFFICULTY_LEVEL.MEDIUM:
      return '🟡'
    case DIFFICULTY_LEVEL.HARD:
      return '🔴'
    default:
      return '🟢'
  }
}

// 获取难度文字
function getDifficultyText(difficulty) {
  switch (difficulty) {
    case DIFFICULTY_LEVEL.EASY:
      return '简单'
    case DIFFICULTY_LEVEL.MEDIUM:
      return '中等'
    case DIFFICULTY_LEVEL.HARD:
      return '困难'
    default:
      return '简单'
  }
}

// 获取封面颜色
function getCoverColor(subType) {
  const colors = {
    [JOURNEY_TYPE.WORLD_TRIP]: '#E8F5E9',
    [JOURNEY_TYPE.COUNTRY_EXPLORE]: '#E3F2FD',
    [JOURNEY_TYPE.CULTURE_ROUTE]: '#FFF3E0',
    [CUSTOMS_TYPE.LOCAL_CUSTOMS]: '#FCE4EC',
    [CUSTOMS_TYPE.FESTIVAL]: '#F3E5F5',
    [CUSTOMS_TYPE.TRADITION]: '#E0F7FA',
    [ACTIVITIES_TYPE.CULTURAL_ACTIVITY]: '#FFF8E1',
    [ACTIVITIES_TYPE.HANDICRAFT]: '#FFEBEE',
    [ACTIVITIES_TYPE.FOOD_EXPLORE]: '#F1F8E9'
  }
  return colors[subType] || '#F5F5F5'
}

// 获取文化表情
function getCultureEmoji(subType) {
  const emojis = {
    [JOURNEY_TYPE.WORLD_TRIP]: '🌍',
    [JOURNEY_TYPE.COUNTRY_EXPLORE]: '🗺️',
    [JOURNEY_TYPE.CULTURE_ROUTE]: '🛤️',
    [CUSTOMS_TYPE.LOCAL_CUSTOMS]: '🎎',
    [CUSTOMS_TYPE.FESTIVAL]: '🎊',
    [CUSTOMS_TYPE.TRADITION]: '🏮',
    [ACTIVITIES_TYPE.CULTURAL_ACTIVITY]: '🎭',
    [ACTIVITIES_TYPE.HANDICRAFT]: '✂️',
    [ACTIVITIES_TYPE.FOOD_EXPLORE]: '🍳'
  }
  return emojis[subType] || '🌏'
}

// 进入详情
function goToDetail(culture) {
  store.selectCulture(culture)
  uni.navigateTo({
    url: `/pages/world-culture/culture-detail?id=${culture.id}`
  })
}

// 显示统计
function showStatistics() {
  uni.showModal({
    title: '🌍 世界文化探索统计',
    content: `已探索: ${store.statistics.completedCultures}/${store.statistics.totalCultures} 个\n印章收集: ${store.statistics.totalStamps} 个\n完成活动: ${store.statistics.totalActivities} 个\n总积分: ${store.statistics.totalPoints}`,
    showCancel: false
  })
}

// 加载更多
function loadMore() {
  // 可以实现分页加载
}

// 初始化
onMounted(() => {
  store.loadData()
})
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
}

.header {
  padding: 60rpx 30rpx 30rpx;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.header-content {
  flex: 1;
}

.page-title {
  font-size: 40rpx;
  font-weight: bold;
  color: #ffffff;
  display: block;
}

.page-subtitle {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 10rpx;
  display: block;
}

.points-badge {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 30rpx;
  padding: 15rpx 25rpx;
  display: flex;
  align-items: center;
}

.points-icon {
  font-size: 28rpx;
  margin-right: 8rpx;
}

.points-value {
  font-size: 28rpx;
  font-weight: bold;
  color: #FFD700;
}

.stats-overview {
  display: flex;
  padding: 0 30rpx;
  gap: 20rpx;
}

.stat-card {
  flex: 1;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20rpx;
  padding: 25rpx 15rpx;
  text-align: center;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.stat-icon {
  font-size: 36rpx;
  display: block;
}

.stat-value {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-top: 8rpx;
}

.stat-label {
  font-size: 22rpx;
  color: #666;
  display: block;
  margin-top: 5rpx;
}

.tab-bar {
  display: flex;
  padding: 30rpx;
  gap: 15rpx;
}

.tab {
  flex: 1;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20rpx;
  padding: 20rpx 10rpx;
  text-align: center;
  transition: all 0.3s;
}

.tab.active {
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.15);
}

.tab-icon {
  font-size: 36rpx;
  display: block;
}

.tab-text {
  font-size: 24rpx;
  color: #333;
  margin-top: 8rpx;
  display: block;
}

.tab:not(.active) .tab-icon,
.tab:not(.active) .tab-text {
  filter: brightness(0) invert(1);
}

.sub-tab-bar {
  display: flex;
  padding: 0 30rpx 20rpx;
  gap: 15rpx;
  flex-wrap: wrap;
}

.sub-tab {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 30rpx;
  padding: 12rpx 25rpx;
  font-size: 24rpx;
  color: #333;
  transition: all 0.3s;
}

.sub-tab.active {
  background: #FFD700;
  color: #333;
  font-weight: bold;
}

.sub-tab:not(.active) {
  color: #fff;
}

.culture-list {
  height: calc(100vh - 550rpx);
  padding: 0 30rpx;
}

.culture-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 25rpx;
}

.culture-card {
  width: calc(50% - 13rpx);
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.card-cover {
  height: 180rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.cover-emoji {
  font-size: 80rpx;
}

.status-tag {
  position: absolute;
  top: 15rpx;
  right: 15rpx;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 20rpx;
  padding: 6rpx 15rpx;
}

.status-text {
  font-size: 20rpx;
  color: #fff;
}

.stamp-badge {
  position: absolute;
  top: 15rpx;
  left: 15rpx;
  font-size: 36rpx;
}

.card-content {
  padding: 20rpx;
}

.card-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-desc {
  font-size: 22rpx;
  color: #666;
  margin-top: 8rpx;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}

.card-tags {
  display: flex;
  gap: 8rpx;
  margin-top: 12rpx;
  flex-wrap: wrap;
}

.tag {
  font-size: 18rpx;
  background: #f0f0f0;
  color: #666;
  padding: 4rpx 12rpx;
  border-radius: 10rpx;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15rpx;
  padding-top: 15rpx;
  border-top: 1rpx solid #f0f0f0;
}

.difficulty {
  display: flex;
  align-items: center;
  gap: 5rpx;
}

.diff-icon {
  font-size: 24rpx;
}

.diff-text {
  font-size: 20rpx;
  color: #666;
}

.points {
  display: flex;
  align-items: center;
  gap: 5rpx;
}

.points-icon {
  font-size: 24rpx;
}

.points-value {
  font-size: 24rpx;
  font-weight: bold;
  color: #FFD700;
}

.empty-state {
  text-align: center;
  padding: 100rpx 0;
}

.empty-icon {
  font-size: 100rpx;
  display: block;
}

.empty-text {
  font-size: 32rpx;
  color: #fff;
  margin-top: 20rpx;
  display: block;
}

.empty-hint {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 10rpx;
  display: block;
}

.stamps-section {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 30rpx 30rpx 0 0;
  padding: 30rpx;
  margin-top: 20rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 20rpx;
}

.stamps-scroll {
  white-space: nowrap;
}

.stamps-row {
  display: inline-flex;
  gap: 20rpx;
}

.stamp-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 100rpx;
}

.stamp-emoji {
  font-size: 50rpx;
}

.stamp-name {
  font-size: 20rpx;
  color: #666;
  margin-top: 8rpx;
  max-width: 100rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
