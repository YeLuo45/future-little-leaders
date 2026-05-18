// src/services/aiCompanionService.js
// V34 AI Companion 服务 - 模拟 LLM 对话引擎（支持多轮上下文）

import { getBabyInfo, getTaskList, getAchievementList } from './familyService.js'

// ==================== 常量定义 ====================

// 学科类型
const SUBJECTS = {
  chinese: { name: '语文', icon: '📝', topics: ['拼音', '造句', '阅读理解', '写字'] },
  math: { name: '数学', icon: '🔢', topics: ['加减法', '乘法', '应用题', '几何'] },
  english: { name: '英语', icon: '🔤', topics: ['单词', '口语', '听力', '阅读'] }
}

// 心情类型
const MOODS = {
  happy: { label: '开心', emoji: '😊', color: '#FCD34D' },
  encouraging: { label: '鼓励中', emoji: '🤗', color: '#34D399' },
  excited: { label: '兴奋', emoji: '🤩', color: '#F472B6' },
  calm: { label: '平静', emoji: '😌', color: '#60A5FA' },
  sad: { label: '难过', emoji: '😢', color: '#9CA3AF' },
  worried: { label: '担心', emoji: '😟', color: '#9CA3AF' }
}

// 鼓励模板
const ENCOURAGEMENT_TEMPLATES = {
  taskComplete: [
    '太棒了！完成 {task}，你真是个小能手！🌟',
    '完成啦！{task} 做得很棒，继续加油！',
    '嗯！{task} 完成了，为你骄傲！'
  ],
  streakContinue: [
    '哇！已经连续 {days} 天打卡了，你太厉害了！',
    '{days} 天坚持！你是我见过最努力的宝贝！',
    '坚持第 {days} 天！继续保持哦~'
  ],
  achievementUnlock: [
    '🎉 恭喜解锁 {achievement}！太骄傲了！',
    '新成就达成：{achievement}！你是最棒的！',
    '{achievement} 获得！你真的好厉害！'
  ],
  encouragement: [
    '别急，慢慢来，我相信你可以的！💪',
    '遇到困难了吗？记住，失败是成功之母哦~',
    '加油！每一步都是进步！'
  ],
  comfort: [
    '难过的时候，告诉我，我在听呢...🤗',
    '没关系，谁都有不开心的时候~',
    '我在这里陪着你，一切都会好起来的~'
  ]
}

// ==================== 辅助函数 ====================

/**
 * 从本地存储获取宝宝信息
 */
function getBabiesFromStorage() {
  try {
    const babies = uni.getStorageSync('babies') || []
    return Array.isArray(babies) ? babies : []
  } catch (e) {
    return []
  }
}

/**
 * 获取任务列表
 */
function getTaskListFromStorage() {
  try {
    const tasks = uni.getStorageSync('tasks') || []
    return Array.isArray(tasks) ? tasks : []
  } catch (e) {
    return []
  }
}

/**
 * 获取成就列表
 */
function getAchievementsFromStorage() {
  try {
    const achievements = uni.getStorageSync('achievements') || []
    return Array.isArray(achievements) ? achievements : []
  } catch (e) {
    return []
  }
}

/**
 * 随机选择数组元素
 */
function randomPick(arr) {
  if (!arr || arr.length === 0) return ''
  return arr[Math.floor(Math.random() * arr.length)]
}

/**
 * 格式化字符串模板
 */
function formatTemplate(template, data) {
  let result = template
  Object.keys(data).forEach(key => {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), data[key])
  })
  return result
}

/**
 * 生成唯一 ID
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
}

/**
 * 检测关键词
 */
function containsKeywords(text, keywords) {
  const lowerText = text.toLowerCase()
  return keywords.some(kw => lowerText.includes(kw))
}

/**
 * 检测语言（中文/数学/英语相关）
 */
function detectSubject(text) {
  const chineseKeywords = ['字', '词', '句', '拼音', '阅读', '写作', '语文', '课文', '背诵']
  const mathKeywords = ['数学', '计算', '加', '减', '乘', '除', '等于', '题', '数字']
  const englishKeywords = ['英语', '英文', '单词', 'word', 'speak', '口语', '字母']

  if (containsKeywords(text, chineseKeywords)) return 'chinese'
  if (containsKeywords(text, mathKeywords)) return 'math'
  if (containsKeywords(text, englishKeywords)) return 'english'
  return null
}

// ==================== 心情追踪 ====================

/**
 * 感知用户心情
 * @param {string} text - 用户输入
 * @returns {object} 心情状态
 */
export function detectMood(text) {
  const lowerText = text.toLowerCase()
  
  // 负面情绪关键词
  const sadKeywords = ['难过', '伤心', '哭', '不爽', '郁闷', '烦躁', '生气', '讨厌', '不开心', '累', '疲惫']
  const worryKeywords = ['担心', '害怕', '紧张', '焦虑', '不安', '怕', '不敢', '不敢']
  const happyKeywords = ['开心', '高兴', '快乐', '棒', '厉害', '喜欢', '爱', '太好了', '开心', '兴奋']
  
  if (containsKeywords(text, sadKeywords)) {
    return { mood: 'sad', confidence: 0.8 }
  }
  if (containsKeywords(text, worryKeywords)) {
    return { mood: 'worried', confidence: 0.7 }
  }
  if (containsKeywords(text, happyKeywords)) {
    return { mood: 'happy', confidence: 0.8 }
  }
  
  return { mood: 'happy', confidence: 0.3 }
}

/**
 * 获取心情对应的回复
 */
function getMoodResponse(mood) {
  const templates = ENCOURAGEMENT_TEMPLATES.comfort
  if (mood === 'sad' || mood === 'worried') {
    return randomPick(templates)
  }
  return null
}

// ==================== AI 对话核心 ====================

/**
 * 生成 AI 回复（Mock LLM）
 * @param {string} userMessage - 用户消息
 * @param {array} context - 对话上下文
 * @param {object} options - 配置选项
 * @returns {object} { reply, mood, actions }
 */
export function chatWithBuddy(userMessage, context = [], options = {}) {
  const text = userMessage.trim()
  
  // 检测心情
  const { mood } = detectMood(text)
  
  // 心情不好时，优先安慰
  if (mood === 'sad' || mood === 'worried') {
    return {
      reply: getMoodResponse(mood),
      mood: mood,
      actions: []
    }
  }
  
  // 检测学科类型
  const subject = detectSubject(text)
  
  let reply = ''
  let actions = []
  
  // 学科辅导回复
  if (subject) {
    reply = generateSubjectResponse(text, subject)
  }
  // 日常对话
  else if (containsKeywords(text, ['你好', 'hi', 'hello', '嗨', '在吗'])) {
    reply = randomPick([
      '你好呀！我是你的 AI 伙伴，今天想聊些什么呢？',
      '嗨！我在这里呢！有什么想跟我说的吗？',
      '你好呀！今天过得怎么样？'
    ])
  }
  // 任务相关
  else if (containsKeywords(text, ['任务', '作业', '练习', '学习', '完成'])) {
    reply = generateTaskResponse(text)
  }
  // 成就相关
  else if (containsKeywords(text, ['成就', '徽章', '奖励', '解锁'])) {
    reply = generateAchievementResponse()
  }
  // 打卡相关
  else if (containsKeywords(text, ['打卡', '坚持', '连续', ' streak'])) {
    reply = generateStreakResponse()
  }
  // 求助/困难
  else if (containsKeywords(text, ['不会', '不懂', '难', '帮帮我', 'help'])) {
    reply = generateHelpResponse()
  }
  // 表扬/夸奖
  else if (containsKeywords(text, ['棒', '厉害', '聪明', '厉害', 'good', 'great'])) {
    reply = randomPick([
      '谢谢你的夸奖！我会继续努力的！😊',
      '嘿嘿，我会变得更棒的！',
      '能帮你我很开心！💪'
    ])
  }
  // 故事相关
  else if (containsKeywords(text, ['故事', '讲', '听'])) {
    reply = generateStoryResponse()
  }
  // 默认闲聊
  else {
    reply = generateCasualResponse(text)
  }
  
  return {
    reply,
    mood: 'happy',
    actions
  }
}

/**
 * 生成学科辅导回复
 */
function generateSubjectResponse(text, subject) {
  const subjectInfo = SUBJECTS[subject]
  
  if (subject === 'chinese') {
    // 语文相关
    if (containsKeywords(text, ['造句', '句子'])) {
      return '造句练习！比如"春天来了，花儿开了"，试着模仿这个句式写一个吧~ 📝'
    }
    if (containsKeywords(text, ['阅读', '理解'])) {
      return '阅读理解要多读几遍，理解文章主要讲了什么哦！可以试着用自己的话说一遍~ 📖'
    }
    if (containsKeywords(text, ['拼音', '声母', '韵母'])) {
      return '拼音很重要！记得声母、韵母要分清，多多练习拼读哦！🔤'
    }
    return '语文学习要多读多写，有什么具体问题可以问我哦！📚'
  }
  
  if (subject === 'math') {
    // 数学相关
    if (containsKeywords(text, ['加', '减', '乘', '除'])) {
      return '计算题要认真审题哦！先把数字看清楚，再一步一步算~ 🔢'
    }
    if (containsKeywords(text, ['应用题', '问题'])) {
      return '应用题要先读懂题意，找出已知条件和问题，然后列式计算！💡'
    }
    return '数学要多练习计算能力，养成验算的好习惯哦！➕➖'
  }
  
  if (subject === 'english') {
    // 英语相关
    if (containsKeywords(text, ['单词', 'word', '记'])) {
      return '背单词有技巧！可以试试联想记忆法，把单词和生活联系起来~ 🔤'
    }
    if (containsKeywords(text, ['口语', '说', 'speak'])) {
      return '英语口语要多说多练！试着每天用英语描述一下今天发生的事吧~ 🗣️'
    }
    return '英语学习要多听多说，敢开口就是进步！🌟'
  }
  
  return `${subjectInfo.name}学习加油！有什么问题尽管问我哦~ ${subjectInfo.icon}`
}

/**
 * 生成任务相关回复
 */
function generateTaskResponse(text) {
  const tasks = getTaskListFromStorage()
  const today = new Date().toISOString().split('T')[0]
  const todayTasks = tasks.filter(t => {
    const taskDate = t.date || t.completedAt?.split('T')[0]
    return taskDate === today && t.status === 'pending'
  })
  
  if (todayTasks.length > 0) {
    const taskNames = todayTasks.slice(0, 3).map(t => t.name).join('、')
    return `今天有 ${todayTasks.length} 个任务等着你完成呢！${taskNames}... 加油！📋`
  }
  
  return randomPick([
    '学习很重要哦！合理安排时间，完成任务的感觉最棒了！💪',
    '要劳逸结合哦！完成任务后再休息，会更有成就感！',
    '每完成一个任务，你都在进步！继续加油！🌟'
  ])
}

/**
 * 生成成就相关回复
 */
function generateAchievementResponse() {
  const achievements = getAchievementsFromStorage()
  const recentAchievements = achievements.slice(-3)
  
  if (recentAchievements.length > 0) {
    const names = recentAchievements.map(a => a.name || '新成就').join('、')
    return randomPick([
      `看到你获得了 ${names}，太棒了！🎉`,
      `这些成就真了不起！继续努力，会有更多成就等你解锁！`,
      `为你骄傲！每一个成就都是努力的证明！🏆`
    ])
  }
  
  return '努力争取成就吧！每一步都在让自己变得更强~ 🌟'
}

/**
 * 生成打卡相关回复
 */
function generateStreakResponse() {
  const babies = getBabiesFromStorage()
  const currentBaby = babies[0] // 默认第一个
  const streak = currentBaby?.currentStreak || currentBaby?.current_streak || 0
  
  if (streak > 0) {
    return formatTemplate(randomPick(ENCOURAGEMENT_TEMPLATES.streakContinue), { days: streak })
  }
  
  return '打卡是一种好习惯！坚持每天打卡，养成好品质~ 📅'
}

/**
 * 生成求助回复
 */
function generateHelpResponse() {
  return randomPick([
    '别担心，没有什么是学不会的！告诉我你哪里不明白，我来帮你解释~ 💡',
    '遇到困难很正常！把问题拆解成小部分，一个一个解决会更简单哦！',
    '我来帮你！先深呼吸，然后我们一步一步来~ 你觉得哪里最难呢？'
  ])
}

/**
 * 生成故事回复
 */
function generateStoryResponse() {
  const stories = [
    '从前有只小兔子，它非常勇敢... 想知道后面发生了什么吗？',
    '在一个遥远的森林里，住着一群可爱的小动物... 它们会发生什么有趣的故事呢？',
    '有一天，小星星从天上掉下来了... 它会遇到谁呢？'
  ]
  return randomPick(stories)
}

/**
 * 生成日常闲聊回复
 */
function generateCasualResponse(text) {
  // 检测是否需要生成鼓励
  if (Math.random() < 0.3) {
    const encouragements = ENCOURAGEMENT_TEMPLATES.encouragement
    return randomPick(encouragements)
  }
  
  const responses = [
    '嗯嗯，我明白！继续说吧，我在听~ 😊',
    '你说的很有趣！还有呢？',
    '太棒了！这就是成长的样子！继续加油！',
    '我喜欢你这样积极向上的样子！💪',
    '有什么开心的或者烦恼的都可以告诉我哦~'
  ]
  
  return randomPick(responses)
}

// ==================== 个性化鼓励 ====================

/**
 * 生成个性化鼓励语
 * @param {string} babyId - 宝宝ID
 * @param {string} triggerType - 触发类型
 * @param {object} data - 额外数据
 * @returns {string} 鼓励语
 */
export function generateEncouragement(babyId, triggerType = 'taskComplete', data = {}) {
  const babies = getBabiesFromStorage()
  const baby = babies.find(b => b.id === babyId)
  const babyName = baby?.name || '宝贝'
  
  let templates = ENCOURAGEMENT_TEMPLATES[triggerType] || ENCOURAGEMENT_TEMPLATES.encouragement
  
  let text = randomPick(templates)
  
  // 替换数据
  text = text.replace('{task}', data.taskName || '任务')
  text = text.replace('{days}', data.days || '0')
  text = text.replace('{achievement}', data.achievementName || '成就')
  text = text.replace(/\{name\}/g, babyName)
  
  return text
}

/**
 * 检查是否需要特殊回应
 */
export function checkSpecialResponse(triggerType, data) {
  // 成就解锁时返回庆祝动作
  if (triggerType === 'achievementUnlock') {
    return {
      shouldCelebrate: true,
      animation: 'cheer',
      mood: 'excited'
    }
  }
  
  // 连续打卡时返回鼓励
  if (triggerType === 'streakContinue' && data.days >= 7) {
    return {
      shouldCelebrate: true,
      animation: 'clap',
      mood: 'excited'
    }
  }
  
  // 任务完成时返回肯定
  if (triggerType === 'taskComplete') {
    return {
      shouldCelebrate: true,
      animation: 'dance',
      mood: 'happy'
    }
  }
  
  return {
    shouldCelebrate: false,
    animation: '',
    mood: 'happy'
  }
}

// ==================== 上下文管理 ====================

/**
 * 管理对话上下文（保留最近 N 轮）
 * @param {array} context - 当前上下文
 * @param {object} newMessage - 新消息
 * @param {number} maxLength - 最大长度
 * @returns {array} 更新后的上下文
 */
export function updateContext(context = [], newMessage, maxLength = 10) {
  const updated = [...context, newMessage]
  
  // 限制长度，保留最近的消息
  if (updated.length > maxLength) {
    return updated.slice(-maxLength)
  }
  
  return updated
}

/**
 * 从上下文提取关键信息
 */
export function extractContextInfo(context = []) {
  let lastMood = 'happy'
  let lastSubject = null
  let taskMentions = 0
  
  context.forEach(msg => {
    if (msg.role === 'user') {
      const { mood } = detectMood(msg.content)
      if (mood !== 'happy') lastMood = mood
      
      const subject = detectSubject(msg.content)
      if (subject) lastSubject = subject
      
      if (containsKeywords(msg.content, ['任务', '作业'])) {
        taskMentions++
      }
    }
  })
  
  return {
    lastMood,
    lastSubject,
    taskMentions,
    contextLength: context.length
  }
}

// ==================== 接口导出 ====================

export default {
  chatWithBuddy,
  detectMood,
  generateEncouragement,
  checkSpecialResponse,
  updateContext,
  extractContextInfo,
  MOODS,
  SUBJECTS
}
