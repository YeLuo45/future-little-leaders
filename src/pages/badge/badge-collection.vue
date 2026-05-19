<template>
  <view class="page-container" :class="{ 'dark-mode': isDarkMode }">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <view class="nav-left" @tap="goBack">
        <text class="icon">←</text>
      </view>
      <view class="nav-title">徽章收集</view>
      <view class="nav-right">
        <view class="share-btn" @tap="shareCollection">
          <text class="share-icon">📤</text>
        </view>
      </view>
    </view>

    <!-- 收集进度卡片 -->
    <view class="collection-card">
      <view class="collection-header">
        <view class="collection-avatar">
          <text class="avatar-emoji">{{ babyAvatar }}</text>
        </view>
        <view class="collection-info">
          <text class="collection-title">{{ currentBabyName }}</text>
          <text class="collection-subtitle">徽章收集进度</text>
        </view>
      </view>
      <view class="collection-stats">
        <view class="stat-item">
          <text class="stat-value">{{ unlockedCount }}</text>
          <text class="stat-label">已解锁</text>
        </view>
        <view class="stat-divider"></view>
        <view class="stat-item">
          <text class="stat-value">{{ lockedCount }}</text>
          <text class="stat-label">未解锁</text>
        </view>
        <view class="stat-divider"></view>
        <view class="stat-item">
          <text class="stat-value">{{ completionRate }}%</text>
          <text class="stat-label">完成率</text>
        </view>
      </view>
      <view class="progress-bar">
        <view class="progress-fill" :style="{ width: completionRate + '%' }"></view>
      </view>
    </view>

    <!-- 分类进度 -->
    <view class="category-progress">
      <view 
        class="category-item" 
        v-for="(count, category) in categoryProgress" 
        :key="category"
        @tap="switchCategory(category)"
      >
        <view class="category-icon" :style="{ background: getCategoryColor(category) }">
          <text>{{ getCategoryIcon(category) }}</text>
        </view>
        <view class="category-info">
          <text class="category-name">{{ getCategoryName(category) }}</text>
          <view class="category-bar">
            <view 
              class="category-fill" 
              :style="{ width: getCategoryProgress(category) + '%', background: getCategoryColor(category) }"
            ></view>
          </view>
        </view>
        <text class="category-count">{{ getCategoryCount(category) }}/{{ getCategoryTotal(category) }}</text>
      </view>
    </view>

    <!-- 收集的徽章列表 -->
    <view class="section-header">
      <text class="section-title">已收集徽章</text>
      <text class="section-count">{{ unlockedCount }} 枚</text>
    </view>
    
    <scroll-view scroll-y class="badge-scroll">
      <view class="collected-badges">
        <view 
          class="badge-item" 
          v-for="badge in collectedBadges" 
          :key="badge.badgeId"
          @tap="showBadgeDetail(badge)"
        >
          <view 
            class="badge-icon" 
            :style="{ background: getRarityGradient(badge.rarity) }"
          >
            <text class="badge-emoji">{{ badge.icon }}</text>
          </view>
          <view class="badge-info">
            <text class="badge-name">{{ badge.name }}</text>
            <view class="badge-meta">
              <text class="badge-category">{{ getCategoryName(badge.category) }}</text>
              <text class="badge-rarity" :class="'rarity-' + badge.rarity">{{ getRarityName(badge.rarity) }}</text>
            </view>
          </view>
          <text class="badge-time">{{ formatTime(badge.unlockedAt) }}</text>
        </view>
      </view>
      
      <!-- 未解锁徽章预览 -->
      <view class="section-header locked-section">
        <text class="section-title">未解锁徽章</text>
        <text class="section-count">{{ lockedCount }} 枚</text>
      </view>
      
      <view class="locked-badges">
        <view 
          class="locked-badge-item"
          v-for="badge in lockedBadges.slice(0, 6)" 
          :key="badge.id"
          @tap="showBadgeDetail(badge)"
        >
          <view class="locked-icon-wrap">
            <text class="locked-emoji">{{ badge.icon }}</text>
            <view class="lock-overlay">🔒</view>
          </view>
          <text class="locked-name">{{ badge.name }}</text>
          <view class="locked-progress">
            <view class="mini-progress">
              <view class="mini-fill" :style="{ width: badge.progress + '%' }"></view>
            </view>
            <text class="mini-text">{{ badge.progress }}%</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 徽章详情弹窗 -->
    <view class="detail-modal" v-if="selectedBadge" @tap="closeModal">
      <view class="modal-content" @tap.stop>
        <view class="modal-header" :style="{ background: getRarityGradient(selectedBadge.rarity || selectedBadge.badge?.rarity) }">
          <text class="modal-emoji">{{ selectedBadge.icon || selectedBadge.badge?.icon }}</text>
          <text class="modal-name">{{ selectedBadge.name || selectedBadge.badge?.name }}</text>
          <view class="modal-rarity" :class="'rarity-' + (selectedBadge.rarity || selectedBadge.badge?.rarity)">
            {{ getRarityName(selectedBadge.rarity || selectedBadge.badge?.rarity) }}
          </view>
          <view class="modal-close" @tap="closeModal">×</view>
        </view>
        
        <view class="modal-body">
          <text class="modal-desc">{{ selectedBadge.description || selectedBadge.badge?.description }}</text>
          
          <view class="detail-row">
            <text class="detail-label">分类</text>
            <text class="detail-value">{{ getCategoryName(selectedBadge.category || selectedBadge.badge?.category) }}</text>
          </view>
          
          <view class="detail-row" v-if="selectedBadge.unlocked">
            <text class="detail-label">解锁时间</text>
            <text class="detail-value">{{ formatFullTime(selectedBadge.unlockedAt) }}</text>
          </view>
          
          <view class="detail-row" v-if="!selectedBadge.unlocked">
            <text class="detail-label">获取条件</text>
            <text class="detail-value">{{ selectedBadge.description || selectedBadge.badge?.description }}</text>
          </view>
          
          <view class="detail-row">
            <text class="detail-label">奖励积分</text>
            <text class="detail-value reward">+{{ selectedBadge.pointsReward || selectedBadge.badge?.pointsReward }}</text>
          </view>
        </view>
        
        <view class="modal-footer">
          <button class="modal-btn" @tap="closeModal">关闭</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { isDarkTheme } from '@/utils/themeUtils.js'
import { useBadgeStore } from '@/stores/badgeStore'
import { useBabyStore } from '@/stores/babyStore'

export default {
  name: 'BadgeCollection',
  setup() {
    const isDarkMode = ref(false)
    const badgeStore = useBadgeStore()
    const babyStore = useBabyStore()
    const selectedBadge = ref(null)
    const selectedCategory = ref('all')

    // 当前宝宝名称
    const currentBabyName = computed(() => {
      return babyStore.currentBabyName || '小宝宝'
    })

    // 宝宝头像
    const babyAvatar = computed(() => {
      const babies = babyStore.babies
      const current = babies.find(b => b.id === babyStore.currentBabyId)
      return current?.avatar || '👶'
    })

    // 所有徽章
    const allBadges = computed(() => {
      return badgeStore.currentBabyBadges
    })

    // 已收集徽章
    const collectedBadges = computed(() => {
      return allBadges.value.filter(b => b.unlocked)
    })

    // 未解锁徽章
    const lockedBadges = computed(() => {
      return allBadges.value.filter(b => !b.unlocked)
    })

    // 已解锁数量
    const unlockedCount = computed(() => {
      return badgeStore.currentBabyUnlockedCount
    })

    // 未解锁数量
    const lockedCount = computed(() => {
      return badgeStore.currentBabyTotalCount - badgeStore.currentBabyUnlockedCount
    })

    // 完成率
    const completionRate = computed(() => {
      return badgeStore.currentBabyCompletionRate
    })

    // 分类进度
    const categoryProgress = computed(() => {
      const badgesByCategory = badgeStore.badgesByCategory
      const result = {}
      for (const cat in badgesByCategory) {
        const catBadges = badgesByCategory[cat]
        const babyId = babyStore.currentBabyId
        if (babyId) {
          const unlocked = catBadges.filter(b => {
            const babyBadge = badgeStore.babyBadges[babyId]
            return babyBadge && babyBadge.some(ub => ub.badgeId === b.id && ub.unlocked)
          }).length
          result[cat] = { unlocked, total: catBadges.length }
        } else {
          result[cat] = { unlocked: 0, total: catBadges.length }
        }
      }
      return result
    })

    // 徽章详情中获取badge对象
    const getBadgeObject = (item) => {
      if (item.badge) return item
      return { ...item, badge: item }
    }

    // 获取分类图标
    const getCategoryIcon = (category) => {
      const icons = { learning: '📚', sports: '🏃', social: '👥', creative: '🎨' }
      return icons[category] || '🌟'
    }

    // 获取分类名称
    const getCategoryName = (category) => {
      const names = { learning: '学习', sports: '运动', social: '社交', creative: '创造' }
      return names[category] || '全部'
    }

    // 获取分类颜色
    const getCategoryColor = (category) => {
      const colors = { 
        learning: '#3b82f6', 
        sports: '#22c55e', 
        social: '#ec4899', 
        creative: '#f97316' 
      }
      return colors[category] || '#8B5CF6'
    }

    // 获取分类进度百分比
    const getCategoryProgress = (category) => {
      const prog = categoryProgress.value[category]
      if (!prog || prog.total === 0) return 0
      return Math.round((prog.unlocked / prog.total) * 100)
    }

    // 获取分类数量
    const getCategoryCount = (category) => {
      return categoryProgress.value[category]?.unlocked || 0
    }

    // 获取分类总数
    const getCategoryTotal = (category) => {
      return categoryProgress.value[category]?.total || 0
    }

    // 获取稀有度名称
    const getRarityName = (rarity) => {
      const names = { 1: '普通', 2: '稀有', 3: '传说', 4: '神话' }
      return names[rarity] || '普通'
    }

    // 获取稀有度渐变
    const getRarityGradient = (rarity) => {
      const gradients = {
        1: 'linear-gradient(135deg, #999, #666)',
        2: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
        3: 'linear-gradient(135deg, #f59e0b, #d97706)',
        4: 'linear-gradient(135deg, #8B5CF6, #7C3AED)'
      }
      return gradients[rarity] || gradients[1]
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

    // 切换分类
    const switchCategory = (category) => {
      selectedCategory.value = category
    }

    // 分享收集
    const shareCollection = () => {
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

    // 返回上一页
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
      selectedCategory,
      currentBabyName,
      babyAvatar,
      collectedBadges,
      lockedBadges,
      unlockedCount,
      lockedCount,
      completionRate,
      categoryProgress,
      getBadgeObject,
      getCategoryIcon,
      getCategoryName,
      getCategoryColor,
      getCategoryProgress,
      getCategoryCount,
      getCategoryTotal,
      getRarityName,
      getRarityGradient,
      formatTime,
      formatFullTime,
      showBadgeDetail,
      closeModal,
      switchCategory,
      shareCollection,
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

.share-btn {
  padding: 10rpx;
}

.share-icon {
  font-size: 40rpx;
}

/* 收集进度卡片 */
.collection-card {
  margin: 20rpx;
  padding: 30rpx;
  background: linear-gradient(135deg, #8B5CF6, #7C3AED);
  border-radius: 20rpx;
  color: #fff;
}

.collection-header {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
}

.collection-avatar {
  width: 100rpx;
  height: 100rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
}

.avatar-emoji {
  font-size: 56rpx;
}

.collection-title {
  font-size: 36rpx;
  font-weight: bold;
  display: block;
}

.collection-subtitle {
  font-size: 24rpx;
  opacity: 0.8;
  display: block;
  margin-top: 4rpx;
}

.collection-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20rpx;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 48rpx;
  font-weight: bold;
  display: block;
}

.stat-label {
  font-size: 22rpx;
  opacity: 0.8;
}

.stat-divider {
  width: 2rpx;
  background: rgba(255, 255, 255, 0.3);
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
  transition: width 0.3s;
}

/* 分类进度 */
.category-progress {
  margin: 0 20rpx;
  padding: 20rpx;
  background: #fff;
  border-radius: 16rpx;
}

.dark-mode .category-progress {
  background: #2a2a2a;
}

.category-item {
  display: flex;
  align-items: center;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #eee;
}

.dark-mode .category-item {
  border-bottom-color: #333;
}

.category-item:last-child {
  border-bottom: none;
}

.category-icon {
  width: 60rpx;
  height: 60rpx;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16rpx;
  font-size: 28rpx;
}

.category-info {
  flex: 1;
}

.category-name {
  font-size: 26rpx;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.dark-mode .category-name {
  color: #fff;
}

.category-bar {
  height: 8rpx;
  background: #eee;
  border-radius: 4rpx;
  overflow: hidden;
}

.dark-mode .category-bar {
  background: #333;
}

.category-fill {
  height: 100%;
  border-radius: 4rpx;
  transition: width 0.3s;
}

.category-count {
  font-size: 22rpx;
  color: #999;
  margin-left: 16rpx;
}

/* 区域标题 */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 20rpx 16rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.dark-mode .section-title {
  color: #fff;
}

.section-count {
  font-size: 24rpx;
  color: #999;
}

.locked-section {
  margin-top: 20rpx;
}

/* 徽章滚动区 */
.badge-scroll {
  height: calc(100vh - 700rpx);
  padding: 0 20rpx;
}

/* 已收集徽章 */
.collected-badges {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.badge-item {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background: #fff;
  border-radius: 16rpx;
}

.dark-mode .badge-item {
  background: #2a2a2a;
}

.badge-icon {
  width: 100rpx;
  height: 100rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16rpx;
}

.badge-emoji {
  font-size: 48rpx;
}

.badge-info {
  flex: 1;
}

.badge-name {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.dark-mode .badge-name {
  color: #fff;
}

.badge-meta {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.badge-category {
  font-size: 22rpx;
  color: #666;
}

.dark-mode .badge-category {
  color: #999;
}

.badge-rarity {
  font-size: 20rpx;
  padding: 2rpx 8rpx;
  border-radius: 6rpx;
}

.badge-rarity.rarity-1 { background: rgba(153, 153, 153, 0.2); color: #999; }
.badge-rarity.rarity-2 { background: rgba(59, 130, 246, 0.2); color: #3b82f6; }
.badge-rarity.rarity-3 { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }
.badge-rarity.rarity-4 { background: rgba(139, 92, 246, 0.2); color: #8B5CF6; }

.badge-time {
  font-size: 22rpx;
  color: #999;
}

/* 未解锁徽章 */
.locked-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-top: 16rpx;
}

.locked-badge-item {
  width: calc(33.33% - 11rpx);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx 0;
  background: #fff;
  border-radius: 16rpx;
}

.dark-mode .locked-badge-item {
  background: #2a2a2a;
}

.locked-icon-wrap {
  width: 100rpx;
  height: 100rpx;
  border-radius: 20rpx;
  background: linear-gradient(135deg, #999, #666);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin-bottom: 12rpx;
  opacity: 0.5;
}

.locked-emoji {
  font-size: 48rpx;
}

.lock-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
}

.locked-name {
  font-size: 22rpx;
  color: #999;
  text-align: center;
  margin-bottom: 8rpx;
}

.locked-progress {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rpx;
  width: 80%;
}

.mini-progress {
  width: 100%;
  height: 4rpx;
  background: #eee;
  border-radius: 2rpx;
  overflow: hidden;
}

.dark-mode .mini-progress {
  background: #333;
}

.mini-fill {
  height: 100%;
  background: #8B5CF6;
  border-radius: 2rpx;
}

.mini-text {
  font-size: 18rpx;
  color: #999;
}

/* 详情弹窗 */
.detail-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
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
  padding: 40rpx 30rpx;
  color: #fff;
  text-align: center;
  position: relative;
}

.modal-emoji {
  font-size: 100rpx;
  display: block;
  margin-bottom: 16rpx;
}

.modal-name {
  font-size: 36rpx;
  font-weight: bold;
  display: block;
  margin-bottom: 8rpx;
}

.modal-rarity {
  display: inline-block;
  padding: 4rpx 16rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
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
}

.dark-mode .detail-value {
  color: #fff;
}

.detail-value.reward {
  color: #8B5CF6;
  font-weight: bold;
}

.modal-footer {
  padding: 20rpx 30rpx 30rpx;
}

.modal-btn {
  width: 100%;
  padding: 24rpx;
  background: linear-gradient(135deg, #8B5CF6, #7C3AED);
  color: #fff;
  font-size: 32rpx;
  font-weight: bold;
  border-radius: 40rpx;
  border: none;
}

.modal-btn::after {
  border: none;
}
</style>
