/**
 * V57 Micro Learning Service
 * 碎片化学习服务 - 每日学习卡片、微课堂、知识速查
 */

// ==================== 常量定义 ====================

// 学习卡片类型
export const CARD_TYPES = {
  DAILY_KNOWLEDGE: 'daily_knowledge',   // 每日知识
  STORY: 'story',                         // 故事卡片
  SCIENCE: 'science',                     // 科学小知识
  ART: 'art',                             // 艺术启蒙
  MORAL: 'moral'                          // 品德教育
}

// 难度等级
export const DIFFICULTY = {
  EASY: 1,      // 简单
  MEDIUM: 2,    // 中等
  HARD: 3       // 困难
}

// 微课类型
export const LESSON_TYPES = {
  VIDEO: 'video',           // 视频课
  INTERACTIVE: 'interactive', // 互动课
  QUIZ: 'quiz'              // 答题课
}

// 挑战状态
export const CHALLENGE_STATUS = {
  AVAILABLE: 'available',   // 可挑战
  COMPLETED: 'completed',    // 已完成
  LOCKED: 'locked'          // 已锁定
}

// localStorage keys
const DAILY_CARDS_KEY = 'micro_daily_cards'
const MICRO_LESSONS_KEY = 'micro_lessons'
const QUICK_REF_KEY = 'micro_quick_ref'
const CHALLENGES_KEY = 'micro_challenges'
const FAVORITES_KEY = 'micro_favorites'
const USER_PROGRESS_KEY = 'micro_user_progress'

// ==================== 模拟数据 ====================

// 每日学习卡片数据
const sampleDailyCards = [
  {
    id: 'card_001',
    type: CARD_TYPES.DAILY_KNOWLEDGE,
    title: '太阳系八大行星',
    summary: '让我们一起来认识太阳系的八大行星吧！',
    content: '太阳系有八颗行星，它们按照距离太阳的远近依次是：水星、金星、地球、火星、木星、土星、天王星和海王星。',
    image: '/static/images/planets.png',
    animation: true,
    difficulty: DIFFICULTY.EASY,
    ageGroup: '6-8',
    tags: ['天文', '太阳系', '科普'],
    createdAt: Date.now()
  },
  {
    id: 'card_002',
    type: CARD_TYPES.STORY,
    title: '小蝌蚪找妈妈',
    summary: '小蝌蚪是如何找到妈妈的？',
    content: '小蝌蚪出生后，看到其他小动物都有妈妈，决定去找自己的妈妈。它们先遇到了鲤鱼，又遇到了乌龟，最后在大池塘里找到了青蛙妈妈。',
    image: '/static/images/tadpole.png',
    animation: true,
    difficulty: DIFFICULTY.EASY,
    ageGroup: '3-5',
    tags: ['故事', '成长', '亲情'],
    createdAt: Date.now()
  },
  {
    id: 'card_003',
    type: CARD_TYPES.SCIENCE,
    title: '水的三态变化',
    summary: '水可以变成什么样子呢？',
    content: '水有三种形态：固态（冰）、液态（水）和气态（水蒸气）。温度变化时，水会从一种形态变成另一种形态，这就是水的三态变化。',
    image: '/static/images/water.png',
    animation: true,
    difficulty: DIFFICULTY.MEDIUM,
    ageGroup: '6-8',
    tags: ['科学', '物理', '自然'],
    createdAt: Date.now()
  },
  {
    id: 'card_004',
    type: CARD_TYPES.ART,
    title: '认识彩虹的颜色',
    summary: '彩虹有哪些美丽的颜色？',
    content: '彩虹有七种颜色，分别是：红、橙、黄、绿、蓝、靛、紫。小朋友们可以记住这个口诀：红橙黄绿蓝靛紫，就像天上的一座彩桥！',
    image: '/static/images/rainbow.png',
    animation: true,
    difficulty: DIFFICULTY.EASY,
    ageGroup: '3-5',
    tags: ['艺术', '色彩', '自然'],
    createdAt: Date.now()
  },
  {
    id: 'card_005',
    type: CARD_TYPES.MORAL,
    title: '诚实的小男孩',
    summary: '为什么诚实很重要？',
    content: '从前有个小男孩不小心打碎了邻居家的花瓶，虽然害怕，但他还是勇敢地承认了错误。邻居不仅没有责怪他，还夸他是个诚实的好孩子。',
    image: '/static/images/boy.png',
    animation: false,
    difficulty: DIFFICULTY.EASY,
    ageGroup: '3-5',
    tags: ['品德', '诚实', '勇气'],
    createdAt: Date.now()
  }
]

// 微课数据
const sampleLessons = [
  {
    id: 'lesson_001',
    type: LESSON_TYPES.VIDEO,
    title: '5分钟学会认识时间',
    description: '通过有趣的动画，帮助小朋友学会看时钟',
    duration: 300, // 5分钟 = 300秒
    thumbnail: '/static/images/clock.png',
    videoUrl: '/static/videos/clock.mp4',
    difficulty: DIFFICULTY.EASY,
    ageGroup: '6-8',
    tags: ['时间', '数学', '启蒙'],
    progress: 0,
    completed: false,
    lessons: [
      { id: 'l1_1', title: '认识钟面', duration: 60 },
      { id: 'l1_2', title: '时针和分针', duration: 90 },
      { id: 'l1_3', title: '整点和半点', duration: 90 },
      { id: 'l1_4', title: '趣味练习', duration: 60 }
    ],
    createdAt: Date.now()
  },
  {
    id: 'lesson_002',
    type: LESSON_TYPES.INTERACTIVE,
    title: '动物世界探险',
    description: '一起走进神奇的动物世界',
    duration: 300,
    thumbnail: '/static/images/animals.png',
    difficulty: DIFFICULTY.EASY,
    ageGroup: '3-5',
    tags: ['动物', '自然', '科普'],
    progress: 0,
    completed: false,
    lessons: [
      { id: 'l2_1', title: '非洲草原的动物', duration: 75 },
      { id: 'l2_2', title: '丛林里的动物', duration: 75 },
      { id: 'l2_3', title: '海洋生物', duration: 75 },
      { id: 'l2_4', title: '互动问答', duration: 75 }
    ],
    createdAt: Date.now()
  },
  {
    id: 'lesson_003',
    type: LESSON_TYPES.QUIZ,
    title: '数学小达人',
    description: '有趣的数学题目等你来挑战',
    duration: 300,
    thumbnail: '/static/images/math.png',
    difficulty: DIFFICULTY.MEDIUM,
    ageGroup: '6-8',
    tags: ['数学', '逻辑', '挑战'],
    progress: 0,
    completed: false,
    questions: [
      { id: 'q1', question: '1 + 2 = ?', options: ['2', '3', '4', '5'], answer: 1 },
      { id: 'q2', question: '5 - 2 = ?', options: ['2', '3', '4', '5'], answer: 0 },
      { id: 'q3', question: '2 + 3 = ?', options: ['4', '5', '6', '7'], answer: 1 }
    ],
    createdAt: Date.now()
  },
  {
    id: 'lesson_004',
    type: LESSON_TYPES.VIDEO,
    title: '古诗趣味学习',
    description: '轻松快乐学古诗',
    duration: 300,
    thumbnail: '/static/images/poem.png',
    videoUrl: '/static/videos/poem.mp4',
    difficulty: DIFFICULTY.MEDIUM,
    ageGroup: '6-8',
    tags: ['语文', '古诗', '文学'],
    progress: 0,
    completed: false,
    lessons: [
      { id: 'l4_1', title: '静夜思赏析', duration: 90 },
      { id: 'l4_2', title: '诗意理解', duration: 90 },
      { id: 'l4_3', title: '背诵练习', duration: 120 }
    ],
    createdAt: Date.now()
  }
]

// 知识速查数据
const sampleQuickRef = [
  {
    id: 'ref_001',
    category: 'science',
    title: '太阳系',
    content: '太阳系由太阳和八大行星组成，还有很多小行星、彗星等天体。',
    keywords: ['太阳', '行星', '地球', '月亮'],
    ageGroup: '6-8',
    image: '/static/images/solar.png',
    createdAt: Date.now()
  },
  {
    id: 'ref_002',
    category: 'science',
    title: '植物生长',
    content: '植物生长需要阳光、水分、空气和土壤。种子发芽后，会慢慢长大开花结果。',
    keywords: ['植物', '生长', '种子', '光合作用'],
    ageGroup: '6-8',
    image: '/static/images/plant.png',
    createdAt: Date.now()
  },
  {
    id: 'ref_003',
    category: 'math',
    title: '加法运算',
    content: '加法是把两个或多个数合在一起，得到一个总和。符号是"+"。',
    keywords: ['加法', '加', '总和', '合并'],
    ageGroup: '6-8',
    image: '/static/images/add.png',
    createdAt: Date.now()
  },
  {
    id: 'ref_004',
    category: 'math',
    title: '减法运算',
    content: '减法是从一个数中去掉另一个数，得到剩余的数量。符号是"-"。',
    keywords: ['减法', '减', '剩余', '去掉'],
    ageGroup: '6-8',
    image: '/static/images/sub.png',
    createdAt: Date.now()
  },
  {
    id: 'ref_005',
    category: 'language',
    title: '汉字结构',
    content: '汉字有上下、左右、包围等结构。学习汉字要先认识它的结构和笔画。',
    keywords: ['汉字', '结构', '笔画', '书写'],
    ageGroup: '6-8',
    image: '/static/images/hanzi.png',
    createdAt: Date.now()
  },
  {
    id: 'ref_006',
    category: 'nature',
    title: '四季变化',
    content: '一年有四季：春、夏、秋、冬。每个季节有不同的天气和景色。',
    keywords: ['四季', '春天', '夏天', '秋天', '冬天'],
    ageGroup: '3-5',
    image: '/static/images/seasons.png',
    createdAt: Date.now()
  }
]

// 每日挑战数据
const sampleChallenges = [
  {
    id: 'challenge_001',
    title: '今日数学挑战',
    description: '完成3道数学题',
    type: 'math',
    difficulty: DIFFICULTY.EASY,
    questions: [
      { id: 'c1_q1', question: '3 + 4 = ?', options: ['5', '6', '7', '8'], answer: 2 },
      { id: 'c1_q2', question: '10 - 5 = ?', options: ['3', '4', '5', '6'], answer: 2 },
      { id: 'c1_q3', question: '2 + 6 = ?', options: ['6', '7', '8', '9'], answer: 2 }
    ],
    points: 10,
    streakDays: 1,
    status: CHALLENGE_STATUS.AVAILABLE,
    createdAt: Date.now()
  },
  {
    id: 'challenge_002',
    title: '今日阅读挑战',
    description: '阅读一个小故事并回答问题',
    type: 'reading',
    difficulty: DIFFICULTY.MEDIUM,
    story: '小兔子种萝卜',
    questions: [
      { id: 'c2_q1', question: '小兔子种了什么？', options: ['萝卜', '白菜', '胡萝卜', '土豆'], answer: 0 },
      { id: 'c2_q2', question: '小兔子是怎么照顾萝卜的？', options: ['浇水', '施肥', '晒太阳', '以上都是'], answer: 3 }
    ],
    points: 15,
    streakDays: 1,
    status: CHALLENGE_STATUS.AVAILABLE,
    createdAt: Date.now()
  },
  {
    id: 'challenge_003',
    title: '今日科学挑战',
    description: '完成科学小实验',
    type: 'science',
    difficulty: DIFFICULTY.HARD,
    points: 20,
    streakDays: 1,
    status: CHALLENGE_STATUS.AVAILABLE,
    createdAt: Date.now()
  }
]

// ==================== 数据存储 ====================

/**
 * 获取本地存储数据
 */
function getLocalData(key, defaultData) {
  try {
    const data = uni.getStorageSync(key)
    return data ? JSON.parse(data) : defaultData
  } catch (e) {
    console.error(`Error reading ${key} from storage:`, e)
    return defaultData
  }
}

/**
 * 保存数据到本地存储
 */
function saveLocalData(key, data) {
  try {
    uni.setStorageSync(key, JSON.stringify(data))
    return true
  } catch (e) {
    console.error(`Error saving ${key} to storage:`, e)
    return false
  }
}

// ==================== 服务函数 ====================

/**
 * 获取每日学习卡片
 * @param {number} limit - 返回数量限制
 * @returns {Array} 每日学习卡片列表
 */
export function getDailyCards(limit = 5) {
  const cards = getLocalData(DAILY_CARDS_KEY, sampleDailyCards)
  // 返回最新的一张作为今日卡片
  const todayCard = cards[0]
  return {
    todayCard,
    cards: cards.slice(0, limit)
  }
}

/**
 * 获取指定卡片
 * @param {string} cardId - 卡片ID
 * @returns {Object|null} 卡片对象
 */
export function getCardById(cardId) {
  const cards = getLocalData(DAILY_CARDS_KEY, sampleDailyCards)
  return cards.find(card => card.id === cardId) || null
}

/**
 * 标记卡片为已读
 * @param {string} cardId - 卡片ID
 */
export function markCardAsRead(cardId) {
  const progress = getLocalData(USER_PROGRESS_KEY, {})
  if (!progress.readCards) {
    progress.readCards = []
  }
  if (!progress.readCards.includes(cardId)) {
    progress.readCards.push(cardId)
    progress.readCards = [...new Set(progress.readCards)] // 去重
    saveLocalData(USER_PROGRESS_KEY, progress)
  }
  return true
}

/**
 * 获取微课列表
 * @param {Object} filters - 筛选条件
 * @returns {Array} 微课列表
 */
export function getMicroLessons(filters = {}) {
  let lessons = getLocalData(MICRO_LESSONS_KEY, sampleLessons)
  
  if (filters.type) {
    lessons = lessons.filter(lesson => lesson.type === filters.type)
  }
  if (filters.ageGroup) {
    lessons = lessons.filter(lesson => lesson.ageGroup === filters.ageGroup)
  }
  if (filters.difficulty) {
    lessons = lessons.filter(lesson => lesson.difficulty === filters.difficulty)
  }
  
  return lessons
}

/**
 * 获取指定微课
 * @param {string} lessonId - 微课ID
 * @returns {Object|null} 微课对象
 */
export function getLessonById(lessonId) {
  const lessons = getLocalData(MICRO_LESSONS_KEY, sampleLessons)
  return lessons.find(lesson => lesson.id === lessonId) || null
}

/**
 * 更新微课进度
 * @param {string} lessonId - 微课ID
 * @param {number} progress - 进度（0-100）
 */
export function updateLessonProgress(lessonId, progress) {
  const lessons = getLocalData(MICRO_LESSONS_KEY, sampleLessons)
  const lessonIndex = lessons.findIndex(l => l.id === lessonId)
  
  if (lessonIndex !== -1) {
    lessons[lessonIndex].progress = progress
    if (progress >= 100) {
      lessons[lessonIndex].completed = true
    }
    saveLocalData(MICRO_LESSONS_KEY, lessons)
  }
  
  // 同时更新用户进度
  const userProgress = getLocalData(USER_PROGRESS_KEY, {})
  if (!userProgress.lessons) {
    userProgress.lessons = {}
  }
  userProgress.lessons[lessonId] = progress
  saveLocalData(USER_PROGRESS_KEY, userProgress)
  
  return true
}

/**
 * 获取知识速查列表
 * @param {string} category - 分类
 * @returns {Array} 知识速查列表
 */
export function getQuickRefList(category = '') {
  const refs = getLocalData(QUICK_REF_KEY, sampleQuickRef)
  
  if (category) {
    return refs.filter(ref => ref.category === category)
  }
  return refs
}

/**
 * 搜索知识速查
 * @param {string} keyword - 搜索关键词
 * @returns {Array} 匹配的速查条目
 */
export function searchQuickRef(keyword) {
  const refs = getLocalData(QUICK_REF_KEY, sampleQuickRef)
  const lowerKeyword = keyword.toLowerCase()
  
  return refs.filter(ref => 
    ref.title.toLowerCase().includes(lowerKeyword) ||
    ref.content.toLowerCase().includes(lowerKeyword) ||
    ref.keywords.some(k => k.toLowerCase().includes(lowerKeyword))
  )
}

/**
 * 获取收藏的速查条目
 * @returns {Array} 收藏的速查条目
 */
export function getFavoriteRefs() {
  const favorites = getLocalData(FAVORITES_KEY, [])
  const refs = getLocalData(QUICK_REF_KEY, sampleQuickRef)
  return refs.filter(ref => favorites.includes(ref.id))
}

/**
 * 添加收藏
 * @param {string} refId - 速查条目ID
 */
export function addFavoriteRef(refId) {
  const favorites = getLocalData(FAVORITES_KEY, [])
  if (!favorites.includes(refId)) {
    favorites.push(refId)
    saveLocalData(FAVORITES_KEY, favorites)
  }
  return true
}

/**
 * 移除收藏
 * @param {string} refId - 速查条目ID
 */
export function removeFavoriteRef(refId) {
  const favorites = getLocalData(FAVORITES_KEY, [])
  const index = favorites.indexOf(refId)
  if (index !== -1) {
    favorites.splice(index, 1)
    saveLocalData(FAVORITES_KEY, favorites)
  }
  return true
}

/**
 * 检查是否已收藏
 * @param {string} refId - 速查条目ID
 * @returns {boolean}
 */
export function isFavoriteRef(refId) {
  const favorites = getLocalData(FAVORITES_KEY, [])
  return favorites.includes(refId)
}

/**
 * 获取每日挑战
 * @returns {Object} 挑战数据
 */
export function getDailyChallenges() {
  const challenges = getLocalData(CHALLENGES_KEY, sampleChallenges)
  const userProgress = getLocalData(USER_PROGRESS_KEY, {})
  const completedChallenges = userProgress.completedChallenges || []
  
  return challenges.map(challenge => ({
    ...challenge,
    status: completedChallenges.includes(challenge.id) 
      ? CHALLENGE_STATUS.COMPLETED 
      : challenge.status
  }))
}

/**
 * 完成任务挑战
 * @param {string} challengeId - 挑战ID
 * @param {Array} answers - 用户答案
 * @returns {Object} 结果
 */
export function completeChallenge(challengeId, answers = []) {
  const challenges = getLocalData(CHALLENGES_KEY, sampleChallenges)
  const challenge = challenges.find(c => c.id === challengeId)
  
  if (!challenge) {
    return { success: false, message: '挑战不存在' }
  }
  
  // 计算得分
  let score = 0
  let total = 0
  
  if (challenge.questions) {
    total = challenge.questions.length
    challenge.questions.forEach((q, index) => {
      if (answers[index] === q.answer) {
        score++
      }
    })
  } else {
    // 无题目挑战直接完成
    score = 1
    total = 1
  }
  
  const passed = score >= total * 0.6 // 60%及格
  
  // 更新用户进度
  const userProgress = getLocalData(USER_PROGRESS_KEY, {})
  if (!userProgress.completedChallenges) {
    userProgress.completedChallenges = []
  }
  
  if (passed && !userProgress.completedChallenges.includes(challengeId)) {
    userProgress.completedChallenges.push(challengeId)
    userProgress.totalPoints = (userProgress.totalPoints || 0) + challenge.points
    
    // 更新连续挑战天数
    const today = new Date().toDateString()
    if (userProgress.lastChallengeDate === today) {
      userProgress.streakDays = (userProgress.streakDays || 0) + 1
    } else if (userProgress.lastChallengeDate) {
      const lastDate = new Date(userProgress.lastChallengeDate)
      const todayDate = new Date(today)
      const diffDays = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24))
      if (diffDays === 1) {
        userProgress.streakDays = (userProgress.streakDays || 0) + 1
      } else {
        userProgress.streakDays = 1
      }
    } else {
      userProgress.streakDays = 1
    }
    userProgress.lastChallengeDate = today
    
    saveLocalData(USER_PROGRESS_KEY, userProgress)
  }
  
  return {
    success: true,
    passed,
    score,
    total,
    points: passed ? challenge.points : 0,
    streakDays: userProgress.streakDays || 1
  }
}

/**
 * 获取用户学习进度
 * @returns {Object} 用户进度
 */
export function getUserProgress() {
  const progress = getLocalData(USER_PROGRESS_KEY, {
    totalPoints: 0,
    streakDays: 0,
    readCards: [],
    lessons: {},
    completedChallenges: []
  })
  
  // 计算统计
  const lessons = getLocalData(MICRO_LESSONS_KEY, sampleLessons)
  const completedLessons = lessons.filter(l => l.completed).length
  
  return {
    ...progress,
    totalLessons: lessons.length,
    completedLessons,
    totalCards: sampleDailyCards.length,
    readCardsCount: progress.readCards ? progress.readCards.length : 0
  }
}

/**
 * 重置挑战（用于新的一天）
 */
export function resetDailyChallenges() {
  const userProgress = getLocalData(USER_PROGRESS_KEY, {})
  const today = new Date().toDateString()
  
  if (userProgress.lastChallengeDate !== today) {
    // 新的一天，重置挑战状态
    userProgress.completedChallenges = []
    userProgress.lastChallengeDate = today
    saveLocalData(USER_PROGRESS_KEY, userProgress)
  }
  
  return true
}

export default {
  // 常量
  CARD_TYPES,
  DIFFICULTY,
  LESSON_TYPES,
  CHALLENGE_STATUS,
  
  // 函数
  getDailyCards,
  getCardById,
  markCardAsRead,
  getMicroLessons,
  getLessonById,
  updateLessonProgress,
  getQuickRefList,
  searchQuickRef,
  getFavoriteRefs,
  addFavoriteRef,
  removeFavoriteRef,
  isFavoriteRef,
  getDailyChallenges,
  completeChallenge,
  getUserProgress,
  resetDailyChallenges
}
