// src/stores/learningPathStore.js
// V43 Personalized Learning Path Store
// 个性化学习路径状态管理

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useBabyStore } from './babyStore.js'
import {
  createAssessment,
  generateLearningPath,
  getLearningPath,
  getAssessmentHistory,
  updateCourseProgress,
  updateGoalProgress,
  getLearningStats,
  generateAdaptiveExercises,
  createBreakthroughPlan,
  generateMockAssessment,
  initDemoLearningPath,
  ABILITY_DIMENSIONS,
  DIMENSION_CONFIG,
  GOAL_TYPES,
  COURSE_STATUS,
  DIFFICULTY_LEVELS
} from '@/services/learningPathService.js'

export const useLearningPathStore = defineStore('learningPath', () => {
  // ==================== 状态 ====================
  
  // 当前评估结果
  const currentAssessment = ref(null)
  
  // 当前学习路径
  const currentPath = ref(null)
  
  // 评估历史
  const assessmentHistory = ref([])
  
  // 学习统计
  const learningStats = ref(null)
  
  // 课程进度
  const courseProgress = ref({})
  
  // 目标进度
  const goalProgress = ref({})
  
  // 是否正在加载
  const isLoading = ref(false)
  
  // 错误信息
  const errorMessage = ref('')
  
  // 突破计划
  const breakthroughPlan = ref(null)
  
  // 自适应练习
  const adaptiveExercises = ref([])
  
  // ==================== 计算属性 ====================
  
  // 获取宝宝Store
  const babyStore = useBabyStore()
  
  // 当前宝宝ID
  const currentBabyId = computed(() => babyStore.currentBabyId)
  
  // 是否有学习路径
  const hasLearningPath = computed(() => currentPath.value !== null)
  
  // 进行中的课程
  const inProgressCourses = computed(() => {
    if (!currentPath.value) return []
    return currentPath.value.recommendedCourses.filter(
      c => c.status === COURSE_STATUS.IN_PROGRESS
    )
  })
  
  // 已完成的课程
  const completedCourses = computed(() => {
    if (!currentPath.value) return []
    return currentPath.value.recommendedCourses.filter(
      c => c.status === COURSE_STATUS.COMPLETED
    )
  })
  
  // 短期目标
  const shortTermGoals = computed(() => {
    if (!currentPath.value) return []
    return currentPath.value.goals.filter(g => g.type === GOAL_TYPES.SHORT_TERM)
  })
  
  // 中期目标
  const mediumTermGoals = computed(() => {
    if (!currentPath.value) return []
    return currentPath.value.goals.filter(g => g.type === GOAL_TYPES.MEDIUM_TERM)
  })
  
  // 长期目标
  const longTermGoals = computed(() => {
    if (!currentPath.value) return []
    return currentPath.value.goals.filter(g => g.type === GOAL_TYPES.LONG_TERM)
  })
  
  // 总体进度
  const overallProgress = computed(() => {
    if (!learningStats.value) return 0
    return learningStats.value.overallProgress
  })
  
  // 各维度进度
  const dimensionProgress = computed(() => {
    if (!learningStats.value) return {}
    return learningStats.value.dimensionProgress
  })
  
  // 薄弱维度
  const weakDimensions = computed(() => {
    if (!currentPath.value) return []
    return currentPath.value.weakAreas || []
  })
  
  // 强项维度
  const strongDimensions = computed(() => {
    if (!currentPath.value) return []
    return currentPath.value.strongAreas || []
  })
  
  // ==================== 方法 ====================
  
  /**
   * 初始化学习路径
   */
  const init = () => {
    if (!currentBabyId.value) return
    
    loadLearningPath(currentBabyId.value)
    loadAssessmentHistory(currentBabyId.value)
    loadLearningStats(currentBabyId.value)
  }
  
  /**
   * 加载学习路径
   */
  const loadLearningPath = (babyId) => {
    const path = getLearningPath(babyId)
    currentPath.value = path
  }
  
  /**
   * 加载评估历史
   */
  const loadAssessmentHistory = (babyId) => {
    assessmentHistory.value = getAssessmentHistory(babyId)
  }
  
  /**
   * 加载学习统计
   */
  const loadLearningStats = (babyId) => {
    learningStats.value = getLearningStats(babyId)
  }
  
  /**
   * 执行能力评估
   * @param {Array} scores - 能力得分 [{dimension, score}]
   */
  const doAssessment = (scores) => {
    if (!currentBabyId.value) {
      errorMessage.value = '请先选择宝宝'
      return null
    }
    
    isLoading.value = true
    errorMessage.value = ''
    
    try {
      // 创建评估
      const assessment = createAssessment(currentBabyId.value, scores)
      currentAssessment.value = assessment
      
      // 生成学习路径
      const path = generateLearningPath(assessment)
      currentPath.value = path
      
      // 更新统计
      loadLearningStats(currentBabyId.value)
      
      return path
    } catch (e) {
      errorMessage.value = e.message
      return null
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * 初始化演示学习路径
   */
  const initDemo = () => {
    if (!currentBabyId.value) {
      errorMessage.value = '请先选择宝宝'
      return null
    }
    
    isLoading.value = true
    errorMessage.value = ''
    
    try {
      const path = initDemoLearningPath(currentBabyId.value)
      currentPath.value = path
      currentAssessment.value = path.assessment
      
      loadLearningStats(currentBabyId.value)
      
      return path
    } catch (e) {
      errorMessage.value = e.message
      return null
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * 更新课程进度
   * @param {string} courseId
   * @param {number} progress
   */
  const updateCourse = (courseId, progress) => {
    if (!currentBabyId.value) return false
    
    const success = updateCourseProgress(courseId, currentBabyId.value, progress)
    
    if (success) {
      // 更新本地状态
      const course = currentPath.value?.recommendedCourses.find(c => c.id === courseId)
      if (course) {
        course.progress = progress
        if (progress >= 100) {
          course.status = COURSE_STATUS.COMPLETED
        } else if (progress > 0) {
          course.status = COURSE_STATUS.IN_PROGRESS
        }
      }
      
      // 刷新统计
      loadLearningStats(currentBabyId.value)
    }
    
    return success
  }
  
  /**
   * 开始课程
   * @param {string} courseId
   */
  const startCourse = (courseId) => {
    const course = currentPath.value?.recommendedCourses.find(c => c.id === courseId)
    if (course && course.status === COURSE_STATUS.NOT_STARTED) {
      course.status = COURSE_STATUS.IN_PROGRESS
      updateCourse(courseId, 0)
    }
  }
  
  /**
   * 完成课程内容
   * @param {string} courseId
   * @param {string} contentId
   */
  const completeContent = (courseId, contentId) => {
    const course = currentPath.value?.recommendedCourses.find(c => c.id === courseId)
    if (!course) return
    
    const content = course.contents.find(c => c.id === contentId)
    if (content) {
      content.completed = true
    }
    
    // 计算进度
    const completedCount = course.contents.filter(c => c.completed).length
    const progress = Math.round((completedCount / course.contents.length) * 100)
    
    updateCourse(courseId, progress)
  }
  
  /**
   * 更新目标进度
   * @param {string} goalId
   * @param {number} currentScore
   */
  const updateGoal = (goalId, currentScore) => {
    if (!currentBabyId.value) return null
    
    const goal = updateGoalProgress(goalId, currentBabyId.value, currentScore)
    
    if (goal) {
      // 更新本地状态
      const localGoal = currentPath.value?.goals.find(g => g.id === goalId)
      if (localGoal) {
        localGoal.currentScore = goal.currentScore
        localGoal.completed = goal.completed
      }
      
      // 刷新统计
      loadLearningStats(currentBabyId.value)
    }
    
    return goal
  }
  
  /**
   * 获取维度进度
   * @param {string} dimension
   * @returns {number}
   */
  const getDimensionProgress = (dimension) => {
    return dimensionProgress.value[dimension] || 0
  }
  
  /**
   * 获取维度配置
   * @param {string} dimension
   */
  const getDimensionConfig = (dimension) => {
    return DIMENSION_CONFIG[dimension] || null
  }
  
  /**
   * 获取雷达图数据
   */
  const getRadarData = () => {
    if (!currentAssessment.value) return []
    return currentAssessment.value.radarData || []
  }
  
  /**
   * 启动突破计划
   * @param {string} dimension
   */
  const startBreakthrough = (dimension) => {
    if (!currentBabyId.value) return null
    
    const plan = createBreakthroughPlan(currentBabyId.value, dimension)
    breakthroughPlan.value = plan
    
    // 生成练习
    adaptiveExercises.value = plan?.exercises || []
    
    return plan
  }
  
  /**
   * 生成自适应练习
   * @param {string} dimension
   * @param {number} difficulty
   */
  const generateExercises = (dimension, difficulty = 2) => {
    if (!currentBabyId.value) return []
    
    const exercises = generateAdaptiveExercises(dimension, difficulty, currentBabyId.value)
    adaptiveExercises.value = exercises
    return exercises
  }
  
  /**
   * 记录练习结果
   * @param {string} exerciseId
   * @param {boolean} correct
   */
  const recordExerciseResult = (exerciseId, correct) => {
    const exercise = adaptiveExercises.value.find(e => e.id === exerciseId)
    if (exercise) {
      exercise.userAnswer = correct
      exercise.completedAt = new Date().toISOString()
    }
  }
  
  /**
   * 切换宝宝时重新加载
   */
  const onBabyChange = (babyId) => {
    loadLearningPath(babyId)
    loadAssessmentHistory(babyId)
    loadLearningStats(babyId)
  }
  
  // ==================== 暴露 ====================
  
  return {
    // 状态
    currentAssessment,
    currentPath,
    assessmentHistory,
    learningStats,
    courseProgress,
    goalProgress,
    isLoading,
    errorMessage,
    breakthroughPlan,
    adaptiveExercises,
    
    // 计算属性
    currentBabyId,
    hasLearningPath,
    inProgressCourses,
    completedCourses,
    shortTermGoals,
    mediumTermGoals,
    longTermGoals,
    overallProgress,
    dimensionProgress,
    weakDimensions,
    strongDimensions,
    
    // 方法
    init,
    loadLearningPath,
    loadAssessmentHistory,
    loadLearningStats,
    doAssessment,
    initDemo,
    updateCourse,
    startCourse,
    completeContent,
    updateGoal,
    getDimensionProgress,
    getDimensionConfig,
    getRadarData,
    startBreakthrough,
    generateExercises,
    recordExerciseResult,
    onBabyChange
  }
})
