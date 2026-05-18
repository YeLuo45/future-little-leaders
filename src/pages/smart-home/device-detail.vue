<template>
  <view class="device-detail">
    <!-- Header -->
    <view class="detail-header">
      <button class="btn-back" @click="goBack">←</button>
      <text class="header-title">设备详情</text>
    </view>

    <!-- Device Info -->
    <view class="device-info-card">
      <view class="device-icon-large">
        <text>{{ getDeviceIcon(device.type) }}</text>
      </view>
      <view class="device-meta">
        <text class="device-name">{{ device.name }}</text>
        <text class="device-room">{{ device.room }}</text>
        <view class="status-badge" :class="device.status">
          <text>{{ device.status === 'online' ? '在线' : '离线' }}</text>
        </view>
      </view>
    </view>

    <!-- Quick Control -->
    <view class="control-section">
      <text class="section-title">快捷控制</text>
      <view class="control-buttons">
        <view 
          class="control-btn" 
          :class="{ active: device.state.on }"
          @click="turnOn"
        >
          <text class="btn-icon">💡</text>
          <text class="btn-text">开</text>
        </view>
        <view 
          class="control-btn"
          :class="{ active: !device.state.on }"
          @click="turnOff"
        >
          <text class="btn-icon">🔅</text>
          <text class="btn-text">关</text>
        </view>
        <view 
          class="control-btn"
          @click="toggleDevice"
        >
          <text class="btn-icon">🔄</text>
          <text class="btn-text">切换</text>
        </view>
      </view>
    </view>

    <!-- Light Controls -->
    <view class="control-section" v-if="device.type === 'light'">
      <text class="section-title">亮度调节</text>
      <view class="slider-control">
        <slider 
          :value="device.state.brightness || 100" 
          min="0" 
          max="100" 
          show-value
          @change="onBrightnessChange"
        />
      </view>
    </view>

    <!-- AC Controls -->
    <view class="control-section" v-if="device.type === 'ac'">
      <text class="section-title">温度调节</text>
      <view class="temp-control">
        <view class="temp-btn" @click="decreaseTemp">➖</view>
        <text class="temp-value">{{ device.state.temperature || 26 }}°C</text>
        <view class="temp-btn" @click="increaseTemp">➕</view>
      </view>
    </view>

    <!-- Speaker Controls -->
    <view class="control-section" v-if="device.type === 'speaker'">
      <text class="section-title">音乐控制</text>
      <view class="music-control">
        <view class="music-btn" @click="playMusic">
          <text>▶️</text>
          <text class="btn-text">播放</text>
        </view>
        <view class="music-btn" @click="stopMusic">
          <text>⏹️</text>
          <text class="btn-text">停止</text>
        </view>
      </view>
      <view class="track-info" v-if="device.state.track">
        <text class="track-label">当前曲目：</text>
        <text class="track-name">{{ device.state.track }}</text>
      </view>
    </view>

    <!-- Device Properties -->
    <view class="control-section">
      <text class="section-title">设备信息</text>
      <view class="info-list">
        <view class="info-item">
          <text class="info-label">设备类型</text>
          <text class="info-value">{{ getTypeName(device.type) }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">制造商</text>
          <text class="info-value">{{ device.manufacturer || '未知' }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">型号</text>
          <text class="info-value">{{ device.model || '未知' }}</text>
        </view>
        <view class="info-item" v-if="device.haEntityId">
          <text class="info-label">HA Entity</text>
          <text class="info-value">{{ device.haEntityId }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">最后更新</text>
          <text class="info-value">{{ formatTime(device.updatedAt) }}</text>
        </view>
      </view>
    </view>

    <!-- Linked Rules -->
    <view class="control-section">
      <text class="section-title">联动规则</text>
      <view v-if="linkedRules.length === 0" class="empty-hint">
        <text>暂无关联规则</text>
        <button class="btn-link" @click="createRule">创建联动规则</button>
      </view>
      <view v-else class="rules-list">
        <view v-for="rule in linkedRules" :key="rule.id" class="linked-rule">
          <text class="rule-name">{{ rule.name }}</text>
          <switch :checked="rule.enabled" @change="toggleRule(rule)" />
        </view>
      </view>
    </view>

    <!-- Actions -->
    <view class="action-section">
      <button class="btn-action" @click="editDevice">编辑设备</button>
      <button class="btn-action btn-danger" @click="deleteDeviceConfirm">删除设备</button>
    </view>
  </view>
</template>

<script>
import { useSmartHomeStore } from '../../stores/smartHomeStore'

export default {
  data() {
    return {
      deviceId: '',
      device: {
        id: '',
        name: '',
        type: 'light',
        room: '',
        status: 'offline',
        state: { on: false }
      }
    }
  },
  
  computed: {
    store() {
      return useSmartHomeStore()
    },
    
    linkedRules() {
      return this.store.state.rules.filter(r => 
        r.actions && r.actions.some(a => a.deviceId === this.deviceId)
      )
    }
  },
  
  onLoad(options) {
    if (options.id) {
      this.deviceId = options.id
      this.loadDevice()
    }
  },
  
  methods: {
    loadDevice() {
      const found = this.store.state.devices.find(d => d.id === this.deviceId)
      if (found) {
        this.device = { ...found }
      } else {
        // Try to reload from storage
        this.store.loadDevices()
        const reloaded = this.store.state.devices.find(d => d.id === this.deviceId)
        if (reloaded) {
          this.device = { ...reloaded }
        }
      }
    },
    
    getDeviceIcon(type) {
      const icons = {
        light: '💡',
        socket: '🔌',
        ac: '❄️',
        speaker: '🔊',
        sensor: '📡',
        switch: '🔘'
      }
      return icons[type] || '📱'
    },
    
    getTypeName(type) {
      const names = {
        light: '灯',
        socket: '插座',
        ac: '空调',
        speaker: '音箱',
        sensor: '传感器',
        switch: '开关'
      }
      return names[type] || type
    },
    
    formatTime(isoString) {
      if (!isoString) return '未知'
      const date = new Date(isoString)
      return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
    },
    
    goBack() {
      uni.navigateBack()
    },
    
    async turnOn() {
      try {
        await this.store.controlDevice(this.deviceId, 'turn_on')
        this.device.state.on = true
        uni.showToast({ title: '已开启', icon: 'success' })
      } catch (error) {
        uni.showToast({ title: error.message, icon: 'none' })
      }
    },
    
    async turnOff() {
      try {
        await this.store.controlDevice(this.deviceId, 'turn_off')
        this.device.state.on = false
        uni.showToast({ title: '已关闭', icon: 'success' })
      } catch (error) {
        uni.showToast({ title: error.message, icon: 'none' })
      }
    },
    
    async toggleDevice() {
      const action = this.device.state.on ? 'turn_off' : 'turn_on'
      try {
        await this.store.controlDevice(this.deviceId, action)
        this.device.state.on = !this.device.state.on
        uni.showToast({ title: this.device.state.on ? '已开启' : '已关闭', icon: 'success' })
      } catch (error) {
        uni.showToast({ title: error.message, icon: 'none' })
      }
    },
    
    onBrightnessChange(e) {
      this.setBrightness(e.detail.value)
    },
    
    async setBrightness(value) {
      try {
        await this.store.controlDevice(this.deviceId, 'set_brightness', { brightness: value })
        this.device.state.brightness = value
      } catch (error) {
        uni.showToast({ title: error.message, icon: 'none' })
      }
    },
    
    async increaseTemp() {
      const newTemp = (this.device.state.temperature || 26) + 1
      await this.setTemperature(newTemp)
    },
    
    async decreaseTemp() {
      const newTemp = (this.device.state.temperature || 26) - 1
      await this.setTemperature(newTemp)
    },
    
    async setTemperature(value) {
      try {
        await this.store.controlDevice(this.deviceId, 'set_temperature', { temperature: value })
        this.device.state.temperature = value
      } catch (error) {
        uni.showToast({ title: error.message, icon: 'none' })
      }
    },
    
    async playMusic() {
      try {
        await this.store.controlDevice(this.deviceId, 'play_music', { track: '默认音乐' })
        this.device.state.playing = true
        this.device.state.track = '默认音乐'
        uni.showToast({ title: '正在播放', icon: 'success' })
      } catch (error) {
        uni.showToast({ title: error.message, icon: 'none' })
      }
    },
    
    async stopMusic() {
      try {
        await this.store.controlDevice(this.deviceId, 'stop_music')
        this.device.state.playing = false
        uni.showToast({ title: '已停止', icon: 'success' })
      } catch (error) {
        uni.showToast({ title: error.message, icon: 'none' })
      }
    },
    
    async toggleRule(rule) {
      await this.store.toggleRule(rule.id)
    },
    
    createRule() {
      uni.navigateTo({
        url: `/pages/smart-home/automation-rules?deviceId=${this.deviceId}`
      })
    },
    
    editDevice() {
      uni.showToast({ title: '编辑功能开发中', icon: 'none' })
    },
    
    deleteDeviceConfirm() {
      uni.showModal({
        title: '确认删除',
        content: `确定要删除设备"${this.device.name}"吗？`,
        success: async (res) => {
          if (res.confirm) {
            try {
              this.store.service.deleteDevice(this.deviceId)
              uni.showToast({ title: '已删除', icon: 'success' })
              setTimeout(() => this.goBack(), 1000)
            } catch (error) {
              uni.showToast({ title: error.message, icon: 'none' })
            }
          }
        }
      })
    }
  }
}
</script>

<style scoped>
.device-detail {
  min-height: 100vh;
  background: var(--bg-main, #f5f5f5);
  padding-bottom: 40rpx;
}

.detail-header {
  display: flex;
  align-items: center;
  padding: 30rpx;
  background: var(--bg-card, #fff);
}

.btn-back {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: var(--bg-main, #f5f5f5);
  border: none;
  font-size: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-title {
  margin-left: 20rpx;
  font-size: 36rpx;
  font-weight: bold;
  color: var(--text-main, #333);
}

.device-info-card {
  display: flex;
  align-items: center;
  padding: 40rpx 30rpx;
  background: var(--bg-card, #fff);
  margin: 20rpx;
  border-radius: 20rpx;
}

.device-icon-large {
  width: 120rpx;
  height: 120rpx;
  border-radius: 30rpx;
  background: var(--bg-main, #f5f5f5);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 60rpx;
}

.device-meta {
  margin-left: 30rpx;
  flex: 1;
}

.device-name {
  font-size: 36rpx;
  font-weight: bold;
  color: var(--text-main, #333);
  display: block;
}

.device-room {
  font-size: 26rpx;
  color: var(--text-secondary, #666);
  display: block;
  margin-top: 8rpx;
}

.status-badge {
  display: inline-block;
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  margin-top: 10rpx;
  background: #e0e0e0;
  color: #666;
}

.status-badge.online {
  background: #d4edda;
  color: #28a745;
}

.control-section {
  background: var(--bg-card, #fff);
  margin: 20rpx;
  border-radius: 20rpx;
  padding: 30rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: bold;
  color: var(--text-main, #333);
  display: block;
  margin-bottom: 20rpx;
}

.control-buttons {
  display: flex;
  gap: 20rpx;
}

.control-btn {
  flex: 1;
  height: 140rpx;
  border-radius: 20rpx;
  background: var(--bg-main, #f5f5f5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
}

.control-btn.active {
  background: var(--primary-color, #4a3aff);
}

.control-btn.active .btn-text {
  color: #fff;
}

.btn-icon {
  font-size: 48rpx;
}

.btn-text {
  font-size: 26rpx;
  color: var(--text-main, #333);
}

.slider-control {
  padding: 0 10rpx;
}

.temp-control {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 40rpx;
}

.temp-btn {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: var(--bg-main, #f5f5f5);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
}

.temp-value {
  font-size: 48rpx;
  font-weight: bold;
  color: var(--primary-color, #4a3aff);
  min-width: 150rpx;
  text-align: center;
}

.music-control {
  display: flex;
  gap: 20rpx;
}

.music-btn {
  flex: 1;
  height: 100rpx;
  border-radius: 20rpx;
  background: var(--bg-main, #f5f5f5);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  font-size: 32rpx;
}

.music-btn .btn-text {
  font-size: 28rpx;
}

.track-info {
  margin-top: 20rpx;
  padding: 16rpx;
  background: var(--bg-main, #f5f5f5);
  border-radius: 12rpx;
}

.track-label {
  font-size: 24rpx;
  color: var(--text-secondary, #666);
}

.track-name {
  font-size: 26rpx;
  color: var(--text-main, #333);
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 16rpx 0;
  border-bottom: 1rpx solid var(--border-color, #e0e0e0);
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 26rpx;
  color: var(--text-secondary, #666);
}

.info-value {
  font-size: 26rpx;
  color: var(--text-main, #333);
}

.empty-hint {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx;
  color: var(--text-tertiary, #999);
  gap: 10rpx;
}

.btn-link {
  color: var(--primary-color, #4a3aff);
  font-size: 26rpx;
  background: none;
  border: none;
}

.rules-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.linked-rule {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx;
  background: var(--bg-main, #f5f5f5);
  border-radius: 12rpx;
}

.rule-name {
  font-size: 26rpx;
  color: var(--text-main, #333);
}

.action-section {
  display: flex;
  gap: 20rpx;
  padding: 30rpx 20rpx;
}

.btn-action {
  flex: 1;
  height: 80rpx;
  border-radius: 40rpx;
  background: var(--primary-color, #4a3aff);
  color: #fff;
  font-size: 28rpx;
  border: none;
}

.btn-action.btn-danger {
  background: #ff4d4f;
}
</style>
