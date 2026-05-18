/**
 * V46 Reading Tracker Service
 * 阅读追踪服务 - 书籍管理、阅读打卡、阅读理解测试
 */

// ==================== 常量定义 ====================

// 阅读相关常量
export const READING_TYPES = {
  PICTURE_BOOK: 'picture_book',     // 绘本
  FAIRY_TALE: 'fairy_tale',         // 童话故事
  SCIENCE: 'science',               // 科普读物
  POETRY: 'poetry',                 // 诗歌散文
  NOVEL: 'novel',                   // 儿童小说
  COMIC: 'comic',                   // 漫画
  OTHER: 'other'                    // 其他
}

export const DIFFICULTY_LEVELS = {
  EASY: 1,     // 简单
  MEDIUM: 2,   // 中等
  HARD: 3      // 困难
}

export const AGE_GROUPS = {
  3_5: { id: '3_5', name: '3-5岁', min: 3, max: 5 },
  6_8: { id: '6_8', name: '6-8岁', min: 6, max: 8 },
  9_12: { id: '9_12', name: '9-12岁', min: 9, max: 12 }
}

// 阅读理解题型
export const QUESTION_TYPES = {
  CHOICE: 'choice',           // 选择题
  TRUE_FALSE: 'true_false',   // 判断题
  FILL_BLANK: 'fill_blank',   // 填空题
  OPEN: 'open'                // 开放题
}

// localStorage keys
const BOOKS_KEY = 'reading_books'
const READING_LOGS_KEY = 'reading_logs'
const READING_CHALLENGES_KEY = 'reading_challenges'
const READING_NOTES_KEY = 'reading_notes'
const READING_TESTS_KEY = 'reading_tests'

// ==================== 数据库表 ====================

export const READING_TABLES = {
  BOOKS: 'reading_books',
  READING_LOGS: 'reading_logs',
  READING_CHALLENGES: 'reading_challenges',
  CHALLENGE_PARTICIPANTS: 'reading_challenge_participants',
  READING_NOTES: 'reading_notes',
  READING_TESTS: 'reading_tests',
  COMPREHENSION_QUESTIONS: 'comprehension_questions'
}

// ==================== 辅助函数 ====================

function generateId(prefix = 'rd') {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).substr(2, 9)}`
}

function now() {
  return new Date().toISOString()
}

function formatDate(dateStr) {
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function getTodayStr() {
  return formatDate(now())
}

// ==================== 内置书籍数据 ====================

const BUILT_IN_BOOKS = [
  {
    id: 'book_1',
    title: '猜猜我有多爱你',
    author: '山姆·麦克布雷尼',
    cover: '/static/images/book-guess.jpg',
    type: READING_TYPES.PICTURE_BOOK,
    difficulty: DIFFICULTY_LEVELS.EASY,
    ageGroup: '3_5',
    pages: 32,
    description: '一只小兔子和大兔子比赛谁更爱对方的故事',
    tags: ['亲情', '爱', '温暖'],
    recommended: true
  },
  {
    id: 'book_2',
    title: '好饿的毛毛虫',
    author: '艾瑞·卡尔',
    cover: '/static/images/book-caterpillar.jpg',
    type: READING_TYPES.PICTURE_BOOK,
    difficulty: DIFFICULTY_LEVELS.EASY,
    ageGroup: '3_5',
    pages: 26,
    description: '一条毛毛虫从出生到变成蝴蝶的故事',
    tags: ['自然', '成长', '数学'],
    recommended: true
  },
  {
    id: 'book_3',
    title: '小王子',
    author: '安托万·德·圣-埃克苏佩里',
    cover: '/static/images/book-prince.jpg',
    type: READING_TYPES.FAIRY_TALE,
    difficulty: DIFFICULTY_LEVELS.MEDIUM,
    ageGroup: '6_8',
    pages: 96,
    description: '来自外星球的小王子的星际旅行故事',
    tags: ['哲理', '友谊', '想象'],
    recommended: true
  },
  {
    id: 'book_4',
    title: '窗边的小豆豆',
    author: '黑柳彻子',
    cover: '/static/images/book-little-bean.jpg',
    type: READING_TYPES.NOVEL,
    difficulty: DIFFICULTY_LEVELS.MEDIUM,
    ageGroup: '6_8',
    pages: 288,
    description: '小女孩小豆豆在巴学园的成长故事',
    tags: ['校园', '成长', '教育'],
    recommended: false
  },
  {
    id: 'book_5',
    title: '十万个为什么',
    author: '伊林',
    cover: '/static/images/book-why.jpg',
    type: READING_TYPES.SCIENCE,
    difficulty: DIFFICULTY_LEVELS.MEDIUM,
    ageGroup: '6_8',
    pages: 200,
    description: '解答生活中常见的科学问题',
    tags: ['科普', '科学', '知识'],
    recommended: true
  },
  {
    id: 'book_6',
    title: '夏洛的网',
    author: 'E.B.怀特',
    cover: '/static/images/book-charlotte.jpg',
    type: READING_TYPES.NOVEL,
    difficulty: DIFFICULTY_LEVELS.MEDIUM,
    ageGroup: '9_12',
    pages: 180,
    description: '小猪威尔伯和蜘蛛夏洛之间的友谊故事',
    tags: ['友谊', '生命', '成长'],
    recommended: true
  },
  {
    id: 'book_7',
    title: '绿野仙踪',
    author: '莱曼·弗兰克·鲍姆',
    cover: '/static/images/book-wizard.jpg',
    type: READING_TYPES.FAIRY_TALE,
    difficulty: DIFFICULTY_LEVELS.MEDIUM,
    ageGroup: '6_8',
    pages: 220,
    description: '多萝西的奇幻冒险之旅',
    tags: ['冒险', '勇气', '智慧'],
    recommended: false
  },
  {
    id: 'book_8',
    title: '西游记',
    author: '吴承恩',
    cover: '/static/images/book-journey-west.jpg',
    type: READING_TYPES.FAIRY_TALE,
    difficulty: DIFFICULTY_LEVELS.HARD,
    ageGroup: '9_12',
    pages: 400,
    description: '唐僧师徒四人取经的神话故事',
    tags: ['神话', '冒险', '经典'],
    recommended: true
  }
]

// ==================== 内置阅读理解题目 ====================

const BUILT_IN_QUESTIONS = [
  {
    id: 'q_1',
    bookId: 'book_1',
    question: '小兔子是怎么表达对大兔子的爱的？',
    type: QUESTION_TYPES.OPEN,
    options: [],
    answer: '小兔子把手臂张开，开得不能再开地说"我爱你有这么多"',
    points: 10
  },
  {
    id: 'q_2',
    bookId: 'book_1',
    question: '故事中谁的爱更深？',
    type: QUESTION_TYPES.CHOICE,
    options: ['小兔子', '大兔子', '一样深', '无法比较'],
    answer: '大兔子',
    points: 5
  },
  {
    id: 'q_3',
    bookId: 'book_2',
    question: '毛毛虫最后变成了什么？',
    type: QUESTION_TYPES.CHOICE,
    options: ['蜜蜂', '蝴蝶', '飞蛾', '蜻蜓'],
    answer: '蝴蝶',
    points: 5
  },
  {
    id: 'q_4',
    bookId: 'book_2',
    question: '毛毛虫星期一吃了几个苹果？',
    type: QUESTION_TYPES.FILL_BLANK,
    options: [],
    answer: '1',
    points: 5
  },
  {
    id: 'q_5',
    bookId: 'book_3',
    question: '小王子离开了哪个星球？',
    type: QUESTION_TYPES.FILL_BLANK,
    options: [],
    answer: 'B-612',
    points: 5
  },
  {
    id: 'q_6',
    bookId: 'book_3',
    question: '小王子在地球上看到了什么？',
    type: QUESTION_TYPES.OPEN,
    options: [],
    answer: '小王子看到了花园里五千朵玫瑰，以及一只狐狸',
    points: 10
  }
]

// ==================== 服务函数 ====================

/**
 * 获取所有书籍
 */
export function getBooks() {
  try {
    const stored = uni.getStorageSync(BOOKS_KEY)
    if (stored) {
      const customBooks = JSON.parse(stored)
      return [...BUILT_IN_BOOKS, ...customBooks]
    }
    return BUILT_IN_BOOKS
  } catch (e) {
    console.error('获取书籍列表失败:', e)
    return BUILT_IN_BOOKS
  }
}

/**
 * 根据条件筛选书籍
 */
export function filterBooks(filters = {}) {
  const allBooks = getBooks()
  return allBooks.filter(book => {
    if (filters.type && book.type !== filters.type) return false
    if (filters.difficulty && book.difficulty !== filters.difficulty) return false
    if (filters.ageGroup && book.ageGroup !== filters.ageGroup) return false
    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase()
      if (!book.title.toLowerCase().includes(keyword) &&
          !book.author.toLowerCase().includes(keyword) &&
          !book.description.toLowerCase().includes(keyword)) {
        return false
      }
    }
    return true
  })
}

/**
 * 获取推荐书籍
 */
export function getRecommendedBooks() {
  return getBooks().filter(book => book.recommended)
}

/**
 * 获取书籍详情
 */
export function getBookById(id) {
  const books = getBooks()
  return books.find(b => b.id === id) || null
}

/**
 * 添加自定义书籍
 */
export function addBook(bookData) {
  try {
    const stored = uni.getStorageSync(BOOKS_KEY)
    const customBooks = stored ? JSON.parse(stored) : []
    const newBook = {
      ...bookData,
      id: generateId('book'),
      createdAt: now()
    }
    customBooks.unshift(newBook)
    uni.setStorageSync(BOOKS_KEY, JSON.stringify(customBooks))
    return newBook
  } catch (e) {
    console.error('添加书籍失败:', e)
    return null
  }
}

/**
 * 更新书籍
 */
export function updateBook(id, updates) {
  try {
    const stored = uni.getStorageSync(BOOKS_KEY)
    const customBooks = stored ? JSON.parse(stored) : []
    const index = customBooks.findIndex(b => b.id === id)
    if (index !== -1) {
      customBooks[index] = { ...customBooks[index], ...updates }
      uni.setStorageSync(BOOKS_KEY, JSON.stringify(customBooks))
      return customBooks[index]
    }
    return null
  } catch (e) {
    console.error('更新书籍失败:', e)
    return null
  }
}

/**
 * 删除书籍
 */
export function deleteBook(id) {
  try {
    const stored = uni.getStorageSync(BOOKS_KEY)
    const customBooks = stored ? JSON.parse(stored) : []
    const filtered = customBooks.filter(b => b.id !== id)
    uni.setStorageSync(BOOKS_KEY, JSON.stringify(filtered))
    return true
  } catch (e) {
    console.error('删除书籍失败:', e)
    return false
  }
}

/**
 * 获取阅读理解题目
 */
export function getComprehensionQuestions(bookId) {
  return BUILT_IN_QUESTIONS.filter(q => q.bookId === bookId)
}

/**
 * 随机获取阅读理解题目
 */
export function getRandomQuestions(bookId, count = 3) {
  const questions = getComprehensionQuestions(bookId)
  const shuffled = [...questions].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

// ==================== 阅读打卡 ====================

/**
 * 获取阅读日志
 */
export function getReadingLogs(babyId) {
  try {
    const stored = uni.getStorageSync(READING_LOGS_KEY)
    if (!stored) return []
    const logs = JSON.parse(stored)
    return logs.filter(log => log.babyId === babyId).sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    )
  } catch (e) {
    console.error('获取阅读日志失败:', e)
    return []
  }
}

/**
 * 获取今日打卡记录
 */
export function getTodayLog(babyId) {
  const logs = getReadingLogs(babyId)
  const today = getTodayStr()
  return logs.find(log => log.date === today) || null
}

/**
 * 记录阅读打卡
 */
export function logReading(logData) {
  try {
    const stored = uni.getStorageSync(READING_LOGS_KEY)
    const logs = stored ? JSON.parse(stored) : []
    const today = getTodayStr()
    
    // 检查今日是否已打卡
    const existingIndex = logs.findIndex(
      log => log.babyId === logData.babyId && log.date === today
    )
    
    const newLog = {
      id: generateId('log'),
      babyId: logData.babyId,
      bookId: logData.bookId,
      bookTitle: logData.bookTitle || '',
      date: today,
      pagesRead: logData.pagesRead || 0,
      duration: logData.duration || 0, // 分钟
      startPage: logData.startPage || 0,
      endPage: logData.endPage || 0,
      note: logData.note || '',
      createdAt: now()
    }
    
    if (existingIndex !== -1) {
      // 更新已有记录
      newLog.id = logs[existingIndex].id
      logs[existingIndex] = newLog
    } else {
      logs.unshift(newLog)
    }
    
    uni.setStorageSync(READING_LOGS_KEY, JSON.stringify(logs))
    return newLog
  } catch (e) {
    console.error('记录阅读打卡失败:', e)
    return null
  }
}

/**
 * 获取连续打卡天数
 */
export function getStreakDays(babyId) {
  const logs = getReadingLogs(babyId)
  if (logs.length === 0) return 0
  
  let streak = 0
  let currentDate = new Date()
  
  // 按日期降序排列
  const sortedDates = logs.map(l => l.date).sort((a, b) => new Date(b) - new Date(a))
  
  for (let i = 0; i < sortedDates.length; i++) {
    const expectedDate = new Date(currentDate)
    expectedDate.setDate(expectedDate.getDate() - i)
    const expectedStr = formatDate(expectedDate.toISOString())
    
    if (sortedDates[i] === expectedStr) {
      streak++
    } else {
      break
    }
  }
  
  return streak
}

/**
 * 获取阅读时长统计
 */
export function getReadingStats(babyId, period = 'week') {
  const logs = getReadingLogs(babyId)
  const now = new Date()
  let startDate = new Date(now)
  
  if (period === 'week') {
    startDate.setDate(startDate.getDate() - 7)
  } else if (period === 'month') {
    startDate.setMonth(startDate.getMonth() - 1)
  } else {
    startDate = new Date(0) // all time
  }
  
  const filteredLogs = logs.filter(log => new Date(log.date) >= startDate)
  
  const totalMinutes = filteredLogs.reduce((sum, log) => sum + (log.duration || 0), 0)
  const totalPages = filteredLogs.reduce((sum, log) => sum + (log.pagesRead || 0), 0)
  const daysRead = filteredLogs.length
  const avgMinutesPerDay = daysRead > 0 ? Math.round(totalMinutes / daysRead) : 0
  
  return {
    totalMinutes,
    totalPages,
    daysRead,
    avgMinutesPerDay,
    period
  }
}

// ==================== 阅读笔记 ====================

/**
 * 获取阅读笔记
 */
export function getReadingNotes(babyId, bookId = null) {
  try {
    const stored = uni.getStorageSync(READING_NOTES_KEY)
    if (!stored) return []
    let notes = JSON.parse(stored)
    notes = notes.filter(note => note.babyId === babyId)
    if (bookId) {
      notes = notes.filter(note => note.bookId === bookId)
    }
    return notes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  } catch (e) {
    console.error('获取阅读笔记失败:', e)
    return []
  }
}

/**
 * 添加阅读笔记
 */
export function addReadingNote(noteData) {
  try {
    const stored = uni.getStorageSync(READING_NOTES_KEY)
    const notes = stored ? JSON.parse(stored) : []
    const newNote = {
      id: generateId('note'),
      babyId: noteData.babyId,
      bookId: noteData.bookId,
      bookTitle: noteData.bookTitle || '',
      chapter: noteData.chapter || '',
      content: noteData.content,
      mood: noteData.mood || '', // 读后感心情
      createdAt: now()
    }
    notes.unshift(newNote)
    uni.setStorageSync(READING_NOTES_KEY, JSON.stringify(notes))
    return newNote
  } catch (e) {
    console.error('添加阅读笔记失败:', e)
    return null
  }
}

/**
 * 更新阅读笔记
 */
export function updateReadingNote(id, updates) {
  try {
    const stored = uni.getStorageSync(READING_NOTES_KEY)
    const notes = stored ? JSON.parse(stored) : []
    const index = notes.findIndex(n => n.id === id)
    if (index !== -1) {
      notes[index] = { ...notes[index], ...updates }
      uni.setStorageSync(READING_NOTES_KEY, JSON.stringify(notes))
      return notes[index]
    }
    return null
  } catch (e) {
    console.error('更新阅读笔记失败:', e)
    return null
  }
}

/**
 * 删除阅读笔记
 */
export function deleteReadingNote(id) {
  try {
    const stored = uni.getStorageSync(READING_NOTES_KEY)
    const notes = stored ? JSON.parse(stored) : []
    const filtered = notes.filter(n => n.id !== id)
    uni.setStorageSync(READING_NOTES_KEY, JSON.stringify(filtered))
    return true
  } catch (e) {
    console.error('删除阅读笔记失败:', e)
    return false
  }
}

// ==================== 阅读理解测试 ====================

/**
 * 获取阅读理解测试结果
 */
export function getReadingTests(babyId) {
  try {
    const stored = uni.getStorageSync(READING_TESTS_KEY)
    if (!stored) return []
    return JSON.parse(stored).filter(test => test.babyId === babyId)
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
  } catch (e) {
    console.error('获取阅读测试失败:', e)
    return []
  }
}

/**
 * 提交阅读理解测试
 */
export function submitReadingTest(testData) {
  try {
    const stored = uni.getStorageSync(READING_TESTS_KEY)
    const tests = stored ? JSON.parse(stored) : []
    
    const correctCount = testData.answers.filter((ans, idx) => {
      const question = testData.questions[idx]
      return ans.selected === question.answer
    }).length
    
    const newTest = {
      id: generateId('test'),
      babyId: testData.babyId,
      bookId: testData.bookId,
      bookTitle: testData.bookTitle || '',
      questions: testData.questions,
      answers: testData.answers,
      correctCount,
      totalCount: testData.questions.length,
      score: Math.round((correctCount / testData.questions.length) * 100),
      completedAt: now()
    }
    
    tests.unshift(newTest)
    uni.setStorageSync(READING_TESTS_KEY, JSON.stringify(tests))
    return newTest
  } catch (e) {
    console.error('提交阅读测试失败:', e)
    return null
  }
}

// ==================== 阅读挑战 ====================

/**
 * 获取阅读挑战列表
 */
export function getReadingChallenges() {
  try {
    const stored = uni.getStorageSync(READING_CHALLENGES_KEY)
    if (stored) return JSON.parse(stored)
    
    // 默认挑战
    return [
      {
        id: 'challenge_1',
        title: '21天阅读挑战',
        description: '连续21天阅读，培养良好阅读习惯',
        type: 'streak',
        targetDays: 21,
        targetPages: 0,
        targetMinutes: 0,
        points: 100,
        startDate: formatDate(now()),
        endDate: formatDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
        status: 'active'
      },
      {
        id: 'challenge_2',
        title: '阅读小达人',
        description: '本月阅读5本书',
        type: 'books',
        targetDays: 0,
        targetPages: 0,
        targetBooks: 5,
        points: 80,
        startDate: formatDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1)),
        endDate: formatDate(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)),
        status: 'active'
      },
      {
        id: 'challenge_3',
        title: '阅读马拉松',
        description: '累计阅读1000分钟',
        type: 'time',
        targetDays: 0,
        targetPages: 0,
        targetMinutes: 1000,
        points: 120,
        startDate: formatDate(now()),
        endDate: formatDate(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)),
        status: 'active'
      }
    ]
  } catch (e) {
    console.error('获取阅读挑战失败:', e)
    return []
  }
}

/**
 * 加入阅读挑战
 */
export function joinChallenge(challengeId, babyId) {
  try {
    const challenges = getReadingChallenges()
    const challenge = challenges.find(c => c.id === challengeId)
    if (!challenge) return null
    
    // 初始化参与进度
    const progressKey = `challenge_progress_${challengeId}_${babyId}`
    const progress = {
      challengeId,
      babyId,
      currentValue: 0,
      joinedAt: now(),
      completed: false
    }
    
    uni.setStorageSync(progressKey, JSON.stringify(progress))
    return progress
  } catch (e) {
    console.error('加入挑战失败:', e)
    return null
  }
}

/**
 * 获取挑战进度
 */
export function getChallengeProgress(challengeId, babyId) {
  try {
    const progressKey = `challenge_progress_${challengeId}_${babyId}`
    const stored = uni.getStorageSync(progressKey)
    if (!stored) return null
    return JSON.parse(stored)
  } catch (e) {
    return null
  }
}

/**
 * 更新挑战进度
 */
export function updateChallengeProgress(challengeId, babyId, value) {
  try {
    const progressKey = `challenge_progress_${challengeId}_${babyId}`
    const stored = uni.getStorageSync(progressKey)
    if (!stored) return null
    
    const progress = JSON.parse(stored)
    progress.currentValue = value
    
    // 检查是否完成
    const challenges = getReadingChallenges()
    const challenge = challenges.find(c => c.id === challengeId)
    if (challenge) {
      let target = 0
      if (challenge.type === 'streak') target = challenge.targetDays
      else if (challenge.type === 'books') target = challenge.targetBooks
      else if (challenge.type === 'time') target = challenge.targetMinutes
      
      if (value >= target) {
        progress.completed = true
        progress.completedAt = now()
      }
    }
    
    uni.setStorageSync(progressKey, JSON.stringify(progress))
    return progress
  } catch (e) {
    console.error('更新挑战进度失败:', e)
    return null
  }
}

// ==================== 导出 ====================

export default {
  READING_TYPES,
  DIFFICULTY_LEVELS,
  AGE_GROUPS,
  QUESTION_TYPES,
  getBooks,
  filterBooks,
  getRecommendedBooks,
  getBookById,
  addBook,
  updateBook,
  deleteBook,
  getComprehensionQuestions,
  getRandomQuestions,
  getReadingLogs,
  getTodayLog,
  logReading,
  getStreakDays,
  getReadingStats,
  getReadingNotes,
  addReadingNote,
  updateReadingNote,
  deleteReadingNote,
  getReadingTests,
  submitReadingTest,
  getReadingChallenges,
  joinChallenge,
  getChallengeProgress,
  updateChallengeProgress
}
