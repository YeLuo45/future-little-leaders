<template>
  <view class="ai-recommend-home">
    <!-- 页面头部 -->
    <view class="page-header">
      <view class="header-bg"></view>
      <view class="header-content">
        <view class="greeting-section">
          <text class="greeting-text">{{ greeting }}</text>
          <text class="baby-name">{{ babyStore.currentBabyName }}</text>
        </view>
        <view class="header-actions">
          <view class="ai-avatar" @click="goToChat">
            <text>🤖</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 加载状态 -->
    <view class="loading-state" v-if="store.isLoading && !store.hasRecommendations">
      <view class="loading-spinner"></view>
      <text class="loading-text">正在分析成长数据...</text>
    </view>

    <!-- 推荐内容 -->
    <view class="recommend-content" v-else>
      <!-- 今日推荐 -->
      <view class="section">
        <view class="section-header">
          <text class="section-title">今日推荐</text>
          <text class="section-subtitle">根据你的成长数据个性化推荐</text>
        </view>

        <view class="recommend-list">
          <RecommendedCard
            v-for="(task, index) in store.recommendations"
            :key="task.id"
            :task="task"
            :style="{ animationDelay: `${index * 100}ms` }"
            @accept="handleAccept(task)"
            @skip="handleSkip(task)"
          />
        </view>

        <!-- 空状态 -->
        <view class="empty-state" v-if="!store.hasRecommendations">
          <text class="empty-icon">📭</text>
          <text class="empty-text">暂无推荐任务</text>
          <button class="retry-btn" @click="loadRecommendations">刷新试试</button>
        </view>
      </view>

      <!-- 快捷操作 -->
      <view class="section quick-actions">
        <view class="section-header">
          <text class="section-title">快捷功能</text>
        </view>

        <view class="action-grid">
          <view class="action-item" @click="goToChat">
            <view class="action-icon" style="background: linear-gradient(135deg, #7C3AED 0%, #EC4899 100%);">
              <text>💬</text>
            </view>
            <text class="action-label">AI 对话</text>
          </view>

          <view class="action-item" @click="handleGenerateSchedule">
            <view class="action-icon" style="background: linear-gradient(135deg, #10B981 0%, #34D399 100%);">
              <text>📅</text>
            </view>
            <text class="action-label">生成日程</text>
          </view>

          <view class="action-item" @click="loadRecommendations">
            <view class="action-icon" style="background: linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%);">
              <text>🔄</text>
            </view>
            <text class="action-label">换一批</text>
          </view>

          <view class="action-item" @click="goToAnalytics">
            <view class="action-icon" style="background: linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%);">
              <text>📊</text>
            </view>
            <text class="action-label">成长报告</text>
          </view>
        </view>
      </view>

      <!-- 日程预览 -->
      <view class="section schedule-preview" v-if="store.currentSchedule">
        <view class="section-header">
          <text class="section-title">今日日程预览</text>
          <text class="view-more" @click="goToChat">查看详情</text>
        </view>

        <ScheduleTimeline
          :slots="store.currentSchedule.slots"
          :total-points="store.currentSchedule.totalPoints"
          :show-actions="false"
        />
      </view>
    </view>

    <!-- 错误提示 -->
    <view class="error-toast" v-if="store.errorMessage">
      <text>{{ store.errorMessage }}</text>
    </view>
  </view>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useAIRecommendStore } from '@/stores/aiRecommendStore.js'
import { useBabyStore } from '@/stores/babyStore.js'
import RecommendedCard from '@/components/ai-rec/RecommendedCard.vue'
import ScheduleTimeline from '@/components/ai-rec/ScheduleTimeline.vue'

const store = useAIRecommendStore()
const babyStore = useBabyStore()

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return '早上好'
  if (hour < 18) return '下午好'
  return '晚上好'
})

onMounted(() => {
  loadRecommendations()
})

async function loadRecommendations() {
  await store.loadRecommendations()
}

function handleAccept(task) {
  store.submitFeedback(task.id, 'accept')
  uni.showToast({
    title: '已接受任务',
    icon: 'success'
  })
}

function handleSkip(task) {
  store.submitFeedback(task.id, 'skip')
  // 换一批 - 从列表中移除
  store.recommendations = store.recommendations.filter(t => t.id !== task.id)
}

function handleGenerateSchedule() {
  store.generateTodaySchedule()
}

function goToChat() {
  uni.navigateTo({
    url: '/pages/ai-recommend/chat'
  })
}

function goToAnalytics() {
  uni.navigateTo({
    url: '/pages/analytics/analytics-v18'
  })
}
</script>

<style scoped>
.ai-recommend-home {
  min-height: 100vh;
  background: #FAFAFA;
  padding-bottom: 40rpx;
}

.page-header {
  position: relative;
  padding: 0 0 40rpx 0;
}

.header-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 280rpx;
  background: linear-gradient(135deg, #7C3AED 0%, #EC4899 100%);
  border-radius: 0 0 40rpx 40rpx;
}

.header-content {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 120rpx 32rpx 0 32rpx;
}

.greeting-section {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.greeting-text {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
}

.baby-name {
  font-size: 40rpx;
  font-weight: 700;
  color: #FFFFFF;
}

.header-actions {
  display: flex;
  gap: 16rpx;
}

.ai-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 200rpx 0;
}

.loading-spinner {
  width: 64rpx;
  height: 64rpx;
  border: 4rpx solid #F3F4F6;
  border-top-color: #7C3AED;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  margin-top: 24rpx;
  font-size: 28rpx;
  color: #6B7280;
}

.recommend-content {
  padding: 0 24rpx;
}

.section {
  margin-bottom: 32rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1F2937;
}

.section-subtitle {
  font-size: 24rpx;
  color: #9CA3AF;
  margin-left: 16rpx;
  font-weight: 400;
}

.view-more {
  font-size: 26rpx;
  color: #7C3AED;
}

.recommend-list {
  display: flex;
  flex-direction: column;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 0;
  background: #FFFFFF;
  border-radius: 24rpx;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 20rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #9CA3AF;
  margin-bottom: 24rpx;
}

.retry-btn {
  padding: 16rpx 40rpx;
  background: linear-gradient(135deg, #7C3AED 0%, #8B5CF6 100%);
  color: #FFFFFF;
  border-radius: 30rpx;
  font-size: 28rpx;
  border: none;
}

.quick-actions {
  background: #FFFFFF;
  border-radius: 24rpx;
  padding: 28rpx;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20rpx;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
}

.action-icon {
  width: 88rpx;
  height: 88rpx;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 44rpx;
}

.action-label {
  font-size: 22rpx;
  color: #6B7280;
}

.schedule-preview {
  background: #FFFFFF;
  border-radius: 24rpx;
  padding: 28rpx;
}

.error-toast {
  position: fixed;
  bottom: 200rpx;
  left: 50%;
  transform: translateX(-50%);
  padding: 16rpx 32rpx;
  background: rgba(0, 0, 0, 0.75);
  color: #FFFFFF;
  border-radius: 12rpx;
  font-size: 26rpx;
}
</style>
