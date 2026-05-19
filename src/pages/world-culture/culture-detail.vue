<!-- V95 Culture Detail 世界文化详情 -->
<template>
  <view class="culture-detail-page" :style="{backgroundColor: coverColor}">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <view class="nav-left" @tap="goBack">
        <text class="nav-icon">←</text>
      </view>
      <text class="nav-title">{{ culture?.name || '文化详情' }}</text>
      <view class="nav-right">
        <text class="nav-icon" @tap="shareCulture">📤</text>
      </view>
    </view>

    <!-- 主内容 -->
    <scroll-view class="content" scroll-y>
      <!-- 封面区域 -->
      <view class="cover-section">
        <text class="cover-emoji">{{ cultureEmoji }}</text>
        <view class="cover-overlay">
          <text class="culture-name">{{ culture?.name }}</text>
          <text class="culture-subtitle">{{ getSubTypeName(culture?.subType) }}</text>
        </view>
      </view>

      <!-- 信息卡片 -->
      <view class="info-card">
        <view class="info-row">
          <view class="info-item">
            <text class="info-icon">⭐</text>
            <text class="info-label">奖励积分</text>
            <text class="info-value">+{{ culture?.points }}</text>
          </view>
          <view class="info-item">
            <text class="info-icon">{{ difficultyIcon }}</text>
            <text class="info-label">难度</text>
            <text class="info-value">{{ difficultyText }}</text>
          </view>
          <view class="info-item">
            <text class="info-icon">🏷️</text>
            <text class="info-label">徽章</text>
            <text class="info-value">{{ culture?.badge }}</text>
          </view>
        </view>

        <!-- 描述 -->
        <view class="description-section">
          <text class="section-title">📖 介绍</text>
          <text class="description-text">{{ culture?.description }}</text>
        </view>

        <!-- 标签 -->
        <view class="tags-section" v-if="culture?.tags?.length">
          <text class="tag" v-for="(tag, idx) in culture.tags" :key="idx">{{ tag }}</text>
        </view>
      </view>

      <!-- 知识卡片 -->
      <view class="knowledge-card">
        <text class="section-title">🔍 知识探索</text>
        <view class="facts-list">
          <view class="fact-item" v-for="(fact, idx) in culture?.facts" :key="idx">
            <view class="fact-icon">
              <text>{{ getFactIcon(idx) }}</text>
            </view>
            <view class="fact-content">
              <text class="fact-title">{{ fact.title }}</text>
              <text class="fact-desc">{{ fact.description }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 体验活动 -->
      <view class="activities-card">
        <text class="section-title">🎯 体验活动</text>
        <view class="activities-list">
          <view 
            class="activity-item"
            v-for="(activity, idx) in culture?.activities"
            :key="idx"
            :class="{completed: isActivityCompleted(activity)}"
            @tap="doActivity(activity)"
          >
            <view class="activity-checkbox">
              <text v-if="isActivityCompleted(activity)">✅</text>
              <text v-else>⬜</text>
            </view>
            <text class="activity-name">{{ activity }}</text>
            <text class="activity-arrow">›</text>
          </view>
        </view>
      </view>

      <!-- 探索按钮 -->
      <view class="action-section">
        <button 
          class="explore-btn" 
          :class="getButtonClass()"
          @tap="handleExplore()"
        >
          <text class="btn-icon">{{ getButtonIcon() }}</text>
          <text class="btn-text">{{ getButtonText() }}</text>
        </button>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useWorldCultureStore } from '@/stores/worldCultureStore.js'
import { 
  CULTURE_TYPE, JOURNEY_TYPE, CUSTOMS_TYPE, ACTIVITIES_TYPE, 
  DIFFICULTY_LEVEL, EXPLORE_STATUS 
} from '@/services/worldCultureService.js'

const store = useWorldCultureStore()

const cultureId = ref('')
const culture = computed(() => store.currentCulture)

const coverColor = computed(() => {
  const subType = culture.value?.subType
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
})

const cultureEmoji = computed(() => {
  const subType = culture.value?.subType
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
})

const difficultyIcon = computed(() => {
  switch (culture.value?.difficulty) {
    case DIFFICULTY_LEVEL.EASY:
      return '🟢'
    case DIFFICULTY_LEVEL.MEDIUM:
      return '🟡'
    case DIFFICULTY_LEVEL.HARD:
      return '🔴'
    default:
      return '🟢'
  }
})

const difficultyText = computed(() => {
  switch (culture.value?.difficulty) {
    case DIFFICULTY_LEVEL.EASY:
      return '简单'
    case DIFFICULTY_LEVEL.MEDIUM:
      return '中等'
    case DIFFICULTY_LEVEL.HARD:
      return '困难'
    default:
      return '简单'
  }
})

function getSubTypeName(subType) {
  const names = {
    [JOURNEY_TYPE.WORLD_TRIP]: '🌐 环球文化之旅',
    [JOURNEY_TYPE.COUNTRY_EXPLORE]: '🗺️ 国家探索',
    [JOURNEY_TYPE.CULTURE_ROUTE]: '🛤️ 文化路线',
    [CUSTOMS_TYPE.LOCAL_CUSTOMS]: '🎎 风土人情',
    [CUSTOMS_TYPE.FESTIVAL]: '🎊 节日庆典',
    [CUSTOMS_TYPE.TRADITION]: '🏮 传统习俗',
    [ACTIVITIES_TYPE.CULTURAL_ACTIVITY]: '🎭 文化体验活动',
    [ACTIVITIES_TYPE.HANDICRAFT]: '✂️ 手工制作',
    [ACTIVITIES_TYPE.FOOD_EXPLORE]: '🍳 美食探索'
  }
  return names[subType] || ''
}

function getFactIcon(idx) {
  const icons = ['📚', '🎓', '🏛️', '🎨', '⚔️', '🌟']
  return icons[idx % icons.length]
}

function isActivityCompleted(activityName) {
  return store.completedActivities.some(
    a => a.cultureId === cultureId.value && a.activityName === activityName
  )
}

function doActivity(activityName) {
  if (isActivityCompleted(activityName)) {
    uni.showToast({ title: '已体验过啦', icon: 'none' })
    return
  }

  uni.showModal({
    title: '🎯 体验活动',
    content: `开始体验 "${activityName}" 吗？`,
    confirmText: '开始',
    cancelText: '取消',
    success: (res) => {
      if (res.confirm) {
        store.completeActivity(cultureId.value, activityName)
        uni.showToast({ title: '活动完成！', icon: 'success' })
      }
    }
  })
}

function getButtonClass() {
  const status = store.getCultureStatus(cultureId.value)
  if (status === EXPLORE_STATUS.COMPLETED) {
    return 'btn-completed'
  }
  if (status === EXPLORE_STATUS.IN_PROGRESS) {
    return 'btn-progress'
  }
  return 'btn-start'
}

function getButtonIcon() {
  const status = store.getCultureStatus(cultureId.value)
  if (status === EXPLORE_STATUS.COMPLETED) {
    return '🎉'
  }
  if (status === EXPLORE_STATUS.IN_PROGRESS) {
    return '🔄'
  }
  return '🚀'
}

function getButtonText() {
  const status = store.getCultureStatus(cultureId.value)
  if (status === EXPLORE_STATUS.COMPLETED) {
    return '已完成探索'
  }
  if (status === EXPLORE_STATUS.IN_PROGRESS) {
    return '继续探索'
  }
  return '开始探索'
}

function handleExplore() {
  const status = store.getCultureStatus(cultureId.value)

  if (status === EXPLORE_STATUS.COMPLETED) {
    uni.showToast({ title: '已探索完成', icon: 'none' })
    return
  }

  if (status === EXPLORE_STATUS.IN_PROGRESS) {
    // 完成探索
    store.completeExploration(cultureId.value)
    uni.showModal({
      title: '🎊 探索完成',
      content: `恭喜完成 "${culture.value?.name}" 探索！\n获得 ${culture.value?.points} 积分\n获得 "${culture.value?.badge}" 徽章`,
      showCancel: false,
      confirmText: '太棒了'
    })
    return
  }

  // 开始探索
  store.startExploration(cultureId.value)
  uni.showToast({ title: '开始探索！', icon: 'success' })
}

function goBack() {
  uni.navigateBack()
}

function shareCulture() {
  uni.showShareMenu({
    withShareTicket: true,
    menus: ['shareAppMessage', 'shareTimeline']
  })
}

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = currentPage.options || {}
  
  cultureId.value = options.id || ''
  
  if (cultureId.value) {
    // 加载数据
    store.loadData()
    // 设置当前文化
    const found = store.cultures.find(c => c.id === cultureId.value)
    if (found) {
      store.selectCulture(found)
    }
  }
})
</script>

<style scoped>
.culture-detail-page {
  min-height: 100vh;
}

.nav-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 60rpx 30rpx 20rpx;
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-left, .nav-right {
  width: 80rpx;
  height: 80rpx;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-icon {
  font-size: 36rpx;
}

.nav-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  max-width: 400rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.content {
  height: calc(100vh - 160rpx);
}

.cover-section {
  height: 400rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}

.cover-emoji {
  font-size: 150rpx;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  opacity: 0.3;
}

.cover-overlay {
  position: relative;
  z-index: 1;
  text-align: center;
}

.culture-name {
  font-size: 48rpx;
  font-weight: bold;
  color: #333;
  display: block;
}

.culture-subtitle {
  font-size: 28rpx;
  color: #666;
  margin-top: 10rpx;
  display: block;
}

.info-card {
  background: #fff;
  border-radius: 40rpx 40rpx 0 0;
  padding: 40rpx 30rpx;
  margin-top: -30rpx;
}

.info-row {
  display: flex;
  justify-content: space-around;
  margin-bottom: 30rpx;
}

.info-item {
  text-align: center;
}

.info-icon {
  font-size: 40rpx;
  display: block;
}

.info-label {
  font-size: 22rpx;
  color: #999;
  display: block;
  margin-top: 8rpx;
}

.info-value {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-top: 5rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 20rpx;
}

.description-section {
  margin-bottom: 30rpx;
}

.description-text {
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
  display: block;
}

.tags-section {
  display: flex;
  flex-wrap: wrap;
  gap: 15rpx;
}

.tag {
  font-size: 24rpx;
  background: #f0f0f0;
  color: #666;
  padding: 10rpx 20rpx;
  border-radius: 20rpx;
}

.knowledge-card {
  background: #fff;
  padding: 30rpx;
  margin-top: 20rpx;
}

.facts-list {
  display: flex;
  flex-direction: column;
  gap: 25rpx;
}

.fact-item {
  display: flex;
  gap: 20rpx;
}

.fact-icon {
  width: 80rpx;
  height: 80rpx;
  background: #f5f5f5;
  border-radius: 20rpx;
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

.fact-desc {
  font-size: 24rpx;
  color: #666;
  margin-top: 8rpx;
  display: block;
  line-height: 1.4;
}

.activities-card {
  background: #fff;
  padding: 30rpx;
  margin-top: 20rpx;
}

.activities-list {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 25rpx;
  background: #f8f8f8;
  border-radius: 20rpx;
  transition: all 0.3s;
}

.activity-item.completed {
  background: #E8F5E9;
}

.activity-checkbox {
  font-size: 36rpx;
}

.activity-name {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}

.activity-arrow {
  font-size: 36rpx;
  color: #999;
}

.action-section {
  padding: 40rpx 30rpx;
}

.explore-btn {
  width: 100%;
  height: 100rpx;
  border-radius: 50rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15rpx;
  border: none;
}

.explore-btn.btn-start {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.explore-btn.btn-progress {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.explore-btn.btn-completed {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
}

.btn-icon {
  font-size: 40rpx;
}

.btn-text {
  font-size: 32rpx;
  font-weight: bold;
  color: #fff;
}
</style>
