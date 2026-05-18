<template>
  <view class="virtual-reward-space">
    <!-- AR礼物盒 -->
    <view class="gift-box-container" @tap="openGiftBox">
      <view class="gift-box" :class="{ opening: isOpening, opened: isOpened }">
        <!-- 盒子主体 -->
        <view class="gift-box-body">
          <view class="gift-ribbon ribbon-v"></view>
          <view class="gift-ribbon ribbon-h"></view>
          <view class="gift-bow">
            <view class="bow-center"></view>
            <view class="bow-loop left"></view>
            <view class="bow-loop right"></view>
          </view>
        </view>
        <!-- 盒子盖子 -->
        <view class="gift-box-lid" :class="{ 'lid-open': isOpening || isOpened }">
          <view class="lid-ribbon"></view>
        </view>
        <!-- 光芒效果 -->
        <view class="gift-glow" v-if="isOpening || isOpened"></view>
      </view>
      
      <!-- 提示文字 -->
      <view class="tap-hint" v-if="!isOpened">
        <text>👆 点击打开礼物盒</text>
      </view>
    </view>

    <!-- 开箱动画层 -->
    <view class="unbox-animation" v-if="isOpening">
      <view 
        v-for="(sparkle, i) in sparkles" 
        :key="i"
        class="sparkle"
        :style="sparkle.style"
      >{{ sparkle.icon }}</view>
    </view>

    <!-- 3D奖章/奖杯展示 -->
    <view class="trophy-showcase" v-if="isOpened">
      <view class="showcase-title">
        <text>🏆 恭喜获得!</text>
      </view>
      
      <swiper class="trophy-swiper" :current="currentTrophy" @change="onTrophyChange">
        <swiper-item v-for="(trophy, index) in awardedTrophies" :key="index">
          <view class="trophy-card">
            <view class="trophy-3d" :class="'trophy-' + trophy.type">
              <text class="trophy-icon">{{ trophy.icon }}</text>
              <view class="trophy-rays"></view>
            </view>
            <view class="trophy-info">
              <text class="trophy-name">{{ trophy.name }}</text>
              <text class="trophy-desc">{{ trophy.description }}</text>
              <view class="trophy-reward">
                <text class="reward-label">奖励:</text>
                <text class="reward-value">{{ trophy.reward }} 积分</text>
              </view>
            </view>
          </view>
        </swiper-item>
      </swiper>
      
      <view class="trophy-indicators">
        <view 
          v-for="(trophy, i) in awardedTrophies" 
          :key="i"
          class="indicator-dot"
          :class="{ active: i === currentTrophy }"
        ></view>
      </view>
    </view>

    <!-- 虚拟奖杯墙 -->
    <view class="trophy-wall" v-if="showTrophyWall">
      <view class="wall-header">
        <text class="wall-title">🏆 我的奖杯墙</text>
        <text class="wall-count">{{ unlockedTrophies.length }} / {{ totalTrophies.length }}</text>
      </view>
      
      <view class="wall-grid">
        <view 
          v-for="trophy in totalTrophies" 
          :key="trophy.id"
          class="wall-item"
          :class="{ unlocked: trophy.isUnlocked, locked: !trophy.isUnlocked }"
        >
          <view class="wall-trophy" :class="'wall-trophy-' + trophy.type">
            <text class="wall-icon">{{ trophy.isUnlocked ? trophy.icon : '❓' }}</text>
          </view>
          <text class="wall-name">{{ trophy.isUnlocked ? trophy.name : '???' }}</text>
        </view>
      </view>
    </view>

    <!-- 奖励详情 -->
    <view class="reward-details" v-if="selectedReward">
      <view class="details-card">
        <view class="details-header">
          <text class="details-title">奖励详情</text>
          <button class="details-close" @click="selectedReward = null">✕</button>
        </view>
        <view class="details-body">
          <view class="details-icon">
            <text>{{ selectedReward.icon }}</text>
          </view>
          <view class="details-info">
            <text class="details-name">{{ selectedReward.name }}</text>
            <text class="details-desc">{{ selectedReward.description }}</text>
          </view>
          <view class="details-actions">
            <button class="action-btn claim-btn" @click="claimReward">
              <text>领取奖励</text>
            </button>
            <button class="action-btn share-btn" @click="shareReward">
              <text>📤 分享</text>
            </button>
          </view>
        </view>
      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="reward-controls">
      <button class="reward-btn trophy-wall-btn" @click="showTrophyWall = !showTrophyWall">
        <text>🏆 奖杯墙</text>
      </button>
      <button class="reward-btn claim-all-btn" @click="claimAllRewards" v-if="hasClaimableRewards">
        <text>🎁 领取全部</text>
      </button>
    </view>
  </view>
</template>

<script>
import { ref, computed, onMounted } from 'vue'

export default {
  name: 'VirtualRewardSpace',
  props: {
    initialRewards: {
      type: Array,
      default: () => []
    }
  },
  emits: ['open', 'claim', 'share', 'trophyWallToggle'],
  setup(props, { emit }) {
    // 状态
    const isOpening = ref(false)
    const isOpened = ref(false)
    const showTrophyWall = ref(false)
    const currentTrophy = ref(0)
    const selectedReward = ref(null)
    
    // 数据
    const sparkles = ref([])
    const awardedTrophies = ref([])
    const hasClaimableRewards = ref(false)
    
    // 奖杯数据
    const totalTrophies = ref([
      { id: 'gold_cup', name: '金杯', icon: '🏆', type: 'gold', isUnlocked: true, description: '第一名奖励', reward: 500 },
      { id: 'silver_cup', name: '银杯', icon: '🥈', type: 'silver', isUnlocked: false, description: '第二名奖励', reward: 300 },
      { id: 'bronze_cup', name: '铜杯', icon: '🥉', type: 'bronze', isUnlocked: true, description: '第三名奖励', reward: 200 },
      { id: 'diamond_medal', name: '钻石勋章', icon: '💎', type: 'diamond', isUnlocked: false, description: '稀有成就奖励', reward: 1000 },
      { id: 'gold_medal', name: '金牌', icon: '🥇', type: 'gold', isUnlocked: true, description: '任务达人奖励', reward: 500 },
      { id: 'star_badge', name: '星星徽章', icon: '⭐', type: 'silver', isUnlocked: true, description: '新手奖励', reward: 100 },
      { id: 'crown', name: '皇冠', icon: '👑', type: 'diamond', isUnlocked: false, description: '尊贵会员奖励', reward: 2000 },
      { id: 'rocket', name: '火箭奖', icon: '🚀', type: 'gold', isUnlocked: false, description: '快速成长奖励', reward: 800 },
      { id: 'gem', name: '宝石奖', icon: '💠', type: 'diamond', isUnlocked: false, description: '收藏家奖励', reward: 1500 }
    ])

    // 解锁的奖杯
    const unlockedTrophies = computed(() => {
      return totalTrophies.value.filter(t => t.isUnlocked)
    })

    // 打开礼物盒
    const openGiftBox = () => {
      if (isOpening.value || isOpened.value) return
      
      isOpening.value = true
      emit('open')
      
      // 创建闪光效果
      createSparkles()
      
      // 模拟开箱时间
      setTimeout(() => {
        isOpening.value = false
        isOpened.value = true
        
        // 设置获得的奖杯
        awardedTrophies.value = props.initialRewards.length > 0 
          ? props.initialRewards 
          : [
              { 
                id: 'first_reward', 
                name: '首次奖励', 
                icon: '🎁', 
                type: 'gold',
                description: '恭喜获得首个奖励！', 
                reward: 100 
              }
            ]
        
        hasClaimableRewards.value = true
      }, 2000)
    }

    // 创建闪光效果
    const createSparkles = () => {
      const icons = ['✨', '⭐', '🌟', '💫', '✦', '🎊', '🎉']
      const newSparkles = []
      for (let i = 0; i < 30; i++) {
        newSparkles.push({
          icon: icons[Math.floor(Math.random() * icons.length)],
          style: {
            left: `${20 + Math.random() * 60}%`,
            top: `${20 + Math.random() * 60}%`,
            animationDelay: `${Math.random() * 0.5}s`,
            animationDuration: `${1 + Math.random()}s`
          }
        })
      }
      sparkles.value = newSparkles
      setTimeout(() => {
        sparkles.value = []
      }, 2000)
    }

    // 奖杯切换
    const onTrophyChange = (e) => {
      currentTrophy.value = e.detail.current
    }

    // 领取奖励
    const claimReward = () => {
      if (selectedReward.value) {
        emit('claim', selectedReward.value)
        selectedReward.value = null
      }
    }

    // 领取全部
    const claimAllRewards = () => {
      emit('claim', awardedTrophies.value)
      hasClaimableRewards.value = false
    }

    // 分享奖励
    const shareReward = () => {
      if (selectedReward.value) {
        emit('share', selectedReward.value)
      }
    }

    return {
      isOpening,
      isOpened,
      showTrophyWall,
      currentTrophy,
      selectedReward,
      sparkles,
      awardedTrophies,
      hasClaimableRewards,
      totalTrophies,
      unlockedTrophies,
      openGiftBox,
      onTrophyChange,
      claimReward,
      claimAllRewards,
      shareReward
    }
  }
}
</script>

<style scoped>
.virtual-reward-space {
  width: 100%;
  min-height: 700rpx;
  position: relative;
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  border-radius: 24rpx;
  overflow: hidden;
  padding: 30rpx;
}

/* 礼物盒 */
.gift-box-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40rpx 0;
  position: relative;
}

.gift-box {
  width: 200rpx;
  height: 200rpx;
  position: relative;
  cursor: pointer;
  transition: transform 0.3s;
}

.gift-box:active {
  transform: scale(0.95);
}

.gift-box-body {
  width: 200rpx;
  height: 160rpx;
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  border-radius: 8rpx;
  position: absolute;
  bottom: 0;
  overflow: hidden;
  box-shadow: 0 10rpx 30rpx rgba(231, 76, 60, 0.4);
}

.gift-ribbon {
  position: absolute;
  background: linear-gradient(135deg, #f1c40f 0%, #f39c12 100%);
}

.ribbon-v {
  width: 20rpx;
  height: 100%;
  left: 50%;
  transform: translateX(-50%);
}

.ribbon-h {
  width: 100%;
  height: 20rpx;
  top: 50%;
  transform: translateY(-50%);
}

.gift-bow {
  position: absolute;
  top: -30rpx;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;
}

.bow-center {
  width: 30rpx;
  height: 30rpx;
  background: linear-gradient(135deg, #f1c40f 0%, #f39c12 100%);
  border-radius: 50%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
}

.bow-loop {
  width: 50rpx;
  height: 50rpx;
  background: linear-gradient(135deg, #f1c40f 0%, #f39c12 100%);
  border-radius: 50% 50% 0 50%;
  position: absolute;
  top: 0;
}

.bow-loop.left {
  transform: rotate(-45deg);
  left: -35rpx;
}

.bow-loop.right {
  transform: rotate(45deg);
  right: -35rpx;
}

.gift-box-lid {
  width: 220rpx;
  height: 40rpx;
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  border-radius: 8rpx 8rpx 0 0;
  position: absolute;
  top: 0;
  left: -10rpx;
  transform-origin: bottom center;
  transition: transform 0.5s ease;
  z-index: 3;
}

.gift-box-lid.lid-open {
  transform: rotateX(-120deg) translateY(-20rpx);
}

.lid-ribbon {
  position: absolute;
  width: 100%;
  height: 15rpx;
  background: linear-gradient(135deg, #f1c40f 0%, #f39c12 100%);
  top: 50%;
  transform: translateY(-50%);
}

.gift-glow {
  position: absolute;
  width: 300rpx;
  height: 300rpx;
  background: radial-gradient(circle, rgba(255, 215, 0, 0.4) 0%, transparent 70%);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: glowPulse 1s ease-in-out infinite;
  pointer-events: none;
}

@keyframes glowPulse {
  0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
  50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
}

.tap-hint {
  margin-top: 30rpx;
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.7);
  animation: hintBounce 2s ease-in-out infinite;
}

@keyframes hintBounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10rpx); }
}

/* 开箱动画 */
.unbox-animation {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 100;
}

.sparkle {
  position: absolute;
  font-size: 36rpx;
  animation: sparkleFloat 1.5s ease-out forwards;
}

@keyframes sparkleFloat {
  0% {
    opacity: 1;
    transform: translateY(0) scale(0);
  }
  50% {
    opacity: 1;
    transform: translateY(-50rpx) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(-150rpx) scale(0.5);
  }
}

/* 奖杯展示 */
.trophy-showcase {
  margin-top: 30rpx;
  text-align: center;
}

.showcase-title {
  font-size: 36rpx;
  color: #FFD700;
  font-weight: bold;
  margin-bottom: 20rpx;
}

.trophy-swiper {
  height: 400rpx;
  width: 100%;
}

.trophy-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30rpx;
}

.trophy-3d {
  width: 200rpx;
  height: 200rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin-bottom: 20rpx;
}

.trophy-3d.trophy-gold {
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  box-shadow: 0 0 40rpx rgba(255, 215, 0, 0.6);
}

.trophy-3d.trophy-silver {
  background: linear-gradient(135deg, #C0C0C0 0%, #A8A8A8 100%);
  box-shadow: 0 0 40rpx rgba(192, 192, 192, 0.6);
}

.trophy-3d.trophy-bronze {
  background: linear-gradient(135deg, #CD7F32 0%, #A5673F 100%);
  box-shadow: 0 0 40rpx rgba(205, 127, 50, 0.6);
}

.trophy-3d.trophy-diamond {
  background: linear-gradient(135deg, #B9F2FF 0%, #87CEEB 100%);
  box-shadow: 0 0 40rpx rgba(185, 242, 255, 0.6);
}

.trophy-icon {
  font-size: 100rpx;
  z-index: 2;
}

.trophy-rays {
  position: absolute;
  width: 100%;
  height: 100%;
  background: conic-gradient(from 0deg, transparent, rgba(255, 255, 255, 0.3), transparent, rgba(255, 255, 255, 0.3), transparent);
  border-radius: 50%;
  animation: raysSpin 3s linear infinite;
}

@keyframes raysSpin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.trophy-info {
  text-align: center;
}

.trophy-name {
  font-size: 32rpx;
  color: #fff;
  font-weight: bold;
  display: block;
  margin-bottom: 8rpx;
}

.trophy-desc {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.7);
  display: block;
  margin-bottom: 12rpx;
}

.trophy-reward {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  background: rgba(255, 215, 0, 0.2);
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
}

.reward-label {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.7);
}

.reward-value {
  font-size: 26rpx;
  color: #FFD700;
  font-weight: bold;
}

.trophy-indicators {
  display: flex;
  justify-content: center;
  gap: 12rpx;
  margin-top: 20rpx;
}

.indicator-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transition: all 0.3s;
}

.indicator-dot.active {
  background: #FFD700;
  width: 24rpx;
  border-radius: 6rpx;
}

/* 奖杯墙 */
.trophy-wall {
  margin-top: 30rpx;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 16rpx;
  padding: 20rpx;
}

.wall-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.wall-title {
  font-size: 30rpx;
  color: #fff;
  font-weight: bold;
}

.wall-count {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.6);
}

.wall-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20rpx;
}

.wall-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.wall-item.locked {
  opacity: 0.5;
}

.wall-trophy {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
}

.wall-item.unlocked .wall-trophy {
  background: rgba(255, 215, 0, 0.2);
}

.wall-icon {
  font-size: 40rpx;
}

.wall-name {
  font-size: 20rpx;
  color: rgba(255, 255, 255, 0.7);
  max-width: 100rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 奖励详情 */
.reward-details {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 500;
}

.details-card {
  width: 100%;
  background: linear-gradient(180deg, #2a2a4a 0%, #1a1a3a 100%);
  border-radius: 24rpx 24rpx 0 0;
  padding: 30rpx;
}

.details-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.details-title {
  font-size: 32rpx;
  color: #fff;
  font-weight: bold;
}

.details-close {
  width: 50rpx;
  height: 50rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #fff;
  font-size: 28rpx;
}

.details-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20rpx;
}

.details-icon {
  width: 150rpx;
  height: 150rpx;
  background: rgba(255, 215, 0, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 80rpx;
}

.details-info {
  text-align: center;
}

.details-name {
  font-size: 36rpx;
  color: #fff;
  font-weight: bold;
  display: block;
  margin-bottom: 8rpx;
}

.details-desc {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.7);
}

.details-actions {
  display: flex;
  gap: 20rpx;
  width: 100%;
  margin-top: 20rpx;
}

.action-btn {
  flex: 1;
  padding: 20rpx;
  border-radius: 12rpx;
  border: none;
  font-size: 28rpx;
}

.claim-btn {
  background: linear-gradient(135deg, #4ECDC4 0%, #44a08d 100%);
  color: #fff;
}

.share-btn {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

/* 控制按钮 */
.reward-controls {
  display: flex;
  gap: 20rpx;
  margin-top: 30rpx;
}

.reward-btn {
  flex: 1;
  padding: 20rpx;
  border-radius: 12rpx;
  border: none;
  font-size: 28rpx;
  color: #fff;
}

.trophy-wall-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.claim-all-btn {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  animation: claimPulse 2s ease-in-out infinite;
}

@keyframes claimPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(240, 147, 251, 0.4); }
  50% { box-shadow: 0 0 0 10rpx rgba(240, 147, 251, 0); }
}
</style>
