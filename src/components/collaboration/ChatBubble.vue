<!-- V21 ChatBubble — 聊天消息气泡组件 -->
<template>
  <view class="chat-bubble" :class="{ 'is-me': isMe, 'is-teacher': isTeacher }">
    <!-- 头像 -->
    <image 
      v-if="!isMe" 
      :src="avatar || '/static/default-avatar.png'" 
      class="avatar"
    />
    
    <!-- 消息内容 -->
    <view class="bubble-content">
      <!-- 文本消息 -->
      <text class="message-text" v-if="message.type === 'text'">{{ message.content }}</text>
      
      <!-- 图片消息 -->
      <image 
        v-else-if="message.type === 'image'" 
        :src="message.content" 
        class="message-image"
        mode="aspectFill"
        @tap="previewImage"
      />
      
      <!-- 语音消息 -->
      <view class="message-voice" v-else-if="message.type === 'voice'">
        <text class="voice-icon">🎵</text>
        <text class="voice-duration">{{ message.duration || 0 }}"</text>
      </view>

      <!-- 时间戳 -->
      <text class="time-stamp">{{ formattedTime }}</text>
      
      <!-- 已读回执 -->
      <text class="read-receipt" v-if="isMe && message.read">已读</text>
    </view>
  </view>
</template>

<script>
import { computed } from 'vue'

export default {
  props: {
    message: {
      type: Object,
      required: true
    },
    avatar: {
      type: String,
      default: ''
    }
  },
  setup(props) {
    const isMe = computed(() => props.message.role === 'me')
    const isTeacher = computed(() => props.message.role === 'teacher')

    const formattedTime = computed(() => {
      const date = new Date(props.message.createdAt)
      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')
      return `${hours}:${minutes}`
    })

    const previewImage = () => {
      if (props.message.type === 'image') {
        uni.previewImage({
          urls: [props.message.content],
          current: props.message.content
        })
      }
    }

    return {
      isMe,
      isTeacher,
      formattedTime,
      previewImage
    }
  }
}
</script>

<style scoped>
.chat-bubble {
  display: flex;
  align-items: flex-end;
  margin-bottom: 24rpx;
  padding: 0 24rpx;
}

.chat-bubble.is-me {
  flex-direction: row-reverse;
}

.avatar {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: #f0f0f0;
  flex-shrink: 0;
  margin: 0 16rpx;
}

.bubble-content {
  max-width: 560rpx;
  position: relative;
}

.message-text {
  display: block;
  padding: 20rpx 28rpx;
  border-radius: 24rpx;
  font-size: 28rpx;
  line-height: 1.5;
  word-break: break-all;
}

/* 对方消息 */
.chat-bubble:not(.is-me) .message-text {
  background: #FFFFFF;
  color: #333;
  border-bottom-left-radius: 8rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

/* 我的消息 */
.chat-bubble.is-me .message-text {
  background: #059669;
  color: #FFFFFF;
  border-bottom-right-radius: 8rpx;
}

.message-image {
  width: 300rpx;
  height: 300rpx;
  border-radius: 16rpx;
}

.message-voice {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 20rpx 28rpx;
  background: #FFFFFF;
  border-radius: 24rpx;
  min-width: 160rpx;
}

.is-me .message-voice {
  background: #059669;
}

.voice-icon {
  font-size: 32rpx;
}

.voice-duration {
  font-size: 24rpx;
  color: #666;
}

.is-me .voice-duration {
  color: rgba(255, 255, 255, 0.8);
}

.time-stamp {
  display: block;
  font-size: 20rpx;
  color: #999;
  margin-top: 8rpx;
  text-align: right;
}

.is-me .time-stamp {
  text-align: right;
}

.is-teacher .time-stamp {
  text-align: left;
}

.read-receipt {
  position: absolute;
  bottom: 4rpx;
  right: 8rpx;
  font-size: 20rpx;
  color: #059669;
}
</style>
