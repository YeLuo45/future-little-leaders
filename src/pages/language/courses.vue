<template>
  <view class="courses-page">
    <!-- 头部 -->
    <view class="header-card">
      <view class="header-left">
        <text class="header-icon">📚</text>
        <view class="header-info">
          <text class="title">语言课程</text>
          <text class="subtitle">{{ currentLangInfo?.name || '' }} 学习</text>
        </view>
      </view>
      <view class="header-right">
        <view class="points-badge">
          <text class="points-icon">⭐</text>
          <text class="points-value">{{ totalPoints }}</text>
        </view>
      </view>
    </view>
    
    <!-- 语言选择器 -->
    <view class="language-selector">
      <scroll-view scroll-x class="language-scroll">
        <view class="language-tabs">
          <view
            class="language-tab"
            v-for="lang in supportedLanguages"
            :key="lang.id"
            :class="{ active: currentLanguage === lang.id }"
            @click="switchLanguage(lang.id)"
          >
            <text class="tab-flag">{{ lang.flag }}</text>
            <text class="tab-name">{{ lang.name }}</text>
          </view>
        </view>
      </scroll-view>
    </view>
    
    <!-- 课程章节列表 -->
    <view class="chapters-section">
      <view class="section-title">课程章节</view>
      <view class="chapters-list">
        <view
          class="chapter-card"
          v-for="(chapter, chapterIndex) in chapters"
          :key="chapter.id"
          @click="openChapter(chapter, chapterIndex)"
        >
          <view class="chapter-left">
            <view class="chapter-number">{{ chapterIndex + 1 }}</view>
          </view>
          <view class="chapter-content">
            <text class="chapter-title">{{ chapter.title }}</text>
            <text class="chapter-lessons">{{ chapter.lessons.length }} 个课时</text>
          </view>
          <view class="chapter-status">
            <text class="status-icon" v-if="isChapterCompleted(chapter.id)">✅</text>
            <text class="status-icon" v-else>📖</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 学习进度 -->
    <view class="progress-section">
      <view class="section-title">学习进度</view>
      <view class="progress-card">
        <view class="progress-item">
          <text class="progress-value">{{ currentProgress?.completedLessons?.length || 0 }}</text>
          <text class="progress-label">已学课时</text>
        </view>
        <view class="progress-item">
          <text class="progress-value">{{ currentProgress?.points || 0 }}</text>
          <text class="progress-label">获得积分</text>
        </view>
        <view class="progress-item">
          <text class="progress-value">{{ streakDays }}</text>
          <text class="progress-label">连续天数</text>
        </view>
      </view>
    </view>
    
    <!-- 章节详情弹窗 -->
    <view class="chapter-modal" v-if="showChapterModal">
      <view class="modal-mask" @click="closeChapterModal"></view>
      <view class="modal-content">
        <view class="modal-header">
          <text class="modal-title">{{ selectedChapter?.title }}</text>
          <text class="modal-close" @click="closeChapterModal">✕</text>
        </view>
        <view class="modal-body">
          <view
            class="lesson-item"
            v-for="(lesson, lessonIndex) in selectedChapter?.lessons"
            :key="lessonIndex"
            :class="{ completed: isLessonCompleted(selectedChapter.id, lessonIndex) }"
            @click="startLesson(lessonIndex)"
          >
            <view class="lesson-left">
              <text class="lesson-number">{{ lessonIndex + 1 }}</text>
              <text class="lesson-name">{{ lesson }}</text>
            </view>
            <view class="lesson-status">
              <text class="lesson-check" v-if="isLessonCompleted(selectedChapter.id, lessonIndex)">✓</text>
            </view>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 学习弹窗 -->
    <view class="lesson-modal" v-if="showLessonModal">
      <view class="modal-mask" @click="closeLessonModal"></view>
      <view class="modal-content lesson-content">
        <view class="modal-header">
          <text class="modal-title">{{ currentLessonName }}</text>
          <text class="modal-close" @click="closeLessonModal">✕</text>
        </view>
        <view class="modal-body">
          <view class="lesson-content-box">
            <text class="lesson-tip">📝 认真学习这个课时内容</text>
            <view class="lesson-prompt">
              <text class="prompt-label">课时内容：</text>
              <text class="prompt-text">{{ currentLessonName }}</text>
            </view>
          </view>
        </view>
        <view class="modal-footer">
          <button class="complete-btn" @click="markLessonComplete">完成学习</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useLanguageStore } from '@/stores/languageStore.js'

const languageStore = useLanguageStore()

// 状态
const showChapterModal = ref(false)
const showLessonModal = ref(false)
const selectedChapter = ref(null)
const selectedChapterIndex = ref(0)
const currentLessonName = ref('')
const currentLessonIndex = ref(0)

// 计算属性
const supportedLanguages = computed(() => languageStore.supportedLanguages)
const currentLanguage = computed(() => languageStore.currentLanguage)
const currentLangInfo = computed(() => languageStore.currentLanguageInfo)
const chapters = computed(() => languageStore.currentChapters)
const totalPoints = computed(() => languageStore.totalPoints)
const streakDays = computed(() => languageStore.streakDays)
const currentProgress = computed(() => {
  if (!currentLanguage.value) return null
  return languageStore.getLanguageProgress(currentLanguage.value)
})

// 切换语言
const switchLanguage = (langId) => {
  languageStore.selectLanguage(langId)
}

// 打开章节
const openChapter = (chapter, index) => {
  selectedChapter.value = chapter
  selectedChapterIndex.value = index
  showChapterModal.value = true
}

// 关闭章节弹窗
const closeChapterModal = () => {
  showChapterModal.value = false
}

// 检查章节是否完成
const isChapterCompleted = (chapterId) => {
  if (!currentProgress.value?.completedLessons) return false
  return currentProgress.value.completedLessons.some(l => l.startsWith(chapterId))
}

// 检查课时是否完成
const isLessonCompleted = (chapterId, lessonIndex) => {
  if (!currentProgress.value?.completedLessons) return false
  return currentProgress.value.completedLessons.includes(`${chapterId}_${lessonIndex}`)
}

// 开始课时
const startLesson = (lessonIndex) => {
  currentLessonIndex.value = lessonIndex
  currentLessonName.value = selectedChapter.value.lessons[lessonIndex]
  showLessonModal.value = true
}

// 关闭课时弹窗
const closeLessonModal = () => {
  showLessonModal.value = false
}

// 完成课时学习
const markLessonComplete = () => {
  if (selectedChapter.value && currentLessonIndex.value >= 0) {
    languageStore.completeLesson(selectedChapter.value.id, currentLessonIndex.value)
    uni.showToast({ title: '学习成功 +10积分', icon: 'success' })
    closeLessonModal()
    closeChapterModal()
  }
}

onMounted(() => {
  languageStore.init()
})
</script>

<style scoped>
.courses-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20rpx;
}

.header-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 24rpx;
  padding: 40rpx 30rpx;
  color: #fff;
  margin-bottom: 20rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
}

.header-icon {
  font-size: 64rpx;
  margin-right: 20rpx;
}

.header-info {
  display: flex;
  flex-direction: column;
}

.title {
  font-size: 40rpx;
  font-weight: bold;
}

.subtitle {
  font-size: 26rpx;
  opacity: 0.9;
  margin-top: 4rpx;
}

.points-badge {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.2);
  padding: 12rpx 24rpx;
  border-radius: 30rpx;
}

.points-icon {
  font-size: 32rpx;
  margin-right: 8rpx;
}

.points-value {
  font-size: 32rpx;
  font-weight: bold;
}

.language-selector {
  background: #fff;
  border-radius: 16rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
}

.language-scroll {
  width: 100%;
}

.language-tabs {
  display: flex;
  gap: 20rpx;
}

.language-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx 30rpx;
  border-radius: 16rpx;
  background: #f5f5f5;
  transition: all 0.3s;
}

.language-tab.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.tab-flag {
  font-size: 48rpx;
  margin-bottom: 8rpx;
}

.tab-name {
  font-size: 24rpx;
  font-weight: 500;
}

.chapters-section,
.progress-section {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.chapters-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.chapter-card {
  display: flex;
  align-items: center;
  padding: 24rpx;
  background: #f8f8f8;
  border-radius: 16rpx;
  transition: all 0.3s;
}

.chapter-card:active {
  background: #eee;
}

.chapter-left {
  margin-right: 20rpx;
}

.chapter-number {
  width: 60rpx;
  height: 60rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 28rpx;
}

.chapter-content {
  flex: 1;
}

.chapter-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.chapter-lessons {
  font-size: 24rpx;
  color: #999;
}

.status-icon {
  font-size: 40rpx;
}

.progress-card {
  display: flex;
  justify-content: space-around;
}

.progress-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.progress-value {
  font-size: 48rpx;
  font-weight: bold;
  color: #667eea;
}

.progress-label {
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
}

/* 弹窗样式 */
.chapter-modal,
.lesson-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
}

.modal-content {
  position: relative;
  width: 90%;
  max-height: 80vh;
  background: #fff;
  border-radius: 24rpx;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #eee;
}

.modal-title {
  font-size: 34rpx;
  font-weight: bold;
  color: #333;
}

.modal-close {
  font-size: 40rpx;
  color: #999;
  padding: 10rpx;
}

.modal-body {
  padding: 30rpx;
  max-height: 60vh;
  overflow-y: auto;
}

.lesson-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  background: #f8f8f8;
  border-radius: 12rpx;
  margin-bottom: 16rpx;
  transition: all 0.3s;
}

.lesson-item:active {
  background: #eee;
}

.lesson-item.completed {
  background: #e8f5e9;
}

.lesson-left {
  display: flex;
  align-items: center;
}

.lesson-number {
  width: 48rpx;
  height: 48rpx;
  background: #667eea;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  margin-right: 16rpx;
}

.lesson-item.completed .lesson-number {
  background: #4caf50;
}

.lesson-name {
  font-size: 28rpx;
  color: #333;
}

.lesson-check {
  font-size: 36rpx;
  color: #4caf50;
}

.lesson-content {
  max-width: 90%;
}

.lesson-content-box {
  padding: 30rpx;
  background: #f8f8f8;
  border-radius: 16rpx;
}

.lesson-tip {
  font-size: 28rpx;
  color: #667eea;
  display: block;
  margin-bottom: 20rpx;
}

.lesson-prompt {
  margin-top: 20rpx;
}

.prompt-label {
  font-size: 26rpx;
  color: #999;
}

.prompt-text {
  font-size: 32rpx;
  color: #333;
  font-weight: bold;
  display: block;
  margin-top: 10rpx;
}

.modal-footer {
  padding: 30rpx;
  border-top: 1rpx solid #eee;
}

.complete-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-radius: 44rpx;
  font-size: 32rpx;
  font-weight: bold;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
