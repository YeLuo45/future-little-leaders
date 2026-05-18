<template>
  <view class="progress-page">
    <!-- 头部 -->
    <view class="header">
      <view class="header-content">
        <text class="page-title">学习进度</text>
        <text class="page-subtitle">追踪学习成果，持续进步</text>
      </view>
    </view>

    <!-- 无学习路径提示 -->
    <view class="empty-state" v-if="!store.hasLearningPath">
      <view class="empty-icon">📊</view>
      <text class="empty-title">暂无学习数据</text>
      <text class="empty-desc">完成能力评估后，即可追踪学习进度</text>
      <button class="start-btn" @tap="goToAssessment">开始评估</button>
    </view>

    <!-- 学习进度内容 -->
    <view class="content" v-else>
      <!-- 总体进度卡片 -->
      <view class="overall-card">
        <view class="overall-header">
          <text class="card-title">总体进度</text>
          <text class="overall-percent">{{ store.overallProgress }}%</text>
        </view>
        <view class="progress-bar">
          <view 
            class="progress-fill" 
            :style="{width: store.overallProgress + '%'}"
          ></view>
        </view>
        <view class="stats-row">
          <view class="stat-item">
            <text class="stat-num">{{ store.learningStats?.completedCourses || 0 }}</text>
            <text class="stat-label">已完成</text>
          </view>
          <view class="stat-item">
            <text class="stat-num">{{ store.learningStats?.inProgressCourses || 0 }}</text>
            <text class="stat-label">进行中</text>
          </view>
          <view class="stat-item">
            <text class="stat-num">{{ store.learningStats?.totalGoals || 0 }}</text>
            <text class="stat-label">目标数</text>
          </view>
          <view class="stat-item">
            <text class="stat-num">{{ store.learningStats?.goalsCompleted || 0 }}</text>
            <text class="stat-label">已达成</text>
          </view>
        </view>
      </view>

      <!-- 各维度进度 -->
      <view class="section">
        <view class="section-header">
          <text class="section-title">各维度进度</text>
        </view>
        <view class="dimension-progress">
          <view 
            v-for="(progress, dim) in store.dimensionProgress" 
            :key="dim"
            class="dimension-item"
          >
            <view class="dim-header">
              <view class="dim-info">
                <text 
                  class="dim-emoji"
                  :style="{backgroundColor: getDimensionColor(dim)}"
                >{{ getDimensionEmoji(dim) }}</text>
                <text class="dim-name">{{ getDimensionName(dim) }}</text>
              </view>
              <text class="dim-percent">{{ progress }}%</text>
            </view>
            <view class="dim-progress-bar">
              <view 
                class="dim-progress-fill"
                :style="{
                  width: progress + '%',
                  backgroundColor: getDimensionColor(dim)
                }"
              ></view>
            </view>
          </view>
        </view>
      </view>

      <!-- 课程列表 -->
      <view class="section">
        <view class="section-header">
          <text class="section-title">推荐课程</text>
          <view class="filter-tabs">
            <text 
              v-for="tab in courseTabs" 
              :key="tab.value"
              class="tab"
              :class="{active: currentCourseFilter === tab.value}"
              @tap="currentCourseFilter = tab.value"
            >{{ tab.label }}</text>
          </view>
        </view>
        
        <view class="course-list">
          <view 
            v-for="course in filteredCourses" 
            :key="course.id"
            class="course-item"
            @tap="openCourse(course)"
          >
            <view class="course-left">
              <view 
                class="course-icon"
                :style="{backgroundColor: getDimensionColor(course.dimension)}"
              >
                {{ getDimensionEmoji(course.dimension) }}
              </view>
              <view class="course-info">
                <text class="course-title">{{ course.title }}</text>
                <view class="course-meta">
                  <text class="meta-tag difficulty">难度: {{ course.difficulty }}</text>
                  <text class="meta-tag time">⏱ {{ course.estimatedMinutes }}分钟</text>
                </view>
              </view>
            </view>
            <view class="course-right">
              <view class="course-status" :class="course.status">
                {{ getCourseStatusText(course.status) }}
              </view>
              <view class="course-progress" v-if="course.progress > 0">
                {{ course.progress }}%
              </view>
            </view>
          </view>
          
          <view class="empty-list" v-if="filteredCourses.length === 0">
            <text>暂无{{ getCourseFilterLabel() }}课程</text>
          </view>
        </view>
      </view>

      <!-- 目标追踪 -->
      <view class="section">
        <view class="section-header">
          <text class="section-title">目标追踪</text>
        </view>
        
        <view class="goals-list">
          <view 
            v-for="goal in allGoals" 
            :key="goal.id"
            class="goal-item"
            :class="{completed: goal.completed}"
          >
            <view class="goal-header">
              <view class="goal-type-badge" :class="goal.type">
                {{ getGoalTypeLabel(goal.type) }}
              </view>
              <text class="goal-deadline" v-if="!goal.completed">
                {{ formatDeadline(goal.deadline) }}
              </text>
              <text class="goal-completed-tag" v-else>已达成</text>
            </view>
            <text class="goal-title">{{ goal.title }}</text>
            <text class="goal-desc">{{ goal.description }}</text>
            <view class="goal-progress">
              <view class="goal-progress-bar">
                <view 
                  class="goal-progress-fill"
                  :class="goal.type"
                  :style="{width: getGoalProgress(goal) + '%'}"
                ></view>
              </view>
              <text class="goal-progress-text">
                {{ goal.currentScore }} / {{ goal.targetScore }}分
              </text>
            </view>
          </view>
        </view>
      </view>

      <!-- 薄弱点突破 -->
      <view class="section" v-if="store.weakDimensions.length > 0">
        <view class="section-header">
          <text class="section-title highlight">薄弱点专项突破</text>
        </view>
        
        <view class="breakthrough-cards">
          <view 
            v-for="dim in store.weakDimensions" 
            :key="dim"
            class="breakthrough-card"
            :style="{borderColor: getDimensionColor(dim)}"
          >
            <view class="breakthrough-header">
              <text class="breakthrough-emoji">{{ getDimensionEmoji(dim) }}</text>
              <view class="breakthrough-info">
                <text class="breakthrough-name">{{ getDimensionName(dim) }}</text>
                <text class="breakthrough-level">当前等级: Lv.{{ getDimensionLevel(dim) }}</text>
              </view>
            </view>
            <view class="breakthrough-actions">
              <button class="breakthrough-btn" @tap="startBreakthrough(dim)">
                开始突破
              </button>
              <button class="practice-btn" @tap="startPractice(dim)">
                练习一下
              </button>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 课程详情弹窗 -->
    <view class="course-modal" v-if="showCourseModal" @tap="closeCourseModal">
      <view class="modal-content" @tap.stop>
        <view class="modal-header" v-if="selectedCourse">
          <view 
            class="modal-icon"
            :style="{backgroundColor: getDimensionColor(selectedCourse.dimension)}"
          >
            {{ getDimensionEmoji(selectedCourse.dimension) }}
          </view>
          <view class="modal-title-area">
            <text class="modal-title">{{ selectedCourse.title }}</text>
            <text class="modal-difficulty">难度: {{ selectedCourse.difficulty }}⭐</text>
          </view>
          <text class="modal-close" @tap="closeCourseModal">✕</text>
        </view>
        
        <view class="modal-body" v-if="selectedCourse">
          <text class="modal-desc">{{ selectedCourse.description }}</text>
          
          <view class="modal-contents">
            <text class="contents-title">课程内容</text>
            <view 
              v-for="(content, idx) in selectedCourse.contents" 
              :key="content.id"
              class="content-item"
              :class="{completed: content.completed}"
              @tap="completeContentItem(content)"
            >
              <view class="content-check">
                {{ content.completed ? '✓' : (idx + 1) }}
              </view>
              <text class="content-title">{{ content.title }}</text>
            </view>
          </view>
          
          <view class="modal-progress">
            <text class="progress-label">课程进度</text>
            <view class="progress-bar">
              <view 
                class="progress-fill"
                :style="{width: selectedCourse.progress + '%'}"
              ></view>
            </view>
            <text class="progress-text">{{ selectedCourse.progress }}%</text>
          </view>
        </view>
        
        <view class="modal-footer">
          <button class="modal-btn primary" @tap="continueCourse">
            {{ selectedCourse?.status === 'not_started' ? '开始学习' : '继续学习' }}
          </button>
        </view>
      </view>
    </view>

    <!-- 练习弹窗 -->
    <view class="exercise-modal" v-if="showExerciseModal" @tap="closeExerciseModal">
      <view class="modal-content exercise-content" @tap.stop>
        <view class="modal-header">
          <text class="modal-title">{{ practiceDimension ? getDimensionName(practiceDimension) : '' }}练习</text>
          <text class="modal-close" @tap="closeExerciseModal">✕</text>
        </view>
        
        <view class="exercise-body">
          <view class="exercise-progress">
            <text>第 {{ currentExerciseIndex + 1 }} / {{ exercises.length }} 题</text>
          </view>
          
          <view class="exercise-question" v-if="currentExercise">
            <text class="question-text">{{ currentExercise.title }}</text>
            
            <view class="exercise-options" v-if="currentExercise.options">
              <view 
                v-for="(option, idx) in currentExercise.options" 
                :key="idx"
                class="exercise-option"
                :class="{
                  selected: selectedExerciseAnswer === idx,
                  correct: showExerciseResult && idx === currentExercise.correctAnswer,
                  wrong: showExerciseResult && selectedExerciseAnswer === idx && idx !== currentExercise.correctAnswer
                }"
                @tap="selectExerciseAnswer(idx)"
              >
                {{ String.fromCharCode(65 + idx) }}. {{ option }}
              </view>
            </view>
            
            <view class="exercise-result" v-if="showExerciseResult">
              <text v-if="isExerciseCorrect" class="result-correct">✅ 回答正确!</text>
              <text v-else class="result-wrong">❌ 回答错误</text>
            </view>
          </view>
        </view>
        
        <view class="exercise-footer">
          <button 
            class="modal-btn" 
            v-if="!showExerciseResult"
            :disabled="selectedExerciseAnswer === null"
            @tap="submitExerciseAnswer"
          >
            提交答案
          </button>
          <button 
            class="modal-btn primary" 
            v-else
            @tap="nextExercise"
          >
            {{ currentExerciseIndex < exercises.length - 1 ? '下一题' : '完成练习' }}
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { useLearningPathStore } from '@/stores/learningPathStore.js'
import { DIMENSION_CONFIG, COURSE_STATUS } from '@/services/learningPathService.js'

export default {
  data() {
    return {
      currentCourseFilter: 'all',
      showCourseModal: false,
      showExerciseModal: false,
      selectedCourse: null,
      exercises: [],
      currentExerciseIndex: 0,
      selectedExerciseAnswer: null,
      showExerciseResult: false,
      practiceDimension: null
    }
  },
  
  onLoad(options) {
    this.store = useLearningPathStore()
    this.store.init()
    
    if (options.courseId) {
      const course = this.store.currentPath?.recommendedCourses.find(c => c.id === options.courseId)
      if (course) {
        this.selectedCourse = course
        this.showCourseModal = true
      }
    }
  },
  
  computed: {
    courseTabs() {
      return [
        { label: '全部', value: 'all' },
        { label: '进行中', value: 'in_progress' },
        { label: '已完成', value: 'completed' },
        { label: '未开始', value: 'not_started' }
      ]
    },
    
    filteredCourses() {
      if (!this.store.currentPath?.recommendedCourses) return []
      
      if (this.currentCourseFilter === 'all') {
        return this.store.currentPath.recommendedCourses
      }
      
      return this.store.currentPath.recommendedCourses.filter(
        c => c.status === this.currentCourseFilter
      )
    },
    
    allGoals() {
      if (!this.store.currentPath?.goals) return []
      return [
        ...this.store.currentPath.goals.filter(g => g.type === 'short_term'),
        ...this.store.currentPath.goals.filter(g => g.type === 'medium_term'),
        ...this.store.currentPath.goals.filter(g => g.type === 'long_term')
      ]
    },
    
    currentExercise() {
      return this.exercises[this.currentExerciseIndex] || null
    },
    
    isExerciseCorrect() {
      if (!this.currentExercise || this.selectedExerciseAnswer === null) return false
      return this.selectedExerciseAnswer === this.currentExercise.correctAnswer
    }
  },
  
  methods: {
    getDimensionColor(dim) {
      return DIMENSION_CONFIG[dim]?.color || '#999'
    },
    
    getDimensionName(dim) {
      return DIMENSION_CONFIG[dim]?.name || dim
    },
    
    getDimensionEmoji(dim) {
      return DIMENSION_CONFIG[dim]?.emoji || '📚'
    },
    
    getDimensionLevel(dim) {
      const assessment = this.store.currentAssessment
      if (!assessment) return 1
      const score = assessment.scores.find(s => s.dimension === dim)
      return score?.level || 1
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
    
    getCourseFilterLabel() {
      const map = {
        all: '',
        in_progress: '进行中',
        completed: '已完成',
        not_started: '未开始'
      }
      return map[this.currentCourseFilter] || ''
    },
    
    getGoalTypeLabel(type) {
      const map = {
        short_term: '短期',
        medium_term: '中期',
        long_term: '长期'
      }
      return map[type] || type
    },
    
    formatDeadline(deadline) {
      if (!deadline) return ''
      const date = new Date(deadline)
      const now = new Date()
      const diff = date - now
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
      
      if (days < 0) return '已过期'
      if (days === 0) return '今天'
      if (days === 1) return '明天'
      return `${days}天后`
    },
    
    getGoalProgress(goal) {
      if (!goal.targetScore) return 0
      return Math.round((goal.currentScore / goal.targetScore) * 100)
    },
    
    goToAssessment() {
      uni.navigateTo({
        url: '/pages/learning-path/assessment'
      })
    },
    
    openCourse(course) {
      this.selectedCourse = course
      this.showCourseModal = true
    },
    
    closeCourseModal() {
      this.showCourseModal = false
      this.selectedCourse = null
    },
    
    completeContentItem(content) {
      if (content.completed) return
      if (!this.selectedCourse) return
      
      this.store.completeContent(this.selectedCourse.id, content.id)
      
      // 更新本地状态
      const course = this.store.currentPath?.recommendedCourses.find(
        c => c.id === this.selectedCourse.id
      )
      if (course) {
        this.selectedCourse = course
      }
    },
    
    continueCourse() {
      if (!this.selectedCourse) return
      
      if (this.selectedCourse.status === 'not_started') {
        this.store.startCourse(this.selectedCourse.id)
      }
      
      // 跳转到练习或内容学习
      uni.navigateTo({
        url: `/pages/learning-path/assessment?dimension=${this.selectedCourse.dimension}&mode=breakthrough`
      })
      
      this.closeCourseModal()
    },
    
    startBreakthrough(dimension) {
      this.practiceDimension = dimension
      this.exercises = this.store.generateExercises(dimension, 2)
      this.currentExerciseIndex = 0
      this.selectedExerciseAnswer = null
      this.showExerciseResult = false
      this.showExerciseModal = true
    },
    
    startPractice(dimension) {
      this.practiceDimension = dimension
      this.exercises = this.store.generateExercises(dimension, 1)
      this.currentExerciseIndex = 0
      this.selectedExerciseAnswer = null
      this.showExerciseResult = false
      this.showExerciseModal = true
    },
    
    closeExerciseModal() {
      this.showExerciseModal = false
      this.exercises = []
      this.currentExerciseIndex = 0
      this.selectedExerciseAnswer = null
      this.showExerciseResult = false
    },
    
    selectExerciseAnswer(idx) {
      if (this.showExerciseResult) return
      this.selectedExerciseAnswer = idx
    },
    
    submitExerciseAnswer() {
      if (this.selectedExerciseAnswer === null) return
      this.showExerciseResult = true
      
      // 记录结果
      this.store.recordExerciseResult(this.currentExercise.id, this.isExerciseCorrect)
    },
    
    nextExercise() {
      if (this.currentExerciseIndex < this.exercises.length - 1) {
        this.currentExerciseIndex++
        this.selectedExerciseAnswer = null
        this.showExerciseResult = false
      } else {
        // 完成练习
        this.closeExerciseModal()
        uni.showToast({
          title: '练习完成!',
          icon: 'success'
        })
      }
    }
  }
}
</script>

<style scoped>
.progress-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 40px;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60px 20px 30px;
  color: #fff;
}

.page-title {
  font-size: 24px;
  font-weight: bold;
  display: block;
}

.page-subtitle {
  font-size: 14px;
  opacity: 0.8;
  display: block;
  margin-top: 4px;
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

.overall-card {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.overall-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.card-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.overall-percent {
  font-size: 28px;
  font-weight: bold;
  color: #667eea;
}

.progress-bar {
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 20px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s;
}

.stats-row {
  display: flex;
  justify-content: space-between;
}

.stat-item {
  text-align: center;
}

.stat-num {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  display: block;
}

.stat-label {
  font-size: 12px;
  color: #999;
}

.section {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.section-title.highlight {
  color: #ff6b6b;
}

.filter-tabs {
  display: flex;
  gap: 8px;
}

.tab {
  padding: 4px 12px;
  font-size: 12px;
  color: #666;
  background: #f5f5f5;
  border-radius: 12px;
}

.tab.active {
  background: #667eea;
  color: #fff;
}

.dimension-progress {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.dimension-item {
  margin-bottom: 8px;
}

.dim-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.dim-info {
  display: flex;
  align-items: center;
}

.dim-emoji {
  width: 28px;
  height: 28px;
  line-height: 28px;
  text-align: center;
  border-radius: 8px;
  font-size: 14px;
  margin-right: 10px;
}

.dim-name {
  font-size: 14px;
  color: #333;
}

.dim-percent {
  font-size: 14px;
  font-weight: bold;
  color: #333;
}

.dim-progress-bar {
  height: 6px;
  background: #e0e0e0;
  border-radius: 3px;
  overflow: hidden;
}

.dim-progress-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s;
}

.course-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.course-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 12px;
}

.course-left {
  display: flex;
  align-items: center;
}

.course-icon {
  width: 44px;
  height: 44px;
  line-height: 44px;
  text-align: center;
  border-radius: 12px;
  font-size: 20px;
  margin-right: 12px;
}

.course-info {
  display: flex;
  flex-direction: column;
}

.course-title {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
}

.course-meta {
  display: flex;
  gap: 8px;
}

.meta-tag {
  font-size: 11px;
  color: #999;
}

.course-right {
  text-align: right;
}

.course-status {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 8px;
  background: #f0f0f0;
  color: #666;
  display: inline-block;
}

.course-status.in_progress {
  background: #e6f7ff;
  color: #1890ff;
}

.course-status.completed {
  background: #f6ffed;
  color: #52c41a;
}

.course-progress {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.empty-list {
  text-align: center;
  padding: 30px;
  color: #999;
  font-size: 14px;
}

.goals-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.goal-item {
  padding: 16px;
  background: #f9f9f9;
  border-radius: 12px;
}

.goal-item.completed {
  opacity: 0.6;
}

.goal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.goal-type-badge {
  padding: 2px 8px;
  border-radius: 8px;
  font-size: 11px;
  color: #fff;
}

.goal-type-badge.short_term {
  background: #667eea;
}

.goal-type-badge.medium_term {
  background: #f093fb;
}

.goal-type-badge.long_term {
  background: #4facfe;
}

.goal-deadline {
  font-size: 12px;
  color: #999;
}

.goal-completed-tag {
  font-size: 12px;
  color: #52c41a;
}

.goal-title {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 4px;
}

.goal-desc {
  font-size: 12px;
  color: #999;
  display: block;
  margin-bottom: 12px;
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
  border-radius: 3px;
  transition: width 0.3s;
}

.goal-progress-fill.short_term {
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
}

.goal-progress-fill.medium_term {
  background: linear-gradient(90deg, #f093fb 0%, #f5576c 100%);
}

.goal-progress-fill.long_term {
  background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
}

.goal-progress-text {
  font-size: 11px;
  color: #999;
}

.breakthrough-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.breakthrough-card {
  padding: 16px;
  background: #fff;
  border-radius: 12px;
  border-left: 4px solid;
}

.breakthrough-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.breakthrough-emoji {
  font-size: 28px;
  margin-right: 12px;
}

.breakthrough-info {
  flex: 1;
}

.breakthrough-name {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 2px;
}

.breakthrough-level {
  font-size: 12px;
  color: #999;
}

.breakthrough-actions {
  display: flex;
  gap: 12px;
}

.breakthrough-btn {
  flex: 1;
  height: 36px;
  line-height: 36px;
  background: #ff6b6b;
  color: #fff;
  border-radius: 18px;
  font-size: 14px;
  border: none;
}

.practice-btn {
  flex: 1;
  height: 36px;
  line-height: 36px;
  background: #fff;
  color: #667eea;
  border-radius: 18px;
  font-size: 14px;
  border: 1px solid #667eea;
}

/* Modal Styles */
.course-modal,
.exercise-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
}

.modal-content {
  width: 100%;
  max-height: 80vh;
  background: #fff;
  border-radius: 24px 24px 0 0;
  overflow: hidden;
}

.exercise-content {
  max-height: 90vh;
}

.modal-header {
  display: flex;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.modal-icon {
  width: 48px;
  height: 48px;
  line-height: 48px;
  text-align: center;
  border-radius: 12px;
  font-size: 24px;
  margin-right: 12px;
}

.modal-title-area {
  flex: 1;
}

.modal-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.modal-difficulty {
  font-size: 12px;
  color: #999;
}

.modal-close {
  font-size: 20px;
  color: #999;
  padding: 8px;
}

.modal-body {
  padding: 20px;
  max-height: 50vh;
  overflow-y: auto;
}

.modal-desc {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  display: block;
  margin-bottom: 20px;
}

.modal-contents {
  margin-bottom: 20px;
}

.contents-title {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 12px;
}

.content-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 8px;
  margin-bottom: 8px;
}

.content-item.completed {
  opacity: 0.5;
}

.content-check {
  width: 24px;
  height: 24px;
  line-height: 24px;
  text-align: center;
  background: #e0e0e0;
  border-radius: 50%;
  font-size: 12px;
  margin-right: 12px;
}

.content-item.completed .content-check {
  background: #52c41a;
  color: #fff;
}

.content-title {
  font-size: 14px;
  color: #333;
}

.modal-progress {
  display: flex;
  align-items: center;
  gap: 12px;
}

.progress-label {
  font-size: 14px;
  color: #333;
}

.modal-progress .progress-bar {
  flex: 1;
  margin-bottom: 0;
}

.progress-text {
  font-size: 14px;
  color: #667eea;
}

.modal-footer {
  padding: 20px;
  border-top: 1px solid #f0f0f0;
}

.modal-btn {
  width: 100%;
  height: 48px;
  line-height: 48px;
  background: #f5f5f5;
  color: #666;
  border-radius: 24px;
  font-size: 16px;
  border: none;
}

.modal-btn.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.modal-btn[disabled] {
  opacity: 0.5;
}

/* Exercise Modal Styles */
.exercise-body {
  padding: 20px;
}

.exercise-progress {
  text-align: center;
  font-size: 14px;
  color: #999;
  margin-bottom: 20px;
}

.exercise-question {
  margin-bottom: 20px;
}

.question-text {
  font-size: 18px;
  color: #333;
  line-height: 1.6;
  display: block;
  margin-bottom: 20px;
}

.exercise-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.exercise-option {
  padding: 16px;
  background: #f9f9f9;
  border-radius: 12px;
  font-size: 16px;
  color: #333;
  border: 2px solid transparent;
}

.exercise-option.selected {
  border-color: #667eea;
  background: #f0f0ff;
}

.exercise-option.correct {
  border-color: #52c41a;
  background: #f6ffed;
}

.exercise-option.wrong {
  border-color: #ff4d4f;
  background: #fff2f0;
}

.exercise-result {
  text-align: center;
  margin-top: 20px;
}

.result-correct {
  font-size: 16px;
  color: #52c41a;
}

.result-wrong {
  font-size: 16px;
  color: #ff4d4f;
}

.exercise-footer {
  padding: 20px;
  border-top: 1px solid #f0f0f0;
}
</style>
