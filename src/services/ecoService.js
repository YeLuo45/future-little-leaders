/**
 * V61 Eco Service
 * 环保意识教育服务 - 环保任务、环保知识、绿色生活挑战
 */

const STORAGE_KEY = 'eco_data'

// 默认数据
const getDefaultData = () => ({
  tasks: [],
  knowledge: [],
  challenges: [],
  userStats: {
    totalPoints: 0,
    completedTasks: 0,
    totalKnowledgeLearned: 0,
    challengesCompleted: 0,
    waterSaved: 0,
    electricitySaved: 0,
    carbonReduced: 0
  },
  badges: []
})

// 获取本地数据
const getLocalData = () => {
  try {
    const data = uni.getStorageSync(STORAGE_KEY)
    if (data) {
      return { ...getDefaultData(), ...JSON.parse(data) }
    }
  } catch (e) {
    console.error('Failed to load eco data:', e)
  }
  return getDefaultData()
}

// 保存数据到本地
const saveData = (data) => {
  try {
    uni.setStorageSync(STORAGE_KEY, JSON.stringify(data))
    return true
  } catch (e) {
    console.error('Failed to save eco data:', e)
    return false
  }
}

// 环保知识库
const ecoKnowledgeBase = [
  {
    id: 'eco-1',
    title: '什么是环保？',
    content: '环保就是保护环境，减少污染，节约资源，让我们的地球更美好。',
    category: '基础概念',
    ageRange: '6-8',
    points: 5
  },
  {
    id: 'eco-2',
    title: '为什么要垃圾分类？',
    content: '垃圾分类可以让可回收的物品再利用，减少垃圾填埋和焚烧，保护土地和空气。',
    category: '垃圾分类',
    ageRange: '7-9',
    points: 5
  },
  {
    id: 'eco-3',
    title: '节约用水小技巧',
    content: '洗手时水龙头不要开太大，洗完手要及时关水，一水多用比如用洗菜水浇花。',
    category: '节约用水',
    ageRange: '6-10',
    points: 8
  },
  {
    id: 'eco-4',
    title: '节约用电好习惯',
    content: '离开房间要关灯，少开空调多通风，不用电器要拔插头。',
    category: '节约用电',
    ageRange: '6-10',
    points: 8
  },
  {
    id: 'eco-5',
    title: '什么是碳排放？',
    content: '碳排放就是指煤炭、石油、天然气等燃料燃烧后产生的二氧化碳。减少碳排放可以帮助应对气候变化。',
    category: '低碳生活',
    ageRange: '9-12',
    points: 10
  },
  {
    id: 'eco-6',
    title: '绿色出行',
    content: '出门尽量走路、骑自行车或坐公交，少坐私家车，减少尾气排放。',
    category: '低碳生活',
    ageRange: '7-12',
    points: 8
  },
  {
    id: 'eco-7',
    title: '减少塑料使用',
    content: '少用一次性塑料杯、塑料袋和塑料吸管，多用布袋、可重复使用的杯子。',
    category: '减塑行动',
    ageRange: '6-12',
    points: 8
  },
  {
    id: 'eco-8',
    title: '保护森林',
    content: '森林是地球的肺，少用纸张，双面打印，不买木制野生动物产品。',
    category: '生态保护',
    ageRange: '8-12',
    points: 10
  },
  {
    id: 'eco-9',
    title: '保护野生动物',
    content: '不买卖野生动物，不吃野味，不破坏它们的栖息地。',
    category: '生态保护',
    ageRange: '6-12',
    points: 8
  },
  {
    id: 'eco-10',
    title: '什么是可再生能源？',
    content: '太阳能、风能、水能等不会用完的能源就是可再生能源，它们比烧煤更环保。',
    category: '能源知识',
    ageRange: '10-12',
    points: 10
  }
]

// 环保任务模板
const taskTemplates = [
  {
    id: 'task-1',
    title: '完成垃圾分类',
    description: '将家里的垃圾正确分类投放',
    category: '垃圾分类',
    points: 10,
    difficulty: 'easy'
  },
  {
    id: 'task-2',
    title: '关灯一小时',
    description: '每天减少一小时不必要的用电',
    category: '节约用电',
    points: 5,
    difficulty: 'easy'
  },
  {
    id: 'task-3',
    title: '步行上学',
    description: '选择步行或自行车代替私家车出行',
    category: '低碳出行',
    points: 15,
    difficulty: 'medium'
  },
  {
    id: 'task-4',
    title: '收集可回收物',
    description: '收集家里的塑料瓶、纸箱等送到回收站',
    category: '资源回收',
    points: 10,
    difficulty: 'easy'
  },
  {
    id: 'task-5',
    title: '节约用水行动',
    description: '今天洗澡时间减少5分钟',
    category: '节约用水',
    points: 8,
    difficulty: 'easy'
  },
  {
    id: 'task-6',
    title: '种植绿植',
    description: '在家里或学校种植一株植物',
    category: '绿色生活',
    points: 20,
    difficulty: 'medium'
  },
  {
    id: 'task-7',
    title: '环保宣传员',
    description: '向家人宣传一条环保小知识',
    category: '环保教育',
    points: 15,
    difficulty: 'medium'
  },
  {
    id: 'task-8',
    title: '减少塑料',
    description: '今天不使用任何一次性塑料制品',
    category: '减塑行动',
    points: 12,
    difficulty: 'medium'
  },
  {
    id: 'task-9',
    title: '光盘行动',
    description: '今天吃饭不剩饭剩菜',
    category: '绿色生活',
    points: 8,
    difficulty: 'easy'
  },
  {
    id: 'task-10',
    title: '环保小日记',
    description: '记录一天的环保行为和感受',
    category: '环保教育',
    points: 15,
    difficulty: 'medium'
  }
]

// 绿色挑战模板
const challengeTemplates = [
  {
    id: 'challenge-1',
    title: '一周节水挑战',
    description: '每天记录用水量，争取比上周减少10%',
    category: '节水',
    targetValue: 10,
    targetUnit: '%',
    currentValue: 0,
    duration: 7,
    points: 50,
    badge: 'water-saver'
  },
  {
    id: 'challenge-2',
    title: '一周节电挑战',
    description: '每天减少不必要的用电，争取比上周减少10%',
    category: '节电',
    targetValue: 10,
    targetUnit: '%',
    currentValue: 0,
    duration: 7,
    points: 50,
    badge: 'energy-saver'
  },
  {
    id: 'challenge-3',
    title: '一周低碳出行',
    description: '一周内至少5天步行或骑行上学',
    category: '低碳',
    targetValue: 5,
    targetUnit: '天',
    currentValue: 0,
    duration: 7,
    points: 60,
    badge: 'green-traveler'
  },
  {
    id: 'challenge-4',
    title: '零塑料周',
    description: '一周内不使用任何一次性塑料制品',
    category: '减塑',
    targetValue: 7,
    targetUnit: '天',
    currentValue: 0,
    duration: 7,
    points: 80,
    badge: 'plastic-fighter'
  },
  {
    id: 'challenge-5',
    title: '垃圾分类达人',
    description: '连续7天正确进行垃圾分类',
    category: '分类',
    targetValue: 7,
    targetUnit: '天',
    currentValue: 0,
    duration: 7,
    points: 50,
    badge: 'sort-master'
  }
]

// 徽章定义
const badgeDefinitions = {
  'water-saver': { name: '节水达人', icon: '💧', description: '完成节水挑战' },
  'energy-saver': { name: '节电先锋', icon: '⚡', description: '完成节电挑战' },
  'green-traveler': { name: '绿色出行家', icon: '🚲', description: '完成低碳出行挑战' },
  'plastic-fighter': { name: '减塑战士', icon: '🌱', description: '完成零塑料挑战' },
  'sort-master': { name: '分类大师', icon: '♻️', description: '成为垃圾分类达人' },
  'eco-warrior': { name: '环保小卫士', icon: '🛡️', description: '累计获得500环保积分' },
  'eco-champion': { name: '环保冠军', icon: '🏆', description: '累计获得1000环保积分' }
}

export default {
  // 获取所有数据
  getData() {
    return getLocalData()
  },

  // ==================== 环保任务 ====================

  // 获取任务列表
  getTasks() {
    return getLocalData().tasks
  },

  // 获取每日任务
  getDailyTasks() {
    const data = getLocalData()
    const today = new Date().toDateString()
    const dailyTasks = data.tasks.filter(t => t.date === today)
    
    if (dailyTasks.length === 0) {
      // 生成每日任务
      return this.generateDailyTasks()
    }
    return dailyTasks
  },

  // 生成每日任务
  generateDailyTasks() {
    const shuffled = [...taskTemplates].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, 3).map(template => ({
      ...template,
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      date: new Date().toDateString(),
      completed: false,
      completedTime: null
    }))
  },

  // 接受任务
  acceptTask(taskId) {
    const data = getLocalData()
    const task = data.tasks.find(t => t.id === taskId)
    if (task && !task.accepted) {
      task.accepted = true
      saveData(data)
    }
    return task
  },

  // 完成任务
  completeTask(taskId) {
    const data = getLocalData()
    const task = data.tasks.find(t => t.id === taskId)
    if (!task) return null
    
    task.completed = true
    task.completedTime = new Date().toISOString()
    
    // 更新用户统计
    data.userStats.totalPoints += task.points
    data.userStats.completedTasks++
    
    // 检查徽章
    this.checkAndAwardBadges(data)
    
    saveData(data)
    return task
  },

  // 添加任务记录
  addTaskRecord(task) {
    const data = getLocalData()
    data.tasks.push({
      ...task,
      id: task.id || `task-${Date.now()}`,
      accepted: false,
      completed: false,
      completedTime: null
    })
    saveData(data)
    return task
  },

  // 获取任务统计
  getTaskStats() {
    const data = getLocalData()
    const today = new Date().toDateString()
    const todayTasks = data.tasks.filter(t => t.date === today)
    const todayCompleted = todayTasks.filter(t => t.completed).length
    
    return {
      totalCompleted: data.userStats.completedTasks,
      todayTotal: todayTasks.length,
      todayCompleted,
      totalPoints: data.userStats.totalPoints
    }
  },

  // ==================== 环保知识 ====================

  // 获取环保知识
  getKnowledge(category = null) {
    if (category) {
      return ecoKnowledgeBase.filter(k => k.category === category)
    }
    return ecoKnowledgeBase
  },

  // 获取知识分类
  getKnowledgeCategories() {
    const categories = [...new Set(ecoKnowledgeBase.map(k => k.category))]
    return categories
  },

  // 标记知识已学习
  markKnowledgeLearned(knowledgeId) {
    const data = getLocalData()
    if (!data.knowledge.includes(knowledgeId)) {
      data.knowledge.push(knowledgeId)
      const knowledge = ecoKnowledgeBase.find(k => k.id === knowledgeId)
      if (knowledge) {
        data.userStats.totalPoints += knowledge.points
        data.userStats.totalKnowledgeLearned++
      }
      this.checkAndAwardBadges(data)
      saveData(data)
    }
    return true
  },

  // 获取已学习的知识
  getLearnedKnowledge() {
    return getLocalData().knowledge
  },

  // 获取知识测试题目
  getKnowledgeQuiz() {
    return [
      {
        id: 'quiz-eco-1',
        question: '以下哪种行为最环保？',
        options: [
          { text: '随手关灯', correct: true },
          { text: '开空调睡觉', correct: false },
          { text: '长流水洗手', correct: false },
          { text: '开车上学', correct: false }
        ],
        explanation: '随手关灯可以节约用电，减少碳排放。'
      },
      {
        id: 'quiz-eco-2',
        question: '塑料瓶属于什么垃圾？',
        options: [
          { text: '厨余垃圾', correct: false },
          { text: '可回收垃圾', correct: true },
          { text: '其他垃圾', correct: false },
          { text: '有害垃圾', correct: false }
        ],
        explanation: '塑料瓶是可以回收再利用的，属于可回收垃圾。'
      },
      {
        id: 'quiz-eco-3',
        question: '一水多用是哪项？',
        options: [
          { text: '用矿泉水浇花', correct: false },
          { text: '用洗菜水冲厕所', correct: true },
          { text: '用饮水机洗手', correct: false },
          { text: '用洗澡水喝', correct: false }
        ],
        explanation: '洗菜水用来冲厕所是一水多用的好例子。'
      },
      {
        id: 'quiz-eco-4',
        question: '以下哪种出行方式最环保？',
        options: [
          { text: '骑自行车', correct: true },
          { text: '开私家车', correct: false },
          { text: '坐飞机', correct: false },
          { text: '乘地铁', correct: false }
        ],
        explanation: '骑自行车不产生尾气排放，是最环保的出行方式。'
      },
      {
        id: 'quiz-eco-5',
        question: '节约一度电可以减少多少碳排放？',
        options: [
          { text: '0.1千克', correct: false },
          { text: '0.5千克', correct: false },
          { text: '0.8千克左右', correct: true },
          { text: '2千克', correct: false }
        ],
        explanation: '节约一度电可以减少约0.8千克碳排放。'
      }
    ]
  },

  // ==================== 绿色挑战 ====================

  // 获取挑战列表
  getChallenges() {
    const data = getLocalData()
    // 合并模板和数据
    return challengeTemplates.map(template => {
      const userChallenge = data.challenges.find(c => c.templateId === template.id)
      return userChallenge ? { ...template, ...userChallenge } : template
    })
  },

  // 开始挑战
  startChallenge(challengeId) {
    const data = getLocalData()
    const existing = data.challenges.find(c => c.templateId === challengeId)
    if (existing) return existing
    
    const template = challengeTemplates.find(t => t.id === challengeId)
    if (!template) return null
    
    const challenge = {
      templateId: template.id,
      currentValue: 0,
      startDate: new Date().toISOString(),
      status: 'in_progress',
      daysCompleted: []
    }
    
    data.challenges.push(challenge)
    saveData(data)
    return { ...template, ...challenge }
  },

  // 更新挑战进度
  updateChallengeProgress(challengeId, value) {
    const data = getLocalData()
    const challenge = data.challenges.find(c => c.templateId === challengeId)
    if (!challenge) return null
    
    challenge.currentValue = value
    
    // 检查是否完成
    const template = challengeTemplates.find(t => t.id === challengeId)
    if (template && challenge.currentValue >= template.targetValue) {
      challenge.status = 'completed'
      challenge.completedDate = new Date().toISOString()
      data.userStats.totalPoints += template.points
      data.userStats.challengesCompleted++
      
      // 奖励徽章
      if (template.badge && !data.badges.includes(template.badge)) {
        data.badges.push(template.badge)
      }
    }
    
    saveData(data)
    return challenge
  },

  // 记录挑战日完成
  recordChallengeDay(challengeId, dayIndex) {
    const data = getLocalData()
    const challenge = data.challenges.find(c => c.templateId === challengeId)
    if (!challenge || challenge.daysCompleted.includes(dayIndex)) return challenge
    
    challenge.daysCompleted.push(dayIndex)
    challenge.currentValue = challenge.daysCompleted.length
    
    // 检查是否完成
    const template = challengeTemplates.find(t => t.id === challengeId)
    if (template && challenge.currentValue >= template.targetValue) {
      challenge.status = 'completed'
      challenge.completedDate = new Date().toISOString()
      if (!challenge.pointsEarned) {
        data.userStats.totalPoints += template.points
        challenge.pointsEarned = template.points
      }
      data.userStats.challengesCompleted++
      
      if (template.badge && !data.badges.includes(template.badge)) {
        data.badges.push(template.badge)
      }
    }
    
    saveData(data)
    return challenge
  },

  // 获取用户挑战进度
  getChallengeProgress(challengeId) {
    const data = getLocalData()
    return data.challenges.find(c => c.templateId === challengeId)
  },

  // ==================== 环保统计 ====================

  // 获取用户统计
  getUserStats() {
    return getLocalData().userStats
  },

  // 更新环保数据统计
  updateEcoStats(type, value) {
    const data = getLocalData()
    if (type === 'water') {
      data.userStats.waterSaved += value
    } else if (type === 'electricity') {
      data.userStats.electricitySaved += value
    } else if (type === 'carbon') {
      data.userStats.carbonReduced += value
    }
    saveData(data)
    return data.userStats
  },

  // ==================== 徽章系统 ====================

  // 获取徽章列表
  getBadges() {
    const data = getLocalData()
    return data.badges.map(badgeId => ({
      ...badgeDefinitions[badgeId],
      id: badgeId,
      earned: true
    }))
  },

  // 检查并奖励徽章
  checkAndAwardBadges(data) {
    const stats = data.userStats
    
    // 环保小卫士 - 500积分
    if (stats.totalPoints >= 500 && !data.badges.includes('eco-warrior')) {
      data.badges.push('eco-warrior')
    }
    
    // 环保冠军 - 1000积分
    if (stats.totalPoints >= 1000 && !data.badges.includes('eco-champion')) {
      data.badges.push('eco-champion')
    }
  },

  // 获取徽章定义
  getBadgeDefinitions() {
    return badgeDefinitions
  },

  // ==================== 排行榜 ====================

  // 获取排行榜（本地模拟）
  getLeaderboard(type = 'points') {
    // 本地排行榜，实际项目中应该是服务端数据
    const data = getLocalData()
    const mockLeaderboard = [
      { name: '小明', points: 850, avatar: '🧒' },
      { name: '小红', points: 720, avatar: '👧' },
      { name: '小华', points: 580, avatar: '👦' },
      { name: '小军', points: 450, avatar: '🧒' },
      { name: '小丽', points: 320, avatar: '👧' }
    ]
    
    // 添加当前用户
    const currentUser = {
      name: '我',
      points: data.userStats.totalPoints,
      avatar: '🌟',
      isCurrentUser: true
    }
    
    mockLeaderboard.push(currentUser)
    mockLeaderboard.sort((a, b) => b.points - a.points)
    
    return mockLeaderboard.map((item, index) => ({
      ...item,
      rank: index + 1
    }))
  },

  // 清空所有数据
  clearAllData() {
    try {
      uni.removeStorageSync(STORAGE_KEY)
      return true
    } catch (e) {
      return false
    }
  }
}
