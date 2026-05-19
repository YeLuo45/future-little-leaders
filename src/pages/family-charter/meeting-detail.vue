<template>
  <view class="meeting-detail-container">
    <!-- 顶部导航 -->
    <view class="header">
      <view class="header-left" @click="goBack">
        <text class="icon">←</text>
      </view>
      <view class="header-title">
        <text>会议详情</text>
      </view>
      <view class="header-right" @click="showAddAgendaDialog" v-if="meeting && meeting.status === 'ongoing'">
        <text class="icon">+</text>
      </view>
    </view>

    <!-- 会议信息 -->
    <view class="meeting-info" v-if="meeting">
      <view class="info-header">
        <view class="status-badge" :class="meeting.status">
          {{ getStatusLabel(meeting.status) }}
        </view>
        <text class="meeting-time">{{ formatDateTime(meeting.scheduledTime) }}</text>
      </view>
      <text class="meeting-title">{{ meeting.title }}</text>
      
      <view class="meeting-meta">
        <view class="meta-item">
          <text class="meta-icon">👥</text>
          <text>{{ meeting.participantIds?.length || 0 }} 人参与</text>
        </view>
        <view class="meta-item">
          <text class="meta-icon">📋</text>
          <text>{{ meeting.agenda?.length || 0 }} 个议题</text>
        </view>
      </view>
    </view>

    <!-- 议题列表 -->
    <view class="agenda-section">
      <view class="section-title">议题列表</view>
      
      <view class="agenda-list" v-if="agendaItems.length > 0">
        <view 
          class="agenda-item" 
          v-for="(item, index) in agendaItems" 
          :key="item.id"
        >
          <view class="agenda-header">
            <view class="agenda-number">{{ index + 1 }}</view>
            <view class="agenda-status" :class="item.status">
              {{ getAgendaStatusLabel(item.status) }}
            </view>
          </view>
          
          <view class="agenda-content">
            <text class="agenda-title">{{ item.title }}</text>
            <text class="agenda-description" v-if="item.description">{{ item.description }}</text>
            <text class="agenda-proposer">提议人: {{ item.proposer || '未知' }}</text>
          </view>
          
          <!-- 投票区域 -->
          <view class="vote-section" v-if="meeting.status === 'ongoing'">
            <view class="vote-stats">
              <text class="vote-for">✓ 赞成 {{ item.votes?.for || 0 }}</text>
              <text class="vote-against">✗ 反对 {{ item.votes?.against || 0 }}</text>
              <text class="vote-abstain">○ 弃权 {{ item.votes?.abstain || 0 }}</text>
            </view>
            <view class="vote-buttons">
              <button class="vote-btn for" @click="vote(item, 'for')">赞成</button>
              <button class="vote-btn against" @click="vote(item, 'against')">反对</button>
              <button class="vote-btn abstain" @click="vote(item, 'abstain')">弃权</button>
            </view>
          </view>
        </view>
      </view>
      
      <view class="empty-agenda" v-else>
        <text class="empty-icon">📋</text>
        <text class="empty-text">暂无议题</text>
        <text class="empty-hint" v-if="meeting.status === 'ongoing'">点击右上角 + 添加议题</text>
      </view>
    </view>

    <!-- 会议记录 -->
    <view class="minutes-section" v-if="meeting && meeting.status === 'finished'">
      <view class="section-title">会议记录</view>
      <view class="minutes-content">
        <text>{{ meeting.minutes || '暂无会议记录' }}</text>
      </view>
      
      <view class="decisions" v-if="meeting.decisions && meeting.decisions.length > 0">
        <view class="section-title">决议</view>
        <view class="decision-item" v-for="(decision, index) in meeting.decisions" :key="index">
          {{ decision }}
        </view>
      </view>
    </view>

    <!-- 添加议题弹窗 -->
    <view class="dialog-overlay" v-if="showDialog" @click="closeDialog">
      <view class="dialog" @click.stop>
        <view class="dialog-header">
          <text class="dialog-title">添加议题</text>
          <text class="dialog-close" @click="closeDialog">×</text>
        </view>
        <view class="dialog-body">
          <view class="form-item">
            <text class="form-label">议题标题</text>
            <input 
              class="form-input" 
              v-model="agendaForm.title" 
              placeholder="例如：关于周末活动的安排"
            />
          </view>
          <view class="form-item">
            <text class="form-label">议题说明</text>
            <textarea 
              class="form-textarea" 
              v-model="agendaForm.description" 
              placeholder="详细说明..."
            />
          </view>
        </view>
        <view class="dialog-footer">
          <button class="btn btn-cancel" @click="closeDialog">取消</button>
          <button class="btn btn-primary" @click="addAgenda">添加</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useFamilyCharterStore } from '@/stores/familyCharterStore.js'
import { MEETING_STATUS, AGENDA_STATUS } from '@/services/familyCharterService.js'

const familyCharterStore = useFamilyCharterStore()

// 会议ID
const meetingId = ref('')

// 弹窗状态
const showDialog = ref(false)

// 议题表单
const agendaForm = ref({
  title: '',
  description: ''
})

// 会议信息
const meeting = computed(() => {
  return familyCharterStore.meetings.find(m => m.id === meetingId.value)
})

// 议题列表
const agendaItems = computed(() => {
  return meeting.value?.agenda || []
})

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

// 获取议题状态标签
const getAgendaStatusLabel = (status) => {
  switch (status) {
    case AGENDA_STATUS.PENDING:
      return '待投票'
    case AGENDA_STATUS.APPROVED:
      return '已通过'
    case AGENDA_STATUS.REJECTED:
      return '已否决'
    case AGENDA_STATUS.DISCUSSED:
      return '已讨论'
    default:
      return status
  }
}

// 格式化日期时间
const formatDateTime = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes().toString().padStart(2, '0')
  return `${month}月${day}日 ${hour}:${minute}`
}

// 页面加载
onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  if (currentPage.options) {
    meetingId.value = currentPage.options.meetingId || ''
  }
  familyCharterStore.init()
})

// 返回
const goBack = () => {
  uni.navigateBack()
}

// 显示添加议题弹窗
const showAddAgendaDialog = () => {
  agendaForm.value = {
    title: '',
    description: ''
  }
  showDialog.value = true
}

// 关闭弹窗
const closeDialog = () => {
  showDialog.value = false
}

// 添加议题
const addAgenda = () => {
  if (!agendaForm.value.title.trim()) {
    uni.showToast({ title: '请输入议题标题', icon: 'none' })
    return
  }
  
  const currentUserId = 'user_' + Date.now()
  familyCharterStore.addAgendaItem(meetingId.value, {
    title: agendaForm.value.title.trim(),
    description: agendaForm.value.description.trim(),
    proposer: currentUserId
  })
  
  closeDialog()
  uni.showToast({ title: '议题已添加', icon: 'success' })
}

// 投票
const vote = (item, voteType) => {
  const currentUserId = 'user_' + Date.now()
  familyCharterStore.voteAgendaItem(meetingId.value, item.id, currentUserId, voteType)
  uni.showToast({ title: '投票成功', icon: 'success' })
}
</script>

<style scoped>
.meeting-detail-container {
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

.meeting-info {
  margin: 16px;
  padding: 16px;
  background: #fff;
  border-radius: 12px;
}

.info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.status-badge {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 8px;
  color: #fff;
}

.status-badge.upcoming {
  background: #fa8c16;
}

.status-badge.ongoing {
  background: #52c41a;
}

.status-badge.finished {
  background: #999;
}

.meeting-time {
  font-size: 13px;
  color: #999;
}

.meeting-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 12px;
}

.meeting-meta {
  display: flex;
  gap: 20px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #666;
}

.meta-icon {
  font-size: 14px;
}

.agenda-section {
  margin: 0 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

.agenda-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.agenda-item {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
}

.agenda-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.agenda-number {
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #1890ff 0%, #722ed1 100%);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
}

.agenda-status {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 8px;
  color: #fff;
}

.agenda-status.pending {
  background: #fa8c16;
}

.agenda-status.approved {
  background: #52c41a;
}

.agenda-status.rejected {
  background: #f5222d;
}

.agenda-status.discussed {
  background: #1890ff;
}

.agenda-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 6px;
}

.agenda-description {
  font-size: 13px;
  color: #666;
  display: block;
  margin-bottom: 6px;
}

.agenda-proposer {
  font-size: 12px;
  color: #999;
}

.vote-section {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.vote-stats {
  display: flex;
  gap: 16px;
  margin-bottom: 10px;
}

.vote-for {
  color: #52c41a;
  font-size: 13px;
}

.vote-against {
  color: #f5222d;
  font-size: 13px;
}

.vote-abstain {
  color: #999;
  font-size: 13px;
}

.vote-buttons {
  display: flex;
  gap: 8px;
}

.vote-btn {
  flex: 1;
  height: 36px;
  border-radius: 18px;
  font-size: 13px;
  border: none;
}

.vote-btn.for {
  background: #f6ffed;
  color: #52c41a;
  border: 1px solid #52c41a;
}

.vote-btn.against {
  background: #fff1f0;
  color: #f5222d;
  border: 1px solid #f5222d;
}

.vote-btn.abstain {
  background: #f5f5f5;
  color: #666;
  border: 1px solid #d9d9d9;
}

.empty-agenda {
  text-align: center;
  padding: 40px 20px;
  background: #fff;
  border-radius: 12px;
}

.empty-icon {
  font-size: 36px;
  display: block;
  margin-bottom: 12px;
}

.empty-text {
  font-size: 14px;
  color: #333;
  display: block;
  margin-bottom: 6px;
}

.empty-hint {
  font-size: 12px;
  color: #999;
}

.minutes-section {
  margin: 20px 16px;
}

.minutes-content {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}

.decisions {
  margin-top: 16px;
}

.decision-item {
  background: #fff;
  border-radius: 12px;
  padding: 12px 16px;
  margin-bottom: 8px;
  font-size: 14px;
  color: #333;
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
}

.form-item {
  margin-bottom: 16px;
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

.form-textarea {
  width: 100%;
  height: 100px;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  padding: 12px;
  font-size: 14px;
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
