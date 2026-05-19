<template>
  <view class="recordings-page">
    <!-- 顶部导航 -->
    <view class="nav-header">
      <text class="back-btn" @click="goBack">‹</text>
      <text class="nav-title">录音回放</text>
      <text class="nav-placeholder"></text>
    </view>

    <!-- 录音列表 -->
    <view class="recordings-list">
      <view
        v-for="recording in recordings"
        :key="recording.id"
        class="recording-card"
      >
        <view class="recording-info">
          <view class="recording-header">
            <text class="recording-title">{{ recording.title || '录音' }}</text>
            <text class="recording-date">{{ formatDate(recording.createdAt) }}</text>
          </view>
          <view class="recording-meta">
            <text class="meta-item">⏱️ {{ formatDuration(recording.duration) }}</text>
            <text v-if="recording.score" class="meta-item">⭐ {{ recording.score }}分</text>
          </view>
        </view>
        
        <view class="recording-actions">
          <view class="play-btn" @click="playRecording(recording)">
            <text>{{ playingId === recording.id && isPlaying ? '⏸️' : '▶️' }}</text>
          </view>
          <view class="delete-btn" @click="deleteRecording(recording.id)">
            <text>🗑️</text>
          </view>
        </view>
      </view>

      <view v-if="recordings.length === 0" class="empty-state">
        <text class="empty-icon">🎧</text>
        <text class="empty-text">暂无录音记录</text>
        <text class="empty-hint">完成练习后自动保存录音</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { usePublicSpeakingStore } from '@/stores/publicSpeakingStore.js'

const store = usePublicSpeakingStore()

// 状态
const playingId = ref(null)
const isPlaying = ref(false)

// 计算属性
const recordings = computed(() => store.recordings)

// 方法
const goBack = () => {
  uni.navigateBack()
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`
}

const formatDuration = (seconds) => {
  if (!seconds) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const playRecording = (recording) => {
  if (playingId.value === recording.id && isPlaying.value) {
    // 暂停
    isPlaying.value = false
    // uni.createInnerAudioContext() would be used in real implementation
    uni.showToast({ title: '已暂停', icon: 'none' })
  } else {
    // 播放
    playingId.value = recording.id
    isPlaying.value = true
    uni.showToast({ title: '正在播放', icon: 'none' })
    
    // 模拟播放结束
    setTimeout(() => {
      if (playingId.value === recording.id) {
        isPlaying.value = false
        playingId.value = null
      }
    }, (recording.duration || 60) * 1000)
  }
}

const deleteRecording = (recordingId) => {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这条录音吗？',
    success: (res) => {
      if (res.confirm) {
        store.deleteRecording(recordingId)
        uni.showToast({ title: '已删除', icon: 'success' })
      }
    }
  })
}

onMounted(() => {
  store.init()
})
</script>

<style scoped>
.recordings-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.nav-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 40rpx 30rpx 20rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.back-btn {
  font-size: 60rpx;
  color: #ffffff;
  font-weight: bold;
}

.nav-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #ffffff;
}

.nav-placeholder {
  width: 60rpx;
}

.recordings-list {
  padding: 20rpx 30rpx;
}

.recording-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
  display: flex;
  align-items: center;
}

.recording-info {
  flex: 1;
}

.recording-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8rpx;
}

.recording-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.recording-date {
  font-size: 22rpx;
  color: #999;
}

.recording-meta {
  display: flex;
  gap: 16rpx;
}

.meta-item {
  font-size: 24rpx;
  color: #666;
}

.recording-actions {
  display: flex;
  gap: 16rpx;
}

.play-btn,
.delete-btn {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
}

.delete-btn {
  background: rgba(245, 34, 45, 0.1);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 100rpx 0;
}

.empty-icon {
  font-size: 100rpx;
  margin-bottom: 20rpx;
}

.empty-text {
  font-size: 32rpx;
  color: #333;
  margin-bottom: 8rpx;
}

.empty-hint {
  font-size: 24rpx;
  color: #999;
}
</style>
