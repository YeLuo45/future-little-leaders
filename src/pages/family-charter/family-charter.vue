<template>
  <view class="family-charter-container">
    <!-- 顶部导航 -->
    <view class="header">
      <view class="header-left" @click="goBack">
        <text class="icon">←</text>
      </view>
      <view class="header-title">
        <text>家庭宪章</text>
      </view>
      <view class="header-right" @click="showConfig">
        <text class="icon">⚙️</text>
      </view>
    </view>

    <!-- 功能卡片区 -->
    <view class="section-cards">
      <!-- 家庭价值观 -->
      <view class="card" @click="goToValues">
        <view class="card-icon">💎</view>
        <view class="card-content">
          <text class="card-title">家庭价值观</text>
          <text class="card-desc">共创家庭核心价值</text>
        </view>
        <view class="card-badge" v-if="stats.valuesCount > 0">{{ stats.valuesCount }}</view>
        <text class="card-arrow">→</text>
      </view>

      <!-- 家规 -->
      <view class="card" @click="goToRules">
        <view class="card-icon">📜</view>
        <view class="card-content">
          <text class="card-title">家规</text>
          <text class="card-desc">共同制定家庭规则</text>
        </view>
        <view class="card-badge" v-if="stats.rulesCount > 0">{{ stats.rulesCount }}</view>
        <text class="card-arrow">→</text>
      </view>

      <!-- 家庭会议 -->
      <view class="card" @click="goToMeetings">
        <view class="card-icon">👨‍👩‍👧</view>
        <view class="card-content">
          <text class="card-title">家庭会议</text>
          <text class="card-desc">定期召开家庭会议</text>
        </view>
        <view class="card-badge badge-warning" v-if="upcomingCount > 0">{{ upcomingCount }}</view>
        <text class="card-arrow">→</text>
      </view>

      <!-- 冲突解决 -->
      <view class="card" @click="goToConflicts">
        <view class="card-icon">🤝</view>
        <view class="card-content">
          <text class="card-title">冲突解决</text>
          <text class="card-desc">公正解决家庭矛盾</text>
        </view>
        <view class="card-badge badge-danger" v-if="activeConflictsCount > 0">{{ activeConflictsCount }}</view>
        <text class="card-arrow">→</text>
      </view>
    </view>

    <!-- 统计概览 -->
    <view class="stats-overview">
      <view class="stats-title">宪章概览</view>
      <view class="stats-grid">
        <view class="stat-item">
          <text class="stat-value">{{ stats.valuesCount }}</text>
          <text class="stat-label">价值观</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ stats.rulesCount }}</text>
          <text class="stat-label">家规</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ stats.finishedMeetingsCount }}</text>
          <text class="stat-label">已完成会议</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ stats.totalValueVotes }}</text>
          <text class="stat-label">总投票数</text>
        </view>
      </view>
    </view>

    <!-- 即将到来的会议 -->
    <view class="section" v-if="upcomingMeetings.length > 0">
      <view class="section-header">
        <text class="section-title">即将到来的会议</text>
        <text class="section-more" @click="goToMeetings">查看全部 →</text>
      </view>
      <view class="meeting-list">
        <view class="meeting-item" v-for="meeting in upcomingMeetings.slice(0, 2)" :key="meeting.id" @click="viewMeeting(meeting)">
          <view class="meeting-info">
            <text class="meeting-title">{{ meeting.title }}</text>
            <text class="meeting-time">{{ formatTime(meeting.scheduledTime) }}</text>
          </view>
          <view class="meeting-participants">
            <text class="participant-count">{{ meeting.participantIds?.length || 0 }}人</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 热门价值观 -->
    <view class="section" v-if="topValues.length > 0">
      <view class="section-header">
        <text class="section-title">热门价值观</text>
        <text class="section-more" @click="goToValues">全部 →</text>
      </view>
      <view class="values-tags">
        <view class="value-tag" v-for="value in topValues" :key="value.id">
          <text>{{ value.text }}</text>
          <text class="vote-count">♥ {{ value.votes }}</text>
        </view>
      </view>
    </view>

    <!-- 热门家规 -->
    <view class="section" v-if="topRules.length > 0">
      <view class="section-header">
        <text class="section-title">家规一览</text>
        <text class="section-more" @click="goToRules">全部 →</text>
      </view>
      <view class="rules-list">
        <view class="rule-item" v-for="rule in topRules.slice(0, 3)" :key="rule.id">
          <text class="rule-icon">{{ getRuleIcon(rule.category) }}</text>
          <text class="rule-text">{{ rule.text }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useFamilyCharterStore } from '@/stores/familyCharterStore.js'
import { VALUE_CATEGORY_INFO } from '@/services/familyCharterService.js'
import { RULE_CATEGORY_INFO } from '@/services/familyCharterService.js'

const familyCharterStore = useFamilyCharterStore()

// 统计数据
const stats = computed(() => familyCharterStore.statistics)
const upcomingMeetings = computed(() => familyCharterStore.upcomingMeetings)
const activeConflictsCount = computed(() => familyCharterStore.activeConflicts.length)
const upcomingCount = computed(() => familyCharterStore.upcomingMeetings.length)

// 热门价值观（按投票排序）
const topValues = computed(() => {
  return [...familyCharterStore.activeValues]
    .sort((a, b) => b.votes - a.votes)
    .slice(0, 5)
})

// 家规
const topRules = computed(() => familyCharterStore.activeRules)

// 页面加载
onMounted(() => {
  familyCharterStore.init()
})

// 返回
const goBack = () => {
  uni.navigateBack()
}

// 跳转到价值观页面
const goToValues = () => {
  uni.navigateTo({
    url: '/pages/family-charter/values'
  })
}

// 跳转到家规页面
const goToRules = () => {
  uni.navigateTo({
    url: '/pages/family-charter/rules'
  })
}

// 跳转到家庭会议页面
const goToMeetings = () => {
  uni.navigateTo({
    url: '/pages/family-charter/meetings'
  })
}

// 跳转到冲突解决页面
const goToConflicts = () => {
  uni.navigateTo({
    url: '/pages/family-charter/conflicts'
  })
}

// 查看会议详情
const viewMeeting = (meeting) => {
  familyCharterStore.selectMeeting(meeting)
  uni.navigateTo({
    url: '/pages/family-charter/meeting-detail?meetingId=' + meeting.id
  })
}

// 显示配置
const showConfig = () => {
  uni.navigateTo({
    url: '/pages/family-charter/config'
  })
}

// 格式化时间
const formatTime = (timeStr) => {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes().toString().padStart(2, '0')
  return `${month}月${day}日 ${hour}:${minute}`
}

// 获取规则图标
const getRuleIcon = (category) => {
  return RULE_CATEGORY_INFO[category]?.icon || '📜'
}
</script>

<style scoped>
.family-charter-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 20px;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 44px 16px 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.header-left, .header-right {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
}

.icon {
  font-size: 20px;
}

.section-cards {
  padding: 16px;
  margin-top: -20px;
}

.card {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  position: relative;
}

.card-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-right: 12px;
}

.card-content {
  flex: 1;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  display: block;
}

.card-desc {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
  display: block;
}

.card-badge {
  background: #667eea;
  color: #fff;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
  margin-right: 8px;
}

.card-badge.badge-warning {
  background: #fa8c16;
}

.card-badge.badge-danger {
  background: #f5222d;
}

.card-arrow {
  color: #ccc;
  font-size: 14px;
}

.stats-overview {
  margin: 0 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 16px;
  color: #fff;
}

.stats-title {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 12px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  display: block;
}

.stat-label {
  font-size: 10px;
  opacity: 0.8;
}

.section {
  margin: 20px 16px 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
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

.meeting-list {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
}

.meeting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.meeting-item:last-child {
  border-bottom: none;
}

.meeting-title {
  font-size: 14px;
  color: #333;
  display: block;
}

.meeting-time {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
  display: block;
}

.participant-count {
  font-size: 12px;
  color: #667eea;
  background: rgba(102, 126, 234, 0.1);
  padding: 2px 8px;
  border-radius: 8px;
}

.values-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.value-tag {
  display: flex;
  align-items: center;
  background: #fff;
  padding: 8px 12px;
  border-radius: 20px;
  font-size: 14px;
  color: #333;
}

.vote-count {
  margin-left: 6px;
  color: #eb2f96;
  font-size: 12px;
}

.rules-list {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
}

.rule-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.rule-item:last-child {
  border-bottom: none;
}

.rule-icon {
  font-size: 18px;
  margin-right: 10px;
}

.rule-text {
  font-size: 14px;
  color: #333;
}
</style>
