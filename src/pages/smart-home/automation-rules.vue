<template>
  <view class="automation-rules">
    <!-- Header -->
    <view class="panel-header">
      <text class="header-title">自动化规则</text>
      <button class="btn-icon" @click="showCreateRule = true">
        <text class="icon">➕</text>
      </button>
    </view>

    <!-- Trigger Stats -->
    <view class="trigger-stats">
      <view class="stat-item">
        <text class="stat-value">{{ rules.length }}</text>
        <text class="stat-label">总规则</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">{{ enabledRules.length }}</text>
        <text class="stat-label">已启用</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">{{ taskLinkedRules }}</text>
        <text class="stat-label">任务联动</text>
      </view>
    </view>

    <!-- Rules List -->
    <scroll-view class="rules-list" scroll-y>
      <view v-if="rules.length === 0" class="empty-state">
        <text class="empty-icon">⚡</text>
        <text class="empty-text">暂无自动化规则</text>
        <text class="empty-hint">创建规则实现任务完成自动控制设备</text>
        <button class="btn-primary" @click="showCreateRule = true">创建规则</button>
      </view>

      <view 
        v-for="rule in rules" 
        :key="rule.id"
        class="rule-card"
        :class="{ disabled: !rule.enabled }"
      >
        <view class="rule-header">
          <view class="rule-toggle" @click="toggleRule(rule)">
            <switch :checked="rule.enabled" @change="onToggle(rule)" />
          </view>
          <view class="rule-info">
            <text class="rule-name">{{ rule.name }}</text>
            <text class="rule-desc">{{ rule.description || '无描述' }}</text>
          </view>
          <view class="rule-actions">
            <button class="btn-small" @click="editRule(rule)">编辑</button>
            <button class="btn-small btn-danger" @click="deleteRuleConfirm(rule)">删除</button>
          </view>
        </view>

        <view class="rule-content">
          <!-- Trigger -->
          <view class="rule-section">
            <text class="section-label">触发条件</text>
            <view class="trigger-tag">
              <text class="trigger-icon">{{ getTriggerIcon(rule.trigger.type) }}</text>
              <text class="trigger-text">{{ getTriggerText(rule.trigger) }}</text>
            </view>
          </view>

          <!-- Conditions -->
          <view class="rule-section" v-if="rule.conditions && rule.conditions.length > 0">
            <text class="section-label">附加条件</text>
            <view class="condition-tags">
              <text 
                v-for="(cond, idx) in rule.conditions" 
                :key="idx"
                class="condition-tag"
              >
                {{ getConditionText(cond) }}
              </text>
            </view>
          </view>

          <!-- Actions -->
          <view class="rule-section">
            <text class="section-label">执行动作</text>
            <view class="action-tags">
              <text 
                v-for="(action, idx) in rule.actions" 
                :key="idx"
                class="action-tag"
              >
                {{ getActionText(action) }}
              </text>
            </view>
          </view>
        </view>

        <view class="rule-footer">
          <text class="rule-time">创建于 {{ formatTime(rule.createdAt) }}</text>
        </view>
      </view>
    </scroll-view>

    <!-- Create/Edit Rule Modal -->
    <view class="modal" v-if="showCreateRule" @click="closeModal">
      <view class="modal-content modal-large" @click.stop>
        <view class="modal-header">
          <text class="modal-title">{{ editingRule ? '编辑规则' : '创建自动化规则' }}</text>
          <button class="btn-close" @click="closeModal">✕</button>
        </view>
        
        <scroll-view class="modal-body" scroll-y>
          <!-- Basic Info -->
          <view class="form-section">
            <text class="section-title">基本信息</text>
            
            <view class="form-item">
              <text class="form-label">规则名称</text>
              <input class="form-input" v-model="ruleForm.name" placeholder="例如：完成任务开灯" />
            </view>
            
            <view class="form-item">
              <text class="form-label">规则描述</text>
              <input class="form-input" v-model="ruleForm.description" placeholder="可选描述" />
            </view>
          </view>

          <!-- Trigger -->
          <view class="form-section">
            <text class="section-title">触发条件</text>
            
            <view class="form-item">
              <text class="form-label">触发类型</text>
              <picker :value="triggerTypes.indexOf(ruleForm.trigger.type)" :range="triggerTypes" @change="onTriggerTypeChange">
                <view class="picker-value">{{ ruleForm.trigger.type }}</view>
              </picker>
            </view>
            
            <!-- Task Complete Trigger -->
            <view class="form-item" v-if="ruleForm.trigger.type === 'task_complete'">
              <text class="form-label">关联任务</text>
              <picker :value="selectedTaskIndex" :range="tasks" :range-key="'title'" @change="onTaskChange">
                <view class="picker-value">{{ selectedTaskTitle }}</view>
              </picker>
            </view>
            
            <!-- Time Range Trigger -->
            <view class="form-item" v-if="ruleForm.trigger.type === 'time_range'">
              <text class="form-label">时间范围</text>
              <view class="time-range">
                <input class="form-input time-input" v-model="ruleForm.trigger.startTime" placeholder="08:00" />
                <text class="time-separator">至</text>
                <input class="form-input time-input" v-model="ruleForm.trigger.endTime" placeholder="22:00" />
              </view>
            </view>
            
            <!-- Location Trigger -->
            <view class="form-item" v-if="ruleForm.trigger.type === 'location_arrive' || ruleForm.trigger.type === 'location_leave'">
              <text class="form-label">位置类型</text>
              <picker :value="locationTypes.indexOf(ruleForm.trigger.locationType)" :range="locationTypes" @change="onLocationTypeChange">
                <view class="picker-value">{{ ruleForm.trigger.locationType || '到家' }}</view>
              </picker>
            </view>
          </view>

          <!-- Conditions -->
          <view class="form-section">
            <view class="section-header">
              <text class="section-title">附加条件（可选）</text>
              <button class="btn-add" @click="addCondition">➕ 添加条件</button>
            </view>
            
            <view v-for="(cond, idx) in ruleForm.conditions" :key="idx" class="condition-item">
              <view class="condition-row">
                <picker :value="conditionTypes.indexOf(cond.type)" :range="conditionTypes" @change="(e) => onConditionTypeChange(e, idx)">
                  <view class="picker-value">{{ cond.type }}</view>
                </picker>
                <button class="btn-remove" @click="removeCondition(idx)">✕</button>
              </view>
              
              <!-- Time Range Condition -->
              <view v-if="cond.type === 'time_range'" class="condition-fields">
                <input class="form-input time-input" v-model="cond.startTime" placeholder="开始时间" />
                <text class="time-separator">至</text>
                <input class="form-input time-input" v-model="cond.endTime" placeholder="结束时间" />
              </view>
              
              <!-- Device State Condition -->
              <view v-if="cond.type === 'device_state'" class="condition-fields">
                <picker :value="getDeviceIndex(cond.deviceId)" :range="devices" :range-key="'name'" @change="(e) => onConditionDeviceChange(e, idx)">
                  <view class="picker-value">{{ getDeviceName(cond.deviceId) }}</view>
                </picker>
                <input class="form-input state-input" v-model="cond.expectedValue" placeholder="状态值" />
              </view>
            </view>
          </view>

          <!-- Actions -->
          <view class="form-section">
            <view class="section-header">
              <text class="section-title">执行动作</text>
              <button class="btn-add" @click="addAction">➕ 添加动作</button>
            </view>
            
            <view v-for="(action, idx) in ruleForm.actions" :key="idx" class="action-item">
              <view class="action-row">
                <view class="action-type">设备控制</view>
                <button class="btn-remove" @click="removeAction(idx)">✕</button>
              </view>
              
              <view class="action-fields">
                <view class="form-item">
                  <text class="form-label">选择设备</text>
                  <picker :value="getDeviceIndex(action.deviceId)" :range="devices" :range-key="'name'" @change="(e) => onActionDeviceChange(e, idx)">
                    <view class="picker-value">{{ getDeviceName(action.deviceId) }}</view>
                  </picker>
                </view>
                
                <view class="form-item">
                  <text class="form-label">执行操作</text>
                  <picker :value="actionTypes.indexOf(action.deviceAction)" :range="actionTypes" @change="(e) => onActionTypeChange(e, idx)">
                    <view class="picker-value">{{ action.deviceAction }}</view>
                  </picker>
                </view>
              </view>
            </view>
          </view>
        </scroll-view>
        
        <view class="modal-footer">
          <button class="btn-secondary" @click="closeModal">取消</button>
          <button class="btn-primary" @click="saveRule">{{ editingRule ? '保存' : '创建' }}</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { useSmartHomeStore } from '../../stores/smartHomeStore'
import smartHomeService from '../../services/smartHomeService'
import taskService from '../../services/taskService'

export default {
  data() {
    return {
      showCreateRule: false,
      editingRule: null,
      triggerTypes: ['task_complete', 'time_range', 'location_arrive', 'location_leave', 'weather_condition'],
      conditionTypes: ['time_range', 'device_state', 'weather'],
      actionTypes: ['turn_on', 'turn_off', 'toggle', 'set_brightness', 'play_music', 'stop_music'],
      locationTypes: ['home', 'school', 'park'],
      tasks: [],
      ruleForm: {
        name: '',
        description: '',
        trigger: { type: 'task_complete' },
        conditions: [],
        actions: []
      }
    }
  },
  
  computed: {
    store() {
      return useSmartHomeStore()
    },
    
    rules() {
      return this.store.state.rules
    },
    
    enabledRules() {
      return this.rules.filter(r => r.enabled)
    },
    
    taskLinkedRules() {
      return this.rules.filter(r => r.trigger.type === 'task_complete').length
    },
    
    devices() {
      return this.store.state.devices
    },
    
    selectedTaskIndex() {
      const taskId = this.ruleForm.trigger.taskId
      return this.tasks.findIndex(t => t.id === taskId)
    },
    
    selectedTaskTitle() {
      const idx = this.selectedTaskIndex
      return idx >= 0 ? this.tasks[idx].title : '请选择任务'
    }
  },
  
  onLoad() {
    this.store.loadDevices()
    this.store.loadRules()
    this.loadTasks()
  },
  
  methods: {
    loadTasks() {
      try {
        this.tasks = taskService.getVisibleTasks().filter(t => t.status === 'active')
      } catch (e) {
        this.tasks = []
      }
    },
    
    getTriggerIcon(type) {
      const icons = {
        task_complete: '✅',
        time_range: '⏰',
        location_arrive: '📍',
        location_leave: '🚗',
        weather_condition: '🌤️'
      }
      return icons[type] || '⚡'
    },
    
    getTriggerText(trigger) {
      switch (trigger.type) {
        case 'task_complete':
          return '任务完成'
        case 'time_range':
          return `${trigger.startTime || '08:00'} - ${trigger.endTime || '22:00'}`
        case 'location_arrive':
          return `到达${trigger.locationType || '家'}`
        case 'location_leave':
          return `离开${trigger.locationType || '家'}`
        case 'weather_condition':
          return `天气${trigger.weatherType || '变化'}`
        default:
          return '未知条件'
      }
    },
    
    getConditionText(cond) {
      switch (cond.type) {
        case 'time_range':
          return `时间 ${cond.startTime}-${cond.endTime}`
        case 'device_state':
          return `设备状态 ${cond.stateKey}=${cond.expectedValue}`
        case 'weather':
          return `天气${cond.weatherType}`
        default:
          return '条件'
      }
    },
    
    getActionText(action) {
      if (action.actionType === 'control_device') {
        const device = this.devices.find(d => d.id === action.deviceId)
        const deviceName = device ? device.name : '未知设备'
        return `${deviceName} ${action.deviceAction}`
      }
      return action.actionType || '动作'
    },
    
    formatTime(isoString) {
      if (!isoString) return ''
      const date = new Date(isoString)
      return `${date.getMonth() + 1}/${date.getDate()}`
    },
    
    async toggleRule(rule) {
      await this.store.toggleRule(rule.id)
    },
    
    onToggle(rule) {
      this.toggleRule(rule)
    },
    
    editRule(rule) {
      this.editingRule = rule
      this.ruleForm = {
        name: rule.name,
        description: rule.description || '',
        trigger: { ...rule.trigger },
        conditions: rule.conditions ? rule.conditions.map(c => ({ ...c })) : [],
        actions: rule.actions ? rule.actions.map(a => ({ ...a })) : []
      }
      this.showCreateRule = true
    },
    
    async deleteRuleConfirm(rule) {
      uni.showModal({
        title: '确认删除',
        content: `确定要删除规则"${rule.name}"吗？`,
        success: async (res) => {
          if (res.confirm) {
            await this.store.deleteRule(rule.id)
            uni.showToast({ title: '已删除', icon: 'success' })
          }
        }
      })
    },
    
    closeModal() {
      this.showCreateRule = false
      this.editingRule = null
      this.ruleForm = {
        name: '',
        description: '',
        trigger: { type: 'task_complete' },
        conditions: [],
        actions: []
      }
    },
    
    onTriggerTypeChange(e) {
      this.ruleForm.trigger.type = this.triggerTypes[e.detail.value]
    },
    
    onTaskChange(e) {
      const idx = e.detail.value
      this.ruleForm.trigger.taskId = this.tasks[idx].id
    },
    
    onLocationTypeChange(e) {
      this.ruleForm.trigger.locationType = this.locationTypes[e.detail.value]
    },
    
    addCondition() {
      this.ruleForm.conditions.push({ type: 'time_range', startTime: '08:00', endTime: '22:00' })
    },
    
    removeCondition(idx) {
      this.ruleForm.conditions.splice(idx, 1)
    },
    
    onConditionTypeChange(e, idx) {
      const type = this.conditionTypes[e.detail.value]
      this.ruleForm.conditions[idx].type = type
      
      if (type === 'time_range') {
        this.ruleForm.conditions[idx] = { ...this.ruleForm.conditions[idx], startTime: '08:00', endTime: '22:00' }
      } else if (type === 'device_state') {
        this.ruleForm.conditions[idx] = { ...this.ruleForm.conditions[idx], deviceId: '', stateKey: 'on', expectedValue: true }
      }
    },
    
    onConditionDeviceChange(e, idx) {
      this.ruleForm.conditions[idx].deviceId = this.devices[e.detail.value]?.id || ''
    },
    
    addAction() {
      this.ruleForm.actions.push({
        actionType: 'control_device',
        deviceId: this.devices[0]?.id || '',
        deviceAction: 'turn_on'
      })
    },
    
    removeAction(idx) {
      this.ruleForm.actions.splice(idx, 1)
    },
    
    onActionDeviceChange(e, idx) {
      this.ruleForm.actions[idx].deviceId = this.devices[e.detail.value]?.id || ''
    },
    
    onActionTypeChange(e, idx) {
      this.ruleForm.actions[idx].deviceAction = this.actionTypes[e.detail.value]
    },
    
    getDeviceIndex(deviceId) {
      return this.devices.findIndex(d => d.id === deviceId)
    },
    
    getDeviceName(deviceId) {
      const device = this.devices.find(d => d.id === deviceId)
      return device ? device.name : '选择设备'
    },
    
    async saveRule() {
      if (!this.ruleForm.name) {
        uni.showToast({ title: '请输入规则名称', icon: 'none' })
        return
      }
      
      if (this.ruleForm.actions.length === 0) {
        uni.showToast({ title: '请至少添加一个动作', icon: 'none' })
        return
      }
      
      try {
        if (this.editingRule) {
          await this.store.updateRule(this.editingRule.id, this.ruleForm)
          uni.showToast({ title: '规则已更新', icon: 'success' })
        } else {
          await this.store.createRule(this.ruleForm)
          uni.showToast({ title: '规则已创建', icon: 'success' })
        }
        this.closeModal()
      } catch (error) {
        uni.showToast({ title: error.message, icon: 'none' })
      }
    }
  }
}
</script>

<style scoped>
.automation-rules {
  min-height: 100vh;
  background: var(--bg-main, #f5f5f5);
  padding-bottom: 40rpx;
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

.btn-icon {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: var(--primary-color, #4a3aff);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon {
  font-size: 28rpx;
  color: #fff;
}

.trigger-stats {
  display: flex;
  justify-content: space-around;
  padding: 30rpx;
  background: var(--bg-card, #fff);
  margin-bottom: 20rpx;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 40rpx;
  font-weight: bold;
  color: var(--primary-color, #4a3aff);
  display: block;
}

.stat-label {
  font-size: 24rpx;
  color: var(--text-secondary, #666);
  display: block;
  margin-top: 8rpx;
}

.rules-list {
  height: calc(100vh - 250rpx);
  padding: 0 20rpx;
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
  font-size: 32rpx;
  color: var(--text-main, #333);
  margin-bottom: 10rpx;
}

.empty-hint {
  font-size: 26rpx;
  color: var(--text-secondary, #666);
  margin-bottom: 30rpx;
}

.rule-card {
  background: var(--bg-card, #fff);
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  overflow: hidden;
}

.rule-card.disabled {
  opacity: 0.6;
}

.rule-header {
  display: flex;
  align-items: center;
  padding: 24rpx;
  gap: 20rpx;
}

.rule-info {
  flex: 1;
}

.rule-name {
  font-size: 30rpx;
  font-weight: bold;
  color: var(--text-main, #333);
  display: block;
}

.rule-desc {
  font-size: 24rpx;
  color: var(--text-secondary, #666);
  display: block;
  margin-top: 6rpx;
}

.rule-actions {
  display: flex;
  gap: 10rpx;
}

.btn-small {
  padding: 8rpx 20rpx;
  font-size: 24rpx;
  border-radius: 20rpx;
  background: var(--bg-main, #f5f5f5);
  border: none;
}

.btn-danger {
  color: #ff4d4f;
}

.rule-content {
  padding: 0 24rpx 24rpx;
}

.rule-section {
  margin-bottom: 16rpx;
}

.section-label {
  font-size: 22rpx;
  color: var(--text-tertiary, #999);
  display: block;
  margin-bottom: 8rpx;
}

.trigger-tag {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  padding: 8rpx 16rpx;
  background: #e8e8ff;
  border-radius: 20rpx;
}

.trigger-icon {
  font-size: 24rpx;
}

.trigger-text {
  font-size: 26rpx;
  color: var(--primary-color, #4a3aff);
}

.condition-tags, .action-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}

.condition-tag, .action-tag {
  padding: 8rpx 16rpx;
  background: var(--bg-main, #f5f5f5);
  border-radius: 20rpx;
  font-size: 24rpx;
  color: var(--text-secondary, #666);
}

.rule-footer {
  padding: 16rpx 24rpx;
  border-top: 1rpx solid var(--border-color, #e0e0e0);
}

.rule-time {
  font-size: 22rpx;
  color: var(--text-tertiary, #999);
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
  width: 650rpx;
  max-height: 90vh;
  background: var(--bg-card, #fff);
  border-radius: 20rpx;
  overflow: hidden;
}

.modal-large {
  width: 90vw;
  max-width: 700rpx;
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
  max-height: 70vh;
  padding: 20rpx 30rpx;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 20rpx;
  padding: 30rpx;
  border-top: 1rpx solid var(--border-color, #e0e0e0);
}

.form-section {
  margin-bottom: 40rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: bold;
  color: var(--text-main, #333);
  display: block;
  margin-bottom: 20rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.form-item {
  margin-bottom: 20rpx;
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

.time-range, .condition-row, .action-row {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.time-input {
  width: 200rpx;
}

.state-input {
  width: 150rpx;
}

.time-separator {
  color: var(--text-secondary, #666);
}

.condition-item, .action-item {
  background: var(--bg-main, #f5f5f5);
  border-radius: 12rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
}

.condition-fields, .action-fields {
  margin-top: 16rpx;
}

.btn-add {
  padding: 10rpx 24rpx;
  font-size: 26rpx;
  color: var(--primary-color, #4a3aff);
  background: none;
  border: none;
}

.btn-remove {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background: #ff4d4f;
  color: #fff;
  border: none;
  font-size: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-type {
  flex: 1;
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
