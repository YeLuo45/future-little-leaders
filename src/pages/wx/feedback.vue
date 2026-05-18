<template>
  <view class="feedback-page">
    <!-- 导航栏 -->
    <view class="nav-bar">
      <view class="back-btn" @click="goBack">
        <text class="icon">←</text>
      </view>
      <text class="nav-title">反馈与建议</text>
      <view class="history-btn" @click="showHistory">
        <text class="icon">📋</text>
      </view>
    </view>

    <!-- 反馈类型选择 -->
    <view class="type-section">
      <text class="section-title">反馈类型</text>
      <view class="type-grid">
        <view
          v-for="type in feedbackTypes"
          :key="type.value"
          class="type-item"
          :class="{ active: selectedType === type.value }"
          @click="selectedType = type.value"
        >
          <text class="type-icon">{{ type.icon }}</text>
          <text class="type-name">{{ type.name }}</text>
        </view>
      </view>
    </view>

    <!-- 反馈内容 -->
    <view class="content-section">
      <text class="section-title">反馈内容</text>
      <textarea
        v-model="feedbackContent"
        class="feedback-input"
        placeholder="请详细描述您遇到的问题或建议..."
        :maxlength="500"
      />
      <text class="char-count">{{ feedbackContent.length }}/500</text>
    </view>

    <!-- 联系方式 -->
    <view class="contact-section">
      <text class="section-title">联系方式（选填）</text>
      <input
        v-model="contactInfo"
        class="contact-input"
        placeholder="手机号或邮箱"
        type="text"
      />
    </view>

    <!-- 图片上传 -->
    <view class="image-section">
      <text class="section-title">上传图片（选填，最多3张）</text>
      <view class="image-list">
        <view
          v-for="(img, index) in uploadedImages"
          :key="index"
          class="image-item"
        >
          <image :src="img" mode="aspectFill" class="uploaded-image" />
          <view class="remove-btn" @click="removeImage(index)">×</view>
        </view>
        <view
          v-if="uploadedImages.length < 3"
          class="add-image-btn"
          @click="chooseImage"
        >
          <text class="add-icon">+</text>
          <text class="add-text">添加图片</text>
        </view>
      </view>
    </view>

    <!-- 提交按钮 -->
    <view class="submit-section">
      <button
        class="submit-btn"
        :disabled="!canSubmit || submitting"
        @click="submitFeedback"
      >
        {{ submitting ? '提交中...' : '提交反馈' }}
      </button>
    </view>

    <!-- 历史记录弹窗 -->
    <view v-if="showHistoryModal" class="modal-mask" @click="showHistoryModal = false">
      <view class="modal-content history-modal" @click.stop>
        <text class="modal-title">反馈历史</text>
        <scroll-view class="history-list" scroll-y>
          <view v-if="feedbackHistory.length === 0" class="empty-history">
            <text>暂无反馈记录</text>
          </view>
          <view
            v-for="item in feedbackHistory"
            :key="item.id"
            class="history-item"
          >
            <view class="history-header">
              <text class="history-type">{{ getTypeName(item.type) }}</text>
              <text class="history-status" :class="item.status">
                {{ getStatusName(item.status) }}
              </text>
            </view>
            <text class="history-content">{{ item.content }}</text>
            <text class="history-time">{{ formatTime(item.created_at) }}</text>
          </view>
        </scroll-view>
        <button class="close-btn" @click="showHistoryModal = false">关闭</button>
      </view>
    </view>

    <!-- 提交成功弹窗 -->
    <view v-if="showSuccessModal" class="modal-mask" @click="showSuccessModal = false">
      <view class="modal-content success-modal" @click.stop>
        <text class="success-icon">✅</text>
        <text class="success-title">反馈提交成功</text>
        <text class="success-text">感谢您的反馈，我们会尽快处理！</text>
        <button class="success-btn" @click="showSuccessModal = false">知道了</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import locationService from '@/services/locationService'

const selectedType = ref('bug')
const feedbackContent = ref('')
const contactInfo = ref('')
const uploadedImages = ref([])
const submitting = ref(false)
const showHistoryModal = ref(false)
const showSuccessModal = ref(false)
const feedbackHistory = ref([])

const feedbackTypes = [
  { value: 'bug', name: '功能问题', icon: '🐛' },
  { value: 'suggestion', name: '功能建议', icon: '💡' },
  { value: 'experience', name: '体验反馈', icon: '📝' },
  { value: 'other', name: '其他', icon: '❓' }
]

const canSubmit = computed(() => {
  return selectedType.value && feedbackContent.value.trim().length >= 10
})

const goBack = () => {
  uni.navigateBack()
}

const showHistory = () => {
  loadFeedbackHistory()
  showHistoryModal.value = true
}

const loadFeedbackHistory = () => {
  try {
    const history = uni.getStorageSync('feedback_history') || '[]'
    feedbackHistory.value = JSON.parse(history)
  } catch (err) {
    console.error('[feedback] Failed to load history:', err)
    feedbackHistory.value = []
  }
}

const getTypeName = (type) => {
  const t = feedbackTypes.find(t => t.value === type)
  return t ? t.name : '其他'
}

const getStatusName = (status) => {
  const statusMap = {
    pending: '待处理',
    processing: '处理中',
    resolved: '已解决',
    closed: '已关闭'
  }
  return statusMap[status] || status
}

const formatTime = (isoString) => {
  if (!isoString) return ''
  const date = new Date(isoString)
  return date.toLocaleString('zh-CN')
}

const chooseImage = async () => {
  try {
    const images = await locationService.chooseImage(3 - uploadedImages.value.length)
    if (images && images.length > 0) {
      uploadedImages.value = [...uploadedImages.value, ...images].slice(0, 3)
    }
  } catch (err) {
    console.error('[feedback] Failed to choose image:', err)
  }
}

const removeImage = (index) => {
  uploadedImages.value.splice(index, 1)
}

const submitFeedback = async () => {
  if (!canSubmit.value || submitting.value) return

  try {
    submitting.value = true

    const feedback = {
      id: 'fb_' + Date.now(),
      type: selectedType.value,
      content: feedbackContent.value.trim(),
      contact: contactInfo.value.trim(),
      images: uploadedImages.value,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // 保存到本地历史
    const history = uni.getStorageSync('feedback_history') || '[]'
    let historyList = []
    try {
      historyList = JSON.parse(history)
    } catch {
      historyList = []
    }
    historyList.unshift(feedback)
    uni.setStorageSync('feedback_history', JSON.stringify(historyList.slice(0, 50)))

    // 模拟发送到服务器
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 显示成功弹窗
    showSuccessModal.value = true

    // 重置表单
    selectedType.value = 'bug'
    feedbackContent.value = ''
    contactInfo.value = ''
    uploadedImages.value = []
  } catch (err) {
    console.error('[feedback] Failed to submit:', err)
    uni.showToast({
      title: '提交失败，请重试',
      icon: 'none'
    })
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  await locationService.init()
})
</script>

<style scoped>
.feedback-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120rpx;
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  padding: 0 24rpx;
  background: #fff;
  border-bottom: 1rpx solid #eee;
}

.back-btn,
.history-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon {
  font-size: 36rpx;
}

.nav-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.type-section,
.content-section,
.contact-section,
.image-section {
  background: #fff;
  padding: 24rpx;
  margin-bottom: 16rpx;
}

.section-title {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 20rpx;
  display: block;
}

.type-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16rpx;
}

.type-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx 0;
  background: #f5f5f5;
  border-radius: 12rpx;
  border: 2rpx solid transparent;
}

.type-item.active {
  background: rgba(132, 119, 250, 0.1);
  border-color: #8477fa;
}

.type-icon {
  font-size: 40rpx;
  margin-bottom: 8rpx;
}

.type-name {
  font-size: 22rpx;
  color: #666;
}

.type-item.active .type-name {
  color: #8477fa;
}

.feedback-input {
  width: 100%;
  height: 240rpx;
  padding: 20rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #333;
  box-sizing: border-box;
}

.char-count {
  display: block;
  text-align: right;
  font-size: 22rpx;
  color: #999;
  margin-top: 12rpx;
}

.contact-input {
  width: 100%;
  height: 88rpx;
  padding: 0 20rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #333;
  box-sizing: border-box;
}

.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.image-item {
  position: relative;
  width: 200rpx;
  height: 200rpx;
}

.uploaded-image {
  width: 100%;
  height: 100%;
  border-radius: 12rpx;
}

.remove-btn {
  position: absolute;
  top: -12rpx;
  right: -12rpx;
  width: 40rpx;
  height: 40rpx;
  background: #ff4d4f;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  font-weight: 700;
}

.add-image-btn {
  width: 200rpx;
  height: 200rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2rpx dashed #ddd;
}

.add-icon {
  font-size: 60rpx;
  color: #999;
  line-height: 1;
}

.add-text {
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
}

.submit-section {
  padding: 24rpx;
}

.submit-btn {
  width: 100%;
  height: 96rpx;
  background: #8477fa;
  color: #fff;
  border-radius: 48rpx;
  border: none;
  font-size: 32rpx;
  font-weight: 600;
}

.submit-btn[disabled] {
  background: #ccc;
  color: #fff;
}

.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.modal-content {
  background: #fff;
  border-radius: 24rpx;
  padding: 32rpx;
  width: 600rpx;
}

.history-modal {
  max-height: 800rpx;
  display: flex;
  flex-direction: column;
}

.modal-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  text-align: center;
  margin-bottom: 24rpx;
  display: block;
}

.history-list {
  max-height: 500rpx;
  flex: 1;
}

.empty-history {
  text-align: center;
  padding: 60rpx 0;
  color: #999;
  font-size: 28rpx;
}

.history-item {
  padding: 20rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
  margin-bottom: 16rpx;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}

.history-type {
  font-size: 26rpx;
  color: #8477fa;
  font-weight: 600;
}

.history-status {
  font-size: 22rpx;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  background: #f0f0f0;
  color: #666;
}

.history-status.pending {
  background: #fff7e6;
  color: #fa8c16;
}

.history-status.resolved {
  background: #f6ffed;
  color: #52c41a;
}

.history-content {
  font-size: 26rpx;
  color: #333;
  line-height: 1.5;
  display: block;
  margin-bottom: 12rpx;
}

.history-time {
  font-size: 22rpx;
  color: #999;
}

.close-btn {
  width: 100%;
  height: 80rpx;
  background: #8477fa;
  color: #fff;
  border-radius: 40rpx;
  margin-top: 24rpx;
  border: none;
  font-size: 28rpx;
}

.success-modal {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48rpx 32rpx;
}

.success-icon {
  font-size: 100rpx;
  margin-bottom: 24rpx;
}

.success-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 16rpx;
}

.success-text {
  font-size: 28rpx;
  color: #666;
  text-align: center;
  margin-bottom: 32rpx;
}

.success-btn {
  width: 100%;
  height: 88rpx;
  background: #8477fa;
  color: #fff;
  border-radius: 44rpx;
  border: none;
  font-size: 28rpx;
}
</style>
