<template>
  <view class="config-page-container">
    <!-- 顶部导航 -->
    <view class="header">
      <view class="header-left" @click="goBack">
        <text class="icon">←</text>
      </view>
      <view class="header-title">
        <text>宪章设置</text>
      </view>
      <view class="header-right">
      </view>
    </view>

    <!-- 配置项 -->
    <view class="config-section">
      <view class="section-title">功能设置</view>
      
      <view class="config-item">
        <view class="config-info">
          <text class="config-icon">🗳️</text>
          <view class="config-text">
            <text class="config-label">价值观投票</text>
            <text class="config-desc">允许家庭成员对价值观进行投票</text>
          </view>
        </view>
        <switch 
          :checked="config.votingEnabled" 
          @change="onVotingChange" 
          color="#667eea"
        />
      </view>
      
      <view class="config-item">
        <view class="config-info">
          <text class="config-icon">🔔</text>
          <view class="config-text">
            <text class="config-label">会议提醒</text>
            <text class="config-desc">会议开始前发送提醒通知</text>
          </view>
        </view>
        <switch 
          :checked="config.meetingReminder" 
          @change="onMeetingReminderChange" 
          color="#667eea"
        />
      </view>
      
      <view class="config-item">
        <view class="config-info">
          <text class="config-icon">🤝</text>
          <view class="config-text">
            <text class="config-label">冲突解决</text>
            <text class="config-desc">启用冲突解决机制</text>
          </view>
        </view>
        <switch 
          :checked="config.conflictResolutionEnabled" 
          @change="onConflictChange" 
          color="#667eea"
        />
      </view>
    </view>

    <!-- 统计信息 -->
    <view class="config-section">
      <view class="section-title">统计数据</view>
      
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
          <text class="stat-value">{{ stats.meetingsCount }}</text>
          <text class="stat-label">会议总数</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ stats.activeConflictsCount }}</text>
          <text class="stat-label">活跃冲突</text>
        </view>
      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="config-section">
      <view class="section-title">数据管理</view>
      
      <view class="action-buttons">
        <button class="action-btn danger" @click="confirmReset">
          重置所有数据
        </button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useFamilyCharterStore } from '@/stores/familyCharterStore.js'

const familyCharterStore = useFamilyCharterStore()

// 配置
const config = computed(() => familyCharterStore.config)

// 统计
const stats = computed(() => familyCharterStore.statistics)

// 页面加载
onMounted(() => {
  familyCharterStore.init()
})

// 返回
const goBack = () => {
  uni.navigateBack()
}

// 价值观投票开关
const onVotingChange = (e) => {
  familyCharterStore.updateConfig({
    votingEnabled: e.detail.value
  })
}

// 会议提醒开关
const onMeetingReminderChange = (e) => {
  familyCharterStore.updateConfig({
    meetingReminder: e.detail.value
  })
}

// 冲突解决开关
const onConflictChange = (e) => {
  familyCharterStore.updateConfig({
    conflictResolutionEnabled: e.detail.value
  })
}

// 确认重置
const confirmReset = () => {
  uni.showModal({
    title: '确认重置',
    content: '确定要重置所有家庭宪章数据吗？此操作不可恢复！',
    success: (res) => {
      if (res.confirm) {
        familyCharterStore.resetData()
        uni.showToast({ title: '数据已重置', icon: 'success' })
      }
    }
  })
}
</script>

<style scoped>
.config-page-container {
  min-height: 100vh;
  background: #f5f5f5;
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

.config-section {
  margin: 16px;
  background: #fff;
  border-radius: 12px;
  padding: 16px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
}

.config-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.config-item:last-child {
  border-bottom: none;
}

.config-info {
  display: flex;
  align-items: center;
  flex: 1;
}

.config-icon {
  font-size: 24px;
  margin-right: 12px;
}

.config-text {
  display: flex;
  flex-direction: column;
}

.config-label {
  font-size: 15px;
  color: #333;
}

.config-desc {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #667eea;
  display: block;
}

.stat-label {
  font-size: 11px;
  color: #999;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.action-btn {
  width: 100%;
  height: 44px;
  border-radius: 8px;
  font-size: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
}

.action-btn.danger {
  background: #fff1f0;
  color: #f5222d;
}
</style>
