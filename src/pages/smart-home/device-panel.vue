<template>
  <view class="device-panel">
    <!-- Header -->
    <view class="panel-header">
      <text class="header-title">智能设备</text>
      <view class="header-actions">
        <button class="btn-icon" @click="refreshDevices" :disabled="isLoading">
          <text class="icon">🔄</text>
        </button>
        <button class="btn-icon" @click="showAddDevice = true">
          <text class="icon">➕</text>
        </button>
      </view>
    </view>

    <!-- Connection Status -->
    <view class="connection-status" :class="{ connected: isHAConfigured }">
      <text class="status-icon">{{ isHAConfigured ? '🟢' : '🟡' }}</text>
      <text class="status-text">{{ isHAConfigured ? 'Home Assistant 已连接' : '本地模式' }}</text>
    </view>

    <!-- Environment Indicator -->
    <view class="env-indicator" v-if="environmentContext.isNight">
      <text class="env-icon">🌙</text>
      <text class="env-text">夜间模式已启用</text>
    </view>

    <!-- Loading -->
    <view class="loading" v-if="isLoading">
      <text>加载中...</text>
    </view>

    <!-- Room Tabs -->
    <scroll-view class="room-tabs" scroll-x>
      <view class="tab-list">
        <view 
          class="tab-item" 
          :class="{ active: selectedRoom === 'all' }"
          @click="selectedRoom = 'all'"
        >
          <text>全部</text>
        </view>
        <view 
          v-for="room in rooms" 
          :key="room"
          class="tab-item"
          :class="{ active: selectedRoom === room }"
          @click="selectedRoom = room"
        >
          <text>{{ room }}</text>
        </view>
      </view>
    </scroll-view>

    <!-- Devices by Room -->
    <scroll-view class="device-list" scroll-y>
      <view v-if="filteredDevices.length === 0" class="empty-state">
        <text class="empty-icon">📱</text>
        <text class="empty-text">暂未发现设备</text>
        <button class="btn-secondary" @click="discoverDevices">扫描设备</button>
      </view>

      <view 
        v-for="(devices, room) in devicesGroupedByRoom" 
        :key="room"
        class="room-section"
      >
        <view class="room-header">
          <text class="room-name">{{ room }}</text>
          <text class="device-count">{{ devices.length }} 个设备</text>
        </view>

        <view class="device-grid">
          <view 
            v-for="device in devices" 
            :key="device.id"
            class="device-card"
            :class="{ online: device.status === 'online', offline: device.status === 'offline' }"
            @click="openDeviceDetail(device)"
          >
            <view class="device-icon">
              <text>{{ getDeviceIcon(device.type) }}</text>
            </view>
            <view class="device-info">
              <text class="device-name">{{ device.name }}</text>
              <text class="device-status">{{ getDeviceStatusText(device) }}</text>
            </view>
            <view class="device-toggle" @click.stop="toggleDevice(device)">
              <switch 
                :checked="device.state.on" 
                :disabled="device.status === 'offline'"
                @change="onToggle(device)"
              />
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- Quick Actions -->
    <view class="quick-actions">
      <view class="action-item" @click="navigateToAutomation">
        <text class="action-icon">⚡</text>
        <text class="action-text">自动化规则</text>
      </view>
      <view class="action-item" @click="showEnvironmentSettings = true">
        <text class="action-icon">🌤️</text>
        <text class="action-text">环境设置</text>
      </view>
      <view class="action-item" @click="showHAConfig = true">
        <text class="action-icon">🔗</text>
        <text class="action-text">HA 配置</text>
      </view>
    </view>

    <!-- Add Device Modal -->
    <view class="modal" v-if="showAddDevice" @click="showAddDevice = false">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">添加设备</text>
          <button class="btn-close" @click="showAddDevice = false">✕</button>
        </view>
        
        <view class="modal-body">
          <view class="form-item">
            <text class="form-label">设备名称</text>
            <input class="form-input" v-model="newDevice.name" placeholder="请输入设备名称" />
          </view>
          
          <view class="form-item">
            <text class="form-label">设备类型</text>
            <picker :value="deviceTypes.indexOf(newDevice.type)" :range="deviceTypes" @change="onDeviceTypeChange">
              <view class="picker-value">{{ newDevice.type }}</view>
            </picker>
          </view>
          
          <view class="form-item">
            <text class="form-label">房间</text>
            <input class="form-input" v-model="newDevice.room" placeholder="请输入房间名称" />
          </view>
        </view>
        
        <view class="modal-footer">
          <button class="btn-secondary" @click="showAddDevice = false">取消</button>
          <button class="btn-primary" @click="addNewDevice">添加</button>
        </view>
      </view>
    </view>

    <!-- HA Config Modal -->
    <view class="modal" v-if="showHAConfig" @click="showHAConfig = false">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">Home Assistant 配置</text>
          <button class="btn-close" @click="showHAConfig = false">✕</button>
        </view>
        
        <view class="modal-body">
          <view class="form-item">
            <text class="form-label">服务器地址</text>
            <input class="form-input" v-model="haConfig.url" placeholder="http://192.168.1.100:8123" />
          </view>
          
          <view class="form-item">
            <text class="form-label">访问令牌</text>
            <input class="form-input" v-model="haConfig.token" password placeholder="请输入 Long-Lived Access Token" />
          </view>
        </view>
        
        <view class="modal-footer">
          <button class="btn-secondary" @click="showHAConfig = false">取消</button>
          <button class="btn-primary" @click="saveHAConfig">保存</button>
        </view>
      </view>
    </view>

    <!-- Environment Settings Modal -->
    <view class="modal" v-if="showEnvironmentSettings" @click="showEnvironmentSettings = false">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">环境自适应设置</text>
          <button class="btn-close" @click="showEnvironmentSettings = false">✕</button>
        </view>
        
        <view class="modal-body">
          <view class="setting-item">
            <text class="setting-label">夜间自动切换</text>
            <switch v-model="envSettings.nightModeEnabled" />
          </view>
          
          <view class="setting-item" v-if="envSettings.nightModeEnabled">
            <text class="setting-label">夜间主题</text>
            <picker :value="['light', 'dark'].indexOf(envSettings.nightTheme)" :range="['light', 'dark']" @change="onNightThemeChange">
              <view class="picker-value">{{ envSettings.nightTheme === 'dark' ? '暗色' : '亮色' }}</view>
            </picker>
          </view>
          
          <view class="setting-item">
            <text class="setting-label">夜间音量</text>
            <slider :value="envSettings.nightVolume" min="0" max="100" @change="onNightVolumeChange" />
          </view>
        </view>
        
        <view class="modal-footer">
          <button class="btn-primary" @click="applyEnvSettings">应用</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { useSmartHomeStore } from '../../stores/smartHomeStore'
import smartHomeService from '../../services/smartHomeService'

export default {
  data() {
    return {
      selectedRoom: 'all',
      showAddDevice: false,
      showHAConfig: false,
      showEnvironmentSettings: false,
      newDevice: {
        name: '',
        type: 'light',
        room: '客厅'
      },
      haConfig: {
        url: '',
        token: ''
      },
      envSettings: {
        nightModeEnabled: true,
        nightTheme: 'dark',
        nightVolume: 30
      },
      deviceTypes: ['light', 'socket', 'ac', 'speaker', 'switch', 'sensor']
    }
  },
  
  computed: {
    store() {
      return useSmartHomeStore()
    },
    
    isLoading() {
      return this.store.state.isLoading
    },
    
    isHAConfigured() {
      return this.store.isHAConfigured.value
    },
    
    devices() {
      return this.store.state.devices
    },
    
    rooms() {
      return this.store.state.rooms
    },
    
    environmentContext() {
      return this.store.state.environmentContext
    },
    
    filteredDevices() {
      if (this.selectedRoom === 'all') {
        return this.devices
      }
      return this.devices.filter(d => d.room === this.selectedRoom)
    },
    
    devicesGroupedByRoom() {
      const grouped = {}
      for (const device of this.filteredDevices) {
        if (!grouped[device.room]) {
          grouped[device.room] = []
        }
        grouped[device.room].push(device)
      }
      return grouped
    }
  },
  
  onLoad() {
    this.store.loadDevices()
    this.store.loadRules()
    this.store.loadHAConfig()
    this.store.updateEnvironmentContext()
    
    if (this.store.state.haConfig) {
      this.haConfig = { ...this.store.state.haConfig }
    }
    
    // Load env settings
    const savedEnvSettings = uni.getStorageSync('envSettings')
    if (savedEnvSettings) {
      this.envSettings = JSON.parse(savedEnvSettings)
    }
  },
  
  methods: {
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
    
    getDeviceStatusText(device) {
      if (device.status === 'offline') return '离线'
      if (!device.state.on) return '已关闭'
      if (device.type === 'light' && device.state.brightness !== undefined) {
        return `亮度 ${device.state.brightness}%`
      }
      if (device.type === 'ac' && device.state.temperature !== undefined) {
        return `${device.state.temperature}°C`
      }
      return '已开启'
    },
    
    async refreshDevices() {
      await this.store.refreshDevices()
    },
    
    async toggleDevice(device) {
      const action = device.state.on ? 'turn_off' : 'turn_on'
      await this.store.controlDevice(device.id, action)
    },
    
    onToggle(device) {
      this.toggleDevice(device)
    },
    
    openDeviceDetail(device) {
      uni.navigateTo({
        url: `/pages/smart-home/device-detail?id=${device.id}`
      })
    },
    
    navigateToAutomation() {
      uni.navigateTo({
        url: '/pages/smart-home/automation-rules'
      })
    },
    
    async discoverDevices() {
      const mockDevices = smartHomeService.discoverDevices()
      for (const mock of mockDevices) {
        await this.store.addDevice(mock)
      }
    },
    
    onDeviceTypeChange(e) {
      this.newDevice.type = this.deviceTypes[e.detail.value]
    },
    
    async addNewDevice() {
      if (!this.newDevice.name) {
        uni.showToast({ title: '请输入设备名称', icon: 'none' })
        return
      }
      
      await this.store.addDevice(this.newDevice)
      this.showAddDevice = false
      this.newDevice = { name: '', type: 'light', room: '客厅' }
      
      uni.showToast({ title: '设备添加成功', icon: 'success' })
    },
    
    saveHAConfig() {
      if (!this.haConfig.url || !this.haConfig.token) {
        uni.showToast({ title: '请填写完整信息', icon: 'none' })
        return
      }
      
      this.store.saveHAConfig(this.haConfig)
      this.showHAConfig = false
      uni.showToast({ title: '配置已保存', icon: 'success' })
    },
    
    onNightThemeChange(e) {
      this.envSettings.nightTheme = ['light', 'dark'][e.detail.value]
    },
    
    onNightVolumeChange(e) {
      this.envSettings.nightVolume = e.detail.value
    },
    
    applyEnvSettings() {
      uni.setStorageSync('envSettings', JSON.stringify(this.envSettings))
      
      const settings = this.store.applyEnvironmentSettings(this.envSettings)
      
      // Apply theme
      if (settings.theme === 'dark') {
        uni.setStorageSync('currentThemeId', 'dark')
      } else {
        uni.setStorageSync('currentThemeId', 'light')
      }
      
      this.showEnvironmentSettings = false
      uni.showToast({ title: '设置已应用', icon: 'success' })
    }
  }
}
</script>

<style scoped>
.device-panel {
  min-height: 100vh;
  background: var(--bg-main, #f5f5f5);
  padding-bottom: 120rpx;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  background: var(--bg-card, #fff);
}

.header-title {
  font-size: 36rpx;
  font-weight: bold;
  color: var(--text-main, #333);
}

.header-actions {
  display: flex;
  gap: 20rpx;
}

.btn-icon {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: var(--bg-main, #f5f5f5);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon {
  font-size: 28rpx;
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 10rpx;
  padding: 16rpx 30rpx;
  background: #fff3cd;
  font-size: 24rpx;
}

.connection-status.connected {
  background: #d4edda;
}

.env-indicator {
  display: flex;
  align-items: center;
  gap: 10rpx;
  padding: 16rpx 30rpx;
  background: #1a1a2e;
  color: #fff;
  font-size: 24rpx;
}

.loading {
  padding: 40rpx;
  text-align: center;
  color: var(--text-secondary, #666);
}

.room-tabs {
  background: var(--bg-card, #fff);
  padding: 20rpx 0;
  white-space: nowrap;
}

.tab-list {
  display: flex;
  padding: 0 20rpx;
  gap: 20rpx;
}

.tab-item {
  padding: 12rpx 24rpx;
  border-radius: 30rpx;
  background: var(--bg-main, #f5f5f5);
  font-size: 26rpx;
  color: var(--text-secondary, #666);
}

.tab-item.active {
  background: var(--primary-color, #4a3aff);
  color: #fff;
}

.device-list {
  height: calc(100vh - 400rpx);
  padding: 20rpx;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 100rpx 0;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 20rpx;
}

.empty-text {
  color: var(--text-secondary, #666);
  margin-bottom: 30rpx;
}

.room-section {
  margin-bottom: 30rpx;
}

.room-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.room-name {
  font-size: 28rpx;
  font-weight: bold;
  color: var(--text-main, #333);
}

.device-count {
  font-size: 24rpx;
  color: var(--text-tertiary, #999);
}

.device-grid {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.device-card {
  display: flex;
  align-items: center;
  padding: 24rpx;
  background: var(--bg-card, #fff);
  border-radius: 16rpx;
  gap: 20rpx;
}

.device-card.offline {
  opacity: 0.5;
}

.device-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 20rpx;
  background: var(--bg-main, #f5f5f5);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
}

.device-info {
  flex: 1;
}

.device-name {
  font-size: 28rpx;
  color: var(--text-main, #333);
  display: block;
}

.device-status {
  font-size: 24rpx;
  color: var(--text-secondary, #666);
  display: block;
  margin-top: 6rpx;
}

.quick-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  padding: 20rpx 30rpx;
  background: var(--bg-card, #fff);
  border-top: 1rpx solid var(--border-color, #e0e0e0);
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.action-icon {
  font-size: 40rpx;
}

.action-text {
  font-size: 22rpx;
  color: var(--text-secondary, #666);
}

/* Modal */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  width: 600rpx;
  background: var(--bg-card, #fff);
  border-radius: 20rpx;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid var(--border-color, #e0e0e0);
}

.modal-title {
  font-size: 32rpx;
  font-weight: bold;
  color: var(--text-main, #333);
}

.btn-close {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background: var(--bg-main, #f5f5f5);
  border: none;
  font-size: 24rpx;
}

.modal-body {
  padding: 30rpx;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 20rpx;
  padding: 30rpx;
  border-top: 1rpx solid var(--border-color, #e0e0e0);
}

.form-item {
  margin-bottom: 30rpx;
}

.form-label {
  display: block;
  font-size: 26rpx;
  color: var(--text-secondary, #666);
  margin-bottom: 12rpx;
}

.form-input {
  width: 100%;
  height: 72rpx;
  padding: 0 20rpx;
  border: 1rpx solid var(--border-color, #e0e0e0);
  border-radius: 12rpx;
  font-size: 28rpx;
}

.picker-value {
  padding: 20rpx;
  border: 1rpx solid var(--border-color, #e0e0e0);
  border-radius: 12rpx;
  font-size: 28rpx;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid var(--border-color, #e0e0e0);
}

.setting-label {
  font-size: 28rpx;
  color: var(--text-main, #333);
}

.btn-primary {
  height: 72rpx;
  line-height: 72rpx;
  padding: 0 40rpx;
  background: var(--primary-color, #4a3aff);
  color: #fff;
  border-radius: 36rpx;
  font-size: 28rpx;
  border: none;
}

.btn-secondary {
  height: 72rpx;
  line-height: 72rpx;
  padding: 0 40rpx;
  background: var(--bg-main, #f5f5f5);
  color: var(--text-main, #333);
  border-radius: 36rpx;
  font-size: 28rpx;
  border: none;
}
</style>
