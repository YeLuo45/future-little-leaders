<template>
  <view class="ai-tutor-page">
    <!-- 顶部导航 -->
    <view class="nav-header">
      <view class="nav-left" @click="goBack">
        <text class="nav-icon">←</text>
      </view>
      <view class="nav-title">
        <text>AI学习管家</text>
      </view>
      <view class="nav-right" @click="showMenu">
        <text class="nav-icon">⋮</text>
      </view>
    </view>

    <!-- Agent选择栏 -->
    <view class="agent-selector">
      <scroll-view class="agent-scroll" scroll-x>
        <view 
          v-for="agent in enabledAgents" 
          :key="agent.id"
          class="agent-tab"
          :class="{ active: activeAgentId === agent.id }"
          @click="switchAgent(agent.id)"
        >
          <text class="agent-tab-emoji">{{ agent.emoji }}</text>
          <text class="agent-tab-name">{{ agent.name }}</text>
        </view>
      </scroll-view>
    </view>

    <!-- 学习管道组件 -->
    <view class="tutor-container">
      <TutorPipeline 
        ref="tutorPipeline"
        :initial-message="initialMessage"
        :message-area-height="messageAreaHeight"
        @send="handleSend"
        @action-click="handleActionClick"
      />
    </view>

    <!-- 历史会话入口 -->
    <view class="history-entry" @click="showHistory">
      <text class="history-icon">📚</text>
      <text class="history-text">学习历史</text>
      <text class="history-count" v-if="historyCount > 0">{{ historyCount }}</text>
    </view>

    <!-- 历史记录弹窗 -->
    <view class="history-modal" v-if="showHistoryModal" @click="hideHistory">
      <view class="history-content" @click.stop>
        <view class="history-header">
          <text class="history-title">学习历史</text>
          <text class="history-close" @click="hideHistory">×</text>
        </view>
        <scroll-view class="history-list" scroll-y>
          <view class="empty-history" v-if="historySessions.length === 0">
            <text class="empty-icon">📚</text>
            <text class="empty-text">暂无学习记录</text>
          </view>
          <SessionCard 
            v-for="session in historySessions"
            :key="session.id"
            :session="session"
            @click="resumeHistorySession(session)"
          />
        </scroll-view>
      </view>
    </view>

    <!-- 菜单弹窗 -->
    <view class="menu-modal" v-if="showMenuModal" @click="hideMenu">
      <view class="menu-content" @click.stop>
        <view class="menu-item" @click="startNewSession">
          <text class="menu-icon">✨</text>
          <text>新建学习会话</text>
        </view>
        <view class="menu-item" @click="openAgentSettings">
          <text class="menu-icon">⚙️</text>
          <text>导师设置</text>
        </view>
        <view class="menu-item" @click="clearAllHistory">
          <text class="menu-icon">🗑️</text>
          <text>清空历史</text>
        </view>
      </view>
    </view>

    <!-- Agent设置弹窗 -->
    <view class="settings-modal" v-if="showSettingsModal" @click="closeSettings">
      <view class="settings-content" @click.stop>
        <view class="settings-header">
          <text class="settings-title">导师设置</text>
          <text class="settings-close" @click="closeSettings">×</text>
        </view>
        <scroll-view class="settings-list" scroll-y>
          <view 
            v-for="agent in allAgents" 
            :key="agent.id"
            class="settings-item"
          >
            <view class="settings-item-left">
              <text class="settings-emoji">{{ agent.emoji }}</text>
              <view class="settings-info">
                <text class="settings-name">{{ agent.name }}</text>
                <text class="settings-expertise">{{ agent.expertise.join('、') }}</text>
              </view>
            </view>
            <switch 
              :checked="agent.enabled" 
              @change="toggleAgentSetting(agent.id)"
              color="#8B5CF6"
            />
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import TutorPipeline from '@/components/ai-tutor/TutorPipeline.vue'
import SessionCard from '@/components/ai-tutor/SessionCard.vue'
import { useAITutorStore } from '@/stores/aiTutorStore.js'
import { AGENT_CONFIGS } from '@/services/aiTutorService.js'

// Store
const tutorStore = useAITutorStore()

// Refs
const tutorPipeline = ref(null)

// 状态
const showHistoryModal = ref(false)
const showMenuModal = ref(false)
const showSettingsModal = ref(false)
const initialMessage = ref('')

// 计算属性
const enabledAgents = computed(() => tutorStore.activeAgents)
const activeAgentId = computed(() => tutorStore.activeAgentId)
const historySessions = computed(() => tutorStore.historySessions)
const historyCount = computed(() => tutorStore.historySessions.length)
const messageAreaHeight = computed(() => {
  // 根据屏幕和导航计算
  return 600
})

// 全部Agent配置
const allAgents = computed(() => {
  return Object.values(AGENT_CONFIGS)
})

// 生命周期
onMounted(() => {
  // 如果没有活跃会话，创建一个新的
  if (!tutorStore.currentSession) {
    tutorStore.startNewSession()
  }
})

// 方法
function goBack() {
  uni.navigateBack()
}

function showMenu() {
  showMenuModal.value = true
}

function hideMenu() {
  showMenuModal.value = false
}

function showHistory() {
  showHistoryModal.value = true
}

function hideHistory() {
  showHistoryModal.value = false
}

function startNewSession() {
  hideMenu()
  tutorStore.startNewSession()
  if (tutorPipeline.value) {
    tutorPipeline.value.clearInput()
  }
}

function resumeHistorySession(session) {
  hideHistory()
  tutorStore.resumeSession(session.id)
}

function clearAllHistory() {
  hideMenu()
  uni.showModal({
    title: '清空历史',
    content: '确定要清空所有学习历史吗？此操作不可恢复。',
    success: (res) => {
      if (res.confirm) {
        historySessions.value.forEach(session => {
          tutorStore.removeHistorySession(session.id)
        })
        uni.showToast({ title: '已清空', icon: 'success' })
      }
    }
  })
}

function openAgentSettings() {
  hideMenu()
  showSettingsModal.value = true
}

function closeSettings() {
  showSettingsModal.value = false
}

function toggleAgentSetting(agentId) {
  tutorStore.toggleAgent(agentId)
}

function switchAgent(agentId) {
  // 可以用来筛选特定Agent的响应
  // 目前主要用于UI显示
}

function handleSend(text) {
  console.log('[AI Tutor] Message sent:', text)
}

function handleActionClick(action) {
  console.log('[AI Tutor] Action clicked:', action)
  
  // 根据动作类型处理
  switch (action.type) {
    case 'next_practice':
      // 继续练习
      break
    case 'analyze_problem':
      // 分析问题
      break
    default:
      break
  }
}
</script>

<style scoped>
.ai-tutor-page {
  min-height: 100vh;
  background: #F9FAFB;
  display: flex;
  flex-direction: column;
}

/* 导航栏 */
.nav-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  padding: 0 24rpx;
  background: #FFFFFF;
  border-bottom: 1rpx solid #F3F4F6;
}

.nav-left,
.nav-right {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-icon {
  font-size: 36rpx;
  color: #374151;
}

.nav-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #374151;
}

/* Agent选择栏 */
.agent-selector {
  background: #FFFFFF;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #F3F4F6;
}

.agent-scroll {
  white-space: nowrap;
  padding: 0 16rpx;
}

.agent-tab {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 20rpx;
  margin: 0 8rpx;
  background: #F3F4F6;
  border-radius: 24rpx;
  transition: all 0.2s ease;
}

.agent-tab.active {
  background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
}

.agent-tab-emoji {
  font-size: 28rpx;
}

.agent-tab-name {
  font-size: 24rpx;
  color: #6B7280;
}

.agent-tab.active .agent-tab-name {
  color: #FFFFFF;
}

/* 管道容器 */
.tutor-container {
  flex: 1;
  padding: 20rpx;
}

/* 历史入口 */
.history-entry {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 20rpx 32rpx;
  background: #FFFFFF;
  border-top: 1rpx solid #F3F4F6;
}

.history-icon {
  font-size: 32rpx;
}

.history-text {
  flex: 1;
  font-size: 28rpx;
  color: #374151;
}

.history-count {
  font-size: 24rpx;
  color: #9CA3AF;
  background: #F3F4F6;
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
}

/* 弹窗样式 */
.history-modal,
.menu-modal,
.settings-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.history-content,
.menu-content,
.settings-content {
  background: #FFFFFF;
  border-radius: 24rpx 24rpx 0 0;
  max-height: 70vh;
  width: 100%;
  overflow: hidden;
}

.menu-content,
.settings-content {
  border-radius: 24rpx;
  width: 80%;
  max-width: 500rpx;
}

.history-header,
.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  border-bottom: 1rpx solid #F3F4F6;
}

.history-title,
.settings-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #374151;
}

.history-close,
.settings-close {
  font-size: 48rpx;
  color: #9CA3AF;
  padding: 0 12rpx;
}

.history-list,
.settings-list {
  max-height: 60vh;
  padding: 20rpx;
}

.empty-history {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 20rpx;
  gap: 16rpx;
}

.empty-icon {
  font-size: 80rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #9CA3AF;
}

/* 菜单项 */
.menu-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 24rpx;
  border-bottom: 1rpx solid #F3F4F6;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-icon {
  font-size: 32rpx;
}

.menu-item text:not(.menu-icon) {
  font-size: 28rpx;
  color: #374151;
}

/* 设置项 */
.settings-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  border-bottom: 1rpx solid #F3F4F6;
}

.settings-item-left {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.settings-emoji {
  font-size: 40rpx;
}

.settings-info {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.settings-name {
  font-size: 28rpx;
  font-weight: 500;
  color: #374151;
}

.settings-expertise {
  font-size: 22rpx;
  color: #9CA3AF;
}
</style>
