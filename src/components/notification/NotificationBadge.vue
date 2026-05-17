<!-- V7 NotificationBadge — 通知角标组件 -->
<template>
  <view class="notification-badge" v-if="count > 0" :class="{ 'badge-mini': mini }">
    <text class="count">{{ displayCount }}</text>
  </view>
</template>

<script>
import { computed } from 'vue'

export default {
  props: {
    count: {
      type: Number,
      default: 0
    },
    max: {
      type: Number,
      default: 99
    },
    mini: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const displayCount = computed(() => {
      if (props.count > props.max) {
        return props.max + '+'
      }
      return props.count
    })

    return {
      displayCount
    }
  }
}
</script>

<style scoped>
.notification-badge {
  position: absolute;
  top: -8rpx;
  right: -8rpx;
  min-width: 36rpx;
  height: 36rpx;
  background: #F5222D;
  border-radius: 18rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 8rpx;
  z-index: 10;
}

.notification-badge.badge-mini {
  top: -4rpx;
  right: -4rpx;
  min-width: 28rpx;
  height: 28rpx;
  border-radius: 14rpx;
}

.count {
  color: white;
  font-size: 22rpx;
  font-weight: bold;
  line-height: 1;
}

.badge-mini .count {
  font-size: 18rpx;
}
</style>