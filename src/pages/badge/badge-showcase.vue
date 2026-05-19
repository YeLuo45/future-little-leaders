<template>
  <view class="page-container" :class="{ 'dark-mode': isDarkMode }">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <view class="nav-left" @tap="goBack">
        <text class="icon">←</text>
      </view>
      <view class="nav-title">徽章展示墙</view>
      <view class="nav-right">
        <view class="share-btn" @tap="shareShowcase">
          <text class="share-icon">📤</text>
        </view>
      </view>
    </view>

    <!-- 展示墙头部 -->
    <view class="showcase-header">
      <view class="header-content">
        <view class="avatar-section">
          <view class="avatar-ring">
            <text class="avatar-emoji">{{ babyAvatar }}</text>
          </view>
          <view class="avatar-glow"></view>
        </view>
        <view class="header-info">
          <text class="baby-name">{{ currentBabyName }}</text>
          <view class="showcase-stats">
            <text class="stat-item">🏅 {{ unlockedCount }} 枚徽章</text>
            <text class="stat-divider">|</text>
            <text class="stat-item">📊 {{ completionRate }}% 收集率</text>
          </view>
        </view>
      </view>
      <view class="header-decoration">
        <text class="deco-emoji" v-for="(emoji, i) in decorations" :key="i">{{ emoji }}</text>
      </view>
    </view>

    <!-- 3D徽章展示墙 -->
    <view class="badge-wall-container">
      <view class="wall-3d">
        <view 
          class="wall-badge" 
          v-for="(badge, index) in displayBadges" 
          :key="badge.badgeId"
          :style="getWallBadgeStyle(index)"
          @tap="showBadgeDetail(badge)"
        >
          <view 
            class="badge-3d-face"
            :class="{ locked: !badge.unlocked }"
            :style="{ background: badge.unlocked ? getRarityGradient(badge.rarity) : 'linear-gradient(135deg, #666, #999)' }"
          >
            <text class="badge-emoji">{{ badge.icon }}</text>
            <view v-if="!badge.unlocked" class="badge-lock">🔒</view>
            <view v-if="badge.unlocked" class="badge-glow"></view>
          </view>
          <view class="badge-3d-side left"></view>
          <view class="badge-3d-side right"></view>
          <view class="badge-3d-bottom"></view>
        </view>
      </view>
    </view>

    <!-- 稀有度图例 -->
    <view class="rarity-legend">
      <view class="legend-title">稀有度图例</view>
      <view class="legend-items">
        <view class="legend-item">
          <view class="legend-dot" style="background: #999;"></view>
          <text class="legend-text">普通</text>
        </view>
        <view class="legend-item">
          <view class="legend-dot" style="background: #3b82f6;"></view>
          <text class="legend-text">稀有</text>
        </view>
        <view class="legend-item">
          <view class="legend-dot" style="background: #f59e0b;"></view>
          <text class="legend-text">传说</text>
        </view>
        <view class="legend-item">
          <view class="legend-dot" style="background: #8B5CF6;"></view>
          <text class="legend-text">神话</text>
        </view>
      </view>
    </view>

    <!-- 已解锁徽章列表 -->
    <view class="section-header">
      <text class="section-title">我的徽章</text>
      <text class="section-subtitle">点击徽章查看详情</text>
    </view>
    
    <scroll-view scroll-y class="badge-list-scroll">
      <view class="badge-list">
        <view 
          class="badge-list-item" 
          v-for="badge in unlockedBadges" 
          :key="badge.badgeId"
          @tap="showBadgeDetail(badge)"
        >
          <view 
            class="list-badge-icon"
            :style="{ background: getRarityGradient(badge.rarity) }"
          >
            <text class="list-badge-emoji">{{ badge.icon }}</text>
          </view>
          <view class="list-badge-info">
            <text class="list-badge-name">{{ badge.name }}</text>
            <view class="list-badge-meta">
              <text class="list-category">{{ getCategoryName(badge.category) }}</text>
              <view class="list-rarity" :class="'rarity-' + badge.rarity">
                {{ getRarityName(badge.rarity) }}
              </view>
            </view>
          </view>
          <view class="list-badge-time">
            <text class="time-text">{{ formatTime(badge.unlockedAt) }}</text>
          </view>
        </view>
      </view>
      
      <!-- 未解锁提示 -->
      <view v-if="unlockedBadges.length === 0" class="empty-state">
        <text class="empty-emoji">🏅</text>
        <text class="empty-text">还没有徽章，快去做任务解锁吧！</text>
        <button class="go-task-btn" @tap="goToTasks">去做任务</button>
      </view>
    </scroll-view>

    <!-- 徽章详情弹窗 -->
    <view class="detail-modal" v-if="selectedBadge" @tap="closeModal">
      <view class="modal-content" @tap.stop>
        <view class="modal-header" :style="{ background: getRarityGradient(selectedBadge.rarity) }">
          <text class="modal-emoji">{{ selectedBadge.icon }}</text>
          <text class="modal-name">{{ selectedBadge.name }}</text>
          <view class="modal-rarity" :class="'rarity-' + selectedBadge.rarity">
            {{ getRarityName(selectedBadge.rarity) }}
          </view>
          <view class="modal-close" @tap="closeModal">×</view>
        </view>
        
        <view class="modal-body">
          <text class="modal-desc">{{ selectedBadge.description }}</text>
          
          <view class="detail-row">
            <text class="detail-label">所属分类</text>
            <text class="detail-value">
              <text class="category-icon">{{ getCategoryIcon(selectedBadge.category) }}</text>
              {{ getCategoryName(selectedBadge.category) }}
            </text>
          </view>
          
          <view class="detail-row">
            <text class="detail-label">稀有度</text>
            <text class="detail-value rarity-value" :class="'rarity-text-' + selectedBadge.rarity">
              {{ getRarityName(selectedBadge.rarity) }}
            </text>
          </view>
          
          <view class="detail-row">
            <text class="detail-label">解锁时间</text>
            <text class="detail-value">{{ formatFullTime(selectedBadge.unlockedAt) }}</text>
          </view>
          
          <view class="detail-row">
            <text class="detail-label">奖励积分</text>
            <text class="detail-value reward">+{{ selectedBadge.pointsReward }} 积分</text>
          </view>
        </view>
        
        <view class="modal-footer">
          <button class="modal-btn primary" @tap="shareBadge">分享徽章</button>
          <button class="modal-btn secondary" @tap="closeModal">关闭</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { isDarkTheme } from '@/utils/themeUtils.js'
import { useBadgeStore, BADGE_RARITY, BADGE_CATEGORIES } from '@/stores/badgeStore'
import { useBabyStore } from '@/stores/babyStore'

export default {
  name: 'BadgeShowcase',
  setup() {
    const isDarkMode = ref(false)
    const badgeStore = useBadgeStore()
    const babyStore = useBabyStore()
    const selectedBadge = ref(null)

    const decorations = ['✨', '🌟', '💫', '⭐', '💫', '🌟']

    // 当前宝宝名称
    const currentBabyName = computed(() => {
      return babyStore.currentBabyName || '小宝贝'
    })

    // 宝宝头像
    const babyAvatar = computed(() => {
      const babies = babyStore.babies
      const current = babies.find(b => b.id === babyStore.currentBabyId)
      return current?.avatar || '👶'
    })

    // 已解锁徽章
    const unlockedBadges = computed(() => {
      return badgeStore.currentBabyUnlockedBadges
    })

    // 用于展示墙的徽章（最多12个）
    const displayBadges = computed(() => {
      const badges = [...unlockedBadges.value]
      // 如果不足12个，用未解锁的填充
      const locked = badgeStore.currentBabyBadges.filter(b => !b.unlocked)
      while (badges.length < 12 && locked.length > 0) {
        badges.push(locked.shift())
      }
      return badges.slice(0, 12)
    })

    // 已解锁数量
    const unlockedCount = computed(() => {
      return badgeStore.currentBabyUnlockedCount
    })

    // 完成率
    const completionRate = computed(() => {
      return badgeStore.currentBabyCompletionRate
    })

    // 获取3D徽章样式
    const getWallBadgeStyle = (index) => {
      const row = Math.floor(index / 4)
      const col = index % 4
      const offsetX = (col - 1.5) * 15
      const offsetY = row * 8
      const rotateY = (col - 1.5) * 10
      const rotateX = -5 + row * 4
      const zIndex = 12 - index
      const scale = 0.9 + Math.random() * 0.2
      
      return {
        transform: `translateX(${offsetX}rpx) translateY(${offsetY}rpx) rotateY(${rotateY}deg) rotateX(${rotateX}deg) scale(${scale})`,
        zIndex,
        animationDelay: `${index * 0.1}s`
      }
    }

    // 获取稀有度名称
    const getRarityName = (rarity) => {
      return BADGE_RARITY[Object.keys(BADGE_RARITY).find(key => BADGE_RARITY[key].id === rarity)]?.name || '普通'
    }

    // 获取稀有度渐变
    const getRarityGradient = (rarity) => {
      return BADGE_RARITY[Object.keys(BADGE_RARITY).find(key => BADGE_RARITY[key].id === rarity)]?.gradient || BADGE_RARITY.COMMON.gradient
    }

    // 获取分类名称
    const getCategoryName = (categoryId) => {
      return BADGE_CATEGORIES[Object.keys(BADGE_CATEGORIES).find(key => BADGE_CATEGORIES[key].id === categoryId)]?.name || '学习'
    }

    // 获取分类图标
    const getCategoryIcon = (categoryId) => {
      return BADGE_CATEGORIES[Object.keys(BADGE_CATEGORIES).find(key => BADGE_CATEGORIES[key].id === categoryId)]?.icon || '📚'
    }

    // 格式化时间
    const formatTime = (timeStr) => {
      if (!timeStr) return ''
      const date = new Date(timeStr)
      const month = date.getMonth() + 1
      const day = date.getDate()
      return `${month}月${day}日`
    }

    // 格式化完整时间
    const formatFullTime = (timeStr) => {
      if (!timeStr) return ''
      const date = new Date(timeStr)
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      const day = date.getDate()
      return `${year}年${month}月${day}日`
    }

    // 显示徽章详情
    const showBadgeDetail = (badge) => {
      selectedBadge.value = badge
    }

    // 关闭弹窗
    const closeModal = () => {
      selectedBadge.value = null
    }

    // 分享展示墙
    const shareShowcase = () => {
      const babyId = babyStore.currentBabyId
      const shareData = badgeStore.generateShareData(babyId)
      
      uni.share({
        provider: 'weixin',
        type: 0,
        title: shareData.title,
        desc: shareData.description,
        success: () => {
          uni.showToast({ title: '分享成功', icon: 'success' })
        },
        fail: () => {
          uni.showToast({ title: '分享失败', icon: 'none' })
        }
      })
    }

    // 分享单个徽章
    const shareBadge = () => {
      if (!selectedBadge.value) return
      
      uni.share({
        provider: 'weixin',
        type: 0,
        title: `${currentBabyName.value}获得了「${selectedBadge.value.name}」徽章！`,
        desc: selectedBadge.value.description,
        success: () => {
          uni.showToast({ title: '分享成功', icon: 'success' })
        },
        fail: () => {
          uni.showToast({ title: '分享失败', icon: 'none' })
        }
      })
    }

    // 跳转到任务页面
    const goToTasks = () => {
      uni.switchTab({ url: '/pages/index/index' })
    }

    // 返回
    const goBack = () => {
      uni.navigateBack()
    }

    onMounted(() => {
      isDarkMode.value = isDarkTheme()
      badgeStore.init()
      babyStore.loadBabies()
    })

    return {
      isDarkMode,
      selectedBadge,
      decorations,
      currentBabyName,
      babyAvatar,
      unlockedBadges,
      displayBadges,
      unlockedCount,
      completionRate,
      getWallBadgeStyle,
      getRarityName,
      getRarityGradient,
      getCategoryName,
      getCategoryIcon,
      formatTime,
      formatFullTime,
      showBadgeDetail,
      closeModal,
      shareShowcase,
      shareBadge,
      goToTasks,
      goBack
    }
  }
}
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  padding-bottom: 120rpx;
}

.dark-mode {
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  color: #ffffff;
}

.nav-bar {
  display: flex;
  align-items: center;
  height: 88rpx;
  background: transparent;
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
  text-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.3);
}

.nav-right {
  position: absolute;
  right: 30rpx;
}

.share-btn {
  padding: 10rpx;
}

.share-icon {
  font-size: 40rpx;
}

/* 头部 */
.showcase-header {
  padding: 20rpx 40rpx 40rpx;
  text-align: center;
  position: relative;
}

.header-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar-section {
  position: relative;
  margin-bottom: 20rpx;
}

.avatar-ring {
  width: 140rpx;
  height: 140rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #8B5CF6, #ec4899);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 4rpx solid rgba(255, 255, 255, 0.3);
}

.avatar-emoji {
  font-size: 72rpx;
}

.avatar-glow {
  position: absolute;
  top: -10rpx;
  left: -10rpx;
  right: -10rpx;
  bottom: -10rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #8B5CF6, #ec4899);
  filter: blur(20rpx);
  opacity: 0.5;
  z-index: -1;
}

.header-info {
  text-align: center;
}

.baby-name {
  font-size: 40rpx;
  font-weight: bold;
  color: #fff;
  display: block;
  margin-bottom: 12rpx;
  text-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.3);
}

.showcase-stats {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16rpx;
}

.stat-item {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
}

.stat-divider {
  color: rgba(255, 255, 255, 0.4);
}

.header-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  padding: 0 20rpx;
  pointer-events: none;
}

.deco-emoji {
  font-size: 32rpx;
  opacity: 0.6;
  animation: float 3s ease-in-out infinite;
}

.deco-emoji:nth-child(2) { animation-delay: 0.5s; }
.deco-emoji:nth-child(3) { animation-delay: 1s; }
.deco-emoji:nth-child(4) { animation-delay: 1.5s; }
.deco-emoji:nth-child(5) { animation-delay: 2s; }
.deco-emoji:nth-child(6) { animation-delay: 2.5s; }

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10rpx); }
}

/* 3D徽章墙 */
.badge-wall-container {
  padding: 40rpx 30rpx;
  perspective: 1200rpx;
}

.wall-3d {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 24rpx;
  transform-style: preserve-3d;
  perspective: 1200rpx;
}

.wall-badge {
  width: 140rpx;
  height: 140rpx;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.3s ease;
}

.wall-badge:active {
  transform: scale(1.15) !important;
}

.badge-3d-face {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.3);
  z-index: 2;
}

.badge-3d-face.locked {
  opacity: 0.4;
}

.badge-emoji {
  font-size: 64rpx;
}

.badge-lock {
  position: absolute;
  font-size: 32rpx;
}

.badge-glow {
  position: absolute;
  top: -5rpx;
  left: -5rpx;
  right: -5rpx;
  bottom: -5rpx;
  border-radius: 28rpx;
  background: inherit;
  filter: blur(15rpx);
  opacity: 0.4;
  z-index: -1;
}

.badge-3d-side {
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 20rpx;
  background: rgba(0, 0, 0, 0.2);
  transform-origin: top;
}

.badge-3d-side.left {
  transform: rotateX(60deg);
  left: 0;
}

.badge-3d-side.right {
  transform: rotateX(-60deg);
  right: 0;
}

.badge-3d-bottom {
  position: absolute;
  bottom: -10rpx;
  left: 10%;
  width: 80%;
  height: 20rpx;
  background: rgba(0, 0, 0, 0.15);
  border-radius: 50%;
  filter: blur(8rpx);
  z-index: -1;
}

/* 稀有度图例 */
.rarity-legend {
  padding: 20rpx 40rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16rpx;
  margin: 0 20rpx 20rpx;
}

.legend-title {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 12rpx;
}

.legend-items {
  display: flex;
  justify-content: space-around;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.legend-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
}

.legend-text {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.8);
}

/* 徽章列表 */
.section-header {
  padding: 24rpx 20rpx 16rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #fff;
}

.section-subtitle {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.6);
  margin-left: 16rpx;
}

.badge-list-scroll {
  height: calc(100vh - 900rpx);
  padding: 0 20rpx;
}

.badge-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.badge-list-item {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16rpx;
  backdrop-filter: blur(10rpx);
}

.list-badge-icon {
  width: 100rpx;
  height: 100rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16rpx;
}

.list-badge-emoji {
  font-size: 48rpx;
}

.list-badge-info {
  flex: 1;
}

.list-badge-name {
  font-size: 30rpx;
  font-weight: bold;
  color: #fff;
  display: block;
  margin-bottom: 8rpx;
}

.list-badge-meta {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.list-category {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.7);
}

.list-rarity {
  font-size: 20rpx;
  padding: 2rpx 10rpx;
  border-radius: 8rpx;
}

.list-rarity.rarity-1 { background: rgba(153, 153, 153, 0.3); color: #999; }
.list-rarity.rarity-2 { background: rgba(59, 130, 246, 0.3); color: #3b82f6; }
.list-rarity.rarity-3 { background: rgba(245, 158, 11, 0.3); color: #f59e0b; }
.list-rarity.rarity-4 { background: rgba(139, 92, 246, 0.3); color: #8B5CF6; }

.list-badge-time {
  text-align: right;
}

.time-text {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.5);
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 0;
}

.empty-emoji {
  font-size: 80rpx;
  margin-bottom: 20rpx;
  opacity: 0.6;
}

.empty-text {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 30rpx;
}

.go-task-btn {
  padding: 20rpx 60rpx;
  background: linear-gradient(135deg, #8B5CF6, #7C3AED);
  color: #fff;
  font-size: 28rpx;
  font-weight: bold;
  border-radius: 40rpx;
  border: none;
}

.go-task-btn::after {
  border: none;
}

/* 详情弹窗 */
.detail-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  width: 650rpx;
  background: #fff;
  border-radius: 24rpx;
  overflow: hidden;
}

.dark-mode .modal-content {
  background: #2a2a2a;
}

.modal-header {
  padding: 50rpx 30rpx;
  color: #fff;
  text-align: center;
  position: relative;
}

.modal-emoji {
  font-size: 120rpx;
  display: block;
  margin-bottom: 16rpx;
}

.modal-name {
  font-size: 40rpx;
  font-weight: bold;
  display: block;
  margin-bottom: 8rpx;
}

.modal-rarity {
  display: inline-block;
  padding: 6rpx 20rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
}

.modal-rarity.rarity-1 { background: rgba(153, 153, 153, 0.3); }
.modal-rarity.rarity-2 { background: rgba(59, 130, 246, 0.3); }
.modal-rarity.rarity-3 { background: rgba(245, 158, 11, 0.3); }
.modal-rarity.rarity-4 { background: rgba(139, 92, 246, 0.3); }

.modal-close {
  position: absolute;
  top: 20rpx;
  right: 20rpx;
  font-size: 48rpx;
  opacity: 0.7;
  color: #fff;
}

.modal-body {
  padding: 30rpx;
}

.modal-desc {
  font-size: 28rpx;
  color: #666;
  display: block;
  margin-bottom: 24rpx;
  line-height: 1.5;
}

.dark-mode .modal-desc {
  color: #aaa;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #eee;
}

.dark-mode .detail-row {
  border-bottom-color: #333;
}

.detail-label {
  font-size: 26rpx;
  color: #999;
}

.detail-value {
  font-size: 26rpx;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.dark-mode .detail-value {
  color: #fff;
}

.category-icon {
  font-size: 28rpx;
}

.rarity-value.rarity-text-1 { color: #999; }
.rarity-value.rarity-text-2 { color: #3b82f6; }
.rarity-value.rarity-text-3 { color: #f59e0b; }
.rarity-value.rarity-text-4 { color: #8B5CF6; }

.detail-value.reward {
  color: #8B5CF6;
  font-weight: bold;
}

.modal-footer {
  display: flex;
  gap: 20rpx;
  padding: 20rpx 30rpx 30rpx;
}

.modal-btn {
  flex: 1;
  padding: 24rpx;
  font-size: 30rpx;
  font-weight: bold;
  border-radius: 40rpx;
  border: none;
}

.modal-btn.primary {
  background: linear-gradient(135deg, #8B5CF6, #7C3AED);
  color: #fff;
}

.modal-btn.secondary {
  background: #f5f5f5;
  color: #666;
}

.dark-mode .modal-btn.secondary {
  background: #333;
  color: #aaa;
}

.modal-btn::after {
  border: none;
}
</style>
