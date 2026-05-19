<template>
  <view class="growth-journal-container">
    <!-- 顶部导航 -->
    <view class="header">
      <view class="header-left" @click="goBack">
        <text class="icon">←</text>
      </view>
      <view class="header-title">
        <text>成长日记</text>
      </view>
      <view class="header-right">
        <text class="icon">📝</text>
      </view>
    </view>

    <!-- 统计概览 -->
    <view class="stats-overview">
      <view class="stats-grid">
        <view class="stat-item">
          <text class="stat-value">{{ statistics.reflectionCount || 0 }}</text>
          <text class="stat-label">反思记录</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ statistics.streakDays || 0 }}</text>
          <text class="stat-label">连续天数</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ statistics.milestoneCount || 0 }}</text>
          <text class="stat-label">里程碑</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ statistics.photoCount || 0 }}</text>
          <text class="stat-label">相册照片</text>
        </view>
      </view>
    </view>

    <!-- 功能卡片区 -->
    <view class="section-cards">
      <!-- 每日反思 -->
      <view class="card" @click="goToDailyReflection">
        <view class="card-icon">🌅</view>
        <view class="card-content">
          <text class="card-title">每日反思</text>
          <text class="card-desc">记录今日心情与收获</text>
        </view>
        <text class="card-arrow">→</text>
      </view>

      <!-- 周记月记 -->
      <view class="card" @click="goToReviews">
        <view class="card-icon">📅</view>
        <view class="card-content">
          <text class="card-title">周记月记</text>
          <text class="card-desc">回顾成长历程</text>
        </view>
        <view class="card-badge" v-if="reviewCount > 0">{{ reviewCount }}</view>
        <text class="card-arrow">→</text>
      </view>

      <!-- 成长相册 -->
      <view class="card" @click="goToAlbum">
        <view class="card-icon">📸</view>
        <view class="card-content">
          <text class="card-title">成长相册</text>
          <text class="card-desc">记录珍贵时刻</text>
        </view>
        <text class="card-arrow">→</text>
      </view>

      <!-- 里程碑 -->
      <view class="card" @click="goToMilestones">
        <view class="card-icon">🏆</view>
        <view class="card-content">
          <text class="card-title">里程碑</text>
          <text class="card-desc">记录重要成就</text>
        </view>
        <text class="card-arrow">→</text>
      </view>
    </view>

    <!-- 最近反思 -->
    <view class="recent-section" v-if="recentReflections.length > 0">
      <view class="section-header">
        <text class="section-title">最近反思</text>
        <text class="section-more" @click="goToDailyReflection">查看全部</text>
      </view>
      <view class="reflection-list">
        <view 
          class="reflection-item" 
          v-for="item in recentReflections" 
          :key="item.id"
          @click="goToDailyReflectionDate(item.date)"
        >
          <view class="reflection-date">
            <text class="date-day">{{ formatDay(item.date) }}</text>
            <text class="date-week">{{ formatWeek(item.date) }}</text>
          </view>
          <view class="reflection-content">
            <view class="mood-tag" :style="{ background: getMoodColor(item.mood) }">
              {{ getMoodIcon(item.mood) }}
            </view>
            <text class="reflection-preview">{{ getPreview(item) }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 里程碑时间线 -->
    <view class="timeline-section" v-if="recentMilestones.length > 0">
      <view class="section-header">
        <text class="section-title">里程碑</text>
        <text class="section-more" @click="goToMilestones">查看全部</text>
      </view>
      <view class="timeline">
        <view 
          class="timeline-item" 
          v-for="item in recentMilestones" 
          :key="item.id"
          @click="goToMilestoneDetail(item.id)"
        >
          <view class="timeline-dot" :style="{ background: getMilestoneColor(item.type) }"></view>
          <view class="timeline-content">
            <text class="timeline-title">{{ item.title }}</text>
            <text class="timeline-date">{{ item.date }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useGrowthJournalStore } from '@/stores/growthJournalStore.js'
import growthJournalService, { MOOD_INFO, MILESTONE_INFO } from '@/services/growthJournalService.js'

const growthJournalStore = useGrowthJournalStore()

// 计算属性
const statistics = computed(() => growthJournalStore.statistics)
const recentReflections = computed(() => growthJournalStore.dailyReflections.slice(0, 5))
const recentMilestones = computed(() => growthJournalStore.milestonesTimeline.slice(0, 5))
const reviewCount = computed(() => {
  return growthJournalStore.weeklyReviews.length + growthJournalStore.monthlyReviews.length
})

// 页面加载
onMounted(() => {
  growthJournalStore.init()
})

// 返回
const goBack = () => {
  uni.navigateBack()
}

// 跳转到每日反思
const goToDailyReflection = () => {
  uni.navigateTo({
    url: '/pages/growth-journal/daily-reflection'
  })
}

// 跳转到指定日期的每日反思
const goToDailyReflectionDate = (date) => {
  uni.navigateTo({
    url: `/pages/growth-journal/daily-reflection?date=${date}`
  })
}

// 跳转到周记月记
const goToReviews = () => {
  uni.navigateTo({
    url: '/pages/growth-journal/weekly-review'
  })
}

// 跳转到成长相册
const goToAlbum = () => {
  uni.navigateTo({
    url: '/pages/growth-journal/growth-album'
  })
}

// 跳转到里程碑
const goToMilestones = () => {
  uni.navigateTo({
    url: '/pages/growth-journal/milestone-list'
  })
}

// 跳转到里程碑详情
const goToMilestoneDetail = (id) => {
  uni.navigateTo({
    url: `/pages/growth-journal/milestone-detail?id=${id}`
  })
}

// 格式化日期
const formatDay = (dateStr) => {
  const date = new Date(dateStr)
  return date.getDate()
}

const formatWeek = (dateStr) => {
  const weeks = ['日', '一', '二', '三', '四', '五', '六']
  const date = new Date(dateStr)
  return '周' + weeks[date.getDay()]
}

// 获取心情颜色
const getMoodColor = (mood) => {
  return MOOD_INFO[mood]?.color || '#999'
}

// 获取心情图标
const getMoodIcon = (mood) => {
  return MOOD_INFO[mood]?.icon || '😊'
}

// 获取里程碑颜色
const getMilestoneColor = (type) => {
  return MILESTONE_INFO[type]?.color || '#999'
}

// 获取预览文本
const getPreview = (item) => {
  if (item.harvests && item.harvests.length > 0) {
    return item.harvests[0]
  }
  if (item.content) {
    return item.content.substring(0, 50)
  }
  return '暂无内容'
}
</script>

<style scoped>
.growth-journal-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 20px;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 60px 20px 15px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.header-left .icon,
.header-right .icon {
  font-size: 20px;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
}

.stats-overview {
  background: #fff;
  margin: 15px;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 22px;
  font-weight: 700;
  color: #333;
}

.stat-label {
  display: block;
  font-size: 11px;
  color: #999;
  margin-top: 2px;
}

.section-cards {
  padding: 0 15px;
}

.card {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.card-icon {
  width: 45px;
  height: 45px;
  background: #f0f0f0;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  margin-right: 12px;
}

.card-content {
  flex: 1;
}

.card-title {
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.card-desc {
  display: block;
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}

.card-badge {
  background: #667eea;
  color: #fff;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
  margin-right: 8px;
}

.card-arrow {
  color: #ccc;
  font-size: 16px;
}

.recent-section,
.timeline-section {
  padding: 0 15px;
  margin-top: 15px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.section-more {
  font-size: 12px;
  color: #667eea;
}

.reflection-list {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.reflection-item {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  border-bottom: 1px solid #f0f0f0;
}

.reflection-item:last-child {
  border-bottom: none;
}

.reflection-date {
  width: 45px;
  text-align: center;
  margin-right: 12px;
}

.date-day {
  display: block;
  font-size: 18px;
  font-weight: 700;
  color: #333;
}

.date-week {
  display: block;
  font-size: 11px;
  color: #999;
}

.reflection-content {
  flex: 1;
  display: flex;
  align-items: center;
}

.mood-tag {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 14px;
  margin-right: 10px;
}

.reflection-preview {
  flex: 1;
  font-size: 13px;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.timeline {
  background: #fff;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.timeline-item {
  display: flex;
  align-items: center;
  padding: 8px 0;
}

.timeline-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 12px;
}

.timeline-content {
  flex: 1;
}

.timeline-title {
  display: block;
  font-size: 14px;
  color: #333;
}

.timeline-date {
  display: block;
  font-size: 11px;
  color: #999;
  margin-top: 2px;
}
</style>
