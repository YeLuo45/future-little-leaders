/**
 * V98 Interest Discovery Service
 * 兴趣发现服务 - 兴趣测评、推荐探索、兴趣追踪
 */

// 存储键
const INTEREST_PROFILE_KEY = 'interest_discovery_profile'
const INTEREST_ASSESSMENT_KEY = 'interest_discovery_assessment'
const INTEREST_TRACKING_KEY = 'interest_discovery_tracking'
const EXPLORATION_ACTIVITIES_KEY = 'interest_discovery_exploration'
const ACHIEVEMENT_BADGES_KEY = 'interest_discovery_badges'

// 兴趣维度定义
export const INTEREST_DIMENSIONS = {
  science: {
    id: 'science',
    name: '科学探索',
    icon: '🔬',
    description: '对自然科学、实验探究的兴趣',
    color: '#4facfe',
    activities: ['科学实验', '天文观测', '植物观察', '机器人编程']
  },
  art: {
    id: 'art',
    name: '艺术创作',
    icon: '🎨',
    description: '对绘画、音乐、舞蹈等艺术形式的兴趣',
    color: '#f093fb',
    activities: ['绘画创作', '音乐欣赏', '舞蹈表演', '手工制作']
  },
  sports: {
    id: 'sports',
    name: '体育运动',
    icon: '⚽',
    description: '对各类运动和体能活动的兴趣',
    color: '#43e97b',
    activities: ['球类运动', '游泳', '舞蹈', '户外探险']
  },
  reading: {
    id: 'reading',
    name: '阅读写作',
    icon: '📚',
    description: '对阅读、写作、表达的兴趣',
    color: '#fa709a',
    activities: ['绘本阅读', '故事创作', '诗歌朗诵', '演讲表达']
  },
  social: {
    id: 'social',
    name: '社交合作',
    icon: '🤝',
    description: '对与人交往和团队合作的兴趣',
    color: '#fee140',
    activities: ['团队游戏', '角色扮演', '社区活动', '志愿服务']
  },
  nature: {
    id: 'nature',
    name: '自然观察',
    icon: '🌳',
    description: '对大自然和生态环境的兴趣',
    color: '#30cfd0',
    activities: ['户外写生', '昆虫观察', '环保行动', '露营徒步']
  }
}

// 测评问卷题目
export const ASSESSMENT_QUESTIONS = [
  {
    id: 'q1',
    question: '周末你最喜欢做什么？',
    options: [
      { text: '去科技馆或博物馆', scores: { science: 3, nature: 2 } },
      { text: '画画或做手工', scores: { art: 3, reading: 1 } },
      { text: '踢足球或游泳', scores: { sports: 3, social: 1 } },
      { text: '和朋友一起玩', scores: { social: 3, sports: 1 } }
    ]
  },
  {
    id: 'q2',
    question: '如果有一整天自由时间，你会？',
    options: [
      { text: '阅读一本有趣的书', scores: { reading: 3, art: 1 } },
      { text: '做一个小实验或编程', scores: { science: 3, nature: 1 } },
      { text: '去户外探索自然', scores: { nature: 3, sports: 2 } },
      { text: '画画、听音乐或跳舞', scores: { art: 3, reading: 1 } }
    ]
  },
  {
    id: 'q3',
    question: '你最喜欢哪类动画片？',
    options: [
      { text: '科普类和宇宙探索', scores: { science: 3 } },
      { text: '艺术和音乐类', scores: { art: 3 } },
      { text: '运动竞技类', scores: { sports: 3 } },
      { text: '社交和友情类', scores: { social: 3 } }
    ]
  },
  {
    id: 'q4',
    question: '当你在公园玩耍时，你通常会？',
    options: [
      { text: '观察花草树木和小虫子', scores: { nature: 3, science: 2 } },
      { text: '加入其他小朋友一起玩', scores: { social: 3, sports: 2 } },
      { text: '跑步、踢球或骑车', scores: { sports: 3, nature: 1 } },
      { text: '坐下来画画或讲故事', scores: { art: 3, reading: 2 } }
    ]
  },
  {
    id: 'q5',
    question: '你长大后想成为什么样的人？',
    options: [
      { text: '科学家或发明家', scores: { science: 3 } },
      { text: '画家、音乐家或舞蹈家', scores: { art: 3 } },
      { text: '运动员或探险家', scores: { sports: 3, nature: 2 } },
      { text: '作家或老师', scores: { reading: 3, social: 2 } }
    ]
  },
  {
    id: 'q6',
    question: '你喜欢什么样的游戏？',
    options: [
      { text: '解谜和益智游戏', scores: { science: 3, reading: 1 } },
      { text: '创意构造类游戏', scores: { art: 3, science: 1 } },
      { text: '户外运动类游戏', scores: { sports: 3, nature: 1 } },
      { text: '角色扮演和合作游戏', scores: { social: 3, art: 1 } }
    ]
  }
]

// 推荐探索活动
export const EXPLORATION_ACTIVITIES = [
  {
    id: 'exp_science_1',
    dimension: 'science',
    title: '小小科学家实验课',
    description: '动手做有趣的科学实验',
    duration: 45,
    difficulty: 'easy',
    icon: '🔬'
  },
  {
    id: 'exp_science_2',
    dimension: 'science',
    title: '星空观测之夜',
    description: '认识星座和行星',
    duration: 60,
    difficulty: 'medium',
    icon: '🌟'
  },
  {
    id: 'exp_art_1',
    dimension: 'art',
    title: '创意绘画工作坊',
    description: '用画笔表达你的世界',
    duration: 40,
    difficulty: 'easy',
    icon: '🎨'
  },
  {
    id: 'exp_art_2',
    dimension: 'art',
    title: '音乐律动体验',
    description: '感受节奏和音乐的魅力',
    duration: 35,
    difficulty: 'easy',
    icon: '🎵'
  },
  {
    id: 'exp_sports_1',
    dimension: 'sports',
    title: '球类运动初体验',
    description: '尝试足球、篮球等多种球类',
    duration: 50,
    difficulty: 'medium',
    icon: '⚽'
  },
  {
    id: 'exp_sports_2',
    dimension: 'sports',
    title: '户外探险挑战',
    description: '徒步、露营等户外技能',
    duration: 120,
    difficulty: 'hard',
    icon: '🏕️'
  },
  {
    id: 'exp_reading_1',
    dimension: 'reading',
    title: '绘本故事会',
    description: '分享和表演有趣的故事',
    duration: 30,
    difficulty: 'easy',
    icon: '📖'
  },
  {
    id: 'exp_reading_2',
    dimension: 'reading',
    title: '小记者采访活动',
    description: '学习采访和表达能力',
    duration: 45,
    difficulty: 'medium',
    icon: '🎤'
  },
  {
    id: 'exp_social_1',
    dimension: 'social',
    title: '团队合作游戏',
    description: '在游戏中学会合作',
    duration: 40,
    difficulty: 'easy',
    icon: '🤝'
  },
  {
    id: 'exp_social_2',
    dimension: 'social',
    title: '社区服务小志愿者',
    description: '体验帮助他人的快乐',
    duration: 60,
    difficulty: 'medium',
    icon: '💝'
  },
  {
    id: 'exp_nature_1',
    dimension: 'nature',
    title: '自然探索日记',
    description: '观察记录身边的自然',
    duration: 30,
    difficulty: 'easy',
    icon: '🔍'
  },
  {
    id: 'exp_nature_2',
    dimension: 'nature',
    title: '生态保护小卫士',
    description: '学习环保知识和行动',
    duration: 50,
    difficulty: 'medium',
    icon: '🌍'
  }
]

// 成就徽章定义
export const ACHIEVEMENT_BADGES = {
  first_assessment: {
    id: 'first_assessment',
    name: '兴趣探索者',
    description: '完成首次兴趣测评',
    icon: '🎯',
    type: 'assessment'
  },
  five_explorations: {
    id: 'five_explorations',
    name: '探索小达人',
    description: '完成5次探索活动',
    icon: '🌟',
    type: 'exploration',
    requirement: 5
  },
  ten_explorations: {
    id: 'ten_explorations',
    name: '探索小专家',
    description: '完成10次探索活动',
    icon: '💎',
    type: 'exploration',
    requirement: 10
  },
  consistent_tracker: {
    id: 'consistent_tracker',
    name: '坚持追踪者',
    description: '连续7天记录兴趣活动',
    icon: '📈',
    type: 'tracking',
    requirement: 7
  },
  all_dimension_explorer: {
    id: 'all_dimension_explorer',
    name: '全能探索家',
    description: '体验所有兴趣维度的活动',
    icon: '🏆',
    type: 'exploration'
  },
  deep_learner: {
    id: 'deep_learner',
    name: '深度学习者',
    description: '在某个兴趣领域完成3次进阶活动',
    icon: '🎓',
    type: 'deep_learning',
    requirement: 3
  }
}

// 获取兴趣档案
export const getInterestProfile = () => {
  try {
    const stored = uni.getStorageSync(INTEREST_PROFILE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch (e) {
    console.error('获取兴趣档案失败:', e)
    return null
  }
}

// 保存兴趣档案
export const saveInterestProfile = (profile) => {
  uni.setStorageSync(INTEREST_PROFILE_KEY, JSON.stringify(profile))
}

// 创建初始兴趣档案
export const createInterestProfile = (dimensionScores) => {
  // 计算各维度得分
  const sortedDimensions = Object.entries(dimensionScores)
    .sort(([, a], [, b]) => b - a)
    .map(([id, score]) => ({
      id,
      score,
      ...INTEREST_DIMENSIONS[id],
      strength: score >= 12 ? 'strong' : score >= 6 ? 'medium' : 'developing'
    }))

  const profile = {
    id: 'profile_' + Date.now(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    dimensions: sortedDimensions,
    topInterests: sortedDimensions.slice(0, 3),
    assessmentCount: 1,
    lastAssessmentDate: new Date().toISOString().split('T')[0]
  }

  saveInterestProfile(profile)
  return profile
}

// 更新兴趣档案
export const updateInterestProfile = (updates) => {
  const profile = getInterestProfile()
  if (profile) {
    Object.assign(profile, updates, { updatedAt: new Date().toISOString() })
    saveInterestProfile(profile)
  }
  return profile
}

// 获取测评记录
export const getAssessmentRecord = () => {
  try {
    const stored = uni.getStorageSync(INTEREST_ASSESSMENT_KEY)
    return stored ? JSON.parse(stored) : null
  } catch (e) {
    console.error('获取测评记录失败:', e)
    return null
  }
}

// 保存测评答案
export const saveAssessmentAnswers = (answers) => {
  uni.setStorageSync(INTEREST_ASSESSMENT_KEY, JSON.stringify({
    answers,
    completedAt: new Date().toISOString()
  }))
}

// 处理测评结果
export const processAssessmentResults = (answers) => {
  const dimensionScores = {
    science: 0,
    art: 0,
    sports: 0,
    reading: 0,
    social: 0,
    nature: 0
  }

  answers.forEach((answerIndex, questionIndex) => {
    const question = ASSESSMENT_QUESTIONS[questionIndex]
    if (question && question.options[answerIndex]) {
      const scores = question.options[answerIndex].scores
      Object.entries(scores).forEach(([dim, score]) => {
        dimensionScores[dim] = (dimensionScores[dim] || 0) + score
      })
    }
  })

  return dimensionScores
}

// 获取探索活动记录
export const getExplorationRecords = () => {
  try {
    const stored = uni.getStorageSync(EXPLORATION_ACTIVITIES_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (e) {
    console.error('获取探索记录失败:', e)
    return []
  }
}

// 保存探索记录
export const saveExplorationRecords = (records) => {
  uni.setStorageSync(EXPLORATION_ACTIVITIES_KEY, JSON.stringify(records))
}

// 添加探索记录
export const addExplorationRecord = (activity) => {
  const records = getExplorationRecords()
  const record = {
    id: 'exp_record_' + Date.now(),
    activityId: activity.id,
    dimension: activity.dimension,
    title: activity.title,
    completedAt: new Date().toISOString(),
    expGained: calculateExplorationExp(activity.difficulty)
  }
  records.push(record)
  saveExplorationRecords(records)
  return record
}

// 计算探索经验值
export const calculateExplorationExp = (difficulty) => {
  const baseExp = { easy: 10, medium: 20, hard: 30 }
  return baseExp[difficulty] || 10
}

// 获取兴趣追踪记录
export const getTrackingRecords = () => {
  try {
    const stored = uni.getStorageSync(INTEREST_TRACKING_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (e) {
    console.error('获取追踪记录失败:', e)
    return []
  }
}

// 保存追踪记录
export const saveTrackingRecords = (records) => {
  uni.setStorageSync(INTEREST_TRACKING_KEY, JSON.stringify(records))
}

// 添加兴趣追踪记录
export const addTrackingRecord = (dimensionId, activity, notes = '') => {
  const records = getTrackingRecords()
  const record = {
    id: 'track_record_' + Date.now(),
    dimensionId,
    dimension: INTEREST_DIMENSIONS[dimensionId],
    activity,
    notes,
    recordedAt: new Date().toISOString(),
    date: new Date().toISOString().split('T')[0]
  }
  records.push(record)
  saveTrackingRecords(records)
  return record
}

// 获取徽章记录
export const getBadgeRecords = () => {
  try {
    const stored = uni.getStorageSync(ACHIEVEMENT_BADGES_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (e) {
    console.error('获取徽章记录失败:', e)
    return []
  }
}

// 保存徽章记录
export const saveBadgeRecords = (records) => {
  uni.setStorageSync(ACHIEVEMENT_BADGES_KEY, JSON.stringify(records))
}

// 授予徽章
export const awardBadge = (badgeId) => {
  const badges = getBadgeRecords()
  if (badges.some(b => b.badgeId === badgeId)) {
    return null // 已获得
  }
  
  const badge = ACHIEVEMENT_BADGES[badgeId]
  if (!badge) return null
  
  const record = {
    id: 'badge_' + Date.now(),
    badgeId,
    badge,
    awardedAt: new Date().toISOString()
  }
  badges.push(record)
  saveBadgeRecords(badges)
  return record
}

// 检查并授予徽章
export const checkAndAwardBadges = () => {
  const newBadges = []
  
  // 检查首次测评徽章
  const profile = getInterestProfile()
  if (profile && profile.assessmentCount >= 1) {
    const badge = awardBadge('first_assessment')
    if (badge) newBadges.push(badge)
  }
  
  // 检查探索次数徽章
  const expRecords = getExplorationRecords()
  const uniqueExplorations = new Set(expRecords.map(r => r.activityId)).size
  if (uniqueExplorations >= 5) {
    const badge = awardBadge('five_explorations')
    if (badge) newBadges.push(badge)
  }
  if (uniqueExplorations >= 10) {
    const badge = awardBadge('ten_explorations')
    if (badge) newBadges.push(badge)
  }
  
  // 检查连续追踪徽章
  const trackingRecords = getTrackingRecords()
  const streak = calculateTrackingStreak(trackingRecords)
  if (streak >= 7) {
    const badge = awardBadge('consistent_tracker')
    if (badge) newBadges.push(badge)
  }
  
  // 检查全维度探索徽章
  const exploredDimensions = new Set(expRecords.map(r => r.dimension))
  if (exploredDimensions.size >= Object.keys(INTEREST_DIMENSIONS).length) {
    const badge = awardBadge('all_dimension_explorer')
    if (badge) newBadges.push(badge)
  }
  
  return newBadges
}

// 计算追踪连续天数
export const calculateTrackingStreak = (records) => {
  if (!records || records.length === 0) return 0
  
  const dates = [...new Set(records.map(r => r.date))].sort().reverse()
  let streak = 0
  let currentDate = new Date()
  currentDate.setHours(0, 0, 0, 0)
  
  for (const dateStr of dates) {
    const recordDate = new Date(dateStr)
    recordDate.setHours(0, 0, 0, 0)
    
    const diffDays = Math.floor((currentDate - recordDate) / (1000 * 60 * 60 * 24))
    
    if (diffDays <= 1) {
      streak++
      currentDate = recordDate
    } else {
      break
    }
  }
  
  return streak
}

// 获取推荐活动（基于兴趣档案）
export const getRecommendedActivities = (profile, limit = 4) => {
  if (!profile) {
    // 未测评时返回随机活动
    return EXPLORATION_ACTIVITIES.slice(0, limit)
  }
  
  const topDimensionIds = profile.topInterests.map(i => i.id)
  const recommended = []
  
  // 按兴趣维度优先级添加活动
  topDimensionIds.forEach(dimId => {
    const dimActivities = EXPLORATION_ACTIVITIES.filter(a => a.dimension === dimId)
    recommended.push(...dimActivities)
  })
  
  // 添加其他活动
  EXPLORATION_ACTIVITIES.forEach(activity => {
    if (!recommended.some(a => a.id === activity.id)) {
      recommended.push(activity)
    }
  })
  
  // 去除已完成的
  const expRecords = getExplorationRecords()
  const completedIds = new Set(expRecords.map(r => r.activityId))
  
  return recommended
    .filter(a => !completedIds.has(a.id))
    .slice(0, limit)
}

// 获取深度学习路径
export const getLearningPath = (dimensionId) => {
  const activities = EXPLORATION_ACTIVITIES.filter(a => a.dimension === dimensionId)
  const expRecords = getExplorationRecords()
  const completed = expRecords.filter(r => r.dimension === dimensionId)
  
  return {
    dimension: INTEREST_DIMENSIONS[dimensionId],
    activities,
    completedCount: completed.length,
    progress: Math.min(100, Math.round((completed.length / activities.length) * 100))
  }
}

export default {
  INTEREST_DIMENSIONS,
  ASSESSMENT_QUESTIONS,
  EXPLORATION_ACTIVITIES,
  ACHIEVEMENT_BADGES,
  getInterestProfile,
  saveInterestProfile,
  createInterestProfile,
  updateInterestProfile,
  getAssessmentRecord,
  saveAssessmentAnswers,
  processAssessmentResults,
  getExplorationRecords,
  addExplorationRecord,
  getTrackingRecords,
  addTrackingRecord,
  getBadgeRecords,
  awardBadge,
  checkAndAwardBadges,
  getRecommendedActivities,
  getLearningPath
}
