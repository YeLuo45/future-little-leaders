<template>
  <view class="conflicts-page-container">
    <!-- 顶部导航 -->
    <view class="header">
      <view class="header-left" @click="goBack">
        <text class="icon">←</text>
      </view>
      <view class="header-title">
        <text>冲突解决</text>
      </view>
      <view class="header-right" @click="showCreateDialog">
        <text class="icon">+</text>
      </view>
    </view>

    <!-- Tab 切换 -->
    <view class="tabs">
      <view 
        class="tab" 
        :class="{ active: activeTab === 'active' }"
        @click="activeTab = 'active'"
      >
        进行中 ({{ activeConflicts.length }})
      </view>
      <view 
        class="tab" 
        :class="{ active: activeTab === 'resolved' }"
        @click="activeTab = 'resolved'"
      >
        已解决 ({{ resolvedConflicts.length }})
      </view>
    </view>

    <!-- 冲突列表 -->
    <view class="conflicts-list">
      <view 
        class="conflict-card" 
        v-for="conflict in filteredConflicts" 
        :key="conflict.id"
        @click="viewConflict(conflict)"
      >
        <view class="conflict-header">
          <view class="conflict-status" :class="conflict.status">
            {{ getStatusLabel(conflict.status) }}
          </view>
          <text class="conflict-date">{{ formatDate(conflict.createdAt) }}</text>
        </view>
        
        <view class="conflict-title">{{ conflict.title }}</view>
        
        <view class="conflict-parties">
          <text class="parties-label">相关方:</text>
          <view class="party-tags">
            <text class="party-tag" v-for="party in conflict.parties" :key="party">{{ party }}</text>
          </view>
        </view>
        
        <view class="conflict-progress" v-if="conflict.steps && conflict.steps.length > 0">
          <text class="progress-text">已处理 {{ conflict.steps.length }} 步</text>
        </view>
        
        <view class="conflict-actions" v-if="conflict.status !== 'resolved'">
          <button class="action-btn" @click.stop="resolveConflict(conflict)">解决</button>
        </view>
      </view>

      <!-- 空状态 -->
      <view class="empty-state" v-if="filteredConflicts.length === 0">
        <text class="empty-icon">🤝</text>
        <text class="empty-text">暂无冲突记录</text>
        <text class="empty-hint">点击右上角 + 记录新的冲突</text>
      </view>
    </view>

    <!-- 创建冲突弹窗 -->
    <view class="dialog-overlay" v-if="showDialog" @click="closeDialog">
      <view class="dialog" @click.stop>
        <view class="dialog-header">
          <text class="dialog-title">记录冲突</text>
          <text class="dialog-close" @click="closeDialog">×</text>
        </view>
        <view class="dialog-body">
          <view class="form-item">
            <text class="form-label">冲突标题</text>
            <input 
              class="form-input" 
              v-model="formData.title" 
              placeholder="简要描述冲突"
            />
          </view>
          
          <view class="form-item">
            <text class="form-label">冲突描述</text>
            <textarea 
              class="form-textarea" 
              v-model="formData.description" 
              placeholder="详细说明冲突情况..."
            />
          </view>
          
          <view class="form-item">
            <text class="form-label">相关方</text>
            <view class="parties-list">
              <view 
                class="party-item"
                v-for="child in familyChildren" 
                :key="child.id"
                :class="{ selected: formData.parties.includes(child.name) }"
                @click="toggleParty(child.name)"
              >
                <text class="party-avatar">{{ child.avatar || '👶' }}</text>
                <text class="party-name">{{ child.name }}</text>
                <text class="check-icon" v-if="formData.parties.includes(child.name)">✓</text>
              </view>
            </view>
          </view>
        </view>
        <view class="dialog-footer">
          <button class="btn btn-cancel" @click="closeDialog">取消</button>
          <button class="btn btn-primary" @click="createConflict">记录</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useFamilyCharterStore } from '@/stores/familyCharterStore.js'
import { useBabyStore } from '@/stores/babyStore.js'
import { CONFLICT_STATUS } from '@/services/familyCharterService.js'

const familyCharterStore = useFamilyCharterStore()
const babyStore = useBabyStore()

// Tab 状态
const activeTab = ref('active')

// 弹窗状态
const showDialog = ref(false)

// 表单数据
const formData = ref({
  title: '',
  description: '',
  parties: []
})

// 家庭成员
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

// 活跃冲突
const activeConflicts = computed(() => familyCharterStore.activeConflicts)

// 已解决冲突
const resolvedConflicts = computed(() => {
  return familyCharterStore.conflicts.filter(c => c.status === CONFLICT_STATUS.RESOLVED)
})

// 过滤后的冲突
const filteredConflicts = computed(() => {
  return activeTab.value === 'active' 
    ? activeConflicts.value 
    : resolvedConflicts.value
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

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${month}月${day}日`
}

// 查看冲突详情
const viewConflict = (conflict) => {
  familyCharterStore.selectConflict(conflict)
  uni.navigateTo({
    url: '/pages/family-charter/conflict-detail?conflictId=' + conflict.id
  })
}

// 显示创建弹窗
const showCreateDialog = () => {
  formData.value = {
    title: '',
    description: '',
    parties: []
  }
  showDialog.value = true
}

// 关闭弹窗
const closeDialog = () => {
  showDialog.value = false
}

// 切换相关方
const toggleParty = (party) => {
  const index = formData.value.parties.indexOf(party)
  if (index > -1) {
    formData.value.parties.splice(index, 1)
  } else {
    formData.value.parties.push(party)
  }
}

// 创建冲突
const createConflict = () => {
  if (!formData.value.title.trim()) {
    uni.showToast({ title: '请输入冲突标题', icon: 'none' })
    return
  }
  if (formData.value.parties.length < 2) {
    uni.showToast({ title: '请至少选择两个相关方', icon: 'none' })
    return
  }
  
  const currentUserId = 'user_' + Date.now()
  
  familyCharterStore.createConflict(
    formData.value.title.trim(),
    formData.value.description.trim(),
    formData.value.parties,
    currentUserId
  )
  
  closeDialog()
  uni.showToast({ title: '冲突已记录', icon: 'success' })
}

// 解决冲突
const resolveConflict = (conflict) => {
  uni.showModal({
    title: '确认解决',
    content: '确定要解决这个冲突吗？',
    success: (res) => {
      if (res.confirm) {
        familyCharterStore.resolveConflict(conflict.id, '冲突已和平解决')
        uni.showToast({ title: '冲突已解决', icon: 'success' })
      }
    }
  })
}
</script>

<style scoped>
.conflicts-page-container {
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

.tabs {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  background: #fff;
}

.tab {
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 13px;
  color: #666;
  background: #f5f5f5;
}

.tab.active {
  background: linear-gradient(135deg, #52c41a 0%, #1890ff 100%);
  color: #fff;
}

.conflicts-list {
  padding: 16px;
}

.conflict-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.conflict-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.conflict-status {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 8px;
  color: #fff;
}

.conflict-status.open {
  background: #fa8c16;
}

.conflict-status.in_progress {
  background: #1890ff;
}

.conflict-status.resolved {
  background: #52c41a;
}

.conflict-date {
  font-size: 12px;
  color: #999;
}

.conflict-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
}

.conflict-parties {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
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

.conflict-progress {
  font-size: 12px;
  color: #1890ff;
  margin-bottom: 10px;
}

.conflict-actions {
  padding-top: 10px;
  border-top: 1px solid #f0f0f0;
}

.action-btn {
  padding: 6px 16px;
  border-radius: 14px;
  font-size: 13px;
  background: linear-gradient(135deg, #52c41a 0%, #1890ff 100%);
  color: #fff;
  border: none;
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
  max-height: 80vh;
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

.form-textarea {
  width: 100%;
  height: 100px;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  padding: 12px;
  font-size: 14px;
}

.parties-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.party-item {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border-radius: 8px;
  background: #f5f5f5;
}

.party-item.selected {
  background: rgba(82, 196, 26, 0.1);
  border: 1px solid #52c41a;
}

.party-avatar {
  font-size: 20px;
  margin-right: 10px;
}

.party-name {
  flex: 1;
  font-size: 14px;
  color: #333;
}

.check-icon {
  color: #52c41a;
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
  background: linear-gradient(135deg, #52c41a 0%, #1890ff 100%);
  color: #fff;
}
</style>
