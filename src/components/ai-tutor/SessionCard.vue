<template>
  <view class="session-card" @click="handleClick">
    <view class="card-header">
      <view class="header-left">
        <text class="session-icon">📚</text>
        <view class="header-info">
          <text class="baby-name">{{ session.babyName || '小朋友' }}</text>
          <text class="session-time">{{ formatTime(session.updatedAt) }}</text>
        </view>
      </view>
      <view class="header-right">
        <text class="status-tag" :class="session.status">{{ session.status === 'active' ? '进行中' : '已结束' }}</text>
      </view>
    </view>

    <view class="card-content">
      <text class="preview-text">{{ lastMessage || '开始一段新的学习旅程吧~' }}</text>
    </view>

    <view class="card-footer">
      <view class="agent-badges">
        <text 
          v-for="agentId in displayedAgents" 
          :key="agentId"
          class="agent-badge"
        >{{ getAgentEmoji(agentId) }}</text>
        <text v-if="session.agents?.length > 3" class="more-badge">+{{ session.agents.length - 3 }}</text>
      </view>
      <text class="message-count">{{ session.messages?.length || 0 }} 条消息</text>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  session: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['click'])

// Agent emoji映射
const agentEmojis = {
  orchestrator: '🎓',
  math: '🔢',
  chinese: '📝',
  english: '🔤',
  life: '🏠'
}

// 显示的agents（最多显示3个）
const displayedAgents = computed(() => {
  return (props.session.agents || []).slice(0, 3)
})

// 最后一条消息预览
const lastMessage = computed(() => {
  const msgs = props.session.messages || []
  if (msgs.length === 0) return ''
  const last = msgs[msgs.length - 1]
  const content = last.content || ''
  return content.length > 50 ? content.substring(0, 50) + '...' : content
})

function getAgentEmoji(agentId) {
  return agentEmojis[agentId] || '🤖'
}

function formatTime(timestamp) {
  if (!timestamp) return ''
  
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date
  
  // 1分钟内
  if (diff < 60 * 1000) {
    return '刚刚'
  }
  
  // 1小时内
  if (diff < 60 * 60 * 1000) {
    const mins = Math.floor(diff / (60 * 1000))
    return `${mins}分钟前`
  }
  
  // 24小时内
  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000))
    return `${hours}小时前`
  }
  
  // 超过24小时显示日期
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${month}/${day}`
}

function handleClick() {
  emit('click', props.session)
}
</script>

<style scoped>
.session-card {
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16rpx;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.session-icon {
  font-size: 40rpx;
}

.header-info {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.baby-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #374151;
}

.session-time {
  font-size: 22rpx;
  color: #9CA3AF;
}

.status-tag {
  font-size: 20rpx;
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
}

.status-tag.active {
  background: #D1FAE5;
  color: #059669;
}

.status-tag.completed {
  background: #F3F4F6;
  color: #6B7280;
}

.card-content {
  margin-bottom: 16rpx;
}

.preview-text {
  font-size: 26rpx;
  color: #6B7280;
  line-height: 1.5;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.agent-badges {
  display: flex;
  gap: 8rpx;
}

.agent-badge {
  font-size: 24rpx;
  padding: 4rpx 8rpx;
  background: #F3F4F6;
  border-radius: 8rpx;
}

.more-badge {
  font-size: 20rpx;
  color: #9CA3AF;
  padding: 4rpx 8rpx;
}

.message-count {
  font-size: 20rpx;
  color: #9CA3AF;
}
</style>
