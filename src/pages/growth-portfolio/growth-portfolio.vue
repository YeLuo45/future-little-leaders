<!-- 成长档案袋主页 -->
<template>
  <view class="page-container">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <view class="nav-left" @tap="goBack">
        <text class="icon">←</text>
      </view>
      <text class="nav-title">成长档案袋</text>
      <view class="nav-right" @tap="showExportMenu">
        <text class="icon">📤</text>
      </view>
    </view>

    <!-- 档案封面卡片 -->
    <view class="portfolio-cover" @tap="navigateTo('portfolio-cover')">
      <view class="cover-bg" :style="coverStyle"></view>
      <view class="cover-content">
        <text class="cover-icon">📁</text>
        <text class="cover-title">{{ store.currentPortfolio?.title || '我的成长档案' }}</text>
        <text class="cover-subtitle">{{ worksCount }}件作品 · {{ timelineCount }}条记录</text>
      </view>
      <view class="cover-edit">
        <text class="edit-icon">✏️</text>
      </view>
    </view>

    <!-- 模块选择 -->
    <view class="modules-section">
      <view class="module-card" @tap="navigateTo('work-gallery')">
        <view class="module-icon-wrapper">
          <text class="module-icon">🎨</text>
        </view>
        <view class="module-info">
          <text class="module-title">作品集</text>
          <text class="module-subtitle">我的创作作品</text>
        </view>
        <view class="module-badge" v-if="store.works.length > 0">{{ store.works.length }}</view>
        <view class="module-arrow">›</view>
      </view>

      <view class="module-card" @tap="navigateTo('growth-timeline')">
        <view class="module-icon-wrapper">
          <text class="module-icon">📅</text>
        </view>
        <view class="module-info">
          <text class="module-title">成长时间线</text>
          <text class="module-subtitle">记录每个重要时刻</text>
        </view>
        <view class="module-arrow">›</view>
      </view>

      <view class="module-card" @tap="navigateTo('milestones')">
        <view class="module-icon-wrapper">
          <text class="module-icon">🏆</text>
        </view>
        <view class="module-info">
          <text class="module-title">里程碑</text>
          <text class="module-subtitle">成长中的重要成就</text>
        </view>
        <view class="module-badge" v-if="achievedCount > 0">{{ achievedCount }}</view>
        <view class="module-arrow">›</view>
      </view>
    </view>

    <!-- 档案分类预览 -->
    <view class="categories-section">
      <text class="section-title">综合素质档案</text>
      <view class="categories-grid">
        <view 
          class="category-item" 
          v-for="cat in store.currentPortfolio?.categories" 
          :key="cat.id"
          @tap="showCategoryEntries(cat)"
        >
          <view class="category-icon" :style="{ background: cat.color + '20' }">
            <text class="category-emoji">{{ cat.icon }}</text>
          </view>
          <text class="category-name">{{ cat.name }}</text>
          <text class="category-count">{{ cat.entries?.length || 0 }}</text>
        </view>
      </view>
    </view>

    <!-- 最近作品预览 -->
    <view class="recent-works" v-if="recentWorks.length > 0">
      <view class="section-header">
        <text class="section-title">最近作品</text>
        <text class="see-all" @tap="navigateTo('work-gallery')">查看全部 ›</text>
      </view>
      <scroll-view class="works-scroll" scroll-x>
        <view class="work-card" v-for="work in recentWorks" :key="work.id" @tap="viewWork(work)">
          <image class="work-thumb" :src="work.thumbnail || '/static/default-work.png'" mode="aspectFill"></image>
          <text class="work-title">{{ work.title }}</text>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script>
import { onMounted, computed } from 'vue'
import { useGrowthPortfolioStore } from '@/stores/growthPortfolioStore.js'
import { useBabyStore } from '@/stores/babyStore.js'

export default {
  setup() {
    const store = useGrowthPortfolioStore()
    const babyStore = useBabyStore()

    onMounted(() => {
      babyStore.loadBabies()
      if (babyStore.currentBabyId) {
        store.init(babyStore.currentBabyId)
      }
    })

    const worksCount = computed(() => store.works.length)
    const timelineCount = computed(() => store.timeline.length)
    const achievedCount = computed(() => store.achievedMilestones.length)
    const recentWorks = computed(() => store.works.slice(0, 5))

    const coverStyle = computed(() => {
      const portfolio = store.currentPortfolio
      if (portfolio?.coverImage) {
        return { backgroundImage: `url(${portfolio.coverImage})` }
      }
      return { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }
    })

    const navigateTo = (page) => {
      uni.navigateTo({ url: `/pages/growth-portfolio/${page}` })
    }

    const goBack = () => {
      uni.navigateBack()
    }

    const showExportMenu = () => {
      uni.showActionSheet({
        itemList: ['导出档案', '生成分享文本', '分享给家人'],
        success: (res) => {
          if (res.tapIndex === 0) {
            exportPortfolio()
          } else if (res.tapIndex === 1) {
            shareAsText()
          }
        }
      })
    }

    const exportPortfolio = () => {
      const data = store.exportData()
      uni.showToast({ title: '档案已导出', icon: 'success' })
      console.log('导出数据:', data)
    }

    const shareAsText = () => {
      const babyName = babyStore.currentBaby?.name || '宝宝'
      const report = store.generateReport(babyName)
      uni.setClipboardData({
        data: report,
        success: () => uni.showToast({ title: '已复制到剪贴板', icon: 'success' })
      })
    }

    const showCategoryEntries = (category) => {
      uni.navigateTo({ 
        url: `/pages/growth-portfolio/category-detail?categoryId=${category.id}&categoryName=${category.name}` 
      })
    }

    const viewWork = (work) => {
      uni.navigateTo({ 
        url: `/pages/growth-portfolio/work-detail?workId=${work.id}` 
      })
    }

    return {
      store,
      worksCount,
      timelineCount,
      achievedCount,
      recentWorks,
      coverStyle,
      navigateTo,
      goBack,
      showExportMenu,
      showCategoryEntries,
      viewWork
    }
  }
}
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 40rpx;
}

.nav-bar {
  display: flex;
  align-items: center;
  padding: 60px 32rpx 32rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.nav-left .icon, .nav-right .icon {
  font-size: 48rpx;
  color: #fff;
}

.nav-title {
  flex: 1;
  text-align: center;
  font-size: 36rpx;
  font-weight: bold;
  color: #fff;
}

.nav-right {
  width: 60rpx;
  text-align: center;
}

.portfolio-cover {
  margin: 32rpx;
  border-radius: 24rpx;
  overflow: hidden;
  position: relative;
  height: 240rpx;
}

.cover-bg {
  position: absolute;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
}

.cover-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: rgba(0,0,0,0.3);
}

.cover-icon {
  font-size: 64rpx;
  margin-bottom: 12rpx;
}

.cover-title {
  font-size: 40rpx;
  font-weight: bold;
  color: #fff;
  margin-bottom: 8rpx;
}

.cover-subtitle {
  font-size: 26rpx;
  color: rgba(255,255,255,0.8);
}

.cover-edit {
  position: absolute;
  top: 20rpx;
  right: 20rpx;
  width: 60rpx;
  height: 60rpx;
  background: rgba(255,255,255,0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.edit-icon {
  font-size: 32rpx;
}

.modules-section {
  margin: 0 32rpx 32rpx;
}

.module-card {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 20rpx;
  padding: 28rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.05);
}

.module-icon-wrapper {
  width: 80rpx;
  height: 80rpx;
  border-radius: 20rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
}

.module-icon {
  font-size: 40rpx;
}

.module-info {
  flex: 1;
}

.module-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 4rpx;
}

.module-subtitle {
  font-size: 24rpx;
  color: #999;
}

.module-badge {
  background: #ff6b6b;
  color: #fff;
  font-size: 22rpx;
  padding: 4rpx 16rpx;
  border-radius: 20rpx;
  margin-right: 16rpx;
}

.module-arrow {
  font-size: 48rpx;
  color: #ccc;
}

.categories-section {
  margin: 0 32rpx 32rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16rpx;
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #fff;
  border-radius: 16rpx;
  padding: 20rpx 8rpx;
}

.category-icon {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8rpx;
}

.category-emoji {
  font-size: 36rpx;
}

.category-name {
  font-size: 22rpx;
  color: #666;
  margin-bottom: 4rpx;
  text-align: center;
}

.category-count {
  font-size: 20rpx;
  color: #999;
}

.recent-works {
  margin: 0 32rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.section-header .section-title {
  margin-bottom: 0;
}

.see-all {
  font-size: 26rpx;
  color: #667eea;
}

.works-scroll {
  white-space: nowrap;
}

.work-card {
  display: inline-block;
  width: 200rpx;
  margin-right: 20rpx;
}

.work-thumb {
  width: 200rpx;
  height: 200rpx;
  border-radius: 16rpx;
  background: #eee;
}

.work-title {
  font-size: 24rpx;
  color: #666;
  margin-top: 8rpx;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
