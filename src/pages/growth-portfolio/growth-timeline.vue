<!-- 成长时间线 -->
<template>
  <view class="page-container">
    <view class="nav-bar">
      <view class="nav-left" @tap="goBack">
        <text class="icon">←</text>
      </view>
      <text class="nav-title">成长时间线</text>
      <view class="nav-right" @tap="addEvent">
        <text class="icon">+</text>
      </view>
    </view>

    <!-- 时间线内容 -->
    <view class="timeline-content" v-if="store.timeline.length > 0">
      <view class="year-section" v-for="year in store.sortedYears" :key="year">
        <view class="year-header">
          <text class="year-text">{{ year }}</text>
        </view>
        
        <view class="timeline-list">
          <view class="timeline-item" v-for="event in store.timelineByYear[year]" :key="event.id">
            <view class="timeline-marker">
              <view class="marker-dot"></view>
              <view class="marker-line"></view>
            </view>
            <view class="timeline-card" @tap="viewEvent(event)">
              <view class="event-header">
                <text class="event-date">{{ formatDate(event.date) }}</text>
                <text class="event-icon">{{ event.icon || '📝' }}</text>
              </view>
              <text class="event-title">{{ event.title }}</text>
              <text class="event-description" v-if="event.description">{{ event.description }}</text>
              <view class="event-tags" v-if="event.tags?.length">
                <text class="tag" v-for="tag in event.tags" :key="tag">{{ tag }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view class="empty-state" v-else>
      <text class="empty-icon">📅</text>
      <text class="empty-text">还没有成长记录</text>
      <text class="empty-hint">点击右上角记录第一个成长时刻</text>
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
      const date = new Date(dateStr)
      const month = date.getMonth() + 1
      const day = date.getDate()
      const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
      const weekday = weekdays[date.getDay()]
      return `${month}月${day}日 ${weekday}`
    }

    const goBack = () => uni.navigateBack()

    const addEvent = () => {
      uni.navigateTo({ url: '/pages/growth-portfolio/add-timeline-event' })
    }

    const viewEvent = (event) => {
      uni.showActionSheet({
        itemList: ['编辑', '删除'],
        success: (res) => {
          if (res.tapIndex === 0) {
            uni.navigateTo({ url: `/pages/growth-portfolio/edit-timeline-event?eventId=${event.id}` })
          } else if (res.tapIndex === 1) {
            confirmDelete(event)
          }
        }
      })
    }

    const confirmDelete = (event) => {
      uni.showModal({
        title: '删除记录',
        content: '确定要删除这条成长记录吗？',
        success: (res) => {
          if (res.confirm) {
            store.removeEvent(event.id)
            uni.showToast({ title: '已删除', icon: 'success' })
          }
        }
      })
    }

    return {
      store,
      formatDate,
      goBack,
      addEvent,
      viewEvent
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

.year-section {
  padding: 32rpx;
}

.year-header {
  margin-bottom: 24rpx;
}

.year-text {
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
}

.timeline-list {
  padding-left: 40rpx;
}

.timeline-item {
  display: flex;
  margin-bottom: 24rpx;
}

.timeline-marker {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 20rpx;
}

.marker-dot {
  width: 20rpx;
  height: 20rpx;
  border-radius: 50%;
  background: #667eea;
}

.marker-line {
  flex: 1;
  width: 4rpx;
  background: #ddd;
  margin-top: 8rpx;
}

.timeline-item:last-child .marker-line {
  display: none;
}

.timeline-card {
  flex: 1;
  background: #fff;
  border-radius: 16rpx;
  padding: 20rpx;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.05);
}

.event-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}

.event-date {
  font-size: 24rpx;
  color: #999;
}

.event-icon {
  font-size: 32rpx;
}

.event-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.event-description {
  font-size: 26rpx;
  color: #666;
  display: block;
  margin-bottom: 12rpx;
}

.event-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
}

.tag {
  font-size: 20rpx;
  color: #667eea;
  background: rgba(102, 126, 234, 0.1);
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
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
}
</style>
