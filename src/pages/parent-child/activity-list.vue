<template>
  <view class="activity-list-page">
    <!-- 顶部导航 -->
    <view class="nav-header">
      <view class="back-btn" @click="goBack">
        <text class="icon">←</text>
      </view>
      <text class="nav-title">亲子活动</text>
      <view class="right-btn" @click="showFilter = !showFilter">
        <text class="icon">🔍</text>
      </view>
    </view>

    <!-- 筛选面板 -->
    <view v-if="showFilter" class="filter-panel">
      <view class="filter-section">
        <text class="filter-label">活动类型</text>
        <view class="filter-chips">
          <view 
            v-for="type in activityStore.activityTypes" 
            :key="type.id"
            :class="['chip', { active: filters.type === type.id }]"
            @click="toggleTypeFilter(type.id)"
          >
            <text>{{ type.icon }} {{ type.name }}</text>
          </view>
        </view>
      </view>

      <view class="filter-section">
        <text class="filter-label">年龄段</text>
        <view class="filter-chips">
          <view 
            v-for="group in activityStore.ageGroups" 
            :key="group.id"
            :class="['chip', { active: filters.ageGroup === group.id }]"
            @click="toggleAgeFilter(group.id)"
          >
            <text>{{ group.name }}</text>
          </view>
        </view>
      </view>

      <view class="filter-actions">
        <view class="btn secondary" @click="clearFilters">
          <text>清除筛选</text>
        </view>
        <view class="btn primary" @click="applyFilters">
          <text>应用筛选</text>
        </view>
      </view>
    </view>

    <!-- 活动分类Tab -->
    <view class="category-tabs">
      <view 
        v-for="type in activityStore.activityTypes" 
        :key="type.id"
        :class="['tab', { active: filters.type === type.id }]"
        :style="{ '--tab-color': type.color }"
        @click="quickFilter(type.id)"
      >
        <text class="tab-icon">{{ type.icon }}</text>
        <text class="tab-name">{{ type.name }}</text>
      </view>
    </view>

    <!-- 活动列表 -->
    <scroll-view class="activity-scroll" scroll-y>
      <view class="activity-grid">
        <view 
          v-for="activity in activityStore.filteredActivities" 
          :key="activity.id"
          class="activity-card"
          @click="goToDetail(activity.id)"
        >
          <view class="card-image" :style="{ backgroundColor: getTypeColor(activity.type) }">
            <text class="card-icon">{{ getTypeIcon(activity.type) }}</text>
          </view>
          <view class="card-content">
            <text class="card-title">{{ activity.title }}</text>
            <text class="card-desc">{{ activity.description }}</text>
            <view class="card-meta">
              <text class="meta-item">{{ getAgeLabel(activity.ageGroup) }}</text>
              <text class="meta-item">{{ activity.duration }}分钟</text>
              <text class="meta-item">+{{ activity.points }}积分</text>
            </view>
          </view>
        </view>
      </view>

      <view v-if="activityStore.filteredActivities.length === 0" class="empty-state">
        <text class="empty-icon">🎨</text>
        <text class="empty-text">暂无相关活动</text>
        <text class="empty-hint">试试调整筛选条件</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useActivityStore } from '@/stores/activityStore.js'
import { ACTIVITY_TYPES, AGE_GROUPS } from '@/services/activityService.js'

const activityStore = useActivityStore()
const showFilter = ref(false)
const filters = reactive({
  type: '',
  ageGroup: '',
  difficulty: '',
  keyword: ''
})

onMounted(() => {
  activityStore.loadActivities()
})

const goBack = () => {
  uni.navigateBack()
}

const getTypeIcon = (type) => {
  const t = ACTIVITY_TYPES[type]
  return t ? t.icon : '🎯'
}

const getTypeColor = (type) => {
  const t = ACTIVITY_TYPES[type]
  return t ? t.color : '#888'
}

const getAgeLabel = (ageGroup) => {
  const g = AGE_GROUPS[ageGroup]
  return g ? g.name : ageGroup
}

const toggleTypeFilter = (typeId) => {
  filters.type = filters.type === typeId ? '' : typeId
}

const toggleAgeFilter = (ageId) => {
  filters.ageGroup = filters.ageGroup === ageId ? '' : ageId
}

const clearFilters = () => {
  filters.type = ''
  filters.ageGroup = ''
  filters.difficulty = ''
  filters.keyword = ''
  activityStore.clearFilters()
}

const applyFilters = () => {
  activityStore.setFilters(filters)
  showFilter.value = false
}

const quickFilter = (typeId) => {
  filters.type = typeId
  activityStore.setFilters(filters)
}

const goToDetail = (id) => {
  uni.navigateTo({
    url: `/pages/parent-child/activity-detail?id=${id}`
  })
}
</script>

<style scoped>
.activity-list-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.nav-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 30rpx;
  background: #fff;
  position: sticky;
  top: 0;
  z-index: 100;
}

.back-btn, .right-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
  border-radius: 50%;
}

.nav-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #333;
}

.icon {
  font-size: 32rpx;
}

.filter-panel {
  background: #fff;
  padding: 30rpx;
  border-bottom: 1rpx solid #eee;
}

.filter-section {
  margin-bottom: 30rpx;
}

.filter-label {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 20rpx;
  display: block;
}

.filter-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.chip {
  padding: 16rpx 28rpx;
  background: #f5f5f5;
  border-radius: 30rpx;
  font-size: 26rpx;
  color: #666;
}

.chip.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.filter-actions {
  display: flex;
  gap: 20rpx;
  margin-top: 30rpx;
}

.btn {
  flex: 1;
  padding: 24rpx;
  border-radius: 12rpx;
  text-align: center;
  font-size: 28rpx;
}

.btn.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.btn.secondary {
  background: #f5f5f5;
  color: #666;
}

.category-tabs {
  display: flex;
  padding: 20rpx 20rpx;
  background: #fff;
  gap: 10rpx;
  overflow-x: auto;
}

.tab {
  flex: 1;
  min-width: 140rpx;
  padding: 20rpx 16rpx;
  background: #f5f5f5;
  border-radius: 16rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.tab.active {
  background: var(--tab-color);
}

.tab-icon {
  font-size: 36rpx;
}

.tab-name {
  font-size: 22rpx;
  color: #333;
}

.tab.active .tab-name {
  color: #fff;
}

.activity-scroll {
  height: calc(100vh - 300rpx);
  padding: 20rpx;
}

.activity-grid {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.activity-card {
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.08);
}

.card-image {
  height: 200rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-icon {
  font-size: 80rpx;
}

.card-content {
  padding: 24rpx;
}

.card-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 12rpx;
  display: block;
}

.card-desc {
  font-size: 26rpx;
  color: #666;
  line-height: 1.5;
  display: block;
  margin-bottom: 16rpx;
}

.card-meta {
  display: flex;
  gap: 16rpx;
  flex-wrap: wrap;
}

.meta-item {
  font-size: 22rpx;
  color: #999;
  background: #f5f5f5;
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 100rpx 0;
}

.empty-icon {
  font-size: 100rpx;
  margin-bottom: 30rpx;
}

.empty-text {
  font-size: 32rpx;
  color: #666;
  margin-bottom: 16rpx;
}

.empty-hint {
  font-size: 26rpx;
  color: #999;
}
</style>
