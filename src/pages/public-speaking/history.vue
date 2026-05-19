<template>
  <view class="history-page">
    <!-- 顶部导航 -->
    <view class="nav-header">
      <text class="back-btn" @click="goBack">‹</text>
      <text class="nav-title">练习历史</text>
      <text class="nav-placeholder"></text>
    </view>

    <!-- 历史记录 -->
    <view class="history-list">
      <view class="history-section">
        <text class="section-title">模板练习</text>
        <view
          v-for="practice in completedPractices"
          :key="practice.id"
          class="history-card"
        >
          <view class="history-info">
            <text class="history-title">{{ getTemplateTitle(practice.templateId) }}</text>
            <view class="history-meta">
              <text>{{ formatDate(practice.completedAt) }}</text>
              <text>⏱️ {{ practice.practiceData?.duration || 0 }}秒</text>
            </view>
          </view>
          <view class="history-score">
            <text class="score-value">{{ practice.score }}</text>
            <text class="score-label">分</text>
          </view>
        </view>
        
        <view v-if="completedPractices.length === 0" class="empty-item">
          <text>暂无练习记录</text>
        </view>
      </view>

      <view class="history-section">
        <text class="section-title">挑战记录</text>
        <view
          v-for="record in challengeRecords"
          :key="record.id"
          class="history-card"
        >
          <view class="history-info">
            <text class="history-title">{{ getChallengeTitle(record.challengeId) }}</text>
            <view class="history-meta">
              <text>{{ formatDate(record.completedAt) }}</text>
              <text>🏆 {{ record.rewards?.badge || '' }}</text>
            </view>
          </view>
          <view class="history-score">
            <text class="score-value">{{ record.score }}</text>
            <text class="score-label">分</text>
          </view>
        </view>
        
        <view v-if="challengeRecords.length === 0" class="empty-item">
          <text>暂无挑战记录</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { usePublicSpeakingStore } from '@/stores/publicSpeakingStore.js'

const store = usePublicSpeakingStore()

// 计算属性
const completedPractices = computed(() => store.getCompletedPractices())
const challengeRecords = computed(() => store.getChallengeRecords())

// 方法
const goBack = () => {
  uni.navigateBack()
}

const getTemplateTitle = (templateId) => {
  const template = store.getTemplate(templateId)
  return template?.title || '模板练习'
}

const getChallengeTitle = (challengeId) => {
  const challenge = store.getChallenge(challengeId)
  return challenge?.title || '演讲挑战'
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`
}

onMounted(() => {
  store.init()
})
</script>

<style scoped>
.history-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.nav-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 40rpx 30rpx 20rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.back-btn {
  font-size: 60rpx;
  color: #ffffff;
  font-weight: bold;
}

.nav-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #ffffff;
}

.nav-placeholder {
  width: 60rpx;
}

.history-list {
  padding: 20rpx 30rpx;
}

.history-section {
  margin-bottom: 30rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #666;
  display: block;
  margin-bottom: 16rpx;
}

.history-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 12rpx;
  display: flex;
  align-items: center;
}

.history-info {
  flex: 1;
}

.history-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.history-meta {
  display: flex;
  gap: 16rpx;
}

.history-meta text {
  font-size: 22rpx;
  color: #999;
}

.history-score {
  display: flex;
  align-items: baseline;
}

.score-value {
  font-size: 48rpx;
  font-weight: bold;
  color: #667eea;
}

.score-label {
  font-size: 24rpx;
  color: #999;
  margin-left: 4rpx;
}

.empty-item {
  padding: 40rpx;
  text-align: center;
}

.empty-item text {
  font-size: 26rpx;
  color: #999;
}
</style>
