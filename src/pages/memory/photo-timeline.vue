<template>
  <view class="photo-timeline">
    <!-- 顶部标题 -->
    <view class="header">
      <text class="title">📸 照片时间线</text>
      <text class="subtitle">记录家庭珍贵时刻</text>
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
        :class="{ active: currentTab === 'albums' }"
        @click="currentTab = 'albums'"
      >
        <text class="tab-icon">📚</text>
        <text class="tab-text">相册</text>
      </view>
      <view
        class="tab-item"
        :class="{ active: currentTab === 'upload' }"
        @click="openUploadModal"
      >
        <text class="tab-icon">➕</text>
        <text class="tab-text">上传</text>
      </view>
    </view>

    <!-- 时间线视图 -->
    <view class="timeline-section" v-if="currentTab === 'timeline'">
      <!-- 年份分组 -->
      <view
        v-for="(yearPhotos, year) in memoryStore.photosByYear"
        :key="year"
        class="year-group"
      >
        <view class="year-header">
          <text class="year-label">{{ year }}</text>
          <text class="photo-count">{{ yearPhotos.length }} 张照片</text>
        </view>

        <!-- 照片网格 -->
        <view class="photo-grid">
          <view
            v-for="photo in yearPhotos"
            :key="photo.id"
            class="photo-item"
            @click="viewPhoto(photo)"
          >
            <image
              class="photo-image"
              :src="photo.url"
              mode="aspectFill"
              placeholder="照片加载中..."
            />
            <view class="photo-overlay">
              <text class="photo-title">{{ photo.title || '无标题' }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view class="empty-state" v-if="Object.keys(memoryStore.photosByYear).length === 0">
        <text class="empty-icon">📷</text>
        <text class="empty-text">还没有照片</text>
        <text class="empty-hint">点击上方"上传"按钮添加第一张照片</text>
      </view>
    </view>

    <!-- 相册视图 -->
    <view class="albums-section" v-if="currentTab === 'albums'">
      <view class="albums-grid">
        <view
          v-for="album in memoryStore.albumList"
          :key="album.id"
          class="album-item"
          @click="openAlbum(album)"
        >
          <view class="album-cover">
            <text class="album-icon">📚</text>
          </view>
          <view class="album-info">
            <text class="album-name">{{ album.name }}</text>
            <text class="album-count">{{ album.photoCount }} 张照片</text>
          </view>
        </view>

        <!-- 新建相册 -->
        <view class="album-item add-album" @click="openCreateAlbumModal">
          <view class="album-cover">
            <text class="album-icon">➕</text>
          </view>
          <view class="album-info">
            <text class="album-name">新建相册</text>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view class="empty-state" v-if="memoryStore.albums.length === 0">
        <text class="empty-icon">📚</text>
        <text class="empty-text">还没有相册</text>
        <text class="empty-hint">创建相册来整理你的照片</text>
      </view>
    </view>

    <!-- 照片详情弹窗 -->
    <view class="photo-detail-modal" v-if="selectedPhoto" @click="closePhotoDetail">
      <view class="photo-detail-content" @click.stop>
        <image
          class="detail-image"
          :src="selectedPhoto.url"
          mode="widthFix"
        />
        <view class="detail-info">
          <text class="detail-title">{{ selectedPhoto.title || '无标题' }}</text>
          <text class="detail-date">{{ formatDate(selectedPhoto.createdAt) }}</text>
          <text class="detail-desc" v-if="selectedPhoto.description">
            {{ selectedPhoto.description }}
          </text>
          <view class="detail-tags" v-if="selectedPhoto.tags?.length">
            <text
              v-for="tag in selectedPhoto.tags"
              :key="tag"
              class="tag"
            >#{{ tag }}</text>
          </view>
        </view>
        <view class="detail-actions">
          <view class="action-btn" @click="editPhotoDetail">
            <text>✏️ 编辑</text>
          </view>
          <view class="action-btn delete" @click="confirmDeletePhoto">
            <text>🗑️ 删除</text>
          </view>
        </view>
        <view class="close-btn" @click="closePhotoDetail">✕</view>
      </view>
    </view>

    <!-- 上传弹窗 -->
    <view class="upload-modal" v-if="showUploadModal" @click="closeUploadModal">
      <view class="upload-content" @click.stop>
        <text class="modal-title">上传照片</text>

        <view class="form-item">
          <text class="form-label">照片标题</text>
          <input
            class="form-input"
            v-model="uploadForm.title"
            placeholder="输入照片标题"
          />
        </view>

        <view class="form-item">
          <text class="form-label">描述</text>
          <textarea
            class="form-textarea"
            v-model="uploadForm.description"
            placeholder="描述这张照片"
          />
        </view>

        <view class="form-item">
          <text class="form-label">相册</text>
          <picker
            :value="albumIndex"
            :range="albumOptions"
            range-key="name"
            @change="onAlbumChange"
          >
            <view class="picker-value">
              {{ uploadForm.albumId ? albumOptions[albumIndex].name : '不添加到相册' }}
            </view>
          </picker>
        </view>

        <view class="form-item">
          <text class="form-label">标签（逗号分隔）</text>
          <input
            class="form-input"
            v-model="uploadForm.tagsInput"
            placeholder="如：旅行,生日,日常"
          />
        </view>

        <view class="form-item">
          <text class="form-label">宝宝</text>
          <picker
            :value="babyIndex"
            :range="babyOptions"
            range-key="name"
            @change="onBabyChange"
          >
            <view class="picker-value">
              {{ uploadForm.babyId ? babyOptions[babyIndex].name : '不关联' }}
            </view>
          </picker>
        </view>

        <view class="form-actions">
          <view class="cancel-btn" @click="closeUploadModal">取消</view>
          <view class="submit-btn" @click="submitUpload">上传</view>
        </view>
      </view>
    </view>

    <!-- 创建相册弹窗 -->
    <view class="create-album-modal" v-if="showCreateAlbumModal" @click="closeCreateAlbumModal">
      <view class="create-album-content" @click.stop>
        <text class="modal-title">新建相册</text>

        <view class="form-item">
          <text class="form-label">相册名称</text>
          <input
            class="form-input"
            v-model="albumForm.name"
            placeholder="输入相册名称"
          />
        </view>

        <view class="form-item">
          <text class="form-label">描述</text>
          <textarea
            class="form-textarea"
            v-model="albumForm.description"
            placeholder="描述这个相册"
          />
        </view>

        <view class="form-item">
          <text class="form-label">模板</text>
          <view class="template-grid">
            <view
              v-for="tmpl in ALBUM_TEMPLATES"
              :key="tmpl.key"
              class="template-item"
              :class="{ active: albumForm.template === tmpl.key }"
              @click="albumForm.template = tmpl.key"
            >
              <text class="template-icon">{{ tmpl.icon }}</text>
              <text class="template-name">{{ tmpl.name }}</text>
            </view>
          </view>
        </view>

        <view class="form-actions">
          <view class="cancel-btn" @click="closeCreateAlbumModal">取消</view>
          <view class="submit-btn" @click="submitCreateAlbum">创建</view>
        </view>
      </view>
    </view>

    <!-- 相册详情弹窗 -->
    <view class="album-detail-modal" v-if="selectedAlbum" @click="closeAlbumDetail">
      <view class="album-detail-content" @click.stop>
        <view class="album-header">
          <text class="album-title">{{ selectedAlbum.name }}</text>
          <text class="album-desc" v-if="selectedAlbum.description">
            {{ selectedAlbum.description }}
          </text>
        </view>

        <view class="album-photos-grid">
          <view
            v-for="photo in albumPhotos"
            :key="photo.id"
            class="photo-thumb"
            @click="viewPhoto(photo)"
          >
            <image :src="photo.url" mode="aspectFill" />
          </view>
        </view>

        <view class="album-actions">
          <view class="action-btn" @click="editAlbumDetail">
            <text>✏️ 编辑</text>
          </view>
          <view class="action-btn delete" @click="confirmDeleteAlbum">
            <text>🗑️ 删除</text>
          </view>
        </view>

        <view class="close-btn" @click="closeAlbumDetail">✕</view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useMemoryStore } from '../../stores/memoryStore.js'
import { useBabyStore } from '../../stores/babyStore.js'
import { ALBUM_TEMPLATES } from '../../services/memoryService.js'

const memoryStore = useMemoryStore()
const babyStore = useBabyStore()

// 当前 Tab
const currentTab = ref('timeline')

// 选中状态
const selectedPhoto = ref(null)
const selectedAlbum = ref(null)
const showUploadModal = ref(false)
const showCreateAlbumModal = ref(false)

// 上传表单
const uploadForm = ref({
  title: '',
  description: '',
  albumId: null,
  tagsInput: '',
  babyId: null,
  url: '' // 实际应用中通过 chooseImage 获取
})

// 相册表单
const albumForm = ref({
  name: '',
  description: '',
  template: 'custom'
})

// Picker 选项
const albumOptions = computed(() => [
  { id: null, name: '不添加到相册' },
  ...memoryStore.albums
])

const babyOptions = computed(() => [
  { id: null, name: '不关联' },
  ...babyStore.babies
])

const albumIndex = computed(() => {
  const idx = albumOptions.value.findIndex(a => a.id === uploadForm.value.albumId)
  return idx >= 0 ? idx : 0
})

const babyIndex = computed(() => {
  const idx = babyOptions.value.findIndex(b => b.id === uploadForm.value.babyId)
  return idx >= 0 ? idx : 0
})

// 相册照片
const albumPhotos = computed(() => {
  if (!selectedAlbum.value) return []
  return memoryStore.getPhotosInAlbum(selectedAlbum.value.id)
})

// ========== 方法 ==========

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Tab 动作
const openUploadModal = () => {
  // 模拟选择图片
  uploadForm.value.url = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect fill="%23ddd" width="200" height="200"/><text x="50%" y="50%" text-anchor="middle" fill="%23999">示例照片</text></svg>'
  showUploadModal.value = true
}

const closeUploadModal = () => {
  showUploadModal.value = false
  uploadForm.value = {
    title: '',
    description: '',
    albumId: null,
    tagsInput: '',
    babyId: null,
    url: ''
  }
}

const onAlbumChange = (e) => {
  const idx = e.detail.value
  uploadForm.value.albumId = albumOptions.value[idx].id
}

const onBabyChange = (e) => {
  const idx = e.detail.value
  uploadForm.value.babyId = babyOptions.value[idx].id
}

const submitUpload = () => {
  const tags = uploadForm.value.tagsInput
    ? uploadForm.value.tagsInput.split(',').map(t => t.trim()).filter(t => t)
    : []

  memoryStore.uploadPhoto({
    url: uploadForm.value.url,
    title: uploadForm.value.title,
    description: uploadForm.value.description,
    albumId: uploadForm.value.albumId,
    tags,
    babyId: uploadForm.value.babyId
  })

  uni.showToast({ title: '上传成功', icon: 'success' })
  closeUploadModal()
  currentTab.value = 'timeline'
}

// 相册动作
const openCreateAlbumModal = () => {
  showCreateAlbumModal.value = true
}

const closeCreateAlbumModal = () => {
  showCreateAlbumModal.value = false
  albumForm.value = { name: '', description: '', template: 'custom' }
}

const submitCreateAlbum = () => {
  if (!albumForm.value.name.trim()) {
    uni.showToast({ title: '请输入相册名称', icon: 'none' })
    return
  }

  memoryStore.createNewAlbum({
    name: albumForm.value.name,
    description: albumForm.value.description,
    template: albumForm.value.template
  })

  uni.showToast({ title: '创建成功', icon: 'success' })
  closeCreateAlbumModal()
}

const openAlbum = (album) => {
  selectedAlbum.value = album
}

const closeAlbumDetail = () => {
  selectedAlbum.value = null
}

const editAlbumDetail = () => {
  // 实现编辑相册逻辑
  uni.showToast({ title: '编辑功能开发中', icon: 'none' })
}

const confirmDeleteAlbum = () => {
  uni.showModal({
    title: '确认删除',
    content: '删除相册不会删除照片，是否继续？',
    success: (res) => {
      if (res.confirm) {
        memoryStore.removeAlbum(selectedAlbum.value.id)
        closeAlbumDetail()
        uni.showToast({ title: '已删除', icon: 'success' })
      }
    }
  })
}

// 照片动作
const viewPhoto = (photo) => {
  selectedPhoto.value = photo
}

const closePhotoDetail = () => {
  selectedPhoto.value = null
}

const editPhotoDetail = () => {
  uni.showToast({ title: '编辑功能开发中', icon: 'none' })
}

const confirmDeletePhoto = () => {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这张照片吗？',
    success: (res) => {
      if (res.confirm) {
        memoryStore.removePhoto(selectedPhoto.value.id)
        closePhotoDetail()
        uni.showToast({ title: '已删除', icon: 'success' })
      }
    }
  })
}

// 初始化
memoryStore.init()
</script>

<style scoped>
.photo-timeline {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 40rpx;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
  color: #667eea;
  font-weight: bold;
}

/* 时间线 */
.year-group {
  margin-bottom: 30rpx;
}

.year-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 30rpx;
  background: rgba(102, 126, 234, 0.1);
}

.year-label {
  font-size: 32rpx;
  font-weight: bold;
  color: #667eea;
}

.photo-count {
  font-size: 24rpx;
  color: #999;
}

.photo-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8rpx;
  padding: 8rpx;
  background: #fff;
}

.photo-item {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
  border-radius: 8rpx;
}

.photo-image {
  width: 100%;
  height: 100%;
  background: #eee;
}

.photo-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0,0,0,0.7));
  padding: 20rpx 10rpx 10rpx;
}

.photo-title {
  font-size: 22rpx;
  color: #fff;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
}

/* 相册 */
.albums-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
  padding: 20rpx;
}

.album-item {
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.08);
}

.album-cover {
  height: 200rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.album-icon {
  font-size: 80rpx;
}

.album-info {
  padding: 20rpx;
}

.album-name {
  font-size: 28rpx;
  font-weight: bold;
  display: block;
}

.album-count {
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
  display: block;
}

.add-album .album-cover {
  background: #f5f5f5;
}

.add-album .album-icon {
  font-size: 60rpx;
  color: #999;
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

/* 照片详情弹窗 */
.photo-detail-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.9);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.photo-detail-content {
  width: 90%;
  max-height: 90vh;
  background: #fff;
  border-radius: 24rpx;
  overflow: hidden;
  position: relative;
}

.detail-image {
  width: 100%;
  background: #eee;
}

.detail-info {
  padding: 30rpx;
}

.detail-title {
  font-size: 32rpx;
  font-weight: bold;
  display: block;
}

.detail-date {
  font-size: 24rpx;
  color: #999;
  margin-top: 10rpx;
  display: block;
}

.detail-desc {
  font-size: 28rpx;
  color: #666;
  margin-top: 20rpx;
  display: block;
  line-height: 1.6;
}

.detail-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 20rpx;
}

.tag {
  font-size: 24rpx;
  color: #667eea;
  background: rgba(102, 126, 234, 0.1);
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
}

.detail-actions {
  display: flex;
  gap: 20rpx;
  padding: 0 30rpx 30rpx;
}

.action-btn {
  flex: 1;
  text-align: center;
  padding: 24rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
  font-size: 28rpx;
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
  background: rgba(0,0,0,0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 32rpx;
}

/* 上传弹窗 */
.upload-modal,
.create-album-modal,
.album-detail-modal {
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

.upload-content,
.create-album-content,
.album-detail-content {
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
  margin-bottom: 40rpx;
}

.form-item {
  margin-bottom: 30rpx;
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
  height: 160rpx;
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

.template-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;
}

.template-item {
  text-align: center;
  padding: 20rpx;
  border: 1rpx solid #ddd;
  border-radius: 12rpx;
}

.template-item.active {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.1);
}

.template-icon {
  font-size: 48rpx;
  display: block;
}

.template-name {
  font-size: 24rpx;
  margin-top: 8rpx;
  display: block;
}

.form-actions {
  display: flex;
  gap: 20rpx;
  margin-top: 40rpx;
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

/* 相册详情 */
.album-header {
  margin-bottom: 30rpx;
}

.album-title {
  font-size: 36rpx;
  font-weight: bold;
  display: block;
}

.album-desc {
  font-size: 28rpx;
  color: #666;
  margin-top: 10rpx;
  display: block;
}

.album-photos-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8rpx;
}

.photo-thumb {
  aspect-ratio: 1;
  overflow: hidden;
  border-radius: 8rpx;
}

.photo-thumb image {
  width: 100%;
  height: 100%;
}

.album-actions {
  display: flex;
  gap: 20rpx;
  margin-top: 30rpx;
}
</style>
