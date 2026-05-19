<template>
  <view class="pomodoro-page">
    <!-- 顶部导航 -->
    <view class="header">
      <view class="header-left" @click="goBack">
        <text class="icon">←</text>
      </view>
      <view class="header-title">
        <text>番茄钟</text>
      </view>
      <view class="header-right" @click="showSettings">
        <text class="icon">⚙</text>
      </view>
    </view>

    <!-- 番茄钟主界面 -->
    <view class="pomodoro-main">
      <!-- 阶段指示器 -->
      <view class="phase-indicator">
        <view
          v-for="phase in phases"
          :key="phase.key"
          class="phase-dot"
          :class="{ active: currentPhase === phase.key, completed: isPhaseCompleted(phase.key) }"
          @click="switchPhase(phase.key)"
        >
          <text>{{ phase.label }}</text>
        </view>
      </view>

      <!-- 计时器 -->
      <view class="timer-container">
        <view class="timer-ring" :class="currentPhase">
          <view class="timer-display">
            <text class="timer-time">{{ formattedRemainingTime }}</text>
            <text class="timer-phase">{{ currentPhaseLabel }}</text>
          </view>
        </view>
      </view>

      <!-- 当前任务 -->
      <view v-if="pomodoroState.currentTask" class="current-task">
        <text class="task-label">当前任务:</text>
        <text class="task-title">{{ pomodoroState.currentTask }}</text>
      </view>

      <!-- 控制按钮 -->
      <view class="controls">
        <view v-if="!pomodoroState.isRunning && !pomodoroState.isPaused" class="control-btn start" @click="startPomodoro">
          <text class="btn-icon">▶</text>
          <text class="btn-text">开始</text>
        </view>

        <view v-else-if="pomodoroState.isRunning" class="control-btn-group">
          <view class="control-btn pause" @click="pausePomodoro">
            <text class="btn-icon">⏸</text>
            <text class="btn-text">暂停</text>
          </view>
          <view class="control-btn stop" @click="stopPomodoro">
            <text class="btn-icon">⏹</text>
            <text class="btn-text">停止</text>
          </view>
        </view>

        <view v-else-if="pomodoroState.isPaused" class="control-btn-group">
          <view class="control-btn resume" @click="resumePomodoro">
            <text class="btn-icon">▶</text>
            <text class="btn-text">继续</text>
          </view>
          <view class="control-btn stop" @click="stopPomodoro">
            <text class="btn-icon">⏹</text>
            <text class="btn-text">停止</text>
          </view>
        </view>
      </view>

      <!-- 跳过按钮 -->
      <view v-if="pomodoroState.isRunning || pomodoroState.isPaused" class="skip-btn" @click="skipPhase">
        <text>跳过当前阶段</text>
      </view>

      <!-- 任务输入 -->
      <view v-if="!pomodoroState.isRunning && !pomodoroState.isPaused" class="task-input-section">
        <input
          v-model="taskTitle"
          class="task-input"
          placeholder="输入任务名称（可选）"
        />
      </view>
    </view>

    <!-- 今日统计 -->
    <view class="stats-section">
      <view class="stats-header">
        <text class="stats-title">今日统计</text>
      </view>
      <view class="stats-grid">
        <view class="stat-item">
          <text class="stat-value">{{ todayStats.completedCount }}</text>
          <text class="stat-label">完成番茄</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ todayStats.totalMinutes }}</text>
          <text class="stat-label">专注分钟</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ weekStats.totalCount || 0 }}</text>
          <text class="stat-label">本周番茄</text>
        </view>
      </view>
    </view>

    <!-- 设置弹窗 -->
    <view v-if="showSettingsModal" class="modal-overlay" @click="closeSettings">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">番茄钟设置</text>
          <text class="modal-close" @click="closeSettings">×</text>
        </view>

        <view class="form-item">
          <text class="form-label">工作时长（分钟）</text>
          <slider
            :value="tempConfig.workDuration"
            :min="5"
            :max="60"
            :step="5"
            show-value
            @change="(e) => tempConfig.workDuration = e.detail.value"
          />
        </view>

        <view class="form-item">
          <text class="form-label">短休息时长（分钟）</text>
          <slider
            :value="tempConfig.shortBreak"
            :min="1"
            :max="15"
            :step="1"
            show-value
            @change="(e) => tempConfig.shortBreak = e.detail.value"
          />
        </view>

        <view class="form-item">
          <text class="form-label">长休息时长（分钟）</text>
          <slider
            :value="tempConfig.longBreak"
            :min="5"
            :max="30"
            :step="5"
            show-value
            @change="(e) => tempConfig.longBreak = e.detail.value"
          />
        </view>

        <view class="form-item">
          <text class="form-label">长休息间隔（次）</text>
          <slider
            :value="tempConfig.longBreakInterval"
            :min="2"
            :max="8"
            :step="1"
            show-value
            @change="(e) => tempConfig.longBreakInterval = e.detail.value"
          />
        </view>

        <view class="form-actions">
          <button class="btn-save" @click="saveSettings">保存设置</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { useTimeStore } from '@/stores/timeStore'

export default {
  data() {
    return {
      showSettingsModal: false,
      taskTitle: '',
      tempConfig: {
        workDuration: 25,
        shortBreak: 5,
        longBreak: 15,
        longBreakInterval: 4
      },
      phases: [
        { key: 'work', label: '工作' },
        { key: 'shortBreak', label: '短休息' },
        { key: 'longBreak', label: '长休息' }
      ]
    }
  },
  computed: {
    pomodoroState() {
      return this.timeStore.pomodoroState
    },
    pomodoroConfig() {
      return this.timeStore.pomodoroConfig
    },
    formattedRemainingTime() {
      return this.timeStore.formattedRemainingTime
    },
    currentPhase() {
      return this.pomodoroState.currentPhase
    },
    currentPhaseLabel() {
      const labels = {
        work: '专注工作中',
        shortBreak: '短暂休息',
        longBreak: '长休息'
      }
      return labels[this.currentPhase] || '专注工作中'
    },
    todayStats() {
      return this.timeStore.todayPomodoroStats
    },
    weekStats() {
      return this.timeStore.weekPomodoroStats
    },
    timeStore() {
      return useTimeStore()
    }
  },
  onLoad() {
    this.timeStore.init()
    this.tempConfig = { ...this.timeStore.pomodoroConfig }
  },
  onUnload() {
    this.timeStore.cleanup()
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    isPhaseCompleted(phase) {
      if (phase === 'work') {
        return this.pomodoroState.completedPomodoros > 0
      }
      return false
    },
    switchPhase(phase) {
      if (this.pomodoroState.isRunning || this.pomodoroState.isPaused) {
        uni.showToast({ title: '请先停止计时器', icon: 'none' })
        return
      }
      this.timeStore.pomodoroState.currentPhase = phase
      const durations = {
        work: this.pomodoroConfig.workDuration,
        shortBreak: this.pomodoroConfig.shortBreak,
        longBreak: this.pomodoroConfig.longBreak
      }
      this.timeStore.pomodoroState.remainingSeconds = durations[phase] * 60
    },
    startPomodoro() {
      this.timeStore.startPomodoro(this.taskTitle)
    },
    pausePomodoro() {
      this.timeStore.pausePomodoro()
    },
    resumePomodoro() {
      this.timeStore.resumePomodoro()
    },
    stopPomodoro() {
      uni.showModal({
        title: '确认停止',
        content: '确定要停止当前番茄钟吗？',
        success: (res) => {
          if (res.confirm) {
            this.timeStore.stopPomodoro()
            this.taskTitle = ''
          }
        }
      })
    },
    skipPhase() {
      this.timeStore.skipPhase()
    },
    showSettings() {
      this.tempConfig = { ...this.timeStore.pomodoroConfig }
      this.showSettingsModal = true
    },
    closeSettings() {
      this.showSettingsModal = false
    },
    saveSettings() {
      this.timeStore.updatePomodoroConfig(this.tempConfig)
      // 更新当前显示的时间
      if (!this.pomodoroState.isRunning && !this.pomodoroState.isPaused) {
        const durations = {
          work: this.tempConfig.workDuration,
          shortBreak: this.tempConfig.shortBreak,
          longBreak: this.tempConfig.longBreak
        }
        this.timeStore.pomodoroState.remainingSeconds = durations[this.pomodoroState.currentPhase] * 60
      }
      this.closeSettings()
      uni.showToast({ title: '设置已保存', icon: 'success' })
    }
  }
}
</script>

<style scoped>
.pomodoro-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 16px;
  background-color: #8477fa;
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

.pomodoro-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 16px;
  background-color: white;
  margin-bottom: 12px;
}

.phase-indicator {
  display: flex;
  gap: 16px;
  margin-bottom: 32px;
}

.phase-dot {
  padding: 6px 16px;
  border-radius: 16px;
  background-color: #f0f0f0;
  color: #999;
  font-size: 14px;
}

.phase-dot.active {
  background-color: #8477fa;
  color: white;
}

.phase-dot.completed {
  background-color: #e6e6ff;
  color: #8477fa;
}

.timer-container {
  margin-bottom: 24px;
}

.timer-ring {
  width: 220px;
  height: 220px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #8477fa 0%, #a599fa 100%);
  box-shadow: 0 8px 32px rgba(132, 119, 250, 0.3);
}

.timer-ring.shortBreak {
  background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
  box-shadow: 0 8px 32px rgba(82, 196, 26, 0.3);
}

.timer-ring.longBreak {
  background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
  box-shadow: 0 8px 32px rgba(24, 144, 255, 0.3);
}

.timer-display {
  text-align: center;
}

.timer-time {
  display: block;
  font-size: 48px;
  font-weight: bold;
  color: white;
  font-variant-numeric: tabular-nums;
}

.timer-phase {
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
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: #8477fa;
  color: white;
}

.control-btn.start {
  background-color: #8477fa;
  box-shadow: 0 4px 16px rgba(132, 119, 250, 0.4);
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
  gap: 24px;
}

.btn-icon {
  font-size: 28px;
}

.btn-text {
  font-size: 14px;
  margin-top: 4px;
}

.skip-btn {
  padding: 8px 16px;
  color: #999;
  font-size: 14px;
  margin-bottom: 16px;
}

.task-input-section {
  width: 100%;
  max-width: 300px;
}

.task-input {
  width: 100%;
  height: 44px;
  border: 1px solid #ddd;
  border-radius: 22px;
  padding: 0 16px;
  text-align: center;
  font-size: 14px;
}

.stats-section {
  background-color: white;
  padding: 16px;
}

.stats-header {
  margin-bottom: 12px;
}

.stats-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
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
  color: #8477fa;
}

.stat-label {
  display: block;
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  z-index: 1000;
}

.modal-content {
  width: 100%;
  background-color: white;
  border-radius: 16px 16px 0 0;
  padding: 20px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-title {
  font-size: 18px;
  font-weight: bold;
}

.modal-close {
  font-size: 28px;
  color: #999;
}

.form-item {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.form-actions {
  margin-top: 24px;
}

.btn-save {
  width: 100%;
  height: 44px;
  background-color: #8477fa;
  color: white;
  border-radius: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  border: none;
}
</style>
