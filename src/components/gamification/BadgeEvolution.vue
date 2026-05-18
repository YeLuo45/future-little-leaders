<template>
  <view class="badge-evolution">
    <!-- 进化动画层 -->
    <view class="evolution-overlay" v-if="showAnimation" @tap="closeAnimation">
      <view class="evolution-content" @tap.stop>
        <!-- 中心徽章 -->
        <view class="evolution-center">
          <view class="glow-ring"></view>
          <view class="badge-base">
            <text class="badge-emoji">{{ badge?.icon }}</text>
          </view>
          <!-- 粒子效果 -->
          <view class="particles">
            <view 
              class="particle" 
              v-for="i in 12" 
              :key="i" 
              :style="getParticleStyle(i)"
            ></view>
          </view>
          <!-- 闪光效果 -->
          <view class="sparkles">
            <text class="sparkle" v-for="i in 8" :key="i" :style="getSparkleStyle(i)">✨</text>
          </view>
        </view>

        <!-- 等级变化 -->
        <view class="tier-transition">
          <view class="tier-badge old-tier">
            <text class="tier-name">{{ oldTierName }}</text>
          </view>
          <view class="arrow">
            <text class="arrow-icon">→</text>
          </view>
          <view class="tier-badge new-tier">
            <text class="tier-name">{{ newTierName }}</text>
          </view>
        </view>

        <!-- 进化成功文字 -->
        <view class="evolution-text">
          <text class="text-main">进化成功！</text>
        </view>

        <!-- 进化特效 -->
        <view class="evolution-effects">
          <view class="rays">
            <view class="ray" v-for="i in 8" :key="i" :style="getRayStyle(i)"></view>
          </view>
        </view>

        <button class="close-btn" @tap="closeAnimation">太棒了！</button>
      </view>
    </view>

    <!-- 进化进度条 (非动画状态) -->
    <view class="evolution-progress-card" v-if="!showAnimation && evolutionInfo">
      <view class="card-header">
        <text class="header-title">💎 徽章进化</text>
        <text class="fragments-count">拥有: {{ fragments }} 碎片</text>
      </view>

      <view class="evolution-paths" v-if="!isMaxTier">
        <view 
          class="evolution-path" 
          v-for="(tier, index) in nextTiers" 
          :key="tier.id"
          :class="{ available: canEvolveTo(tier.id) }"
          @tap="attemptEvolve(tier.id)"
        >
          <view class="path-from">
            <text class="tier-icon">{{ getCurrentTierIcon() }}</text>
            <text class="tier-name">{{ getTierName(currentTier) }}</text>
          </view>
          <view class="path-arrow">
            <text class="arrow-line">→</text>
          </view>
          <view class="path-to">
            <text class="tier-icon">{{ getTierIcon(tier.id) }}</text>
            <text class="tier-name">{{ tier.name }}</text>
            <view class="cost-badge">
              <text class="cost-icon">💎</text>
              <text class="cost-value">{{ getFragmentCost(tier.id) }}</text>
            </view>
          </view>
        </view>
      </view>

      <view class="max-tier-display" v-else>
        <text class="max-text">🌟 已达最高等级</text>
        <text class="max-desc">钻石徽章，身份的象征！</text>
      </view>
    </view>
  </view>
</template>

<script>
import { ref, computed } from 'vue'
import { useGamificationStore } from '@/stores/gamificationStore'
import { BADGE_TIERS } from '@/services/gamificationService.js'

export default {
  name: 'BadgeEvolution',
  props: {
    badgeId: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const gamificationStore = useGamificationStore()
    const showAnimation = ref(false)
    const fragments = ref(0)

    const badge = computed(() => {
      return gamificationStore.allBadges.find(b => b.id === props.badgeId)
    })

    const currentTier = computed(() => gamificationStore.getBadgeTier(props.badgeId))

    const evolutionInfo = computed(() => gamificationStore.getBadgeEvolutionInfo(props.badgeId))

    const isMaxTier = computed(() => evolutionInfo.value?.isMaxTier || false)

    const tierOrder = ['bronze', 'silver', 'gold', 'diamond']

    const nextTiers = computed(() => {
      const currentIndex = tierOrder.indexOf(currentTier.value)
      return tierOrder.slice(currentIndex + 1).map(id => BADGE_TIERS[id])
    })

    const oldTierName = computed(() => BADGE_TIERS[evolutionInfo.value?.oldTier]?.name || '青铜')
    const newTierName = computed(() => BADGE_TIERS[evolutionInfo.value?.newTier]?.name || '白银')

    const loadFragments = () => {
      fragments.value = gamificationStore.userFragments
    }

    const canEvolveTo = (tierId) => {
      const cost = gamificationService.getBadgeFragmentsRequired(tierId)
      return fragments.value >= cost
    }

    const getTierName = (tierId) => {
      return BADGE_TIERS[tierId]?.name || tierId
    }

    const getTierIcon = (tierId) => {
      const icons = { bronze: '🥉', silver: '🥈', gold: '🥇', diamond: '💎' }
      return icons[tierId] || '📛'
    }

    const getCurrentTierIcon = () => getTierIcon(currentTier.value)

    const getFragmentCost = (tierId) => {
      return gamificationService.getBadgeFragmentsRequired(tierId)
    }

    const attemptEvolve = (tierId) => {
      const cost = getFragmentCost(tierId)
      if (fragments.value < cost) {
        uni.showToast({ title: `需要${cost}碎片，当前只有${fragments.value}`, icon: 'none' })
        return
      }
      const success = gamificationStore.evolveBadge(props.badgeId)
      if (success) {
        showAnimation.value = true
        loadFragments()
      }
    }

    const closeAnimation = () => {
      showAnimation.value = false
    }

    // 动画样式
    const getParticleStyle = (index) => {
      const angle = (index / 12) * 360
      const delay = index * 0.1
      return {
        '--angle': `${angle}deg`,
        '--delay': `${delay}s`
      }
    }

    const getSparkleStyle = (index) => {
      const angle = (index / 8) * 360
      const delay = index * 0.15
      return {
        '--angle': `${angle}deg`,
        '--delay': `${delay}s`,
        '--distance': '120rpx'
      }
    }

    const getRayStyle = (index) => {
      const angle = (index / 8) * 360
      return {
        '--angle': `${angle}deg`
      }
    }

    return {
      badge,
      currentTier,
      evolutionInfo,
      isMaxTier,
      nextTiers,
      oldTierName,
      newTierName,
      fragments,
      showAnimation,
      canEvolveTo,
      getTierName,
      getTierIcon,
      getCurrentTierIcon,
      getFragmentCost,
      attemptEvolve,
      closeAnimation,
      getParticleStyle,
      getSparkleStyle,
      getRayStyle,
      loadFragments
    }
  }
}

// 导入 gamificationService
import gamificationService from '@/services/gamificationService.js'
</script>

<style scoped>
.badge-evolution {
  position: relative;
}

/* 进化动画 Overlay */
.evolution-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.evolution-content {
  position: relative;
  text-align: center;
  color: #fff;
}

/* 中心徽章 */
.evolution-center {
  position: relative;
  width: 200rpx;
  height: 200rpx;
  margin: 0 auto;
}

.glow-ring {
  position: absolute;
  top: -20rpx;
  left: -20rpx;
  right: -20rpx;
  bottom: -20rpx;
  border-radius: 50%;
  background: linear-gradient(45deg, #FFD700, #FFA500, #FF6B6B, #FFA500, #FFD700);
  animation: glowPulse 1.5s ease-in-out infinite;
}

@keyframes glowPulse {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.1); }
}

.badge-base {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 140rpx;
  height: 140rpx;
  background: linear-gradient(135deg, #FFD700, #FFA500);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 40rpx rgba(255, 215, 0, 0.6);
  animation: badgeBounce 0.6s ease;
}

@keyframes badgeBounce {
  0% { transform: translate(-50%, -50%) scale(0); }
  50% { transform: translate(-50%, -50%) scale(1.2); }
  100% { transform: translate(-50%, -50%) scale(1); }
}

.badge-emoji {
  font-size: 72rpx;
}

/* 粒子效果 */
.particles {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
}

.particle {
  position: absolute;
  width: 12rpx;
  height: 12rpx;
  background: #FFD700;
  border-radius: 50%;
  animation: particleOrbit 2s linear infinite;
  animation-delay: var(--delay);
}

@keyframes particleOrbit {
  0% { 
    transform: rotate(var(--angle)) translateX(80rpx) rotate(calc(-1 * var(--angle)));
    opacity: 1;
  }
  100% { 
    transform: rotate(calc(var(--angle) + 360deg)) translateX(80rpx) rotate(calc(-1 * var(--angle) - 360deg));
    opacity: 0.5;
  }
}

/* 闪光效果 */
.sparkles {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
}

.sparkle {
  position: absolute;
  font-size: 24rpx;
  animation: sparkleFloat 1.5s ease-in-out infinite;
  animation-delay: var(--delay);
}

@keyframes sparkleFloat {
  0%, 100% { 
    transform: rotate(var(--angle)) translateY(calc(-1 * var(--distance))) scale(0.5);
    opacity: 0.3;
  }
  50% { 
    transform: rotate(var(--angle)) translateY(calc(-1 * var(--distance) - 20rpx)) scale(1);
    opacity: 1;
  }
}

/* 等级过渡 */
.tier-transition {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 30rpx;
  margin: 40rpx 0 30rpx;
}

.tier-badge {
  padding: 12rpx 24rpx;
  border-radius: 20rpx;
  background: rgba(255, 255, 255, 0.2);
}

.old-tier {
  background: linear-gradient(135deg, #CD7F32, #A5673F);
}

.new-tier {
  background: linear-gradient(135deg, #C0C0C0, #A8A8A8);
  animation: newTierGlow 1s ease infinite alternate;
}

@keyframes newTierGlow {
  from { box-shadow: 0 0 10rpx rgba(192, 192, 192, 0.5); }
  to { box-shadow: 0 0 30rpx rgba(192, 192, 192, 0.8); }
}

.tier-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #fff;
}

.arrow-icon {
  font-size: 40rpx;
  color: #FFD700;
  animation: arrowPulse 0.5s ease infinite alternate;
}

@keyframes arrowPulse {
  from { transform: translateX(-5rpx); }
  to { transform: translateX(5rpx); }
}

/* 成功文字 */
.evolution-text {
  margin-bottom: 40rpx;
}

.text-main {
  font-size: 48rpx;
  font-weight: bold;
  background: linear-gradient(90deg, #FFD700, #FFA500, #FF6B6B);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: textShine 2s ease infinite;
}

@keyframes textShine {
  0%, 100% { filter: brightness(1); }
  50% { filter: brightness(1.3); }
}

/* 放射线效果 */
.evolution-effects {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 400rpx;
  height: 400rpx;
  pointer-events: none;
}

.rays {
  position: relative;
  width: 100%;
  height: 100%;
}

.ray {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 4rpx;
  height: 150rpx;
  background: linear-gradient(to top, transparent, rgba(255, 215, 0, 0.8));
  transform-origin: bottom center;
  transform: rotate(var(--angle)) translateY(-50%);
  animation: rayPulse 1s ease infinite;
  animation-delay: calc(var(--angle) * 0.01);
}

@keyframes rayPulse {
  0%, 100% { opacity: 0.3; height: 150rpx; }
  50% { opacity: 1; height: 200rpx; }
}

.close-btn {
  background: linear-gradient(135deg, #FFD700, #FFA500);
  color: #333;
  font-size: 32rpx;
  font-weight: bold;
  padding: 20rpx 60rpx;
  border-radius: 40rpx;
  border: none;
  margin-top: 30rpx;
}

.close-btn::after {
  border: none;
}

/* 进化进度卡片 */
.evolution-progress-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 24rpx;
  margin: 20rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.header-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.fragments-count {
  font-size: 24rpx;
  color: #8B5CF6;
}

.evolution-paths {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.evolution-path {
  display: flex;
  align-items: center;
  background: #f5f5f5;
  border-radius: 12rpx;
  padding: 16rpx;
  opacity: 0.5;
}

.evolution-path.available {
  opacity: 1;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.05));
  border: 2rpx solid rgba(139, 92, 246, 0.3);
}

.path-from, .path-to {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.path-arrow {
  flex: 1;
  text-align: center;
}

.arrow-line {
  color: #999;
  font-size: 24rpx;
}

.tier-icon {
  font-size: 28rpx;
}

.tier-name {
  font-size: 24rpx;
  color: #666;
}

.cost-badge {
  display: flex;
  align-items: center;
  gap: 4rpx;
  background: #fff;
  padding: 4rpx 10rpx;
  border-radius: 10rpx;
  margin-left: 8rpx;
}

.cost-icon {
  font-size: 18rpx;
}

.cost-value {
  font-size: 20rpx;
  color: #8B5CF6;
  font-weight: bold;
}

.max-tier-display {
  text-align: center;
  padding: 30rpx;
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 165, 0, 0.05));
  border-radius: 12rpx;
}

.max-text {
  font-size: 32rpx;
  font-weight: bold;
  color: #FFD700;
  display: block;
  margin-bottom: 8rpx;
}

.max-desc {
  font-size: 24rpx;
  color: #999;
}
</style>
