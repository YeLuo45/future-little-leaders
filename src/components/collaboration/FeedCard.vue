<!-- V21 FeedCard — 班级动态卡片组件 -->
<template>
  <view class="feed-card" :class="{ unread: !isRead }" @tap="onTap">
    <!-- 卡片头部 -->
    <view class="card-header">
      <view class="type-badge" :style="{ background: typeInfo.color + '20', color: typeInfo.color }">
        <text class="type-icon">{{ typeInfo.icon }}</text>
        <text class="type-label">{{ typeInfo.label }}</text>
      </view>
      <text class="time">{{ formattedTime }}</text>
    </view>

    <!-- 卡片内容 -->
    <view class="card-content">
      <text class="title">{{ feed.title }}</text>
      <text class="desc" v-if="feed.content">{{ feed.content }}</text>
    </view>

    <!-- 图片展示 -->
    <view class="images" v-if="feed.images && feed.images.length > 0">
      <image 
        v-for="(img, idx) in feed.images" 
        :key="idx" 
        :src="img" 
        class="feed-image"
        mode="aspectFill"
        @tap="previewImage(idx)"
      />
    </view>

    <!-- 卡片底部 -->
    <view class="card-footer">
      <text class="teacher">{{ feed.teacherName }}</text>
      <view class="actions">
        <text class="action-item" @tap.stop="onMarkRead">
          {{ isRead ? '已读' : '标记已读' }}
        </text>
      </view>
    </view>

    <!-- 未读指示器 -->
    <view class="unread-dot" v-if="!isRead"></view>
  </view>
</template>

<script>
import { computed } from 'vue'

export default {
  props: {
    feed: {
      type: Object,
      required: true
    },
    babyId: {
      type: String,
      default: null
    }
  },
  emits: ['tap', 'mark-read'],
  setup(props, { emit }) {
    const typeInfo = computed(() => {
      const info = {
        homework: { label: '作业', icon: '📝', color: '#4A90D9' },
        notice: { label: '通知', icon: '📢', color: '#FA8C16' },
        praise: { label: '表扬', icon: '🌟', color: '#52C41A' },
        activity: { label: '活动', icon: '🎉', color: '#722ED1' }
      }
      return info[props.feed.type] || { label: '动态', icon: '📌', color: '#999999' }
    })

    const isRead = computed(() => {
      if (!props.babyId) return false
      return props.feed.readBy?.includes(props.babyId) ?? false
    })

    const formattedTime = computed(() => {
      const date = new Date(props.feed.createdAt)
      const now = new Date()
      const diff = now - date

      if (diff < 60000) return '刚刚'
      if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前'
      if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前'
      if (diff < 604800000) return Math.floor(diff / 86400000) + '天前'

      return `${date.getMonth() + 1}/${date.getDate()}`
    })

    const onTap = () => {
      emit('tap', props.feed)
    }

    const onMarkRead = () => {
      emit('mark-read', props.feed.id)
    }

    const previewImage = (index) => {
      if (props.feed.images) {
        uni.previewImage({
          urls: props.feed.images,
          current: index
        })
      }
    }

    return {
      typeInfo,
      isRead,
      formattedTime,
      onTap,
      onMarkRead,
      previewImage
    }
  }
}
</script>

<style scoped>
.feed-card {
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  position: relative;
  animation: fadeIn 200ms ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.feed-card.unread {
  border-left: 4rpx solid #059669;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.type-badge {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
}

.type-icon {
  font-size: 24rpx;
}

.type-label {
  font-weight: 500;
}

.time {
  font-size: 22rpx;
  color: #999;
}

.card-content {
  margin-bottom: 16rpx;
}

.title {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 8rpx;
  display: block;
}

.desc {
  font-size: 26rpx;
  color: #666;
  line-height: 1.5;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.images {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-bottom: 16rpx;
}

.feed-image {
  width: 160rpx;
  height: 160rpx;
  border-radius: 8rpx;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.teacher {
  font-size: 24rpx;
  color: #999;
}

.actions {
  display: flex;
  gap: 24rpx;
}

.action-item {
  font-size: 24rpx;
  color: #059669;
}

.unread-dot {
  position: absolute;
  top: 24rpx;
  right: 24rpx;
  width: 12rpx;
  height: 12rpx;
  background: #059669;
  border-radius: 50%;
}
</style>
