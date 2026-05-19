<template>
  <view class="moral-volunteer-page">
    <!-- 顶部导航 -->
    <view class="nav-header">
      <view class="back-btn" @tap="goBack">
        <text class="icon">←</text>
      </view>
      <text class="nav-title">志愿服务</text>
      <view class="nav-right"></view>
    </view>

    <!-- 统计数据 -->
    <view class="stats-section">
      <view class="stat-card">
        <text class="stat-value">{{ volunteerStatsData?.totalHours || 0 }}</text>
        <text class="stat-label">服务时长(小时)</text>
      </view>
      <view class="stat-card">
        <text class="stat-value">{{ volunteerStatsData?.totalTasks || 0 }}</text>
        <text class="stat-label">完成任务</text>
      </view>
      <view class="stat-card">
        <text class="stat-value">{{ volunteerStatsData?.totalPoints || 0 }}</text>
        <text class="stat-label">获得积分</text>
      </view>
    </view>

    <!-- 任务类型筛选 -->
    <view class="filter-tabs">
      <view 
        class="tab-item" 
        :class="{ active: selectedType === null }"
        @tap="filterByType(null)"
      >
        全部
      </view>
      <view 
        class="tab-item" 
        v-for="type in volunteerTypes" 
        :key="type"
        :class="{ active: selectedType === type }"
        @tap="filterByType(type)"
      >
        {{ getTypeName(type) }}
      </view>
    </view>

    <!-- 志愿服务任务列表 -->
    <scroll-view class="task-list" scroll-y>
      <view class="task-card" v-for="task in filteredTasks" :key="task.id" @tap="viewTask(task)">
        <view class="task-icon">
          <text class="icon-text">{{ task.icon }}</text>
        </view>
        <view class="task-info">
          <text class="task-title">{{ task.title }}</text>
          <text class="task-desc">{{ task.description }}</text>
          <view class="task-meta">
            <text class="meta-item">⏱ {{ task.targetHours }}小时</text>
            <text class="meta-item">⭐ {{ task.points }}积分</text>
          </view>
        </view>
        <text class="task-arrow">→</text>
      </view>
    </scroll-view>

    <!-- 任务详情弹窗 -->
    <uni-popup ref="taskPopup" type="bottom" class="task-popup">
      <view class="popup-content" v-if="currentTask">
        <view class="popup-header">
          <text class="popup-title">{{ currentTask.title }}</text>
          <text class="close-btn" @tap="closeTaskPopup">×</text>
        </view>
        <scroll-view class="popup-body" scroll-y>
          <view class="task-detail">
            <text class="detail-desc">{{ currentTask.description }}</text>
            
            <view class="detail-section">
              <text class="section-label">服务类型</text>
              <text class="type-badge">{{ getTypeName(currentTask.type) }}</text>
            </view>
            
            <view class="detail-section">
              <text class="section-label">服务时长</text>
              <text class="section-value">{{ currentTask.targetHours }}小时</text>
            </view>
            
            <view class="detail-section">
              <text class="section-label">可获得积分</text>
              <text class="section-value highlight">{{ currentTask.points }}积分</text>
            </view>
            
            <view class="detail-section">
              <text class="section-label">服务步骤</text>
              <view class="steps-list">
                <view class="step-item" v-for="(step, index) in currentTask.steps" :key="index">
                  <text class="step-num">{{ index + 1 }}</text>
                  <text class="step-text">{{ step }}</text>
                </view>
              </view>
            </view>
          </view>
          
          <button class="btn-start" @tap="startTask">开始服务</button>
        </scroll-view>
      </view>
    </uni-popup>

    <!-- 记录服务弹窗 -->
    <uni-popup ref="recordPopup" type="bottom" class="record-popup">
      <view class="popup-content">
        <view class="popup-header">
          <text class="popup-title">记录服务</text>
          <text class="close-btn" @tap="closeRecordPopup">×</text>
        </view>
        <scroll-view class="popup-body" scroll-y>
          <view class="record-form">
            <view class="form-item">
              <text class="form-label">实际服务时长</text>
              <input 
                type="number" 
                v-model="recordForm.actualHours" 
                :placeholder="'请输入小时数'" 
                class="form-input"
              />
            </view>
            
            <view class="form-item">
              <text class="form-label">服务描述</text>
              <textarea 
                v-model="recordForm.description" 
                placeholder="请描述你的服务经历..." 
                class="form-textarea"
              />
            </view>
            
            <view class="form-item">
              <text class="form-label">获得积分</text>
              <text class="points-preview">{{ currentTask?.points || 0 }}积分</text>
            </view>
          </view>
          
          <button class="btn-submit" @tap="submitRecord">提交记录</button>
        </scroll-view>
      </view>
    </uni-popup>

    <!-- 历史记录 -->
    <view class="history-section" v-if="volunteerRecords.length > 0">
      <view class="section-header">
        <text class="section-title">服务记录</text>
      </view>
      <view class="history-list">
        <view class="history-item" v-for="record in recentRecords" :key="record.id">
          <view class="history-icon">
            <text>{{ getTaskIcon(record.taskType) }}</text>
          </view>
          <view class="history-info">
            <text class="history-title">{{ record.taskTitle }}</text>
            <text class="history-date">{{ formatDate(record.completedAt) }}</text>
          </view>
          <view class="history-points">
            <text class="points">+{{ record.points }}</text>
            <text class="hours">{{ record.actualHours }}小时</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { useMoralEducationStore } from '@/stores/moralEducationStore.js'
import { VOLUNTEER_TYPES } from '@/services/moralEducationService.js'

export default {
  data() {
    return {
      selectedType: null,
      currentTask: null,
      recordForm: {
        actualHours: '',
        description: ''
      }
    }
  },
  computed: {
    filteredTasks() {
      if (!this.selectedType) {
        return this.store.volunteerTasks
      }
      return this.store.volunteerTasks.filter(t => t.type === this.selectedType)
    },
    volunteerTypes() {
      return Object.values(VOLUNTEER_TYPES)
    },
    volunteerStatsData() {
      return this.store.volunteerStatsData
    },
    volunteerRecords() {
      return this.store.volunteerRecords
    },
    recentRecords() {
      return this.volunteerRecords.slice(0, 5)
    }
  },
  onLoad() {
    this.store.loadVolunteerTasks()
    this.store.loadVolunteerRecords()
  },
  methods: {
    store() {
      return useMoralEducationStore()
    },
    goBack() {
      uni.navigateBack()
    },
    filterByType(type) {
      this.selectedType = type
      this.store.loadVolunteerTasks(type)
    },
    getTypeName(type) {
      const names = {
        [VOLUNTEER_TYPES.COMMUNITY]: '社区服务',
        [VOLUNTEER_TYPES.ENVIRONMENT]: '环境保护',
        [VOLUNTEER_TYPES.ELDERLY]: '敬老服务',
        [VOLUNTEER_TYPES.ANIMAL]: '动物保护',
        [VOLUNTEER_TYPES.EDUCATION]: '教育支持',
        [VOLUNTEER_TYPES.HEALTH]: '健康支持'
      }
      return names[type] || type
    },
    getTaskIcon(type) {
      const icons = {
        [VOLUNTEER_TYPES.COMMUNITY]: '🤝',
        [VOLUNTEER_TYPES.ENVIRONMENT]: '🌍',
        [VOLUNTEER_TYPES.ELDERLY]: '👴👵',
        [VOLUNTEER_TYPES.ANIMAL]: '🐾',
        [VOLUNTEER_TYPES.EDUCATION]: '📚',
        [VOLUNTEER_TYPES.HEALTH]: '💊'
      }
      return icons[type] || '⭐'
    },
    viewTask(task) {
      this.currentTask = task
      this.$refs.taskPopup.open()
    },
    closeTaskPopup() {
      this.$refs.taskPopup.close()
    },
    startTask() {
      this.closeTaskPopup()
      this.recordForm = {
        actualHours: this.currentTask.targetHours.toString(),
        description: ''
      }
      this.$refs.recordPopup.open()
    },
    closeRecordPopup() {
      this.$refs.recordPopup.close()
    },
    submitRecord() {
      if (!this.currentTask) return
      
      const record = this.store.completeVolunteerTask(this.currentTask.id, {
        actualHours: parseFloat(this.recordForm.actualHours) || this.currentTask.targetHours,
        description: this.recordForm.description
      })
      
      if (record) {
        uni.showToast({
          title: '记录成功！',
          icon: 'success'
        })
        this.closeRecordPopup()
      }
    },
    formatDate(dateStr) {
      if (!dateStr) return ''
      const date = new Date(dateStr)
      return `${date.getMonth() + 1}月${date.getDate()}日`
    }
  }
}
</script>

<style scoped>
.moral-volunteer-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 30rpx;
}

.nav-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 30rpx;
  background-color: #ffffff;
}

.back-btn, .nav-right {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-btn .icon {
  font-size: 36rpx;
  color: #333;
}

.nav-title {
  font-size: 34rpx;
  font-weight: bold;
  color: #333;
}

.stats-section {
  display: flex;
  padding: 30rpx;
  background-color: #ffffff;
}

.stat-card {
  flex: 1;
  text-align: center;
  padding: 20rpx;
}

.stat-value {
  font-size: 40rpx;
  font-weight: bold;
  color: #8477fa;
  display: block;
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 24rpx;
  color: #666;
}

.filter-tabs {
  display: flex;
  padding: 20rpx;
  background-color: #ffffff;
  overflow-x: auto;
  white-space: nowrap;
}

.tab-item {
  padding: 12rpx 24rpx;
  margin-right: 16rpx;
  font-size: 28rpx;
  color: #666;
  background-color: #f0f0f0;
  border-radius: 30rpx;
  flex-shrink: 0;
}

.tab-item.active {
  color: #ffffff;
  background-color: #8477fa;
}

.task-list {
  height: calc(100vh - 500rpx);
  padding: 20rpx;
}

.task-card {
  display: flex;
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.task-icon {
  width: 100rpx;
  height: 100rpx;
  background-color: #f0f0f0;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-text {
  font-size: 48rpx;
}

.task-info {
  flex: 1;
  margin-left: 20rpx;
}

.task-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.task-desc {
  font-size: 26rpx;
  color: #666;
  display: block;
  margin-bottom: 12rpx;
}

.task-meta {
  display: flex;
}

.meta-item {
  font-size: 24rpx;
  color: #8477fa;
  margin-right: 20rpx;
}

.task-arrow {
  font-size: 40rpx;
  color: #999;
  display: flex;
  align-items: center;
}

.task-popup .popup-content,
.record-popup .popup-content {
  background-color: #ffffff;
  border-radius: 24rpx 24rpx 0 0;
  max-height: 80vh;
}

.popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.popup-title {
  font-size: 34rpx;
  font-weight: bold;
  color: #333;
}

.close-btn {
  font-size: 48rpx;
  color: #999;
  line-height: 1;
}

.popup-body {
  max-height: 60vh;
  padding: 30rpx;
}

.task-detail {
  margin-bottom: 30rpx;
}

.detail-desc {
  font-size: 30rpx;
  color: #333;
  line-height: 1.6;
  display: block;
  margin-bottom: 30rpx;
}

.detail-section {
  margin-bottom: 24rpx;
}

.section-label {
  font-size: 28rpx;
  color: #666;
  display: block;
  margin-bottom: 8rpx;
}

.section-value {
  font-size: 30rpx;
  color: #333;
  font-weight: bold;
}

.section-value.highlight {
  color: #8477fa;
}

.type-badge {
  font-size: 26rpx;
  color: #ffffff;
  background-color: #8477fa;
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
}

.steps-list {
  margin-top: 12rpx;
}

.step-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 16rpx;
}

.step-num {
  width: 40rpx;
  height: 40rpx;
  background-color: #8477fa;
  color: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  flex-shrink: 0;
  margin-right: 16rpx;
}

.step-text {
  font-size: 28rpx;
  color: #333;
  flex: 1;
  line-height: 1.5;
}

.btn-start {
  width: 100%;
  height: 88rpx;
  background-color: #8477fa;
  color: #ffffff;
  font-size: 32rpx;
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  margin-top: 20rpx;
}

.record-form {
  margin-bottom: 30rpx;
}

.form-item {
  margin-bottom: 24rpx;
}

.form-label {
  font-size: 28rpx;
  color: #666;
  display: block;
  margin-bottom: 8rpx;
}

.form-input {
  width: 100%;
  height: 80rpx;
  background-color: #f5f5f5;
  border-radius: 12rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
}

.form-textarea {
  width: 100%;
  height: 160rpx;
  background-color: #f5f5f5;
  border-radius: 12rpx;
  padding: 20rpx;
  font-size: 28rpx;
}

.points-preview {
  font-size: 36rpx;
  color: #8477fa;
  font-weight: bold;
}

.btn-submit {
  width: 100%;
  height: 88rpx;
  background-color: #4caf50;
  color: #ffffff;
  font-size: 32rpx;
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
}

.history-section {
  background-color: #ffffff;
  padding: 30rpx;
  margin-top: 20rpx;
}

.section-header {
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.history-list {
  margin-top: 16rpx;
}

.history-item {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.history-item:last-child {
  border-bottom: none;
}

.history-icon {
  width: 80rpx;
  height: 80rpx;
  background-color: #f0f0f0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
  flex-shrink: 0;
}

.history-info {
  flex: 1;
  margin-left: 16rpx;
}

.history-title {
  font-size: 28rpx;
  color: #333;
  display: block;
  margin-bottom: 4rpx;
}

.history-date {
  font-size: 24rpx;
  color: #999;
}

.history-points {
  text-align: right;
}

.history-points .points {
  font-size: 28rpx;
  color: #8477fa;
  font-weight: bold;
  display: block;
}

.history-points .hours {
  font-size: 24rpx;
  color: #999;
}
</style>
