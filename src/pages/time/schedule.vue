<template>
  <view class="schedule-page">
    <!-- 顶部导航 -->
    <view class="header">
      <view class="header-left" @click="goBack">
        <text class="icon">←</text>
      </view>
      <view class="header-title">
        <text>日程管理</text>
      </view>
      <view class="header-right">
        <text class="icon" @click="showAddSchedule">+</text>
      </view>
    </view>

    <!-- 日期选择 -->
    <view class="date-selector">
      <view class="date-nav" @click="prevDay">
        <text>◀</text>
      </view>
      <view class="date-display" @click="showDatePicker">
        <text>{{ formatDate(selectedDate) }}</text>
      </view>
      <view class="date-nav" @click="nextDay">
        <text>▶</text>
      </view>
    </view>

    <!-- 今日概览 -->
    <view class="today-overview">
      <view class="overview-item">
        <text class="overview-value">{{ todaySchedules.length }}</text>
        <text class="overview-label">日程数</text>
      </view>
      <view class="overview-item">
        <text class="overview-value">{{ completedCount }}</text>
        <text class="overview-label">已完成</text>
      </view>
      <view class="overview-item">
        <text class="overview-value">{{ remainingCount }}</text>
        <text class="overview-label">待完成</text>
      </view>
    </view>

    <!-- 日程列表 -->
    <scroll-view class="schedule-list" scroll-y>
      <view v-if="todaySchedules.length === 0" class="empty-state">
        <text class="empty-icon">📅</text>
        <text class="empty-text">今日暂无日程</text>
        <text class="empty-hint">点击右上角添加日程</text>
      </view>

      <view
        v-for="schedule in todaySchedules"
        :key="schedule.id"
        class="schedule-item"
        :class="{ completed: schedule.completed }"
        @click="toggleSchedule(schedule)"
      >
        <view class="schedule-checkbox">
          <text v-if="schedule.completed">✓</text>
        </view>
        <view class="schedule-content">
          <view class="schedule-header">
            <text class="schedule-title">{{ schedule.title }}</text>
            <view class="schedule-type" :style="{ backgroundColor: getTypeColor(schedule.type) }">
              <text>{{ getTypeLabel(schedule.type) }}</text>
            </view>
          </view>
          <view class="schedule-time">
            <text>{{ schedule.startTime || '--:--' }} - {{ schedule.endTime || '--:--' }}</text>
          </view>
          <view v-if="schedule.description" class="schedule-desc">
            <text>{{ schedule.description }}</text>
          </view>
        </view>
        <view class="schedule-actions" @click.stop="showScheduleActions(schedule)">
          <text class="action-icon">⋮</text>
        </view>
      </view>
    </scroll-view>

    <!-- 添加日程弹窗 -->
    <view v-if="showAddModal" class="modal-overlay" @click="closeModal">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">{{ editingSchedule ? '编辑日程' : '添加日程' }}</text>
          <text class="modal-close" @click="closeModal">×</text>
        </view>

        <view class="form-item">
          <text class="form-label">标题</text>
          <input
            v-model="scheduleForm.title"
            class="form-input"
            placeholder="请输入日程标题"
          />
        </view>

        <view class="form-item">
          <text class="form-label">描述</text>
          <textarea
            v-model="scheduleForm.description"
            class="form-textarea"
            placeholder="请输入日程描述（可选）"
          />
        </view>

        <view class="form-row">
          <view class="form-item half">
            <text class="form-label">开始时间</text>
            <picker mode="time" :value="scheduleForm.startTime" @change="onStartTimeChange">
              <view class="form-picker">
                <text>{{ scheduleForm.startTime || '选择时间' }}</text>
              </view>
            </picker>
          </view>
          <view class="form-item half">
            <text class="form-label">结束时间</text>
            <picker mode="time" :value="scheduleForm.endTime" @change="onEndTimeChange">
              <view class="form-picker">
                <text>{{ scheduleForm.endTime || '选择时间' }}</text>
              </view>
            </picker>
          </view>
        </view>

        <view class="form-item">
          <text class="form-label">类型</text>
          <view class="type-selector">
            <view
              v-for="type in scheduleTypes"
              :key="type.value"
              class="type-option"
              :class="{ active: scheduleForm.type === type.value }"
              :style="scheduleForm.type === type.value ? { backgroundColor: type.color } : {}"
              @click="scheduleForm.type = type.value"
            >
              <text>{{ type.label }}</text>
            </view>
          </view>
        </view>

        <view class="form-actions">
          <button v-if="editingSchedule" class="btn-delete" @click="deleteSchedule">删除</button>
          <button class="btn-save" @click="saveSchedule">{{ editingSchedule ? '保存' : '添加' }}</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { useTimeStore } from '@/stores/timeStore'

export default {
  data() {
    return {
      showAddModal: false,
      editingSchedule: null,
      scheduleForm: {
        title: '',
        description: '',
        startTime: '',
        endTime: '',
        type: 'general'
      },
      scheduleTypes: [
        { label: '一般', value: 'general', color: '#8477fa' },
        { label: '学习', value: 'study', color: '#4a90d9' },
        { label: '运动', value: 'exercise', color: '#52c41a' },
        { label: '休息', value: 'rest', color: '#fa8c16' }
      ]
    }
  },
  computed: {
    selectedDate() {
      return this.timeStore.selectedDate
    },
    todaySchedules() {
      return this.timeStore.schedules.filter(s => s.date === this.timeStore.selectedDate)
    },
    completedCount() {
      return this.todaySchedules.filter(s => s.completed).length
    },
    remainingCount() {
      return this.todaySchedules.filter(s => !s.completed).length
    },
    timeStore() {
      return useTimeStore()
    }
  },
  onLoad() {
    this.timeStore.init()
  },
  onUnload() {
    this.timeStore.cleanup()
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    formatDate(dateStr) {
      const date = new Date(dateStr)
      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(today.getDate() + 1)
      const yesterday = new Date(today)
      yesterday.setDate(today.getDate() - 1)

      if (date.toDateString() === today.toDateString()) {
        return '今天'
      } else if (date.toDateString() === tomorrow.toDateString()) {
        return '明天'
      } else if (date.toDateString() === yesterday.toDateString()) {
        return '昨天'
      } else {
        return `${date.getMonth() + 1}月${date.getDate()}日`
      }
    },
    prevDay() {
      const date = new Date(this.selectedDate)
      date.setDate(date.getDate() - 1)
      this.timeStore.setSelectedDate(date.toISOString().split('T')[0])
    },
    nextDay() {
      const date = new Date(this.selectedDate)
      date.setDate(date.getDate() + 1)
      this.timeStore.setSelectedDate(date.toISOString().split('T')[0])
    },
    showDatePicker() {
      uni.showDatePicker({
        currentDate: this.selectedDate,
        success: (res) => {
          this.timeStore.setSelectedDate(res.dateStr)
        }
      })
    },
    getTypeColor(type) {
      const typeMap = {
        general: '#8477fa',
        study: '#4a90d9',
        exercise: '#52c41a',
        rest: '#fa8c16'
      }
      return typeMap[type] || '#8477fa'
    },
    getTypeLabel(type) {
      const labelMap = {
        general: '一般',
        study: '学习',
        exercise: '运动',
        rest: '休息'
      }
      return labelMap[type] || '一般'
    },
    showAddSchedule() {
      this.editingSchedule = null
      this.scheduleForm = {
        title: '',
        description: '',
        startTime: '',
        endTime: '',
        type: 'general'
      }
      this.showAddModal = true
    },
    showScheduleActions(schedule) {
      uni.showActionSheet({
        itemList: ['编辑', '删除'],
        success: (res) => {
          if (res.tapIndex === 0) {
            this.editSchedule(schedule)
          } else if (res.tapIndex === 1) {
            this.timeStore.removeSchedule(schedule.id)
          }
        }
      })
    },
    editSchedule(schedule) {
      this.editingSchedule = schedule
      this.scheduleForm = {
        title: schedule.title,
        description: schedule.description || '',
        startTime: schedule.startTime || '',
        endTime: schedule.endTime || '',
        type: schedule.type || 'general'
      }
      this.showAddModal = true
    },
    onStartTimeChange(e) {
      this.scheduleForm.startTime = e.detail.value
    },
    onEndTimeChange(e) {
      this.scheduleForm.endTime = e.detail.value
    },
    toggleSchedule(schedule) {
      if (schedule.completed) {
        this.timeStore.updateSchedule(schedule.id, { completed: false, completedAt: null })
      } else {
        this.timeStore.completeSchedule(schedule.id)
      }
    },
    saveSchedule() {
      if (!this.scheduleForm.title.trim()) {
        uni.showToast({ title: '请输入标题', icon: 'none' })
        return
      }

      if (this.editingSchedule) {
        this.timeStore.updateSchedule(this.editingSchedule.id, this.scheduleForm)
      } else {
        this.timeStore.addSchedule(this.scheduleForm)
      }
      this.closeModal()
    },
    deleteSchedule() {
      if (this.editingSchedule) {
        uni.showModal({
          title: '确认删除',
          content: '确定要删除这个日程吗？',
          success: (res) => {
            if (res.confirm) {
              this.timeStore.removeSchedule(this.editingSchedule.id)
              this.closeModal()
            }
          }
        })
      }
    },
    closeModal() {
      this.showAddModal = false
      this.editingSchedule = null
    }
  }
}
</script>

<style scoped>
.schedule-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 16px;
  background-color: #8477fa;
  color: white;
}

.header-left, .header-right {
  width: 40px;
}

.header-title {
  flex: 1;
  text-align: center;
  font-size: 18px;
  font-weight: bold;
}

.icon {
  font-size: 20px;
}

.date-selector {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background-color: white;
}

.date-nav {
  padding: 8px 16px;
  color: #8477fa;
}

.date-display {
  padding: 8px 24px;
  background-color: #f0f0ff;
  border-radius: 20px;
  margin: 0 16px;
}

.today-overview {
  display: flex;
  justify-content: space-around;
  padding: 16px;
  background-color: white;
  margin-top: 1px;
}

.overview-item {
  text-align: center;
}

.overview-value {
  font-size: 24px;
  font-weight: bold;
  color: #8477fa;
}

.overview-label {
  display: block;
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.schedule-list {
  height: calc(100vh - 280px);
  padding: 16px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 80px;
}

.empty-icon {
  font-size: 64px;
}

.empty-text {
  margin-top: 16px;
  font-size: 16px;
  color: #666;
}

.empty-hint {
  margin-top: 8px;
  font-size: 14px;
  color: #999;
}

.schedule-item {
  display: flex;
  align-items: flex-start;
  background-color: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
}

.schedule-item.completed {
  opacity: 0.6;
}

.schedule-item.completed .schedule-title {
  text-decoration: line-through;
}

.schedule-checkbox {
  width: 24px;
  height: 24px;
  border: 2px solid #8477fa;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  color: #8477fa;
  font-size: 14px;
}

.schedule-content {
  flex: 1;
}

.schedule-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.schedule-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.schedule-type {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 10px;
  color: white;
}

.schedule-time {
  margin-top: 4px;
  font-size: 14px;
  color: #999;
}

.schedule-desc {
  margin-top: 8px;
  font-size: 14px;
  color: #666;
}

.schedule-actions {
  padding: 4px 8px;
}

.action-icon {
  font-size: 18px;
  color: #999;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  z-index: 1000;
}

.modal-content {
  width: 100%;
  background-color: white;
  border-radius: 16px 16px 0 0;
  padding: 20px;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-title {
  font-size: 18px;
  font-weight: bold;
}

.modal-close {
  font-size: 28px;
  color: #999;
}

.form-item {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  height: 44px;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 0 12px;
  font-size: 14px;
}

.form-textarea {
  width: 100%;
  height: 80px;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 12px;
  font-size: 14px;
}

.form-row {
  display: flex;
  gap: 12px;
}

.form-item.half {
  flex: 1;
}

.form-picker {
  height: 44px;
  border: 1px solid #ddd;
  border-radius: 8px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  font-size: 14px;
}

.type-selector {
  display: flex;
  gap: 8px;
}

.type-option {
  flex: 1;
  height: 36px;
  border: 1px solid #ddd;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #666;
}

.type-option.active {
  color: white;
  border-color: transparent;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.btn-delete {
  flex: 1;
  height: 44px;
  background-color: #ff4d4f;
  color: white;
  border-radius: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  border: none;
}

.btn-save {
  flex: 2;
  height: 44px;
  background-color: #8477fa;
  color: white;
  border-radius: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  border: none;
}
</style>
