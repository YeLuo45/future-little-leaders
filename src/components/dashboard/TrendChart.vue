<!-- TrendChart.vue - 7日柱状/折线趋势图 -->
<template>
  <view class="trend-chart">
    <view class="chart-header" v-if="title">
      <text class="chart-title">{{ title }}</text>
      <text class="chart-subtitle" v-if="subtitle">{{ subtitle }}</text>
    </view>
    <view class="chart-container">
      <svg :viewBox="`0 0 ${chartWidth} ${chartHeight}`" class="chart-svg">
        <!-- Grid lines -->
        <g class="grid-lines">
          <line
            v-for="(line, i) in gridLines"
            :key="'grid-' + i"
            :x1="padding"
            :y1="line.y"
            :x2="chartWidth - padding"
            :y2="line.y"
            stroke="#E5E7EB"
            stroke-width="1"
            stroke-dasharray="4,4"
          />
        </g>
        <!-- Bars -->
        <g class="bars" v-if="type === 'bar'">
          <g v-for="(item, index) in displayData" :key="'bar-' + index">
            <rect
              :x="getBarX(index)"
              :y="getBarY(item.value)"
              :width="barWidth"
              :height="getBarHeight(item.value)"
              :fill="color"
              :rx="4"
              :opacity="hoveredIndex === index ? 1 : 0.85"
              @tap="onBarTap(index)"
              class="bar-rect"
            />
            <!-- Value label on top -->
            <text
              v-if="showValue && item.value > 0"
              :x="getBarX(index) + barWidth / 2"
              :y="getBarY(item.value) - 6"
              text-anchor="middle"
              class="bar-value"
              :fill="color"
            >{{ item.value }}</text>
          </g>
        </g>
        <!-- Line for line chart -->
        <g class="line-group" v-if="type === 'line'">
          <polyline
            :points="linePoints"
            fill="none"
            :stroke="color"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <!-- Data points -->
          <circle
            v-for="(item, index) in displayData"
            :key="'point-' + index"
            :cx="getPointX(index)"
            :cy="getPointY(item.value)"
            r="4"
            :fill="color"
            :stroke="'white'"
            stroke-width="2"
            @tap="onBarTap(index)"
          />
        </g>
        <!-- X-axis labels -->
        <g class="x-labels">
          <text
            v-for="(item, index) in displayData"
            :key="'xlabel-' + index"
            :x="getLabelX(index)"
            :y="chartHeight - padding + 20"
            text-anchor="middle"
            class="axis-label"
            :fill="hoveredIndex === index ? '#8B5CF6' : '#9CA3AF'"
          >{{ item.label }}</text>
        </g>
      </svg>
    </view>
  </view>
</template>

<script>
export default {
  name: 'TrendChart',
  props: {
    // 数据格式: [{value: 5, label: '05-18'}, ...]
    data: {
      type: Array,
      default: () => []
    },
    // 图表类型: 'bar' | 'line'
    type: {
      type: String,
      default: 'bar'
    },
    // 标题
    title: {
      type: String,
      default: ''
    },
    // 副标题
    subtitle: {
      type: String,
      default: ''
    },
    // 颜色
    color: {
      type: String,
      default: '#8B5CF6'
    },
    // 是否显示数值
    showValue: {
      type: Boolean,
      default: true
    },
    // 高度
    height: {
      type: Number,
      default: 200
    }
  },
  data() {
    return {
      padding: 30,
      chartWidth: 320,
      hoveredIndex: -1
    }
  },
  computed: {
    displayData() {
      // 始终显示7天数据
      if (!this.data || this.data.length === 0) {
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
      return this.data
    },
    chartHeight() {
      return this.height
    },
    chartAreaHeight() {
      return this.chartHeight - this.padding - 30 // 留出X轴标签空间
    },
    barWidth() {
      const availableWidth = this.chartWidth - 2 * this.padding
      return (availableWidth / 7) * 0.6
    },
    barGap() {
      return (this.chartWidth - 2 * this.padding) / 7
    },
    maxValue() {
      const values = this.displayData.map(d => d.value || 0)
      const max = Math.max(...values, 1)
      return Math.ceil(max / 5) * 5 || 10 // 向上取整到5的倍数
    },
    gridLines() {
      const lines = []
      const step = this.maxValue / 4
      for (let i = 0; i <= 4; i++) {
        const value = step * i
        const y = this.padding + (this.chartAreaHeight - (value / this.maxValue) * this.chartAreaHeight)
        lines.push({ y, value })
      }
      return lines
    },
    linePoints() {
      return this.displayData
        .map((item, i) => `${this.getPointX(i)},${this.getPointY(item.value)}`)
        .join(' ')
    }
  },
  methods: {
    getBarX(index) {
      const startX = this.padding + (index * this.barGap) + (this.barGap - this.barWidth) / 2
      return startX
    },
    getBarHeight(value) {
      const v = value || 0
      return (v / this.maxValue) * this.chartAreaHeight
    },
    getBarY(value) {
      const v = value || 0
      return this.padding + this.chartAreaHeight - this.getBarHeight(v)
    },
    getLabelX(index) {
      return this.padding + index * this.barGap + this.barGap / 2
    },
    getPointX(index) {
      return this.padding + index * this.barGap + this.barGap / 2
    },
    getPointY(value) {
      const v = value || 0
      return this.padding + this.chartAreaHeight - (v / this.maxValue) * this.chartAreaHeight
    },
    onBarTap(index) {
      this.hoveredIndex = this.hoveredIndex === index ? -1 : index
    }
  }
}
</script>

<style scoped>
.trend-chart {
  background: white;
  border-radius: 12rpx;
  padding: 20rpx;
}
.chart-header {
  margin-bottom: 16rpx;
}
.chart-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}
.chart-subtitle {
  font-size: 22rpx;
  color: #9CA3AF;
  margin-left: 12rpx;
}
.chart-container {
  width: 100%;
}
.chart-svg {
  width: 100%;
  height: auto;
}
.bar-rect {
  cursor: pointer;
  transition: opacity 0.2s;
}
.bar-value {
  font-size: 18rpx;
  font-weight: 600;
}
.axis-label {
  font-size: 18rpx;
}
</style>