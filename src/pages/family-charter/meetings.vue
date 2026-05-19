<template>
  <view class="meetings-page-container">
    <!-- 顶部导航 -->
    <view class="header">
      <view class="header-left" @click="goBack">
        <text class="icon">←</text>
      </view>
      <view class="header-title">
        <text>家庭会议</text>
      </view>
      <view class="header-right" @click="showCreateDialog">
        <text class="icon">+</text>
      </view>
    </view>

    <!-- Tab 切换 -->
    <view class="tabs">
      <view 
        class="tab" 
        :class="{ active: activeTab === 'upcoming' }"
        @click="activeTab = 'upcoming'"
      >
        即将开始 ({{ upcomingMeetings.length }})
      </view>
      <view 
        class="tab" 
        :class="{ active: activeTab === 'ongoing' }"
        @click="activeTab = 'ongoing'"
      >
        进行中 ({{ ongoingMeetings.length }})
      </view>
      <view 
        class="tab" 
        :class="{ active: activeTab === 'finished' }"
        @click="activeTab = 'finished'"
      >
        已结束 ({{ finishedMeetings.length }})
      </view>
    </view>

    <!-- 会议列表 -->
    <view class="meetings-list">
      <view 
        class="meeting-card" 
        v-for="meeting in filteredMeetings" 
        :key="meeting.id"
        @click="viewMeeting(meeting)"
      >
        <view class="meeting-header">
          <view class="meeting-status" :class="meeting.status">
            {{ getStatusLabel(meeting.status) }}
          </view>
          <view class="meeting-date">
            {{ formatDate(meeting.scheduledTime) }}
          </view>
        </view>
        
        <view class="meeting-title">{{ meeting.title }}</view>
        
        <view class="meeting-info">
          <view class="info-item">
            <text class="info-icon">👥</text>
            <text>{{ meeting.participantIds?.length || 0 }} 人参与</text>
          </view>
          <view class="info-item" v-if="meeting.agenda && meeting.agenda.length > 0">
            <text class="info-icon">📋</text>
            <text>{{ meeting.agenda.length }} 个议题</text>
          </view>
        </view>

        <!-- 进行中会议操作 -->
        <view class="meeting-actions" v-if="meeting.status === 'ongoing'">
          <button class="action-btn" @click.stop="endMeeting(meeting)">结束会议</button>
        </view>

        <!-- 即将开始会议操作 -->
        <view class="meeting-actions" v-if="meeting.status === 'upcoming'">
          <button class="action-btn primary" @click.stop="startMeeting(meeting)">开始会议</button>
        </view>
      </view>

      <!-- 空状态 -->
      <view class="empty-state" v-if="filteredMeetings.length === 0">
        <text class="empty-icon">👨‍👩‍👧</text>
        <text class="empty-text">暂无会议</text>
        <text class="empty-hint">点击右上角 + 创建第一个家庭会议</text>
      </view>
    </view>

    <!-- 创建会议弹窗 -->
    <view class="dialog-overlay" v-if="showDialog" @click="closeDialog">
      <view class="dialog" @click.stop>
        <view class="dialog-header">
          <text class="dialog-title">创建家庭会议</text>
          <text class="dialog-close" @click="closeDialog">×</text>
        </view>
        <view class="dialog-body">
          <view class="form-item">
            <text class="form-label">会议主题</text>
            <input 
              class="form-input" 
              v-model="formData.title" 
              placeholder="例如：本周家庭事务讨论"
            />
          </view>
          
          <view class="form-item">
            <text class="form-label">会议时间</text>
            <picker mode="date" :value="formData.date" @change="onDateChange">
              <view class="picker-value">{{ formData.date || '选择日期' }}</view>
            </picker>
          </view>
          
          <view class="form-item">
            <text class="form-label">会议时间</text>
            <picker mode="time" :value="formData.time" @change="onTimeChange">
              <view class="picker-value">{{ formData.time || '选择时间' }}</view>
            </picker>
          </view>
          
          <view class="form-item">
            <text class="form-label">参与人</text>
            <view class="participants-list">
              <view 
                class="participant-item"
                v-for="child in familyChildren" 
                :key="child.id"
                :class="{ selected: formData.participantIds.includes(child.id) }"
                @click="toggleParticipant(child.id)"
              >
                <text class="participant-avatar">{{ child.avatar || '👶' }}</text>
                <text class="participant-name">{{ child.name }}</text>
                <text class="check-icon" v-if="formData.participantIds.includes(child.id)">✓</text>
              </view>
            </view>
          </view>
        </view>
        <view class="dialog-footer">
          <button class="btn btn-cancel" @click="closeDialog">取消</button>
          <button class="btn btn-primary" @click="createMeeting">创建</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useFamilyCharterStore } from '@/stores/familyCharterStore.js'
import { useBabyStore } from '@/stores/babyStore.js'
import { MEETING_STATUS } from '@/services/familyCharterService.js'

const familyCharterStore = useFamilyCharterStore()
const babyStore = useBabyStore()

// Tab 状态
const activeTab = ref('upcoming')

// 弹窗状态
const showDialog = ref(false)

// 表单数据
const formData = ref({
  title: '',
  date: '',
  time: '',
  participantIds: []
})

// 所有会议
const allMeetings = computed(() => familyCharterStore.getAllMeetings())

// 即将开始的会议
const upcomingMeetings = computed(() => familyCharterStore.upcomingMeetings)

// 进行中的会议
const ongoingMeetings = computed(() => familyCharterStore.ongoingMeetings)

// 已结束的会议
const finishedMeetings = computed(() => familyCharterStore.finishedMeetings)

// 过滤后的会议
const filteredMeetings = computed(() => {
  switch (activeTab.value) {
    case 'upcoming':
      return upcomingMeetings.value
    case 'ongoing':
      return ongoingMeetings.value
    case 'finished':
      return finishedMeetings.value
    default:
      return []
  }
})

// 家庭成员（模拟）
const familyChildren = computed(() => {
  try {
    return babyStore.babies.map(b => ({
      id: b.id,
      name: b.name,
      avatar: b.avatar || '👶'
    }))
  } catch (e) {
    return [
      { id: 'child_1', name: '孩子1', avatar: '👶' },
      { id: 'child_2', name: '孩子2', avatar: '👧' }
    ]
  }
})

// 页面加载
onMounted(() => {
  familyCharterStore.init()
})

// 返回
const goBack = () => {
  uni.navigateBack()
}

// 获取状态标签
const getStatusLabel = (status) => {
  switch (status) {
    case MEETING_STATUS.UPCOMING:
      return '即将开始'
    case MEETING_STATUS.ONGOING:
      return '进行中'
    case MEETING_STATUS.FINISHED:
      return '已结束'
    default:
      return status
  }
}

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes().toString().padStart(2, '0')
  return `${month}月${day}日 ${hour}:${minute}`
}

// 查看会议详情
const viewMeeting = (meeting) => {
  familyCharterStore.selectMeeting(meeting)
  uni.navigateTo({
    url: '/pages/family-charter/meeting-detail?meetingId=' + meeting.id
  })
}

// 开始会议
const startMeeting = (meeting) => {
  uni.showModal({
    title: '确认开始',
    content: '确定要开始这个会议吗？',
    success: (res) => {
      if (res.confirm) {
        familyCharterStore.startMeeting(meeting.id)
        viewMeeting(meeting)
        uni.showToast({ title: '会议已开始', icon: 'success' })
      }
    }
  })
}

// 结束会议
const endMeeting = (meeting) => {
  uni.showModal({
    title: '确认结束',
    content: '确定要结束这个会议吗？',
    success: (res) => {
      if (res.confirm) {
        familyCharterStore.endMeeting(meeting.id, '会议已结束', [])
        uni.showToast({ title: '会议已结束', icon: 'success' })
      }
    }
  })
}

// 显示创建弹窗
const showCreateDialog = () => {
  formData.value = {
    title: '',
    date: new Date().toISOString().split('T')[0],
    time: '19:00',
    participantIds: familyChildren.value.map(c => c.id)
  }
  showDialog.value = true
}

// 关闭弹窗
const closeDialog = () => {
  showDialog.value = false
}

// 日期选择
const onDateChange = (e) => {
  formData.value.date = e.detail.value
}

// 时间选择
const onTimeChange = (e) => {
  formData.value.time = e.detail.value
}

// 切换参与人
const toggleParticipant = (childId) => {
  const index = formData.value.participantIds.indexOf(childId)
  if (index > -1) {
    formData.value.participantIds.splice(index, 1)
  } else {
    formData.value.participantIds.push(childId)
  }
}

// 创建会议
const createMeeting = () => {
  if (!formData.value.title.trim()) {
    uni.showToast({ title: '请输入会议主题', icon: 'none' })
    return
  }
  if (!formData.value.date || !formData.value.time) {
    uni.showToast({ title: '请选择会议时间', icon: 'none' })
    return
  }
  if (formData.value.participantIds.length === 0) {
    uni.showToast({ title: '请选择参与人', icon: 'none' })
    return
  }
  
  const scheduledTime = new Date(`${formData.value.date}T${formData.value.time}:00`).toISOString()
  const currentUserId = 'user_' + Date.now()
  
  familyCharterStore.createMeeting(
    formData.value.title.trim(),
    scheduledTime,
    formData.value.participantIds,
    currentUserId
  )
  
  closeDialog()
  uni.showToast({ title: '会议已创建', icon: 'success' })
}
</script>

<style scoped>
.meetings-page-container {
  min-height: 100vh;
  background: #f5f5f5;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 44px 16px 12px;
  background: linear-gradient(135deg, #1890ff 0%, #722ed1 100%);
  color: #fff;
}

.header-left, .header-right {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
}

.icon {
  font-size: 20px;
}

.tabs {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  background: #fff;
  overflow-x: auto;
}

.tab {
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 13px;
  color: #666;
  background: #f5f5f5;
  white-space: nowrap;
}

.tab.active {
  background: linear-gradient(135deg, #1890ff 0%, #722ed1 100%);
  color: #fff;
}

.meetings-list {
  padding: 16px;
}

.meeting-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.meeting-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.meeting-status {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 8px;
  color: #fff;
}

.meeting-status.upcoming {
  background: #fa8c16;
}

.meeting-status.ongoing {
  background: #52c41a;
}

.meeting-status.finished {
  background: #999;
}

.meeting-date {
  font-size: 12px;
  color: #999;
}

.meeting-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

.meeting-info {
  display: flex;
  gap: 20px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #666;
}

.info-icon {
  font-size: 14px;
}

.meeting-actions {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.action-btn {
  padding: 8px 20px;
  border-radius: 16px;
  font-size: 13px;
  background: #f5f5f5;
  color: #666;
  border: none;
}

.action-btn.primary {
  background: linear-gradient(135deg, #1890ff 0%, #722ed1 100%);
  color: #fff;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 16px;
  color: #333;
  display: block;
  margin-bottom: 8px;
}

.empty-hint {
  font-size: 14px;
  color: #999;
}

.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  z-index: 1000;
}

.dialog {
  width: 100%;
  background: #fff;
  border-radius: 16px 16px 0 0;
  max-height: 85vh;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.dialog-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.dialog-close {
  font-size: 24px;
  color: #999;
}

.dialog-body {
  padding: 20px;
  max-height: 55vh;
  overflow-y: auto;
}

.form-item {
  margin-bottom: 20px;
}

.form-label {
  font-size: 14px;
  color: #333;
  display: block;
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  height: 44px;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  padding: 0 12px;
  font-size: 14px;
}

.picker-value {
  height: 44px;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  padding: 0 12px;
  font-size: 14px;
  display: flex;
  align-items: center;
  color: #666;
}

.participants-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.participant-item {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border-radius: 8px;
  background: #f5f5f5;
}

.participant-item.selected {
  background: rgba(24, 144, 255, 0.1);
  border: 1px solid #1890ff;
}

.participant-avatar {
  font-size: 20px;
  margin-right: 10px;
}

.participant-name {
  flex: 1;
  font-size: 14px;
  color: #333;
}

.check-icon {
  color: #1890ff;
  font-size: 16px;
  font-weight: bold;
}

.dialog-footer {
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid #f0f0f0;
}

.btn {
  flex: 1;
  height: 44px;
  border-radius: 8px;
  font-size: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-cancel {
  background: #f5f5f5;
  color: #666;
}

.btn-primary {
  background: linear-gradient(135deg, #1890ff 0%, #722ed1 100%);
  color: #fff;
}
</style>
