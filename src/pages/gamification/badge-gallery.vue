<template>
  <view class="page-container" :class="{ 'dark-mode': isDarkMode }">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <view class="nav-left" @tap="goBack">
        <text class="icon">←</text>
      </view>
      <view class="nav-title">成就展厅</view>
      <view class="nav-right"></view>
    </view>

    <!-- 徽章统计 -->
    <view class="badge-stats">
      <view class="stats-card">
        <view class="stats-header">
          <view class="stats-info">
            <text class="stats-title">我的收藏</text>
            <text class="stats-subtitle">已解锁 {{ gamificationStore.unlockedBadgesCount }} / {{ gamificationStore.totalBadgesCount }} 徽章</text>
          </view>
          <view class="completion-rate">
            <text class="rate-value">{{ gamificationStore.badgeCompletionRate }}%</text>
            <text class="rate-label">收集率</text>
          </view>
        </view>
        <view class="progress-bar">
          <view class="progress-fill" :style="{ width: gamificationStore.badgeCompletionRate + '%' }"></view>
        </view>
      </view>
    </view>

    <!-- 3D 徽章墙 -->
    <view class="badge-wall-container">
      <view class="badge-wall">
        <view 
          class="wall-badge" 
          v-for="(badge, index) in displayBadges" 
          :key="badge.id"
          :style="getWallBadgeStyle(index)"
          @tap="selectBadge(badge)"
        >
          <view 
            class="wall-badge-inner"
            :class="{ locked: !gamificationStore.isBadgeUnlocked(badge.id) }"
            :style="{ background: getBadgeGradient(badge) }"
          >
            <text class="badge-emoji">{{ badge.icon }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 类别筛选 -->
    <view class="category-tabs">
      <view 
        class="tab-item" 
        :class="{ active: activeCategory === 'all' }"
        @tap="switchCategory('all')"
      >
        <text>全部</text>
      </view>
      <view 
        class="tab-item" 
        :class="{ active: activeCategory === 'task' }"
        @tap="switchCategory('task')"
      >
        <text>任务</text>
      </view>
      <view 
        class="tab-item" 
        :class="{ active: activeCategory === 'streak' }"
        @tap="switchCategory('streak')"
      >
        <text>坚持</text>
      </view>
      <view 
        class="tab-item" 
        :class="{ active: activeCategory === 'points' }"
        @tap="switchCategory('points')"
      >
        <text>积分</text>
      </view>
      <view 
        class="tab-item" 
        :class="{ active: activeCategory === 'seasonal' }"
        @tap="switchCategory('seasonal')"
      >
        <text>限定</text>
      </view>
    </view>

    <!-- 徽章列表 -->
    <view class="badge-list">
      <BadgeItem 
        v-for="badge in filteredBadges" 
        :key="badge.id"
        :badge="badge"
        @click="selectBadge"
        @evolve="handleEvolve"
      />
    </view>

    <!-- 徽章详情弹窗 -->
    <view class="badge-modal" v-if="selectedBadge" @tap="closeModal">
      <view class="modal-content" @tap.stop>
        <view class="modal-header">
          <view class="badge-display" :style="{ background: getBadgeGradient(selectedBadge) }">
            <text class="badge-emoji">{{ selectedBadge.icon }}</text>
          </view>
          <view class="badge-basic">
            <text class="badge-name">{{ selectedBadge.name }}</text>
            <view class="badge-tier-tag">
              <text>{{ getTierName(selectedBadge.tier) }}</text>
            </view>
          </view>
          <view class="close-btn" @tap="closeModal">×</view>
        </view>
        
        <view class="modal-body">
          <text class="badge-desc">{{ selectedBadge.description }}</text>
          
          <view class="badge-meta">
            <view class="meta-item">
              <text class="meta-label">分类</text>
              <text class="meta-value">{{ getCategoryName(selectedBadge.category) }}</text>
            </view>
            <view class="meta-item">
              <text class="meta-label">等级</text>
              <text class="meta-value">{{ getTierName(currentBadgeTier) }}</text>
            </view>
          </view>

          <!-- 进化进度 -->
          <BadgeEvolution 
            v-if="gamificationStore.isBadgeUnlocked(selectedBadge.id)"
            :badgeId="selectedBadge.id"
          />
        </view>

        <view class="modal-footer" v-if="!gamificationStore.isBadgeUnlocked(selectedBadge.id)">
          <button class="lock-hint">完成相关任务解锁</button>
        </view>
      </view>
    </view>

    <!-- 进化动画 -->
    <view class="evolution-overlay" v-if="gamificationStore.showEvolutionAnimation && gamificationStore.evolvingBadge">
      <view class="evolution-content">
        <view class="evolution-center">
          <view class="glow-ring"></view>
          <view class="badge-base">
            <text class="badge-emoji">{{ gamificationStore.evolvingBadge.icon }}</text>
          </view>
        </view>
        <view class="tier-transition">
          <view class="tier-badge old-tier">
            <text>{{ getTierName(gamificationStore.evolvingBadge.oldTier) }}</text>
          </view>
          <text class="arrow-icon">→</text>
          <view class="tier-badge new-tier">
            <text>{{ getTierName(gamificationStore.evolvingBadge.newTier) }}</text>
          </view>
        </view>
        <text class="evolution-text">进化成功！</text>
        <button class="close-btn-evolution" @tap="closeEvolution">太棒了！</button>
      </view>
    </view>
  </view>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { isDarkTheme } from '@/utils/themeUtils.js'
import { useGamificationStore } from '@/stores/gamificationStore'
import BadgeItem from '@/components/gamification/BadgeItem.vue'
import BadgeEvolution from '@/components/gamification/BadgeEvolution.vue'
import { BADGE_TIERS } from '@/services/gamificationService.js'

export default {
  name: 'BadgeGallery',
  components: { BadgeItem, BadgeEvolution },
  setup() {
    const isDarkMode = ref(false)
    const gamificationStore = useGamificationStore()
    const activeCategory = ref('all')
    const selectedBadge = ref(null)
    const currentBadgeTier = ref('bronze')

    const displayBadges = computed(() => {
      // 取前12个徽章用于3D墙展示
      return gamificationStore.allBadges.slice(0, 12)
    })

    const filteredBadges = computed(() => {
      if (activeCategory.value === 'all') {
        return gamificationStore.allBadges
      }
      return gamificationStore.allBadges.filter(b => b.category === activeCategory.value)
    })

    const getBadgeGradient = (badge) => {
      const tier = gamificationStore.getBadgeTier(badge.id) || badge.tier
      const colors = {
        bronze: 'linear-gradient(135deg, #CD7F32, #A5673F)',
        silver: 'linear-gradient(135deg, #C0C0C0, #A8A8A8)',
        gold: 'linear-gradient(135deg, #FFD700, #FFA500)',
        diamond: 'linear-gradient(135deg, #B9F2FF, #87CEEB)'
      }
      return colors[tier] || colors.bronze
    }

    const getWallBadgeStyle = (index) => {
      // 3D 墙效果 - 错落有致的排列
      const row = Math.floor(index / 4)
      const col = index % 4
      const offsetX = (col - 1.5) * 10
      const offsetY = row * 5
      const rotateY = (col - 1.5) * 8
      const rotateX = -5 + row * 3
      const zIndex = 12 - index
      
      return {
        transform: `translateX(${offsetX}rpx) translateY(${offsetY}rpx) rotateY(${rotateY}deg) rotateX(${rotateX}deg)`,
        zIndex,
        animationDelay: `${index * 0.1}s`
      }
    }

    const getTierName = (tierId) => {
      return BADGE_TIERS[tierId]?.name || tierId
    }

    const getCategoryName = (category) => {
      const names = {
        task: '任务',
        streak: '坚持',
        points: '积分',
        seasonal: '限定',
        family: '家庭',
        achievement: '成就'
      }
      return names[category] || category
    }

    const switchCategory = (category) => {
      activeCategory.value = category
    }

    const selectBadge = (badge) => {
      selectedBadge.value = badge
      currentBadgeTier.value = gamificationStore.getBadgeTier(badge.id)
    }

    const closeModal = () => {
      selectedBadge.value = null
    }

    const handleEvolve = (badgeId) => {
      // 进化由 BadgeEvolution 组件处理
    }

    const closeEvolution = () => {
      gamificationStore.showEvolutionAnimation = false
    }

    const goBack = () => {
      uni.navigateBack()
    }

    onMounted(() => {
      isDarkMode.value = isDarkTheme()
      gamificationStore.init()
    })

    return {
      isDarkMode,
      gamificationStore,
      activeCategory,
      selectedBadge,
      currentBadgeTier,
      displayBadges,
      filteredBadges,
      getBadgeGradient,
      getWallBadgeStyle,
      getTierName,
      getCategoryName,
      switchCategory,
      selectBadge,
      closeModal,
      handleEvolve,
      closeEvolution,
      goBack
    }
  }
}
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 120rpx;
}

.dark-mode {
  background-color: #1a1a1a;
  color: #ffffff;
}

.nav-bar {
  display: flex;
  align-items: center;
  height: 88rpx;
  background: linear-gradient(135deg, #8B5CF6, #7C3AED);
  padding: 90rpx 40rpx 60rpx 40rpx;
  position: relative;
}

.nav-left {
  position: absolute;
  left: 30rpx;
  z-index: 1;
}

.icon {
  color: white;
  font-size: 48rpx;
  font-weight: bold;
}

.nav-title {
  flex: 1;
  text-align: center;
  color: white;
  font-size: 48rpx;
  font-weight: bold;
}

.nav-right {
  position: absolute;
  right: 30rpx;
}

/* 徽章统计 */
.badge-stats {
  padding: 20rpx;
}

.stats-card {
  background: linear-gradient(135deg, #8B5CF6, #7C3AED);
  border-radius: 24rpx;
  padding: 30rpx;
  color: #fff;
}

.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.stats-title {
  font-size: 36rpx;
  font-weight: bold;
  display: block;
}

.stats-subtitle {
  font-size: 24rpx;
  opacity: 0.8;
  display: block;
  margin-top: 8rpx;
}

.completion-rate {
  text-align: center;
}

.rate-value {
  font-size: 48rpx;
  font-weight: bold;
  display: block;
}

.rate-label {
  font-size: 22rpx;
  opacity: 0.8;
}

.progress-bar {
  height: 12rpx;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 6rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #FFD700;
  border-radius: 6rpx;
  transition: width 0.3s ease;
}

/* 3D 徽章墙 */
.badge-wall-container {
  padding: 40rpx 30rpx;
  perspective: 1000rpx;
}

.badge-wall {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20rpx;
  transform-style: preserve-3d;
  perspective: 1000rpx;
}

.wall-badge {
  width: 120rpx;
  height: 120rpx;
  transform-style: preserve-3d;
  transition: transform 0.3s ease;
}

.wall-badge:active {
  transform: scale(1.1) !important;
}

.wall-badge-inner {
  width: 100%;
  height: 100%;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.15);
}

.wall-badge-inner.locked {
  background: linear-gradient(135deg, #999, #666) !important;
  opacity: 0.5;
}

.badge-emoji {
  font-size: 56rpx;
}

/* 分类标签 */
.category-tabs {
  display: flex;
  padding: 20rpx;
  background-color: #fff;
  margin: 0 20rpx;
  border-radius: 16rpx;
  gap: 8rpx;
}

.dark-mode .category-tabs {
  background-color: #2a2a2a;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 16rpx 0;
  font-size: 28rpx;
  color: #666;
  position: relative;
}

.dark-mode .tab-item {
  color: #999;
}

.tab-item.active {
  color: #8B5CF6;
  font-weight: bold;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 40rpx;
  height: 6rpx;
  background-color: #8B5CF6;
  border-radius: 3rpx;
}

/* 徽章列表 */
.badge-list {
  padding: 20rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

/* 徽章详情弹窗 */
.badge-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.modal-content {
  width: 90%;
  max-height: 80vh;
  background: #fff;
  border-radius: 24rpx;
  overflow: hidden;
}

.dark-mode .modal-content {
  background: #2a2a2a;
}

.modal-header {
  background: linear-gradient(135deg, #8B5CF6, #7C3AED);
  padding: 40rpx 30rpx 30rpx;
  display: flex;
  align-items: center;
  gap: 24rpx;
  position: relative;
}

.badge-display {
  width: 120rpx;
  height: 120rpx;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.badge-display .badge-emoji {
  font-size: 64rpx;
}

.badge-basic {
  flex: 1;
}

.badge-name {
  font-size: 36rpx;
  font-weight: bold;
  color: #fff;
  display: block;
  margin-bottom: 12rpx;
}

.badge-tier-tag {
  display: inline-block;
  background: rgba(255, 255, 255, 0.2);
  padding: 6rpx 16rpx;
  border-radius: 12rpx;
  color: #fff;
  font-size: 22rpx;
}

.close-btn {
  position: absolute;
  top: 20rpx;
  right: 20rpx;
  width: 48rpx;
  height: 48rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 32rpx;
}

.modal-body {
  padding: 30rpx;
}

.badge-desc {
  font-size: 28rpx;
  color: #666;
  display: block;
  margin-bottom: 24rpx;
}

.dark-mode .badge-desc {
  color: #aaa;
}

.badge-meta {
  display: flex;
  gap: 40rpx;
  margin-bottom: 24rpx;
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.meta-label {
  font-size: 22rpx;
  color: #999;
}

.meta-value {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
}

.dark-mode .meta-value {
  color: #fff;
}

.modal-footer {
  padding: 0 30rpx 30rpx;
}

.lock-hint {
  width: 100%;
  background: #e0e0e0;
  color: #999;
  font-size: 28rpx;
  padding: 24rpx;
  border-radius: 16rpx;
  border: none;
}

/* 进化动画 */
.evolution-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.evolution-content {
  text-align: center;
  color: #fff;
}

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
  animation: badgeBounce 0.6s ease;
}

@keyframes badgeBounce {
  0% { transform: translate(-50%, -50%) scale(0); }
  50% { transform: translate(-50%, -50%) scale(1.2); }
  100% { transform: translate(-50%, -50%) scale(1); }
}

.badge-base .badge-emoji {
  font-size: 72rpx;
}

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
}

.tier-badge text {
  font-size: 32rpx;
  font-weight: bold;
  color: #fff;
}

.arrow-icon {
  font-size: 40rpx;
  color: #FFD700;
}

.evolution-text {
  font-size: 48rpx;
  font-weight: bold;
  background: linear-gradient(90deg, #FFD700, #FFA500, #FF6B6B);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  display: block;
  margin-bottom: 30rpx;
}

.close-btn-evolution {
  background: linear-gradient(135deg, #FFD700, #FFA500);
  color: #333;
  font-size: 32rpx;
  font-weight: bold;
  padding: 20rpx 60rpx;
  border-radius: 40rpx;
  border: none;
}

.close-btn-evolution::after {
  border: none;
}
</style>
