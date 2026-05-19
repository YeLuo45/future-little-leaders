<template>
  <view class="growth-album-container">
    <!-- 顶部导航 -->
    <view class="header">
      <view class="header-left" @click="goBack">
        <text class="icon">←</text>
      </view>
      <view class="header-title">
        <text>成长相册</text>
      </view>
      <view class="header-right" @click="addPhoto">
        <text class="icon">+</text>
      </view>
    </view>

    <!-- 月份选择 -->
    <view class="month-selector">
      <view class="month-nav" @click="prevMonth">
        <text class="nav-arrow">‹</text>
      </view>
      <view class="month-display">
        <text class="month-text">{{ selectedYear }}年{{ selectedMonth }}月</text>
      </view>
      <view class="month-nav" @click="nextMonth">
        <text class="nav-arrow">›</text>
      </view>
    </view>

    <!-- 相册网格 -->
    <view class="photo-grid" v-if="filteredPhotos.length > 0">
      <view 
        class="photo-item" 
        v-for="photo in filteredPhotos" 
        :key="photo.id"
        @click="previewPhoto(photo)"
      >
        <image 
          class="photo-image" 
          :src="photo.url" 
          mode="aspectFill"
          @error="onImageError(photo)"
        />
        <view class="photo-overlay" v-if="photo.description">
          <text class="photo-desc">{{ photo.description }}</text>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view class="empty-state" v-else>
      <text class="empty-icon">📸</text>
      <text class="empty-text">暂无照片</text>
      <text class="empty-hint">点击右上角 + 添加第一张照片</text>
    </view>

    <!-- 添加照片弹窗 -->
    <view class="dialog-overlay" v-if="showDialog" @click="closeDialog">
      <view class="dialog" @click.stop>
        <view class="dialog-header">
          <text class="dialog-title">添加照片</text>
          <text class="dialog-close" @click="closeDialog">×</text>
        </view>
        <view class="dialog-body">
          <!-- 照片上传区域 -->
          <view class="upload-area" @click="chooseImage">
            <image 
              v-if="newPhoto.url" 
              class="upload-preview" 
              :src="newPhoto.url" 
              mode="aspectFill"
            />
            <view class="upload-hint" v-else>
              <text class="upload-icon">📷</text>
              <text class="upload-text">点击上传照片</text>
            </view>
          </view>

          <!-- 日期 -->
          <view class="form-item">
            <text class="form-label">照片日期</text>
            <input 
              class="form-input" 
              v-model="newPhoto.date" 
              placeholder="YYYY-MM-DD"
            />
          </view>

          <!-- 描述 -->
          <view class="form-item">
            <text class="form-label">照片描述</text>
            <textarea 
              class="form-textarea" 
              v-model="newPhoto.description" 
              placeholder="记录这一刻..."
              :rows="2"
            />
          </view>

          <!-- 标签 -->
          <view class="form-item">
            <text class="form-label">标签</text>
            <input 
              class="form-input" 
              v-model="newPhoto.tagInput" 
              placeholder="输入标签后回车添加"
              @confirm="addTag"
            />
            <view class="tag-list" v-if="newPhoto.tags.length > 0">
              <view 
                class="tag-item" 
                v-for="(tag, index) in newPhoto.tags" 
                :key="index"
              >
                {{ tag }}
                <text class="tag-delete" @click="removeTag(index)">×</text>
              </view>
            </view>
          </view>

          <view class="dialog-footer">
            <button class="btn-cancel" @click="closeDialog">取消</button>
            <button class="btn-save" @click="savePhoto">保存</button>
          </view>
        </view>
      </view>
    </view>

    <!-- 照片预览 -->
    <view class="preview-overlay" v-if="previewPhotoData" @click="closePreview">
      <view class="preview-container" @click.stop>
        <image 
          class="preview-image" 
          :src="previewPhotoData.url" 
          mode="widthFix"
        />
        <view class="preview-info">
          <text class="preview-date">{{ previewPhotoData.date }}</text>
          <text class="preview-desc" v-if="previewPhotoData.description">{{ previewPhotoData.description }}</text>
        </view>
        <view class="preview-actions">
          <text class="preview-action delete" @click="deletePhoto(previewPhotoData.id)">删除</text>
          <text class="preview-action" @click="closePreview">关闭</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useGrowthJournalStore } from '@/stores/growthJournalStore.js'

const growthJournalStore = useGrowthJournalStore()

// 当前年月
const now = new Date()
const selectedYear = ref(now.getFullYear())
const selectedMonth = ref(now.getMonth() + 1)

// 弹窗状态
const showDialog = ref(false)
const previewPhotoData = ref(null)

// 新照片数据
const newPhoto = reactive({
  url: '',
  date: now.toISOString().split('T')[0],
  description: '',
  tags: [],
  tagInput: ''
})

// 初始化
onMounted(() => {
  growthJournalStore.init()
  growthJournalStore.loadAlbumPhotos()
})

// 筛选的照片
const filteredPhotos = computed(() => {
  return growthJournalStore.getPhotosByMonth(selectedYear.value, selectedMonth.value)
})

// 返回
const goBack = () => {
  uni.navigateBack()
}

// 月份导航
const prevMonth = () => {
  if (selectedMonth.value === 1) {
    selectedMonth.value = 12
    selectedYear.value--
  } else {
    selectedMonth.value--
  }
}

const nextMonth = () => {
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1
  
  if (selectedYear.value < currentYear || 
      (selectedYear.value === currentYear && selectedMonth.value < currentMonth)) {
    if (selectedMonth.value === 12) {
      selectedMonth.value = 1
      selectedYear.value++
    } else {
      selectedMonth.value++
    }
  }
}

// 选择图片
const chooseImage = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      newPhoto.url = res.tempFilePaths[0]
    }
  })
}

// 添加标签
const addTag = () => {
  const tag = newPhoto.tagInput.trim()
  if (tag && !newPhoto.tags.includes(tag)) {
    newPhoto.tags.push(tag)
  }
  newPhoto.tagInput = ''
}

// 移除标签
const removeTag = (index) => {
  newPhoto.tags.splice(index, 1)
}

// 保存照片
const savePhoto = () => {
  if (!newPhoto.url) {
    uni.showToast({ title: '请先选择照片', icon: 'none' })
    return
  }
  
  growthJournalStore.addAlbumPhoto({
    url: newPhoto.url,
    date: newPhoto.date,
    description: newPhoto.description,
    tags: newPhoto.tags
  })
  
  closeDialog()
  uni.showToast({ title: '添加成功', icon: 'success' })
}

// 关闭弹窗
const closeDialog = () => {
  showDialog.value = false
  newPhoto.url = ''
  newPhoto.date = now.toISOString().split('T')[0]
  newPhoto.description = ''
  newPhoto.tags = []
  newPhoto.tagInput = ''
}

// 添加照片
const addPhoto = () => {
  showDialog.value = true
}

// 预览照片
const previewPhoto = (photo) => {
  previewPhotoData.value = photo
}

// 关闭预览
const closePreview = () => {
  previewPhotoData.value = null
}

// 删除照片
const deletePhoto = (id) => {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这张照片吗？',
    success: (res) => {
      if (res.confirm) {
        growthJournalStore.deleteAlbumPhoto(id)
        closePreview()
        uni.showToast({ title: '已删除', icon: 'success' })
      }
    }
  })
}

// 图片加载失败
const onImageError = (photo) => {
  // 降级处理：显示占位图
  photo.url = '/static/default-image.png'
}
</script>

<style scoped>
.growth-album-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 20px;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 60px 20px 15px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
}

.month-selector {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  padding: 15px;
  margin-bottom: 10px;
}

.month-nav {
  padding: 10px 20px;
}

.nav-arrow {
  font-size: 24px;
  color: #667eea;
}

.month-display {
  text-align: center;
  min-width: 120px;
}

.month-text {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.photo-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
  padding: 0 4px;
}

.photo-item {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
  background: #f0f0f0;
}

.photo-image {
  width: 100%;
  height: 100%;
}

.photo-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0,0,0,0.5);
  padding: 8px;
}

.photo-desc {
  font-size: 11px;
  color: #fff;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
}

.empty-icon {
  display: block;
  font-size: 64px;
  margin-bottom: 15px;
}

.empty-text {
  display: block;
  font-size: 16px;
  color: #333;
  margin-bottom: 5px;
}

.empty-hint {
  display: block;
  font-size: 13px;
  color: #999;
}

/* 弹窗样式 */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  z-index: 100;
  display: flex;
  align-items: flex-end;
}

.dialog {
  width: 100%;
  max-height: 80vh;
  background: #fff;
  border-radius: 20px 20px 0 0;
  overflow: hidden;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.dialog-title {
  font-size: 17px;
  font-weight: 600;
  color: #333;
}

.dialog-close {
  font-size: 24px;
  color: #999;
}

.dialog-body {
  padding: 15px 20px;
  max-height: calc(80vh - 60px);
  overflow-y: auto;
}

.upload-area {
  width: 100%;
  height: 200px;
  background: #f5f5f5;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
  overflow: hidden;
}

.upload-preview {
  width: 100%;
  height: 100%;
}

.upload-hint {
  text-align: center;
}

.upload-icon {
  display: block;
  font-size: 40px;
  margin-bottom: 8px;
}

.upload-text {
  font-size: 14px;
  color: #999;
}

.form-item {
  margin-bottom: 15px;
}

.form-label {
  display: block;
  font-size: 13px;
  color: #666;
  margin-bottom: 6px;
}

.form-input {
  width: 100%;
  background: #f5f5f5;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 14px;
  box-sizing: border-box;
}

.form-textarea {
  width: 100%;
  background: #f5f5f5;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 14px;
  box-sizing: border-box;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.tag-item {
  background: #667eea;
  color: #fff;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
}

.tag-delete {
  margin-left: 5px;
}

.dialog-footer {
  display: flex;
  gap: 15px;
  margin-top: 20px;
}

.btn-cancel,
.btn-save {
  flex: 1;
  padding: 12px;
  border-radius: 8px;
  font-size: 15px;
  text-align: center;
}

.btn-cancel {
  background: #f5f5f5;
  color: #666;
}

.btn-save {
  background: #667eea;
  color: #fff;
}

/* 预览样式 */
.preview-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.9);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-container {
  width: 100%;
  max-height: 100vh;
  display: flex;
  flex-direction: column;
}

.preview-image {
  width: 100%;
  flex: 1;
  object-fit: contain;
}

.preview-info {
  padding: 15px;
  background: rgba(0,0,0,0.7);
}

.preview-date {
  font-size: 13px;
  color: #fff;
}

.preview-desc {
  display: block;
  font-size: 14px;
  color: #fff;
  margin-top: 5px;
}

.preview-actions {
  display: flex;
  justify-content: flex-end;
  gap: 20px;
  padding: 15px;
  background: rgba(0,0,0,0.7);
}

.preview-action {
  font-size: 15px;
  color: #fff;
}

.preview-action.delete {
  color: #ff4d4f;
}
</style>
