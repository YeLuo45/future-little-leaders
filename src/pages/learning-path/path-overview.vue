<template>
  <view class="learning-path-overview">
    <!-- 头部信息 -->
    <view class="header">
      <view class="header-bg"></view>
      <view class="header-content">
        <view class="title-row">
          <text class="page-title">学习路径</text>
          <view class="overall-badge" :style="{backgroundColor: overallColor}">
            <text class="badge-text">{{ overallLevelText }}</text>
          </view>
        </view>
        <text class="subtitle">{{ currentPath ? '个性化学习方案' : '开启您的学习之旅' }}</text>
      </view>
    </view>

    <!-- 无学习路径提示 -->
    <view class="empty-state" v-if="!store.hasLearningPath">
      <view class="empty-icon">📚</view>
      <text class="empty-title">暂无学习路径</text>
      <text class="empty-desc">完成能力评估，获取个性化学习方案</text>
      <button class="start-btn" @tap="goToAssessment">开始评估</button>
    </view>

    <!-- 学习路径内容 -->
    <view class="content" v-else>
      <!-- 雷达图区域 -->
      <view class="radar-section">
        <view class="section-title">
          <text class="title-icon">🎯</text>
          <text>能力雷达图</text>
        </view>
        <view class="radar-container">
          <canvas canvas-id="radarChart" id="radarChart" class="radar-canvas"></canvas>
          <view class="radar-legend">
            <view 
              v-for="dim in store.getRadarData()" 
              :key="dim.dimension"
              class="legend-item"
            >
              <view 
                class="legend-dot" 
                :style="{backgroundColor: getDimensionColor(dim.dimension)}"
              ></view>
              <text class="legend-name">{{ getDimensionName(dim.dimension) }}</text>
              <text class="legend-score">{{ dim.score }}分</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 薄弱点提示 -->
      <view class="weak-areas-section" v-if="store.weakDimensions.length > 0">
        <view class="section-title warning">
          <text class="title-icon">⚠️</text>
          <text>需要加强的领域</text>
        </view>
        <view class="weak-areas">
          <view 
            v-for="dim in store.weakDimensions" 
            :key="dim"
            class="weak-area-card"
            :style="{borderLeftColor: getDimensionColor(dim)}"
          >
            <text class="area-emoji">{{ getDimensionEmoji(dim) }}</text>
            <view class="area-info">
              <text class="area-name">{{ getDimensionName(dim) }}</text>
              <text class="area-progress">进度: {{ store.getDimensionProgress(dim) }}%</text>
            </view>
            <button class="boost-btn" @tap="boostDimension(dim)">突破</button>
          </view>
        </view>
      </view>

      <!-- 学习目标 -->
      <view class="goals-section">
        <view class="section-title">
          <text class="title-icon">🏆</text>
          <text>学习目标</text>
        </view>
        
        <!-- 短期目标 -->
        <view class="goal-category" v-if="store.shortTermGoals.length > 0">
          <view class="goal-category-header">
            <text class="category-label">短期目标</text>
            <text class="category-days">1周内</text>
          </view>
          <view 
            v-for="goal in store.shortTermGoals" 
            :key="goal.id"
            class="goal-card"
            :class="{completed: goal.completed}"
          >
            <view class="goal-icon">{{ goal.completed ? '✅' : '🎯' }}</view>
            <view class="goal-info">
              <text class="goal-title">{{ goal.title }}</text>
              <view class="goal-progress-bar">
                <view 
                  class="goal-progress-fill"
                  :style="{width: getGoalProgress(goal) + '%'}"
                ></view>
              </view>
              <text class="goal-progress-text">{{ goal.currentScore }}/{{ goal.targetScore }}分</text>
            </view>
          </view>
        </view>

        <!-- 中期目标 -->
        <view class="goal-category" v-if="store.mediumTermGoals.length > 0">
          <view class="goal-category-header">
            <text class="category-label">中期目标</text>
            <text class="category-days">1月内</text>
          </view>
          <view 
            v-for="goal in store.mediumTermGoals" 
            :key="goal.id"
            class="goal-card"
            :class="{completed: goal.completed}"
          >
            <view class="goal-icon">{{ goal.completed ? '✅' : '📅' }}</view>
            <view class="goal-info">
              <text class="goal-title">{{ goal.title }}</text>
              <view class="goal-progress-bar">
                <view 
                  class="goal-progress-fill medium"
                  :style="{width: getGoalProgress(goal) + '%'}"
                ></view>
              </view>
              <text class="goal-progress-text">{{ goal.currentScore }}/{{ goal.targetScore }}分</text>
            </view>
          </view>
        </view>

        <!-- 长期目标 -->
        <view class="goal-category" v-if="store.longTermGoals.length > 0">
          <view class="goal-category-header">
            <text class="category-label">长期目标</text>
            <text class="category-days">3月+</text>
          </view>
          <view 
            v-for="goal in store.longTermGoals" 
            :key="goal.id"
            class="goal-card long-term"
            :class="{completed: goal.completed}"
          >
            <view class="goal-icon">{{ goal.completed ? '✅' : '🎓' }}</view>
            <view class="goal-info">
              <text class="goal-title">{{ goal.title }}</text>
              <view class="goal-progress-bar">
                <view 
                  class="goal-progress-fill long"
                  :style="{width: getGoalProgress(goal) + '%'}"
                ></view>
              </view>
              <text class="goal-progress-text">{{ goal.currentScore }}/{{ goal.targetScore }}分</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 推荐课程 -->
      <view class="courses-section">
        <view class="section-title">
          <text class="title-icon">📖</text>
          <text>推荐课程</text>
        </view>
        
        <view class="courses-grid">
          <view 
            v-for="course in store.currentPath?.recommendedCourses.slice(0, 6)" 
            :key="course.id"
            class="course-card"
            @tap="viewCourse(course)"
          >
            <view 
              class="course-header" 
              :style="{backgroundColor: getDimensionColor(course.dimension)}"
            >
              <text class="course-emoji">{{ getDimensionEmoji(course.dimension) }}</text>
              <view class="course-difficulty">
                <text v-for="i in course.difficulty" :key="i">⭐</text>
              </view>
            </view>
            <view class="course-body">
              <text class="course-title">{{ course.title }}</text>
              <text class="course-desc">{{ course.description }}</text>
              <view class="course-meta">
                <text class="course-time">⏱️ {{ course.estimatedMinutes }}分钟</text>
                <view class="course-status" :class="course.status">
                  {{ getCourseStatusText(course.status) }}
                </view>
              </view>
              <view class="course-progress-bar" v-if="course.progress > 0">
                <view 
                  class="course-progress-fill"
                  :style="{width: course.progress + '%'}"
                ></view>
              </view>
            </view>
          </view>
        </view>
        
        <button class="view-more-btn" @tap="goToProgress">查看全部课程</button>
      </view>

      <!-- 总体进度 -->
      <view class="progress-summary">
        <view class="summary-card">
          <view class="summary-circle">
            <text class="summary-percent">{{ store.overallProgress }}%</text>
            <text class="summary-label">总进度</text>
          </view>
          <view class="summary-stats">
            <view class="stat-item">
              <text class="stat-value">{{ store.learningStats?.completedCourses || 0 }}</text>
              <text class="stat-label">已完成</text>
            </view>
            <view class="stat-item">
              <text class="stat-value">{{ store.learningStats?.inProgressCourses || 0 }}</text>
              <text class="stat-label">进行中</text>
            </view>
            <view class="stat-item">
              <text class="stat-value">{{ store.learningStats?.totalCourses || 0 }}</text>
              <text class="stat-label">总课程</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { useLearningPathStore } from '@/stores/learningPathStore.js'
import { DIMENSION_CONFIG, ABILITY_DIMENSIONS } from '@/services/learningPathService.js'

export default {
  data() {
    return {
      dimensionConfig: DIMENSION_CONFIG
    }
  },
  
  onLoad() {
    this.store = useLearningPathStore()
    this.store.init()
  },
  
  computed: {
    currentPath() {
      return this.store.currentPath
    },
    
    overallLevelText() {
      const level = this.store.currentAssessment?.overallLevel
      const map = {
        advanced: '高手',
        intermediate: '进阶',
        beginner: '入门',
        starter: '起步'
      }
      return map[level] || '起步'
    },
    
    overallColor() {
      const level = this.store.currentAssessment?.overallLevel
      const map = {
        advanced: '#52c41a',
        intermediate: '#1890ff',
        beginner: '#faad14',
        starter: '#d9d9d9'
      }
      return map[level] || '#d9d9d9'
    }
  },
  
  methods: {
    getDimensionColor(dimension) {
      return DIMENSION_CONFIG[dimension]?.color || '#999'
    },
    
    getDimensionName(dimension) {
      return DIMENSION_CONFIG[dimension]?.name || dimension
    },
    
    getDimensionEmoji(dimension) {
      return DIMENSION_CONFIG[dimension]?.emoji || '📚'
    },
    
    getGoalProgress(goal) {
      if (!goal.targetScore) return 0
      return Math.round((goal.currentScore / goal.targetScore) * 100)
    },
    
    getCourseStatusText(status) {
      const map = {
        not_started: '未开始',
        in_progress: '进行中',
        completed: '已完成',
        skipped: '已跳过'
      }
      return map[status] || status
    },
    
    goToAssessment() {
      uni.navigateTo({
        url: '/pages/learning-path/assessment'
      })
    },
    
    goToProgress() {
      uni.navigateTo({
        url: '/pages/learning-path/progress'
      })
    },
    
    viewCourse(course) {
      uni.navigateTo({
        url: `/pages/learning-path/progress?courseId=${course.id}`
      })
    },
    
    boostDimension(dimension) {
      uni.navigateTo({
        url: `/pages/learning-path/assessment?dimension=${dimension}&mode=breakthrough`
      })
    }
  }
}
</script>

<style scoped>
.learning-path-overview {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120px;
}

.header {
  position: relative;
  padding: 40px 20px 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.header-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url(data:image/svg+xml;base64,...) center/cover;
  opacity: 0.1;
}

.header-content {
  position: relative;
  z-index: 1;
}

.title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.page-title {
  font-size: 28px;
  font-weight: bold;
  color: #fff;
}

.overall-badge {
  padding: 4px 12px;
  border-radius: 20px;
  background: rgba(255,255,255,0.2);
}

.badge-text {
  font-size: 14px;
  color: #fff;
}

.subtitle {
  font-size: 14px;
  color: rgba(255,255,255,0.8);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 40px;
}

.empty-icon {
  font-size: 80px;
  margin-bottom: 20px;
}

.empty-title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
}

.empty-desc {
  font-size: 14px;
  color: #999;
  text-align: center;
  margin-bottom: 30px;
}

.start-btn {
  width: 200px;
  height: 44px;
  line-height: 44px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-radius: 22px;
  font-size: 16px;
  border: none;
}

.content {
  padding: 20px;
}

.radar-section {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.section-title {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.section-title.warning {
  color: #ff6b6b;
}

.title-icon {
  margin-right: 8px;
  font-size: 18px;
}

.radar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.radar-canvas {
  width: 200px;
  height: 200px;
}

.radar-legend {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  margin-top: 16px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.legend-name {
  font-size: 12px;
  color: #666;
}

.legend-score {
  font-size: 12px;
  color: #999;
}

.weak-areas-section {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.weak-areas {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.weak-area-card {
  display: flex;
  align-items: center;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 12px;
  border-left: 4px solid #ff6b6b;
}

.area-emoji {
  font-size: 24px;
  margin-right: 12px;
}

.area-info {
  flex: 1;
}

.area-name {
  font-size: 14px;
  font-weight: bold;
  color: #333;
}

.area-progress {
  font-size: 12px;
  color: #999;
}

.boost-btn {
  padding: 6px 16px;
  background: #ff6b6b;
  color: #fff;
  border-radius: 16px;
  font-size: 12px;
  border: none;
}

.goals-section {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.goal-category {
  margin-bottom: 16px;
}

.goal-category:last-child {
  margin-bottom: 0;
}

.goal-category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.category-label {
  font-size: 14px;
  font-weight: bold;
  color: #333;
}

.category-days {
  font-size: 12px;
  color: #999;
}

.goal-card {
  display: flex;
  align-items: center;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 12px;
  margin-bottom: 8px;
}

.goal-card.completed {
  opacity: 0.6;
}

.goal-icon {
  font-size: 20px;
  margin-right: 12px;
}

.goal-info {
  flex: 1;
}

.goal-title {
  font-size: 14px;
  color: #333;
  margin-bottom: 6px;
}

.goal-progress-bar {
  height: 6px;
  background: #e0e0e0;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 4px;
}

.goal-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 3px;
  transition: width 0.3s;
}

.goal-progress-fill.medium {
  background: linear-gradient(90deg, #f093fb 0%, #f5576c 100%);
}

.goal-progress-fill.long {
  background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
}

.goal-progress-text {
  font-size: 11px;
  color: #999;
}

.courses-section {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.courses-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.course-card {
  background: #fff;
  border: 1px solid #eee;
  border-radius: 12px;
  overflow: hidden;
}

.course-header {
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.course-emoji {
  font-size: 24px;
}

.course-difficulty {
  font-size: 10px;
}

.course-body {
  padding: 12px;
}

.course-title {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
  display: block;
}

.course-desc {
  font-size: 12px;
  color: #999;
  margin-bottom: 8px;
  display: block;
}

.course-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.course-time {
  font-size: 11px;
  color: #999;
}

.course-status {
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 10px;
  background: #f0f0f0;
  color: #666;
}

.course-status.in_progress {
  background: #e6f7ff;
  color: #1890ff;
}

.course-status.completed {
  background: #f6ffed;
  color: #52c41a;
}

.course-progress-bar {
  height: 4px;
  background: #e0e0e0;
  border-radius: 2px;
  overflow: hidden;
}

.course-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
}

.view-more-btn {
  width: 100%;
  height: 40px;
  line-height: 40px;
  background: #f5f5f5;
  color: #666;
  border-radius: 20px;
  font-size: 14px;
  border: none;
}

.progress-summary {
  margin-top: 20px;
}

.summary-card {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.summary-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
}

.summary-percent {
  font-size: 20px;
  font-weight: bold;
  color: #fff;
}

.summary-label {
  font-size: 10px;
  color: rgba(255,255,255,0.8);
}

.summary-stats {
  flex: 1;
  display: flex;
  justify-content: space-around;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  display: block;
}

.stat-label {
  font-size: 12px;
  color: #999;
}
</style>
