<!-- 里程碑管理 -->
<template>
  <view class="page-container">
    <view class="nav-bar">
      <view class="nav-left" @tap="goBack">
        <text class="icon">←</text>
      </view>
      <text class="nav-title">里程碑</text>
      <view class="nav-right" @tap="addMilestone">
        <text class="icon">+</text>
      </view>
    </view>

    <!-- 已达成里程碑 -->
    <view class="milestone-section" v-if="store.achievedMilestones.length > 0">
      <text class="section-title">🏆 已达成</text>
      <view class="milestone-list">
        <view class="milestone-card achieved" v-for="m in store.achievedMilestones" :key="m.id">
          <view class="milestone-icon">🏆</view>
          <view class="milestone-content">
            <text class="milestone-title">{{ m.title }}</text>
            <text class="milestone-desc">{{ m.description }}</text>
            <text class="milestone-date">达成于 {{ formatDate(m.achievedDate) }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 待达成里程碑 -->
    <view class="milestone-section" v-if="store.pendingMilestones.length > 0">
      <text class="section-title">🎯 待达成</text>
      <view class="milestone-list">
        <view class="milestone-card pending" v-for="m in store.pendingMilestones" :key="m.id" @tap="achieveMilestone(m)">
          <view class="milestone-icon">🎯</view>
          <view class="milestone-content">
            <text class="milestone-title">{{ m.title }}</text>
            <text class="milestone-desc">{{ m.description }}</text>
            <text class="milestone-date">目标: {{ formatDate(m.targetDate) }}</text>
          </view>
          <view class="achieve-btn" @tap.stop="achieveMilestone(m)">
            <text>达成</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view class="empty-state" v-if="store.milestones.length === 0">
      <text class="empty-icon">🏆</text>
      <text class="empty-text">还没有里程碑</text>
      <text class="empty-hint">设置成长目标，见证每一个重要时刻</text>
      <view class="add-btn" @tap="addMilestone">
        <text>添加里程碑</text>
      </view>
    </view>
  </view>
</template>

<script>
import { onMounted } from 'vue'
import { useGrowthPortfolioStore } from '@/stores/growthPortfolioStore.js'

export default {
  setup() {
    const store = useGrowthPortfolioStore()

    onMounted(() => {
      if (!store.currentBabyId) {
        uni.navigateBack()
      }
    })

    const formatDate = (dateStr) => {
      if (!dateStr) return '未设置'
      const date = new Date(dateStr)
      return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
    }

    const goBack = () => uni.navigateBack()

    const addMilestone = () => {
      uni.navigateTo({ url: '/pages/growth-portfolio/add-milestone' })
    }

    const achieveMilestone = (milestone) => {
      uni.showModal({
        title: '确认达成',
        content: `确认已达成里程碑"${milestone.title}"？`,
        success: (res) => {
          if (res.confirm) {
            store.achieveMilestoneItem(milestone.id)
            uni.showToast({ title: '恭喜达成！', icon: 'success' })
          }
        }
      })
    }

    return {
      store,
      formatDate,
      goBack,
      addMilestone,
      achieveMilestone
    }
  }
}
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background: #f5f5f5;
}

.nav-bar {
  display: flex;
  align-items: center;
  padding: 60px 32rpx 32rpx;
  background: #fff;
}

.nav-left .icon, .nav-right .icon {
  font-size: 48rpx;
  color: #333;
}

.nav-title {
  flex: 1;
  text-align: center;
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.nav-right .icon {
  color: #667eea;
}

.milestone-section {
  padding: 32rpx;
}

.section-title {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 20rpx;
  display: block;
}

.milestone-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.milestone-card {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
}

.milestone-card.achieved {
  border-left: 6rpx solid #ffd93d;
}

.milestone-card.pending {
  border-left: 6rpx solid #667eea;
}

.milestone-icon {
  font-size: 48rpx;
  margin-right: 20rpx;
}

.milestone-content {
  flex: 1;
}

.milestone-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.milestone-desc {
  font-size: 26rpx;
  color: #666;
  display: block;
  margin-bottom: 8rpx;
}

.milestone-date {
  font-size: 22rpx;
  color: #999;
}

.achieve-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-size: 26rpx;
  padding: 12rpx 24rpx;
  border-radius: 32rpx;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 200rpx 0;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 32rpx;
}

.empty-text {
  font-size: 32rpx;
  color: #333;
  margin-bottom: 16rpx;
}

.empty-hint {
  font-size: 26rpx;
  color: #999;
  margin-bottom: 40rpx;
}

.add-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-size: 30rpx;
  padding: 20rpx 60rpx;
  border-radius: 40rpx;
}
</style>
