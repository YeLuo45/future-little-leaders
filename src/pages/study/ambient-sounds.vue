<template>
  <view class="ambient-sounds-page">
    <!-- 顶部导航 -->
    <view class="header">
      <view class="header-left" @click="goBack">
        <text class="icon">←</text>
      </view>
      <view class="header-title">
        <text>背景音乐</text>
      </view>
      <view class="header-right"></view>
    </view>

    <!-- 场景选择 -->
    <view class="scenes-section">
      <view class="section-title">选择场景</view>
      <view class="scenes-grid">
        <view
          v-for="scene in ambientScenes"
          :key="scene.id"
          class="scene-card"
          :class="{ active: currentScene === scene.id, playing: isPlaying && currentScene === scene.id }"
          @click="selectScene(scene.id)"
        >
          <view class="scene-icon-wrap">
            <text class="scene-icon">{{ scene.icon }}</text>
            <view v-if="isPlaying && currentScene === scene.id" class="playing-indicator">
              <text class="playing-bar"></text>
              <text class="playing-bar"></text>
              <text class="playing-bar"></text>
            </view>
          </view>
          <text class="scene-name">{{ scene.name }}</text>
          <text class="scene-desc">{{ scene.description }}</text>
        </view>
      </view>
    </view>

    <!-- 音量控制 -->
    <view class="volume-section">
      <view class="section-title">音量</view>
      <view class="volume-control">
        <text class="volume-icon">🔈</text>
        <slider
          :value="volume"
          :min="0"
          :max="100"
          :step="5"
          active-color="#5b8def"
          @change="onVolumeChange"
        />
        <text class="volume-icon">🔊</text>
        <text class="volume-value">{{ volume }}%</text>
      </view>
    </view>

    <!-- 播放控制 -->
    <view class="playback-section">
      <view class="playback-controls">
        <view class="control-btn prev" @click="prevSound">
          <text>⏮</text>
        </view>
        <view class="control-btn play" @click="togglePlay">
          <text>{{ isPlaying ? '⏸' : '▶' }}</text>
        </view>
        <view class="control-btn next" @click="nextSound">
          <text>⏭</text>
        </view>
      </view>
      <view class="timer-display">
        <text class="timer-text">{{ formattedTimer }}</text>
      </view>
    </view>

    <!-- 当前播放 -->
    <view class="now-playing">
      <text class="now-playing-label">正在播放</text>
      <text class="now-playing-name">{{ currentSceneName }}</text>
    </view>
  </view>
</template>

<script>
import { useStudyStore } from '@/stores/studyStore'

export default {
  data() {
    return {
      ambientScenes: [
        { id: 'rain', name: '雨声', icon: '🌧️', description: '绵绵细雨，宁静放松' },
        { id: 'thunder', name: '雷雨', icon: '⛈️', description: '电闪雷鸣，沉浸体验' },
        { id: 'ocean', name: '海浪', icon: '🌊', description: '海风轻拂，波涛阵阵' },
        { id: 'forest', name: '森林', icon: '🌲', description: '鸟鸣虫唱，自然呼吸' },
        { id: 'fire', name: '篝火', icon: '🔥', description: '火焰噼啪，温暖舒适' },
        { id: 'wind', name: '微风', icon: '🍃', description: '轻风拂面，心旷神怡' },
        { id: 'cafe', name: '咖啡厅', icon: '☕', description: '轻柔交谈，专注工作' },
        { id: 'night', name: '夜晚', icon: '🌙', description: '蟋蟀低鸣，静谧安详' }
      ],
      timerSeconds: 0,
      timerInterval: null
    }
  },
  computed: {
    studyState() {
      return this.studyStore.studyState
    },
    currentScene() {
      return this.studyState.ambientScene
    },
    currentSceneName() {
      const scene = this.ambientScenes.find(s => s.id === this.currentScene)
      return scene ? scene.name : '选择场景'
    },
    volume() {
      return this.studyState.volume
    },
    isPlaying() {
      return this.studyState.isAmbientPlaying
    },
    formattedTimer() {
      const hours = Math.floor(this.timerSeconds / 3600)
      const minutes = Math.floor((this.timerSeconds % 3600) / 60)
      const seconds = this.timerSeconds % 60
      if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      }
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    },
    studyStore() {
      return useStudyStore()
    }
  },
  onLoad() {
    this.studyStore.init()
    this.timerSeconds = this.studyState.ambientTimerSeconds || 0
    if (this.studyState.isAmbientPlaying) {
      this.startTimer()
    }
  },
  onUnload() {
    this.stopTimer()
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    selectScene(sceneId) {
      this.studyStore.setAmbientScene(sceneId)
      if (!this.studyState.isAmbientPlaying) {
        this.studyStore.toggleAmbient()
        this.startTimer()
      }
    },
    togglePlay() {
      this.studyStore.toggleAmbient()
      if (this.studyState.isAmbientPlaying) {
        this.startTimer()
      } else {
        this.stopTimer()
      }
    },
    prevSound() {
      const currentIndex = this.ambientScenes.findIndex(s => s.id === this.currentScene)
      const prevIndex = (currentIndex - 1 + this.ambientScenes.length) % this.ambientScenes.length
      this.selectScene(this.ambientScenes[prevIndex].id)
    },
    nextSound() {
      const currentIndex = this.ambientScenes.findIndex(s => s.id === this.currentScene)
      const nextIndex = (currentIndex + 1) % this.ambientScenes.length
      this.selectScene(this.ambientScenes[nextIndex].id)
    },
    onVolumeChange(e) {
      this.studyStore.setVolume(e.detail.value)
    },
    startTimer() {
      if (this.timerInterval) return
      this.timerInterval = setInterval(() => {
        this.timerSeconds++
        this.studyStore.setAmbientTimer(this.timerSeconds)
      }, 1000)
    },
    stopTimer() {
      if (this.timerInterval) {
        clearInterval(this.timerInterval)
        this.timerInterval = null
      }
    }
  }
}
</script>

<style scoped>
.ambient-sounds-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 16px;
  background-color: #5b8def;
  color: white;
}

.header-left, .header-right {
  width: 40px;
}

.header-title {
  flex: 1;
  text-align: center;
  font-size: 18px;
  font-weight: bold;
}

.icon {
  font-size: 20px;
}

.scenes-section {
  background-color: white;
  padding: 16px;
  margin-bottom: 12px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 16px;
}

.scenes-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.scene-card {
  background-color: #f8f8f8;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  border: 2px solid transparent;
  transition: all 0.3s;
}

.scene-card.active {
  background-color: #e6f0ff;
  border-color: #5b8def;
}

.scene-icon-wrap {
  position: relative;
  display: inline-block;
  margin-bottom: 8px;
}

.scene-icon {
  font-size: 40px;
}

.playing-indicator {
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 2px;
  height: 12px;
  align-items: flex-end;
}

.playing-bar {
  width: 3px;
  background-color: #5b8def;
  animation: playingAnimation 0.5s ease-in-out infinite alternate;
}

.playing-bar:nth-child(1) {
  height: 6px;
  animation-delay: 0s;
}

.playing-bar:nth-child(2) {
  height: 10px;
  animation-delay: 0.2s;
}

.playing-bar:nth-child(3) {
  height: 4px;
  animation-delay: 0.4s;
}

@keyframes playingAnimation {
  from { height: 4px; }
  to { height: 12px; }
}

.scene-name {
  display: block;
  font-size: 14px;
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
}

.scene-desc {
  display: block;
  font-size: 12px;
  color: #999;
}

.volume-section {
  background-color: white;
  padding: 16px;
  margin-bottom: 12px;
}

.volume-control {
  display: flex;
  align-items: center;
  gap: 12px;
}

.volume-icon {
  font-size: 20px;
}

.volume-control slider {
  flex: 1;
}

.volume-value {
  font-size: 14px;
  color: #666;
  min-width: 45px;
  text-align: right;
}

.playback-section {
  background-color: white;
  padding: 24px;
  margin-bottom: 12px;
}

.playback-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 24px;
  margin-bottom: 16px;
}

.control-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: white;
  font-size: 20px;
}

.control-btn.prev,
.control-btn.next {
  width: 48px;
  height: 48px;
  background-color: #ddd;
}

.control-btn.play {
  width: 64px;
  height: 64px;
  background-color: #5b8def;
  font-size: 24px;
}

.timer-display {
  text-align: center;
}

.timer-text {
  font-size: 32px;
  font-weight: bold;
  color: #333;
  font-variant-numeric: tabular-nums;
}

.now-playing {
  background-color: white;
  padding: 16px;
  text-align: center;
}

.now-playing-label {
  display: block;
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}

.now-playing-name {
  display: block;
  font-size: 16px;
  font-weight: bold;
  color: #5b8def;
}
</style>
