<!-- 视频课程页 -->
<template>
  <view class="course-page">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <view class="nav-left" @tap="goBack">
        <text class="icon">←</text>
      </view>
      <text class="nav-title">视频课程</text>
      <view class="nav-right"></view>
    </view>

    <!-- 课程分类 -->
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

    <!-- 课程列表 -->
    <view class="course-list" v-if="!store.isLoadingCourses">
      <CourseCard
        v-for="(course, index) in filteredCourses"
        :key="course.id"
        :course="course"
        :style="{ animationDelay: `${index * 80}ms` }"
        @click="viewCourse(course)"
      />
    </view>

    <!-- 加载状态 -->
    <view class="loading-state" v-else>
      <view class="loading-spinner"></view>
      <text class="loading-text">加载中...</text>
    </view>

    <!-- 课程详情弹窗 -->
    <view class="course-detail-modal" v-if="currentCourse" @tap="closeDetail">
      <view class="detail-content" @tap.stop>
        <!-- 关闭按钮 -->
        <view class="detail-close" @tap="closeDetail">
          <text>✕</text>
        </view>

        <!-- 课程封面 -->
        <view class="detail-cover">
          <view class="cover-placeholder">
            <text class="cover-icon">🎬</text>
            <text class="cover-duration">{{ formatDuration(currentCourse.duration) }}</text>
          </view>
          <view class="cover-progress" v-if="currentCourse.progress > 0">
            <view class="progress-bar" :style="{ width: currentCourse.progress + '%' }"></view>
          </view>
        </view>

        <!-- 课程信息 -->
        <view class="detail-info">
          <text class="detail-title">{{ currentCourse.title }}</text>
          <view class="detail-meta">
            <ExpertBadge :name="currentCourse.expert" :title="currentCourse.expertTitle" />
          </view>
          <text class="detail-desc">{{ currentCourse.description }}</text>

          <!-- 课程统计 -->
          <view class="detail-stats">
            <view class="stat-item">
              <text class="stat-value">{{ currentCourse.lessons }}</text>
              <text class="stat-label">总课时</text>
            </view>
            <view class="stat-item">
              <text class="stat-value">{{ currentCourse.completedLessons }}</text>
              <text class="stat-label">已完成</text>
            </view>
            <view class="stat-item">
              <text class="stat-value">{{ currentCourse.progress }}%</text>
              <text class="stat-label">进度</text>
            </view>
          </view>

          <!-- 操作按钮 -->
          <view class="detail-actions">
            <button class="action-btn primary" @tap="startLearning">
              {{ currentCourse.progress > 0 ? '继续学习' : '开始学习' }}
            </button>
          </view>
        </view>
      </view>
    </view>

    <!-- 视频播放器弹窗 -->
    <view class="video-modal" v-if="showVideo" @tap="closeVideo">
      <view class="video-content" @tap.stop>
        <view class="video-close" @tap="closeVideo">
          <text>✕</text>
        </view>
        <view class="video-player">
          <iframe
            v-if="videoUrl"
            :src="videoUrl"
            frameborder="0"
            allowfullscreen
            class="video-iframe"
          ></iframe>
          <view class="video-placeholder" v-else>
            <text class="video-icon">🎬</text>
            <text class="video-text">视频播放器</text>
            <text class="video-hint">（CDN视频播放器演示区域）</text>
          </view>
        </view>
        <!-- 模拟播放控制 -->
        <view class="video-controls">
          <slider
            class="video-progress"
            :value="playProgress"
            @change="onProgressChange"
            activeColor="#2563EB"
            block-size="12"
          />
          <view class="controls-row">
            <text class="control-btn" @tap="togglePlay">
              {{ isPlaying ? '⏸' : '▶' }}
            </text>
            <text class="control-time">{{ formatTime(currentTime) }} / {{ formatTime(totalTime) }}</text>
            <text class="control-btn" @tap="markComplete">✓ 完成</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAcademyStore } from '@/stores/academyStore.js'
import CourseCard from '@/components/academy/CourseCard.vue'
import ExpertBadge from '@/components/academy/ExpertBadge.vue'

const store = useAcademyStore()
const selectedCategory = ref('全部')
const currentCourse = ref(null)
const showVideo = ref(false)
const playProgress = ref(0)
const isPlaying = ref(false)
const currentTime = ref(0)
const totalTime = ref(0)
const videoUrl = ref('')

const categories = ['心理学', '教育方法', '沟通技巧', '能力培养', '学科启蒙', '健康管理']

const filteredCourses = computed(() => {
  if (selectedCategory.value === '全部') {
    return store.courses
  }
  return store.courses.filter(c => c.category === selectedCategory.value)
})

onMounted(async () => {
  if (store.courses.length === 0) {
    await store.loadCourses()
  }
  // 如果有courseId参数，加载对应课程
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const courseId = currentPage.options?.id
  if (courseId) {
    const course = store.courses.find(c => c.id === courseId)
    if (course) viewCourse(course)
  }
})

function goBack() {
  uni.navigateBack()
}

function viewCourse(course) {
  currentCourse.value = course
}

function closeDetail() {
  currentCourse.value = null
}

function startLearning() {
  closeDetail()
  showVideo.value = true
  // 模拟视频URL（aliplayer或直接iframe）
  videoUrl.value = ''
  totalTime.value = currentCourse.value.duration
  playProgress.value = currentCourse.value.progress
  currentTime.value = Math.floor(totalTime.value * playProgress.value / 100)
}

function closeVideo() {
  showVideo.value = false
  videoUrl.value = ''
  isPlaying.value = false
}

function togglePlay() {
  isPlaying.value = !isPlaying.value
}

function onProgressChange(e) {
  playProgress.value = e.detail.value
  currentTime.value = Math.floor(totalTime.value * playProgress.value / 100)
}

async function markComplete() {
  if (currentCourse.value) {
    await store.completeCourse(currentCourse.value.id)
    closeVideo()
    uni.showToast({ title: '🎉 课程完成！', icon: 'success' })
  }
}

function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60)
  return `${mins}分钟`
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
</script>

<style scoped>
.course-page {
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
  width: 80rpx;
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
  background: #F59E0B;
  color: #FFFFFF;
  font-weight: 500;
}

.course-list {
  padding: 24rpx 32rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 0;
}

.loading-spinner {
  width: 64rpx;
  height: 64rpx;
  border: 4rpx solid #E5E7EB;
  border-top-color: #F59E0B;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  margin-top: 20rpx;
  font-size: 28rpx;
  color: #6B7280;
}

/* 课程详情弹窗 */
.course-detail-modal {
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
  background: #FFFFFF;
  border-radius: 32rpx 32rpx 0 0;
  padding: 32rpx;
  position: relative;
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
  z-index: 10;
}

.detail-cover {
  position: relative;
  width: 100%;
  height: 360rpx;
  border-radius: 24rpx;
  overflow: hidden;
  margin-bottom: 24rpx;
}

.cover-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.cover-icon {
  font-size: 120rpx;
}

.cover-duration {
  font-size: 28rpx;
  color: #FFFFFF;
  margin-top: 16rpx;
}

.cover-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 8rpx;
  background: rgba(255, 255, 255, 0.3);
}

.progress-bar {
  height: 100%;
  background: #FFFFFF;
  transition: width 0.3s;
}

.detail-info {
  padding: 0 8rpx;
}

.detail-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #1F2937;
  display: block;
  margin-bottom: 16rpx;
}

.detail-meta {
  margin-bottom: 16rpx;
}

.detail-desc {
  font-size: 28rpx;
  color: #6B7280;
  line-height: 1.6;
  display: block;
  margin-bottom: 24rpx;
}

.detail-stats {
  display: flex;
  gap: 32rpx;
  padding: 24rpx 0;
  border-top: 1rpx solid #E5E7EB;
  border-bottom: 1rpx solid #E5E7EB;
  margin-bottom: 24rpx;
}

.stat-item {
  flex: 1;
  text-align: center;
}

.stat-value {
  font-size: 36rpx;
  font-weight: 600;
  color: #2563EB;
  display: block;
}

.stat-label {
  font-size: 22rpx;
  color: #9CA3AF;
  margin-top: 4rpx;
}

.detail-actions {
  display: flex;
  gap: 16rpx;
}

.action-btn {
  flex: 1;
  height: 88rpx;
  border-radius: 44rpx;
  font-size: 32rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
}

.action-btn.primary {
  background: linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%);
  color: #FFFFFF;
}

/* 视频播放器弹窗 */
.video-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.video-content {
  width: 100%;
  padding: 32rpx;
}

.video-close {
  text-align: right;
  margin-bottom: 24rpx;
}

.video-close text {
  display: inline-block;
  width: 64rpx;
  height: 64rpx;
  line-height: 64rpx;
  text-align: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  color: #FFFFFF;
  font-size: 32rpx;
}

.video-player {
  width: 100%;
  aspect-ratio: 16/9;
  background: #000;
  border-radius: 24rpx;
  overflow: hidden;
  margin-bottom: 24rpx;
}

.video-iframe {
  width: 100%;
  height: 100%;
}

.video-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.video-icon {
  font-size: 96rpx;
  margin-bottom: 16rpx;
}

.video-text {
  font-size: 32rpx;
  color: #FFFFFF;
}

.video-hint {
  font-size: 24rpx;
  color: #9CA3AF;
  margin-top: 8rpx;
}

.video-controls {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16rpx;
  padding: 24rpx;
}

.video-progress {
  margin-bottom: 20rpx;
}

.controls-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.control-btn {
  font-size: 28rpx;
  color: #FFFFFF;
  padding: 8rpx 16rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 8rpx;
}

.control-time {
  font-size: 24rpx;
  color: #D1D5DB;
}
</style>
