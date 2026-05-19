<template>
  <view class="study-room-page">
    <!-- 顶部导航 -->
    <view class="header">
      <view class="header-left" @click="goBack">
        <text class="icon">←</text>
      </view>
      <view class="header-title">
        <text>自习室</text>
      </view>
      <view class="header-right" @click="goToStats">
        <text class="icon">📊</text>
      </view>
    </view>

    <!-- 自习室主界面 -->
    <view class="study-main">
      <!-- 场景选择 -->
      <view class="scene-selector">
        <view
          v-for="scene in scenes"
          :key="scene.id"
          class="scene-item"
          :class="{ active: currentScene === scene.id }"
          @click="selectScene(scene.id)"
        >
          <text class="scene-icon">{{ scene.icon }}</text>
          <text class="scene-name">{{ scene.name }}</text>
        </view>
      </view>

      <!-- 计时器 -->
      <view class="timer-container">
        <view class="timer-ring" :class="currentScene">
          <view class="timer-display">
            <text class="timer-time">{{ formattedTime }}</text>
            <text class="timer-label">专注学习中</text>
          </view>
        </view>
      </view>

      <!-- 当前学习任务 -->
      <view v-if="currentTask" class="current-task">
        <text class="task-label">当前任务:</text>
        <text class="task-title">{{ currentTask }}</text>
      </view>

      <!-- 控制按钮 -->
      <view class="controls">
        <view v-if="!isRunning && !isPaused" class="control-btn start" @click="startStudy">
          <text class="btn-icon">▶</text>
          <text class="btn-text">开始学习</text>
        </view>

        <view v-else-if="isRunning" class="control-btn-group">
          <view class="control-btn pause" @click="pauseStudy">
            <text class="btn-icon">⏸</text>
            <text class="btn-text">暂停</text>
          </view>
          <view class="control-btn stop" @click="stopStudy">
            <text class="btn-icon">⏹</text>
            <text class="btn-text">结束</text>
          </view>
        </view>

        <view v-else-if="isPaused" class="control-btn-group">
          <view class="control-btn resume" @click="resumeStudy">
            <text class="btn-icon">▶</text>
            <text class="btn-text">继续</text>
          </view>
          <view class="control-btn stop" @click="stopStudy">
            <text class="btn-icon">⏹</text>
            <text class="btn-text">结束</text>
          </view>
        </view>
      </view>

      <!-- 背景音乐按钮 -->
      <view class="sound-btn" @click="goToAmbientSounds">
        <text class="sound-icon">🎵</text>
        <text>背景音乐</text>
      </view>

      <!-- 休息提醒设置 -->
      <view v-if="!isRunning && !isPaused" class="break-setting">
        <text class="setting-label">休息提醒:</text>
        <picker mode="selector" :value="breakIntervalIndex" :range="breakIntervals" @change="onBreakIntervalChange">
          <view class="picker-value">
            <text>{{ breakIntervals[breakIntervalIndex] }}</text>
          </view>
        </picker>
      </view>
    </view>

    <!-- 今日学习统计 -->
    <view class="stats-section">
      <view class="stats-header">
        <text class="stats-title">今日学习</text>
        <text class="stats-more" @click="goToStats">查看详情 ›</text>
      </view>
      <view class="stats-grid">
        <view class="stat-item">
          <text class="stat-value">{{ todayStats.totalMinutes }}</text>
          <text class="stat-label">学习分钟</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ todayStats.sessionCount }}</text>
          <text class="stat-label">学习次数</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ todayStats.currentStreak }}</text>
          <text class="stat-label">连续天数</text>
        </view>
      </view>
    </view>

    <!-- 专注力提示 -->
    <view class="tip-section">
      <text class="tip-icon">💡</text>
      <text class="tip-text">保持专注，避免分心。每完成一次学习，积累一点进步！</text>
    </view>
  </view>
</template>

<script>
import { useStudyStore } from '@/stores/studyStore'

export default {
  data() {
    return {
      scenes: [
        { id: 'library', name: '图书馆', icon: '📚' },
        { id: 'forest', name: '森林', icon: '🌲' },
        { id: 'sea', name: '海边', icon: '🌊' },
        { id: 'rain', name: '雨夜', icon: '🌧️' }
      ],
      breakIntervals: ['25分钟', '45分钟', '60分钟', '90分钟'],
      breakIntervalIndex: 0,
      breakDurations: [25, 45, 60, 90]
    }
  },
  computed: {
    studyState() {
      return this.studyStore.studyState
    },
    isRunning() {
      return this.studyState.isRunning
    },
    isPaused() {
      return this.studyState.isPaused
    },
    currentScene() {
      return this.studyState.currentScene
    },
    currentTask() {
      return this.studyState.currentTask
    },
    formattedTime() {
      return this.studyStore.formattedStudyTime
    },
    todayStats() {
      return this.studyStore.todayStudyStats
    },
    studyStore() {
      return useStudyStore()
    }
  },
  onLoad() {
    this.studyStore.init()
  },
  onUnload() {
    this.studyStore.cleanup()
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    goToStats() {
      uni.navigateTo({
        url: '/pages/study/focus-stats'
      })
    },
    goToAmbientSounds() {
      uni.navigateTo({
        url: '/pages/study/ambient-sounds'
      })
    },
    selectScene(sceneId) {
      this.studyStore.setScene(sceneId)
    },
    startStudy() {
      this.studyStore.startStudy()
    },
    pauseStudy() {
      this.studyStore.pauseStudy()
    },
    resumeStudy() {
      this.studyStore.resumeStudy()
    },
    stopStudy() {
      uni.showModal({
        title: '确认结束',
        content: '确定要结束当前学习吗？',
        success: (res) => {
          if (res.confirm) {
            this.studyStore.stopStudy()
          }
        }
      })
    },
    onBreakIntervalChange(e) {
      this.breakIntervalIndex = e.detail.value
      this.studyStore.setBreakInterval(this.breakDurations[this.breakIntervalIndex])
    }
  }
}
</script>

<style scoped>
.study-room-page {
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

.study-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 16px;
  background-color: white;
  margin-bottom: 12px;
}

.scene-selector {
  display: flex;
  gap: 12px;
  margin-bottom: 32px;
  flex-wrap: wrap;
  justify-content: center;
}

.scene-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 16px;
  border-radius: 12px;
  background-color: #f5f5f5;
  min-width: 70px;
}

.scene-item.active {
  background-color: #e6f0ff;
  border: 2px solid #5b8def;
}

.scene-icon {
  font-size: 28px;
  margin-bottom: 4px;
}

.scene-name {
  font-size: 12px;
  color: #666;
}

.timer-container {
  margin-bottom: 24px;
}

.timer-ring {
  width: 240px;
  height: 240px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #5b8def 0%, #7aa3f5 100%);
  box-shadow: 0 8px 32px rgba(91, 141, 239, 0.3);
}

.timer-ring.library {
  background: linear-gradient(135deg, #8b7355 0%, #a08060 100%);
  box-shadow: 0 8px 32px rgba(139, 115, 85, 0.3);
}

.timer-ring.forest {
  background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
  box-shadow: 0 8px 32px rgba(82, 196, 26, 0.3);
}

.timer-ring.sea {
  background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
  box-shadow: 0 8px 32px rgba(24, 144, 255, 0.3);
}

.timer-ring.rain {
  background: linear-gradient(135deg, #597tail 0%, #7b8fa1 100%);
  box-shadow: 0 8px 32px rgba(89, 119, 161, 0.3);
}

.timer-display {
  text-align: center;
}

.timer-time {
  display: block;
  font-size: 52px;
  font-weight: bold;
  color: white;
  font-variant-numeric: tabular-nums;
}

.timer-label {
  display: block;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 8px;
}

.current-task {
  text-align: center;
  margin-bottom: 24px;
}

.task-label {
  font-size: 12px;
  color: #999;
}

.task-title {
  display: block;
  font-size: 16px;
  color: #333;
  margin-top: 4px;
}

.controls {
  margin-bottom: 16px;
}

.control-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  color: white;
}

.control-btn.start {
  background-color: #5b8def;
  box-shadow: 0 4px 16px rgba(91, 141, 239, 0.4);
}

.control-btn.pause {
  background-color: #fa8c16;
  box-shadow: 0 4px 16px rgba(250, 140, 22, 0.4);
}

.control-btn.resume {
  background-color: #52c41a;
  box-shadow: 0 4px 16px rgba(82, 196, 26, 0.4);
}

.control-btn.stop {
  background-color: #ff4d4f;
  box-shadow: 0 4px 16px rgba(255, 77, 79, 0.4);
}

.control-btn-group {
  display: flex;
  gap: 32px;
}

.btn-icon {
  font-size: 32px;
}

.btn-text {
  font-size: 14px;
  margin-top: 4px;
}

.sound-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background-color: #f0f5ff;
  border-radius: 20px;
  color: #5b8def;
  margin-bottom: 16px;
}

.sound-icon {
  font-size: 18px;
}

.break-setting {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
}

.setting-label {
  font-size: 14px;
  color: #666;
}

.picker-value {
  padding: 6px 16px;
  background-color: #f5f5f5;
  border-radius: 8px;
  font-size: 14px;
}

.stats-section {
  background-color: white;
  padding: 16px;
  margin-bottom: 12px;
}

.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.stats-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.stats-more {
  font-size: 14px;
  color: #5b8def;
}

.stats-grid {
  display: flex;
  justify-content: space-around;
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 28px;
  font-weight: bold;
  color: #5b8def;
}

.stat-label {
  display: block;
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.tip-section {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background-color: #fffbe6;
  margin: 0 12px 12px;
  border-radius: 8px;
}

.tip-icon {
  font-size: 20px;
}

.tip-text {
  flex: 1;
  font-size: 14px;
  color: #ad6800;
  line-height: 1.5;
}
</style>
