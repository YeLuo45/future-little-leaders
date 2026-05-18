<!-- GrowthTrajectory3D.vue - 3D成长轨迹可视化组件 -->
<template>
  <view class="growth-trajectory-3d">
    <view class="trajectory-header">
      <text class="trajectory-title">{{ title || '🌟 成长轨迹' }}</text>
      <text class="trajectory-subtitle">{{ subtitle || '近30日能力发展曲线' }}</text>
    </view>
    
    <!-- 3D场景容器 -->
    <view class="scene-container" :style="{ perspective: perspective + 'rpx' }">
      <view 
        class="trajectory-scene" 
        :style="{ transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)` }"
        @touchstart="onTouchStart"
        @touchmove="onTouchMove"
        @touchend="onTouchEnd"
      >
        <!-- 3D轨迹线 -->
        <view class="trajectory-line-3d">
          <!-- 后层网格 -->
          <view class="grid-back">
            <view v-for="i in 5" :key="'hz'+i" class="grid-line-h" :style="{ top: (i * 20) + '%' }"></view>
            <view v-for="i in 5" :key="'vt'+i" class="grid-line-v" :style="{ left: (i * 20) + '%' }"></view>
          </view>
          
          <!-- 轨迹路径 SVG -->
          <svg viewBox="0 0 300 200" class="trajectory-svg">
            <!-- 渐变定义 -->
            <defs>
              <linearGradient id="trajectoryGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stop-color="#6366F1" stop-opacity="0.3"/>
                <stop offset="50%" stop-color="#8B5CF6" stop-opacity="0.6"/>
                <stop offset="100%" stop-color="#EC4899" stop-opacity="1"/>
              </linearGradient>
              <linearGradient id="areaGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stop-color="#8B5CF6" stop-opacity="0.1"/>
                <stop offset="100%" stop-color="#EC4899" stop-opacity="0.4"/>
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            <!-- 面积填充 -->
            <path
              :d="areaPath"
              fill="url(#areaGradient)"
              class="trajectory-area"
            />
            
            <!-- 3D轨迹线 -->
            <path
              :d="curvePath"
              fill="none"
              stroke="url(#trajectoryGradient)"
              stroke-width="3"
              stroke-linecap="round"
              stroke-linejoin="round"
              filter="url(#glow)"
              class="trajectory-curve"
            />
            
            <!-- 数据点 -->
            <circle
              v-for="(point, index) in displayPoints"
              :key="index"
              :cx="point.x"
              :cy="point.y"
              r="5"
              :fill="point.color || '#8B5CF6'"
              class="trajectory-point"
              @tap="onPointTap(index)"
            />
            
            <!-- 当前点高亮 -->
            <circle
              v-if="currentPoint"
              :cx="currentPoint.x"
              :cy="currentPoint.y"
              r="8"
              fill="#EC4899"
              class="trajectory-current-point"
            >
              <animate attributeName="r" values="8;12;8" dur="1.5s" repeatCount="indefinite"/>
            </circle>
          </svg>
          
          <!-- 标签 -->
          <view class="trajectory-labels">
            <text 
              v-for="(label, index) in xLabels" 
              :key="index"
              class="label-item"
              :style="{ left: label.x + '%' }"
            >{{ label.text }}</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 图例 -->
    <view class="trajectory-legend">
      <view class="legend-item" v-for="(item, index) in legend" :key="index">
        <view class="legend-dot" :style="{ background: item.color }"></view>
        <text class="legend-text">{{ item.label }}</text>
      </view>
    </view>
    
    <!-- 统计信息 -->
    <view class="trajectory-stats" v-if="showStats">
      <view class="stat-item">
        <text class="stat-value">{{ totalGrowth > 0 ? '+' + totalGrowth : totalGrowth }}</text>
        <text class="stat-label">成长值</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">{{ peakDay }}</text>
        <text class="stat-label">最佳日</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">{{ consistency }}%</text>
        <text class="stat-label">完成率</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'GrowthTrajectory3D',
  props: {
    // 数据格式: [{ date: '2024-01-01', value: 85 }, ...]
    data: {
      type: Array,
      default: () => []
    },
    title: String,
    subtitle: String,
    showStats: {
      type: Boolean,
      default: true
    },
    // 是否可交互旋转
    interactive: {
      type: Boolean,
      default: true
    },
    // 多维度数据，用于图例
    multiData: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      perspective: 800,
      rotateX: -15,
      rotateY: 20,
      touchStartX: 0,
      touchStartY: 0,
      lastRotateX: -15,
      lastRotateY: 20,
      selectedPoint: -1,
      animationDuration: 1000,
      startTime: null
    }
  },
  computed: {
    // 处理显示数据 - 归一化到0-100范围
    normalizedData() {
      if (!this.data || this.data.length === 0) {
        return this.generateEmptyData()
      }
      const values = this.data.map(d => d.value || 0)
      const max = Math.max(...values, 1)
      const min = Math.min(...values, 0)
      const range = max - min || 1
      
      return this.data.map((d, i) => ({
        ...d,
        normalized: ((d.value || 0) - min) / range * 100,
        x: (i / (this.data.length - 1 || 1)) * 280 + 10,
        y: 190 - (((d.value || 0) - min) / range) * 160
      }))
    },
    
    displayPoints() {
      return this.normalizedData.map((d, i) => ({
        x: d.x,
        y: d.y,
        value: d.value,
        date: d.date,
        color: this.getPointColor(d.normalized)
      }))
    },
    
    currentPoint() {
      if (this.displayPoints.length === 0) return null
      return this.displayPoints[this.displayPoints.length - 1]
    },
    
    // 曲线路径
    curvePath() {
      const points = this.displayPoints
      if (points.length < 2) return ''
      
      let path = `M ${points[0].x} ${points[0].y}`
      
      for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1]
        const curr = points[i]
        const cpx = (prev.x + curr.x) / 2
        path += ` Q ${prev.x + (cpx - prev.x) * 0.5} ${prev.y}, ${cpx} ${(prev.y + curr.y) / 2}`
        path += ` Q ${cpx + (curr.x - cpx) * 0.5} ${curr.y}, ${curr.x} ${curr.y}`
      }
      
      return path
    },
    
    // 面积填充路径
    areaPath() {
      const points = this.displayPoints
      if (points.length < 2) return ''
      
      let path = `M ${points[0].x} 190 L ${points[0].x} ${points[0].y}`
      
      for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1]
        const curr = points[i]
        const cpx = (prev.x + curr.x) / 2
        path += ` Q ${prev.x + (cpx - prev.x) * 0.5} ${prev.y}, ${cpx} ${(prev.y + curr.y) / 2}`
        path += ` Q ${cpx + (curr.x - cpx) * 0.5} ${curr.y}, ${curr.x} ${curr.y}`
      }
      
      path += ` L ${points[points.length - 1].x} 190 Z`
      return path
    },
    
    // X轴标签
    xLabels() {
      const data = this.normalizedData
      if (data.length <= 5) {
        return data.map(d => ({
          text: this.formatDate(d.date),
          x: (d.x / 300) * 100
        }))
      }
      
      // 均匀采样5个标签
      const step = Math.floor(data.length / 4)
      const labels = []
      for (let i = 0; i < 4; i++) {
        const idx = i * step
        if (data[idx]) {
          labels.push({
            text: this.formatDate(data[idx].date),
            x: (data[idx].x / 300) * 100
          })
        }
      }
      if (data[data.length - 1]) {
        labels.push({
          text: this.formatDate(data[data.length - 1].date),
          x: (data[data.length - 1].x / 300) * 100
        })
      }
      return labels
    },
    
    // 图例
    legend() {
      if (this.multiData && this.multiData.length > 0) {
        return this.multiData.map((item, i) => ({
          label: item.label || `指标${i + 1}`,
          color: item.color || this.getPointColor((i / this.multiData.length) * 100)
        }))
      }
      
      return [{
        label: '成长值',
        color: '#8B5CF6'
      }]
    },
    
    // 统计计算
    totalGrowth() {
      if (this.data.length < 2) return 0
      const first = this.data[0].value || 0
      const last = this.data[this.data.length - 1].value || 0
      return Math.round(last - first)
    },
    
    peakDay() {
      if (this.data.length === 0) return '-'
      let maxVal = -Infinity
      let peakIdx = 0
      this.data.forEach((d, i) => {
        if ((d.value || 0) > maxVal) {
          maxVal = d.value || 0
          peakIdx = i
        }
      })
      return this.formatDate(this.data[peakIdx]?.date)
    },
    
    consistency() {
      if (this.data.length === 0) return 0
      const completed = this.data.filter(d => (d.value || 0) > 0).length
      return Math.round((completed / this.data.length) * 100)
    }
  },
  methods: {
    generateEmptyData() {
      const result = []
      for (let i = 29; i >= 0; i--) {
        const d = new Date(Date.now() - i * 24 * 3600 * 1000)
        result.push({
          date: d.toISOString().split('T')[0],
          value: Math.random() * 30 + 20,
          x: ((29 - i) / 29) * 280 + 10,
          y: 190 - (Math.random() * 30 + 20) / 100 * 160
        })
      }
      return result
    },
    
    formatDate(dateStr) {
      if (!dateStr) return ''
      const d = new Date(dateStr)
      return `${d.getMonth() + 1}/${d.getDate()}`
    },
    
    getPointColor(value) {
      if (value >= 80) return '#10B981' // 绿色 - 优秀
      if (value >= 60) return '#8B5CF6' // 紫色 - 良好
      if (value >= 40) return '#F59E0B' // 橙色 - 一般
      return '#EF4444' // 红色 - 需努力
    },
    
    onTouchStart(e) {
      if (!this.interactive) return
      this.touchStartX = e.touches[0].clientX
      this.touchStartY = e.touches[0].clientY
      this.lastRotateX = this.rotateX
      this.lastRotateY = this.rotateY
    },
    
    onTouchMove(e) {
      if (!this.interactive) return
      const deltaX = e.touches[0].clientX - this.touchStartX
      const deltaY = e.touches[0].clientY - this.touchStartY
      
      this.rotateY = this.lastRotateY + deltaX * 0.5
      this.rotateX = this.lastRotateX - deltaY * 0.3
      
      // 限制旋转角度
      this.rotateX = Math.max(-45, Math.min(45, this.rotateX))
      this.rotateY = this.rotateY % 360
    },
    
    onTouchEnd() {
      // 可以添加自动回弹动画
    },
    
    onPointTap(index) {
      this.selectedPoint = this.selectedPoint === index ? -1 : index
      const point = this.displayPoints[index]
      if (point) {
        this.$emit('pointTap', {
          index,
          date: point.date,
          value: point.value
        })
      }
    }
  },
  mounted() {
    // 启动入场动画
    this.startTime = Date.now()
    this.$nextTick(() => {
      this.animateIn()
    })
  },
  methods: {
    animateIn() {
      // 简单的淡入效果
      const elapsed = Date.now() - this.startTime
      if (elapsed < this.animationDuration) {
        requestAnimationFrame(() => this.animateIn())
      }
    }
  }
}
</script>

<style scoped>
.growth-trajectory-3d {
  background: white;
  border-radius: 20rpx;
  padding: 24rpx;
  box-shadow: 0 8rpx 32rpx rgba(139, 92, 246, 0.1);
}

.trajectory-header {
  margin-bottom: 20rpx;
}

.trajectory-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
}

.trajectory-subtitle {
  font-size: 24rpx;
  color: #888;
  display: block;
  margin-top: 4rpx;
}

.scene-container {
  perspective: 800rpx;
  perspective-origin: center center;
  overflow: hidden;
}

.trajectory-scene {
  transform-style: preserve-3d;
  transition: transform 0.1s ease-out;
}

.trajectory-line-3d {
  position: relative;
  width: 100%;
  height: 400rpx;
  transform-style: preserve-3d;
}

.grid-back {
  position: absolute;
  width: 100%;
  height: 100%;
  opacity: 0.3;
}

.grid-line-h {
  position: absolute;
  width: 100%;
  height: 1rpx;
  background: linear-gradient(90deg, transparent, #8B5CF6, transparent);
}

.grid-line-v {
  position: absolute;
  width: 1rpx;
  height: 100%;
  background: linear-gradient(180deg, transparent, #8B5CF6, transparent);
}

.trajectory-svg {
  width: 100%;
  height: 320rpx;
}

.trajectory-area {
  opacity: 0.6;
}

.trajectory-curve {
  filter: url(#glow);
}

.trajectory-point {
  cursor: pointer;
  transition: r 0.2s;
}

.trajectory-current-point {
  filter: drop-shadow(0 0 8rpx #EC4899);
}

.trajectory-labels {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 60rpx;
}

.label-item {
  position: absolute;
  transform: translateX(-50%);
  font-size: 20rpx;
  color: #888;
  white-space: nowrap;
}

.trajectory-legend {
  display: flex;
  justify-content: center;
  gap: 32rpx;
  margin-top: 20rpx;
  padding-top: 16rpx;
  border-top: 1rpx solid #F0F0F0;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.legend-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
}

.legend-text {
  font-size: 22rpx;
  color: #666;
}

.trajectory-stats {
  display: flex;
  justify-content: space-around;
  margin-top: 20rpx;
  padding-top: 16rpx;
  border-top: 1rpx solid #F0F0F0;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 36rpx;
  font-weight: bold;
  color: #8B5CF6;
}

.stat-label {
  font-size: 22rpx;
  color: #888;
  margin-top: 4rpx;
}
</style>
