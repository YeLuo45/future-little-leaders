<template>
  <view class="values-page-container">
    <!-- 顶部导航 -->
    <view class="header">
      <view class="header-left" @click="goBack">
        <text class="icon">←</text>
      </view>
      <view class="header-title">
        <text>家庭价值观</text>
      </view>
      <view class="header-right" @click="showAddDialog">
        <text class="icon">+</text>
      </view>
    </view>

    <!-- Tab 切换 -->
    <view class="tabs">
      <view 
        class="tab" 
        :class="{ active: activeTab === 'all' }"
        @click="activeTab = 'all'"
      >
        全部
      </view>
      <view 
        class="tab" 
        v-for="(info, key) in VALUE_CATEGORY_INFO" 
        :key="key"
        :class="{ active: activeTab === key }"
        @click="activeTab = key"
      >
        {{ info.icon }} {{ info.label }}
      </view>
    </view>

    <!-- 价值观列表 -->
    <view class="values-list">
      <view 
        class="value-card" 
        v-for="value in filteredValues" 
        :key="value.id"
      >
        <view class="value-header">
          <view class="value-category" :style="{ background: getCategoryColor(value.category) }">
            {{ getCategoryLabel(value.category) }}
          </view>
          <view class="value-actions">
            <text class="action-icon" @click="voteValue(value)">♥</text>
            <text class="action-icon delete" @click="confirmDelete(value)">×</text>
          </view>
        </view>
        <view class="value-text">{{ value.text }}</view>
        <view class="value-footer">
          <view class="vote-info">
            <text class="vote-count">♥ {{ value.votes }}</text>
            <text class="vote-label">票</text>
          </view>
          <view class="voters" v-if="value.votedBy && value.votedBy.length > 0">
            <text class="voter-names">{{ formatVoters(value.votedBy) }}</text>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view class="empty-state" v-if="filteredValues.length === 0">
        <text class="empty-icon">💎</text>
        <text class="empty-text">暂无价值观</text>
        <text class="empty-hint">点击右上角 + 添加第一个价值观</text>
      </view>
    </view>

    <!-- 添加价值观弹窗 -->
    <view class="dialog-overlay" v-if="showDialog" @click="closeDialog">
      <view class="dialog" @click.stop>
        <view class="dialog-header">
          <text class="dialog-title">添加价值观</text>
          <text class="dialog-close" @click="closeDialog">×</text>
        </view>
        <view class="dialog-body">
          <view class="form-item">
            <text class="form-label">价值观内容</text>
            <input 
              class="form-input" 
              v-model="newValue.text" 
              placeholder="例如：诚实守信、尊老爱幼"
            />
          </view>
          <view class="form-item">
            <text class="form-label">选择类别</text>
            <view class="category-picker">
              <view 
                class="category-option" 
                v-for="(info, key) in VALUE_CATEGORY_INFO" 
                :key="key"
                :class="{ selected: newValue.category === key }"
                @click="newValue.category = key"
              >
                {{ info.icon }} {{ info.label }}
              </view>
            </view>
          </view>
        </view>
        <view class="dialog-footer">
          <button class="btn btn-cancel" @click="closeDialog">取消</button>
          <button class="btn btn-primary" @click="addValue">确定</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useFamilyCharterStore } from '@/stores/familyCharterStore.js'
import { VALUE_CATEGORY_INFO } from '@/services/familyCharterService.js'

const familyCharterStore = useFamilyCharterStore()

// Tab 状态
const activeTab = ref('all')

// 弹窗状态
const showDialog = ref(false)
const newValue = ref({
  text: '',
  category: 'respect'
})

// 所有价值观
const allValues = computed(() => familyCharterStore.activeValues)

// 过滤后的价值观
const filteredValues = computed(() => {
  if (activeTab.value === 'all') {
    return [...allValues.value].sort((a, b) => b.votes - a.votes)
  }
  return allValues.value.filter(v => v.category === activeTab.value)
})

// 页面加载
onMounted(() => {
  familyCharterStore.init()
})

// 返回
const goBack = () => {
  uni.navigateBack()
}

// 获取类别标签
const getCategoryLabel = (category) => {
  return VALUE_CATEGORY_INFO[category]?.label || '其他'
}

// 获取类别颜色
const getCategoryColor = (category) => {
  return VALUE_CATEGORY_INFO[category]?.color || '#999'
}

// 格式化投票者
const formatVoters = (votedBy) => {
  if (!votedBy || votedBy.length === 0) return ''
  return votedBy.slice(0, 3).join('、') + (votedBy.length > 3 ? '...' : '')
}

// 投票
const voteValue = (value) => {
  // 模拟当前用户ID
  const currentUserId = 'user_' + Date.now()
  familyCharterStore.voteValue(value.id, currentUserId)
}

// 显示添加弹窗
const showAddDialog = () => {
  newValue.value = {
    text: '',
    category: 'respect'
  }
  showDialog.value = true
}

// 关闭弹窗
const closeDialog = () => {
  showDialog.value = false
}

// 添加价值观
const addValue = () => {
  if (!newValue.value.text.trim()) {
    uni.showToast({ title: '请输入价值观内容', icon: 'none' })
    return
  }
  
  const currentUserId = 'user_' + Date.now()
  familyCharterStore.addValue(newValue.value.text.trim(), newValue.value.category, currentUserId)
  closeDialog()
  uni.showToast({ title: '添加成功', icon: 'success' })
}

// 确认删除
const confirmDelete = (value) => {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这个价值观吗？',
    success: (res) => {
      if (res.confirm) {
        familyCharterStore.deleteValue(value.id)
        uni.showToast({ title: '已删除', icon: 'success' })
      }
    }
  })
}
</script>

<style scoped>
.values-page-container {
  min-height: 100vh;
  background: #f5f5f5;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 44px 16px 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px 16px;
  background: #fff;
}

.tab {
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 13px;
  color: #666;
  background: #f5f5f5;
}

.tab.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.values-list {
  padding: 16px;
}

.value-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.value-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.value-category {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 8px;
  color: #fff;
}

.value-actions {
  display: flex;
  gap: 12px;
}

.action-icon {
  font-size: 18px;
  color: #eb2f96;
}

.action-icon.delete {
  color: #999;
  font-size: 20px;
}

.value-text {
  font-size: 16px;
  color: #333;
  line-height: 1.5;
  margin-bottom: 12px;
}

.value-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.vote-info {
  display: flex;
  align-items: center;
  gap: 4px;
}

.vote-count {
  font-size: 14px;
  color: #eb2f96;
  font-weight: 600;
}

.vote-label {
  font-size: 12px;
  color: #999;
}

.voters {
  font-size: 12px;
  color: #999;
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
  max-height: 50vh;
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

.category-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.category-option {
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 13px;
  background: #f5f5f5;
  color: #666;
}

.category-option.selected {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}
</style>
