<!-- V21 Class Feed — 班级动态页面 -->
<template>
  <view class="page-container">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <view class="nav-left" @tap="goBack">
        <text class="icon">←</text>
      </view>
      <text class="nav-title">班级动态</text>
      <view class="nav-right" @tap="goToChat">
        <text class="chat-icon">💬</text>
        <view class="chat-badge" v-if="unreadChatCount > 0">
          <text class="badge-text">{{ unreadChatCount > 99 ? '99+' : unreadChatCount }}</text>
        </view>
      </view>
    </view>

    <!-- 班级选择器 -->
    <view class="class-selector">
      <scroll-view scroll-x class="class-tabs">
        <view 
          v-for="cls in classes" 
          :key="cls.id"
          class="class-tab"
          :class="{ active: currentClassId === cls.id }"
          @tap="selectClass(cls.id)"
        >
          <text class="class-name">{{ cls.name }}</text>
          <text class="teacher-name">{{ cls.teacherName }}</text>
        </view>
      </scroll-view>
    </view>

    <!-- 筛选栏 -->
    <view class="filter-bar">
      <view 
        v-for="filter in filters" 
        :key="filter.key"
        class="filter-item"
        :class="{ active: currentFilter === filter.key }"
        @tap="currentFilter = filter.key"
      >
        <text class="filter-text">{{ filter.label }}</text>
      </view>
    </view>

    <!-- 动态列表 -->
    <scroll-view scroll-y class="feed-list" @scrolltolower="loadMore">
      <view class="feed-wrapper" v-if="filteredFeeds.length > 0">
        <FeedCard
          v-for="feed in filteredFeeds"
          :key="feed.id"
          :feed="feed"
          :babyId="currentBabyId"
          @tap="onFeedTap"
          @mark-read="onMarkRead"
        />
      </view>
      
      <!-- 空状态 -->
      <view class="empty-state" v-else>
        <text class="empty-icon">📭</text>
        <text class="empty-text">暂无{{ currentFilter === 'all' ? '动态' : currentFilterLabel }}</text>
      </view>

      <!-- 加载更多 -->
      <view class="load-more" v-if="filteredFeeds.length > 0">
        <text class="loading-text">上滑加载更多</text>
      </view>
    </scroll-view>

    <!-- 底部 Tab -->
    <view class="bottom-tab">
      <view class="tab-item active">
        <text class="tab-icon">📰</text>
        <text class="tab-text">动态</text>
      </view>
      <view class="tab-item" @tap="goToChat">
        <text class="tab-icon">💬</text>
        <text class="tab-text">聊天</text>
        <view class="tab-badge" v-if="unreadChatCount > 0">
          <text>{{ unreadChatCount }}</text>
        </view>
      </view>
      <view class="tab-item" @tap="goToReminderConfig">
        <text class="tab-icon">⚙️</text>
        <text class="tab-text">提醒</text>
      </view>
    </view>
  </view>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useCollaborationStore } from '@/stores/collaborationStore'
import FeedCard from '@/components/collaboration/FeedCard.vue'

export default {
  components: { FeedCard },
  setup() {
    const store = useCollaborationStore()

    const currentFilter = ref('all')
    const filters = [
      { key: 'all', label: '全部' },
      { key: 'homework', label: '作业' },
      { key: 'notice', label: '通知' },
      { key: 'praise', label: '表扬' },
      { key: 'activity', label: '活动' }
    ]

    const currentFilterLabel = computed(() => {
      const f = filters.find(f => f.key === currentFilter.value)
      return f?.label || ''
    })

    const classes = computed(() => store.classes)
    const currentClassId = computed(() => store.currentClassId)
    const filteredFeeds = computed(() => {
      const feeds = store.currentClassFeeds
      if (currentFilter.value === 'all') return feeds
      return feeds.filter(f => f.type === currentFilter.value)
    })
    const currentBabyId = computed(() => store.currentBabyId)
    const unreadChatCount = computed(() => store.unreadChatCount)

    onMounted(() => {
      store.init()
      // 默认选中第一个班级
      if (classes.value.length > 0 && !currentClassId.value) {
        store.selectClass(classes.value[0].id)
      }
    })

    const selectClass = (classId) => {
      store.selectClass(classId)
    }

    const onFeedTap = (feed) => {
      // 标记已读
      store.markFeedRead(feed.id)
      // 显示详情
      uni.showModal({
        title: feed.title,
        content: feed.content,
        showCancel: false
      })
    }

    const onMarkRead = (feedId) => {
      store.markFeedRead(feedId)
      uni.showToast({ title: '已标记已读', icon: 'success' })
    }

    const loadMore = () => {
      // Mock: 加载更多
      uni.showToast({ title: '暂无更多', icon: 'none' })
    }

    const goBack = () => {
      uni.navigateBack()
    }

    const goToChat = () => {
      uni.navigateTo({ url: '/pages/collaboration/chat' })
    }

    const goToReminderConfig = () => {
      uni.navigateTo({ url: '/pages/collaboration/chat?tab=reminder' })
    }

    return {
      filters,
      currentFilter,
      currentFilterLabel,
      classes,
      currentClassId,
      filteredFeeds,
      currentBabyId,
      unreadChatCount,
      selectClass,
      onFeedTap,
      onMarkRead,
      loadMore,
      goBack,
      goToChat,
      goToReminderConfig
    }
  }
}
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background: #F0FDF4;
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 32rpx;
  background: #FFFFFF;
  border-bottom: 1rpx solid #F0F0F0;
}

.nav-left, .nav-right {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #333;
}

.icon {
  font-size: 40rpx;
  color: #333;
}

.chat-icon {
  font-size: 40rpx;
}

.chat-badge {
  position: absolute;
  top: 8rpx;
  right: 8rpx;
  background: #F5222D;
  border-radius: 12rpx;
  min-width: 32rpx;
  height: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 8rpx;
}

.badge-text {
  font-size: 20rpx;
  color: #FFFFFF;
}

.class-selector {
  background: #FFFFFF;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #F0F0F0;
}

.class-tabs {
  white-space: nowrap;
  padding: 0 16rpx;
}

.class-tab {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  padding: 16rpx 32rpx;
  margin: 0 8rpx;
  border-radius: 12rpx;
  background: #F5F5F5;
  transition: all 150ms;
}

.class-tab.active {
  background: #059669;
}

.class-name {
  font-size: 28rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 4rpx;
}

.class-tab.active .class-name {
  color: #FFFFFF;
}

.teacher-name {
  font-size: 22rpx;
  color: #999;
}

.class-tab.active .teacher-name {
  color: rgba(255, 255, 255, 0.8);
}

.filter-bar {
  display: flex;
  gap: 16rpx;
  padding: 16rpx 24rpx;
  background: #FFFFFF;
  border-bottom: 1rpx solid #F0F0F0;
}

.filter-item {
  padding: 10rpx 24rpx;
  border-radius: 20rpx;
  background: #F5F5F5;
  transition: all 150ms;
}

.filter-item.active {
  background: #059669;
}

.filter-text {
  font-size: 24rpx;
  color: #666;
}

.filter-item.active .filter-text {
  color: #FFFFFF;
}

.feed-list {
  height: calc(100vh - 400rpx);
  padding: 24rpx;
}

.feed-wrapper {
  animation: fadeIn 200ms ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 24rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}

.load-more {
  text-align: center;
  padding: 24rpx;
}

.loading-text {
  font-size: 24rpx;
  color: #999;
}

.bottom-tab {
  display: flex;
  justify-content: space-around;
  padding: 16rpx 0;
  background: #FFFFFF;
  border-top: 1rpx solid #F0F0F0;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8rpx 40rpx;
  position: relative;
}

.tab-item.active .tab-icon,
.tab-item.active .tab-text {
  color: #059669;
}

.tab-icon {
  font-size: 40rpx;
  margin-bottom: 4rpx;
}

.tab-text {
  font-size: 22rpx;
  color: #999;
}

.tab-badge {
  position: absolute;
  top: -4rpx;
  right: 24rpx;
  background: #F5222D;
  border-radius: 12rpx;
  min-width: 28rpx;
  height: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 6rpx;
}

.tab-badge text {
  font-size: 18rpx;
  color: #FFFFFF;
}
</style>
