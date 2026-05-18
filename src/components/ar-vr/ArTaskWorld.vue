<template>
  <view class="ar-task-world">
    <!-- AR扫描区域 -->
    <view class="ar-scanner" @touchstart="startScan" @touchend="endScan">
      <canvas 
        ref="arCanvas" 
        class="ar-canvas"
        :class="{ scanning: isScanning, 'ar-active': isArActive }"
      ></canvas>
      
      <!-- AR扫描框 -->
      <view class="scan-frame" v-if="showScanFrame">
        <view class="scan-corner top-left"></view>
        <view class="scan-corner top-right"></view>
        <view class="scan-corner bottom-left"></view>
        <view class="scan-corner bottom-right"></view>
        <view class="scan-line" :class="{ active: isScanning }"></view>
      </view>
    </view>

    <!-- 3D任务星球展示 -->
    <view class="task-planet-container" v-if="currentTask">
      <view class="planet-wrapper" :class="'planet-' + currentTask.priority">
        <!-- 星球主体 -->
        <view class="planet-core">
          <text class="planet-emoji">{{ getPlanetEmoji(currentTask.priority) }}</text>
        </view>
        <!-- 轨道环 -->
        <view class="planet-orbit orbit-1"></view>
        <view class="planet-orbit orbit-2"></view>
        <!-- 任务信息 -->
        <view class="planet-info">
          <text class="task-name">{{ currentTask.name }}</text>
          <view class="task-rewards">
            <text class="reward-icon">⭐</text>
            <text class="reward-value">{{ currentTask.reward || 10 }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- AR特效层 -->
    <view class="ar-effects" v-if="showArEffect">
      <view 
        v-for="(particle, index) in particles" 
        :key="index"
        class="ar-particle"
        :style="particle.style"
      >{{ particle.icon }}</view>
    </view>

    <!-- AR寻宝提示 -->
    <view class="treasure-hunt" v-if="showTreasureHunt">
      <view class="treasure-clue">
        <text class="clue-icon">🔍</text>
        <text class="clue-text">{{ treasureClue }}</text>
      </view>
      <view class="treasure-progress">
        <view 
          v-for="i in 5" 
          :key="i" 
          class="progress-dot"
          :class="{ found: i <= treasureFound }"
        ></view>
      </view>
    </view>

    <!-- 任务完成庆祝 -->
    <view class="task-celebration" v-if="showCelebration">
      <view class="celebration-content">
        <text class="celebration-emoji">🎉</text>
        <text class="celebration-title">任务完成!</text>
        <text class="celebration-points">+{{ earnedPoints }} 积分</text>
      </view>
      <view class="confetti-container">
        <view 
          v-for="(conf, i) in confetti" 
          :key="i"
          class="confetti-piece"
          :style="conf.style"
        ></view>
      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="ar-controls">
      <button 
        class="ar-btn scan-btn" 
        @click="toggleScan"
        :disabled="isScanning"
      >
        <text>{{ isScanning ? '扫描中...' : 'AR扫描' }}</text>
      </button>
      <button 
        class="ar-btn treasure-btn" 
        @click="startTreasureHunt"
        v-if="hasTreasure"
      >
        <text>🎯 寻宝</text>
      </button>
    </view>
  </view>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'

export default {
  name: 'ArTaskWorld',
  props: {
    initialTask: {
      type: Object,
      default: null
    }
  },
  emits: ['taskComplete', 'treasureFound', 'scanResult'],
  setup(props, { emit }) {

    // AR状态
    const isScanning = ref(false)
    const isArActive = ref(false)
    const showScanFrame = ref(false)
    const showArEffect = ref(false)
    const showCelebration = ref(false)
    const showTreasureHunt = ref(false)
    
    // 当前任务
    const currentTask = ref(props.initialTask)
    
    // 特效数据
    const particles = ref([])
    const confetti = ref([])
    const earnedPoints = ref(0)
    
    // 寻宝数据
    const treasureClue = ref('')
    const treasureFound = ref(0)
    const hasTreasure = ref(false)
    
    // Canvas引用
    const arCanvas = ref(null)
    let scanTimer = null
    let animationFrame = null

    // 获取星球emoji
    const getPlanetEmoji = (priority) => {
      const emojiMap = {
        high: '🌟',
        medium: '⭐',
        low: '🌙'
      }
      return emojiMap[priority] || '🪐'
    }

    // 开始扫描
    const startScan = () => {
      if (isScanning.value) return
      isScanning.value = true
      showScanFrame.value = true
      simulateArScan()
    }

    // 结束扫描
    const endScan = () => {
      isScanning.value = false
      showScanFrame.value = false
      if (scanTimer) {
        clearTimeout(scanTimer)
        scanTimer = null
      }
    }

    // 切换扫描
    const toggleScan = () => {
      if (isScanning.value) {
        endScan()
      } else {
        startScan()
        setTimeout(() => {
          if (isScanning.value) {
            endScan()
            emit('scanResult', { success: true, task: currentTask.value })
          }
        }, 3000)
      }
    }

    // 模拟AR扫描
    const simulateArScan = () => {
      // 模拟扫描动画和数据获取
      scanTimer = setTimeout(() => {
        if (isScanning.value) {
          isArActive.value = true
          showArEffect.value = true
          createParticles()
        }
      }, 1500)
    }

    // 创建AR粒子效果
    const createParticles = () => {
      const icons = ['✨', '⭐', '🌟', '💫', '✦']
      const newParticles = []
      for (let i = 0; i < 20; i++) {
        newParticles.push({
          icon: icons[Math.floor(Math.random() * icons.length)],
          style: {
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 0.5}s`,
            transform: `scale(${0.5 + Math.random()})`
          }
        })
      }
      particles.value = newParticles
      setTimeout(() => {
        showArEffect.value = false
        particles.value = []
      }, 2000)
    }

    // 开始寻宝
    const startTreasureHunt = () => {
      showTreasureHunt.value = true
      treasureClue.value = '在"成长"页面寻找隐藏的星星...'
      treasureFound.value = 0
      
      // 模拟寻宝进度
      const huntInterval = setInterval(() => {
        treasureFound.value++
        if (treasureFound.value >= 5) {
          clearInterval(huntInterval)
          showTreasureHunt.value = false
          emit('treasureFound', { rewards: 50 })
          triggerCelebration(50)
        }
      }, 1000)
    }

    // 任务完成庆祝
    const triggerCelebration = (points) => {
      earnedPoints.value = points || currentTask.value?.reward || 10
      showCelebration.value = true
      createConfetti()
      
      setTimeout(() => {
        showCelebration.value = false
        confetti.value = []
      }, 3000)
    }

    // 创建彩带效果
    const createConfetti = () => {
      const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181']
      const newConfetti = []
      for (let i = 0; i < 50; i++) {
        newConfetti.push({
          style: {
            left: `${Math.random() * 100}%`,
            backgroundColor: colors[Math.floor(Math.random() * colors.length)],
            animationDelay: `${Math.random() * 0.8}s`,
            animationDuration: `${1 + Math.random() * 1.5}s`
          }
        })
      }
      confetti.value = newConfetti
    }

    // 完成任务
    const completeTask = (taskId) => {
      const task = currentTask.value
      if (task) {
        currentTask.value = task
        const points = task.reward || 10
        triggerCelebration(points)
        emit('taskComplete', { taskId, points })
      }
    }

    onMounted(() => {
      // 初始化AR场景
      if (currentTask.value) {
        // 设置当前任务
      }
    })

    onUnmounted(() => {
      if (scanTimer) clearTimeout(scanTimer)
      if (animationFrame) cancelAnimationFrame(animationFrame)
    })

    return {
      arCanvas,
      isScanning,
      isArActive,
      showScanFrame,
      showArEffect,
      showCelebration,
      showTreasureHunt,
      currentTask,
      particles,
      confetti,
      earnedPoints,
      treasureClue,
      treasureFound,
      hasTreasure,
      getPlanetEmoji,
      startScan,
      endScan,
      toggleScan,
      startTreasureHunt,
      completeTask
    }
  }
}
</script>

<style scoped>
.ar-task-world {
  width: 100%;
  min-height: 600rpx;
  position: relative;
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 24rpx;
  overflow: hidden;
  padding: 20rpx;
}

.ar-scanner {
  width: 100%;
  height: 400rpx;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ar-canvas {
  width: 100%;
  height: 100%;
  border-radius: 16rpx;
  background: rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
}

.ar-canvas.scanning {
  background: rgba(78, 205, 196, 0.1);
  box-shadow: 0 0 30rpx rgba(78, 205, 196, 0.3);
}

.ar-canvas.ar-active {
  background: rgba(255, 215, 0, 0.1);
  box-shadow: 0 0 50rpx rgba(255, 215, 0, 0.4);
}

.scan-frame {
  position: absolute;
  width: 400rpx;
  height: 400rpx;
  pointer-events: none;
}

.scan-corner {
  position: absolute;
  width: 40rpx;
  height: 40rpx;
  border-color: #4ECDC4;
  border-style: solid;
}

.scan-corner.top-left {
  top: 0;
  left: 0;
  border-width: 4rpx 0 0 4rpx;
  border-radius: 8rpx 0 0 0;
}

.scan-corner.top-right {
  top: 0;
  right: 0;
  border-width: 4rpx 4rpx 0 0;
  border-radius: 0 8rpx 0 0;
}

.scan-corner.bottom-left {
  bottom: 0;
  left: 0;
  border-width: 0 0 4rpx 4rpx;
  border-radius: 0 0 0 8rpx;
}

.scan-corner.bottom-right {
  bottom: 0;
  right: 0;
  border-width: 0 4rpx 4rpx 0;
  border-radius: 0 0 8rpx 0;
}

.scan-line {
  position: absolute;
  width: 80%;
  left: 10%;
  height: 2rpx;
  background: linear-gradient(90deg, transparent, #4ECDC4, transparent);
  top: 50%;
  opacity: 0;
  transition: opacity 0.3s;
}

.scan-line.active {
  opacity: 1;
  animation: scanMove 1.5s ease-in-out infinite;
}

@keyframes scanMove {
  0%, 100% { top: 20%; }
  50% { top: 80%; }
}

/* 任务星球 */
.task-planet-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
}

.planet-wrapper {
  position: relative;
  width: 200rpx;
  height: 200rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.planet-core {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 40rpx rgba(102, 126, 234, 0.5);
  animation: planetPulse 2s ease-in-out infinite;
  z-index: 2;
}

.planet-high .planet-core {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  box-shadow: 0 0 40rpx rgba(245, 87, 108, 0.5);
}

.planet-medium .planet-core {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  box-shadow: 0 0 40rpx rgba(79, 172, 254, 0.5);
}

.planet-low .planet-core {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
  box-shadow: 0 0 40rpx rgba(168, 237, 234, 0.5);
}

.planet-emoji {
  font-size: 60rpx;
}

@keyframes planetPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.planet-orbit {
  position: absolute;
  border: 1rpx solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  animation: orbitRotate 10s linear infinite;
}

.planet-orbit.orbit-1 {
  width: 160rpx;
  height: 160rpx;
}

.planet-orbit.orbit-2 {
  width: 200rpx;
  height: 200rpx;
  animation-direction: reverse;
  animation-duration: 15s;
}

@keyframes orbitRotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.planet-info {
  position: absolute;
  bottom: -60rpx;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  white-space: nowrap;
}

.task-name {
  font-size: 28rpx;
  color: #fff;
  font-weight: bold;
  text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.5);
}

.task-rewards {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4rpx;
  margin-top: 4rpx;
}

.reward-icon {
  font-size: 20rpx;
}

.reward-value {
  font-size: 22rpx;
  color: #FFD700;
}

/* AR特效 */
.ar-effects {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 20;
}

.ar-particle {
  position: absolute;
  font-size: 32rpx;
  animation: particleFloat 2s ease-out forwards;
}

@keyframes particleFloat {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(-100rpx) scale(0);
  }
}

/* 寻宝 */
.treasure-hunt {
  position: absolute;
  bottom: 200rpx;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  padding: 20rpx 30rpx;
  border-radius: 16rpx;
  z-index: 30;
}

.treasure-clue {
  display: flex;
  align-items: center;
  gap: 10rpx;
  margin-bottom: 16rpx;
}

.clue-icon {
  font-size: 32rpx;
}

.clue-text {
  font-size: 24rpx;
  color: #fff;
}

.treasure-progress {
  display: flex;
  gap: 12rpx;
  justify-content: center;
}

.progress-dot {
  width: 20rpx;
  height: 20rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transition: all 0.3s;
}

.progress-dot.found {
  background: #FFD700;
  box-shadow: 0 0 10rpx rgba(255, 215, 0, 0.8);
}

/* 庆祝 */
.task-celebration {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 100;
  text-align: center;
}

.celebration-content {
  background: rgba(0, 0, 0, 0.85);
  padding: 40rpx 60rpx;
  border-radius: 24rpx;
  animation: celebrationPop 0.5s ease-out;
}

@keyframes celebrationPop {
  0% { transform: scale(0); opacity: 0; }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); opacity: 1; }
}

.celebration-emoji {
  font-size: 80rpx;
  display: block;
  margin-bottom: 16rpx;
}

.celebration-title {
  font-size: 36rpx;
  color: #fff;
  font-weight: bold;
  display: block;
  margin-bottom: 8rpx;
}

.celebration-points {
  font-size: 28rpx;
  color: #FFD700;
}

.confetti-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
}

.confetti-piece {
  position: absolute;
  width: 10rpx;
  height: 20rpx;
  top: 50%;
  border-radius: 2rpx;
  animation: confettiFall 2s ease-out forwards;
}

@keyframes confettiFall {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(300rpx) rotate(720deg);
    opacity: 0;
  }
}

/* 控制按钮 */
.ar-controls {
  position: absolute;
  bottom: 30rpx;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 20rpx;
  z-index: 50;
}

.ar-btn {
  padding: 16rpx 32rpx;
  border-radius: 30rpx;
  font-size: 26rpx;
  border: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  box-shadow: 0 4rpx 15rpx rgba(102, 126, 234, 0.4);
}

.ar-btn:active {
  transform: scale(0.95);
}

.ar-btn:disabled {
  opacity: 0.6;
}

.treasure-btn {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  box-shadow: 0 4rpx 15rpx rgba(245, 87, 108, 0.4);
}
</style>
