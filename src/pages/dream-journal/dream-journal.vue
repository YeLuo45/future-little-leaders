<template>
  <view class="dream-journal-page">
    <!-- 头部 -->
    <view class="header">
      <view class="header-content">
        <text class="page-title">✨ 梦想日记</text>
        <text class="page-subtitle">记录梦想，追逐未来</text>
      </view>
      <view class="stats-badge" @tap="goToStatistics">
        <text class="stats-icon">🎯</text>
        <text class="stats-value">{{ store.statistics.completedCount }}/{{ store.statistics.totalDreams }}</text>
      </view>
    </view>

    <!-- Tab导航 -->
    <view class="tab-bar">
      <view 
        class="tab" 
        :class="{active: store.currentTab === 'dreams'}"
        @tap="switchTab('dreams')"
      >
        梦想清单
      </view>
      <view 
        class="tab" 
        :class="{active: store.currentTab === 'vision'}"
        @tap="switchTab('vision')"
      >
        愿景板
      </view>
      <view 
        class="tab" 
        :class="{active: store.currentTab === 'tracker'}"
        @tap="switchTab('tracker')"
      >
        目标追踪
      </view>
    </view>

    <!-- 梦想清单 -->
    <view class="content" v-if="store.currentTab === 'dreams'">
      <!-- 分类筛选 -->
      <view class="filter-section">
        <scroll-view class="filter-scroll" scroll-x>
          <view 
            class="filter-chip" 
            :class="{active: !store.filterCategory}"
            @tap="store.setFilterCategory('')"
          >
            全部
          </view>
          <view 
            v-for="cat in store.categoryOptions" 
            :key="cat.value"
            class="filter-chip"
            :class="{active: store.filterCategory === cat.value}"
            @tap="store.setFilterCategory(cat.value)"
          >
            {{ cat.emoji }} {{ cat.label.replace(/^[^\s]+\s/, '') }}
          </view>
        </scroll-view>
      </view>

      <!-- 梦想列表 -->
      <view class="dream-list">
        <view 
          v-for="dream in store.dreams" 
          :key="dream.id"
          class="dream-card"
          @tap="viewDream(dream)"
        >
          <view class="dream-header">
            <view class="dream-category" :style="{backgroundColor: getCategoryInfo(dream.category).color + '20'}">
              <text class="category-emoji">{{ getCategoryInfo(dream.category).emoji }}</text>
              <text class="category-label">{{ getCategoryInfo(dream.category).label }}</text>
            </view>
            <view class="dream-status" :class="dream.status">
              {{ store.getStatusName(dream.status) }}
            </view>
          </view>
          
          <text class="dream-title">{{ dream.title }}</text>
          <text class="dream-description">{{ dream.description }}</text>
          
          <!-- 进度条 -->
          <view class="progress-section">
            <view class="progress-bar">
              <view 
                class="progress-fill" 
                :style="{width: dream.progress + '%', backgroundColor: store.getProgressColor(dream.progress)}"
              ></view>
            </view>
            <text class="progress-text">{{ dream.progress }}%</text>
          </view>
          
          <!-- 目标日期 -->
          <view class="dream-footer">
            <text class="target-date">🎯 目标: {{ formatDate(dream.targetDate) }}</text>
            <view class="milestone-count">
              <text v-if="getDreamMilestoneCount(dream.id) > 0">📍 {{ getCompletedMilestoneCount(dream.id) }}/{{ getDreamMilestoneCount(dream.id) }} 里程碑</text>
            </view>
          </view>
        </view>
        
        <!-- 空状态 -->
        <view class="empty-state" v-if="store.dreams.length === 0">
          <text class="empty-icon">💭</text>
          <text class="empty-text">还没有梦想</text>
          <text class="empty-hint">点击下方按钮创建第一个梦想</text>
        </view>
      </view>

      <!-- 添加按钮 -->
      <view class="fab" @tap="addDream">
        <text class="fab-icon">+</text>
      </view>
    </view>

    <!-- 愿景板 -->
    <view class="content" v-if="store.currentTab === 'vision'">
      <view class="vision-header">
        <text class="vision-title">🌈 我的愿景板</text>
        <view class="add-image-btn" @tap="addVisionImage">
          <text>📷 添加图片</text>
        </view>
      </view>
      
      <!-- 愿景板网格 -->
      <view class="vision-grid" v-if="store.visionImages.length > 0">
        <view 
          v-for="image in store.visionImages" 
          :key="image.id"
          class="vision-item"
          @tap="previewImage(image)"
          @longpress="showImageOptions(image)"
        >
          <image 
            class="vision-image" 
            :src="image.url" 
            mode="aspectFill"
            @error="onImageError"
          ></image>
          <view class="vision-overlay" v-if="image.title">
            <text class="vision-caption">{{ image.title }}</text>
          </view>
        </view>
      </view>
      
      <!-- 空状态 -->
      <view class="empty-state" v-else>
        <text class="empty-icon">🖼️</text>
        <text class="empty-text">愿景板空空如也</text>
        <text class="empty-hint">收集让你心动的图片，打造你的愿景板</text>
      </view>
    </view>

    <!-- 目标追踪 -->
    <view class="content" v-if="store.currentTab === 'tracker'">
      <!-- 统计卡片 -->
      <view class="stats-cards">
        <view class="stat-card">
          <text class="stat-value">{{ store.statistics.activeCount }}</text>
          <text class="stat-label">进行中</text>
        </view>
        <view class="stat-card">
          <text class="stat-value">{{ store.statistics.completedCount }}</text>
          <text class="stat-label">已完成</text>
        </view>
        <view class="stat-card">
          <text class="stat-value">{{ store.statistics.completedMilestones }}</text>
          <text class="stat-label">里程碑</text>
        </view>
        <view class="stat-card">
          <text class="stat-value">{{ store.statistics.completionRate }}%</text>
          <text class="stat-label">完成率</text>
        </view>
      </view>

      <!-- 追踪列表 -->
      <view class="tracker-section">
        <text class="section-title">📍 里程碑追踪</text>
        
        <view v-if="activeDreamsWithMilestones.length > 0">
          <view 
            v-for="dream in activeDreamsWithMilestones" 
            :key="dream.id"
            class="tracker-card"
            @tap="viewDream(dream)"
          >
            <view class="tracker-header">
              <text class="tracker-title">{{ dream.title }}</text>
              <view class="tracker-progress">
                <view class="progress-bar-small">
                  <view 
                    class="progress-fill" 
                    :style="{width: dream.progress + '%', backgroundColor: store.getProgressColor(dream.progress)}"
                  ></view>
                </view>
                <text class="progress-percent">{{ dream.progress }}%</text>
              </view>
            </view>
            
            <view class="milestones-list">
              <view 
                v-for="milestone in getDreamMilestones(dream.id)" 
                :key="milestone.id"
                class="milestone-item"
                :class="milestone.status"
                @tap.stop="toggleMilestone(milestone)"
              >
                <view class="milestone-checkbox">
                  <text v-if="milestone.status === 'completed'">✓</text>
                </view>
                <view class="milestone-info">
                  <text class="milestone-title">{{ milestone.title }}</text>
                  <text class="milestone-desc">{{ milestone.description }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>
        
        <!-- 空状态 -->
        <view class="empty-state" v-else>
          <text class="empty-icon">🎯</text>
          <text class="empty-text">还没有追踪目标</text>
          <text class="empty-hint">创建梦想并添加里程碑开始追踪</text>
        </view>
      </view>
    </view>

    <!-- 添加/编辑梦想弹窗 -->
    <view class="modal-overlay" v-if="showDreamModal" @tap="closeDreamModal">
      <view class="modal-content dream-modal" @tap.stop>
        <view class="modal-header">
          <text class="modal-title">{{ editingDream ? '编辑梦想' : '创建梦想' }}</text>
          <view class="close-btn" @tap="closeDreamModal">✕</view>
        </view>
        
        <scroll-view class="modal-body" scroll-y>
          <view class="form-group">
            <text class="form-label">梦想名称</text>
            <input 
              class="form-input" 
              v-model="dreamForm.title" 
              placeholder="例如：学会游泳"
            />
          </view>
          
          <view class="form-group">
            <text class="form-label">梦想描述</text>
            <textarea 
              class="form-textarea" 
              v-model="dreamForm.description" 
              placeholder="描述你的梦想..."
              :adjust-position="true"
            />
          </view>
          
          <view class="form-group">
            <text class="form-label">分类</text>
            <view class="category-picker">
              <view 
                v-for="cat in store.categoryOptions" 
                :key="cat.value"
                class="category-option"
                :class="{selected: dreamForm.category === cat.value}"
                @tap="dreamForm.category = cat.value"
              >
                <text class="cat-emoji">{{ cat.emoji }}</text>
                <text class="cat-label">{{ cat.label.replace(/^[^\s]+\s/, '') }}</text>
              </view>
            </view>
          </view>
          
          <view class="form-group">
            <text class="form-label">目标日期</text>
            <picker 
              mode="date" 
              :value="dreamForm.targetDate" 
              @change="onDateChange"
            >
              <view class="date-picker">
                <text>{{ dreamForm.targetDate || '选择日期' }}</text>
                <text class="picker-arrow">▼</text>
              </view>
            </picker>
          </view>
          
          <view class="form-group">
            <text class="form-label">标签（用逗号分隔）</text>
            <input 
              class="form-input" 
              v-model="dreamForm.tagsInput" 
              placeholder="例如：运动,技能"
            />
          </view>
        </scroll-view>
        
        <view class="modal-footer">
          <view class="btn btn-cancel" @tap="closeDreamModal">取消</view>
          <view class="btn btn-primary" @tap="saveDream">保存</view>
        </view>
      </view>
    </view>

    <!-- 添加里程碑弹窗 -->
    <view class="modal-overlay" v-if="showMilestoneModal" @tap="closeMilestoneModal">
      <view class="modal-content milestone-modal" @tap.stop>
        <view class="modal-header">
          <text class="modal-title">添加里程碑</text>
          <view class="close-btn" @tap="closeMilestoneModal">✕</view>
        </view>
        
        <scroll-view class="modal-body" scroll-y>
          <view class="form-group">
            <text class="form-label">里程碑名称</text>
            <input 
              class="form-input" 
              v-model="milestoneForm.title" 
              placeholder="例如：学会自由泳"
            />
          </view>
          
          <view class="form-group">
            <text class="form-label">描述</text>
            <textarea 
              class="form-textarea" 
              v-model="milestoneForm.description" 
              placeholder="描述里程碑..."
              :adjust-position="true"
            />
          </view>
        </scroll-view>
        
        <view class="modal-footer">
          <view class="btn btn-cancel" @tap="closeMilestoneModal">取消</view>
          <view class="btn btn-primary" @tap="saveMilestone">保存</view>
        </view>
      </view>
    </view>

    <!-- 添加愿景图片弹窗 -->
    <view class="modal-overlay" v-if="showVisionModal" @tap="closeVisionModal">
      <view class="modal-content vision-modal" @tap.stop>
        <view class="modal-header">
          <text class="modal-title">添加愿景图片</text>
          <view class="close-btn" @tap="closeVisionModal">✕</view>
        </view>
        
        <scroll-view class="modal-body" scroll-y>
          <view class="form-group">
            <text class="form-label">图片标题</text>
            <input 
              class="form-input" 
              v-model="visionForm.title" 
              placeholder="给图片起个标题"
            />
          </view>
          
          <view class="form-group">
            <text class="form-label">图片地址</text>
            <input 
              class="form-input" 
              v-model="visionForm.url" 
              placeholder="输入图片URL或选择本地图片"
            />
          </view>
          
          <view class="form-group">
            <text class="form-label">关联梦想</text>
            <picker 
              :value="visionForm.dreamId" 
              :range="dreamPickerOptions"
              range-key="label"
              @change="onDreamPickerChange"
            >
              <view class="picker-display">
                <text>{{ visionForm.dreamId ? getDreamTitle(visionForm.dreamId) : '不关联梦想' }}</text>
                <text class="picker-arrow">▼</text>
              </view>
            </picker>
          </view>
          
          <view class="image-preview" v-if="visionForm.url">
            <image 
              :src="visionForm.url" 
              mode="aspectFill"
              class="preview-img"
              @error="onImageError"
            ></image>
          </view>
        </scroll-view>
        
        <view class="modal-footer">
          <view class="btn btn-cancel" @tap="closeVisionModal">取消</view>
          <view class="btn btn-primary" @tap="saveVisionImage">保存</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useDreamJournalStore } from '@/stores/dreamJournalStore.js'

const store = useDreamJournalStore()

// 弹窗状态
const showDreamModal = ref(false)
const showMilestoneModal = ref(false)
const showVisionModal = ref(false)

// 编辑状态
const editingDream = ref(null)

// 梦想表单
const dreamForm = ref({
  title: '',
  description: '',
  category: '',
  targetDate: '',
  tagsInput: ''
})

// 里程碑表单
const milestoneForm = ref({
  title: '',
  description: ''
})

// 愿景图片表单
const visionForm = ref({
  title: '',
  url: '',
  dreamId: ''
})

// 里程碑缓存
const milestonesCache = ref({})

// 计算属性
const activeDreamsWithMilestones = computed(() => {
  return store.dreams.filter(d => {
    const milestones = getDreamMilestones(d.id)
    return milestones.length > 0
  })
})

const dreamPickerOptions = computed(() => {
  return [
    { label: '不关联梦想', value: '' },
    ...store.dreams.map(d => ({ label: d.title, value: d.id }))
  ]
})

// 生命周期
onMounted(() => {
  store.init()
})

// 方法
const switchTab = (tab) => {
  store.switchTab(tab)
}

const getCategoryInfo = (category) => {
  return store.getCategoryInfo(category)
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
}

const getDreamMilestones = (dreamId) => {
  if (!milestonesCache.value[dreamId]) {
    milestonesCache.value[dreamId] = store.loadDreamMilestones(dreamId)
  }
  return milestonesCache.value[dreamId]
}

const getDreamMilestoneCount = (dreamId) => {
  return getDreamMilestones(dreamId).length
}

const getCompletedMilestoneCount = (dreamId) => {
  return getDreamMilestones(dreamId).filter(m => m.status === 'completed').length
}

const goToStatistics = () => {
  uni.showToast({ title: '统计数据', icon: 'none' })
}

const viewDream = (dream) => {
  store.currentDream = dream
  milestonesCache.value[dream.id] = store.loadDreamMilestones(dream.id)
  
  uni.navigateTo({
    url: `/pages/dream-journal/dream-detail?dreamId=${dream.id}`
  })
}

const addDream = () => {
  editingDream.value = null
  dreamForm.value = {
    title: '',
    description: '',
    category: '',
    targetDate: '',
    tagsInput: ''
  }
  showDreamModal.value = true
}

const editDream = (dream) => {
  editingDream.value = dream
  dreamForm.value = {
    title: dream.title,
    description: dream.description,
    category: dream.category,
    targetDate: dream.targetDate,
    tagsInput: dream.tags?.join(',') || ''
  }
  showDreamModal.value = true
}

const closeDreamModal = () => {
  showDreamModal.value = false
}

const saveDream = () => {
  if (!dreamForm.value.title.trim()) {
    uni.showToast({ title: '请输入梦想名称', icon: 'none' })
    return
  }
  
  const tags = dreamForm.value.tagsInput
    ? dreamForm.value.tagsInput.split(',').map(t => t.trim()).filter(Boolean)
    : []
  
  const dreamData = {
    title: dreamForm.value.title.trim(),
    description: dreamForm.value.description.trim(),
    category: dreamForm.value.category || 'other',
    targetDate: dreamForm.value.targetDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    tags
  }
  
  if (editingDream.value) {
    store.updateDream(editingDream.value.id, dreamData)
    uni.showToast({ title: '梦想已更新', icon: 'success' })
  } else {
    store.createDream(dreamData)
    uni.showToast({ title: '梦想已创建', icon: 'success' })
  }
  
  closeDreamModal()
}

const onDateChange = (e) => {
  dreamForm.value.targetDate = e.detail.value
}

const toggleMilestone = (milestone) => {
  if (milestone.status === 'completed') {
    // 不允许取消完成
    return
  }
  
  store.completeMilestone(milestone.id)
  const dreamId = milestone.dreamId
  milestonesCache.value[dreamId] = store.loadDreamMilestones(dreamId)
  
  // 更新梦想详情
  store.loadDreamDetail(dreamId)
}

const addVisionImage = () => {
  visionForm.value = {
    title: '',
    url: '',
    dreamId: ''
  }
  showVisionModal.value = true
}

const closeVisionModal = () => {
  showVisionModal.value = false
}

const saveVisionImage = () => {
  if (!visionForm.value.url.trim()) {
    uni.showToast({ title: '请输入图片地址', icon: 'none' })
    return
  }
  
  store.addVisionImage({
    title: visionForm.value.title.trim(),
    url: visionForm.value.url.trim(),
    dreamId: visionForm.value.dreamId || null
  })
  
  uni.showToast({ title: '图片已添加', icon: 'success' })
  closeVisionModal()
}

const onDreamPickerChange = (e) => {
  const index = e.detail.value
  visionForm.value.dreamId = dreamPickerOptions.value[index].value
}

const previewImage = (image) => {
  if (image.url) {
    uni.previewImage({
      urls: [image.url],
      current: image.url
    })
  }
}

const showImageOptions = (image) => {
  uni.showActionSheet({
    itemList: ['查看', '删除'],
    success: (res) => {
      if (res.tapIndex === 0) {
        previewImage(image)
      } else if (res.tapIndex === 1) {
        confirmDeleteImage(image)
      }
    }
  })
}

const confirmDeleteImage = (image) => {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这张图片吗？',
    success: (res) => {
      if (res.confirm) {
        store.removeVisionImage(image.id)
        uni.showToast({ title: '已删除', icon: 'success' })
      }
    }
  })
}

const onImageError = (e) => {
  console.log('图片加载失败', e)
}

const getDreamTitle = (dreamId) => {
  const dream = store.dreams.find(d => d.id === dreamId)
  return dream ? dream.title : ''
}
</script>

<style lang="scss" scoped>
.dream-journal-page {
  min-height: 100vh;
  background: #f5f5f7;
  padding-bottom: 120rpx;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60rpx 30rpx 30rpx;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.header-content {
  display: flex;
  flex-direction: column;
}

.page-title {
  font-size: 40rpx;
  font-weight: bold;
  color: #ffffff;
}

.page-subtitle {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 8rpx;
}

.stats-badge {
  background: rgba(255, 255, 255, 0.2);
  padding: 12rpx 20rpx;
  border-radius: 30rpx;
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.stats-icon {
  font-size: 28rpx;
}

.stats-value {
  font-size: 24rpx;
  color: #ffffff;
  font-weight: 500;
}

.tab-bar {
  display: flex;
  background: #ffffff;
  padding: 0 20rpx;
  border-bottom: 1rpx solid #eee;
}

.tab {
  flex: 1;
  text-align: center;
  padding: 24rpx 0;
  font-size: 28rpx;
  color: #666;
  position: relative;
  
  &.active {
    color: #667eea;
    font-weight: 600;
    
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 60rpx;
      height: 4rpx;
      background: #667eea;
      border-radius: 2rpx;
    }
  }
}

.content {
  padding: 20rpx;
}

.filter-section {
  margin-bottom: 20rpx;
}

.filter-scroll {
  white-space: nowrap;
}

.filter-chip {
  display: inline-block;
  padding: 12rpx 24rpx;
  margin-right: 16rpx;
  border-radius: 30rpx;
  background: #ffffff;
  font-size: 24rpx;
  color: #666;
  border: 1rpx solid #eee;
  
  &.active {
    background: #667eea;
    color: #ffffff;
    border-color: #667eea;
  }
}

.dream-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.dream-card {
  background: #ffffff;
  border-radius: 20rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.dream-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.dream-category {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
}

.category-emoji {
  font-size: 24rpx;
}

.category-label {
  font-size: 22rpx;
  color: #333;
}

.dream-status {
  font-size: 22rpx;
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
  
  &.active {
    background: #e6f7ff;
    color: #1677ff;
  }
  
  &.completed {
    background: #f6ffed;
    color: #52c41a;
  }
}

.dream-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 8rpx;
  display: block;
}

.dream-description {
  font-size: 26rpx;
  color: #666;
  line-height: 1.5;
  display: block;
  margin-bottom: 16rpx;
}

.progress-section {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 16rpx;
}

.progress-bar {
  flex: 1;
  height: 8rpx;
  background: #f0f0f0;
  border-radius: 4rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 4rpx;
  transition: width 0.3s;
}

.progress-text {
  font-size: 24rpx;
  color: #999;
  min-width: 80rpx;
  text-align: right;
}

.dream-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.target-date {
  font-size: 24rpx;
  color: #999;
}

.milestone-count {
  font-size: 24rpx;
  color: #999;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 100rpx 0;
}

.empty-icon {
  font-size: 100rpx;
  margin-bottom: 20rpx;
}

.empty-text {
  font-size: 32rpx;
  color: #333;
  font-weight: 500;
}

.empty-hint {
  font-size: 26rpx;
  color: #999;
  margin-top: 12rpx;
}

.fab {
  position: fixed;
  right: 40rpx;
  bottom: 120rpx;
  width: 100rpx;
  height: 100rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 20rpx rgba(102, 126, 234, 0.4);
}

.fab-icon {
  font-size: 50rpx;
  color: #ffffff;
  font-weight: 300;
}

.vision-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.vision-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.add-image-btn {
  padding: 12rpx 24rpx;
  background: #667eea;
  border-radius: 30rpx;
  font-size: 24rpx;
  color: #ffffff;
}

.vision-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.vision-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 16rpx;
  overflow: hidden;
}

.vision-image {
  width: 100%;
  height: 100%;
}

.vision-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.6));
}

.vision-caption {
  font-size: 24rpx;
  color: #ffffff;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16rpx;
  margin-bottom: 30rpx;
}

.stat-card {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 20rpx 10rpx;
  text-align: center;
}

.stat-value {
  font-size: 36rpx;
  font-weight: bold;
  color: #667eea;
  display: block;
}

.stat-label {
  font-size: 22rpx;
  color: #999;
  margin-top: 4rpx;
  display: block;
}

.tracker-section {
  margin-top: 20rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
}

.tracker-card {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
}

.tracker-header {
  margin-bottom: 20rpx;
}

.tracker-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 12rpx;
}

.tracker-progress {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.progress-bar-small {
  flex: 1;
  height: 6rpx;
  background: #f0f0f0;
  border-radius: 3rpx;
  overflow: hidden;
}

.progress-percent {
  font-size: 22rpx;
  color: #999;
  min-width: 70rpx;
  text-align: right;
}

.milestones-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.milestone-item {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
  padding: 16rpx;
  background: #f9f9f9;
  border-radius: 12rpx;
  
  &.completed {
    opacity: 0.6;
    
    .milestone-title {
      text-decoration: line-through;
    }
  }
}

.milestone-checkbox {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  border: 2rpx solid #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  color: #52c41a;
  flex-shrink: 0;
  
  .completed & {
    background: #52c41a;
    border-color: #52c41a;
    color: #ffffff;
  }
}

.milestone-info {
  flex: 1;
}

.milestone-title {
  font-size: 26rpx;
  color: #333;
  display: block;
}

.milestone-desc {
  font-size: 22rpx;
  color: #999;
  display: block;
  margin-top: 4rpx;
}

.modal-overlay {
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

.modal-content {
  width: 100%;
  max-height: 85vh;
  background: #ffffff;
  border-radius: 24rpx 24rpx 0 0;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #eee;
}

.modal-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.close-btn {
  width: 50rpx;
  height: 50rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  color: #999;
}

.modal-body {
  flex: 1;
  padding: 30rpx;
  max-height: 60vh;
}

.modal-footer {
  display: flex;
  gap: 20rpx;
  padding: 20rpx 30rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  border-top: 1rpx solid #eee;
}

.form-group {
  margin-bottom: 30rpx;
}

.form-label {
  font-size: 26rpx;
  color: #333;
  font-weight: 500;
  display: block;
  margin-bottom: 12rpx;
}

.form-input {
  width: 100%;
  height: 80rpx;
  padding: 0 20rpx;
  border: 1rpx solid #eee;
  border-radius: 12rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}

.form-textarea {
  width: 100%;
  min-height: 160rpx;
  padding: 20rpx;
  border: 1rpx solid #eee;
  border-radius: 12rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}

.category-picker {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16rpx;
}

.category-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16rpx;
  border: 1rpx solid #eee;
  border-radius: 12rpx;
  
  &.selected {
    border-color: #667eea;
    background: rgba(102, 126, 234, 0.1);
  }
}

.cat-emoji {
  font-size: 36rpx;
  margin-bottom: 8rpx;
}

.cat-label {
  font-size: 22rpx;
  color: #666;
}

.date-picker {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20rpx;
  height: 80rpx;
  border: 1rpx solid #eee;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #333;
}

.picker-arrow {
  font-size: 20rpx;
  color: #999;
}

.picker-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  border: 1rpx solid #eee;
  border-radius: 12rpx;
  font-size: 28rpx;
}

.image-preview {
  margin-top: 20rpx;
}

.preview-img {
  width: 100%;
  height: 300rpx;
  border-radius: 12rpx;
}

.btn {
  flex: 1;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 44rpx;
  font-size: 28rpx;
  
  &.btn-cancel {
    background: #f5f5f5;
    color: #666;
  }
  
  &.btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #ffffff;
  }
}
</style>
