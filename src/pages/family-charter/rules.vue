<template>
  <view class="rules-page-container">
    <!-- 顶部导航 -->
    <view class="header">
      <view class="header-left" @click="goBack">
        <text class="icon">←</text>
      </view>
      <view class="header-title">
        <text>家规</text>
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
        v-for="(info, key) in RULE_CATEGORY_INFO" 
        :key="key"
        :class="{ active: activeTab === key }"
        @click="activeTab = key"
      >
        {{ info.icon }} {{ info.label }}
      </view>
    </view>

    <!-- 奖惩说明 -->
    <view class="reward-punishment-bar">
      <view class="reward-info">
        <text class="icon">⭐</text>
        <text>遵守奖励</text>
      </view>
      <view class="punishment-info">
        <text class="icon">⚠️</text>
        <text>违反扣分</text>
      </view>
    </view>

    <!-- 规则列表 -->
    <view class="rules-list">
      <view 
        class="rule-card" 
        v-for="rule in filteredRules" 
        :key="rule.id"
      >
        <view class="rule-header">
          <view class="rule-category" :style="{ background: getCategoryColor(rule.category) }">
            {{ getCategoryIcon(rule.category) }} {{ getCategoryLabel(rule.category) }}
          </view>
          <view class="rule-actions">
            <text class="action-icon" @click="editRule(rule)">✏️</text>
            <text class="action-icon delete" @click="confirmDelete(rule)">×</text>
          </view>
        </view>
        
        <view class="rule-text">{{ rule.text }}</view>
        
        <view class="rule-footer">
          <view class="rule-rewards">
            <view class="reward-badge">
              <text class="reward-icon">+</text>
              <text>{{ rule.rewardPoints || 0 }}</text>
            </view>
            <view class="punishment-badge">
              <text class="punishment-icon">-</text>
              <text>{{ rule.punishmentPoints || 0 }}</text>
            </view>
          </view>
          <view class="violation-count" v-if="rule.violationCount > 0">
            违规 {{ rule.violationCount }} 次
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view class="empty-state" v-if="filteredRules.length === 0">
        <text class="empty-icon">📜</text>
        <text class="empty-text">暂无家规</text>
        <text class="empty-hint">点击右上角 + 添加第一条家规</text>
      </view>
    </view>

    <!-- 添加/编辑规则弹窗 -->
    <view class="dialog-overlay" v-if="showDialog" @click="closeDialog">
      <view class="dialog" @click.stop>
        <view class="dialog-header">
          <text class="dialog-title">{{ isEditing ? '编辑家规' : '添加家规' }}</text>
          <text class="dialog-close" @click="closeDialog">×</text>
        </view>
        <view class="dialog-body">
          <view class="form-item">
            <text class="form-label">规则内容</text>
            <input 
              class="form-input" 
              v-model="formData.text" 
              placeholder="例如：每天按时完成作业"
            />
          </view>
          
          <view class="form-item">
            <text class="form-label">规则类别</text>
            <view class="category-picker">
              <view 
                class="category-option" 
                v-for="(info, key) in RULE_CATEGORY_INFO" 
                :key="key"
                :class="{ selected: formData.category === key }"
                @click="formData.category = key"
              >
                {{ info.icon }} {{ info.label }}
              </view>
            </view>
          </view>
          
          <view class="form-item">
            <text class="form-label">奖惩设置</text>
            <view class="points-input">
              <view class="points-row">
                <text class="points-label">🏠 遵守奖励积分</text>
                <input 
                  type="number" 
                  class="points-input-field" 
                  v-model.number="formData.rewardPoints" 
                  placeholder="0"
                />
              </view>
              <view class="points-row">
                <text class="points-label">⚠️ 违反扣减积分</text>
                <input 
                  type="number" 
                  class="points-input-field" 
                  v-model.number="formData.punishmentPoints" 
                  placeholder="0"
                />
              </view>
            </view>
          </view>
        </view>
        <view class="dialog-footer">
          <button class="btn btn-cancel" @click="closeDialog">取消</button>
          <button class="btn btn-primary" @click="saveRule">{{ isEditing ? '保存' : '添加' }}</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useFamilyCharterStore } from '@/stores/familyCharterStore.js'
import { RULE_CATEGORY_INFO } from '@/services/familyCharterService.js'

const familyCharterStore = useFamilyCharterStore()

// Tab 状态
const activeTab = ref('all')

// 弹窗状态
const showDialog = ref(false)
const isEditing = ref(false)
const editingRuleId = ref(null)

// 表单数据
const formData = ref({
  text: '',
  category: 'daily_life',
  rewardPoints: 5,
  punishmentPoints: 3
})

// 所有规则
const allRules = computed(() => familyCharterStore.activeRules)

// 过滤后的规则
const filteredRules = computed(() => {
  if (activeTab.value === 'all') {
    return [...allRules.value].sort((a, b) => b.violationCount - a.violationCount)
  }
  return allRules.value.filter(r => r.category === activeTab.value)
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
  return RULE_CATEGORY_INFO[category]?.label || '其他'
}

// 获取类别图标
const getCategoryIcon = (category) => {
  return RULE_CATEGORY_INFO[category]?.icon || '📜'
}

// 获取类别颜色
const getCategoryColor = (category) => {
  return RULE_CATEGORY_INFO[category]?.color || '#999'
}

// 显示添加弹窗
const showAddDialog = () => {
  isEditing.value = false
  editingRuleId.value = null
  formData.value = {
    text: '',
    category: 'daily_life',
    rewardPoints: 5,
    punishmentPoints: 3
  }
  showDialog.value = true
}

// 编辑规则
const editRule = (rule) => {
  isEditing.value = true
  editingRuleId.value = rule.id
  formData.value = {
    text: rule.text,
    category: rule.category,
    rewardPoints: rule.rewardPoints || 0,
    punishmentPoints: rule.punishmentPoints || 0
  }
  showDialog.value = true
}

// 关闭弹窗
const closeDialog = () => {
  showDialog.value = false
}

// 保存规则
const saveRule = () => {
  if (!formData.value.text.trim()) {
    uni.showToast({ title: '请输入规则内容', icon: 'none' })
    return
  }
  
  const currentUserId = 'user_' + Date.now()
  
  if (isEditing.value && editingRuleId.value) {
    // 更新规则
    familyCharterStore.updateRule(editingRuleId.value, {
      text: formData.value.text.trim(),
      category: formData.value.category,
      rewardPoints: formData.value.rewardPoints || 0,
      punishmentPoints: formData.value.punishmentPoints || 0
    })
    uni.showToast({ title: '保存成功', icon: 'success' })
  } else {
    // 添加规则
    familyCharterStore.addRule(
      formData.value.text.trim(),
      formData.value.category,
      formData.value.rewardPoints || 0,
      formData.value.punishmentPoints || 0,
      currentUserId
    )
    uni.showToast({ title: '添加成功', icon: 'success' })
  }
  closeDialog()
}

// 确认删除
const confirmDelete = (rule) => {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这条家规吗？',
    success: (res) => {
      if (res.confirm) {
        familyCharterStore.deleteRule(rule.id)
        uni.showToast({ title: '已删除', icon: 'success' })
      }
    }
  })
}
</script>

<style scoped>
.rules-page-container {
  min-height: 100vh;
  background: #f5f5f5;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 44px 16px 12px;
  background: linear-gradient(135deg, #fa8c16 0%, #f5222d 100%);
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
  background: linear-gradient(135deg, #fa8c16 0%, #f5222d 100%);
  color: #fff;
}

.reward-punishment-bar {
  display: flex;
  justify-content: center;
  gap: 40px;
  padding: 12px 16px;
  background: #fff8f0;
  border-bottom: 1px solid #f0f0f0;
}

.reward-info, .punishment-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #666;
}

.reward-info .icon {
  color: #fa8c16;
}

.punishment-info .icon {
  color: #f5222d;
}

.rules-list {
  padding: 16px;
}

.rule-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.rule-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.rule-category {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 8px;
  color: #fff;
}

.rule-actions {
  display: flex;
  gap: 12px;
}

.action-icon {
  font-size: 16px;
}

.action-icon.delete {
  color: #999;
  font-size: 20px;
}

.rule-text {
  font-size: 16px;
  color: #333;
  line-height: 1.5;
  margin-bottom: 12px;
}

.rule-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.rule-rewards {
  display: flex;
  gap: 12px;
}

.reward-badge, .punishment-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
}

.reward-badge {
  background: #fff7e6;
  color: #fa8c16;
}

.punishment-badge {
  background: #fff1f0;
  color: #f5222d;
}

.reward-icon, .punishment-icon {
  font-size: 12px;
}

.violation-count {
  font-size: 12px;
  color: #f5222d;
  background: #fff1f0;
  padding: 4px 8px;
  border-radius: 8px;
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
  background: linear-gradient(135deg, #fa8c16 0%, #f5222d 100%);
  color: #fff;
}

.points-input {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.points-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.points-label {
  font-size: 14px;
  color: #666;
  min-width: 120px;
}

.points-input-field {
  flex: 1;
  height: 40px;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  padding: 0 12px;
  font-size: 14px;
  text-align: right;
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
  background: linear-gradient(135deg, #fa8c16 0%, #f5222d 100%);
  color: #fff;
}
</style>
