// src/services/moralEducationService.js
// V58 Moral Education Service
// 品德教育服务

import { useBabyStore } from '@/stores/babyStore.js'
import { getDatabase, insert, query } from '@/db/sqlite.js'

// ==================== 常量定义 ====================

// 核心价值观
export const CORE_VALUES = {
  RESPONSIBILITY: 'responsibility',     // 责任
  HONESTY: 'honesty',                   // 诚实
  KINDNESS: 'kindness',                  // 善良
  RESPECT: 'respect',                    // 尊重
  COURAGE: 'courage',                   // 勇气
  PATIENCE: 'patience',                 // 耐心
  GRATITUDE: 'gratitude',               // 感恩
  FAIRNESS: 'fairness',                 // 公正
  HUMILITY: 'humility',                 // 谦逊
  DILIGENCE: 'diligence'               // 勤奋
}

// 价值观Emoji映射
export const VALUE_EMOJIS = {
  [CORE_VALUES.RESPONSIBILITY]: '🎯',
  [CORE_VALUES.HONESTY]: '🤝',
  [CORE_VALUES.KINDNESS]: '💖',
  [CORE_VALUES.RESPECT]: '🙏',
  [CORE_VALUES.COURAGE]: '🦁',
  [CORE_VALUES.PATIENCE]: '🧘',
  [CORE_VALUES.GRATITUDE]: '🙏',
  [CORE_VALUES.FAIRNESS]: '⚖️',
  [CORE_VALUES.HUMILITY]: '🌱',
  [CORE_VALUES.DILIGENCE]: '📚'
}

// 价值观颜色映射
export const VALUE_COLORS = {
  [CORE_VALUES.RESPONSIBILITY]: '#E74C3C',
  [CORE_VALUES.HONESTY]: '#3498DB',
  [CORE_VALUES.KINDNESS]: '#E91E63',
  [CORE_VALUES.RESPECT]: '#9C27B0',
  [CORE_VALUES.COURAGE]: '#FF9800',
  [CORE_VALUES.PATIENCE]: '#00BCD4',
  [CORE_VALUES.GRATITUDE]: '#8BC34A',
  [CORE_VALUES.FAIRNESS]: '#607D8B',
  [CORE_VALUES.HUMILITY]: '#4CAF50',
  [CORE_VALUES.DILIGENCE]: '#3F51B5'
}

// 故事类型
export const STORY_TYPES = {
  HISTORICAL: 'historical',             // 历史人物
  FABLE: 'fable',                       // 寓言故事
  HERO: 'hero',                         // 英雄故事
  LIFE: 'life'                          // 生活故事
}

// 志愿服务类型
export const VOLUNTEER_TYPES = {
  COMMUNITY: 'community',               // 社区服务
  ENVIRONMENT: 'environment',           // 环境保护
  ELDERLY: 'elderly',                   // 敬老服务
  ANIMAL: 'animal',                     // 动物保护
  EDUCATION: 'education',               // 教育支持
  HEALTH: 'health'                     // 健康支持
}

// 徽章等级
export const BADGE_LEVELS = {
  BRONZE: 'bronze',
  SILVER: 'silver',
  GOLD: 'gold',
  PLATINUM: 'platinum'
}

// ==================== 数据库表 ====================

export const MORAL_TABLES = {
  MORAL_STORIES: 'moral_stories',
  VALUE_RECORDS: 'value_records',
  VALUE_PROGRESS: 'value_progress',
  VOLUNTEER_TASKS: 'volunteer_tasks',
  VOLUNTEER_RECORDS: 'volunteer_records',
  MORAL_BADGES: 'moral_badges',
  HONOR_BOARD: 'honor_board'
}

// ==================== 辅助函数 ====================

/**
 * 生成唯一ID
 */
function generateId() {
  return 'moral_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
}

/**
 * 获取当前时间戳
 */
function now() {
  return new Date().toISOString()
}

// ==================== 故事数据 ====================

/**
 * 品德故事数据
 */
const MORAL_STORIES = [
  {
    id: 'story_1',
    title: '孔融让梨',
    type: STORY_TYPES.HISTORICAL,
    description: '孔融四岁时就知道把大的梨让给哥哥，自己吃小的。',
    content: '孔融是东汉时期著名的文学家。他小时候非常聪明，而且懂得礼让。有一次，邻居送了一筐梨子给孔融家。父亲让孔融把梨分给兄弟们。孔融挑了一个最小的梨。父亲问他为什么，孔融说："我年纪最小，应该吃最小的梨。"这个故事告诉我们，从小就要学会礼让和尊重他人。',
    values: [CORE_VALUES.RESPECT, CORE_VALUES.KINDNESS],
    ageRange: '3-6',
    duration: 5,
    imageUrl: ''
  },
  {
    id: 'story_2',
    title: '狼来了',
    type: STORY_TYPES.FABLE,
    description: '一个牧童因为经常说谎，最终失去了别人的信任。',
    content: '从前有个牧童，每天在山上放羊。他觉得无聊，就大声喊："狼来了！狼来了！"村民们听到后纷纷跑来帮忙，却发现根本没有狼。牧童看到大家着急的样子，觉得很好玩。过了几天，牧童又喊"狼来了"。村民们又跑来帮忙，还是没有狼。第三次，狼真的来了。牧童拼命喊"狼来了"，但这次没有人来帮他，因为大家都以为他又在说谎。这个故事告诉我们，诚实是非常重要的品质。',
    values: [CORE_VALUES.HONESTY],
    ageRange: '3-8',
    duration: 5,
    imageUrl: ''
  },
  {
    id: 'story_3',
    title: '小英雄王二小',
    type: STORY_TYPES.HERO,
    description: '抗日战争时期，少年英雄王二小为了保护乡亲们，机智勇敢地和敌人斗争。',
    content: '王二小是抗日战争时期的小英雄。他虽然年纪小，但非常勇敢。有一次，日本军队来扫荡，王二小发现敌人正在靠近乡亲们藏身的地方。他灵机一动，故意暴露自己，把敌人引向了相反的方向。最终，乡亲们安全转移了，但王二小却被敌人杀害了。王二小的故事告诉我们，要有勇气和责任感，在关键时刻要勇于担当。',
    values: [CORE_VALUES.COURAGE, CORE_VALUES.RESPONSIBILITY],
    ageRange: '6-12',
    duration: 8,
    imageUrl: ''
  },
  {
    id: 'story_4',
    title: '曾子杀猪',
    type: STORY_TYPES.HISTORICAL,
    description: '曾子为了兑现对孩子的承诺，宁可杀掉家里的猪。',
    content: '曾子是孔子的学生。有一天，他的妻子要出门买菜，孩子哭闹着要跟去。妻子哄他说："你乖乖在家，回来杀猪给你吃。"孩子听了就不哭了。妻子走后，曾子真的把家里的猪抓来要杀。妻子回来说："我那是哄孩子的话，你怎么当真了？"曾子说："孩子小，什么都学父母。如果你不杀猪，就是在教孩子说谎。"这个故事告诉我们，做人要守信用，说到做到。',
    values: [CORE_VALUES.HONESTY, CORE_VALUES.RESPECT],
    ageRange: '4-10',
    duration: 6,
    imageUrl: ''
  },
  {
    id: 'story_5',
    title: '蚂蚁搬家',
    type: STORY_TYPES.LIFE,
    description: '小蚂蚁们齐心协力搬运食物，告诉我们团结就是力量。',
    content: '秋天到了，小蚂蚁们开始为冬天储存食物。它们发现了一大块面包屑，一只蚂蚁搬不动，于是它叫来伙伴们一起搬。两只、三只、十只...越来越多的蚂蚁加入进来，最后它们一起把面包屑搬回了家。这个故事告诉我们，团结合作可以让不可能变成可能。',
    values: [CORE_VALUES.RESPONSIBILITY, CORE_VALUES.DILIGENCE],
    ageRange: '3-6',
    duration: 4,
    imageUrl: ''
  },
  {
    id: 'story_6',
    title: '程门立雪',
    type: STORY_TYPES.HISTORICAL,
    description: '杨时和游酢为了求学，在老师门口耐心等待，体现了尊师重道的美德。',
    content: '杨时和游酢是宋代的两位学者。他们非常仰慕程颐老师的学问。有一天下大雪，他们去拜访程颐老师。到了门口，发现老师正在睡觉。他们不忍心打扰老师，就站在门外耐心等待。雪越下越大，他们身上的雪越积越厚，但谁也没有离开。最终，程颐老师被他们的诚意打动，收他们为徒。这个故事告诉我们，求学要有虔诚和耐心。',
    values: [CORE_VALUES.PATIENCE, CORE_VALUES.RESPECT],
    ageRange: '6-12',
    duration: 6,
    imageUrl: ''
  },
  {
    id: 'story_7',
    title: '感恩的小乌鸦',
    type: STORY_TYPES.FABLE,
    description: '小乌鸦记得狐狸曾经帮助过它，在狐狸遇到困难时伸出援手。',
    content: '从前有一只小乌鸦，它不小心掉进了河里。狐狸看见了，把它救了上来。小乌鸦一直记着这份恩情。多年后，狐狸老了，行动不便，别的动物都不愿意照顾它。小乌鸦却每天都给狐狸送食物，还陪它聊天。这个故事告诉我们，要记住别人对我们的帮助，学会感恩。',
    values: [CORE_VALUES.GRATITUDE, CORE_VALUES.KINDNESS],
    ageRange: '3-8',
    duration: 5,
    imageUrl: ''
  },
  {
    id: 'story_8',
    title: '雷锋的故事',
    type: STORY_TYPES.HERO,
    description: '雷锋叔叔助人为乐、无私奉献的精神影响了一代又一代人。',
    content: '雷锋是一名普通的解放军战士，但他有着不平凡的精神。他总是热心地帮助别人：看到老人过马路，他会主动搀扶；看到有人遇到困难，他会毫不犹豫地伸出援手。他说："我要把有限的生命，投入到无限的为人民服务之中去。"虽然雷锋22岁就牺牲了，但他的精神永远活在我们心中。',
    values: [CORE_VALUES.KINDNESS, CORE_VALUES.DILIGENCE, CORE_VALUES.RESPONSIBILITY],
    ageRange: '5-12',
    duration: 8,
    imageUrl: ''
  }
]

/**
 * 品格人物传记
 */
const CHARACTER_BIOS = [
  {
    id: 'bio_1',
    name: '孔子',
    dynasty: '春秋时期',
    avatar: '📜',
    coreValues: [CORE_VALUES.RESPECT, CORE_VALUES.HONESTY, CORE_VALUES.PATIENCE],
    description: '中国古代伟大的思想家和教育家，儒家学派创始人。',
    story: '孔子年轻时拜访老子学习礼仪。他非常好学，即使已经很有学问了，仍然虚心向他人请教。有一次，项橐神童问孔子一些难题，孔子都答不上来。孔子并没有生气，反而拜项橐为师。这就是"孔子师项橐"的故事，体现了孔子谦虚好学的精神。'
  },
  {
    id: 'bio_2',
    name: '岳飞',
    dynasty: '南宋',
    avatar: '⚔️',
    coreValues: [CORE_VALUES.RESPONSIBILITY, CORE_VALUES.COURAGE, CORE_VALUES.PATRIOTISM || 'patriotism'],
    description: '南宋著名抗金将领，民族英雄。',
    story: '岳飞从小立志报国，母亲在他背上刺下"精忠报国"四个字。岳飞长大后，率领岳家军英勇抗金，保卫祖国。他的军队纪律严明，从不扰民，深受百姓爱戴。岳飞的故事告诉我们，要热爱祖国，勇于承担责任。'
  },
  {
    id: 'bio_3',
    name: '花木兰',
    dynasty: '北魏',
    avatar: '🌸',
    coreValues: [CORE_VALUES.COURAGE, CORE_VALUES.RESPONSIBILITY, CORE_VALUES.PATRIOTISM || 'patriotism'],
    description: '中国古代巾帼英雄，代父从军。',
    story: '花木兰的父亲被征召入伍，但父亲年迈多病，弟弟又年幼。木兰决定女扮男装，代父从军。在军队里，木兰克服了重重困难，立下战功。十二年后，木兰凯旋归来，皇帝要授予她官职，但木兰只想回家孝敬父母。花木兰的故事告诉我们，要有勇气和孝心。'
  }
]

/**
 * 情景判断题
 */
const VALUE_SCENARIOS = [
  {
    id: 'scenario_1',
    title: '捡到钱包怎么办？',
    description: '你在路上捡到了一个钱包，里面有很多钱和身份证。',
    options: [
      { value: 'keep', text: '自己留下', isCorrect: false },
      { value: 'return', text: '交给警察或寻找失主', isCorrect: true }
    ],
    value: CORE_VALUES.HONESTY,
    explanation: '拾金不昧是诚实品质的表现。别人的东西不能占为己有，要想办法归还失主。'
  },
  {
    id: 'scenario_2',
    title: '看到同学被欺负',
    description: '你看到有同学在欺负另一个同学，这时候你会怎么做？',
    options: [
      { value: 'ignore', text: '装作没看见', isCorrect: false },
      { value: 'help', text: '上前帮助被欺负的同学', isCorrect: true },
      { value: 'report', text: '告诉老师', isCorrect: true }
    ],
    value: CORE_VALUES.KINDNESS,
    explanation: '面对不公平的事情，我们要勇敢地伸出援手。帮助别人是一种美德。'
  },
  {
    id: 'scenario_3',
    title: '答应别人的事',
    description: '你答应朋友今天借他一本故事书，但你自己还没看完。',
    options: [
      { value: 'break', text: '不借了，反正书是我的', isCorrect: false },
      { value: 'keep', text: '遵守承诺，把书借给朋友', isCorrect: true }
    ],
    value: CORE_VALUES.RESPONSIBILITY,
    explanation: '说到做到是负责任的表现。答应别人的事就要努力做到。'
  },
  {
    id: 'scenario_4',
    title: '做错事了怎么办？',
    description: '你不小心把妈妈最喜欢的花瓶打碎了。',
    options: [
      { value: 'hide', text: '把碎片藏起来，不告诉妈妈', isCorrect: false },
      { value: 'confess', text: '主动向妈妈承认错误', isCorrect: true }
    ],
    value: CORE_VALUES.HONESTY,
    explanation: '做错事要勇于承认，这比隐瞒错误更重要。诚实的人会得到原谅。'
  },
  {
    id: 'scenario_5',
    title: '遇到困难想放弃',
    description: '你正在做一道很难的数学题，做了很久都做不出来。',
    options: [
      { value: 'giveup', text: '算了，不做了', isCorrect: false },
      { value: 'persist', text: '继续思考，或者向老师同学请教', isCorrect: true }
    ],
    value: CORE_VALUES.PATIENCE,
    explanation: '遇到困难不要轻易放弃，坚持下去才能成功。耐心和努力是成功的关键。'
  }
]

/**
 * 志愿服务任务
 */
const VOLUNTEER_TASKS_DATA = [
  {
    id: 'vol_task_1',
    title: '社区清洁小卫士',
    description: '和家人一起打扫社区公共区域，保持环境整洁。',
    type: VOLUNTEER_TYPES.ENVIRONMENT,
    targetHours: 1,
    points: 20,
    steps: [
      '准备好手套、垃圾袋等清洁工具',
      '和家人一起到社区公共区域',
      '捡起地上的垃圾',
      '分类投放垃圾',
      '擦拭公共座椅和健身器材'
    ],
    icon: '🧹'
  },
  {
    id: 'vol_task_2',
    title: '小小环保宣传员',
    description: '向邻居宣传环保知识，倡导绿色生活。',
    type: VOLUNTEER_TYPES.ENVIRONMENT,
    targetHours: 1,
    points: 25,
    steps: [
      '了解环保小知识',
      '准备环保宣传材料',
      '向邻居们讲解环保重要性',
      '发放环保小传单',
      '记录宣传效果'
    ],
    icon: '🌍'
  },
  {
    id: 'vol_task_3',
    title: '敬老院送温暖',
    description: '探访敬老院，陪爷爷奶奶聊天、表演节目。',
    type: VOLUNTEER_TYPES.ELDERLY,
    targetHours: 2,
    points: 40,
    steps: [
      '准备小礼物或节目',
      '和敬老院的爷爷奶奶聊天',
      '为他们表演一个小节目',
      '帮助整理房间',
      '听爷爷奶奶讲故事'
    ],
    icon: '👴👵'
  },
  {
    id: 'vol_task_4',
    title: '整理小区图书馆',
    description: '帮助整理小区活动中心的图书角。',
    type: VOLUNTEER_TYPES.EDUCATION,
    targetHours: 1,
    points: 20,
    steps: [
      '了解图书分类方法',
      '整理书架上的图书',
      '修补破损的书籍',
      '清洁书架',
      '制作图书标签'
    ],
    icon: '📚'
  },
  {
    id: 'vol_task_5',
    title: '爱护小动物',
    description: '参与动物保护宣传活动，或照顾流浪小动物。',
    type: VOLUNTEER_TYPES.ANIMAL,
    targetHours: 1,
    points: 25,
    steps: [
      '了解动物保护知识',
      '制作爱护动物宣传画',
      '学习如何正确与小动物相处',
      '参与动物保护活动',
      '记录参与心得'
    ],
    icon: '🐾'
  },
  {
    id: 'vol_task_6',
    title: '关爱小伙伴',
    description: '帮助身边需要帮助的小伙伴。',
    type: VOLUNTEER_TYPES.COMMUNITY,
    targetHours: 1,
    points: 20,
    steps: [
      '发现身边需要帮助的小伙伴',
      '了解他们需要什么帮助',
      '提供适当的帮助',
      '与小伙伴建立友谊',
      '记录互助经历'
    ],
    icon: '🤝'
  }
]

// ==================== 服务函数 ====================

/**
 * 获取所有故事
 */
export function getAllStories() {
  return MORAL_STORIES
}

/**
 * 获取故事详情
 */
export function getStoryById(storyId) {
  return MORAL_STORIES.find(s => s.id === storyId) || null
}

/**
 * 获取故事列表（按类型筛选）
 */
export function getStoriesByType(type) {
  return MORAL_STORIES.filter(s => s.type === type)
}

/**
 * 获取所有人物传记
 */
export function getAllCharacterBios() {
  return CHARACTER_BIOS
}

/**
 * 获取所有情景判断题
 */
export function getValueScenarios() {
  return VALUE_SCENARIOS
}

/**
 * 获取随机情景判断题
 */
export function getRandomScenarios(count = 3) {
  const shuffled = [...VALUE_SCENARIOS].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

/**
 * 获取所有志愿服务任务
 */
export function getVolunteerTasks() {
  return VOLUNTEER_TASKS_DATA
}

/**
 * 获取志愿服务任务详情
 */
export function getVolunteerTaskById(taskId) {
  return VOLUNTEER_TASKS_DATA.find(t => t.id === taskId) || null
}

/**
 * 获取志愿服务任务（按类型筛选）
 */
export function getVolunteerTasksByType(type) {
  return VOLUNTEER_TASKS_DATA.filter(t => t.type === type)
}

/**
 * 记录价值观学习进度
 */
export function recordValueProgress(babyId, valueType, score, duration) {
  const babyStore = useBabyStore()
  if (!babyId) {
    babyId = babyStore.currentBabyId
  }
  
  if (!babyId) {
    throw new Error('请先选择宝宝')
  }
  
  const progress = {
    id: generateId(),
    babyId,
    valueType,
    score,
    duration,
    createdAt: now(),
    updatedAt: now()
  }
  
  const db = getDatabase()
  if (db) {
    insert(MORAL_TABLES.VALUE_PROGRESS, progress)
  }
  
  return progress
}

/**
 * 获取宝宝的价值观学习进度
 */
export function getValueProgress(babyId, valueType) {
  const babyStore = useBabyStore()
  if (!babyId) {
    babyId = babyStore.currentBabyId
  }
  
  if (!babyId) return []
  
  const db = getDatabase()
  if (!db) return []
  
  let sql = `SELECT * FROM ${MORAL_TABLES.VALUE_PROGRESS} WHERE babyId = '${babyId}'`
  
  if (valueType) {
    sql += ` AND valueType = '${valueType}'`
  }
  
  sql += ' ORDER BY createdAt DESC LIMIT 50'
  
  try {
    const result = db.exec(sql)
    if (result.length === 0) return []
    
    return result[0].values.map(row => {
      const columns = result[0].columns
      const obj = {}
      columns.forEach((col, idx) => {
        obj[col] = row[idx]
      })
      return obj
    })
  } catch (e) {
    console.error('获取价值观进度失败:', e)
    return []
  }
}

/**
 * 获取价值观统计数据
 */
export function getValueStats(babyId) {
  const babyStore = useBabyStore()
  if (!babyId) {
    babyId = babyStore.currentBabyId
  }
  
  if (!babyId) return null
  
  const progress = getValueProgress(babyId)
  
  // 按价值观类型统计
  const stats = {}
  Object.values(CORE_VALUES).forEach(value => {
    stats[value] = {
      totalScore: 0,
      count: 0,
      totalDuration: 0
    }
  })
  
  progress.forEach(p => {
    if (stats[p.valueType]) {
      stats[p.valueType].totalScore += p.score
      stats[p.valueType].count += 1
      stats[p.valueType].totalDuration += p.duration || 0
    }
  })
  
  // 计算平均分
  Object.keys(stats).forEach(key => {
    if (stats[key].count > 0) {
      stats[key].avgScore = Math.round(stats[key].totalScore / stats[key].count)
    } else {
      stats[key].avgScore = 0
    }
  })
  
  return stats
}

/**
 * 创建志愿服务记录
 */
export function createVolunteerRecord(babyId, taskId, data) {
  const babyStore = useBabyStore()
  if (!babyId) {
    babyId = babyStore.currentBabyId
  }
  
  if (!babyId) {
    throw new Error('请先选择宝宝')
  }
  
  const task = getVolunteerTaskById(taskId)
  if (!task) {
    throw new Error('志愿服务任务不存在')
  }
  
  const record = {
    id: generateId(),
    babyId,
    taskId,
    taskTitle: task.title,
    taskType: task.type,
    actualHours: data.actualHours || task.targetHours,
    points: data.points || task.points,
    description: data.description || '',
    photos: JSON.stringify(data.photos || []),
    completedAt: now(),
    createdAt: now(),
    updatedAt: now()
  }
  
  const db = getDatabase()
  if (db) {
    insert(MORAL_TABLES.VOLUNTEER_RECORDS, record)
  }
  
  return record
}

/**
 * 获取志愿服务记录
 */
export function getVolunteerRecords(babyId, options = {}) {
  const babyStore = useBabyStore()
  if (!babyId) {
    babyId = babyStore.currentBabyId
  }
  
  if (!babyId) return []
  
  const db = getDatabase()
  if (!db) return []
  
  let sql = `SELECT * FROM ${MORAL_TABLES.VOLUNTEER_RECORDS} WHERE babyId = '${babyId}'`
  
  if (options.type) {
    sql += ` AND taskType = '${options.type}'`
  }
  
  sql += ' ORDER BY completedAt DESC'
  
  if (options.limit) {
    sql += ` LIMIT ${options.limit}`
  }
  
  try {
    const result = db.exec(sql)
    if (result.length === 0) return []
    
    return result[0].values.map(row => {
      const columns = result[0].columns
      const obj = {}
      columns.forEach((col, idx) => {
        obj[col] = row[idx]
      })
      // 解析JSON字段
      if (obj.photos) {
        try {
          obj.photos = JSON.parse(obj.photos)
        } catch (e) {
          obj.photos = []
        }
      }
      return obj
    })
  } catch (e) {
    console.error('获取志愿服务记录失败:', e)
    return []
  }
}

/**
 * 获取志愿服务统计
 */
export function getVolunteerStats(babyId) {
  const babyStore = useBabyStore()
  if (!babyId) {
    babyId = babyStore.currentBabyId
  }
  
  if (!babyId) return null
  
  const records = getVolunteerRecords(babyId)
  
  const stats = {
    totalHours: 0,
    totalPoints: 0,
    totalTasks: records.length,
    byType: {}
  }
  
  Object.values(VOLUNTEER_TYPES).forEach(type => {
    stats.byType[type] = {
      count: 0,
      hours: 0,
      points: 0
    }
  })
  
  records.forEach(r => {
    stats.totalHours += r.actualHours || 0
    stats.totalPoints += r.points || 0
    if (stats.byType[r.taskType]) {
      stats.byType[r.taskType].count += 1
      stats.byType[r.taskType].hours += r.actualHours || 0
      stats.byType[r.taskType].points += r.points || 0
    }
  })
  
  return stats
}

/**
 * 创建品德徽章
 */
export function createMoralBadge(babyId, badgeData) {
  const babyStore = useBabyStore()
  if (!babyId) {
    babyId = babyStore.currentBabyId
  }
  
  if (!babyId) {
    throw new Error('请先选择宝宝')
  }
  
  const badge = {
    id: generateId(),
    babyId,
    badgeType: badgeData.badgeType,
    title: badgeData.title,
    description: badgeData.description || '',
    level: badgeData.level || BADGE_LEVELS.BRONZE,
    icon: badgeData.icon || '🏅',
    earnedAt: now(),
    createdAt: now(),
    updatedAt: now()
  }
  
  const db = getDatabase()
  if (db) {
    insert(MORAL_TABLES.MORAL_BADGES, badge)
  }
  
  return badge
}

/**
 * 获取宝宝的品德徽章
 */
export function getMoralBadges(babyId) {
  const babyStore = useBabyStore()
  if (!babyId) {
    babyId = babyStore.currentBabyId
  }
  
  if (!babyId) return []
  
  const db = getDatabase()
  if (!db) return []
  
  const sql = `SELECT * FROM ${MORAL_TABLES.MORAL_BADGES} WHERE babyId = '${babyId}' ORDER BY earnedAt DESC`
  
  try {
    const result = db.exec(sql)
    if (result.length === 0) return []
    
    return result[0].values.map(row => {
      const columns = result[0].columns
      const obj = {}
      columns.forEach((col, idx) => {
        obj[col] = row[idx]
      })
      return obj
    })
  } catch (e) {
    console.error('获取品德徽章失败:', e)
    return []
  }
}

/**
 * 添加荣誉榜记录
 */
export function addHonorBoardRecord(babyId, recordData) {
  const babyStore = useBabyStore()
  if (!babyId) {
    babyId = babyStore.currentBabyId
  }
  
  if (!babyId) {
    throw new Error('请先选择宝宝')
  }
  
  const record = {
    id: generateId(),
    babyId,
    babyName: recordData.babyName || babyStore.currentBaby?.name || '',
    reason: recordData.reason,
    valueType: recordData.valueType,
    points: recordData.points || 0,
    recordDate: now(),
    createdAt: now(),
    updatedAt: now()
  }
  
  const db = getDatabase()
  if (db) {
    insert(MORAL_TABLES.HONOR_BOARD, record)
  }
  
  return record
}

/**
 * 获取荣誉榜记录
 */
export function getHonorBoardRecords(limit = 20) {
  const db = getDatabase()
  if (!db) return []
  
  const sql = `SELECT * FROM ${MORAL_TABLES.HONOR_BOARD} ORDER BY recordDate DESC LIMIT ${limit}`
  
  try {
    const result = db.exec(sql)
    if (result.length === 0) return []
    
    return result[0].values.map(row => {
      const columns = result[0].columns
      const obj = {}
      columns.forEach((col, idx) => {
        obj[col] = row[idx]
      })
      return obj
    })
  } catch (e) {
    console.error('获取荣誉榜记录失败:', e)
    return []
  }
}

/**
 * 获取核心价值观列表
 */
export function getCoreValues() {
  return Object.values(CORE_VALUES)
}

/**
 * 获取价值观信息
 */
export function getValueInfo(valueType) {
  return {
    type: valueType,
    emoji: VALUE_EMOJIS[valueType] || '⭐',
    color: VALUE_COLORS[valueType] || '#999999'
  }
}

/**
 * 检查并颁发徽章
 */
export function checkAndAwardBadges(babyId) {
  const badges = []
  
  // 检查志愿服务徽章
  const volunteerStats = getVolunteerStats(babyId)
  if (volunteerStats && volunteerStats.totalTasks >= 1) {
    const badge = createMoralBadge(babyId, {
      badgeType: 'volunteer_starter',
      title: '志愿服务小达人',
      description: '完成第一次志愿服务',
      level: BADGE_LEVELS.BRONZE,
      icon: '🌟'
    })
    badges.push(badge)
  }
  
  if (volunteerStats && volunteerStats.totalTasks >= 5) {
    const badge = createMoralBadge(babyId, {
      badgeType: 'volunteer_advanced',
      title: '志愿服务小标兵',
      description: '完成5次志愿服务',
      level: BADGE_LEVELS.SILVER,
      icon: '🏅'
    })
    badges.push(badge)
  }
  
  // 检查价值观学习徽章
  const valueStats = getValueStats(babyId)
  if (valueStats) {
    const learnedValues = Object.values(valueStats).filter(s => s.count > 0).length
    if (learnedValues >= 3) {
      const badge = createMoralBadge(babyId, {
        badgeType: 'value_learner',
        title: '品德学习小能手',
        description: '学习3种以上价值观',
        level: BADGE_LEVELS.BRONZE,
        icon: '📚'
      })
      badges.push(badge)
    }
  }
  
  return badges
}
