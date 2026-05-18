<!-- 课程卡片组件 -->
<template>
  <view class="course-card" :class="{ 'card-enter': isEnter, completed: course.completed }" @click="handleClick">
    <!-- 封面 -->
    <view class="card-cover">
      <view class="cover-placeholder" :style="coverStyle">
        <text class="cover-icon">🎬</text>
      </view>
      <!-- 完成标记 -->
      <view class="completed-badge" v-if="course.completed">
        <text>✓ 已完成</text>
      </view>
      <!-- 进度条 -->
      <view class="progress-overlay" v-if="course.progress > 0 && !course.completed">
        <view class="progress-bar" :style="{ width: course.progress + '%' }"></view>
      </view>
    </view>

    <!-- 课程信息 -->
    <view class="card-body">
      <text class="course-title">{{ course.title }}</text>
      <view class="course-meta">
        <text class="meta-category">{{ course.category }}</text>
        <text class="meta-duration">{{ formatDuration(course.duration) }}</text>
      </view>
      <view class="course-footer">
        <text class="course-lessons">{{ course.lessons }}课时</text>
        <text class="course-progress" v-if="course.progress > 0">{{ course.progress }}%</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  course: {
    type: Object,
    required: true,
    default: () => ({
      id: '',
      title: '课程名称',
      duration: 1800,
      progress: 0,
      completed: false,
      category: '心理学',
      lessons: 10
    })
  }
})

const emit = defineEmits(['click'])

const isEnter = ref(false)

// 不同分类的渐变色
const categoryColors = {
  '心理学': ['#7C3AED', '#8B5CF6'],
  '教育方法': ['#2563EB', '#3B82F6'],
  '沟通技巧': ['#10B981', '#34D399'],
  '能力培养': ['#F59E0B', '#FBBF24'],
  '学科启蒙': ['#EC4899', '#F472B6'],
  '健康管理': ['#EF4444', '#F87171']
}

const coverStyle = computed(() => {
  const colors = categoryColors[props.course.category] || ['#6B7280', '#9CA3AF']
  return {
    background: `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 100%)`
  }
})

onMounted(() => {
  setTimeout(() => {
    isEnter.value = true
  }, 50)
})

function handleClick() {
  emit('click', props.course)
}

function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60)
  return `${mins}分钟`
}
</script>

<style scoped>
.course-card {
  width: 300rpx;
  background: #FFFFFF;
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
  flex-shrink: 0;
  opacity: 0;
  transform: translateY(16rpx);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.card-enter {
  opacity: 1;
  transform: translateY(0);
}

.card-cover {
  position: relative;
  height: 200rpx;
  overflow: hidden;
}

.cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.cover-icon {
  font-size: 64rpx;
}

.completed-badge {
  position: absolute;
  top: 12rpx;
  right: 12rpx;
  padding: 6rpx 16rpx;
  background: rgba(16, 185, 129, 0.9);
  color: #FFFFFF;
  font-size: 20rpx;
  font-weight: 500;
  border-radius: 8rpx;
}

.progress-overlay {
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

.card-body {
  padding: 20rpx;
}

.course-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #1F2937;
  line-height: 1.3;
  display: block;
  margin-bottom: 12rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.course-meta {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 12rpx;
}

.meta-category {
  font-size: 20rpx;
  color: #6B7280;
  padding: 4rpx 10rpx;
  background: #F3F4F6;
  border-radius: 6rpx;
}

.meta-duration {
  font-size: 20rpx;
  color: #9CA3AF;
}

.course-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.course-lessons {
  font-size: 22rpx;
  color: #9CA3AF;
}

.course-progress {
  font-size: 22rpx;
  color: #F59E0B;
  font-weight: 500;
}

.course-card.completed .course-title {
  color: #6B7280;
}
</style>
