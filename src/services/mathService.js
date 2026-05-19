/**
 * V69 Math Playground Service
 * 数学游乐场系统 - 数学游戏、速算训练、数学探索
 */

// Storage keys
const MATH_GAMES_KEY = 'math_games'
const MENTAL_MATH_KEY = 'mental_math'
const MATH_EXPLORATION_KEY = 'math_exploration'
const MATH_ACHIEVEMENTS_KEY = 'math_achievements'

// ============================================================================
// Math Game Types
// ============================================================================

export const MATH_OPERATIONS = {
  add: { id: 'add', name: '加法', symbol: '+', icon: '➕' },
  subtract: { id: 'subtract', name: '减法', symbol: '-', icon: '➖' },
  multiply: { id: 'multiply', name: '乘法', symbol: '×', icon: '✖️' },
  divide: { id: 'divide', name: '除法', symbol: '÷', icon: '➗' }
}

export const DIFFICULTY_LEVELS = {
  easy: { id: 'easy', name: '简单', min: 1, max: 10, time: 60 },
  medium: { id: 'medium', name: '中等', min: 1, max: 50, time: 45 },
  hard: { id: 'hard', name: '困难', min: 1, max: 100, time: 30 },
  expert: { id: 'expert', name: '专家', min: 10, max: 200, time: 20 }
}

// ============================================================================
// Math Games - Problem Generation
// ============================================================================

export const generateProblem = (operation, difficulty) => {
  const diff = DIFFICULTY_LEVELS[difficulty]
  let a, b, answer
  
  switch (operation) {
    case 'add':
      a = Math.floor(Math.random() * (diff.max - diff.min + 1)) + diff.min
      b = Math.floor(Math.random() * (diff.max - diff.min + 1)) + diff.min
      answer = a + b
      break
    case 'subtract':
      a = Math.floor(Math.random() * (diff.max - diff.min + 1)) + diff.min
      b = Math.floor(Math.random() * (a - diff.min + 1)) + diff.min
      answer = a - b
      break
    case 'multiply':
      const mulMax = Math.min(diff.max, 12)
      a = Math.floor(Math.random() * (mulMax - 1)) + 1
      b = Math.floor(Math.random() * (mulMax - 1)) + 1
      answer = a * b
      break
    case 'divide':
      b = Math.floor(Math.random() * 10) + 1
      answer = Math.floor(Math.random() * 10) + 1
      a = b * answer
      break
    default:
      a = Math.floor(Math.random() * 10) + 1
      b = Math.floor(Math.random() * 10) + 1
      answer = a + b
  }
  
  return {
    id: 'prob_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
    a,
    b,
    operation,
    answer,
    symbol: MATH_OPERATIONS[operation].symbol
  }
}

export const checkAnswer = (problem, userAnswer) => {
  return parseInt(userAnswer) === problem.answer
}

// ============================================================================
// Math Games Records
// ============================================================================

export const getMathGames = () => {
  try {
    const data = uni.getStorageSync(MATH_GAMES_KEY)
    if (data) return JSON.parse(data)
  } catch (e) {
    console.error('getMathGames error:', e)
  }
  return getDefaultMathGames()
}

export const getDefaultMathGames = () => [
  {
    id: 'game_1',
    type: 'arithmetic',
    operation: 'add',
    difficulty: 'easy',
    totalQuestions: 10,
    correctAnswers: 0,
    score: 0,
    timeSpent: 0,
    completedAt: null,
    stars: 0
  },
  {
    id: 'game_2',
    type: 'arithmetic',
    operation: 'multiply',
    difficulty: 'medium',
    totalQuestions: 10,
    correctAnswers: 0,
    score: 0,
    timeSpent: 0,
    completedAt: null,
    stars: 0
  }
]

export const saveMathGame = (gameData) => {
  try {
    const games = getMathGames()
    const newGame = {
      id: 'game_' + Date.now(),
      type: gameData.type || 'arithmetic',
      operation: gameData.operation || 'add',
      difficulty: gameData.difficulty || 'easy',
      totalQuestions: gameData.totalQuestions || 10,
      correctAnswers: gameData.correctAnswers || 0,
      score: gameData.score || 0,
      timeSpent: gameData.timeSpent || 0,
      completedAt: new Date().toISOString(),
      stars: gameData.stars || 0
    }
    games.unshift(newGame)
    uni.setStorageSync(MATH_GAMES_KEY, JSON.stringify(games))
    return newGame
  } catch (e) {
    console.error('saveMathGame error:', e)
    return null
  }
}

// ============================================================================
// Mental Math Training
// ============================================================================

export const getMentalMathRecords = () => {
  try {
    const data = uni.getStorageSync(MENTAL_MATH_KEY)
    if (data) return JSON.parse(data)
  } catch (e) {
    console.error('getMentalMathRecords error:', e)
  }
  return getDefaultMentalMathRecords()
}

export const getDefaultMentalMathRecords = () => [
  {
    id: 'mental_1',
    type: 'timed_challenge',
    difficulty: 'medium',
    duration: 60,
    totalQuestions: 20,
    correctAnswers: 15,
    accuracy: 75,
    completedAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'mental_2',
    type: 'accuracy_training',
    difficulty: 'easy',
    duration: 120,
    totalQuestions: 30,
    correctAnswers: 28,
    accuracy: 93,
    completedAt: new Date(Date.now() - 86400000 * 2).toISOString()
  }
]

export const saveMentalMathRecord = (recordData) => {
  try {
    const records = getMentalMathRecords()
    const accuracy = recordData.totalQuestions > 0 
      ? Math.round((recordData.correctAnswers / recordData.totalQuestions) * 100) 
      : 0
    
    const newRecord = {
      id: 'mental_' + Date.now(),
      type: recordData.type || 'training',
      difficulty: recordData.difficulty || 'easy',
      duration: recordData.duration || 60,
      totalQuestions: recordData.totalQuestions || 10,
      correctAnswers: recordData.correctAnswers || 0,
      accuracy,
      completedAt: new Date().toISOString()
    }
    records.unshift(newRecord)
    uni.setStorageSync(MENTAL_MATH_KEY, JSON.stringify(records))
    return newRecord
  } catch (e) {
    console.error('saveMentalMathRecord error:', e)
    return null
  }
}

// ============================================================================
// Math Exploration Topics
// ============================================================================

export const getExplorationTopics = () => {
  try {
    const data = uni.getStorageSync(MATH_EXPLORATION_KEY)
    if (data) return JSON.parse(data)
  } catch (e) {
    console.error('getExplorationTopics error:', e)
  }
  return getDefaultExplorationTopics()
}

export const getDefaultExplorationTopics = () => [
  {
    id: 'geo_1',
    category: 'geometry',
    title: '认识几何图形',
    description: '探索圆形、正方形、三角形等基本图形的世界',
    icon: '🔷',
    difficulty: 'beginner',
    lessons: [
      { id: 'g1', title: '圆形的世界', content: '圆是平面上到定点距离相等的点的集合', isLearned: false },
      { id: 'g2', title: '三角形的秘密', content: '三角形内角和等于180度', isLearned: false },
      { id: 'g3', title: '四边形的家族', content: '正方形、长方形、平行四边形都是四边形', isLearned: false }
    ],
    points: 50
  },
  {
    id: 'alg_1',
    category: 'algebra',
    title: '代数的奥秘',
    description: '用字母和符号探索数学的抽象世界',
    icon: '🔢',
    difficulty: 'intermediate',
    lessons: [
      { id: 'a1', title: '认识未知数X', content: 'X是一个可以代表任何数字的符号', isLearned: false },
      { id: 'a2', title: '简单的方程式', content: '等式两边同时加减乘除相同的数，等式仍然成立', isLearned: false },
      { id: 'a3', title: '解方程练习', content: '通过逆运算求解未知数', isLearned: false }
    ],
    points: 80
  },
  {
    id: 'prob_1',
    category: 'probability',
    title: '概率与统计',
    description: '了解可能性的大小和数据的秘密',
    icon: '📊',
    difficulty: 'intermediate',
    lessons: [
      { id: 'p1', title: '什么是概率', content: '概率描述某事件发生的可能性大小', isLearned: false },
      { id: 'p2', title: '掷骰子的秘密', content: '掷出每个数字的概率都是1/6', isLearned: false },
      { id: 'p3', title: '统计图表', content: '用图表展示和理解数据', isLearned: false }
    ],
    points: 70
  },
  {
    id: 'fun_1',
    category: 'fun_math',
    title: '趣味数学',
    description: '有趣的数学故事和谜题',
    icon: '🧩',
    difficulty: 'beginner',
    lessons: [
      { id: 'f1', title: '数字的故事', content: '0到9这10个数字如何创造出现代世界', isLearned: false },
      { id: 'f2', title: '数学谜语', content: '动动脑筋，猜猜这些有趣的数学谜语', isLearned: false },
      { id: 'f3', title: '数学魔术', content: '看似神奇的数学小魔术原理', isLearned: false }
    ],
    points: 40
  }
]

export const markLessonLearned = (topicId, lessonId) => {
  try {
    const topics = getExplorationTopics()
    const topic = topics.find(t => t.id === topicId)
    if (topic) {
      const lesson = topic.lessons.find(l => l.id === lessonId)
      if (lesson) {
        lesson.isLearned = true
        uni.setStorageSync(MATH_EXPLORATION_KEY, JSON.stringify(topics))
        return true
      }
    }
    return false
  } catch (e) {
    console.error('markLesson Learned error:', e)
    return false
  }
}

// ============================================================================
// Math Achievements & Ranks
// ============================================================================

export const getAchievements = () => {
  try {
    const data = uni.getStorageSync(MATH_ACHIEVEMENTS_KEY)
    if (data) return JSON.parse(data)
  } catch (e) {
    console.error('getAchievements error:', e)
  }
  return getDefaultAchievements()
}

export const getDefaultAchievements = () => [
  { id: 'ach_1', name: '数学新手', description: '完成第一个数学游戏', icon: '🌟', isUnlocked: true, unlockedAt: new Date(Date.now() - 86400000 * 5).toISOString() },
  { id: 'ach_2', name: '速算达人', description: '速算准确率达到90%以上', icon: '⚡', isUnlocked: true, unlockedAt: new Date(Date.now() - 86400000 * 3).toISOString() },
  { id: 'ach_3', name: '数学探索家', description: '学习完一个数学知识点', icon: '🔭', isUnlocked: false, unlockedAt: null },
  { id: 'ach_4', name: '乘除高手', description: '连续答对10道乘除题', icon: '🏆', isUnlocked: false, unlockedAt: null },
  { id: 'ach_5', name: '数学大师', description: '累计获得1000数学积分', icon: '👑', isUnlocked: false, unlockedAt: null }
]

export const unlockAchievement = (achievementId) => {
  try {
    const achievements = getAchievements()
    const achievement = achievements.find(a => a.id === achievementId)
    if (achievement && !achievement.isUnlocked) {
      achievement.isUnlocked = true
      achievement.unlockedAt = new Date().toISOString()
      uni.setStorageSync(MATH_ACHIEVEMENTS_KEY, JSON.stringify(achievements))
      return true
    }
    return false
  } catch (e) {
    console.error('unlockAchievement error:', e)
    return false
  }
}

export const RANKS = [
  { id: 'bronze', name: '青铜', minScore: 0, icon: '🥉', color: '#cd7f32' },
  { id: 'silver', name: '白银', minScore: 500, icon: '🥈', color: '#c0c0c0' },
  { id: 'gold', name: '黄金', minScore: 1500, icon: '🥇', color: '#ffd700' },
  { id: 'platinum', name: '铂金', minScore: 3000, icon: '💎', color: '#e5e4e2' },
  { id: 'diamond', name: '钻石', minScore: 5000, icon: '💠', color: '#b9f2ff' },
  { id: 'master', name: '大师', minScore: 10000, icon: '👑', color: '#ff6b6b' }
]

export const calculateRank = (totalScore) => {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (totalScore >= RANKS[i].minScore) {
      return RANKS[i]
    }
  }
  return RANKS[0]
}

// ============================================================================
// Leaderboard
// ============================================================================

export const getLeaderboard = () => {
  // Mock leaderboard data
  return [
    { id: 'user_1', name: '小明', score: 2500, rank: 'gold', avatar: '' },
    { id: 'user_2', name: '小红', score: 2100, rank: 'gold', avatar: '' },
    { id: 'user_3', name: '小华', score: 1800, rank: 'silver', avatar: '' },
    { id: 'user_4', name: '小丽', score: 1200, rank: 'silver', avatar: '' },
    { id: 'user_5', name: '小军', score: 800, rank: 'bronze', avatar: '' }
  ]
}

export default {
  MATH_OPERATIONS,
  DIFFICULTY_LEVELS,
  generateProblem,
  checkAnswer,
  getMathGames,
  saveMathGame,
  getMentalMathRecords,
  saveMentalMathRecord,
  getExplorationTopics,
  markLessonLearned,
  getAchievements,
  unlockAchievement,
  RANKS,
  calculateRank,
  getLeaderboard
}
