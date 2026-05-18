<template>
  <view 
    class="badge-item" 
    :class="{ locked: !isUnlocked, ['tier-' + currentTier]: true }"
    @tap="handleClick"
  >
    <!-- 徽章图标 -->
    <view class="badge-icon" :class="'tier-' + currentTier">
      <text class="badge-emoji">{{ badge.icon }}</text>
      <view v-if="!isUnlocked" class="lock-overlay">
        <text class="lock-icon">🔒</text>
      </view>
      <view v-if="isUnlocked && evolutionStage > 1" class="tier-indicator">
        <text class="tier-text">{{ getTierName(currentTier) }}</text>
      </view>
    </view>

    <!-- 徽章信息 -->
    <view class="badge-info">
      <text class="badge-name">{{ badge.name }}</text>
      <text class="badge-desc">{{ isUnlocked ? badge.description : '???' }}</text>
    </view>

    <!-- 进化指示器 -->
    <view v-if="isUnlocked && evolutionInfo && !evolutionInfo.isMaxTier" class="evolve-indicator">
      <view class="evolve-progress">
        <text class="evolve-text">进化</text>
        <view class="fragment-icon">💎</view>
      </view>
    </view>

    <!-- 已达最高级 -->
    <view v-if="isUnlocked && evolutionInfo && evolutionInfo.isMaxTier" class="max-tier-badge">
      <text class="max-icon">⭐</text>
    </view>
  </view>
</template>

<script>
import { computed } from 'vue'
import { useGamificationStore } from '@/stores/gamificationStore'
import { BADGE_TIERS } from '@/services/gamificationService.js'

export default {
  name: 'BadgeItem',
  props: {
    badge: {
      type: Object,
      required: true
    },
    showDetails: {
      type: Boolean,
      default: true
    }
  },
  emits: ['click', 'evolve'],
  setup(props, { emit }) {
    const gamificationStore = useGamificationStore()

    const isUnlocked = computed(() => gamificationStore.isBadgeUnlocked(props.badge.id))

    const currentTier = computed(() => gamificationStore.getBadgeTier(props.badge.id))

    const evolutionInfo = computed(() => gamificationStore.getBadgeEvolutionInfo(props.badge.id))

    const evolutionStage = computed(() => {
      const tierOrder = ['bronze', 'silver', 'gold', 'diamond']
      return tierOrder.indexOf(currentTier.value) + 1
    })

    const getTierName = (tier) => {
      return BADGE_TIERS[tier]?.name || tier
    }

    const handleClick = () => {
      if (props.showDetails) {
        emit('click', { badge: props.badge, isUnlocked: isUnlocked.value })
      }
    }

    const handleEvolve = () => {
      if (isUnlocked.value && evolutionInfo.value?.canEvolve) {
        emit('evolve', props.badge.id)
      }
    }

    return {
      isUnlocked,
      currentTier,
      evolutionInfo,
      evolutionStage,
      getTierName,
      handleClick,
      handleEvolve
    }
  }
}
</script>

<style scoped>
.badge-item {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  display: flex;
  align-items: center;
  gap: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
  position: relative;
  transition: transform 0.2s, box-shadow 0.2s;
}

.badge-item:active {
  transform: scale(0.98);
}

.badge-item.locked {
  opacity: 0.6;
  background: #f5f5f5;
}

.badge-icon {
  width: 100rpx;
  height: 100rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  flex-shrink: 0;
}

.badge-icon.tier-bronze {
  background: linear-gradient(135deg, #CD7F32, #A5673F);
}

.badge-icon.tier-silver {
  background: linear-gradient(135deg, #C0C0C0, #A8A8A8);
}

.badge-icon.tier-gold {
  background: linear-gradient(135deg, #FFD700, #FFA500);
}

.badge-icon.tier-diamond {
  background: linear-gradient(135deg, #B9F2FF, #87CEEB);
  box-shadow: 0 0 20rpx rgba(185, 242, 255, 0.5);
}

.badge-emoji {
  font-size: 48rpx;
}

.lock-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lock-icon {
  font-size: 32rpx;
}

.tier-indicator {
  position: absolute;
  bottom: -8rpx;
  right: -8rpx;
  background: #333;
  padding: 4rpx 10rpx;
  border-radius: 10rpx;
  border: 2rpx solid #fff;
}

.tier-text {
  font-size: 16rpx;
  color: #fff;
  font-weight: bold;
}

.badge-info {
  flex: 1;
  min-width: 0;
}

.badge-name {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 6rpx;
}

.locked .badge-name {
  color: #999;
}

.badge-desc {
  font-size: 22rpx;
  color: #666;
  display: block;
}

.locked .badge-desc {
  color: #aaa;
}

.evolve-indicator {
  position: absolute;
  top: 12rpx;
  right: 12rpx;
}

.evolve-progress {
  display: flex;
  align-items: center;
  gap: 4rpx;
  background: rgba(139, 92, 246, 0.1);
  padding: 6rpx 12rpx;
  border-radius: 12rpx;
}

.evolve-text {
  font-size: 18rpx;
  color: #8B5CF6;
}

.fragment-icon {
  font-size: 18rpx;
}

.max-tier-badge {
  position: absolute;
  top: 12rpx;
  right: 12rpx;
  background: linear-gradient(135deg, #FFD700, #FFA500);
  padding: 6rpx 12rpx;
  border-radius: 12rpx;
}

.max-icon {
  font-size: 20rpx;
}

/* 暗色模式 */
.dark-mode .badge-item {
  background: #2a2a2a;
}

.dark-mode .badge-item.locked {
  background: #1a1a1a;
}

.dark-mode .badge-name {
  color: #fff;
}

.dark-mode .badge-desc {
  color: #aaa;
}
</style>
