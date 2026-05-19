<template>
  <view class="page-container" :class="{ 'dark-mode': isDarkMode }">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <view class="nav-left" @tap="goBack">
        <text class="icon">←</text>
      </view>
      <view class="nav-title">徽章库</view>
      <view class="nav-right"></view>
    </view>

    <!-- 收集进度卡片 -->
    <view class="collection-card">
      <view class="card-left">
        <view class="card-icon">🏅</view>
        <view class="card-info">
          <text class="card-title">{{ currentBabyName }}</text>
          <text class="card-subtitle">已收集 {{ unlockedCount }} / {{ totalCount }} 枚</text>
        </view>
      </view>
      <view class="card-rate">
        <text class="rate-num">{{ completionRate }}%</text>
        <text class="rate-label">收集率</text>
      </view>
    </view>

    <!-- 分类筛选 -->
    <view class="category-filter">
      <view 
        class="filter-item" 
        :class="{ active: activeCategory === 'all' }"
        @tap="switchCategory('all')"
      >
        <text class="filter-icon">🌟</text>
        <text class="filter-name">全部</text>
      </view>
      <view 
        class="filter-item" 
        :class="{ active: activeCategory === 'learning' }"
        @tap="switchCategory('learning')"
      >
        <text class="filter-icon">{{ categoryIcons.learning }}</text>
        <text class="filter-name">学习</text>
      </view>
      <view 
        class="filter-item" 
        :class="{ active: activeCategory === 'sports' }"
        @tap="switchCategory('sports')"
      >
        <text class="filter-icon">{{ categoryIcons.sports }}</text>
        <text class="filter-name">运动</text>
      </view>
      <view 
        class="filter-item" 
        :class="{ active: activeCategory === 'social' }"
        @tap="switchCategory('social')"
      >
        <text class="filter-icon">{{ categoryIcons.social }}</text>
        <text class="filter-name">社交</text>
      </view>
      <view 
        class="filter-item" 
        :class="{ active: activeCategory === 'creative' }"
        @tap="switchCategory('creative')"
      >
        <text class="filter-icon">{{ categoryIcons.creative }}</text>
        <text class="filter-name">创造</text>
      </view>
    </view>

    <!-- 稀有度筛选 -->
    <view class="rarity-filter">
      <view 
        class="rarity-item" 
        :class="{ active: activeRarity === 0 }"
        @tap="switchRarity(0)"
      >
        <text>全部</text>
      </view>
      <view 
        class="rarity-item rarity-common" 
        :class="{ active: activeRarity === 1 }"
        @tap="switchRarity(1)"
      >
        <text>普通</text>
      </view>
      <view 
        class="rarity-item rarity-rare" 
        :class="{ active: activeRarity === 2 }"
        @tap="switchRarity(2)"
      >
        <text>稀有</text>
      </view>
      <view 
        class="rarity-item rarity-legendary" 
        :class="{ active: activeRarity === 3 }"
        @tap="switchRarity(3)"
      >
        <text>传说</text>
      </view>
      <view 
        class="rarity-item rarity-mythic" 
        :class="{ active: activeRarity === 4 }"
        @tap="switchRarity(4)"
      >
        <text>神话</text>
      </view>
    </view>

    <!-- 徽章列表 -->
    <scroll-view scroll-y class="badge-scroll">
      <view class="badge-grid">
        <view 
          class="badge-cell" 
          v-for="badge in filteredBadges" 
          :key="badge.id"
          @tap="showBadgeDetail(badge)"
        >
          <view 
            class="badge-icon-wrap" 
            :class="{ locked: !badge.unlocked, ['rarity-' + badge.rarity]: true }"
            :style="{ background: getRarityGradient(badge.rarity) }"
          >
            <text class="badge-emoji">{{ badge.icon }}</text>
            <view v-if="!badge.unlocked" class="lock-overlay">
              <text class="lock-icon">🔒</text>
            </view>
            <view v-if="badge.unlocked" class="unlocked-check">✓</view>
          </view>
          <text class="badge-name" :class="{ locked: !badge.unlocked }">{{ badge.name }}</text>
          <text class="badge-rarity-text" :class="'rarity-text-' + badge.rarity">
            {{ getRarityName(badge.rarity) }}
          </text>
        </view>
      </view>
      
      <!-- 空状态 -->
      <view v-if="filteredBadges.length === 0" class="empty-state">
        <text class="empty-text">该分类暂无徽章</text>
      </view>
    </scroll-view>

    <!-- 徽章详情弹窗 -->
    <view class="badge-modal" v-if="selectedBadge" @tap="closeModal">
      <view class="modal-content" @tap.stop>
        <view class="modal-header">
          <view 
            class="modal-badge-icon"
            :style="{ background: getRarityGradient(selectedBadge.rarity) }"
          >
            <text class="modal-emoji">{{ selectedBadge.icon }}</text>
          </view>
          <view class="modal-badge-info">
            <text class="modal-name">{{ selectedBadge.name }}</text>
            <view class="modal-rarity-tag" :class="'rarity-tag-' + selectedBadge.rarity">
              <text>{{ getRarityName(selectedBadge.rarity) }}</text>
            </view>
          </view>
          <view class="modal-close" @tap="closeModal">×</view>
        </view>
        
        <view class="modal-body">
          <text class="modal-desc">{{ selectedBadge.description }}</text>
          
          <!-- 获取条件 -->
          <view class="condition-section">
            <text class="section-title">获取条件</text>
            <view class="condition-content">
              <text class="condition-text">{{ selectedBadge.description }}</text>
              <view v-if="!selectedBadge.unlocked" class="progress-info">
                <view class="progress-bar-mini">
                  <view 
                    class="progress-fill-mini" 
                    :style="{ width: selectedBadge.progress + '%' }"
                  ></view>
                </view>
                <text class="progress-text">{{ getProgressText(selectedBadge) }}</text>
              </view>
              <view v-else class="unlocked-status">
                <text class="unlocked-text">✓ 已解锁</text>
                <text class="unlocked-time">{{ formatTime(selectedBadge.unlockedAt) }}</text>
              </view>
            </view>
          </view>
          
          <!-- 奖励 -->
          <view class="reward-section">
            <text class="section-title">奖励</text>
            <view class="reward-content">
              <view class="reward-item">
                <text class="reward-icon">⭐</text>
                <text class="reward-value">+{{ selectedBadge.pointsReward }} 积分</text>
              </view>
            </view>
          </view>
        </view>
        
        <view class="modal-footer">
          <button class="action-btn" @tap="goToTask">{{ selectedBadge.unlocked ? '查看详情' : '去做任务' }}</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { isDarkTheme } from '@/utils/themeUtils.js'
import { useBadgeStore } from '@/stores/badgeStore'
import { useBabyStore } from '@/stores/babyStore'

export default {
  name: 'BadgeLibrary',
  setup() {
    const isDarkMode = ref(false)
    const badgeStore = useBadgeStore()
    const babyStore = useBabyStore()
    const activeCategory = ref('all')
    const activeRarity = ref(0)
    const selectedBadge = ref(null)

    const categoryIcons = {
      learning: '📚',
      sports: '🏃',
      social: '👥',
      creative: '🎨'
    }

    // 当前宝宝名称
    const currentBabyName = computed(() => {
      return babyStore.currentBabyName || '未选择宝宝'
    })

    // 徽章列表
    const allBadges = computed(() => {
      return badgeStore.currentBabyBadges
    })

    // 已解锁数量
    const unlockedCount = computed(() => {
      return badgeStore.currentBabyUnlockedCount
    })

    // 总数量
    const totalCount = computed(() => {
      return badgeStore.currentBabyTotalCount
    })

    // 完成率
    const completionRate = computed(() => {
      return badgeStore.currentBabyCompletionRate
    })

    // 筛选后的徽章列表
    const filteredBadges = computed(() => {
      let result = allBadges.value
      
      if (activeCategory.value !== 'all') {
        result = result.filter(b => b.category === activeCategory.value)
      }
      
      if (activeRarity.value !== 0) {
        result = result.filter(b => b.rarity === activeRarity.value)
      }
      
      return result
    })

    // 切换分类
    const switchCategory = (category) => {
      activeCategory.value = category
    }

    // 切换稀有度
    const switchRarity = (rarity) => {
      activeRarity.value = rarity
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

    // 获取进度文字
    const getProgressText = (badge) => {
      const babyId = babyStore.currentBabyId
      if (!babyId) return '0/0'
      return badgeStore.getProgressText(babyId, badge)
    }

    // 格式化时间
    const formatTime = (timeStr) => {
      if (!timeStr) return ''
      const date = new Date(timeStr)
      const month = date.getMonth() + 1
      const day = date.getDate()
      return `${month}月${day}日解锁`
    }

    // 显示徽章详情
    const showBadgeDetail = (badge) => {
      selectedBadge.value = badge
    }

    // 关闭弹窗
    const closeModal = () => {
      selectedBadge.value = null
    }

    // 去做任务
    const goToTask = () => {
      closeModal()
      // 根据分类跳转到对应页面
      const categoryRoutes = {
        learning: '/pages/task/task-list',
        sports: '/pages/health/health',
        social: '/pages/social/friends',
        creative: '/pages/art/art'
      }
      const route = categoryRoutes[selectedBadge.value?.category]
      if (route) {
        uni.navigateTo({ url: route })
      }
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
      activeCategory,
      activeRarity,
      selectedBadge,
      categoryIcons,
      currentBabyName,
      allBadges,
      unlockedCount,
      totalCount,
      completionRate,
      filteredBadges,
      switchCategory,
      switchRarity,
      getRarityName,
      getRarityGradient,
      getProgressText,
      formatTime,
      showBadgeDetail,
      closeModal,
      goToTask,
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

/* 收集进度卡片 */
.collection-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 20rpx;
  padding: 30rpx;
  background: linear-gradient(135deg, #8B5CF6, #7C3AED);
  border-radius: 20rpx;
  color: #fff;
}

.card-left {
  display: flex;
  align-items: center;
}

.card-icon {
  font-size: 60rpx;
  margin-right: 20rpx;
}

.card-title {
  font-size: 32rpx;
  font-weight: bold;
  display: block;
}

.card-subtitle {
  font-size: 24rpx;
  opacity: 0.8;
  display: block;
  margin-top: 8rpx;
}

.card-rate {
  text-align: center;
}

.rate-num {
  font-size: 48rpx;
  font-weight: bold;
  display: block;
}

.rate-label {
  font-size: 22rpx;
  opacity: 0.8;
}

/* 分类筛选 */
.category-filter {
  display: flex;
  padding: 20rpx;
  margin: 0 20rpx;
  background-color: #fff;
  border-radius: 16rpx;
  gap: 8rpx;
}

.dark-mode .category-filter {
  background-color: #2a2a2a;
}

.filter-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16rpx 0;
  border-radius: 12rpx;
  transition: all 0.2s;
}

.filter-item.active {
  background-color: rgba(139, 92, 246, 0.1);
}

.filter-icon {
  font-size: 36rpx;
  margin-bottom: 4rpx;
}

.filter-name {
  font-size: 22rpx;
  color: #666;
}

.filter-item.active .filter-name {
  color: #8B5CF6;
  font-weight: bold;
}

.dark-mode .filter-name {
  color: #999;
}

/* 稀有度筛选 */
.rarity-filter {
  display: flex;
  padding: 16rpx 20rpx;
  margin: 16rpx 20rpx;
  background-color: #fff;
  border-radius: 12rpx;
  gap: 8rpx;
}

.dark-mode .rarity-filter {
  background-color: #2a2a2a;
}

.rarity-item {
  flex: 1;
  text-align: center;
  padding: 12rpx 0;
  font-size: 22rpx;
  color: #666;
  border-radius: 8rpx;
  transition: all 0.2s;
}

.rarity-item.active {
  font-weight: bold;
}

.rarity-item.rarity-common.active {
  background-color: rgba(153, 153, 153, 0.2);
  color: #999;
}

.rarity-item.rarity-rare.active {
  background-color: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
}

.rarity-item.rarity-legendary.active {
  background-color: rgba(245, 158, 11, 0.2);
  color: #f59e0b;
}

.rarity-item.rarity-mythic.active {
  background-color: rgba(139, 92, 246, 0.2);
  color: #8B5CF6;
}

/* 徽章网格 */
.badge-scroll {
  height: calc(100vh - 500rpx);
  padding: 20rpx;
}

.badge-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.badge-cell {
  width: calc(33.33% - 14rpx);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx 0;
  background-color: #fff;
  border-radius: 16rpx;
}

.dark-mode .badge-cell {
  background-color: #2a2a2a;
}

.badge-icon-wrap {
  width: 120rpx;
  height: 120rpx;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin-bottom: 12rpx;
}

.badge-icon-wrap.locked {
  opacity: 0.5;
}

.lock-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lock-icon {
  font-size: 32rpx;
}

.unlocked-check {
  position: absolute;
  top: -8rpx;
  right: -8rpx;
  width: 36rpx;
  height: 36rpx;
  background-color: #22c55e;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20rpx;
  font-weight: bold;
  border: 2rpx solid #fff;
}

.badge-emoji {
  font-size: 56rpx;
}

.badge-name {
  font-size: 24rpx;
  font-weight: bold;
  color: #333;
  text-align: center;
  margin-bottom: 4rpx;
}

.badge-name.locked {
  color: #999;
}

.dark-mode .badge-name {
  color: #fff;
}

.badge-rarity-text {
  font-size: 18rpx;
}

.rarity-text-1 { color: #999; }
.rarity-text-2 { color: #3b82f6; }
.rarity-text-3 { color: #f59e0b; }
.rarity-text-4 { color: #8B5CF6; }

/* 空状态 */
.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300rpx;
}

.empty-text {
  color: #999;
  font-size: 28rpx;
}

/* 徽章详情弹窗 */
.badge-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  width: 650rpx;
  background-color: #fff;
  border-radius: 24rpx;
  overflow: hidden;
}

.dark-mode .modal-content {
  background-color: #2a2a2a;
}

.modal-header {
  display: flex;
  align-items: center;
  padding: 30rpx;
  background: linear-gradient(135deg, #8B5CF6, #7C3AED);
  color: #fff;
}

.modal-badge-icon {
  width: 120rpx;
  height: 120rpx;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
}

.modal-emoji {
  font-size: 60rpx;
}

.modal-badge-info {
  flex: 1;
}

.modal-name {
  font-size: 36rpx;
  font-weight: bold;
  display: block;
  margin-bottom: 8rpx;
}

.modal-rarity-tag {
  display: inline-block;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  font-size: 20rpx;
}

.rarity-tag-1 { background-color: rgba(153, 153, 153, 0.3); color: #fff; }
.rarity-tag-2 { background-color: rgba(59, 130, 246, 0.3); color: #fff; }
.rarity-tag-3 { background-color: rgba(245, 158, 11, 0.3); color: #fff; }
.rarity-tag-4 { background-color: rgba(139, 92, 246, 0.3); color: #fff; }

.modal-close {
  position: absolute;
  right: 30rpx;
  font-size: 48rpx;
  color: rgba(255, 255, 255, 0.7);
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

.condition-section,
.reward-section {
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 26rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 12rpx;
}

.dark-mode .section-title {
  color: #fff;
}

.condition-content {
  background-color: #f5f5f5;
  border-radius: 12rpx;
  padding: 16rpx;
}

.dark-mode .condition-content {
  background-color: #1a1a1a;
}

.condition-text {
  font-size: 24rpx;
  color: #666;
  display: block;
  margin-bottom: 12rpx;
}

.progress-info {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.progress-bar-mini {
  flex: 1;
  height: 8rpx;
  background-color: #ddd;
  border-radius: 4rpx;
  overflow: hidden;
}

.progress-fill-mini {
  height: 100%;
  background: linear-gradient(90deg, #8B5CF6, #7C3AED);
  border-radius: 4rpx;
  transition: width 0.3s;
}

.progress-text {
  font-size: 22rpx;
  color: #8B5CF6;
  min-width: 80rpx;
  text-align: right;
}

.unlocked-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.unlocked-text {
  font-size: 24rpx;
  color: #22c55e;
  font-weight: bold;
}

.unlocked-time {
  font-size: 22rpx;
  color: #999;
}

.reward-content {
  background-color: #f5f5f5;
  border-radius: 12rpx;
  padding: 16rpx;
}

.dark-mode .reward-content {
  background-color: #1a1a1a;
}

.reward-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.reward-icon {
  font-size: 28rpx;
}

.reward-value {
  font-size: 26rpx;
  color: #8B5CF6;
  font-weight: bold;
}

.modal-footer {
  padding: 20rpx 30rpx 30rpx;
}

.action-btn {
  width: 100%;
  padding: 24rpx;
  background: linear-gradient(135deg, #8B5CF6, #7C3AED);
  color: #fff;
  font-size: 32rpx;
  font-weight: bold;
  border-radius: 40rpx;
  border: none;
}

.action-btn::after {
  border: none;
}
</style>
