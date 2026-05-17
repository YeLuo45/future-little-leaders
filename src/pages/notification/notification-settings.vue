<!-- V7 通知设置 — 渠道偏好设置 -->
<template>
  <view class="page-container">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <view class="nav-left" @tap="goBack">
        <text class="icon">←</text>
      </view>
      <text class="nav-title">通知设置</text>
      <view class="nav-right">
        <text class="reset-btn" @tap="resetToDefault">重置</text>
      </view>
    </view>

    <!-- 免打扰时间段 -->
    <view class="section">
      <view class="section-title">免打扰设置</view>
      <view class="quiet-hours-card">
        <view class="quiet-hours-row">
          <text class="quiet-label">开启免打扰</text>
          <switch class="quiet-switch" :checked="quietHoursEnabled" @change="onQuietHoursToggle" color="#8B5CF6"/>
        </view>
        <view class="quiet-hours-row" v-if="quietHoursEnabled">
          <text class="quiet-label">开始时间</text>
          <picker mode="time" :value="quietHoursStart" @change="onStartTimeChange">
            <view class="picker-value">{{ quietHoursStart }}</view>
          </picker>
        </view>
        <view class="quiet-hours-row" v-if="quietHoursEnabled">
          <text class="quiet-label">结束时间</text>
          <picker mode="time" :value="quietHoursEnd" @change="onEndTimeChange">
            <view class="picker-value">{{ quietHoursEnd }}</view>
          </picker>
        </view>
        <text class="quiet-hint" v-if="quietHoursEnabled">在此时段内将静音推送通知</text>
      </view>
    </view>

    <!-- 渠道开关列表 -->
    <view class="section">
      <view class="section-title">通知渠道</view>
      <view class="channel-list">
        <ChannelSwitch
          v-for="channel in channels"
          :key="channel"
          :channel="channel"
          :enabled="preferences[channel] !== false"
          @change="onChannelToggle"
        />
      </view>
    </view>

    <!-- 保存按钮 -->
    <view class="save-bar">
      <button class="save-btn" @tap="savePreferences">保存设置</button>
    </view>
  </view>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import ChannelSwitch from '@/components/notification/ChannelSwitch.vue'

export default {
  components: { ChannelSwitch },
  setup() {
    const channels = [
      'task', 'achievement', 'points', 'reminder', 'flow',
      'skill_tree', 'streak', 'growth_report', 'family_broadcast',
      'system', 'sync', 'collaboration'
    ]

    const preferences = reactive({})
    const quietHoursEnabled = ref(false)
    const quietHoursStart = ref('22:00')
    const quietHoursEnd = ref('07:00')
    const currentBabyId = ref('')
    const hasChanges = ref(false)

    const loadPreferences = async () => {
      try {
        currentBabyId.value = uni.getStorageSync('currentBabyId') || ''
        
        const NotificationService = require('../../services/notificationService').default || require('../../services/notificationService')
        const prefs = await NotificationService.getPreferences(currentBabyId.value)
        
        // Initialize preferences
        channels.forEach(ch => {
          preferences[ch] = true
        })
        
        // Load saved preferences
        if (prefs && prefs.length > 0) {
          prefs.forEach(p => {
            preferences[p.channel] = p.enabled
          })
        }
      } catch (e) {
        console.error('加载偏好设置失败:', e)
      }
    }

    const onChannelToggle = ({ channel, enabled }) => {
      preferences[channel] = enabled
      hasChanges.value = true
    }

    const onQuietHoursToggle = (e) => {
      quietHoursEnabled.value = e.detail.value
      hasChanges.value = true
    }

    const onStartTimeChange = (e) => {
      quietHoursStart.value = e.detail.value
      hasChanges.value = true
    }

    const onEndTimeChange = (e) => {
      quietHoursEnd.value = e.detail.value
      hasChanges.value = true
    }

    const savePreferences = async () => {
      try {
        const NotificationService = require('../../services/notificationService').default || require('../../services/notificationService')
        
        // Save channel preferences
        for (const channel of channels) {
          await NotificationService.updatePreference(currentBabyId.value, channel, {
            enabled: preferences[channel]
          })
        }
        
        // Save quiet hours
        await NotificationService.updatePreference(currentBabyId.value, 'quiet_hours', {
          enabled: quietHoursEnabled.value,
          quietHoursStart: quietHoursStart.value,
          quietHoursEnd: quietHoursEnd.value
        })
        
        hasChanges.value = false
        uni.showToast({ title: '设置已保存', icon: 'success' })
      } catch (e) {
        console.error('保存失败:', e)
        uni.showToast({ title: '保存失败', icon: 'none' })
      }
    }

    const resetToDefault = () => {
      uni.showModal({
        title: '确认重置',
        content: '确定要重置所有设置为默认吗？',
        success: (res) => {
          if (res.confirm) {
            channels.forEach(ch => {
              preferences[ch] = true
            })
            quietHoursEnabled.value = false
            quietHoursStart.value = '22:00'
            quietHoursEnd.value = '07:00'
            hasChanges.value = true
            uni.showToast({ title: '已重置', icon: 'success' })
          }
        }
      })
    }

    const goBack = () => {
      if (hasChanges.value) {
        uni.showModal({
          title: '提示',
          content: '有未保存的更改，确定要返回吗？',
          success: (res) => {
            if (res.confirm) {
              uni.navigateBack()
            }
          }
        })
      } else {
        uni.navigateBack()
      }
    }

    onMounted(() => {
      loadPreferences()
    })

    return {
      channels,
      preferences,
      quietHoursEnabled,
      quietHoursStart,
      quietHoursEnd,
      onChannelToggle,
      onQuietHoursToggle,
      onStartTimeChange,
      onEndTimeChange,
      savePreferences,
      resetToDefault,
      goBack
    }
  }
}
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 120rpx;
}
.nav-bar {
  display: flex;
  align-items: center;
  height: 88rpx;
  background: linear-gradient(135deg, #8B5CF6, #7C3AED);
  padding: 90rpx 40rpx 60rpx;
  position: relative;
}
.nav-left { position: absolute; left: 30rpx; }
.icon { color: white; font-size: 48rpx; font-weight: bold; }
.nav-title { flex: 1; text-align: center; color: white; font-size: 36rpx; font-weight: bold; }
.nav-right { position: absolute; right: 30rpx; }
.reset-btn { color: rgba(255,255,255,0.8); font-size: 28rpx; }

.section {
  margin: 24rpx;
}
.section-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 16rpx;
  padding-left: 8rpx;
}

.quiet-hours-card {
  background: white;
  border-radius: 16rpx;
  padding: 24rpx;
}
.quiet-hours-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #F0F0F0;
}
.quiet-hours-row:last-child {
  border-bottom: none;
}
.quiet-label {
  font-size: 28rpx;
  color: #333;
}
.quiet-switch {
  transform: scale(0.8);
}
.picker-value {
  font-size: 28rpx;
  color: #8B5CF6;
}
.quiet-hint {
  font-size: 24rpx;
  color: #999;
  margin-top: 16rpx;
}

.channel-list {
  background: white;
  border-radius: 16rpx;
  overflow: hidden;
}

.save-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 24rpx 32rpx;
  background: white;
  border-top: 1rpx solid #F0F0F0;
}
.save-btn {
  background: linear-gradient(135deg, #8B5CF6, #7C3AED);
  color: white;
  border: none;
  border-radius: 40rpx;
  padding: 24rpx 0;
  font-size: 32rpx;
  font-weight: bold;
}
</style>