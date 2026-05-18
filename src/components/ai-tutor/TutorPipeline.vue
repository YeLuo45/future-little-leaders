<template>
  <view class="tutor-pipeline" :class="{ 'is-expanded': isExpanded }">
    <!-- 协作指示器 -->
    <view class="collaboration-bar" v-if="showCollaboration && participatingAgents.length > 1">
      <view class="collaboration-agents">
        <AgentAvatar 
          v-for="agentId in participatingAgents" 
          :key="agentId"
          :agent-id="agentId"
          :emoji="getAgentEmoji(agentId)"
          :name="getAgentName(agentId)"
          :is-active="activeAgentId === agentId"
          size="small"
        />
      </view>
      <text class="collaboration-hint">多Agent协作中</text>
    </view>

    <!-- 消息列表 -->
    <view class="message-list" :style="{ height: `${messageAreaHeight}rpx` }">
      <scroll-view 
        class="message-scroll"
        scroll-y
        :scroll-top="scrollTop"
        @scroll="handleScroll"
      >
        <!-- 欢迎消息 -->
        <view class="welcome-message" v-if="messages.length === 0">
          <view class="welcome-header">
            <view class="welcome-agents">
              <AgentAvatar 
                v-for="agent in displayAgents" 
                :key="agent.id"
                :agent-id="agent.id"
                :emoji="agent.emoji"
                :name="agent.name"
                :is-active="true"
              />
            </view>
          </view>
          <text class="welcome-text">{{ welcomeMessage }}</text>
          <view class="quick-topics">
            <text 
              v-for="topic in quickTopics" 
              :key="topic.text"
              class="topic-tag"
              @click="handleTopicClick(topic.text)"
            >{{ topic.text }}</text>
          </view>
        </view>

        <!-- 消息列表 -->
        <view 
          v-for="(msg, index) in messages" 
          :key="msg.id || index"
          class="message-item"
          :class="[`message-${msg.role}`, { 'is-collaborative': msg.collaborative }]"
        >
          <!-- 用户消息 -->
          <view class="message-user" v-if="msg.role === 'user'">
            <view class="message-bubble user-bubble">
              <text class="message-text">{{ msg.content }}</text>
            </view>
            <view class="user-avatar-small">
              <text>👶</text>
            </view>
          </view>

          <!-- AI消息 -->
          <view class="message-ai" v-else>
            <AgentAvatar 
              :agent-id="msg.agentId || msg.role"
              :emoji="getAgentEmoji(msg.agentId || msg.role)"
              :mood="msg.mood || 'happy'"
              size="small"
            />
            <view class="message-content-wrapper">
              <view class="message-bubble ai-bubble">
                <text class="agent-name-label" v-if="showAgentName">{{ getAgentName(msg.agentId || msg.role) }}</text>
                <text class="message-text">{{ msg.content }}</text>
                
                <!-- 协作指示 -->
                <view class="collaborative-indicator" v-if="msg.collaborative">
                  <text class="indicator-icon">🔗</text>
                  <text class="indicator-text">多Agent协作</text>
                </view>
              </view>
              
              <!-- 步骤展示 -->
              <view class="steps-list" v-if="msg.steps && msg.steps.length > 0">
                <view 
                  v-for="step in msg.steps" 
                  :key="step.step"
                  class="step-item"
                >
                  <text class="step-number">{{ step.step }}</text>
                  <text class="step-content">{{ step.content }}</text>
                </view>
              </view>
              
              <!-- 动作按钮 -->
              <view class="message-actions" v-if="msg.actions && msg.actions.length > 0">
                <view 
                  v-for="action in msg.actions" 
                  :key="action.type"
                  class="action-btn"
                  @click="handleActionClick(action)"
                >
                  <text>{{ action.label }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- 加载指示 -->
        <view class="loading-indicator" v-if="isProcessing">
          <text class="loading-emoji">🤖</text>
          <text class="loading-dots">思考中</text>
        </view>
      </scroll-view>
    </view>

    <!-- 输入区域 -->
    <view class="input-area">
      <view class="input-wrapper">
        <input 
          class="chat-input"
          v-model="inputText"
          :placeholder="inputPlaceholder"
          confirm-type="send"
          @confirm="handleSend"
          @focus="handleInputFocus"
          @blur="handleInputBlur"
          :disabled="isProcessing"
        />
      </view>
      <view class="send-btn" @click="handleSend" v-if="inputText.trim()">
        <text>发送</text>
      </view>
    </view>

    <!-- 快速回复 -->
    <view class="quick-replies" v-if="showQuickReplies && messages.length > 0">
      <view 
        v-for="reply in quickReplies" 
        :key="reply"
        class="quick-reply"
        @click="handleQuickReply(reply)"
      >
        <text>{{ reply }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import AgentAvatar from './AgentAvatar.vue'
import { useAITutorStore } from '@/stores/aiTutorStore.js'
import { AGENT_CONFIGS } from '@/services/aiTutorService.js'

const props = defineProps({
  // 初始消息
  initialMessage: {
    type: String,
    default: ''
  },
  // 是否展开
  expanded: {
    type: Boolean,
    default: true
  },
  // 消息区域高度
  messageAreaHeight: {
    type: Number,
    default: 500
  },
  // 是否显示协作指示
  showCollaboration: {
    type: Boolean,
    default: true
  },
  // 是否显示Agent名称
  showAgentName: {
    type: Boolean,
    default: true
  },
  // 是否显示快速回复
  showQuickReplies: {
    type: Boolean,
    default: true
  },
  // 输入占位符
  inputPlaceholder: {
    type: String,
    default: '问我任何学习问题...'
  }
})

const emit = defineEmits([
  'send', 
  'quick-reply', 
  'action-click',
  'expand',
  'collapse'
])

// Store
const tutorStore = useAITutorStore()

// 状态
const isExpanded = ref(props.expanded)
const inputText = ref('')
const scrollTop = ref(0)
const isInputFocused = ref(false)

// Agent emoji映射
const agentEmojis = {
  orchestrator: '🎓',
  math: '🔢',
  chinese: '📝',
  english: '🔤',
  life: '🏠'
}

// Agent名称映射
const agentNames = {
  orchestrator: '学习管家',
  math: '数学导师',
  chinese: '语文导师',
  english: '英语导师',
  life: '生活导师'
}

// 显示的Agent（用于欢迎页）
const displayAgents = computed(() => {
  return [
    { id: 'orchestrator', emoji: '🎓', name: '学习管家' },
    { id: 'math', emoji: '🔢', name: '数学导师' },
    { id: 'chinese', emoji: '📝', name: '语文导师' },
    { id: 'english', emoji: '🔤', name: '英语导师' },
    { id: 'life', emoji: '🏠', name: '生活导师' }
  ]
})

// 欢迎消息
const welcomeMessage = computed(() => {
  return '你好！我是AI学习管家团队，可以帮你学习数学、语文、英语和生活技能哦~ 有什么想问的吗？'
})

// 快捷话题
const quickTopics = [
  { text: '教我学拼音', topic: 'chinese' },
  { text: '数学计算', topic: 'math' },
  { text: '学英语单词', topic: 'english' },
  { text: '整理房间', topic: 'life' }
]

// 快速回复
const quickReplies = [
  '今天有什么好玩的？',
  '帮我解答数学题',
  '我想学英语',
  '给我讲个学习技巧'
]

// 从Store获取数据
const messages = computed(() => tutorStore.messages)
const isProcessing = computed(() => tutorStore.isProcessing)
const activeAgentId = computed(() => tutorStore.activeAgentId)
const participatingAgents = computed(() => {
  const agents = messages.value
    .filter(m => m.agentId)
    .map(m => m.agentId)
  return [...new Set(agents)]
})

// 获取Agent emoji
function getAgentEmoji(agentId) {
  return agentEmojis[agentId] || '🤖'
}

// 获取Agent名称
function getAgentName(agentId) {
  return agentNames[agentId] || agentId
}

// 监听展开状态
watch(() => props.expanded, (newVal) => {
  isExpanded.value = newVal
  if (newVal) {
    nextTick(() => {
      scrollToBottom()
    })
  }
})

// 监听消息变化
watch(() => messages.value.length, () => {
  nextTick(() => {
    scrollToBottom()
  })
})

// 切换展开
function toggleExpand() {
  isExpanded.value = !isExpanded.value
  emit(isExpanded.value ? 'expand' : 'collapse')
}

// 滚动到底部
function scrollToBottom() {
  scrollTop.value = scrollTop.value + 10000
}

// 处理滚动
function handleScroll(e) {
  // 可以实现加载更多
}

// 发送消息
async function handleSend() {
  const text = inputText.value.trim()
  if (!text) return
  if (isProcessing.value) return

  inputText.value = ''
  await tutorStore.sendMessage(text)
  emit('send', text)
}

// 快速回复
async function handleQuickReply(reply) {
  if (isProcessing.value) return
  await tutorStore.sendMessage(reply)
  emit('quick-reply', reply)
}

// 处理话题点击
async function handleTopicClick(text) {
  if (isProcessing.value) return
  await tutorStore.sendMessage(text)
}

// 处理动作点击
function handleActionClick(action) {
  emit('action-click', action)
  
  // 内置动作处理
  if (action.type === 'next_practice' || action.type === 'start_learning') {
    inputText.value = '再来一题'
  }
}

// 输入聚焦/失焦
function handleInputFocus() {
  isInputFocused.value = true
}

function handleInputBlur() {
  isInputFocused.value = false
}

// 展开/折叠
function expand() {
  isExpanded.value = true
  emit('expand')
}

function collapse() {
  isExpanded.value = false
  emit('collapse')
}

// 重置输入
function clearInput() {
  inputText.value = ''
}

// 暴露方法
defineExpose({
  expand,
  collapse,
  scrollToBottom,
  clearInput,
  isExpanded
})
</script>

<style scoped>
.tutor-pipeline {
  background: #FFFFFF;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: all 0.3s ease;
}

/* 协作指示栏 */
.collaboration-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 24rpx;
  background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
  color: #FFFFFF;
}

.collaboration-agents {
  display: flex;
  gap: 16rpx;
}

.collaboration-hint {
  font-size: 22rpx;
  opacity: 0.9;
}

/* 消息列表 */
.message-list {
  padding: 0 20rpx;
  overflow: hidden;
}

.message-scroll {
  height: 100%;
  max-height: 800rpx;
}

/* 欢迎消息 */
.welcome-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40rpx 20rpx;
  gap: 24rpx;
}

.welcome-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
}

.welcome-agents {
  display: flex;
  gap: 24rpx;
}

.welcome-text {
  font-size: 28rpx;
  color: #374151;
  text-align: center;
  line-height: 1.6;
  max-width: 600rpx;
}

.quick-topics {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12rpx;
  margin-top: 8rpx;
}

.topic-tag {
  font-size: 24rpx;
  padding: 12rpx 20rpx;
  background: #F3F4F6;
  border-radius: 24rpx;
  color: #6B7280;
}

/* 消息项 */
.message-item {
  margin-bottom: 24rpx;
}

.message-user {
  display: flex;
  align-items: flex-start;
  gap: 12rpx;
  flex-direction: row-reverse;
}

.message-ai {
  display: flex;
  align-items: flex-start;
  gap: 12rpx;
}

.message-content-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  max-width: 520rpx;
}

.user-avatar-small,
.ai-avatar-small {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  flex-shrink: 0;
}

.user-avatar-small {
  background: linear-gradient(135deg, #34D399 0%, #10B981 100%);
}

.ai-avatar-small {
  background: linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%);
}

.message-bubble {
  max-width: 480rpx;
  padding: 16rpx 20rpx;
  border-radius: 20rpx;
  position: relative;
}

.user-bubble {
  background: linear-gradient(135deg, #7C3AED 0%, #EC4899 100%);
  color: #FFFFFF;
  border-top-right-radius: 8rpx;
}

.ai-bubble {
  background: #F3F4F6;
  border-top-left-radius: 8rpx;
}

.agent-name-label {
  font-size: 20rpx;
  color: #9CA3AF;
  margin-bottom: 4rpx;
  display: block;
}

.message-text {
  font-size: 28rpx;
  line-height: 1.5;
  word-break: break-word;
}

/* 协作指示 */
.collaborative-indicator {
  display: flex;
  align-items: center;
  gap: 4rpx;
  margin-top: 8rpx;
  font-size: 20rpx;
  color: #8B5CF6;
}

.indicator-icon {
  font-size: 18rpx;
}

.indicator-text {
  font-size: 20rpx;
}

/* 步骤列表 */
.steps-list {
  background: #FFFFFF;
  border-radius: 12rpx;
  padding: 12rpx 16rpx;
  margin-top: 8rpx;
}

.step-item {
  display: flex;
  align-items: flex-start;
  gap: 8rpx;
  margin-bottom: 8rpx;
}

.step-item:last-child {
  margin-bottom: 0;
}

.step-number {
  width: 32rpx;
  height: 32rpx;
  background: #8B5CF6;
  color: #FFFFFF;
  border-radius: 50%;
  font-size: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.step-content {
  font-size: 24rpx;
  color: #374151;
  line-height: 1.4;
}

/* 动作按钮 */
.message-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  margin-top: 8rpx;
}

.action-btn {
  font-size: 24rpx;
  padding: 8rpx 16rpx;
  background: #8B5CF6;
  color: #FFFFFF;
  border-radius: 16rpx;
}

/* 加载指示 */
.loading-indicator {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 16rpx;
}

.loading-emoji {
  font-size: 32rpx;
  animation: bounce 1s ease infinite;
}

.loading-dots {
  font-size: 24rpx;
  color: #9CA3AF;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4rpx); }
}

/* 输入区域 */
.input-area {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 16rpx 20rpx;
  border-top: 1rpx solid #F3F4F6;
}

.input-wrapper {
  flex: 1;
}

.chat-input {
  width: 100%;
  height: 72rpx;
  background: #F3F4F6;
  border-radius: 36rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
}

.send-btn {
  width: 96rpx;
  height: 72rpx;
  background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
  border-radius: 36rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FFFFFF;
  font-size: 26rpx;
}

/* 快速回复 */
.quick-replies {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  padding: 0 20rpx 16rpx;
}

.quick-reply {
  font-size: 24rpx;
  padding: 10rpx 16rpx;
  background: #F3F4F6;
  border-radius: 16rpx;
  color: #6B7280;
}
</style>
