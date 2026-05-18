<template>
  <view class="achievement-3d-gallery">
    <!-- 3D展厅容器 -->
    <view class="gallery-container" @touchstart="onTouchStart" @touchmove="onTouchMove" @touchend="onTouchEnd">
      <!-- 3D画廊背景 -->
      <view class="gallery-bg">
        <view 
          v-for="(light, i) in ambientLights" 
          :key="i"
          class="ambient-light"
          :style="light.style"
        ></view>
      </view>

      <!-- 成就展示区 -->
      <view class="exhibition-area" :style="{ transform: `rotateY(${rotationY}deg) rotateX(${rotationX}deg)` }">
        <!-- 中心展台 -->
        <view class="center-pedestal">
          <view class="pedestal-base"></view>
          <view class="pedestal-glow" :class="{ active: selectedAchievement }"></view>
        </view>

        <!-- 成就展品（环形排列） -->
        <view 
          v-for="(achievement, index) in displayedAchievements" 
          :key="achievement.id"
          class="achievement-display"
          :class="{ 
            unlocked: achievement.isUnlocked, 
            locked: !achievement.isUnlocked,
            selected: selectedAchievement?.id === achievement.id
          }"
          :style="getAchievementStyle(index)"
          @tap="selectAchievement(achievement)"
        >
          <view class="display-frame" :class="'tier-' + achievement.tier">
            <text class="display-icon">{{ achievement.icon }}</text>
            <view v-if="!achievement.isUnlocked" class="lock-badge">
              <text>🔒</text>
            </view>
          </view>
          <view class="display-info">
            <text class="display-name">{{ achievement.isUnlocked ? achievement.name : '???' }}</text>
            <text class="display-category">{{ achievement.category }}</text>
          </view>
        </view>

        <!-- 解锁动画 -->
        <view class="unlock-animation" v-if="showUnlockAnimation">
          <view class="unlock-burst">
            <view 
              v-for="(ray, i) in unlockRays" 
              :key="i"
              class="unlock-ray"
              :style="{ transform: `rotate(${ray}deg)` }"
            ></view>
          </view>
          <text class="unlock-text">🎊 成就解锁!</text>
        </view>
      </view>

      <!-- 语音导览控制 -->
      <view class="voice-guide" v-if="selectedAchievement">
        <button class="guide-btn" @click="toggleVoiceGuide">
          <text>{{ isVoicePlaying ? '🔊' : '🔇' }}</text>
          <text>{{ isVoicePlaying ? '播放中' : '语音导览' }}</text>
        </button>
        <view class="guide-content" v-if="isVoicePlaying">
          <text class="guide-text">{{ voiceText }}</text>
        </view>
      </view>
    </view>

    <!-- 导航控制 -->
    <view class="gallery-nav">
      <view class="nav-indicator">
        <text class="nav-text">左右滑动旋转展厅</text>
      </view>
      <view class="nav-arrows">
        <button class="nav-arrow" @click="rotateGallery(-1)">
          <text>◀</text>
        </button>
        <view class="rotation-display">
          <text>{{ Math.abs(Math.round(rotationY / 45)) + 1 }} / {{ totalViews }}</text>
        </view>
        <button class="nav-arrow" @click="rotateGallery(1)">
          <text>▶</text>
        </button>
      </view>
    </view>

    <!-- 成就详情面板 -->
    <view class="achievement-detail" v-if="selectedAchievement" @tap="closeDetail">
      <view class="detail-panel" @tap.stop>
        <view class="detail-header">
          <view class="detail-icon" :class="'tier-' + selectedAchievement.tier">
            <text>{{ selectedAchievement.icon }}</text>
          </view>
          <view class="detail-title">
            <text class="detail-name">{{ selectedAchievement.name }}</text>
            <text class="detail-tier">{{ getTierName(selectedAchievement.tier) }}</text>
          </view>
          <button class="close-btn" @click="closeDetail">✕</button>
        </view>
        
        <view class="detail-body">
          <text class="detail-desc">{{ selectedAchievement.description }}</text>
          
          <view class="detail-stats">
            <view class="stat-item">
              <text class="stat-label">积分奖励</text>
              <text class="stat-value">{{ selectedAchievement.pointsAwarded }}</text>
            </view>
            <view class="stat-item">
              <text class="stat-label">稀有度</text>
              <text class="stat-value">{{ '⭐'.repeat(selectedAchievement.rare || 1) }}</text>
            </view>
            <view class="stat-item">
              <text class="stat-label">分类</text>
              <text class="stat-value">{{ selectedAchievement.category }}</text>
            </view>
          </view>

          <view class="detail-progress" v-if="!selectedAchievement.isUnlocked">
            <text class="progress-label">解锁进度</text>
            <view class="progress-bar">
              <view class="progress-fill" :style="{ width: selectedAchievement.progress + '%' }"></view>
            </view>
            <text class="progress-text">{{ selectedAchievement.progress || 0 }}%</text>
          </view>

          <view class="detail-actions">
            <button class="action-btn share-btn" @click="shareAchievement">
              <text>📤 分享</text>
            </button>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useAchievementStore } from '@/stores/achievementStore'
import { BADGE_TIERS } from '@/services/gamificationService.js'

export default {
  name: 'Achievement3DGallery',
  props: {
    achievements: {
      type: Array,
      default: () => []
    }
  },
  emits: ['select', 'unlock', 'share'],
  setup(props, { emit }) {
    const achievementStore = useAchievementStore()

    // 旋转状态
    const rotationY = ref(0)
    const rotationX = ref(-5)
    const isDragging = ref(false)
    const startX = ref(0)
    const startY = ref(0)
    
    // 选中状态
    const selectedAchievement = ref(null)
    const showUnlockAnimation = ref(false)
    
    // 语音导览
    const isVoicePlaying = ref(false)
    const voiceText = ref('')
    
    // 环境光
    const ambientLights = ref([
      { style: { top: '10%', left: '20%', background: 'rgba(255, 215, 0, 0.1)' } },
      { style: { top: '30%', right: '15%', background: 'rgba(78, 205, 196, 0.1)' } },
      { style: { bottom: '20%', left: '30%', background: 'rgba(139, 92, 246, 0.1)' } }
    ])

    // 解锁光线
    const unlockRays = computed(() => {
      const rays = []
      for (let i = 0; i < 12; i++) {
        rays.push(i * 30)
      }
      return rays
    })

    // 显示的成就（最多8个）
    const displayedAchievements = computed(() => {
      return props.achievements.length > 0 
        ? props.achievements.slice(0, 8)
        : getDefaultAchievements()
    })

    // 总视图数
    const totalViews = computed(() => {
      return Math.ceil(displayedAchievements.value.length / 4) || 1
    })

    // 获取默认成就
    const getDefaultAchievements = () => {
      return [
        { id: 'first_task', name: '初次任务', icon: '🌟', category: '任务', isUnlocked: true, tier: 'bronze', pointsAwarded: 10, rare: 1, description: '完成第一个任务', progress: 100 },
        { id: 'task_5', name: '小试牛刀', icon: '⭐', category: '任务', isUnlocked: true, tier: 'silver', pointsAwarded: 20, rare: 1, description: '累计完成5个任务', progress: 100 },
        { id: 'streak_3', name: '三连任务', icon: '🔥', category: '连续', isUnlocked: false, tier: 'bronze', pointsAwarded: 15, rare: 1, description: '连续3天完成任务', progress: 66 },
        { id: 'streak_7', name: '一周坚持', icon: '🌟', category: '连续', isUnlocked: false, tier: 'gold', pointsAwarded: 35, rare: 2, description: '连续7天完成任务', progress: 42 },
        { id: 'task_20', name: '任务达人', icon: '🌈', category: '任务', isUnlocked: true, tier: 'gold', pointsAwarded: 50, rare: 2, description: '累计完成20个任务', progress: 100 },
        { id: 'perfect_day', name: '完美一天', icon: '💎', category: '特殊', isUnlocked: false, tier: 'diamond', pointsAwarded: 100, rare: 3, description: '在一天内完成所有日常任务', progress: 25 },
        { id: 'speed_demon', name: '速度之星', icon: '⚡', category: '挑战', isUnlocked: false, tier: 'silver', pointsAwarded: 30, rare: 2, description: '在1小时内完成3个任务', progress: 0 },
        { id: 'explorer', name: '探索者', icon: '🔮', category: '特殊', isUnlocked: false, tier: 'diamond', pointsAwarded: 150, rare: 3, description: '解锁所有功能模块', progress: 75 }
      ]
    }

    // 计算成就位置
    const getAchievementStyle = (index) => {
      const total = displayedAchievements.value.length
      const angle = (index / total) * 360
      const radius = 280
      const radian = (angle * Math.PI) / 180
      const x = Math.sin(radian) * radius
      const z = Math.cos(radian) * radius - radius
      const y = Math.sin((index % 2) * 0.3) * 30
      
      return {
        transform: `translateX(${x}rpx) translateZ(${z}rpx) translateY(${y}rpx)`,
        animationDelay: `${index * 0.1}s`
      }
    }

    // 获取等级名称
    const getTierName = (tier) => {
      return BADGE_TIERS[tier]?.name || tier
    }

    // 触摸开始
    const onTouchStart = (e) => {
      isDragging.value = true
      startX.value = e.touches[0].clientX
      startY.value = e.touches[0].clientY
    }

    // 触摸移动
    const onTouchMove = (e) => {
      if (!isDragging.value) return
      
      const deltaX = e.touches[0].clientX - startX.value
      const deltaY = e.touches[0].clientY - startY.value
      
      rotationY.value += deltaX * 0.5
      rotationX.value = Math.max(-15, Math.min(10, rotationX.value - deltaY * 0.3))
      
      startX.value = e.touches[0].clientX
      startY.value = e.touches[0].clientY
    }

    // 触摸结束
    const onTouchEnd = () => {
      isDragging.value = false
    }

    // 旋转展厅
    const rotateGallery = (direction) => {
      rotationY.value += direction * 45
    }

    // 选择成就
    const selectAchievement = (achievement) => {
      selectedAchievement.value = achievement
      emit('select', achievement)
      
      // 播放解锁动画（如果未解锁）
      if (!achievement.isUnlocked && achievement.progress >= 100) {
        triggerUnlockAnimation()
      }
    }

    // 关闭详情
    const closeDetail = () => {
      selectedAchievement.value = null
    }

    // 触发解锁动画
    const triggerUnlockAnimation = () => {
      showUnlockAnimation.value = true
      setTimeout(() => {
        showUnlockAnimation.value = false
      }, 2000)
    }

    // 切换语音导览
    const toggleVoiceGuide = () => {
      isVoicePlaying.value = !isVoicePlaying.value
      if (isVoicePlaying.value && selectedAchievement.value) {
        voiceText.value = `欢迎来到成就展厅，这是${selectedAchievement.value.name}成就。${selectedAchievement.value.description}。`
      }
    }

    // 分享成就
    const shareAchievement = () => {
      if (selectedAchievement.value) {
        emit('share', selectedAchievement.value)
      }
    }

    return {
      rotationY,
      rotationX,
      selectedAchievement,
      showUnlockAnimation,
      unlockRays,
      displayedAchievements,
      totalViews,
      ambientLights,
      isVoicePlaying,
      voiceText,
      getAchievementStyle,
      getTierName,
      onTouchStart,
      onTouchMove,
      onTouchEnd,
      rotateGallery,
      selectAchievement,
      closeDetail,
      toggleVoiceGuide,
      shareAchievement
    }
  }
}
</script>

<style scoped>
.achievement-3d-gallery {
  width: 100%;
  height: 800rpx;
  position: relative;
  background: linear-gradient(180deg, #0f0f23 0%, #1a1a3e 100%);
  border-radius: 24rpx;
  overflow: hidden;
}

.gallery-container {
  width: 100%;
  height: 650rpx;
  perspective: 1000rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.gallery-bg {
  position: absolute;
  width: 100%;
  height: 100%;
  background: radial-gradient(ellipse at center, rgba(30, 30, 60, 0.8) 0%, transparent 70%);
}

.ambient-light {
  position: absolute;
  width: 200rpx;
  height: 200rpx;
  border-radius: 50%;
  filter: blur(40rpx);
}

.exhibition-area {
  width: 600rpx;
  height: 500rpx;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.1s ease-out;
}

.center-pedestal {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 120rpx;
  height: 120rpx;
}

.pedestal-base {
  width: 120rpx;
  height: 20rpx;
  background: linear-gradient(180deg, #4a4a6a 0%, #2a2a4a 100%);
  border-radius: 50%;
  position: absolute;
  bottom: 0;
}

.pedestal-glow {
  width: 80rpx;
  height: 80rpx;
  background: radial-gradient(circle, rgba(255, 215, 0, 0.3) 0%, transparent 70%);
  border-radius: 50%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  opacity: 0;
  transition: opacity 0.5s;
}

.pedestal-glow.active {
  opacity: 1;
  animation: pedestalPulse 2s ease-in-out infinite;
}

@keyframes pedestalPulse {
  0%, 100% { transform: translate(-50%, -50%) scale(1); }
  50% { transform: translate(-50%, -50%) scale(1.2); }
}

/* 成就展品 */
.achievement-display {
  position: absolute;
  top: 50%;
  left: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  cursor: pointer;
  transition: all 0.3s ease;
}

.achievement-display.unlocked {
  filter: drop-shadow(0 0 20rpx rgba(255, 215, 0, 0.5));
}

.achievement-display.locked {
  filter: grayscale(1) brightness(0.6);
  opacity: 0.7;
}

.achievement-display.selected .display-frame {
  transform: scale(1.2);
  box-shadow: 0 0 40rpx rgba(255, 215, 0, 0.8);
}

.display-frame {
  width: 100rpx;
  height: 100rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background: linear-gradient(135deg, #3a3a5a 0%, #2a2a4a 100%);
  transition: all 0.3s ease;
}

.display-frame.tier-bronze {
  background: linear-gradient(135deg, #CD7F32 0%, #A5673F 100%);
}

.display-frame.tier-silver {
  background: linear-gradient(135deg, #C0C0C0 0%, #A8A8A8 100%);
}

.display-frame.tier-gold {
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
}

.display-frame.tier-diamond {
  background: linear-gradient(135deg, #B9F2FF 0%, #87CEEB 100%);
  box-shadow: 0 0 20rpx rgba(185, 242, 255, 0.5);
}

.display-icon {
  font-size: 48rpx;
}

.lock-badge {
  position: absolute;
  top: -10rpx;
  right: -10rpx;
  width: 36rpx;
  height: 36rpx;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18rpx;
}

.display-info {
  text-align: center;
}

.display-name {
  font-size: 20rpx;
  color: #fff;
  display: block;
  max-width: 120rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.display-category {
  font-size: 16rpx;
  color: rgba(255, 255, 255, 0.6);
}

/* 解锁动画 */
.unlock-animation {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 100;
  text-align: center;
}

.unlock-burst {
  position: relative;
  width: 200rpx;
  height: 200rpx;
  animation: burstExpand 0.5s ease-out;
}

@keyframes burstExpand {
  0% { transform: scale(0); opacity: 0; }
  50% { transform: scale(1.2); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}

.unlock-ray {
  position: absolute;
  width: 4rpx;
  height: 100rpx;
  background: linear-gradient(180deg, rgba(255, 215, 0, 0.8), transparent);
  left: 50%;
  top: 50%;
  transform-origin: center bottom;
}

.unlock-text {
  display: block;
  margin-top: 20rpx;
  font-size: 32rpx;
  color: #FFD700;
  font-weight: bold;
  animation: textPop 0.5s ease-out 0.2s both;
}

@keyframes textPop {
  0% { transform: scale(0); }
  70% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

/* 语音导览 */
.voice-guide {
  position: absolute;
  bottom: 20rpx;
  left: 50%;
  transform: translateX(-50%);
  z-index: 50;
}

.guide-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  background: rgba(0, 0, 0, 0.6);
  padding: 12rpx 24rpx;
  border-radius: 30rpx;
  border: none;
  color: #fff;
  font-size: 24rpx;
}

.guide-content {
  margin-top: 12rpx;
  background: rgba(0, 0, 0, 0.8);
  padding: 16rpx 24rpx;
  border-radius: 12rpx;
  max-width: 500rpx;
}

.guide-text {
  font-size: 24rpx;
  color: #fff;
  line-height: 1.5;
}

/* 导航控制 */
.gallery-nav {
  position: absolute;
  bottom: 30rpx;
  left: 0;
  right: 0;
  padding: 0 30rpx;
  z-index: 50;
}

.nav-indicator {
  text-align: center;
  margin-bottom: 16rpx;
}

.nav-text {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.5);
}

.nav-arrows {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 30rpx;
}

.nav-arrow {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #fff;
  font-size: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-arrow:active {
  background: rgba(255, 255, 255, 0.2);
}

.rotation-display {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.8);
}

/* 详情面板 */
.achievement-detail {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 200;
}

.detail-panel {
  width: 100%;
  background: linear-gradient(180deg, #2a2a4a 0%, #1a1a3a 100%);
  border-radius: 24rpx 24rpx 0 0;
  padding: 30rpx;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 24rpx;
}

.detail-icon {
  width: 100rpx;
  height: 100rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 50rpx;
  flex-shrink: 0;
}

.detail-title {
  flex: 1;
}

.detail-name {
  font-size: 36rpx;
  color: #fff;
  font-weight: bold;
  display: block;
  margin-bottom: 4rpx;
}

.detail-tier {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.6);
}

.close-btn {
  width: 50rpx;
  height: 50rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #fff;
  font-size: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.detail-body {
  padding: 0 10rpx;
}

.detail-desc {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  display: block;
  margin-bottom: 24rpx;
}

.detail-stats {
  display: flex;
  gap: 30rpx;
  margin-bottom: 24rpx;
}

.stat-item {
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  padding: 16rpx;
  border-radius: 12rpx;
  text-align: center;
}

.stat-label {
  font-size: 20rpx;
  color: rgba(255, 255, 255, 0.5);
  display: block;
  margin-bottom: 4rpx;
}

.stat-value {
  font-size: 28rpx;
  color: #FFD700;
  font-weight: bold;
}

.detail-progress {
  margin-bottom: 24rpx;
}

.progress-label {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.6);
  display: block;
  margin-bottom: 8rpx;
}

.progress-bar {
  height: 12rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4ECDC4 0%, #44a08d 100%);
  border-radius: 6rpx;
  transition: width 0.5s ease;
}

.progress-text {
  font-size: 20rpx;
  color: rgba(255, 255, 255, 0.5);
  display: block;
  text-align: right;
  margin-top: 4rpx;
}

.detail-actions {
  display: flex;
  gap: 20rpx;
}

.action-btn {
  flex: 1;
  padding: 20rpx;
  border-radius: 12rpx;
  border: none;
  font-size: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
}

.share-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}
</style>
