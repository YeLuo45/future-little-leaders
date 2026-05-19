<template>
  <view class="peer-coaching-container">
    <!-- 顶部导航 -->
    <view class="header">
      <view class="header-left" @click="goBack">
        <text class="icon">←</text>
      </view>
      <view class="header-title">
        <text>同伴辅导</text>
      </view>
      <view class="header-right">
        <text class="icon">🤝</text>
      </view>
    </view>

    <!-- 统计概览 -->
    <view class="stats-overview">
      <view class="stats-grid">
        <view class="stat-item">
          <text class="stat-value">{{ statistics.matchCount || 0 }}</text>
          <text class="stat-label">学习伙伴</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ statistics.questionCount || 0 }}</text>
          <text class="stat-label">提问数</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ statistics.answerCount || 0 }}</text>
          <text class="stat-label">回答数</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ statistics.feedbackCount || 0 }}</text>
          <text class="stat-label">互评数</text>
        </view>
      </view>
    </view>

    <!-- 功能卡片区 -->
    <view class="section-cards">
      <!-- 学习伙伴匹配 -->
      <view class="card" @click="goToBuddyMatching">
        <view class="card-icon">👥</view>
        <view class="card-content">
          <text class="card-title">学习伙伴匹配</text>
          <text class="card-desc">找到技能互补的伙伴</text>
        </view>
        <view class="card-badge" v-if="hasBuddy">已匹配</view>
        <text class="card-arrow">→</text>
      </view>

      <!-- 同伴答疑 -->
      <view class="card" @click="goToPeerQA">
        <view class="card-icon">❓</view>
        <view class="card-content">
          <text class="card-title">同伴答疑</text>
          <text class="card-desc">发布问题，伙伴来解答</text>
        </view>
        <view class="card-badge" v-if="openQuestionCount > 0">{{ openQuestionCount }}</view>
        <text class="card-arrow">→</text>
      </view>

      <!-- 互评反馈 -->
      <view class="card" @click="goToMutualFeedback">
        <view class="card-icon">⭐</view>
        <view class="card-content">
          <text class="card-title">互评反馈</text>
          <text class="card-desc">学习进度互评，鼓励留言</text>
        </view>
        <view class="card-badge" v-if="feedbackStats.receivedCount > 0">{{ feedbackStats.receivedCount }}</view>
        <text class="card-arrow">→</text>
      </view>
    </view>

    <!-- 当前伙伴信息 -->
    <view class="buddy-section" v-if="hasBuddy" @click="goToBuddyMatching">
      <view class="section-header">
        <text class="section-title">当前伙伴</text>
        <text class="section-more">查看详情</text>
      </view>
      <view class="buddy-card">
        <view class="buddy-avatar">{{ buddyMatch.partnerAvatar }}</view>
        <view class="buddy-info">
          <text class="buddy-name">{{ buddyMatch.partnerName }}</text>
          <view class="buddy-skills">
            <text 
              class="skill-tag" 
              v-for="skill in buddyMatch.partnerSkills?.slice(0, 3)" 
              :key="skill"
              :style="{ background: getSkillColor(skill) }"
            >
              {{ getSkillLabel(skill) }}
            </text>
          </view>
        </view>
        <text class="card-arrow">→</text>
      </view>
    </view>

    <!-- 最近活动 -->
    <view class="recent-section">
      <view class="section-header">
        <text class="section-title">最近活动</text>
      </view>
      <view class="activity-list">
        <view 
          class="activity-item" 
          v-for="item in recentActivities" 
          :key="item.id"
          @click="handleActivityClick(item)"
        >
          <view class="activity-icon">{{ item.icon }}</view>
          <view class="activity-content">
            <text class="activity-title">{{ item.title }}</text>
            <text class="activity-time">{{ item.time }}</text>
          </view>
        </view>
        <view class="empty-tip" v-if="recentActivities.length === 0">
          <text>暂无活动，开始你的同伴辅导之旅吧！</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { usePeerCoachingStore } from '@/stores/peerCoachingStore.js'
import peerCoachingService, { SKILL_INFO, QUESTION_STATUS, FEEDBACK_TYPE } from '@/services/peerCoachingService.js'

const peerCoachingStore = usePeerCoachingStore()

// 计算属性
const buddyMatch = computed(() => peerCoachingStore.buddyMatch)
const hasBuddy = computed(() => peerCoachingStore.hasBuddy)
const statistics = computed(() => peerCoachingStore.statistics)
const feedbackStats = computed(() => peerCoachingStore.feedbackStats)
const openQuestionCount = computed(() => peerCoachingStore.openQuestions.length)

// 最近活动（合并问题和反馈）
const recentActivities = computed(() => {
  const activities = []
  
  // 添加最近的问题
  peerCoachingStore.sortedMyQuestions.slice(0, 3).forEach(q => {
    activities.push({
      id: q.id,
      type: 'question',
      icon: '❓',
      title: q.title || '新问题',
      time: peerCoachingStore.formatDate(q.createdAt)
    })
  })
  
  // 添加最近的反馈
  peerCoachingStore.buddyFeedbacks.slice(0, 3).forEach(f => {
    activities.push({
      id: f.id,
      type: 'feedback',
      icon: f.type === FEEDBACK_TYPE.PROGRESS ? '📈' : '💪',
      title: f.type === FEEDBACK_TYPE.PROGRESS ? '收到学习进度反馈' : '收到鼓励留言',
      time: peerCoachingStore.formatDate(f.createdAt)
    })
  })
  
  // 按时间排序
  activities.sort((a, b) => new Date(b.time) - new Date(a.time))
  
  return activities.slice(0, 5)
})

// 页面加载
onMounted(() => {
  peerCoachingStore.init()
})

// 返回
const goBack = () => {
  uni.navigateBack()
}

// 跳转到伙伴匹配
const goToBuddyMatching = () => {
  uni.navigateTo({
    url: '/pages/peer-coaching/buddy-matching'
  })
}

// 跳转到同伴答疑
const goToPeerQA = () => {
  uni.navigateTo({
    url: '/pages/peer-coaching/peer-qa'
  })
}

// 跳转到互评反馈
const goToMutualFeedback = () => {
  uni.navigateTo({
    url: '/pages/peer-coaching/mutual-feedback'
  })
}

// 获取技能标签
const getSkillLabel = (skill) => {
  return SKILL_INFO[skill]?.label || skill
}

// 获取技能颜色
const getSkillColor = (skill) => {
  return SKILL_INFO[skill]?.color || '#999'
}

// 处理活动点击
const handleActivityClick = (item) => {
  if (item.type === 'question') {
    goToPeerQA()
  } else if (item.type === 'feedback') {
    goToMutualFeedback()
  }
}
</script>

<style scoped>
.peer-coaching-container {
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

.buddy-section,
.recent-section {
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

.buddy-card {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.buddy-avatar {
  width: 50px;
  height: 50px;
  background: #f0f0f0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  margin-right: 12px;
}

.buddy-info {
  flex: 1;
}

.buddy-name {
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 6px;
}

.buddy-skills {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.skill-tag {
  font-size: 11px;
  color: #fff;
  padding: 2px 8px;
  border-radius: 4px;
}

.activity-list {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.activity-item {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  border-bottom: 1px solid #f0f0f0;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  font-size: 20px;
  margin-right: 12px;
}

.activity-content {
  flex: 1;
}

.activity-title {
  display: block;
  font-size: 14px;
  color: #333;
}

.activity-time {
  display: block;
  font-size: 11px;
  color: #999;
  margin-top: 2px;
}

.empty-tip {
  padding: 30px 15px;
  text-align: center;
  color: #999;
  font-size: 13px;
}
</style>
