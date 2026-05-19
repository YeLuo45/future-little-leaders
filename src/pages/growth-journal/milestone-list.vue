<template>
  <view class="milestone-list-container">
    <!-- 顶部导航 -->
    <view class="header">
      <view class="header-left" @click="goBack">
        <text class="icon">←</text>
      </view>
      <view class="header-title">
        <text>里程碑</text>
      </view>
      <view class="header-right" @click="createMilestone">
        <text class="icon">+</text>
      </view>
    </view>

    <!-- 类型筛选 -->
    <view class="filter-tabs">
      <view 
        class="filter-tab" 
        :class="{ active: selectedType === 'all' }"
        @click="selectedType = 'all'"
      >
        全部
      </view>
      <view 
        class="filter-tab" 
        v-for="(info, key) in MILESTONE_INFO" 
        :key="key"
        :class="{ active: selectedType === key }"
        :style="selectedType === key ? { borderColor: info.color, color: info.color } : {}"
        @click="selectedType = key"
      >
        {{ info.icon }} {{ info.label }}
      </view>
    </view>

    <!-- 里程碑列表 -->
    <view class="milestone-list" v-if="filteredMilestones.length > 0">
      <view 
        class="milestone-card" 
        v-for="item in filteredMilestones" 
        :key="item.id"
        @click="goToDetail(item.id)"
      >
        <view class="milestone-header">
          <view class="milestone-type" :style="{ background: getTypeInfo(item.type).color }">
            {{ getTypeInfo(item.type).icon }} {{ getTypeInfo(item.type).label }}
          </view>
          <text class="milestone-date">{{ item.date }}</text>
        </view>
        <view class="milestone-title">{{ item.title }}</view>
        <view class="milestone-desc" v-if="item.description">{{ item.description }}</view>
        <view class="milestone-photos" v-if="item.photos && item.photos.length > 0">
          <image 
            class="photo-thumb" 
            v-for="(photo, idx) in item.photos.slice(0, 3)" 
            :key="idx"
            :src="photo"
            mode="aspectFill"
          />
          <view class="photo-more" v-if="item.photos.length > 3">
            +{{ item.photos.length - 3 }}
          </view>
        </view>
        <view class="milestone-footer">
          <view class="milestone-tags" v-if="item.tags && item.tags.length > 0">
            <text class="tag" v-for="tag in item.tags" :key="tag">#{{ tag }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view class="empty-state" v-else>
      <text class="empty-icon">🏆</text>
      <text class="empty-text">暂无里程碑</text>
      <text class="empty-hint">点击右上角 + 记录第一个里程碑</text>
    </view>

    <!-- 创建/编辑弹窗 -->
    <view class="dialog-overlay" v-if="showDialog" @click="closeDialog">
      <view class="dialog" @click.stop>
        <view class="dialog-header">
          <text class="dialog-title">{{ isEditing ? '编辑' : '新建' }}里程碑</text>
          <text class="dialog-close" @click="closeDialog">×</text>
        </view>
        <view class="dialog-body">
          <!-- 标题 -->
          <view class="form-item">
            <text class="form-label">里程碑标题</text>
            <input 
              class="form-input" 
              v-model="editForm.title" 
              placeholder="例如：学会骑自行车"
            />
          </view>

          <!-- 类型 -->
          <view class="form-item">
            <text class="form-label">类型</text>
            <view class="type-grid">
              <view 
                class="type-item" 
                v-for="(info, key) in MILESTONE_INFO" 
                :key="key"
                :class="{ selected: editForm.type === key }"
                :style="editForm.type === key ? { background: info.color, color: '#fff' } : {}"
                @click="editForm.type = key"
              >
                {{ info.icon }} {{ info.label }}
              </view>
            </view>
          </view>

          <!-- 日期 -->
          <view class="form-item">
            <text class="form-label">日期</text>
            <input 
              class="form-input" 
              v-model="editForm.date" 
              placeholder="YYYY-MM-DD"
            />
          </view>

          <!-- 描述 -->
          <view class="form-item">
            <text class="form-label">描述</text>
            <textarea 
              class="form-textarea" 
              v-model="editForm.description" 
              placeholder="详细描述这个里程碑..."
              :rows="3"
            />
          </view>

          <!-- 照片 -->
          <view class="form-item">
            <text class="form-label">照片</text>
            <view class="photo-upload-list">
              <view 
                class="photo-item" 
                v-for="(photo, idx) in editForm.photos" 
                :key="idx"
              >
                <image :src="photo" mode="aspectFill" />
                <text class="photo-remove" @click="removePhoto(idx)">×</text>
              </view>
              <view class="photo-add" @click="choosePhoto">
                <text>+</text>
              </view>
            </view>
          </view>

          <!-- 标签 -->
          <view class="form-item">
            <text class="form-label">标签</text>
            <input 
              class="form-input" 
              v-model="editForm.tagInput" 
              placeholder="输入标签后回车添加"
              @confirm="addTag"
            />
            <view class="tag-list" v-if="editForm.tags.length > 0">
              <view 
                class="tag-item" 
                v-for="(tag, idx) in editForm.tags" 
                :key="idx"
              >
                #{{ tag }}
                <text class="tag-delete" @click="removeTag(idx)">×</text>
              </view>
            </view>
          </view>

          <view class="dialog-footer">
            <button class="btn-delete" v-if="isEditing" @click="deleteMilestone">删除</button>
            <view class="btn-group">
              <button class="btn-cancel" @click="closeDialog">取消</button>
              <button class="btn-save" @click="saveMilestone">保存</button>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useGrowthJournalStore } from '@/stores/growthJournalStore.js'
import growthJournalService, { MILESTONE_INFO } from '@/services/growthJournalService.js'

const growthJournalStore = useGrowthJournalStore()

// 类型筛选
const selectedType = ref('all')

// 弹窗状态
const showDialog = ref(false)
const isEditing = ref(false)
const editingId = ref(null)

// 编辑表单
const editForm = reactive({
  title: '',
  type: 'achievement',
  date: new Date().toISOString().split('T')[0],
  description: '',
  photos: [],
  tags: [],
  tagInput: ''
})

// 初始化
onMounted(() => {
  growthJournalStore.init()
})

// 筛选后的里程碑
const filteredMilestones = computed(() => {
  if (selectedType.value === 'all') {
    return growthJournalStore.milestonesTimeline
  }
  return growthJournalStore.getMilestonesByType(selectedType.value)
})

// 获取类型信息
const getTypeInfo = (type) => {
  return MILESTONE_INFO[type] || {}
}

// 返回
const goBack = () => {
  uni.navigateBack()
}

// 跳转到详情
const goToDetail = (id) => {
  const milestone = growthJournalStore.getMilestoneById(id)
  if (milestone) {
    editingId.value = id
    isEditing.value = true
    editForm.title = milestone.title
    editForm.type = milestone.type
    editForm.date = milestone.date
    editForm.description = milestone.description || ''
    editForm.photos = [...(milestone.photos || [])]
    editForm.tags = [...(milestone.tags || [])]
    showDialog.value = true
  }
}

// 创建里程碑
const createMilestone = () => {
  isEditing.value = false
  editingId.value = null
  editForm.title = ''
  editForm.type = 'achievement'
  editForm.date = new Date().toISOString().split('T')[0]
  editForm.description = ''
  editForm.photos = []
  editForm.tags = []
  editForm.tagInput = ''
  showDialog.value = true
}

// 关闭弹窗
const closeDialog = () => {
  showDialog.value = false
}

// 选择照片
const choosePhoto = () => {
  uni.chooseImage({
    count: 9 - editForm.photos.length,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      editForm.photos.push(...res.tempFilePaths)
    }
  })
}

// 移除照片
const removePhoto = (index) => {
  editForm.photos.splice(index, 1)
}

// 添加标签
const addTag = () => {
  const tag = editForm.tagInput.trim()
  if (tag && !editForm.tags.includes(tag)) {
    editForm.tags.push(tag)
  }
  editForm.tagInput = ''
}

// 移除标签
const removeTag = (index) => {
  editForm.tags.splice(index, 1)
}

// 保存里程碑
const saveMilestone = () => {
  if (!editForm.title.trim()) {
    uni.showToast({ title: '请输入标题', icon: 'none' })
    return
  }

  const data = {
    title: editForm.title.trim(),
    type: editForm.type,
    date: editForm.date,
    description: editForm.description.trim(),
    photos: editForm.photos,
    tags: editForm.tags
  }

  if (isEditing.value && editingId.value) {
    growthJournalStore.updateMilestone(editingId.value, data)
  } else {
    growthJournalStore.createMilestone(data)
  }

  closeDialog()
  uni.showToast({ title: '保存成功', icon: 'success' })
}

// 删除里程碑
const deleteMilestone = () => {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这个里程碑吗？',
    success: (res) => {
      if (res.confirm) {
        growthJournalStore.deleteMilestone(editingId.value)
        closeDialog()
        uni.showToast({ title: '已删除', icon: 'success' })
      }
    }
  })
}
</script>

<style scoped>
.milestone-list-container {
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

.filter-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px 15px;
  background: #fff;
}

.filter-tab {
  padding: 6px 12px;
  background: #f0f0f0;
  border-radius: 15px;
  font-size: 12px;
  color: #666;
}

.filter-tab.active {
  background: #667eea;
  color: #fff;
}

.milestone-list {
  padding: 15px;
}

.milestone-card {
  background: #fff;
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.milestone-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.milestone-type {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  color: #fff;
}

.milestone-date {
  font-size: 12px;
  color: #999;
}

.milestone-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 5px;
}

.milestone-desc {
  font-size: 13px;
  color: #666;
  line-height: 1.5;
  margin-bottom: 10px;
}

.milestone-photos {
  display: flex;
  gap: 6px;
  margin-bottom: 10px;
}

.photo-thumb {
  width: 60px;
  height: 60px;
  border-radius: 6px;
}

.photo-more {
  width: 60px;
  height: 60px;
  border-radius: 6px;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 14px;
}

.milestone-footer {
  border-top: 1px solid #f0f0f0;
  padding-top: 10px;
}

.milestone-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag {
  font-size: 11px;
  color: #667eea;
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
  max-height: 90vh;
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
  max-height: calc(90vh - 60px);
  overflow-y: auto;
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

.type-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.type-item {
  padding: 10px 8px;
  background: #f5f5f5;
  border-radius: 8px;
  font-size: 12px;
  text-align: center;
  color: #666;
}

.photo-upload-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.photo-item {
  position: relative;
  width: 70px;
  height: 70px;
}

.photo-item image {
  width: 100%;
  height: 100%;
  border-radius: 8px;
}

.photo-remove {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 20px;
  height: 20px;
  background: #ff4d4f;
  color: #fff;
  border-radius: 50%;
  font-size: 14px;
  text-align: center;
  line-height: 20px;
}

.photo-add {
  width: 70px;
  height: 70px;
  background: #f0f0f0;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  color: #999;
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
  gap: 10px;
  margin-top: 20px;
}

.btn-delete {
  background: #ff4d4f;
  color: #fff;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
}

.btn-group {
  flex: 1;
  display: flex;
  gap: 10px;
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
</style>
