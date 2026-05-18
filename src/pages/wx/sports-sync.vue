<template>
  <view class="sports-sync-page">
    <!-- 导航栏 -->
    <view class="nav-bar">
      <view class="back-btn" @click="goBack">
        <text class="icon">←</text>
      </view>
      <text class="nav-title">微信运动</text>
      <view class="history-btn" @click="showHistory">
        <text class="icon">📋</text>
      </view>
    </view>

    <!-- 步数展示卡片 -->
    <view class="steps-card">
      <view class="steps-circle-wrapper">
        <view class="steps-circle" :style="{ '--progress': progressPercent + '%' }">
          <view class="inner-circle">
            <text class="steps-value">{{ todaySteps }}</text>
            <text class="steps-unit">步</text>
          </view>
        </view>
        <view class="circle-decoration">
          <text class="deco-icon">🏃</text>
        </view>
      </view>
      <view class="steps-info">
        <text class="date-text">{{ todayDate }}</text>
        <text class="goal-text">目标: {{ dailyGoal }}步</text>
      </view>
    </view>

    <!-- 步数兑换 -->
    <view class="exchange-section">
      <view class="section-header">
        <text class="section-title">今日兑换</text>
        <view class="exchange-status" :class="{ exchanged: hasExchanged }">
          <text v-if="hasExchanged">✓ 已兑换</text>
          <text v-else>待领取</text>
        </view>
      </view>

      <view class="exchange-info">
        <view class="exchange-detail">
          <text class="detail-label">可兑换积分</text>
          <text class="detail-value">{{ exchangeablePoints }} 分</text>
        </view>
        <view class="exchange-detail">
          <text class="detail-label">兑换比例</text>
          <text class="detail-value">1000步 = 1积分</text>
        </view>
        <view class="exchange-detail">
          <text class="detail-label">今日上限</text>
          <text class="detail-value">{{ dailyLimit }} 积分</text>
        </view>
      </view>

      <button
        v-if="!hasExchanged"
        class="exchange-btn"
        :disabled="isExchanging || todaySteps < 1000"
        @click="handleExchange"
      >
        <view v-if="isExchanging" class="btn-loading"></view>
        <text v-else>{{ todaySteps >= 1000 ? '立即兑换' : '步数不足' }}</text>
      </button>

      <view v-else class="exchanged-tip">
        <text>已兑换 {{ exchangedPoints }} 积分</text>
      </view>
    </view>

    <!-- 历史记录 -->
    <view class="history-section">
      <view class="section-header">
        <text class="section-title">近7日步数</text>
      </view>

      <view class="steps-chart">
        <view
          v-for="(item, index) in weekSteps"
          :key="index"
          class="chart-bar-wrapper"
        >
          <view class="bar-container">
            <view
              class="chart-bar"
              :style="{ height: getBarHeight(item.step) + 'rpx' }"
              :class="{ today: index === weekSteps.length - 1 }"
            ></view>
          </view>
          <text class="bar-label">{{ item.day }}</text>
          <text class="bar-value">{{ item.step }}</text>
        </view>
      </view>
    </view>

    <!-- 微信运动入口 -->
    <view class="wx-sports-entry">
      <view class="entry-info">
        <text class="entry-title">微信运动</text>
        <text class="entry-desc">同步微信运动数据，步数自动兑换积分</text>
      </view>
      <view class="entry-action">
        <button v-if="!isAuth" class="auth-btn" @click="handleAuth">
          授权同步
        </button>
        <view v-else class="auth-status">
          <text class="status-icon">✓</text>
          <text class="status-text">已授权</text>
        </view>
      </view>
    </view>

    <!-- Toast -->
    <view v-if="toast.show" class="toast" :class="toast.type">
      <text>{{ toast.message }}</text>
    </view>
  </view>
</template>

<script>
import wxMiniService from '@/services/wxMiniService.js'

export default {
  data() {
    return {
      todaySteps: 0,
      todayDate: '',
      dailyGoal: 10000,
      dailyLimit: 10,
      exchangeRate: 1000,
      weekSteps: [],
      hasExchanged: false,
      exchangedPoints: 0,
      isExchanging: false,
      isAuth: false,
      toast: {
        show: false,
        message: '',
        type: 'info'
      }
    }
  },

  computed: {
    exchangeablePoints() {
      const points = Math.floor(this.todaySteps / this.exchangeRate)
      return Math.min(points, this.dailyLimit)
    },

    progressPercent() {
      const percent = (this.todaySteps / this.dailyGoal) * 100
      return Math.min(percent, 100)
    },

    maxSteps() {
      return Math.max(...this.weekSteps.map(item => item.step), 1)
    }
  },

  onLoad() {
    this.initData()
  },

  onShow() {
    this.checkExchangeStatus()
    this.checkAuthStatus()
  },

  methods: {
    /**
     * 初始化数据
     */
    async initData() {
      this.todayDate = this.formatDate(new Date())
      await this.loadWeRunData()
    },

    /**
     * 加载微信运动数据
     */
    async loadWeRunData() {
      try {
        const result = await wxMiniService.getWeRunData()
        if (result.success) {
          this.todaySteps = result.todaySteps || 0
          this.weekSteps = this.processWeekData(result.stepInfoList || [])
        }
      } catch (err) {
        console.error('[sports-sync] loadWeRunData failed:', err)
        // 使用 mock 数据
        this.todaySteps = 12500
        this.weekSteps = this.generateMockWeekData()
      }
    },

    /**
     * 处理周数据
     */
    processWeekData(stepInfoList) {
      const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
      return stepInfoList.slice(-7).map(item => {
        const date = new Date(item.timestamp)
        return {
          step: item.step,
          day: days[date.getDay()],
          date: this.formatDate(date)
        }
      })
    },

    /**
     * 生成 Mock 周数据
     */
    generateMockWeekData() {
      const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
      const mockSteps = [8500, 10200, 7300, 9600, 11000, 8800, 12500]
      const today = new Date()
      
      return mockSteps.map((step, index) => {
        const date = new Date(today)
        date.setDate(date.getDate() - (mockSteps.length - 1 - index))
        return {
          step,
          day: days[date.getDay()],
          date: this.formatDate(date)
        }
      })
    },

    /**
     * 获取柱状图高度
     */
    getBarHeight(steps) {
      const minHeight = 40
      const maxHeight = 200
      const ratio = steps / this.maxSteps
      return minHeight + ratio * (maxHeight - minHeight)
    },

    /**
     * 检查兑换状态
     */
    async checkExchangeStatus() {
      try {
        const record = await wxMiniService.getTodayExchangeRecord('current_user')
        if (record) {
          this.hasExchanged = true
          this.exchangedPoints = record.points
        }
      } catch (err) {
        console.warn('[sports-sync] checkExchangeStatus failed:', err)
      }
    },

    /**
     * 检查授权状态
     */
    async checkAuthStatus() {
      try {
        this.isAuth = await wxMiniService.checkWeRunAuth()
      } catch (err) {
        this.isAuth = true // Mock 环境下默认已授权
      }
    },

    /**
     * 处理兑换
     */
    async handleExchange() {
      if (this.isExchanging || this.hasExchanged) return

      if (this.todaySteps < this.exchangeRate) {
        this.showToast('步数不足1000，无法兑换', 'warning')
        return
      }

      this.isExchanging = true

      try {
        const result = await wxMiniService.exchangeStepsToPoints(this.todaySteps)
        if (result.success) {
          // 保存兑换记录
          await wxMiniService.saveExchangeRecord(
            'current_user',
            this.todaySteps,
            result.points
          )
          this.hasExchanged = true
          this.exchangedPoints = result.points
          this.showToast(`成功兑换 ${result.points} 积分`, 'success')
        }
      } catch (err) {
        console.error('[sports-sync] exchange failed:', err)
        this.showToast('兑换失败，请重试', 'error')
      } finally {
        this.isExchanging = false
      }
    },

    /**
     * 处理授权
     */
    async handleAuth() {
      try {
        const success = await wxMiniService.authorizeWeRun()
        if (success) {
          this.isAuth = true
          await this.loadWeRunData()
          this.showToast('授权成功', 'success')
        } else {
          this.showToast('授权失败，请重试', 'error')
        }
      } catch (err) {
        console.error('[sports-sync] authorize failed:', err)
        this.showToast('授权失败', 'error')
      }
    },

    /**
     * 查看历史
     */
    showHistory() {
      uni.navigateTo({
        url: '/pages/profile/points-records'
      })
    },

    /**
     * 返回
     */
    goBack() {
      uni.navigateBack()
    },

    /**
     * 格式化日期
     */
    formatDate(date) {
      const d = new Date(date)
      const month = d.getMonth() + 1
      const day = d.getDate()
      return `${month}月${day}日`
    },

    /**
     * 显示 Toast
     */
    showToast(message, type = 'info') {
      this.toast = { show: true, message, type }
      setTimeout(() => {
        this.toast.show = false
      }, 2000)
    }
  }
}
</script>

<style scoped>
.sports-sync-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 40rpx;
}

/* 导航栏 */
.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  padding: 0 30rpx;
  padding-top: calc(var(--status-bar-height) + 20rpx);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.back-btn,
.history-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-btn .icon,
.history-btn .icon {
  font-size: 36rpx;
  color: #fff;
}

.nav-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #fff;
}

/* 步数卡片 */
.steps-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40rpx 30rpx 60rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.steps-circle-wrapper {
  position: relative;
  margin-bottom: 30rpx;
}

.steps-circle {
  width: 360rpx;
  height: 360rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.steps-circle::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: conic-gradient(
    #07c160 var(--progress),
    rgba(255, 255, 255, 0.1) var(--progress)
  );
  border-radius: 50%;
}

.inner-circle {
  width: 300rpx;
  height: 300rpx;
  background: #fff;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1;
  position: relative;
}

.steps-value {
  font-size: 80rpx;
  font-weight: 700;
  color: #333;
  line-height: 1;
}

.steps-unit {
  font-size: 28rpx;
  color: #999;
  margin-top: 8rpx;
}

.circle-decoration {
  position: absolute;
  bottom: -10rpx;
  right: -10rpx;
  width: 80rpx;
  height: 80rpx;
  background: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.deco-icon {
  font-size: 40rpx;
}

.steps-info {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.date-text {
  font-size: 30rpx;
  color: #fff;
  font-weight: 500;
}

.goal-text {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 8rpx;
}

/* 兑换区块 */
.exchange-section {
  margin: -30rpx 30rpx 0;
  background: #fff;
  border-radius: 24rpx;
  padding: 30rpx;
  box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.05);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.exchange-status {
  font-size: 24rpx;
  padding: 6rpx 20rpx;
  border-radius: 20rpx;
  background: #fff3e0;
  color: #ff9800;
}

.exchange-status.exchanged {
  background: #e8f5e9;
  color: #4caf50;
}

.exchange-info {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  margin-bottom: 24rpx;
}

.exchange-detail {
  flex: 1;
  min-width: 45%;
  display: flex;
  flex-direction: column;
  padding: 20rpx;
  background: #f8f8f8;
  border-radius: 12rpx;
}

.detail-label {
  font-size: 24rpx;
  color: #999;
}

.detail-value {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  margin-top: 8rpx;
}

.exchange-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #07c160 0%, #06ad56 100%);
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
}

.exchange-btn[disabled] {
  background: #ccc;
}

.exchange-btn text {
  font-size: 32rpx;
  font-weight: 600;
  color: #fff;
}

.btn-loading {
  width: 40rpx;
  height: 40rpx;
  border: 4rpx solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.exchanged-tip {
  text-align: center;
  padding: 24rpx;
  background: #e8f5e9;
  border-radius: 12rpx;
}

.exchanged-tip text {
  font-size: 28rpx;
  color: #4caf50;
  font-weight: 500;
}

/* 历史记录 */
.history-section {
  margin: 30rpx;
  background: #fff;
  border-radius: 24rpx;
  padding: 30rpx;
  box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.05);
}

.steps-chart {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  height: 280rpx;
  padding-top: 20rpx;
}

.chart-bar-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
}

.bar-container {
  flex: 1;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  width: 100%;
}

.chart-bar {
  width: 36rpx;
  background: #e0e0e0;
  border-radius: 8rpx 8rpx 0 0;
  min-height: 40rpx;
  transition: height 0.3s ease;
}

.chart-bar.today {
  background: linear-gradient(135deg, #07c160 0%, #06ad56 100%);
}

.bar-label {
  font-size: 22rpx;
  color: #999;
  margin-top: 12rpx;
}

.bar-value {
  font-size: 20rpx;
  color: #666;
  margin-top: 4rpx;
}

/* 微信运动入口 */
.wx-sports-entry {
  margin: 30rpx;
  background: #fff;
  border-radius: 24rpx;
  padding: 30rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.05);
}

.entry-info {
  flex: 1;
}

.entry-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  display: block;
}

.entry-desc {
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
  display: block;
}

.auth-btn {
  padding: 16rpx 32rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 30rpx;
  border: none;
}

.auth-btn text {
  font-size: 26rpx;
  color: #fff;
  font-weight: 500;
}

.auth-status {
  display: flex;
  align-items: center;
  padding: 16rpx 24rpx;
  background: #e8f5e9;
  border-radius: 30rpx;
}

.status-icon {
  font-size: 24rpx;
  color: #4caf50;
  margin-right: 8rpx;
}

.status-text {
  font-size: 26rpx;
  color: #4caf50;
}

/* Toast */
.toast {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 24rpx 48rpx;
  background: rgba(0, 0, 0, 0.75);
  border-radius: 12rpx;
  z-index: 9999;
}

.toast text {
  font-size: 28rpx;
  color: #fff;
}

.toast.success {
  background: rgba(76, 175, 80, 0.9);
}

.toast.error {
  background: rgba(244, 67, 54, 0.9);
}

.toast.warning {
  background: rgba(255, 152, 0, 0.9);
}
</style>
