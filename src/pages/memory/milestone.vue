<template>
  <view class="milestone-page">
    <!-- 顶部标题 -->
    <view class="header">
      <text class="title">🌟 成长里程碑</text>
      <text class="subtitle">记录宝宝的每一个重要时刻</text>
    </view>

    <!-- Tab 切换 -->
    <view class="tab-bar">
      <view
        class="tab-item"
        :class="{ active: currentTab === 'timeline' }"
        @click="currentTab = 'timeline'"
      >
        <text class="tab-icon">📅</text>
        <text class="tab-text">时间线</text>
      </view>
      <view
        class="tab-item"
        :class="{ active: currentTab === 'upcoming' }"
        @click="currentTab = 'upcoming'"
      >
        <text class="tab-icon">🔔</text>
        <text class="tab-text">待达成</text>
      </view>
      <view
        class="tab-item"
        :class="{ active: currentTab === 'add' }"
        @click="openAddModal"
      >
        <text class="tab-icon">➕</text>
        <text class="tab-text">记录</text>
      </view>
    </view>

    <!-- 宝宝选择器 -->
    <view class="child-selector" v-if="babyStore.babies.length > 1">
      <scroll-view scroll-x class="child-scroll">
        <view
          v-for="baby in babyStore.babies"
          :key="baby.id"
          class="child-chip"
          :class="{ active: selectedChildId === baby.id }"
          @click="selectedChildId = baby.id"
        >
          <text class="child-avatar">{{ baby.avatar || '👶' }}</text>
          <text class="child-name">{{ baby.name }}</text>
        </view>
      </scroll-view>
    </view>

    <!-- 时间线视图 -->
    <view class="timeline-section" v-if="currentTab === 'timeline'">
      <view
        v-for="milestone in filteredMilestones"
        :key="milestone.id"
        class="milestone-item"
        @click="viewMilestone(milestone)"
      >
        <view class="milestone-icon-wrap">
          <text class="milestone-icon">{{ milestone.icon || '🌟' }}</text>
        </view>

        <view class="milestone-content">
          <view class="milestone-header">
            <text class="milestone-title">{{ milestone.title }}</text>
            <text class="milestone-date">{{ formatDate(milestone.achievedAt) }}</text>
          </view>
          <text class="milestone-desc" v-if="milestone.description">
            {{ milestone.description }}
          </text>
          <view class="milestone-tags" v-if="milestone.photos?.length">
            <text class="tag">📷 {{ milestone.photos.length }}张照片</text>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view class="empty-state" v-if="filteredMilestones.length === 0">
        <text class="empty-icon">🌟</text>
        <text class="empty-text">还没有里程碑</text>
        <text class="empty-hint">记录宝宝的第一个重要时刻吧</text>
      </view>
    </view>

    <!-- 待达成视图 -->
    <view class="upcoming-section" v-if="currentTab === 'upcoming'">
      <view class="upcoming-list">
        <view
          v-for="milestone in upcomingMilestones"
          :key="milestone.id"
          class="upcoming-item"
        >
          <view class="upcoming-icon-wrap">
            <text class="upcoming-icon">{{ milestone.icon || '🔔' }}</text>
          </view>
          <view class="upcoming-content">
            <text class="upcoming-title">{{ milestone.title }}</text>
            <text class="upcoming-date">
              计划日期: {{ formatDate(milestone.plannedDate) }}
            </text>
          </view>
          <view class="upcoming-actions">
            <view class="achieve-btn" @click="markAchieved(milestone)">
              <text>达成</text>
            </view>
          </view>
        </view>

        <!-- 预设模板 -->
        <view class="template-section">
          <text class="section-title">快速添加里程碑</text>
          <view class="template-grid">
            <view
              v-for="tmpl in MILESTONE_TEMPLATES"
              :key="tmpl.key"
              class="template-item"
              @click="quickAddMilestone(tmpl)"
            >
              <text class="template-icon">{{ tmpl.icon }}</text>
              <text class="template-name">{{ tmpl.name }}</text>
            </view>
          </view>
        </view>
      </view>

      <view class="empty-state" v-if="upcomingMilestones.length === 0 && filteredMilestones.length === 0">
        <text class="empty-icon">🔔</text>
        <text class="empty-text">还没有待达成</text>
        <text class="empty-hint">使用上方模板快速添加里程碑</text>
      </view>
    </view>

    <!-- 添加里程碑弹窗 -->
    <view class="add-modal" v-if="showAddModal" @click="closeAddModal">
      <view class="add-content" @click.stop>
        <text class="modal-title">记录里程碑</text>

        <!-- 宝宝选择 -->
        <view class="form-item">
          <text class="form-label">宝宝</text>
          <picker
            :value="babyIdx"
            :range="babyOptions"
            range-key="name"
            @change="onBabyChange"
          >
            <view class="picker-value">
              {{ babyOptions[babyIdx]?.name || '选择宝宝' }}
            </view>
          </picker>
        </view>

        <view class="form-item">
          <text class="form-label">标题</text>
          <input
            class="form-input"
            v-model="form.title"
            placeholder="输入里程碑标题"
          />
        </view>

        <view class="form-item">
          <text class="form-label">描述</text>
          <textarea
            class="form-textarea"
            v-model="form.description"
            placeholder="描述这个重要时刻"
          />
        </view>

        <view class="form-item">
          <text class="form-label">日期</text>
          <picker
            mode="date"
            :value="formDate"
            @change="onDateChange"
          >
            <view class="picker-value">
              {{ formDate || '选择日期' }}
            </view>
          </picker>
        </view>

        <view class="form-item">
          <text class="form-label">图标</text>
          <view class="icon-grid">
            <view
              v-for="iconOpt in ICON_OPTIONS"
              :key="iconOpt"
              class="icon-item"
              :class="{ active: form.icon === iconOpt }"
              @click="form.icon = iconOpt"
            >
              <text class="icon-display">{{ iconOpt }}</text>
            </view>
          </view>
        </view>

        <view class="form-actions">
          <view class="cancel-btn" @click="closeAddModal">取消</view>
          <view class="submit-btn" @click="submitMilestone">保存</view>
        </view>
      </view>
    </view>

    <!-- 详情弹窗 -->
    <view class="detail-modal" v-if="selectedMilestone" @click="closeDetail">
      <view class="detail-content" @click.stop>
        <view class="detail-header">
          <text class="detail-icon">{{ selectedMilestone.icon || '🌟' }}</text>
          <text class="detail-title">{{ selectedMilestone.title }}</text>
          <text class="detail-date">{{ formatDate(selectedMilestone.achievedAt) }}</text>
        </view>

        <view class="detail-body">
          <text class="detail-desc" v-if="selectedMilestone.description">
            {{ selectedMilestone.description }}
          </text>

          <view class="detail-baby" v-if="selectedMilestone.childId">
            <text class="baby-label">宝宝：</text>
            <text class="baby-name">{{ getBabyName(selectedMilestone.childId) }}</text>
          </view>
        </view>

        <view class="detail-actions">
          <view class="action-btn" @click="shareMilestone">
            <text>📤 分享</text>
          </view>
          <view class="action-btn" @click="editMilestoneDetail">
            <text>✏️ 编辑</text>
          </view>
          <view class="action-btn delete" @click="confirmDeleteMilestone">
            <text>🗑️ 删除</text>
          </view>
        </view>

        <view class="close-btn" @click="closeDetail">✕</view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useMemoryStore } from '../../stores/memoryStore.js'
import { useBabyStore } from '../../stores/babyStore.js'
import { MILESTONE_TEMPLATES, exportMilestoneAsText } from '../../services/memoryService.js'

const memoryStore = useMemoryStore()
const babyStore = useBabyStore()

// 常量
const ICON_OPTIONS = ['🌟', '👣', '💬', '🦷', '🍼', '🎂', '🏫', '🚲', '🏊', '🎨', '📚', '⭐', '✨', '💫', '🎉']

// 当前 Tab
const currentTab = ref('timeline')

// 弹窗状态
const showAddModal = ref(false)
const selectedMilestone = ref(null)

// 选中宝宝
const selectedChildId = ref(null)

// 表单
const form = ref({
  childId: null,
  title: '',
  description: '',
  icon: '🌟',
  achievedAt: new Date().toISOString(),
  plannedDate: null,
  photos: [],
  notes: ''
})

const formDate = ref('')

// Picker 选项
const babyOptions = computed(() => babyStore.babies)
const babyIdx = computed(() => {
  const idx = babyOptions.value.findIndex(b => b.id === form.value.childId)
  return idx >= 0 ? idx : 0
})

// ========== 计算属性 ==========

const filteredMilestones = computed(() => {
  const all = memoryStore.milestoneTimeline
  if (!selectedChildId.value) {
    return all
  }
  return all.filter(m => m.childId === selectedChildId.value)
})

const upcomingMilestones = computed(() => {
  const upcoming = memoryStore.getUpcomingMilestones()
  if (!selectedChildId.value) {
    return upcoming
  }
  return upcoming.filter(m => m.childId === selectedChildId.value)
})

// ========== 方法 ==========

const formatDate = (dateStr) => {
  if (!dateStr) return '未设置'
  return new Date(dateStr).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const getBabyName = (childId) => {
  const baby = babyStore.babies.find(b => b.id === childId)
  return baby?.name || '未知'
}

const onBabyChange = (e) => {
  form.value.childId = babyOptions.value[e.detail.value]?.id || null
}

const onDateChange = (e) => {
  formDate.value = e.detail.value
  form.value.achievedAt = new Date(e.detail.value).toISOString()
}

const openAddModal = () => {
  form.value = {
    childId: selectedChildId.value || babyStore.babies[0]?.id || null,
    title: '',
    description: '',
    icon: '🌟',
    achievedAt: new Date().toISOString(),
    plannedDate: null,
    photos: [],
    notes: ''
  }
  formDate.value = new Date().toISOString().split('T')[0]
  showAddModal.value = true
}

const closeAddModal = () => {
  showAddModal.value = false
}

const submitMilestone = () => {
  if (!form.value.title.trim()) {
    uni.showToast({ title: '请输入标题', icon: 'none' })
    return
  }

  if (!form.value.childId) {
    uni.showToast({ title: '请选择宝宝', icon: 'none' })
    return
  }

  memoryStore.recordMilestone({
    childId: form.value.childId,
    title: form.value.title,
    description: form.value.description,
    icon: form.value.icon,
    achievedAt: form.value.achievedAt,
    plannedDate: form.value.plannedDate,
    photos: form.value.photos,
    notes: form.value.notes
  })

  uni.showToast({ title: '保存成功', icon: 'success' })
  closeAddModal()
  currentTab.value = 'timeline'
}

const quickAddMilestone = (template) => {
  if (template.key === 'custom') {
    openAddModal()
    return
  }

  if (!selectedChildId.value && babyStore.babies.length > 0) {
    selectedChildId.value = babyStore.babies[0].id
  }

  if (!selectedChildId.value) {
    uni.showToast({ title: '请先添加宝宝', icon: 'none' })
    return
  }

  memoryStore.recordMilestone({
    childId: selectedChildId.value,
    title: template.name,
    description: template.description,
    icon: template.icon,
    category: template.key,
    achievedAt: new Date().toISOString()
  })

  uni.showToast({ title: `已添加${template.name}`, icon: 'success' })
}

const markAchieved = (milestone) => {
  memoryStore.editMilestone(milestone.id, {
    status: 'achieved',
    achievedAt: new Date().toISOString()
  })
  uni.showToast({ title: '已标记达成', icon: 'success' })
}

const viewMilestone = (milestone) => {
  selectedMilestone.value = milestone
}

const closeDetail = () => {
  selectedMilestone.value = null
}

const editMilestoneDetail = () => {
  uni.showToast({ title: '编辑功能开发中', icon: 'none' })
}

const confirmDeleteMilestone = () => {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这个里程碑吗？',
    success: (res) => {
      if (res.confirm) {
        memoryStore.removeMilestone(selectedMilestone.value.id)
        closeDetail()
        uni.showToast({ title: '已删除', icon: 'success' })
      }
    }
  })
}

const shareMilestone = () => {
  const text = exportMilestoneAsText(selectedMilestone.value)
  uni.setClipboardData({
    data: text,
    success: () => {
      uni.showToast({ title: '已复制到剪贴板', icon: 'success' })
    }
  })
}

// 初始化
memoryStore.init()

// 默认选中第一个宝宝
if (babyStore.babies.length > 0) {
  selectedChildId.value = babyStore.babies[0].id
}
</script>

<style scoped>
.milestone-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 40rpx;
}

.header {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  padding: 40rpx 30rpx;
  color: #fff;
}

.title {
  font-size: 40rpx;
  font-weight: bold;
  display: block;
}

.subtitle {
  font-size: 26rpx;
  opacity: 0.9;
  margin-top: 10rpx;
  display: block;
}

.tab-bar {
  display: flex;
  background: #fff;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #eee;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 20rpx 0;
}

.tab-icon {
  font-size: 40rpx;
  display: block;
}

.tab-text {
  font-size: 24rpx;
  color: #666;
  margin-top: 8rpx;
}

.tab-item.active .tab-text {
  color: #f5576c;
  font-weight: bold;
}

/* 宝宝选择器 */
.child-selector {
  background: #fff;
  padding: 20rpx 0;
}

.child-scroll {
  white-space: nowrap;
  padding: 0 20rpx;
}

.child-chip {
  display: inline-flex;
  align-items: center;
  padding: 12rpx 24rpx;
  margin-right: 16rpx;
  border-radius: 40rpx;
  background: #f5f5f5;
  border: 2rpx solid transparent;
}

.child-chip.active {
  border-color: #f5576c;
  background: rgba(245, 87, 108, 0.1);
}

.child-avatar {
  font-size: 32rpx;
  margin-right: 8rpx;
}

.child-name {
  font-size: 26rpx;
  color: #333;
}

.child-chip.active .child-name {
  color: #f5576c;
  font-weight: bold;
}

/* 时间线 */
.milestone-item {
  display: flex;
  background: #fff;
  margin: 20rpx;
  border-radius: 20rpx;
  padding: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.08);
}

.milestone-icon-wrap {
  width: 80rpx;
  height: 80rpx;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
}

.milestone-icon {
  font-size: 40rpx;
}

.milestone-content {
  flex: 1;
}

.milestone-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.milestone-title {
  font-size: 30rpx;
  font-weight: bold;
  flex: 1;
}

.milestone-date {
  font-size: 22rpx;
  color: #999;
  margin-left: 16rpx;
}

.milestone-desc {
  font-size: 26rpx;
  color: #666;
  margin-top: 10rpx;
  line-height: 1.5;
  display: block;
}

.milestone-tags {
  margin-top: 12rpx;
}

.tag {
  font-size: 22rpx;
  color: #f5576c;
  background: rgba(245, 87, 108, 0.1);
  padding: 6rpx 14rpx;
  border-radius: 16rpx;
}

/* 待达成 */
.upcoming-section {
  padding: 20rpx;
}

.upcoming-list {
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;
}

.upcoming-item {
  display: flex;
  align-items: center;
  padding: 24rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.upcoming-item:last-child {
  border-bottom: none;
}

.upcoming-icon-wrap {
  width: 60rpx;
  height: 60rpx;
  background: #f5f5f5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16rpx;
}

.upcoming-icon {
  font-size: 32rpx;
}

.upcoming-content {
  flex: 1;
}

.upcoming-title {
  font-size: 28rpx;
  font-weight: bold;
  display: block;
}

.upcoming-date {
  font-size: 24rpx;
  color: #999;
  margin-top: 6rpx;
  display: block;
}

.achieve-btn {
  padding: 12rpx 24rpx;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  border-radius: 24rpx;
  font-size: 24rpx;
  color: #fff;
}

.template-section {
  padding: 30rpx 24rpx;
  background: #fafafa;
  margin-top: 20rpx;
  border-radius: 20rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #666;
  display: block;
  margin-bottom: 20rpx;
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;
}

.template-item {
  text-align: center;
  padding: 20rpx 8rpx;
  background: #fff;
  border-radius: 16rpx;
  border: 1rpx solid #eee;
}

.template-icon {
  font-size: 48rpx;
  display: block;
}

.template-name {
  font-size: 24rpx;
  color: #666;
  margin-top: 8rpx;
  display: block;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 100rpx 40rpx;
}

.empty-icon {
  font-size: 120rpx;
  display: block;
  margin-bottom: 30rpx;
}

.empty-text {
  font-size: 32rpx;
  color: #333;
  font-weight: bold;
  display: block;
}

.empty-hint {
  font-size: 26rpx;
  color: #999;
  margin-top: 16rpx;
  display: block;
}

/* 添加弹窗 */
.add-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  z-index: 999;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.add-content {
  width: 100%;
  max-height: 85vh;
  background: #fff;
  border-radius: 32rpx 32rpx 0 0;
  padding: 40rpx 30rpx;
  overflow-y: auto;
}

.modal-title {
  font-size: 36rpx;
  font-weight: bold;
  text-align: center;
  display: block;
  margin-bottom: 30rpx;
}

.form-item {
  margin-bottom: 24rpx;
}

.form-label {
  font-size: 28rpx;
  color: #666;
  display: block;
  margin-bottom: 12rpx;
}

.form-input {
  width: 100%;
  height: 80rpx;
  border: 1rpx solid #ddd;
  border-radius: 12rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
}

.form-textarea {
  width: 100%;
  height: 100rpx;
  border: 1rpx solid #ddd;
  border-radius: 12rpx;
  padding: 20rpx;
  font-size: 28rpx;
}

.picker-value {
  height: 80rpx;
  border: 1rpx solid #ddd;
  border-radius: 12rpx;
  padding: 0 20rpx;
  display: flex;
  align-items: center;
  font-size: 28rpx;
  background: #fff;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12rpx;
}

.icon-item {
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1rpx solid #ddd;
  border-radius: 12rpx;
}

.icon-item.active {
  border-color: #f5576c;
  background: rgba(245, 87, 108, 0.1);
}

.icon-display {
  font-size: 40rpx;
}

.form-actions {
  display: flex;
  gap: 20rpx;
  margin-top: 30rpx;
}

.cancel-btn,
.submit-btn {
  flex: 1;
  height: 88rpx;
  line-height: 88rpx;
  text-align: center;
  border-radius: 44rpx;
  font-size: 32rpx;
}

.cancel-btn {
  background: #f5f5f5;
  color: #666;
}

.submit-btn {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: #fff;
}

/* 详情弹窗 */
.detail-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.detail-content {
  width: 90%;
  background: #fff;
  border-radius: 24rpx;
  padding: 40rpx 30rpx;
  position: relative;
}

.detail-header {
  text-align: center;
}

.detail-icon {
  font-size: 100rpx;
  display: block;
  margin-bottom: 16rpx;
}

.detail-title {
  font-size: 36rpx;
  font-weight: bold;
  display: block;
}

.detail-date {
  font-size: 28rpx;
  color: #999;
  margin-top: 10rpx;
  display: block;
}

.detail-body {
  margin-top: 30rpx;
}

.detail-desc {
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
  display: block;
}

.detail-baby {
  margin-top: 16rpx;
  font-size: 26rpx;
}

.baby-label {
  color: #999;
}

.baby-name {
  color: #333;
  font-weight: bold;
}

.detail-actions {
  display: flex;
  gap: 16rpx;
  margin-top: 30rpx;
}

.action-btn {
  flex: 1;
  text-align: center;
  padding: 20rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
  font-size: 26rpx;
}

.action-btn.delete {
  background: #ffeaea;
  color: #e54d4d;
}

.close-btn {
  position: absolute;
  top: 20rpx;
  right: 20rpx;
  width: 60rpx;
  height: 60rpx;
  background: #f5f5f5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
}
</style>
