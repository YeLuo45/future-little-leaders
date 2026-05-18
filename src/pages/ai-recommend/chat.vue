<template>
  <view class="ai-chat-page">
    <!-- 页面头部 -->
    <view class="chat-header">
      <view class="header-left" @click="goBack">
        <text class="back-icon">←</text>
      </view>
      <view class="header-title">
        <text class="title-text">AI 规划助手</text>
      </view>
      <view class="header-right" @click="handleClear">
        <text class="clear-icon">🗑️</text>
      </view>
    </view>

    <!-- 欢迎提示 -->
    <view class="welcome-tip" v-if="store.chatMessages.length === 0">
      <view class="tip-icon">🤖</view>
      <text class="tip-text">{{ welcomeMessage }}</text>
      <view class="quick-questions">
        <view
          v-for="(q, index) in quickQuestions"
          :key="index"
          class="quick-btn"
          @click="sendQuickMessage(q)"
        >
          <text>{{ q }}</text>
        </view>
      </view>
    </view>

    <!-- 消息列表 -->
    <scroll-view
      class="chat-messages"
      :scroll-y="true"
      :scroll-top="scrollTop"
      :scroll-with-animation="true"
    >
      <view class="messages-wrapper">
        <AIChatBubble
          v-for="msg in store.chatMessages"
          :key="msg.id"
          :role="msg.role"
          :content="msg.content"
          :timestamp="msg.timestamp"
          :actions="msg.actions"
          @action="handleBubbleAction"
        />

        <!-- AI 正在输入 -->
        <view class="typing-indicator" v-if="store.isAIReplying">
          <view class="typing-dot"></view>
          <view class="typing-dot"></view>
          <view class="typing-dot"></view>
        </view>
      </view>
    </scroll-view>

    <!-- 推荐结果面板 -->
    <view class="recommend-panel" v-if="store.hasRecommendations" :class="{ 'is-expanded': showRecommendPanel }">
      <view class="panel-header" @click="toggleRecommendPanel">
        <text class="panel-title">推荐任务 ({{ store.recommendations.length }})</text>
        <text class="panel-toggle">{{ showRecommendPanel ? '收起' : '展开' }}</text>
      </view>
      <view class="panel-body" v-if="showRecommendPanel">
        <RecommendedCard
          v-for="task in store.recommendations"
          :key="task.id"
          :task="task"
          @accept="handleAccept(task)"
          @skip="handleSkip(task)"
        />
      </view>
    </view>

    <!-- 日程面板 -->
    <view class="schedule-panel" v-if="store.currentSchedule" :class="{ 'is-expanded': showSchedulePanel }">
      <view class="panel-header" @click="toggleSchedulePanel">
        <text class="panel-title">今日日程</text>
        <text class="panel-toggle">{{ showSchedulePanel ? '收起' : '展开' }}</text>
      </view>
      <view class="panel-body" v-if="showSchedulePanel">
        <ScheduleTimeline
          :slots="store.currentSchedule.slots"
          :total-points="store.currentSchedule.totalPoints"
          @import="handleImportSchedule"
        />
      </view>
    </view>

    <!-- 输入框 -->
    <view class="chat-input-area">
      <view class="input-wrapper">
        <input
          class="chat-input"
          v-model="inputMessage"
          placeholder="输入消息..."
          confirm-type="send"
          @confirm="handleSend"
        />
        <button class="send-btn" :disabled="!inputMessage.trim()" @click="handleSend">
          <text>发送</text>
        </button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useAIRecommendStore } from '@/stores/aiRecommendStore.js'
import { useBabyStore } from '@/stores/babyStore.js'
import AIChatBubble from '@/components/ai-rec/AIChatBubble.vue'
import RecommendedCard from '@/components/ai-rec/RecommendedCard.vue'
import ScheduleTimeline from '@/components/ai-rec/ScheduleTimeline.vue'

const store = useAIRecommendStore()
const babyStore = useBabyStore()

const inputMessage = ref('')
const scrollTop = ref(0)
const showRecommendPanel = ref(false)
const showSchedulePanel = ref(false)

const welcomeMessage = '你好！我是AI成长助手，可以帮你推荐任务、安排日程、分析成长数据。有什么需要帮忙的吗？'

const quickQuestions = [
  '推荐一些任务',
  '帮我安排今天的日程',
  '这周表现怎么样'
]

onMounted(() => {
  // 预加载推荐数据
  store.loadRecommendations()
})

async function handleSend() {
  const message = inputMessage.value.trim()
  if (!message) return

  inputMessage.value = ''
  await store.sendMessage(message)
  scrollToBottom()
}

async function sendQuickMessage(message) {
  inputMessage.value = message
  await handleSend()
}

function scrollToBottom() {
  nextTick(() => {
    scrollTop.value = scrollTop.value + 100
  })
}

function handleBubbleAction(action) {
  if (action.type === 'generate_schedule') {
    showSchedulePanel.value = true
  } else if (action.type === 'show_recommendations') {
    showRecommendPanel.value = true
  }
}

function handleAccept(task) {
  store.submitFeedback(task.id, 'accept')
  store.recommendations = store.recommendations.filter(t => t.id !== task.id)
  uni.showToast({ title: '已添加到任务列表', icon: 'success' })
}

function handleSkip(task) {
  store.submitFeedback(task.id, 'skip')
  store.recommendations = store.recommendations.filter(t => t.id !== task.id)
}

function toggleRecommendPanel() {
  showRecommendPanel.value = !showRecommendPanel.value
}

function toggleSchedulePanel() {
  showSchedulePanel.value = !showSchedulePanel.value
}

function handleImportSchedule(slots) {
  uni.showToast({ title: '日程已导入', icon: 'success' })
}

function handleClear() {
  uni.showModal({
    title: '确认清空',
    content: '确定要清空所有对话记录吗？',
    success: (res) => {
      if (res.confirm) {
        store.clearChat()
      }
    }
  })
}

function goBack() {
  uni.navigateBack()
}
</script>

<style scoped>
.ai-chat-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #FAFAFA;
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 60rpx 32rpx 20rpx;
  background: linear-gradient(135deg, #7C3AED 0%, #EC4899 100%);
}

.header-left, .header-right {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-icon {
  font-size: 40rpx;
  color: #FFFFFF;
}

.clear-icon {
  font-size: 36rpx;
}

.header-title {
  flex: 1;
  text-align: center;
}

.title-text {
  font-size: 34rpx;
  font-weight: 600;
  color: #FFFFFF;
}

.welcome-tip {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40rpx 32rpx;
}

.tip-icon {
  font-size: 64rpx;
  margin-bottom: 16rpx;
}

.tip-text {
  font-size: 28rpx;
  color: #6B7280;
  text-align: center;
  line-height: 1.6;
  margin-bottom: 32rpx;
}

.quick-questions {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  justify-content: center;
}

.quick-btn {
  padding: 16rpx 24rpx;
  background: #FFFFFF;
  border-radius: 30rpx;
  font-size: 26rpx;
  color: #7C3AED;
  box-shadow: 0 4rpx 16rpx rgba(124, 58, 237, 0.1);
}

.chat-messages {
  flex: 1;
  padding: 24rpx 32rpx;
}

.messages-wrapper {
  padding-bottom: 24rpx;
}

.typing-indicator {
  display: flex;
  gap: 8rpx;
  padding: 20rpx 24rpx;
  background: #FFFFFF;
  border-radius: 24rpx;
  width: fit-content;
}

.typing-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: #9CA3AF;
  animation: typing 1.4s ease-in-out infinite;
}

.typing-dot:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  30% {
    transform: translateY(-8rpx);
    opacity: 1;
  }
}

.recommend-panel,
.schedule-panel {
  background: #FFFFFF;
  border-radius: 24rpx 24rpx 0 0;
  margin: 0 24rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.06);
  max-height: 600rpx;
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  border-bottom: 2rpx solid #F3F4F6;
}

.panel-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #1F2937;
}

.panel-toggle {
  font-size: 24rpx;
  color: #7C3AED;
}

.panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 20rpx;
}

.chat-input-area {
  padding: 16rpx 24rpx;
  padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
  background: #FFFFFF;
  border-top: 2rpx solid #F3F4F6;
}

.input-wrapper {
  display: flex;
  gap: 16rpx;
  align-items: center;
}

.chat-input {
  flex: 1;
  height: 80rpx;
  padding: 0 24rpx;
  background: #F3F4F6;
  border-radius: 40rpx;
  font-size: 28rpx;
}

.send-btn {
  width: 120rpx;
  height: 72rpx;
  border-radius: 36rpx;
  background: linear-gradient(135deg, #7C3AED 0%, #8B5CF6 100%);
  color: #FFFFFF;
  font-size: 28rpx;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
}

.send-btn[disabled] {
  opacity: 0.5;
}

.send-btn::after {
  border: none;
}
</style>
