<!-- 专家问答页 -->
<template>
  <view class="qa-page">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <view class="nav-left" @tap="goBack">
        <text class="icon">←</text>
      </view>
      <text class="nav-title">专家问答</text>
      <view class="nav-right" @tap="showAskForm = true">
        <text class="ask-btn">提问</text>
      </view>
    </view>

    <!-- 问题分类 -->
    <view class="filter-bar">
      <scroll-view scroll-x class="filter-scroll">
        <view class="filter-group">
          <text
            class="filter-chip"
            :class="{ active: selectedCategory === '全部' }"
            @tap="selectedCategory = '全部'"
          >全部</text>
          <text
            v-for="cat in categories"
            :key="cat"
            class="filter-chip"
            :class="{ active: selectedCategory === cat }"
            @tap="selectedCategory = cat"
          >{{ cat }}</text>
        </view>
      </scroll-view>
    </view>

    <!-- 问答列表 -->
    <view class="qa-list">
      <view
        v-for="(question, index) in filteredQuestions"
        :key="question.id"
        class="qa-card"
        :style="{ animationDelay: `${index * 80}ms` }"
        @click="viewQuestion(question)"
      >
        <view class="qa-header">
          <view class="qa-category-tag" :class="question.category">
            {{ question.category }}
          </view>
          <text class="qa-status" :class="question.status">
            {{ question.status === 'answered' ? '已回复' : '待回复' }}
          </text>
        </view>
        <text class="qa-title">{{ question.title }}</text>
        <text class="qa-content-preview">{{ question.content.substring(0, 60) }}...</text>
        <view class="qa-footer">
          <view class="qa-expert" v-if="question.expert">
            <text>👤 {{ question.expert }}</text>
          </view>
          <text class="qa-date">{{ question.answerDate || question.submitDate }}</text>
        </view>

        <!-- 回答预览 -->
        <view class="answer-preview" v-if="question.status === 'answered' && question.answer">
          <text class="answer-label">专家回复</text>
          <text class="answer-text">{{ question.answer.substring(0, 80) }}...</text>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view class="empty-state" v-if="filteredQuestions.length === 0 && !isLoading">
      <text class="empty-icon">💬</text>
      <text class="empty-text">暂无相关问答</text>
      <button class="ask-now-btn" @tap="showAskForm = true">立即提问</button>
    </view>

    <!-- 提问表单弹窗 -->
    <view class="ask-modal" v-if="showAskForm" @tap="showAskForm = false">
      <view class="ask-content" @tap.stop>
        <view class="ask-header">
          <text class="ask-title">提问专家</text>
          <view class="ask-close" @tap="showAskForm = false">
            <text>✕</text>
          </view>
        </view>

        <view class="ask-form">
          <!-- 问题分类 -->
          <view class="form-item">
            <text class="form-label">问题分类</text>
            <view class="category-select">
              <text
                v-for="cat in categories"
                :key="cat"
                class="category-chip"
                :class="{ active: askForm.category === cat }"
                @tap="askForm.category = cat"
              >{{ cat }}</text>
            </view>
          </view>

          <!-- 问题标题 -->
          <view class="form-item">
            <text class="form-label">问题标题</text>
            <input
              class="form-input"
              v-model="askForm.title"
              placeholder="请简要描述您的问题（不超过50字）"
              maxlength="50"
            />
          </view>

          <!-- 问题详情 -->
          <view class="form-item">
            <text class="form-label">问题详情</text>
            <textarea
              class="form-textarea"
              v-model="askForm.content"
              placeholder="请详细描述您的问题..."
              maxlength="500"
            />
          </view>

          <!-- 图片上传 -->
          <view class="form-item">
            <text class="form-label">上传图片（可选）</text>
            <view class="image-upload">
              <view class="upload-btn" @tap="chooseImage">
                <text class="upload-icon">+</text>
              </view>
              <view class="uploaded-images" v-if="askForm.images.length">
                <view
                  v-for="(img, idx) in askForm.images"
                  :key="idx"
                  class="uploaded-item"
                >
                  <image :src="img" mode="aspectFill" class="uploaded-img" />
                  <view class="remove-btn" @tap="removeImage(idx)">✕</view>
                </view>
              </view>
            </view>
          </view>

          <!-- 提交按钮 -->
          <view class="form-actions">
            <button
              class="submit-btn"
              :disabled="!canSubmit"
              @tap="submitQuestion"
            >
              {{ store.isSubmitting ? '提交中...' : '提交问题' }}
            </button>
          </view>
        </view>
      </view>
    </view>

    <!-- 问题详情弹窗 -->
    <view class="detail-modal" v-if="currentQuestion" @tap="currentQuestion = null">
      <view class="detail-content" @tap.stop>
        <view class="detail-close" @tap="currentQuestion = null">
          <text>✕</text>
        </view>

        <view class="detail-header">
          <view class="qa-category-tag" :class="currentQuestion.category">
            {{ currentQuestion.category }}
          </view>
          <text class="detail-title">{{ currentQuestion.title }}</text>
        </view>

        <view class="detail-body">
          <text class="question-text">{{ currentQuestion.content }}</text>

          <view class="images-row" v-if="currentQuestion.images?.length">
            <image
              v-for="(img, idx) in currentQuestion.images"
              :key="idx"
              :src="img"
              mode="aspectFill"
              class="question-image"
              @tap="previewImage(img)"
            />
          </view>
        </view>

        <!-- 专家回答 -->
        <view class="expert-answer" v-if="currentQuestion.status === 'answered' && currentQuestion.answer">
          <view class="answer-header">
            <text class="answer-label">专家回复</text>
            <view class="expert-info" v-if="currentQuestion.expert">
              <text>👤 {{ currentQuestion.expert }}</text>
            </view>
          </view>
          <text class="answer-text">{{ currentQuestion.answer }}</text>
        </view>

        <!-- 待回复状态 -->
        <view class="pending-answer" v-else>
          <text class="pending-icon">⏳</text>
          <text class="pending-text">专家正在准备回复中，请稍候...</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { useAcademyStore } from '@/stores/academyStore.js'

const store = useAcademyStore()
const selectedCategory = ref('全部')
const showAskForm = ref(false)
const currentQuestion = ref(null)

const categories = ['发育', '营养', '教育', '心理']

const askForm = reactive({
  category: '发育',
  title: '',
  content: '',
  images: []
})

const isLoading = computed(() => store.isSubmitting)

const filteredQuestions = computed(() => {
  if (selectedCategory.value === '全部') {
    return store.questions
  }
  return store.questions.filter(q => q.category === selectedCategory.value)
})

const canSubmit = computed(() => {
  return askForm.title.trim().length >= 5 &&
         askForm.content.trim().length >= 10 &&
         askForm.category
})

onMounted(async () => {
  if (store.questions.length === 0) {
    await store.loadQuestions()
  }
})

function goBack() {
  uni.navigateBack()
}

function viewQuestion(question) {
  currentQuestion.value = question
}

function chooseImage() {
  if (askForm.images.length >= 3) {
    uni.showToast({ title: '最多上传3张图片', icon: 'none' })
    return
  }
  // 模拟选择图片
  uni.chooseImage({
    count: 3 - askForm.images.length,
    success: (res) => {
      askForm.images.push(...res.tempFilePaths)
    }
  })
}

function removeImage(index) {
  askForm.images.splice(index, 1)
}

function previewImage(url) {
  uni.previewImage({ urls: [url] })
}

async function submitQuestion() {
  if (!canSubmit.value) return

  const success = await store.submitQuestion({
    title: askForm.title.trim(),
    content: askForm.content.trim(),
    category: askForm.category,
    images: askForm.images
  })

  if (success) {
    uni.showToast({ title: '问题提交成功！', icon: 'success' })
    showAskForm.value = false
    // 重置表单
    askForm.title = ''
    askForm.content = ''
    askForm.images = []
    askForm.category = '发育'
  } else {
    uni.showToast({ title: '提交失败，请重试', icon: 'none' })
  }
}
</script>

<style scoped>
.qa-page {
  min-height: 100vh;
  background: #F8FAFC;
  padding-bottom: 40rpx;
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  padding: 0 32rpx;
  background: #FFFFFF;
  border-bottom: 1rpx solid #E5E7EB;
}

.nav-left, .nav-right {
  min-width: 80rpx;
}

.icon {
  font-size: 40rpx;
  color: #1F2937;
}

.nav-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #1F2937;
}

.ask-btn {
  font-size: 28rpx;
  color: #10B981;
  font-weight: 500;
}

.filter-bar {
  padding: 20rpx 0;
  background: #FFFFFF;
  border-bottom: 1rpx solid #F3F4F6;
}

.filter-scroll {
  padding: 0 32rpx;
  white-space: nowrap;
}

.filter-group {
  display: inline-flex;
  gap: 16rpx;
}

.filter-chip {
  display: inline-block;
  padding: 12rpx 28rpx;
  border-radius: 32rpx;
  font-size: 26rpx;
  color: #6B7280;
  background: #F3F4F6;
  white-space: nowrap;
}

.filter-chip.active {
  background: #10B981;
  color: #FFFFFF;
  font-weight: 500;
}

.qa-list {
  padding: 24rpx 32rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.qa-card {
  background: #FFFFFF;
  border-radius: 24rpx;
  padding: 28rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
}

.qa-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.qa-category-tag {
  display: inline-block;
  padding: 6rpx 16rpx;
  border-radius: 8rpx;
  font-size: 22rpx;
  font-weight: 500;
}

.qa-category-tag.发育 {
  background: #FEF3C7;
  color: #D97706;
}

.qa-category-tag.心理 {
  background: #DBEAFE;
  color: #2563EB;
}

.qa-category-tag.教育 {
  background: #D1FAE5;
  color: #059669;
}

.qa-category-tag.营养 {
  background: #FEE2E2;
  color: #DC2626;
}

.qa-status {
  font-size: 22rpx;
  font-weight: 500;
}

.qa-status.answered {
  color: #10B981;
}

.qa-status.pending {
  color: #F59E0B;
}

.qa-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #1F2937;
  line-height: 1.4;
  display: block;
  margin-bottom: 12rpx;
}

.qa-content-preview {
  font-size: 26rpx;
  color: #6B7280;
  line-height: 1.5;
  display: block;
  margin-bottom: 16rpx;
}

.qa-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.qa-expert {
  font-size: 22rpx;
  color: #6B7280;
}

.qa-date {
  font-size: 22rpx;
  color: #9CA3AF;
}

.answer-preview {
  margin-top: 20rpx;
  padding: 20rpx;
  background: #F0FDF4;
  border-radius: 16rpx;
  border-left: 4rpx solid #10B981;
}

.answer-label {
  font-size: 22rpx;
  color: #10B981;
  font-weight: 500;
  display: block;
  margin-bottom: 8rpx;
}

.answer-text {
  font-size: 26rpx;
  color: #4B5563;
  line-height: 1.5;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 0;
}

.empty-icon {
  font-size: 96rpx;
  margin-bottom: 24rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #6B7280;
  margin-bottom: 32rpx;
}

.ask-now-btn {
  padding: 20rpx 48rpx;
  background: #10B981;
  color: #FFFFFF;
  border-radius: 36rpx;
  font-size: 28rpx;
  font-weight: 500;
  border: none;
}

/* 提问弹窗 */
.ask-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: flex;
  align-items: flex-end;
}

.ask-content {
  width: 100%;
  max-height: 90vh;
  background: #FFFFFF;
  border-radius: 32rpx 32rpx 0 0;
  padding: 32rpx;
}

.ask-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32rpx;
}

.ask-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #1F2937;
}

.ask-close {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background: #F3F4F6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  color: #6B7280;
}

.ask-form {
  display: flex;
  flex-direction: column;
  gap: 28rpx;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.form-label {
  font-size: 28rpx;
  font-weight: 500;
  color: #374151;
}

.category-select {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.category-chip {
  padding: 12rpx 24rpx;
  border-radius: 32rpx;
  font-size: 26rpx;
  color: #6B7280;
  background: #F3F4F6;
}

.category-chip.active {
  background: #10B981;
  color: #FFFFFF;
}

.form-input {
  height: 88rpx;
  padding: 0 24rpx;
  background: #F9FAFB;
  border-radius: 16rpx;
  font-size: 28rpx;
  color: #1F2937;
}

.form-textarea {
  min-height: 200rpx;
  padding: 24rpx;
  background: #F9FAFB;
  border-radius: 16rpx;
  font-size: 28rpx;
  color: #1F2937;
  line-height: 1.6;
}

.image-upload {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.upload-btn {
  width: 160rpx;
  height: 160rpx;
  border-radius: 16rpx;
  border: 2rpx dashed #D1D5DB;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-icon {
  font-size: 48rpx;
  color: #9CA3AF;
}

.uploaded-images {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.uploaded-item {
  position: relative;
}

.uploaded-img {
  width: 160rpx;
  height: 160rpx;
  border-radius: 16rpx;
}

.remove-btn {
  position: absolute;
  top: -12rpx;
  right: -12rpx;
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background: #EF4444;
  color: #FFFFFF;
  font-size: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.form-actions {
  margin-top: 16rpx;
}

.submit-btn {
  width: 100%;
  height: 88rpx;
  border-radius: 44rpx;
  background: #10B981;
  color: #FFFFFF;
  font-size: 32rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
}

.submit-btn[disabled] {
  background: #D1D5DB;
  color: #9CA3AF;
}

/* 问题详情弹窗 */
.detail-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: flex;
  align-items: flex-end;
}

.detail-content {
  width: 100%;
  max-height: 85vh;
  background: #FFFFFF;
  border-radius: 32rpx 32rpx 0 0;
  padding: 32rpx;
  display: flex;
  flex-direction: column;
}

.detail-close {
  position: absolute;
  top: 32rpx;
  right: 32rpx;
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background: #F3F4F6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  color: #6B7280;
}

.detail-header {
  margin-bottom: 24rpx;
}

.detail-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #1F2937;
  line-height: 1.4;
  display: block;
  margin-top: 16rpx;
}

.detail-body {
  flex: 1;
  overflow-y: auto;
}

.question-text {
  font-size: 28rpx;
  color: #4B5563;
  line-height: 1.8;
  display: block;
  margin-bottom: 20rpx;
}

.images-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 16rpx;
}

.question-image {
  width: 200rpx;
  height: 200rpx;
  border-radius: 12rpx;
}

.expert-answer {
  margin-top: 24rpx;
  padding: 24rpx;
  background: #F0FDF4;
  border-radius: 20rpx;
  border-left: 4rpx solid #10B981;
}

.answer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12rpx;
}

.expert-info {
  font-size: 22rpx;
  color: #10B981;
}

.pending-answer {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40rpx;
  margin-top: 24rpx;
}

.pending-icon {
  font-size: 64rpx;
  margin-bottom: 16rpx;
}

.pending-text {
  font-size: 26rpx;
  color: #6B7280;
  text-align: center;
}
</style>
