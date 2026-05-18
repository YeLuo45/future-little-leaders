<!--
  V22 多儿童家庭管理页面
  支持多儿童家庭的统一管理视图
-->
<template>
  <view class="page-container">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <text class="nav-title">多儿童家庭</text>
      <view class="nav-actions">
        <view class="nav-btn" @tap="goToSiblingRace" hover-class="hover">
          <text>🏆 竞赛</text>
        </view>
      </view>
    </view>

    <!-- 儿童切换器 -->
    <view class="children-switcher">
      <scroll-view scroll-x class="switcher-scroll">
        <view class="switcher-content">
          <view
            v-for="child in children"
            :key="child.id"
            class="switcher-item"
            :class="{ active: child.id === selectedChildId }"
            @tap="onSelectChild(child.id)"
          >
            <text class="switcher-avatar">{{ child.avatar || '👶' }}</text>
            <text class="switcher-name">{{ child.name }}</text>
            <view v-if="child.rank <= 3" class="switcher-rank">
              {{ child.rank === 1 ? '🥇' : child.rank === 2 ? '🥈' : '🥉' }}
            </view>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 当前儿童详情卡片 -->
    <view class="current-child-card" v-if="selectedChild">
      <view class="current-child-header">
        <text class="current-avatar">{{ selectedChild.avatar || '👶' }}</text>
        <view class="current-info">
          <text class="current-name">{{ selectedChild.name }}</text>
          <text class="current-age">{{ selectedChild.age || '年龄未知' }}</text>
        </view>
        <view class="current-points">
          <text class="points-value">{{ selectedChild.points }}</text>
          <text class="points-label">积分</text>
        </view>
      </view>
      <view class="current-child-stats">
        <view class="stat-item">
          <text class="stat-value">{{ selectedChild.rank }}</text>
          <text class="stat-label">排名</text>
        </view>
        <view class="stat-divider"></view>
        <view class="stat-item">
          <text class="stat-value">{{ getChildCompetitionsCount(selectedChild.id) }}</text>
          <text class="stat-label">参赛</text>
        </view>
        <view class="stat-divider"></view>
        <view class="stat-item">
          <text class="stat-value">{{ getChildWinRate(selectedChild.id) }}%</text>
          <text class="stat-label">胜率</text>
        </view>
      </view>
    </view>

    <!-- 跨儿童积分排名 -->
    <view class="section ranking-section">
      <text class="section-title">🏅 跨儿童积分排名</text>
      <view class="ranking-list">
        <view
          v-for="child in childrenRanking"
          :key="child.id"
          class="ranking-item"
          :class="{ 'is-me': child.id === selectedChildId }"
          @tap="onSelectChild(child.id)"
        >
          <view class="rank-badge" :class="'rank-' + child.rank">
            <text v-if="child.rank <= 3">{{ child.rank === 1 ? '🥇' : child.rank === 2 ? '🥈' : '🥉' }}</text>
            <text v-else>{{ child.rank }}</text>
          </view>
          <text class="rank-avatar">{{ child.avatar || '👶' }}</text>
          <view class="rank-info">
            <text class="rank-name">{{ child.name }}</text>
            <text class="rank-badge-text">{{ child.rank === 1 ? '第一名' : child.rank === 2 ? '第二名' : child.rank === 3 ? '第三名' : '' }}</text>
          </view>
          <view class="rank-points">
            <text class="points-num">{{ child.points }}</text>
            <text class="points-unit">积分</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 家庭积分池 -->
    <view class="section">
      <text class="section-title">🏦 家庭积分池</text>
      <FamilyPointsPool />
    </view>

    <!-- 家庭成就对比入口 -->
    <view class="section">
      <text class="section-title">📊 家庭成就对比</text>
      <FamilyComparison />
    </view>
  </view>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useFamilyStore } from '@/stores/familyStore.js'
import { useBabyStore } from '@/stores/babyStore.js'
import { usePointsStore } from '@/stores/pointsStore.js'
import FamilyPointsPool from '@/components/family/FamilyPointsPool.vue'
import FamilyComparison from '@/components/family/FamilyComparison.vue'

const familyStore = useFamilyStore()
const babyStore = useBabyStore()
const pointsStore = usePointsStore()

// 儿童列表
const children = computed(() => familyStore.children)

// 当前选中的儿童
const selectedChildId = computed(() => familyStore.selectedChildId)
const selectedChild = computed(() => familyStore.selectedChild)

// 积分排名
const childrenRanking = computed(() => familyStore.childrenRanking)

// 初始化
onMounted(() => {
  babyStore.init()
  pointsStore.init()
  familyStore.init()
})

// 选择儿童
const onSelectChild = (childId) => {
  familyStore.selectChild(childId)
}

// 获取儿童竞赛次数
const getChildCompetitionsCount = (childId) => {
  return familyStore.getChildCompetitionHistory(childId).length
}

// 获取儿童胜率
const getChildWinRate = (childId) => {
  return familyStore.getChildWinRate(childId)
}

// 跳转到兄弟姐妹竞赛页面
const goToSiblingRace = () => {
  uni.navigateTo({
    url: '/pages/family/sibling-race'
  })
}
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background: #F3F4F6;
  padding-bottom: 40rpx;
}

.nav-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 32rpx;
  background: linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%);
}

.nav-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #ffffff;
}

.nav-actions {
  display: flex;
  gap: 16rpx;
}

.nav-btn {
  padding: 12rpx 24rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12rpx;
}

.nav-btn text {
  font-size: 26rpx;
  color: #ffffff;
}

.hover {
  opacity: 0.8;
}

/* 儿童切换器 */
.children-switcher {
  background: #ffffff;
  padding: 16rpx 0;
  margin-bottom: 16rpx;
}

.switcher-scroll {
  width: 100%;
  white-space: nowrap;
}

.switcher-content {
  display: inline-flex;
  padding: 0 16rpx;
  gap: 16rpx;
}

.switcher-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16rpx 24rpx;
  border-radius: 16rpx;
  background: #F9FAFB;
  position: relative;
  min-width: 140rpx;
}

.switcher-item.active {
  background: linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%);
}

.switcher-avatar {
  font-size: 56rpx;
  margin-bottom: 8rpx;
}

.switcher-name {
  font-size: 26rpx;
  color: #1F2937;
  font-weight: 500;
}

.switcher-item.active .switcher-name {
  color: #ffffff;
}

.switcher-rank {
  position: absolute;
  top: -8rpx;
  right: -8rpx;
  font-size: 24rpx;
}

/* 当前儿童卡片 */
.current-child-card {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 32rpx;
  margin: 0 16rpx 16rpx;
}

.current-child-header {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
}

.current-avatar {
  font-size: 80rpx;
  margin-right: 24rpx;
}

.current-info {
  flex: 1;
}

.current-name {
  font-size: 36rpx;
  font-weight: 600;
  color: #1F2937;
  display: block;
  margin-bottom: 8rpx;
}

.current-age {
  font-size: 26rpx;
  color: #6B7280;
}

.current-points {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.points-value {
  font-size: 48rpx;
  font-weight: 700;
  color: #8B5CF6;
}

.points-label {
  font-size: 22rpx;
  color: #6B7280;
}

.current-child-stats {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20rpx;
  background: #F9FAFB;
  border-radius: 16rpx;
}

.stat-item {
  flex: 1;
  text-align: center;
}

.stat-value {
  font-size: 36rpx;
  font-weight: 700;
  color: #1F2937;
  display: block;
}

.stat-label {
  font-size: 24rpx;
  color: #6B7280;
}

.stat-divider {
  width: 1rpx;
  height: 60rpx;
  background: #E5E7EB;
}

/* 通用区块 */
.section {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 24rpx;
  margin: 0 16rpx 16rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #1F2937;
  margin-bottom: 20rpx;
  display: block;
}

/* 排名列表 */
.ranking-section {
  margin-top: 0;
}

.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.ranking-item {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background: #F9FAFB;
  border-radius: 16rpx;
  transition: all 0.2s;
}

.ranking-item.is-me {
  background: linear-gradient(135deg, #EDE9FE 0%, #DDD6FE 100%);
  border: 2rpx solid #8B5CF6;
}

.rank-badge {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12rpx;
  margin-right: 16rpx;
  font-size: 28rpx;
}

.rank-badge.rank-1 {
  background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);
}

.rank-badge.rank-2 {
  background: linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%);
}

.rank-badge.rank-3 {
  background: linear-gradient(135deg, #FED7AA 0%, #FDBA74 100%);
}

.rank-avatar {
  font-size: 48rpx;
  margin-right: 16rpx;
}

.rank-info {
  flex: 1;
}

.rank-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #1F2937;
  display: block;
  margin-bottom: 4rpx;
}

.rank-badge-text {
  font-size: 22rpx;
  color: #8B5CF6;
}

.rank-points {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.points-num {
  font-size: 32rpx;
  font-weight: 700;
  color: #8B5CF6;
}

.points-unit {
  font-size: 20rpx;
  color: #6B7280;
}
</style>
