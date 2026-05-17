<!-- AchievementRing.vue - 成就进度环组件 -->
<template>
  <view class="achievement-ring">
    <view class="section-header">
      <text class="section-title">成就总览</text>
    </view>
    
    <view class="ring-container">
      <!-- SVG进度环 -->
      <svg viewBox="0 0 120 120" class="ring-svg">
        <!-- 背景环 -->
        <circle
          cx="60"
          cy="60"
          r="50"
          fill="none"
          stroke="#E5E7EB"
          stroke-width="12"
        />
        <!-- 进度环 -->
        <circle
          cx="60"
          cy="60"
          r="50"
          fill="none"
          :stroke="ringColor"
          stroke-width="12"
          stroke-linecap="round"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="progressOffset"
          transform="rotate(-90 60 60)"
          class="progress-ring"
        />
        <!-- 中心文字 -->
        <text x="60" y="55" text-anchor="middle" class="ring-value">{{ unlocked }}</text>
        <text x="60" y="72" text-anchor="middle" class="ring-label">已解锁</text>
      </svg>
      
      <!-- 成就徽章列表 -->
      <view class="badges-section">
        <view class="badges-row">
          <view
            v-for="(badge, index) in displayBadges"
            :key="index"
            class="badge-item"
            :class="{ locked: !badge.unlocked }"
          >
            <text class="badge-icon">{{ badge.icon || '🏆' }}</text>
          </view>
        </view>
        <text class="badges-hint">{{ unlocked }}/{{ total }} 已解锁</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'AchievementRing',
  props: {
    unlocked: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      default: 5
    },
    badges: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      ringColor: '#8B5CF6',
      radius: 50,
      circumference: 2 * Math.PI * 50 // 2πr
    }
  },
  computed: {
    progressOffset() {
      if (!this.total || this.total === 0) return this.circumference
      const progress = this.unlocked / this.total
      return this.circumference * (1 - progress)
    },
    displayBadges() {
      // 始终显示固定数量的徽章位
      const fixedCount = 8
      if (this.badges && this.badges.length > 0) {
        return this.badges.slice(0, fixedCount)
      }
      // 生成空徽章
      const badges = []
      for (let i = 0; i < fixedCount; i++) {
        badges.push({ icon: '🔒', unlocked: false })
      }
      return badges
    }
  }
}
</script>

<style scoped>
.achievement-ring {
  background: white;
  border-radius: 16rpx;
  padding: 24rpx;
  margin: 20rpx;
}
.section-header {
  margin-bottom: 20rpx;
}
.section-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}
.ring-container {
  display: flex;
  align-items: center;
  gap: 40rpx;
}
.ring-svg {
  width: 160rpx;
  height: 160rpx;
  flex-shrink: 0;
}
.progress-ring {
  transition: stroke-dashoffset 0.8s ease;
}
.ring-value {
  font-size: 28rpx;
  font-weight: bold;
  fill: #333;
}
.ring-label {
  font-size: 18rpx;
  fill: #9CA3AF;
}
.badges-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}
.badges-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}
.badge-item {
  width: 64rpx;
  height: 64rpx;
  background: #F3E8FF;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.badge-item.locked {
  background: #F3F4F6;
}
.badge-icon {
  font-size: 32rpx;
}
.badges-hint {
  font-size: 22rpx;
  color: #666;
}
</style>