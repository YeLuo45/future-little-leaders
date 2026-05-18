// src/services/learningPathService.js
// V43 Personalized Learning Path Engine
// AI驱动的个性化学习路径引擎

import { useBabyStore } from '@/stores/babyStore.js'
import { getDatabase, insert, update, query, remove } from '@/db/sqlite.js'

// ==================== 常量定义 ====================

// 能力维度
export const ABILITY_DIMENSIONS = {
  LANGUAGE: 'language',      // 语言
  MATH: 'math',              // 数学
  LOGIC: 'logic',            // 逻辑
  SOCIAL: 'social',          // 社交
  MOTOR: 'motor'             // 运动
}

// 能力维度配置
export const DIMENSION_CONFIG = {
  [ABILITY_DIMENSIONS.LANGUAGE]: {
    id: ABILITY_DIMENSIONS.LANGUAGE,
    name: '语言能力',
    emoji: '📝',
    description: '拼音、识字、阅读理解、写作表达',
    color: '#FF6B6B',
    icon: 'chat'
  },
  [ABILITY_DIMENSIONS.MATH]: {
    id: ABILITY_DIMENSIONS.MATH,
    name: '数学能力',
    emoji: '🔢',
    description: '计算、几何、逻辑推理、应用题',
    color: '#4ECDC4',
    icon: 'calculate'
  },
  [ABILITY_DIMENSIONS.LOGIC]: {
    id: ABILITY_DIMENSIONS.LOGIC,
    name: '逻辑思维',
    emoji: '🧩',
    description: '分析推理、问题解决、创造力',
    color: '#45B7D1',
    icon: 'lightbulb'
  },
  [ABILITY_DIMENSIONS.SOCIAL]: {
    id: ABILITY_DIMENSIONS.SOCIAL,
    name: '社交能力',
    emoji: '👥',
    description: '沟通合作、情绪管理、社会认知',
    color: '#96CEB4',
    icon: 'users'
  },
  [ABILITY_DIMENSIONS.MOTOR]: {
    id: ABILITY_DIMENSIONS.MOTOR,
    name: '运动能力',
    emoji: '🏃',
    description: '大运动、精细动作、身体协调',
    color: '#FFEAA7',
    icon: 'activity'
  }
}

// 评估题目类型
export const ASSESSMENT_TYPES = {
  QUIZ: 'quiz',              // 选择题
  COMPLETION: 'completion', // 填空题
  PRACTICAL: 'practical'    // 实践题
}

// 目标类型
export const GOAL_TYPES = {
  SHORT_TERM: 'short_term',   // 短期目标 (1周)
  MEDIUM_TERM: 'medium_term', // 中期目标 (1月)
  LONG_TERM: 'long_term'      // 长期目标 (3月+)
}

// 课程状态
export const COURSE_STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  SKIPPED: 'skipped'
}

// 难度级别
export const DIFFICULTY_LEVELS = {
  EASY: 1,
  MEDIUM: 2,
  HARD: 3,
  EXPERT: 4
}

// ==================== 类型定义 ====================

/**
 * @typedef {Object} AbilityScore
 * @property {string} dimension - 能力维度
 * @property {number} score - 得分 0-100
 * @property {number} level - 等级 1-5
 * @property {string} lastUpdated - 最后更新时间
 */

/**
 * @typedef {Object} AssessmentResult
 * @property {string} id
 * @property {string} babyId
 * @property {AbilityScore[]} scores
 * @property {Object} radarData
 * @property {string} overallLevel
 * @property {string} completedAt
 * @property {string} createdAt
 */

/**
 * @typedef {Object} LearningGoal
 * @property {string} id
 * @property {string} babyId
 * @property {string} type - short_term|medium_term|long_term
 * @property {string} title
 * @property {string} description
 * @property {string[]} dimensionIds
 * @property {number} targetScore
 * @property {number} currentScore
 * @property {string} deadline
 * @property {boolean} completed
 * @property {string} createdAt
 */

/**
 * @typedef {Object} Course
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {string} dimension
 * @property {number} difficulty
 * @property {number} estimatedMinutes
 * @property {string[]} tags
 * @property {string[]} prerequisites
 * @property {number} progress
 * @property {string} status
 * @property {string[]} contents
 */

/**
 * @typedef {Object} LearningPath
 * @property {string} id
 * @property {string} babyId
 * @property {AssessmentResult} assessment
 * @property {LearningGoal[]} goals
 * @property {Course[]} recommendedCourses
 * @property {Object} weakAreas
 * @property {Object} strongAreas
 * @property {string} createdAt
 * @property {string} updatedAt
 */

// ==================== 辅助函数 ====================

/**
 * 生成唯一ID
 */
function generateId() {
  return 'lp_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
}

/**
 * 获取当前时间戳
 */
function now() {
  return new Date().toISOString()
}

/**
 * 计算雷达图数据
 */
function calculateRadarData(scores) {
  const dimensions = Object.values(ABILITY_DIMENSIONS)
  const data = []
  
  for (const dim of dimensions) {
    const score = scores.find(s => s.dimension === dim)
    data.push({
      dimension: dim,
      score: score?.score || 0,
      level: score?.level || 1,
      maxScore: 100
    })
  }
  
  return data
}

/**
 * 根据分数计算等级 (1-5)
 */
function calculateLevel(score) {
  if (score >= 90) return 5
  if (score >= 75) return 4
  if (score >= 60) return 3
  if (score >= 40) return 2
  return 1
}

/**
 * 确定总体等级
 */
function determineOverallLevel(scores) {
  if (scores.length === 0) return 'beginner'
  
  const avgScore = scores.reduce((sum, s) => sum + s.score, 0) / scores.length
  
  if (avgScore >= 85) return 'advanced'
  if (avgScore >= 70) return 'intermediate'
  if (avgScore >= 50) return 'beginner'
  return 'starter'
}

/**
 * 分析薄弱点和强项
 */
function analyzeStrengthsWeaknesses(scores) {
  const sorted = [...scores].sort((a, b) => b.score - a.score)
  const avgScore = scores.reduce((sum, s) => sum + s.score, 0) / scores.length
  
  const strongAreas = sorted
    .filter(s => s.score > avgScore + 10)
    .map(s => s.dimension)
  
  const weakAreas = sorted
    .filter(s => s.score < avgScore - 10)
    .map(s => s.dimension)
  
  return { strongAreas, weakAreas }
}

/**
 * 生成推荐课程
 */
function generateRecommendedCourses(assessment, weakAreas) {
  const courses = []
  const dimensionConfig = DIMENSION_CONFIG
  
  // 基于薄弱点生成针对性课程
  for (const dim of weakAreas) {
    const config = dimensionConfig[dim]
    if (!config) continue
    
    // 生成3-5个课程
    const courseCount = Math.min(5, Math.max(3, Math.floor(100 - (assessment.scores.find(s => s.dimension === dim)?.score || 50)) / 20))
    
    for (let i = 0; i < courseCount; i++) {
      const difficulty = Math.min(4, Math.max(1, Math.floor((assessment.scores.find(s => s.dimension === dim)?.level || 1) + i * 0.5)))
      courses.push({
        id: generateId(),
        title: `${config.name} - 进阶${i + 1}`,
        description: `针对${config.name}的专项训练`,
        dimension: dim,
        difficulty,
        estimatedMinutes: 15 + difficulty * 10,
        tags: [dim, `level_${difficulty}`],
        prerequisites: [],
        progress: 0,
        status: COURSE_STATUS.NOT_STARTED,
        contents: generateCourseContents(dim, difficulty)
      })
    }
  }
  
  // 也包含一些强项的提升课程
  for (const dim of assessment.scores.filter(s => s.score >= 75).map(s => s.dimension)) {
    const config = dimensionConfig[dim]
    if (!config) continue
    
    courses.push({
      id: generateId(),
      title: `${config.name} - 拓展挑战`,
      description: `提升${config.name}的挑战内容`,
      dimension: dim,
      difficulty: DIFFICULTY_LEVELS.HARD,
      estimatedMinutes: 20,
      tags: [dim, 'challenge'],
      prerequisites: [],
      progress: 0,
      status: COURSE_STATUS.NOT_STARTED,
      contents: generateCourseContents(dim, DIFFICULTY_LEVELS.HARD)
    })
  }
  
  return courses
}

/**
 * 生成课程内容
 */
function generateCourseContents(dimension, difficulty) {
  const contents = []
  const baseCount = 3 + difficulty
  
  for (let i = 0; i < baseCount; i++) {
    contents.push({
      id: generateId(),
      title: `第${i + 1}课`,
      type: ASSESSMENT_TYPES.QUIZ,
      completed: false,
      bestScore: null
    })
  }
  
  return contents
}

/**
 * 生成学习目标
 */
function generateLearningGoals(assessment, babyId) {
  const goals = []
  const nowDate = new Date()
  
  // 短期目标 (1周)
  const shortDeadline = new Date(nowDate)
  shortDeadline.setDate(shortDeadline.getDate() + 7)
  
  for (const dim of assessment.weakAreas.slice(0, 2)) {
    const score = assessment.scores.find(s => s.dimension === dim)?.score || 50
    goals.push({
      id: generateId(),
      babyId,
      type: GOAL_TYPES.SHORT_TERM,
      title: `提升${DIMENSION_CONFIG[dim].name}`,
      description: `在1周内将${DIMENSION_CONFIG[dim].name}提升${Math.min(15, Math.max(5, 60 - score))}分`,
      dimensionIds: [dim],
      targetScore: Math.min(100, score + 15),
      currentScore: score,
      deadline: shortDeadline.toISOString(),
      completed: false,
      createdAt: now()
    })
  }
  
  // 中期目标 (1月)
  const mediumDeadline = new Date(nowDate)
  mediumDeadline.setMonth(mediumDeadline.getMonth() + 1)
  
  for (const dim of assessment.weakAreas.slice(0, 3)) {
    const score = assessment.scores.find(s => s.dimension === dim)?.score || 50
    goals.push({
      id: generateId(),
      babyId,
      type: GOAL_TYPES.MEDIUM_TERM,
      title: `巩固${DIMENSION_CONFIG[dim].name}`,
      description: `在1月内将${DIMENSION_CONFIG[dim].name}提升至良好水平`,
      dimensionIds: [dim],
      targetScore: Math.min(100, score + 25),
      currentScore: score,
      deadline: mediumDeadline.toISOString(),
      completed: false,
      createdAt: now()
    })
  }
  
  // 长期目标 (3月)
  const longDeadline = new Date(nowDate)
  longDeadline.setMonth(longDeadline.getMonth() + 3)
  
  goals.push({
    id: generateId(),
    babyId,
    type: GOAL_TYPES.LONG_TERM,
    title: '全面发展',
    description: '在3月内实现五大能力维度的均衡发展',
    dimensionIds: Object.values(ABILITY_DIMENSIONS),
    targetScore: 75,
    currentScore: Math.round(assessment.scores.reduce((sum, s) => sum + s.score, 0) / assessment.scores.length),
    deadline: longDeadline.toISOString(),
    completed: false,
    createdAt: now()
  })
  
  return goals
}

// ==================== 数据库操作 ====================

const TABLES = {
  LEARNING_PATHS: 'learning_paths',
  ASSESSMENTS: 'assessments',
  LEARNING_GOALS: 'learning_goals',
  COURSE_PROGRESS: 'course_progress'
}

// ==================== 核心服务函数 ====================

/**
 * 创建能力评估
 * @param {string} babyId - 宝宝ID
 * @param {AbilityScore[]} scores - 能力得分
 * @returns {AssessmentResult}
 */
export function createAssessment(babyId, scores) {
  const babyStore = useBabyStore()
  
  // 计算等级
  const scoredWithLevels = scores.map(s => ({
    ...s,
    level: calculateLevel(s.score),
    lastUpdated: now()
  }))
  
  // 计算雷达图数据
  const radarData = calculateRadarData(scoredWithLevels)
  
  // 确定总体等级
  const overallLevel = determineOverallLevel(scoredWithLevels)
  
  // 分析强弱项
  const { strongAreas, weakAreas } = analyzeStrengthsWeaknesses(scoredWithLevels)
  
  const assessment = {
    id: generateId(),
    babyId,
    scores: scoredWithLevels,
    radarData,
    overallLevel,
    strongAreas,
    weakAreas,
    completedAt: now(),
    createdAt: now()
  }
  
  // 保存到数据库
  const db = getDatabase()
  if (db) {
    insert(TABLES.ASSESSMENTS, assessment)
  }
  
  return assessment
}

/**
 * 生成学习路径
 * @param {AssessmentResult} assessment - 评估结果
 * @returns {LearningPath}
 */
export function generateLearningPath(assessment) {
  // 生成推荐课程
  const recommendedCourses = generateRecommendedCourses(assessment, assessment.weakAreas)
  
  // 生成学习目标
  const goals = generateLearningGoals(assessment, assessment.babyId)
  
  const learningPath = {
    id: generateId(),
    babyId: assessment.babyId,
    assessment,
    goals,
    recommendedCourses,
    weakAreas: assessment.weakAreas,
    strongAreas: assessment.strongAreas,
    createdAt: now(),
    updatedAt: now()
  }
  
  // 保存到数据库
  const db = getDatabase()
  if (db) {
    insert(TABLES.LEARNING_PATHS, learningPath)
  }
  
  return learningPath
}

/**
 * 获取宝宝的学习路径
 * @param {string} babyId
 * @returns {LearningPath|null}
 */
export function getLearningPath(babyId) {
  const db = getDatabase()
  if (!db) return null
  
  const result = db.exec(`
    SELECT * FROM ${TABLES.LEARNING_PATHS} 
    WHERE babyId = '${babyId}'
    ORDER BY createdAt DESC
    LIMIT 1
  `)
  
  if (result.length === 0 || result[0].values.length === 0) return null
  
  const row = result[0].values[0]
  const columns = result[0].columns
  
  return rowToObject(row, columns)
}

/**
 * 获取评估历史
 * @param {string} babyId
 * @returns {AssessmentResult[]}
 */
export function getAssessmentHistory(babyId) {
  const db = getDatabase()
  if (!db) return []
  
  const result = db.exec(`
    SELECT * FROM ${TABLES.ASSESSMENTS}
    WHERE babyId = '${babyId}'
    ORDER BY completedAt DESC
  `)
  
  if (result.length === 0) return []
  
  return result[0].values.map(row => rowToObject(row, result[0].columns))
}

/**
 * 更新课程进度
 * @param {string} courseId
 * @param {string} babyId
 * @param {number} progress
 * @returns {boolean}
 */
export function updateCourseProgress(courseId, babyId, progress) {
  const db = getDatabase()
  if (!db) return false
  
  const existing = db.exec(`
    SELECT * FROM ${TABLES.COURSE_PROGRESS}
    WHERE courseId = '${courseId}' AND babyId = '${babyId}'
  `)
  
  const data = {
    courseId,
    babyId,
    progress: Math.min(100, Math.max(0, progress)),
    updatedAt: now()
  }
  
  if (existing.length > 0 && existing[0].values.length > 0) {
    update(TABLES.COURSE_PROGRESS, courseId, data)
  } else {
    data.id = generateId()
    data.createdAt = now()
    insert(TABLES.COURSE_PROGRESS, data)
  }
  
  // 检查是否完成，触发难度调整
  if (progress >= 100) {
    onCourseCompleted(courseId, babyId)
  }
  
  return true
}

/**
 * 课程完成时调用 - 动态难度调整
 * @param {string} courseId
 * @param {string} babyId
 */
export function onCourseCompleted(courseId, babyId) {
  const path = getLearningPath(babyId)
  if (!path) return null
  
  const course = path.recommendedCourses.find(c => c.id === courseId)
  if (!course) return null
  
  // 检查该维度其他课程完成情况
  const dimensionCourses = path.recommendedCourses.filter(c => c.dimension === course.dimension)
  const completedCount = dimensionCourses.filter(c => c.status === COURSE_STATUS.COMPLETED).length
  const totalCount = dimensionCourses.length
  
  const completionRate = completedCount / totalCount
  
  // 动态调整后续课程难度
  let adjustedDifficulty = course.difficulty
  
  if (completionRate > 0.8) {
    // 完成率高 - 提升难度
    adjustedDifficulty = Math.min(DIFFICULTY_LEVELS.EXPERT, course.difficulty + 1)
  } else if (completionRate < 0.4) {
    // 完成率低 - 降低难度
    adjustedDifficulty = Math.max(DIFFICULTY_LEVELS.EASY, course.difficulty - 1)
  }
  
  // 更新课程状态
  course.status = COURSE_STATUS.COMPLETED
  course.progress = 100
  
  // 找到下一门推荐课程并调整难度
  const nextCourse = path.recommendedCourses.find(c => 
    c.dimension === course.dimension && 
    c.status === COURSE_STATUS.NOT_STARTED &&
    c.id !== courseId
  )
  
  if (nextCourse) {
    nextCourse.difficulty = adjustedDifficulty
  }
  
  // 保存更新
  const db = getDatabase()
  if (db) {
    update(TABLES.LEARNING_PATHS, path.id, {
      recommendedCourses: JSON.stringify(path.recommendedCourses),
      updatedAt: now()
    })
  }
  
  return {
    courseId,
    adjustedDifficulty,
    nextCourseId: nextCourse?.id
  }
}

/**
 * 更新目标进度
 * @param {string} goalId
 * @param {string} babyId
 * @param {number} currentScore
 * @returns {LearningGoal}
 */
export function updateGoalProgress(goalId, babyId, currentScore) {
  const path = getLearningPath(babyId)
  if (!path) return null
  
  const goal = path.goals.find(g => g.id === goalId)
  if (!goal) return null
  
  goal.currentScore = currentScore
  
  // 检查是否完成
  if (currentScore >= goal.targetScore) {
    goal.completed = true
  }
  
  // 保存更新
  const db = getDatabase()
  if (db) {
    update(TABLES.LEARNING_PATHS, path.id, {
      goals: JSON.stringify(path.goals),
      updatedAt: now()
    })
  }
  
  return goal
}

/**
 * 获取学习统计
 * @param {string} babyId
 * @returns {Object}
 */
export function getLearningStats(babyId) {
  const path = getLearningPath(babyId)
  const assessments = getAssessmentHistory(babyId)
  
  if (!path) {
    return {
      totalCourses: 0,
      completedCourses: 0,
      inProgressCourses: 0,
      overallProgress: 0,
      goalsCompleted: 0,
      totalGoals: 0,
      dimensionProgress: {}
    }
  }
  
  const completedCourses = path.recommendedCourses.filter(c => c.status === COURSE_STATUS.COMPLETED)
  const inProgressCourses = path.recommendedCourses.filter(c => c.status === COURSE_STATUS.IN_PROGRESS)
  
  // 计算各维度进度
  const dimensionProgress = {}
  for (const dim of Object.values(ABILITY_DIMENSIONS)) {
    const courses = path.recommendedCourses.filter(c => c.dimension === dim)
    if (courses.length === 0) {
      dimensionProgress[dim] = 0
    } else {
      const totalProgress = courses.reduce((sum, c) => sum + c.progress, 0)
      dimensionProgress[dim] = Math.round(totalProgress / courses.length)
    }
  }
  
  const goalsCompleted = path.goals.filter(g => g.completed).length
  
  return {
    totalCourses: path.recommendedCourses.length,
    completedCourses: completedCourses.length,
    inProgressCourses: inProgressCourses.length,
    overallProgress: path.recommendedCourses.length > 0
      ? Math.round(path.recommendedCourses.reduce((sum, c) => sum + c.progress, 0) / path.recommendedCourses.length)
      : 0,
    goalsCompleted,
    totalGoals: path.goals.length,
    dimensionProgress
  }
}

/**
 * 自适应练习题生成
 * @param {string} dimension - 能力维度
 * @param {number} difficulty - 当前难度
 * @param {string} babyId - 宝宝ID
 * @returns {Object[]} 练习题列表
 */
export function generateAdaptiveExercises(dimension, difficulty, babyId) {
  const path = getLearningPath(babyId)
  
  // 根据表现调整难度
  let adjustedDifficulty = difficulty
  
  if (path) {
    const dimCourses = path.recommendedCourses.filter(c => c.dimension === dimension)
    const recentPerformance = dimCourses.slice(0, 3).map(c => c.progress)
    
    if (recentPerformance.length > 0) {
      const avgPerformance = recentPerformance.reduce((a, b) => a + b, 0) / recentPerformance.length
      
      if (avgPerformance >= 90) {
        adjustedDifficulty = Math.min(DIFFICULTY_LEVELS.EXPERT, difficulty + 1)
      } else if (avgPerformance < 60) {
        adjustedDifficulty = Math.max(DIFFICULTY_LEVELS.EASY, difficulty - 1)
      }
    }
  }
  
  // 生成练习题
  const exercises = []
  const baseCount = 5 + adjustedDifficulty * 2
  
  for (let i = 0; i < baseCount; i++) {
    exercises.push({
      id: generateId(),
      dimension,
      difficulty: adjustedDifficulty,
      type: Math.random() > 0.3 ? ASSESSMENT_TYPES.QUIZ : ASSESSMENT_TYPES.COMPLETION,
      title: generateExerciseTitle(dimension, adjustedDifficulty, i),
      options: adjustedDifficulty <= 2 ? generateOptions(dimension, i) : null,
      correctAnswer: null, // 实际应从题库获取
      points: adjustedDifficulty * 10
    })
  }
  
  return exercises
}

/**
 * 生成练习题标题
 */
function generateExerciseTitle(dimension, difficulty, index) {
  const templates = {
    [ABILITY_DIMENSIONS.LANGUAGE]: [
      '请选择正确的拼音', '请填写正确的汉字', '请阅读短文并回答问题',
      '请用所给词语造句', '请找出句子中的主语'
    ],
    [ABILITY_DIMENSIONS.MATH]: [
      '计算: 3 + 5 = ?', '计算: 12 - 7 = ?', '找规律: 2, 4, 6, ?',
      '比大小: 8 ○ 6', '计算: 3 × 4 = ?'
    ],
    [ABILITY_DIMENSIONS.LOGIC]: [
      '找规律: 1, 1, 2, 3, 5, ?', '判断推理: 所有的狗都是动物，有些动物会跑，所以？',
      '排序: 从小到大排列以下数字', '图形找规律', '逻辑判断'
    ],
    [ABILITY_DIMENSIONS.SOCIAL]: [
      '情景选择: 遇到陌生人搭讪应该？', '理解他人情绪', '合作完成任务',
      '分享的好处是什么？', '如何礼貌地表达感谢？'
    ],
    [ABILITY_DIMENSIONS.MOTOR]: [
      '精细动作: 折纸练习', '大运动: 跳跃练习', '协调性: 双手配合',
      '平衡练习', '手眼协调游戏'
    ]
  }
  
  const dimTemplates = templates[dimension] || templates[ABILITY_DIMENSIONS.LANGUAGE]
  return dimTemplates[index % dimTemplates.length]
}

/**
 * 生成选择题选项
 */
function generateOptions(dimension, index) {
  const optionSets = {
    [ABILITY_DIMENSIONS.LANGUAGE]: [['a', 'o', 'e', 'i'], ['妈', '爸', '姑', '爷'], ['好', '很好', '不好', '一般']],
    [ABILITY_DIMENSIONS.MATH]: [['6', '7', '8', '9'], ['5', '6', '7', '8'], ['10', '11', '12', '13']],
    [ABILITY_DIMENSIONS.LOGIC]: [['7', '8', '9', '10'], ['对', '错'], ['A', 'B', 'C', 'D']],
    [ABILITY_DIMENSIONS.SOCIAL]: [['拒绝', '接受', '无视', '犹豫'], ['高兴', '难过', '生气', '害怕']],
    [ABILITY_DIMENSIONS.MOTOR]: [['可以', '不可以'], ['左手', '右手', '双手']]
  }
  
  const dimOptions = optionSets[dimension] || optionSets[ABILITY_DIMENSIONS.LANGUAGE]
  return dimOptions[index % dimOptions.length]
}

/**
 * 难点专项突破
 * @param {string} babyId
 * @param {string} dimension
 * @returns {Object} 突破计划
 */
export function createBreakthroughPlan(babyId, dimension) {
  const path = getLearningPath(babyId)
  if (!path) return null
  
  const dimAssessment = path.assessment.scores.find(s => s.dimension === dimension)
  const currentLevel = dimAssessment?.level || 1
  
  // 生成突破计划
  const plan = {
    dimension,
    currentLevel,
    targetLevel: Math.min(5, currentLevel + 1),
    focusAreas: identifyWeakPoints(dimension, currentLevel),
    exercises: generateAdaptiveExercises(dimension, currentLevel, babyId),
    estimatedDays: Math.round((100 - (dimAssessment?.score || 50)) / 10),
    milestones: generateMilestones(dimension, currentLevel)
  }
  
  return plan
}

/**
 * 识别薄弱点
 */
function identifyWeakPoints(dimension, level) {
  const weakPointMap = {
    [ABILITY_DIMENSIONS.LANGUAGE]: ['拼音基础', '识字量', '阅读速度', '写作表达'],
    [ABILITY_DIMENSIONS.MATH]: ['计算速度', '应用题理解', '空间概念', '数量感知'],
    [ABILITY_DIMENSIONS.LOGIC]: ['抽象思维', '推理能力', '问题分析', '创造力'],
    [ABILITY_DIMENSIONS.SOCIAL]: ['表达沟通', '情绪识别', '合作意识', '规则理解'],
    [ABILITY_DIMENSIONS.MOTOR]: ['精细动作', '平衡能力', '力量训练', '协调性']
  }
  
  const points = weakPointMap[dimension] || []
  return points.slice(0, 3 - Math.floor(level / 2))
}

/**
 * 生成里程碑
 */
function generateMilestones(dimension, level) {
  const milestones = []
  
  for (let i = level; i < Math.min(5, level + 2); i++) {
    milestones.push({
      level: i + 1,
      title: `达成Lv.${i + 1}`,
      requirements: getMilestoneRequirements(dimension, i + 1),
      bonusPoints: (i + 1) * 50
    })
  }
  
  return milestones
}

/**
 * 获取里程碑要求
 */
function getMilestoneRequirements(dimension, targetLevel) {
  const baseScore = targetLevel * 20
  return `达到${baseScore}分以上`
}

// ==================== 辅助函数 ====================

function rowToObject(row, columns) {
  const obj = {}
  for (let i = 0; i < columns.length; i++) {
    let value = row[i]
    // 尝试解析JSON字段
    try {
      if (typeof value === 'string' && (value.startsWith('[') || value.startsWith('{'))) {
        value = JSON.parse(value)
      }
    } catch (e) {}
    obj[columns[i]] = value
  }
  return obj
}

// ==================== 模拟评估（用于演示） ====================

/**
 * 生成模拟评估数据
 * @param {string} babyId
 * @returns {AssessmentResult}
 */
export function generateMockAssessment(babyId) {
  const scores = []
  
  for (const dim of Object.values(ABILITY_DIMENSIONS)) {
    scores.push({
      dimension: dim,
      score: Math.round(40 + Math.random() * 50),
      level: 1,
      lastUpdated: now()
    })
  }
  
  return createAssessment(babyId, scores)
}

/**
 * 初始化演示学习路径
 * @param {string} babyId
 * @returns {LearningPath}
 */
export function initDemoLearningPath(babyId) {
  const assessment = generateMockAssessment(babyId)
  return generateLearningPath(assessment)
}

// 导出服务
export default {
  // 常量
  ABILITY_DIMENSIONS,
  DIMENSION_CONFIG,
  ASSESSMENT_TYPES,
  GOAL_TYPES,
  COURSE_STATUS,
  DIFFICULTY_LEVELS,
  
  // 核心函数
  createAssessment,
  generateLearningPath,
  getLearningPath,
  getAssessmentHistory,
  updateCourseProgress,
  updateGoalProgress,
  getLearningStats,
  generateAdaptiveExercises,
  createBreakthroughPlan,
  
  // 演示函数
  generateMockAssessment,
  initDemoLearningPath
}
