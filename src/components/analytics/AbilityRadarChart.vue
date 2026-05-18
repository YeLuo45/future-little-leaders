<!-- AbilityRadarChart.vue - 能力雷达图组件 -->
<template>
  <view class="ability-radar-chart">
    <view class="radar-header">
      <text class="radar-title">{{ title || '🎯 能力雷达图' }}</text>
      <text class="radar-subtitle">{{ subtitle || '多维度能力分析' }}</text>
    </view>
    
    <!-- 雷达图容器 -->
    <view class="radar-container">
      <svg :viewBox="`0 0 ${svgSize} ${svgSize}`" class="radar-svg">
        <defs>
          <!-- 背景渐变 -->
          <radialGradient id="radarBgGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#F5F3FF" stop-opacity="0.5"/>
            <stop offset="100%" stop-color="#EDE9FE" stop-opacity="0.3"/>
          </radialGradient>
          
          <!-- 数据区域渐变 -->
          <linearGradient id="radarDataGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#8B5CF6" stop-opacity="0.6"/>
            <stop offset="50%" stop-color="#EC4899" stop-opacity="0.4"/>
            <stop offset="100%" stop-color="#F59E0B" stop-opacity="0.3"/>
          </linearGradient>
          
          <!-- 发光效果 -->
          <filter id="radarGlow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        <!-- 背景圆 -->
        <circle
          :cx="center"
          :cy="center"
          :r="radius"
          fill="url(#radarBgGradient)"
          stroke="#E5E7EB"
          stroke-width="1"
        />
        
        <!-- 网格线 - 同心圆 -->
        <g class="grid-circles">
          <circle
            v-for="level in 5"
            :key="'grid-' + level"
            :cx="center"
            :cy="center"
            :r="(radius * level) / 5"
            fill="none"
            stroke="#D1D5DB"
            stroke-width="0.5"
            stroke-dasharray="4,4"
            :opacity="0.5"
          />
        </g>
        
        <!-- 网格线 - 轴线 -->
        <g class="grid-lines">
          <line
            v-for="(axis, index) in axes"
            :key="'axis-' + index"
            :x1="center"
            :y1="center"
            :x2="getAxisEnd(index).x"
            :y2="getAxisEnd(index).y"
            stroke="#D1D5DB"
            stroke-width="0.5"
          />
        </g>
        
        <!-- 数据区域 (多边形) -->
        <polygon
          :points="dataPoints"
          fill="url(#radarDataGradient)"
          stroke="#8B5CF6"
          stroke-width="2"
          stroke-linejoin="round"
          filter="url(#radarGlow)"
          class="data-polygon"
        />
        
        <!-- 数据点 -->
        <circle
          v-for="(point, index) in displayPoints"
          :key="'point-' + index"
          :cx="point.x"
          :cy="point.y"
          r="6"
          :fill="getPointColor(point.value)"
          stroke="white"
          stroke-width="2"
          class="data-point"
          @tap="onPointTap(index)"
        />
        
        <!-- 标签 -->
        <g class="axis-labels">
          <text
            v-for="(axis, index) in axes"
            :key="'label-' + index"
            :x="getLabelPosition(index).x"
            :y="getLabelPosition(index).y"
            text-anchor="middle"
            dominant-baseline="middle"
            class="axis-label"
          >
            {{ axis.label }}
          </text>
        </g>
        
        <!-- 数值标签 -->
        <g class="value-labels">
          <text
            v-for="(point, index) in displayPoints"
            :key="'value-' + index"
            :x="point.x"
            :y="point.y - 16"
            text-anchor="middle"
            class="value-label"
            :fill="getPointColor(point.value)"
          >
            {{ point.displayValue }}
          </text>
        </g>
      </svg>
    </view>
    
    <!-- 能力维度说明 -->
    <view class="ability-list" v-if="showDetails">
      <view 
        class="ability-item" 
        v-for="(axis, index) in axes" 
        :key="index"
        @tap="onAbilityTap(index)"
      >
        <view class="ability-info">
          <view class="ability-icon" :style="{ background: getPointColor(displayPoints[index]?.value || 0) }">
            {{ axis.icon || '📊' }}
          </view>
          <view class="ability-text">
            <text class="ability-name">{{ axis.label }}</text>
            <text class="ability-desc">{{ axis.description || '' }}</text>
          </view>
        </view>
        <view class="ability-bar-wrap">
          <view 
            class="ability-bar-fill" 
            :style="{ 
              width: (displayPoints[index]?.value || 0) + '%',
              background: getPointColor(displayPoints[index]?.value || 0)
            }"
          ></view>
        </view>
        <text class="ability-value">{{ displayPoints[index]?.displayValue || '0' }}</text>
      </view>
    </view>
    
    <!-- 综合评分 -->
    <view class="overall-score" v-if="showOverall">
      <view class="score-circle">
        <svg viewBox="0 0 120 120" class="score-svg">
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="#E5E7EB"
            stroke-width="8"
          />
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            :stroke="getOverallColor()"
            stroke-width="8"
            stroke-linecap="round"
            :stroke-dasharray="circumference"
            :stroke-dashoffset="circumference - (circumference * overallScore) / 100"
            transform="rotate(-90 60 60)"
            class="score-progress"
          />
          <text x="60" y="55" text-anchor="middle" class="score-value">{{ overallScore }}</text>
          <text x="60" y="72" text-anchor="middle" class="score-label">综合评分</text>
        </svg>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'AbilityRadarChart',
  props: {
    // 数据格式: [{ label: '任务完成', value: 85, icon: '📝' }, ...]
    data: {
      type: Array,
      default: () => []
    },
    // 维度定义
    axes: {
      type: Array,
      default: () => [
        { label: '任务完成', key: 'tasks', icon: '📝', description: '任务完成率' },
        { label: '连续打卡', key: 'streak', icon: '🔥', description: '连续活跃天数' },
        { label: '技能提升', key: 'skills', icon: '🎯', description: '技能成长度' },
        { label: '积分获取', key: 'points', icon: '💰', description: '积分获取能力' },
        { label: '成就解锁', key: 'achievements', icon: '🏆', description: '成就完成度' },
        { label: '互动协作', key: 'interaction', icon: '🤝', description: '社交互动能力' }
      ]
    },
    title: String,
    subtitle: String,
    showDetails: {
      type: Boolean,
      default: true
    },
    showOverall: {
      type: Boolean,
      default: true
    },
    // 最大值
    maxValue: {
      type: Number,
      default: 100
    }
  },
  data() {
    return {
      svgSize: 300,
      selectedIndex: -1
    }
  },
  computed: {
    center() {
      return this.svgSize / 2
    },
    radius() {
      return (this.svgSize / 2) * 0.65
    },
    circumference() {
      return 2 * Math.PI * 54
    },
    // 根据数据计算雷达图顶点
    displayPoints() {
      const count = this.axes.length
      const angleStep = (2 * Math.PI) / count
      
      return this.axes.map((axis, index) => {
        // 获取对应数据值
        const dataItem = this.data.find(d => d.label === axis.label || d.key === axis.key)
        const value = dataItem ? (dataItem.value || 0) : 0
        const normalizedValue = Math.min(value / this.maxValue, 1)
        
        const angle = angleStep * index - Math.PI / 2 // 从顶部开始
        const distance = this.radius * normalizedValue
        
        const x = this.center + Math.cos(angle) * distance
        const y = this.center + Math.sin(angle) * distance
        
        return {
          x,
          y,
          value: normalizedValue * 100,
          displayValue: value,
          color: this.getPointColor(normalizedValue * 100),
          axis
        }
      })
    },
    
    // 多边形顶点字符串
    dataPoints() {
      return this.displayPoints.map(p => `${p.x},${p.y}`).join(' ')
    },
    
    // 综合评分
    overallScore() {
      if (this.displayPoints.length === 0) return 0
      const sum = this.displayPoints.reduce((acc, p) => acc + p.value, 0)
      return Math.round(sum / this.displayPoints.length)
    }
  },
  methods: {
    getAxisEnd(index) {
      const count = this.axes.length
      const angleStep = (2 * Math.PI) / count
      const angle = angleStep * index - Math.PI / 2
      return {
        x: this.center + Math.cos(angle) * this.radius,
        y: this.center + Math.sin(angle) * this.radius
      }
    },
    
    getLabelPosition(index) {
      const count = this.axes.length
      const angleStep = (2 * Math.PI) / count
      const angle = angleStep * index - Math.PI / 2
      const distance = this.radius + 30
      
      const x = this.center + Math.cos(angle) * distance
      let y = this.center + Math.sin(angle) * distance
      
      // 调整垂直对齐
      if (index === 0) y -= 8
      else if (index === count / 2) y += 12
      
      return { x, y }
    },
    
    getPointColor(value) {
      if (value >= 80) return '#10B981' // 绿色 - 优秀
      if (value >= 60) return '#8B5CF6' // 紫色 - 良好
      if (value >= 40) return '#F59E0B' // 橙色 - 一般
      return '#EF4444' // 红色 - 需努力
    },
    
    getOverallColor() {
      const score = this.overallScore
      if (score >= 80) return '#10B981'
      if (score >= 60) return '#8B5CF6'
      if (score >= 40) return '#F59E0B'
      return '#EF4444'
    },
    
    onPointTap(index) {
      this.selectedIndex = this.selectedIndex === index ? -1 : index
      this.$emit('pointTap', {
        index,
        axis: this.axes[index],
        value: this.displayPoints[index]?.value
      })
    },
    
    onAbilityTap(index) {
      this.$emit('abilityTap', {
        index,
        axis: this.axes[index],
        value: this.displayPoints[index]?.value
      })
    }
  }
}
</script>

<style scoped>
.ability-radar-chart {
  background: white;
  border-radius: 20rpx;
  padding: 24rpx;
  box-shadow: 0 8rpx 32rpx rgba(139, 92, 246, 0.1);
}

.radar-header {
  margin-bottom: 20rpx;
}

.radar-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
}

.radar-subtitle {
  font-size: 24rpx;
  color: #888;
  display: block;
  margin-top: 4rpx;
}

.radar-container {
  width: 100%;
  display: flex;
  justify-content: center;
  margin: 20rpx 0;
}

.radar-svg {
  width: 100%;
  max-width: 400rpx;
  height: auto;
}

.axis-label {
  font-size: 22rpx;
  font-weight: 600;
  fill: #4B5563;
}

.value-label {
  font-size: 18rpx;
  font-weight: 600;
}

.data-polygon {
  transition: all 0.3s ease;
}

.data-point {
  cursor: pointer;
  transition: r 0.2s;
}

.data-point:hover {
  r: 8;
}

.ability-list {
  margin-top: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.ability-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 12rpx 16rpx;
  background: #F9FAFB;
  border-radius: 12rpx;
  cursor: pointer;
  transition: background 0.2s;
}

.ability-item:active {
  background: #F3F4F6;
}

.ability-info {
  display: flex;
  align-items: center;
  gap: 12rpx;
  min-width: 180rpx;
}

.ability-icon {
  width: 48rpx;
  height: 48rpx;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
}

.ability-text {
  display: flex;
  flex-direction: column;
}

.ability-name {
  font-size: 26rpx;
  font-weight: 600;
  color: #333;
}

.ability-desc {
  font-size: 20rpx;
  color: #888;
}

.ability-bar-wrap {
  flex: 1;
  height: 12rpx;
  background: #E5E7EB;
  border-radius: 6rpx;
  overflow: hidden;
}

.ability-bar-fill {
  height: 100%;
  border-radius: 6rpx;
  transition: width 0.5s ease;
}

.ability-value {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  min-width: 50rpx;
  text-align: right;
}

.overall-score {
  display: flex;
  justify-content: center;
  margin-top: 24rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid #F0F0F0;
}

.score-circle {
  width: 120rpx;
  height: 120rpx;
}

.score-svg {
  width: 100%;
  height: 100%;
}

.score-progress {
  transition: stroke-dashoffset 1s ease;
}

.score-value {
  font-size: 36rpx;
  font-weight: bold;
  fill: #333;
}

.score-label {
  font-size: 18rpx;
  fill: #888;
}
</style>
