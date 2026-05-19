<template>
  <view class="dream-detail-page">
    <!-- 头部 -->
    <view class="header" :style="{backgroundColor: categoryInfo.color}">
      <view class="header-top">
        <view class="back-btn" @tap="goBack">
          <text class="back-icon">←</text>
        </view>
        <view class="more-btn" @tap="showMoreOptions">
          <text>⋮</text>
        </view>
      </view>
      
      <view class="dream-info">
        <view class="category-tag">
          <text class="category-emoji">{{ categoryInfo.emoji }}</text>
          <text class="category-label">{{ categoryInfo.label }}</text>
        </view>
        <text class="dream-title">{{ dream?.title }}</text>
        <text class="dream-description">{{ dream?.description }}</text>
      </view>
    </view>

    <!-- 内容区 -->
    <view class="content">
      <!-- 进度卡片 -->
      <view class="progress-card">
        <view class="progress-header">
          <text class="progress-title">总体进度</text>
          <text class="progress-percent">{{ dream?.progress || 0 }}%</text>
        </view>
        <view class="progress-bar">
          <view 
            class="progress-fill" 
            :style="{width: (dream?.progress || 0) + '%', backgroundColor: store.getProgressColor(dream?.progress)}"
          ></view>
        </view>
        <view class="progress-stats">
          <view class="stat-item">
            <text class="stat-value">{{ completedMilestonesCount }}</text>
            <text class="stat-label">已完成</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ totalMilestonesCount }}</text>
            <text class="stat-label">总里程碑</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ remainingDays }}</text>
            <text class="stat-label">剩余天数</text>
          </view>
        </view>
      </view>

      <!-- 目标日期 -->
      <view class="date-card">
        <text class="date-label">🎯 目标日期</text>
        <text class="date-value">{{ formatDate(dream?.targetDate) }}</text>
        <view class="tags" v-if="dream?.tags?.length">
          <text v-for="tag in dream.tags" :key="tag" class="tag">{{ tag }}</text>
        </view>
      </view>

      <!-- 里程碑列表 -->
      <view class="milestones-section">
        <view class="section-header">
          <text class="section-title">📍 里程碑</text>
          <view class="add-milestone-btn" @tap="showAddMilestoneModal">
            <text>+ 添加</text>
          </view>
        </view>

        <view class="milestones-list" v-if="milestones.length > 0">
          <view 
            v-for="(milestone, index) in milestones" 
            :key="milestone.id"
            class="milestone-item"
            :class="milestone.status"
          >
            <view class="milestone-line" v-if="index < milestones.length - 1"></view>
            <view class="milestone-dot" :class="milestone.status"></view>
            
            <view class="milestone-content">
              <view class="milestone-header">
                <text class="milestone-title">{{ milestone.title }}</text>
                <view class="milestone-status" :class="milestone.status">
                  {{ store.getMilestoneStatusName(milestone.status) }}
                </view>
              </view>
              <text class="milestone-description">{{ milestone.description }}</text>
              <text class="milestone-date" v-if="milestone.completedAt">
                完成于 {{ formatDate(milestone.completedAt) }}
              </text>
            </view>

            <view class="milestone-actions" v-if="milestone.status !== 'completed'">
              <view class="action-btn complete" @tap="completeMilestone(milestone)">
                <text>✓</text>
              </view>
              <view class="action-btn delete" @tap="deleteMilestone(milestone)">
                <text>🗑</text>
              </view>
            </view>
          </view>
        </view>

        <view class="empty-milestones" v-else>
          <text class="empty-text">还没有里程碑</text>
          <text class="empty-hint">添加里程碑来追踪你的梦想进度</text>
        </view>
      </view>

      <!-- 愿景图片 -->
      <view class="vision-section">
        <view class="section-header">
          <text class="section-title">🖼️ 愿景图片</text>
          <view class="add-image-btn" @tap="addVisionImage">
            <text>+ 添加</text>
          </view>
        </view>

        <view class="vision-grid" v-if="dreamImages.length > 0">
          <view 
            v-for="image in dreamImages" 
            :key="image.id"
            class="vision-item"
            @tap="previewImage(image)"
          >
            <image :src="image.url" mode="aspectFill" @error="onImageError"></image>
          </view>
        </view>

        <view class="empty-vision" v-else>
          <text class="empty-text">还没有愿景图片</text>
        </view>
      </view>

      <!-- 完成梦想按钮 -->
      <view class="complete-section" v-if="dream?.status !== 'completed'">
        <view class="complete-btn" @tap="markDreamComplete">
          <text>🎉 标记梦想完成</text>
        </view>
      </view>
    </view>

    <!-- 添加里程碑弹窗 -->
    <view class="modal-overlay" v-if="showMilestoneModal" @tap="closeMilestoneModal">
      <view class="modal-content" @tap.stop>
        <view class="modal-header">
          <text class="modal-title">添加里程碑</text>
          <view class="close-btn" @tap="closeMilestoneModal">✕</view>
        </view>
        
        <view class="modal-body">
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
              placeholder="描述这个里程碑..."
            />
          </view>
        </view>
        
        <view class="modal-footer">
          <view class="btn btn-cancel" @tap="closeMilestoneModal">取消</view>
          <view class="btn btn-primary" @tap="saveMilestone">保存</view>
        </view>
      </view>
    </view>

    <!-- 更多操作弹窗 -->
    <view class="modal-overlay" v-if="showOptionsModal" @tap="closeOptionsModal">
      <view class="modal-content options-modal" @tap.stop>
        <view class="option-item" @tap="editDream">
          <text class="option-icon">✏️</text>
          <text class="option-text">编辑梦想</text>
        </view>
        <view class="option-item" @tap="shareDream">
          <text class="option-icon">📤</text>
          <text class="option-text">分享梦想</text>
        </view>
        <view class="option-item danger" @tap="deleteDreamConfirm">
          <text class="option-icon">🗑️</text>
          <text class="option-text">删除梦想</text>
        </view>
        <view class="option-item cancel" @tap="closeOptionsModal">
          <text class="option-text">取消</text>
        </view>
      </view>
    </view>

    <!-- 编辑梦想弹窗 -->
    <view class="modal-overlay" v-if="showEditModal" @tap="closeEditModal">
      <view class="modal-content edit-modal" @tap.stop>
        <view class="modal-header">
          <text class="modal-title">编辑梦想</text>
          <view class="close-btn" @tap="closeEditModal">✕</view>
        </view>
        
        <scroll-view class="modal-body" scroll-y>
          <view class="form-group">
            <text class="form-label">梦想名称</text>
            <input 
              class="form-input" 
              v-model="editForm.title" 
              placeholder="例如：学会游泳"
            />
          </view>
          
          <view class="form-group">
            <text class="form-label">梦想描述</text>
            <textarea 
              class="form-textarea" 
              v-model="editForm.description" 
              placeholder="描述你的梦想..."
            />
          </view>
          
          <view class="form-group">
            <text class="form-label">分类</text>
            <view class="category-picker">
              <view 
                v-for="cat in store.categoryOptions" 
                :key="cat.value"
                class="category-option"
                :class="{selected: editForm.category === cat.value}"
                @tap="editForm.category = cat.value"
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
              :value="editForm.targetDate" 
              @change="onEditDateChange"
            >
              <view class="date-picker">
                <text>{{ editForm.targetDate || '选择日期' }}</text>
                <text class="picker-arrow">▼</text>
              </view>
            </picker>
          </view>
          
          <view class="form-group">
            <text class="form-label">标签（用逗号分隔）</text>
            <input 
              class="form-input" 
              v-model="editForm.tagsInput" 
              placeholder="例如：运动,技能"
            />
          </view>
        </scroll-view>
        
        <view class="modal-footer">
          <view class="btn btn-cancel" @tap="closeEditModal">取消</view>
          <view class="btn btn-primary" @tap="saveEditDream">保存</view>
        </view>
      </view>
    </view>

    <!-- 添加愿景图片弹窗 -->
    <view class="modal-overlay" v-if="showVisionModal" @tap="closeVisionModal">
      <view class="modal-content" @tap.stop>
        <view class="modal-header">
          <text class="modal-title">添加愿景图片</text>
          <view class="close-btn" @tap="closeVisionModal">✕</view>
        </view>
        
        <view class="modal-body">
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
              placeholder="输入图片URL"
            />
          </view>
          
          <view class="image-preview" v-if="visionForm.url">
            <image 
              :src="visionForm.url" 
              mode="aspectFill"
              class="preview-img"
              @error="onImageError"
            ></image>
          </view>
        </view>
        
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

// 页面参数
const dreamId = ref('')
const dream = ref(null)
const milestones = ref([])
const dreamImages = ref([])

// 弹窗状态
const showMilestoneModal = ref(false)
const showOptionsModal = ref(false)
const showEditModal = ref(false)
const showVisionModal = ref(false)

// 表单数据
const milestoneForm = ref({
  title: '',
  description: ''
})

const editForm = ref({
  title: '',
  description: '',
  category: '',
  targetDate: '',
  tagsInput: ''
})

const visionForm = ref({
  title: '',
  url: ''
})

// 计算属性
const categoryInfo = computed(() => {
  return store.getCategoryInfo(dream.value?.category || 'other')
})

const totalMilestonesCount = computed(() => milestones.value.length)

const completedMilestonesCount = computed(() => {
  return milestones.value.filter(m => m.status === 'completed').length
})

const remainingDays = computed(() => {
  if (!dream.value?.targetDate) return 0
  const target = new Date(dream.value.targetDate)
  const now = new Date()
  const diff = target - now
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
})

// 生命周期
onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = currentPage.options || currentPage.$page?.options || {}
  dreamId.value = options.dreamId
  
  if (dreamId.value) {
    loadDreamDetail()
  }
})

// 方法
const loadDreamDetail = () => {
  dream.value = store.loadDreamDetail(dreamId.value)
  milestones.value = store.loadDreamMilestones(dreamId.value)
  dreamImages.value = dream.value?.images || []
}

const goBack = () => {
  uni.navigateBack()
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
}

const getCategoryInfo = (category) => {
  return store.getCategoryInfo(category)
}

const showMoreOptions = () => {
  showOptionsModal.value = true
}

const closeOptionsModal = () => {
  showOptionsModal.value = false
}

const editDream = () => {
  closeOptionsModal()
  editForm.value = {
    title: dream.value.title,
    description: dream.value.description,
    category: dream.value.category,
    targetDate: dream.value.targetDate,
    tagsInput: dream.value.tags?.join(',') || ''
  }
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
}

const saveEditDream = () => {
  if (!editForm.value.title.trim()) {
    uni.showToast({ title: '请输入梦想名称', icon: 'none' })
    return
  }
  
  const tags = editForm.value.tagsInput
    ? editForm.value.tagsInput.split(',').map(t => t.trim()).filter(Boolean)
    : []
  
  store.updateDream(dreamId.value, {
    title: editForm.value.title.trim(),
    description: editForm.value.description.trim(),
    category: editForm.value.category || 'other',
    targetDate: editForm.value.targetDate,
    tags
  })
  
  uni.showToast({ title: '梦想已更新', icon: 'success' })
  loadDreamDetail()
  closeEditModal()
}

const onEditDateChange = (e) => {
  editForm.value.targetDate = e.detail.value
}

const deleteDreamConfirm = () => {
  closeOptionsModal()
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这个梦想吗？删除后将无法恢复。',
    success: (res) => {
      if (res.confirm) {
        store.removeDream(dreamId.value)
        uni.showToast({ title: '梦想已删除', icon: 'success' })
        setTimeout(() => {
          uni.navigateBack()
        }, 1000)
      }
    }
  })
}

const shareDream = () => {
  closeOptionsModal()
  uni.showToast({ title: '分享功能开发中', icon: 'none' })
}

const showAddMilestoneModal = () => {
  milestoneForm.value = {
    title: '',
    description: ''
  }
  showMilestoneModal.value = true
}

const closeMilestoneModal = () => {
  showMilestoneModal.value = false
}

const saveMilestone = () => {
  if (!milestoneForm.value.title.trim()) {
    uni.showToast({ title: '请输入里程碑名称', icon: 'none' })
    return
  }
  
  store.createMilestone({
    dreamId: dreamId.value,
    title: milestoneForm.value.title.trim(),
    description: milestoneForm.value.description.trim()
  })
  
  uni.showToast({ title: '里程碑已添加', icon: 'success' })
  loadDreamDetail()
  closeMilestoneModal()
}

const completeMilestone = (milestone) => {
  store.completeMilestone(milestone.id)
  uni.showToast({ title: '太棒了！', icon: 'success' })
  loadDreamDetail()
}

const deleteMilestone = (milestone) => {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这个里程碑吗？',
    success: (res) => {
      if (res.confirm) {
        store.removeMilestone(milestone.id)
        uni.showToast({ title: '已删除', icon: 'success' })
        loadDreamDetail()
      }
    }
  })
}

const addVisionImage = () => {
  visionForm.value = {
    title: '',
    url: ''
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
  
  store.addDreamImage(dreamId.value, {
    title: visionForm.value.title.trim(),
    url: visionForm.value.url.trim()
  })
  
  uni.showToast({ title: '图片已添加', icon: 'success' })
  loadDreamDetail()
  closeVisionModal()
}

const previewImage = (image) => {
  if (image.url) {
    uni.previewImage({
      urls: [image.url],
      current: image.url
    })
  }
}

const onImageError = (e) => {
  console.log('图片加载失败', e)
}

const markDreamComplete = () => {
  uni.showModal({
    title: '确认完成',
    content: '恭喜你完成梦想！确定要标记为已完成吗？',
    success: (res) => {
      if (res.confirm) {
        store.updateDream(dreamId.value, {
          status: 'completed',
          progress: 100
        })
        uni.showToast({ title: '🎉 梦想已完成', icon: 'success' })
        loadDreamDetail()
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.dream-detail-page {
  min-height: 100vh;
  background: #f5f5f7;
}

.header {
  padding: 60rpx 30rpx 40rpx;
  color: #ffffff;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.back-btn, .more-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  font-size: 32rpx;
}

.back-icon {
  font-size: 36rpx;
}

.dream-info {
  margin-top: 20rpx;
}

.category-tag {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  background: rgba(255, 255, 255, 0.2);
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
  margin-bottom: 16rpx;
}

.category-emoji {
  font-size: 24rpx;
}

.category-label {
  font-size: 24rpx;
}

.dream-title {
  font-size: 40rpx;
  font-weight: bold;
  display: block;
  margin-bottom: 8rpx;
}

.dream-description {
  font-size: 26rpx;
  opacity: 0.9;
  display: block;
  line-height: 1.5;
}

.content {
  padding: 20rpx;
  margin-top: -20rpx;
}

.progress-card {
  background: #ffffff;
  border-radius: 20rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.progress-title {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.progress-percent {
  font-size: 36rpx;
  font-weight: bold;
  color: #667eea;
}

.progress-bar {
  height: 12rpx;
  background: #f0f0f0;
  border-radius: 6rpx;
  overflow: hidden;
  margin-bottom: 20rpx;
}

.progress-fill {
  height: 100%;
  border-radius: 6rpx;
  transition: width 0.3s;
}

.progress-stats {
  display: flex;
  justify-content: space-around;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
}

.stat-label {
  font-size: 22rpx;
  color: #999;
  display: block;
  margin-top: 4rpx;
}

.date-card {
  background: #ffffff;
  border-radius: 20rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.date-label {
  font-size: 26rpx;
  color: #666;
}

.date-value {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  display: block;
  margin-top: 8rpx;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 16rpx;
}

.tag {
  padding: 6rpx 16rpx;
  background: #f0f0f0;
  border-radius: 16rpx;
  font-size: 22rpx;
  color: #666;
}

.milestones-section {
  background: #ffffff;
  border-radius: 20rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
}

.add-milestone-btn, .add-image-btn {
  padding: 8rpx 20rpx;
  background: #667eea;
  border-radius: 20rpx;
  font-size: 24rpx;
  color: #ffffff;
}

.milestones-list {
  position: relative;
}

.milestone-item {
  position: relative;
  padding-left: 40rpx;
  padding-bottom: 30rpx;
  
  &:last-child {
    padding-bottom: 0;
    
    .milestone-line {
      display: none;
    }
  }
  
  &.completed {
    opacity: 0.7;
  }
}

.milestone-line {
  position: absolute;
  left: 11rpx;
  top: 24rpx;
  bottom: 0;
  width: 2rpx;
  background: #e0e0e0;
}

.milestone-dot {
  position: absolute;
  left: 0;
  top: 8rpx;
  width: 24rpx;
  height: 24rpx;
  border-radius: 50%;
  background: #ffffff;
  border: 3rpx solid #ddd;
  
  &.completed {
    background: #52c41a;
    border-color: #52c41a;
  }
  
  &.in_progress {
    background: #ffffff;
    border-color: #667eea;
  }
}

.milestone-content {
  flex: 1;
}

.milestone-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8rpx;
}

.milestone-title {
  font-size: 28rpx;
  font-weight: 500;
  color: #333;
}

.milestone-status {
  font-size: 22rpx;
  padding: 4rpx 12rpx;
  border-radius: 10rpx;
  
  &.pending {
    background: #f5f5f5;
    color: #999;
  }
  
  &.in_progress {
    background: #e6f4ff;
    color: #1677ff;
  }
  
  &.completed {
    background: #f6ffed;
    color: #52c41a;
  }
}

.milestone-description {
  font-size: 24rpx;
  color: #666;
  display: block;
  margin-bottom: 8rpx;
}

.milestone-date {
  font-size: 22rpx;
  color: #999;
}

.milestone-actions {
  display: flex;
  gap: 12rpx;
  margin-top: 12rpx;
}

.action-btn {
  width: 50rpx;
  height: 50rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 24rpx;
  
  &.complete {
    background: #f6ffed;
    color: #52c41a;
  }
  
  &.delete {
    background: #fff2f0;
    color: #ff4d4f;
  }
}

.empty-milestones {
  text-align: center;
  padding: 40rpx 0;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
  display: block;
}

.empty-hint {
  font-size: 24rpx;
  color: #ccc;
  display: block;
  margin-top: 8rpx;
}

.vision-section {
  background: #ffffff;
  border-radius: 20rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.vision-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;
}

.vision-item {
  aspect-ratio: 1;
  border-radius: 12rpx;
  overflow: hidden;
  
  image {
    width: 100%;
    height: 100%;
  }
}

.empty-vision {
  text-align: center;
  padding: 30rpx 0;
}

.complete-section {
  padding: 20rpx 0;
}

.complete-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30rpx;
  color: #ffffff;
  font-weight: 500;
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

.options-modal {
  border-radius: 24rpx 24rpx 0 0;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
  
  &.danger .option-text {
    color: #ff4d4f;
  }
  
  &.cancel {
    justify-content: center;
    border-bottom: none;
    
    .option-text {
      color: #666;
    }
  }
}

.option-icon {
  font-size: 36rpx;
}

.option-text {
  font-size: 28rpx;
  color: #333;
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

.edit-modal {
  max-height: 90vh;
}
</style>
