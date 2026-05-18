<template>
  <view class="my-creations-page">
    <!-- 顶部导航 -->
    <view class="nav-header">
      <view class="back-btn" @click="goBack">
        <text class="icon">←</text>
      </view>
      <text class="nav-title">我的成果</text>
      <view class="right-btn" @click="showAddTip">
        <text class="icon">➕</text>
      </view>
    </view>

    <!-- Tab切换 -->
    <view class="tab-bar">
      <view 
        :class="['tab-item', { active: activeTab === 'all' }]"
        @click="activeTab = 'all'"
      >
        <text>全部</text>
        <text class="tab-count">{{ creations.length }}</text>
      </view>
      <view 
        :class="['tab-item', { active: activeTab === 'shared' }]"
        @click="activeTab = 'shared'"
      >
        <text>已分享</text>
      </view>
    </view>

    <!-- 成果列表 -->
    <scroll-view class="creations-scroll" scroll-y>
      <view v-if="displayCreations.length > 0" class="creations-grid">
        <view 
          v-for="creation in displayCreations" 
          :key="creation.id"
          class="creation-card"
        >
          <view class="card-image" @click="previewPhoto(creation)">
            <image 
              v-if="creation.photo" 
              :src="creation.photo" 
              mode="aspectFill" 
              class="creation-img"
            />
            <view v-else class="no-image">
              <text class="no-image-icon">📷</text>
            </view>
            <view class="card-overlay">
              <text class="overlay-text">{{ creation.activityTitle }}</text>
            </view>
          </view>
          
          <view class="card-info">
            <text class="creation-title">{{ creation.title }}</text>
            <text class="creation-desc" v-if="creation.description">
              {{ creation.description }}
            </text>
            <view class="creation-meta">
              <text class="meta-date">{{ formatDate(creation.createdAt) }}</text>
              <text class="meta-points">+{{ creation.points }}积分</text>
            </view>
          </view>

          <view class="card-actions">
            <view class="action-btn" @click="shareCreation(creation)">
              <text>📤</text>
              <text>分享</text>
            </view>
            <view class="action-btn" @click="editCreation(creation)">
              <text>✏️</text>
              <text>编辑</text>
            </view>
            <view class="action-btn delete" @click="deleteCreation(creation)">
              <text>🗑️</text>
              <text>删除</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-else class="empty-state">
        <text class="empty-icon">🎨</text>
        <text class="empty-title">还没有成果</text>
        <text class="empty-desc">快去完成亲子活动，记录你们的成果吧！</text>
        <view class="empty-action" @click="goToActivityList">
          <text>去参加活动</text>
        </view>
      </view>
    </scroll-view>

    <!-- 编辑弹窗 -->
    <view v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
      <view class="edit-modal" @click.stop>
        <view class="modal-header">
          <text class="modal-title">编辑成果</text>
          <view class="modal-close" @click="closeEditModal">×</view>
        </view>
        <view class="modal-body">
          <view class="form-item">
            <text class="form-label">标题</text>
            <input 
              type="text" 
              v-model="editForm.title" 
              placeholder="请输入标题"
              class="form-input"
            />
          </view>
          <view class="form-item">
            <text class="form-label">描述</text>
            <textarea 
              v-model="editForm.description" 
              placeholder="请输入描述"
              class="form-textarea"
            />
          </view>
        </view>
        <view class="modal-footer">
          <view class="btn-cancel" @click="closeEditModal">取消</view>
          <view class="btn-save" @click="saveEdit">保存</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useActivityStore } from '@/stores/activityStore.js'

const activityStore = useActivityStore()

const activeTab = ref('all')
const creations = ref([])
const showEditModal = ref(false)
const editingCreation = ref(null)
const editForm = ref({
  title: '',
  description: ''
})

onMounted(() => {
  activityStore.loadCreations()
  creations.value = activityStore.creations
})

const displayCreations = computed(() => {
  if (activeTab.value === 'shared') {
    return creations.value.filter(c => c.shared)
  }
  return creations.value
})

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${month}月${day}日`
}

const goBack = () => {
  uni.navigateBack()
}

const showAddTip = () => {
  uni.showToast({ title: '请先完成活动', icon: 'none' })
}

const previewPhoto = (creation) => {
  if (creation.photo) {
    uni.previewImage({
      urls: [creation.photo]
    })
  }
}

const shareCreation = (creation) => {
  uni.showShareMenu({
    withShareTicket: true,
    menus: ['shareAppMessage', 'shareTimeline']
  })
  
  // 标记为已分享
  activityStore.editCreation(creation.id, { shared: true })
  creation.shared = true
  
  uni.showToast({ title: '分享成功', icon: 'success' })
}

const editCreation = (creation) => {
  editingCreation.value = creation
  editForm.value = {
    title: creation.title,
    description: creation.description || ''
  }
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  editingCreation.value = null
}

const saveEdit = () => {
  if (editingCreation.value) {
    activityStore.editCreation(editingCreation.value.id, editForm.value)
    
    // 更新本地数据
    const index = creations.value.findIndex(c => c.id === editingCreation.value.id)
    if (index !== -1) {
      creations.value[index] = { ...creations.value[index], ...editForm.value }
    }
    
    closeEditModal()
    uni.showToast({ title: '保存成功', icon: 'success' })
  }
}

const deleteCreation = (creation) => {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这个成果吗？',
    success: (res) => {
      if (res.confirm) {
        activityStore.removeCreation(creation.id)
        creations.value = creations.value.filter(c => c.id !== creation.id)
        uni.showToast({ title: '已删除', icon: 'success' })
      }
    }
  })
}

const goToActivityList = () => {
  uni.navigateTo({
    url: '/pages/parent-child/activity-list'
  })
}
</script>

<style scoped>
.my-creations-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.nav-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 30rpx;
  background: #fff;
  position: sticky;
  top: 0;
  z-index: 100;
}

.back-btn, .right-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
  border-radius: 50%;
}

.nav-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #333;
}

.icon {
  font-size: 32rpx;
}

.tab-bar {
  display: flex;
  background: #fff;
  padding: 0 30rpx;
  border-bottom: 1rpx solid #eee;
}

.tab-item {
  padding: 24rpx 30rpx;
  font-size: 28rpx;
  color: #666;
  display: flex;
  align-items: center;
  gap: 10rpx;
  position: relative;
}

.tab-item.active {
  color: #333;
  font-weight: 600;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 40rpx;
  height: 6rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 3rpx;
}

.tab-count {
  background: #f0f0f0;
  padding: 4rpx 12rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
}

.creations-scroll {
  height: calc(100vh - 200rpx);
  padding: 20rpx;
}

.creations-grid {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.creation-card {
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.08);
}

.card-image {
  position: relative;
  height: 350rpx;
}

.creation-img {
  width: 100%;
  height: 100%;
}

.no-image {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.no-image-icon {
  font-size: 80rpx;
}

.card-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx;
  background: linear-gradient(transparent, rgba(0,0,0,0.7));
}

.overlay-text {
  color: #fff;
  font-size: 26rpx;
}

.card-info {
  padding: 24rpx;
}

.creation-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.creation-desc {
  font-size: 26rpx;
  color: #666;
  display: block;
  margin-bottom: 16rpx;
  line-height: 1.4;
}

.creation-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.meta-date {
  font-size: 24rpx;
  color: #999;
}

.meta-points {
  font-size: 24rpx;
  color: #667eea;
  font-weight: 600;
}

.card-actions {
  display: flex;
  border-top: 1rpx solid #eee;
}

.action-btn {
  flex: 1;
  padding: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  font-size: 26rpx;
  color: #666;
}

.action-btn:not(:last-child) {
  border-right: 1rpx solid #eee;
}

.action-btn.delete {
  color: #f44336;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 150rpx 50rpx;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 30rpx;
}

.empty-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 16rpx;
}

.empty-desc {
  font-size: 28rpx;
  color: #999;
  text-align: center;
  line-height: 1.5;
  margin-bottom: 40rpx;
}

.empty-action {
  padding: 24rpx 60rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-radius: 30rpx;
  font-size: 28rpx;
}

/* 编辑弹窗 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: flex-end;
  z-index: 1000;
}

.edit-modal {
  width: 100%;
  background: #fff;
  border-radius: 24rpx 24rpx 0 0;
  max-height: 80vh;
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

.modal-close {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48rpx;
  color: #999;
}

.modal-body {
  padding: 30rpx;
}

.form-item {
  margin-bottom: 30rpx;
}

.form-label {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 12rpx;
  display: block;
}

.form-input {
  width: 100%;
  padding: 24rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
  font-size: 28rpx;
}

.form-textarea {
  width: 100%;
  padding: 24rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
  font-size: 28rpx;
  min-height: 200rpx;
}

.modal-footer {
  display: flex;
  padding: 30rpx;
  gap: 20rpx;
}

.btn-cancel, .btn-save {
  flex: 1;
  padding: 24rpx;
  border-radius: 12rpx;
  text-align: center;
  font-size: 28rpx;
}

.btn-cancel {
  background: #f5f5f5;
  color: #666;
}

.btn-save {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}
</style>
