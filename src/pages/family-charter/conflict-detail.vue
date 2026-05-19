<template>
  <view class="conflict-detail-container">
    <!-- 顶部导航 -->
    <view class="header">
      <view class="header-left" @click="goBack">
        <text class="icon">←</text>
      </view>
      <view class="header-title">
        <text>冲突详情</text>
      </view>
      <view class="header-right" @click="showAddStepDialog" v-if="conflict && conflict.status !== 'resolved'">
        <text class="icon">+</text>
      </view>
    </view>

    <!-- 冲突信息 -->
    <view class="conflict-info" v-if="conflict">
      <view class="info-header">
        <view class="status-badge" :class="conflict.status">
          {{ getStatusLabel(conflict.status) }}
        </view>
        <text class="conflict-date">{{ formatDateTime(conflict.createdAt) }}</text>
      </view>
      <text class="conflict-title">{{ conflict.title }}</text>
      <text class="conflict-description" v-if="conflict.description">{{ conflict.description }}</text>
      
      <view class="conflict-parties">
        <text class="parties-label">相关方:</text>
        <view class="party-tags">
          <text class="party-tag" v-for="party in conflict.parties" :key="party">{{ party }}</text>
        </view>
      </view>
    </view>

    <!-- 解决进度 -->
    <view class="steps-section">
      <view class="section-title">解决进度</view>
      
      <view class="timeline" v-if="conflict && conflict.steps && conflict.steps.length > 0">
        <view 
          class="timeline-item" 
          v-for="(step, index) in conflict.steps" 
          :key="step.id"
          :class="{ last: index === conflict.steps.length - 1 }"
        >
          <view class="timeline-marker">
            <view class="marker-dot"></view>
            <view class="marker-line" v-if="index < conflict.steps.length - 1"></view>
          </view>
          <view class="timeline-content">
            <view class="step-header">
              <text class="step-action">{{ getActionLabel(step.action) }}</text>
              <text class="step-time">{{ formatTime(step.timestamp) }}</text>
            </view>
            <text class="step-description">{{ step.description }}</text>
            <text class="step-taken">执行人: {{ step.takenBy }}</text>
          </view>
        </view>
      </view>
      
      <view class="empty-steps" v-else>
        <text class="empty-icon">📋</text>
        <text class="empty-text">暂无处理记录</text>
      </view>
    </view>

    <!-- 解决方案 -->
    <view class="resolution-section" v-if="conflict && conflict.status === 'resolved'">
      <view class="section-title">解决方案</view>
      <view class="resolution-content">
        <text>{{ conflict.resolution || '已和平解决' }}</text>
      </view>
    </view>

    <!-- 添加步骤弹窗 -->
    <view class="dialog-overlay" v-if="showDialog" @click="closeDialog">
      <view class="dialog" @click.stop>
        <view class="dialog-header">
          <text class="dialog-title">添加处理步骤</text>
          <text class="dialog-close" @click="closeDialog">×</text>
        </view>
        <view class="dialog-body">
          <view class="form-item">
            <text class="form-label">处理方式</text>
            <view class="action-picker">
              <view 
                class="action-option" 
                :class="{ selected: stepForm.action === 'discuss' }"
                @click="stepForm.action = 'discuss'"
              >
                💬 讨论
              </view>
              <view 
                class="action-option" 
                :class="{ selected: stepForm.action === 'mediate' }"
                @click="stepForm.action = 'mediate'"
              >
                🤝 调解
              </view>
              <view 
                class="action-option" 
                :class="{ selected: stepForm.action === 'compromise' }"
                @click="stepForm.action = 'compromise'"
              >
                ⚖️ 妥协
              </view>
              <view 
                class="action-option" 
                :class="{ selected: stepForm.action === 'resolve' }"
                @click="stepForm.action = 'resolve'"
              >
                ✅ 解决
              </view>
            </view>
          </view>
          
          <view class="form-item">
            <text class="form-label">描述</text>
            <textarea 
              class="form-textarea" 
              v-model="stepForm.description" 
              placeholder="描述处理过程..."
            />
          </view>
        </view>
        <view class="dialog-footer">
          <button class="btn btn-cancel" @click="closeDialog">取消</button>
          <button class="btn btn-primary" @click="addStep">添加</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useFamilyCharterStore } from '@/stores/familyCharterStore.js'
import { CONFLICT_STATUS } from '@/services/familyCharterService.js'

const familyCharterStore = useFamilyCharterStore()

// 冲突ID
const conflictId = ref('')

// 弹窗状态
const showDialog = ref(false)

// 步骤表单
const stepForm = ref({
  action: 'discuss',
  description: ''
})

// 冲突信息
const conflict = computed(() => {
  return familyCharterStore.conflicts.find(c => c.id === conflictId.value)
})

// 获取状态标签
const getStatusLabel = (status) => {
  switch (status) {
    case CONFLICT_STATUS.OPEN:
      return '待处理'
    case CONFLICT_STATUS.IN_PROGRESS:
      return '处理中'
    case CONFLICT_STATUS.RESOLVED:
      return '已解决'
    default:
      return status
  }
}

// 获取处理方式标签
const getActionLabel = (action) => {
  switch (action) {
    case 'created':
      return '创建'
    case 'discuss':
      return '讨论'
    case 'mediate':
      return '调解'
    case 'compromise':
      return '妥协'
    case 'resolve':
      return '解决'
    default:
      return action
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

// 格式化时间
const formatTime = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const hour = date.getHours()
  const minute = date.getMinutes().toString().padStart(2, '0')
  return `${hour}:${minute}`
}

// 页面加载
onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  if (currentPage.options) {
    conflictId.value = currentPage.options.conflictId || ''
  }
  familyCharterStore.init()
  
  // 如果冲突状态是 open，改为 in_progress
  if (conflict.value && conflict.value.status === CONFLICT_STATUS.OPEN) {
    familyCharterStore.updateConflictStatus(conflictId.value, CONFLICT_STATUS.IN_PROGRESS)
  }
})

// 返回
const goBack = () => {
  uni.navigateBack()
}

// 显示添加步骤弹窗
const showAddStepDialog = () => {
  stepForm.value = {
    action: 'discuss',
    description: ''
  }
  showDialog.value = true
}

// 关闭弹窗
const closeDialog = () => {
  showDialog.value = false
}

// 添加步骤
const addStep = () => {
  if (!stepForm.value.description.trim()) {
    uni.showToast({ title: '请输入处理描述', icon: 'none' })
    return
  }
  
  const currentUserId = 'user_' + Date.now()
  
  familyCharterStore.addConflictResolutionStep(
    conflictId.value,
    stepForm.value.action,
    stepForm.value.description.trim(),
    currentUserId
  )
  
  // 如果选择解决，则完成冲突
  if (stepForm.value.action === 'resolve') {
    familyCharterStore.resolveConflict(conflictId.value, stepForm.value.description.trim())
  }
  
  closeDialog()
  uni.showToast({ title: '步骤已添加', icon: 'success' })
}
</script>

<style scoped>
.conflict-detail-container {
  min-height: 100vh;
  background: #f5f5f5;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 44px 16px 12px;
  background: linear-gradient(135deg, #52c41a 0%, #1890ff 100%);
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

.conflict-info {
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

.status-badge.open {
  background: #fa8c16;
}

.status-badge.in_progress {
  background: #1890ff;
}

.status-badge.resolved {
  background: #52c41a;
}

.conflict-date {
  font-size: 13px;
  color: #999;
}

.conflict-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 8px;
}

.conflict-description {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  display: block;
  margin-bottom: 12px;
}

.conflict-parties {
  display: flex;
  align-items: center;
  gap: 8px;
}

.parties-label {
  font-size: 12px;
  color: #999;
}

.party-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.party-tag {
  font-size: 12px;
  padding: 2px 8px;
  background: #f5f5f5;
  border-radius: 8px;
  color: #666;
}

.steps-section {
  margin: 0 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

.timeline {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
}

.timeline-item {
  display: flex;
  gap: 12px;
}

.timeline-marker {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.marker-dot {
  width: 12px;
  height: 12px;
  background: linear-gradient(135deg, #52c41a 0%, #1890ff 100%);
  border-radius: 50%;
  flex-shrink: 0;
}

.marker-line {
  width: 2px;
  flex: 1;
  background: #e5e5e5;
  margin-top: 4px;
  margin-bottom: 4px;
}

.timeline-content {
  flex: 1;
  padding-bottom: 20px;
}

.timeline-item.last .timeline-content {
  padding-bottom: 0;
}

.step-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.step-action {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.step-time {
  font-size: 12px;
  color: #999;
}

.step-description {
  font-size: 13px;
  color: #666;
  line-height: 1.5;
  display: block;
  margin-bottom: 4px;
}

.step-taken {
  font-size: 12px;
  color: #999;
}

.empty-steps {
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
  color: #666;
}

.resolution-section {
  margin: 20px 16px;
}

.resolution-content {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  font-size: 14px;
  color: #333;
  line-height: 1.6;
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
  margin-bottom: 20px;
}

.form-label {
  font-size: 14px;
  color: #333;
  display: block;
  margin-bottom: 8px;
}

.action-picker {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.action-option {
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  background: #f5f5f5;
  color: #666;
  text-align: center;
}

.action-option.selected {
  background: linear-gradient(135deg, #52c41a 0%, #1890ff 100%);
  color: #fff;
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
  background: linear-gradient(135deg, #52c41a 0%, #1890ff 100%);
  color: #fff;
}
</style>
