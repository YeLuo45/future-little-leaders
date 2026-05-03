<template>
  <view class="page-container">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <view class="nav-left" @tap="goBack">
        <text class="back-icon">←</text>
      </view>
      <text class="nav-title">成就</text>
      <view class="nav-right">
        <text class="progress-text">{{ unlockedCount }}/{{ totalCount }}</text>
      </view>
    </view>

    <!-- 成就列表 -->
    <scroll-view scroll-y class="achievement-list">
      <!-- 已解锁 -->
      <view class="achievement-section" v-if="unlockedList.length > 0">
        <text class="section-title">已解锁 ({{ unlockedList.length }})</text>
        <view class="achievement-grid">
          <view 
            v-for="achievement in unlockedList" 
            :key="achievement.id"
            class="achievement-item unlocked"
            @tap="showDetail(achievement)"
          >
            <text class="achievement-icon">{{ achievement.icon }}</text>
            <text class="achievement-name">{{ achievement.name }}</text>
          </view>
        </view>
      </view>

      <!-- 未解锁 -->
      <view class="achievement-section">
        <text class="section-title">未解锁 ({{ lockedList.length }})</text>
        <view class="achievement-grid">
          <view 
            v-for="achievement in lockedList" 
            :key="achievement.id"
            class="achievement-item locked"
            @tap="showDetail(achievement)"
          >
            <text class="achievement-icon">🔒</text>
            <text class="achievement-name">{{ achievement.name }}</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 解锁弹窗 -->
    <uni-popup ref="unlockPopup" type="center" @close="closeUnlock">
      <view class="unlock-modal" v-if="currentAchievement">
        <text class="unlock-icon">{{ currentAchievement.icon }}</text>
        <text class="unlock-title">{{ currentAchievement.isUnlocked ? '成就解锁！' : '成就详情' }}</text>
        <text class="unlock-name">{{ currentAchievement.name }}</text>
        <text class="unlock-desc">{{ currentAchievement.description }}</text>
        <text class="unlock-points" v-if="currentAchievement.isUnlocked">+{{ currentAchievement.points }} 积分</text>
        <text class="unlock-points locked-points" v-else>尚未解锁</text>
        <button class="unlock-btn" @tap="closeUnlock">确定</button>
      </view>
    </uni-popup>
  </view>
</template>

<script>
import { useAchievementStore } from '@/stores/achievementStore'

export default {
  data() {
    return {
      currentAchievement: null
    }
  },
  computed: {
    achievementStore() {
      return useAchievementStore()
    },
    unlockedCount() {
      return this.achievementStore.unlockedCount
    },
    totalCount() {
      return this.achievementStore.totalCount
    },
    unlockedList() {
      return this.achievementStore.unlockedList
    },
    lockedList() {
      return this.achievementStore.lockedList
    }
  },
  onLoad() {
    this.achievementStore.init()
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    showDetail(achievement) {
      const isUnlocked = this.achievementStore.isUnlocked(achievement.id)
      this.currentAchievement = {
        ...achievement,
        isUnlocked: isUnlocked,
        points: isUnlocked ? achievement.points : 0
      }
      this.$refs.unlockPopup.open()
    },
    closeUnlock() {
      this.$refs.unlockPopup.close()
    }
  }
}
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 44px;
  padding: 0 16px;
  background-color: #ffffff;
  border-bottom: 1px solid #e5e5e5;
}

.nav-left {
  width: 60px;
}

.back-icon {
  font-size: 20px;
  color: #333;
}

.nav-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.nav-right {
  width: 60px;
  text-align: right;
}

.progress-text {
  font-size: 14px;
  color: #8477fa;
  font-weight: 500;
}

.achievement-list {
  height: calc(100vh - 44px);
  padding: 16px;
}

.achievement-section {
  margin-bottom: 24px;
}

.section-title {
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

.achievement-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.achievement-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100px;
  padding: 16px 8px;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.achievement-item.unlocked {
  background-color: #ffffff;
}

.achievement-item.locked {
  background-color: #f0f0f0;
  opacity: 0.7;
}

.achievement-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.achievement-name {
  font-size: 12px;
  color: #333;
  text-align: center;
  word-break: break-all;
}

.unlock-modal {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 280px;
  padding: 32px 24px;
  background-color: #ffffff;
  border-radius: 16px;
}

.unlock-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.unlock-title {
  font-size: 20px;
  font-weight: 600;
  color: #8477fa;
  margin-bottom: 12px;
}

.unlock-name {
  font-size: 18px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
}

.unlock-desc {
  font-size: 14px;
  color: #666;
  text-align: center;
  margin-bottom: 16px;
}

.unlock-points {
  font-size: 16px;
  font-weight: 600;
  color: #ff9500;
  margin-bottom: 24px;
}

.unlock-points.locked-points {
  color: #999;
}

.unlock-btn {
  width: 100%;
  height: 44px;
  line-height: 44px;
  background-color: #8477fa;
  color: #ffffff;
  font-size: 16px;
  border-radius: 22px;
  border: none;
}
</style>
