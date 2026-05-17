<!-- PointsOverview.vue - 积分总览组件 -->
<template>
  <view class="points-overview">
    <view class="section-header">
      <text class="section-title">积分总览</text>
    </view>
    
    <!-- 余额卡片 -->
    <view class="balance-card">
      <view class="balance-main">
        <text class="balance-label">积分余额</text>
        <text class="balance-value">{{ balance }}</text>
      </view>
      <view class="balance-change">
        <view class="change-item income">
          <text class="change-icon">↑</text>
          <text class="change-value">+{{ weeklyEarned }}</text>
          <text class="change-label">本周收入</text>
        </view>
        <view class="change-item expense">
          <text class="change-icon">↓</text>
          <text class="change-value">-{{ weeklySpent }}</text>
          <text class="change-label">本周支出</text>
        </view>
      </view>
    </view>
    
    <!-- 7日收支趋势图 -->
    <view class="trend-section">
      <TrendChart
        :data="chartData"
        type="bar"
        title="近7日收支"
        :color="chartColor"
        :showValue="true"
        :height="180"
      />
    </view>
  </view>
</template>

<script>
import TrendChart from './TrendChart.vue'

export default {
  name: 'PointsOverview',
  components: {
    TrendChart
  },
  props: {
    balance: {
      type: Number,
      default: 0
    },
    weeklyEarned: {
      type: Number,
      default: 0
    },
    weeklySpent: {
      type: Number,
      default: 0
    },
    pointsHistory7d: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      chartColor: '#10B981'
    }
  },
  computed: {
    chartData() {
      // 转换数据格式，或生成空数据展示
      if (this.pointsHistory7d && this.pointsHistory7d.length > 0) {
        return this.pointsHistory7d.map(item => ({
          value: item.earned || 0,
          label: item.date || ''
        }))
      }
      // 生成7天空数据
      const result = []
      for (let i = 6; i >= 0; i--) {
        const d = new Date(Date.now() - i * 24 * 3600 * 1000)
        result.push({
          value: 0,
          label: `${d.getMonth() + 1}-${d.getDate()}`
        })
      }
      return result
    }
  }
}
</script>

<style scoped>
.points-overview {
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
.balance-card {
  background: linear-gradient(135deg, #8B5CF6, #7C3AED);
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 24rpx;
}
.balance-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24rpx;
}
.balance-label {
  font-size: 24rpx;
  color: rgba(255,255,255,0.8);
  margin-bottom: 8rpx;
}
.balance-value {
  font-size: 56rpx;
  font-weight: bold;
  color: white;
}
.balance-change {
  display: flex;
  justify-content: space-around;
}
.change-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.change-icon {
  font-size: 24rpx;
  margin-bottom: 4rpx;
}
.change-item.income .change-icon { color: #86EFAC; }
.change-item.expense .change-icon { color: #FCA5A5; }
.change-value {
  font-size: 32rpx;
  font-weight: bold;
  color: white;
}
.change-label {
  font-size: 20rpx;
  color: rgba(255,255,255,0.7);
  margin-top: 4rpx;
}
.trend-section {
  margin-top: 16rpx;
}
</style>