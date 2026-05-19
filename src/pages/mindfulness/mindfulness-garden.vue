<template>
  <view class="mindfulness-garden-page">
    <!-- 顶部标题 -->
    <view class="header">
      <text class="title">正念花园</text>
      <text class="subtitle">冥想练习 · 呼吸训练 · 正念游戏</text>
    </view>

    <!-- 统计卡片 -->
    <view class="stats-section">
      <view class="stat-card">
        <text class="stat-icon">🧘</text>
        <text class="stat-value">{{ statistics.meditationsCompleted }}/{{ statistics.meditationsTotal }}</text>
        <text class="stat-label">冥想练习</text>
      </view>
      <view class="stat-card">
        <text class="stat-icon">💨</text>
        <text class="stat-value">{{ statistics.breathingCompleted }}/{{ statistics.breathingTotal }}</text>
        <text class="stat-label">呼吸训练</text>
      </view>
      <view class="stat-card">
        <text class="stat-icon">🎮</text>
        <text class="stat-value">{{ statistics.gamesCompleted }}/{{ statistics.gamesTotal }}</text>
        <text class="stat-label">正念游戏</text>
      </view>
    </view>

    <!-- 总积分 -->
    <view class="score-section">
      <view class="score-badge">
        <text class="score-icon">⭐</text>
        <text class="score-text">总积分: {{ statistics.totalScore }}</text>
      </view>
    </view>

    <!-- 训练模块选择 -->
    <view class="modules-section">
      <text class="section-title">训练模块</text>

      <!-- 冥想练习 -->
      <view class="module-card" @click="goToModule('meditation')">
        <view class="module-icon">🧘</view>
        <view class="module-info">
          <text class="module-name">冥想练习</text>
          <text class="module-desc">基础冥想 · 引导式冥想 · 冥想计时</text>
        </view>
        <view class="module-arrow">›</view>
      </view>

      <!-- 呼吸训练 -->
      <view class="module-card" @click="goToModule('breathing')">
        <view class="module-icon">💨</view>
        <view class="module-info">
          <text class="module-name">呼吸训练</text>
          <text class="module-desc">基础呼吸 · 呼吸游戏 · 放松技巧</text>
        </view>
        <view class="module-arrow">›</view>
      </view>

      <!-- 正念游戏 -->
      <view class="module-card" @click="goToModule('games')">
        <view class="module-icon">🎮</view>
        <view class="module-info">
          <text class="module-name">正念游戏</text>
          <text class="module-desc">专注力训练 · 放松挑战 · 觉察练习</text>
        </view>
        <view class="module-arrow">›</view>
      </view>
    </view>

    <!-- 学习提示 -->
    <view class="tips-section">
      <text class="section-title">正念技巧</text>
      <view class="tip-card">
        <text class="tip-icon">💡</text>
        <view class="tip-content">
          <text class="tip-title">专注呼吸</text>
          <text class="tip-text">将注意力集中在呼吸上，感受空气进出身体的感觉</text>
        </view>
      </view>
      <view class="tip-card">
        <text class="tip-icon">🔔</text>
        <view class="tip-content">
          <text class="tip-title">觉察当下</text>
          <text class="tip-text">观察自己的思绪和情绪，像看云一样，不评判，不追逐</text>
        </view>
      </view>
      <view class="tip-card">
        <text class="tip-icon">🌸</text>
        <view class="tip-content">
          <text class="tip-title">温柔回归</text>
          <text class="tip-text">当注意力飘走时，温柔地把注意力带回到呼吸上</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { useMindfulnessStore } from '@/stores/mindfulnessStore.js'

export default {
  data() {
    return {}
  },
  computed: {
    mgStore() {
      return useMindfulnessStore()
    },
    statistics() {
      return this.mgStore.statistics
    }
  },
  onLoad() {
    this.mgStore.init()
  },
  methods: {
    goToModule(module) {
      if (module === 'meditation') {
        uni.navigateTo({ url: '/pages/mindfulness/meditation' })
      } else if (module === 'breathing') {
        uni.navigateTo({ url: '/pages/mindfulness/breathing' })
      } else if (module === 'games') {
        uni.navigateTo({ url: '/pages/mindfulness/mindfulness-games' })
      }
    }
  }
}
</script>

<style scoped>
.mindfulness-garden-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #a8edea 0%, #fed6e3 100%);
  padding: 20rpx;
}

.header {
  text-align: center;
  padding: 40rpx 0;
}

.title {
  font-size: 48rpx;
  font-weight: bold;
  color: #2d5a5a;
  display: block;
}

.subtitle {
  font-size: 28rpx;
  color: rgba(45, 90, 90, 0.8);
  margin-top: 10rpx;
}

.stats-section {
  display: flex;
  justify-content: space-around;
  margin: 30rpx 20rpx;
}

.stat-card {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 20rpx;
  padding: 30rpx;
  text-align: center;
  flex: 1;
  margin: 0 10rpx;
  backdrop-filter: blur(10px);
}

.stat-icon {
  font-size: 48rpx;
  display: block;
}

.stat-value {
  font-size: 32rpx;
  font-weight: bold;
  color: #2d5a5a;
  display: block;
  margin-top: 10rpx;
}

.stat-label {
  font-size: 24rpx;
  color: rgba(45, 90, 90, 0.8);
  display: block;
  margin-top: 5rpx;
}

.score-section {
  text-align: center;
  margin: 20rpx;
}

.score-badge {
  display: inline-flex;
  align-items: center;
  background: rgba(255, 215, 0, 0.3);
  border-radius: 50rpx;
  padding: 15rpx 40rpx;
}

.score-icon {
  font-size: 36rpx;
  margin-right: 10rpx;
}

.score-text {
  font-size: 28rpx;
  color: #b8860b;
  font-weight: bold;
}

.modules-section {
  margin: 30rpx 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #2d5a5a;
  margin-bottom: 20rpx;
  display: block;
}

.module-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.module-icon {
  width: 80rpx;
  height: 80rpx;
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
}

.module-info {
  flex: 1;
  margin-left: 20rpx;
}

.module-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
}

.module-desc {
  font-size: 24rpx;
  color: #666;
  display: block;
  margin-top: 5rpx;
}

.module-arrow {
  font-size: 48rpx;
  color: #999;
}

.tips-section {
  margin: 30rpx 20rpx;
}

.tip-card {
  background: rgba(255, 255, 255, 0.25);
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
  display: flex;
  align-items: flex-start;
  backdrop-filter: blur(10px);
}

.tip-icon {
  font-size: 36rpx;
  margin-right: 16rpx;
}

.tip-content {
  flex: 1;
}

.tip-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #2d5a5a;
  display: block;
}

.tip-text {
  font-size: 24rpx;
  color: rgba(45, 90, 90, 0.8);
  display: block;
  margin-top: 8rpx;
  line-height: 1.4;
}
</style>
