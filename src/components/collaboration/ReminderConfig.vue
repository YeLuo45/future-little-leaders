<!-- V21 ReminderConfig — 智能提醒配置组件 -->
<template>
  <view class="reminder-config">
    <!-- 标题 -->
    <view class="section-title">
      <text class="title-text">智能提醒</text>
      <text class="title-desc">自动根据任务完成情况发送提醒</text>
    </view>

    <!-- 提醒类型列表 -->
    <view class="reminder-list">
      <!-- 任务未完成提醒 -->
      <view class="reminder-item">
        <view class="reminder-header">
          <text class="reminder-icon">⏰</text>
          <view class="reminder-info">
            <text class="reminder-name">任务未完成提醒</text>
            <text class="reminder-desc">儿童任务未完成时自动提醒家长</text>
          </view>
        </view>
        <view class="channel-toggles">
          <view 
            class="channel-toggle"
            :class="{ active: config.taskIncomplete.app }"
            @tap="toggleChannel('taskIncomplete', 'app')"
          >
            <text class="channel-icon">📱</text>
            <text class="channel-label">App</text>
          </view>
          <view 
            class="channel-toggle"
            :class="{ active: config.taskIncomplete.sms }"
            @tap="toggleChannel('taskIncomplete', 'sms')"
          >
            <text class="channel-icon">💬</text>
            <text class="channel-label">SMS</text>
          </view>
          <view 
            class="channel-toggle"
            :class="{ active: config.taskIncomplete.email }"
            @tap="toggleChannel('taskIncomplete', 'email')"
          >
            <text class="channel-icon">📧</text>
            <text class="channel-label">Email</text>
          </view>
        </view>
      </view>

      <!-- 升级提醒 -->
      <view class="reminder-item escalation">
        <view class="reminder-header">
          <text class="reminder-icon">📢</text>
          <view class="reminder-info">
            <text class="reminder-name">升级提醒</text>
            <text class="reminder-desc">连续3天未完成任务，通知教师</text>
          </view>
          <view class="escalation-badge">⚠️ 高优先级</view>
        </view>
        <view class="channel-toggles">
          <view 
            class="channel-toggle"
            :class="{ active: config.escalation.app }"
            @tap="toggleChannel('escalation', 'app')"
          >
            <text class="channel-icon">📱</text>
            <text class="channel-label">App</text>
          </view>
          <view 
            class="channel-toggle"
            :class="{ active: config.escalation.sms }"
            @tap="toggleChannel('escalation', 'sms')"
          >
            <text class="channel-icon">💬</text>
            <text class="channel-label">SMS</text>
          </view>
          <view 
            class="channel-toggle"
            :class="{ active: config.escalation.email }"
            @tap="toggleChannel('escalation', 'email')"
          >
            <text class="channel-icon">📧</text>
            <text class="channel-label">Email</text>
          </view>
        </view>
      </view>

      <!-- 成就提醒 -->
      <view class="reminder-item">
        <view class="reminder-header">
          <text class="reminder-icon">🎉</text>
          <view class="reminder-info">
            <text class="reminder-name">成就达成通知</text>
            <text class="reminder-desc">儿童达成成就时通知家长</text>
          </view>
        </view>
        <view class="channel-toggles">
          <view 
            class="channel-toggle"
            :class="{ active: config.achievement.app }"
            @tap="toggleChannel('achievement', 'app')"
          >
            <text class="channel-icon">📱</text>
            <text class="channel-label">App</text>
          </view>
          <view 
            class="channel-toggle"
            :class="{ active: config.achievement.sms }"
            @tap="toggleChannel('achievement', 'sms')"
          >
            <text class="channel-icon">💬</text>
            <text class="channel-label">SMS</text>
          </view>
          <view 
            class="channel-toggle"
            :class="{ active: config.achievement.email }"
            @tap="toggleChannel('achievement', 'email')"
          >
            <text class="channel-icon">📧</text>
            <text class="channel-label">Email</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 测试按钮 -->
    <view class="test-section">
      <text class="test-label">测试提醒</text>
      <button class="test-btn" @tap="testReminder">发送测试通知</button>
    </view>
  </view>
</template>

<script>
import { reactive, watch } from 'vue'

export default {
  props: {
    modelValue: {
      type: Object,
      required: true
    }
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit }) {
    const config = reactive(props.modelValue || {
      taskIncomplete: { app: true, sms: false, email: false },
      escalation: { app: true, sms: true, email: false },
      achievement: { app: true, sms: false, email: false }
    })

    // 监听外部变化
    watch(() => props.modelValue, (val) => {
      if (val) {
        Object.assign(config, val)
      }
    }, { deep: true })

    const toggleChannel = (reminderType, channel) => {
      config[reminderType][channel] = !config[reminderType][channel]
      emit('update:modelValue', config)
      emit('change', { type: reminderType, channel, enabled: config[reminderType][channel] })
    }

    const testReminder = () => {
      uni.showToast({
        title: '测试通知已发送',
        icon: 'success'
      })
      uni.$emit('collab:testReminder', config)
    }

    return {
      config,
      toggleChannel,
      testReminder
    }
  }
}
</script>

<style scoped>
.reminder-config {
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 24rpx;
}

.section-title {
  margin-bottom: 24rpx;
}

.title-text {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 8rpx;
}

.title-desc {
  font-size: 24rpx;
  color: #999;
}

.reminder-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.reminder-item {
  background: #F8FFAF;
  border-radius: 12rpx;
  padding: 20rpx;
}

.reminder-item.escalation {
  background: #FFF5F5;
}

.reminder-header {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
  margin-bottom: 16rpx;
}

.reminder-icon {
  font-size: 40rpx;
  margin-top: 4rpx;
}

.reminder-info {
  flex: 1;
}

.reminder-name {
  display: block;
  font-size: 28rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 4rpx;
}

.reminder-desc {
  font-size: 22rpx;
  color: #666;
}

.escalation-badge {
  font-size: 20rpx;
  color: #F5222D;
  background: rgba(245, 34, 45, 0.1);
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
}

.channel-toggles {
  display: flex;
  gap: 16rpx;
}

.channel-toggle {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 20rpx;
  background: #FFFFFF;
  border-radius: 24rpx;
  border: 2rpx solid #E8E8E8;
  transition: all 150ms;
}

.channel-toggle.active {
  border-color: #059669;
  background: #F0FDF4;
}

.channel-icon {
  font-size: 28rpx;
}

.channel-label {
  font-size: 24rpx;
  color: #666;
}

.channel-toggle.active .channel-label {
  color: #059669;
  font-weight: 500;
}

.test-section {
  margin-top: 24rpx;
  padding-top: 24rpx;
  border-top: 1rpx solid #F0F0F0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.test-label {
  font-size: 26rpx;
  color: #666;
}

.test-btn {
  font-size: 24rpx;
  color: #059669;
  background: #F0FDF4;
  border: 1rpx solid #059669;
  padding: 12rpx 32rpx;
  border-radius: 24rpx;
  margin: 0;
}
</style>
