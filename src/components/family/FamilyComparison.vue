<!--
  家庭成就对比组件
  展示家庭内儿童的能力雷达图对比、里程碑对比等
-->
<template>
  <view class="family-comparison">
    <!-- 头部 -->
    <view class="comparison-header">
      <text class="header-title">📊 家庭成就对比</text>
      <view class="header-btn" @tap="onGenerateReport" hover-class="hover">
        <text>生成报告</text>
      </view>
    </view>

    <!-- 积分排名 -->
    <view class="section ranking-section">
      <text class="section-title">积分排名</text>
      <view class="ranking-list">
        <view
          v-for="child in childrenRanking"
          :key="child.id"
          class="ranking-item"
        >
          <view class="rank-badge" :class="'rank-' + child.rank">
            <text v-if="child.rank <= 3">{{ child.rank === 1 ? '🥇' : child.rank === 2 ? '🥈' : '🥉' }}</text>
            <text v-else>{{ child.rank }}</text>
          </view>
          <text class="rank-avatar">{{ child.avatar || '👶' }}</text>
          <text class="rank-name">{{ child.name }}</text>
          <view class="rank-points">
            <text class="points-value">{{ child.points }}</text>
            <text class="points-label">积分</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 能力雷达图对比 -->
    <view class="section radar-section">
      <text class="section-title">能力雷达图对比</text>
      <view class="radar-chart">
        <view class="radar-canvas-placeholder">
          <!-- 简化的雷达图展示 -->
          <view class="skills-grid">
            <view
              v-for="(skill, index) in skills"
              :key="index"
              class="skill-item"
            >
              <view class="skill-bars">
                <view
                  v-for="child in children"
                  :key="child.id"
                  class="skill-bar-wrapper"
                >
                  <view
                    class="skill-bar"
                    :style="{
                      height: getSkillBarHeight(radarData[child.id]?.values[index]) + 'rpx',
                      backgroundColor: getChildColor(child.id)
                    }"
                  ></view>
                  <text class="skill-bar-label">{{ child.name }}</text>
                </view>
              </view>
              <text class="skill-name">{{ skill }}</text>
            </view>
          </view>
        </view>
        <!-- 图例 -->
        <view class="radar-legend">
          <view
            v-for="child in children"
            :key="child.id"
            class="legend-item"
          >
            <view class="legend-color" :style="{ backgroundColor: getChildColor(child.id) }"></view>
            <text class="legend-name">{{ child.name }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 里程碑对比 -->
    <view class="section milestone-section">
      <text class="section-title">里程碑达成对比</text>
      <view class="milestone-grid">
        <view
          v-for="milestone in milestones"
          :key="milestone.id"
          class="milestone-card"
        >
          <text class="milestone-icon">{{ milestone.icon }}</text>
          <text class="milestone-name">{{ milestone.name }}</text>
          <view class="milestone-achievers">
            <view
              v-for="child in children"
              :key="child.id"
              class="achiever"
              :class="{ achieved: isMilestoneAchieved(child.id, milestone.id) }"
            >
              <text class="achiever-avatar">{{ child.avatar || '👶' }}</text>
              <view v-if="isMilestoneAchieved(child.id, milestone.id)" class="achiever-check">✓</view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 竞赛统计 -->
    <view class="section competition-stats-section">
      <text class="section-title">竞赛统计</text>
      <view class="competition-stats-grid">
        <view
          v-for="child in children"
          :key="child.id"
          class="stat-card"
        >
          <text class="stat-avatar">{{ child.avatar || '👶' }}</text>
          <text class="stat-name">{{ child.name }}</text>
          <view class="stat-row">
            <text class="stat-label">参赛次数</text>
            <text class="stat-value">{{ getChildCompetitionsCount(child.id) }}</text>
          </view>
          <view class="stat-row">
            <text class="stat-label">获胜次数</text>
            <text class="stat-value">{{ getChildWinsCount(child.id) }}</text>
          </view>
          <view class="stat-row">
            <text class="stat-label">胜率</text>
            <text class="stat-value win-rate">{{ getChildWinRate(child.id) }}%</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 周报/对比报告弹窗 -->
    <uni-popup ref="reportPopup" type="center">
      <view class="popup-content report-popup">
        <text class="popup-title">📋 家庭对比报告</text>
        <text class="report-time">生成时间: {{ formatReportTime(report.generatedAt) }}</text>

        <scroll-view scroll-y class="report-content">
          <!-- 概览 -->
          <view class="report-section">
            <text class="report-section-title">📊 概览</text>
            <view class="overview-grid">
              <view class="overview-item">
                <text class="overview-value">{{ children.length }}</text>
                <text class="overview-label">家庭儿童</text>
              </view>
              <view class="overview-item">
                <text class="overview-value">{{ report.familyTotalPoints }}</text>
                <text class="overview-label">家庭总积分</text>
              </view>
              <view class="overview-item">
                <text class="overview-value">{{ report.poolBalance }}</text>
                <text class="overview-label">积分池余额</text>
              </view>
            </view>
          </view>

          <!-- 积分排名 -->
          <view class="report-section">
            <text class="report-section-title">🏆 积分排名</text>
            <view
              v-for="childSummary in report.childrenSummary"
              :key="childSummary.id"
              class="report-child-row"
            >
              <text class="report-child-rank">{{ childSummary.rank }}</text>
              <text class="report-child-avatar">{{ getChildAvatar(childSummary.id) }}</text>
              <text class="report-child-name">{{ childSummary.name }}</text>
              <text class="report-child-points">{{ childSummary.points }}分</text>
            </view>
          </view>

          <!-- 竞赛统计 -->
          <view class="report-section">
            <text class="report-section-title">🏅 竞赛统计</text>
            <view
              v-for="childSummary in report.childrenSummary"
              :key="childSummary.id"
              class="report-competition-row"
            >
              <text class="report-child-avatar">{{ getChildAvatar(childSummary.id) }}</text>
              <text class="report-child-name">{{ childSummary.name }}</text>
              <view class="report-competition-stats">
                <text>参赛: {{ childSummary.competitionsJoined }}</text>
                <text>获胜: {{ childSummary.competitionsWon }}</text>
                <text>胜率: {{ childSummary.winRate }}%</text>
              </view>
            </view>
          </view>
        </scroll-view>

        <view class="popup-actions">
          <view class="popup-btn close" @tap="closeReportPopup">
            <text>关闭</text>
          </view>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useFamilyStore } from '@/stores/familyStore.js'

const familyStore = useFamilyStore()

// 儿童列表
const children = computed(() => familyStore.children)

// 积分排名
const childrenRanking = computed(() => familyStore.childrenRanking)

// 能力雷达图数据
const skills = ['学习', '运动', '艺术', '社交', '自理']
const radarData = computed(() => {
  const result = familyStore.getFamilyRadarData()
  return result.data
})

// 里程碑数据
const milestones = computed(() => {
  const result = familyStore.getFamilyMilestoneComparison()
  return result.milestones
})

const milestoneComparison = computed(() => {
  const result = familyStore.getFamilyMilestoneComparison()
  return result.comparison
})

// 儿童颜色映射
const childColors = ['#8B5CF6', '#06B6D4', '#F59E0B', '#10B981', '#EC4899']
const getChildColor = (childId) => {
  const index = children.value.findIndex(c => c.id === childId)
  return childColors[index % childColors.length]
}

// 获取技能条高度
const getSkillBarHeight = (value) => {
  if (!value) return 0
  return Math.max(20, Math.min(120, value * 1.2))
}

// 检查里程碑是否达成
const isMilestoneAchieved = (childId, milestoneId) => {
  const comparison = milestoneComparison.value[childId]
  if (!comparison) return false
  return comparison.achievements.includes(milestoneId)
}

// 获取儿童竞赛次数
const getChildCompetitionsCount = (childId) => {
  return familyStore.getChildCompetitionHistory(childId).length
}

// 获取儿童获胜次数
const getChildWinsCount = (childId) => {
  return familyStore.getChildCompetitionHistory(childId).filter(c => {
    const winner = c.results.find(r => r.rank === 1)
    return winner && winner.childId === childId
  }).length
}

// 获取儿童胜率
const getChildWinRate = (childId) => {
  return familyStore.getChildWinRate(childId)
}

// 获取儿童头像
const getChildAvatar = (childId) => {
  const child = children.value.find(c => c.id === childId)
  return child ? child.avatar || '👶' : '👶'
}

// 报告弹窗
const reportPopup = ref(null)
const report = ref({
  generatedAt: '',
  childrenSummary: [],
  familyTotalPoints: 0,
  poolBalance: 0
})

const onGenerateReport = () => {
  report.value = familyStore.generateComparisonReport()
  reportPopup.value.open()
}

const closeReportPopup = () => {
  reportPopup.value.close()
}

const formatReportTime = (timeStr) => {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}
</script>

<style scoped>
.family-comparison {
  padding: 16rpx;
}

.comparison-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  background: #ffffff;
  border-radius: 20rpx;
  margin-bottom: 24rpx;
}

.header-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1F2937;
}

.header-btn {
  padding: 16rpx 32rpx;
  background: linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%);
  border-radius: 16rpx;
}

.header-btn text {
  font-size: 26rpx;
  color: #ffffff;
  font-weight: 500;
}

.hover {
  opacity: 0.8;
}

.section {
  background: #ffffff;
  border-radius: 20rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #6B7280;
  margin-bottom: 20rpx;
  display: block;
}

/* 排名列表 */
.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.ranking-item {
  display: flex;
  align-items: center;
  padding: 16rpx;
  background: #F9FAFB;
  border-radius: 12rpx;
}

.rank-badge {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  margin-right: 16rpx;
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
  font-size: 40rpx;
  margin-right: 16rpx;
}

.rank-name {
  flex: 1;
  font-size: 28rpx;
  font-weight: 500;
  color: #1F2937;
}

.rank-points {
  display: flex;
  align-items: baseline;
}

.points-value {
  font-size: 32rpx;
  font-weight: 700;
  color: #8B5CF6;
}

.points-label {
  font-size: 20rpx;
  color: #6B7280;
  margin-left: 4rpx;
}

/* 雷达图 */
.radar-chart {
  padding: 16rpx 0;
}

.skills-grid {
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  height: 300rpx;
  padding: 0 16rpx;
}

.skill-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.skill-bars {
  display: flex;
  gap: 8rpx;
  align-items: flex-end;
  height: 200rpx;
}

.skill-bar-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.skill-bar {
  width: 24rpx;
  border-radius: 4rpx 4rpx 0 0;
  min-height: 20rpx;
}

.skill-bar-label {
  font-size: 18rpx;
  color: #6B7280;
  margin-top: 4rpx;
  writing-mode: horizontal-tb;
}

.skill-name {
  font-size: 24rpx;
  color: #1F2937;
  margin-top: 16rpx;
}

.radar-legend {
  display: flex;
  justify-content: center;
  gap: 32rpx;
  margin-top: 24rpx;
  padding-top: 16rpx;
  border-top: 1rpx solid #F3F4F6;
}

.legend-item {
  display: flex;
  align-items: center;
}

.legend-color {
  width: 20rpx;
  height: 20rpx;
  border-radius: 4rpx;
  margin-right: 8rpx;
}

.legend-name {
  font-size: 24rpx;
  color: #6B7280;
}

/* 里程碑 */
.milestone-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
}

.milestone-card {
  background: #F9FAFB;
  border-radius: 16rpx;
  padding: 20rpx;
}

.milestone-icon {
  font-size: 40rpx;
  display: block;
  margin-bottom: 8rpx;
}

.milestone-name {
  font-size: 26rpx;
  color: #1F2937;
  display: block;
  margin-bottom: 16rpx;
}

.milestone-achievers {
  display: flex;
  gap: 12rpx;
}

.achiever {
  position: relative;
}

.achiever-avatar {
  font-size: 32rpx;
  opacity: 0.4;
}

.achiever.achieved .achiever-avatar {
  opacity: 1;
}

.achiever-check {
  position: absolute;
  top: -8rpx;
  right: -8rpx;
  width: 24rpx;
  height: 24rpx;
  background: #10B981;
  color: #ffffff;
  font-size: 16rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 竞赛统计 */
.competition-stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
}

.stat-card {
  background: #F9FAFB;
  border-radius: 16rpx;
  padding: 20rpx;
  text-align: center;
}

.stat-avatar {
  font-size: 48rpx;
  display: block;
  margin-bottom: 8rpx;
}

.stat-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #1F2937;
  display: block;
  margin-bottom: 16rpx;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  padding: 8rpx 0;
  border-top: 1rpx solid #E5E7EB;
}

.stat-label {
  font-size: 24rpx;
  color: #6B7280;
}

.stat-value {
  font-size: 24rpx;
  font-weight: 600;
  color: #1F2937;
}

.stat-value.win-rate {
  color: #10B981;
}

/* 报告弹窗 */
.popup-content.report-popup {
  width: 680rpx;
  max-height: 80vh;
}

.report-popup .popup-title {
  font-size: 36rpx;
  margin-bottom: 8rpx;
}

.report-time {
  font-size: 24rpx;
  color: #9CA3AF;
  display: block;
  text-align: center;
  margin-bottom: 24rpx;
}

.report-content {
  max-height: 60vh;
}

.report-section {
  margin-bottom: 32rpx;
}

.report-section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #1F2937;
  display: block;
  margin-bottom: 16rpx;
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;
}

.overview-item {
  text-align: center;
  padding: 16rpx;
  background: #F9FAFB;
  border-radius: 12rpx;
}

.overview-value {
  font-size: 36rpx;
  font-weight: 700;
  color: #8B5CF6;
  display: block;
}

.overview-label {
  font-size: 22rpx;
  color: #6B7280;
}

.report-child-row {
  display: flex;
  align-items: center;
  padding: 12rpx 0;
  border-bottom: 1rpx solid #F3F4F6;
}

.report-child-rank {
  width: 40rpx;
  font-size: 28rpx;
  font-weight: 600;
  color: #6B7280;
}

.report-child-avatar {
  font-size: 32rpx;
  margin-right: 12rpx;
}

.report-child-name {
  flex: 1;
  font-size: 28rpx;
  color: #1F2937;
}

.report-child-points {
  font-size: 28rpx;
  font-weight: 600;
  color: #8B5CF6;
}

.report-competition-row {
  display: flex;
  align-items: center;
  padding: 12rpx 0;
  border-bottom: 1rpx solid #F3F4F6;
}

.report-competition-stats {
  flex: 1;
  display: flex;
  gap: 24rpx;
  font-size: 24rpx;
  color: #6B7280;
  justify-content: flex-end;
}

.popup-actions {
  margin-top: 24rpx;
}

.popup-btn.close {
  padding: 24rpx;
  background: #F3F4F6;
  border-radius: 16rpx;
  text-align: center;
}

.popup-btn.close text {
  font-size: 28rpx;
  color: #6B7280;
}
</style>
