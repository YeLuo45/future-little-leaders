<template>
  <view class="critical-thinking-page">
    <!-- 顶部标题 -->
    <view class="header">
      <text class="title">思辨训练</text>
      <text class="subtitle">逻辑推理 · 论证分析 · 决策判断</text>
    </view>

    <!-- 统计卡片 -->
    <view class="stats-section">
      <view class="stat-card">
        <text class="stat-icon">🧩</text>
        <text class="stat-value">{{ statistics.puzzlesCompleted }}/{{ statistics.puzzlesTotal }}</text>
        <text class="stat-label">逻辑谜题</text>
      </view>
      <view class="stat-card">
        <text class="stat-icon">💬</text>
        <text class="stat-value">{{ statistics.debatesCompleted }}/{{ statistics.debatesTotal }}</text>
        <text class="stat-label">辩论练习</text>
      </view>
      <view class="stat-card">
        <text class="stat-icon">🎯</text>
        <text class="stat-value">{{ statistics.decisionsCompleted }}/{{ statistics.decisionsTotal }}</text>
        <text class="stat-label">决策训练</text>
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
      
      <!-- 逻辑谜题 -->
      <view class="module-card" @click="goToModule('logic')">
        <view class="module-icon">🧩</view>
        <view class="module-info">
          <text class="module-name">逻辑谜题</text>
          <text class="module-desc">推理训练 · 难度递进</text>
        </view>
        <view class="module-arrow">›</view>
      </view>

      <!-- 辩论练习 -->
      <view class="module-card" @click="goToModule('debate')">
        <view class="module-icon">💬</view>
        <view class="module-info">
          <text class="module-name">辩论练习</text>
          <text class="module-desc">正反方论证 · 逻辑漏洞识别</text>
        </view>
        <view class="module-arrow">›</view>
      </view>

      <!-- 决策训练 -->
      <view class="module-card" @click="goToModule('decision')">
        <view class="module-icon">🎯</view>
        <view class="module-info">
          <text class="module-name">决策场景</text>
          <text class="module-desc">利弊分析 · 后果推演</text>
        </view>
        <view class="module-arrow">›</view>
      </view>
    </view>

    <!-- 学习提示 -->
    <view class="tips-section">
      <text class="section-title">思辨技巧</text>
      <view class="tip-card">
        <text class="tip-icon">💡</text>
        <view class="tip-content">
          <text class="tip-title">逻辑推理</text>
          <text class="tip-text">遇到问题时，先收集信息，再用排除法或假设法逐步推理</text>
        </view>
      </view>
      <view class="tip-card">
        <text class="tip-icon">🔍</text>
        <view class="tip-content">
          <text class="tip-title">辩论技巧</text>
          <text class="tip-text">论证时要用事实和道理，不要攻击对方个人</text>
        </view>
      </view>
      <view class="tip-card">
        <text class="tip-icon">⚖️</text>
        <view class="tip-content">
          <text class="tip-title">决策方法</text>
          <text class="tip-text">做决定前，列出所有选项，分析每个选项的利弊和后果</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { useCriticalThinkingStore } from '@/stores/criticalThinkingStore.js'

export default {
  data() {
    return {}
  },
  computed: {
    ctStore() {
      return useCriticalThinkingStore()
    },
    statistics() {
      return this.ctStore.statistics
    }
  },
  onLoad() {
    this.ctStore.init()
  },
  methods: {
    goToModule(module) {
      if (module === 'logic') {
        uni.navigateTo({ url: '/pages/critical-thinking/logic-puzzles' })
      } else if (module === 'debate') {
        uni.navigateTo({ url: '/pages/critical-thinking/debate-practice' })
      } else if (module === 'decision') {
        uni.navigateTo({ url: '/pages/critical-thinking/decision-making' })
      }
    }
  }
}
</script>

<style scoped>
.critical-thinking-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
  padding: 20rpx;
}

.header {
  text-align: center;
  padding: 40rpx 0;
}

.title {
  font-size: 48rpx;
  font-weight: bold;
  color: #ffffff;
  display: block;
}

.subtitle {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 10rpx;
}

.stats-section {
  display: flex;
  justify-content: space-around;
  margin: 30rpx 20rpx;
}

.stat-card {
  background: rgba(255, 255, 255, 0.2);
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
  color: #ffffff;
  display: block;
  margin-top: 10rpx;
}

.stat-label {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
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
  color: #ffd700;
  font-weight: bold;
}

.modules-section {
  margin: 30rpx 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #ffffff;
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
  background: rgba(255, 255, 255, 0.15);
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
  color: #ffffff;
  display: block;
}

.tip-text {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
  display: block;
  margin-top: 8rpx;
  line-height: 1.4;
}
</style>
