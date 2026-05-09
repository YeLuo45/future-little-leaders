<!-- 通知中心 -->
<template>
  <view class="page-container">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <view class="nav-left" @tap="goBack">
        <text class="icon">←</text>
      </view>
      <text class="nav-title">通知中心</text>
      <view class="nav-right" @tap="markAllRead" v-if="notifications.length > 0">
        <text class="mark-all">全部已读</text>
      </view>
    </view>

    <!-- 通知列表 -->
    <scroll-view scroll-y class="notif-list" @scrolltolower="loadMore">
      <view v-if="notifications.length > 0">
        <view
          v-for="notif in notifications"
          :key="notif.id"
          class="notif-card"
          :class="{ unread: !notif.read }"
          @tap="onNotifTap(notif)"
        >
          <!-- 类型图标 -->
          <view class="notif-icon-wrap">
            <text class="notif-icon">{{ getNotifIcon(notif.type) }}</text>
          </view>

          <!-- 内容 -->
          <view class="notif-body">
            <view class="notif-header">
              <text class="notif-title">{{ notif.title }}</text>
              <text class="notif-time">{{ formatTime(notif.createdAt) }}</text>
            </view>
            <text class="notif-content">{{ notif.content }}</text>
          </view>

          <!-- 删除按钮 -->
          <view class="notif-delete" @tap.stop="deleteNotif(notif.id)">
            <text>✕</text>
          </view>

          <!-- 未读指示 -->
          <view class="unread-dot" v-if="!notif.read"></view>
        </view>

        <!-- 加载更多 -->
        <view v-if="hasMore" class="load-more" @tap="loadMore">
          <text>加载更多</text>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-else class="empty-state">
        <text class="empty-icon">🔔</text>
        <text class="empty-text">暂无通知</text>
        <text class="empty-hint">完成家庭任务后，你会收到通知</text>
      </view>
    </scroll-view>

    <!-- 通知详情弹窗 -->
    <view v-if="selectedNotif" class="notif-detail-overlay" @tap="closeDetail">
      <view class="notif-detail-card" @tap.stop>
        <text class="detail-icon">{{ getNotifIcon(selectedNotif.type) }}</text>
        <text class="detail-title">{{ selectedNotif.title }}</text>
        <text class="detail-content">{{ selectedNotif.content }}</text>
        <text class="detail-time">{{ formatDetailTime(selectedNotif.createdAt) }}</text>
        <button class="detail-btn" @tap="closeDetail">关闭</button>
      </view>
    </view>

    <!-- 返回 -->
    <view class="float-back" @tap="goBack">←</view>
  </view>
</template>

<script>
import { ref, computed, onMounted } from 'vue';

export default {
  setup() {
    const notifications = ref([]);
    const selectedNotif = ref(null);
    const page = ref(0);
    const pageSize = 20;
    const hasMore = ref(false);

    const loadNotifications = () => {
      try {
        const { getAllNotifications, markAllRead: markAll } = require('../../services/notificationService');
        const currentBabyId = uni.getStorageSync('currentBabyId') || '';
        notifications.value = getAllNotifications(currentBabyId, pageSize);
        hasMore.value = notifications.value.length >= pageSize;
      } catch (e) {
        console.error('加载通知失败:', e);
      }
    };

    const loadMore = () => {
      page.value++;
      try {
        const { getAllNotifications } = require('../../services/notificationService');
        const currentBabyId = uni.getStorageSync('currentBabyId') || '';
        const more = getAllNotifications(currentBabyId, (page.value + 1) * pageSize);
        notifications.value = more;
        hasMore.value = more.length >= (page.value + 1) * pageSize;
      } catch (e) {
        console.error('加载更多失败:', e);
      }
    };

    onMounted(() => {
      loadNotifications();

      // 监听通知更新
      uni.$on('notification:updated', () => {
        loadNotifications();
      });
    });

    const getNotifIcon = (type) => {
      const icons = {
        task_assigned: '📋',
        task_approved: '✅',
        task_rejected: '❌',
        task_resubmitted: '🔄',
        achievement_unlocked: '🎉',
        points_earned: '🔥',
      };
      return icons[type] || '📌';
    };

    const formatTime = (createdAt) => {
      if (!createdAt) return '';
      const now = Date.now();
      const diff = now - createdAt;
      if (diff < 60000) return '刚刚';
      if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前';
      if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前';
      const d = new Date(createdAt);
      return `${d.getMonth() + 1}月${d.getDate()}日 ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
    };

    const formatDetailTime = (createdAt) => {
      if (!createdAt) return '';
      const d = new Date(createdAt);
      return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
    };

    const onNotifTap = (notif) => {
      selectedNotif.value = notif;
      // 自动标记已读
      try {
        const { markRead } = require('../../services/notificationService');
        markRead(notif.id);
        notif.read = true;
      } catch (e) {
        console.error('标记已读失败:', e);
      }
    };

    const markAllRead = () => {
      try {
        const { markAllRead: markAll } = require('../../services/notificationService');
        const currentBabyId = uni.getStorageSync('currentBabyId') || '';
        markAll(currentBabyId);
        notifications.value.forEach(n => n.read = true);
        uni.showToast({ title: '已全部已读', icon: 'success' });
      } catch (e) {
        console.error('全部已读失败:', e);
      }
    };

    const deleteNotif = (id) => {
      try {
        const { deleteNotification } = require('../../services/notificationService');
        deleteNotification(id);
        notifications.value = notifications.value.filter(n => n.id !== id);
        uni.showToast({ title: '已删除', icon: 'none' });
      } catch (e) {
        console.error('删除失败:', e);
      }
    };

    const closeDetail = () => {
      selectedNotif.value = null;
    };

    const goBack = () => {
      uni.navigateBack();
    };

    return {
      notifications,
      selectedNotif,
      hasMore,
      getNotifIcon,
      formatTime,
      formatDetailTime,
      onNotifTap,
      markAllRead,
      deleteNotif,
      closeDetail,
      loadMore,
      goBack,
    };
  }
};
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}
.nav-bar {
  display: flex;
  align-items: center;
  height: 88rpx;
  background: linear-gradient(135deg, #8B5CF6, #7C3AED);
  padding: 90rpx 40rpx 60rpx;
  position: relative;
}
.nav-left { position: absolute; left: 30rpx; }
.icon { color: white; font-size: 48rpx; font-weight: bold; }
.nav-title { flex: 1; text-align: center; color: white; font-size: 36rpx; font-weight: bold; }
.nav-right { position: absolute; right: 30rpx; }
.mark-all { color: rgba(255,255,255,0.8); font-size: 26rpx; }

.notif-list {
  height: calc(100vh - 240rpx);
  padding: 20rpx;
}
.notif-card {
  background: white;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
  display: flex;
  align-items: flex-start;
  gap: 20rpx;
  position: relative;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.04);
}
.notif-card.unread {
  border-left: 6rpx solid #8B5CF6;
}
.unread-dot {
  position: absolute;
  top: 24rpx;
  right: 24rpx;
  width: 16rpx;
  height: 16rpx;
  background: #8B5CF6;
  border-radius: 50%;
}
.notif-icon-wrap {
  width: 80rpx;
  height: 80rpx;
  background: #F5F3FF;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.notif-icon { font-size: 40rpx; }
.notif-body { flex: 1; }
.notif-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8rpx;
}
.notif-title { font-size: 28rpx; font-weight: bold; color: #333; }
.notif-time { font-size: 22rpx; color: #999; }
.notif-content { font-size: 26rpx; color: #666; line-height: 1.5; }
.notif-delete {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ccc;
  font-size: 28rpx;
  flex-shrink: 0;
}
.load-more {
  text-align: center;
  padding: 30rpx;
  color: #8B5CF6;
  font-size: 26rpx;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 120rpx;
}
.empty-icon { font-size: 100rpx; margin-bottom: 30rpx; }
.empty-text { font-size: 32rpx; color: #333; font-weight: bold; margin-bottom: 16rpx; }
.empty-hint { font-size: 26rpx; color: #999; }

.notif-detail-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}
.notif-detail-card {
  background: white;
  border-radius: 24rpx;
  padding: 48rpx;
  margin: 40rpx;
  max-width: 600rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.detail-icon { font-size: 80rpx; margin-bottom: 24rpx; }
.detail-title { font-size: 36rpx; font-weight: bold; color: #333; margin-bottom: 16rpx; }
.detail-content { font-size: 28rpx; color: #666; text-align: center; line-height: 1.6; margin-bottom: 24rpx; }
.detail-time { font-size: 24rpx; color: #999; margin-bottom: 32rpx; }
.detail-btn {
  background: #8B5CF6;
  color: white;
  border: none;
  border-radius: 40rpx;
  padding: 20rpx 60rpx;
  font-size: 28rpx;
}

.float-back {
  position: fixed;
  bottom: 40rpx;
  right: 40rpx;
  width: 80rpx;
  height: 80rpx;
  background: linear-gradient(135deg, #8B5CF6, #7C3AED);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 36rpx;
  box-shadow: 0 4rpx 16rpx rgba(139, 92, 246, 0.4);
}
</style>
