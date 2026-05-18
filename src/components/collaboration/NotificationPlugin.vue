<!-- V21 NotificationPlugin — 可插拔通知渠道管理组件 -->
<template>
  <view class="notification-plugin">
    <!-- 标题 -->
    <view class="section-header">
      <text class="header-title">通知渠道</text>
      <text class="header-desc">可插拔通知插件架构</text>
    </view>

    <!-- 插件列表 -->
    <view class="plugin-list">
      <!-- App 推送插件 -->
      <view class="plugin-item" :class="{ enabled: plugins.app }">
        <view class="plugin-icon">📱</view>
        <view class="plugin-info">
          <text class="plugin-name">App 推送</text>
          <text class="plugin-status">{{ plugins.app ? '已启用' : '已禁用' }}</text>
        </view>
        <switch 
          class="plugin-switch"
          :checked="plugins.app"
          @change="(e) => onToggle('app', e.detail.value)"
          color="#059669"
        />
      </view>

      <!-- SMS 插件 -->
      <view class="plugin-item" :class="{ enabled: plugins.sms }">
        <view class="plugin-icon">💬</view>
        <view class="plugin-info">
          <text class="plugin-name">短信通知</text>
          <text class="plugin-status">{{ plugins.sms ? '已启用' : '已禁用' }}</text>
        </view>
        <switch 
          class="plugin-switch"
          :checked="plugins.sms"
          @change="(e) => onToggle('sms', e.detail.value)"
          color="#059669"
        />
      </view>

      <!-- Email 插件 -->
      <view class="plugin-item" :class="{ enabled: plugins.email }">
        <view class="plugin-icon">📧</view>
        <view class="plugin-info">
          <text class="plugin-name">邮件通知</text>
          <text class="plugin-status">{{ plugins.email ? '已启用' : '已禁用' }}</text>
        </view>
        <switch 
          class="plugin-switch"
          :checked="plugins.email"
          @change="(e) => onToggle('email', e.detail.value)"
          color="#059669"
        />
      </view>
    </view>

    <!-- 架构说明 -->
    <view class="architecture-info">
      <text class="info-title">💡 架构说明</text>
      <text class="info-text">
        基于 Nanobot Plugin System 设计，支持热插拔通知渠道。
        切换插件后，NotificationBus 自动将消息分发到启用的渠道。
      </text>
    </view>
  </view>
</template>

<script>
import { reactive, onMounted } from 'vue'

export default {
  props: {
    modelValue: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit }) {
    const plugins = reactive({
      app: true,
      sms: false,
      email: false
    })

    onMounted(() => {
      // 从 NotificationBus 获取初始状态
      if (typeof uni !== 'undefined' && uni.$getNotificationBus) {
        const bus = uni.$getNotificationBus()
        if (bus) {
          const status = bus.getChannelStatus()
          Object.assign(plugins, status)
        }
      }
    })

    const onToggle = (channel, enabled) => {
      plugins[channel] = enabled
      emit('update:modelValue', { ...plugins })
      emit('change', { channel, enabled })
    }

    return {
      plugins,
      onToggle
    }
  }
}
</script>

<style scoped>
.notification-plugin {
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 24rpx;
}

.section-header {
  margin-bottom: 20rpx;
}

.header-title {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 8rpx;
}

.header-desc {
  font-size: 24rpx;
  color: #999;
}

.plugin-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.plugin-item {
  display: flex;
  align-items: center;
  padding: 20rpx 24rpx;
  background: #FAFAFA;
  border-radius: 12rpx;
  border: 2rpx solid transparent;
  transition: all 150ms;
}

.plugin-item.enabled {
  background: #F0FDF4;
  border-color: #059669;
}

.plugin-icon {
  font-size: 48rpx;
  margin-right: 20rpx;
}

.plugin-info {
  flex: 1;
}

.plugin-name {
  display: block;
  font-size: 28rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 4rpx;
}

.plugin-status {
  font-size: 22rpx;
  color: #999;
}

.plugin-item.enabled .plugin-status {
  color: #059669;
}

.plugin-switch {
  transform: scale(0.8);
}

.architecture-info {
  margin-top: 24rpx;
  padding: 20rpx;
  background: #F8F8FF;
  border-radius: 12rpx;
}

.info-title {
  display: block;
  font-size: 26rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 12rpx;
}

.info-text {
  display: block;
  font-size: 24rpx;
  color: #666;
  line-height: 1.6;
}
</style>
