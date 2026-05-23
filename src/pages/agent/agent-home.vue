<template>
  <view class="agent-home">
    <!-- 页面标题 -->
    <view class="page-header">
      <text class="page-title">AI 学习助手</text>
      <text class="page-subtitle">选择你想要学习的Agent</text>
    </view>

    <!-- Agent选择网格 -->
    <view class="agent-grid">
      <view 
        v-for="agent in agentList" 
        :key="agent.type"
        class="agent-card"
        :class="{ active: currentAgent === agent.type }"
        @click="selectAgent(agent.type)"
      >
        <view class="agent-icon">{{ agent.icon }}</view>
        <view class="agent-name">{{ agent.name }}</view>
        <view class="agent-desc">{{ agent.description }}</view>
      </view>
    </view>

    <!-- 聊天区域 -->
    <view class="chat-section">
      <!-- 当前Agent显示 -->
      <view v-if="currentAgent" class="current-agent-bar">
        <text class="current-label">当前：{{ activeAgentName }}</text>
        <text class="change-btn" @click="currentAgent = null">切换</text>
      </view>

      <!-- 消息列表 -->
      <scroll-view 
        class="message-list" 
        scroll-y 
        :scroll-top="scrollTop"
        :show-scrollbar="false"
      >
        <view 
          v-for="msg in conversationHistory" 
          :key="msg.id"
          class="message-item"
          :class="msg.type"
        >
          <view v-if="msg.type === 'user'" class="message-bubble user">
            <text class="message-text">{{ msg.message }}</text>
          </view>
          <view v-else-if="msg.type === 'ai'" class="message-bubble ai">
            <text class="message-agent" v-if="msg.agent">{{ getAgentName(msg.agent) }}</text>
            <text class="message-text">{{ formatMessage(msg.message) }}</text>
          </view>
          <view v-else-if="msg.type === 'system'" class="message-bubble system">
            <text class="message-text">{{ msg.message }}</text>
          </view>
        </view>
      </scroll-view>

      <!-- 输入区域 -->
      <view class="input-section">
        <input 
          v-model="inputMessage" 
          class="message-input"
          placeholder="输入你想学习的内容..."
          confirm-type="send"
          @confirm="sendMessage"
        />
        <button 
          class="send-btn" 
          :disabled="!inputMessage || isLoading"
          @click="sendMessage"
        >
          <text v-if="isLoading" class="loading-icon">...</text>
          <text v-else>发送</text>
        </button>
      </view>
    </view>

    <!-- 加载状态 -->
    <view v-if="isLoading" class="loading-overlay">
      <view class="loading-spinner"></view>
      <text class="loading-text">思考中...</text>
    </view>
  </view>
</template>

<script>
import { useAgentStore } from '@/stores/agentStore.js'
import { AGENT_TYPES } from '@/services/agent/agentProtocol.js'

export default {
  data() {
    return {
      inputMessage: '',
      scrollTop: 0,
      agentList: [
        {
          type: AGENT_TYPES.MATH,
          name: '数学Agent',
          icon: '🧮',
          description: '加减乘除游戏化学习'
        },
        {
          type: AGENT_TYPES.CHINESE,
          name: '语文Agent',
          icon: '📚',
          description: '拼音识字笔画顺序'
        },
        {
          type: AGENT_TYPES.ENGLISH,
          name: '英语Agent',
          icon: '🔤',
          description: '单词记忆口语对话'
        },
        {
          type: AGENT_TYPES.LIFE,
          name: '生活Agent',
          icon: '🌟',
          description: '生活习惯时间管理'
        }
      ]
    }
  },
  computed: {
    agentStore() {
      return useAgentStore()
    },
    currentAgent() {
      return this.agentStore.currentAgent
    },
    activeAgentName() {
      return this.agentStore.activeAgentName || '智能助手'
    },
    conversationHistory() {
      return this.agentStore.conversationHistory
    },
    isLoading() {
      return this.agentStore.isLoading
    }
  },
  onLoad() {
    this.initAgent()
  },
  onUnload() {
    // 页面卸载时保留会话
  },
  methods: {
    async initAgent() {
      if (!this.agentStore.isInitialized) {
        await this.agentStore.initialize()
      }
    },
    selectAgent(agentType) {
      this.agentStore.selectAgent(agentType)
    },
    async sendMessage() {
      if (!this.inputMessage.trim()) return
      
      const message = this.inputMessage
      this.inputMessage = ''
      
      const response = await this.agentStore.sendMessage(message)
      
      if (response) {
        this.scrollToBottom()
      }
    },
    scrollToBottom() {
      this.$nextTick(() => {
        this.scrollTop = this.scrollTop + 100
      })
    },
    formatMessage(message) {
      if (!message) return ''
      if (typeof message === 'string') return message
      if (message.message) return message.message
      if (message.problem) {
        return `数学题：${message.problem.a} ${message.problem.symbol} ${message.problem.b} = ?`
      }
      return JSON.stringify(message)
    },
    getAgentName(agentType) {
      const names = {
        [AGENT_TYPES.MATH]: '数学Agent',
        [AGENT_TYPES.CHINESE]: '语文Agent',
        [AGENT_TYPES.ENGLISH]: '英语Agent',
        [AGENT_TYPES.LIFE]: '生活Agent',
        'coordinator': '智能助手'
      }
      return names[agentType] || 'AI助手'
    }
  }
}
</script>

<style scoped>
.agent-home {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20rpx;
}

.page-header {
  padding: 40rpx 20rpx;
  text-align: center;
}

.page-title {
  display: block;
  font-size: 48rpx;
  font-weight: bold;
  color: #ffffff;
  text-shadow: 2rpx 2rpx 4rpx rgba(0, 0, 0, 0.2);
}

.page-subtitle {
  display: block;
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
  margin-top: 10rpx;
}

.agent-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
  padding: 20rpx;
}

.agent-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24rpx;
  padding: 30rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.agent-card:active {
  transform: scale(0.95);
}

.agent-card.active {
  border: 4rpx solid #ffd700;
  background: linear-gradient(135deg, #fff9e6 0%, #ffffff 100%);
}

.agent-icon {
  font-size: 60rpx;
  margin-bottom: 16rpx;
}

.agent-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.agent-desc {
  font-size: 24rpx;
  color: #666;
  text-align: center;
}

.chat-section {
  flex: 1;
  background: rgba(255, 255, 255, 0.98);
  border-radius: 32rpx 32rpx 0 0;
  margin-top: auto;
  display: flex;
  flex-direction: column;
  min-height: 500rpx;
  max-height: 800rpx;
}

.current-agent-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 30rpx;
  background: #f8f8f8;
  border-radius: 32rpx 32rpx 0 0;
  border-bottom: 1rpx solid #eee;
}

.current-label {
  font-size: 28rpx;
  color: #667eea;
  font-weight: bold;
}

.change-btn {
  font-size: 26rpx;
  color: #999;
}

.message-list {
  flex: 1;
  padding: 20rpx;
  overflow-y: auto;
}

.message-item {
  margin-bottom: 20rpx;
  display: flex;
}

.message-item.user {
  justify-content: flex-end;
}

.message-item.ai,
.message-item.system {
  justify-content: flex-start;
}

.message-bubble {
  max-width: 80%;
  padding: 20rpx 24rpx;
  border-radius: 24rpx;
  word-break: break-word;
}

.message-bubble.user {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-bottom-right-radius: 8rpx;
}

.message-bubble.ai {
  background: #f0f0f0;
  color: #333;
  border-bottom-left-radius: 8rpx;
}

.message-bubble.system {
  background: #fff3cd;
  color: #856404;
  font-size: 26rpx;
  text-align: center;
  margin: 0 auto;
}

.message-agent {
  display: block;
  font-size: 24rpx;
  color: #667eea;
  margin-bottom: 8rpx;
}

.message-text {
  font-size: 28rpx;
  line-height: 1.5;
}

.input-section {
  display: flex;
  padding: 20rpx;
  background: #fff;
  border-top: 1rpx solid #eee;
  gap: 16rpx;
}

.message-input {
  flex: 1;
  height: 80rpx;
  background: #f5f5f5;
  border-radius: 40rpx;
  padding: 0 30rpx;
  font-size: 28rpx;
}

.send-btn {
  width: 140rpx;
  height: 80rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
}

.send-btn[disabled] {
  background: #ccc;
}

.loading-icon {
  font-size: 32rpx;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-spinner {
  width: 80rpx;
  height: 80rpx;
  border: 6rpx solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  color: #fff;
  font-size: 28rpx;
  margin-top: 20rpx;
}
</style>