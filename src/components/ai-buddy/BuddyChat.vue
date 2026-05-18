<template>
  <view class="buddy-chat" :class="{ 'is-expanded': isExpanded }">
    <!-- 聊天头部 -->
    <view class="chat-header" @click="toggleExpand">
      <view class="header-left">
        <BuddyAvatar 
          :mood="currentMood" 
          :expression="currentExpression"
          :buddy-name="buddyName"
          :level="buddyLevel"
          @click="handleAvatarClick"
        />
      </view>
      <view class="header-info">
        <text class="buddy-name">{{ buddyName }}</text>
        <text class="buddy-status">{{ statusText }}</text>
      </view>
      <view class="header-right">
        <text class="expand-icon">{{ isExpanded ? '▼' : '▲' }}</text>
      </view>
    </view>
    
    <!-- 消息列表 -->
    <view class="chat-messages" v-show="isExpanded" :style="{ height: `${messageAreaHeight}rpx` }">
      <scroll-view 
        class="message-scroll"
        scroll-y
        :scroll-top="scrollTop"
        @scroll="handleScroll"
      >
        <!-- 空状态 -->
        <view class="empty-state" v-if="messages.length === 0 && !isLoading">
          <text class="empty-icon">💬</text>
          <text class="empty-text">{{ emptyPrompt || defaultEmptyPrompt }}</text>
        </view>
        
        <!-- 消息列表 -->
        <view 
          v-for="(msg, index) in messages" 
          :key="msg.id || index"
          class="message-item"
          :class="[`message-${msg.role}`]"
        >
          <!-- AI 消息 -->
          <view class="message-ai" v-if="msg.role === 'ai'">
            <view class="ai-avatar-small">
              <text>{{ buddyEmoji }}</text>
            </view>
            <view class="message-bubble ai-bubble">
              <text class="message-text">{{ msg.content }}</text>
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
          
          <!-- 用户消息 -->
          <view class="message-user" v-else>
            <view class="message-bubble user-bubble">
              <text class="message-text">{{ msg.content }}</text>
            </view>
            <view class="user-avatar-small">
              <text>👶</text>
            </view>
          </view>
        </view>
        
        <!-- 加载指示器 -->
        <view class="loading-indicator" v-if="isLoading">
          <text class="loading-icon">{{ buddyEmoji }}</text>
          <text class="loading-dots">...</text>
        </view>
      </scroll-view>
    </view>
    
    <!-- 输入区域 -->
    <view class="chat-input-area" v-show="isExpanded">
      <view class="input-wrapper">
        <input 
          class="chat-input"
          v-model="inputText"
          :placeholder="inputPlaceholder"
          confirm-type="send"
          @confirm="handleSend"
          @focus="handleInputFocus"
          @blur="handleInputBlur"
        />
        <!-- 语音按钮 (可选) -->
        <view class="voice-btn" v-if="showVoiceBtn" @click="handleVoiceInput">
          <text>🎤</text>
        </view>
      </view>
      
      <!-- 快速回复 -->
      <view class="quick-replies" v-if="showQuickReplies && quickReplies.length > 0">
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
    
    <!-- 心情追踪 (折叠时显示) -->
    <view class="mood-indicator" v-if="!isExpanded && showMoodIndicator">
      <text class="mood-icon-small">{{ moodIcon }}</text>
      <text class="mood-hint">点击与我聊天</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import BuddyAvatar from './BuddyAvatar.vue'

const props = defineProps({
  // 伙伴名称
  buddyName: {
    type: String,
    default: '小伙伴'
  },
  // 伙伴等级
  buddyLevel: {
    type: Number,
    default: 1
  },
  // 伙伴表情 emoji
  buddyEmoji: {
    type: String,
    default: '🤖'
  },
  // 当前心情
  mood: {
    type: String,
    default: 'happy'
  },
  // 当前表情
  expression: {
    type: String,
    default: 'smile'
  },
  // 消息列表
  messages: {
    type: Array,
    default: () => []
  },
  // 是否加载中
  isLoading: {
    type: Boolean,
    default: false
  },
  // 是否展开
  expanded: {
    type: Boolean,
    default: false
  },
  // 消息区域高度
  messageAreaHeight: {
    type: Number,
    default: 400
  },
  // 输入占位符
  inputPlaceholder: {
    type: String,
    default: '跟我说说话吧...'
  },
  // 空状态提示
  emptyPrompt: {
    type: String,
    default: ''
  },
  // 是否显示语音按钮
  showVoiceBtn: {
    type: Boolean,
    default: false
  },
  // 是否显示快速回复
  showQuickReplies: {
    type: Boolean,
    default: true
  },
  // 快速回复列表
  quickReplies: {
    type: Array,
    default: () => ['今天有什么好玩的？', '我想聊天', '给我讲个故事']
  },
  // 是否显示心情指示器
  showMoodIndicator: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits([
  'send', 
  'quick-reply', 
  'action-click',
  'expand',
  'collapse',
  'avatar-click'
])

// 状态
const isExpanded = ref(props.expanded)
const inputText = ref('')
const scrollTop = ref(0)
const isInputFocused = ref(false)

// 心情图标映射
const moodIcons = {
  happy: '😊',
  encouraging: '🤗',
  excited: '🤩',
  calm: '😌',
  sad: '😢',
  worried: '😟'
}

// 默认空状态提示
const defaultEmptyPrompt = computed(() => {
  const prompts = [
    '有什么想跟我说的吗？',
    '今天过得怎么样？',
    '我来陪你了！',
    '想聊些什么呢？'
  ]
  return prompts[Math.floor(Math.random() * prompts.length)]
})

// 计算属性
const currentMood = computed(() => props.mood)
const currentExpression = computed(() => props.expression)
const moodIcon = computed(() => moodIcons[props.mood] || '😊')

const statusText = computed(() => {
  if (props.isLoading) {
    return '思考中...'
  }
  if (props.messages.length > 0) {
    return '在线'
  }
  return '陪我聊聊天吧'
})

// 监听展开状态
watch(() => props.expanded, (newVal) => {
  isExpanded.value = newVal
  if (newVal) {
    nextTick(() => {
      scrollToBottom()
    })
  }
})

// 监听消息变化，自动滚动到底部
watch(() => props.messages.length, () => {
  if (isExpanded.value) {
    nextTick(() => {
      scrollToBottom()
    })
  }
})

// 切换展开状态
function toggleExpand() {
  isExpanded.value = !isExpanded.value
  emit(isExpanded.value ? 'expand' : 'collapse')
  
  if (isExpanded.value) {
    nextTick(() => {
      scrollToBottom()
    })
  }
}

// 滚动到底部
function scrollToBottom() {
  scrollTop.value = scrollTop.value + 1000
}

// 处理滚动
function handleScroll(e) {
  // 可以在这里实现加载更多
}

// 发送消息
function handleSend() {
  const text = inputText.value.trim()
  if (!text) return
  
  emit('send', text)
  inputText.value = ''
}

// 快速回复
function handleQuickReply(reply) {
  emit('quick-reply', reply)
}

// 处理动作点击
function handleActionClick(action) {
  emit('action-click', action)
}

// 处理头像点击
function handleAvatarClick() {
  emit('avatar-click')
}

// 处理输入聚焦
function handleInputFocus() {
  isInputFocused.value = true
}

// 处理输入失焦
function handleInputBlur() {
  isInputFocused.value = false
}

// 语音输入 (预留接口)
function handleVoiceInput() {
  // #ifdef MP-WEIXIN
  // 可以调用微信录音接口
  // #endif
}

// 展开
function expand() {
  isExpanded.value = true
  emit('expand')
}

// 折叠
function collapse() {
  isExpanded.value = false
  emit('collapse')
}

// 停止加载
function stopLoading() {
  // 通过父组件控制
}

defineExpose({
  expand,
  collapse,
  scrollToBottom,
  isExpanded
})
</script>

<style scoped>
.buddy-chat {
  background: #FFFFFF;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: all 0.3s ease;
}

.buddy-chat.is-expanded {
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.12);
}

/* 头部 */
.chat-header {
  display: flex;
  align-items: center;
  padding: 20rpx;
  gap: 16rpx;
  cursor: pointer;
}

.header-left {
  flex-shrink: 0;
}

.header-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.buddy-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #374151;
}

.buddy-status {
  font-size: 22rpx;
  color: #9CA3AF;
}

.header-right {
  padding: 0 16rpx;
}

.expand-icon {
  font-size: 24rpx;
  color: #9CA3AF;
}

/* 消息区域 */
.chat-messages {
  padding: 0 20rpx;
  overflow: hidden;
}

.message-scroll {
  height: 100%;
  max-height: 600rpx;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60rpx 20rpx;
  gap: 16rpx;
}

.empty-icon {
  font-size: 80rpx;
}

.empty-text {
  font-size: 26rpx;
  color: #9CA3AF;
  text-align: center;
}

/* 消息项 */
.message-item {
  margin-bottom: 24rpx;
}

.message-ai {
  display: flex;
  align-items: flex-start;
  gap: 12rpx;
}

.message-user {
  display: flex;
  align-items: flex-start;
  gap: 12rpx;
  flex-direction: row-reverse;
}

.ai-avatar-small,
.user-avatar-small {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  flex-shrink: 0;
}

.ai-avatar-small {
  background: linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%);
}

.user-avatar-small {
  background: linear-gradient(135deg, #34D399 0%, #10B981 100%);
}

.message-bubble {
  max-width: 480rpx;
  padding: 16rpx 20rpx;
  border-radius: 20rpx;
  position: relative;
}

.ai-bubble {
  background: #F3F4F6;
  border-top-left-radius: 8rpx;
}

.user-bubble {
  background: linear-gradient(135deg, #7C3AED 0%, #EC4899 100%);
  color: #FFFFFF;
  border-top-right-radius: 8rpx;
}

.message-text {
  font-size: 28rpx;
  line-height: 1.5;
  color: #374151;
}

.user-bubble .message-text {
  color: #FFFFFF;
}

.message-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  margin-top: 12rpx;
}

.action-btn {
  padding: 6rpx 16rpx;
  background: #FFFFFF;
  border-radius: 16rpx;
  font-size: 22rpx;
  color: #7C3AED;
}

/* 加载指示 */
.loading-indicator {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 16rpx 0;
}

.loading-icon {
  font-size: 32rpx;
  animation: bounce 0.6s infinite alternate;
}

.loading-dots {
  font-size: 28rpx;
  color: #9CA3AF;
}

@keyframes bounce {
  from { transform: translateY(0); }
  to { transform: translateY(-8rpx); }
}

/* 输入区域 */
.chat-input-area {
  padding: 16rpx 20rpx 20rpx;
  border-top: 1rpx solid #F3F4F6;
}

.input-wrapper {
  display: flex;
  align-items: center;
  gap: 12rpx;
  background: #F9FAFB;
  border-radius: 40rpx;
  padding: 8rpx 8rpx 8rpx 24rpx;
}

.chat-input {
  flex: 1;
  height: 64rpx;
  font-size: 28rpx;
  color: #374151;
}

.voice-btn {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: #7C3AED;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
}

/* 快速回复 */
.quick-replies {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 16rpx;
}

.quick-reply {
  padding: 10rpx 20rpx;
  background: #F3F4F6;
  border-radius: 24rpx;
  font-size: 24rpx;
  color: #6B7280;
}

.quick-reply:active {
  background: #E5E7EB;
}

/* 心情指示器 */
.mood-indicator {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 0 20rpx 16rpx;
}

.mood-icon-small {
  font-size: 28rpx;
}

.mood-hint {
  font-size: 22rpx;
  color: #9CA3AF;
}
</style>
